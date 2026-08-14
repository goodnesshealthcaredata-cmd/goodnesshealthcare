// ============================================================
//  DATA.JS - All labs with consistent structure
// ============================================================

const LAB_DATA = {
  "1": {
    "name": "Dr. Ajay Shah Laboratory",
    "tests": [
      {
        "id": "cbc",
        "generalName": "CBC",
        "labName": "CBC",
        "mrp": 300,
        "b2b": 80
      },
      {
        "id": "blood-group",
        "generalName": "Blood Group",
        "labName": "Blood Group & RH",
        "mrp": 180,
        "b2b": 80
      },
      {
        "id": "esr",
        "generalName": "ESR",
        "labName": "ESR",
        "mrp": 150,
        "b2b": 60
      },
      {
        "id": "fbs",
        "generalName": "FBS",
        "labName": "Glucose - Fasting",
        "mrp": 80,
        "b2b": 30
      },
      {
        "id": "pp",
        "generalName": "PP",
        "labName": "Glucose - Post Prandial",
        "mrp": 80,
        "b2b": 30
      },
      {
        "id": "rbs",
        "generalName": "RBS",
        "labName": "Glucose - Random",
        "mrp": 80,
        "b2b": 30
      },
      {
        "id": "insulin-fasting",
        "generalName": "Insulin Fasting",
        "labName": "Insulin Fasting",
        "mrp": 800,
        "b2b": 350
      },
      {
        "id": "insulin-random",
        "generalName": "Insulin Random",
        "labName": "Insulin Random",
        "mrp": 800,
        "b2b": 350
      },
      {
        "id": "hba1c",
        "generalName": "HbA1C",
        "labName": "Glyco Hemoglobin (HbA1c)",
        "mrp": 550,
        "b2b": 130
      },
      {
        "id": "hbsag",
        "generalName": "HBsAg",
        "labName": "",
        "mrp": 550,
        "b2b": 385
      },
      {
        "id": "hbeag",
        "generalName": "HBeAg",
        "labName": "Hepatitis B Envelope Antigen (HBe Ag)",
        "mrp": 1200,
        "b2b": 840
      },
      {
        "id": "bilirubin-total",
        "generalName": "Bilirubin Total",
        "labName": "Bilirubin level Total",
        "mrp": 190,
        "b2b": 114
      },
      {
        "id": "bilirubin-direct",
        "generalName": "Bilirubin-Direct",
        "labName": "",
        "mrp": "",
        "b2b": ""
      },
      {
        "id": "bilirubin-indirect",
        "generalName": "Bilirubin-Indirect",
        "labName": "",
        "mrp": "",
        "b2b": ""
      },
      {
        "id": "sgpt",
        "generalName": "SGPT",
        "labName": "SGPT (ALT)",
        "mrp": 190,
        "b2b": 40
      },
      {
        "id": "sgot",
        "generalName": "SGOT",
        "labName": "SGOT (AST)",
        "mrp": 190,
        "b2b": 40
      },
      {
        "id": "ggt",
        "generalName": "GGT",
        "labName": "Gamma Glutamyl Transferase (GGT)",
        "mrp": 280,
        "b2b": 196
      },
      {
        "id": "creatinine",
        "generalName": "Creatinine",
        "labName": "Creatinine",
        "mrp": 190,
        "b2b": 50
      },
      {
        "id": "urea",
        "generalName": "Urea",
        "labName": "Urea",
        "mrp": 190,
        "b2b": 114
      },
      {
        "id": "bun",
        "generalName": "BUN",
        "labName": "Blood Urea Nitrogen (BUN)",
        "mrp": 190,
        "b2b": 114
      },
      {
        "id": "uric-acid",
        "generalName": "Uric Acid",
        "labName": "Uric Acid",
        "mrp": 190,
        "b2b": 50
      },
      {
        "id": "calcium",
        "generalName": "Calcium",
        "labName": "Calcium",
        "mrp": 190,
        "b2b": 114
      },
      {
        "id": "lipid-profile",
        "generalName": "Lipid Profile",
        "labName": "Lipid Profile",
        "mrp": 600,
        "b2b": 185
      },
      {
        "id": "total-cholesterol",
        "generalName": "Total Cholesterol",
        "labName": "Cholesterol",
        "mrp": 190,
        "b2b": 114
      },
      {
        "id": "hdl-cholesterol",
        "generalName": "HDL Cholesterol",
        "labName": "HDL Cholesterol",
        "mrp": 220,
        "b2b": 132
      },
      {
        "id": "ldl-cholesterol",
        "generalName": "LDL Cholesterol",
        "labName": "LDL Cholesterol (Direct)",
        "mrp": 400,
        "b2b": 240
      },
      {
        "id": "ldh",
        "generalName": "LDH",
        "labName": "LDH",
        "mrp": 500,
        "b2b": 150
      },
      {
        "id": "ldh-fluid",
        "generalName": "LDH Fluid",
        "labName": "LDH, Body Fluids",
        "mrp": 500,
        "b2b": 350
      },
      {
        "id": "ldh-ascitic-fluid",
        "generalName": "LDH Ascitic Fluid",
        "labName": "",
        "mrp": "",
        "b2b": ""
      },
      {
        "id": "sodium",
        "generalName": "Sodium",
        "labName": "Sodium",
        "mrp": 180,
        "b2b": 108
      },
      {
        "id": "chloride",
        "generalName": "Chloride",
        "labName": "Chloride",
        "mrp": 150,
        "b2b": 90
      },
      {
        "id": "phosphorus",
        "generalName": "Phosphorus",
        "labName": "Phosphorus Inorganic",
        "mrp": 190,
        "b2b": 114
      },
      {
        "id": "potassium",
        "generalName": "Potassium",
        "labName": "Potassium",
        "mrp": 180,
        "b2b": 108
      },
      {
        "id": "iron-study",
        "generalName": "Iron Study",
        "labName": "Iron Studies (TIBC)",
        "mrp": 800,
        "b2b": 300
      },
      {
        "id": "vit-d3",
        "generalName": "Vit D3",
        "labName": "25 OH Cholecalciferol (D2+D3)",
        "mrp": 1300,
        "b2b": 250
      },
      {
        "id": "vit-b12",
        "generalName": "Vit B12",
        "labName": "Vitamin B - 12 Level",
        "mrp": 850,
        "b2b": 250
      },
      {
        "id": "t3",
        "generalName": "T3",
        "labName": "Triiodothyronine - T3",
        "mrp": 250,
        "b2b": 80
      },
      {
        "id": "t4",
        "generalName": "T4",
        "labName": "Thyroxine -T4",
        "mrp": 250,
        "b2b": 80
      },
      {
        "id": "tsh",
        "generalName": "TSH",
        "labName": "TSH",
        "mrp": 370,
        "b2b": 50
      },
      {
        "id": "ft3",
        "generalName": "FT3",
        "labName": "Free Triiodothyronine(Free T3)",
        "mrp": 280,
        "b2b": 80
      },
      {
        "id": "ft4",
        "generalName": "FT4",
        "labName": "Free Thyroxine(Free T4)",
        "mrp": 280,
        "b2b": 80
      },
      {
        "id": "crp",
        "generalName": "CRP",
        "labName": "C- Reactive Protein",
        "mrp": 480,
        "b2b": 150
      },
      {
        "id": "hscrp",
        "generalName": "HSCRP",
        "labName": "High Sensitive CRP",
        "mrp": 900,
        "b2b": 350
      },
      {
        "id": "cpk-mb",
        "generalName": "CPK-MB",
        "labName": "CPK-MB level",
        "mrp": 850,
        "b2b": 350
      },
      {
        "id": "cpk-total",
        "generalName": "CPK-Total",
        "labName": "CPK Total",
        "mrp": 550,
        "b2b": 330
      },
      {
        "id": "trop-i",
        "generalName": "Trop-I",
        "labName": "",
        "mrp": 1200,
        "b2b": 750
      },
      {
        "id": "trop-t",
        "generalName": "Trop-T",
        "labName": "Troponin T",
        "mrp": 1500,
        "b2b": 1050
      },
      {
        "id": "d-dimer",
        "generalName": "D-Dimer",
        "labName": "DDimer",
        "mrp": 1200,
        "b2b": 500
      },
      {
        "id": "pt-inr",
        "generalName": "PT INR",
        "labName": "Prothrombin Time (Photooptical clot detection)",
        "mrp": 330,
        "b2b": 120
      },
      {
        "id": "aptt",
        "generalName": "ApTT",
        "labName": "Activated Partial Thromboplastin Time (Photooptical clot detection)",
        "mrp": 600,
        "b2b": 330
      },
      {
        "id": "hiv",
        "generalName": "HIV",
        "labName": "HIV I & II",
        "mrp": 600,
        "b2b": 350
      },
      {
        "id": "hcv",
        "generalName": "HCV",
        "labName": "HCV MANUAL",
        "mrp": 900,
        "b2b": 525
      },
      {
        "id": "vdrl",
        "generalName": "VDRL",
        "labName": "",
        "mrp": 370,
        "b2b": 180
      },
      {
        "id": "urine-culture",
        "generalName": "Urine Culture",
        "labName": "",
        "mrp": 950,
        "b2b": 400
      },
      {
        "id": "urine-routine",
        "generalName": "Urine Routine",
        "labName": "",
        "mrp": 160,
        "b2b": 60
      },
      {
        "id": "ra-factor",
        "generalName": "RA Factor",
        "labName": "",
        "mrp": 500,
        "b2b": 270
      },
      {
        "id": "mp",
        "generalName": "MP",
        "labName": "",
        "mrp": 120,
        "b2b": 72
      },
      {
        "id": "widal",
        "generalName": "Widal",
        "labName": "",
        "mrp": 250,
        "b2b": 150
      },
      {
        "id": "dengue-ns1",
        "generalName": "Dengue NS1",
        "labName": "",
        "mrp": 800,
        "b2b": 350
      },
      {
        "id": "dengue-igg",
        "generalName": "Dengue IgG",
        "labName": "",
        "mrp": 800,
        "b2b": 300
      },
      {
        "id": "dengue-igm",
        "generalName": "Dengue IgM",
        "labName": "",
        "mrp": 800,
        "b2b": 350
      },
      {
        "id": "mp-antigen",
        "generalName": "MP-Antigen",
        "labName": "",
        "mrp": 450,
        "b2b": 315
      },
      {
        "id": "beta-hcg",
        "generalName": "Beta HCG",
        "labName": "",
        "mrp": 850,
        "b2b": 200
      },
      {
        "id": "homocysten",
        "generalName": "Homocysten",
        "labName": "",
        "mrp": 1450,
        "b2b": 500
      },
      {
        "id": "ca125-female",
        "generalName": "CA125 (Female)",
        "labName": "",
        "mrp": 1200,
        "b2b": 500
      },
      {
        "id": "psa-male",
        "generalName": "PSA (Male)",
        "labName": "",
        "mrp": 900,
        "b2b": 350
      },
      {
        "id": "ige",
        "generalName": "IgE",
        "labName": "",
        "mrp": 950,
        "b2b": 400
      },
      {
        "id": "anti-ccp",
        "generalName": "Anti CCP",
        "labName": "",
        "mrp": 1550,
        "b2b": 650
      },
      {
        "id": "ana",
        "generalName": "ANA",
        "labName": "",
        "mrp": 950,
        "b2b": 500
      },
      {
        "id": "total-protien",
        "generalName": "Total Protien",
        "labName": "",
        "mrp": 250,
        "b2b": 80
      },
      {
        "id": "covid-antibody",
        "generalName": "Covid Antibody",
        "labName": "",
        "mrp": 1000,
        "b2b": 500
      },
      {
        "id": "fnac",
        "generalName": "FNAC",
        "labName": "",
        "mrp": 1500,
        "b2b": 1050
      },
      {
        "id": "cea",
        "generalName": "CEA",
        "labName": "",
        "mrp": 800,
        "b2b": 400
      },
      {
        "id": "afpl",
        "generalName": "AFPL",
        "labName": "",
        "mrp": 900,
        "b2b": 450
      },
      {
        "id": "hb-electrophoresis",
        "generalName": "Hb Electrophoresis",
        "labName": "",
        "mrp": 950,
        "b2b": 450
      },
      {
        "id": "urine-protein-creatinine-ratio",
        "generalName": "Urine Protein Creatinine Ratio",
        "labName": "",
        "mrp": 420,
        "b2b": 240
      },
      {
        "id": "protein-with-a-g-ratio",
        "generalName": "Protein with A/G Ratio",
        "labName": "",
        "mrp": 250,
        "b2b": 80
      },
      {
        "id": "lipase",
        "generalName": "Lipase",
        "labName": "",
        "mrp": 750,
        "b2b": 300
      },
      {
        "id": "estradiol",
        "generalName": "Estradiol",
        "labName": "",
        "mrp": 780,
        "b2b": 300
      },
      {
        "id": "pus-culture-aerobic",
        "generalName": "PUS Culture (Aerobic)",
        "labName": "",
        "mrp": 950,
        "b2b": 400
      },
      {
        "id": "fecal-calprotectin",
        "generalName": "Fecal Calprotectin",
        "labName": "",
        "mrp": 2800,
        "b2b": 2240
      },
      {
        "id": "blood-culture-1-se",
        "generalName": "Blood Culture 1 SE",
        "labName": "",
        "mrp": 1500,
        "b2b": 800
      },
      {
        "id": "nt-pro-bnp",
        "generalName": "NT-Pro BNP",
        "labName": "",
        "mrp": 2500,
        "b2b": 1100
      },
      {
        "id": "hbs-antigen",
        "generalName": "HBS Antigen",
        "labName": "",
        "mrp": 550,
        "b2b": 350
      },
      {
        "id": "mantoux-test",
        "generalName": "Mantoux Test",
        "labName": "",
        "mrp": 150,
        "b2b": 135
      },
      {
        "id": "reticulate-count",
        "generalName": "Reticulate Count",
        "labName": "",
        "mrp": 400,
        "b2b": 210
      },
      {
        "id": "direct-coombs-test",
        "generalName": "Direct Coombs Test",
        "labName": "",
        "mrp": 550,
        "b2b": 150
      },
      {
        "id": "microalbuminuria",
        "generalName": "Microalbuminuria",
        "labName": "",
        "mrp": 620,
        "b2b": 250
      },
      {
        "id": "total-testosterone",
        "generalName": "Total Testosterone",
        "labName": "",
        "mrp": 780,
        "b2b": 350
      },
      {
        "id": "free-testosterone",
        "generalName": "Free Testosterone",
        "labName": "",
        "mrp": 1550,
        "b2b": 750
      },
      {
        "id": "protein-c",
        "generalName": "Protein C",
        "labName": "",
        "mrp": 4500,
        "b2b": 4050
      },
      {
        "id": "protein-s",
        "generalName": "Protein S",
        "labName": "",
        "mrp": 4500,
        "b2b": 4050
      },
      {
        "id": "lupus-anticoagulant",
        "generalName": "Lupus Anticoagulant",
        "labName": "",
        "mrp": 1800,
        "b2b": 800
      },
      {
        "id": "fibrinogen-level",
        "generalName": "Fibrinogen Level",
        "labName": "",
        "mrp": 850,
        "b2b": 400
      },
      {
        "id": "anti-dsdna-ncx",
        "generalName": "Anti dsDNA NCX",
        "labName": "",
        "mrp": 1750,
        "b2b": 1000
      },
      {
        "id": "apolipoprotein-a-1-b",
        "generalName": "Apolipoprotein A1 & B",
        "labName": "",
        "mrp": 1100,
        "b2b": 770
      },
      {
        "id": "folic-acid-level",
        "generalName": "Folic Acid Level",
        "labName": "",
        "mrp": 1100,
        "b2b": 500
      },
      {
        "id": "allergy-comprehensive",
        "generalName": "Allergy Comprehensive",
        "labName": "",
        "mrp": 5500,
        "b2b": 3850
      },
      {
        "id": "maleria-antigen",
        "generalName": "Maleria Antigen",
        "labName": "",
        "mrp": 450,
        "b2b": 315
      },
      {
        "id": "fasting-urine-glucose",
        "generalName": "Fasting Urine Glucose",
        "labName": "",
        "mrp": 50,
        "b2b": 30
      },
      {
        "id": "factor-v",
        "generalName": "Factor V",
        "labName": "",
        "mrp": 5500,
        "b2b": 4400
      },
      {
        "id": "ferritin",
        "generalName": "Ferritin",
        "labName": "",
        "mrp": 950,
        "b2b": 400
      },
      {
        "id": "hav",
        "generalName": "HAV",
        "labName": "",
        "mrp": 1200,
        "b2b": 550
      },
      {
        "id": "hev",
        "generalName": "HEV",
        "labName": "",
        "mrp": 1500,
        "b2b": 600
      },
      {
        "id": "ra-test",
        "generalName": "RA Test",
        "labName": "",
        "mrp": 500,
        "b2b": 270
      },
      {
        "id": "egfr",
        "generalName": "eGFR",
        "labName": "",
        "mrp": 300,
        "b2b": 150
      },
      {
        "id": "iron-profile-with-ferritine",
        "generalName": "Iron Profile with Ferritine",
        "labName": "",
        "mrp": "",
        "b2b": ""
      },
      {
        "id": "allergy-drug-test",
        "generalName": "Allergy Drug Test",
        "labName": "",
        "mrp": 7500,
        "b2b": 5250
      },
      {
        "id": "iga-ttg",
        "generalName": "IgA tTG",
        "labName": "",
        "mrp": 800,
        "b2b": 500
      },
      {
        "id": "peripheral-smear",
        "generalName": "Peripheral Smear",
        "labName": "",
        "mrp": 150,
        "b2b": 60
      },
      {
        "id": "cortisol-8-am",
        "generalName": "Cortisol 8 AM",
        "labName": "",
        "mrp": 850,
        "b2b": 350
      },
      {
        "id": "h-pylori-stool",
        "generalName": "H. Pylori Stool",
        "labName": "",
        "mrp": 1250,
        "b2b": 960
      },
      {
        "id": "chikungunya-igg",
        "generalName": "Chikungunya IgG",
        "labName": "",
        "mrp": 900,
        "b2b": 810
      },
      {
        "id": "fba",
        "generalName": "FBA",
        "labName": "",
        "mrp": "",
        "b2b": ""
      },
      {
        "id": "protein-electrophoresis",
        "generalName": "Protein Electrophoresis",
        "labName": "",
        "mrp": 1200,
        "b2b": 500
      },
      {
        "id": "sputum-tb-culture-abs",
        "generalName": "Sputum TB Culture & ABS",
        "labName": "",
        "mrp": 150,
        "b2b": 90
      },
      {
        "id": "complement-c3-c4",
        "generalName": "Complement C3 & C4",
        "labName": "",
        "mrp": "",
        "b2b": ""
      },
      {
        "id": "dheas",
        "generalName": "DHEAS",
        "labName": "",
        "mrp": 1150,
        "b2b": 600
      },
      {
        "id": "dhea",
        "generalName": "DHEA",
        "labName": "",
        "mrp": 3000,
        "b2b": 2100
      },
      {
        "id": "torch-complex",
        "generalName": "Torch Complex",
        "labName": "",
        "mrp": 2800,
        "b2b": 1200
      },
      {
        "id": "zinc-level",
        "generalName": "Zinc Level",
        "labName": "",
        "mrp": 2200,
        "b2b": 1980
      },
      {
        "id": "magnesium",
        "generalName": "Magnesium",
        "labName": "",
        "mrp": 400,
        "b2b": 280
      },
      {
        "id": "estrogen",
        "generalName": "Estrogen",
        "labName": "",
        "mrp": "",
        "b2b": ""
      },
      {
        "id": "c-peptide-random",
        "generalName": "C-Peptide Random",
        "labName": "",
        "mrp": 1150,
        "b2b": 550
      },
      {
        "id": "b2-glycoprotein-1-igg",
        "generalName": "B2 Glycoprotein 1 IgG",
        "labName": "",
        "mrp": 1200,
        "b2b": 500
      },
      {
        "id": "karyotyping-husband",
        "generalName": "Karyotyping - Husband",
        "labName": "",
        "mrp": 4000,
        "b2b": 2800
      },
      {
        "id": "karyotyping-wife",
        "generalName": "Karyotyping - Wife",
        "labName": "",
        "mrp": 4000,
        "b2b": 2800
      },
      {
        "id": "influenza-screening-for-abf",
        "generalName": "Influenza Screening for ABF",
        "labName": "",
        "mrp": "",
        "b2b": ""
      },
      {
        "id": "psa-free-total",
        "generalName": "PSA Free & Total",
        "labName": "",
        "mrp": 850,
        "b2b": 350
      },
      {
        "id": "lh",
        "generalName": "LH",
        "labName": "",
        "mrp": 550,
        "b2b": 180
      },
      {
        "id": "fsh",
        "generalName": "FSH",
        "labName": "",
        "mrp": 550,
        "b2b": 180
      },
      {
        "id": "semen-analysis",
        "generalName": "Semen Analysis",
        "labName": "",
        "mrp": 1100,
        "b2b": 770
      },
      {
        "id": "alkaline-phosphatase",
        "generalName": "Alkaline Phosphatase",
        "labName": "",
        "mrp": "",
        "b2b": ""
      },
      {
        "id": "globulin",
        "generalName": "Globulin",
        "labName": "",
        "mrp": "",
        "b2b": ""
      },
      {
        "id": "bun-creatinine-ratio",
        "generalName": "BUN / Creatinine Ratio",
        "labName": "",
        "mrp": "",
        "b2b": ""
      },
      {
        "id": "urea-g-ratio",
        "generalName": "Urea/G Ratio",
        "labName": "",
        "mrp": "",
        "b2b": ""
      },
      {
        "id": "stool-routine",
        "generalName": "Stool Routine",
        "labName": "",
        "mrp": 170,
        "b2b": 90
      },
      {
        "id": "albumin",
        "generalName": "Albumin",
        "labName": "",
        "mrp": 400,
        "b2b": 320
      },
      {
        "id": "bicarbonate",
        "generalName": "Bicarbonate",
        "labName": "",
        "mrp": 600,
        "b2b": 360
      },
      {
        "id": "amylase",
        "generalName": "Amylase",
        "labName": "",
        "mrp": 700,
        "b2b": 275
      },
      {
        "id": "acth",
        "generalName": "ACTH",
        "labName": "",
        "mrp": 1800,
        "b2b": 1620
      },
      {
        "id": "throat-swab-c-s",
        "generalName": "Throat Swab C/S",
        "labName": "",
        "mrp": 950,
        "b2b": 400
      },
      {
        "id": "aso-titer",
        "generalName": "ASO Titer",
        "labName": "",
        "mrp": 650,
        "b2b": 390
      },
      {
        "id": "amh",
        "generalName": "AMH",
        "labName": "",
        "mrp": 2000,
        "b2b": 1000
      },
      {
        "id": "pth",
        "generalName": "PTH",
        "labName": "",
        "mrp": 1600,
        "b2b": 1120
      },
      {
        "id": "apo-b-apo-a1-ratio",
        "generalName": "Apo B: Apo A1 ratio",
        "labName": "",
        "mrp": "",
        "b2b": ""
      },
      {
        "id": "bt-ct",
        "generalName": "BT CT",
        "labName": "",
        "mrp": "",
        "b2b": ""
      },
      {
        "id": "hpv-dna",
        "generalName": "HPV DNA",
        "labName": "",
        "mrp": 2800,
        "b2b": 2520
      },
      {
        "id": "anti-tpo-antibody",
        "generalName": "Anti-TPO Antibody",
        "labName": "",
        "mrp": 1100,
        "b2b": 600
      },
      {
        "id": "apolipoprotein-a-1",
        "generalName": "Apolipoprotein A1",
        "labName": "",
        "mrp": 550,
        "b2b": 385
      },
      {
        "id": "apolipoprotein-b",
        "generalName": "Apolipoprotein B",
        "labName": "",
        "mrp": 550,
        "b2b": 385
      },
      {
        "id": "stool-calprotectin",
        "generalName": "Stool Calprotectin",
        "labName": "",
        "mrp": 2800,
        "b2b": 2240
      },
      {
        "id": "phadiatop",
        "generalName": "Phadiatop",
        "labName": "",
        "mrp": 2300,
        "b2b": 2070
      },
      {
        "id": "prolactin",
        "generalName": "Prolactin",
        "labName": "",
        "mrp": 600,
        "b2b": 200
      },
      {
        "id": "progesterone",
        "generalName": "Progesterone",
        "labName": "",
        "mrp": 800,
        "b2b": 300
      },
      {
        "id": "specific-cardiac-profile",
        "generalName": "Specific Cardiac Profile",
        "labName": "",
        "mrp": "",
        "b2b": ""
      },
      {
        "id": "lipoprotein",
        "generalName": "Lipoprotein",
        "labName": "",
        "mrp": 1200,
        "b2b": 840
      },
      {
        "id": "h-pylori-stool-antigen-test",
        "generalName": "H. Pylori Stool Antigen Test",
        "labName": "",
        "mrp": 1250,
        "b2b": 1000
      },
      {
        "id": "typhidot-igm",
        "generalName": "Typhidot IgM",
        "labName": "",
        "mrp": 600,
        "b2b": 480
      },
      {
        "id": "osmolarity-serum",
        "generalName": "Osmolarity Serum",
        "labName": "",
        "mrp": 1500,
        "b2b": 1350
      },
      {
        "id": "osmolarity-urine",
        "generalName": "Osmolarity Urine",
        "labName": "",
        "mrp": 1500,
        "b2b": 1350
      },
      {
        "id": "dual-marker",
        "generalName": "Dual Marker",
        "labName": "",
        "mrp": 2500,
        "b2b": 2250
      },
      {
        "id": "extra-test",
        "generalName": "Extra Test",
        "labName": "",
        "mrp": "",
        "b2b": ""
      },
      {
        "id": "lft",
        "generalName": "LFT",
        "labName": "Liver Function Test",
        "mrp": 900,
        "b2b": 220
      },
      {
        "id": "rft",
        "generalName": "RFT",
        "labName": "LIFECHECK-AS RENAL FUNCTION TEST",
        "mrp": 1000,
        "b2b": 600
      },
      {
        "id": "electrolytes",
        "generalName": "Electrolytes",
        "labName": "Electrolytes",
        "mrp": 480,
        "b2b": 130
      },
      {
        "id": "total-tft",
        "generalName": "Total TFT",
        "labName": "Thyroid Function Test",
        "mrp": 550,
        "b2b": 110
      },
      {
        "id": "free-tft",
        "generalName": "Free TFT",
        "labName": "Free Thyroid Profile",
        "mrp": 650,
        "b2b": 200
      },
      {
        "id": "triple-h",
        "generalName": "Triple H",
        "labName": "Goodness 3H",
        "mrp": 1500,
        "b2b": 650
      }
    ],
    "packages": [
      {
        "id": "goodness-a1",
        "packageName": "Goodness A1",
        "tests": [
          {
            "generalName": "CBC",
            "labName": "CBC"
          },
          {
            "generalName": "FBS",
            "labName": "Glucose - Fasting"
          },
          {
            "generalName": "PP",
            "labName": "Glucose - Post Prandial"
          },
          {
            "generalName": "HbA1C",
            "labName": "Glyco Hemoglobin (HbA1c)"
          },
          {
            "generalName": "Total TFT",
            "labName": "Thyroid Function Test"
          },
          {
            "generalName": "Iron Study",
            "labName": "Iron Studies (TIBC)"
          },
          {
            "generalName": "Vit D3",
            "labName": "25 OH Cholecalciferol (D2+D3)"
          },
          {
            "generalName": "Vit B12",
            "labName": "Vitamin B - 12 Level"
          },
          {
            "generalName": "Lipid Profile",
            "labName": "Lipid Profile"
          },
          {
            "generalName": "LFT",
            "labName": "Liver Function Test"
          },
          {
            "generalName": "RFT",
            "labName": "LIFECHECK-AS RENAL FUNCTION TEST"
          }
        ],
        "mrp": 2500,
        "b2b": 1200
      },
      {
        "id": "goodness-e",
        "packageName": "Goodness E",
        "tests": [
          {
            "generalName": "CBC",
            "labName": "CBC"
          },
          {
            "generalName": "FBS",
            "labName": "Glucose - Fasting"
          },
          {
            "generalName": "PP",
            "labName": "Glucose - Post Prandial"
          },
          {
            "generalName": "HbA1C",
            "labName": "Glyco Hemoglobin (HbA1c)"
          },
          {
            "generalName": "Lipid Profile",
            "labName": "Lipid Profile"
          },
          {
            "generalName": "Creatinine",
            "labName": "Creatinine"
          },
          {
            "generalName": "Uric Acid",
            "labName": "Uric Acid"
          }
        ],
        "mrp": 1000,
        "b2b": 450
      },
      {
        "id": "goodness-g",
        "packageName": "Goodness G",
        "tests": [
          {
            "generalName": "CBC",
            "labName": "CBC"
          },
          {
            "generalName": "FBS",
            "labName": "Glucose - Fasting"
          },
          {
            "generalName": "PP",
            "labName": "Glucose - Post Prandial"
          },
          {
            "generalName": "HbA1C",
            "labName": "Glyco Hemoglobin (HbA1c)"
          },
          {
            "generalName": "Lipid Profile",
            "labName": "Lipid Profile"
          },
          {
            "generalName": "Creatinine",
            "labName": "Creatinine"
          },
          {
            "generalName": "Total TFT",
            "labName": "Thyroid Function Test"
          },
          {
            "generalName": "Uric Acid",
            "labName": "Uric Acid"
          }
        ],
        "mrp": 1500,
        "b2b": 550
      },
      {
        "id": "goodness-bb-female",
        "packageName": "Goodness BB (Female)",
        "tests": [
          {
            "generalName": "CBC",
            "labName": "CBC"
          },
          {
            "generalName": "FBS",
            "labName": "Glucose - Fasting"
          },
          {
            "generalName": "HbA1C",
            "labName": "Glyco Hemoglobin (HbA1c)"
          },
          {
            "generalName": "Lipid Profile",
            "labName": "Lipid Profile"
          },
          {
            "generalName": "HSCRP",
            "labName": "High Sensitive CRP"
          },
          {
            "generalName": "LFT",
            "labName": "Liver Function Test"
          },
          {
            "generalName": "RFT",
            "labName": "LIFECHECK-AS RENAL FUNCTION TEST"
          },
          {
            "generalName": "Insulin Fasting",
            "labName": "Insulin Fasting"
          },
          {
            "generalName": "Vit B12",
            "labName": "Vitamin B - 12 Level"
          },
          {
            "generalName": "Vit D3",
            "labName": "25 OH Cholecalciferol (D2+D3)"
          },
          {
            "generalName": "Total TFT",
            "labName": "Thyroid Function Test"
          },
          {
            "generalName": "Homocysten",
            "labName": ""
          },
          {
            "generalName": "CA125 (Female)",
            "labName": ""
          }
        ],
        "mrp": 3500,
        "b2b": 1500
      },
      {
        "id": "goodness-ba-male",
        "packageName": "Goodness BA (Male)",
        "tests": [
          {
            "generalName": "CBC",
            "labName": "CBC"
          },
          {
            "generalName": "FBS",
            "labName": "Glucose - Fasting"
          },
          {
            "generalName": "HbA1C",
            "labName": "Glyco Hemoglobin (HbA1c)"
          },
          {
            "generalName": "Lipid Profile",
            "labName": "Lipid Profile"
          },
          {
            "generalName": "HSCRP",
            "labName": "High Sensitive CRP"
          },
          {
            "generalName": "LFT",
            "labName": "Liver Function Test"
          },
          {
            "generalName": "RFT",
            "labName": "LIFECHECK-AS RENAL FUNCTION TEST"
          },
          {
            "generalName": "Insulin Fasting",
            "labName": "Insulin Fasting"
          },
          {
            "generalName": "Vit B12",
            "labName": "Vitamin B - 12 Level"
          },
          {
            "generalName": "Vit D3",
            "labName": "25 OH Cholecalciferol (D2+D3)"
          },
          {
            "generalName": "Total TFT",
            "labName": "Thyroid Function Test"
          },
          {
            "generalName": "Homocysten",
            "labName": ""
          },
          {
            "generalName": "PSA (Male)",
            "labName": ""
          }
        ],
        "mrp": 3500,
        "b2b": 1400
      },
      {
        "id": "goodness-c",
        "packageName": "Goodness C",
        "tests": [
          {
            "generalName": "SGOT",
            "labName": "SGOT (AST)"
          },
          {
            "generalName": "LDH",
            "labName": "LDH"
          },
          {
            "generalName": "CPK-MB",
            "labName": "CPK-MB level"
          },
          {
            "generalName": "Trop-I",
            "labName": ""
          }
        ],
        "mrp": 2200,
        "b2b": 1200
      },
      {
        "id": "goodness-f",
        "packageName": "Goodness F",
        "tests": [
          {
            "generalName": "CBC",
            "labName": "CBC"
          },
          {
            "generalName": "HbA1C",
            "labName": "Glyco Hemoglobin (HbA1c)"
          },
          {
            "generalName": "LFT",
            "labName": "Liver Function Test"
          },
          {
            "generalName": "RFT",
            "labName": "LIFECHECK-AS RENAL FUNCTION TEST"
          },
          {
            "generalName": "Lipid Profile",
            "labName": "Lipid Profile"
          }
        ],
        "mrp": 2000,
        "b2b": 600
      },
      {
        "id": "goodness-3h",
        "packageName": "Goodness 3H",
        "tests": [
          {
            "generalName": "HIV",
            "labName": "HIV I & II"
          },
          {
            "generalName": "HCV",
            "labName": "HCV MANUAL"
          },
          {
            "generalName": "HBsAg",
            "labName": ""
          }
        ],
        "mrp": 1500,
        "b2b": 650
      },
      {
        "id": "fever-profile",
        "packageName": "Fever Profile",
        "tests": [
          {
            "generalName": "CBC",
            "labName": "CBC"
          },
          {
            "generalName": "ESR",
            "labName": "ESR"
          },
          {
            "generalName": "SGOT",
            "labName": "SGOT (AST)"
          },
          {
            "generalName": "SGPT",
            "labName": "SGPT (ALT)"
          },
          {
            "generalName": "CRP",
            "labName": "C- Reactive Protein"
          },
          {
            "generalName": "Dengue NS1",
            "labName": ""
          },
          {
            "generalName": "Maleria Antigen",
            "labName": ""
          },
          {
            "generalName": "Urine Routine",
            "labName": ""
          },
          {
            "generalName": "Widal",
            "labName": ""
          }
        ],
        "mrp": 3000,
        "b2b": 950
      },
      {
        "id": "anc-profile",
        "packageName": "ANC Profile",
        "tests": [
          {
            "generalName": "CBC",
            "labName": "CBC"
          },
          {
            "generalName": "Blood Group",
            "labName": "Blood Group & RH"
          },
          {
            "generalName": "FBS",
            "labName": "Glucose - Fasting"
          },
          {
            "generalName": "TSH",
            "labName": "TSH"
          },
          {
            "generalName": "Triple H",
            "labName": "Goodness 3H"
          },
          {
            "generalName": "VDRL",
            "labName": ""
          },
          {
            "generalName": "Hb Electrophoresis",
            "labName": ""
          },
          {
            "generalName": "Urine Routine",
            "labName": ""
          }
        ],
        "mrp": 2100,
        "b2b": 1890
      }
    ]
  },
  "2": {
    "name": "Dr. Jariwala Laboratory",
    "tests": [],
    "packages": []
  },
  "3": {
    "name": "General Diagnostics",
    "tests": [],
    "packages": []
  },
  "4": {
    "name": "Trucheck Diagnostics",
    "tests": [],
    "packages": []
  }
}

