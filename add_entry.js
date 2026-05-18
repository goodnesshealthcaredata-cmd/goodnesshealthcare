/* ========================= Main Application Logic ========================= */
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycby3LA5kQv9WdDiQbEKRkmdgiE-VpFjVIFJxp7C9O-QP0ah88h6k7z9ve1vq1reQ7VWXBg/exec";

/* ========================= Helpers & UI ========================= */
const el = (q) => document.querySelector(q);
const $ = (q, root = document) => Array.from(root.querySelectorAll(q));
const fmtINR = (n) => "₹" + (Number(n) || 0).toLocaleString("en-IN");

// Pagination state
let currentPage = 1;
const ITEMS_PER_PAGE = 15;
let showAllEntries = false;
let currentSearchQuery = "";
let currentFilterDate = null;

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
  
  if (dateValue instanceof Date) {
    const year = dateValue.getFullYear();
    const month = String(dateValue.getMonth() + 1).padStart(2, '0');
    const day = String(dateValue.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  
  return dateValue;
}

function parseTimeFromSheet(timeValue) {
  if (!timeValue) return "";
  
  if (typeof timeValue === 'string' && /^\d{2}:\d{2}$/.test(timeValue)) {
    return timeValue;
  }
  
  if (typeof timeValue === 'string') {
    const match = timeValue.match(/(\d{2}):(\d{2})/);
    if (match) {
      return `${match[1]}:${match[2]}`;
    }
  }
  
  if (timeValue instanceof Date) {
    let hours = timeValue.getHours();
    let minutes = timeValue.getMinutes();
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  }
  
  return "";
}

function formatDisplayTime(timeValue) {
  if (!timeValue) return "-";
  const parsedTime = parseTimeFromSheet(timeValue);
  if (!parsedTime || parsedTime === "-") return "-";
  return parsedTime;
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

function sortEntriesByDateAndTime(entries) {
  return [...entries].sort((a, b) => {
    const dateA = parseDateFromSheet(a.date) || "0000-00-00";
    const dateB = parseDateFromSheet(b.date) || "0000-00-00";
    
    if (dateA !== dateB) {
      return dateB.localeCompare(dateA);
    }
    
    const timeA = parseTimeFromSheet(a.time_of_visit) || "00:00";
    const timeB = parseTimeFromSheet(b.time_of_visit) || "00:00";
    
    return timeA.localeCompare(timeB);
  });
}

/* ========================= Visit Schedule Modal ========================= */
function showVisitSchedule(selectedDate) {
  if (!selectedDate) {
    showToast("Please select a visit date first");
    return;
  }
  
  const filteredEntries = serverEntriesCache.filter(entry => {
    const entryDate = parseDateFromSheet(entry.date);
    return entryDate === selectedDate;
  });
  
  if (filteredEntries.length === 0) {
    showToast(`No visits scheduled for ${formatDisplayDate(selectedDate)}`);
    return;
  }
  
  const modal = document.createElement("div");
  modal.className = "visit-schedule-modal";
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0,0,0,0.5);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
  `;
  
  const modalContent = document.createElement("div");
  modalContent.style.cssText = `
    background: white;
    border-radius: 20px;
    max-width: 700px;
    width: 90%;
    max-height: 80vh;
    overflow: auto;
    box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    animation: modalSlideIn 0.3s ease;
  `;
  
  const scheduleItems = [];
  
  filteredEntries.forEach(entry => {
    const visitTime = parseTimeFromSheet(entry.time_of_visit);
    const ppTime = parseTimeFromSheet(entry.pp_time);
    const patientName = entry.patient_name || "Unknown Patient";
    const phlebotomist = entry.phlebotomist || "Not Assigned";
    const ppPhlebotomist = entry.pp_phlebotomist || "Not Assigned";
    const entryId = entry.id;
    
    if (visitTime) {
      scheduleItems.push({
        type: "visit",
        time: visitTime,
        sortTime: visitTime,
        patientName: patientName,
        phlebotomist: phlebotomist,
        ppTime: null,
        ppPhlebotomist: null,
        entryId: entryId
      });
    }
    
    if (ppTime) {
      scheduleItems.push({
        type: "pp",
        time: ppTime,
        sortTime: ppTime,
        patientName: patientName,
        phlebotomist: ppPhlebotomist,
        ppTime: ppTime,
        ppPhlebotomist: ppPhlebotomist,
        entryId: entryId
      });
    }
  });
  
  scheduleItems.sort((a, b) => a.sortTime.localeCompare(b.sortTime));
  
  const displayDate = formatDisplayDate(selectedDate);
  
  modalContent.innerHTML = `
    <div style="padding: 24px; border-bottom: 2px solid rgba(122, 178, 178, 0.2); display: flex; justify-content: space-between; align-items: center;">
      <div>
        <h2 style="font-size: 1.5rem; font-weight: 800; background: linear-gradient(135deg, #09637E 0%, #088395 100%); -webkit-background-clip: text; background-clip: text; color: transparent; margin: 0;">
          📅 Visit Schedule
        </h2>
        <p style="color: #4a6a73; margin-top: 8px; font-size: 0.875rem;">${displayDate}</p>
      </div>
      <button class="close-modal-btn" style="background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #7a9aa3; padding: 8px; width: 40px; height: 40px; border-radius: 50%; transition: all 0.3s ease;">&times;</button>
    </div>
    <div style="padding: 24px;">
      <div style="display: flex; justify-content: space-between; margin-bottom: 16px; padding-bottom: 12px; border-bottom: 2px solid rgba(122, 178, 178, 0.3); font-weight: 700; color: #09637E;">
        <span style="width: 20%;">Time</span>
        <span style="width: 40%;">Patient Name</span>
        <span style="width: 40%;">Phlebotomist</span>
      </div>
      <div id="scheduleList">
        ${scheduleItems.map(item => `
          <div class="schedule-item ${item.type}" style="display: flex; justify-content: space-between; align-items: center; padding: 14px 0; border-bottom: 1px solid rgba(122, 178, 178, 0.15); transition: all 0.2s ease;" onmouseover="this.style.backgroundColor='rgba(9,99,126,0.03)'" onmouseout="this.style.backgroundColor='transparent'">
            <span style="width: 20%; font-weight: 600; color: #088395;">
              ${item.type === 'pp' ? '🔄 ' : '🩺 '}${item.time}
            </span>
            <span style="width: 40%; color: #1a2e35;">${escapeHtml(item.patientName)}</span>
            <span style="width: 40%; color: #4a6a73;">${escapeHtml(item.phlebotomist)}</span>
          </div>
        `).join("")}
      </div>
      <div style="margin-top: 24px; padding-top: 16px; border-top: 2px solid rgba(122, 178, 178, 0.2);">
        <div style="display: flex; gap: 16px; flex-wrap: wrap;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="display: inline-block; width: 20px; height: 20px; background: #088395; border-radius: 4px;"></span>
            <span style="font-size: 0.813rem; color: #4a6a73;">Regular Visit</span>
          </div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="display: inline-block; width: 20px; height: 20px; background: #7AB2B2; border-radius: 4px;"></span>
            <span style="font-size: 0.813rem; color: #4a6a73;">PP (Post Prandial) Visit</span>
          </div>
        </div>
        <p style="font-size: 0.75rem; color: #7a9aa3; margin-top: 16px; text-align: center;">
          Total: ${scheduleItems.length} schedule item(s) for ${displayDate}
        </p>
      </div>
    </div>
  `;
  
  modal.appendChild(modalContent);
  document.body.appendChild(modal);
  
  if (!document.querySelector("#modalAnimationStyle")) {
    const style = document.createElement("style");
    style.id = "modalAnimationStyle";
    style.textContent = `
      @keyframes modalSlideIn {
        from {
          opacity: 0;
          transform: translateY(-30px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      .schedule-item:last-child {
        border-bottom: none;
      }
    `;
    document.head.appendChild(style);
  }
  
  const closeBtn = modal.querySelector(".close-modal-btn");
  closeBtn.addEventListener("click", () => modal.remove());
  modal.addEventListener("click", (e) => {
    if (e.target === modal) modal.remove();
  });
  
  const keyHandler = (e) => {
    if (e.key === "Escape") {
      modal.remove();
      document.removeEventListener("keydown", keyHandler);
    }
  };
  document.addEventListener("keydown", keyHandler);
}

/* ========================= Custom Time Picker (Alarm Clock Style) ========================= */
class CustomTimePicker {
  constructor(inputElement, options = {}) {
    this.input = inputElement;
    this.options = { ...options };
    this.picker = null;
    this.isOpen = false;
    this.hours = [];
    this.minutes = [];
    this.selectedHour = "00";
    this.selectedMinute = "00";
    
    this.init();
  }
  
  init() {
    // Hide the native input and create custom picker trigger
    this.input.style.cursor = "pointer";
    this.input.style.backgroundColor = "#fff";
    this.input.readOnly = true;
    
    // Parse initial value if exists
    if (this.input.value) {
      const parts = this.input.value.split(":");
      if (parts.length === 2) {
        this.selectedHour = parts[0].padStart(2, "0");
        this.selectedMinute = parts[1].padStart(2, "0");
      }
    }
    
    this.input.addEventListener("click", (e) => {
      e.preventDefault();
      this.open();
    });
    
    // Close on escape
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && this.isOpen) {
        this.close();
      }
    });
  }
  
  generateHourOptions() {
    const hours = [];
    for (let i = 0; i < 24; i++) {
      hours.push(i.toString().padStart(2, "0"));
    }
    return hours;
  }
  
  generateMinuteOptions() {
    const minutes = [];
    for (let i = 0; i < 60; i++) {
      minutes.push(i.toString().padStart(2, "0"));
    }
    return minutes;
  }
  
  open() {
    if (this.isOpen) return;
    
    this.hours = this.generateHourOptions();
    this.minutes = this.generateMinuteOptions();
    
    // Create picker container
    this.picker = document.createElement("div");
    this.picker.className = "custom-time-picker";
    this.picker.style.cssText = `
      position: fixed;
      background: white;
      border-radius: 20px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      width: 320px;
      z-index: 10001;
      overflow: hidden;
      animation: timePickerSlideIn 0.2s ease;
    `;
    
    // Create header
    const header = document.createElement("div");
    header.style.cssText = `
      background: linear-gradient(135deg, #09637E 0%, #088395 100%);
      padding: 16px 20px;
      color: white;
      text-align: center;
    `;
    header.innerHTML = `<h3 style="margin:0;font-size:1rem;">Select Time (24-Hour)</h3>`;
    
    // Create time display
    const timeDisplay = document.createElement("div");
    timeDisplay.style.cssText = `
      font-size: 2.5rem;
      font-weight: 700;
      text-align: center;
      padding: 20px;
      background: #f8fafc;
      font-family: monospace;
      letter-spacing: 2px;
      border-bottom: 1px solid #e2e8f0;
    `;
    timeDisplay.textContent = `${this.selectedHour}:${this.selectedMinute}`;
    
    // Create picker body with scrollable columns
    const pickerBody = document.createElement("div");
    pickerBody.style.cssText = `
      display: flex;
      gap: 10px;
      padding: 20px;
      background: white;
    `;
    
    // Hour column
    const hourColumn = this.createScrollColumn(this.hours, this.selectedHour, "hour", timeDisplay);
    // Minute column
    const minuteColumn = this.createScrollColumn(this.minutes, this.selectedMinute, "minute", timeDisplay);
    
    // Colon separator
    const colon = document.createElement("div");
    colon.style.cssText = `
      font-size: 1.5rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #09637E;
    `;
    colon.textContent = ":";
    
    pickerBody.appendChild(hourColumn);
    pickerBody.appendChild(colon);
    pickerBody.appendChild(minuteColumn);
    
    // Buttons
    const buttonContainer = document.createElement("div");
    buttonContainer.style.cssText = `
      display: flex;
      gap: 12px;
      padding: 16px 20px;
      border-top: 1px solid #e2e8f0;
      background: #f8fafc;
    `;
    
    const cancelBtn = this.createButton("Cancel", "ghost", () => this.close());
    const confirmBtn = this.createButton("Confirm", "primary", () => {
      this.input.value = `${this.selectedHour}:${this.selectedMinute}`;
      this.input.dispatchEvent(new Event("change", { bubbles: true }));
      this.input.dispatchEvent(new Event("input", { bubbles: true }));
      this.close();
    });
    
    buttonContainer.appendChild(cancelBtn);
    buttonContainer.appendChild(confirmBtn);
    
    this.picker.appendChild(header);
    this.picker.appendChild(timeDisplay);
    this.picker.appendChild(pickerBody);
    this.picker.appendChild(buttonContainer);
    
    // Position picker near input
    const rect = this.input.getBoundingClientRect();
    this.picker.style.top = `${rect.bottom + 10}px`;
    this.picker.style.left = `${Math.max(10, rect.left - 100)}px`;
    
    // Ensure picker stays in viewport
    if (parseInt(this.picker.style.top) + 400 > window.innerHeight) {
      this.picker.style.top = `${rect.top - 420}px`;
    }
    if (parseInt(this.picker.style.left) + 320 > window.innerWidth) {
      this.picker.style.left = `${window.innerWidth - 330}px`;
    }
    
    document.body.appendChild(this.picker);
    this.isOpen = true;
    
    // Click outside to close
    setTimeout(() => {
      document.addEventListener("click", this.handleOutsideClick);
    }, 0);
  }
  
  createScrollColumn(items, selectedValue, type, timeDisplay) {
    const container = document.createElement("div");
    container.style.cssText = `
      flex: 1;
      height: 200px;
      overflow-y: auto;
      text-align: center;
      border-radius: 12px;
      background: #f8fafc;
      scroll-snap-type: y mandatory;
    `;
    
    items.forEach(item => {
      const option = document.createElement("div");
      option.textContent = item;
      option.style.cssText = `
        padding: 12px;
        cursor: pointer;
        scroll-snap-align: center;
        transition: all 0.2s ease;
        font-size: 1rem;
        font-weight: 500;
      `;
      
      if (item === selectedValue) {
        option.style.background = "#e0f2fe";
        option.style.color = "#09637E";
        option.style.fontWeight = "700";
      }
      
      option.addEventListener("mouseenter", () => {
        option.style.background = "#f1f5f9";
      });
      option.addEventListener("mouseleave", () => {
        if (item === selectedValue) {
          option.style.background = "#e0f2fe";
        } else {
          option.style.background = "";
        }
      });
      
      option.addEventListener("click", () => {
        if (type === "hour") {
          this.selectedHour = item;
        } else {
          this.selectedMinute = item;
        }
        timeDisplay.textContent = `${this.selectedHour}:${this.selectedMinute}`;
        
        // Update selected style in column
        container.querySelectorAll("div").forEach(div => {
          div.style.background = "";
          div.style.color = "";
          div.style.fontWeight = "500";
          if (div.textContent === item) {
            div.style.background = "#e0f2fe";
            div.style.color = "#09637E";
            div.style.fontWeight = "700";
          }
        });
      });
      
      container.appendChild(option);
    });
    
    // Scroll to selected value
    setTimeout(() => {
      const targetOption = Array.from(container.querySelectorAll("div")).find(
        div => div.textContent === selectedValue
      );
      if (targetOption) {
        targetOption.scrollIntoView({ block: "center", behavior: "smooth" });
      }
    }, 50);
    
    return container;
  }
  
  createButton(text, type, onClick) {
    const btn = document.createElement("button");
    btn.textContent = text;
    btn.type = "button";
    btn.style.cssText = `
      flex: 1;
      padding: 10px;
      border-radius: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      border: none;
      font-size: 0.875rem;
    `;
    
    if (type === "primary") {
      btn.style.background = "linear-gradient(135deg, #09637E 0%, #088395 100%)";
      btn.style.color = "white";
    } else {
      btn.style.background = "#f1f5f9";
      btn.style.color = "#334155";
      btn.style.border = "1px solid #e2e8f0";
    }
    
    btn.addEventListener("click", onClick);
    btn.addEventListener("mouseenter", () => {
      if (type === "primary") {
        btn.style.opacity = "0.9";
      } else {
        btn.style.background = "#e2e8f0";
      }
    });
    btn.addEventListener("mouseleave", () => {
      if (type === "primary") {
        btn.style.opacity = "1";
      } else {
        btn.style.background = "#f1f5f9";
      }
    });
    
    return btn;
  }
  
  handleOutsideClick = (e) => {
    if (this.picker && !this.picker.contains(e.target) && e.target !== this.input) {
      this.close();
    }
  };
  
  close() {
    if (this.picker) {
      this.picker.remove();
      this.picker = null;
    }
    document.removeEventListener("click", this.handleOutsideClick);
    this.isOpen = false;
  }
}

// Add CSS animation for time picker
if (!document.querySelector("#timePickerStyle")) {
  const style = document.createElement("style");
  style.id = "timePickerStyle";
  style.textContent = `
    @keyframes timePickerSlideIn {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    .custom-time-picker div[style*="overflow-y: auto"]::-webkit-scrollbar {
      width: 4px;
    }
    .custom-time-picker div[style*="overflow-y: auto"]::-webkit-scrollbar-track {
      background: #e2e8f0;
      border-radius: 4px;
    }
    .custom-time-picker div[style*="overflow-y: auto"]::-webkit-scrollbar-thumb {
      background: #088395;
      border-radius: 4px;
    }
  `;
  document.head.appendChild(style);
}

/* ========================= Calculator Modal ========================= */
class CalculatorModal {
  constructor() {
    this.modal = null;
    this.isOpen = false;
    this.currentValue = "0";
    this.previousValue = null;
    this.operator = null;
    this.waitingForOperand = false;
    this.equation = "";
  }
  
  open() {
    // If already open, just return
    if (this.isOpen) return;
    
    this.isOpen = true;
    
    // Reset calculator state for new instance
    this.currentValue = "0";
    this.previousValue = null;
    this.operator = null;
    this.waitingForOperand = false;
    
    // Create overlay
    const overlay = document.createElement("div");
    overlay.className = "calculator-overlay";
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.5);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10002;
    `;
    
    // Create calculator panel
    const panel = document.createElement("div");
    panel.className = "calculator-panel";
    panel.style.cssText = `
      background: white;
      border-radius: 24px;
      width: 350px;
      max-width: 90%;
      overflow: hidden;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      animation: calculatorSlideIn 0.2s ease;
    `;
    
    panel.innerHTML = `
      <div style="background: linear-gradient(135deg, #09637E 0%, #088395 100%); padding: 16px 20px; display: flex; justify-content: space-between; align-items: center;">
        <h3 style="color: white; margin: 0; font-size: 1rem;">🧮 Calculator</h3>
        <button class="calc-close-btn" type="button" style="background: none; border: none; color: white; font-size: 1.5rem; cursor: pointer; padding: 0; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center;">&times;</button>
      </div>
      <div style="padding: 20px;">
        <div style="background: #f8fafc; border-radius: 12px; padding: 16px; margin-bottom: 20px;">
          <div style="font-size: 0.875rem; color: #7a9aa3; min-height: 24px; text-align: right; word-wrap: break-word; overflow-x: auto;" class="calc-equation"></div>
          <div style="font-size: 2rem; font-weight: 700; color: #09637E; font-family: monospace; text-align: right; word-wrap: break-word; overflow-x: auto; margin-top: 8px;" class="calc-display">0</div>
        </div>
        <div class="calc-buttons" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px;">
          <button class="calc-clear" type="button" style="background: #fee2e2; color: #dc2626; padding: 14px; font-size: 1.125rem; font-weight: 600; border: none; border-radius: 12px; cursor: pointer;">C</button>
          <button class="calc-operator" data-op="backspace" type="button" style="background: #f1f5f9; padding: 14px; font-size: 1.125rem; font-weight: 600; border: none; border-radius: 12px; cursor: pointer;">⌫</button>
          <button class="calc-operator" data-op="%" type="button" style="background: #f1f5f9; padding: 14px; font-size: 1.125rem; font-weight: 600; border: none; border-radius: 12px; cursor: pointer;">%</button>
          <button class="calc-operator" data-op="/" type="button" style="background: #e0f2fe; color: #09637E; padding: 14px; font-size: 1.125rem; font-weight: 600; border: none; border-radius: 12px; cursor: pointer;">÷</button>
          
          <button class="calc-number" data-num="7" type="button" style="background: #f8fafc; padding: 14px; font-size: 1.125rem; font-weight: 600; border: none; border-radius: 12px; cursor: pointer;">7</button>
          <button class="calc-number" data-num="8" type="button" style="background: #f8fafc; padding: 14px; font-size: 1.125rem; font-weight: 600; border: none; border-radius: 12px; cursor: pointer;">8</button>
          <button class="calc-number" data-num="9" type="button" style="background: #f8fafc; padding: 14px; font-size: 1.125rem; font-weight: 600; border: none; border-radius: 12px; cursor: pointer;">9</button>
          <button class="calc-operator" data-op="*" type="button" style="background: #e0f2fe; color: #09637E; padding: 14px; font-size: 1.125rem; font-weight: 600; border: none; border-radius: 12px; cursor: pointer;">×</button>
          
          <button class="calc-number" data-num="4" type="button" style="background: #f8fafc; padding: 14px; font-size: 1.125rem; font-weight: 600; border: none; border-radius: 12px; cursor: pointer;">4</button>
          <button class="calc-number" data-num="5" type="button" style="background: #f8fafc; padding: 14px; font-size: 1.125rem; font-weight: 600; border: none; border-radius: 12px; cursor: pointer;">5</button>
          <button class="calc-number" data-num="6" type="button" style="background: #f8fafc; padding: 14px; font-size: 1.125rem; font-weight: 600; border: none; border-radius: 12px; cursor: pointer;">6</button>
          <button class="calc-operator" data-op="-" type="button" style="background: #e0f2fe; color: #09637E; padding: 14px; font-size: 1.125rem; font-weight: 600; border: none; border-radius: 12px; cursor: pointer;">-</button>
          
          <button class="calc-number" data-num="1" type="button" style="background: #f8fafc; padding: 14px; font-size: 1.125rem; font-weight: 600; border: none; border-radius: 12px; cursor: pointer;">1</button>
          <button class="calc-number" data-num="2" type="button" style="background: #f8fafc; padding: 14px; font-size: 1.125rem; font-weight: 600; border: none; border-radius: 12px; cursor: pointer;">2</button>
          <button class="calc-number" data-num="3" type="button" style="background: #f8fafc; padding: 14px; font-size: 1.125rem; font-weight: 600; border: none; border-radius: 12px; cursor: pointer;">3</button>
          <button class="calc-operator" data-op="+" type="button" style="background: #e0f2fe; color: #09637E; padding: 14px; font-size: 1.125rem; font-weight: 600; border: none; border-radius: 12px; cursor: pointer;">+</button>
          
          <button class="calc-number" data-num="0" type="button" style="grid-column: span 2; background: #f8fafc; padding: 14px; font-size: 1.125rem; font-weight: 600; border: none; border-radius: 12px; cursor: pointer;">0</button>
          <button class="calc-number" data-num="." type="button" style="background: #f8fafc; padding: 14px; font-size: 1.125rem; font-weight: 600; border: none; border-radius: 12px; cursor: pointer;">.</button>
          <button class="calc-equals" type="button" style="background: linear-gradient(135deg, #09637E 0%, #088395 100%); color: white; padding: 14px; font-size: 1.125rem; font-weight: 600; border: none; border-radius: 12px; cursor: pointer;">=</button>
        </div>
        <div style="margin-top: 16px; display: flex; gap: 12px;">
          <button class="btn ghost calc-cancel-btn" type="button" style="flex: 1;">Cancel</button>
          <button class="btn primary calc-insert-btn" type="button" style="flex: 1;">Insert</button>
        </div>
      </div>
    `;
    
    overlay.appendChild(panel);
    document.body.appendChild(overlay);
    
    // Store references
    this.modal = overlay;
    
    const displayEl = panel.querySelector(".calc-display");
    const equationEl = panel.querySelector(".calc-equation");
    const self = this;
    
    // Function to close modal - DIRECT REMOVAL
    const closeModal = () => {
      if (self.modal && self.modal.parentNode) {
        self.modal.parentNode.removeChild(self.modal);
      }
      self.modal = null;
      self.isOpen = false;
    };
    
    // Update display
    const updateDisplay = () => {
      if (displayEl) displayEl.textContent = self.currentValue;
    };
    
    const updateEquation = () => {
      if (!equationEl) return;
      if (self.operator && self.previousValue !== null && !self.waitingForOperand) {
        equationEl.textContent = `${self.previousValue} ${self.getOperatorSymbol(self.operator)} ${self.currentValue}`;
      } else if (self.operator && self.previousValue !== null) {
        equationEl.textContent = `${self.previousValue} ${self.getOperatorSymbol(self.operator)}`;
      } else if (self.waitingForOperand && self.previousValue !== null) {
        equationEl.textContent = `${self.previousValue}`;
      } else {
        equationEl.textContent = "";
      }
    };
    
    // Number buttons
    panel.querySelectorAll(".calc-number").forEach(btn => {
      btn.addEventListener("click", function(e) {
        e.preventDefault();
        e.stopPropagation();
        const num = this.getAttribute("data-num");
        if (self.waitingForOperand) {
          self.currentValue = num;
          self.waitingForOperand = false;
        } else {
          if (num === "." && self.currentValue.includes(".")) return;
          self.currentValue = self.currentValue === "0" && num !== "." ? num : self.currentValue + num;
        }
        updateDisplay();
        updateEquation();
      });
    });
    
    // Operator buttons
    panel.querySelectorAll(".calc-operator").forEach(btn => {
      btn.addEventListener("click", function(e) {
        e.preventDefault();
        e.stopPropagation();
        const op = this.getAttribute("data-op");
        
        if (op === "backspace") {
          if (self.waitingForOperand) {
            self.operator = null;
            self.waitingForOperand = false;
            self.currentValue = String(self.previousValue);
            updateDisplay();
            equationEl.textContent = "";
          } else {
            self.currentValue = self.currentValue.length > 1 ? self.currentValue.slice(0, -1) : "0";
            updateDisplay();
            updateEquation();
          }
          return;
        }
        
        const inputValue = parseFloat(self.currentValue);
        
        if (self.previousValue !== null && !self.waitingForOperand) {
          const result = self.calculate(self.previousValue, inputValue, self.operator);
          self.currentValue = String(result);
          updateDisplay();
          self.previousValue = result;
        } else {
          self.previousValue = inputValue;
        }
        
        self.waitingForOperand = true;
        self.operator = op;
        updateEquation();
      });
    });
    
    // Clear button
    panel.querySelector(".calc-clear").addEventListener("click", function(e) {
      e.preventDefault();
      e.stopPropagation();
      self.currentValue = "0";
      self.previousValue = null;
      self.operator = null;
      self.waitingForOperand = false;
      updateDisplay();
      equationEl.textContent = "";
    });
    
    // Equals button
    panel.querySelector(".calc-equals").addEventListener("click", function(e) {
      e.preventDefault();
      e.stopPropagation();
      if (self.operator && !self.waitingForOperand) {
        const inputValue = parseFloat(self.currentValue);
        const result = self.calculate(self.previousValue, inputValue, self.operator);
        self.currentValue = String(result);
        updateDisplay();
        equationEl.textContent = `${self.previousValue} ${self.getOperatorSymbol(self.operator)} ${inputValue} = ${result}`;
        self.previousValue = null;
        self.operator = null;
        self.waitingForOperand = true;
      }
    });
    
    // Close button (X) - ONE CLICK - DIRECT CLOSE
    const closeBtn = panel.querySelector(".calc-close-btn");
    closeBtn.addEventListener("click", function(e) {
      e.preventDefault();
      e.stopPropagation();
      closeModal();
    });
    
    // Cancel button - ONE CLICK - DIRECT CLOSE
    const cancelBtn = panel.querySelector(".calc-cancel-btn");
    cancelBtn.addEventListener("click", function(e) {
      e.preventDefault();
      e.stopPropagation();
      closeModal();
    });
    
    // Insert button
    const insertBtn = panel.querySelector(".calc-insert-btn");
    insertBtn.addEventListener("click", function(e) {
      e.preventDefault();
      e.stopPropagation();
      const targetInput = document.getElementById("goodwillCharges");
      const value = parseFloat(displayEl.textContent);
      if (!isNaN(value) && targetInput) {
        targetInput.value = value;
        targetInput.dispatchEvent(new Event("input", { bubbles: true }));
        targetInput.dispatchEvent(new Event("change", { bubbles: true }));
        if (typeof updatePaymentFields === 'function') {
          updatePaymentFields();
        }
        if (typeof showToast === 'function') {
          showToast("Value inserted");
        }
      }
      closeModal();
    });
    
    // Click outside - ONE CLICK
    overlay.addEventListener("click", function(e) {
      if (e.target === overlay) {
        closeModal();
      }
    });
    
    // Initial display
    updateDisplay();
    updateEquation();
  }
  
  getOperatorSymbol(op) {
    switch (op) {
      case "+": return "+";
      case "-": return "-";
      case "*": return "×";
      case "/": return "÷";
      case "%": return "%";
      default: return op;
    }
  }
  
  calculate(a, b, op) {
    a = Number(a);
    b = Number(b);
    switch (op) {
      case "+": return a + b;
      case "-": return a - b;
      case "*": return a * b;
      case "/": return b !== 0 ? a / b : 0;
      case "%": return a % b;
      default: return b;
    }
  }
  
  close() {
    if (this.modal && this.modal.parentNode) {
      this.modal.parentNode.removeChild(this.modal);
    }
    this.modal = null;
    this.isOpen = false;
  }
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
  selectCenter:           () => el("#selectCenter"),
  visitType:              () => el("#visitType"),
  visitDate:              () => el("#visitDate"),
  visitTime:              () => el("#visitTime"),
  seeScheduleBtn:         () => el("#seeScheduleBtn"),
  ppTime:                 () => el("#ppTime"),
  ppTimeField:            () => el("#ppTimeField"),
  ppCollectionField:      () => el("#ppCollectionField"),
  ppPhlebotomistField:    () => el("#ppPhlebotomistField"),
  urineField:             () => el("#urineField"),
  phlebotomistInput:      () => el("#phlebotomistInput"),
  phlebotomistSuggestions:()=> el("#phlebotomistSuggestions"),
  ppPhlebotomistInput:    () => el("#ppPhlebotomistInput"),
  ppPhlebotomistSuggestions:()=> el("#ppPhlebotomistSuggestions"),
  bloodCollected:         () => el("#bloodCollected"),
  urineCollected:         () => el("#urineCollected"),
  ppCollected:            () => el("#ppCollected"),
  sampleSent:             () => el("#sampleSent"),
  urineSent:              () => el("#urineSent"),
  ppSent:                 () => el("#ppSent"),
  visitInstruction:       () => el("#visitInstruction"),
  reportDeliveryRequired: () => el("#reportDeliveryRequired"),
  billRequired:           () => el("#billRequired"),
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
  tubeList:               () => el("#tubeList"),
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
  showAllToggle:          () => el("#showAllToggle"),
  searchPatientInput:     () => el("#searchPatientInput"),
  unifiedSearchInput:     () => el("#unifiedSearchInput"),
  selectedItemsList:      () => el("#selectedItemsList"),
  bulkAddInput:           () => el("#bulkAddInput"),
  bulkAddBtn:             () => el("#bulkAddBtn"),
  urineSentField:         () => el("#urineSentField"),
  ppSentField:            () => el("#ppSentField"),
  // NEW FIELDS
  goodwillCharges:        () => el("#goodwillCharges"),
  paymentComplete:        () => el("#paymentComplete"),
  calculatorBtn:          () => el("#calculatorBtn"),
};

/* ========================= Global state ========================= */
let selectedTestsByLab    = { 1: [], 2: [], 3: [], 4: [] };
let selectedPackagesByLab = { 1: [], 2: [], 3: [], 4: [] };
let packageTestSelections = {};
let currentSelectedLab    = "lab1";
let tubeCountOverrides    = {};
let serverEntriesCache    = [];
let globallySelectedTests = new Set();

function labNumFromId(labId) {
  return parseInt(labId.replace("lab", ""), 10) || 1;
}

/* ========================= De-duplication Logic ========================= */
function getAllTestsForLab(labNum) {
  const labId = `lab${labNum}`;
  const direct = selectedTestsByLab[labNum] || [];
  const pkgNames = selectedPackagesByLab[labNum] || [];
  const fromPkgs = [];
  pkgNames.forEach(n => {
    const pkg = (PACKAGES[labId] || []).find(p => p.name === n);
    if (pkg) {
      const includedTests = packageTestSelections[`${labNum}_${n}`] || pkg.tests;
      fromPkgs.push(...includedTests);
    }
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

function getAllSelectedPackagesAcrossLabs() {
  const all = [];
  for (let i = 1; i <= 4; i++) {
    all.push(...(selectedPackagesByLab[i] || []));
  }
  return [...new Set(all)];
}

function getAllPackageTestsAcrossLabs() {
  const all = [];
  for (let i = 1; i <= 4; i++) {
    const labId = `lab${i}`;
    const pkgNames = selectedPackagesByLab[i] || [];
    pkgNames.forEach(n => {
      const includedTests = packageTestSelections[`${i}_${n}`];
      if (includedTests) all.push(...includedTests);
      else {
        const pkg = (PACKAGES[labId] || []).find(p => p.name === n);
        if (pkg) all.push(...pkg.tests);
      }
    });
  }
  return [...new Set(all)];
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
      }
      
      const packagesToRemove = [];
      selectedPackagesByLab[i].forEach(pkgName => {
        const includedTests = packageTestSelections[`${i}_${pkgName}`];
        if (includedTests && includedTests.includes(testName)) {
          packagesToRemove.push(pkgName);
        } else {
          const pkg = getPackage(`lab${i}`, pkgName);
          if (pkg && pkg.tests.includes(testName)) {
            packagesToRemove.push(pkgName);
          }
        }
      });
      packagesToRemove.forEach(pkgName => {
        const pkgIndex = selectedPackagesByLab[i].indexOf(pkgName);
        if (pkgIndex !== -1) {
          selectedPackagesByLab[i].splice(pkgIndex, 1);
          delete packageTestSelections[`${i}_${pkgName}`];
          renderSelectedItemsDisplay();
        }
      });
    }
  }
}

function removeConflictingIndividualTests(pkg, labNum) {
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
  
  return individualTestsToRemove;
}

function updateGlobalTestSet() {
  globallySelectedTests.clear();
  for (let i = 1; i <= 4; i++) {
    const tests = getAllTestsForLab(i);
    tests.forEach(t => globallySelectedTests.add(t));
  }
}

/* ========================= Enhanced Tube Calculation ========================= */
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

function calculateTubeCountsPerLab() {
  const perLabCounts = { 1: {}, 2: {}, 3: {}, 4: {} };
  
  for (let i = 1; i <= 4; i++) {
    const tests = getAllTestsForLab(i);
    perLabCounts[i] = calculateUniqueTubeCountsPerLab(tests);
  }
  
  return perLabCounts;
}

function getCombinedTubeCountsString() {
  const counts = calculateAggregatedTubeCounts();
  const entries = Object.entries(counts).filter(([, c]) => c > 0);
  return entries.map(([tube, count]) => `${tube}: ${count}`).join(", ");
}

function getPerLabTubeCountsString() {
  const perLabCounts = calculateTubeCountsPerLab();
  const result = { 1: "", 2: "", 3: "", 4: "" };
  
  for (let i = 1; i <= 4; i++) {
    const entries = Object.entries(perLabCounts[i]).filter(([, c]) => c > 0);
    result[i] = entries.length ? entries.map(([tube, count]) => `${tube}: ${count}`).join(", ") : "-";
  }
  
  return result;
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

/* ========================= Add test with global uniqueness ========================= */
function addTestWithGlobalCheck(testName, labNum) {
  if (selectedTestsByLab[labNum].includes(testName)) return false;
  
  if (isTestGloballySelected(testName, labNum)) {
    showToast(`"${testName}" is already selected in another lab or package. Cannot select again.`);
    return false;
  }
  
  const currentLabPackages = selectedPackagesByLab[labNum] || [];
  for (const pkgName of currentLabPackages) {
    const includedTests = packageTestSelections[`${labNum}_${pkgName}`];
    const pkg = getPackage(`lab${labNum}`, pkgName);
    if (pkg && (includedTests || pkg.tests).includes(testName)) {
      showToast(`"${testName}" is already included in package "${pkgName}". Cannot select individually.`);
      return false;
    }
  }
  
  selectedTestsByLab[labNum].push(testName);
  removeTestFromOtherLabs(testName, labNum);
  
  updateGlobalTestSet();
  return true;
}

/* ========================= Add package with checkbox control ========================= */
function addPackageWithCheckboxControl(pkg, labNum, selectedTestsFromPackage = null) {
  if (selectedPackagesByLab[labNum].includes(pkg.name)) return false;
  
  const testsToInclude = selectedTestsFromPackage || pkg.tests;
  
  const conflictingTests = [];
  for (const test of testsToInclude) {
    if (isTestGloballySelected(test, labNum)) {
      conflictingTests.push(test);
    }
  }
  
  if (conflictingTests.length > 0) {
    showToast(`Cannot add package "${pkg.name}". Conflicting tests already selected: ${conflictingTests.join(", ")}`);
    return false;
  }
  
  const removedTests = removeConflictingIndividualTests(pkg, labNum);
  if (removedTests.length > 0) {
    renderSelectedItemsDisplay();
  }
  
  selectedPackagesByLab[labNum].push(pkg.name);
  packageTestSelections[`${labNum}_${pkg.name}`] = testsToInclude;
  
  for (const test of testsToInclude) {
    removeTestFromOtherLabs(test, labNum);
  }
  
  renderSelectedItemsDisplay();
  updateGlobalTestSet();
  return true;
}

/* ========================= Update package test selection ========================= */
function updatePackageTestSelection(labNum, packageName, testName, isChecked) {
  const key = `${labNum}_${packageName}`;
  let currentTests = packageTestSelections[key] || [];
  const pkg = getPackage(`lab${labNum}`, packageName);
  
  if (!pkg) return;
  
  if (isChecked && !currentTests.includes(testName)) {
    if (isTestGloballySelected(testName, labNum)) {
      showToast(`"${testName}" is already selected elsewhere. Cannot include in package.`);
      return;
    }
    currentTests.push(testName);
  } else if (!isChecked && currentTests.includes(testName)) {
    const testIndex = currentTests.indexOf(testName);
    currentTests.splice(testIndex, 1);
    
    const isTestInOtherPackages = selectedPackagesByLab[labNum].some(pkgName => {
      if (pkgName === packageName) return false;
      const otherPkgTests = packageTestSelections[`${labNum}_${pkgName}`] || [];
      return otherPkgTests.includes(testName);
    });
    
    if (!isTestInOtherPackages && !selectedTestsByLab[labNum].includes(testName)) {
      removeTestFromOtherLabs(testName, labNum);
    }
  }
  
  packageTestSelections[key] = currentTests;
  renderSelectedItemsDisplay();
  updateAllCalculations();
}

/* ========================= Selected items display (Unified) ========================= */
function renderSelectedItemsDisplay() {
  const container = F.selectedItemsList();
  if (!container) return;
  
  const labNum = labNumFromId(currentSelectedLab);
  const individualTests = selectedTestsByLab[labNum] || [];
  const packages = selectedPackagesByLab[labNum] || [];
  
  container.innerHTML = "";
  
  if (!individualTests.length && !packages.length) {
    container.innerHTML = '<div class="hint" style="padding:12px;text-align:center;">No tests or packages selected</div>';
    return;
  }
  
  individualTests.forEach(test => {
    const mrp = getTestMRP(currentSelectedLab, test);
    const div = document.createElement("div");
    div.className = "selected-test-item";
    div.innerHTML = `
      <div class="test-info">
        <div class="test-name">🧪 ${escapeHtml(test)}</div>
        <div class="test-price">MRP: ${fmtINR(mrp)}</div>
      </div>
      <button class="remove-test-btn" data-test="${escapeHtml(test)}" title="Remove test">❌</button>`;
    div.querySelector(".remove-test-btn").addEventListener("click", (e) => {
      e.stopPropagation();
      const testIndex = selectedTestsByLab[labNum].indexOf(test);
      if (testIndex !== -1) {
        selectedTestsByLab[labNum].splice(testIndex, 1);
        updateGlobalTestSet();
        updateAllCalculations();
        renderSelectedItemsDisplay();
      }
    });
    container.appendChild(div);
  });
  
  packages.forEach(pkgName => {
    const pkg = getPackage(currentSelectedLab, pkgName);
    if (!pkg) return;
    
    const key = `${labNum}_${pkgName}`;
    const includedTests = packageTestSelections[key] || pkg.tests;
    
    const div = document.createElement("div");
    div.className = "selected-package-item";
    div.innerHTML = `
      <div class="package-header">
        <div class="package-name">📦 ${escapeHtml(pkg.name)}</div>
        <button class="remove-package-btn" data-package="${escapeHtml(pkgName)}" title="Remove package">❌</button>
      </div>
      <div class="package-tests-list">
        <strong>Tests included:</strong>
        <ul>
          ${pkg.tests.map(t => `
            <li>
              <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                <input type="checkbox" class="package-test-checkbox" data-package="${escapeHtml(pkgName)}" data-test="${escapeHtml(t)}" ${includedTests.includes(t) ? 'checked' : ''}>
                <span>${escapeHtml(t)}</span>
                <span class="test-source" style="margin-left: auto;">MRP: ${fmtINR(getTestMRP(currentSelectedLab, t))}</span>
              </label>
            </li>
          `).join("")}
        </ul>
      </div>
      <div class="package-price">💰 Package MRP: ${fmtINR(pkg.mrp)}</div>`;
    
    div.querySelector(".remove-package-btn").addEventListener("click", (e) => {
      e.stopPropagation();
      const pkgIndex = selectedPackagesByLab[labNum].indexOf(pkgName);
      if (pkgIndex !== -1) {
        selectedPackagesByLab[labNum].splice(pkgIndex, 1);
        delete packageTestSelections[key];
        renderSelectedItemsDisplay();
        updateGlobalTestSet();
        updateAllCalculations();
      }
    });
    
    div.querySelectorAll(".package-test-checkbox").forEach(cb => {
      cb.addEventListener("change", (e) => {
        const testName = cb.dataset.test;
        const isChecked = cb.checked;
        updatePackageTestSelection(labNum, pkgName, testName, isChecked);
      });
    });
    
    container.appendChild(div);
  });
}

/* ========================= Unified Search & Selection ========================= */
let currentSearchResults = [];
let currentLabNumForSearch = 1;

function initializeUnifiedSearch() {
  const searchInput = F.unifiedSearchInput();
  const resultsContainer = el("#unifiedSearchResults");
  if (!searchInput || !resultsContainer) return;
  
  const updateLabForSearch = () => {
    currentLabNumForSearch = labNumFromId(currentSelectedLab);
  };
  
  const processingLab = F.processingLab();
  if (processingLab) {
    processingLab.addEventListener("change", updateLabForSearch);
  }
  updateLabForSearch();
  
  function performSearch() {
    const query = searchInput.value.trim().toLowerCase();
    resultsContainer.innerHTML = "";
    
    if (!query) {
      resultsContainer.style.display = "none";
      return;
    }
    
    const labId = `lab${currentLabNumForSearch}`;
    const tests = TESTS_DATA[labId] || [];
    const packages = PACKAGES[labId] || [];
    const selectedTests = selectedTestsByLab[currentLabNumForSearch] || [];
    const selectedPackages = selectedPackagesByLab[currentLabNumForSearch] || [];
    const allSelectedTests = getAllSelectedTestsAcrossLabs();
    
    const testResults = tests.filter(t => 
      t.name.toLowerCase().includes(query) && 
      !selectedTests.includes(t.name) &&
      !allSelectedTests.includes(t.name)
    );
    
    const packageResults = packages.filter(p => 
      p.name.toLowerCase().includes(query) && 
      !selectedPackages.includes(p.name)
    );
    
    currentSearchResults = [...testResults.map(t => ({ type: 'test', data: t })), ...packageResults.map(p => ({ type: 'package', data: p }))];
    
    if (currentSearchResults.length === 0) {
      resultsContainer.innerHTML = '<div class="ms-empty">No matches found</div>';
      resultsContainer.style.display = "block";
      return;
    }
    
    resultsContainer.style.display = "block";
    
    currentSearchResults.forEach(result => {
      const item = document.createElement("div");
      item.className = "ms-item";
      if (result.type === 'test') {
        item.innerHTML = `
          <span>🧪 ${escapeHtml(result.data.name)}</span>
          <span class="ms-item-price">${fmtINR(result.data.mrp)}</span>
        `;
        item.addEventListener("click", () => {
          addTestWithGlobalCheck(result.data.name, currentLabNumForSearch);
          searchInput.value = "";
          resultsContainer.style.display = "none";
          updateAllCalculations();
          renderSelectedItemsDisplay();
          searchInput.focus();
        });
      } else {
        item.innerHTML = `
          <span>📦 ${escapeHtml(result.data.name)}</span>
          <span class="ms-item-price">${fmtINR(result.data.mrp)}</span>
        `;
        item.addEventListener("click", () => {
          showPackageTestSelectionModal(result.data, () => {
            searchInput.focus();
          });
          searchInput.value = "";
          resultsContainer.style.display = "none";
        });
      }
      resultsContainer.appendChild(item);
    });
  }
  
  searchInput.addEventListener("input", performSearch);
  searchInput.addEventListener("focus", () => {
    if (searchInput.value.trim()) performSearch();
  });
  
  document.addEventListener("click", (e) => {
    if (!searchInput.contains(e.target) && !resultsContainer.contains(e.target)) {
      resultsContainer.style.display = "none";
    }
  });
}

function showPackageTestSelectionModal(pkg, onCloseCallback) {
  const modal = document.createElement("div");
  modal.className = "package-modal";
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0,0,0,0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2000;
  `;
  
  const modalContent = document.createElement("div");
  modalContent.style.cssText = `
    background: white;
    border-radius: 16px;
    max-width: 500px;
    width: 90%;
    max-height: 80vh;
    overflow: auto;
    padding: 24px;
    box-shadow: 0 20px 60px rgba(0,0,0,0.3);
  `;
  
  modalContent.innerHTML = `
    <h3 style="margin-bottom: 16px; color: var(--primary);">📦 ${escapeHtml(pkg.name)}</h3>
    <p style="margin-bottom: 16px; color: var(--text-medium);">Select tests to include from this package:</p>
    <div class="package-test-checkboxes" style="margin-bottom: 20px;">
      ${pkg.tests.map(test => `
        <label style="display: flex; align-items: center; gap: 10px; padding: 8px; border-bottom: 1px solid #e2e8f0; cursor: pointer;">
          <input type="checkbox" class="modal-package-test" value="${escapeHtml(test)}" checked>
          <span style="flex: 1;">${escapeHtml(test)}</span>
          <span style="color: var(--secondary); font-size: 12px;">${fmtINR(getTestMRP(`lab${currentLabNumForSearch}`, test))}</span>
        </label>
      `).join("")}
    </div>
    <div style="display: flex; gap: 12px; justify-content: flex-end;">
      <button class="btn ghost" id="cancelPackageBtn">Cancel</button>
      <button class="btn primary" id="confirmPackageBtn">Add Package</button>
    </div>
  `;
  
  modal.appendChild(modalContent);
  document.body.appendChild(modal);
  
  modal.querySelector("#cancelPackageBtn").addEventListener("click", () => {
    modal.remove();
    if (onCloseCallback) onCloseCallback();
  });
  
  modal.querySelector("#confirmPackageBtn").addEventListener("click", () => {
    const selectedTests = Array.from(modal.querySelectorAll(".modal-package-test:checked")).map(cb => cb.value);
    if (selectedTests.length === 0) {
      showToast("Please select at least one test from the package");
      return;
    }
    addPackageWithCheckboxControl(pkg, currentLabNumForSearch, selectedTests);
    modal.remove();
    updateAllCalculations();
    renderSelectedItemsDisplay();
    if (onCloseCallback) onCloseCallback();
  });
  
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.remove();
      if (onCloseCallback) onCloseCallback();
    }
  });
}

/* ========================= Bulk Add Feature (Supports both tests AND packages) ========================= */
function initializeBulkAdd() {
  const bulkInput = F.bulkAddInput();
  const bulkBtn = F.bulkAddBtn();
  if (!bulkInput || !bulkBtn) return;
  
  bulkBtn.addEventListener("click", () => {
    const rawInput = bulkInput.value.trim();
    if (!rawInput) {
      showToast("Please enter tests or packages to add");
      return;
    }
    
    const items = rawInput.split(/[,]+/).map(item => item.trim()).filter(item => item);
    const labNum = labNumFromId(currentSelectedLab);
    const labId = `lab${labNum}`;
    const tests = TESTS_DATA[labId] || [];
    const packages = PACKAGES[labId] || [];
    
    let addedCount = 0;
    let notFoundCount = 0;
    const notFoundItems = [];
    
    items.forEach(item => {
      const testMatch = tests.find(t => t.name.toLowerCase() === item.toLowerCase());
      if (testMatch && !selectedTestsByLab[labNum].includes(testMatch.name) && !isTestGloballySelected(testMatch.name, labNum)) {
        selectedTestsByLab[labNum].push(testMatch.name);
        removeTestFromOtherLabs(testMatch.name, labNum);
        addedCount++;
        return;
      }
      
      const packageMatch = packages.find(p => p.name.toLowerCase() === item.toLowerCase());
      if (packageMatch && !selectedPackagesByLab[labNum].includes(packageMatch.name)) {
        addPackageWithCheckboxControl(packageMatch, labNum, packageMatch.tests);
        addedCount++;
        return;
      }
      
      notFoundItems.push(item);
      notFoundCount++;
    });
    
    if (addedCount > 0) {
      updateGlobalTestSet();
      updateAllCalculations();
      renderSelectedItemsDisplay();
      showToast(`Added ${addedCount} item(s)`);
    }
    
    if (notFoundCount > 0) {
      showToast(`Could not find: ${notFoundItems.slice(0, 3).join(", ")}${notFoundCount > 3 ? "..." : ""}`);
    }
    
    bulkInput.value = "";
  });
  
  bulkInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      bulkBtn.click();
    }
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

function calculatePerLabMRP() {
  const perLabTotals = { 1: 0, 2: 0, 3: 0, 4: 0 };
  for (let i = 1; i <= 4; i++) {
    const labId = `lab${i}`;
    selectedTestsByLab[i].forEach(t => { perLabTotals[i] += getTestMRP(labId, t); });
    selectedPackagesByLab[i].forEach(n => {
      const pkg = getPackage(labId, n);
      if (pkg) perLabTotals[i] += pkg.mrp;
    });
  }
  return perLabTotals;
}

function calculatePerLabB2B() {
  const perLabTotals = { 1: 0, 2: 0, 3: 0, 4: 0 };
  for (let i = 1; i <= 4; i++) {
    const labId = `lab${i}`;
    selectedTestsByLab[i].forEach(t => { perLabTotals[i] += getTestB2B(labId, t); });
    selectedPackagesByLab[i].forEach(n => {
      const pkg = getPackage(labId, n);
      if (pkg) perLabTotals[i] += pkg.b2b;
    });
  }
  return perLabTotals;
}

function updatePaymentFields() {
  const totalMRP = calculateTotalMRP();
  const discountEl = F.discount();
  const discountedPriceEl = F.discountedPrice();
  if (!discountEl || !discountedPriceEl) return;

  const homeVisit = parseFloat((F.homeVisitCharges() || {}).value) || 0;
  const cashRcvd = parseFloat((F.cashReceived() || {}).value) || 0;
  const onlineRcvd = parseFloat((F.onlineReceived() || {}).value) || 0;
  // REMOVE goodwill from final price calculation
  // const goodwill = parseFloat((F.goodwillCharges() || {}).value) || 0;

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

  // REMOVE goodwill from final price calculation
  const finalPrice = finalDiscounted + homeVisit;  // Removed + goodwill
  const fpEl = F.finalPrice();
  if (fpEl) fpEl.value = fmtINR(finalPrice);

  const pending = Math.max(0, finalPrice - cashRcvd - onlineRcvd);
  const ppEl = F.pendingPayment();
  if (ppEl) ppEl.value = fmtINR(pending);

  const crEl = F.costRaw();
  if (crEl) crEl.value = finalPrice;
}

[F.discount, F.discountedPrice, F.homeVisitCharges, F.cashReceived, F.onlineReceived, F.goodwillCharges].forEach(fn => {
  const node = fn();
  if (node) node.addEventListener("input", updatePaymentFields);
});

/* ========================= B2B Popup ========================= */
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
  const correctPassword = "gnh123";
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
  toggleDisplay(F.urineSentField, hasUrine);
  toggleDisplay(F.ppSentField, hasPP);

  if (hasPP) {
    autoPPTime();
  } else {
    const pt = F.ppTime(); if (pt) pt.value = "";
    const pp = F.ppPhlebotomistInput(); if (pp) pp.value = "";
    const ppSent = F.ppSent(); if (ppSent) ppSent.checked = false;
  }
  
  if (!hasUrine) {
    const urineSent = F.urineSent(); if (urineSent) urineSent.checked = false;
  }
}

function autoPPTime() {
  const allTests = getAllSelectedTestsAcrossLabs();
  if (!allTests.includes("PP")) return;
  const vtEl = F.visitTime();
  const ptEl = F.ppTime();
  if (!vtEl || !vtEl.value || !ptEl || ptEl.dataset.manual) return;
  
  const timeParts = vtEl.value.split(":").map(Number);
  let hours = timeParts[0];
  let minutes = timeParts[1];
  
  hours = (hours + 2) % 24;
  
  ptEl.value = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
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

/* ========================= Visit Schedule Button Setup ========================= */
function setupVisitScheduleButton() {
  const scheduleBtn = F.seeScheduleBtn();
  const visitDateInput = F.visitDate();
  
  if (!scheduleBtn || !visitDateInput) return;
  
  scheduleBtn.disabled = !visitDateInput.value;
  scheduleBtn.style.opacity = visitDateInput.value ? "1" : "0.5";
  scheduleBtn.style.cursor = visitDateInput.value ? "pointer" : "not-allowed";
  
  visitDateInput.addEventListener("change", () => {
    const hasDate = !!visitDateInput.value;
    scheduleBtn.disabled = !hasDate;
    scheduleBtn.style.opacity = hasDate ? "1" : "0.5";
    scheduleBtn.style.cursor = hasDate ? "pointer" : "not-allowed";
  });
  
  scheduleBtn.addEventListener("click", () => {
    if (visitDateInput.value) {
      showVisitSchedule(visitDateInput.value);
    } else {
      showToast("Please select a visit date first");
    }
  });
}

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

function checkVisitScheduled() { const vt = F.visitType(); const vd = F.visitDate(); const vtime = F.visitTime(); return !!(vt?.value && vd?.value && vtime?.value); }
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
function checkUrineSentForProcessing() {
  const allTests = getAllSelectedTestsAcrossLabs();
  const hasUrine = allTests.includes("Urine") || allTests.some(t => getTubeTypesForTest(t).includes("Urine"));
  if (!hasUrine) return true;
  return !!(F.urineSent()?.checked);
}
function checkPPSentForProcessing() {
  if (!getAllSelectedTestsAcrossLabs().includes("PP")) return true;
  return !!(F.ppSent()?.checked);
}

function checkReportReceived() {
  const rdEl = F.reportReceivedData();
  if (!rdEl?.value) return false;
  try {
    const receivedData = JSON.parse(rdEl.value);
    const allTests = getAllSelectedTestsAcrossLabs();
    if (allTests.length === 0) return true;
    const normalizedReceivedKeys = Object.keys(receivedData).map(key => key.trim());
    const normalizedAllTests = allTests.map(test => test.trim());
    let allReceived = true;
    for (const test of normalizedAllTests) {
      const matchingKey = normalizedReceivedKeys.find(
        key => key.toLowerCase() === test.toLowerCase()
      );
      if (!matchingKey || receivedData[matchingKey] !== true) {
        allReceived = false;
        break;
      }
    }
    return allReceived;
  } catch (e) {
    console.error("Error parsing report received data:", e);
    return false;
  }
}

function checkReportOnlineSent() { return !!(F.reportOnlineSent()?.checked); }
function checkReportsDelivered() {
  const dr = F.reportDeliveryRequired();
  if (!dr?.checked) return true;
  return !!(F.reportDelivered()?.checked);
}

// NEW: Check if payment is complete
function checkPaymentComplete() {
  const paymentCompleteToggle = F.paymentComplete();
  return paymentCompleteToggle?.checked === true;
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
  );
  
  if (hasUrine) steps.push({ name: "Urine Sent", done: checkUrineSentForProcessing() });
  if (allTests.includes("PP")) steps.push({ name: "PP Sent", done: checkPPSentForProcessing() });
  
  steps.push(
    { name: "Report Received", done: checkReportReceived() },
    { name: "Report Online Sent", done: checkReportOnlineSent() },
  );

  const dr = F.reportDeliveryRequired();
  if (dr?.checked) steps.push({ name: "Reports Delivered", done: checkReportsDelivered() });
  
  // NEW: Add Payment Complete as the final step
  steps.push({ name: "Payment Complete", done: checkPaymentComplete() });

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
  F.urineSent, F.ppSent, F.reportOnlineSent, F.reportDelivered, F.reportDeliveryRequired,
  F.paymentComplete].forEach(fn => {
  const node = fn();
  if (node) { node.addEventListener("input", updateProgressBar); node.addEventListener("change", updateProgressBar); }
});

const reportReceivedDataEl = F.reportReceivedData();
if (reportReceivedDataEl) {
  reportReceivedDataEl.addEventListener("change", updateProgressBar);
  reportReceivedDataEl.addEventListener("input", updateProgressBar);
}

/* ========================= getCompletionPercentage ========================= */
function getAllTestsFromEntry(entry) {
  const tests = new Set();
  for (let i = 1; i <= 4; i++) {
    (entry[`tests_lab${i}`] || "").split(",").forEach(t => t.trim() && tests.add(t.trim()));
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
  );
  
  if (hasUrine) stages.push({ name: "Urine Sent", check: () => entry.urine_sent === "true" });
  if (hasPP) stages.push({ name: "PP Sent", check: () => entry.pp_sent === "true" });

  stages.push(
    {
      name: "Report Received", check: () => {
        if (!entry.report_received_data) return false;
        try {
          const received = JSON.parse(entry.report_received_data);
          const allEntryTests = getAllTestsFromEntry(entry);
          const normalizedReceivedKeys = Object.keys(received).map(k => k.trim());
          const normalizedAllTests = allEntryTests.map(t => t.trim());
          let allReceived = true;
          for (const test of normalizedAllTests) {
            const matchingKey = normalizedReceivedKeys.find(
              key => key.toLowerCase() === test.toLowerCase()
            );
            if (!matchingKey || received[matchingKey] !== true) {
              allReceived = false;
              break;
            }
          }
          return allReceived && allEntryTests.length > 0;
        } catch { return false; }
      }
    },
    { name: "Report Online Sent", check: () => entry.report_online_sent === "true" }
  );

  if (entry.report_delivery_required === "true") stages.push({ name: "Reports Delivered", check: () => entry.report_delivered === "true" });
  
  // NEW: Add Payment Complete stage for entries
  stages.push({ name: "Payment Complete", check: () => entry.payment_complete === "true" });

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
  if (hasUrine) inc(entry.urine_sent === "true");
  if (hasPP) inc(entry.pp_sent === "true");

  if (entry.report_received_data) {
    try {
      const received = JSON.parse(entry.report_received_data);
      const allEntryTests = getAllTestsFromEntry(entry);
      const normalizedReceivedKeys = Object.keys(received).map(k => k.trim());
      const normalizedAllTests = allEntryTests.map(t => t.trim());
      let allReceived = true;
      for (const test of normalizedAllTests) {
        const matchingKey = normalizedReceivedKeys.find(
          key => key.toLowerCase() === test.toLowerCase()
        );
        if (!matchingKey || received[matchingKey] !== true) {
          allReceived = false;
          break;
        }
      }
      inc(allReceived && allEntryTests.length > 0);
    } catch { total++; }
  } else { total++; }

  inc(entry.report_online_sent === "true");

  if (entry.report_delivery_required === "true") inc(entry.report_delivered === "true");
  
  // NEW: Add payment complete to percentage calculation
  inc(entry.payment_complete === "true");

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

  const normalizedCheckedTests = {};
  Object.keys(checkedTests).forEach(key => {
    normalizedCheckedTests[key.trim()] = checkedTests[key];
  });
  
  const allChecked = allTests.every(t => normalizedCheckedTests[t.trim()] === true);
  const selectAllDiv = document.createElement("div");
  selectAllDiv.className = "report-test-item";
  selectAllDiv.style.cssText = "border-bottom:2px solid rgba(122, 178, 178, 0.2);margin-bottom:8px;padding-bottom:12px;";
  selectAllDiv.innerHTML = `<input type="checkbox" id="select_all_reports" ${allChecked ? "checked" : ""}><label for="select_all_reports" style="font-weight:700;color:var(--primary);">Select All Reports</label>`;

  const selectAllCb = selectAllDiv.querySelector("#select_all_reports");
  selectAllCb.addEventListener("change", () => {
    const cbs = container.querySelectorAll(".report-checkbox");
    const newCheckedTests = {};
    if (selectAllCb.checked) {
      allTests.forEach(t => { newCheckedTests[t] = true; });
      cbs.forEach(cb => { cb.checked = true; });
    } else {
      cbs.forEach(cb => { cb.checked = false; });
    }
    if (storedEl) storedEl.value = JSON.stringify(newCheckedTests);
    updateProgressBar();
  });
  container.appendChild(selectAllDiv);

  allTests.forEach(test => {
    const item = document.createElement("div");
    item.className = "report-test-item";
    const safeid = `report_test_${test.replace(/\s/g, "_")}`;
    const isChecked = normalizedCheckedTests[test.trim()] === true;
    item.innerHTML = `<input type="checkbox" id="${safeid}" data-test="${escapeHtml(test)}" class="report-checkbox" ${isChecked ? "checked" : ""}><label for="${safeid}">${escapeHtml(test)}</label><span class="test-source">Report Received</span>`;
    const cb = item.querySelector("input");
    cb.addEventListener("change", () => {
      let currentData = safeJSONParse(storedEl?.value || "", {});
      if (cb.checked) {
        currentData[test] = true;
      } else {
        delete currentData[test];
      }
      if (storedEl) storedEl.value = JSON.stringify(currentData);
      const allCheckboxes = Array.from(container.querySelectorAll(".report-checkbox"));
      const allNowChecked = allCheckboxes.every(c => c.checked);
      if (selectAllCb) selectAllCb.checked = allNowChecked;
      updateProgressBar();
    });
    container.appendChild(item);
  });
}

/* ========================= Master update ========================= */
function updateAllCalculations() {
  renderSelectedItemsDisplay();
  renderTubes();
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
  
  const unifiedResults = el("#unifiedSearchResults");
  const unifiedInput = F.unifiedSearchInput();
  if (unifiedResults && (!unifiedInput || !unifiedInput.contains(e.target)) && !unifiedResults.contains(e.target)) {
    unifiedResults.style.display = "none";
  }
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

    sugg.innerHTML = items.map(item => `<div class="${itemClass}">${escapeHtml(item)}</div>`).join("");
    sugg.style.display = "block";
    sugg.querySelectorAll(`.${itemClass}`).forEach(div => {
      div.addEventListener("click", () => {
        if (input) input.value = div.textContent;
        sugg.style.display = "none";
        const changeEvent = new Event('change', { bubbles: true });
        input.dispatchEvent(changeEvent);
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

function escapeHtml(str) {
  if (!str) return "";
  return str.replace(/[&<>]/g, function(m) {
    if (m === '&') return '&amp;';
    if (m === '<') return '&lt;';
    if (m === '>') return '&gt;';
    return m;
  });
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

/* ========================= Date Filter, Search, Toggle, Pagination ========================= */
function filterInProgressEntries() {
  const filterDate = F.filterDate();
  currentFilterDate = filterDate ? filterDate.value : null;
  currentPage = 1;
  renderInProgress();
}

function clearDateFilter() {
  const filterDate = F.filterDate();
  if (filterDate) {
    filterDate.value = "";
    currentFilterDate = null;
    currentPage = 1;
    renderInProgress();
  }
}

function handleSearch() {
  const searchInput = F.searchPatientInput();
  currentSearchQuery = searchInput ? searchInput.value.trim().toLowerCase() : "";
  currentPage = 1;
  renderInProgress();
}

function handleToggleChange() {
  const toggle = F.showAllToggle();
  showAllEntries = toggle ? toggle.checked : false;
  currentPage = 1;
  renderInProgress();
}

let searchDebounceTimer;
function setupSearchDebounce() {
  const searchInput = F.searchPatientInput();
  if (searchInput) {
    searchInput.setAttribute("autocomplete", "off");
    searchInput.setAttribute("autocorrect", "off");
    searchInput.setAttribute("autocapitalize", "off");
    searchInput.setAttribute("spellcheck", "false");
    
    searchInput.addEventListener("input", () => {
      clearTimeout(searchDebounceTimer);
      searchDebounceTimer = setTimeout(handleSearch, 300);
    });
  }
}

function getFilteredEntries() {
  let items = [...serverEntriesCache];
  
  if (!showAllEntries) {
    items = items.filter(e => getCompletionPercentage(e) < 100);
  }
  
  if (currentFilterDate) {
    items = items.filter(entry => {
      if (!entry.date) return false;
      const entryDate = parseDateFromSheet(entry.date);
      return entryDate === currentFilterDate;
    });
  }
  
  if (currentSearchQuery) {
    items = items.filter(entry => {
      const patientName = (entry.patient_name || "").toLowerCase();
      return patientName.includes(currentSearchQuery);
    });
  }
  
  return sortEntriesByDateAndTime(items);
}

function renderPagination(totalItems) {
  const paginationContainer = el("#paginationControls");
  if (!paginationContainer) return;
  
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  
  if (totalPages <= 1) {
    paginationContainer.style.display = "none";
    return;
  }
  
  paginationContainer.style.display = "flex";
  paginationContainer.innerHTML = "";
  
  const prevBtn = document.createElement("button");
  prevBtn.textContent = "← Previous";
  prevBtn.disabled = currentPage === 1;
  prevBtn.addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      renderInProgress();
    }
  });
  paginationContainer.appendChild(prevBtn);
  
  const startPage = Math.max(1, currentPage - 2);
  const endPage = Math.min(totalPages, currentPage + 2);
  
  if (startPage > 1) {
    const firstPageBtn = document.createElement("button");
    firstPageBtn.textContent = "1";
    firstPageBtn.classList.add("page-number");
    firstPageBtn.addEventListener("click", () => {
      currentPage = 1;
      renderInProgress();
    });
    paginationContainer.appendChild(firstPageBtn);
    
    if (startPage > 2) {
      const dots = document.createElement("span");
      dots.textContent = "...";
      dots.className = "page-info";
      paginationContainer.appendChild(dots);
    }
  }
  
  for (let i = startPage; i <= endPage; i++) {
    const pageBtn = document.createElement("button");
    pageBtn.textContent = i;
    pageBtn.classList.add("page-number");
    if (i === currentPage) {
      pageBtn.style.background = "var(--primary)";
      pageBtn.style.color = "white";
      pageBtn.style.borderColor = "var(--primary)";
    }
    pageBtn.addEventListener("click", () => {
      currentPage = i;
      renderInProgress();
    });
    paginationContainer.appendChild(pageBtn);
  }
  
  if (endPage < totalPages) {
    if (endPage < totalPages - 1) {
      const dots = document.createElement("span");
      dots.textContent = "...";
      dots.className = "page-info";
      paginationContainer.appendChild(dots);
    }
    const lastPageBtn = document.createElement("button");
    lastPageBtn.textContent = totalPages;
    lastPageBtn.classList.add("page-number");
    lastPageBtn.addEventListener("click", () => {
      currentPage = totalPages;
      renderInProgress();
    });
    paginationContainer.appendChild(lastPageBtn);
  }
  
  const nextBtn = document.createElement("button");
  nextBtn.textContent = "Next →";
  nextBtn.disabled = currentPage === totalPages;
  nextBtn.addEventListener("click", () => {
    if (currentPage < totalPages) {
      currentPage++;
      renderInProgress();
    }
  });
  paginationContainer.appendChild(nextBtn);
  
  const pageInfo = document.createElement("span");
  pageInfo.className = "page-info";
  const startItem = (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const endItem = Math.min(currentPage * ITEMS_PER_PAGE, totalItems);
  pageInfo.textContent = `Showing ${startItem}-${endItem} of ${totalItems}`;
  paginationContainer.appendChild(pageInfo);
}

/* ========================= In-progress cards ========================= */
function renderInProgress() {
  const listEl = F.inProgressList();
  const emptyEl = F.inProgressEmpty();
  if (!listEl || !emptyEl) return;

  const filteredItems = getFilteredEntries();
  const totalItems = filteredItems.length;
  
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedItems = filteredItems.slice(startIndex, endIndex);
  
  listEl.innerHTML = "";

  if (!paginatedItems.length) { 
    emptyEl.style.display = "block";
    let filterMsg = "No entries found.";
    if (currentSearchQuery) filterMsg = `No entries found matching "${currentSearchQuery}".`;
    else if (currentFilterDate) filterMsg = `No entries found for ${currentFilterDate}.`;
    else if (!showAllEntries) filterMsg = "No in-progress items right now.";
    emptyEl.textContent = filterMsg;
    renderPagination(0);
    return; 
  }
  emptyEl.style.display = "none";

  paginatedItems.forEach(entry => {
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
  
  renderPagination(totalItems);
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
    delete packageTestSelections[`${i}_`];
  }
  tubeCountOverrides = {};
  updateGlobalTestSet();
  renderSelectedItemsDisplay();
}

function resetPaymentFields() {
  [F.discount, F.discountedPrice, F.homeVisitCharges, F.cashReceived, F.onlineReceived].forEach(fn => {
    const n = fn(); if (n) n.value = "0";
  });
  // Remove goodwill from reset - keep it separate, don't reset it to 0 automatically
  // const goodwillField = F.goodwillCharges(); if (goodwillField) goodwillField.value = "0";
  const paymentCompleteToggle = F.paymentComplete();
  if (paymentCompleteToggle) paymentCompleteToggle.checked = false;
}

function resetCheckboxes() {
  [F.bloodCollected, F.urineCollected, F.ppCollected, F.sampleSent,
   F.urineSent, F.ppSent, F.reportDeliveryRequired, F.billRequired,
   F.reportOnlineSent, F.reportDelivered].forEach(fn => {
    const n = fn(); if (n) n.checked = false;
  });
  const rrd = F.reportReceivedData(); if (rrd) rrd.value = "";
}

function resetMiscFields() {
  const nullFields = [F.mapLink, F.areaInput, F.careOf, F.doctorName, F.unifiedSearchInput,
    F.bulkAddInput, F.height, F.weight, F.lmpDate, F.clinicalHistory,
    F.phlebotomistInput, F.ppPhlebotomistInput, F.visitInstruction];
  nullFields.forEach(fn => { const n = fn(); if (n) n.value = ""; });
  const pt = F.ppTime(); if (pt) { pt.value = ""; delete pt.dataset.manual; }
  const ei = F.editId(); if (ei) ei.value = "";
  const sc = F.submitContent(); if (sc) sc.textContent = "Submit Entry";
  const scEl = F.selectCenter(); if (scEl) scEl.value = "Borivali";
  const vtElReset = F.visitType(); if (vtElReset) vtElReset.value = "";
}

function fullFormReset() {
  resetLabState();
  resetPaymentFields();
  resetCheckboxes();
  resetMiscFields();
  updateAllCalculations();
  setDefaults();
}

/* ========================= Edit / Load for edit ========================= */
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
  
  if (entry.select_center) setVal(F.selectCenter, entry.select_center);
  
  const setBool = (fn, val) => { const n = fn(); if (n) n.checked = val === "true" || val === "on" || val === true; };
  setBool(F.urineSent, entry.urine_sent);
  setBool(F.ppSent, entry.pp_sent);
  setBool(F.billRequired, entry.bill_required);

  for (let i = 1; i <= 4; i++) {
    selectedTestsByLab[i] = (entry[`tests_lab${i}`] || "").split(",").map(s => s.trim()).filter(Boolean);
    
    const packagesData = entry[`packages_lab${i}`];
    if (packagesData && packagesData !== "" && packagesData !== "[]") {
      try {
        const parsed = JSON.parse(packagesData);
        if (Array.isArray(parsed)) {
          selectedPackagesByLab[i] = parsed.map(pkg => pkg.name).filter(Boolean);
          parsed.forEach(pkg => {
            if (pkg.tests) {
              packageTestSelections[`${i}_${pkg.name}`] = pkg.tests.split(",").map(t => t.trim()).filter(Boolean);
            }
          });
        } else {
          selectedPackagesByLab[i] = packagesData.split(",").map(s => s.trim()).filter(Boolean);
        }
      } catch (e) {
        selectedPackagesByLab[i] = packagesData.split(",").map(s => s.trim()).filter(Boolean);
      }
    } else {
      selectedPackagesByLab[i] = [];
    }
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
  
  // NEW: Load goodwill charges and payment complete
  setVal(F.goodwillCharges, entry.goodwill_charges || "0");
  setBool(F.paymentComplete, entry.payment_complete);
  
  updatePaymentFields();

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
      const individualTests = selectedTestsByLab[i] || [];
      const packageNames = selectedPackagesByLab[i] || [];
      
      const labTestsAndPackages = [...individualTests, ...packageNames];
      data.set(`lab${i}_tests_packages`, labTestsAndPackages.join(", "));
      
      data.set(`tests_lab${i}`, individualTests.join(", "));
      data.set(`packages_lab${i}_names`, packageNames.join(", "));
      
      const packagesData = [];
      packageNames.forEach(pkgName => {
        const pkg = getPackage(`lab${i}`, pkgName);
        if (pkg) {
          const includedTests = packageTestSelections[`${i}_${pkgName}`] || pkg.tests;
          packagesData.push({
            name: pkgName,
            tests: includedTests.join(", ")
          });
        }
      });
      
      if (packagesData.length === 0) {
        data.set(`packages_lab${i}`, "");
      } else {
        data.set(`packages_lab${i}`, JSON.stringify(packagesData));
      }
    }
    
    const allIndividualTests = [];
    for (let i = 1; i <= 4; i++) {
      allIndividualTests.push(...(selectedTestsByLab[i] || []));
    }
    const uniqueIndividualTests = [...new Set(allIndividualTests)];
    data.set("all_individual_tests", uniqueIndividualTests.join(", "));
    
    const allPackageNames = getAllSelectedPackagesAcrossLabs();
    data.set("all_packages", allPackageNames.join(", "));
    
    const allPackageTests = getAllPackageTestsAcrossLabs();
    data.set("all_package_tests", allPackageTests.join(", "));
    
    const combinedTestsList = getAllSelectedTestsAcrossLabs();
    data.set("all_tests_combined", combinedTestsList.join(", "));
    
    const combinedTubeCounts = getCombinedTubeCountsString();
    data.set("combined_tubes", combinedTubeCounts);
    data.set("tube_overrides", JSON.stringify(tubeCountOverrides));
    
    const perLabTubeCounts = getPerLabTubeCountsString();
    data.set("lab1_tubes", perLabTubeCounts[1]);
    data.set("lab2_tubes", perLabTubeCounts[2]);
    data.set("lab3_tubes", perLabTubeCounts[3]);
    data.set("lab4_tubes", perLabTubeCounts[4]);
    
    data.set("processing_lab", currentSelectedLab);
    data.set("total_mrp", calculateTotalMRP());
    data.set("total_b2b_price", calculateTotalB2B());

    const perLabMRP = calculatePerLabMRP();
    const perLabB2B = calculatePerLabB2B();
    data.set("lab1_total_mrp", perLabMRP[1]);
    data.set("lab2_total_mrp", perLabMRP[2]);
    data.set("lab3_total_mrp", perLabMRP[3]);
    data.set("lab4_total_mrp", perLabMRP[4]);
    data.set("lab1_total_b2b", perLabB2B[1]);
    data.set("lab2_total_b2b", perLabB2B[2]);
    data.set("lab3_total_b2b", perLabB2B[3]);
    data.set("lab4_total_b2b", perLabB2B[4]);

    const crEl = F.costRaw(); if (crEl) data.set("cost", crEl.value);
    const discEl = F.discount(); if (discEl) data.set("discount", discEl.value);
    const dpEl = F.discountedPrice(); if (dpEl) data.set("discounted_price", dpEl.value);
    const hvcEl = F.homeVisitCharges(); if (hvcEl) data.set("home_visit_charges", hvcEl.value);
    const fpEl = F.finalPrice(); if (fpEl) data.set("final_price", fpEl.value.replace("₹", ""));
    const crcdEl = F.cashReceived(); if (crcdEl) data.set("cash_received", crcdEl.value);
    const orcdEl = F.onlineReceived(); if (orcdEl) data.set("online_received", orcdEl.value);
    const ppEl2 = F.pendingPayment(); if (ppEl2) data.set("pending_payment", ppEl2.value.replace("₹", ""));
    
    // NEW: Add goodwill charges and payment complete to form data
    const goodwillEl = F.goodwillCharges(); if (goodwillEl) data.set("goodwill_charges", goodwillEl.value);
    const paymentCompleteEl = F.paymentComplete(); if (paymentCompleteEl) data.set("payment_complete", paymentCompleteEl.checked ? "true" : "false");

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
    data.set("select_center", (F.selectCenter()?.value || "Borivali"));
    
    const userName = getCurrentUserName();
    data.set("created_by", userName);
    data.set("last_modified_by", userName);

    const boolSet = (key, fn) => data.set(key, fn()?.checked ? "true" : "false");
    boolSet("blood_collected", F.bloodCollected);
    boolSet("urine_collected", F.urineCollected);
    boolSet("pp_collected", F.ppCollected);
    boolSet("sample_sent", F.sampleSent);
    boolSet("urine_sent", F.urineSent);
    boolSet("pp_sent", F.ppSent);
    boolSet("report_delivery_required", F.reportDeliveryRequired);
    boolSet("bill_required", F.billRequired);
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

  const billReq = F.billRequired(); if (billReq) billReq.checked = false;
  
  const scEl = F.selectCenter(); if (scEl && !scEl.value) scEl.value = "Borivali";
  
  // NEW: Set default payment complete to false
  const paymentCompleteToggle = F.paymentComplete();
  if (paymentCompleteToggle) paymentCompleteToggle.checked = false;

  autoPPTime();
  renderTubes();
  const dobEl2 = F.dob(); const ageEl2 = F.age();
  if (dobEl2 && !dobEl2.value && ageEl2) { ageEl2.readOnly = false; ageEl2.classList.remove("readonly"); }
  updateAddressRequirement();
  updateConditionalVisitFields();
  generateReportReceivedList();
  updatePaymentFields();
  updateProgressBar();
  updateGlobalTestSet();
  
  setupVisitScheduleButton();
}

/* ========================= Patient name auto-suggest - Remove duplicates ========================= */
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
    
    const uniquePatients = new Map();
    data.forEach(p => {
      const patientName = p.patient_name || "";
      if (patientName && !uniquePatients.has(patientName)) {
        uniquePatients.set(patientName, p);
      }
    });
    
    if (nameSuggestionsEl) {
      nameSuggestionsEl.innerHTML = "";
      uniquePatients.forEach((p, name) => {
        const d = document.createElement("div");
        d.textContent = name;
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
  setVal2(F.selectCenter, p.select_center);
  
  const setBool2 = (fn, val) => { const n = fn(); if (n) n.checked = val === "true" || val === true; };
  setBool2(F.urineSent, p.urine_sent);
  setBool2(F.ppSent, p.pp_sent);
  setBool2(F.billRequired, p.bill_required);

  if (p.tube_overrides) tubeCountOverrides = safeJSONParse(p.tube_overrides, {});
  if (p.discount) { const n = F.discount(); if (n) n.value = p.discount; }
  if (p.discounted_price) { const n = F.discountedPrice(); if (n) n.value = p.discounted_price; }
  if (p.home_visit_charges) { const n = F.homeVisitCharges(); if (n) n.value = p.home_visit_charges; }
  if (p.cash_received) { const n = F.cashReceived(); if (n) n.value = p.cash_received; }
  if (p.online_received) { const n = F.onlineReceived(); if (n) n.value = p.online_received; }
  // NEW: Load goodwill charges and payment complete from saved patient data
  if (p.goodwill_charges) { const n = F.goodwillCharges(); if (n) n.value = p.goodwill_charges; }
  if (p.payment_complete) { const n = F.paymentComplete(); if (n) n.checked = p.payment_complete === "true" || p.payment_complete === true; }
  updatePaymentFields();
}

/* ========================= Setup Event Listeners ========================= */
/* ========================= Setup Event Listeners ========================= */
function setupEventListeners() {
  const toggle = F.showAllToggle();
  if (toggle) {
    toggle.addEventListener("change", handleToggleChange);
  }
  
  setupSearchDebounce();
  
  const filterDateEl = F.filterDate();
  const clearFilterBtn = F.clearFilterBtn();
  
  if (filterDateEl) {
    filterDateEl.addEventListener("change", filterInProgressEntries);
  }
  
  if (clearFilterBtn) {
    clearFilterBtn.addEventListener("click", clearDateFilter);
  }
  
  // ADD THIS: Setup calculator button
  const calculatorBtn = document.getElementById("calculatorBtn");
  if (calculatorBtn) {
    calculatorBtn.addEventListener("click", function(e) {
      e.preventDefault();
      const calculator = new CalculatorModal();
      calculator.open();
    });
  }
}

// Add this at the very bottom of your JavaScript, before the closing tags
// Direct calculator button initialization (fallback)
document.addEventListener("DOMContentLoaded", function() {
  setTimeout(function() {
    const calcBtn = document.getElementById("calculatorBtn");
    if (calcBtn && !calcBtn.hasAttribute("data-listener")) {
      calcBtn.setAttribute("data-listener", "true");
      calcBtn.addEventListener("click", function(e) {
        e.preventDefault();
        e.stopPropagation();
        console.log("Calculator button clicked");
        const calculator = new CalculatorModal();
        calculator.open();
      });
    }
  }, 500);
});
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

/* ========================= Initialize Custom Time Pickers ========================= */
function initializeTimePickers() {
  const visitTimeInput = F.visitTime();
  const ppTimeInput = F.ppTime();
  
  if (visitTimeInput && !visitTimeInput.classList.contains("custom-time-initialized")) {
    new CustomTimePicker(visitTimeInput);
    visitTimeInput.classList.add("custom-time-initialized");
  }
  
  if (ppTimeInput && !ppTimeInput.classList.contains("custom-time-initialized")) {
    new CustomTimePicker(ppTimeInput);
    ppTimeInput.classList.add("custom-time-initialized");
  }
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

/* ========================= Boot ========================= */
initAccordions();
setDefaults();
initializeTimePickers();
fetchServerList().then(() => {
  renderInProgress();
  setupEventListeners();
  initializeUnifiedSearch();
  initializeBulkAdd();
});

const resetTubeBtn = F.resetTubeBtn();
if (resetTubeBtn) {
  resetTubeBtn.addEventListener("click", resetTubeCounts);
}
