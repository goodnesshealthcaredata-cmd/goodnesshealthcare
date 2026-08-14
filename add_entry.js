// ============================================================
//  add_entry.js - Complete Entry Form Logic
//  With Per-Form State Isolation
// ============================================================

// ============================================================
//  FIREBASE CONFIGURATION
// ============================================================
const firebaseConfig = {
  apiKey: "AIzaSyBYvXfJIVRQSFgXp50sGegSN5U8xq88C3g",
  authDomain: "goodness-data.firebaseapp.com",
  databaseURL: "https://goodness-data-default-rtdb.firebaseio.com",
  projectId: "goodness-data",
  storageBucket: "goodness-data.firebasestorage.app",
  messagingSenderId: "1034454680105",
  appId: "1:1034454680105:web:74727c22489373383b9238",
  measurementId: "G-TD30ZYVDCG"
};

const app = firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// ============================================================
//  DOM REFS
// ============================================================
const tabBar = document.getElementById('tabBar');
const panelContainer = document.getElementById('panelContainer');
const toastEl = document.getElementById('toast');
const entryListEl = document.getElementById('entryList');
const paginationContainer = document.getElementById('paginationContainer');
const entriesFilters = document.getElementById('entriesFilters');
const rulesBanner = document.getElementById('rulesBanner');
const copyRulesBtn = document.getElementById('copyRulesBtn');
const viewModalOverlay = document.getElementById('viewModalOverlay');
const viewModalContent = document.getElementById('viewModalContent');
const viewModalBody = document.getElementById('viewModalBody');
const viewModalClose = document.getElementById('viewModalClose');

// ============================================================
//  PER-FORM STATE MANAGEMENT
// ============================================================

function createEmptyFormState() {
  return {
    selectedLabData: {
      1: { tests: [], packages: [] },
      2: { tests: [], packages: [] },
      3: { tests: [], packages: [] },
      4: { tests: [], packages: [] }
    },
    globalSelectedTestIds: new Set(),
    reportsReceived: {},
    activeLabId: 1,
    b2bVisible: false
  };
}

// Deep clone function for safe state copying
function deepCloneState(state) {
  return {
    selectedLabData: {
      1: { tests: state.selectedLabData[1].tests.map(t => ({ ...t })), packages: state.selectedLabData[1].packages.map(p => ({ ...p, tests: p.tests ? p.tests.map(t => ({ ...t })) : [] })) },
      2: { tests: state.selectedLabData[2].tests.map(t => ({ ...t })), packages: state.selectedLabData[2].packages.map(p => ({ ...p, tests: p.tests ? p.tests.map(t => ({ ...t })) : [] })) },
      3: { tests: state.selectedLabData[3].tests.map(t => ({ ...t })), packages: state.selectedLabData[3].packages.map(p => ({ ...p, tests: p.tests ? p.tests.map(t => ({ ...t })) : [] })) },
      4: { tests: state.selectedLabData[4].tests.map(t => ({ ...t })), packages: state.selectedLabData[4].packages.map(p => ({ ...p, tests: p.tests ? p.tests.map(t => ({ ...t })) : [] })) }
    },
    globalSelectedTestIds: new Set(state.globalSelectedTestIds),
    reportsReceived: { ...state.reportsReceived },
    activeLabId: state.activeLabId,
    b2bVisible: state.b2bVisible
  };
}

// Form states storage
const formStates = new Map();

function getFormState(formId) {
  if (!formStates.has(formId)) {
    formStates.set(formId, createEmptyFormState());
  }
  return formStates.get(formId);
}

function resetFormState(formId) {
  // Only reset this specific form's state
  formStates.set(formId, createEmptyFormState());
}

function deleteFormState(formId) {
  formStates.delete(formId);
}

function getStateForForm(formId) {
  return getFormState(formId);
}

// ============================================================
//  STATE HELPER FUNCTIONS
// ============================================================

function getSelectedLabData(formId) {
  return getFormState(formId).selectedLabData;
}

function getGlobalSelectedTestIds(formId) {
  return getFormState(formId).globalSelectedTestIds;
}

function getReportsReceived(formId) {
  return getFormState(formId).reportsReceived;
}

function getActiveLabId(formId) {
  return getFormState(formId).activeLabId;
}

function setActiveLabId(formId, value) {
  getFormState(formId).activeLabId = value;
}

function getB2BVisible(formId) {
  return getFormState(formId).b2bVisible;
}

function setB2BVisible(formId, value) {
  getFormState(formId).b2bVisible = value;
}

// ============================================================
//  STATE - GLOBAL (non-form specific)
// ============================================================
let allEntries = [];
let editTabs = new Map();
let activeTab = 'added';
let isPermissionError = false;
let allPatientNames = [];

// ============================================================
//  TOAST HELPER
// ============================================================
function toast(msg, type = 'success') {
  toastEl.textContent = msg;
  toastEl.className = 'toast show ' + type;
  clearTimeout(toastEl._timeout);
  toastEl._timeout = setTimeout(() => toastEl.classList.remove('show'), 3000);
}

// ============================================================
//  LOADING STATE
// ============================================================
function setLoading(btn, loading = true) {
  if (loading) {
    btn.disabled = true;
    btn.innerHTML = '<span class="loading-spinner"></span> Saving...';
  } else {
    btn.disabled = false;
    btn.innerHTML = btn.dataset.originalText || '💾 Save Entry';
  }
}

// ============================================================
//  TEXT FORMATTING HELPERS
// ============================================================
function formatName(text) {
  if (!text) return '';
  return text.split(' ').map(part => {
    if (/^\d+$/.test(part)) return part;
    return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
  }).join(' ');
}

function formatAddress(text) {
  if (!text) return '';
  return text.replace(/\b\w+\b/g, function(word) {
    if (/^[A-Z]+$/.test(word)) return word;
    if (/\d/.test(word)) return word;
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  });
}

function formatDateDisplay(dateStr) {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }
  return dateStr;
}

