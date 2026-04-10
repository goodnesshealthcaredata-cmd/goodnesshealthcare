/* ========================= Main Application Logic ========================= */
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbz1jlsYnwlIEBFToYViiEvVpfn1RqcBgC5khV7W89bh5mwpfmN8VNRoySbFdREkGOGKYA/exec";

/* ========================= Helpers & UI ========================= */
const el = (q) => document.querySelector(q);
const $ = (q, root = document) => Array.from(root.querySelectorAll(q));
const fmtINR = (n) => "₹" + (Number(n) || 0).toLocaleString("en-IN");

function showToast(msg = "Saved!") {
  const t = el("#toast");
  if (!t) return;
  t.textContent = msg;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 2200);
}

function safeJSONParse(str, fallback = {}) {
  if (!str) return fallback;
  try { return JSON.parse(str); }
  catch (e) { console.error("JSON parse error:", e); return fallback; }
}

function formatPatientName(name) {
  if (!name) return name;
  return name.split(" ").map(w => w.length === 0 ? w : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");
}

/* ========================= Get Logged-in User Name ========================= */
function getCurrentUserName() {
  try {
    if (window.parent && window.parent.document) {
      const userNameEl = window.parent.document.querySelector("#sidebarUserName");
      if (userNameEl && userNameEl.textContent) {
        return userNameEl.textContent.trim();
      }
    }
  } catch (e) {
    console.log("Cannot access parent window:", e);
  }
  
  const storedUser = localStorage.getItem("loggedInUserName");
  if (storedUser) {
    return storedUser;
  }
  
  const sessionUser = sessionStorage.getItem("loggedInUserName");
  if (sessionUser) {
    return sessionUser;
  }
  
  return "Unknown User";
}

/* ========================= Contact Number Validation ========================= */
function validateContactNumber(input, errorElementId, isRequired = false) {
  const errorEl = document.getElementById(errorElementId);
  const value = input.value.trim();
  
  if (!isRequired && value === "") {
    errorEl.classList.remove("show");
    input.classList.remove("error");
    return true;
  }
  
  if (value !== "") {
    const numericRegex = /^\d+$/;
    const isValidLength = value.length === 10;
    const isNumeric = numericRegex.test(value);
    
    if (!isNumeric) {
      errorEl.textContent = "Please enter numbers only (0-9)";
      errorEl.classList.add("show");
      input.classList.add("error");
      return false;
    }
    
    if (!isValidLength) {
      errorEl.textContent = "Please enter exactly 10 digits";
      errorEl.classList.add("show");
      input.classList.add("error");
      return false;
    }
  }
  
  errorEl.classList.remove("show");
  input.classList.remove("error");
  return true;
}

function restrictToNumbers(input) {
  input.addEventListener("input", function() {
    this.value = this.value.replace(/[^0-9]/g, "");
    if (this.value.length > 10) {
      this.value = this.value.slice(0, 10);
    }
  });
}

/* ========================= Date/Time Helper Functions ========================= */
function parseDateFromSheet(dateValue) {
  if (!dateValue) return "";
  
  if (typeof dateValue === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
    return dateValue;
  }
  
  if (typeof dateValue === 'string') {
    const match = dateValue.match(/(\d{4})-(\d{2})-(\d{2})/);
    if (match) {
      return `${match[1]}-${match[2]}-${match[3]}`;
    }
    
    if (dateValue.includes('/')) {
      const parts = dateValue.split('/');
      if (parts.length === 3) {
        let year = parts[2];
        if (year.length === 2) year = '20' + year;
        return `${year}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
      }
    }
    
    if (dateValue.includes('T')) {
      return dateValue.split('T')[0];
    }
  }
  
  return dateValue;
}

function parseTimeFromSheet(timeValue) {
  if (!timeValue) return "";
  
  if (typeof timeValue === 'string') {
    if (/^\d{2}:\d{2}$/.test(timeValue)) return timeValue;
    if (timeValue.includes(':')) {
      const parts = timeValue.split(':');
      if (parts.length >= 2) {
        return `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}`;
      }
    }
  }
  
  return timeValue;
}

function formatDisplayDate(dateValue) {
  if (!dateValue) return "-";
  
  const parsed = parseDateFromSheet(dateValue);
  if (!parsed || parsed === "-") return "-";
  
  const parts = parsed.split('-');
  if (parts.length === 3) {
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }
  
  return dateValue;
}

function formatDisplayTime(timeValue) {
  if (!timeValue) return "-";
  
  const parsedTime = parseTimeFromSheet(timeValue);
  if (!parsedTime || parsedTime === "-") return "-";
  
  if (parsedTime.match(/^\d{2}:\d{2}$/)) {
    return parsedTime;
  }
  
  return parsedTime;
}

function sortEntriesByDateAndTime(entries) {
  return [...entries].sort((a, b) => {
    const dateA = parseDateFromSheet(a.date) || "0000-00-00";
    const dateB = parseDateFromSheet(b.date) || "0000-00-00";
    
    if (dateA !== dateB) {
      return dateB.localeCompare(dateA);
    }
    
    const timeA = parseTimeFromSheet(a.time_of_visit) || "00:00";
    const timeB = parseTimeFromSheet(b.time_of_visit) || "00:00";
    
    return timeB.localeCompare(timeA);
  });
}

/* ========================= Field accessors ========================= */
const F = {
  patientName:            () => el("#patientName"),
  dob:                    () => el("#dob"),
  age:                    () => el("#age"),
  gender:                 () => el('[name="gender"]'),
  contact:                () => el("#contactNumber"),
  altContact:             () => el("#altContactNumber"),
  address:                () => el("#address"),
  addrLabel:              () => el("#addrLabel"),
  areaInput:              () => el("#areaInput"),
  areaSuggestions:        () => el("#areaSuggestions"),
  mapLink:                () => el("#mapLink"),
  height:                 () => el("#height"),
  weight:                 () => el("#weight"),
  lmpDate:                () => el("#lmpDate"),
  clinicalHistory:        () => el("#clinicalHistory"),
  doctorName:             () => el("#doctorName"),
  doctorSuggestions:      () => el("#doctorSuggestions"),
  careOf:                 () => el("#careOf"),
  careOfSuggestions:      () => el("#careOfSuggestions"),
  processingLab:          () => el("#processingLab"),
  visitType:              () => el("#visitType"),
  visitDate:              () => el("#visitDate"),
  visitTime:              () => el("#visitTime"),
  ppTime:                 () => el("#ppTime"),
  ppTimeField:            () => el("#ppTimeField"),
  ppCollectionField:      () => el("#ppCollectionField"),
  ppPhlebotomistField:    () => el("#ppPhlebotomistField"),
  urineField:             () => el("#urineField"),
  phlebotomistInput:      () => el("#phlebotomistInput"),
  phlebotomistSuggestions:() => el("#phlebotomistSuggestions"),
  ppPhlebotomistInput:    () => el("#ppPhlebotomistInput"),
  ppPhlebotomistSuggestions:()=> el("#ppPhlebotomistSuggestions"),
  bloodCollected:         () => el("#bloodCollected"),
  urineCollected:         () => el("#urineCollected"),
  ppCollected:            () => el("#ppCollected"),
  sampleSent:             () => el("#sampleSent"),
  visitInstruction:       () => el("#visitInstruction"),
  reportDeliveryRequired: () => el("#reportDeliveryRequired"),
  reportReceivedData:     () => el("#reportReceivedData"),
  reportReceivedList:     () => el("#reportReceivedList"),
  reportOnlineSent:       () => el("#reportOnlineSent"),
  reportDelivered:        () => el("#reportDelivered"),
  discount:               () => el("#discount"),
  discountedPrice:        () => el("#discountedPrice"),
  homeVisitCharges:       () => el("#homeVisitCharges"),
  cashReceived:           () => el("#cashReceived"),
  onlineReceived:         () => el("#onlineReceived"),
  totalMRP:               () => el("#totalMRP"),
  finalPrice:             () => el("#finalPrice"),
  pendingPayment:         () => el("#pendingPayment"),
  costRaw:                () => el("#costRaw"),
  syringe2ml:             () => el("#syringe2ml"),
  syringe5ml:             () => el("#syringe5ml"),
  syringe10ml:            () => el("#syringe10ml"),
  syringesValue:          () => el("#syringesValue"),
  tubeList:               () => el("#tubeList"),
  syringesList:           () => el("#syringesList"),
  progressBarFill:        () => el("#progressBarFill"),
  progressPercentage:     () => el("#progressPercentage"),
  progressSteps:          () => el("#progressSteps"),
  selectedTestsList:      () => el("#selectedTestsList"),
  selectedPackagesList:   () => el("#selectedPackagesList"),
  nameSuggestions:        () => el("#nameSuggestions"),
  editId:                 () => el("#editId"),
  submitBtn:              () => el("#submitBtn"),
  submitContent:          () => el("#submitContent"),
  entryForm:              () => el("#entryForm"),
  inProgressList:         () => el("#inProgressList"),
  inProgressEmpty:        () => el("#inProgressEmpty"),
  b2bAmount:              () => el("#b2bAmount"),
  b2bPopup:               () => el("#b2bPopup"),
  b2bPopupOverlay:        () => el("#b2bPopupOverlay"),
  resetTubeBtn:           () => el("#resetTubeCounts"),
  b2bPassword:            () => el("#b2bPassword"),
  b2bError:               () => el("#b2bError"),
  verifyB2BBtn:           () => el("#verifyB2BBtn"),
  closeB2BPopup:          () => el("#closeB2BPopup"),
  filterDate:             () => el("#filterDate"),
  clearFilterBtn:         () => el("#clearFilterBtn"),
};

/* ========================= Global state ========================= */
let selectedTestsByLab    = { 1: [], 2: [], 3: [], 4: [] };
let selectedPackagesByLab = { 1: [], 2: [], 3: [], 4: [] };
let currentSelectedLab    = "lab1";
let tubeCountOverrides    = {};
let syringeCounts         = { "2ml": 0, "5ml": 0, "10ml": 0 };
let serverEntriesCache    = [];
let globallySelectedTests = new Set();
let currentFilterDate     = null;

function labNumFromId(labId) {
  return parseInt(labId.replace("lab", ""), 10) || 1;
}

/* ========================= Global Test Selection Management ========================= */
function updateGlobalTestSet() {
  globallySelectedTests.clear();
  for (let i = 1; i <= 4; i++) {
    const tests = getAllTestsForLab(i);
    tests.forEach(t => globallySelectedTests.add(t));
  }
}

function isTestGloballySelected(testName, currentLabNum) {
  for (let i = 1; i <= 4; i++) {
    if (i !== currentLabNum) {
      const tests = getAllTestsForLab(i);
      if (tests.includes(testName)) {
        return true;
      }
    }
  }
  return false;
}

function removeTestFromOtherLabs(testName, currentLabNum) {
  for (let i = 1; i <= 4; i++) {
    if (i !== currentLabNum) {
      const testIndex = selectedTestsByLab[i].indexOf(testName);
      if (testIndex !== -1) {
        selectedTestsByLab[i].splice(testIndex, 1);
        const tv = el(`#testsValue${i}`);
        if (tv) tv.value = selectedTestsByLab[i].join(", ");
      }
      
      const packagesToRemove = [];
      selectedPackagesByLab[i].forEach(pkgName => {
        const pkg = getPackage(`lab${i}`, pkgName);
        if (pkg && pkg.tests.includes(testName)) {
          packagesToRemove.push(pkgName);
        }
      });
      packagesToRemove.forEach(pkgName => {
        const pkgIndex = selectedPackagesByLab[i].indexOf(pkgName);
        if (pkgIndex !== -1) {
          selectedPackagesByLab[i].splice(pkgIndex, 1);
          const pv = el(`#packagesValue${i}`);
          if (pv) pv.value = selectedPackagesByLab[i].join(", ");
          renderPackagesChips(i);
        }
      });
    }
  }
}

