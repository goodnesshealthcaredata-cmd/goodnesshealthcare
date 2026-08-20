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
//  IMAGEKIT CONFIGURATION
// ============================================================
const IMAGEKIT_PUBLIC_KEY = "public_UXa89n/jLVB3Tef6QHxjTABI3U8=";
const IMAGEKIT_URL_ENDPOINT = "https://ik.imagekit.io/xjmper25s";
const CLOUDFLARE_WORKER_URL = "https://wandering-hall-ed75.goodnesshealthcare1.workers.dev";

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
const viewImageFull = document.getElementById('viewImageFull');
const fullImage = document.getElementById('fullImage');
const closeFullImage = document.getElementById('closeFullImage');
const visitListEl = document.getElementById('visitList');
const visitCountEl = document.getElementById('visitCount');

// ============================================================
//  STATE
// ============================================================
let currentEntries = [];
let allEntries = [];
let filteredEntries = [];
let allPatientNames = [];
let editTabs = new Map();
let activeTab = 'added';
let isPermissionError = false;
let lastPatientKey = null;
let isImageViewerOpen = false;
let isViewModalOpen = false;
let isRefreshing = false;
let isLoading = true;

// Pagination state
let pagination = {
    page: 1,
    perPage: 25,
    pageCursors: [null],
    hasNext: false,
    totalLoaded: 0,
    totalFiltered: 0
};

let filterState = {
  sort: 'desc',
  status: 'all',
  fromDate: getFirstDayOfCurrentMonth(),
  toDate: '',
  labs: [true, true, true, true],
  center: 'all',
  visitType: 'all',
  phlebotomist: 'all',
  careOfPerson: 'all',
  doctor: 'all',
  search: ''
};