// Phlebotomist suggestions
const PHLEBOTOMIST_SUGGESTIONS = [
"Soni",
"Sumit",
"Anish",
"Ajay Sir",
"Prerana",
"Sanjivani",
"Kunal",
"Ashok Sir",
"Purabiya",
"Sindhu Sister",
"Kavita",
"Dr. Hemalatta Patel",
"Yash",
"Amar",
"Yogita Sister",
"Eva",
"Yogesh",
"Kaushal",
"Ajay Shah Phlebotomist",
"Jariwala Phlebotomist",
"Unknown",
"NA"
];

// Doctor suggestions
const DOCTOR_SUGGESTIONS = [
"Self",
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
"Dr. Anushka Khot",
"Dr. Aparna Arlekar",
"Dr. Hemalatta Patel",
"Dr. Nitul Parikh",
"Dr. Aniruddha Gokhale",
"Dr. Umesh Khanna",
"Dr. V V Kelkar",
"Dr. Sachin Kamat",
"Dr. Pradeep Gadge",
"Dr. Dakshata Padhye",
"Dr. Vijay Sharnagat",
"Dr. Anand Ambesange",
"Dr. R B Kandha",
"Dr. Kashyap Thakar",
"Dr. V V Prabhu",
"Dr. Rajesh Ghagare",
"Dr. Nazeen Menon",
"Dr. A C Chaube",
"Dr. Shailendra Telang",
"Dr. A L Seth",
"Dr. Yogini Gada",
"Dr. Ajay Yadav"
];