/* ========================= Enhanced Tube Calculation ========================= */
function getAllTestsForLab(labNum) {
  const labId = `lab${labNum}`;
  const direct = selectedTestsByLab[labNum] || [];
  const pkgNames = selectedPackagesByLab[labNum] || [];
  const fromPkgs = [];
  pkgNames.forEach(n => {
    const pkg = (PACKAGES[labId] || []).find(p => p.name === n);
    if (pkg) fromPkgs.push(...pkg.tests);
  });
  return [...new Set([...direct, ...fromPkgs])];
}

function getAllSelectedTestsAcrossLabs() {
  const all = [];
  for (let i = 1; i <= 4; i++) all.push(...getAllTestsForLab(i));
  return [...new Set(all)];
}

function getCombinedTestsList() {
  const allTests = getAllSelectedTestsAcrossLabs();
  return allTests.sort().join(", ");
}

function calculateUniqueTubeCountsPerLab(tests) {
  const tubeSet = new Set();
  
  tests.forEach(test => {
    const tubeTypes = getTubeTypesForTest(test);
    tubeTypes.forEach(tubeType => tubeSet.add(tubeType));
  });
  
  const tubeCounts = {};
  tubeSet.forEach(tubeType => {
    tubeCounts[tubeType] = 1;
  });
  
  if (tests.includes("PP")) {
    tubeCounts["PP Extra"] = (tubeCounts["PP Extra"] || 0) + 1;
  }
  
  return tubeCounts;
}

function calculateAggregatedTubeCounts() {
  const aggregatedCounts = {};
  
  for (let i = 1; i <= 4; i++) {
    const tests = getAllTestsForLab(i);
    const labCounts = calculateUniqueTubeCountsPerLab(tests);
    
    for (const [tubeType, count] of Object.entries(labCounts)) {
      aggregatedCounts[tubeType] = (aggregatedCounts[tubeType] || 0) + count;
    }
  }
  
  return aggregatedCounts;
}

function getAutoTubeCounts() {
  return calculateAggregatedTubeCounts();
}

function getTestMRP(labId, testName) {
  const tests = TESTS_DATA[labId] || [];
  const test = tests.find(t => t.name === testName);
  return test ? test.mrp : 0;
}

function getTestB2B(labId, testName) {
  const tests = TESTS_DATA[labId] || [];
  const test = tests.find(t => t.name === testName);
  return test ? test.b2b : 0;
}

function getPackage(labId, packageName) {
  const packages = PACKAGES[labId] || [];
  return packages.find(p => p.name === packageName);
}

/* ========================= Reset to Auto-Calculate Function ========================= */
function resetTubeCounts() {
  tubeCountOverrides = {};
  renderTubes();
  showToast("Tube counts reset to auto-calculation");
}

/* ========================= Stepper Control Component ========================= */
function createStepper(initialValue, minValue, maxValue, onChange) {
  const container = document.createElement("div");
  container.className = "stepper-control";
  
  const decrementBtn = document.createElement("button");
  decrementBtn.type = "button";
  decrementBtn.className = "stepper-btn";
  decrementBtn.textContent = "−";
  decrementBtn.setAttribute("aria-label", "Decrease");
  
  const countSpan = document.createElement("span");
  countSpan.className = "stepper-count";
  countSpan.textContent = initialValue;
  
  const incrementBtn = document.createElement("button");
  incrementBtn.type = "button";
  incrementBtn.className = "stepper-btn";
  incrementBtn.textContent = "+";
  incrementBtn.setAttribute("aria-label", "Increase");
  
  let currentValue = initialValue;
  
  function updateValue(newValue) {
    if (newValue < minValue) newValue = minValue;
    if (maxValue !== undefined && newValue > maxValue) newValue = maxValue;
    if (newValue !== currentValue) {
      currentValue = newValue;
      countSpan.textContent = currentValue;
      if (onChange) onChange(currentValue);
    }
  }
  
  decrementBtn.addEventListener("click", () => updateValue(currentValue - 1));
  incrementBtn.addEventListener("click", () => updateValue(currentValue + 1));
  
  container.appendChild(decrementBtn);
  container.appendChild(countSpan);
  container.appendChild(incrementBtn);
  
  return { container, getValue: () => currentValue, setValue: updateValue };
}

/* ========================= Tube rendering ========================= */
function renderTubes() {
  const container = F.tubeList();
  if (!container) return;

  const auto = getAutoTubeCounts();
  const finals = {};
  Object.keys(auto).forEach(t => {
    finals[t] = tubeCountOverrides[t] !== undefined ? tubeCountOverrides[t] : auto[t];
  });

  const entries = Object.entries(finals).filter(([, c]) => c > 0);
  container.innerHTML = "";

  if (!entries.length) {
    container.innerHTML = '<div class="hint" style="text-align:center;padding:20px;grid-column:1/-1;">No tubes required – please select tests or packages</div>';
    return;
  }

  entries.forEach(([tubeType, count]) => {
    const tubeInfo = getTubeInfo(tubeType);
    const displayName = tubeInfo.displayName || tubeType;
    const imageUrl = tubeInfo.imageUrl;
    
    const card = document.createElement("div");
    card.className = "tube-card";
    
    const imageContainer = document.createElement("div");
    imageContainer.className = "tube-image-container";
    const img = document.createElement("img");
    img.src = imageUrl;
    img.alt = displayName;
    img.className = "tube-image";
    imageContainer.appendChild(img);
    
    const nameDiv = document.createElement("div");
    nameDiv.className = "tube-name";
    nameDiv.textContent = displayName;
    
    const stepperContainer = document.createElement("div");
    stepperContainer.className = "tube-stepper";
    
    const stepper = createStepper(count, 0, undefined, (newValue) => {
      tubeCountOverrides[tubeType] = newValue;
    });
    stepperContainer.appendChild(stepper.container);
    
    card.appendChild(imageContainer);
    card.appendChild(nameDiv);
    card.appendChild(stepperContainer);
    container.appendChild(card);
  });
}

/* ========================= Syringe rendering ========================= */
function renderSyringes() {
  const container = F.syringesList();
  if (!container) return;
  
  container.innerHTML = "";
  
  const syringeSizes = ["2ml", "5ml", "10ml"];
  
  syringeSizes.forEach(size => {
    const syringeInfo = getSyringeInfo(size);
    const displayName = syringeInfo.displayName || size;
    const imageUrl = syringeInfo.imageUrl;
    const currentValue = syringeCounts[size] || 0;
    
    const card = document.createElement("div");
    card.className = "syringe-card";
    
    const imageContainer = document.createElement("div");
    imageContainer.className = "syringe-image-container";
    const img = document.createElement("img");
    img.src = imageUrl;
    img.alt = displayName;
    img.className = "syringe-image";
    imageContainer.appendChild(img);
    
    const nameDiv = document.createElement("div");
    nameDiv.className = "syringe-name";
    nameDiv.textContent = displayName;
    
    const stepperContainer = document.createElement("div");
    stepperContainer.className = "syringe-stepper";
    
    const stepper = createStepper(currentValue, 0, undefined, (newValue) => {
      syringeCounts[size] = newValue;
      const inputId = size === "2ml" ? "syringe2ml" : size === "5ml" ? "syringe5ml" : "syringe10ml";
      const inputElement = el(`#${inputId}`);
      if (inputElement) inputElement.value = newValue;
      updateSyringesValue();
    });
    stepperContainer.appendChild(stepper.container);
    
    card.appendChild(imageContainer);
    card.appendChild(nameDiv);
    card.appendChild(stepperContainer);
    container.appendChild(card);
  });
}

function updateSyringesValue() {
  const counts = [];
  if (syringeCounts["2ml"] > 0) counts.push(`2ml x ${syringeCounts["2ml"]}`);
  if (syringeCounts["5ml"] > 0) counts.push(`5ml x ${syringeCounts["5ml"]}`);
  if (syringeCounts["10ml"] > 0) counts.push(`10ml x ${syringeCounts["10ml"]}`);
  const sv = F.syringesValue();
  if (sv) sv.value = counts.join(", ");
  
  const syringe2ml = F.syringe2ml();
  const syringe5ml = F.syringe5ml();
  const syringe10ml = F.syringe10ml();
  if (syringe2ml) syringe2ml.value = syringeCounts["2ml"];
  if (syringe5ml) syringe5ml.value = syringeCounts["5ml"];
  if (syringe10ml) syringe10ml.value = syringeCounts["10ml"];
}

/* ========================= Add test with global uniqueness ========================= */
function addTestWithGlobalCheck(testName, labNum) {
  if (selectedTestsByLab[labNum].includes(testName)) return false;
  
  if (isTestGloballySelected(testName, labNum)) {
    showToast(`"${testName}" is already selected in another lab or package. Cannot select again.`);
    return false;
  }
  
  const currentLabPackages = selectedPackagesByLab[labNum] || [];
  for (const pkgName of currentLabPackages) {
    const pkg = getPackage(`lab${labNum}`, pkgName);
    if (pkg && pkg.tests.includes(testName)) {
      showToast(`"${testName}" is already included in package "${pkgName}". Cannot select individually.`);
      return false;
    }
  }
  
  selectedTestsByLab[labNum].push(testName);
  removeTestFromOtherLabs(testName, labNum);
  
  for (let i = 1; i <= 4; i++) {
    if (i !== labNum) {
      const msInput = el(`#msInput${i}`);
      if (msInput && document.activeElement !== msInput) {
        const filterFn = window[`filterList${i}`];
        if (filterFn) filterFn(el(`#msInput${i}`)?.value || "");
      }
    }
  }
  
  updateGlobalTestSet();
  return true;
}

function addPackageWithGlobalCheck(pkg, labNum) {
  if (selectedPackagesByLab[labNum].includes(pkg.name)) return false;
  
  const conflictingTests = [];
  for (const test of pkg.tests) {
    if (isTestGloballySelected(test, labNum)) {
      conflictingTests.push(test);
    }
  }
  
  if (conflictingTests.length > 0) {
    showToast(`Cannot add package "${pkg.name}". Conflicting tests already selected: ${conflictingTests.join(", ")}`);
    return false;
  }
  
  const individualTestsToRemove = [];
  for (const test of pkg.tests) {
    const testIndex = selectedTestsByLab[labNum].indexOf(test);
    if (testIndex !== -1) {
      individualTestsToRemove.push(test);
    }
  }
  
  individualTestsToRemove.forEach(test => {
    const testIndex = selectedTestsByLab[labNum].indexOf(test);
    if (testIndex !== -1) {
      selectedTestsByLab[labNum].splice(testIndex, 1);
    }
  });
  
  selectedPackagesByLab[labNum].push(pkg.name);
  
  for (const test of pkg.tests) {
    removeTestFromOtherLabs(test, labNum);
  }
  
  for (let i = 1; i <= 4; i++) {
    if (i !== labNum) {
      const msInput = el(`#msInput${i}`);
      if (msInput && document.activeElement !== msInput) {
        const filterFn = window[`filterList${i}`];
        if (filterFn) filterFn(el(`#msInput${i}`)?.value || "");
      }
    }
  }
  
  renderPackagesChips(labNum);
  updateGlobalTestSet();
  return true;
}