function formatCurrency(value) {
  if (value === undefined || value === null || isNaN(value)) return '₹0';
  return '₹' + Number(value).toLocaleString('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  });
}

function parseCurrency(value) {
  if (!value) return 0;
  const cleaned = value.toString().replace(/[₹,]/g, '').trim();
  return parseFloat(cleaned) || 0;
}

// ============================================================
//  PROGRESS CALCULATION FUNCTIONS (per-form)
// ============================================================
function getPatientProgress(formId) {
  const fields = [
    { id: 'patientName', weight: 1 },
    { id: 'patientAge', weight: 1 },
    { id: 'patientGender', weight: 1 },
    { id: 'patientAddress', weight: 1 },
    { id: 'patientDoctor', weight: 1 },
    { id: 'patientCareOf', weight: 1 }
  ];

  let completed = 0;
  fields.forEach(field => {
    const el = document.getElementById(field.id + '-' + formId);
    if (el && el.value && el.value.trim().length > 0) {
      completed++;
    }
  });

  const contacts = getContactsData(formId);
  const hasContactNumber = contacts.some(c => c.number && c.number.trim().length > 0);
  if (hasContactNumber) {
    completed++;
  }

  return Math.round((completed / (fields.length + 1)) * 100);
}

function getTestProgress(formId) {
  const state = getFormState(formId);
  let totalSelected = 0;
  for (let labId = 1; labId <= 4; labId++) {
    const labData = state.selectedLabData[labId];
    if (labData) {
      totalSelected += (labData.tests || []).length;
      totalSelected += (labData.packages || []).length;
    }
  }
  return totalSelected > 0 ? 100 : 0;
}

function getVisitProgress(formId) {
  const fields = [
    { id: 'visitCenter' },
    { id: 'visitType' },
    { id: 'visitDate' },
    { id: 'visitTime' },
    { id: 'visitPhlebotomist' }
  ];

  let completed = 0;
  fields.forEach(field => {
    const el = document.getElementById(field.id + '-' + formId);
    if (el && el.value && el.value.trim().length > 0) {
      completed++;
    }
  });

  return Math.round((completed / fields.length) * 100);
}

function getReportProgress(formId) {
  const state = getFormState(formId);
  const reportReceivedContainer = document.getElementById('reportReceivedList-' + formId);
  let receivedCheckboxes = [];
  if (reportReceivedContainer) {
    receivedCheckboxes = reportReceivedContainer.querySelectorAll('input[type="checkbox"]');
  }

  const deliveryCheckboxes = [];
  const onlineRequired = document.getElementById('reportOnlineRequired-' + formId)?.checked || false;
  const deliveryRequired = document.getElementById('reportDeliveryRequired-' + formId)?.checked || false;
  const billRequired = document.getElementById('reportBillDeliveryRequired-' + formId)?.checked || false;

  if (onlineRequired) {
    const el = document.getElementById('reportOnlineSent-' + formId);
    if (el) deliveryCheckboxes.push(el);
  }
  if (deliveryRequired) {
    const el = document.getElementById('reportDelivered-' + formId);
    if (el) deliveryCheckboxes.push(el);
  }
  if (billRequired) {
    const el = document.getElementById('reportBillDelivered-' + formId);
    if (el) deliveryCheckboxes.push(el);
  }

  const allCheckboxes = [...receivedCheckboxes, ...deliveryCheckboxes];
  
  if (allCheckboxes.length === 0) return 0;

  let checked = 0;
  allCheckboxes.forEach(el => {
    if (el.checked) checked++;
  });

  return Math.round((checked / allCheckboxes.length) * 100);
}

function getPaymentProgress(formId) {
  const finalPrice = document.getElementById('paymentFinalPrice-' + formId);
  const pending = document.getElementById('paymentPending-' + formId);
  const goodwill = document.getElementById('paymentGoodwill-' + formId);
  const careOf = document.getElementById('patientCareOf-' + formId);

  if (!finalPrice || !pending) return 0;

  const hasFinalPrice = finalPrice.value && parseFloat(finalPrice.value) > 0;
  if (!hasFinalPrice) return 0;

  const pendingValue = parseCurrency(pending.value);
  if (pendingValue !== 0) return 50;

  const hasCareOf = careOf && careOf.value && careOf.value.trim().length > 0 && 
                    careOf.value.trim().toLowerCase() !== 'none';
  
  if (hasCareOf) {
    if (!goodwill || !goodwill.value || parseFloat(goodwill.value) <= 0) {
      return 75;
    }
    return 100;
  }

  return 100;
}

function getSectionProgress(section, formId) {
  switch(section) {
    case 'patient': return getPatientProgress(formId);
    case 'test': return getTestProgress(formId);
    case 'visit': return getVisitProgress(formId);
    case 'report': return getReportProgress(formId);
    case 'payment': return getPaymentProgress(formId);
    default: return 0;
  }
}

function getEntryProgress(entry) {
  const progress = {
    patient: 0,
    test: 0,
    visit: 0,
    report: 0,
    payment: 0
  };

  const patientFields = ['patientName', 'age', 'gender', 'address', 'doctorName', 'careOfPerson'];
  let patientFilled = 0;
  patientFields.forEach(field => {
    if (entry[field] && entry[field].toString().trim().length > 0) patientFilled++;
  });
  const hasContactNumber = entry.contacts && entry.contacts.some(c => c.number && c.number.trim().length > 0);
  if (hasContactNumber) patientFilled++;
  progress.patient = Math.round((patientFilled / (patientFields.length + 1)) * 100);

  let hasTest = false;
  if (entry.labSelections) {
    for (let labId = 1; labId <= 4; labId++) {
      const labData = entry.labSelections[labId];
      if (labData) {
        if ((labData.tests && labData.tests.length > 0) || 
            (labData.packages && labData.packages.length > 0)) {
          hasTest = true;
          break;
        }
      }
    }
  }
  progress.test = hasTest ? 100 : 0;

  const visitFields = ['center', 'visitType', 'visitDate', 'visitTime', 'phlebotomist'];
  let visitFilled = 0;
  visitFields.forEach(field => {
    if (entry[field] && entry[field].toString().trim().length > 0) visitFilled++;
  });
  progress.visit = Math.round((visitFilled / visitFields.length) * 100);

  let reportChecked = 0;
  let reportTotal = 0;

  if (entry.reportsReceived) {
    const receivedValues = Object.values(entry.reportsReceived);
    receivedValues.forEach(val => {
      reportTotal++;
      if (val === true) reportChecked++;
    });
  }

  const onlineRequired = entry.onlineReportRequired || false;
  const deliveryRequired = entry.reportDeliveryRequired || false;
  const billRequired = entry.billDeliveryRequired || false;

  if (onlineRequired) {
    reportTotal++;
    if (entry.onlineReportSent === true) reportChecked++;
  }
  if (deliveryRequired) {
    reportTotal++;
    if (entry.reportDelivered === true) reportChecked++;
  }
  if (billRequired) {
    reportTotal++;
    if (entry.billDelivered === true) reportChecked++;
  }

  progress.report = reportTotal > 0 ? Math.round((reportChecked / reportTotal) * 100) : 0;

  let paymentPct = 0;
  const finalPrice = entry.finalPrice || 0;
  if (finalPrice > 0) {
    const pending = entry.pendingPayment || 0;
    if (pending === 0) {
      const careOf = entry.careOfPerson || '';
      if (careOf && careOf.toLowerCase() !== 'none') {
        paymentPct = (entry.goodwillCharges && entry.goodwillCharges > 0) ? 100 : 75;
      } else {
        paymentPct = 100;
      }
    } else {
      paymentPct = 50;
    }
  }
  progress.payment = paymentPct;

  return progress;
}

function updateSectionProgressBars(formId) {
  const panel = document.getElementById('panel-' + formId);
  if (!panel) return;

  const navBtns = panel.querySelectorAll('.section-nav-btn');
  navBtns.forEach(btn => {
    const section = btn.dataset.section;
    const progress = getSectionProgress(section, formId);
    
    const fill = btn.querySelector('.progress-fill');
    const label = btn.querySelector('.progress-label');
    
    if (fill) fill.style.width = progress + '%';
    if (label) label.textContent = progress + '%';
  });
}

// ============================================================
//  PAYMENT CALCULATIONS (per-form)
// ============================================================
function calculateTotalMRP(formId) {
  const state = getFormState(formId);
  let total = 0;
  for (let labId = 1; labId <= 4; labId++) {
    const labData = state.selectedLabData[labId];
    if (!labData) continue;
    if (labData.tests && Array.isArray(labData.tests)) {
      labData.tests.forEach(test => { total += test.mrp || 0; });
    }
    if (labData.packages && Array.isArray(labData.packages)) {
      labData.packages.forEach(pkg => { total += pkg.mrp || 0; });
    }
  }
  return total;
}

function calculateTotalB2B(formId) {
  const state = getFormState(formId);
  let total = 0;
  for (let labId = 1; labId <= 4; labId++) {
    const labData = state.selectedLabData[labId];
    if (!labData) continue;
    if (labData.tests && Array.isArray(labData.tests)) {
      labData.tests.forEach(test => { total += test.b2b || 0; });
    }
    if (labData.packages && Array.isArray(labData.packages)) {
      labData.packages.forEach(pkg => { total += pkg.b2b || 0; });
    }
  }
  return total;
}

function updatePaymentFields(formId) {
  const state = getFormState(formId);
  const totalMRP = calculateTotalMRP(formId);
  const totalB2B = calculateTotalB2B(formId);

  const mrpField = document.getElementById(`paymentTotalMRP-${formId}`);
  const b2bField = document.getElementById(`paymentTotalB2B-${formId}`);
  const finalPriceField = document.getElementById(`paymentFinalPrice-${formId}`);
  const cashField = document.getElementById(`paymentCash-${formId}`);
  const onlineField = document.getElementById(`paymentOnline-${formId}`);
  const pendingField = document.getElementById(`paymentPending-${formId}`);
  const goodwillField = document.getElementById(`paymentGoodwill-${formId}`);

  if (mrpField) mrpField.value = formatCurrency(totalMRP);

  if (b2bField) {
    b2bField.value = formatCurrency(totalB2B);
    if (state.b2bVisible) {
      b2bField.classList.add('visible');
      b2bField.classList.remove('hidden-field');
    } else {
      b2bField.classList.remove('visible');
      b2bField.classList.add('hidden-field');
    }
  }

  const finalPrice = parseCurrency(finalPriceField ? finalPriceField.value : '0');
  const cash = parseCurrency(cashField ? cashField.value : '0');
  const online = parseCurrency(onlineField ? onlineField.value : '0');
  const pending = finalPrice - cash - online;

  if (pendingField) {
    pendingField.value = formatCurrency(pending);
    const statusEl = pendingField.parentElement.querySelector('.pending-status');
    if (statusEl) {
      if (pending === 0) {
        statusEl.textContent = '✅ Fully Paid';
        statusEl.className = 'pending-full';
      } else if (pending < 0) {
        statusEl.textContent = '⚠️ Overpayment';
        statusEl.className = 'pending-over';
      } else {
        statusEl.textContent = '💰 Pending';
        statusEl.className = 'pending-due';
      }
    }
  }

  const careOfPerson = document.getElementById(`patientCareOf-${formId}`)?.value?.trim() || '';
  if (goodwillField) {
    const wrapper = goodwillField.closest('.payment-field-wrapper');
    if (careOfPerson && careOfPerson.toLowerCase() !== 'none') {
      wrapper?.classList.remove('goodwill-hidden');
      wrapper?.classList.add('goodwill-visible');
    } else {
      wrapper?.classList.remove('goodwill-visible');
      wrapper?.classList.add('goodwill-hidden');
      goodwillField.value = '';
    }
  }

  updateSectionProgressBars(formId);
}

// ============================================================
//  B2B PASSWORD PROTECTION (per-form)
// ============================================================
function handleB2BUnlock(formId) {
  const promptDiv = document.getElementById(`b2bPrompt-${formId}`);
  const input = document.getElementById(`b2bPassword-${formId}`);
  const toggleBtn = document.getElementById(`b2bToggle-${formId}`);
  if (!promptDiv || !input) return;

  const state = getFormState(formId);

  if (state.b2bVisible) {
    state.b2bVisible = false;
    const field = document.getElementById(`paymentTotalB2B-${formId}`);
    if (field) {
      field.classList.remove('visible');
      field.classList.add('hidden-field');
    }
    if (toggleBtn) {
      toggleBtn.textContent = '🔒 View B2B';
      toggleBtn.style.color = '';
    }
    promptDiv.classList.remove('show');
    return;
  }

  promptDiv.classList.toggle('show');
  if (promptDiv.classList.contains('show')) {
    input.focus();
    input.value = '';
  }
}

function verifyB2BPassword(formId) {
  const input = document.getElementById(`b2bPassword-${formId}`);
  const promptDiv = document.getElementById(`b2bPrompt-${formId}`);
  const field = document.getElementById(`paymentTotalB2B-${formId}`);
  const toggleBtn = document.getElementById(`b2bToggle-${formId}`);

  if (!input || !field) return;

  if (input.value === 'gnh123') {
    const state = getFormState(formId);
    state.b2bVisible = true;
    field.classList.add('visible');
    field.classList.remove('hidden-field');
    promptDiv.classList.remove('show');
    if (toggleBtn) {
      toggleBtn.textContent = '🔓 Hide B2B';
      toggleBtn.style.color = 'var(--success)';
    }
    input.value = '';
    toast('B2B price revealed.', 'success');
  } else {
    toast('Incorrect password. Please try again.', 'error');
    input.value = '';
    input.focus();
  }
}

// ============================================================
//  PP DETECTION (per-form)
// ============================================================
function isPPSelected(formId) {
  const state = getFormState(formId);
  for (let labId = 1; labId <= 4; labId++) {
    const labData = state.selectedLabData[labId];
    if (labData && labData.tests) {
      for (const test of labData.tests) {
        if (test.id === 'pp' || test.generalName === 'PP') return true;
      }
    }
    if (labData && labData.packages) {
      for (const pkg of labData.packages) {
        if (pkg.tests) {
          for (const test of pkg.tests) {
            if ((test.generalName === 'PP' || test.id === 'pp') && test.selected !== false) return true;
          }
        }
      }
    }
  }
  return false;
}

function updatePPSection(formId) {
  const ppSection = document.getElementById(`ppSection-${formId}`);
  if (!ppSection) return;
  if (isPPSelected(formId)) {
    ppSection.classList.add('visible');
  } else {
    ppSection.classList.remove('visible');
  }
}

// ============================================================
//  GLOBAL SELECTION MANAGEMENT (per-form)
// ============================================================
function recalculateGlobalSelectedTests(formId) {
  const state = getFormState(formId);
  state.globalSelectedTestIds = new Set();

  for (let labId = 1; labId <= 4; labId++) {
    const labData = state.selectedLabData[labId];
    if (labData && labData.tests) {
      labData.tests.forEach(test => { state.globalSelectedTestIds.add(test.id); });
    }
    if (labData && labData.packages) {
      labData.packages.forEach(pkg => {
        if (pkg.tests) {
          pkg.tests.forEach(test => {
            if (test.selected !== false) {
              const labTestData = LAB_DATA[labId];
              if (labTestData) {
                const matchingTest = labTestData.tests.find(t => t.generalName === test.generalName);
                if (matchingTest) {
                  state.globalSelectedTestIds.add(matchingTest.id);
                } else {
                  state.globalSelectedTestIds.add(test.generalName);
                }
              }
            }
          });
        }
      });
    }
  }

  for (let labId = 1; labId <= 4; labId++) {
    renderLabContent(labId, formId);
  }
  updatePPSection(formId);
  updateReportReceivedList(formId);
  updatePaymentFields(formId);
  updateSectionProgressBars(formId);
}

function getCurrentFormId() {
  const activePanel = document.querySelector('.panel.active-panel');
  if (activePanel) return activePanel.dataset.panel;
  return 'new';
}

function isTestGloballySelected(formId, testId) {
  const state = getFormState(formId);
  return state.globalSelectedTestIds.has(testId);
}

// ============================================================
//  REPORT RECEIVED FUNCTIONS (per-form)
// ============================================================
function getActiveTestsWithDetails(formId) {
  const state = getFormState(formId);
  const activeTests = [];

  for (let labId = 1; labId <= 4; labId++) {
    const labData = state.selectedLabData[labId];
    if (!labData) continue;

    if (labData.tests && Array.isArray(labData.tests)) {
      labData.tests.forEach(test => {
        if (!activeTests.some(t => t.id === test.id)) {
          activeTests.push({
            id: test.id,
            generalName: test.generalName,
            labName: test.labName,
            labId: labId,
            labNameDisplay: LAB_COLORS[labId].name
          });
        }
      });
    }

    if (labData.packages && Array.isArray(labData.packages)) {
      labData.packages.forEach(pkg => {
        if (pkg.tests && Array.isArray(pkg.tests)) {
          pkg.tests.forEach(test => {
            if (test.selected !== false) {
              const labTestData = LAB_DATA[labId];
              let testId = test.generalName;
              let labName = test.labName;
              if (labTestData && labTestData.tests) {
                const matchingTest = labTestData.tests.find(t => t.generalName === test.generalName);
                if (matchingTest) {
                  testId = matchingTest.id;
                  labName = matchingTest.labName;
                }
              }
              if (!activeTests.some(t => t.id === testId)) {
                activeTests.push({
                  id: testId,
                  generalName: test.generalName,
                  labName: labName,
                  labId: labId,
                  labNameDisplay: LAB_COLORS[labId].name
                });
              }
            }
          });
        }
      });
    }
  }

  return activeTests;
}

function updateReportReceivedList(formId) {
  const state = getFormState(formId);
  const container = document.getElementById(`reportReceivedList-${formId}`);
  const selectAllCheckbox = document.getElementById(`selectAllReports-${formId}`);
  if (!container) return;

  const activeTests = getActiveTestsWithDetails(formId);

  const activeTestIds = new Set(activeTests.map(t => t.id));
  Object.keys(state.reportsReceived).forEach(id => {
    if (!activeTestIds.has(id)) delete state.reportsReceived[id];
  });

  activeTests.forEach(test => {
    if (!(test.id in state.reportsReceived)) {
      state.reportsReceived[test.id] = false;
    }
  });

  if (activeTests.length === 0) {
    container.innerHTML = `<div class="empty-report-state">No tests selected yet.</div>`;
    if (selectAllCheckbox) {
      selectAllCheckbox.checked = false;
      selectAllCheckbox.indeterminate = false;
    }
    return;
  }

  const allChecked = activeTests.every(test => state.reportsReceived[test.id] === true);
  const someChecked = activeTests.some(test => state.reportsReceived[test.id] === true);

  if (selectAllCheckbox) {
    selectAllCheckbox.checked = allChecked;
    selectAllCheckbox.indeterminate = !allChecked && someChecked;
  }

  let html = '';
  activeTests.forEach(test => {
    const checked = state.reportsReceived[test.id] === true;
    const color = LAB_COLORS[test.labId];
    html += `
      <div class="report-test-item" style="border-left-color: ${color.border};">
        <input type="checkbox" id="report-${test.id}-${formId}" 
               data-test-id="${test.id}" data-form="${formId}" 
               ${checked ? 'checked' : ''} />
        <div class="test-info">
          <div class="general-name">${test.generalName}</div>
          <div class="lab-name">${test.labName}</div>
        </div>
        <span class="lab-tag" style="background: ${color.light}; color: ${color.text};">
          ${color.name}
        </span>
      </div>
    `;
  });

  container.innerHTML = html;

  container.querySelectorAll('input[type="checkbox"]').forEach(cb => {
    cb.addEventListener('change', function() {
      const testId = this.dataset.testId;
      const formId = this.dataset.form;
      const state = getFormState(formId);
      state.reportsReceived[testId] = this.checked;
      updateReportReceivedList(formId);
      updateSectionProgressBars(formId);
    });
  });

  updateSectionProgressBars(formId);
}

function handleSelectAllReports(formId) {
  const state = getFormState(formId);
  const selectAll = document.getElementById(`selectAllReports-${formId}`);
  if (!selectAll) return;

  const activeTests = getActiveTestsWithDetails(formId);
  const shouldCheck = selectAll.checked;

  activeTests.forEach(test => {
    state.reportsReceived[test.id] = shouldCheck;
  });

  updateReportReceivedList(formId);
  updateSectionProgressBars(formId);
}

// ============================================================
//  DELIVERY STATUS CONDITIONAL VISIBILITY
// ============================================================
function updateDeliveryStatusVisibility(formId) {
  const onlineRequired = document.getElementById(`reportOnlineRequired-${formId}`)?.checked || false;
  const deliveryRequired = document.getElementById(`reportDeliveryRequired-${formId}`)?.checked || false;
  const billRequired = document.getElementById(`reportBillDeliveryRequired-${formId}`)?.checked || false;

  const onlineSent = document.getElementById(`reportOnlineSent-${formId}`);
  const reportDelivered = document.getElementById(`reportDelivered-${formId}`);
  const billDelivered = document.getElementById(`reportBillDelivered-${formId}`);

  if (onlineSent) {
    onlineSent.closest('.delivery-status-item').classList.toggle('visible', onlineRequired);
  }
  if (reportDelivered) {
    reportDelivered.closest('.delivery-status-item').classList.toggle('visible', deliveryRequired);
  }
  if (billDelivered) {
    billDelivered.closest('.delivery-status-item').classList.toggle('visible', billRequired);
  }

  updateSectionProgressBars(formId);
}

// ============================================================
//  RENDER ENTRIES WITH FILTERS & PAGINATION
// ============================================================
function getLabsForEntry(entry) {
  const labs = [];
  if (entry.labSelections) {
    for (let labId = 1; labId <= 4; labId++) {
      const labData = entry.labSelections[labId];
      if (labData) {
        const hasTests = (labData.tests && labData.tests.length > 0);
        const hasPackages = (labData.packages && labData.packages.length > 0);
        if (hasTests || hasPackages) {
          labs.push(labId);
        }
      }
    }
  }
  return labs;
}

function getEntryGradientClass(entry) {
  const labs = getLabsForEntry(entry);
  if (labs.length === 0) return '';
  if (labs.length === 1) {
    return 'gradient-single-' + labs[0];
  }
  const sorted = labs.sort();
  const key = sorted.join('-');
  const validKeys = [
    '1-2', '1-3', '1-4', '2-3', '2-4', '3-4',
    '1-2-3', '1-2-4', '1-3-4', '2-3-4',
    '1-2-3-4'
  ];
  if (validKeys.includes(key)) {
    return 'gradient-multi-' + key;
  }
  return '';
}

// ============================================================
//  FILTER STATE (global - applies to all entries view)
// ============================================================
let filterState = {
  sort: 'desc',
  status: 'all',
  fromDate: '',
  toDate: '',
  labs: [true, true, true, true],
  center: 'all',
  visitType: 'all',
  phlebotomist: 'all',
  careOfPerson: 'all',
  search: ''
};

let paginationState = {
  perPage: 10,
  currentPage: 1
};

function filterEntries(entries) {
  const status = filterState.status;
  const fromDate = filterState.fromDate;
  const toDate = filterState.toDate;
  const selectedLabs = filterState.labs;
  const center = filterState.center;
  const visitType = filterState.visitType;
  const phlebotomist = filterState.phlebotomist;
  const careOfPerson = filterState.careOfPerson;
  const search = filterState.search.toLowerCase().trim();

  let filtered = entries;

  if (search) {
    filtered = filtered.filter(entry => {
      const name = (entry.patientName || '').toLowerCase();
      return name.includes(search);
    });
  }

  if (status === 'pending') {
    filtered = filtered.filter(entry => {
      const progress = getEntryProgress(entry);
      return progress.patient < 100 || progress.test < 100 || 
             progress.visit < 100 || progress.report < 100 || progress.payment < 100;
    });
  } else if (status === 'report-pending') {
    filtered = filtered.filter(entry => {
      const progress = getEntryProgress(entry);
      return progress.report < 100;
    });
  } else if (status === 'payment-pending') {
    filtered = filtered.filter(entry => {
      const progress = getEntryProgress(entry);
      return progress.payment < 100;
    });
  }

  if (fromDate) {
    filtered = filtered.filter(entry => {
      const entryDate = entry.visitDate || '';
      return entryDate >= fromDate;
    });
  }
  if (toDate) {
    filtered = filtered.filter(entry => {
      const entryDate = entry.visitDate || '';
      return entryDate <= toDate;
    });
  }

  const activeLabs = [];
  for (let i = 0; i < selectedLabs.length; i++) {
    if (selectedLabs[i]) activeLabs.push(i + 1);
  }
  if (activeLabs.length > 0) {
    filtered = filtered.filter(entry => {
      const entryLabs = getLabsForEntry(entry);
      return entryLabs.some(lab => activeLabs.includes(lab));
    });
  } else {
    filtered = [];
  }

  if (center !== 'all') {
    filtered = filtered.filter(entry => entry.center === center);
  }

  if (visitType !== 'all') {
    filtered = filtered.filter(entry => entry.visitType === visitType);
  }

  if (phlebotomist !== 'all') {
    filtered = filtered.filter(entry => entry.phlebotomist === phlebotomist);
  }

  if (careOfPerson !== 'all') {
    filtered = filtered.filter(entry => entry.careOfPerson === careOfPerson);
  }

  return filtered;
}

function renderEntries(entries) {
  let filtered = filterEntries(entries);
  
  const sortDir = filterState.sort;
  filtered.sort((a, b) => {
    const dateA = a.visitDate || '1970-01-01';
    const timeA = a.visitTime || '00:00';
    const dateB = b.visitDate || '1970-01-01';
    const timeB = b.visitTime || '00:00';
    const dtA = new Date(dateA + 'T' + timeA + ':00');
    const dtB = new Date(dateB + 'T' + timeB + ':00');
    return sortDir === 'desc' ? dtB - dtA : dtA - dtB;
  });

  const countEl = document.getElementById('entryCount');
  if (countEl) countEl.textContent = filtered.length + ' Entries';

  const perPage = paginationState.perPage;
  const totalPages = Math.ceil(filtered.length / perPage) || 1;
  const currentPage = Math.min(paginationState.currentPage, totalPages);
  paginationState.currentPage = currentPage;

  const start = (currentPage - 1) * perPage;
  const end = start + perPage;
  const pageItems = filtered.slice(start, end);

  if (pageItems.length === 0) {
    entryListEl.innerHTML = '<div class="empty-msg">No entries found. Create your first entry!</div>';
  } else {
    let html = '';
    pageItems.forEach(rec => {
      const name = rec.patientName || 'Unknown';
      const gradientClass = getEntryGradientClass(rec);
      const progress = getEntryProgress(rec);

      html += `
        <div class="entry-item ${gradientClass}">
          ${gradientClass.includes('gradient-multi') ? '<div class="entry-gradient-overlay gradient-multi"></div>' : ''}
          <div class="entry-content">
            <div class="entry-left">
              <div class="patient-name">${name}</div>
            </div>
            <div class="entry-actions">
              <button class="view-btn" data-key="${rec._firebaseKey}">👁 View</button>
              <button class="edit-btn" data-key="${rec._firebaseKey}">✎ Edit</button>
              <button class="del-btn" data-key="${rec._firebaseKey}">✕ Delete</button>
            </div>
          </div>
          <div class="entry-progress-row">
            <div class="entry-progress-item">
              <span class="mini-label">Patient</span>
              <div class="mini-bar">
                <div class="mini-fg" style="width: ${progress.patient}%;"></div>
              </div>
              <span class="mini-pct">${progress.patient}%</span>
            </div>
            <div class="entry-progress-item">
              <span class="mini-label">Tests</span>
              <div class="mini-bar">
                <div class="mini-fg" style="width: ${progress.test}%;"></div>
              </div>
              <span class="mini-pct">${progress.test}%</span>
            </div>
            <div class="entry-progress-item">
              <span class="mini-label">Visit</span>
              <div class="mini-bar">
                <div class="mini-fg" style="width: ${progress.visit}%;"></div>
              </div>
              <span class="mini-pct">${progress.visit}%</span>
            </div>
            <div class="entry-progress-item">
              <span class="mini-label">Report</span>
              <div class="mini-bar">
                <div class="mini-fg" style="width: ${progress.report}%;"></div>
              </div>
              <span class="mini-pct">${progress.report}%</span>
            </div>
            <div class="entry-progress-item">
              <span class="mini-label">Payment</span>
              <div class="mini-bar">
                <div class="mini-fg" style="width: ${progress.payment}%;"></div>
              </div>
              <span class="mini-pct">${progress.payment}%</span>
            </div>
          </div>
        </div>
      `;
    });

    entryListEl.innerHTML = html;
  }

  entryListEl.querySelectorAll('.view-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.dataset.key;
      const rec = allEntries.find(e => e._firebaseKey === key);
      if (rec) openViewModal(rec);
    });
  });

  entryListEl.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.dataset.key;
      const rec = allEntries.find(e => e._firebaseKey === key);
      if (rec) openEditTab(key, rec);
    });
  });

  entryListEl.querySelectorAll('.del-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const key = btn.dataset.key;
      const rec = allEntries.find(e => e._firebaseKey === key);
      if (!rec) return;
      if (!confirm(`Delete entry for "${rec.patientName || 'Unknown'}"?`)) return;
      try {
        await db.ref('patients/' + key).remove();
        toast('Entry deleted successfully.', 'success');
        await loadEntries();
      } catch (err) {
        handleFirebaseError(err);
      }
    });
  });

  renderPagination(totalPages, filtered.length);
}

