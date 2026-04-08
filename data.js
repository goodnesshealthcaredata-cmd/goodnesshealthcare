/* ========================= Data Definitions ========================= */

// Predefined areas for typeahead
const PREDEFINED_AREAS = [
  "Borivali West", "Borivali East", "Dahisar West", "Dahisar East",
"Kandivali West", "Kandivali East", "Malad West", "Malad East",
"Mira Road West", "Mira Raod East", "Goregaon West", "Goregaon East",
"Andheri West", "Andheri East", "Gorai", "Charkop",
"Old MHB", "New MHB", "Babhai", "Kajupada",
"Ashok Van", "Magathane", "Kulupwadi", "IC Colony",
"Kandarpada", "Malvani", "Eksar", "Anand Nagar", "Yogi Nagar"
];

// Predefined doctors
const PREDEFINED_DOCTORS = [
  "Dr. Shruti Gogate",
"Dr. Snehal Sawant",
"Dr. Satish Sawant",
"Dr. Sushama Dubal",
"Dr. Reshma Bhivgude",
"Dr. Sushama Dabhade",
"Dr. Sunil Dabhade",
"Dr. Jagat Shah",
"Dr. Pravin Arlekar",
"Dr. Avinash Diwate",
"Dr. Sejal.p Jain",
"Dr. Maxim D'mello",
"Dr. Anushka Khot"
];

// Predefined care of relationships
const PREDEFINED_CARE_OF = [
"Soni",
"Sumit",
"Prerana",
"Purabiya",
"Anish",
"Ashok Sir",
"Kunal",
"Eva",
"Vaishali Dhumal",
"Kalpana Sister",
"Megha Sister",
"Sindhu Sister",
"Centre Patient"
];

// Predefined phlebotomists
const PREDEFINED_PHLEBOTOMISTS = [
  "Soni",
"Sumit",
"Anish",
"Prerana",
"Kunal",
"Ashok Sir",
"Priya Purabiya",
"Megha Sister",
"Sindhu Sister"
];

/* ========================= Tube Types Definition (Centralized) ========================= */
const TUBE_TYPES = {
  "EDTA": {
    name: "EDTA Tube (Purple)",
    displayName: "EDTA Tube",
    imageUrl: "https://lh3.googleusercontent.com/d/1iHKiKtrFMgpLEkyIRUnhz4cl9LZ9XFux"
  },
  "Fluoride": {
    name: "Fluoride Tube (Grey)",
    displayName: "Fluoride Tube",
    imageUrl: "https://lh3.googleusercontent.com/d/1MZdwsqJlSHhRbVEUrm_TYv4InUWs5kdV"
  },
  "Plain": {
    name: "Plain Tube (Red)",
    displayName: "Plain Tube",
    imageUrl: "https://lh3.googleusercontent.com/d/1O9o_bmtUvZ3cuiOqfRog1wFzYY4UxRkt"
  },
  "Urine": {
    name: "Urine Container",
    displayName: "Urine Container",
    imageUrl: "https://lh3.googleusercontent.com/d/1bjZq6bvMic2Azyd11-aasyQss3AOeFZw"
  },
  "PP Extra": {
    name: "PP Test Extra Tube",
    displayName: "PP Extra Tube",
    imageUrl: "https://lh3.googleusercontent.com/d/1MZdwsqJlSHhRbVEUrm_TYv4InUWs5kdV"
  }
};

/* ========================= Test to Tube Mapping ========================= */
const TEST_TUBE_MAPPING = {
  "CBC": ["EDTA"],
  "Blood Group":["EDTA"],
  
  
  
  
  "Blood Glucose": ["Fluoride"],
  "Lipid Profile": ["Plain"],
  "Liver Function Test": ["Plain"],
  "Kidney Function Test": ["Plain"],
  "Thyroid Profile": ["Plain"],
  "Vitamin D": ["Plain"],
  "Vitamin B12": ["Plain"],
  "PP": ["EDTA", "PP Extra"],
  "Urine": ["Urine"]
};

/* ========================= Syringe Types Definition ========================= */
const SYRINGE_TYPES = {
  "2ml": {
    name: "2 ml Syringe",
    displayName: "2 ml Syringe",
    imageUrl: "https://lh3.googleusercontent.com/d/1eb8E7A8M0zcSJTfiajfBys87voiojAbh"
  },
  "5ml": {
    name: "5 ml Syringe",
    displayName: "5 ml Syringe",
    imageUrl: "https://lh3.googleusercontent.com/d/12JDG3EZSBhBiVM0KOcDZF52zQA-KGQWE"
  },
  "10ml": {
    name: "10 ml Syringe",
    displayName: "10 ml Syringe",
    imageUrl: "https://lh3.googleusercontent.com/d/1tk0724BqcqLJnxTOZosMpN8FoER7cAD1"
  }
};