/* ========================= Selected tests / packages display ========================= */
function renderSelectedTestsDisplay() {
  const container = F.selectedTestsList();
  if (!container) return;
  const labNum = labNumFromId(currentSelectedLab);
  const tests = selectedTestsByLab[labNum];

  container.innerHTML = "";
  if (!tests.length) {
    container.innerHTML = '<div class="hint" style="padding:12px;text-align:center;">No tests selected</div>';
    return;
  }

  tests.forEach(test => {
    const mrp = getTestMRP(currentSelectedLab, test);
    const div = document.createElement("div");
    div.className = "selected-test-item";
    div.innerHTML = `
      <div class="test-info">
        <div class="test-name">${test}</div>
        <div class="test-price">MRP: ${fmtINR(mrp)}</div>
      </div>
      <button class="remove-test-btn" data-test="${test}" title="Remove test">❌</button>`;
    div.querySelector(".remove-test-btn").addEventListener("click", (e) => {
      e.stopPropagation();
      const testIndex = selectedTestsByLab[labNum].indexOf(test);
      if (testIndex !== -1) {
        selectedTestsByLab[labNum].splice(testIndex, 1);
        const tv = el(`#testsValue${labNum}`);
        if (tv) tv.value = selectedTestsByLab[labNum].join(", ");
        updateGlobalTestSet();
        updateAllCalculations();
      }
    });
    container.appendChild(div);
  });
}

function renderSelectedPackagesDisplay() {
  const container = F.selectedPackagesList();
  if (!container) return;
  const labNum = labNumFromId(currentSelectedLab);
  const pkgNames = selectedPackagesByLab[labNum];
  const pkgList = PACKAGES[currentSelectedLab] || [];

  container.innerHTML = "";
  if (!pkgNames.length) {
    container.innerHTML = '<div class="hint" style="padding:12px;text-align:center;">No packages selected</div>';
    return;
  }

  pkgNames.forEach(pkgName => {
    const pkg = pkgList.find(p => p.name === pkgName);
    if (!pkg) return;
    const div = document.createElement("div");
    div.className = "selected-package-item";
    div.innerHTML = `
      <div class="package-header">
        <div class="package-name">📦 ${pkg.name}</div>
        <button class="remove-package-btn" data-package="${pkgName}" title="Remove package">❌</button>
      </div>
      <div class="package-tests-list">
        <strong>Tests included:</strong>
        <ul>${pkg.tests.map(t => `<li>${t}</li>`).join("")}</ul>
      </div>
      <div class="package-price">💰 Package MRP: ${fmtINR(pkg.mrp)}</div>`;
    div.querySelector(".remove-package-btn").addEventListener("click", (e) => {
      e.stopPropagation();
      const pkgIndex = selectedPackagesByLab[labNum].indexOf(pkgName);
      if (pkgIndex !== -1) {
        selectedPackagesByLab[labNum].splice(pkgIndex, 1);
        const pv = el(`#packagesValue${labNum}`);
        if (pv) pv.value = selectedPackagesByLab[labNum].join(", ");
        renderPackagesChips(labNum);
        updateGlobalTestSet();
        updateAllCalculations();
      }
    });
    container.appendChild(div);
  });
}

function renderPackagesChips(labNum) {
  const chipsContainer = el(`#packagesChips${labNum}`);
  const packagesInput = el(`#packagesInput${labNum}`);
  if (!chipsContainer) return;

  chipsContainer.querySelectorAll(".chip").forEach(c => c.remove());

  selectedPackagesByLab[labNum].forEach(pkg => {
    const chip = document.createElement("span");
    chip.className = "chip";
    chip.innerHTML = `<span>${pkg}</span><button title="Remove" aria-label="Remove">&times;</button>`;
    chip.querySelector("button").addEventListener("click", (ev) => {
      ev.stopPropagation();
      const pkgIndex = selectedPackagesByLab[labNum].indexOf(pkg);
      if (pkgIndex !== -1) {
        selectedPackagesByLab[labNum].splice(pkgIndex, 1);
        const pv = el(`#packagesValue${labNum}`);
        if (pv) pv.value = selectedPackagesByLab[labNum].join(", ");
        renderPackagesChips(labNum);
        updateGlobalTestSet();
        updateAllCalculations();
      }
    });
    packagesInput ? chipsContainer.insertBefore(chip, packagesInput) : chipsContainer.appendChild(chip);
  });
}

/* ========================= Payment ========================= */
function calculateTotalMRP() {
  let total = 0;
  for (let i = 1; i <= 4; i++) {
    const labId = `lab${i}`;
    selectedTestsByLab[i].forEach(t => { total += getTestMRP(labId, t); });
    selectedPackagesByLab[i].forEach(n => {
      const pkg = getPackage(labId, n);
      if (pkg) total += pkg.mrp;
    });
  }
  return total;
}

function calculateTotalB2B() {
  let total = 0;
  for (let i = 1; i <= 4; i++) {
    const labId = `lab${i}`;
    selectedTestsByLab[i].forEach(t => { total += getTestB2B(labId, t); });
    selectedPackagesByLab[i].forEach(n => {
      const pkg = getPackage(labId, n);
      if (pkg) total += pkg.b2b;
    });
  }
  return total;
}

function updatePaymentFields() {
  const totalMRP = calculateTotalMRP();
  const discountEl = F.discount();
  const discountedPriceEl = F.discountedPrice();
  if (!discountEl || !discountedPriceEl) return;

  const homeVisit = parseFloat((F.homeVisitCharges() || {}).value) || 0;
  const cashRcvd = parseFloat((F.cashReceived() || {}).value) || 0;
  const onlineRcvd = parseFloat((F.onlineReceived() || {}).value) || 0;

  const totalMRPEl = F.totalMRP();
  if (totalMRPEl) totalMRPEl.value = fmtINR(totalMRP);

  let finalDiscounted;
  if (document.activeElement === discountedPriceEl) {
    finalDiscounted = parseFloat(discountedPriceEl.value) || 0;
    const calcDiscount = totalMRP - finalDiscounted;
    if (calcDiscount >= 0) discountEl.value = calcDiscount;
  } else {
    const discount = parseFloat(discountEl.value) || 0;
    finalDiscounted = Math.max(0, totalMRP - discount);
    discountedPriceEl.value = finalDiscounted;
  }

  const finalPrice = finalDiscounted + homeVisit;
  const fpEl = F.finalPrice();
  if (fpEl) fpEl.value = fmtINR(finalPrice);

  const pending = Math.max(0, finalPrice - cashRcvd - onlineRcvd);
  const ppEl = F.pendingPayment();
  if (ppEl) ppEl.value = fmtINR(pending);

  const crEl = F.costRaw();
  if (crEl) crEl.value = finalPrice;
}

[F.discount, F.discountedPrice, F.homeVisitCharges, F.cashReceived, F.onlineReceived].forEach(fn => {
  const node = fn();
  if (node) node.addEventListener("input", updatePaymentFields);
});

/* ========================= B2B Popup with Password Protection ========================= */
let b2bPrice = 0;

function showB2BPopup() {
  const popup = F.b2bPopup();
  const overlay = F.b2bPopupOverlay();
  const passwordInput = F.b2bPassword();
  const b2bAmountDiv = F.b2bAmount();
  const errorDiv = F.b2bError();
  
  if (passwordInput) passwordInput.value = "";
  if (b2bAmountDiv) b2bAmountDiv.style.display = "none";
  if (errorDiv) errorDiv.classList.remove("show");
  
  if (popup) popup.classList.add("show");
  if (overlay) overlay.classList.add("show");
  if (passwordInput) passwordInput.focus();
}

function hideB2BPopup() {
  const popup = F.b2bPopup();
  const overlay = F.b2bPopupOverlay();
  if (popup) popup.classList.remove("show");
  if (overlay) overlay.classList.remove("show");
}

function verifyB2BPassword() {
  const passwordInput = F.b2bPassword();
  const enteredPassword = passwordInput?.value || "";
  const correctPassword = "gnh142";
  const errorDiv = F.b2bError();
  const b2bAmountDiv = F.b2bAmount();
  
  if (enteredPassword === correctPassword) {
    b2bPrice = calculateTotalB2B();
    if (b2bAmountDiv) {
      b2bAmountDiv.textContent = fmtINR(b2bPrice);
      b2bAmountDiv.style.display = "block";
    }
    if (errorDiv) errorDiv.classList.remove("show");
  } else {
    if (errorDiv) errorDiv.classList.add("show");
    if (b2bAmountDiv) b2bAmountDiv.style.display = "none";
    if (passwordInput) {
      passwordInput.value = "";
      passwordInput.focus();
    }
  }
}

const showB2BBtn = F.showB2BBtn ? F.showB2BBtn() : el("#showB2BBtn");
const verifyB2BBtn = F.verifyB2BBtn ? F.verifyB2BBtn() : el("#verifyB2BBtn");
const closeB2BPopupBtn = F.closeB2BPopup ? F.closeB2BPopup() : el("#closeB2BPopup");
const b2bOverlay = F.b2bPopupOverlay();

if (showB2BBtn) showB2BBtn.addEventListener("click", showB2BPopup);
if (verifyB2BBtn) verifyB2BBtn.addEventListener("click", verifyB2BPassword);
if (closeB2BPopupBtn) closeB2BPopupBtn.addEventListener("click", hideB2BPopup);
if (b2bOverlay) b2bOverlay.addEventListener("click", hideB2BPopup);

const b2bPasswordField = F.b2bPassword();
if (b2bPasswordField) {
  b2bPasswordField.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      verifyB2BPassword();
    }
  });
}

/* ========================= Conditional visit fields ========================= */
function updateConditionalVisitFields() {
  const allTests = getAllSelectedTestsAcrossLabs();
  const hasPP = allTests.includes("PP");
  const hasUrine = allTests.includes("Urine") || allTests.some(t => getTubeTypesForTest(t).includes("Urine"));

  const toggleDisplay = (fn, show) => { const n = fn(); if (n) n.style.display = show ? "block" : "none"; };
  toggleDisplay(F.ppTimeField, hasPP);
  toggleDisplay(F.ppCollectionField, hasPP);
  toggleDisplay(F.ppPhlebotomistField, hasPP);
  toggleDisplay(F.urineField, hasUrine);

  if (hasPP) {
    autoPPTime();
  } else {
    const pt = F.ppTime(); if (pt) pt.value = "";
    const pp = F.ppPhlebotomistInput(); if (pp) pp.value = "";
  }
}

function autoPPTime() {
  const allTests = getAllSelectedTestsAcrossLabs();
  if (!allTests.includes("PP")) return;
  const vtEl = F.visitTime();
  const ptEl = F.ppTime();
  if (!vtEl || !vtEl.value || !ptEl || ptEl.dataset.manual) return;
  const [h, m] = vtEl.value.split(":").map(Number);
  const dt = new Date();
  dt.setHours(h + 2, m, 0, 0);
  ptEl.value = `${String(dt.getHours()).padStart(2, "0")}:${String(dt.getMinutes()).padStart(2, "0")}`;
}