function renderPagination(totalPages, totalItems) {
  const currentPage = paginationState.currentPage;
  const perPage = paginationState.perPage;

  let html = `
    <div class="pagination-container">
      <div class="per-page">
        <span>Entries per page:</span>
        <select id="perPageSelect">
          <option value="10" ${perPage === 10 ? 'selected' : ''}>10</option>
          <option value="20" ${perPage === 20 ? 'selected' : ''}>20</option>
          <option value="30" ${perPage === 30 ? 'selected' : ''}>30</option>
          <option value="40" ${perPage === 40 ? 'selected' : ''}>40</option>
          <option value="50" ${perPage === 50 ? 'selected' : ''}>50</option>
        </select>
      </div>
      <div class="pagination-controls">
        <button class="prev-btn" ${currentPage <= 1 ? 'disabled' : ''}>← Previous</button>
  `;

  const maxVisible = 7;
  let startPage = Math.max(1, currentPage - 3);
  let endPage = Math.min(totalPages, startPage + maxVisible - 1);
  if (endPage - startPage < maxVisible - 1) {
    startPage = Math.max(1, endPage - maxVisible + 1);
  }

  if (startPage > 1) {
    html += `<button class="page-btn" data-page="1">1</button>`;
    if (startPage > 2) html += `<span class="page-info">…</span>`;
  }

  for (let i = startPage; i <= endPage; i++) {
    html += `<button class="page-btn ${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
  }

  if (endPage < totalPages) {
    if (endPage < totalPages - 1) html += `<span class="page-info">…</span>`;
    html += `<button class="page-btn" data-page="${totalPages}">${totalPages}</button>`;
  }

  html += `
        <button class="next-btn" ${currentPage >= totalPages ? 'disabled' : ''}>Next →</button>
      </div>
    </div>
  `;

  paginationContainer.innerHTML = html;

  const perPageSelect = document.getElementById('perPageSelect');
  if (perPageSelect) {
    perPageSelect.addEventListener('change', function() {
      paginationState.perPage = parseInt(this.value);
      paginationState.currentPage = 1;
      renderEntries(allEntries);
    });
  }

  paginationContainer.querySelectorAll('.page-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const page = parseInt(this.dataset.page);
      if (page !== paginationState.currentPage) {
        paginationState.currentPage = page;
        renderEntries(allEntries);
      }
    });
  });

  const prevBtn = paginationContainer.querySelector('.prev-btn');
  if (prevBtn) {
    prevBtn.addEventListener('click', function() {
      if (paginationState.currentPage > 1) {
        paginationState.currentPage--;
        renderEntries(allEntries);
      }
    });
  }

  const nextBtn = paginationContainer.querySelector('.next-btn');
  if (nextBtn) {
    nextBtn.addEventListener('click', function() {
      if (paginationState.currentPage < totalPages) {
        paginationState.currentPage++;
        renderEntries(allEntries);
      }
    });
  }
}

// ============================================================
//  BUILD FILTERS UI
// ============================================================
function buildFiltersUI() {
  const html = `
    <div class="entries-toolbar">
      <div class="filter-row">
        <div class="filter-group" style="flex:1;">
          <input type="text" class="search-input" id="filterSearch" placeholder="Search by patient name..." value="${filterState.search}" />
        </div>
        <button class="refresh-btn" id="refreshBtn">⟳ Refresh</button>
        <button class="action-btn clear-btn" id="clearFiltersBtn">✕ Clear Filters</button>
      </div>

      <div class="filter-row">
        <div class="lab-filter-group">
          <label style="font-weight:600;font-size:0.85rem;color:var(--text-medium);">Labs:</label>
          ${[1,2,3,4].map(i => `
            <label class="lab-check lab-${i}">
              <input type="checkbox" class="lab-checkbox" data-lab="${i}" ${filterState.labs[i-1] ? 'checked' : ''} />
              ${LAB_COLORS[i].name}
            </label>
          `).join('')}
        </div>
      </div>

      <div class="filter-row">
        <div class="filter-group">
          <label>Sort:</label>
          <select id="filterSort">
            <option value="desc" ${filterState.sort === 'desc' ? 'selected' : ''}>Newest → Oldest</option>
            <option value="asc" ${filterState.sort === 'asc' ? 'selected' : ''}>Oldest → Newest</option>
          </select>
        </div>
        <div class="filter-group">
          <label>Status:</label>
          <select id="filterStatus">
            <option value="all" ${filterState.status === 'all' ? 'selected' : ''}>All Entries</option>
            <option value="pending" ${filterState.status === 'pending' ? 'selected' : ''}>Pending Entries</option>
            <option value="report-pending" ${filterState.status === 'report-pending' ? 'selected' : ''}>Report Detail Pending</option>
            <option value="payment-pending" ${filterState.status === 'payment-pending' ? 'selected' : ''}>Payment Detail Pending</option>
          </select>
        </div>
        <div class="filter-group">
          <label>From:</label>
          <input type="date" class="date-input" id="filterFromDate" value="${filterState.fromDate}" />
        </div>
        <div class="filter-group">
          <label>To:</label>
          <input type="date" class="date-input" id="filterToDate" value="${filterState.toDate}" />
        </div>
        <div class="filter-group">
          <label>Center:</label>
          <select id="filterCenter">
            <option value="all">All</option>
          </select>
        </div>
        <div class="filter-group">
          <label>Visit Type:</label>
          <select id="filterVisitType">
            <option value="all">All</option>
          </select>
        </div>
        <div class="filter-group">
          <label>Phlebotomist:</label>
          <select id="filterPhlebotomist">
            <option value="all">All</option>
          </select>
        </div>
        <div class="filter-group">
          <label>Care of Person:</label>
          <select id="filterCareOfPerson">
            <option value="all">All</option>
          </select>
        </div>
        <div class="right-controls">
          <span class="entry-count" id="entryCount">0 Entries</span>
        </div>
      </div>
    </div>
  `;

  entriesFilters.innerHTML = html;

  populateDynamicFilters();

  document.getElementById('filterSearch').addEventListener('input', function() {
    filterState.search = this.value;
    paginationState.currentPage = 1;
    renderEntries(allEntries);
  });

  document.getElementById('filterSort').addEventListener('change', function() {
    filterState.sort = this.value;
    paginationState.currentPage = 1;
    renderEntries(allEntries);
  });

  document.getElementById('filterStatus').addEventListener('change', function() {
    filterState.status = this.value;
    paginationState.currentPage = 1;
    renderEntries(allEntries);
  });

  document.getElementById('filterFromDate').addEventListener('change', function() {
    filterState.fromDate = this.value;
    paginationState.currentPage = 1;
    renderEntries(allEntries);
  });

  document.getElementById('filterToDate').addEventListener('change', function() {
    filterState.toDate = this.value;
    paginationState.currentPage = 1;
    renderEntries(allEntries);
  });

  document.querySelectorAll('.lab-checkbox').forEach(cb => {
    cb.addEventListener('change', function() {
      const lab = parseInt(this.dataset.lab);
      filterState.labs[lab - 1] = this.checked;
      paginationState.currentPage = 1;
      renderEntries(allEntries);
    });
  });

  document.getElementById('filterCenter').addEventListener('change', function() {
    filterState.center = this.value;
    paginationState.currentPage = 1;
    renderEntries(allEntries);
  });

  document.getElementById('filterVisitType').addEventListener('change', function() {
    filterState.visitType = this.value;
    paginationState.currentPage = 1;
    renderEntries(allEntries);
  });

  document.getElementById('filterPhlebotomist').addEventListener('change', function() {
    filterState.phlebotomist = this.value;
    paginationState.currentPage = 1;
    renderEntries(allEntries);
  });

  document.getElementById('filterCareOfPerson').addEventListener('change', function() {
    filterState.careOfPerson = this.value;
    paginationState.currentPage = 1;
    renderEntries(allEntries);
  });

  document.getElementById('clearFiltersBtn').addEventListener('click', function() {
    clearAllFilters();
  });

  document.getElementById('refreshBtn').addEventListener('click', function() {
    loadEntries();
  });
}

function populateDynamicFilters() {
  const centers = new Set();
  const visitTypes = new Set();
  const phlebotomists = new Set();
  const careOfPersons = new Set();

  allEntries.forEach(entry => {
    if (entry.center) centers.add(entry.center);
    if (entry.visitType) visitTypes.add(entry.visitType);
    if (entry.phlebotomist) phlebotomists.add(entry.phlebotomist);
    if (entry.careOfPerson) careOfPersons.add(entry.careOfPerson);
  });

  const sortOptions = (set) => Array.from(set).sort((a, b) => a.localeCompare(b));

  const centerSelect = document.getElementById('filterCenter');
  if (centerSelect) {
    centerSelect.innerHTML = '<option value="all">All</option>';
    sortOptions(centers).forEach(val => {
      centerSelect.innerHTML += `<option value="${val}">${val}</option>`;
    });
    if (filterState.center !== 'all' && !centers.has(filterState.center)) {
      centerSelect.value = 'all';
    } else {
      centerSelect.value = filterState.center;
    }
  }

  const visitTypeSelect = document.getElementById('filterVisitType');
  if (visitTypeSelect) {
    visitTypeSelect.innerHTML = '<option value="all">All</option>';
    sortOptions(visitTypes).forEach(val => {
      visitTypeSelect.innerHTML += `<option value="${val}">${val}</option>`;
    });
    if (filterState.visitType !== 'all' && !visitTypes.has(filterState.visitType)) {
      visitTypeSelect.value = 'all';
    } else {
      visitTypeSelect.value = filterState.visitType;
    }
  }

  const phlebotomistSelect = document.getElementById('filterPhlebotomist');
  if (phlebotomistSelect) {
    phlebotomistSelect.innerHTML = '<option value="all">All</option>';
    sortOptions(phlebotomists).forEach(val => {
      phlebotomistSelect.innerHTML += `<option value="${val}">${val}</option>`;
    });
    if (filterState.phlebotomist !== 'all' && !phlebotomists.has(filterState.phlebotomist)) {
      phlebotomistSelect.value = 'all';
    } else {
      phlebotomistSelect.value = filterState.phlebotomist;
    }
  }

  const careOfPersonSelect = document.getElementById('filterCareOfPerson');
  if (careOfPersonSelect) {
    careOfPersonSelect.innerHTML = '<option value="all">All</option>';
    sortOptions(careOfPersons).forEach(val => {
      careOfPersonSelect.innerHTML += `<option value="${val}">${val}</option>`;
    });
    if (filterState.careOfPerson !== 'all' && !careOfPersons.has(filterState.careOfPerson)) {
      careOfPersonSelect.value = 'all';
    } else {
      careOfPersonSelect.value = filterState.careOfPerson;
    }
  }

  filterState.center = centerSelect ? centerSelect.value : 'all';
  filterState.visitType = visitTypeSelect ? visitTypeSelect.value : 'all';
  filterState.phlebotomist = phlebotomistSelect ? phlebotomistSelect.value : 'all';
  filterState.careOfPerson = careOfPersonSelect ? careOfPersonSelect.value : 'all';
}

function clearAllFilters() {
  filterState.status = 'all';
  filterState.fromDate = '';
  filterState.toDate = '';
  filterState.labs = [true, true, true, true];
  filterState.center = 'all';
  filterState.visitType = 'all';
  filterState.phlebotomist = 'all';
  filterState.careOfPerson = 'all';
  filterState.search = '';
  paginationState.currentPage = 1;

  const searchEl = document.getElementById('filterSearch');
  if (searchEl) searchEl.value = '';

  const statusEl = document.getElementById('filterStatus');
  if (statusEl) statusEl.value = 'all';

  const fromDateEl = document.getElementById('filterFromDate');
  if (fromDateEl) fromDateEl.value = '';

  const toDateEl = document.getElementById('filterToDate');
  if (toDateEl) toDateEl.value = '';

  document.querySelectorAll('.lab-checkbox').forEach(cb => {
    cb.checked = true;
  });

  populateDynamicFilters();

  renderEntries(allEntries);
  toast('All filters cleared.', 'success');
}

// ============================================================
//  VIEW MODAL
// ============================================================
function openViewModal(entry) {
  viewModalBody.innerHTML = buildViewModalContent(entry);
  viewModalOverlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeViewModal() {
  viewModalOverlay.classList.remove('active');
  document.body.style.overflow = '';
}

function buildViewModalContent(entry) {
  let html = '';

  html += `
    <div class="view-section">
      <div class="view-section-title">👤 Patient Details</div>
      <div class="view-grid">
        <div class="view-item"><span class="label">Patient Name</span><span class="value">${entry.patientName || '—'}</span></div>
        <div class="view-item"><span class="label">Age</span><span class="value">${entry.age || '—'}</span></div>
        <div class="view-item"><span class="label">Gender</span><span class="value">${entry.gender || '—'}</span></div>
        <div class="view-item"><span class="label">Doctor</span><span class="value">${entry.doctorName || '—'}</span></div>
        <div class="view-item"><span class="label">Care of Person</span><span class="value">${entry.careOfPerson || '—'}</span></div>
        <div class="view-item full-width"><span class="label">Address</span><span class="value">${entry.address || '—'}</span></div>
  `;

  if (entry.contacts && entry.contacts.length > 0) {
    html += `<div class="view-item full-width"><span class="label">Contacts</span><span class="value">`;
    entry.contacts.forEach((c, i) => {
      html += `${c.name || ''} ${c.number ? '(' + c.number + ')' : ''}`;
      if (i < entry.contacts.length - 1) html += ', ';
    });
    html += `</span></div>`;
  }

  if (entry.additionalInformation) {
    html += `<div class="view-item full-width"><span class="label">Additional Info</span><span class="value">${entry.additionalInformation}</span></div>`;
  }

  html += `</div></div>`;

  html += `
    <div class="view-section">
      <div class="view-section-title">🧪 Test Details</div>
  `;

  let hasTests = false;
  for (let labId = 1; labId <= 4; labId++) {
    const labData = entry.labSelections ? entry.labSelections[labId] : null;
    if (!labData) continue;
    const hasTestsInLab = (labData.tests && labData.tests.length > 0) || 
                          (labData.packages && labData.packages.length > 0);
    if (!hasTestsInLab) continue;
    hasTests = true;

    const color = LAB_COLORS[labId];
    html += `
      <div class="view-subsection" style="border-left: 3px solid ${color.border};">
        <div class="sub-title" style="color: ${color.text};">${color.name}</div>
    `;

    if (labData.tests && labData.tests.length > 0) {
      html += `<div style="margin-bottom: 4px;"><strong>Tests:</strong> `;
      labData.tests.forEach(test => {
        html += `<span class="test-chip">${test.generalName} <span style="font-weight:500;">₹${test.mrp}</span></span>`;
      });
      html += `</div>`;
    }

    if (labData.packages && labData.packages.length > 0) {
      labData.packages.forEach(pkg => {
        html += `<div style="margin-top: 6px;"><strong>📦 ${pkg.packageName}</strong> <span style="font-weight:500;">₹${pkg.mrp}</span>`;
        if (pkg.tests && pkg.tests.length > 0) {
          html += `<div style="font-size:0.8rem;color:var(--text-light);margin-top:2px;">`;
          pkg.tests.forEach(t => {
            html += `<span class="test-chip" style="font-size:0.7rem;">${t.generalName} ${t.selected !== false ? '✓' : ''}</span>`;
          });
          html += `</div>`;
        }
        html += `</div>`;
      });
    }

    html += `</div>`;
  }

  if (!hasTests) {
    html += `<div class="empty-state">No tests or packages selected.</div>`;
  }

  html += `</div>`;

  html += `
    <div class="view-section">
      <div class="view-section-title">📋 Visit Details</div>
      <div class="view-grid">
        <div class="view-item"><span class="label">Center</span><span class="value">${entry.center || '—'}</span></div>
        <div class="view-item"><span class="label">Visit Type</span><span class="value">${entry.visitType || '—'}</span></div>
        <div class="view-item"><span class="label">Visit Date</span><span class="value">${entry.visitDate || '—'}</span></div>
        <div class="view-item"><span class="label">Visit Time</span><span class="value">${entry.visitTime || '—'}</span></div>
        <div class="view-item"><span class="label">Phlebotomist</span><span class="value">${entry.phlebotomist || '—'}</span></div>
  `;

  if (isPPSelectedForEntry(entry)) {
    html += `
      <div class="view-item"><span class="label">PP Time</span><span class="value">${entry.ppTime || '—'}</span></div>
      <div class="view-item"><span class="label">PP Phlebotomist</span><span class="value">${entry.ppPhlebotomist || '—'}</span></div>
    `;
  }

  html += `</div></div>`;

  html += `
    <div class="view-section">
      <div class="view-section-title">📄 Report Details</div>
      <div class="view-grid">
        <div class="view-item"><span class="label">Online Report Required</span><span class="value">${entry.onlineReportRequired ? '✅ Yes' : '❌ No'}</span></div>
        <div class="view-item"><span class="label">Report Delivery Required</span><span class="value">${entry.reportDeliveryRequired ? '✅ Yes' : '❌ No'}</span></div>
        <div class="view-item"><span class="label">Bill Delivery Required</span><span class="value">${entry.billDeliveryRequired ? '✅ Yes' : '❌ No'}</span></div>
  `;

  if (entry.onlineReportRequired) {
    html += `<div class="view-item"><span class="label">Online Report Sent</span><span class="value">${entry.onlineReportSent ? '✅ Yes' : '❌ No'}</span></div>`;
  }
  if (entry.reportDeliveryRequired) {
    html += `<div class="view-item"><span class="label">Report Delivered</span><span class="value">${entry.reportDelivered ? '✅ Yes' : '❌ No'}</span></div>`;
  }
  if (entry.billDeliveryRequired) {
    html += `<div class="view-item"><span class="label">Bill Delivered</span><span class="value">${entry.billDelivered ? '✅ Yes' : '❌ No'}</span></div>`;
  }

  if (entry.reportsReceived) {
    const receivedKeys = Object.keys(entry.reportsReceived);
    if (receivedKeys.length > 0) {
      html += `<div class="view-item full-width"><span class="label">Reports Received</span><span class="value">`;
      receivedKeys.forEach(key => {
        const isReceived = entry.reportsReceived[key];
        html += `<span class="test-chip">${key} ${isReceived ? '✅' : '❌'}</span>`;
      });
      html += `</span></div>`;
    }
  }

  html += `</div></div>`;

  html += `
    <div class="view-section">
      <div class="view-section-title">💰 Payment Details</div>
      <div class="view-grid">
        <div class="view-item"><span class="label">Total MRP</span><span class="value currency">${formatCurrency(entry.totalMRP || 0)}</span></div>
        <div class="view-item"><span class="label">Total B2B</span><span class="value currency">${formatCurrency(entry.totalB2B || 0)}</span></div>
        <div class="view-item"><span class="label">Final Price</span><span class="value currency">${formatCurrency(entry.finalPrice || 0)}</span></div>
        <div class="view-item"><span class="label">Cash Received</span><span class="value currency">${formatCurrency(entry.cashReceived || 0)}</span></div>
        <div class="view-item"><span class="label">Online Received</span><span class="value currency">${formatCurrency(entry.onlineReceived || 0)}</span></div>
        <div class="view-item"><span class="label">Pending Payment</span><span class="value currency">${formatCurrency(entry.pendingPayment || 0)}</span></div>
  `;

  if (entry.careOfPerson && entry.careOfPerson.toLowerCase() !== 'none') {
    html += `<div class="view-item"><span class="label">Goodwill Charges</span><span class="value currency">${formatCurrency(entry.goodwillCharges || 0)}</span></div>`;
  }

  html += `</div></div>`;

  return html;
}

function isPPSelectedForEntry(entry) {
  if (!entry.labSelections) return false;
  for (let labId = 1; labId <= 4; labId++) {
    const labData = entry.labSelections[labId];
    if (!labData) continue;
    if (labData.tests) {
      for (const test of labData.tests) {
        if (test.id === 'pp' || test.generalName === 'PP') return true;
      }
    }
    if (labData.packages) {
      for (const pkg of labData.packages) {
        if (pkg.tests) {
          for (const test of pkg.tests) {
            if ((test.generalName === 'PP' || test.id === 'pp') && test.selected !== false) return true;
          }
        }
      }
    }
  }
  return false;
}

viewModalClose.addEventListener('click', closeViewModal);
viewModalOverlay.addEventListener('click', function(e) {
  if (e.target === this) closeViewModal();
});
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape' && viewModalOverlay.classList.contains('active')) {
    closeViewModal();
  }
});

// ============================================================
//  FIREBASE ERROR HANDLING
// ============================================================
function handleFirebaseError(err) {
  if (err.code === 'PERMISSION_DENIED' || err.message.includes('permission_denied')) {
    isPermissionError = true;
    rulesBanner.classList.add('show');
    toast('Permission denied. Please update Firebase rules.', 'error');
  } else {
    toast('Error: ' + err.message, 'error');
  }
}

// ============================================================
//  LOAD ENTRIES FROM FIREBASE
// ============================================================
async function loadEntries() {
  try {
    const snap = await db.ref('patients').once('value');
    const data = snap.val();
    const entries = [];
    if (data) {
      for (const [key, val] of Object.entries(data)) {
        entries.push({ ...val, _firebaseKey: key });
      }
    }
    allEntries = entries;
    isPermissionError = false;
    rulesBanner.classList.remove('show');

    allPatientNames = [];
    entries.forEach(entry => {
      if (entry.patientName) {
        allPatientNames.push({
          name: entry.patientName,
          key: entry._firebaseKey,
          data: entry
        });
      }
    });
    allPatientNames.sort((a, b) => {
      const dateA = a.data.visitDate || '1970-01-01';
      const timeA = a.data.visitTime || '00:00';
      const dateB = b.data.visitDate || '1970-01-01';
      const timeB = b.data.visitTime || '00:00';
      const dtA = new Date(dateA + 'T' + timeA + ':00');
      const dtB = new Date(dateB + 'T' + timeB + ':00');
      return dtB - dtA;
    });

    if (!entriesFilters.innerHTML) {
      buildFiltersUI();
    }
    populateDynamicFilters();
    renderEntries(allEntries);

  } catch (err) {
    handleFirebaseError(err);
    allEntries = [];
    renderEntries([]);
  }
}

// ============================================================
//  PATIENT NAME AUTOCOMPLETE
// ============================================================
function setupPatientAutocomplete(formId) {
  const input = document.getElementById(`patientName-${formId}`);
  if (!input) return;

  const wrapper = document.createElement('div');
  wrapper.className = 'patient-autocomplete-wrapper';
  input.parentNode.insertBefore(wrapper, input);
  wrapper.appendChild(input);

  const suggestionsDiv = document.createElement('div');
  suggestionsDiv.className = 'patient-autocomplete-suggestions';
  suggestionsDiv.id = `patientSuggestions-${formId}`;
  wrapper.appendChild(suggestionsDiv);

  let activeIndex = -1;
  let currentSuggestions = [];
  // ARCHITECTURE FIX: this debounce timer must be scoped to this specific
  // form's autocomplete instance. It was previously a single module-level
  // variable shared by every open tab, so typing in one form's patient
  // name field could cancel/steal the pending suggestion lookup for
  // another form's field if both were typed into in quick succession.
  let autocompleteTimer = null;

  function updateSuggestions(value) {
    const query = value.toLowerCase().trim();

    if (!query || query.length < 1) {
      suggestionsDiv.classList.remove('show');
      return;
    }

    const matches = allPatientNames.filter(item =>
      item.name.toLowerCase().includes(query)
    );

    const uniqueMatches = [];
    const seenNames = new Set();
    matches.forEach(item => {
      if (!seenNames.has(item.name)) {
        seenNames.add(item.name);
        uniqueMatches.push(item);
      }
    });

    uniqueMatches.sort((a, b) => a.name.localeCompare(b.name));

    currentSuggestions = uniqueMatches;

    if (currentSuggestions.length === 0) {
      suggestionsDiv.classList.remove('show');
      return;
    }

    suggestionsDiv.innerHTML = currentSuggestions.map((item, index) => {
      const name = item.name;
      const lowerName = name.toLowerCase();
      const queryLower = query.toLowerCase();
      const startIndex = lowerName.indexOf(queryLower);

      let displayName = name;
      if (startIndex !== -1) {
        const before = name.substring(0, startIndex);
        const match = name.substring(startIndex, startIndex + query.length);
        const after = name.substring(startIndex + query.length);
        displayName = `${before}<span class="highlight">${match}</span>${after}`;
      }

      const visitDate = item.data.visitDate ? formatDateDisplay(item.data.visitDate) : 'No previous visit';
      return `
        <div class="patient-suggestion-item" data-index="${index}">
          <div class="patient-name">${displayName}</div>
          <div class="patient-visit">Previous visit: ${visitDate}</div>
        </div>
      `;
    }).join('');

    suggestionsDiv.classList.add('show');
    activeIndex = -1;

    suggestionsDiv.querySelectorAll('.patient-suggestion-item').forEach((el, idx) => {
      el.addEventListener('click', function() {
        const selected = currentSuggestions[idx];
        if (selected) {
          selectPatientFromHistory(selected, formId);
        }
      });
    });
  }

  input.addEventListener('input', function() {
    clearTimeout(autocompleteTimer);
    autocompleteTimer = setTimeout(() => {
      updateSuggestions(this.value);
    }, 300);
  });

  input.addEventListener('keydown', function(e) {
    const items = suggestionsDiv.querySelectorAll('.patient-suggestion-item');
    if (items.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      activeIndex = Math.min(activeIndex + 1, items.length - 1);
      items.forEach((item, idx) => {
        item.classList.toggle('active', idx === activeIndex);
      });
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      activeIndex = Math.max(activeIndex - 1, 0);
      items.forEach((item, idx) => {
        item.classList.toggle('active', idx === activeIndex);
      });
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIndex >= 0 && activeIndex < items.length) {
        const selected = currentSuggestions[activeIndex];
        if (selected) {
          selectPatientFromHistory(selected, formId);
        }
      }
    } else if (e.key === 'Escape') {
      suggestionsDiv.classList.remove('show');
    }
  });

  input.addEventListener('blur', function() {
    setTimeout(() => {
      suggestionsDiv.classList.remove('show');
    }, 200);
  });

  input.addEventListener('focus', function() {
    if (this.value) {
      updateSuggestions(this.value);
    }
  });

  function selectPatientFromHistory(item, formId) {
    const patientEntries = allEntries.filter(entry =>
      entry.patientName === item.name
    );

    if (patientEntries.length === 0) return;

    patientEntries.sort((a, b) => {
      const dateA = a.visitDate || '1970-01-01';
      const timeA = a.visitTime || '00:00';
      const dateB = b.visitDate || '1970-01-01';
      const timeB = b.visitTime || '00:00';
      const dtA = new Date(dateA + 'T' + timeA + ':00');
      const dtB = new Date(dateB + 'T' + timeB + ':00');
      return dtB - dtA;
    });

    const mostRecent = patientEntries[0];
    populatePatientDetails(formId, mostRecent);
    suggestionsDiv.classList.remove('show');
    toast('Patient details loaded from previous visit.', 'success');
    updateSectionProgressBars(formId);
  }
}

function populatePatientDetails(formId, data) {
  const nameInput = document.getElementById(`patientName-${formId}`);
  if (nameInput) nameInput.value = data.patientName || '';

  const ageInput = document.getElementById(`patientAge-${formId}`);
  if (ageInput) ageInput.value = data.age || '';

  const genderInput = document.getElementById(`patientGender-${formId}`);
  if (genderInput) genderInput.value = data.gender || '';

  const addressInput = document.getElementById(`patientAddress-${formId}`);
  if (addressInput) addressInput.value = data.address || '';

  const doctorInput = document.getElementById(`patientDoctor-${formId}`);
  if (doctorInput) doctorInput.value = data.doctorName || '';

  const careInput = document.getElementById(`patientCareOf-${formId}`);
  if (careInput) careInput.value = data.careOfPerson || '';

  const additionalInput = document.getElementById(`patientAdditionalInfo-${formId}`);
  if (additionalInput) additionalInput.value = data.additionalInformation || '';

  if (data.contacts && Array.isArray(data.contacts)) {
    populateContacts(formId, data.contacts);
  } else {
    populateContacts(formId, []);
  }

  updatePaymentFields(formId);
  updateSectionProgressBars(formId);
}

// ============================================================
//  AUTOCOMPLETE FUNCTIONALITY
// ============================================================
function setupAutocomplete(inputId, suggestions, formId) {
  const input = document.getElementById(inputId + '-' + formId);
  if (!input) return;

  const wrapper = document.createElement('div');
  wrapper.className = 'autocomplete-wrapper';
  input.parentNode.insertBefore(wrapper, input);
  wrapper.appendChild(input);

  const suggestionsDiv = document.createElement('div');
  suggestionsDiv.className = 'autocomplete-suggestions';
  suggestionsDiv.id = 'suggestions-' + inputId + '-' + formId;
  wrapper.appendChild(suggestionsDiv);

  let activeIndex = -1;
  let filteredSuggestions = [];

  function updateSuggestions(value) {
    if (!value || value.length < 1) {
      suggestionsDiv.classList.remove('show');
      return;
    }

    const query = value.toLowerCase();
    filteredSuggestions = suggestions.filter(s =>
      s.toLowerCase().includes(query)
    );

    if (filteredSuggestions.length === 0) {
      suggestionsDiv.classList.remove('show');
      return;
    }

    suggestionsDiv.innerHTML = filteredSuggestions.map((s, index) =>
      `<div class="suggestion-item" data-index="${index}">${s}</div>`
    ).join('');
    suggestionsDiv.classList.add('show');
    activeIndex = -1;

    suggestionsDiv.querySelectorAll('.suggestion-item').forEach(item => {
      item.addEventListener('click', function() {
        const selected = filteredSuggestions[parseInt(this.dataset.index)];
        if (selected) {
          input.value = selected;
          suggestionsDiv.classList.remove('show');
          input.dispatchEvent(new Event('blur'));
          updateSectionProgressBars(formId);
        }
      });
    });
  }

  input.addEventListener('input', function(e) {
    updateSuggestions(this.value);
  });

  input.addEventListener('keydown', function(e) {
    const items = suggestionsDiv.querySelectorAll('.suggestion-item');
    if (items.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      activeIndex = Math.min(activeIndex + 1, items.length - 1);
      items.forEach((item, idx) => {
        item.classList.toggle('active', idx === activeIndex);
      });
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      activeIndex = Math.max(activeIndex - 1, 0);
      items.forEach((item, idx) => {
        item.classList.toggle('active', idx === activeIndex);
      });
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIndex >= 0 && activeIndex < items.length) {
        items[activeIndex].click();
      }
    } else if (e.key === 'Escape') {
      suggestionsDiv.classList.remove('show');
    }
  });

  input.addEventListener('blur', function() {
    setTimeout(() => {
      suggestionsDiv.classList.remove('show');
    }, 200);
  });

  input.addEventListener('focus', function() {
    if (this.value) updateSuggestions(this.value);
  });

  return wrapper;
}

// ============================================================
//  CONTACT PERSON MANAGEMENT
// ============================================================
function addContactRow(formId, data = null) {
  const container = document.getElementById('contacts-container-' + formId);
  if (!container) return;

  const rowCount = container.querySelectorAll('.contact-row').length;
  const row = document.createElement('div');
  row.className = 'contact-row';

  const nameValue = data && data.name ? data.name : '';
  const numberValue = data && data.number ? data.number : '';

  row.innerHTML = `
    <div class="field-group">
      <label>Contact Person Name</label>
      <input type="text" id="contactName-${formId}-${rowCount}" placeholder="Enter name" value="${nameValue}" />
    </div>
    <div class="field-group">
      <label>Contact Number</label>
      <input type="tel" id="contactNumber-${formId}-${rowCount}" placeholder="Enter 10-digit number" value="${numberValue}" />
    </div>
    <button class="remove-contact-btn" data-form="${formId}" data-index="${rowCount}">✕ Remove</button>
  `;

  container.appendChild(row);

  const nameInput = row.querySelector('input[id^="contactName-"]');
  if (nameInput) {
    nameInput.addEventListener('blur', function() {
      this.value = formatName(this.value);
      validateContactName(this);
      updateSectionProgressBars(formId);
    });
    nameInput.addEventListener('input', function() {
      updateSectionProgressBars(formId);
    });
  }

  const numberInput = row.querySelector('input[id^="contactNumber-"]');
  if (numberInput) {
    numberInput.addEventListener('blur', function() {
      validateContactNumber(this);
      updateSectionProgressBars(formId);
    });
    numberInput.addEventListener('input', function() {
      updateSectionProgressBars(formId);
      const errorEl = document.getElementById(this.id.replace('contactNumber', 'contactNumberError'));
      if (errorEl) {
        errorEl.classList.remove('show');
        this.classList.remove('input-error');
      }
    });
  }

  const removeBtn = row.querySelector('.remove-contact-btn');
  if (removeBtn) {
    removeBtn.addEventListener('click', function() {
      const formId = this.dataset.form;
      removeContactRow(formId, this.dataset.index);
    });
  }

  updateRemoveButtons(formId);
}

function removeContactRow(formId, index) {
  const container = document.getElementById('contacts-container-' + formId);
  if (!container) return;

  const rows = container.querySelectorAll('.contact-row');
  if (rows.length <= 1) {
    toast('At least one contact person is required.', 'error');
    return;
  }

  const rowToRemove = Array.from(rows).find(row => {
    const btn = row.querySelector('.remove-contact-btn');
    return btn && btn.dataset.index === index;
  });

  if (rowToRemove) {
    rowToRemove.remove();
    updateRemoveButtons(formId);
    updateSectionProgressBars(formId);
  }
}

function updateRemoveButtons(formId) {
  const container = document.getElementById('contacts-container-' + formId);
  if (!container) return;

  const rows = container.querySelectorAll('.contact-row');
  const removeBtns = container.querySelectorAll('.remove-contact-btn');

  removeBtns.forEach(btn => {
    btn.disabled = rows.length <= 1;
  });
}

function validateContactName(input) {
  const errorEl = document.getElementById(input.id.replace('contactName', 'contactNameError'));
  if (!errorEl) return;

  if (input.value.trim().length === 0) {
    errorEl.classList.add('show');
    input.classList.add('input-error');
    return false;
  } else {
    errorEl.classList.remove('show');
    input.classList.remove('input-error');
    return true;
  }
}

function validateContactNumber(input) {
  const errorEl = document.getElementById(input.id.replace('contactNumber', 'contactNumberError'));
  if (!errorEl) return;

  const value = input.value.trim();
  if (value.length > 0 && value.length < 10) {
    errorEl.textContent = 'Please enter a valid 10-digit number';
    errorEl.classList.add('show');
    input.classList.add('input-error');
    return false;
  } else if (value.length === 10 && /^\d+$/.test(value)) {
    errorEl.classList.remove('show');
    input.classList.remove('input-error');
    return true;
  } else if (value.length > 0 && value.length !== 10) {
    errorEl.textContent = 'Please enter exactly 10 digits';
    errorEl.classList.add('show');
    input.classList.add('input-error');
    return false;
  } else {
    errorEl.classList.remove('show');
    input.classList.remove('input-error');
    return true;
  }
}

function getContactsData(formId) {
  const container = document.getElementById('contacts-container-' + formId);
  if (!container) return [];

  const rows = container.querySelectorAll('.contact-row');
  const contacts = [];

  rows.forEach(row => {
    const nameInput = row.querySelector('input[id^="contactName-"]');
    const numberInput = row.querySelector('input[id^="contactNumber-"]');

    if (nameInput && numberInput) {
      const name = nameInput.value.trim();
      const number = numberInput.value.trim();
      if (name || number) {
        contacts.push({ name, number });
      }
    }
  });

  return contacts;
}

function populateContacts(formId, contacts) {
  const container = document.getElementById('contacts-container-' + formId);
  if (!container) return;

  container.innerHTML = '';

  if (!contacts || contacts.length === 0) {
    addContactRow(formId);
    return;
  }

  contacts.forEach(contact => {
    addContactRow(formId, contact);
  });
}

// ============================================================
//  TEST DETAILS FUNCTIONS (per-form)
// ============================================================
function renderLabContent(labId, formId) {
  const container = document.getElementById(`lab-content-${labId}-${formId}`);
  if (!container) {
    return;
  }

  const labData = LAB_DATA[labId];
  if (!labData) {
    container.innerHTML = `<div class="empty-state">No data available for this laboratory.</div>`;
    return;
  }

  const state = getFormState(formId);
  if (!state.selectedLabData[labId]) {
    state.selectedLabData[labId] = { tests: [], packages: [] };
  }

  const selection = state.selectedLabData[labId];

  if (!selection.tests) selection.tests = [];
  if (!selection.packages) selection.packages = [];

  const allItems = [];

  if (labData.tests && Array.isArray(labData.tests)) {
    labData.tests.forEach(t => {
      allItems.push({ ...t, type: 'test' });
    });
  }

  if (labData.packages && Array.isArray(labData.packages)) {
    labData.packages.forEach(p => {
      allItems.push({ ...p, type: 'package' });
    });
  }

  const filteredItems = allItems.filter(item => {
    if (item.type === 'test') {
      if (state.globalSelectedTestIds.has(item.id)) {
        return false;
      }
      return true;
    }
    return true;
  });

  let html = `
    <div class="search-container">
      <input type="text" id="searchInput-${labId}-${formId}" placeholder="Search tests or packages..." autocomplete="off" />
      <div class="search-suggestions" id="suggestions-${labId}-${formId}"></div>
    </div>
    <div class="selected-items-section">
      <h4>Selected Tests</h4>
      <div id="selectedTests-${labId}-${formId}">
  `;

  if (selection.tests && selection.tests.length > 0) {
    selection.tests.forEach(test => {
      html += `
        <div class="selected-test-item" data-test-id="${test.id}">
          <div class="test-info">
            <div class="test-name">${test.generalName}</div>
            <div class="test-lab-name">${test.labName}</div>
          </div>
          <div class="test-price">₹${test.mrp}</div>
          <button class="remove-item-btn" data-lab="${labId}" data-type="test" data-id="${test.id}" data-form="${formId}">✕</button>
        </div>
      `;
    });
  } else {
    html += `<div class="empty-state">No tests selected yet.</div>`;
  }

  html += `
      </div>
    </div>
    <div class="selected-items-section" style="margin-top: 16px;">
      <h4>Selected Packages</h4>
      <div id="selectedPackages-${labId}-${formId}">
  `;

  if (selection.packages && selection.packages.length > 0) {
    selection.packages.forEach(pkg => {
      html += `
        <div class="selected-package-card" data-package-id="${pkg.id}">
          <div class="package-header">
            <span class="package-name">${pkg.packageName}</span>
            <span class="package-price">₹${pkg.mrp}</span>
          </div>
          <div class="package-tests">
      `;

      if (pkg.tests && Array.isArray(pkg.tests)) {
        pkg.tests.forEach((test, index) => {
          const isChecked = test.selected !== false;
          html += `
            <div class="package-test-item">
              <input type="checkbox" id="pkg-${labId}-${pkg.id}-${index}-${formId}" 
                     data-lab="${labId}" data-package-id="${pkg.id}" data-test-index="${index}" 
                     data-form="${formId}" ${isChecked ? 'checked' : ''} />
              <label for="pkg-${labId}-${pkg.id}-${index}-${formId}" class="test-label">
                <span class="general-name">${test.generalName}</span>
                <span class="lab-name">${test.labName}</span>
              </label>
            </div>
          `;
        });
      }

      html += `
          </div>
          <div class="package-actions">
            <button class="package-remove-btn" data-lab="${labId}" data-package-id="${pkg.id}" data-form="${formId}">Remove Package</button>
          </div>
        </div>
      `;
    });
  } else {
    html += `<div class="empty-state">No packages selected yet.</div>`;
  }

  html += `
      </div>
    </div>
  `;

  container.innerHTML = html;

  setupSearch(labId, formId, filteredItems);

  container.querySelectorAll('.remove-item-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const lab = parseInt(this.dataset.lab);
      const type = this.dataset.type;
      const id = this.dataset.id;
      const formId = this.dataset.form;
      removeSelectedItem(lab, type, id, formId);
    });
  });

  container.querySelectorAll('.package-test-item input[type="checkbox"]').forEach(cb => {
    cb.addEventListener('change', function() {
      const lab = parseInt(this.dataset.lab);
      const packageId = this.dataset.packageId;
      const testIndex = parseInt(this.dataset.testIndex);
      const formId = this.dataset.form;
      updatePackageTestSelection(lab, packageId, testIndex, this.checked, formId);
    });
  });

  container.querySelectorAll('.package-remove-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const lab = parseInt(this.dataset.lab);
      const packageId = this.dataset.packageId;
      const formId = this.dataset.form;
      removePackage(lab, packageId, formId);
    });
  });
}

function setupSearch(labId, formId, allItems) {
  const searchInput = document.getElementById(`searchInput-${labId}-${formId}`);
  const suggestionsDiv = document.getElementById(`suggestions-${labId}-${formId}`);
  if (!searchInput || !suggestionsDiv) {
    return;
  }

  let activeIndex = -1;
  let filteredItems = [];

  function updateSuggestions(value) {
    const query = (value || '').toLowerCase().trim();

    if (!query || query.length < 1) {
      suggestionsDiv.classList.remove('show');
      suggestionsDiv.innerHTML = '';
      return;
    }

    filteredItems = allItems.filter(item => {
      const searchText = (item.generalName || item.packageName || '').toLowerCase() +
        ' ' + (item.labName || '').toLowerCase();
      return searchText.includes(query);
    });

    if (filteredItems.length === 0) {
      suggestionsDiv.classList.remove('show');
      suggestionsDiv.innerHTML = '<div class="suggestion-item" style="color:var(--text-light);">No results found</div>';
      return;
    }

    let html = '';
    filteredItems.forEach((item, index) => {
      const typeLabel = item.type === 'test' ? 'TEST' : 'PACKAGE';
      const name = item.generalName || item.packageName;
      const detail = item.type === 'test' ? item.labName : `${item.tests ? item.tests.length : 0} Tests`;
      const price = item.mrp;
      
      const lowerName = name.toLowerCase();
      const queryLower = query.toLowerCase();
      const startIdx = lowerName.indexOf(queryLower);
      let displayName = name;
      if (startIdx !== -1) {
        const before = name.substring(0, startIdx);
        const match = name.substring(startIdx, startIdx + query.length);
        const after = name.substring(startIdx + query.length);
        displayName = `${before}<span class="highlight">${match}</span>${after}`;
      }

      html += `
        <div class="suggestion-item" data-index="${index}">
          <div class="suggestion-type">${typeLabel}</div>
          <div>
            <span class="suggestion-name">${displayName}</span>
            <span class="suggestion-price">₹${price}</span>
          </div>
          <div class="suggestion-detail">${detail}</div>
        </div>
      `;
    });

    suggestionsDiv.innerHTML = html;
    suggestionsDiv.classList.add('show');
    activeIndex = -1;

    suggestionsDiv.querySelectorAll('.suggestion-item').forEach(item => {
      item.addEventListener('click', function() {
        const selected = filteredItems[parseInt(this.dataset.index)];
        if (selected) {
          selectItem(labId, selected, formId);
          searchInput.value = '';
          suggestionsDiv.classList.remove('show');
          searchInput.focus();
        }
      });
    });
  }

  searchInput.addEventListener('input', function(e) {
    const value = this.value;
    updateSuggestions(value);
  });

  searchInput.addEventListener('keydown', function(e) {
    const items = suggestionsDiv.querySelectorAll('.suggestion-item');
    if (items.length === 0 || !suggestionsDiv.classList.contains('show')) {
      if (e.key === 'Enter' && this.value.trim()) {
        const matchingItems = allItems.filter(item => {
          const searchText = (item.generalName || item.packageName || '').toLowerCase();
          return searchText.includes(this.value.toLowerCase().trim());
        });
        if (matchingItems.length > 0) {
          selectItem(labId, matchingItems[0], formId);
          this.value = '';
          suggestionsDiv.classList.remove('show');
        }
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      activeIndex = Math.min(activeIndex + 1, items.length - 1);
      items.forEach((item, idx) => {
        item.classList.toggle('active', idx === activeIndex);
      });
      if (activeIndex >= 0) {
        items[activeIndex].scrollIntoView({ block: 'nearest' });
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      activeIndex = Math.max(activeIndex - 1, 0);
      items.forEach((item, idx) => {
        item.classList.toggle('active', idx === activeIndex);
      });
      if (activeIndex >= 0) {
        items[activeIndex].scrollIntoView({ block: 'nearest' });
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIndex >= 0 && activeIndex < items.length) {
        const selected = filteredItems[activeIndex];
        if (selected) {
          selectItem(labId, selected, formId);
          searchInput.value = '';
          suggestionsDiv.classList.remove('show');
          searchInput.focus();
        }
      } else if (this.value.trim()) {
        const matchingItems = allItems.filter(item => {
          const searchText = (item.generalName || item.packageName || '').toLowerCase();
          return searchText.includes(this.value.toLowerCase().trim());
        });
        if (matchingItems.length > 0) {
          selectItem(labId, matchingItems[0], formId);
          this.value = '';
          suggestionsDiv.classList.remove('show');
        }
      }
    } else if (e.key === 'Escape') {
      suggestionsDiv.classList.remove('show');
      searchInput.blur();
    }
  });

  searchInput.addEventListener('blur', function() {
    setTimeout(() => {
      suggestionsDiv.classList.remove('show');
    }, 200);
  });

  searchInput.addEventListener('focus', function() {
    if (this.value) {
      updateSuggestions(this.value);
    }
  });

  searchInput._updateSuggestions = updateSuggestions;
}

function selectItem(labId, item, formId) {
  const state = getFormState(formId);
  if (!state.selectedLabData[labId]) {
    state.selectedLabData[labId] = { tests: [], packages: [] };
  }

  const selection = state.selectedLabData[labId];

  if (item.type === 'test') {
    if (state.globalSelectedTestIds.has(item.id)) {
      toast('Test is already selected in another lab or package.', 'error');
      refocusSearch(labId, formId);
      return;
    }

    if (selection.tests.some(t => t.id === item.id)) {
      toast('Test already selected.', 'error');
      refocusSearch(labId, formId);
      return;
    }

    selection.tests.push({
      id: item.id,
      generalName: item.generalName,
      labName: item.labName,
      mrp: item.mrp,
      b2b: item.b2b
    });

    toast('Test added successfully.', 'success');
    recalculateGlobalSelectedTests(formId);
    renderLabContent(labId, formId);
    refocusSearch(labId, formId);
    updatePaymentFields(formId);
    updateSectionProgressBars(formId);

  } else if (item.type === 'package') {
    if (selection.packages.some(p => p.id === item.id)) {
      toast('Package already selected.', 'error');
      refocusSearch(labId, formId);
      return;
    }

    const packageTestIds = item.tests.map(t => t.generalName);
    const testsToRemove = [];

    for (let lab = 1; lab <= 4; lab++) {
      const labSelection = state.selectedLabData[lab];
      if (labSelection && labSelection.tests) {
        labSelection.tests = labSelection.tests.filter(test => {
          if (packageTestIds.includes(test.generalName)) {
            testsToRemove.push({ labId: lab, testId: test.id, generalName: test.generalName });
            return false;
          }
          return true;
        });
      }
    }

    if (testsToRemove.length > 0) {
      toast(`Removed ${testsToRemove.length} individually selected test(s) covered by this package.`, 'success');
    }

    const packageTests = item.tests.map(t => {
      const labTestData = LAB_DATA[labId];
      let testId = t.generalName;
      if (labTestData && labTestData.tests) {
        const matchingTest = labTestData.tests.find(test => test.generalName === t.generalName);
        if (matchingTest) {
          testId = matchingTest.id;
        }
      }
      return { ...t, id: testId, selected: true };
    });

    selection.packages.push({
      id: item.id,
      packageName: item.packageName,
      mrp: item.mrp,
      b2b: item.b2b,
      tests: packageTests
    });

    toast('Package added successfully.', 'success');
    recalculateGlobalSelectedTests(formId);
    renderLabContent(labId, formId);
    refocusSearch(labId, formId);
    updatePaymentFields(formId);
    updateSectionProgressBars(formId);
  }
}

function refocusSearch(labId, formId) {
  const searchInput = document.getElementById(`searchInput-${labId}-${formId}`);
  if (searchInput) {
    setTimeout(() => {
      searchInput.focus();
      searchInput.select();
    }, 50);
  }
}

function removeSelectedItem(labId, type, id, formId) {
  const state = getFormState(formId);
  const selection = state.selectedLabData[labId];
  if (!selection) return;

  if (type === 'test') {
    selection.tests = selection.tests.filter(t => t.id !== id);
    toast('Test removed.', 'success');
    recalculateGlobalSelectedTests(formId);
    renderLabContent(labId, formId);
    refocusSearch(labId, formId);
    updatePaymentFields(formId);
    updateSectionProgressBars(formId);
  }
}

function updatePackageTestSelection(labId, packageId, testIndex, checked, formId) {
  const state = getFormState(formId);
  const selection = state.selectedLabData[labId];
  if (!selection) return;

  const pkg = selection.packages.find(p => p.id === packageId);
  if (pkg && pkg.tests && pkg.tests[testIndex]) {
    pkg.tests[testIndex].selected = checked;
    recalculateGlobalSelectedTests(formId);
    renderLabContent(labId, formId);
    refocusSearch(labId, formId);
    updatePaymentFields(formId);
    updateSectionProgressBars(formId);
  }
}

function removePackage(labId, packageId, formId) {
  const state = getFormState(formId);
  const selection = state.selectedLabData[labId];
  if (!selection) return;

  selection.packages = selection.packages.filter(p => p.id !== packageId);
  toast('Package removed.', 'success');
  recalculateGlobalSelectedTests(formId);
  renderLabContent(labId, formId);
  refocusSearch(labId, formId);
  updatePaymentFields(formId);
  updateSectionProgressBars(formId);
}

function switchLab(labId, formId) {
  const state = getFormState(formId);
  state.activeLabId = labId;

  const tabs = document.querySelectorAll(`#labTabs-${formId} .lab-tab`);
  tabs.forEach(tab => {
    const id = parseInt(tab.dataset.lab);
    const color = LAB_COLORS[id];
    tab.classList.toggle('active', id === labId);
    if (id === labId) {
      tab.style.borderBottomColor = color.border;
      tab.style.color = color.text;
      tab.style.fontWeight = '600';
      tab.style.background = 'white';
    } else {
      tab.style.borderBottomColor = 'transparent';
      tab.style.color = color.text;
      tab.style.fontWeight = '500';
      tab.style.background = 'transparent';
    }
  });

  const contents = document.querySelectorAll(`#labContent-${formId} .lab-content-wrapper`);
  contents.forEach(content => {
    const id = parseInt(content.dataset.lab);
    const color = LAB_COLORS[id];
    content.classList.toggle('active', id === labId);
    if (id === labId) {
      content.style.background = color.bg;
      content.style.border = `1px solid ${color.border}`;
      content.style.borderTop = 'none';
      content.style.borderRadius = '0 0 var(--radius-sm) var(--radius-sm)';
    } else {
      content.style.background = '';
      content.style.border = '';
      content.style.borderRadius = '';
    }
  });

  renderLabContent(labId, formId);
  refocusSearch(labId, formId);
}

// ============================================================
//  FORM FUNCTIONS
// ============================================================
function getFormId(panelId) {
  return panelId.replace('panel-', '');
}

function getPanelId(formId) {
  return 'panel-' + formId;
}

function getFieldId(fieldName, formId) {
  return fieldName + '-' + formId;
}

function getFieldValue(fieldName, formId) {
  const el = document.getElementById(getFieldId(fieldName, formId));
  return el ? el.value : '';
}

function setFieldValue(fieldName, formId, value) {
  const el = document.getElementById(getFieldId(fieldName, formId));
  if (el) el.value = value || '';
}

function getCheckboxValue(fieldName, formId) {
  const el = document.getElementById(getFieldId(fieldName, formId));
  return el ? el.checked : false;
}

function setCheckboxValue(fieldName, formId, value) {
  const el = document.getElementById(getFieldId(fieldName, formId));
  if (el) el.checked = value || false;
}

function gatherFormData(formId) {
  const state = getFormState(formId);
  
  const patientData = {
    patientName: getFieldValue('patientName', formId),
    age: getFieldValue('patientAge', formId),
    gender: getFieldValue('patientGender', formId),
    contacts: getContactsData(formId),
    address: getFieldValue('patientAddress', formId),
    doctorName: getFieldValue('patientDoctor', formId),
    careOfPerson: getFieldValue('patientCareOf', formId),
    additionalInformation: getFieldValue('patientAdditionalInfo', formId),
  };

  const visitData = {
    center: getFieldValue('visitCenter', formId),
    visitType: getFieldValue('visitType', formId),
    visitDate: getFieldValue('visitDate', formId),
    visitTime: getFieldValue('visitTime', formId),
    phlebotomist: getFieldValue('visitPhlebotomist', formId),
    ppTime: getFieldValue('visitPPTime', formId),
    ppPhlebotomist: getFieldValue('visitPPPhlebotomist', formId),
  };

  const reportData = {
    onlineReportRequired: getCheckboxValue('reportOnlineRequired', formId),
    reportDeliveryRequired: getCheckboxValue('reportDeliveryRequired', formId),
    billDeliveryRequired: getCheckboxValue('reportBillDeliveryRequired', formId),
    reportsReceived: { ...state.reportsReceived },
    onlineReportSent: getCheckboxValue('reportOnlineSent', formId),
    reportDelivered: getCheckboxValue('reportDelivered', formId),
    billDelivered: getCheckboxValue('reportBillDelivered', formId),
  };

  const testData = {
    labSelections: JSON.parse(JSON.stringify(state.selectedLabData))
  };

  const paymentData = {
    totalMRP: calculateTotalMRP(formId),
    totalB2B: calculateTotalB2B(formId),
    finalPrice: parseCurrency(getFieldValue('paymentFinalPrice', formId)),
    cashReceived: parseCurrency(getFieldValue('paymentCash', formId)),
    onlineReceived: parseCurrency(getFieldValue('paymentOnline', formId)),
    pendingPayment: parseCurrency(getFieldValue('paymentPending', formId)),
    goodwillCharges: parseCurrency(getFieldValue('paymentGoodwill', formId)),
  };

  return { ...patientData, ...visitData, ...reportData, ...testData, ...paymentData };
}

function populateForm(formId, data) {
  if (!data) return;

  const state = getFormState(formId);

  setFieldValue('patientName', formId, data.patientName || '');
  setFieldValue('patientAge', formId, data.age || '');
  setFieldValue('patientGender', formId, data.gender || '');
  setFieldValue('patientAddress', formId, data.address || '');
  setFieldValue('patientDoctor', formId, data.doctorName || '');
  setFieldValue('patientCareOf', formId, data.careOfPerson || '');
  setFieldValue('patientAdditionalInfo', formId, data.additionalInformation || '');

  if (data.contacts && Array.isArray(data.contacts)) {
    populateContacts(formId, data.contacts);
  } else {
    populateContacts(formId, []);
  }

  setFieldValue('visitCenter', formId, data.center || '');
  setFieldValue('visitType', formId, data.visitType || '');
  setFieldValue('visitDate', formId, data.visitDate || '');
  setFieldValue('visitTime', formId, data.visitTime || '');
  setFieldValue('visitPhlebotomist', formId, data.phlebotomist || '');
  setFieldValue('visitPPTime', formId, data.ppTime || '');
  setFieldValue('visitPPPhlebotomist', formId, data.ppPhlebotomist || '');

  setCheckboxValue('reportOnlineRequired', formId, data.onlineReportRequired || false);
  setCheckboxValue('reportDeliveryRequired', formId, data.reportDeliveryRequired || false);
  setCheckboxValue('reportBillDeliveryRequired', formId, data.billDeliveryRequired || false);

  setCheckboxValue('reportOnlineSent', formId, data.onlineReportSent || false);
  setCheckboxValue('reportDelivered', formId, data.reportDelivered || false);
  setCheckboxValue('reportBillDelivered', formId, data.billDelivered || false);

  // Restore reportsReceived from saved data
  if (data.reportsReceived) {
    state.reportsReceived = { ...data.reportsReceived };
  } else {
    state.reportsReceived = {};
  }

  setFieldValue('paymentFinalPrice', formId, data.finalPrice ? data.finalPrice.toString() : '');
  setFieldValue('paymentCash', formId, data.cashReceived ? data.cashReceived.toString() : '');
  setFieldValue('paymentOnline', formId, data.onlineReceived ? data.onlineReceived.toString() : '');
  setFieldValue('paymentGoodwill', formId, data.goodwillCharges ? data.goodwillCharges.toString() : '');

  // Restore lab selections
  // ARCHITECTURE FIX: build a normalized copy instead of writing defaults
  // directly onto `data.labSelections`. `data` may still be a reference
  // shared with other callers (e.g. patient-history autocomplete uses the
  // same cached entry objects), so this function must never mutate its
  // input — only `state` (this form's own isolated state) should change.
  if (data.labSelections) {
    const normalizedLabSelections = {};
    for (let labId = 1; labId <= 4; labId++) {
      const labSel = data.labSelections[labId] || {};
      normalizedLabSelections[labId] = {
        tests: labSel.tests || [],
        packages: labSel.packages || []
      };
    }
    state.selectedLabData = JSON.parse(JSON.stringify(normalizedLabSelections));
    recalculateGlobalSelectedTests(formId);
  }

  updatePPSection(formId);
  updateReportReceivedList(formId);
  updateDeliveryStatusVisibility(formId);
  updatePaymentFields(formId);
  updateSectionProgressBars(formId);
}

// ============================================================
//  CREATE SECTION NAV BUTTONS WITH PROGRESS
// ============================================================
function createSectionNavButtons(formId) {
  const sections = [
    { id: 'patient', label: 'Patient Details' },
    { id: 'test', label: 'Test Details' },
    { id: 'visit', label: 'Visit Details' },
    { id: 'report', label: 'Report Details' },
    { id: 'payment', label: 'Payment Details' }
  ];

  let html = '';
  sections.forEach((section, index) => {
    const isActive = index === 0;
    html += `
      <button class="section-nav-btn ${isActive ? 'active-section' : ''}" data-section="${section.id}" data-form="${formId}">
        <div class="btn-top">
          <span>${section.label}</span>
          <span class="progress-label">0%</span>
        </div>
        <div class="progress-track">
          <div class="progress-fill" style="width: 0%;"></div>
        </div>
      </button>
    `;
  });

  return html;
}

function setupFormNavigation(formId) {
  const panel = document.getElementById(getPanelId(formId));
  if (!panel) return;

  const navBtns = panel.querySelectorAll('.section-nav-btn');
  const sections = panel.querySelectorAll('.section-content .form-section');

  navBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      navBtns.forEach(b => b.classList.remove('active-section'));
      this.classList.add('active-section');
      sections.forEach(s => s.classList.remove('active-section-content'));
      const target = panel.querySelector('.form-section[data-section="' + this.dataset.section + '"]');
      if (target) target.classList.add('active-section-content');

      if (this.dataset.section === 'test') {
        recalculateGlobalSelectedTests(formId);
        for (let labId = 1; labId <= 4; labId++) {
          renderLabContent(labId, formId);
        }
        const state = getFormState(formId);
        refocusSearch(state.activeLabId, formId);
      }

      if (this.dataset.section === 'visit') {
        updatePPSection(formId);
      }

      if (this.dataset.section === 'report') {
        updateReportReceivedList(formId);
        updateDeliveryStatusVisibility(formId);
      }

      if (this.dataset.section === 'payment') {
        updatePaymentFields(formId);
      }

      updateSectionProgressBars(formId);
    });
  });
}