// Care of Person suggestions
const CARE_OF_PERSON_SUGGESTIONS = [
"Soni",
"Sumit",
"Prerana",
"Purabiya",
"Anish",
"Ashok Sir",
"Kunal",
"Eva",
"Sanjivani",
"Vaishali Dhumal",
"Kalpana Sister",
"Sindhu Sister",
"Yogita Sister",
"Sandeep Bijam",
"Viru Gupta",
"Kashish",
"Dr. Shruti Gogate",
"Dr. Snehal Sawant",
"Dr. Satish Sawant",
"Dr. Sushama Dubal",
"Dr. Reshma Bhivgude",
"Dr. Jagat Shah",
"Dr. Pravin Arlekar",
"Dr. Avinash Diwate",
"Dr. Sejal.p Jain",
"Dr. Maxim D'mello",
"Dr. Anushka Khot",
"Dr. Aparna Arlekar",
"Dr. Hemalatta Patel",
"Dr. Nitul Parikh",
"Dr. Aniruddha Gokhale",
"Dr. Umesh Khanna",
"Dr. V V Kelkar",
"Dr. Sachin Kamat",
"Dr. Pradeep Gadge",
"Dr. Dakshata Padhye",
"Dr. Vijay Sharnagat",
"Dr. Anand Ambesange",
"Dr. R B Kandha",
"Dr. Kashyap Thakar",
"Dr. V V Prabhu",
"Dr. Rajesh Ghagare",
"Dr. Nazeen Menon",
"Dr. A C Chaube",
"Dr. Shailendra Telang",
"Dr. A L Seth",
"Dr. Yogini Gada",
"Dr. Ajay Yadav",
"None"
];