const vtEl = F.visitTime();
if (vtEl) vtEl.addEventListener("change", autoPPTime);
const ptEl = F.ppTime();
if (ptEl) ptEl.addEventListener("input", () => { ptEl.dataset.manual = "1"; });

function updateAddressRequirement() {
  const vt = F.visitType();
  const addr = F.address();
  const lbl = F.addrLabel();
  if (!vt || !addr || !lbl) return;
  
  addr.required = false;
  lbl.classList.remove("req");
}

const vtSelect = F.visitType();
if (vtSelect) vtSelect.addEventListener("change", updateAddressRequirement);

/* ========================= Form Validation ========================= */
function validateRequiredFields() {
  const patientName = F.patientName();
  const visitType = F.visitType();
  const visitDate = F.visitDate();
  const visitTime = F.visitTime();
  
  let isValid = true;
  let errorMessage = "";
  
  if (!patientName?.value.trim()) {
    isValid = false;
    errorMessage = "Patient Name is required";
    patientName?.focus();
    patientName?.classList.add("error");
  } else {
    patientName?.classList.remove("error");
  }
  
  if (isValid && (!visitType?.value || visitType.value === "")) {
    isValid = false;
    errorMessage = "Visit Type is required";
    visitType?.focus();
    visitType?.classList.add("error");
  } else {
    visitType?.classList.remove("error");
  }
  
  if (isValid && !visitDate?.value) {
    isValid = false;
    errorMessage = "Visit Date is required";
    visitDate?.focus();
    visitDate?.classList.add("error");
  } else {
    visitDate?.classList.remove("error");
  }
  
  if (isValid && !visitTime?.value) {
    isValid = false;
    errorMessage = "Visit Time is required";
    visitTime?.focus();
    visitTime?.classList.add("error");
  } else {
    visitTime?.classList.remove("error");
  }
  
  if (!isValid) {
    showToast(errorMessage);
  }
  
  return isValid;
}

/* ========================= Progress bar ========================= */
function checkPatientDetailsCompleted() {
  const name = F.patientName();
  const age = F.age();
  const gender = F.gender();
  const contact = F.contact();
  
  return !!(name?.value.trim() && age?.value && age?.value !== "" && 
            gender?.value && gender?.value !== "" && 
            contact?.value.trim());
}

function checkTestDetailsCompleted() {
  for (let i = 1; i <= 4; i++) {
    if (selectedTestsByLab[i].length > 0 || selectedPackagesByLab[i].length > 0) {
      return true;
    }
  }
  return false;
}

function checkVisitScheduled() {
  const vt = F.visitType(); const vd = F.visitDate(); const vtime = F.visitTime();
  return !!(vt?.value && vd?.value && vtime?.value);
}
function checkPhlebotomistAssigned() { const p = F.phlebotomistInput(); return !!(p?.value.trim()); }
function checkBloodCollectionDone() { const b = F.bloodCollected(); return !!(b?.checked); }

function checkUrineCollectionDone() {
  const allTests = getAllSelectedTestsAcrossLabs();
  const hasUrine = allTests.includes("Urine") || allTests.some(t => getTubeTypesForTest(t).includes("Urine"));
  if (!hasUrine) return true;
  return !!(F.urineCollected()?.checked);
}
function checkPPCollectionDone() {
  if (!getAllSelectedTestsAcrossLabs().includes("PP")) return true;
  return !!(F.ppCollected()?.checked);
}
function checkSampleSentForProcessing() { return !!(F.sampleSent()?.checked); }

function checkReportReceived() {
  const rdEl = F.reportReceivedData();
  if (!rdEl?.value) return false;
  try {
    const checked = JSON.parse(rdEl.value);
    const allTests = getAllSelectedTestsAcrossLabs();
    return allTests.length > 0 && Object.keys(checked).length === allTests.length;
  } catch { return false; }
}
function checkReportOnlineSent() { return !!(F.reportOnlineSent()?.checked); }
function checkReportsDelivered() {
  const dr = F.reportDeliveryRequired();
  if (!dr?.checked) return true;
  return !!(F.reportDelivered()?.checked);
}

function updateProgressBar() {
  const allTests = getAllSelectedTestsAcrossLabs();
  const steps = [
    { name: "Patient Details", done: checkPatientDetailsCompleted() },
    { name: "Test Details", done: checkTestDetailsCompleted() },
    { name: "Visit Scheduled", done: checkVisitScheduled() },
    { name: "Phlebotomist Assigned", done: checkPhlebotomistAssigned() },
    { name: "Blood Collection", done: checkBloodCollectionDone() },
  ];

  const hasUrine = allTests.includes("Urine") || allTests.some(t => getTubeTypesForTest(t).includes("Urine"));
  if (hasUrine) steps.push({ name: "Urine Collection", done: checkUrineCollectionDone() });

  if (allTests.includes("PP")) steps.push({ name: "PP Collection", done: checkPPCollectionDone() });

  steps.push(
    { name: "Sample Sent", done: checkSampleSentForProcessing() },
    { name: "Report Received", done: checkReportReceived() },
    { name: "Report Online Sent", done: checkReportOnlineSent() },
  );

  const dr = F.reportDeliveryRequired();
  if (dr?.checked) steps.push({ name: "Reports Delivered", done: checkReportsDelivered() });

  const completed = steps.filter(s => s.done).length;
  const pct = steps.length ? Math.round((completed / steps.length) * 100) : 0;

  const fill = F.progressBarFill(); if (fill) fill.style.width = pct + "%";
  const pctEl = F.progressPercentage(); if (pctEl) pctEl.textContent = pct + "% Complete";

  const stepsEl = F.progressSteps();
  if (stepsEl) {
    stepsEl.innerHTML = "";
    steps.forEach((step, i) => {
      const badge = document.createElement("span");
      badge.className = "step-badge " + (step.done ? "completed" : i === completed ? "current" : "pending");
      badge.textContent = step.name;
      stepsEl.appendChild(badge);
    });
  }
}

[F.patientName, F.age, F.gender, F.contact, F.visitType, F.visitDate, F.visitTime,
  F.phlebotomistInput, F.bloodCollected, F.urineCollected, F.ppCollected, F.sampleSent,
  F.reportOnlineSent, F.reportDelivered, F.reportDeliveryRequired].forEach(fn => {
  const node = fn();
  if (node) { node.addEventListener("input", updateProgressBar); node.addEventListener("change", updateProgressBar); }
});

/* ========================= getCompletionPercentage ========================= */
function getAllTestsFromEntry(entry) {
  const tests = new Set();
  for (let i = 1; i <= 4; i++) {
    (entry[`tests_lab${i}`] || "").split(",").forEach(t => t.trim() && tests.add(t.trim()));
    // Handle package data that might be JSON string
    const packagesData = entry[`packages_lab${i}`];
    if (packagesData && packagesData !== "" && packagesData !== "[]") {
      try {
        const parsed = JSON.parse(packagesData);
        if (Array.isArray(parsed)) {
          parsed.forEach(pkg => {
            if (pkg.tests) {
              pkg.tests.split(",").forEach(t => t.trim() && tests.add(t.trim()));
            }
          });
        }
      } catch (e) {
        // If not JSON, treat as comma-separated package names
        packagesData.split(",").forEach(pkg => {
          const p = (PACKAGES[`lab${i}`] || []).find(x => x.name === pkg.trim());
          if (p) p.tests.forEach(t => tests.add(t));
        });
      }
    }
  }
  return Array.from(tests);
}

function getCurrentStage(entry) {
  if (!entry) return "Not Started";

  const stages = [
    { name: "Patient Details", check: () => entry.patient_name && entry.age && entry.gender && entry.contact },
    {
      name: "Test Details", check: () => {
        for (let i = 1; i <= 4; i++) {
          if ((entry[`tests_lab${i}`] && entry[`tests_lab${i}`] !== "") || 
              (entry[`packages_lab${i}`] && entry[`packages_lab${i}`] !== "" && entry[`packages_lab${i}`] !== "[]")) {
            return true;
          }
        }
        return false;
      }
    },
    { name: "Visit Scheduled", check: () => entry.date && entry.time_of_visit && entry.visit_type },
    { name: "Phlebotomist Assigned", check: () => entry.phlebotomist },
    { name: "Blood Collection", check: () => entry.blood_collected === "true" },
  ];

  const allTests = getAllTestsFromEntry(entry);
  const hasUrine = allTests.some(t => t === "Urine" || getTubeTypesForTest(t).includes("Urine"));
  if (hasUrine) stages.push({ name: "Urine Collection", check: () => entry.urine_collected === "true" });

  const hasPP = allTests.includes("PP");
  if (hasPP) stages.push({ name: "PP Collection", check: () => entry.pp_collected === "true" });

  stages.push(
    { name: "Sample Sent", check: () => entry.sample_sent === "true" },
    {
      name: "Report Received", check: () => {
        if (!entry.report_received_data) return false;
        try {
          const received = JSON.parse(entry.report_received_data);
          return Object.keys(received).length === allTests.length && allTests.length > 0;
        } catch { return false; }
      }
    },
    { name: "Report Online Sent", check: () => entry.report_online_sent === "true" }
  );

  if (entry.report_delivery_required === "true") stages.push({ name: "Reports Delivered", check: () => entry.report_delivered === "true" });

  for (let i = 0; i < stages.length; i++) {
    if (!stages[i].check()) {
      return i === 0 ? stages[i].name : stages[i - 1].name;
    }
  }

  return stages.length > 0 ? stages[stages.length - 1].name : "Complete";
}

function getCompletionPercentage(entry) {
  if (!entry) return 0;
  let done = 0, total = 0;

  const inc = (cond) => { total++; if (cond) done++; };

  inc(!!(entry.patient_name && entry.age && entry.gender && entry.contact));
  
  let hasTestOrPackage = false;
  for (let i = 1; i <= 4; i++) {
    if ((entry[`tests_lab${i}`] && entry[`tests_lab${i}`] !== "") || 
        (entry[`packages_lab${i}`] && entry[`packages_lab${i}`] !== "" && entry[`packages_lab${i}`] !== "[]")) {
      hasTestOrPackage = true;
      break;
    }
  }
  inc(hasTestOrPackage);
  
  inc(!!(entry.date && entry.time_of_visit && entry.visit_type));
  inc(!!entry.phlebotomist);
  inc(entry.blood_collected === "true");

  const allTests = getAllTestsFromEntry(entry);
  const hasUrine = allTests.some(t => t === "Urine" || getTubeTypesForTest(t).includes("Urine"));
  if (hasUrine) inc(entry.urine_collected === "true");

  const hasPP = allTests.includes("PP");
  if (hasPP) inc(entry.pp_collected === "true");

  inc(entry.sample_sent === "true");

  if (entry.report_received_data) {
    try {
      const received = JSON.parse(entry.report_received_data);
      inc(Object.keys(received).length === allTests.length && allTests.length > 0);
    } catch { total++; }
  } else { total++; }

  inc(entry.report_online_sent === "true");

  if (entry.report_delivery_required === "true") inc(entry.report_delivered === "true");

  return total > 0 ? Math.round((done / total) * 100) : 0;
}