// ============================================================
//  CREATE PATIENT DETAILS HTML
// ============================================================
function createPatientDetailsHTML(formId) {
  return `
    <div class="patient-details-grid">
      <div>
        <label class="field-label">Patient Name *</label>
        <input type="text" id="patientName-${formId}" placeholder="Enter patient name" autocomplete="off" />
        <div id="patientSuggestions-${formId}" class="patient-autocomplete-suggestions"></div>
      </div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
        <div>
          <label class="field-label">Age</label>
          <input type="number" id="patientAge-${formId}" placeholder="Age" min="0" max="150" />
        </div>
        <div>
          <label class="field-label">Gender</label>
          <select id="patientGender-${formId}">
            <option value="">Select</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      <div>
        <label class="field-label">Dr. Name</label>
        <div class="autocomplete-wrapper">
          <input type="text" id="patientDoctor-${formId}" placeholder="Start typing doctor name..." />
          <div class="autocomplete-suggestions" id="suggestions-patientDoctor-${formId}"></div>
        </div>
      </div>
      <div>
        <label class="field-label">Care of Person</label>
        <div class="autocomplete-wrapper">
          <input type="text" id="patientCareOf-${formId}" placeholder="Start typing name or 'None'..." />
          <div class="autocomplete-suggestions" id="suggestions-patientCareOf-${formId}"></div>
        </div>
      </div>

      <div class="full-width contact-section">
        <div class="contact-header">
          <label class="field-label">Contact Person Details</label>
          <button class="add-contact-btn" id="addContact-${formId}">+ Add Contact</button>
        </div>
        <div id="contacts-container-${formId}"></div>
      </div>

      <div class="full-width">
        <label class="field-label">Address</label>
        <textarea id="patientAddress-${formId}" rows="3" placeholder="Enter complete address..."></textarea>
      </div>

      <div class="full-width">
        <label class="field-label">Additional Information</label>
        <textarea id="patientAdditionalInfo-${formId}" rows="4" placeholder="Any additional information..."></textarea>
      </div>
    </div>
  `;
}