/* ========================= Test Data per Lab ========================= */
const TESTS_DATA = {
lab1: [
  { name: "CBC", mrp: 260, b2b: 90 },
  { name: "Blood Group", mrp: 150, b2b: null },
  { name: "ESR", mrp: 120, b2b: 72 },
  { name: "Fasting Sugar", mrp: 70, b2b: 42 },
  { name: "PP", mrp: 70, b2b: 42 },
  { name: "RBS", mrp: 80, b2b: 30 },
  { name: "FASTING INSULINE", mrp: 850, b2b: 350 },
  { name: "HBA1C", mrp: 500, b2b: 130 },
  { name: "LFT", mrp: 850, b2b: 200 },
  { name: "BILIRUBIN-TOTAL", mrp: 180, b2b: 108 },
  { name: "BILIRUBIN-DIRECT", mrp: 180, b2b: 108 },
  { name: "SGPT", mrp: 180, b2b: 40 },
  { name: "SGOT", mrp: 180, b2b: 40 },
  { name: "GGT", mrp: 260, b2b: 182 },
  { name: "RFT", mrp: 950, b2b: null },
  { name: "CREATININE", mrp: 180, b2b: 50 },
  { name: "UREA", mrp: 180, b2b: 108 },
  { name: "BUN", mrp: 180, b2b: 108 },
  { name: "URIC ACID", mrp: 180, b2b: 50 },
  { name: "CALCIUM", mrp: 180, b2b: 108 },
  { name: "LIPID PROFILE", mrp: 550, b2b: 185 },
  { name: "TOTAL CHOLESTEROL", mrp: 180, b2b: 108 },
  { name: "HDL", mrp: 200, b2b: 120 },
  { name: "LDL", mrp: 370, b2b: 222 },
  { name: "LDH", mrp: 480, b2b: 150 },
  { name: "ELECTROLYTES", mrp: 450, b2b: 130 },
  { name: "SODIUM", mrp: 170, b2b: 102 },
  { name: "CHLORIDES", mrp: 250, b2b: 150 },
  { name: "BLOOD GROUP", mrp: 170, b2b: null },
  { name: "PHOSPHORUS", mrp: 180, b2b: 108 },
  { name: "POTASSIUM", mrp: 170, b2b: 102 },
  { name: "IRON STUDY", mrp: 700, b2b: 300 },
  { name: "VIT D3", mrp: 1300, b2b: 250 },
  { name: "VIT B12", mrp: 850, b2b: 250 },
  { name: "T3,T4,TSH", mrp: 550, b2b: 110 },
  { name: "TSH", mrp: 330, b2b: 50 },
  { name: "FT3,FT4,TSH", mrp: 650, b2b: 200 },
  { name: "CRP", mrp: 450, b2b: 120 },
  { name: "HSCRP", mrp: 800, b2b: 350 },
  { name: "CPK-MP", mrp: 800, b2b: 350 },
  { name: "CPK-TOTAL", mrp: 450, b2b: 270 },
  { name: "TROP-I", mrp: 1000, b2b: 750 },
  { name: "D-DIMEAR", mrp: 1200, b2b: 450 },
  { name: "PT INR", mrp: 270, b2b: 179 },
  { name: "APTT", mrp: 400, b2b: 360 },
  { name: "HIV", mrp: 500, b2b: 350 },
  { name: "HCV", mrp: 750, b2b: 525 },
  { name: "HBSAG", mrp: 450, b2b: 315 },
  { name: "VDRL", mrp: 300, b2b: null },
  { name: "URINE CULTURE", mrp: 900, b2b: null },
  { name: "URINE ROUTINE", mrp: 150, b2b: 60 },
  { name: "STOOL ROUTINE", mrp: 150, b2b: 90 },
  { name: "RA FACTOR", mrp: 400, b2b: 240 },
  { name: "MP", mrp: 120, b2b: 72 },
  { name: "WIDAL", mrp: 250, b2b: 150 },
  { name: "DENGU NS1", mrp: 950, b2b: 665 },
  { name: "DENGU IGG", mrp: 950, b2b: 665 },
  { name: "DENGU IGM", mrp: 950, b2b: 665 },
  { name: "MP-ANTIGEN", mrp: 450, b2b: 315 },
  { name: "BETA HCG", mrp: 700, b2b: 200 },
  { name: "HOMOSYSTINE", mrp: 1300, b2b: null },
  { name: "CA125(FEMALE)", mrp: 1200, b2b: null },
  { name: "PSA (MALE)", mrp: 800, b2b: null },
  { name: "IGE", mrp: 600, b2b: null },
  { name: "COVID ANTIBODY", mrp: 1000, b2b: 800 },
  { name: "TYPHI IGM", mrp: 550, b2b: 450 },
  { name: "LIPASE", mrp: 2000, b2b: 1800 }
],
  lab2: [
    { name: "Complete Blood Count", mrp: 550, b2b: 385 },
    { name: "Blood Glucose", mrp: 220, b2b: 154 },
    { name: "Lipid Profile", mrp: 880, b2b: 616 },
    { name: "Liver Function Test", mrp: 660, b2b: 462 },
    { name: "Kidney Function Test", mrp: 660, b2b: 462 },
    { name: "Thyroid Profile", mrp: 770, b2b: 539 }
  ],
  lab3: [
    { name: "Complete Blood Count", mrp: 480, b2b: 336 },
    { name: "Blood Glucose", mrp: 180, b2b: 126 },
    { name: "Lipid Profile", mrp: 750, b2b: 525 },
    { name: "Liver Function Test", mrp: 580, b2b: 406 }
  ],
  lab4: [
    { name: "Complete Blood Count", mrp: 520, b2b: 364 },
    { name: "Blood Glucose", mrp: 210, b2b: 147 },
    { name: "Lipid Profile", mrp: 820, b2b: 574 },
    { name: "Thyroid Profile", mrp: 720, b2b: 504 }
  ]
};