/* ========================= Report received list ========================= */
function generateReportReceivedList() {
  const container = F.reportReceivedList();
  const storedEl = F.reportReceivedData();
  if (!container) return;

  const allTests = getAllSelectedTestsAcrossLabs();
  let checkedTests = storedEl ? safeJSONParse(storedEl.value, {}) : {};

  if (!allTests.length) {
    container.innerHTML = '<div class="hint" style="text-align:center;padding:20px;">No tests selected. Please add tests in Test Details section.</div>';
    return;
  }

  container.innerHTML = "";

  const allChecked = allTests.every(t => checkedTests[t] === true);
  const selectAllDiv = document.createElement("div");
  selectAllDiv.className = "report-test-item";
  selectAllDiv.style.cssText = "border-bottom:2px solid rgba(122, 178, 178, 0.2);margin-bottom:8px;padding-bottom:12px;";
  selectAllDiv.innerHTML = `<input type="checkbox" id="select_all_reports" ${allChecked ? "checked" : ""}><label for="select_all_reports" style="font-weight:700;color:var(--primary);">Select All Reports</label>`;

  const selectAllCb = selectAllDiv.querySelector("#select_all_reports");
  selectAllCb.addEventListener("change", () => {
    const cbs = container.querySelectorAll(".report-checkbox");
    allTests.forEach(t => { selectAllCb.checked ? (checkedTests[t] = true) : delete checkedTests[t]; });
    cbs.forEach(cb => { cb.checked = selectAllCb.checked; });
    if (storedEl) storedEl.value = JSON.stringify(checkedTests);
    updateProgressBar();
  });
  container.appendChild(selectAllDiv);

  allTests.forEach(test => {
    const item = document.createElement("div");
    item.className = "report-test-item";
    const safeid = `report_test_${test.replace(/\s/g, "_")}`;
    item.innerHTML = `<input type="checkbox" id="${safeid}" data-test="${test}" class="report-checkbox" ${checkedTests[test] ? "checked" : ""}><label for="${safeid}">${test}</label><span class="test-source">Report Received</span>`;
    const cb = item.querySelector("input");
    cb.addEventListener("change", () => {
      cb.checked ? (checkedTests[cb.dataset.test] = true) : delete checkedTests[cb.dataset.test];
      if (storedEl) storedEl.value = JSON.stringify(checkedTests);
      const allNow = Array.from(container.querySelectorAll(".report-checkbox")).every(c => c.checked);
      if (selectAllCb) selectAllCb.checked = allNow;
      updateProgressBar();
    });
    container.appendChild(item);
  });
}

/* ========================= Master update ========================= */
function updateAllCalculations() {
  renderSelectedTestsDisplay();
  renderSelectedPackagesDisplay();
  renderTubes();
  renderSyringes();
  updatePaymentFields();
  autoPPTime();
  updateConditionalVisitFields();
  generateReportReceivedList();
  updateProgressBar();
}

/* ========================= Patient name formatting ========================= */
let formattingTimeout;
const pnField = F.patientName();
if (pnField) {
  pnField.addEventListener("input", function () {
    clearTimeout(formattingTimeout);
    const cursor = this.selectionStart;
    const raw = this.value;
    formattingTimeout = setTimeout(() => {
      const formatted = formatPatientName(raw);
      if (formatted !== raw) {
        this.value = formatted;
        this.setSelectionRange(Math.min(cursor, formatted.length), Math.min(cursor, formatted.length));
      }
    }, 100);
  });
  pnField.addEventListener("blur", function () {
    const words = this.value.trim().split(/\s+/).filter(w => w.length > 0);
    if (words.length < 2 && this.value.trim() !== "") {
      showToast("Please enter at least two words for patient name (First and Last name)");
      this.style.borderColor = "var(--error)";
    } else {
      this.style.borderColor = "";
      this.value = formatPatientName(this.value.trim());
    }
  });
}

/* ========================= Setup Contact Validation ========================= */
const contactField = F.contact();
const altContactField = F.altContact();

if (contactField) {
  restrictToNumbers(contactField);
  contactField.addEventListener("blur", () => validateContactNumber(contactField, "contactError", false));
  contactField.addEventListener("input", () => validateContactNumber(contactField, "contactError", false));
}

if (altContactField) {
  restrictToNumbers(altContactField);
  altContactField.addEventListener("blur", () => validateContactNumber(altContactField, "altContactError", false));
  altContactField.addEventListener("input", () => validateContactNumber(altContactField, "altContactError", false));
}

/* ========================= Accordion ========================= */
function initAccordions() {
  const sections = document.querySelectorAll(".accordion-section");
  if (!sections.length) return;

  sections.forEach(section => {
    const content = section.querySelector(".accordion-content");
    const icon = section.querySelector(".accordion-icon");
    if (content) content.classList.remove("open");
    if (icon) icon.textContent = "▼";
  });

  sections.forEach(section => {
    const header = section.querySelector(".accordion-header");
    const content = section.querySelector(".accordion-content");
    if (!header || !content) return;

    header.addEventListener("click", (e) => {
      e.stopPropagation();
      const wasOpen = content.classList.contains("open");

      sections.forEach(s => {
        const c = s.querySelector(".accordion-content");
        const i = s.querySelector(".accordion-icon");
        if (c) c.classList.remove("open");
        if (i) i.textContent = "▼";
      });

      if (!wasOpen) {
        content.classList.add("open");
        const icon = section.querySelector(".accordion-icon");
        if (icon) icon.textContent = "▲";
        setTimeout(() => {
          const rect = section.getBoundingClientRect();
          window.scrollTo({ top: rect.top + window.pageYOffset - window.innerHeight / 2 + rect.height / 2, behavior: "smooth" });
        }, 150);
      }
    });
  });
}

/* ========================= DOB / Age ========================= */
function calculateAgeFromDOB(dob) {
  if (!dob) return "";
  const parts = dob.split('-');
  if (parts.length !== 3) return "";
  
  const birthYear = parseInt(parts[0]);
  const birthMonth = parseInt(parts[1]) - 1;
  const birthDay = parseInt(parts[2]);
  
  const today = new Date();
  let age = today.getFullYear() - birthYear;
  const md = today.getMonth() - birthMonth;
  if (md < 0 || (md === 0 && today.getDate() < birthDay)) age--;
  return age >= 0 ? age : "";
}

function applyDOBToAge(dobValue) {
  const ageEl = F.age();
  if (!ageEl) return;
  if (dobValue) {
    const age = calculateAgeFromDOB(dobValue);
    if (age !== "") {
      ageEl.value = age;
      ageEl.readOnly = true;
      ageEl.classList.add("readonly");
    }
  } else {
    ageEl.readOnly = false;
    ageEl.classList.remove("readonly");
    ageEl.value = "";
  }
}

(function setupDOBAge() {
  const dobEl = F.dob();
  const ageEl = F.age();
  if (dobEl) dobEl.addEventListener("change", () => applyDOBToAge(dobEl.value));
  if (ageEl) ageEl.addEventListener("focus", () => { if (F.dob() && !F.dob().value) { ageEl.readOnly = false; ageEl.classList.remove("readonly"); } });
})();

/* ========================= Global click-outside handler ========================= */
document.addEventListener("click", (e) => {
  const pairs = [
    [F.areaInput, F.areaSuggestions],
    [F.doctorName, F.doctorSuggestions],
    [F.careOf, F.careOfSuggestions],
    [F.phlebotomistInput, F.phlebotomistSuggestions],
    [F.ppPhlebotomistInput, F.ppPhlebotomistSuggestions],
  ];
  pairs.forEach(([inputFn, suggFn]) => {
    const input = inputFn(); const sugg = suggFn();
    if (sugg && (!input || !input.contains(e.target)) && !sugg.contains(e.target)) {
      sugg.style.display = "none";
    }
  });

  const ns = F.nameSuggestions(); const pn = F.patientName();
  if (ns && (!pn || !pn.contains(e.target)) && !ns.contains(e.target)) ns.hidden = true;
});

/* ========================= Generic typeahead factory ========================= */
function createTypeahead({ inputFn, suggFn, listFn, itemClass }) {
  function filter(searchTerm) {
    const sugg = suggFn();
    const input = inputFn();
    if (!sugg) return;
    if (!searchTerm.trim()) { sugg.style.display = "none"; return; }

    const items = listFn(searchTerm);
    if (!items.length) { sugg.style.display = "none"; return; }

    sugg.innerHTML = items.map(item => `<div class="${itemClass}">${item}</div>`).join("");
    sugg.style.display = "block";
    sugg.querySelectorAll(`.${itemClass}`).forEach(div => {
      div.addEventListener("click", () => {
        if (input) input.value = div.textContent;
        sugg.style.display = "none";
      });
    });
  }

  const input = inputFn();
  if (input) {
    input.addEventListener("input", (e) => filter(e.target.value));
    input.addEventListener("focus", () => { if (input.value) filter(input.value); });
  }

  return filter;
}

createTypeahead({
  inputFn: F.areaInput,
  suggFn: F.areaSuggestions,
  itemClass: "area-suggestion-item",
  listFn: (q) => (typeof PREDEFINED_AREAS !== "undefined" ? PREDEFINED_AREAS : []).filter(a => a.toLowerCase().includes(q.toLowerCase())),
});

createTypeahead({
  inputFn: F.doctorName,
  suggFn: F.doctorSuggestions,
  itemClass: "doctor-suggestion-item",
  listFn: (q) => (typeof PREDEFINED_DOCTORS !== "undefined" ? PREDEFINED_DOCTORS : []).filter(d => d.toLowerCase().includes(q.toLowerCase())),
});

createTypeahead({
  inputFn: F.careOf,
  suggFn: F.careOfSuggestions,
  itemClass: "careof-suggestion-item",
  listFn: (q) => (typeof PREDEFINED_CARE_OF !== "undefined" ? PREDEFINED_CARE_OF : []).filter(c => c.toLowerCase().includes(q.toLowerCase())),
});

const phlebotomistList = typeof PREDEFINED_PHLEBOTOMISTS !== "undefined" ? PREDEFINED_PHLEBOTOMISTS : [];

createTypeahead({
  inputFn: F.phlebotomistInput,
  suggFn: F.phlebotomistSuggestions,
  itemClass: "phlebotomist-suggestion-item",
  listFn: (q) => phlebotomistList.filter(p => p.toLowerCase().includes(q.toLowerCase())),
});

createTypeahead({
  inputFn: F.ppPhlebotomistInput,
  suggFn: F.ppPhlebotomistSuggestions,
  itemClass: "pp-phlebotomist-suggestion-item",
  listFn: (q) => phlebotomistList.filter(p => p.toLowerCase().includes(q.toLowerCase())),
});

/* ========================= Tabs ========================= */
const panels = {
  inprogress: el("#panel-inprogress"),
  newentry: el("#panel-newentry"),
};

$(".tab-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    $(".tab-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    const id = btn.dataset.tab;
    if (panels.inprogress) panels.inprogress.hidden = id !== "inprogress";
    if (panels.newentry) panels.newentry.hidden = id !== "newentry";
    if (id === "inprogress") renderInProgress();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
});

/* ========================= Date Filter for In Progress ========================= */
function filterInProgressEntries() {
  const filterDate = F.filterDate();
  currentFilterDate = filterDate ? filterDate.value : null;
  renderInProgress();
}

function clearDateFilter() {
  const filterDate = F.filterDate();
  if (filterDate) {
    filterDate.value = "";
    currentFilterDate = null;
    renderInProgress();
  }
}

const filterDateEl = F.filterDate();
const clearFilterBtn = F.clearFilterBtn();