// ============================================================
//  CREATE VISIT DETAILS HTML
// ============================================================
function createVisitDetailsHTML(formId) {
  return `
    <div class="visit-details-grid">
      <div>
        <label class="field-label">Center</label>
        <select id="visitCenter-${formId}">
          <option value="">Select Center</option>
          <option value="Borivali">Borivali</option>
          <option value="Charkop">Charkop</option>
        </select>
      </div>
      <div>
        <label class="field-label">Visit Type</label>
        <select id="visitType-${formId}">
          <option value="">Select Visit Type</option>
          <option value="Home Visit">Home Visit</option>
          <option value="Center Visit">Center Visit</option>
        </select>
      </div>
      <div>
        <label class="field-label">Visit Date</label>
        <input type="date" id="visitDate-${formId}" />
      </div>

      <div>
        <label class="field-label">Visit Time</label>
        <input type="time" id="visitTime-${formId}" step="60" />
      </div>
      <div class="span-2">
        <label class="field-label">Assigned Phlebotomist</label>
        <div class="autocomplete-wrapper">
          <input type="text" id="visitPhlebotomist-${formId}" placeholder="Type phlebotomist name..." />
          <div class="autocomplete-suggestions" id="suggestions-visitPhlebotomist-${formId}"></div>
        </div>
      </div>

      <div class="pp-section" id="ppSection-${formId}">
        <div class="pp-label">— PP Schedule —</div>
        <div class="pp-grid">
          <div>
            <label class="field-label">PP Time</label>
            <input type="time" id="visitPPTime-${formId}" step="60" />
          </div>
          <div>
            <label class="field-label">PP Phlebotomist</label>
            <div class="autocomplete-wrapper">
              <input type="text" id="visitPPPhlebotomist-${formId}" placeholder="Type phlebotomist name..." />
              <div class="autocomplete-suggestions" id="suggestions-visitPPPhlebotomist-${formId}"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

// ============================================================
//  CREATE TEST DETAILS HTML
// ============================================================
function createTestDetailsHTML(formId) {
  let html = `
    <div class="test-details-container">
      <div id="labTabs-${formId}" class="lab-tabs-wrapper">
  `;

  for (let labId = 1; labId <= 4; labId++) {
    const color = LAB_COLORS[labId];
    const isActive = labId === 1;
    html += `
      <button class="lab-tab ${isActive ? 'active' : ''}" 
              data-lab="${labId}" 
              data-form="${formId}"
              style="${isActive ? `border-bottom-color: ${color.border}; color: ${color.text}; font-weight: 600; background: white;` : `color: ${color.text}; background: transparent;`}">
        ${color.name}
      </button>
    `;
  }

  html += `
      </div>
      <div id="labContent-${formId}">
  `;

  for (let labId = 1; labId <= 4; labId++) {
    const isActive = labId === 1;
    const color = LAB_COLORS[labId];
    html += `
      <div class="lab-content-wrapper ${isActive ? 'active' : ''}" 
           data-lab="${labId}" 
           data-form="${formId}"
           style="${isActive ? `background: ${color.bg}; border: 1px solid ${color.border}; border-top: none; border-radius: 0 0 var(--radius-sm) var(--radius-sm);` : ''}">
        <div id="lab-content-${labId}-${formId}"></div>
      </div>
    `;
  }

  html += `
      </div>
    </div>
  `;

  return html;
}

// ============================================================
//  CREATE REPORT DETAILS HTML
// ============================================================
function createReportDetailsHTML(formId) {
  return `
    <div class="report-details-container">
      <div class="report-section">
        <div class="report-section-title">Report Requirements</div>
        <div class="checkbox-row">
          <div class="checkbox-item">
            <input type="checkbox" id="reportOnlineRequired-${formId}" />
            <label for="reportOnlineRequired-${formId}">Online Report Required</label>
          </div>
          <div class="checkbox-item">
            <input type="checkbox" id="reportDeliveryRequired-${formId}" />
            <label for="reportDeliveryRequired-${formId}">Report Delivery Required</label>
          </div>
          <div class="checkbox-item">
            <input type="checkbox" id="reportBillDeliveryRequired-${formId}" />
            <label for="reportBillDeliveryRequired-${formId}">Bill Delivery Required</label>
          </div>
        </div>
      </div>

      <div class="report-section">
        <div class="report-section-title">Report Received</div>
        <div class="select-all-row">
          <input type="checkbox" id="selectAllReports-${formId}" />
          <label for="selectAllReports-${formId}">Select All</label>
        </div>
        <div class="report-received-container" id="reportReceivedList-${formId}">
          <div class="empty-report-state">No tests selected yet.</div>
        </div>
      </div>

      <div class="report-section">
        <div class="report-section-title">Delivery Status</div>
        <div class="checkbox-row">
          <div class="checkbox-item delivery-status-item" id="onlineSentContainer-${formId}">
            <input type="checkbox" id="reportOnlineSent-${formId}" />
            <label for="reportOnlineSent-${formId}">Online Report Sent</label>
          </div>
          <div class="checkbox-item delivery-status-item" id="deliveredContainer-${formId}">
            <input type="checkbox" id="reportDelivered-${formId}" />
            <label for="reportDelivered-${formId}">Report Delivered</label>
          </div>
          <div class="checkbox-item delivery-status-item" id="billDeliveredContainer-${formId}">
            <input type="checkbox" id="reportBillDelivered-${formId}" />
            <label for="reportBillDelivered-${formId}">Bill Delivered</label>
          </div>
        </div>
      </div>
    </div>
  `;
}

// ============================================================
//  CREATE PAYMENT DETAILS HTML
// ============================================================
function createPaymentDetailsHTML(formId) {
  return `
    <div class="payment-details-grid">
      <div class="payment-field-wrapper">
        <label class="field-label">Total MRP</label>
        <div class="rupee-prefix">
          <input type="text" id="paymentTotalMRP-${formId}" readonly disabled value="₹0" />
        </div>
        <small style="color: var(--text-light); font-size: 0.7rem;">Auto-calculated</small>
      </div>

      <div class="payment-field-wrapper">
        <label class="field-label">Total B2B</label>
        <div class="rupee-prefix">
          <input type="text" id="paymentTotalB2B-${formId}" readonly disabled class="hidden-field" value="₹0" />
        </div>
        <div style="display: flex; align-items: center; gap: 6px; margin-top: 4px; flex-wrap: wrap;">
          <button class="b2b-toggle" id="b2bToggle-${formId}" onclick="handleB2BUnlock('${formId}')">🔒 View B2B</button>
          <div class="b2b-prompt" id="b2bPrompt-${formId}">
            <input type="password" id="b2bPassword-${formId}" placeholder="Enter password" />
            <button onclick="verifyB2BPassword('${formId}')">✓</button>
          </div>
        </div>
      </div>

      <div class="payment-field-wrapper">
        <label class="field-label">Final Price</label>
        <div class="rupee-prefix">
          <input type="text" id="paymentFinalPrice-${formId}" placeholder="Enter amount" />
        </div>
      </div>

      <div class="payment-field-wrapper">
        <label class="field-label">Cash Payment Received</label>
        <div class="rupee-prefix">
          <input type="text" id="paymentCash-${formId}" placeholder="Enter amount" />
        </div>
      </div>

      <div class="payment-field-wrapper">
        <label class="field-label">Online Payment Received</label>
        <div class="rupee-prefix">
          <input type="text" id="paymentOnline-${formId}" placeholder="Enter amount" />
        </div>
      </div>

      <div class="payment-field-wrapper">
        <label class="field-label">Pending Payment</label>
        <div class="rupee-prefix">
          <input type="text" id="paymentPending-${formId}" readonly disabled value="₹0" />
        </div>
        <div class="pending-status" style="font-size: 0.7rem; margin-top: 2px;"></div>
      </div>

      <div class="payment-field-wrapper goodwill-hidden" id="goodwillWrapper-${formId}" style="grid-column: 1;">
        <label class="field-label">Goodwill Charges</label>
        <div class="rupee-prefix">
          <input type="text" id="paymentGoodwill-${formId}" placeholder="Enter amount" />
        </div>
      </div>
    </div>

    <div class="calculator-btn-wrapper">
      <button class="calculator-btn" id="calculatorBtn-${formId}">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
          <line x1="8" y1="6" x2="16" y2="6" />
          <line x1="16" y1="14" x2="16" y2="18" />
          <line x1="12" y1="10" x2="12" y2="14" />
          <line x1="8" y1="14" x2="8" y2="18" />
        </svg>
        Calculator
      </button>
    </div>
  `;
}

// ============================================================
//  CREATE NEW ENTRY PANEL - WITH COMPLETE RESET
// ============================================================
function createNewEntryPanel() {
  const formId = 'new';
  const panelId = getPanelId(formId);

  const existingPanel = document.getElementById(panelId);
  if (existingPanel) {
    existingPanel.remove();
  }

  const panel = document.createElement('div');
  panel.className = 'panel';
  panel.id = panelId;
  panel.dataset.panel = formId;

  panel.innerHTML = `
    <div class="form-layout">
      <div class="section-nav">
        ${createSectionNavButtons(formId)}
      </div>
      <div class="section-content">
        <div class="form-section active-section-content" data-section="patient">
          <h3>Patient Details</h3>
          ${createPatientDetailsHTML(formId)}
        </div>

        <div class="form-section" data-section="test">
          <h3>Test Details</h3>
          ${createTestDetailsHTML(formId)}
        </div>

        <div class="form-section" data-section="visit">
          <h3>Visit Details</h3>
          ${createVisitDetailsHTML(formId)}
        </div>

        <div class="form-section" data-section="report">
          <h3>Report Details</h3>
          ${createReportDetailsHTML(formId)}
        </div>

        <div class="form-section" data-section="payment">
          <h3>Payment Details</h3>
          ${createPaymentDetailsHTML(formId)}
        </div>
      </div>
    </div>
    <div class="form-actions">
      <button class="btn-clear" id="clearBtn-${formId}">Clear</button>
      <button class="btn-save" id="saveBtn-${formId}" data-original-text="💾 Save Entry">💾 Save Entry</button>
    </div>
  `;

  const addedPanel = document.getElementById('panel-added');
  addedPanel.parentNode.insertBefore(panel, addedPanel.nextSibling);

  // CRITICAL: Create fresh state for new entry
  formStates.set('new', createEmptyFormState());

  setupFormNavigation(formId);
  setupPatientDetailsEvents(formId);

  const clearBtn = document.getElementById('clearBtn-' + formId);
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      if (confirm('Clear all entered data?')) {
        // Reset only this form's state
        resetFormState(formId);
        // Clear UI fields
        const panel = document.getElementById(getPanelId(formId));
        if (panel) {
          panel.querySelectorAll('input, select, textarea').forEach(el => {
            if (el.id && el.id.includes('-' + formId)) {
              if (el.type === 'checkbox') {
                el.checked = false;
              } else if (el.type !== 'button' && el.type !== 'submit') {
                el.value = '';
              }
            }
          });
          const container = document.getElementById('contacts-container-' + formId);
          if (container) {
            container.innerHTML = '';
            addContactRow(formId);
          }
        }
        updatePPSection(formId);
        updateReportReceivedList(formId);
        updateDeliveryStatusVisibility(formId);
        updatePaymentFields(formId);
        updateSectionProgressBars(formId);
      }
    });
  }

  const saveBtn = document.getElementById('saveBtn-' + formId);
  if (saveBtn) {
    saveBtn.addEventListener('click', async () => {
      const data = gatherFormData(formId);
      if (!data.patientName) {
        toast('Patient name is required.', 'error');
        return;
      }
      setLoading(saveBtn, true);
      try {
        const ref = db.ref('patients').push();
        await ref.set(data);
        toast('Entry saved successfully.', 'success');
        // Reset form state after saving
        resetFormState(formId);
        // Clear UI fields
        const panel = document.getElementById(getPanelId(formId));
        if (panel) {
          panel.querySelectorAll('input, select, textarea').forEach(el => {
            if (el.id && el.id.includes('-' + formId)) {
              if (el.type === 'checkbox') {
                el.checked = false;
              } else if (el.type !== 'button' && el.type !== 'submit') {
                el.value = '';
              }
            }
          });
          const container = document.getElementById('contacts-container-' + formId);
          if (container) {
            container.innerHTML = '';
            addContactRow(formId);
          }
        }
        updatePPSection(formId);
        updateReportReceivedList(formId);
        updateDeliveryStatusVisibility(formId);
        updatePaymentFields(formId);
        updateSectionProgressBars(formId);
        await loadEntries();
      } catch (err) {
        handleFirebaseError(err);
      }
      setLoading(saveBtn, false);
    });
  }

  return panel;
}

// ============================================================
//  CREATE EDIT PANEL
// ============================================================
function createEditPanel(key, data) {
  const formId = 'edit-' + key;
  const panelId = getPanelId(formId);

  // ARCHITECTURE FIX: `data` here is a live reference into `allEntries`
  // (and therefore into `allPatientNames`, which shares the same objects).
  // Deep-clone it before it ever touches form/state code so this edit
  // panel's state is fully isolated and can never mutate the shared
  // entries cache — even indirectly via defaulting/normalizing logic
  // inside populateForm().
  data = JSON.parse(JSON.stringify(data));

  const existingPanel = document.getElementById(panelId);
  if (existingPanel) {
    existingPanel.remove();
  }

  const panel = document.createElement('div');
  panel.className = 'panel';
  panel.id = panelId;
  panel.dataset.panel = formId;

  panel.innerHTML = `
    <div class="form-layout">
      <div class="section-nav">
        ${createSectionNavButtons(formId)}
      </div>
      <div class="section-content">
        <div class="form-section active-section-content" data-section="patient">
          <h3>Patient Details</h3>
          ${createPatientDetailsHTML(formId)}
        </div>

        <div class="form-section" data-section="test">
          <h3>Test Details</h3>
          ${createTestDetailsHTML(formId)}
        </div>

        <div class="form-section" data-section="visit">
          <h3>Visit Details</h3>
          ${createVisitDetailsHTML(formId)}
        </div>

        <div class="form-section" data-section="report">
          <h3>Report Details</h3>
          ${createReportDetailsHTML(formId)}
        </div>

        <div class="form-section" data-section="payment">
          <h3>Payment Details</h3>
          ${createPaymentDetailsHTML(formId)}
        </div>
      </div>
    </div>
    <div class="form-actions">
      <button class="btn-clear" id="clearBtn-${formId}">Reset</button>
      <button class="btn-save" id="saveBtn-${formId}" data-original-text="💾 Update Entry">💾 Update Entry</button>
    </div>
  `;

  const addedPanel = document.getElementById('panel-added');
  addedPanel.parentNode.insertBefore(panel, addedPanel.nextSibling);

  // Create fresh state for this edit form
  formStates.set(formId, createEmptyFormState());
  
  // Populate with existing data
  populateForm(formId, data);

  setupFormNavigation(formId);
  setupPatientDetailsEvents(formId);

  const clearBtn = document.getElementById('clearBtn-' + formId);
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      if (confirm('Reset all fields in this edit form?')) {
        resetFormState(formId);
        populateForm(formId, data);
      }
    });
  }

  const saveBtn = document.getElementById('saveBtn-' + formId);
  if (saveBtn) {
    saveBtn.addEventListener('click', async () => {
      const updatedData = gatherFormData(formId);
      if (!updatedData.patientName) {
        toast('Patient name is required.', 'error');
        return;
      }
      setLoading(saveBtn, true);
      try {
        await db.ref('patients/' + key).update(updatedData);
        toast('Entry updated successfully.', 'success');
        closeEditTab('edit-' + key);
        await loadEntries();
      } catch (err) {
        handleFirebaseError(err);
        setLoading(saveBtn, false);
      }
    });
  }

  return panel;
}

// ============================================================
//  TAB MANAGEMENT
// ============================================================
function switchTab(tabId) {
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active-panel'));
  const targetPanel = document.getElementById('panel-' + tabId);
  if (targetPanel) targetPanel.classList.add('active-panel');

  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tabId);
  });
  activeTab = tabId;

  if (tabId !== 'added') {
    updateSectionProgressBars(tabId);
  }
}

function createTabButton(tabId, label, closeable = false) {
  const btn = document.createElement('button');
  btn.className = 'tab-btn' + (tabId === 'added' ? ' active' : '');
  btn.dataset.tab = tabId;
  btn.innerHTML = label;

  if (closeable) {
    const span = document.createElement('span');
    span.className = 'close-edit';
    span.textContent = '✕';
    span.addEventListener('click', (e) => {
      e.stopPropagation();
      closeEditTab(tabId);
    });
    btn.appendChild(span);
  }

  btn.addEventListener('click', () => {
    if (tabId === 'added') {
      switchTab('added');
    } else if (tabId === 'new') {
      switchTab('new');
    } else if (tabId.startsWith('edit-')) {
      switchTab(tabId);
    }
  });

  return btn;
}

function ensureBaseTabs() {
  tabBar.innerHTML = '';

  const addedBtn = createTabButton('added', '📋 Added Entries', false);
  tabBar.appendChild(addedBtn);

  const newBtn = createTabButton('new', '➕ New Entry', false);
  tabBar.appendChild(newBtn);

  for (const [key, info] of editTabs) {
    const btn = createTabButton('edit-' + key, '✎ Edit — ' + info.name, true);
    tabBar.appendChild(btn);
  }

  document.querySelectorAll('.tab-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.tab === activeTab);
  });
}

function openEditTab(key, data) {
  if (editTabs.has(key)) {
    switchTab('edit-' + key);
    return;
  }

  const name = data.patientName || 'Patient';
  editTabs.set(key, { name });

  createEditPanel(key, data);
  ensureBaseTabs();
  switchTab('edit-' + key);
}

function closeEditTab(tabId) {
  const key = tabId.replace('edit-', '');
  if (!editTabs.has(key)) return;

  editTabs.delete(key);
  // Remove the form state for this edit tab
  deleteFormState(tabId);
  
  const panel = document.getElementById('panel-' + tabId);
  if (panel) panel.remove();

  ensureBaseTabs();

  if (editTabs.size === 0) {
    switchTab('added');
  } else {
    const firstKey = editTabs.keys().next().value;
    switchTab('edit-' + firstKey);
  }
}

// ============================================================
//  SETUP PATIENT DETAILS EVENTS
// ============================================================
function setupPatientDetailsEvents(formId) {
  const nameInput = document.getElementById('patientName-' + formId);
  if (nameInput) {
    nameInput.addEventListener('blur', function() {
      this.value = formatName(this.value);
      updatePaymentFields(formId);
      updateSectionProgressBars(formId);
    });
    nameInput.addEventListener('input', function() {
      updatePaymentFields(formId);
      updateSectionProgressBars(formId);
    });
  }

  const careInput = document.getElementById('patientCareOf-' + formId);
  if (careInput) {
    careInput.addEventListener('blur', function() {
      this.value = formatName(this.value);
      updatePaymentFields(formId);
      updateSectionProgressBars(formId);
    });
    careInput.addEventListener('input', function() {
      updatePaymentFields(formId);
      updateSectionProgressBars(formId);
    });
  }

  const addressInput = document.getElementById('patientAddress-' + formId);
  if (addressInput) {
    addressInput.addEventListener('blur', function() {
      this.value = formatAddress(this.value);
      updateSectionProgressBars(formId);
    });
    addressInput.addEventListener('input', function() {
      updateSectionProgressBars(formId);
    });
  }

  const additionalInfo = document.getElementById('patientAdditionalInfo-' + formId);
  if (additionalInfo) {
    additionalInfo.addEventListener('blur', function() {
      this.value = formatAddress(this.value);
      updateSectionProgressBars(formId);
    });
    additionalInfo.addEventListener('input', function() {
      updateSectionProgressBars(formId);
    });
  }

  const patientFields = ['patientAge', 'patientGender', 'patientDoctor'];
  patientFields.forEach(fieldId => {
    const el = document.getElementById(fieldId + '-' + formId);
    if (el) {
      el.addEventListener('input', function() {
        updateSectionProgressBars(formId);
      });
      el.addEventListener('change', function() {
        updateSectionProgressBars(formId);
      });
    }
  });

  setupPatientAutocomplete(formId);
  setupAutocomplete('patientDoctor', DOCTOR_SUGGESTIONS, formId);
  setupAutocomplete('patientCareOf', CARE_OF_PERSON_SUGGESTIONS, formId);
  setupAutocomplete('visitPhlebotomist', PHLEBOTOMIST_SUGGESTIONS, formId);
  setupAutocomplete('visitPPPhlebotomist', PHLEBOTOMIST_SUGGESTIONS, formId);

  const addContactBtn = document.getElementById('addContact-' + formId);
  if (addContactBtn) {
    addContactBtn.addEventListener('click', function() {
      addContactRow(formId);
      updateSectionProgressBars(formId);
    });
  }

  const container = document.getElementById('contacts-container-' + formId);
  if (container && container.children.length === 0) {
    addContactRow(formId);
  }

  const selectAllReports = document.getElementById(`selectAllReports-${formId}`);
  if (selectAllReports) {
    selectAllReports.addEventListener('change', function() {
      handleSelectAllReports(formId);
      updateSectionProgressBars(formId);
    });
  }

  const onlineRequired = document.getElementById(`reportOnlineRequired-${formId}`);
  const deliveryRequired = document.getElementById(`reportDeliveryRequired-${formId}`);
  const billRequired = document.getElementById(`reportBillDeliveryRequired-${formId}`);

  if (onlineRequired) {
    onlineRequired.addEventListener('change', function() {
      updateDeliveryStatusVisibility(formId);
      updateSectionProgressBars(formId);
    });
  }
  if (deliveryRequired) {
    deliveryRequired.addEventListener('change', function() {
      updateDeliveryStatusVisibility(formId);
      updateSectionProgressBars(formId);
    });
  }
  if (billRequired) {
    billRequired.addEventListener('change', function() {
      updateDeliveryStatusVisibility(formId);
      updateSectionProgressBars(formId);
    });
  }

  ['reportOnlineSent', 'reportDelivered', 'reportBillDelivered'].forEach(fieldId => {
    const el = document.getElementById(fieldId + '-' + formId);
    if (el) {
      el.addEventListener('change', function() {
        updateSectionProgressBars(formId);
      });
    }
  });

  const finalPriceField = document.getElementById(`paymentFinalPrice-${formId}`);
  const cashField = document.getElementById(`paymentCash-${formId}`);
  const onlineField = document.getElementById(`paymentOnline-${formId}`);
  const goodwillField = document.getElementById(`paymentGoodwill-${formId}`);

  if (finalPriceField) {
    finalPriceField.addEventListener('input', function() {
      updatePaymentFields(formId);
      updateSectionProgressBars(formId);
    });
  }

  if (cashField) {
    cashField.addEventListener('input', function() {
      updatePaymentFields(formId);
      updateSectionProgressBars(formId);
    });
  }

  if (onlineField) {
    onlineField.addEventListener('input', function() {
      updatePaymentFields(formId);
      updateSectionProgressBars(formId);
    });
  }

  if (goodwillField) {
    goodwillField.addEventListener('input', function() {
      updatePaymentFields(formId);
      updateSectionProgressBars(formId);
    });
  }

  const calcBtn = document.getElementById(`calculatorBtn-${formId}`);
  if (calcBtn) {
    calcBtn.addEventListener('click', function(e) {
      e.preventDefault();
      if (typeof window.openCalculator === 'function') {
        window.openCalculator(formId, 'paymentGoodwill');
      } else {
        toast('Calculator not loaded properly.', 'error');
      }
    });
  }

  const labTabs = document.querySelectorAll(`#labTabs-${formId} .lab-tab`);
  labTabs.forEach(tab => {
    tab.addEventListener('click', function() {
      const labId = parseInt(this.dataset.lab);
      const formId = this.dataset.form;
      switchLab(labId, formId);
    });
  });

  recalculateGlobalSelectedTests(formId);
  for (let labId = 1; labId <= 4; labId++) {
    renderLabContent(labId, formId);
  }

  updatePPSection(formId);
  updateReportReceivedList(formId);
  updateDeliveryStatusVisibility(formId);
  updatePaymentFields(formId);
  updateSectionProgressBars(formId);
}