// For backward compatibility
const TESTS = TESTS_DATA.lab1.map(t => t.name);

/* ========================= Packages Data per Lab ========================= */
const PACKAGES = {
  lab1: [
    { name: "Basic Wellness", tests: ["Complete Blood Count", "Blood Glucose"], mrp: 650, b2b: 455 },
    { name: "Comprehensive Health", tests: ["Complete Blood Count", "Lipid Profile", "Liver Function Test", "Kidney Function Test"], mrp: 2000, b2b: 1400 },
    { name: "Full Body Checkup", tests: ["Complete Blood Count", "Lipid Profile", "Liver Function Test", "Kidney Function Test", "Thyroid Profile", "Vitamin D", "Vitamin B12"], mrp: 4000, b2b: 2800 }
  ],
  lab2: [
    { name: "Basic Wellness", tests: ["Complete Blood Count", "Blood Glucose"], mrp: 700, b2b: 490 },
    { name: "Comprehensive Health", tests: ["Complete Blood Count", "Lipid Profile", "Liver Function Test", "Kidney Function Test"], mrp: 2200, b2b: 1540 }
  ],
  lab3: [
    { name: "Basic Wellness", tests: ["Complete Blood Count", "Blood Glucose"], mrp: 600, b2b: 420 }
  ],
  lab4: [
    { name: "Basic Wellness", tests: ["Complete Blood Count", "Blood Glucose"], mrp: 680, b2b: 476 }
  ]
};

/* ========================= Helper Functions ========================= */
function getTubeTypesForTest(testName) {
  return TEST_TUBE_MAPPING[testName] || [];
}

function getTubeInfo(tubeType) {
  return TUBE_TYPES[tubeType] || { name: tubeType, displayName: tubeType, imageUrl: "https://via.placeholder.com/100x100/cccccc/ffffff?text=Unknown" };
}

function getSyringeInfo(syringeSize) {
  return SYRINGE_TYPES[syringeSize] || { name: syringeSize, displayName: syringeSize, imageUrl: "https://via.placeholder.com/100x100/cccccc/ffffff?text=Syringe" };
}

// Calculate unique tube counts per lab (each tube type counted once per lab)
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
  
  // Special rule: If PP test is present, add +1 extra PP Extra tube
  if (tests.includes("PP")) {
    tubeCounts["PP Extra"] = (tubeCounts["PP Extra"] || 0) + 1;
  }
  
  return tubeCounts;
}

// Calculate total tube counts across all labs
function calculateTotalTubeCounts(labsData) {
  const totalCounts = {};
  
  labsData.forEach(lab => {
    const labCounts = calculateUniqueTubeCountsPerLab(lab.tests);
    for (const [tubeType, count] of Object.entries(labCounts)) {
      totalCounts[tubeType] = (totalCounts[tubeType] || 0) + count;
    }
  });
  
  return totalCounts;
}

// For backward compatibility
const TUBES = {};
Object.keys(TUBE_TYPES).forEach(key => {
  TUBES[TUBE_TYPES[key].name] = { name: TUBE_TYPES[key].name };
});

const TEST_TUBE_REQUIREMENTS = {};
Object.keys(TEST_TUBE_MAPPING).forEach(test => {
  TEST_TUBE_REQUIREMENTS[test] = {};
  TEST_TUBE_MAPPING[test].forEach(tubeType => {
    TEST_TUBE_REQUIREMENTS[test][tubeType] = true;
  });
});

const TUBE_IMAGES = {};
Object.keys(TUBE_TYPES).forEach(key => {
  TUBE_IMAGES[TUBE_TYPES[key].name] = TUBE_TYPES[key].imageUrl;
});

const SYRINGE_IMAGES = {};
Object.keys(SYRINGE_TYPES).forEach(key => {
  SYRINGE_IMAGES[key] = SYRINGE_TYPES[key].imageUrl;
});