// Helper function to get first day of current month in YYYY-MM-DD format
function getFirstDayOfCurrentMonth() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}-01`;
}

const formStates = new Map();

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
    b2bVisible: false,
    images: [],
    imageFiles: []
  };
}

function getFormState(formId) {
  if (!formStates.has(formId)) {
    formStates.set(formId, createEmptyFormState());
  }
  return formStates.get(formId);
}

function resetFormState(formId) {
  formStates.set(formId, createEmptyFormState());
}

function deleteFormState(formId) {
  formStates.delete(formId);
}

// ============================================================
//  HTML ESCAPE
// ============================================================
function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ============================================================
//  HELPERS
// ============================================================
function toast(msg, type = 'success') {
  toastEl.textContent = msg;
  toastEl.className = 'toast show ' + type;
  clearTimeout(toastEl._timeout);
  toastEl._timeout = setTimeout(() => toastEl.classList.remove('show'), 3000);
}

function setLoading(btn, loading = true) {
  if (loading) {
    btn.disabled = true;
    btn.innerHTML = '<span class="loading-spinner"></span> Saving...';
  } else {
    btn.disabled = false;
    btn.innerHTML = btn.dataset.originalText || '💾 Save Entry';
  }
}

function formatName(text) {
  if (!text) return '';
  return text.split(' ').map(part => {
    if (/^\d+$/.test(part)) return part;
    return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
  }).join(' ');
}

function formatAddress(text) {
  if (!text) return '';
  return text.split('\n').map(line => {
    return line.replace(/\b\w+\b/g, function(word) {
      if (/^[A-Z]+$/.test(word)) return word;
      if (/\d/.test(word)) return word;
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    });
  }).join('\n');
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

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// ============================================================
//  IMAGE UPLOAD - FIXED with retry and graceful fallback
// ============================================================
function compressImage(file, maxWidth = 1200, quality = 0.8) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = function(e) {
      const img = new Image();
      img.onload = function() {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(function(blob) {
          resolve(blob);
        }, 'image/jpeg', quality);
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Retry helper
async function fetchWithRetry(url, options = {}, retries = 3, delay = 1000) {
  let attempt = 0;
  while (attempt < retries) {
    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return response;
    } catch (err) {
      attempt++;
      if (attempt >= retries) throw err;
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, attempt - 1)));
    }
  }
}

async function getImageKitAuth() {
  try {
    const response = await fetchWithRetry(CLOUDFLARE_WORKER_URL, {}, 3, 1000);
    const data = await response.json();
    if (!data.token || !data.expire || !data.signature) {
      throw new Error('Invalid response from auth server');
    }
    return data;
  } catch (err) {
    console.error('ImageKit auth error:', err);
    throw new Error('Image upload authentication failed: ' + err.message);
  }
}

async function uploadToImageKit(file, patientId, index) {
  try {
    const auth = await getImageKitAuth();
    const filename = `${patientId}_${Date.now()}_${index}.jpg`;
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('fileName', filename);
    formData.append('folder', `patientImages/${patientId}`);
    formData.append('token', auth.token);
    formData.append('expire', auth.expire);
    formData.append('signature', auth.signature);
    formData.append('publicKey', IMAGEKIT_PUBLIC_KEY);
    formData.append('useUniqueFileName', 'true');
    
    const uploadResponse = await fetch('https://upload.imagekit.io/api/v1/files/upload', {
      method: 'POST',
      body: formData
    });
    
    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      throw new Error(`ImageKit upload failed: ${uploadResponse.status} - ${errorText}`);
    }
    
    const result = await uploadResponse.json();
    if (!result.url) {
      throw new Error('ImageKit did not return a URL');
    }
    return result.url;
  } catch (err) {
    console.error('ImageKit upload error:', err);
    throw new Error('Image upload failed. ' + err.message);
  }
}

async function uploadImagesForPatient(patientId, imageFiles, onProgress) {
  const urls = [];
  const total = imageFiles.length;
  
  for (let i = 0; i < total; i++) {
    try {
      const compressedBlob = await compressImage(imageFiles[i]);
      const url = await uploadToImageKit(compressedBlob, patientId, i);
      urls.push(url);
      if (onProgress) {
        const progress = Math.round(((i + 1) / total) * 100);
        onProgress(progress);
      }
    } catch (err) {
      console.error('Error uploading image:', err);
      if (urls.length === 0) throw err;
      toast('Warning: One image failed to upload. Others may have succeeded.', 'error');
    }
  }
  return urls;
}

function handleImageUpload(formId, event) {
  const files = Array.from(event.target.files);
  if (files.length === 0) return;

  const state = getFormState(formId);
  if (!state.imageFiles) state.imageFiles = [];
  if (!state.images) state.images = [];

  files.forEach(file => {
    state.imageFiles.push(file);
    const reader = new FileReader();
    reader.onload = function(evt) {
      state.images.push(evt.target.result);
      renderImages(formId);
      event.target.value = '';
    };
    reader.readAsDataURL(file);
  });
}

function setupImageUpload(formId) {
  const container = document.getElementById(`imageUploadContainer-${formId}`);
  if (!container) return;

  let fileInput = container.querySelector('input[type="file"]');
  if (!fileInput) {
    const uploadBox = container.querySelector('.upload-box');
    if (!uploadBox) {
      const box = document.createElement('div');
      box.className = 'upload-box';
      box.innerHTML = `
        <span class="upload-icon">📷</span>
        <span>Add Images</span>
        <input type="file" accept="image/*" multiple />
      `;
      container.appendChild(box);
      fileInput = box.querySelector('input[type="file"]');
    } else {
      fileInput = uploadBox.querySelector('input[type="file"]');
    }
  }

  if (!fileInput) return;

  fileInput.removeEventListener('change', fileInput._uploadHandler);
  
  fileInput._uploadHandler = function(e) {
    handleImageUpload(formId, e);
  };
  
  fileInput.addEventListener('change', fileInput._uploadHandler);

  renderImages(formId);
}

function renderImages(formId) {
  const container = document.getElementById(`imageUploadContainer-${formId}`);
  if (!container) return;

  const state = getFormState(formId);
  const images = state.images || [];

  let uploadBox = container.querySelector('.upload-box');
  if (!uploadBox) {
    uploadBox = document.createElement('div');
    uploadBox.className = 'upload-box';
    uploadBox.innerHTML = `
      <span class="upload-icon">📷</span>
      <span>Add Images</span>
      <input type="file" accept="image/*" multiple />
    `;
    container.appendChild(uploadBox);
    
    const fileInput = uploadBox.querySelector('input[type="file"]');
    if (fileInput) {
      fileInput.removeEventListener('change', fileInput._uploadHandler);
      fileInput._uploadHandler = function(e) {
        handleImageUpload(formId, e);
      };
      fileInput.addEventListener('change', fileInput._uploadHandler);
    }
  }

  const thumbs = container.querySelectorAll('.image-thumb');
  thumbs.forEach(el => el.remove());

  images.forEach((imgData, index) => {
    const thumb = document.createElement('div');
    thumb.className = 'image-thumb';
    thumb.innerHTML = `
      <img src="${escapeHtml(imgData)}" alt="Uploaded image" onclick="openFullImage('${escapeHtml(imgData)}')" />
      <button class="remove-image" data-form="${escapeHtml(formId)}" data-index="${index}">✕</button>
    `;
    container.insertBefore(thumb, uploadBox);

    const removeBtn = thumb.querySelector('.remove-image');
    if (removeBtn) {
      removeBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        const formId = this.dataset.form;
        const index = parseInt(this.dataset.index);
        const state = getFormState(formId);
        
        if (state.imageFiles && state.imageFiles.length > index) {
          state.imageFiles.splice(index, 1);
        }
        if (state.images) {
          state.images.splice(index, 1);
          renderImages(formId);
        }
      });
    }
  });
}

// ============================================================
//  FIREBASE DATA LOADING
// ============================================================
async function loadPatientIndexPage(pageSize = 25, startAfterKey = null, startAfterTimestamp = null) {
  try {
    let query = db.ref('patientIndex')
      .orderByChild('visitTimestamp')
      .limitToFirst(pageSize + 1);
    
    if (startAfterKey && startAfterTimestamp !== null) {
      query = query.startAt(startAfterTimestamp, startAfterKey);
    }
    
    const snap = await query.once('value');
    const data = snap.val();
    const entries = [];
    let hasNext = false;
    let nextCursor = null;
    
    if (data) {
      const keys = Object.keys(data);
      
      keys.sort((a, b) => {
        const valA = data[a].visitTimestamp || 0;
        const valB = data[b].visitTimestamp || 0;
        if (valA === valB) {
          return b.localeCompare(a);
        }
        return valB - valA;
      });
      
      let startIndex = 0;
      if (startAfterKey) {
        const cursorIndex = keys.findIndex(key => key === startAfterKey);
        if (cursorIndex !== -1) {
          startIndex = cursorIndex + 1;
        }
      }
      
      let resultKeys = keys.slice(startIndex);
      
      if (resultKeys.length > pageSize) {
        hasNext = true;
        resultKeys = resultKeys.slice(0, pageSize);
      }
      
      for (const key of resultKeys) {
        entries.push({
          ...data[key],
          _firebaseKey: key
        });
      }
      
      if (entries.length > 0) {
        const lastEntry = entries[entries.length - 1];
        nextCursor = {
          key: lastEntry._firebaseKey,
          timestamp: lastEntry.visitTimestamp || 0
        };
      }
    }
    
    console.log('[Added Entries] Loaded:', entries.length, 'entries from Firebase');
    return { entries, hasNext, nextCursor };
  } catch (err) {
    handleFirebaseError(err);
    return { entries: [], hasNext: false, nextCursor: null };
  }
}

// Load ALL entries from patientIndex
async function loadAllPatientIndex() {
  try {
    const snap = await db.ref('patientIndex').once('value');
    const data = snap.val();
    const entries = [];
    
    if (data) {
      const keys = Object.keys(data);
      keys.sort((a, b) => {
        const valA = data[a].visitTimestamp || 0;
        const valB = data[b].visitTimestamp || 0;
        if (valA === valB) {
          return b.localeCompare(a);
        }
        return valB - valA;
      });
      
      for (const key of keys) {
        entries.push({
          ...data[key],
          _firebaseKey: key
        });
      }
    }
    
    console.log('[All Entries] Loaded all:', entries.length, 'entries');
    return entries;
  } catch (err) {
    handleFirebaseError(err);
    return [];
  }
}

async function loadPatientRecord(patientId) {
  try {
    const snap = await db.ref(`patients/${patientId}`).once('value');
    const data = snap.val();
    if (data) {
      return { ...data, _firebaseKey: patientId };
    }
    return null;
  } catch (err) {
    handleFirebaseError(err);
    return null;
  }
}

async function loadPatientNamesForAutocomplete() {
  try {
    const snap = await db.ref('patientIndex').once('value');
    const data = snap.val();
    
    allPatientNames = [];
    if (data) {
      const entries = Object.entries(data);
      entries.sort((a, b) => {
        const tsA = a[1].visitTimestamp || 0;
        const tsB = b[1].visitTimestamp || 0;
        return tsB - tsA;
      });
      
      entries.forEach(([key, val]) => {
        if (val.patientName) {
          allPatientNames.push({
            name: val.patientName,
            key: key,
            data: val
          });
        }
      });
    }
    
    allPatientNames.push({
      name: 'Abc Xyz',
      key: 'sample',
      data: { patientName: 'Abc Xyz' },
      isSample: true
    });
    
    console.log('[Autocomplete] Loaded', allPatientNames.length, 'patient names');
  } catch (err) {
    console.warn('Could not load patient names:', err);
  }
}

async function searchAllPatients(searchTerm) {
  if (!searchTerm || searchTerm.trim().length < 2) {
    return [];
  }
  
  try {
    const searchLower = searchTerm.toLowerCase().trim();
    
    let snap = await db.ref('patientIndex')
      .orderByChild('patientNameLower')
      .startAt(searchLower)
      .endAt(searchLower + '\uf8ff')
      .once('value');
    
    let data = snap.val();
    let results = [];
    
    if (data) {
      for (const key of Object.keys(data)) {
        results.push({
          ...data[key],
          _firebaseKey: key
        });
      }
    }
    
    if (results.length === 0) {
      console.log('[Search] No prefix results, trying contains search...');
      const allSnap = await db.ref('patientIndex').once('value');
      const allData = allSnap.val();
      if (allData) {
        for (const key of Object.keys(allData)) {
          const patientName = allData[key].patientName || '';
          if (patientName.toLowerCase().includes(searchLower)) {
            results.push({
              ...allData[key],
              _firebaseKey: key
            });
          }
        }
      }
    }
    
    console.log('[Search] Found', results.length, 'results for:', searchTerm);
    return results;
  } catch (err) {
    console.warn('Search error:', err);
    return [];
  }
}

// ============================================================
//  ENTRY PROGRESS
// ============================================================
function getEntryProgress(entry) {
  const progress = { patient: 0, test: 0, visit: 0, report: 0, payment: 0 };

  // ---- PATIENT PROGRESS ----
  let patientFilled = 0;
  const patientFields = ['patientName', 'age', 'gender', 'address', 'doctorName', 'careOfPerson'];
  
  patientFields.forEach(field => {
    if (entry[field] && entry[field].toString().trim().length > 0) {
      patientFilled++;
    }
  });
  
  if (entry.hasContactNumber === true) {
    patientFilled++;
  }
  
  const totalPatientFields = 7;
  progress.patient = Math.min(100, Math.round((patientFilled / totalPatientFields) * 100));

  // ---- TEST PROGRESS ----
  let hasTest = false;
  let totalSelected = 0;
  
  if (entry.labSelections && typeof entry.labSelections === 'object') {
    for (let labId = 1; labId <= 4; labId++) {
      const labData = entry.labSelections[labId];
      if (labData) {
        const tests = (labData.tests || []).length;
        const packages = (labData.packages || []).length;
        if (tests > 0 || packages > 0) {
          hasTest = true;
          totalSelected += tests + packages;
        }
      }
    }
  }
  
  if (!hasTest && entry.labs && Array.isArray(entry.labs) && entry.labs.length > 0) {
    hasTest = true;
    totalSelected = entry.labs.length;
  }
  
  if (!hasTest && entry.hasTests === true) {
    hasTest = true;
    totalSelected = 1;
  }
  
  progress.test = hasTest ? 100 : 0;

  // ---- VISIT PROGRESS ----
  let visitFilled = 0;
  const visitFields = ['center', 'visitType', 'visitDate', 'visitTime', 'phlebotomist'];
  
  visitFields.forEach(field => {
    if (entry[field] && entry[field].toString().trim().length > 0) {
      visitFilled++;
    }
  });
  
  const ppSelected = isPPSelectedForEntry(entry);
  const extraSelected = isExtraCollectionSelectedForEntry(entry);
  
  if (ppSelected) {
    if (entry.ppTime && entry.ppTime.toString().trim().length > 0) visitFilled++;
    if (entry.ppPhlebotomist && entry.ppPhlebotomist.toString().trim().length > 0) visitFilled++;
  }
  
  if (extraSelected) {
    if (entry.extraCollectionTime && entry.extraCollectionTime.toString().trim().length > 0) visitFilled++;
    if (entry.extraCollectionPhlebotomist && entry.extraCollectionPhlebotomist.toString().trim().length > 0) visitFilled++;
  }
  
  let totalVisitFields = 5;
  if (ppSelected) totalVisitFields += 2;
  if (extraSelected) totalVisitFields += 2;
  
  progress.visit = Math.min(100, Math.round((visitFilled / totalVisitFields) * 100));

  // ---- REPORT PROGRESS ----
  let reportChecked = 0;
  let reportTotal = 0;

  if (entry.totalReports !== undefined && entry.totalReports > 0) {
    reportTotal += entry.totalReports;
    reportChecked += entry.receivedReports || 0;
  }

  if (entry.onlineReportRequired) {
    reportTotal++;
    if (entry.onlineReportSent) reportChecked++;
  }

  if (entry.reportDeliveryRequired) {
    reportTotal++;
    if (entry.reportDelivered) reportChecked++;
  }

  if (entry.billDeliveryRequired) {
    reportTotal++;
    if (entry.billDelivered) reportChecked++;
  }

  progress.report = reportTotal > 0 ? Math.round((reportChecked / reportTotal) * 100) : 0;

  // ---- PAYMENT PROGRESS ----
  let paymentPct = 0;
  const finalPrice = entry.finalPrice || 0;
  
  if (finalPrice > 0) {
    const pending = entry.pendingPayment || 0;
    
    if (pending !== 0) {
      paymentPct = 50;
    } else {
      const careOf = entry.careOfPerson || '';
      if (careOf && careOf.toLowerCase() !== 'none') {
        if (entry.goodwillCharges && entry.goodwillCharges > 0) {
          paymentPct = 100;
        } else {
          paymentPct = 75;
        }
      } else {
        paymentPct = 100;
      }
    }
  }
  
  progress.payment = paymentPct;

  return progress;
}

// ============================================================
//  LABS - ROBUST getLabsForEntry()
// ============================================================
function getLabsForEntry(entry) {
  if (!entry) return [];
  
  const labs = [];
  
  if (entry.labs && Array.isArray(entry.labs)) {
    entry.labs.forEach(lab => {
      const numLab = Number(lab);
      if (!isNaN(numLab) && numLab >= 1 && numLab <= 4 && !labs.includes(numLab)) {
        labs.push(numLab);
      }
    });
    if (labs.length > 0) return labs;
  }
  
  if (entry.labSelections && typeof entry.labSelections === 'object') {
    for (let labId = 1; labId <= 4; labId++) {
      const labData = entry.labSelections[labId];
      if (labData && typeof labData === 'object') {
        const hasTests = Array.isArray(labData.tests) && labData.tests.length > 0;
        const hasPackages = Array.isArray(labData.packages) && labData.packages.length > 0;
        if (hasTests || hasPackages) {
          labs.push(labId);
        }
      }
    }
    if (labs.length > 0) return labs;
  }
  
  for (let labId = 1; labId <= 4; labId++) {
    const key = labId.toString();
    if (entry[key] && typeof entry[key] === 'object') {
      const labData = entry[key];
      const hasTests = Array.isArray(labData.tests) && labData.tests.length > 0;
      const hasPackages = Array.isArray(labData.packages) && labData.packages.length > 0;
      if (hasTests || hasPackages) {
        labs.push(labId);
      }
    }
  }
  
  return [...new Set(labs)];
}

// ============================================================
//  LAB COLOR CODING
// ============================================================
function getEntryStyle(labs) {
  if (!labs || labs.length === 0) return '';
  
  const sortedLabs = [...labs].sort((a, b) => a - b);
  
  if (sortedLabs.length === 1) {
    const labId = sortedLabs[0];
    const color = LAB_COLORS[labId];
    if (!color) return '';
    return `background: ${color.bg} !important; background-color: ${color.bg} !important; background-image: none !important; border-left: 5px solid ${color.border} !important;`;
  }
  
  const colors = sortedLabs.map(labId => {
    const color = LAB_COLORS[labId];
    return color ? color.bg : '#ffffff';
  });
  
  const total = colors.length;
  const stops = colors.map((color, index) => {
    const startPct = (index / total) * 100;
    const endPct = ((index + 1) / total) * 100;
    return `${color} ${startPct}%, ${color} ${endPct}%`;
  });
  
  return `background: linear-gradient(to right, ${stops.join(', ')}) !important; background-color: transparent !important; background-image: linear-gradient(to right, ${stops.join(', ')}) !important; border-left: 5px solid transparent !important;`;
}

function getEntryGradientClass(entry) {
  const labs = getLabsForEntry(entry);
  if (labs.length === 0) return '';
  if (labs.length === 1) {
    return 'gradient-single-' + labs[0];
  }
  const sorted = labs.sort((a, b) => a - b);
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

function isPPSelectedForEntry(entry) {
  if (entry.isPPSelected !== undefined) {
    return entry.isPPSelected === true;
  }
  if (entry.labSelections) {
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
  }
  return false;
}

function isExtraCollectionSelectedForEntry(entry) {
  if (entry.isExtraSelected !== undefined) {
    return entry.isExtraSelected === true;
  }
  if (entry.labSelections) {
    for (let labId = 1; labId <= 4; labId++) {
      const labData = entry.labSelections[labId];
      if (!labData) continue;
      if (labData.tests) {
        for (const test of labData.tests) {
          if (test.id === 'extra-collection' || test.generalName === 'Extra Collection') return true;
        }
      }
      if (labData.packages) {
        for (const pkg of labData.packages) {
          if (pkg.tests) {
            for (const test of pkg.tests) {
              if (test.selected !== false) {
                if (test.generalName === 'Extra Collection' || test.id === 'extra-collection') return true;
              }
            }
          }
        }
      }
    }
  }
  return false;
}

// ============================================================
//  FILTER ENTRIES
// ============================================================
function filterEntries(entries) {
  const status = filterState.status;
  const fromDate = filterState.fromDate;
  const toDate = filterState.toDate;
  const selectedLabs = filterState.labs;
  const center = filterState.center;
  const visitType = filterState.visitType;
  const phlebotomist = filterState.phlebotomist;
  const careOfPerson = filterState.careOfPerson;
  const doctor = filterState.doctor;
  const search = filterState.search.toLowerCase().trim();

  let filtered = entries;

  console.log('[Filter] Before filters:', filtered.length);

  if (search) {
    filtered = filtered.filter(entry => {
      const name = (entry.patientName || '').toLowerCase();
      return name.includes(search);
    });
  }

  if (status !== 'all') {
    filtered = filtered.filter(entry => {
      const progress = getEntryProgress(entry);
      
      switch(status) {
        case 'patient-pending':
          return progress.patient < 100;
        case 'visit-pending':
          return progress.visit < 100;
        case 'report-received-pending': {
          // FIXED: Check if ANY report receive checkbox is unchecked
          if (entry.reportsReceived && typeof entry.reportsReceived === 'object') {
            const values = Object.values(entry.reportsReceived);
            // If there are any false values, then report received is pending
            return values.some(v => v === false);
          }
          // If no reportsReceived data exists, check if there are any tests
          // If there are tests but no reportsReceived, consider it pending
          if (entry.hasTests === true || (entry.labs && entry.labs.length > 0)) {
            return true;
          }
          return false;
        }
        case 'report-online-pending':
          return entry.onlineReportRequired === true && entry.onlineReportSent !== true;
        case 'report-delivery-pending':
          return entry.reportDeliveryRequired === true && entry.reportDelivered !== true;
        case 'final-price-pending':
          return !entry.finalPrice || entry.finalPrice <= 0;
        case 'payment-pending':
          return entry.pendingPayment && entry.pendingPayment > 0;
        case 'goodwill-pending': {
          const careOf = entry.careOfPerson || '';
          if (careOf && careOf.toLowerCase() !== 'none') {
            return !entry.goodwillCharges || entry.goodwillCharges <= 0;
          }
          return false;
        }
        case 'pending':
          return progress.patient < 100 || progress.test < 100 || 
                 progress.visit < 100 || progress.report < 100 || progress.payment < 100;
        default:
          return true;
      }
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
      
      if (!entryLabs || entryLabs.length === 0) {
        return true;
      }
      
      return entryLabs.some(lab => activeLabs.includes(lab));
    });
  }

  if (center !== 'all') {
    filtered = filtered.filter(entry => {
      const entryCenter = entry.center || '';
      return entryCenter === center;
    });
  }
  if (visitType !== 'all') {
    filtered = filtered.filter(entry => {
      const entryVisitType = entry.visitType || '';
      return entryVisitType === visitType;
    });
  }
  if (phlebotomist !== 'all') {
    filtered = filtered.filter(entry => {
      const entryPhlebotomist = entry.phlebotomist || '';
      return entryPhlebotomist === phlebotomist;
    });
  }
  if (careOfPerson !== 'all') {
    filtered = filtered.filter(entry => {
      const entryCareOf = entry.careOfPerson || '';
      return entryCareOf === careOfPerson;
    });
  }
  if (doctor !== 'all') {
    filtered = filtered.filter(entry => {
      const entryDoctor = entry.doctorName || '';
      return entryDoctor === doctor;
    });
  }

  console.log('[Filter] After filters:', filtered.length);
  return filtered;
}

// ============================================================
//  APPLY FILTERS AND PAGINATE
// ============================================================
function applyFiltersAndPaginate() {
  filteredEntries = filterEntries(allEntries);
  
  if (filterState.sort === 'asc') {
    filteredEntries = [...filteredEntries].reverse();
  }
  
  pagination.totalFiltered = filteredEntries.length;
  
  const totalPages = Math.ceil(pagination.totalFiltered / pagination.perPage) || 1;
  if (pagination.page > totalPages) {
    pagination.page = 1;
  }
  
  const startIndex = (pagination.page - 1) * pagination.perPage;
  const endIndex = startIndex + pagination.perPage;
  const pageEntries = filteredEntries.slice(startIndex, endIndex);
  
  pagination.hasNext = endIndex < filteredEntries.length;
  pagination.totalLoaded = pageEntries.length;
  
  currentEntries = pageEntries;
  
  updateEntryCount();
  
  renderEntries(currentEntries);
  renderPagination();
  
  renderVisitScheduleFromIndex(currentEntries);
  populateDynamicFilters();
  populateVisitPhlebotomistFilter();
}

// ============================================================
//  UPDATE ENTRY COUNT
// ============================================================
function updateEntryCount() {
  const countEl = document.getElementById('entryCount');
  if (!countEl) return;
  
  const total = pagination.totalFiltered;
  const totalAll = allEntries.length;
  
  if (isLoading) {
    countEl.textContent = 'Loading entries...';
    return;
  }
  
  if (total === 0) {
    countEl.textContent = '0 Entries';
    return;
  }
  
  const hasActiveFilters = filterState.status !== 'all' || 
                          filterState.fromDate || 
                          filterState.toDate || 
                          filterState.center !== 'all' ||
                          filterState.visitType !== 'all' ||
                          filterState.phlebotomist !== 'all' ||
                          filterState.careOfPerson !== 'all' ||
                          filterState.doctor !== 'all' ||
                          filterState.search ||
                          !filterState.labs.every(v => v === true);
  
  if (hasActiveFilters && total < totalAll) {
    countEl.textContent = total + ' Entries (filtered from ' + totalAll + ' total)';
  } else {
    countEl.textContent = total + ' Entries';
  }
}

// ============================================================
//  LOAD ENTRIES
// ============================================================
async function loadEntries() {
  isLoading = true;
  updateEntryCount();
  
  await loadAllEntries();
  await loadPatientNamesForAutocomplete();
  
  if (!entriesFilters.innerHTML) {
    buildFiltersUI();
  }
  
  applyFiltersAndPaginate();
  
  populateDynamicFilters();
  populateVisitPhlebotomistFilter();
  
  isLoading = false;
  updateEntryCount();
}

async function loadAllEntries() {
  allEntries = await loadAllPatientIndex();
  console.log('[Load] Total entries loaded:', allEntries.length);
}

async function loadEntriesPage(page, perPage = pagination.perPage) {
  pagination.page = page || 1;
  pagination.perPage = perPage || 25;
  applyFiltersAndPaginate();
}

// ============================================================
//  RENDER ENTRIES
// ============================================================
function renderEntries(entries) {
  if (isLoading) {
    entryListEl.innerHTML = '<div class="empty-msg">Loading entries...</div>';
    return;
  }

  if (!entries || entries.length === 0) {
    entryListEl.innerHTML = '<div class="empty-msg">No entries found matching your filters.</div>';
    return;
  }

  let html = '';
  entries.forEach(rec => {
    const name = escapeHtml(rec.patientName || 'Unknown');
    const labs = getLabsForEntry(rec);
    const styleStr = getEntryStyle(labs);
    const gradientClass = getEntryGradientClass(rec);
    const progress = getEntryProgress(rec);

    html += `
      <div class="entry-item ${gradientClass}">
        <div class="entry-lab-bg" style="${styleStr}">
          <div class="entry-content">
            <div class="entry-left">
              <div class="patient-name">${name}</div>
            </div>
            <div class="entry-actions">
              <button class="view-btn" data-key="${escapeHtml(rec._firebaseKey)}">👁 View</button>
              <button class="edit-btn" data-key="${escapeHtml(rec._firebaseKey)}">✎ Edit</button>
              <button class="del-btn" data-key="${escapeHtml(rec._firebaseKey)}">✕ Delete</button>
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
      </div>
    `;
  });

  entryListEl.innerHTML = html;

  entryListEl.querySelectorAll('.view-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const key = this.dataset.key;
      loadAndViewPatient(key);
    });
  });

  entryListEl.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const key = this.dataset.key;
      loadAndEditPatient(key);
    });
  });

  entryListEl.querySelectorAll('.del-btn').forEach(btn => {
    btn.addEventListener('click', async function() {
      const key = this.dataset.key;
      const rec = allEntries.find(e => e._firebaseKey === key);
      if (!rec) return;
      if (!confirm(`Delete entry for "${rec.patientName || 'Unknown'}"?`)) return;
      await deletePatient(key);
    });
  });

  renderPagination();
}

// ============================================================
//  RENDER PAGINATION
// ============================================================
function renderPagination() {
  const currentPage = pagination.page;
  const totalPages = Math.ceil(pagination.totalFiltered / pagination.perPage) || 1;
  
  let html = `
    <div class="pagination-container">
      <div class="per-page">
        <span>Entries per page:</span>
        <select id="perPageSelect">
          <option value="25" ${pagination.perPage === 25 ? 'selected' : ''}>25</option>
          <option value="50" ${pagination.perPage === 50 ? 'selected' : ''}>50</option>
          <option value="100" ${pagination.perPage === 100 ? 'selected' : ''}>100</option>
        </select>
      </div>
      <div class="pagination-controls">
        <button class="prev-btn" ${currentPage <= 1 ? 'disabled' : ''}>← Previous</button>
        <span class="page-info">Page ${currentPage} of ${totalPages}</span>
        <button class="next-btn" ${currentPage >= totalPages ? 'disabled' : ''}>Next →</button>
      </div>
    </div>
  `;

  paginationContainer.innerHTML = html;

  const perPageSelect = document.getElementById('perPageSelect');
  if (perPageSelect) {
    perPageSelect.addEventListener('change', function() {
      const newPerPage = parseInt(this.value);
      pagination.perPage = newPerPage;
      pagination.page = 1;
      applyFiltersAndPaginate();
    });
  }

  const prevBtn = paginationContainer.querySelector('.prev-btn');
  if (prevBtn) {
    prevBtn.addEventListener('click', function() {
      if (pagination.page > 1) {
        pagination.page--;
        applyFiltersAndPaginate();
      }
    });
  }

  const nextBtn = paginationContainer.querySelector('.next-btn');
  if (nextBtn) {
    nextBtn.addEventListener('click', function() {
      const totalPages = Math.ceil(pagination.totalFiltered / pagination.perPage) || 1;
      if (pagination.page < totalPages) {
        pagination.page++;
        applyFiltersAndPaginate();
      }
    });
  }
}

// ============================================================
//  VIEW/EDIT/DELETE
// ============================================================
async function loadAndViewPatient(key) {
  const fullData = await loadPatientRecord(key);
  if (fullData) {
    openViewModal(fullData);
  }
}

async function loadAndEditPatient(key) {
  const fullData = await loadPatientRecord(key);
  if (fullData) {
    openEditTab(key, fullData);
  }
}

async function deletePatient(key) {
  try {
    const updates = {};
    updates[`patients/${key}`] = null;
    updates[`patientIndex/${key}`] = null;
    await db.ref().update(updates);
    
    allEntries = allEntries.filter(e => e._firebaseKey !== key);
    allPatientNames = allPatientNames.filter(e => e.key !== key);
    
    toast('Entry deleted successfully.', 'success');
    
    applyFiltersAndPaginate();
    populateDynamicFilters();
    populateVisitPhlebotomistFilter();
  } catch (err) {
    handleFirebaseError(err);
  }
}

// ============================================================
//  SEARCH
// ============================================================
let searchTimeout = null;

async function performGlobalSearch(searchTerm) {
  const searchInput = document.getElementById('filterSearch');
  if (!searchInput) return;
  
  const value = searchInput.value.trim();
  
  if (!value || value.length < 2) {
    filterState.search = '';
    applyFiltersAndPaginate();
    return;
  }
  
  filterState.search = value;
  
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }
  
  searchTimeout = setTimeout(async () => {
    try {
      applyFiltersAndPaginate();
    } catch (err) {
      console.warn('Search error:', err);
      toast('Search failed. Please try again.', 'error');
    }
  }, 400);
}

function renderSearchResults(entries, totalFound) {
  if (isLoading) {
    entryListEl.innerHTML = '<div class="empty-msg">Loading entries...</div>';
    return;
  }

  if (!entries || entries.length === 0) {
    entryListEl.innerHTML = '<div class="empty-msg">No patients found matching your search.</div>';
    const countEl = document.getElementById('entryCount');
    if (countEl) countEl.textContent = '0 Entries';
    return;
  }

  const countEl = document.getElementById('entryCount');
  if (countEl) {
    countEl.textContent = entries.length + ' entries found (out of ' + totalFound + ' total)';
  }

   let html = '';
  entries.forEach(rec => {
    const name = escapeHtml(rec.patientName || 'Unknown');
    const labs = getLabsForEntry(rec);
    const styleStr = getEntryStyle(labs);
    const gradientClass = getEntryGradientClass(rec);
    const progress = getEntryProgress(rec);

    html += `
      <div class="entry-item ${gradientClass}">
        <div class="entry-lab-bg" style="${styleStr}">
          <div class="entry-content">
            <div class="entry-left">
              <div class="patient-name">${name}</div>
            </div>
            <div class="entry-actions">
              <button class="view-btn" data-key="${escapeHtml(rec._firebaseKey)}">👁 View</button>
              <button class="edit-btn" data-key="${escapeHtml(rec._firebaseKey)}">✎ Edit</button>
              <button class="del-btn" data-key="${escapeHtml(rec._firebaseKey)}">✕ Delete</button>
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
      </div>
    `;
  });

  entryListEl.innerHTML = html;

  entryListEl.querySelectorAll('.view-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const key = this.dataset.key;
      loadAndViewPatient(key);
    });
  });

  entryListEl.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const key = this.dataset.key;
      loadAndEditPatient(key);
    });
  });

  entryListEl.querySelectorAll('.del-btn').forEach(btn => {
    btn.addEventListener('click', async function() {
      const key = this.dataset.key;
      if (!confirm('Delete this entry?')) return;
      await deletePatient(key);
      performGlobalSearch(filterState.search);
    });
  });
}

// ============================================================
//  SAVE PATIENT
// ============================================================
function createIndexData(data, key) {
  let visitTimestamp = 0;
  if (data.visitDate && data.visitTime) {
    try {
      visitTimestamp = new Date(`${data.visitDate}T${data.visitTime}:00`).getTime();
      if (isNaN(visitTimestamp) || !Number.isFinite(visitTimestamp)) {
        visitTimestamp = 0;
      }
    } catch (e) {
      visitTimestamp = 0;
    }
  }
  
  // Extract labs
  const labs = [];
  let hasTests = false;
  
  if (data.labSelections && typeof data.labSelections === 'object') {
    for (let labId = 1; labId <= 4; labId++) {
      const labData = data.labSelections[labId];
      if (labData && typeof labData === 'object') {
        const hasLabTests = Array.isArray(labData.tests) && labData.tests.length > 0;
        const hasLabPackages = Array.isArray(labData.packages) && labData.packages.length > 0;
        if (hasLabTests || hasLabPackages) {
          labs.push(labId);
          hasTests = true;
        }
      }
    }
  }
  
  if (labs.length === 0 && data.labSelections === undefined) {
    for (let labId = 1; labId <= 4; labId++) {
      const key = labId.toString();
      if (data[key] && typeof data[key] === 'object') {
        const labData = data[key];
        const hasLabTests = Array.isArray(labData.tests) && labData.tests.length > 0;
        const hasLabPackages = Array.isArray(labData.packages) && labData.packages.length > 0;
        if (hasLabTests || hasLabPackages) {
          labs.push(labId);
          hasTests = true;
        }
      }
    }
  }
  
  // Determine if any contact has a number
  let hasContactNumber = false;
  if (data.contacts && Array.isArray(data.contacts)) {
    hasContactNumber = data.contacts.some(c => c.number && c.number.trim().length > 0);
  }
  
  // Report progress data
  let totalReports = 0;
  let receivedReports = 0;
  let reportsReceived = {};
  
  if (data.reportsReceived && typeof data.reportsReceived === 'object') {
    // Store the full reportsReceived object for filtering
    reportsReceived = { ...data.reportsReceived };
    const values = Object.values(data.reportsReceived);
    totalReports = values.length;
    receivedReports = values.filter(v => v === true).length;
  }
  
  // Payment pending
  let pendingPayment = data.pendingPayment;
  if (pendingPayment === undefined && data.finalPrice && data.cashReceived !== undefined && data.onlineReceived !== undefined) {
    const cash = parseFloat(data.cashReceived) || 0;
    const online = parseFloat(data.onlineReceived) || 0;
    const finalPrice = parseFloat(data.finalPrice) || 0;
    pendingPayment = finalPrice - cash - online;
  }

  // Detect PP and Extra Collection selection
  let isPPSelected = false;
  let isExtraSelected = false;
  if (data.labSelections && typeof data.labSelections === 'object') {
    for (let labId = 1; labId <= 4; labId++) {
      const labData = data.labSelections[labId];
      if (!labData) continue;
      if (labData.tests) {
        for (const test of labData.tests) {
          if (test.id === 'pp' || test.generalName === 'PP') isPPSelected = true;
          if (test.id === 'extra-collection' || test.generalName === 'Extra Collection') isExtraSelected = true;
        }
      }
      if (labData.packages) {
        for (const pkg of labData.packages) {
          if (pkg.tests) {
            for (const test of pkg.tests) {
              if (test.selected !== false) {
                if (test.generalName === 'PP' || test.id === 'pp') isPPSelected = true;
                if (test.generalName === 'Extra Collection' || test.id === 'extra-collection') isExtraSelected = true;
              }
            }
          }
        }
      }
    }
  }
  
  return {
    patientName: data.patientName || '',
    patientNameLower: (data.patientName || '').trim().toLowerCase(),
    age: data.age || '',
    gender: data.gender || '',
    address: data.address || '',
    doctorName: data.doctorName || '',
    careOfPerson: data.careOfPerson || '',
    hasContactNumber: hasContactNumber,
    visitDate: data.visitDate || '',
    visitTime: data.visitTime || '',
    visitTimestamp: visitTimestamp,
    labs: labs,
    center: data.center || '',
    visitType: data.visitType || '',
    phlebotomist: data.phlebotomist || '',
    ppTime: data.ppTime || '',
    ppPhlebotomist: data.ppPhlebotomist || '',
    extraCollectionTime: data.extraCollectionTime || '',
    extraCollectionPhlebotomist: data.extraCollectionPhlebotomist || '',
    visitDone: data.visitDone || false,
    visitDoneTime: data.visitDoneTime || null,
    ppVisitDone: data.ppVisitDone || false,
    ppVisitDoneTime: data.ppVisitDoneTime || null,
    extraVisitDone: data.extraVisitDone || false,
    extraVisitDoneTime: data.extraVisitDoneTime || null,
    finalPrice: data.finalPrice || 0,
    pendingPayment: pendingPayment || 0,
    hasTests: hasTests,
    onlineReportRequired: data.onlineReportRequired || false,
    onlineReportSent: data.onlineReportSent || false,
    reportDeliveryRequired: data.reportDeliveryRequired || false,
    reportDelivered: data.reportDelivered || false,
    billDeliveryRequired: data.billDeliveryRequired || false,
    billDelivered: data.billDelivered || false,
    totalReports: totalReports,
    receivedReports: receivedReports,
    cashReceived: data.cashReceived || 0,
    onlineReceived: data.onlineReceived || 0,
    goodwillCharges: data.goodwillCharges || 0,
    isPPSelected: isPPSelected,
    isExtraSelected: isExtraSelected,
    // CRITICAL FIX: Store reportsReceived in index for filtering
    reportsReceived: reportsReceived
  };
}

async function savePatient(formId, isEdit = false, existingKey = null) {
  const validation = validateForm(formId);
  if (!validation.isValid) {
    const firstError = validation.firstError;
    if (firstError) {
      focusField(firstError, formId);
    }
    toast('Please fill in all required fields.', 'error');
    return false;
  }

  const state = getFormState(formId);
  const data = gatherFormData(formId);
  const saveBtn = document.getElementById(`saveBtn-${formId}`);

  // Validate essential data
  if (!data.patientName || !data.patientName.trim()) {
    toast('Patient name is required.', 'error');
    return false;
  }
  if (!data.visitDate) {
    toast('Visit date is required.', 'error');
    return false;
  }

  if (saveBtn) {
    saveBtn.disabled = true;
    if (state.imageFiles && state.imageFiles.length > 0) {
      saveBtn.innerHTML = `📤 Uploading ${state.imageFiles.length} image(s)...`;
    } else {
      saveBtn.innerHTML = '<span class="loading-spinner"></span> Saving...';
    }
  }

  try {
    let patientId = existingKey;

    // --- Step 1: Upload images (if any) ---
    let imageUrls = [];
    if (state.imageFiles && state.imageFiles.length > 0) {
      if (!patientId) {
        const newRef = db.ref('patients').push();
        patientId = newRef.key;
        console.log('[savePatient] Generated new patientId:', patientId);
      }

      try {
        imageUrls = await uploadImagesForPatient(patientId, state.imageFiles, (progress) => {
          if (saveBtn) {
            saveBtn.innerHTML = `📤 Uploading ${progress}%...`;
          }
        });
      } catch (uploadErr) {
        console.warn('Image upload failed, but patient will still be saved without images:', uploadErr);
        toast('Warning: Images could not be uploaded. Patient saved without images.', 'error');
        imageUrls = [];
        data.images = state.images.filter(img =>
          typeof img === 'string' && img.startsWith('https://ik.imagekit.io/')
        );
      }

      if (imageUrls.length > 0) {
        const existingImages = state.images.filter(img =>
          typeof img === 'string' && img.startsWith('https://ik.imagekit.io/')
        );
        data.images = [...existingImages, ...imageUrls];
      }
    } else {
      data.images = state.images.filter(img =>
        typeof img === 'string' && img.startsWith('https://ik.imagekit.io/')
      );
    }

    delete data.imageFiles;

    // --- Step 2: Ensure patientId is set for new entries ---
    if (!patientId) {
      const newRef = db.ref('patients').push();
      patientId = newRef.key;
      console.log('[savePatient] Generated patientId (no images):', patientId);
    }

    // --- Step 3: Prepare index data ---
    const indexData = createIndexData(data, patientId);
    console.log('[savePatient] Saving patientId:', patientId, 'isEdit:', isEdit, 'existingKey:', existingKey);

    // --- Step 4: Atomic update ---
    const updates = {};
    const patientPath = `patients/${patientId}`;
    const indexPath = `patientIndex/${patientId}`;

    updates[patientPath] = data;
    updates[indexPath] = indexData;

    if (isEdit && existingKey && patientId !== existingKey) {
      console.error('[savePatient] Key mismatch! existingKey:', existingKey, 'patientId:', patientId);
      toast('Error: Patient key mismatch. Please refresh and try again.', 'error');
      return false;
    }

    await db.ref().update(updates);

    toast(isEdit ? 'Entry updated successfully.' : 'Entry saved successfully.', 'success');

    // --- Step 5: Reload and refresh UI ---
    await loadAllEntries();
    applyFiltersAndPaginate();
    await loadPatientNamesForAutocomplete();
    populateDynamicFilters();
    populateVisitPhlebotomistFilter();

    if (!isEdit) {
  // Reset new entry form
  resetFormState(formId);
  const panel = document.getElementById(getPanelId(formId));
  if (panel) {
    panel.querySelectorAll('input, select, textarea').forEach(el => {
      if (el.id && el.id.includes('-' + formId)) {
        if (el.type === 'checkbox') {
          // FIX: Set report requirement checkboxes to checked by default
          if (el.id.includes('reportOnlineRequired') || 
              el.id.includes('reportDeliveryRequired') || 
              el.id.includes('reportBillDeliveryRequired')) {
            el.checked = true;
          } else {
            el.checked = false;
          }
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
        const state = getFormState(formId);
        state.images = [];
        state.imageFiles = [];
        renderImages(formId);
      }
      updatePPSection(formId);
      updateExtraCollectionVisibility(formId);
      updateReportReceivedList(formId);
      updateDeliveryStatusVisibility(formId);
      updatePaymentFields(formId);
      updateSectionProgressBars(formId);
      updateReportMessage(formId);
    } else {
      // Edit mode: reload current page and close edit tab
      await loadEntriesPage(pagination.page);
      closeEditTab(formId);
      switchTab('added');
    }

    if (saveBtn) {
      saveBtn.disabled = false;
      saveBtn.innerHTML = saveBtn.dataset.originalText || '💾 Save Entry';
    }
    return true;

  } catch (err) {
    console.error('Save error:', err);
    handleFirebaseError(err);
    if (saveBtn) {
      saveBtn.disabled = false;
      saveBtn.innerHTML = saveBtn.dataset.originalText || '💾 Save Entry';
    }
    return false;
  }
}

// ============================================================
//  VALIDATION
// ============================================================
function focusField(fieldName, formId) {
  const el = document.getElementById(fieldName + '-' + formId);
  if (!el) return;
  
  const panel = document.getElementById('panel-' + formId);
  if (!panel) return;
  
  let sectionId = 'patient';
  if (fieldName === 'visitDate') {
    sectionId = 'visit';
  }
  
  const navBtn = panel.querySelector('.section-nav-btn[data-section="' + sectionId + '"]');
  if (navBtn) {
    navBtn.click();
  }
  
  setTimeout(() => {
    el.focus();
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    el.classList.add('input-error');
  }, 100);
}

function validateForm(formId) {
  let isValid = true;
  let firstError = null;

  const patientName = document.getElementById(`patientName-${formId}`);
  if (!patientName || !patientName.value.trim()) {
    isValid = false;
    firstError = firstError || 'patientName';
    showFieldError(patientName, 'Patient name is required');
  } else {
    clearFieldError(patientName);
  }

  const visitDate = document.getElementById(`visitDate-${formId}`);
  if (!visitDate || !visitDate.value) {
    isValid = false;
    firstError = firstError || 'visitDate';
    showFieldError(visitDate, 'Visit date is required');
  } else {
    clearFieldError(visitDate);
  }

  const state = getFormState(formId);
  let hasTest = false;
  for (let labId = 1; labId <= 4; labId++) {
    const labData = state.selectedLabData[labId];
    if (labData) {
      if ((labData.tests && labData.tests.length > 0) || 
          (labData.packages && labData.packages.length > 0)) {
        hasTest = true;
        break;
      }
    }
  }
  
  if (!hasTest) {
    isValid = false;
    toast('Please select at least one test before saving.', 'error');
  }

  return { isValid, errors: [], firstError };
}

function showFieldError(el, message) {
  if (!el) return;
  el.classList.add('input-error');
  const errorEl = el.parentElement?.querySelector('.field-error');
  if (errorEl) {
    errorEl.textContent = message;
    errorEl.classList.add('show');
  }
}

function clearFieldError(el) {
  if (!el) return;
  el.classList.remove('input-error');
  const errorEl = el.parentElement?.querySelector('.field-error');
  if (errorEl) {
    errorEl.classList.remove('show');
  }
}

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
//  PAYMENT FUNCTIONS
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
//  B2B
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
//  PP & EXTRA
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

function isExtraCollectionSelected(formId) {
  const state = getFormState(formId);
  
  for (let labId = 1; labId <= 4; labId++) {
    const labData = state.selectedLabData[labId];
    if (!labData) continue;
    
    if (labData.tests && Array.isArray(labData.tests)) {
      for (const test of labData.tests) {
        if (test.id === 'extra-collection' || test.generalName === 'Extra Collection') {
          return true;
        }
      }
    }
    
    if (labData.packages && Array.isArray(labData.packages)) {
      for (const pkg of labData.packages) {
        if (pkg.tests && Array.isArray(pkg.tests)) {
          for (const test of pkg.tests) {
            if (test.selected !== false) {
              if (test.generalName === 'Extra Collection' || test.id === 'extra-collection') {
                return true;
              }
            }
          }
        }
      }
    }
  }
  return false;
}

function updateExtraCollectionVisibility(formId) {
  const extraSection = document.getElementById(`extraSection-${formId}`);
  if (!extraSection) return;
  
  if (isExtraCollectionSelected(formId)) {
    extraSection.classList.add('visible');
  } else {
    extraSection.classList.remove('visible');
  }
}

// ============================================================
//  PROGRESS
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
  let completed = 0;
  const fields = ['visitCenter', 'visitType', 'visitDate', 'visitTime', 'visitPhlebotomist'];
  
  fields.forEach(fieldId => {
    const el = document.getElementById(fieldId + '-' + formId);
    if (el && el.value && el.value.trim().length > 0) {
      completed++;
    }
  });
  
  const ppSelected = isPPSelected(formId);
  if (ppSelected) {
    const ppTime = document.getElementById(`visitPPTime-${formId}`);
    const ppPhleb = document.getElementById(`visitPPPhlebotomist-${formId}`);
    if (ppTime && ppTime.value && ppTime.value.trim().length > 0) completed++;
    if (ppPhleb && ppPhleb.value && ppPhleb.value.trim().length > 0) completed++;
  }
  
  const extraSelected = isExtraCollectionSelected(formId);
  if (extraSelected) {
    const extraTime = document.getElementById(`visitExtraTime-${formId}`);
    const extraPhleb = document.getElementById(`visitExtraPhlebotomist-${formId}`);
    if (extraTime && extraTime.value && extraTime.value.trim().length > 0) completed++;
    if (extraPhleb && extraPhleb.value && extraPhleb.value.trim().length > 0) completed++;
  }
  
  let totalFields = 5;
  if (ppSelected) totalFields += 2;
  if (extraSelected) totalFields += 2;
  
  return Math.min(100, Math.round((completed / totalFields) * 100));
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
//  REPORTS
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
        <input type="checkbox" id="report-${escapeHtml(test.id)}-${escapeHtml(formId)}" 
               data-test-id="${escapeHtml(test.id)}" data-form="${escapeHtml(formId)}" 
               ${checked ? 'checked' : ''} />
        <div class="test-info">
          <div class="general-name">${escapeHtml(test.generalName)}</div>
          <div class="lab-name">${escapeHtml(test.labName)}</div>
        </div>
        <span class="lab-tag" style="background: ${color.light}; color: ${color.text};">
          ${escapeHtml(color.name)}
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

function updateReportMessage(formId) {
  const messageEl = document.getElementById(`reportMessage-${formId}`);
  if (!messageEl) return;
  
  const patientName = document.getElementById(`patientName-${formId}`)?.value?.trim() || 'Patient';
  
  const message = `Hello,