// ============================================================
//  COPY RULES TO CLIPBOARD
// ============================================================
if (copyRulesBtn) {
  copyRulesBtn.addEventListener('click', () => {
    const rules = `{
  "rules": {
    ".read": true,
    ".write": true,
    "patients": {
      ".read": true,
      ".write": true
    }
  }
}`;
    navigator.clipboard.writeText(rules).then(() => {
      toast('Rules copied to clipboard!', 'success');
    }).catch(() => {
      const textarea = document.createElement('textarea');
      textarea.value = rules;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      textarea.remove();
      toast('Rules copied!', 'success');
    });
  });
}

// ============================================================
//  CALCULATOR - Global button click handlers
// ============================================================
document.addEventListener('click', function(e) {
  if (e.target.id === 'calculatorClose' || e.target.closest('#calculatorClose')) {
    if (typeof window.closeCalculator === 'function') {
      window.closeCalculator();
    }
    return;
  }

  if (e.target.id === 'calculatorApply' || e.target.closest('#calculatorApply')) {
    if (typeof window.applyCalculatorResult === 'function') {
      window.applyCalculatorResult();
    }
    return;
  }

  if (e.target.id === 'calculatorOverlay') {
    if (typeof window.closeCalculator === 'function') {
      window.closeCalculator();
    }
    return;
  }

  const calcBtn = e.target.closest('.calculator-grid button');
  if (calcBtn) {
    const value = calcBtn.dataset.value;
    if (value) {
      e.preventDefault();
      if (typeof window.handleCalculatorInput === 'function') {
        window.handleCalculatorInput(value);
      }
    }
  }
});

// ============================================================
//  B2B Functions - Make global
// ============================================================
window.handleB2BUnlock = handleB2BUnlock;
window.verifyB2BPassword = verifyB2BPassword;

// ============================================================
//  INIT
// ============================================================
function init() {
  createNewEntryPanel();
  ensureBaseTabs();
  switchTab('added');
  loadEntries();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