if (filterDateEl) {
  filterDateEl.addEventListener("change", filterInProgressEntries);
}

if (clearFilterBtn) {
  clearFilterBtn.addEventListener("click", clearDateFilter);
}

/* ========================= Multiselect – Tests ========================= */
function getAlreadySelectedTestsInOtherLabs(currentLabNum) {
  const set = new Set();
  for (let i = 1; i <= 4; i++) if (i !== currentLabNum) getAllTestsForLab(i).forEach(t => set.add(t));
  return set;
}

function createMultiselectForLab(labNum) {
  const testsSelect = el(`#testsSelect${labNum}`);
  const chips = el(`#chips${labNum}`);
  const msInput = el(`#msInput${labNum}`);
  const msPopup = el(`#msPopup${labNum}`);
  const msList = el(`#msList${labNum}`);
  const msEmpty = el(`#msEmpty${labNum}`);
  const testsValue = el(`#testsValue${labNum}`);
  if (!testsSelect || !chips || !msInput || !msPopup || !msList || !msEmpty || !testsValue) return;

  function addTest(t) {
    if (!t || selectedTestsByLab[labNum].includes(t)) return;
    
    if (addTestWithGlobalCheck(t, labNum)) {
      msInput.value = "";
      syncTests(true);
      setTimeout(() => { msInput.focus(); filterList(""); }, 220);
      updateAllCalculations();
    }
  }

  function renderChips() {
    chips.innerHTML = "";
    chips.appendChild(msInput);
    testsValue.value = selectedTestsByLab[labNum].join(", ");
  }

  const openPopup = () => { if (msPopup.hidden) { msPopup.hidden = false; testsSelect.setAttribute("aria-expanded", "true"); } filterList(msInput.value.trim()); };
  const closePopup = () => { if (!msPopup.hidden) { msPopup.hidden = true; testsSelect.setAttribute("aria-expanded", "false"); } };

  function filterList(q) {
    const excluded = new Set([...selectedTestsByLab[labNum], ...getAlreadySelectedTestsInOtherLabs(labNum)]);
    const testsList = TESTS_DATA[`lab${labNum}`] || [];
    const items = testsList.filter(t => t.name.toLowerCase().includes((q || "").toLowerCase()) && !excluded.has(t.name));
    msList.innerHTML = "";
    msEmpty.hidden = !!items.length;
    items.forEach(t => {
      const li = document.createElement("li");
      li.className = "ms-item";
      li.innerHTML = `<span>${t.name}</span><span class="ms-item-price">${fmtINR(t.mrp)}</span>`;
      li.addEventListener("pointerdown", ev => { if (ev.pointerType === "mouse" && ev.button === 0) { ev.preventDefault(); ev.stopPropagation(); addTest(t.name); } });
      li.addEventListener("click", ev => { ev.preventDefault(); ev.stopPropagation(); addTest(t.name); });
      msList.appendChild(li);
    });
  }

  function syncTests(keepOpen = false) {
    renderChips();
    filterList(msInput.value.trim());
    if (keepOpen) openPopup(); else if (!msInput.value.trim()) closePopup();
  }

  testsSelect.addEventListener("pointerdown", () => { msInput.focus(); openPopup(); });
  msInput.addEventListener("focus", openPopup);
  msInput.addEventListener("input", (e) => { openPopup(); filterList(e.target.value); });
  msInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") { e.preventDefault(); const first = msList.querySelector(".ms-item"); if (first) addTest(first.querySelector("span:first-child")?.textContent.trim()); return; }
    if (e.key === "Backspace" && !msInput.value && selectedTestsByLab[labNum].length) {
      selectedTestsByLab[labNum].pop();
      syncTests(true);
      setTimeout(() => { msInput.focus(); filterList(""); }, 220);
      updateAllCalculations();
    }
  });
  document.addEventListener("click", (e) => { if (!testsSelect.contains(e.target)) closePopup(); });
  syncTests(false);
  
  window[`filterList${labNum}`] = filterList;
}

function createPackagesMultiselectForLab(labNum) {
  const packagesSelect = el(`#packagesSelect${labNum}`);
  const packagesChips = el(`#packagesChips${labNum}`);
  const packagesInput = el(`#packagesInput${labNum}`);
  const packagesPopup = el(`#packagesPopup${labNum}`);
  const pkgList = el(`#packagesList${labNum}`);
  const packagesEmpty = el(`#packagesEmpty${labNum}`);
  const packagesValue = el(`#packagesValue${labNum}`);
  if (!packagesSelect || !packagesChips || !packagesInput || !packagesPopup || !pkgList || !packagesEmpty || !packagesValue) return;

  const available = PACKAGES[`lab${labNum}`] || [];

  function addPackage(pkg) {
    if (!pkg || selectedPackagesByLab[labNum].includes(pkg.name)) return;
    
    if (addPackageWithGlobalCheck(pkg, labNum)) {
      packagesInput.value = "";
      syncPackages(true);
      setTimeout(() => { packagesInput.focus(); filterPkgList(""); }, 220);
      updateAllCalculations();
    }
  }

  function renderChipsLocal() {
    packagesChips.innerHTML = "";
    packagesChips.appendChild(packagesInput);
    packagesValue.value = selectedPackagesByLab[labNum].join(", ");
  }

  const openPkgPopup = () => { if (packagesPopup.hidden) { packagesPopup.hidden = false; packagesSelect.setAttribute("aria-expanded", "true"); } filterPkgList(packagesInput.value.trim()); };
  const closePkgPopup = () => { if (!packagesPopup.hidden) { packagesPopup.hidden = true; packagesSelect.setAttribute("aria-expanded", "false"); } };

  function filterPkgList(q) {
    const activeTests = getAllSelectedTestsAcrossLabs();
    const items = available.filter(p =>
      p.name.toLowerCase().includes((q || "").toLowerCase()) &&
      !selectedPackagesByLab[labNum].includes(p.name) &&
      !p.tests.some(t => activeTests.includes(t))
    );
    pkgList.innerHTML = "";
    packagesEmpty.hidden = !!items.length;
    items.forEach(p => {
      const li = document.createElement("li");
      li.className = "ms-item";
      li.innerHTML = `<span>${p.name}</span><span class="ms-item-price">${fmtINR(p.mrp)}</span>`;
      li.addEventListener("pointerdown", ev => { if (ev.pointerType === "mouse" && ev.button === 0) { ev.preventDefault(); ev.stopPropagation(); addPackage(p); } });
      li.addEventListener("click", ev => { ev.preventDefault(); ev.stopPropagation(); addPackage(p); });
      pkgList.appendChild(li);
    });
  }

  function syncPackages(keepOpen = false) {
    renderChipsLocal();
    filterPkgList(packagesInput.value.trim());
    if (keepOpen) openPkgPopup(); else if (!packagesInput.value.trim()) closePkgPopup();
  }

  packagesSelect.addEventListener("pointerdown", () => { packagesInput.focus(); openPkgPopup(); });
  packagesInput.addEventListener("focus", openPkgPopup);
  packagesInput.addEventListener("input", (e) => { openPkgPopup(); filterPkgList(e.target.value); });
  packagesInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const first = pkgList.querySelector(".ms-item");
      if (first) { const name = first.querySelector("span:first-child")?.textContent; const p = available.find(x => x.name === name); if (p) addPackage(p); }
    }
  });
  document.addEventListener("click", (e) => { if (!packagesSelect.contains(e.target)) closePkgPopup(); });
  syncPackages(false);
}

for (let i = 1; i <= 4; i++) {
  createMultiselectForLab(i);
  createPackagesMultiselectForLab(i);
}

/* ========================= Lab panel selection ========================= */
const labPanels = { lab1: el("#lab1Panel"), lab2: el("#lab2Panel"), lab3: el("#lab3Panel"), lab4: el("#lab4Panel") };

function showLabPanel(labId) {
  Object.values(labPanels).forEach(p => { if (p) p.style.display = "none"; });
  if (labPanels[labId]) labPanels[labId].style.display = "block";
  currentSelectedLab = labId;
  updateAllCalculations();
}

const plEl = F.processingLab();
if (plEl) {
  plEl.addEventListener("change", (e) => { if (e.target.value) showLabPanel(e.target.value); });
  plEl.value = "lab1";
  showLabPanel("lab1");
}

/* ========================= Server list fetch ========================= */
async function fetchServerList() {
  try {
    const res = await fetch(SCRIPT_URL + "?action=list", { method: "GET" });
    if (!res.ok) throw new Error("Status " + res.status);
    const data = await res.json();
    if (Array.isArray(data)) {
      serverEntriesCache = data.filter(e => e && e.id);
    }
  } catch (e) { console.error("fetchServerList:", e); }
}

/* ========================= In-progress cards ========================= */
function renderInProgress() {
  const listEl = F.inProgressList();
  const emptyEl = F.inProgressEmpty();
  if (!listEl || !emptyEl) return;

  let items = serverEntriesCache.filter(e => getCompletionPercentage(e) < 100);
  
  if (currentFilterDate) {
    items = items.filter(entry => {
      if (!entry.date) return false;
      const entryDate = parseDateFromSheet(entry.date);
      return entryDate === currentFilterDate;
    });
  }
  
  items = sortEntriesByDateAndTime(items);
  
  listEl.innerHTML = "";

  if (!items.length) { 
    emptyEl.style.display = "block";
    const filterMsg = currentFilterDate ? `No in-progress entries found for ${currentFilterDate}.` : "No in-progress items right now.";
    emptyEl.textContent = filterMsg;
    return; 
  }
  emptyEl.style.display = "none";

  items.forEach(entry => {
    const pct = getCompletionPercentage(entry);
    const currentStage = getCurrentStage(entry);
    const displayDate = entry.date ? formatDisplayDate(entry.date) : "-";
    const displayTime = entry.time_of_visit ? formatDisplayTime(entry.time_of_visit) : "-";
    
    let progressColor;
    if (pct < 30) {
      progressColor = "#ef4444";
    } else if (pct < 70) {
      progressColor = "#f59e0b";
    } else {
      progressColor = "#10b981";
    }

    const row = document.createElement("div");
    row.className = "card-item";
    row.innerHTML = `
      <div class="card-top">
        <div class="card-name" title="${escapeHtml(entry.patient_name || "-")}">${escapeHtml(entry.patient_name || "-")}</div>
        <div class="card-date">
          📅 ${displayDate}<br>
          ⏰ ${displayTime}
        </div>
      </div>
      <div class="card-stage">Progress: <strong>${pct}% Complete</strong> - Current Stage: ${escapeHtml(currentStage)}</div>
      <div class="progress-bar-wrapper" style="margin:10px 0;">
        <div class="progress-bar-fill" style="width:${pct}%;height:8px;background:${progressColor};border-radius:4px;"></div>
      </div>
      <div class="card-actions">
        <button class="btn ghost sm" data-edit="${escapeHtml(entry.id)}">Edit</button>
        <button class="btn danger sm" data-del="${escapeHtml(entry.id)}"><span class="btn-text">Delete</span></button>
      </div>`;
    row.querySelector("[data-edit]").addEventListener("click", () => loadForEdit(entry));
    row.querySelector("[data-del]").addEventListener("click", (ev) => deleteEntry(entry.id, ev.currentTarget));
    listEl.appendChild(row);
  });
}

