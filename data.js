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
  "Citrate": {
    name: "Citrate Tube (Blue)",
    displayName: "Citrate Tube",
    imageUrl: "https://lh3.googleusercontent.com/d/1_jb-6BP-Dr5W3Aj8DFc6faCaX6tRhC3A"
  },
  "Serum": {
    name: "Serum Tube (Yellow)",
    displayName: "Serum Tube",
    imageUrl: "https://lh3.googleusercontent.com/d/1-9Fvi0XRk92RSAas4uHubJrhvu569UWd"
  },
  "Urine": {
    name: "Urine Container",
    displayName: "Urine Container",
    imageUrl: "https://lh3.googleusercontent.com/d/1bjZq6bvMic2Azyd11-aasyQss3AOeFZw"
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
  "PP": ["Fluoride"],
  "Urine": ["Urine"],
  // Additional mappings for backward compatibility
  "Complete Blood Count": ["EDTA"],
  "Fasting Sugar": ["Fluoride"],
  "RBS": ["Fluoride"],
  "FASTING INSULINE": ["Plain"],
  "HBA1C": ["EDTA"],
  "LFT": ["Plain"],
  "BILIRUBIN-TOTAL": ["Plain"],
  "BILIRUBIN-DIRECT": ["Plain"],
  "SGPT": ["Plain"],
  "SGOT": ["Plain"],
  "GGT": ["Plain"],
  "RFT": ["Plain"],
  "CREATININE": ["Plain"],
  "UREA": ["Plain"],
  "BUN": ["Plain"],
  "URIC ACID": ["Plain"],
  "CALCIUM": ["Plain"],
  "TOTAL CHOLESTEROL": ["Plain"],
  "HDL": ["Plain"],
  "LDL": ["Plain"],
  "LDH": ["Plain"],
  "ELECTROLYTES": ["Plain"],
  "SODIUM": ["Plain"],
  "CHLORIDES": ["Plain"],
  "PHOSPHORUS": ["Plain"],
  "POTASSIUM": ["Plain"],
  "IRON STUDY": ["Plain"],
  "VIT D3": ["Plain"],
  "VIT B12": ["Plain"],
  "T3,T4,TSH": ["Plain"],
  "TSH": ["Plain"],
  "FT3,FT4,TSH": ["Plain"],
  "CRP": ["Plain"],
  "HSCRP": ["Plain"],
  "CPK-MP": ["Plain"],
  "CPK-TOTAL": ["Plain"],
  "TROP-I": ["Plain"],
  "D-DIMEAR": ["Plain"],
  "PT INR": ["Plain"],
  "APTT": ["Plain"],
  "HIV": ["Plain"],
  "HCV": ["Plain"],
  "HBSAG": ["Plain"],
  "VDRL": ["Plain"],
  "URINE CULTURE": ["Urine"],
  "URINE ROUTINE": ["Urine"],
  "STOOL ROUTINE": ["Urine"],
  "RA FACTOR": ["Plain"],
  "MP": ["Plain"],
  "WIDAL": ["Plain"],
  "DENGU NS1": ["Plain"],
  "DENGU IGG": ["Plain"],
  "DENGU IGM": ["Plain"],
  "MP-ANTIGEN": ["Plain"],
  "BETA HCG": ["Plain"],
  "HOMOSYSTINE": ["Plain"],
  "CA125(FEMALE)": ["Plain"],
  "PSA (MALE)": ["Plain"],
  "IGE": ["Plain"],
  "COVID ANTIBODY": ["Plain"],
  "TYPHI IGM": ["Plain"],
  "LIPASE": ["Plain"],
  "ESR": ["EDTA"]
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
  { name: "CBC", mrp: 280, b2b: 80 },
  { name: "Blood Group", mrp: 170, b2b: 90 },
  { name: "ESR", mrp: 140, b2b: 60 },
  { name: "FBS", mrp: 80, b2b: 30 },
  { name: "PP", mrp: 80, b2b: 30 },
  { name: "RBS", mrp: 80, b2b: 30 },
  { name: "Fasting Insuline", mrp: 800, b2b: 350 },
  { name: "HbA1C", mrp: 500, b2b: 130 },
  { name: "LFT", mrp: 850, b2b: 220 },
  { name: "Bilirubin-Total", mrp: 180, b2b: 108 },
  { name: "Bilirubin-Direct", mrp: 160, b2b: 96 },
  { name: "SGPT", mrp: 180, b2b: 40 },
  { name: "SGOT", mrp: 180, b2b: 40 },
  { name: "GGT", mrp: 140, b2b: 30 },
  { name: "RFT", mrp: 1100, b2b: 990 },
  { name: "Creatinine", mrp: 180, b2b: 50 },
  { name: "Urea", mrp: 180, b2b: 108 },
  { name: "BUN", mrp: 180, b2b: 108 },
  { name: "Uric Acid", mrp: 180, b2b: 50 },
  { name: "Calcium", mrp: 180, b2b: 108 },
  { name: "Lipid Profile", mrp: 550, b2b: 185 },
  { name: "Total Cholestrol", mrp: 180, b2b: 108 },
  { name: "HDL", mrp: 200, b2b: 120 },
  { name: "LDL", mrp: 370, b2b: 222 },
  { name: "LDH", mrp: 500, b2b: 150 },
  { name: "Electrolytes", mrp: 450, b2b: 130 },
  { name: "Sodium", mrp: 170, b2b: 102 },
  { name: "Chlorides", mrp: 150, b2b: 90 },
  { name: "Phosphorous", mrp: 180, b2b: 108 },
  { name: "Potassium", mrp: 170, b2b: 102 },
  { name: "Iron Study", mrp: 700, b2b: 300 },
  { name: "Vit D3", mrp: 1400, b2b: 600 },
  { name: "Vit B12", mrp: 850, b2b: 250 },
  { name: "T3, T4, TSH", mrp: 550, b2b: 110 },
  { name: "TSH", mrp: 330, b2b: 50 },
  { name: "FT3, FT4, TSH", mrp: 650, b2b: 200 },
  { name: "CRP", mrp: 450, b2b: 150 },
  { name: "HSCRP", mrp: 850, b2b: 350 },
  { name: "CPK-MB", mrp: 700, b2b: 420 },
  { name: "CPK-Total", mrp: 500, b2b: 300 },
  { name: "Trop-I", mrp: 1000, b2b: 750 },
  { name: "D-Dimer", mrp: 1200, b2b: 500 },
  { name: "PT INR", mrp: 300, b2b: 120 },
  { name: "ApTT", mrp: 550, b2b: 330 },
  { name: "HIV", mrp: 500, b2b: 350 },
  { name: "HCV", mrp: 750, b2b: 525 },
  { name: "HBsAg", mrp: 1400, b2b: 1120 },
  { name: "VDRL", mrp: 300, b2b: 180 },
  { name: "Triple H Package", mrp: 1900, b2b: 1500 },
  { name: "Urine Culture", mrp: 950, b2b: 400 },
  { name: "Urine Routine", mrp: 150, b2b: 60 },
  { name: "RA Factor", mrp: 450, b2b: 270 },
  { name: "MP", mrp: 120, b2b: 72 },
  { name: "Widal", mrp: 250, b2b: 150 },
  { name: "Dengue NSI", mrp: 950, b2b: 300 },
  { name: "Dengue IGG", mrp: 800, b2b: 300 },
  { name: "Dengue IGM", mrp: 800, b2b: 350 },
  { name: "MP-Antigen", mrp: 450, b2b: 315 },
  { name: "Beta HCG", mrp: 800, b2b: 200 },
  { name: "Homocysten", mrp: 1350, b2b: 500 },
  { name: "CA125 (Female)", mrp: 1200, b2b: 500 },
  { name: "PSA (Male)", mrp: 850, b2b: 350 },
  { name: "IGE", mrp: 900, b2b: 400 },
  { name: "Trop-T", mrp: 1500, b2b: 1050 },
  { name: "Anti CCP", mrp: 1450, b2b: 650 },
  { name: "ANA", mrp: 950, b2b: 500 },
  { name: "Total Protien", mrp: null, b2b: null },
  { name: "Covid Antibody", mrp: null, b2b: null },
  { name: "FNAC", mrp: 1500, b2b: 1050 },
  { name: "PP Insuline", mrp: 800, b2b: 560 },
  { name: "CEA", mrp: 800, b2b: 400 },
  { name: "AFPL", mrp: 900, b2b: 450 },
  { name: "Hb Electrophoresis", mrp: 800, b2b: 450 },
  { name: "FT3", mrp: 260, b2b: 80 },
  { name: "FT4", mrp: 260, b2b: 80 },
  { name: "Urine Protein Creatinine Ratio", mrp: 400, b2b: 240 },
  { name: "Protein with A/G Ratio", mrp: 250, b2b: 80 },
  { name: "Lypase", mrp: 700, b2b: 300 },
  { name: "Estradiol", mrp: 750, b2b: 300 },
  { name: "PUS Culture (Aerobic)", mrp: 950, b2b: 400 },
  { name: "FT3, FT4", mrp: null, b2b: null },
  { name: "Fecal Calprotectin", mrp: 2800, b2b: 2240 },
  { name: "Blood Culture 1 SE", mrp: 1500, b2b: 800 },
  { name: "Anti Pro MBP", mrp: 2500, b2b: 1100 },
  { name: "Total TFT", mrp: 550, b2b: 110 },
  { name: "HBS Antigen", mrp: 500, b2b: 350 },
  { name: "Mantoux Test", mrp: 150, b2b: 135 },
  { name: "Reticulate Count", mrp: 350, b2b: 210 },
  { name: "Direct Coombs Test", mrp: 500, b2b: 150 },
  { name: "Microalbuminuria", mrp: 580, b2b: 250 },
  { name: "Total Testosteron", mrp: 750, b2b: 350 },
  { name: "Free Testosteron", mrp: 1550, b2b: 750 },
  { name: "Protein C", mrp: 4500, b2b: 4050 },
  { name: "Protein S", mrp: 4500, b2b: 4050 },
  { name: "Lupus Anticoagulant", mrp: 1800, b2b: 800 },
  { name: "Fibrinogen Level", mrp: 800, b2b: 400 },
  { name: "Anti dsDNA NCX", mrp: 1650, b2b: 1000 },
  { name: "Apolipoprotein A-1 & B", mrp: 1100, b2b: 770 },
  { name: "Folic Acid Level", mrp: 1100, b2b: 500 },
  { name: "Allergy Comprehensive", mrp: 5500, b2b: 3850 }
],
lab2: [
  { name: "CBC", mrp: 280, b2b: 168 },
  { name: "Blood Group", mrp: 150, b2b: 90 },
  { name: "ESR", mrp: 40, b2b: 54 },
  { name: "FBS", mrp: 70, b2b: 46 },
  { name: "PP", mrp: 70, b2b: 46 },
  { name: "RBS", mrp: 70, b2b: 46 },
  { name: "Fasting Insuline", mrp: 715, b2b: 501 },
  { name: "HbA1C", mrp: 520, b2b: 338 },
  { name: "LFT", mrp: 900, b2b: 585 },
  { name: "Bilirubin-Total", mrp: 200, b2b: 120 },
  { name: "Bilirubin-Direct", mrp: 200, b2b: 120 },
  { name: "SGPT", mrp: 180, b2b: 108 },
  { name: "SGOT", mrp: 180, b2b: 108 },
  { name: "GGT", mrp: 200, b2b: 126 },
  { name: "RFT", mrp: 1350, b2b: 878 },
  { name: "Creatinine", mrp: 180, b2b: 108 },
  { name: "Urea", mrp: 180, b2b: 108 },
  { name: "BUN", mrp: null, b2b: null },
  { name: "Uric Acid", mrp: 180, b2b: 108 },
  { name: "Calcium", mrp: 275, b2b: 176 },
  { name: "Lipid Profile", mrp: 550, b2b: 352 },
  { name: "Total Cholestrol", mrp: 180, b2b: 108 },
  { name: "HDL", mrp: 180, b2b: 106 },
  { name: "LDL", mrp: 320, b2b: 224 },
  { name: "LDH", mrp: 350, b2b: 263 },
  { name: "Electrolytes", mrp: 400, b2b: 240 },
  { name: "Sodium", mrp: null, b2b: null },
  { name: "Chlorides", mrp: null, b2b: null },
  { name: "Phosphorous", mrp: null, b2b: null },
  { name: "Potassium", mrp: null, b2b: null },
  { name: "Iron Study", mrp: 520, b2b: 333 },
  { name: "Vit D3", mrp: 1500, b2b: 450 },
  { name: "Vit B12", mrp: 950, b2b: 285 },
  { name: "T3, T4, TSH", mrp: 580, b2b: 232 },
  { name: "TSH", mrp: 320, b2b: 128 },
  { name: "FT3, FT4, TSH", mrp: 680, b2b: 272 },
  { name: "CRP", mrp: 500, b2b: 225 },
  { name: "HSCRP", mrp: 700, b2b: 420 },
  { name: "CPK-MB", mrp: 850, b2b: 536 },
  { name: "CPK-Total", mrp: 380, b2b: 236 },
  { name: "Trop-I", mrp: 770, b2b: 539 },
  { name: "D-Dimer", mrp: 1150, b2b: 736 },
  { name: "PT INR", mrp: 300, b2b: 195 },
  { name: "ApTT", mrp: 400, b2b: 240 },
  { name: "HIV", mrp: 400, b2b: 280 },
  { name: "HCV", mrp: 750, b2b: 600 },
  { name: "HBsAg", mrp: 900, b2b: 612 },
  { name: "VDRL", mrp: 165, b2b: 106 },
  { name: "Triple H Package", mrp: null, b2b: null },
  { name: "Urine Culture", mrp: 800, b2b: 560 },
  { name: "Urine Routine", mrp: 110, b2b: 70 },
  { name: "RA Factor", mrp: 275, b2b: 176 },
  { name: "MP", mrp: 180, b2b: 106 },
  { name: "Widal", mrp: 165, b2b: 106 },
  { name: "Dengue NSI", mrp: 880, b2b: 563 },
  { name: "Dengue IGG", mrp: 880, b2b: 563 },
  { name: "Dengue IGM", mrp: 880, b2b: 563 },
  { name: "MP-Antigen", mrp: 500, b2b: 315 },
  { name: "Beta HCG", mrp: 500, b2b: 355 },
  { name: "Homocysten", mrp: 1200, b2b: 744 },
  { name: "CA125 (Female)", mrp: 1050, b2b: 863 },
  { name: "PSA (Male)", mrp: 1450, b2b: 1001 },
  { name: "IGE", mrp: 770, b2b: 539 },
  { name: "Trop-T", mrp: 770, b2b: 539 },
  { name: "Anti CCP", mrp: 1250, b2b: 813 },
  { name: "ANA", mrp: 950, b2b: 599 },
  { name: "Total Protien", mrp: 200, b2b: 120 },
  { name: "Covid Antibody", mrp: 500, b2b: 350 },
  { name: "FNAC", mrp: 800, b2b: 560 },
  { name: "PP Insuline", mrp: 715, b2b: 501 },
  { name: "CEA", mrp: 850, b2b: 578 },
  { name: "AFPL", mrp: 700, b2b: 462 },
  { name: "Hb Electrophoresis", mrp: null, b2b: null },
  { name: "FT3", mrp: 240, b2b: 120 },
  { name: "FT4", mrp: 240, b2b: 120 },
  { name: "Urine Protein Creatinine Ratio", mrp: null, b2b: null },
  { name: "Protein with A/G Ratio", mrp: null, b2b: null },
  { name: "Lypase", mrp: null, b2b: null },
  { name: "Estradiol", mrp: 700, b2b: 490 },
  { name: "PUS Culture (Aerobic)", mrp: 800, b2b: 560 },
  { name: "FT3, FT4", mrp: null, b2b: null },
  { name: "Fecal Calprotectin", mrp: 3000, b2b: 1920 },
  { name: "Blood Culture 1 SE", mrp: 1050, b2b: 735 },
  { name: "Anti Pro MBP", mrp: 2035, b2b: 1302 },
  { name: "Total TFT", mrp: 580, b2b: 232 },
  { name: "HBS Antigen", mrp: null, b2b: null },
  { name: "Mantoux Test", mrp: 120, b2b: 71 },
  { name: "Reticulate Count", mrp: 180, b2b: 108 },
  { name: "Direct Coombs Test", mrp: 300, b2b: 177 },
  { name: "Microalbuminuria", mrp: 550, b2b: 352 },
  { name: "Total Testosteron", mrp: 600, b2b: 426 },
  { name: "Free Testosteron", mrp: 1600, b2b: 1440 },
  { name: "Protein C", mrp: 3300, b2b: 2640 },
  { name: "Protein S", mrp: 3300, b2b: 2640 },
  { name: "Lupus Anticoagulant", mrp: null, b2b: null },
  { name: "Fibrinogen Level", mrp: 700, b2b: 420 },
  { name: "Anti dsDNA NCX", mrp: 935, b2b: 598 },
  { name: "Apolipoprotein A-1 & B", mrp: 700, b2b: 385 },
  { name: "Folic Acid Level", mrp: 900, b2b: 612 },
  { name: "Allergy Comprehensive", mrp: null, b2b: null }
],
lab3: [
  { name: "CBC", mrp: 190, b2b: 60 },
  { name: "Blood Group", mrp: 220, b2b: 50 },
  { name: "ESR", mrp: 200, b2b: 50 },
  { name: "FBS", mrp: 70, b2b: 15 },
  { name: "PP", mrp: 70, b2b: 15 },
  { name: "RBS", mrp: 70, b2b: 15 },
  { name: "Fasting Insuline", mrp: 770, b2b: 150 },
  { name: "HbA1C", mrp: 495, b2b: 60 },
  { name: "LFT", mrp: 1045, b2b: 150 },
  { name: "Bilirubin-Total", mrp: 130, b2b: 22 },
  { name: "Bilirubin-Direct", mrp: 130, b2b: 24 },
  { name: "SGPT", mrp: 190, b2b: 24 },
  { name: "SGOT", mrp: 190, b2b: 22 },
  { name: "GGT", mrp: 242, b2b: 60 },
  { name: "RFT", mrp: 1150, b2b: 863 },
  { name: "Creatinine", mrp: 180, b2b: 22 },
  { name: "Urea", mrp: 165, b2b: 25 },
  { name: "BUN", mrp: 220, b2b: 60 },
  { name: "Uric Acid", mrp: 220, b2b: 22 },
  { name: "Calcium", mrp: 176, b2b: 22 },
  { name: "Lipid Profile", mrp: 715, b2b: 100 },
  { name: "Total Cholestrol", mrp: 180, b2b: 10 },
  { name: "HDL", mrp: 180, b2b: 10 },
  { name: "LDL", mrp: 300, b2b: 50 },
  { name: "LDH", mrp: 363, b2b: 60 },
  { name: "Electrolytes", mrp: 520, b2b: 140 },
  { name: "Sodium", mrp: 275, b2b: 40 },
  { name: "Chlorides", mrp: 275, b2b: 40 },
  { name: "Phosphorous", mrp: 275, b2b: 40 },
  { name: "Potassium", mrp: 220, b2b: 40 },
  { name: "Iron Study", mrp: 660, b2b: 150 },
  { name: "Vit D3", mrp: 1280, b2b: 200 },
  { name: "Vit B12", mrp: 1800, b2b: 1200 },
  { name: "T3, T4, TSH", mrp: 495, b2b: 60 },
  { name: "TSH", mrp: 275, b2b: 20 },
  { name: "FT3, FT4, TSH", mrp: 1045, b2b: 140 },
  { name: "CRP", mrp: 495, b2b: 150 },
  { name: "HSCRP", mrp: 750, b2b: 175 },
  { name: "CPK-MB", mrp: 715, b2b: 200 },
  { name: "CPK-Total", mrp: 385, b2b: 125 },
  { name: "Trop-I", mrp: 1200, b2b: 650 },
  { name: "D-Dimer", mrp: 1540, b2b: 1230 },
  { name: "PT INR", mrp: 450, b2b: 105 },
  { name: "ApTT", mrp: 418, b2b: 200 },
  { name: "HIV", mrp: 475, b2b: 120 },
  { name: "HCV", mrp: 935, b2b: 99 },
  { name: "HBsAg", mrp: 450, b2b: 250 },
  { name: "VDRL", mrp: 220, b2b: 75 },
  { name: "Triple H Package", mrp: 1730, b2b: 350 },
  { name: "Urine Culture", mrp: 950, b2b: 120 },
  { name: "Urine Routine", mrp: 300, b2b: 100 },
  { name: "RA Factor", mrp: 495, b2b: 200 },
  { name: "MP", mrp: 275, b2b: 100 },
  { name: "Widal", mrp: 330, b2b: 60 },
  { name: "Dengue NSI", mrp: 660, b2b: 250 },
  { name: "Dengue IGG", mrp: 660, b2b: 275 },
  { name: "Dengue IGM", mrp: 660, b2b: 275 },
  { name: "MP-Antigen", mrp: 700, b2b: 100 },
  { name: "Beta HCG", mrp: 550, b2b: 160 },
  { name: "Homocysten", mrp: 1155, b2b: 400 },
  { name: "CA125 (Female)", mrp: 1155, b2b: 350 },
  { name: "PSA (Male)", mrp: 935, b2b: 300 },
  { name: "IGE", mrp: 825, b2b: 195 },
  { name: "Trop-T", mrp: 1800, b2b: 700 },
  { name: "Anti CCP", mrp: 1375, b2b: 385 },
  { name: "ANA", mrp: 750, b2b: 175 }
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
{ name: "Goodness A1", tests: ["CBC", "LFT", "RFT", "Lipid Profile", "Iron Study", "HbA1C", "Total TFT", "Vit B12", "Vit D3"], mrp: 2500, b2b: 1200 },
{ name: "Goodness C", tests: ["SGOT", "LDH", "CPK-MB", "Trop-I"], mrp: 2200, b2b: 1200 },
{ name: "Goodness 3H", tests: ["HIV", "HBsAg", "HCV"], mrp: 1500, b2b: 650 },
{ name: "Goodness BA (Male)", tests: ["CBC", "FBS", "HbA1C", "Fasting Insuline", "Lipid Profile", "LFT", "RFT", "Vit B12", "Vit D3", "Total TFT", "Homocysten", "PSA (Male)", "CRP"], mrp: 3500, b2b: 1400 },
{ name: "Goodness BB (Female)", tests: ["CBC", "FBS", "HbA1C", "Fasting Insuline", "Lipid Profile", "LFT", "RFT", "Vit B12", "Vit D3", "Total TFT", "Homocysten", "CA125 (Female)", "CRP"], mrp: 3500, b2b: 1500 },
{ name: "Goodness E", tests: ["CBC", "FBS", "PP", "HbA1C", "Creatinine", "Uric Acid", "Lipid Profile"], mrp: 1000, b2b: 450 },
{ name: "Goodness G", tests: ["CBC", "FBS", "PP", "HbA1C", "Lipid Profile", "Creatinine", "Total TFT", "Uric Acid"], mrp: 1500, b2b: 550 },
{ name: "Goodness F", tests: ["CBC", "Creatinine", "HbA1C", "Lipid Profile", "LFT", "RFT"], mrp: 1800, b2b: 600 },
{ name: "ANC Profile", tests: ["CBC", "Blood Group", "FBS", "HBsAg", "HIV", "HCV", "VDRL", "TSH", "Hb Electrophoresis", "Urine Routine"], mrp: 1800, b2b: 1620 },
{ name: "Goodness Fever Profile", tests: ["CBC", "ESR", "SGOT", "SGPT", "CRP", "Dengue NSI", "MP-Antigen", "Urine Routine", "Widal"], mrp: 3000, b2b: 950 }
  ],
  lab2: [
  ],
  lab3: [
  ],
  lab4: [
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
// Then add +1 extra Fluoride tube if PP test exists in that lab
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
  
  // Special handling for PP test: add exactly +1 additional Fluoride tube
  if (tests.includes("PP")) {
    if (tubeCounts["Fluoride"]) {
      tubeCounts["Fluoride"] += 1;
    } else {
      tubeCounts["Fluoride"] = 1;
    }
  }
  
  return tubeCounts;
}

// Calculate total tube counts across all labs (sum per lab)
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
