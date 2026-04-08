/* ========================= Data Definitions ========================= */

// Predefined areas for typeahead
const PREDEFINED_AREAS = [
  "Downtown", "Uptown", "Northside", "Southside", "East End", "West End",
  "City Center", "Suburb Heights", "Riverside", "Lakeside", "Hillview", "Maple Grove"
];

// Predefined doctors
const PREDEFINED_DOCTORS = [
  "Dr. John Smith", "Dr. Sarah Johnson", "Dr. Michael Brown", "Dr. Emily Davis",
  "Dr. James Wilson", "Dr. Lisa Anderson", "Dr. Robert Taylor", "Dr. Maria Garcia"
];

// Predefined care of relationships
const PREDEFINED_CARE_OF = [
  "Son", "Daughter", "Father", "Mother", "Spouse", "Brother", "Sister", "Friend", "Guardian"
];

// Predefined phlebotomists
const PREDEFINED_PHLEBOTOMISTS = [
  "Alice Johnson", "Bob Williams", "Carol Martinez", "David Lee", "Emma Thompson", 
  "Frank Rodriguez", "Grace Kim", "Henry Chen", "Isabella Garcia", "James Brown"
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
    imageUrl: "https://via.placeholder.com/100x100/9ca3af/ffffff?text=Fluoride"
  },
  "Plain": {
    name: "Plain Tube (Red)",
    displayName: "Plain Tube",
    imageUrl: "https://via.placeholder.com/100x100/ef4444/ffffff?text=Plain"
  },
  "Urine": {
    name: "Urine Container",
    displayName: "Urine Container",
    imageUrl: "https://via.placeholder.com/100x100/fbbf24/ffffff?text=Urine"
  },
  "PP Extra": {
    name: "PP Test Extra Tube",
    displayName: "PP Extra Tube",
    imageUrl: "https://via.placeholder.com/100x100/8b5cf6/ffffff?text=PP+Extra"
  }
};

/* ========================= Test to Tube Mapping ========================= */
const TEST_TUBE_MAPPING = {
  "Complete Blood Count": ["EDTA"],
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
    imageUrl: "https://lh3.googleusercontent.com/d/1iHKiKtrFMgpLEkyIRUnhz4cl9LZ9XFux"
  },
  "5ml": {
    name: "5 ml Syringe",
    displayName: "5 ml Syringe",
    imageUrl: "https://via.placeholder.com/100x100/10b981/ffffff?text=5ml"
  },
  "10ml": {
    name: "10 ml Syringe",
    displayName: "10 ml Syringe",
    imageUrl: "https://via.placeholder.com/100x100/10b981/ffffff?text=10ml"
  }
};

/* ========================= Test Data per Lab ========================= */
const TESTS_DATA = {
  lab1: [
    { name: "Complete Blood Count", mrp: 500, b2b: 350 },
    { name: "Blood Glucose", mrp: 200, b2b: 140 },
    { name: "Lipid Profile", mrp: 800, b2b: 560 },
    { name: "Liver Function Test", mrp: 600, b2b: 420 },
    { name: "Kidney Function Test", mrp: 600, b2b: 420 },
    { name: "Thyroid Profile", mrp: 700, b2b: 490 },
    { name: "Vitamin D", mrp: 1200, b2b: 840 },
    { name: "Vitamin B12", mrp: 900, b2b: 630 },
    { name: "PP", mrp: 300, b2b: 210 },
    { name: "Urine", mrp: 150, b2b: 105 }
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