function escapeHtml(str) {
  if (!str) return "";
  return str.replace(/[&<>]/g, function(m) {
    if (m === '&') return '&amp;';
    if (m === '<') return '&lt;';
    if (m === '>') return '&gt;';
    return m;
  });
}

function setDeleting(btn, on) {
  if (!btn) return;
  if (on) {
    btn.disabled = true;
    btn.dataset.original = btn.innerHTML;
    btn.innerHTML = `<span class="spinner sm" aria-hidden="true"></span><span>Deleting...</span>`;
  } else {
    btn.disabled = false;
    btn.innerHTML = btn.dataset.original || `<span class="btn-text">Delete</span>`;
  }
}

async function deleteEntry(id, btn) {
  if (!confirm("Are you sure you want to delete this entry?")) return;
  setDeleting(btn, true);
  try {
    const res = await fetch(`${SCRIPT_URL}?action=delete&id=${encodeURIComponent(id)}`, { method: "GET" });
    const ct = res.headers.get("content-type") || "";
    const data = ct.includes("application/json") ? await res.json().catch(() => null) : null;
    const ok = data ? !!data.ok : res.ok;
    if (ok) {
      await fetchServerList();
      renderInProgress();
      showToast("Entry deleted");
    } else {
      showToast(data?.error ? `Delete failed: ${data.error}` : "Delete failed");
    }
  } catch (err) {
    console.error(err);
    showToast("Network error while deleting");
  } finally {
    setDeleting(btn, false);
  }
}

/* ========================= Reset helpers ========================= */
function resetLabState() {
  for (let i = 1; i <= 4; i++) {
    selectedTestsByLab[i] = [];
    selectedPackagesByLab[i] = [];
    const mi = el(`#msInput${i}`); if (mi) mi.value = "";
    const tv = el(`#testsValue${i}`); if (tv) tv.value = "";
    const pi = el(`#packagesInput${i}`); if (pi) pi.value = "";
    const pv = el(`#packagesValue${i}`); if (pv) pv.value = "";
    renderPackagesChips(i);
  }
  tubeCountOverrides = {};
  syringeCounts = { "2ml": 0, "5ml": 0, "10ml": 0 };
  updateGlobalTestSet();
}

function resetSyringes() {
  syringeCounts = { "2ml": 0, "5ml": 0, "10ml": 0 };
  updateSyringesValue();
  renderSyringes();
}

function resetPaymentFields() {
  [F.discount, F.discountedPrice, F.homeVisitCharges, F.cashReceived, F.onlineReceived].forEach(fn => {
    const n = fn(); if (n) n.value = "0";
  });
}

function resetCheckboxes() {
  [F.bloodCollected, F.urineCollected, F.ppCollected, F.sampleSent,
    F.reportDeliveryRequired, F.reportOnlineSent, F.reportDelivered].forEach(fn => {
    const n = fn(); if (n) n.checked = false;
  });
  const rrd = F.reportReceivedData(); if (rrd) rrd.value = "";
}

function resetMiscFields() {
  const nullFields = [F.mapLink, F.areaInput, F.careOf, F.doctorName,
    F.height, F.weight, F.lmpDate, F.clinicalHistory,
    F.phlebotomistInput, F.ppPhlebotomistInput, F.visitInstruction];
  nullFields.forEach(fn => { const n = fn(); if (n) n.value = ""; });
  const pt = F.ppTime(); if (pt) { pt.value = ""; delete pt.dataset.manual; }
  const ei = F.editId(); if (ei) ei.value = "";
  const sc = F.submitContent(); if (sc) sc.textContent = "Submit Entry";
}

function fullFormReset() {
  resetLabState();
  resetSyringes();
  resetPaymentFields();
  resetCheckboxes();
  resetMiscFields();
  updateAllCalculations();
  setDefaults();
}

/* ========================= Edit / Load for edit (FIXED: Proper package loading) ========================= */
function loadForEdit(entry) {
  if (!entry) return;

  const tab = document.querySelector('.tab-btn[data-tab="newentry"]');
  if (tab) tab.click();

  const setVal = (fn, val) => { const n = fn(); if (n) n.value = val || ""; };
  setVal(() => el('[name="patient_name"]'), entry.patient_name);
  
  const dobValue = entry.dob ? parseDateFromSheet(entry.dob) : "";
  setVal(F.dob, dobValue);
  applyDOBToAge(dobValue);
  
  const lmpValue = entry.lmp_date ? parseDateFromSheet(entry.lmp_date) : "";
  setVal(F.lmpDate, lmpValue);
  
  if (!dobValue) setVal(F.age, entry.age);
  setVal(F.gender, entry.gender);
  setVal(() => F.contact(), entry.contact);
  setVal(F.altContact, entry.alt_contact);
  setVal(F.address, entry.address);
  setVal(F.areaInput, entry.area);
  setVal(F.mapLink, entry.map_link);
  setVal(F.height, entry.height);
  setVal(F.weight, entry.weight);
  setVal(F.clinicalHistory, entry.clinical_history);

  // FIX: Properly load packages for each lab
  for (let i = 1; i <= 4; i++) {
    // Load individual tests
    selectedTestsByLab[i] = (entry[`tests_lab${i}`] || "").split(",").map(s => s.trim()).filter(Boolean);
    
    // Load packages - handle both JSON string and comma-separated format
    const packagesData = entry[`packages_lab${i}`];
    if (packagesData && packagesData !== "" && packagesData !== "[]") {
      try {
        // Try to parse as JSON first (new format)
        const parsed = JSON.parse(packagesData);
        if (Array.isArray(parsed)) {
          // Extract package names from JSON array
          selectedPackagesByLab[i] = parsed.map(pkg => pkg.name).filter(Boolean);
        } else {
          selectedPackagesByLab[i] = [];
        }
      } catch (e) {
        // If not JSON, treat as comma-separated string (old format)
        selectedPackagesByLab[i] = packagesData.split(",").map(s => s.trim()).filter(Boolean);
      }
    } else {
      selectedPackagesByLab[i] = [];
    }
    
    // Clear and re-render package chips
    const mi = el(`#msInput${i}`); if (mi) mi.value = "";
    const tv = el(`#testsValue${i}`); if (tv) tv.value = selectedTestsByLab[i].join(", ");
    const pi = el(`#packagesInput${i}`); if (pi) pi.value = "";
    const pv = el(`#packagesValue${i}`); if (pv) pv.value = selectedPackagesByLab[i].join(", ");
    renderPackagesChips(i);
  }
  
  updateGlobalTestSet();

  const lab = entry.processing_lab || "lab1";
  const plEl2 = F.processingLab(); if (plEl2) plEl2.value = lab;
  showLabPanel(lab);

  setVal(F.doctorName, entry.doctor);
  setVal(F.careOf, entry.care_of);

  let dateValue = entry.date || "";
  dateValue = parseDateFromSheet(dateValue);
  setVal(F.visitDate, dateValue);

  let timeValue = entry.time_of_visit || "";
  timeValue = parseTimeFromSheet(timeValue);
  setVal(F.visitTime, timeValue);

  setVal(F.visitType, entry.visit_type);
  updateAddressRequirement();
  setVal(F.phlebotomistInput, entry.phlebotomist);
  setVal(F.ppPhlebotomistInput, entry.pp_phlebotomist);

  const ptEl2 = F.ppTime();
  if (ptEl2) {
    const ppTimeValue = entry.pp_time ? parseTimeFromSheet(entry.pp_time) : "";
    ptEl2.value = ppTimeValue;
    if (ppTimeValue) ptEl2.dataset.manual = "1";
    else delete ptEl2.dataset.manual;
  }

  const setBool = (fn, val) => { const n = fn(); if (n) n.checked = val === "true" || val === "on" || val === true; };
  setBool(F.bloodCollected, entry.blood_collected);
  setBool(F.urineCollected, entry.urine_collected);
  setBool(F.ppCollected, entry.pp_collected);
  setBool(F.sampleSent, entry.sample_sent);
  setBool(F.reportDeliveryRequired, entry.report_delivery_required);
  setBool(F.reportOnlineSent, entry.report_online_sent);
  setBool(F.reportDelivered, entry.report_delivered);

  setVal(F.visitInstruction, entry.visit_instruction);

  const rrdEl = F.reportReceivedData();
  if (rrdEl) rrdEl.value = entry.report_received_data || "";

  setVal(F.discount, entry.discount);
  setVal(F.discountedPrice, entry.discounted_price);
  setVal(F.homeVisitCharges, entry.home_visit_charges);
  setVal(F.cashReceived, entry.cash_received);
  setVal(F.onlineReceived, entry.online_received);
  updatePaymentFields();

  if (entry.syringes) {
    const parts = entry.syringes.split(",");
    syringeCounts = { "2ml": 0, "5ml": 0, "10ml": 0 };
    parts.forEach(part => {
      const match = part.trim().match(/(\d+)ml\s*x\s*(\d+)/i);
      if (match) {
        const size = match[1];
        const count = parseInt(match[2]);
        if (size === "2") syringeCounts["2ml"] = count;
        else if (size === "5") syringeCounts["5ml"] = count;
        else if (size === "10") syringeCounts["10ml"] = count;
      }
    });
  }
  updateSyringesValue();
  renderSyringes();

  tubeCountOverrides = safeJSONParse(entry.tube_overrides, {});

  const eiEl = F.editId(); if (eiEl) eiEl.value = entry.id || "";
  const scEl = F.submitContent(); if (scEl) scEl.textContent = "Save Changes";

  updateAllCalculations();
}

/* ========================= Form submit / reset ========================= */
const formEl = F.entryForm();

if (formEl) {
  formEl.addEventListener("reset", () => {
    setTimeout(fullFormReset, 0);
  });
}

function setSubmitting(on) {
  const btn = F.submitBtn();
  if (!btn) return;
  if (on) {
    btn.disabled = true;
    btn.innerHTML = `<span class="spinner" aria-hidden="true"></span>Saving...`;
  } else {
    btn.disabled = false;
    const eiEl = F.editId();
    btn.innerHTML = `<span id="submitContent">${eiEl?.value ? "Save Changes" : "Submit Entry"}</span>`;
  }
}

function postViaIframe(formData) {
  return new Promise((resolve, reject) => {
    try {
      const name = "hidden_iframe_" + Date.now();
      const iframe = document.createElement("iframe");
      iframe.name = name;
      iframe.style.display = "none";
      document.body.appendChild(iframe);

      const form = document.createElement("form");
      form.method = "POST";
      form.action = SCRIPT_URL;
      form.target = name;
      form.style.display = "none";
      for (const [k, v] of formData.entries()) {
        const input = document.createElement("input");
        input.type = "hidden"; input.name = k; input.value = v;
        form.appendChild(input);
      }
      document.body.appendChild(form);
      iframe.addEventListener("load", () => { resolve(); setTimeout(() => { iframe.remove(); form.remove(); }, 0); });
      form.submit();
      setTimeout(() => { resolve(); iframe.remove(); form.remove(); }, 1200);
    } catch (err) { reject(err); }
  });
}