Please find attached the test report for *${patientName}*.
 
Thank you for choosing *Goodness Healthcare*. We sincerely appreciate your trust in our services.
 
Wishing you and your family good health!
 
Thank you.`;

  messageEl.textContent = message;
}

function copyReportMessage(formId) {
  const messageEl = document.getElementById(`reportMessage-${formId}`);
  if (!messageEl) return;
  
  const text = messageEl.textContent;
  navigator.clipboard.writeText(text).then(() => {
    toast('Message copied to clipboard!', 'success');
  }).catch(() => {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    textarea.remove();
    toast('Message copied to clipboard!', 'success');
  });
}

// ============================================================
//  TESTS
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
  updateExtraCollectionVisibility(formId);
  updateReportReceivedList(formId);
  updatePaymentFields(formId);
  updateSectionProgressBars(formId);
}

function renderLabContent(labId, formId) {
  const container = document.getElementById(`lab-content-${labId}-${formId}`);
  if (!container) return;

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
        <div class="selected-test-item" data-test-id="${escapeHtml(test.id)}">
          <div class="test-info">
            <div class="test-name">${escapeHtml(test.generalName)}</div>
            <div class="test-lab-name">${escapeHtml(test.labName)}</div>
          </div>
          <div class="test-price">₹${test.mrp}</div>
          <button class="remove-item-btn" data-lab="${labId}" data-type="test" data-id="${escapeHtml(test.id)}" data-form="${escapeHtml(formId)}">✕</button>
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
        <div class="selected-package-card" data-package-id="${escapeHtml(pkg.id)}">
          <div class="package-header">
            <span class="package-name">${escapeHtml(pkg.packageName)}</span>
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
                     data-lab="${labId}" data-package-id="${escapeHtml(pkg.id)}" data-test-index="${index}" 
                     data-form="${escapeHtml(formId)}" ${isChecked ? 'checked' : ''} />
              <label for="pkg-${labId}-${pkg.id}-${index}-${formId}" class="test-label">
                <span class="general-name">${escapeHtml(test.generalName)}</span>
                <span class="lab-name">${escapeHtml(test.labName)}</span>
              </label>
            </div>
          `;
        });
      }

      html += `
          </div>
          <div class="package-actions">
            <button class="package-remove-btn" data-lab="${labId}" data-package-id="${escapeHtml(pkg.id)}" data-form="${escapeHtml(formId)}">Remove Package</button>
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
  if (!searchInput || !suggestionsDiv) return;

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
          <div class="suggestion-type">${escapeHtml(typeLabel)}</div>
          <div>
            <span class="suggestion-name">${displayName}</span>
            <span class="suggestion-price">₹${price}</span>
          </div>
          <div class="suggestion-detail">${escapeHtml(detail)}</div>
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
//  VISIT SCHEDULE
// ============================================================
function getVisitEntriesFromIndex(indexData) {
  const visits = [];
  
  indexData.forEach(entry => {
    const patientName = entry.patientName || 'Unknown';
    const visitDate = entry.visitDate || '';
    const visitTime = entry.visitTime || '00:00';
    const phlebotomist = entry.phlebotomist || '';
    const labs = getLabsForEntry(entry);
    const gradientClass = getEntryGradientClass(entry);
    
    visits.push({
      entryKey: entry._firebaseKey,
      patientName: patientName,
      visitDate: visitDate,
      visitTime: visitTime,
      phlebotomist: phlebotomist,
      visitType: 'main',
      visitTypeLabel: 'Main Visit',
      isDone: entry.visitDone || false,
      doneTime: entry.visitDoneTime || null,
      gradientClass: gradientClass,
      labs: labs
    });
    
    if (entry.ppTime) {
      visits.push({
        entryKey: entry._firebaseKey,
        patientName: patientName + ' (PP)',
        visitDate: visitDate,
        visitTime: entry.ppTime || '12:00',
        phlebotomist: entry.ppPhlebotomist || '',
        visitType: 'pp',
        visitTypeLabel: 'PP Visit',
        isDone: entry.ppVisitDone || false,
        doneTime: entry.ppVisitDoneTime || null,
        gradientClass: gradientClass,
        labs: labs
      });
    }
    
    if (entry.extraCollectionTime) {
      visits.push({
        entryKey: entry._firebaseKey,
        patientName: patientName + ' (Extra)',
        visitDate: visitDate,
        visitTime: entry.extraCollectionTime || '12:00',
        phlebotomist: entry.extraCollectionPhlebotomist || '',
        visitType: 'extra',
        visitTypeLabel: 'Extra Collection',
        isDone: entry.extraVisitDone || false,
        doneTime: entry.extraVisitDoneTime || null,
        gradientClass: gradientClass,
        labs: labs
      });
    }
  });
  
  return visits;
}

function renderVisitScheduleFromIndex(indexData) {
  let visits = getVisitEntriesFromIndex(indexData);
  
  const searchQuery = document.getElementById('visitSearch')?.value?.toLowerCase().trim() || '';
  const dateFilter = document.getElementById('visitDateFilter')?.value || '';
  const phlebotomistFilter = document.getElementById('visitPhlebotomistFilter')?.value || 'all';
  const statusFilter = document.getElementById('visitStatusFilter')?.value || 'all';
  
  if (searchQuery) {
    visits = visits.filter(v => v.patientName.toLowerCase().includes(searchQuery));
  }
  if (dateFilter) {
    visits = visits.filter(v => v.visitDate === dateFilter);
  }
  if (phlebotomistFilter !== 'all') {
    visits = visits.filter(v => v.phlebotomist === phlebotomistFilter);
  }
  if (statusFilter === 'done') {
    visits = visits.filter(v => v.isDone === true);
  } else if (statusFilter === 'pending') {
    visits = visits.filter(v => v.isDone !== true);
  }
  
  visits.sort((a, b) => a.visitTime.localeCompare(b.visitTime));
  
  if (visitCountEl) {
    let dateContext = '';
    if (dateFilter) {
      const today = new Date().toISOString().split('T')[0];
      if (dateFilter === today) {
        dateContext = 'for Today';
      } else {
        dateContext = 'for ' + dateFilter;
      }
    } else {
      dateContext = 'for All Dates';
    }
    visitCountEl.textContent = visits.length + ' Visits ' + dateContext;
  }
  
  if (visits.length === 0) {
    let emptyMsg = 'No visits found';
    if (dateFilter) {
      const today = new Date().toISOString().split('T')[0];
      if (dateFilter === today) {
        emptyMsg += ' for Today';
      } else {
        emptyMsg += ' for ' + dateFilter;
      }
    } else {
      emptyMsg += ' for All Dates';
    }
    visitListEl.innerHTML = `<div class="empty-msg">${emptyMsg}.</div>`;
    return;
  }
  
  let html = '';
  visits.forEach(visit => {
    const isDone = visit.isDone;
    const doneClass = isDone ? 'done' : '';
    const gradientClass = visit.gradientClass || '';
    const visitTypeClass = visit.visitType === 'pp' ? 'pp' : visit.visitType === 'extra' ? 'extra' : 'main';
    const labs = visit.labs || [];
    const styleStr = getEntryStyle(labs);
    
    html += `
      <div class="visit-item ${doneClass} ${gradientClass}">
        <div class="entry-lab-bg" style="${styleStr}">
          <div class="visit-content">
            <div class="visit-left">
              <div class="visit-patient-name">${escapeHtml(visit.patientName)}</div>
              <div class="visit-details">
                <span>📅 ${escapeHtml(visit.visitDate || 'No date')}</span>
                <span>🕐 ${escapeHtml(visit.visitTime || 'No time')}</span>
                <span class="visit-type-badge ${visitTypeClass}">${escapeHtml(visit.visitTypeLabel)}</span>
                ${visit.phlebotomist ? `<span>👤 ${escapeHtml(visit.phlebotomist)}</span>` : ''}
                ${isDone && visit.doneTime ? `<span class="visit-done-time">✅ Done at ${escapeHtml(visit.doneTime)}</span>` : ''}
              </div>
            </div>
            <div class="visit-actions">
              <div class="visit-done-checkbox">
                <input type="checkbox" class="visit-done-check" data-key="${escapeHtml(visit.entryKey)}" data-type="${escapeHtml(visit.visitType)}" ${isDone ? 'checked' : ''} />
                <span>Done</span>
              </div>
              <button class="view-btn" data-key="${escapeHtml(visit.entryKey)}">👁 View</button>
              <button class="edit-btn" data-key="${escapeHtml(visit.entryKey)}">✎ Edit</button>
            </div>
          </div>
        </div>
      </div>
    `;
  });
  
  visitListEl.innerHTML = html;
  
  visitListEl.querySelectorAll('.view-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const key = this.dataset.key;
      const rec = allEntries.find(e => e._firebaseKey === key);
      if (rec) {
        loadAndViewPatient(key);
      }
    });
  });
  
  visitListEl.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const key = this.dataset.key;
      const rec = allEntries.find(e => e._firebaseKey === key);
      if (rec) {
        loadAndEditPatient(key);
      }
    });
  });
  
  visitListEl.querySelectorAll('.visit-done-check').forEach(cb => {
    cb.addEventListener('change', function() {
      const key = this.dataset.key;
      const visitType = this.dataset.type;
      const entry = allEntries.find(e => e._firebaseKey === key);
      if (!entry) return;
      
      const isChecked = this.checked;
      const action = isChecked ? 'mark as done' : 'mark as pending';
      
      if (confirm(`Are you sure you want to ${action} this visit?`)) {
        updateVisitStatusFromIndex(entry, visitType, isChecked);
      } else {
        this.checked = !isChecked;
      }
    });
  });
}

async function updateVisitStatusFromIndex(entry, visitType, isDone) {
  const now = new Date();
  const doneTime = now.toLocaleString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
  
  const updates = {};
  const indexUpdates = {};
  
  if (visitType === 'main') {
    updates['visitDone'] = isDone;
    updates['visitDoneTime'] = isDone ? doneTime : null;
    indexUpdates['visitDone'] = isDone;
    indexUpdates['visitDoneTime'] = isDone ? doneTime : null;
  } else if (visitType === 'pp') {
    updates['ppVisitDone'] = isDone;
    updates['ppVisitDoneTime'] = isDone ? doneTime : null;
    indexUpdates['ppVisitDone'] = isDone;
    indexUpdates['ppVisitDoneTime'] = isDone ? doneTime : null;
  } else if (visitType === 'extra') {
    updates['extraVisitDone'] = isDone;
    updates['extraVisitDoneTime'] = isDone ? doneTime : null;
    indexUpdates['extraVisitDone'] = isDone;
    indexUpdates['extraVisitDoneTime'] = isDone ? doneTime : null;
  }
  
  try {
    const allUpdates = {};
    const patientPath = `patients/${entry._firebaseKey}`;
    const indexPath = `patientIndex/${entry._firebaseKey}`;
    
    Object.keys(updates).forEach(key => {
      allUpdates[`${patientPath}/${key}`] = updates[key];
    });
    Object.keys(indexUpdates).forEach(key => {
      allUpdates[`${indexPath}/${key}`] = indexUpdates[key];
    });
    
    await db.ref().update(allUpdates);
    
    Object.keys(indexUpdates).forEach(key => {
      entry[key] = indexUpdates[key];
    });
    
    toast(`Visit ${isDone ? 'marked as done' : 'marked as pending'}`, 'success');
    renderVisitScheduleFromIndex(currentEntries);
  } catch (err) {
    handleFirebaseError(err);
  }
}

function renderVisitSchedule() {
  renderVisitScheduleFromIndex(currentEntries);
}

function populateVisitPhlebotomistFilter() {
  const select = document.getElementById('visitPhlebotomistFilter');
  if (!select) return;
  
  const phlebotomists = new Set();
  allEntries.forEach(entry => {
    if (entry.phlebotomist) phlebotomists.add(entry.phlebotomist);
    if (entry.ppPhlebotomist) phlebotomists.add(entry.ppPhlebotomist);
    if (entry.extraCollectionPhlebotomist) phlebotomists.add(entry.extraCollectionPhlebotomist);
  });
  
  const sorted = Array.from(phlebotomists).sort();
  const currentValue = select.value;
  
  select.innerHTML = '<option value="all">All</option>';
  sorted.forEach(name => {
    select.innerHTML += `<option value="${escapeHtml(name)}">${escapeHtml(name)}</option>`;
  });
  
  if (currentValue && sorted.includes(currentValue)) {
    select.value = currentValue;
  }
}

function setupVisitScheduleListeners() {
  const searchInput = document.getElementById('visitSearch');
  if (searchInput) {
    searchInput.addEventListener('input', debounce(() => {
      renderVisitScheduleFromIndex(currentEntries);
    }, 300));
  }
  
  const dateFilter = document.getElementById('visitDateFilter');
  if (dateFilter) {
    const today = new Date().toISOString().split('T')[0];
    dateFilter.value = today;
    
    const wrapper = dateFilter.parentElement;
    const label = wrapper.querySelector('label');
    if (label) {
      label.textContent = '📅 Today:';
    }
    
    const clearDateBtn = document.createElement('button');
    clearDateBtn.className = 'action-btn';
    clearDateBtn.textContent = '📅 Show All';
    clearDateBtn.style.fontSize = '0.7rem';
    clearDateBtn.style.padding = '4px 10px';
    clearDateBtn.style.marginLeft = '6px';
    clearDateBtn.addEventListener('click', function() {
      dateFilter.value = '';
      const label = wrapper.querySelector('label');
      if (label) {
        label.textContent = '📅 All Dates:';
      }
      renderVisitScheduleFromIndex(currentEntries);
    });
    wrapper.appendChild(clearDateBtn);
    
    dateFilter.addEventListener('change', function() {
      const label = wrapper.querySelector('label');
      if (label) {
        if (this.value) {
          const today = new Date().toISOString().split('T')[0];
          if (this.value === today) {
            label.textContent = '📅 Today:';
          } else {
            label.textContent = '📅 Date:';
          }
        } else {
          label.textContent = '📅 All Dates:';
        }
      }
      renderVisitScheduleFromIndex(currentEntries);
    });
  }
  
  const phlebotomistFilter = document.getElementById('visitPhlebotomistFilter');
  if (phlebotomistFilter) {
    phlebotomistFilter.addEventListener('change', () => {
      renderVisitScheduleFromIndex(currentEntries);
    });
  }
  
  const statusFilter = document.getElementById('visitStatusFilter');
  if (statusFilter) {
    statusFilter.addEventListener('change', () => {
      renderVisitScheduleFromIndex(currentEntries);
    });
  }
  
  const refreshBtn = document.getElementById('refreshVisitsBtn');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', async function() {
      if (isRefreshing) return;
      
      isRefreshing = true;
      const originalText = this.innerHTML;
      this.innerHTML = '⏳ Refreshing...';
      this.disabled = true;
      
      try {
        await loadAllEntries();
        applyFiltersAndPaginate();
        toast('Visit schedule refreshed successfully.', 'success');
      } catch (err) {
        toast('Refresh failed: ' + err.message, 'error');
        console.error('Refresh error:', err);
      } finally {
        isRefreshing = false;
        this.innerHTML = originalText;
        this.disabled = false;
      }
    });
  }
}

// ============================================================
//  BUILD FILTERS UI - FIXED with proper doctor search
// ============================================================
function buildFiltersUI() {
  const statusOptions = [
    { value: 'all', label: 'All Entries' },
    { value: 'pending', label: 'Pending Entries' },
    { value: 'patient-pending', label: 'Patient Detail Pending' },
    { value: 'visit-pending', label: 'Visit Detail Pending' },
    { value: 'report-received-pending', label: 'Report Received Pending' },
    { value: 'report-online-pending', label: 'Report Online Send Pending' },
    { value: 'report-delivery-pending', label: 'Report Delivery Pending' },
    { value: 'final-price-pending', label: 'Final Price Pending' },
    { value: 'payment-pending', label: 'Payment Pending' },
    { value: 'goodwill-pending', label: 'Goodwill Charges Pending' }
  ];

  const html = `
    <div class="entries-toolbar">
      <div class="filter-row">
        <div class="filter-group" style="flex:1;">
          <input type="text" class="search-input" id="filterSearch" placeholder="Search by patient name..." value="${escapeHtml(filterState.search)}" />
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
              ${escapeHtml(LAB_COLORS[i].name)}
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
            ${statusOptions.map(opt => `
              <option value="${opt.value}" ${filterState.status === opt.value ? 'selected' : ''}>${escapeHtml(opt.label)}</option>
            `).join('')}
          </select>
        </div>
        <div class="filter-group">
          <label>From:</label>
          <input type="date" class="date-input" id="filterFromDate" value="${escapeHtml(filterState.fromDate)}" />
        </div>
        <div class="filter-group">
          <label>To:</label>
          <input type="date" class="date-input" id="filterToDate" value="${escapeHtml(filterState.toDate)}" />
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
        <div class="filter-group doctor-filter-group">
          <label>Dr. Name:</label>
          <div class="doctor-filter-wrapper">
            <div class="doctor-search-container">
              <input type="text" id="filterDoctorSearch" placeholder="🔍 Search doctor..." class="doctor-search-input" autocomplete="off" />
              <button class="doctor-clear-btn" id="doctorClearBtn" title="Clear doctor filter">✕</button>
            </div>
            <div class="doctor-selected" id="doctorSelected">
              <span class="doctor-selected-value">All Doctors</span>
            </div>
            <div class="doctor-options-list" id="doctorOptionsList"></div>
          </div>
        </div>
        <div class="right-controls">
          <span class="entry-count" id="entryCount">Loading entries...</span>
        </div>
      </div>
    </div>
  `;

  entriesFilters.innerHTML = html;

  populateDynamicFilters();

  const searchInput = document.getElementById('filterSearch');
  if (searchInput) {
    searchInput.addEventListener('input', debounce(function() {
      performGlobalSearch(this.value);
    }, 400));
  }

  document.getElementById('filterSort').addEventListener('change', function() {
    filterState.sort = this.value;
    pagination.page = 1;
    applyFiltersAndPaginate();
  });

  document.getElementById('filterStatus').addEventListener('change', function() {
    filterState.status = this.value;
    pagination.page = 1;
    applyFiltersAndPaginate();
  });

  document.getElementById('filterFromDate').addEventListener('change', function() {
    filterState.fromDate = this.value;
    pagination.page = 1;
    applyFiltersAndPaginate();
  });

  document.getElementById('filterToDate').addEventListener('change', function() {
    filterState.toDate = this.value;
    pagination.page = 1;
    applyFiltersAndPaginate();
  });

  document.querySelectorAll('.lab-checkbox').forEach(cb => {
    cb.addEventListener('change', function() {
      const lab = parseInt(this.dataset.lab);
      filterState.labs[lab - 1] = this.checked;
      pagination.page = 1;
      applyFiltersAndPaginate();
    });
  });

  document.getElementById('filterCenter').addEventListener('change', function() {
    filterState.center = this.value;
    pagination.page = 1;
    applyFiltersAndPaginate();
  });

  document.getElementById('filterVisitType').addEventListener('change', function() {
    filterState.visitType = this.value;
    pagination.page = 1;
    applyFiltersAndPaginate();
  });

  document.getElementById('filterPhlebotomist').addEventListener('change', function() {
    filterState.phlebotomist = this.value;
    pagination.page = 1;
    applyFiltersAndPaginate();
  });

  document.getElementById('filterCareOfPerson').addEventListener('change', function() {
    filterState.careOfPerson = this.value;
    pagination.page = 1;
    applyFiltersAndPaginate();
  });

  // Setup doctor search only
  setupDoctorSearch();

  document.getElementById('clearFiltersBtn').addEventListener('click', function() {
    clearAllFilters();
  });

  document.getElementById('refreshBtn').addEventListener('click', async function() {
    if (isRefreshing) return;
    
    isRefreshing = true;
    const originalText = this.innerHTML;
    this.innerHTML = '⏳ Refreshing...';
    this.disabled = true;
    
    try {
      await loadAllEntries();
      applyFiltersAndPaginate();
      toast('Entries refreshed successfully.', 'success');
    } catch (err) {
      toast('Refresh failed: ' + err.message, 'error');
      console.error('Refresh error:', err);
    } finally {
      isRefreshing = false;
      this.innerHTML = originalText;
      this.disabled = false;
    }
  });
}

// ============================================================
//  SETUP DOCTOR SEARCH - FIXED without HTML highlighting
// ============================================================
function setupDoctorSearch() {
  const doctorSearch = document.getElementById('filterDoctorSearch');
  const optionsList = document.getElementById('doctorOptionsList');
  const selectedDisplay = document.getElementById('doctorSelected');
  const clearBtn = document.getElementById('doctorClearBtn');
  
  if (!doctorSearch || !optionsList || !selectedDisplay) return;
  
  let allDoctors = [];
  let isOpen = false;
  
  // Function to populate doctor options
  function populateDoctorOptions() {
    const doctors = new Set();
    const entriesToUse = allEntries.length > 0 ? allEntries : [];
    
    entriesToUse.forEach(entry => {
      if (entry.doctorName) doctors.add(entry.doctorName);
    });
    
    allDoctors = Array.from(doctors).sort((a, b) => a.localeCompare(b));
    updateDisplay();
  }
  
  // Update selected display
  function updateDisplay() {
    const selectedSpan = selectedDisplay.querySelector('.doctor-selected-value');
    if (selectedSpan) {
      const currentDoctor = filterState.doctor || 'all';
      
      if (currentDoctor === 'all') {
        selectedSpan.textContent = 'All Doctors';
        selectedSpan.style.color = 'var(--text-light)';
        selectedSpan.style.fontWeight = 'normal';
      } else {
        selectedSpan.textContent = '👨‍⚕️ ' + currentDoctor;
        selectedSpan.style.color = 'var(--text)';
        selectedSpan.style.fontWeight = '500';
      }
    }
    
    if (clearBtn) {
      const currentDoctor = filterState.doctor || 'all';
      clearBtn.style.display = (currentDoctor !== 'all') ? 'flex' : 'none';
    }
  }
  
  // Update options list - SIMPLE without HTML highlighting
  function updateOptions(searchTerm) {
    const term = searchTerm.toLowerCase().trim();
    
    // Filter doctors
    let filtered = allDoctors;
    if (term) {
      filtered = allDoctors.filter(d => d.toLowerCase().includes(term));
    }
    
    if (!isOpen) {
      optionsList.style.display = 'none';
      return;
    }
    
    let html = '';
    // Always show "All" option at top
    const allSelected = filterState.doctor === 'all' || !filterState.doctor;
    html += `<div class="doctor-option ${allSelected ? 'selected' : ''}" data-value="all">
      <span>All Doctors</span>
      ${allSelected ? '<span class="checkmark">✓</span>' : ''}
    </div>`;
    
    if (filtered.length === 0 && term) {
      html += `<div class="doctor-option no-results">
        <span>No doctors found</span>
      </div>`;
    } else {
      filtered.forEach(d => {
        const isSelected = filterState.doctor === d;
        html += `<div class="doctor-option ${isSelected ? 'selected' : ''}" data-value="${escapeHtml(d)}">
          <span>${escapeHtml(d)}</span>
          ${isSelected ? '<span class="checkmark">✓</span>' : ''}
        </div>`;
      });
    }
    
    optionsList.innerHTML = html;
    optionsList.style.display = 'block';
    
    // Add click listeners
    optionsList.querySelectorAll('.doctor-option:not(.no-results)').forEach(opt => {
      opt.addEventListener('click', function(e) {
        e.stopPropagation();
        const value = this.dataset.value;
        if (value) {
          selectDoctor(value);
          optionsList.style.display = 'none';
          isOpen = false;
          doctorSearch.value = '';
          doctorSearch.blur();
        }
      });
    });
  }
  
  // Select a doctor
  function selectDoctor(value) {
    filterState.doctor = value;
    pagination.page = 1;
    updateDisplay();
    applyFiltersAndPaginate();
    if (isOpen) {
      updateOptions(doctorSearch.value);
    }
  }
  
  // Handle search input
  doctorSearch.addEventListener('input', function(e) {
    const value = this.value;
    if (!isOpen) {
      isOpen = true;
    }
    updateOptions(value);
  });
  
  // Handle search focus
  doctorSearch.addEventListener('focus', function() {
    isOpen = true;
    const value = this.value;
    updateOptions(value);
  });
  
  // Handle search blur
  doctorSearch.addEventListener('blur', function() {
    setTimeout(() => {
      optionsList.style.display = 'none';
      isOpen = false;
    }, 200);
  });
  
  // Handle search keydown
  doctorSearch.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      optionsList.style.display = 'none';
      isOpen = false;
      this.blur();
    }
    if (e.key === 'Enter') {
      const selected = optionsList.querySelector('.doctor-option.selected');
      if (selected) {
        selected.click();
      } else {
        const first = optionsList.querySelector('.doctor-option:not(.no-results)');
        if (first) first.click();
      }
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const options = optionsList.querySelectorAll('.doctor-option:not(.no-results)');
      if (options.length > 0) {
        let currentIndex = -1;
        options.forEach((opt, idx) => {
          if (opt.classList.contains('selected')) currentIndex = idx;
        });
        const nextIndex = Math.min(currentIndex + 1, options.length - 1);
        options.forEach(opt => opt.classList.remove('selected'));
        options[nextIndex].classList.add('selected');
        options[nextIndex].scrollIntoView({ block: 'nearest' });
      }
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      const options = optionsList.querySelectorAll('.doctor-option:not(.no-results)');
      if (options.length > 0) {
        let currentIndex = 0;
        options.forEach((opt, idx) => {
          if (opt.classList.contains('selected')) currentIndex = idx;
        });
        const prevIndex = Math.max(currentIndex - 1, 0);
        options.forEach(opt => opt.classList.remove('selected'));
        options[prevIndex].classList.add('selected');
        options[prevIndex].scrollIntoView({ block: 'nearest' });
      }
    }
  });
  
  // Clear button
  if (clearBtn) {
    clearBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      filterState.doctor = 'all';
      pagination.page = 1;
      doctorSearch.value = '';
      optionsList.style.display = 'none';
      isOpen = false;
      updateDisplay();
      applyFiltersAndPaginate();
      doctorSearch.focus();
    });
  }
  
  // Click on selected display to open options
  selectedDisplay.addEventListener('click', function() {
    if (isOpen) {
      optionsList.style.display = 'none';
      isOpen = false;
    } else {
      isOpen = true;
      doctorSearch.focus();
      updateOptions(doctorSearch.value);
    }
  });
  
  // Click outside to close
  document.addEventListener('click', function(e) {
    const wrapper = document.querySelector('.doctor-filter-wrapper');
    if (wrapper && !wrapper.contains(e.target)) {
      optionsList.style.display = 'none';
      isOpen = false;
    }
  });
  
  // Override populateDynamicFilters to also update doctor options
  const originalPopulateDynamicFilters = populateDynamicFilters;
  populateDynamicFilters = function() {
    originalPopulateDynamicFilters();
    populateDoctorOptions();
  };
  
  // Initial population
  populateDoctorOptions();
  updateDisplay();
}

// ============================================================
//  CLEAR ALL FILTERS - FIXED
// ============================================================
function clearAllFilters() {
  filterState.status = 'all';
  filterState.fromDate = getFirstDayOfCurrentMonth();
  filterState.toDate = '';
  filterState.labs = [true, true, true, true];
  filterState.center = 'all';
  filterState.visitType = 'all';
  filterState.phlebotomist = 'all';
  filterState.careOfPerson = 'all';
  filterState.doctor = 'all';
  filterState.search = '';
  pagination.page = 1;

  const searchEl = document.getElementById('filterSearch');
  if (searchEl) searchEl.value = '';

  const statusEl = document.getElementById('filterStatus');
  if (statusEl) statusEl.value = 'all';

  const fromDateEl = document.getElementById('filterFromDate');
  if (fromDateEl) fromDateEl.value = filterState.fromDate;

  const toDateEl = document.getElementById('filterToDate');
  if (toDateEl) toDateEl.value = '';

  document.querySelectorAll('.lab-checkbox').forEach(cb => {
    cb.checked = true;
  });

  // Clear doctor search
  const doctorSearch = document.getElementById('filterDoctorSearch');
  if (doctorSearch) {
    doctorSearch.value = '';
  }
  
  // Reset doctor selection display
  const selectedDisplay = document.getElementById('doctorSelected');
  if (selectedDisplay) {
    const span = selectedDisplay.querySelector('.doctor-selected-value');
    if (span) {
      span.textContent = 'All Doctors';
      span.style.color = 'var(--text-light)';
      span.style.fontWeight = 'normal';
    }
  }
  
  // Hide clear button
  const clearBtn = document.getElementById('doctorClearBtn');
  if (clearBtn) {
    clearBtn.style.display = 'none';
  }
  
  // Hide options
  const optionsList = document.getElementById('doctorOptionsList');
  if (optionsList) {
    optionsList.style.display = 'none';
  }

  populateDynamicFilters();
  applyFiltersAndPaginate();
  toast('All filters cleared. Showing all entries from the start of the month.', 'success');
}

// ============================================================
//  SETUP DOCTOR SEARCH - FIXED with better UI
// ============================================================
function setupDoctorSearch() {
  const doctorSearch = document.getElementById('filterDoctorSearch');
  const optionsList = document.getElementById('doctorOptionsList');
  const selectedDisplay = document.getElementById('doctorSelected');
  const clearBtn = document.getElementById('doctorClearBtn');
  
  if (!doctorSearch || !optionsList || !selectedDisplay) return;
  
  let allDoctors = [];
  let isOpen = false;
  
  // Function to populate doctor options
  function populateDoctorOptions() {
    const doctors = new Set();
    const entriesToUse = allEntries.length > 0 ? allEntries : [];
    
    entriesToUse.forEach(entry => {
      if (entry.doctorName) doctors.add(entry.doctorName);
    });
    
    allDoctors = Array.from(doctors).sort((a, b) => a.localeCompare(b));
    updateDisplay();
  }
  
  // Update selected display
  function updateDisplay() {
    const selectedSpan = selectedDisplay.querySelector('.doctor-selected-value');
    if (selectedSpan) {
      if (filterState.doctor === 'all' || !filterState.doctor) {
        selectedSpan.textContent = 'All Doctors';
        selectedSpan.style.color = 'var(--text-light)';
        selectedSpan.style.fontWeight = 'normal';
      } else {
        selectedSpan.textContent = '👨‍⚕️ ' + filterState.doctor;
        selectedSpan.style.color = 'var(--text)';
        selectedSpan.style.fontWeight = '500';
      }
    }
    // Show/hide clear button
    if (clearBtn) {
      clearBtn.style.display = (filterState.doctor && filterState.doctor !== 'all') ? 'flex' : 'none';
    }
  }
  
  // Update options list
  function updateOptions(searchTerm) {
    const term = searchTerm.toLowerCase().trim();
    
    // Filter doctors
    let filtered = allDoctors;
    if (term) {
      filtered = allDoctors.filter(d => d.toLowerCase().includes(term));
    }
    
    if (!isOpen || filtered.length === 0) {
      optionsList.style.display = 'none';
      return;
    }
    
    let html = '';
    // Always show "All" option at top
    const allSelected = filterState.doctor === 'all' || !filterState.doctor;
    html += `<div class="doctor-option ${allSelected ? 'selected' : ''}" data-value="all">
      <span>All Doctors</span>
      ${allSelected ? '<span class="checkmark">✓</span>' : ''}
    </div>`;
    
    filtered.forEach(d => {
      const isSelected = filterState.doctor === d;
      const lowerD = d.toLowerCase();
      const termLower = term.toLowerCase();
      const startIdx = lowerD.indexOf(termLower);
      let displayName = d;
      if (startIdx !== -1 && term) {
        const before = d.substring(0, startIdx);
        const match = d.substring(startIdx, startIdx + term.length);
        const after = d.substring(startIdx + term.length);
        displayName = `${escapeHtml(before)}<span class="highlight">${escapeHtml(match)}</span>${escapeHtml(after)}`;
      } else {
        displayName = escapeHtml(d);
      }
      html += `<div class="doctor-option ${isSelected ? 'selected' : ''}" data-value="${escapeHtml(d)}">
        <span>${displayName}</span>
        ${isSelected ? '<span class="checkmark">✓</span>' : ''}
      </div>`;
    });
    
    optionsList.innerHTML = html;
    optionsList.style.display = 'block';
    
    // Add click listeners
    optionsList.querySelectorAll('.doctor-option').forEach(opt => {
      opt.addEventListener('click', function(e) {
        e.stopPropagation();
        const value = this.dataset.value;
        selectDoctor(value);
        optionsList.style.display = 'none';
        isOpen = false;
        doctorSearch.value = '';
        doctorSearch.blur();
      });
    });
  }
  
  // Select a doctor
  function selectDoctor(value) {
    filterState.doctor = value;
    pagination.page = 1;
    updateDisplay();
    applyFiltersAndPaginate();
    // Update options to reflect selection
    if (isOpen) {
      updateOptions(doctorSearch.value);
    }
  }
  
  // Handle search input
  doctorSearch.addEventListener('input', function(e) {
    const value = this.value;
    if (!isOpen) {
      isOpen = true;
    }
    if (value.length > 0 || isOpen) {
      updateOptions(value);
    } else {
      optionsList.style.display = 'none';
    }
  });
  
  // Handle search focus
  doctorSearch.addEventListener('focus', function() {
    isOpen = true;
    const value = this.value;
    updateOptions(value);
  });
  
  // Handle search blur
  doctorSearch.addEventListener('blur', function() {
    setTimeout(() => {
      optionsList.style.display = 'none';
      isOpen = false;
    }, 200);
  });
  
  // Handle search keydown
  doctorSearch.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      optionsList.style.display = 'none';
      isOpen = false;
      this.blur();
    }
    if (e.key === 'Enter') {
      const selected = optionsList.querySelector('.doctor-option.selected');
      if (selected) {
        selected.click();
      } else {
        const first = optionsList.querySelector('.doctor-option');
        if (first) first.click();
      }
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const options = optionsList.querySelectorAll('.doctor-option');
      if (options.length > 0) {
        let currentIndex = -1;
        options.forEach((opt, idx) => {
          if (opt.classList.contains('selected')) currentIndex = idx;
        });
        const nextIndex = Math.min(currentIndex + 1, options.length - 1);
        options.forEach(opt => opt.classList.remove('selected'));
        options[nextIndex].classList.add('selected');
        options[nextIndex].scrollIntoView({ block: 'nearest' });
      }
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      const options = optionsList.querySelectorAll('.doctor-option');
      if (options.length > 0) {
        let currentIndex = 0;
        options.forEach((opt, idx) => {
          if (opt.classList.contains('selected')) currentIndex = idx;
        });
        const prevIndex = Math.max(currentIndex - 1, 0);
        options.forEach(opt => opt.classList.remove('selected'));
        options[prevIndex].classList.add('selected');
        options[prevIndex].scrollIntoView({ block: 'nearest' });
      }
    }
  });
  
  // Clear button
  if (clearBtn) {
    clearBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      selectDoctor('all');
      doctorSearch.value = '';
      optionsList.style.display = 'none';
      isOpen = false;
      doctorSearch.focus();
    });
  }
  
  // Click on selected display to open options
  selectedDisplay.addEventListener('click', function() {
    if (isOpen) {
      optionsList.style.display = 'none';
      isOpen = false;
    } else {
      isOpen = true;
      doctorSearch.focus();
      updateOptions(doctorSearch.value);
    }
  });
  
  // Click outside to close
  document.addEventListener('click', function(e) {
    const wrapper = document.querySelector('.doctor-filter-wrapper');
    if (wrapper && !wrapper.contains(e.target)) {
      optionsList.style.display = 'none';
      isOpen = false;
    }
  });
  
  // Override populateDynamicFilters to also update doctor options
  const originalPopulateDynamicFilters = populateDynamicFilters;
  populateDynamicFilters = function() {
    originalPopulateDynamicFilters();
    populateDoctorOptions();
  };
  
  // Initial population
  populateDoctorOptions();
  
  // Set initial display
  updateDisplay();
}

// ============================================================
//  CLEAR ALL FILTERS - FIXED
// ============================================================
function clearAllFilters() {
  filterState.status = 'all';
  filterState.fromDate = getFirstDayOfCurrentMonth();
  filterState.toDate = '';
  filterState.labs = [true, true, true, true];
  filterState.center = 'all';
  filterState.visitType = 'all';
  filterState.phlebotomist = 'all';
  filterState.careOfPerson = 'all';
  filterState.doctor = 'all';
  filterState.search = '';
  pagination.page = 1;

  const searchEl = document.getElementById('filterSearch');
  if (searchEl) searchEl.value = '';

  const statusEl = document.getElementById('filterStatus');
  if (statusEl) statusEl.value = 'all';

  const fromDateEl = document.getElementById('filterFromDate');
  if (fromDateEl) fromDateEl.value = filterState.fromDate;

  const toDateEl = document.getElementById('filterToDate');
  if (toDateEl) toDateEl.value = '';

  document.querySelectorAll('.lab-checkbox').forEach(cb => {
    cb.checked = true;
  });

  // Clear doctor search
  const doctorSearch = document.getElementById('filterDoctorSearch');
  if (doctorSearch) {
    doctorSearch.value = '';
  }
  
  // Reset doctor selection display
  const selectedDisplay = document.getElementById('doctorSelected');
  if (selectedDisplay) {
    const span = selectedDisplay.querySelector('.doctor-selected-value');
    if (span) {
      span.textContent = 'All Doctors';
      span.style.color = 'var(--text-light)';
      span.style.fontWeight = 'normal';
    }
  }
  
  // Hide clear button
  const clearBtn = document.getElementById('doctorClearBtn');
  if (clearBtn) {
    clearBtn.style.display = 'none';
  }
  
  // Hide options
  const optionsList = document.getElementById('doctorOptionsList');
  if (optionsList) {
    optionsList.style.display = 'none';
  }

  populateDynamicFilters();
  applyFiltersAndPaginate();
  toast('All filters cleared. Showing all entries from the start of the month.', 'success');
}

// ============================================================
//  SETUP DOCTOR SEARCH - FIXED
// ============================================================
function setupDoctorSearch() {
  const doctorSearch = document.getElementById('filterDoctorSearch');
  const optionsList = document.getElementById('doctorOptionsList');
  const selectedDisplay = document.getElementById('doctorSelected');
  const clearBtn = document.getElementById('doctorClearBtn');
  
  if (!doctorSearch || !optionsList || !selectedDisplay) return;
  
  let allDoctors = [];
  let isOpen = false;
  let selectedDoctor = filterState.doctor || 'all';
  
  // Function to populate doctor options
  function populateDoctorOptions() {
    const doctors = new Set();
    const entriesToUse = allEntries.length > 0 ? allEntries : [];
    
    entriesToUse.forEach(entry => {
      if (entry.doctorName) doctors.add(entry.doctorName);
    });
    
    allDoctors = Array.from(doctors).sort((a, b) => a.localeCompare(b));
    updateDisplay();
  }
  
  // Update selected display
  function updateDisplay() {
    const selectedSpan = selectedDisplay.querySelector('.doctor-selected-value');
    if (selectedSpan) {
      if (selectedDoctor === 'all') {
        selectedSpan.textContent = 'All Doctors';
        selectedSpan.style.color = 'var(--text-light)';
      } else {
        selectedSpan.textContent = '👨‍⚕️ ' + selectedDoctor;
        selectedSpan.style.color = 'var(--text)';
      }
    }
    // Show/hide clear button
    if (clearBtn) {
      clearBtn.style.display = (selectedDoctor !== 'all') ? 'flex' : 'none';
    }
  }
  
  // Update options list
  function updateOptions(searchTerm) {
    const term = searchTerm.toLowerCase().trim();
    
    // Filter doctors
    let filtered = allDoctors;
    if (term) {
      filtered = allDoctors.filter(d => d.toLowerCase().includes(term));
    }
    
    // Show "All" option at top
    const allMatches = 'all'.includes(term) || !term;
    
    if (!isOpen || filtered.length === 0) {
      optionsList.style.display = 'none';
      return;
    }
    
    let html = '';
    if (allMatches) {
      const isSelected = selectedDoctor === 'all';
      html += `<div class="doctor-option ${isSelected ? 'selected' : ''}" data-value="all">All Doctors ${isSelected ? '✓' : ''}</div>`;
    }
    
    filtered.forEach(d => {
      const isSelected = selectedDoctor === d;
      const lowerD = d.toLowerCase();
      const termLower = term.toLowerCase();
      const startIdx = lowerD.indexOf(termLower);
      let displayName = d;
      if (startIdx !== -1 && term) {
        const before = d.substring(0, startIdx);
        const match = d.substring(startIdx, startIdx + term.length);
        const after = d.substring(startIdx + term.length);
        displayName = `${escapeHtml(before)}<span class="highlight">${escapeHtml(match)}</span>${escapeHtml(after)}`;
      } else {
        displayName = escapeHtml(d);
      }
      html += `<div class="doctor-option ${isSelected ? 'selected' : ''}" data-value="${escapeHtml(d)}">${displayName} ${isSelected ? '✓' : ''}</div>`;
    });
    
    optionsList.innerHTML = html;
    optionsList.style.display = 'block';
    
    // Add click listeners
    optionsList.querySelectorAll('.doctor-option').forEach(opt => {
      opt.addEventListener('click', function(e) {
        e.stopPropagation();
        const value = this.dataset.value;
        selectDoctor(value);
        optionsList.style.display = 'none';
        isOpen = false;
        doctorSearch.value = '';
        doctorSearch.blur();
      });
    });
  }
  
  // Select a doctor
  function selectDoctor(value) {
    selectedDoctor = value;
    filterState.doctor = value;
    pagination.page = 1;
    updateDisplay();
    applyFiltersAndPaginate();
  }
  
  // Handle search input
  doctorSearch.addEventListener('input', function(e) {
    const value = this.value;
    if (!isOpen) {
      isOpen = true;
    }
    if (value.length > 0 || isOpen) {
      updateOptions(value);
    } else {
      optionsList.style.display = 'none';
    }
  });
  
  // Handle search focus
  doctorSearch.addEventListener('focus', function() {
    isOpen = true;
    const value = this.value;
    updateOptions(value);
  });
  
  // Handle search blur
  doctorSearch.addEventListener('blur', function() {
    setTimeout(() => {
      optionsList.style.display = 'none';
      isOpen = false;
    }, 200);
  });
  
  // Handle search keydown
  doctorSearch.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      optionsList.style.display = 'none';
      isOpen = false;
      this.blur();
    }
    if (e.key === 'Enter') {
      const selected = optionsList.querySelector('.doctor-option.selected');
      if (selected) {
        selected.click();
      } else {
        const first = optionsList.querySelector('.doctor-option');
        if (first) first.click();
      }
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const options = optionsList.querySelectorAll('.doctor-option');
      if (options.length > 0) {
        let currentIndex = -1;
        options.forEach((opt, idx) => {
          if (opt.classList.contains('selected')) currentIndex = idx;
        });
        const nextIndex = Math.min(currentIndex + 1, options.length - 1);
        options.forEach(opt => opt.classList.remove('selected'));
        options[nextIndex].classList.add('selected');
        options[nextIndex].scrollIntoView({ block: 'nearest' });
      }
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      const options = optionsList.querySelectorAll('.doctor-option');
      if (options.length > 0) {
        let currentIndex = 0;
        options.forEach((opt, idx) => {
          if (opt.classList.contains('selected')) currentIndex = idx;
        });
        const prevIndex = Math.max(currentIndex - 1, 0);
        options.forEach(opt => opt.classList.remove('selected'));
        options[prevIndex].classList.add('selected');
        options[prevIndex].scrollIntoView({ block: 'nearest' });
      }
    }
  });
  
  // Clear button
  if (clearBtn) {
    clearBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      selectDoctor('all');
      doctorSearch.value = '';
      optionsList.style.display = 'none';
      isOpen = false;
      doctorSearch.focus();
    });
  }
  
  // Click on selected display to open options
  selectedDisplay.addEventListener('click', function() {
    if (isOpen) {
      optionsList.style.display = 'none';
      isOpen = false;
    } else {
      isOpen = true;
      doctorSearch.focus();
      updateOptions(doctorSearch.value);
    }
  });
  
  // Click outside to close
  document.addEventListener('click', function(e) {
    const wrapper = document.querySelector('.doctor-filter-wrapper');
    if (wrapper && !wrapper.contains(e.target)) {
      optionsList.style.display = 'none';
      isOpen = false;
    }
  });
  
  // Override populateDynamicFilters to also update doctor options
  const originalPopulateDynamicFilters = populateDynamicFilters;
  populateDynamicFilters = function() {
    originalPopulateDynamicFilters();
    populateDoctorOptions();
  };
  
  // Initial population
  populateDoctorOptions();
  
  // Set initial selected
  if (filterState.doctor && filterState.doctor !== 'all') {
    selectedDoctor = filterState.doctor;
    updateDisplay();
  }
}

// ============================================================
//  CLEAR ALL FILTERS - UPDATED
// ============================================================
function clearAllFilters() {
  filterState.status = 'all';
  filterState.fromDate = getFirstDayOfCurrentMonth();
  filterState.toDate = '';
  filterState.labs = [true, true, true, true];
  filterState.center = 'all';
  filterState.visitType = 'all';
  filterState.phlebotomist = 'all';
  filterState.careOfPerson = 'all';
  filterState.doctor = 'all';
  filterState.search = '';
  pagination.page = 1;

  const searchEl = document.getElementById('filterSearch');
  if (searchEl) searchEl.value = '';

  const statusEl = document.getElementById('filterStatus');
  if (statusEl) statusEl.value = 'all';

  const fromDateEl = document.getElementById('filterFromDate');
  if (fromDateEl) fromDateEl.value = filterState.fromDate;

  const toDateEl = document.getElementById('filterToDate');
  if (toDateEl) toDateEl.value = '';

  document.querySelectorAll('.lab-checkbox').forEach(cb => {
    cb.checked = true;
  });

  // Clear doctor search
  const doctorSearch = document.getElementById('filterDoctorSearch');
  if (doctorSearch) {
    doctorSearch.value = '';
  }
  
  // Reset doctor selection display
  const selectedDisplay = document.getElementById('doctorSelected');
  if (selectedDisplay) {
    const span = selectedDisplay.querySelector('.doctor-selected-value');
    if (span) {
      span.textContent = 'All Doctors';
      span.style.color = 'var(--text-light)';
    }
  }
  
  // Hide clear button
  const clearBtn = document.getElementById('doctorClearBtn');
  if (clearBtn) {
    clearBtn.style.display = 'none';
  }
  
  // Hide options
  const optionsList = document.getElementById('doctorOptionsList');
  if (optionsList) {
    optionsList.style.display = 'none';
  }

  populateDynamicFilters();
  applyFiltersAndPaginate();
  toast('All filters cleared. Showing all entries from the start of the month.', 'success');
}


// ============================================================
//  SETUP DOCTOR FILTER WITH SEARCH - FIXED
// ============================================================
function setupDoctorFilter() {
  const doctorSelect = document.getElementById('filterDoctor');
  const doctorSearch = document.getElementById('filterDoctorSearch');
  const optionsList = document.getElementById('doctorOptionsList');
  
  if (!doctorSelect || !doctorSearch || !optionsList) return;
  
  let allDoctors = [];
  let isOpen = false;
  
  // Function to populate doctor options
  function populateDoctorOptions() {
    const doctors = new Set();
    const entriesToUse = allEntries.length > 0 ? allEntries : [];
    
    entriesToUse.forEach(entry => {
      if (entry.doctorName) doctors.add(entry.doctorName);
    });
    
    allDoctors = Array.from(doctors).sort((a, b) => a.localeCompare(b));
    
    // Update select
    updateSelect('', true);
  }
  
  // Update select with filtered options
  function updateSelect(searchTerm, resetSelection = false) {
    const term = searchTerm.toLowerCase().trim();
    const currentValue = doctorSelect.value;
    
    // Filter doctors
    const filtered = allDoctors.filter(d => 
      d.toLowerCase().includes(term)
    );
    
    // Rebuild select
    doctorSelect.innerHTML = '<option value="all">All</option>';
    filtered.forEach(d => {
      const option = document.createElement('option');
      option.value = d;
      option.textContent = d;
      doctorSelect.appendChild(option);
    });
    
    // Try to restore selection
    if (!resetSelection && currentValue !== 'all' && filtered.includes(currentValue)) {
      doctorSelect.value = currentValue;
    } else if (resetSelection) {
      doctorSelect.value = filterState.doctor || 'all';
      if (doctorSelect.value !== 'all' && !filtered.includes(doctorSelect.value)) {
        doctorSelect.value = 'all';
      }
    } else {
      // If current value is 'all' or not in filtered, set to 'all'
      if (currentValue !== 'all' && !filtered.includes(currentValue)) {
        doctorSelect.value = 'all';
      } else {
        doctorSelect.value = currentValue;
      }
    }
    
    // Update filter state if changed
    if (doctorSelect.value !== filterState.doctor) {
      filterState.doctor = doctorSelect.value;
      pagination.page = 1;
      applyFiltersAndPaginate();
    }
    
    // Update options list for click selection
    updateOptionsList(filtered, term);
  }
  
  // Update the clickable options list
  function updateOptionsList(filtered, term) {
    if (!isOpen || filtered.length === 0) {
      optionsList.style.display = 'none';
      return;
    }
    
    let html = '';
    // Add "All" option
    const allMatches = 'all'.includes(term) || !term;
    if (allMatches) {
      html += `<div class="doctor-option ${doctorSelect.value === 'all' ? 'selected' : ''}" data-value="all">All</div>`;
    }
    
    filtered.forEach(d => {
      const isSelected = doctorSelect.value === d;
      const lowerD = d.toLowerCase();
      const termLower = term.toLowerCase();
      const startIdx = lowerD.indexOf(termLower);
      let displayName = d;
      if (startIdx !== -1 && term) {
        const before = d.substring(0, startIdx);
        const match = d.substring(startIdx, startIdx + term.length);
        const after = d.substring(startIdx + term.length);
        displayName = `${escapeHtml(before)}<span class="highlight">${escapeHtml(match)}</span>${escapeHtml(after)}`;
      } else {
        displayName = escapeHtml(d);
      }
      html += `<div class="doctor-option ${isSelected ? 'selected' : ''}" data-value="${escapeHtml(d)}">${displayName}</div>`;
    });
    
    optionsList.innerHTML = html;
    optionsList.style.display = 'block';
    
    // Add click listeners
    optionsList.querySelectorAll('.doctor-option').forEach(opt => {
      opt.addEventListener('click', function() {
        const value = this.dataset.value;
        doctorSelect.value = value;
        filterState.doctor = value;
        pagination.page = 1;
        applyFiltersAndPaginate();
        optionsList.style.display = 'none';
        isOpen = false;
        doctorSearch.value = '';
        doctorSearch.blur();
      });
    });
  }
  
  // Handle search input
  doctorSearch.addEventListener('input', function(e) {
    const value = this.value;
    if (!isOpen) {
      isOpen = true;
    }
    updateSelect(value, false);
  });
  
  // Handle search focus
  doctorSearch.addEventListener('focus', function() {
    isOpen = true;
    const value = this.value;
    updateSelect(value, false);
  });
  
  // Handle search blur - close options with delay
  doctorSearch.addEventListener('blur', function() {
    setTimeout(() => {
      optionsList.style.display = 'none';
      isOpen = false;
    }, 200);
  });
  
  // Handle search keydown
  doctorSearch.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      optionsList.style.display = 'none';
      isOpen = false;
      this.blur();
    }
    if (e.key === 'Enter') {
      const selected = optionsList.querySelector('.doctor-option.selected');
      if (selected) {
        selected.click();
      } else {
        const first = optionsList.querySelector('.doctor-option');
        if (first) first.click();
      }
    }
  });
  
  // Handle select change
  doctorSelect.addEventListener('change', function() {
    filterState.doctor = this.value;
    pagination.page = 1;
    applyFiltersAndPaginate();
    // Update options list highlight
    if (isOpen) {
      const value = doctorSearch.value;
      updateSelect(value, false);
    }
  });
  
  // Override populateDynamicFilters to also update doctor options
  const originalPopulateDynamicFilters = populateDynamicFilters;
  populateDynamicFilters = function() {
    originalPopulateDynamicFilters();
    populateDoctorOptions();
  };
  
  // Initial population
  populateDoctorOptions();
}

function populateDynamicFilters() {
  const centers = new Set();
  const visitTypes = new Set();
  const phlebotomists = new Set();
  const careOfPersons = new Set();

  const entriesToUse = allEntries.length > 0 ? allEntries : [];
  
  entriesToUse.forEach(entry => {
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
      centerSelect.innerHTML += `<option value="${escapeHtml(val)}">${escapeHtml(val)}</option>`;
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
      visitTypeSelect.innerHTML += `<option value="${escapeHtml(val)}">${escapeHtml(val)}</option>`;
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
      phlebotomistSelect.innerHTML += `<option value="${escapeHtml(val)}">${escapeHtml(val)}</option>`;
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
      careOfPersonSelect.innerHTML += `<option value="${escapeHtml(val)}">${escapeHtml(val)}</option>`;
    });
    if (filterState.careOfPerson !== 'all' && !careOfPersons.has(filterState.careOfPerson)) {
      careOfPersonSelect.value = 'all';
    } else {
      careOfPersonSelect.value = filterState.careOfPerson;
    }
  }
}

function clearAllFilters() {
  filterState.status = 'all';
  filterState.fromDate = getFirstDayOfCurrentMonth();
  filterState.toDate = '';
  filterState.labs = [true, true, true, true];
  filterState.center = 'all';
  filterState.visitType = 'all';
  filterState.phlebotomist = 'all';
  filterState.careOfPerson = 'all';
  filterState.doctor = 'all';
  filterState.search = '';
  pagination.page = 1;

  const searchEl = document.getElementById('filterSearch');
  if (searchEl) searchEl.value = '';

  const statusEl = document.getElementById('filterStatus');
  if (statusEl) statusEl.value = 'all';

  const fromDateEl = document.getElementById('filterFromDate');
  if (fromDateEl) fromDateEl.value = filterState.fromDate;

  const toDateEl = document.getElementById('filterToDate');
  if (toDateEl) toDateEl.value = '';

  document.querySelectorAll('.lab-checkbox').forEach(cb => {
    cb.checked = true;
  });

  const doctorSearch = document.getElementById('filterDoctorSearch');
  if (doctorSearch) {
    doctorSearch.value = '';
    doctorSearch.dispatchEvent(new Event('input'));
  }

  populateDynamicFilters();
  applyFiltersAndPaginate();
  toast('All filters cleared. Showing all entries from the start of the month.', 'success');
}

// ============================================================
//  VIEW MODAL
// ============================================================
function openViewModal(entry) {
  viewModalBody.innerHTML = buildViewModalContent(entry);
  viewModalOverlay.classList.add('active');
  isViewModalOpen = true;
  document.body.style.overflow = 'hidden';
}

function closeViewModal() {
  viewModalOverlay.classList.remove('active');
  isViewModalOpen = false;
  if (!isImageViewerOpen) {
    document.body.style.overflow = '';
  }
}

function openFullImage(src) {
  fullImage.src = src;
  viewImageFull.classList.add('active');
  isImageViewerOpen = true;
  document.body.style.overflow = 'hidden';
}

function closeFullImageView() {
  viewImageFull.classList.remove('active');
  isImageViewerOpen = false;
  if (!isViewModalOpen) {
    document.body.style.overflow = '';
  }
}

document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    if (isImageViewerOpen) {
      e.preventDefault();
      closeFullImageView();
      return;
    }
    if (isViewModalOpen) {
      e.preventDefault();
      closeViewModal();
      return;
    }
  }
});

if (viewModalClose) {
  viewModalClose.addEventListener('click', closeViewModal);
}

if (viewModalOverlay) {
  viewModalOverlay.addEventListener('click', function(e) {
    if (e.target === this) {
      closeViewModal();
    }
  });
}

if (closeFullImage) {
  closeFullImage.addEventListener('click', closeFullImageView);
}

if (viewImageFull) {
  viewImageFull.addEventListener('click', function(e) {
    if (e.target === this) {
      closeFullImageView();
    }
  });
}

function buildViewModalContent(entry) {
  let html = '';

  html += `
    <div class="view-section">
      <div class="view-section-title">👤 Patient Details</div>
      <div class="view-grid">
        <div class="view-item"><span class="label">Patient Name</span><span class="value">${escapeHtml(entry.patientName || '—')}</span></div>
        <div class="view-item"><span class="label">Age</span><span class="value">${escapeHtml(entry.age || '—')}</span></div>
        <div class="view-item"><span class="label">Gender</span><span class="value">${escapeHtml(entry.gender || '—')}</span></div>
        <div class="view-item"><span class="label">Doctor</span><span class="value">${escapeHtml(entry.doctorName || '—')}</span></div>
        <div class="view-item"><span class="label">Care of Person</span><span class="value">${escapeHtml(entry.careOfPerson || '—')}</span></div>
        <div class="view-item full-width"><span class="label">Address</span><span class="value" style="white-space:pre-wrap;">${escapeHtml(entry.address || '—')}</span></div>
  `;

  if (entry.contacts && entry.contacts.length > 0) {
    html += `<div class="view-item full-width"><span class="label">Contacts</span><span class="value">`;
    entry.contacts.forEach((c, i) => {
      html += `${escapeHtml(c.name || '')} ${c.number ? '(' + escapeHtml(c.number) + ')' : ''}`;
      if (i < entry.contacts.length - 1) html += ', ';
    });
    html += `</span></div>`;
  }

  if (entry.additionalInformation) {
    html += `<div class="view-item full-width"><span class="label">Additional Info</span><span class="value" style="white-space:pre-wrap;">${escapeHtml(entry.additionalInformation)}</span></div>`;
  }

  if (entry.images && entry.images.length > 0) {
    html += `<div class="view-item full-width"><span class="label">Images</span><div class="view-image-gallery">`;
    entry.images.forEach(img => {
      html += `<img src="${escapeHtml(img)}" class="view-image-thumb" onclick="openFullImage('${escapeHtml(img)}')" />`;
    });
    html += `</div></div>`;
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
        <div class="sub-title" style="color: ${color.text};">${escapeHtml(color.name)}</div>
    `;

    if (labData.tests && labData.tests.length > 0) {
      html += `<div style="margin-bottom: 4px;"><strong>Tests:</strong> `;
      labData.tests.forEach(test => {
        html += `<span class="test-chip">${escapeHtml(test.generalName)} <span style="font-weight:500;">₹${test.mrp}</span></span>`;
      });
      html += `</div>`;
    }

    if (labData.packages && labData.packages.length > 0) {
      labData.packages.forEach(pkg => {
        html += `<div style="margin-top: 6px;"><strong>📦 ${escapeHtml(pkg.packageName)}</strong> <span style="font-weight:500;">₹${pkg.mrp}</span>`;
        if (pkg.tests && pkg.tests.length > 0) {
          html += `<div style="font-size:0.8rem;color:var(--text-light);margin-top:2px;">`;
          pkg.tests.forEach(t => {
            html += `<span class="test-chip" style="font-size:0.7rem;">${escapeHtml(t.generalName)} ${t.selected !== false ? '✓' : ''}</span>`;
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
        <div class="view-item"><span class="label">Center</span><span class="value">${escapeHtml(entry.center || '—')}</span></div>
        <div class="view-item"><span class="label">Visit Type</span><span class="value">${escapeHtml(entry.visitType || '—')}</span></div>
        <div class="view-item"><span class="label">Visit Date</span><span class="value">${escapeHtml(entry.visitDate || '—')}</span></div>
        <div class="view-item"><span class="label">Visit Time</span><span class="value">${escapeHtml(entry.visitTime || '—')}</span></div>
        <div class="view-item"><span class="label">Phlebotomist</span><span class="value">${escapeHtml(entry.phlebotomist || '—')}</span></div>
  `;

  if (isPPSelectedForEntry(entry)) {
    html += `
      <div class="view-item"><span class="label">PP Time</span><span class="value">${escapeHtml(entry.ppTime || '—')}</span></div>
      <div class="view-item"><span class="label">PP Phlebotomist</span><span class="value">${escapeHtml(entry.ppPhlebotomist || '—')}</span></div>
    `;
  }

  if (isExtraCollectionSelectedForEntry(entry)) {
    html += `
      <div class="view-item"><span class="label">Extra Collection Time</span><span class="value">${escapeHtml(entry.extraCollectionTime || '—')}</span></div>
      <div class="view-item"><span class="label">Extra Collection Phlebotomist</span><span class="value">${escapeHtml(entry.extraCollectionPhlebotomist || '—')}</span></div>
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
        html += `<span class="test-chip">${escapeHtml(key)} ${isReceived ? '✅' : '❌'}</span>`;
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

function copyViewMessage(patientName) {
  const message = `Hello,

Please find attached the test report for *${patientName}*.
 
Thank you for choosing *Goodness Healthcare*. We sincerely appreciate your trust in our services.
 
Wishing you and your family good health!
 
Thank you.`;

  navigator.clipboard.writeText(message).then(() => {
    toast('Message copied to clipboard!', 'success');
  }).catch(() => {
    const textarea = document.createElement('textarea');
    textarea.value = message;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    textarea.remove();
    toast('Message copied to clipboard!', 'success');
  });
}

// ============================================================
//  CONTACT FUNCTIONS
// ============================================================
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
      <input type="text" id="contactName-${formId}-${rowCount}" placeholder="Enter name" value="${escapeHtml(nameValue)}" />
    </div>
    <div class="field-group">
      <label>Contact Number</label>
      <input type="tel" id="contactNumber-${formId}-${rowCount}" placeholder="Enter 10-digit number" value="${escapeHtml(numberValue)}" />
    </div>
    <button class="remove-contact-btn" data-form="${escapeHtml(formId)}" data-index="${rowCount}">✕ Remove</button>
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

// ============================================================
//  FORM HELPERS
// ============================================================
function getFieldValue(fieldName, formId) {
  const el = document.getElementById(fieldName + '-' + formId);
  return el ? el.value : '';
}

function setFieldValue(fieldName, formId, value) {
  const el = document.getElementById(fieldName + '-' + formId);
  if (el) el.value = value || '';
}

function getCheckboxValue(fieldName, formId) {
  const el = document.getElementById(fieldName + '-' + formId);
  return el ? el.checked : false;
}

function setCheckboxValue(fieldName, formId, value) {
  const el = document.getElementById(fieldName + '-' + formId);
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
    images: state.images || []
  };

  const visitData = {
    center: getFieldValue('visitCenter', formId),
    visitType: getFieldValue('visitType', formId),
    visitDate: getFieldValue('visitDate', formId),
    visitTime: getFieldValue('visitTime', formId),
    phlebotomist: getFieldValue('visitPhlebotomist', formId),
    ppTime: getFieldValue('visitPPTime', formId),
    ppPhlebotomist: getFieldValue('visitPPPhlebotomist', formId),
    extraCollectionTime: getFieldValue('visitExtraTime', formId),
    extraCollectionPhlebotomist: getFieldValue('visitExtraPhlebotomist', formId)
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

  if (data.images && Array.isArray(data.images)) {
    state.images = [...data.images];
    state.imageFiles = [];
    renderImages(formId);
  }

  setFieldValue('visitCenter', formId, data.center || '');
  setFieldValue('visitType', formId, data.visitType || '');
  setFieldValue('visitDate', formId, data.visitDate || '');
  setFieldValue('visitTime', formId, data.visitTime || '');
  setFieldValue('visitPhlebotomist', formId, data.phlebotomist || '');
  setFieldValue('visitPPTime', formId, data.ppTime || '');
  setFieldValue('visitPPPhlebotomist', formId, data.ppPhlebotomist || '');
  setFieldValue('visitExtraTime', formId, data.extraCollectionTime || '');
  setFieldValue('visitExtraPhlebotomist', formId, data.extraCollectionPhlebotomist || '');

  setCheckboxValue('reportOnlineRequired', formId, data.onlineReportRequired || false);
  setCheckboxValue('reportDeliveryRequired', formId, data.reportDeliveryRequired || false);
  setCheckboxValue('reportBillDeliveryRequired', formId, data.billDeliveryRequired || false);
  setCheckboxValue('reportOnlineSent', formId, data.onlineReportSent || false);
  setCheckboxValue('reportDelivered', formId, data.reportDelivered || false);
  setCheckboxValue('reportBillDelivered', formId, data.billDelivered || false);

  if (data.reportsReceived) {
    state.reportsReceived = { ...data.reportsReceived };
  } else {
    state.reportsReceived = {};
  }

  setFieldValue('paymentFinalPrice', formId, data.finalPrice ? data.finalPrice.toString() : '');
  setFieldValue('paymentCash', formId, data.cashReceived ? data.cashReceived.toString() : '');
  setFieldValue('paymentOnline', formId, data.onlineReceived ? data.onlineReceived.toString() : '');
  setFieldValue('paymentGoodwill', formId, data.goodwillCharges ? data.goodwillCharges.toString() : '');

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
  updateExtraCollectionVisibility(formId);
  updateReportReceivedList(formId);
  updateDeliveryStatusVisibility(formId);
  updatePaymentFields(formId);
  updateSectionProgressBars(formId);
  updateReportMessage(formId);
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

  if (tabId === 'schedule') {
    renderVisitSchedule();
  }
  if (tabId !== 'added' && tabId !== 'schedule') {
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
    } else if (tabId === 'schedule') {
      switchTab('schedule');
    } else if (tabId.startsWith('edit-')) {
      switchTab(tabId);
    }
  });

  return btn;
}

function ensureBaseTabs() {
  tabBar.innerHTML = '';

  const scheduleBtn = createTabButton('schedule', '📅 Visit Schedule', false);
  tabBar.appendChild(scheduleBtn);

  const addedBtn = createTabButton('added', '📋 Added Entries', false);
  tabBar.appendChild(addedBtn);

  const newBtn = createTabButton('new', '➕ New Entry', false);
  tabBar.appendChild(newBtn);

  for (const [key, info] of editTabs) {
    const btn = createTabButton('edit-' + key, '✎ Edit — ' + escapeHtml(info.name), true);
    tabBar.appendChild(btn);
  }

  document.querySelectorAll('.tab-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.tab === activeTab);
  });
}

function closeEditTab(tabId) {
  const key = tabId.replace('edit-', '');
  if (!editTabs.has(key)) return;

  editTabs.delete(key);
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

// ============================================================
//  CREATE PANELS
// ============================================================
function getPanelId(formId) {
  return 'panel-' + formId;
}

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

  formStates.set('new', createEmptyFormState());

  setupFormNavigation(formId);
  setupPatientDetailsEvents(formId);

  const clearBtn = document.getElementById('clearBtn-' + formId);
if (clearBtn) {
  clearBtn.addEventListener('click', () => {
    if (confirm('Clear all entered data?')) {
      resetFormState(formId);
      const panel = document.getElementById(getPanelId(formId));
      if (panel) {
        panel.querySelectorAll('input, select, textarea').forEach(el => {
          if (el.id && el.id.includes('-' + formId)) {
            if (el.type === 'checkbox') {
              // FIX: Set report requirement checkboxes to checked by default
              if (el.id.includes('reportOnlineRequired') || 
                  el.id.includes('reportDeliveryRequired') || 
                  el.id.includes('reportBillDeliveryRequired')) {
                el.checked = true;
              } else {
                el.checked = false;
              }
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
          const state = getFormState(formId);
          state.images = [];
          state.imageFiles = [];
          renderImages(formId);
        }
        updatePPSection(formId);
        updateExtraCollectionVisibility(formId);
        updateReportReceivedList(formId);
        updateDeliveryStatusVisibility(formId);
        updatePaymentFields(formId);
        updateSectionProgressBars(formId);
        updateReportMessage(formId);
      }
    });
  }

  const saveBtn = document.getElementById('saveBtn-' + formId);
  if (saveBtn) {
    saveBtn.addEventListener('click', async function() {
      await savePatient(formId);
    });
  }

  return panel;
}

function createEditPanel(key, data) {
  const formId = 'edit-' + key;
  const panelId = getPanelId(formId);

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
      <button class="btn-clear" id="clearBtn-${formId}">Undo Changes</button>
      <button class="btn-save" id="saveBtn-${formId}" data-original-text="💾 Update Entry">💾 Update Entry</button>
    </div>
  `;

  const addedPanel = document.getElementById('panel-added');
  addedPanel.parentNode.insertBefore(panel, addedPanel.nextSibling);

  formStates.set(formId, createEmptyFormState());
  
  populateForm(formId, data);

  setupFormNavigation(formId);
  setupPatientDetailsEvents(formId);

  const clearBtn = document.getElementById('clearBtn-' + formId);
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      if (confirm('Undo all changes and restore the original saved patient data?')) {
        resetFormState(formId);
        populateForm(formId, data);
        toast('Changes undone. Original data restored.', 'success');
      }
    });
  }

  const saveBtn = document.getElementById('saveBtn-' + formId);
  if (saveBtn) {
    saveBtn.addEventListener('click', async function() {
      await savePatient(formId, true, key);
    });
  }

  return panel;
}

// ============================================================
//  SECTION NAV
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
        updateExtraCollectionVisibility(formId);
      }

      if (this.dataset.section === 'report') {
        updateReportReceivedList(formId);
        updateDeliveryStatusVisibility(formId);
        updateReportMessage(formId);
      }

      if (this.dataset.section === 'payment') {
        updatePaymentFields(formId);
      }

      updateSectionProgressBars(formId);
    });
  });
}

// ============================================================
//  FORM HTML GENERATORS
// ============================================================
function createPatientDetailsHTML(formId) {
  return `
    <div class="patient-details-grid">
      <div>
        <label class="field-label required">Patient Name *</label>
        <input type="text" id="patientName-${formId}" placeholder="Enter patient name" autocomplete="off" />
        <div id="patientSuggestions-${formId}" class="patient-autocomplete-suggestions"></div>
        <div class="field-error" id="patientNameError-${formId}">Patient name is required</div>
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

      <div class="full-width">
        <label class="field-label">Images</label>
        <div class="image-upload-container" id="imageUploadContainer-${formId}">
          <div class="upload-box">
            <span class="upload-icon">📷</span>
            <span>Add Images</span>
            <input type="file" accept="image/*" multiple />
          </div>
        </div>
      </div>
    </div>
  `;
}

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
        <label class="field-label required">Visit Date *</label>
        <input type="date" id="visitDate-${formId}" />
        <div class="field-error" id="visitDateError-${formId}">Visit date is required</div>
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

      <div class="extra-collection-section" id="extraSection-${formId}">
        <div class="extra-label">— Extra Collection Schedule —</div>
        <div class="extra-grid">
          <div>
            <label class="field-label">Extra Collection Time</label>
            <input type="time" id="visitExtraTime-${formId}" step="60" />
          </div>
          <div>
            <label class="field-label">Extra Collection Phlebotomist</label>
            <div class="autocomplete-wrapper">
              <input type="text" id="visitExtraPhlebotomist-${formId}" placeholder="Type phlebotomist name..." />
              <div class="autocomplete-suggestions" id="suggestions-visitExtraPhlebotomist-${formId}"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function createTestDetailsHTML(formId) {
  let html = `
    <div class="test-details-container">
      <div id="labTabs-${formId}" class="lab-tabs-wrapper">
  `;

  const state = getFormState(formId);
  const activeLabId = state.activeLabId || 1;

  for (let labId = 1; labId <= 4; labId++) {
    const color = LAB_COLORS[labId];
    const isActive = labId === activeLabId;
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
    const isActive = labId === activeLabId;
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

function createReportDetailsHTML(formId) {
  return `
    <div class="report-details-container">
      <div class="report-section">
        <div class="report-section-title">Report Requirements</div>
        <div class="checkbox-row">
          <div class="checkbox-item">
            <input type="checkbox" id="reportOnlineRequired-${formId}" checked />
            <label for="reportOnlineRequired-${formId}">Online Report Required</label>
          </div>
          <div class="checkbox-item">
            <input type="checkbox" id="reportDeliveryRequired-${formId}" checked />
            <label for="reportDeliveryRequired-${formId}">Report Delivery Required</label>
          </div>
          <div class="checkbox-item">
            <input type="checkbox" id="reportBillDeliveryRequired-${formId}" checked />
            <label for="reportBillDeliveryRequired-${formId}">Bill Delivery Required</label>
          </div>
        </div>
      </div>

      <!-- Rest of the function remains the same -->
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

      <div class="report-section">
        <div class="report-section-title">Report Message</div>
        <div class="report-message-container">
          <div class="message-header">
            <h5>📧 Copy this message</h5>
            <button class="copy-msg-btn" onclick="copyReportMessage('${formId}')">📋 Copy</button>
          </div>
          <div class="report-message" id="reportMessage-${formId}">Hello,

Please find attached the test report for Patient.
 
Thank you for choosing Goodness Healthcare. We sincerely appreciate your trust in our services.
 
Wishing you and your family good health!
 
Thank you.</div>
        </div>
      </div>
    </div>
  `;
}

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
//  SETUP PATIENT DETAILS EVENTS
// ============================================================
function setupPatientDetailsEvents(formId) {
  const nameInput = document.getElementById('patientName-' + formId);
  if (nameInput) {
    nameInput.addEventListener('blur', function() {
      this.value = formatName(this.value);
      updatePaymentFields(formId);
      updateSectionProgressBars(formId);
      updateReportMessage(formId);
    });
    nameInput.addEventListener('input', function() {
      updatePaymentFields(formId);
      updateSectionProgressBars(formId);
      updateReportMessage(formId);
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
  const visitFields = ['visitCenter', 'visitType', 'visitDate', 'visitTime', 'visitPhlebotomist'];

visitFields.forEach(fieldId => {
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

  const ppExtraFields = ['visitPPTime', 'visitPPPhlebotomist', 'visitExtraTime', 'visitExtraPhlebotomist'];
  ppExtraFields.forEach(fieldId => {
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
  setupAutocomplete('visitExtraPhlebotomist', PHLEBOTOMIST_SUGGESTIONS, formId);

  setupImageUpload(formId);

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
  updateExtraCollectionVisibility(formId);
  updateReportReceivedList(formId);
  updateDeliveryStatusVisibility(formId);
  updatePaymentFields(formId);
  updateSectionProgressBars(formId);
  updateReportMessage(formId);
}

// ============================================================
//  AUTOCOMPLETE
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
  let autocompleteTimer = null;

  function getPatientSuggestions(query) {
    const matches = allPatientNames.filter(item =>
      item.name && item.name.toLowerCase().includes(query)
    );
    
    const unique = [];
    const seen = new Set();
    matches.forEach(item => {
      if (!seen.has(item.name)) {
        seen.add(item.name);
        unique.push(item);
      }
    });
    
    return unique;
  }

  function updateSuggestions(value) {
    const query = value.toLowerCase().trim();

    if (!query || query.length < 1) {
      suggestionsDiv.classList.remove('show');
      return;
    }

    const matches = getPatientSuggestions(query);
    currentSuggestions = matches;

    if (currentSuggestions.length === 0) {
      suggestionsDiv.classList.remove('show');
      return;
    }

    suggestionsDiv.innerHTML = currentSuggestions.map((item, index) => {
      const name = item.name || '';
      const lowerName = name.toLowerCase();
      const queryLower = query.toLowerCase();
      const startIndex = lowerName.indexOf(queryLower);

      let displayName = name;
      if (startIndex !== -1) {
        const before = name.substring(0, startIndex);
        const match = name.substring(startIndex, startIndex + query.length);
        const after = name.substring(startIndex + query.length);
        displayName = `${escapeHtml(before)}<span class="highlight">${escapeHtml(match)}</span>${escapeHtml(after)}`;
      } else {
        displayName = escapeHtml(name);
      }

      const isSample = item.isSample ? ' (Sample)' : '';
      const visitDate = item.data?.visitDate ? formatDateDisplay(item.data.visitDate) : 'No previous visit';
      return `
        <div class="patient-suggestion-item" data-index="${index}">
          <div class="patient-name">${displayName}${escapeHtml(isSample)}</div>
          <div class="patient-visit">${isSample ? 'Sample patient - no details will be loaded' : 'Previous visit: ' + escapeHtml(visitDate)}</div>
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

  async function selectPatientFromHistory(item, formId) {
    if (item.isSample || item.name === 'Abc Xyz') {
      const nameInput = document.getElementById(`patientName-${formId}`);
      if (nameInput) nameInput.value = item.name;
      suggestionsDiv.classList.remove('show');
      toast('Abc Xyz selected as placeholder name. No details loaded.', 'success');
      updateSectionProgressBars(formId);
      return;
    }

    const fullData = await loadPatientRecord(item.key);
    if (fullData) {
      populatePatientDetailsOnly(formId, fullData);
      suggestionsDiv.classList.remove('show');
      toast('Patient details loaded from previous visit.', 'success');
      updateSectionProgressBars(formId);
    }
  }
}

function populatePatientDetailsOnly(formId, data) {
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
  updateReportMessage(formId);
}

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
      `<div class="suggestion-item" data-index="${index}">${escapeHtml(s)}</div>`
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
}

// ============================================================
//  INIT
// ============================================================
function init() {
  createNewEntryPanel();
  ensureBaseTabs();
  switchTab('added');
  setupVisitScheduleListeners();
  loadEntries().then(() => {
    renderVisitScheduleFromIndex(currentEntries);
    applyFiltersAndPaginate();
  });
}

// ============================================================
//  GLOBAL FUNCTIONS
// ============================================================
window.handleB2BUnlock = handleB2BUnlock;
window.verifyB2BPassword = verifyB2BPassword;
window.copyReportMessage = copyReportMessage;
window.openFullImage = openFullImage;
window.openCalculator = window.openCalculator || function() {};

// ============================================================
//  COPY RULES
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
    },
    "patientIndex": {
      ".indexOn": ["visitTimestamp", "visitDate", "patientNameLower", "center", "visitType"],
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
//  CALCULATOR EVENTS
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

// Start the app
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