// ============================================================
//  LAB CONFIGURATION
// ============================================================
const LAB_COLORS = {
  1: {
    bg: "#f3e8ff",
    border: "#c084fc",
    text: "#4c1d95",
    light: "#e9d5ff",
    gradient: "rgba(192, 132, 252, 0.25)",
    name: "Dr. Ajay Shah Laboratory",
    tabBg: "#f3e8ff",
    tabBorder: "#c084fc",
    tabText: "#4c1d95"
  },
  2: {
    bg: "#eff6ff",
    border: "#60a5fa",
    text: "#1e3a8a",
    light: "#dbeafe",
    gradient: "rgba(96, 165, 250, 0.25)",
    name: "Dr. Jariwala Laboratory",
    tabBg: "#eff6ff",
    tabBorder: "#60a5fa",
    tabText: "#1e3a8a"
  },
  3: {
    bg: "#f0fdf4",
    border: "#4ade80",
    text: "#166534",
    light: "#dcfce7",
    gradient: "rgba(74, 222, 128, 0.25)",
    name: "General Diagnostics",
    tabBg: "#f0fdf4",
    tabBorder: "#4ade80",
    tabText: "#166534"
  },
  4: {
    bg: "#fdf2f2",
    border: "#f87171",
    text: "#991b1b",
    light: "#fee2e2",
    gradient: "rgba(248, 113, 113, 0.25)",
    name: "Trucheck Diagnostics",
    tabBg: "#fdf2f2",
    tabBorder: "#f87171",
    tabText: "#991b1b"
  }
};