if (formEl) {
  formEl.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!validateRequiredFields()) {
      return;
    }

    const contactValid = validateContactNumber(contactField, "contactError", false);
    const altContactValid = validateContactNumber(altContactField, "altContactError", false);

    if (!contactValid) {
      showToast("Please enter a valid 10-digit contact number");
      contactField?.focus();
      return;
    }

    const allTests = getAllSelectedTestsAcrossLabs();
    const ptEl3 = F.ppTime();
    if (allTests.includes("PP") && !ptEl3?.value) {
      showToast("Please confirm PP time"); ptEl3?.focus(); return;
    }

    const data = new FormData(formEl);
    
    for (let i = 1; i <= 4; i++) {
      data.set(`tests_lab${i}`, selectedTestsByLab[i].join(", "));
      
      const packagesData = [];
      selectedPackagesByLab[i].forEach(pkgName => {
        const pkg = getPackage(`lab${i}`, pkgName);
        if (pkg) {
          packagesData.push({
            name: pkgName,
            tests: pkg.tests.join(", ")
          });
        }
      });
      
      if (packagesData.length === 0) {
        data.set(`packages_lab${i}`, "");
        data.set(`packages_lab${i}_names`, "");
      } else {
        data.set(`packages_lab${i}`, JSON.stringify(packagesData));
        data.set(`packages_lab${i}_names`, selectedPackagesByLab[i].join(", "));
      }
    }
    
    const combinedTestsList = getCombinedTestsList();
    data.set("all_tests_combined", combinedTestsList);
    
    const finalB2BPrice = calculateTotalB2B();
    data.set("total_b2b_price", finalB2BPrice);
    
    data.set("processing_lab", currentSelectedLab);
    data.set("total_mrp", calculateTotalMRP());

    const crEl = F.costRaw(); if (crEl) data.set("cost", crEl.value);
    const discEl = F.discount(); if (discEl) data.set("discount", discEl.value);
    const dpEl = F.discountedPrice(); if (dpEl) data.set("discounted_price", dpEl.value);
    const hvcEl = F.homeVisitCharges(); if (hvcEl) data.set("home_visit_charges", hvcEl.value);
    const fpEl = F.finalPrice(); if (fpEl) data.set("final_price", fpEl.value.replace("₹", ""));
    const crcdEl = F.cashReceived(); if (crcdEl) data.set("cash_received", crcdEl.value);
    const orcdEl = F.onlineReceived(); if (orcdEl) data.set("online_received", orcdEl.value);
    const ppEl2 = F.pendingPayment(); if (ppEl2) data.set("pending_payment", ppEl2.value.replace("₹", ""));
    const svEl = F.syringesValue(); if (svEl) data.set("syringes", svEl.value);

    data.set("area", (F.areaInput()?.value || ""));
    data.set("care_of", (F.careOf()?.value || ""));
    data.set("doctor", (F.doctorName()?.value || ""));
    data.set("map_link", (F.mapLink()?.value || ""));
    data.set("height", (F.height()?.value || ""));
    data.set("weight", (F.weight()?.value || ""));
    data.set("lmp_date", (F.lmpDate()?.value || ""));
    data.set("clinical_history", (F.clinicalHistory()?.value || ""));
    data.set("phlebotomist", (F.phlebotomistInput()?.value || ""));
    data.set("pp_phlebotomist", (F.ppPhlebotomistInput()?.value || ""));
    data.set("visit_instruction", (F.visitInstruction()?.value || ""));
    data.set("tube_overrides", JSON.stringify(tubeCountOverrides));
    
    const userName = getCurrentUserName();
    data.set("created_by", userName);
    data.set("last_modified_by", userName);

    const boolSet = (key, fn) => data.set(key, fn()?.checked ? "true" : "false");
    boolSet("blood_collected", F.bloodCollected);
    boolSet("urine_collected", F.urineCollected);
    boolSet("pp_collected", F.ppCollected);
    boolSet("sample_sent", F.sampleSent);
    boolSet("report_delivery_required", F.reportDeliveryRequired);
    boolSet("report_online_sent", F.reportOnlineSent);
    boolSet("report_delivered", F.reportDelivered);

    const rrdEl2 = F.reportReceivedData(); if (rrdEl2) data.set("report_received_data", rrdEl2.value);

    const vdEl = F.visitDate(); const vtimeEl = F.visitTime();
    data.set("visit_datetime", vdEl?.value && vtimeEl?.value ? `${vdEl.value}T${vtimeEl.value}` : "");
    data.set("date", vdEl?.value || "");
    data.set("time_of_visit", vtimeEl?.value || "");

    const eiEl2 = F.editId();
    const editId = eiEl2?.value?.trim() || "";
    if (editId) {
      data.set("action", "update");
      data.set("id", editId);
    } else {
      data.set("action", "create");
      data.delete("id");
    }

    setSubmitting(true);

    const completeSuccessFlow = async (serverResponse) => {
      await fetchServerList();
      renderInProgress();
      showToast(editId ? "Changes saved" : "Entry saved successfully");

      fullFormReset();
      if (eiEl2) eiEl2.value = "";
      const scEl = F.submitContent(); if (scEl) scEl.textContent = "Submit Entry";

      const ipTab = document.querySelector('.tab-btn[data-tab="inprogress"]');
      if (ipTab) ipTab.click();
    };

    try {
      const response = await fetch(SCRIPT_URL, { method: "POST", body: data });
      const contentType = response.headers.get("content-type") || "";
      let result = null;
      if (contentType.includes("application/json")) {
        result = await response.json();
      } else {
        const txt = await response.text();
        try { result = JSON.parse(txt); } catch { }
      }

      if (response.ok && result?.ok === true) {
        await completeSuccessFlow(result);
      } else {
        showToast(`Save failed: ${result?.error || "Server error"}`);
        setSubmitting(false);
      }
    } catch (err) {
      console.error("Fetch failed, trying iframe:", err);
      try {
        await postViaIframe(data);
        await fetchServerList();
        await completeSuccessFlow({});
      } catch (e2) {
        console.error("Submit failed:", e2);
        showToast("Network error. Please check your connection and try again.");
        setSubmitting(false);
      }
    } finally {
      setSubmitting(false);
    }
  });
}

/* ========================= Defaults ========================= */
function setDefaults() {
  const now = new Date();
  const pad = n => String(n).padStart(2, "0");
  const yyyy = now.getFullYear(), mm = pad(now.getMonth() + 1), dd = pad(now.getDate());
  const hh = pad(now.getHours()), mi = pad(now.getMinutes());

  const vdEl2 = F.visitDate(); if (vdEl2) vdEl2.value = `${yyyy}-${mm}-${dd}`;
  const vtEl3 = F.visitTime(); if (vtEl3) vtEl3.value = `${hh}:${mi}`;

  autoPPTime();
  renderTubes();
  renderSyringes();
  const dobEl2 = F.dob(); const ageEl2 = F.age();
  if (dobEl2 && !dobEl2.value && ageEl2) { ageEl2.readOnly = false; ageEl2.classList.remove("readonly"); }
  updateAddressRequirement();
  updateConditionalVisitFields();
  generateReportReceivedList();
  updatePaymentFields();
  updateProgressBar();
  updateGlobalTestSet();
}

/* ========================= Patient name auto-suggest ========================= */
const nameSuggestionsEl = F.nameSuggestions();
let debounceTimer;

const pnAuto = F.patientName();
if (pnAuto) {
  pnAuto.addEventListener("input", () => {
    clearTimeout(debounceTimer);
    const q = pnAuto.value.trim();
    if (!q) { if (nameSuggestionsEl) { nameSuggestionsEl.hidden = true; nameSuggestionsEl.innerHTML = ""; } return; }
    debounceTimer = setTimeout(() => fetchSuggestions(q), 280);
  });
}

async function fetchSuggestions(q) {
  try {
    const res = await fetch(`${SCRIPT_URL}?action=patients&q=${encodeURIComponent(q)}`, { method: "GET" });
    if (!res.ok) throw new Error("bad status");
    const data = await res.json();
    if (!Array.isArray(data) || !data.length) { if (nameSuggestionsEl) { nameSuggestionsEl.hidden = true; nameSuggestionsEl.innerHTML = ""; } return; }
    if (nameSuggestionsEl) {
      nameSuggestionsEl.innerHTML = "";
      data.forEach(p => {
        const d = document.createElement("div");
        d.textContent = p.patient_name || "";
        d.addEventListener("click", () => selectPatient(p));
        nameSuggestionsEl.appendChild(d);
      });
      nameSuggestionsEl.hidden = false;
    }
  } catch (err) { console.error("fetchSuggestions:", err); if (nameSuggestionsEl) nameSuggestionsEl.hidden = true; }
}

function selectPatient(p) {
  if (!p) return;
  const pnEl = F.patientName(); if (pnEl) pnEl.value = p.patient_name || "";
  if (nameSuggestionsEl) nameSuggestionsEl.hidden = true;

  const dobValue = p.dob ? parseDateFromSheet(p.dob) : "";
  applyDOBToAge(dobValue);
  if (!dobValue) { 
    const ageEl3 = F.age(); 
    if (ageEl3) { 
      ageEl3.value = p.age || ""; 
      ageEl3.readOnly = false; 
      ageEl3.classList.remove("readonly"); 
    } 
  }

  const setVal2 = (fn, val) => { const n = fn(); if (n) n.value = val || ""; };
  setVal2(F.dob, dobValue);
  setVal2(F.gender, p.gender);
  setVal2(() => F.contact(), p.contact);
  setVal2(F.altContact, p.alt_contact);
  setVal2(F.address, p.address);
  setVal2(F.areaInput, p.area);
  setVal2(F.mapLink, p.map_link);
  setVal2(F.doctorName, p.doctor);
  setVal2(F.careOf, p.care_of);
  setVal2(F.height, p.height);
  setVal2(F.weight, p.weight);
  setVal2(F.lmpDate, p.lmp_date ? parseDateFromSheet(p.lmp_date) : "");
  setVal2(F.clinicalHistory, p.clinical_history);
  setVal2(F.phlebotomistInput, p.phlebotomist);
  setVal2(F.ppPhlebotomistInput, p.pp_phlebotomist);
  setVal2(F.visitInstruction, p.visit_instruction);

  if (p.tube_overrides) tubeCountOverrides = safeJSONParse(p.tube_overrides, {});
  if (p.syringes) {
    const parts = p.syringes.split(",");
    syringeCounts = { "2ml": 0, "5ml": 0, "10ml": 0 };
    parts.forEach(part => {
      const match = part.trim().match(/(\d+)ml\s*x\s*(\d+)/i);
      if (match) {
        const size = match[1];
        const count = parseInt(match[2]);
        if (size === "2") syringeCounts["2ml"] = count;
        else if (size === "5") syringeCounts["5ml"] = count;
        else if (size === "10") syringeCounts["10ml"] = count;
      }
    });
  }
  if (p.discount) { const n = F.discount(); if (n) n.value = p.discount; }
  if (p.discounted_price) { const n = F.discountedPrice(); if (n) n.value = p.discounted_price; }
  if (p.home_visit_charges) { const n = F.homeVisitCharges(); if (n) n.value = p.home_visit_charges; }
  if (p.cash_received) { const n = F.cashReceived(); if (n) n.value = p.cash_received; }
  if (p.online_received) { const n = F.onlineReceived(); if (n) n.value = p.online_received; }
  updatePaymentFields();
  renderSyringes();
}

/* ========================= Boot ========================= */
initAccordions();
setDefaults();
fetchServerList().then(() => renderInProgress());

const resetTubeBtn = F.resetTubeBtn();
if (resetTubeBtn) {
  resetTubeBtn.addEventListener("click", resetTubeCounts);
}
