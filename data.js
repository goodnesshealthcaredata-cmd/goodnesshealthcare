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
        "labName": "HBs antigen",
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
        "labName": "High Sensitivity Troponin I",
        "mrp": 1200,
        "b2b": 500
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
        "labName": "Rapid Plasma Reagin (VDRL)",
        "mrp": 370,
        "b2b": 222
      },
      {
        "id": "urine-culture",
        "generalName": "Urine Culture",
        "labName": "Culture,Aerobic, Urine",
        "mrp": 950,
        "b2b": 400
      },
      {
        "id": "urine-routine",
        "generalName": "Urine Routine",
        "labName": "Urine Examination",
        "mrp": 160,
        "b2b": 60
      },
      {
        "id": "ra-factor",
        "generalName": "RA Factor",
        "labName": "Rheumatoid Factor",
        "mrp": 500,
        "b2b": 300
      },
      {
        "id": "mp",
        "generalName": "MP",
        "labName": "Malarial parasite ( smear )",
        "mrp": 120,
        "b2b": 72
      },
      {
        "id": "widal",
        "generalName": "Widal",
        "labName": "WIDAL by tube method",
        "mrp": 250,
        "b2b": 150
      },
      {
        "id": "dengue-ns1",
        "generalName": "Dengue NS1",
        "labName": "Dengue Antigen (NS1)- Rapid",
        "mrp": 800,
        "b2b": 350
      },
      {
        "id": "dengue-igg",
        "generalName": "Dengue IgG",
        "labName": "Dengue antibody IgG-Rapid",
        "mrp": 800,
        "b2b": 550
      },
      {
        "id": "dengue-igm",
        "generalName": "Dengue IgM",
        "labName": "Dengue antibody IgM-FIA",
        "mrp": 800,
        "b2b": 350
      },
      {
        "id": "mp-antigen",
        "generalName": "MP-Antigen",
        "labName": "Rapid Malarial Antigen ( Card )",
        "mrp": 450,
        "b2b": 315
      },
      {
        "id": "beta-hcg",
        "generalName": "Beta HCG",
        "labName": "Beta HCG level",
        "mrp": 850,
        "b2b": 200
      },
      {
        "id": "homocysten",
        "generalName": "Homocysteine",
        "labName": "Homocysteine level",
        "mrp": 1450,
        "b2b": 500
      },
      {
        "id": "ca125-female",
        "generalName": "CA125 (Female)",
        "labName": "CA-125 level",
        "mrp": 1200,
        "b2b": 500
      },
      {
        "id": "psa-male",
        "generalName": "PSA (Male)",
        "labName": "Prostate Specific Antigen level",
        "mrp": 900,
        "b2b": 350
      },
      {
        "id": "ige",
        "generalName": "IgE Level",
        "labName": "IgE level",
        "mrp": 950,
        "b2b": 400
      },
      {
        "id": "anti-ccp",
        "generalName": "Anti CCP",
        "labName": "Anti CCP Level",
        "mrp": 1550,
        "b2b": 650
      },
      {
        "id": "ana",
        "generalName": "ANA",
        "labName": "Anti Nuclear Antibody ( IIF )",
        "mrp": 950,
        "b2b": 500
      },
      {
        "id": "total-protien",
        "generalName": "Protein With A/G Ratio",
        "labName": "Protein With A/G Ratio",
        "mrp": 250,
        "b2b": 80
      },
      {
        "id": "fnac",
        "generalName": "FNAC",
        "labName": "FNAC procedure",
        "mrp": 1500,
        "b2b": 1050
      },
      {
        "id": "cea",
        "generalName": "CEA",
        "labName": "Carcino Embryonic Antigen level(CEA)",
        "mrp": 800,
        "b2b": 400
      },
      {
        "id": "afpl",
        "generalName": "AFP Level",
        "labName": "Alpha Feto Protein level",
        "mrp": 900,
        "b2b": 450
      },
      {
        "id": "hb-electrophoresis",
        "generalName": "Hb Electrophoresis",
        "labName": "HB Electrophoresis (HPLC)",
        "mrp": 950,
        "b2b": 450
      },
      {
        "id": "urine-protein-creatinine-ratio",
        "generalName": "Urinary Protein Creatinine Ratio",
        "labName": "Urinary Protein Creatinine Ratio",
        "mrp": 420,
        "b2b": 240
      },
      {
        "id": "lipase",
        "generalName": "Lipase",
        "labName": "Lipase",
        "mrp": 750,
        "b2b": 300
      },
      {
        "id": "estradiol",
        "generalName": "Estradiol Level",
        "labName": "Estradiol level",
        "mrp": 780,
        "b2b": 300
      },
      {
        "id": "pus-culture-aerobic",
        "generalName": "PUS Culture (Aerobic)",
        "labName": "Culture,Aerobic, PUS",
        "mrp": 950,
        "b2b": 400
      },
      {
        "id": "fecal-calprotectin",
        "generalName": "Stool Calprotectin",
        "labName": "Fecal Calprotectin Level",
        "mrp": 2800,
        "b2b": 2240
      },
      {
        "id": "blood-culture-1-se",
        "generalName": "Blood Culture 1 Set",
        "labName": "Blood Culture 1 set",
        "mrp": 1500,
        "b2b": 800
      },
      {
        "id": "nt-pro-bnp",
        "generalName": "NT-Pro BNP",
        "labName": "NT- pro B - Type Natriuretic Peptide level (NT-PRO-BNP)",
        "mrp": 2500,
        "b2b": 1100
      },
      {
        "id": "mantoux-test",
        "generalName": "Mantoux Test",
        "labName": "Mantoux Test",
        "mrp": 150,
        "b2b": 135
      },
      {
        "id": "reticulate-count",
        "generalName": "Reticulocyte Count",
        "labName": "Reticulocyte Count ( Automated )",
        "mrp": 400,
        "b2b": 240
      },
      {
        "id": "direct-coombs-test",
        "generalName": "Coombs Test Direct",
        "labName": "Coombs Test Direct (By Gel Technology)",
        "mrp": 550,
        "b2b": 150
      },
      {
        "id": "microalbuminuria",
        "generalName": "Microalbumin",
        "labName": "Microalbumin Level from urine",
        "mrp": 620,
        "b2b": 250
      },
      {
        "id": "total-testosterone",
        "generalName": "Testosterone Level",
        "labName": "Testosterone level",
        "mrp": 780,
        "b2b": 350
      },
      {
        "id": "protein-c",
        "generalName": "Protein C",
        "labName": "Protein C Activity (Chromogenic)",
        "mrp": 4500,
        "b2b": 4050
      },
      {
        "id": "protein-s",
        "generalName": "Protein S",
        "labName": "Free Protein S Antigen",
        "mrp": 4500,
        "b2b": 4050
      },
      {
        "id": "lupus-anticoagulant",
        "generalName": "Lupus Anticoagulant",
        "labName": "LUPUS ANTICOAGULANT (AS PER ISTH-2009)",
        "mrp": 1800,
        "b2b": 800
      },
      {
        "id": "fibrinogen-level",
        "generalName": "Fibrinogen Level",
        "labName": "Fibrinogen Level ( Clauss Method )",
        "mrp": 850,
        "b2b": 400
      },
      {
        "id": "anti-dsdna-ncx",
        "generalName": "ANTI ds DNA NcX",
        "labName": "ANTI ds DNA NcX",
        "mrp": 1750,
        "b2b": 1000
      },
      {
        "id": "apolipoprotein-a-1-b",
        "generalName": "Apolipoprotein A1 & B",
        "labName": "Apolipoprotein A-1+B",
        "mrp": 1100,
        "b2b": 770
      },
      {
        "id": "folic-acid-level",
        "generalName": "Folic Acid Level",
        "labName": "Folic Acid level",
        "mrp": 1100,
        "b2b": 500
      },
      {
        "id": "allergy-comprehensive",
        "generalName": "Allergy Comprehensive (ELISA)",
        "labName": "Allergy Comprehensive-ELISA",
        "mrp": 5500,
        "b2b": 3850
      },
      {
        "id": "maleria-antigen",
        "generalName": "Malaria Antigen",
        "labName": "Malaria ( PF/PV) antigen test",
        "mrp": 450,
        "b2b": 315
      },
      {
        "id": "fasting-urine-glucose",
        "generalName": "Urine Glucose (Fasting)",
        "labName": "Urine Glucose (Fasting)",
        "mrp": 50,
        "b2b": 30
      },
      {
        "id": "factor-v",
        "generalName": "Factor V",
        "labName": "FACTOR V (Leiden) G1691A by Real-time PCR",
        "mrp": 5500,
        "b2b": 4400
      },
      {
        "id": "ferritin",
        "generalName": "Ferritin",
        "labName": "Ferritin",
        "mrp": 950,
        "b2b": 400
      },
      {
        "id": "hav",
        "generalName": "HAV IgM",
        "labName": "HAV antibody IgM",
        "mrp": 1200,
        "b2b": 550
      },
      {
        "id": "hev",
        "generalName": "HEV IgM",
        "labName": "HEV IGM",
        "mrp": 1500,
        "b2b": 1050
      },
      {
        "id": "egfr",
        "generalName": "eGFR",
        "labName": "Estimated Glomerular Filtration Rate (eGFR) with Creatinine",
        "mrp": 300,
        "b2b": 50
      },
      {
        "id": "allergy-drug-test",
        "generalName": "Allergy Drug Test",
        "labName": "Allergy Drug-ELISA",
        "mrp": 7500,
        "b2b": 5250
      },
      {
        "id": "iga-ttg",
        "generalName": "IgA tTG",
        "labName": "IgA level",
        "mrp": 800,
        "b2b": 500
      },
      {
        "id": "peripheral-smear",
        "generalName": "Peripheral Smear",
        "labName": "Peripheral Smear",
        "mrp": 150,
        "b2b": 90
      },
      {
        "id": "cortisol-8-am",
        "generalName": "Cortisol 8 AM",
        "labName": "Cortisol 8 AM",
        "mrp": 850,
        "b2b": 350
      },
      {
        "id": "h-pylori-stool",
        "generalName": "H. Pylori Stool",
        "labName": "H.Pylori Antigen Detection from stool",
        "mrp": 1250,
        "b2b": 1000
      },
      {
        "id": "chikungunya-igg",
        "generalName": "Chikungunya IgG",
        "labName": "Chikungunya IgG-Rapid",
        "mrp": 900,
        "b2b": 810
      },
      {
        "id": "protein-electrophoresis",
        "generalName": "Protein Electrophoresis",
        "labName": "Protein Electrophoresis (Capillary)",
        "mrp": 1200,
        "b2b": 500
      },
      {
        "id": "dheas",
        "generalName": "DHEA-S",
        "labName": "DHEA-S",
        "mrp": 1150,
        "b2b": 600
      },
      {
        "id": "dhea",
        "generalName": "DHEA",
        "labName": "Dehydroepiandrosterone (DHEA)",
        "mrp": 3000,
        "b2b": 2100
      },
      {
        "id": "torch-complex",
        "generalName": "Torch Complex",
        "labName": "Torch Complex (10 Parameters)",
        "mrp": 2800,
        "b2b": 1200
      },
      {
        "id": "zinc-level",
        "generalName": "Zinc Level",
        "labName": "Zinc Level",
        "mrp": 2200,
        "b2b": 1980
      },
      {
        "id": "magnesium",
        "generalName": "Magnesium Level",
        "labName": "Magnesium Level",
        "mrp": 400,
        "b2b": 280
      },
      {
        "id": "c-peptide-random",
        "generalName": "C-Peptide Random",
        "labName": "C-Peptide Random level - AS",
        "mrp": 1150,
        "b2b": 550
      },
      {
        "id": "b2-glycoprotein-1-igg",
        "generalName": "B2 Glycoprotein 1 IgG",
        "labName": "Beta 2 Glycoprotein 1 antibody IgG",
        "mrp": 1200,
        "b2b": 500
      },
      {
        "id": "karyotyping-husband",
        "generalName": "Karyotyping",
        "labName": "Karyotyping From Blood",
        "mrp": 4000,
        "b2b": 2800
      },
      {
        "id": "lh",
        "generalName": "LH",
        "labName": "Leutinizing Hormone level",
        "mrp": 550,
        "b2b": 180
      },
      {
        "id": "fsh",
        "generalName": "FSH",
        "labName": "Follicle Stimulating Hormone level",
        "mrp": 550,
        "b2b": 180
      },
      {
        "id": "*****-analysis",
        "generalName": "***** Analysis",
        "labName": "***** Analysis",
        "mrp": 1150,
        "b2b": 805
      },
      {
        "id": "alkaline-phosphatase",
        "generalName": "Alkaline Phosphatase",
        "labName": "Alkaline Phosphatase level",
        "mrp": 190,
        "b2b": 114
      },
      {
        "id": "bun-creatinine-ratio",
        "generalName": "BUN / Creatinine Ratio",
        "labName": "BUN/Creatinine Ratio",
        "mrp": 270,
        "b2b": 162
      },
      {
        "id": "stool-routine",
        "generalName": "Stool Routine",
        "labName": "Stool Examination",
        "mrp": 170,
        "b2b": 102
      },
      {
        "id": "bicarbonate",
        "generalName": "Bicarbonate",
        "labName": "Bicarbonate",
        "mrp": 600,
        "b2b": 360
      },
      {
        "id": "amylase",
        "generalName": "Amylase",
        "labName": "Amylase-Serum",
        "mrp": 700,
        "b2b": 275
      },
      {
        "id": "acth",
        "generalName": "ACTH Level",
        "labName": "ACTH Level [Adrenocorticotropic hormone]",
        "mrp": 1800,
        "b2b": 1620
      },
      {
        "id": "aso-titer",
        "generalName": "ASO Titer",
        "labName": "Antistreptolysin - O (ASO)",
        "mrp": 650,
        "b2b": 390
      },
      {
        "id": "amh",
        "generalName": "AMH",
        "labName": "Anti Mullerian Hormone -(AMH)",
        "mrp": 2000,
        "b2b": 1000
      },
      {
        "id": "pth",
        "generalName": "PTH",
        "labName": "Para Thyroid Hormone Intact level",
        "mrp": 1600,
        "b2b": 1120
      },
      {
        "id": "bt-ct",
        "generalName": "BT CT",
        "labName": "BT CT",
        "mrp": 250,
        "b2b": 175
      },
      {
        "id": "hpv-dna",
        "generalName": "HPV DNA",
        "labName": "Human Papilloma Virus (HPV16 and 18) DNA by Real Time PCR",
        "mrp": 2800,
        "b2b": 2520
      },
      {
        "id": "anti-tpo-antibody",
        "generalName": "Anti-TPO Antibody",
        "labName": "Thyroperoxidase Antibody (Anti-TPO)/Microsomal antibody",
        "mrp": 1100,
        "b2b": 600
      },
      {
        "id": "apolipoprotein-a-1",
        "generalName": "Apolipoprotein A1",
        "labName": "Apolipoprotein A - 1",
        "mrp": 550,
        "b2b": 385
      },
      {
        "id": "apolipoprotein-b",
        "generalName": "Apolipoprotein B",
        "labName": "Apolipoprotein B",
        "mrp": 550,
        "b2b": 385
      },
      {
        "id": "prolactin",
        "generalName": "Prolactin",
        "labName": "Prolactin level",
        "mrp": 600,
        "b2b": 200
      },
      {
        "id": "progesterone",
        "generalName": "Progesterone",
        "labName": "Progesterone level",
        "mrp": 800,
        "b2b": 300
      },
      {
        "id": "lipoprotein",
        "generalName": "Lipoprotein",
        "labName": "Lipoprotein (a)",
        "mrp": 1200,
        "b2b": 840
      },
      {
        "id": "typhidot-igm",
        "generalName": "Typhidot IgM",
        "labName": "S.Typhi antibody IgM",
        "mrp": 600,
        "b2b": 480
      },
      {
        "id": "osmolarity-serum",
        "generalName": "Osmolality Serum",
        "labName": "Osmolality Serum",
        "mrp": 1500,
        "b2b": 1350
      },
      {
        "id": "osmolarity-urine",
        "generalName": "Osmolality Urine",
        "labName": "Osmolality Urine",
        "mrp": 1500,
        "b2b": 1350
      },
      {
        "id": "dual-marker",
        "generalName": "Double Marker",
        "labName": "Double Marker",
        "mrp": 2500,
        "b2b": 2250
      },
      {
        "id": "extra-test",
        "generalName": "New Tests",
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
      },
      {
        "id": "extra-collection",
        "generalName": "Extra Collection",
        "labName": "",
        "mrp": "",
        "b2b": ""
      },
      {
        "id": "coombs-test-indirect",
        "generalName": "Coombs Test Indirect",
        "labName": "Coombs Test Indirect (By Gel Technology)",
        "mrp": 600,
        "b2b": 250
      },
      {
        "id": "urine-glucose-post-prandial",
        "generalName": "Urine Glucose (Post Prandial)",
        "labName": "Urine Glucose (Post Prandial)",
        "mrp": 50,
        "b2b": 30
      },
      {
        "id": "urine-glucose-random",
        "generalName": "Urine Glucose (Random)",
        "labName": "Urine Glucose (Random)",
        "mrp": 50,
        "b2b": 30
      },
      {
        "id": "chikungunya-igm",
        "generalName": "Chikungunya IgM",
        "labName": "Chikungunya IgM-Rapid",
        "mrp": 900,
        "b2b": 810
      },
      {
        "id": "complement-3-level",
        "generalName": "Complement 3 Level",
        "labName": "Complement 3 Level",
        "mrp": 850,
        "b2b": 450
      },
      {
        "id": "complement-4-level",
        "generalName": "Complement 4 Level",
        "labName": "Complement 4 Level",
        "mrp": 850,
        "b2b": 450
      },
      {
        "id": "b2-glycoprotein-igm",
        "generalName": "B2 Glycoprotein 1 IgM",
        "labName": "Beta 2 Glycoprotein 1 antibody IgM",
        "mrp": 1200,
        "b2b": 500
      },
      {
        "id": "phadiatop-adult",
        "generalName": "Phadiatop (Adult)",
        "labName": "Allergy-Phadiatop, Adult",
        "mrp": 2000,
        "b2b": 1800
      },
      {
        "id": "phadiatop-infant",
        "generalName": "Phadiatop (Infant)",
        "labName": "Allergy-Phadiatop, Inf",
        "mrp": 1350,
        "b2b": 1080
      },
      {
        "id": "add-tests-later",
        "generalName": "Add Tests Later",
        "labName": "",
        "mrp": "",
        "b2b": ""
      },
      {
        "id": "throat-swab",
        "generalName": "Throat Swab",
        "labName": "Culture,Aerobic",
        "mrp": 950,
        "b2b": 400
      },
      {
        "id": "bile-acid",
        "generalName": "Bile Acid",
        "labName": "Bile Acid",
        "mrp": 2000,
        "b2b": 1800
      },
      {
        "id": "blood-gas-arterial",
        "generalName": "Blood Gas (Arterial)",
        "labName": "Blood Gas (Arterial)",
        "mrp": 950,
        "b2b": 665
      },
      {
        "id": "blood-gas-venous",
        "generalName": "Blood Gas (Venous)",
        "labName": "Blood Gas (Venous)",
        "mrp": 1000,
        "b2b": 700
      },
      {
        "id": "ttg-a",
        "generalName": "TTG-A",
        "labName": "Tissue Transglutaminase antibody IgA",
        "mrp": 1400,
        "b2b": 980
      },
      {
        "id": "lepto-rt-pcr",
        "generalName": "Lepto RT-PCR",
        "labName": "Leptospira Qualitative by Real-time PCR short name",
        "mrp": 2200,
        "b2b": 1500
      },
      {
        "id": "homa-ir",
        "generalName": "Homa IR",
        "labName": "Homa IR (Mass Unit)",
        "mrp": 1200,
        "b2b": 1080
      },
      {
        "id": "asvisit200",
        "generalName": "ASVISIT200",
        "labName": "ASVISIT200",
        "mrp": 200,
        "b2b": 200
      },
      {
        "id": "immature-platelet-fraction",
        "generalName": "Immature Platelet Fraction",
        "labName": "Immature Platelet Fraction",
        "mrp": 350,
        "b2b": 245
      },
      {
        "id": "total-wbc-count",
        "generalName": "TOTAL WBC COUNT",
        "labName": "TOTAL WBC COUNT",
        "mrp": 170,
        "b2b": 102
      },
      {
        "id": "liver-renal-function-test",
        "generalName": "Liver & Renal Function Test",
        "labName": "LIVER & RENAL FUNCTION TEST",
        "mrp": 1900,
        "b2b": 650
      },
      {
        "id": "dengue-ns1-fia",
        "generalName": "Dengue Ns1 Fia",
        "labName": "Dengue antigen NS1-FIA",
        "mrp": 800,
        "b2b": 350
      },
      {
        "id": "dengue-rapid-antibody",
        "generalName": "Dengue Rapid Antibody",
        "labName": "Dengue antibody-Rapid",
        "mrp": 800,
        "b2b": 550
      },
      {
        "id": "chikungunya-antibody-igm",
        "generalName": "Chikungunya Antibody IgM",
        "labName": "Chikungunya antibody IgM",
        "mrp": 950,
        "b2b": 665
      },
      {
        "id": "mycobacterium-tuberculosis-dna-pcr",
        "generalName": "Mycobacterium Tuberculosis DNA PCR",
        "labName": "Mycobacterium Tuberculosis DNA PCR (GeneXpert)",
        "mrp": 2450,
        "b2b": 2000
      },
      {
        "id": "advanced-cbc",
        "generalName": "Advanced CBC",
        "labName": "ADVANCED COMPLETE BLOOD COUNT",
        "mrp": 600,
        "b2b": 360
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
            "generalName": "Homocysteine",
            "labName": "Homocysteine level"
          },
          {
            "generalName": "CA125 (Female)",
            "labName": "CA-125 level"
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
            "generalName": "Homocysteine",
            "labName": "Homocysteine level"
          },
          {
            "generalName": "PSA (Male)",
            "labName": "Prostate Specific Antigen level"
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
            "labName": "High Sensitivity Troponin I"
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
            "labName": "HBs antigen"
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
            "labName": "Dengue Antigen (NS1)- Rapid"
          },
          {
            "generalName": "Urine Routine",
            "labName": "Urine Examination"
          },
          {
            "generalName": "Widal",
            "labName": "WIDAL by tube method"
          },
          {
            "generalName": "Malaria Antigen",
            "labName": "Malaria ( PF/PV) antigen test"
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
            "labName": "Rapid Plasma Reagin (VDRL)"
          },
          {
            "generalName": "Hb Electrophoresis",
            "labName": "HB Electrophoresis (HPLC)"
          },
          {
            "generalName": "Urine Routine",
            "labName": "Urine Examination"
          }
        ],
        "mrp": 2100,
        "b2b": 1890
      },
      {
        "id": "active-men-health-check",
        "packageName": "Active Men Health Check",
        "tests": [
          {
            "generalName": "Vit D3",
            "labName": "25 OH Cholecalciferol (D2+D3)"
          },
          {
            "generalName": "CBC",
            "labName": "CBC"
          },
          {
            "generalName": "eGFR",
            "labName": "Estimated Glomerular Filtration Rate (eGFR) with Creatinine"
          },
          {
            "generalName": "Free TFT",
            "labName": "Free Thyroid Profile"
          },
          {
            "generalName": "HbA1C",
            "labName": "Glyco Hemoglobin (HbA1c)"
          },
          {
            "generalName": "Iron Study",
            "labName": "Iron Studies (TIBC)"
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
            "generalName": "PSA (Male)",
            "labName": "Prostate Specific Antigen level"
          },
          {
            "generalName": "Vit B12",
            "labName": "Vitamin B - 12 Level"
          },
          {
            "generalName": "RFT",
            "labName": "LIFECHECK-AS RENAL FUNCTION TEST"
          },
          {
            "generalName": "Homa IR",
            "labName": "Homa IR (Mass Unit)"
          }
        ],
        "mrp": 3300,
        "b2b": 2640
      },
      {
        "id": "active-women-health-check",
        "packageName": "Active Women Health Check",
        "tests": [
          {
            "generalName": "Vit D3",
            "labName": "25 OH Cholecalciferol (D2+D3)"
          },
          {
            "generalName": "CA125 (Female)",
            "labName": "CA-125 level"
          },
          {
            "generalName": "CBC",
            "labName": "CBC"
          },
          {
            "generalName": "eGFR",
            "labName": "Estimated Glomerular Filtration Rate (eGFR) with Creatinine"
          },
          {
            "generalName": "Free TFT",
            "labName": "Free Thyroid Profile"
          },
          {
            "generalName": "HbA1C",
            "labName": "Glyco Hemoglobin (HbA1c)"
          },
          {
            "generalName": "Homa IR",
            "labName": "Homa IR (Mass Unit)"
          },
          {
            "generalName": "Iron Study",
            "labName": "Iron Studies (TIBC)"
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
          },
          {
            "generalName": "Vit B12",
            "labName": "Vitamin B - 12 Level"
          }
        ],
        "mrp": 3500,
        "b2b": 2800
      }
    ]
  },
  "2": {
    "name": "Dr. Jariwala Laboratory",
    "tests": [
      {
        "id": "add-tests-later",
        "generalName": "Add Tests Later",
        "labName": "",
        "mrp": "",
        "b2b": ""
      },
      {
        "id": "new-tests",
        "generalName": "New Tests",
        "labName": "",
        "mrp": "",
        "b2b": ""
      },
      {
        "id": "extra-collection",
        "generalName": "Extra Collection",
        "labName": "",
        "mrp": "",
        "b2b": ""
      },
      {
        "id": "cbc",
        "generalName": "CBC",
        "labName": "COMPLETE BLOOD COUNT",
        "mrp": 280,
        "b2b": 168
      },
      {
        "id": "blood-group",
        "generalName": "Blood Group",
        "labName": "BLOOD GROUP",
        "mrp": 150,
        "b2b": 90
      },
      {
        "id": "esr",
        "generalName": "ESR",
        "labName": "ERYTHROCYTE SEDIMENTATION RATE",
        "mrp": 90,
        "b2b": 54
      },
      {
        "id": "fbs",
        "generalName": "FBS",
        "labName": "FASTING PLASMA GLUCOSE",
        "mrp": 70,
        "b2b": 46
      },
      {
        "id": "pp",
        "generalName": "PP",
        "labName": "POST LUNCH GLUCOSE",
        "mrp": 70,
        "b2b": 46
      },
      {
        "id": "rbs",
        "generalName": "RBS",
        "labName": "RANDOM GLUCOSE",
        "mrp": 70,
        "b2b": 46
      },
      {
        "id": "insulin-fasting",
        "generalName": "Insulin Fasting",
        "labName": "INSULIN FASTING",
        "mrp": 715,
        "b2b": 501
      },
      {
        "id": "insulin-pp",
        "generalName": "Insulin PP",
        "labName": "INSULIN PP",
        "mrp": 715,
        "b2b": 501
      },
      {
        "id": "insulin-random",
        "generalName": "Insulin Random",
        "labName": "INSULIN RANDOM",
        "mrp": 715,
        "b2b": 501
      },
      {
        "id": "hba1c",
        "generalName": "HbA1C",
        "labName": "HbA1c",
        "mrp": 520,
        "b2b": 338
      },
      {
        "id": "hbeag",
        "generalName": "HBeAg",
        "labName": "HBeAg",
        "mrp": 900,
        "b2b": 612
      },
      {
        "id": "bilirubin-total",
        "generalName": "Bilirubin Total",
        "labName": "BILIRUBIN",
        "mrp": 200,
        "b2b": 120
      },
      {
        "id": "sgpt",
        "generalName": "SGPT",
        "labName": "SGPT",
        "mrp": 180,
        "b2b": 108
      },
      {
        "id": "sgot",
        "generalName": "SGOT",
        "labName": "SGOT",
        "mrp": 180,
        "b2b": 108
      },
      {
        "id": "ggt",
        "generalName": "GGT",
        "labName": "GGTP",
        "mrp": 200,
        "b2b": 126
      },
      {
        "id": "creatinine",
        "generalName": "Creatinine",
        "labName": "CREATININE",
        "mrp": 180,
        "b2b": 108
      },
      {
        "id": "urea",
        "generalName": "Urea",
        "labName": "UREA",
        "mrp": 180,
        "b2b": 108
      },
      {
        "id": "uric-acid",
        "generalName": "Uric Acid",
        "labName": "URIC ACID",
        "mrp": 180,
        "b2b": 108
      },
      {
        "id": "calcium",
        "generalName": "Calcium",
        "labName": "CALCIUM",
        "mrp": 275,
        "b2b": 176
      },
      {
        "id": "lipid-profile",
        "generalName": "Lipid Profile",
        "labName": "LIPID PROFILE",
        "mrp": 550,
        "b2b": 352
      },
      {
        "id": "total-cholesterol",
        "generalName": "Total Cholesterol",
        "labName": "TOTAL CHOLESTEROL",
        "mrp": 180,
        "b2b": 108
      },
      {
        "id": "hdl-cholesterol",
        "generalName": "HDL Cholesterol",
        "labName": "HDL CHOLESTEROL",
        "mrp": 180,
        "b2b": 106
      },
      {
        "id": "ldl-cholesterol",
        "generalName": "LDL Cholesterol",
        "labName": "LDL CHOLESTEROL",
        "mrp": 320,
        "b2b": 224
      },
      {
        "id": "ldh",
        "generalName": "LDH",
        "labName": "LDH",
        "mrp": 350,
        "b2b": 263
      },
      {
        "id": "ldh-fluid",
        "generalName": "LDH Fluid",
        "labName": "LDH, FLUID",
        "mrp": 350,
        "b2b": 263
      },
      {
        "id": "iron-study",
        "generalName": "Iron Study",
        "labName": "IRON STUDY",
        "mrp": 520,
        "b2b": 333
      },
      {
        "id": "vit-d3",
        "generalName": "Vit D3",
        "labName": "VITAMIN D3",
        "mrp": 1500,
        "b2b": 450
      },
      {
        "id": "vit-b12",
        "generalName": "Vit B12",
        "labName": "VITAMIN B12",
        "mrp": 950,
        "b2b": 285
      },
      {
        "id": "t3",
        "generalName": "T3",
        "labName": "TOTAL T3",
        "mrp": 190,
        "b2b": 95
      },
      {
        "id": "t4",
        "generalName": "T4",
        "labName": "TOTAL T4",
        "mrp": 190,
        "b2b": 95
      },
      {
        "id": "tsh",
        "generalName": "TSH",
        "labName": "THYROID STIMULATING HORMONE",
        "mrp": 320,
        "b2b": 128
      },
      {
        "id": "ft3",
        "generalName": "FT3",
        "labName": "FREE T3",
        "mrp": 240,
        "b2b": 120
      },
      {
        "id": "ft4",
        "generalName": "FT4",
        "labName": "FREE T4",
        "mrp": 240,
        "b2b": 120
      },
      {
        "id": "crp",
        "generalName": "CRP",
        "labName": "C- REACTIVE PROTEIN (QUANTITATIVE)",
        "mrp": 500,
        "b2b": 225
      },
      {
        "id": "hscrp",
        "generalName": "HSCRP",
        "labName": "HIGH SENSITIVITY CRP",
        "mrp": 700,
        "b2b": 420
      },
      {
        "id": "cpk-mb",
        "generalName": "CPK-MB",
        "labName": "CK-MB",
        "mrp": 850,
        "b2b": 536
      },
      {
        "id": "cpk-total",
        "generalName": "CPK-Total",
        "labName": "CPK",
        "mrp": 380,
        "b2b": 236
      },
      {
        "id": "trop-i",
        "generalName": "Trop-I",
        "labName": "TROPONIN I",
        "mrp": 770,
        "b2b": 539
      },
      {
        "id": "trop-t",
        "generalName": "Trop-T",
        "labName": "TROPONIN T",
        "mrp": 770,
        "b2b": 539
      },
      {
        "id": "d-dimer",
        "generalName": "D-Dimer",
        "labName": "D - DIMER",
        "mrp": 1150,
        "b2b": 736
      },
      {
        "id": "pt-inr",
        "generalName": "PT INR",
        "labName": "PROTHROMBIN TIME",
        "mrp": 300,
        "b2b": 195
      },
      {
        "id": "aptt",
        "generalName": "ApTT",
        "labName": "ACTIVATED PARTIAL THROMBOPLASTIN TIME",
        "mrp": 400,
        "b2b": 240
      },
      {
        "id": "hiv",
        "generalName": "HIV",
        "labName": "HIV DUO (ECLIA/ELISA)",
        "mrp": 400,
        "b2b": 280
      },
      {
        "id": "hcv",
        "generalName": "HCV",
        "labName": "H.C.V ANTIBODY STUDY (ECLIA/ELISA)",
        "mrp": 750,
        "b2b": 600
      },
      {
        "id": "vdrl",
        "generalName": "VDRL",
        "labName": "V.D.R.L",
        "mrp": 165,
        "b2b": 106
      },
      {
        "id": "urine-culture",
        "generalName": "Urine Culture",
        "labName": "URINE CULTURE AND SENSITIVITY REPORT",
        "mrp": 800,
        "b2b": 560
      },
      {
        "id": "urine-routine",
        "generalName": "Urine Routine",
        "labName": "URINE ROUTINE",
        "mrp": 110,
        "b2b": 70
      },
      {
        "id": "ra-factor",
        "generalName": "RA Factor",
        "labName": "RHEUMATOID FACTOR",
        "mrp": 275,
        "b2b": 176
      },
      {
        "id": "mp",
        "generalName": "MP",
        "labName": "MALARIAL PARASITE",
        "mrp": 180,
        "b2b": 106
      },
      {
        "id": "widal",
        "generalName": "Widal",
        "labName": "WIDAL TEST",
        "mrp": 165,
        "b2b": 106
      },
      {
        "id": "dengue-ns1",
        "generalName": "Dengue NS1",
        "labName": "DENGUE NS 1 ANTIGEN TEST",
        "mrp": 880,
        "b2b": 563
      },
      {
        "id": "dengue-igg",
        "generalName": "Dengue IgG",
        "labName": "DENGUE IgG",
        "mrp": 880,
        "b2b": 563
      },
      {
        "id": "dengue-igm",
        "generalName": "Dengue IgM",
        "labName": "DENGUE IgM",
        "mrp": 880,
        "b2b": 563
      },
      {
        "id": "mp-antigen",
        "generalName": "MP-Antigen",
        "labName": "MALARIAL ANTIGEN STUDY",
        "mrp": 500,
        "b2b": 315
      },
      {
        "id": "beta-hcg",
        "generalName": "Beta HCG",
        "labName": "BETA HCG",
        "mrp": 500,
        "b2b": 355
      },
      {
        "id": "homocysteine",
        "generalName": "Homocysteine",
        "labName": "HOMOCYSTEINE",
        "mrp": 1200,
        "b2b": 744
      },
      {
        "id": "ca125-female",
        "generalName": "CA125 (Female)",
        "labName": "CA-125",
        "mrp": 1050,
        "b2b": 683
      },
      {
        "id": "psa-male",
        "generalName": "PSA (Male)",
        "labName": "TOTAL PROSTATE SPECIFIC ANTIGEN",
        "mrp": 700,
        "b2b": 497
      },
      {
        "id": "ige-level",
        "generalName": "IgE Level",
        "labName": "IGE",
        "mrp": 770,
        "b2b": 539
      },
      {
        "id": "anti-ccp",
        "generalName": "Anti CCP",
        "labName": "CCP-ANTIBODY TO CYCLIC CITRULLINATED PEPTIDE",
        "mrp": 1250,
        "b2b": 813
      },
      {
        "id": "ana",
        "generalName": "ANA",
        "labName": "ANTI-NUCLEAR ANTIBODY",
        "mrp": 950,
        "b2b": 599
      },
      {
        "id": "total-protein",
        "generalName": "Total Protein",
        "labName": "TOTAL PROTEIN",
        "mrp": 200,
        "b2b": 120
      },
      {
        "id": "covid-antibody",
        "generalName": "Covid Antibody",
        "labName": "COVID-19 ANTIBODIES(Nucleocapsid)",
        "mrp": 800,
        "b2b": 550
      },
      {
        "id": "fnac",
        "generalName": "FNAC",
        "labName": "CYTOLOGY",
        "mrp": 800,
        "b2b": 560
      },
      {
        "id": "cea",
        "generalName": "CEA",
        "labName": "CARCINO EMBRYONIC ANTIGEN",
        "mrp": 850,
        "b2b": 578
      },
      {
        "id": "afp-level",
        "generalName": "AFP Level",
        "labName": "ALPHA FETO PROTEIN",
        "mrp": 700,
        "b2b": 462
      },
      {
        "id": "lipase",
        "generalName": "Lipase",
        "labName": "LIPASE",
        "mrp": 700,
        "b2b": 490
      },
      {
        "id": "estradiol-level",
        "generalName": "Estradiol Level",
        "labName": "ESTRADIOL",
        "mrp": 600,
        "b2b": 414
      },
      {
        "id": "lft",
        "generalName": "LFT",
        "labName": "LIVER FUNCTION TEST-1 (Without INR)",
        "mrp": 900,
        "b2b": 585
      },
      {
        "id": "rft",
        "generalName": "RFT",
        "labName": "RENAL PROFILE",
        "mrp": 1350,
        "b2b": 878
      },
      {
        "id": "electrolytes",
        "generalName": "Electrolytes",
        "labName": "ELECTROLYTES",
        "mrp": 400,
        "b2b": 240
      },
      {
        "id": "total-tft",
        "generalName": "Total TFT",
        "labName": "TFT-1 (T3/T4/TSH)",
        "mrp": 580,
        "b2b": 232
      },
      {
        "id": "free-tft",
        "generalName": "Free TFT",
        "labName": "TFT-2 (FT3/FT4/TSH)",
        "mrp": 680,
        "b2b": 272
      },
      {
        "id": "pus-culture-aerobic",
        "generalName": "PUS Culture (Aerobic)",
        "labName": "PUS CULTURE AND SENSITIVITY REPORT",
        "mrp": 800,
        "b2b": 560
      },
      {
        "id": "stool-calprotectin",
        "generalName": "Stool Calprotectin",
        "labName": "CALPROTECTIN",
        "mrp": 3000,
        "b2b": 1920
      },
      {
        "id": "nt-pro-bnp",
        "generalName": "NT-Pro BNP",
        "labName": "NT-PROBNP, BLOOD",
        "mrp": 2035,
        "b2b": 1302
      },
      {
        "id": "cortisol-8-am",
        "generalName": "Cortisol 8 AM",
        "labName": "CORTISOL 8.OO AM",
        "mrp": 620,
        "b2b": 434
      },
      {
        "id": "mantoux-test",
        "generalName": "Mantoux Test",
        "labName": "MANTOUX TEST",
        "mrp": 120,
        "b2b": 71
      },
      {
        "id": "reticulocyte-count",
        "generalName": "Reticulocyte Count",
        "labName": "RETICULOCYTE COUNT",
        "mrp": 180,
        "b2b": 108
      },
      {
        "id": "coombs-test-direct",
        "generalName": "Coombs Test Direct",
        "labName": "DIRECT COOMBS TEST",
        "mrp": 300,
        "b2b": 177
      },
      {
        "id": "microalbumin",
        "generalName": "Microalbumin",
        "labName": "MICROALBUMINURIA",
        "mrp": 550,
        "b2b": 352
      },
      {
        "id": "testosterone-level",
        "generalName": "Testosterone Level",
        "labName": "TOTAL TESTOSTERONE",
        "mrp": 600,
        "b2b": 426
      }
    ],
    "packages": []
  },
  "3": {
    "name": "General Diagnostics",
    "tests": [
      {
        "id": "add-tests-later",
        "generalName": "Add Tests Later",
        "labName": "",
        "mrp": "",
        "b2b": ""
      },
      {
        "id": "new-tests",
        "generalName": "New Tests",
        "labName": "",
        "mrp": "",
        "b2b": ""
      },
      {
        "id": "extra-collection",
        "generalName": "Extra Collection",
        "labName": "",
        "mrp": "",
        "b2b": ""
      },
      {
        "id": "cbc",
        "generalName": "CBC",
        "labName": "CBC-Complete Hemogram Test(28)",
        "mrp": 300,
        "b2b": 60
      },
      {
        "id": "blood-group",
        "generalName": "Blood Group",
        "labName": "ABO Blood Group and Rh Type",
        "mrp": 220,
        "b2b": 50
      },
      {
        "id": "esr",
        "generalName": "ESR",
        "labName": "ESR (Erythrocyte Sedimentation Rate)",
        "mrp": 200,
        "b2b": 50
      },
      {
        "id": "fbs",
        "generalName": "FBS",
        "labName": "Sugar (Glucose) Fasting",
        "mrp": 70,
        "b2b": 15
      },
      {
        "id": "pp",
        "generalName": "PP",
        "labName": "Sugar (Glucose) Post Prandial",
        "mrp": 70,
        "b2b": 15
      },
      {
        "id": "rbs",
        "generalName": "RBS",
        "labName": "Sugar (Glucose) Random",
        "mrp": 70,
        "b2b": 15
      },
      {
        "id": "insulin-fasting",
        "generalName": "Insulin Fasting",
        "labName": "Insulin Fasting",
        "mrp": 770,
        "b2b": 150
      },
      {
        "id": "insulin-random",
        "generalName": "Insulin Random",
        "labName": "Insulin Random",
        "mrp": 770,
        "b2b": 150
      },
      {
        "id": "insulin-pp",
        "generalName": "Insulin PP",
        "labName": "Insulin PP",
        "mrp": 770,
        "b2b": 150
      },
      {
        "id": "hba1c",
        "generalName": "HbA1C",
        "labName": "Hba1c (Whole Blood)",
        "mrp": 495,
        "b2b": 60
      },
      {
        "id": "hba1c-with-graph",
        "generalName": "Hba1c with Graph",
        "labName": "Hba1c (Whole Blood) with Graph",
        "mrp": 525,
        "b2b": 90
      },
      {
        "id": "hbsag",
        "generalName": "HBsAg",
        "labName": "Hepatitis B Surface Antigen (HBsAg) (Quantitative)",
        "mrp": 495,
        "b2b": 110
      },
      {
        "id": "hbeag",
        "generalName": "HBeAg",
        "labName": "Hepatitis B Envelope Antigen (HBeAg)",
        "mrp": 825,
        "b2b": 265
      },
      {
        "id": "bilirubin-total",
        "generalName": "Bilirubin Total",
        "labName": "Bilirubin Total",
        "mrp": 130,
        "b2b": 22
      },
      {
        "id": "bilirubin-direct",
        "generalName": "Bilirubin Direct",
        "labName": "Bilirubin Direct",
        "mrp": 130,
        "b2b": 24
      },
      {
        "id": "sgpt",
        "generalName": "SGPT",
        "labName": "Alanine Transaminase (SGPT)",
        "mrp": 190,
        "b2b": 24
      },
      {
        "id": "sgot",
        "generalName": "SGOT",
        "labName": "Aspartate AminoTransferase (SGOT )",
        "mrp": 190,
        "b2b": 22
      },
      {
        "id": "ggt",
        "generalName": "GGT",
        "labName": "Gamma Glutamyl Transferase (GGT)",
        "mrp": 242,
        "b2b": 60
      },
      {
        "id": "creatinine",
        "generalName": "Creatinine",
        "labName": "Serum Creatinine",
        "mrp": 180,
        "b2b": 22
      },
      {
        "id": "urea",
        "generalName": "Urea",
        "labName": "Urea",
        "mrp": 165,
        "b2b": 35
      },
      {
        "id": "bun",
        "generalName": "BUN",
        "labName": "Blood Urea Nitrogen (BUN)",
        "mrp": 165,
        "b2b": 25
      },
      {
        "id": "uric-acid",
        "generalName": "Uric Acid",
        "labName": "Uric Acid",
        "mrp": 220,
        "b2b": 22
      },
      {
        "id": "calcium",
        "generalName": "Calcium",
        "labName": "Calcium",
        "mrp": 176,
        "b2b": 72
      },
      {
        "id": "lipid-profile",
        "generalName": "Lipid Profile",
        "labName": "Lipid Profile",
        "mrp": 715,
        "b2b": 100
      },
      {
        "id": "lipid-profile-mb",
        "generalName": "Lipid Profile MB",
        "labName": "Lipid Profile MB",
        "mrp": 650,
        "b2b": 215
      },
      {
        "id": "total-cholesterol",
        "generalName": "Total Cholesterol",
        "labName": "Total Cholesterol",
        "mrp": 180,
        "b2b": 10
      },
      {
        "id": "hdl-cholesterol",
        "generalName": "HDL Cholesterol",
        "labName": "HDL Cholesterol",
        "mrp": 180,
        "b2b": 10
      },
      {
        "id": "ldl-cholesterol",
        "generalName": "LDL Cholesterol",
        "labName": "LDL Cholesterol - Direct",
        "mrp": 300,
        "b2b": 50
      },
      {
        "id": "ldh",
        "generalName": "LDH",
        "labName": "Lactate Dehydrogenase (LDH Serum)",
        "mrp": 363,
        "b2b": 60
      },
      {
        "id": "ldh-pleural-fluid",
        "generalName": "LDH Pleural Fluid",
        "labName": "Lactate Dehydrogenase (LDH Pleural Fluid)",
        "mrp": 490,
        "b2b": 350
      },
      {
        "id": "ldh-ascitic-fluid",
        "generalName": "LDH Ascitic Fluid",
        "labName": "Lactate Dehydrogenase (LDH Ascitic Fluid)",
        "mrp": 600,
        "b2b": 480
      },
      {
        "id": "sodium",
        "generalName": "Sodium",
        "labName": "Sodium",
        "mrp": 275,
        "b2b": 40
      },
      {
        "id": "chloride",
        "generalName": "Chloride",
        "labName": "Chloride",
        "mrp": 275,
        "b2b": 40
      },
      {
        "id": "phosphorus",
        "generalName": "Phosphorus",
        "labName": "Phosphorus",
        "mrp": 200,
        "b2b": 22
      },
      {
        "id": "potassium",
        "generalName": "Potassium",
        "labName": "Potassium",
        "mrp": 220,
        "b2b": 40
      },
      {
        "id": "iron-study",
        "generalName": "Iron Study",
        "labName": "Iron Studies (Iron,TIBC, Transferrin saturation)",
        "mrp": 660,
        "b2b": 150
      },
      {
        "id": "iron-studies-for-anemia-screening",
        "generalName": "Iron Studies (for Anemia Screening)",
        "labName": "Iron Studies (for Anemia Screening)",
        "mrp": 660,
        "b2b": 215
      },
      {
        "id": "vit-d3",
        "generalName": "25 OH Vitamin D",
        "labName": "Vitamin D3",
        "mrp": 1280,
        "b2b": 200
      },
      {
        "id": "vit-b12",
        "generalName": "Vit B12",
        "labName": "Vitamin B12",
        "mrp": 990,
        "b2b": 160
      },
      {
        "id": "t3",
        "generalName": "T3",
        "labName": "Total Triiodothyronine (T3)",
        "mrp": 198,
        "b2b": 20
      },
      {
        "id": "t4",
        "generalName": "T4",
        "labName": "Total Thyroxine (T4)",
        "mrp": 198,
        "b2b": 20
      },
      {
        "id": "tsh",
        "generalName": "TSH",
        "labName": "TSH (Thyroid Stimulating Hormone)",
        "mrp": 275,
        "b2b": 20
      },
      {
        "id": "ft3",
        "generalName": "FT3",
        "labName": "Free Triiodothyronine (FT3)",
        "mrp": 275,
        "b2b": 60
      },
      {
        "id": "ft4",
        "generalName": "FT4",
        "labName": "Free Thyroxine (FT4)",
        "mrp": 300,
        "b2b": 60
      },
      {
        "id": "crp",
        "generalName": "CRP",
        "labName": "C - Reactive Protein (CRP)",
        "mrp": 495,
        "b2b": 150
      },
      {
        "id": "hscrp",
        "generalName": "HSCRP",
        "labName": "High Sensitivity C-Reactive Protein (hs- CRP)",
        "mrp": 750,
        "b2b": 175
      },
      {
        "id": "cpk-mb",
        "generalName": "CPK-MB",
        "labName": "Creatine Phospho Kinase-MB (CK-MB)",
        "mrp": 715,
        "b2b": 200
      },
      {
        "id": "cpk-total",
        "generalName": "CPK-Total",
        "labName": "Creatinine Phospho Kinase (CPK) - Total",
        "mrp": 385,
        "b2b": 125
      },
      {
        "id": "trop-i",
        "generalName": "Trop-I",
        "labName": "Troponine I",
        "mrp": 1200,
        "b2b": 650
      },
      {
        "id": "trop-t",
        "generalName": "Trop-T",
        "labName": "Troponine T",
        "mrp": 1800,
        "b2b": 700
      },
      {
        "id": "d-dimer",
        "generalName": "D-Dimer",
        "labName": "D-DIMER",
        "mrp": 1650,
        "b2b": 375
      },
      {
        "id": "pt-inr",
        "generalName": "PT INR",
        "labName": "PT INR(PROTHROMBIN TIME)",
        "mrp": 450,
        "b2b": 105
      },
      {
        "id": "aptt",
        "generalName": "ApTT",
        "labName": "APTT",
        "mrp": 418,
        "b2b": 200
      },
      {
        "id": "hiv",
        "generalName": "HIV",
        "labName": "HIV - I & II",
        "mrp": 300,
        "b2b": 115
      },
      {
        "id": "hcv",
        "generalName": "HCV",
        "labName": "Anti Hepatitis C Virus (HCV) - Total",
        "mrp": 935,
        "b2b": 125
      },
      {
        "id": "vdrl",
        "generalName": "VDRL",
        "labName": "VDRL (RPR)",
        "mrp": 220,
        "b2b": 75
      },
      {
        "id": "urine-culture",
        "generalName": "Urine Culture",
        "labName": "Urine C/S",
        "mrp": 950,
        "b2b": 120
      },
      {
        "id": "urine-routine",
        "generalName": "Urine Routine",
        "labName": "Urine Complete",
        "mrp": 300,
        "b2b": 100
      },
      {
        "id": "ra-factor",
        "generalName": "RA Factor",
        "labName": "Rheumatoid Factor (RF)",
        "mrp": 495,
        "b2b": 200
      },
      {
        "id": "mp",
        "generalName": "MP",
        "labName": "Smear for MP (Malarial Parasite)",
        "mrp": 275,
        "b2b": 100
      },
      {
        "id": "widal",
        "generalName": "Widal",
        "labName": "Widal Tube Test (24Hrs)",
        "mrp": 330,
        "b2b": 60
      },
      {
        "id": "widal-4hrs",
        "generalName": "Widal (4Hrs)",
        "labName": "Widal Slide Test (4Hrs)",
        "mrp": 330,
        "b2b": 100
      },
      {
        "id": "dengue-ns1",
        "generalName": "Dengue NS1",
        "labName": "Dengue NS-1 Antigen (ELISA)",
        "mrp": 660,
        "b2b": 250
      },
      {
        "id": "dengue-ns1-rapid",
        "generalName": "Dengue NS1 (Rapid)",
        "labName": "Dengue NS-1 Antigen (Rapid)",
        "mrp": 300,
        "b2b": 150
      },
      {
        "id": "dengue-igg",
        "generalName": "Dengue IgG",
        "labName": "Dengue IgG (Rapid)",
        "mrp": 300,
        "b2b": 150
      },
      {
        "id": "dengue-igm",
        "generalName": "Dengue IgM",
        "labName": "Dengue IgM (Rapid)",
        "mrp": 300,
        "b2b": 150
      },
      {
        "id": "mp-antigen",
        "generalName": "MP-Antigen",
        "labName": "Malarial Antigen Detection",
        "mrp": 700,
        "b2b": 100
      },
      {
        "id": "beta-hcg",
        "generalName": "Beta HCG",
        "labName": "Beta HCG",
        "mrp": 550,
        "b2b": 160
      },
      {
        "id": "free-beta-hcg",
        "generalName": "Free Beta HCG",
        "labName": "Free Beta HCG",
        "mrp": 1100,
        "b2b": 160
      },
      {
        "id": "homocysteine",
        "generalName": "Homocysteine",
        "labName": "Homocysteine",
        "mrp": 1155,
        "b2b": 400
      },
      {
        "id": "ca125-female",
        "generalName": "CA125 (Female)",
        "labName": "CA125",
        "mrp": 1155,
        "b2b": 350
      },
      {
        "id": "psa-male",
        "generalName": "PSA (Male)",
        "labName": "Free PSA",
        "mrp": 935,
        "b2b": 300
      },
      {
        "id": "ige-level",
        "generalName": "IgE Level",
        "labName": "Total IGE",
        "mrp": 825,
        "b2b": 195
      },
      {
        "id": "anti-ccp",
        "generalName": "Anti CCP",
        "labName": "ANTI CCP (ACCP)",
        "mrp": 1375,
        "b2b": 385
      },
      {
        "id": "ana",
        "generalName": "ANA",
        "labName": "Anti Nuclear Antibodies (ANA)",
        "mrp": 750,
        "b2b": 175
      },
      {
        "id": "total-protein",
        "generalName": "Total Protein",
        "labName": "Total Protein",
        "mrp": 200,
        "b2b": 22
      },
      {
        "id": "fnac",
        "generalName": "FNAC",
        "labName": "FNAC",
        "mrp": 1150,
        "b2b": 330
      },
      {
        "id": "covid-antibody",
        "generalName": "Covid Antibody",
        "labName": "Covid 19 Antibodies - Total",
        "mrp": 700,
        "b2b": 270
      },
      {
        "id": "cea",
        "generalName": "CEA",
        "labName": "Carcino Embryonic Antigen (CEA)",
        "mrp": 715,
        "b2b": 250
      },
      {
        "id": "afp-level",
        "generalName": "AFP Level",
        "labName": "Alpha Feto Protein (AFP)",
        "mrp": 750,
        "b2b": 295
      },
      {
        "id": "lipase",
        "generalName": "Lipase",
        "labName": "Lipase",
        "mrp": 620,
        "b2b": 120
      },
      {
        "id": "estradiol-level",
        "generalName": "Estradiol Level",
        "labName": "Estradiol",
        "mrp": 605,
        "b2b": 165
      },
      {
        "id": "pus-culture-aerobic",
        "generalName": "PUS Culture (Aerobic)",
        "labName": "Culture & Identification - Anaerobic bacteria, Pus",
        "mrp": 1455,
        "b2b": 945
      },
      {
        "id": "stool-calprotectin",
        "generalName": "Stool Calprotectin",
        "labName": "Calprotectin",
        "mrp": 3630,
        "b2b": 2340
      },
      {
        "id": "blood-culture-1-set",
        "generalName": "Blood Culture 1 Set",
        "labName": "Blood C/S - BacT/Alert (with bottle)",
        "mrp": 1045,
        "b2b": 530
      },
      {
        "id": "nt-pro-bnp",
        "generalName": "NT-Pro BNP",
        "labName": "NT-Pro BNP",
        "mrp": 3450,
        "b2b": 2500
      },
      {
        "id": "reticulocyte-count",
        "generalName": "Reticulocyte Count",
        "labName": "Reticulocyte Count",
        "mrp": 550,
        "b2b": 20
      },
      {
        "id": "coombs-test-direct",
        "generalName": "Coombs Test Direct",
        "labName": "Direct Coombs Test",
        "mrp": 825,
        "b2b": 160
      },
      {
        "id": "coombs-test-indirect",
        "generalName": "Coombs Test Indirect",
        "labName": "Indirect Coombs Test",
        "mrp": 825,
        "b2b": 160
      },
      {
        "id": "microalbumin",
        "generalName": "Microalbumin",
        "labName": "Microalbumin",
        "mrp": 575,
        "b2b": 160
      },
      {
        "id": "testosterone-level",
        "generalName": "Testosterone Level",
        "labName": "Testosterone",
        "mrp": 605,
        "b2b": 100
      },
      {
        "id": "free-testosterone",
        "generalName": "Free Testosterone",
        "labName": "Free Testosterone",
        "mrp": 1485,
        "b2b": 340
      },
      {
        "id": "protein-c",
        "generalName": "Protein C",
        "labName": "Protein C Activity",
        "mrp": 5350,
        "b2b": 2600
      },
      {
        "id": "protein-s",
        "generalName": "Protein S",
        "labName": "Protein S Activity",
        "mrp": 4950,
        "b2b": 2600
      },
      {
        "id": "lupus-anticoagulant",
        "generalName": "Lupus Anticoagulant",
        "labName": "Lupus Anticoagulants",
        "mrp": 2650,
        "b2b": 600
      },
      {
        "id": "fibrinogen-level",
        "generalName": "Fibrinogen Level",
        "labName": "Fibrinogen",
        "mrp": 1250,
        "b2b": 900
      },
      {
        "id": "anti-ds-dna-ncx",
        "generalName": "ANTI ds DNA NcX",
        "labName": "Anti Ds-DNA",
        "mrp": 1650,
        "b2b": 200
      },
      {
        "id": "apo-b-apo-a1-ratio",
        "generalName": "Apo B: Apo A1 ratio",
        "labName": "Apo B: Apo A1 ratio",
        "mrp": 990,
        "b2b": 360
      },
      {
        "id": "folic-acid-level",
        "generalName": "Folic Acid Level",
        "labName": "Folic acid",
        "mrp": 1045,
        "b2b": 160
      },
      {
        "id": "urine-sugar-fasting",
        "generalName": "Urine Glucose (Fasting)",
        "labName": "Urine Sugar (Fasting)",
        "mrp": 70,
        "b2b": 25
      },
      {
        "id": "factor-v",
        "generalName": "Factor V",
        "labName": "Factor V - Sodium Citrate",
        "mrp": 5830,
        "b2b": 4200
      },
      {
        "id": "ferritin",
        "generalName": "Ferritin",
        "labName": "Ferritin",
        "mrp": 800,
        "b2b": 160
      },
      {
        "id": "hav-igm",
        "generalName": "HAV IgM",
        "labName": "Anti Hepatitis A Virus (ANTI HAV) - IgM",
        "mrp": 880,
        "b2b": 395
      },
      {
        "id": "hev-igm",
        "generalName": "HEV IgM",
        "labName": "Anti Hepatitis E Virus (HEV) - IgM",
        "mrp": 1210,
        "b2b": 220
      },
      {
        "id": "egfr",
        "generalName": "eGFR",
        "labName": "eGFR (estimated Glomerular Filtration Rate)",
        "mrp": 200,
        "b2b": 90
      },
      {
        "id": "hav-igg",
        "generalName": "HAV IgG",
        "labName": "Anti Hepatitis A Virus (ANTI HAV) - IgG",
        "mrp": 880,
        "b2b": 275
      },
      {
        "id": "hev-igg",
        "generalName": "HEV IgG",
        "labName": "Anti Hepatitis E Virus (HEV) - IgG",
        "mrp": 1210,
        "b2b": 375
      },
      {
        "id": "iga-ttg",
        "generalName": "IgA tTG",
        "labName": "Tissue Transglutaminase IgA (TTG)",
        "mrp": 1210,
        "b2b": 280
      },
      {
        "id": "peripheral-smear",
        "generalName": "Peripheral Smear",
        "labName": "Peripheral blood smear (PBS)",
        "mrp": 300,
        "b2b": 100
      },
      {
        "id": "cortisol-8-am",
        "generalName": "Cortisol 8 AM",
        "labName": "Cortisol (8:00 AM)",
        "mrp": 605,
        "b2b": 295
      },
      {
        "id": "h-pylori-stool",
        "generalName": "H. Pylori Stool",
        "labName": "Helicobacter Pylori Antigen detection by - Stool",
        "mrp": 1500,
        "b2b": 1200
      },
      {
        "id": "chikungunya-igg",
        "generalName": "Chikungunya IgG",
        "labName": "Chikungunya IgG Rapid antibody",
        "mrp": 825,
        "b2b": 500
      },
      {
        "id": "protein-electrophoresis",
        "generalName": "Protein Electrophoresis",
        "labName": "Protein Electrophoresis",
        "mrp": 660,
        "b2b": 350
      },
      {
        "id": "dhea-s",
        "generalName": "DHEA-S",
        "labName": "DHEA-Sulphate (DHEAS)",
        "mrp": 1045,
        "b2b": 275
      },
      {
        "id": "dhea",
        "generalName": "DHEA",
        "labName": "DHEA - Dehydroepiandrostenedione",
        "mrp": 2965,
        "b2b": 2150
      },
      {
        "id": "zinc-level",
        "generalName": "Zinc Level",
        "labName": "ZINC (SERUM)",
        "mrp": 880,
        "b2b": 295
      },
      {
        "id": "magnesium-level",
        "generalName": "Magnesium Level",
        "labName": "Magnesium",
        "mrp": 440,
        "b2b": 50
      },
      {
        "id": "c-peptide-fasting",
        "generalName": "C-Peptide Fasting",
        "labName": "C-Peptide Fasting",
        "mrp": 1100,
        "b2b": 300
      },
      {
        "id": "b2-glycoprotein-1-igg",
        "generalName": "B2 Glycoprotein 1 IgG",
        "labName": "Beta 2 Glycoprotein 1 - IgG",
        "mrp": 1100,
        "b2b": 660
      },
      {
        "id": "karyotyping-husband",
        "generalName": "Karyotyping (Husband)",
        "labName": "Karyotyping - Blood (Husband)",
        "mrp": 4400,
        "b2b": 1500
      },
      {
        "id": "karyotyping-wife",
        "generalName": "Karyotyping (Wife)",
        "labName": "Karyotyping - Blood (Wife)",
        "mrp": 4400,
        "b2b": 1500
      },
      {
        "id": "karyotyping-child",
        "generalName": "Karyotyping (Child)",
        "labName": "Karyotyping - Blood (Child)",
        "mrp": 5000,
        "b2b": 1500
      },
      {
        "id": "lh",
        "generalName": "LH",
        "labName": "Luteinizing Hormone (LH)",
        "mrp": 495,
        "b2b": 100
      },
      {
        "id": "fsh",
        "generalName": "FSH",
        "labName": "Follicle Stimulating Hormone (FSH)",
        "mrp": 495,
        "b2b": 100
      },
      {
        "id": "alkaline-phosphatase",
        "generalName": "Alkaline Phosphatase",
        "labName": "Alkaline Phosphatase",
        "mrp": 210,
        "b2b": 22
      },
      {
        "id": "globulin",
        "generalName": "Globulin",
        "labName": "Globulin",
        "mrp": 320,
        "b2b": 50
      },
      {
        "id": "bun-creatinine-ratio",
        "generalName": "BUN / Creatinine Ratio",
        "labName": "BUN/Creatinine ratio",
        "mrp": 220,
        "b2b": 60
      },
      {
        "id": "stool-routine",
        "generalName": "Stool Routine",
        "labName": "Stool Routine",
        "mrp": 220,
        "b2b": 60
      },
      {
        "id": "bicarbonate",
        "generalName": "Bicarbonate",
        "labName": "Bicarbonate",
        "mrp": 440,
        "b2b": 250
      },
      {
        "id": "albumin",
        "generalName": "Albumin",
        "labName": "Albumin",
        "mrp": 165,
        "b2b": 24
      },
      {
        "id": "amylase",
        "generalName": "Amylase",
        "labName": "Amylase",
        "mrp": 450,
        "b2b": 135
      },
      {
        "id": "acth-level",
        "generalName": "ACTH Level",
        "labName": "ACTH (Adreno Corticotropic Hormone)",
        "mrp": 1950,
        "b2b": 550
      },
      {
        "id": "albert-stain-throat-swab",
        "generalName": "Albert Stain Throat Swab",
        "labName": "Albert stain Throat swab",
        "mrp": 650,
        "b2b": 380
      },
      {
        "id": "amh",
        "generalName": "AMH",
        "labName": "Anti Mullerian Hormone (AMH)",
        "mrp": 2145,
        "b2b": 600
      },
      {
        "id": "pth",
        "generalName": "PTH",
        "labName": "PTH -Intact (Parathyroid Hormone)",
        "mrp": 1450,
        "b2b": 375
      },
      {
        "id": "hpv-dna",
        "generalName": "HPV DNA",
        "labName": "HPV DNA Detection by RT PCR",
        "mrp": 2500,
        "b2b": 1500
      },
      {
        "id": "anti-tpo-antibody",
        "generalName": "Anti-TPO Antibody",
        "labName": "Anti TPO",
        "mrp": 1150,
        "b2b": 600
      },
      {
        "id": "apolipoprotein-a1",
        "generalName": "Apolipoprotein A1",
        "labName": "Apolipoprotein - A1",
        "mrp": 495,
        "b2b": 180
      },
      {
        "id": "apolipoprotein-b",
        "generalName": "Apolipoprotein B",
        "labName": "Apolipoprotein - B",
        "mrp": 495,
        "b2b": 180
      },
      {
        "id": "phadiatop",
        "generalName": "Phadiatop",
        "labName": "Phadiatop",
        "mrp": 1450,
        "b2b": 1150
      },
      {
        "id": "prolactin",
        "generalName": "Prolactin",
        "labName": "Prolactin",
        "mrp": 605,
        "b2b": 100
      },
      {
        "id": "progesterone",
        "generalName": "Progesterone",
        "labName": "Progesterone",
        "mrp": 605,
        "b2b": 160
      },
      {
        "id": "lipoprotein",
        "generalName": "Lipoprotein",
        "labName": "Lipoprotein (A) [Lp(a)]",
        "mrp": 1045,
        "b2b": 225
      },
      {
        "id": "typhidot-igm",
        "generalName": "Typhidot IgM",
        "labName": "Typhi Dot IgM",
        "mrp": 605,
        "b2b": 200
      },
      {
        "id": "typhidot-igg",
        "generalName": "Typhidot IgG",
        "labName": "Typhi Dot IgG",
        "mrp": 605,
        "b2b": 200
      },
      {
        "id": "typhidot-igg-igm",
        "generalName": "Typhidot IgG & IgM",
        "labName": "Typhi Dot IgG & IgM",
        "mrp": 880,
        "b2b": 400
      },
      {
        "id": "osmolality-urine",
        "generalName": "Osmolality Urine",
        "labName": "Urine Osmolality",
        "mrp": 990,
        "b2b": 350
      },
      {
        "id": "double-marker",
        "generalName": "Double Marker",
        "labName": "Double Marker - First Trimester",
        "mrp": 2200,
        "b2b": 500
      },
      {
        "id": "lft",
        "generalName": "LFT",
        "labName": "LFT (Liver Function Test)",
        "mrp": 1045,
        "b2b": 150
      },
      {
        "id": "rft",
        "generalName": "RFT",
        "labName": "Kidney Profile - RFT (Maxi)",
        "mrp": 1150,
        "b2b": 863
      },
      {
        "id": "electrolytes",
        "generalName": "Electrolytes",
        "labName": "Serum Electrolyte Profile",
        "mrp": 520,
        "b2b": 100
      },
      {
        "id": "total-tft",
        "generalName": "Total TFT",
        "labName": "Thyroid Profile - Total T3,Total T4,TSH (TFT)",
        "mrp": 495,
        "b2b": 60
      },
      {
        "id": "free-tft",
        "generalName": "Free TFT",
        "labName": "Free TFT (Free T3,Free T4,TSH)",
        "mrp": 1045,
        "b2b": 140
      },
      {
        "id": "urine-glucose-post-prandial",
        "generalName": "Urine Glucose (Post Prandial)",
        "labName": "Urine Sugar (PP)",
        "mrp": 70,
        "b2b": 25
      },
      {
        "id": "urine-sugar-random",
        "generalName": "Urine Sugar(Random)",
        "labName": "Urine Sugar Random",
        "mrp": 70,
        "b2b": 25
      },
      {
        "id": "chikungunya-igm",
        "generalName": "Chikungunya IgM",
        "labName": "Chikungunya IgM Rapid antibody",
        "mrp": 825,
        "b2b": 290
      },
      {
        "id": "complement-3-level",
        "generalName": "Complement 3 Level",
        "labName": "Complement 3 (C3)",
        "mrp": 660,
        "b2b": 240
      },
      {
        "id": "complement-4-level",
        "generalName": "Complement 4 Level",
        "labName": "Complement 4 (C4)",
        "mrp": 660,
        "b2b": 240
      },
      {
        "id": "b2-glycoprotein-1-igm",
        "generalName": "B2 Glycoprotein 1 IgM",
        "labName": "Beta 2 Glycoprotein 1 - IgM",
        "mrp": 1100,
        "b2b": 660
      },
      {
        "id": "specific-cardiac-profile",
        "generalName": "Specific Cardiac Profile",
        "labName": "Specific Cardiac Profile (6 Parameters)",
        "mrp": 1500,
        "b2b": 1000
      },
      {
        "id": "psa-total",
        "generalName": "PSA Total",
        "labName": "Prostate Specific Antigen (PSA)-Total",
        "mrp": 770,
        "b2b": 100
      },
      {
        "id": "bile-acid",
        "generalName": "Bile Acid",
        "labName": "Bile Acids",
        "mrp": 2390,
        "b2b": 600
      },
      {
        "id": "kft",
        "generalName": "KFT",
        "labName": "Kidney Function Test",
        "mrp": 320,
        "b2b": 120
      },
      {
        "id": "urinary-electrolytes-spot",
        "generalName": "Urinary Electrolytes Spot",
        "labName": "Urinary Electrolytes Spot",
        "mrp": 1150,
        "b2b": 140
      },
      {
        "id": "diabetes-monitoring-profile",
        "generalName": "Diabetes Monitoring Profile",
        "labName": "Diabetes Monitoring Profile",
        "mrp": "",
        "b2b": ""
      },
      {
        "id": "arthritis-screen-profile",
        "generalName": "Arthritis Screen Profile",
        "labName": "Arthritis Screen Profile (4 Marker)",
        "mrp": 1081,
        "b2b": 266
      },
      {
        "id": "gd-wellness-cardiac-risk-marker",
        "generalName": "GD Wellness Cardiac Risk Marker",
        "labName": "GD Wellness Cardiac Risk Marker (5 Parameters)",
        "mrp": 1800,
        "b2b": 1000
      }
    ],
    "packages": [
      {
        "id": "gd-life-a1",
        "packageName": "GD Life A1",
        "tests": [
          {
            "generalName": "Total TFT",
            "labName": "Thyroid Profile - Total T3,Total T4,TSH (TFT)"
          },
          {
            "generalName": "Iron Study",
            "labName": "Iron Studies (Iron,TIBC, Transferrin saturation)"
          },
          {
            "generalName": "RFT",
            "labName": "Kidney Profile - RFT (Maxi)"
          },
          {
            "generalName": "HbA1C",
            "labName": "Hba1c (Whole Blood)"
          },
          {
            "generalName": "CBC",
            "labName": "CBC-Complete Hemogram Test(28)"
          },
          {
            "generalName": "LFT",
            "labName": "LFT (Liver Function Test)"
          },
          {
            "generalName": "Lipid Profile",
            "labName": "Lipid Profile"
          }
        ],
        "mrp": 1400,
        "b2b": 295
      },
      {
        "id": "gd-life-a3",
        "packageName": "GD Life A3",
        "tests": [
          {
            "generalName": "FBS",
            "labName": "Sugar (Glucose) Fasting"
          },
          {
            "generalName": "LFT",
            "labName": "LFT (Liver Function Test)"
          },
          {
            "generalName": "Lipid Profile",
            "labName": "Lipid Profile"
          },
          {
            "generalName": "TSH",
            "labName": "TSH (Thyroid Stimulating Hormone)"
          },
          {
            "generalName": "CBC",
            "labName": "CBC-Complete Hemogram Test(28)"
          },
          {
            "generalName": "RFT",
            "labName": "Kidney Profile - RFT (Maxi)"
          }
        ],
        "mrp": 1200,
        "b2b": 230
      },
      {
        "id": "gd-wellness-1-3",
        "packageName": "GD Wellness 1.3",
        "tests": [
          {
            "generalName": "Testosterone Level",
            "labName": "Testosterone"
          },
          {
            "generalName": "Iron Study",
            "labName": "Iron Studies (Iron,TIBC, Transferrin saturation)"
          },
          {
            "generalName": "LFT",
            "labName": "LFT (Liver Function Test)"
          },
          {
            "generalName": "Lipid Profile",
            "labName": "Lipid Profile"
          },
          {
            "generalName": "Total TFT",
            "labName": "Thyroid Profile - Total T3,Total T4,TSH (TFT)"
          },
          {
            "generalName": "HbA1C",
            "labName": "Hba1c (Whole Blood)"
          },
          {
            "generalName": "RFT",
            "labName": "Kidney Profile - RFT (Maxi)"
          },
          {
            "generalName": "CBC",
            "labName": "CBC-Complete Hemogram Test(28)"
          },
          {
            "generalName": "Vit B12",
            "labName": "Vitamin B12"
          },
          {
            "generalName": "25 OH Vitamin D",
            "labName": "Vitamin D3"
          }
        ],
        "mrp": 1800,
        "b2b": 600
      },
      {
        "id": "alpha-wellness-1-3",
        "packageName": "Alpha Wellness 1.3",
        "tests": [
          {
            "generalName": "Testosterone Level",
            "labName": "Testosterone"
          },
          {
            "generalName": "Iron Study",
            "labName": "Iron Studies (Iron,TIBC, Transferrin saturation)"
          },
          {
            "generalName": "LFT",
            "labName": "LFT (Liver Function Test)"
          },
          {
            "generalName": "Lipid Profile",
            "labName": "Lipid Profile"
          },
          {
            "generalName": "Total TFT",
            "labName": "Thyroid Profile - Total T3,Total T4,TSH (TFT)"
          },
          {
            "generalName": "HbA1C",
            "labName": "Hba1c (Whole Blood)"
          },
          {
            "generalName": "RFT",
            "labName": "Kidney Profile - RFT (Maxi)"
          },
          {
            "generalName": "Vit B12",
            "labName": "Vitamin B12"
          },
          {
            "generalName": "CBC",
            "labName": "CBC-Complete Hemogram Test(28)"
          },
          {
            "generalName": "ESR",
            "labName": "ESR (Erythrocyte Sedimentation Rate)"
          },
          {
            "generalName": "CRP",
            "labName": "C - Reactive Protein (CRP)"
          },
          {
            "generalName": "25 OH Vitamin D",
            "labName": "Vitamin D3"
          }
        ],
        "mrp": 2150,
        "b2b": 750
      },
      {
        "id": "gd-health-heaven",
        "packageName": "GD Health Heaven",
        "tests": [
          {
            "generalName": "CBC",
            "labName": "CBC-Complete Hemogram Test(28)"
          },
          {
            "generalName": "HbA1C",
            "labName": "Hba1c (Whole Blood)"
          },
          {
            "generalName": "Iron Study",
            "labName": "Iron Studies (Iron,TIBC, Transferrin saturation)"
          },
          {
            "generalName": "Total TFT",
            "labName": "Thyroid Profile - Total T3,Total T4,TSH (TFT)"
          },
          {
            "generalName": "LFT",
            "labName": "LFT (Liver Function Test)"
          },
          {
            "generalName": "RFT",
            "labName": "Kidney Profile - RFT (Maxi)"
          },
          {
            "generalName": "Vit B12",
            "labName": "Vitamin B12"
          },
          {
            "generalName": "FBS",
            "labName": "Sugar (Glucose) Fasting"
          },
          {
            "generalName": "Lipid Profile",
            "labName": "Lipid Profile"
          },
          {
            "generalName": "Urine Routine",
            "labName": "Urine Complete"
          },
          {
            "generalName": "25 OH Vitamin D",
            "labName": "Vitamin D3"
          }
        ],
        "mrp": 2499,
        "b2b": 650
      },
      {
        "id": "summer-health-package-april-24",
        "packageName": "Summer Health Package - April 24",
        "tests": [
          {
            "generalName": "Iron Study",
            "labName": "Iron Studies (Iron,TIBC, Transferrin saturation)"
          },
          {
            "generalName": "Total TFT",
            "labName": "Thyroid Profile - Total T3,Total T4,TSH (TFT)"
          },
          {
            "generalName": "LFT",
            "labName": "LFT (Liver Function Test)"
          },
          {
            "generalName": "HbA1C",
            "labName": "Hba1c (Whole Blood)"
          },
          {
            "generalName": "RFT",
            "labName": "Kidney Profile - RFT (Maxi)"
          },
          {
            "generalName": "Lipid Profile",
            "labName": "Lipid Profile"
          },
          {
            "generalName": "Vit B12",
            "labName": "Vitamin B12"
          },
          {
            "generalName": "Electrolytes",
            "labName": "Serum Electrolyte Profile"
          },
          {
            "generalName": "CBC",
            "labName": "CBC-Complete Hemogram Test(28)"
          },
          {
            "generalName": "Urine Routine",
            "labName": "Urine Complete"
          },
          {
            "generalName": "25 OH Vitamin D",
            "labName": "Vitamin D3"
          }
        ],
        "mrp": 2000,
        "b2b": 700
      },
      {
        "id": "gd-advance-men-package",
        "packageName": "GD Advance Men Package",
        "tests": [
          {
            "generalName": "Urine Routine",
            "labName": "Urine Complete"
          },
          {
            "generalName": "Specific Cardiac Profile",
            "labName": "Specific Cardiac Profile (6 Parameters)"
          },
          {
            "generalName": "CBC",
            "labName": "CBC-Complete Hemogram Test(28)"
          },
          {
            "generalName": "Iron Study",
            "labName": "Iron Studies (Iron,TIBC, Transferrin saturation)"
          },
          {
            "generalName": "LFT",
            "labName": "LFT (Liver Function Test)"
          },
          {
            "generalName": "RFT",
            "labName": "Kidney Profile - RFT (Maxi)"
          },
          {
            "generalName": "Lipid Profile",
            "labName": "Lipid Profile"
          },
          {
            "generalName": "25 OH Vitamin D",
            "labName": "Vitamin D3"
          },
          {
            "generalName": "HbA1C",
            "labName": "Hba1c (Whole Blood)"
          },
          {
            "generalName": "Total TFT",
            "labName": "Thyroid Profile - Total T3,Total T4,TSH (TFT)"
          },
          {
            "generalName": "Lipase",
            "labName": "Lipase"
          },
          {
            "generalName": "Electrolytes",
            "labName": "Serum Electrolyte Profile"
          },
          {
            "generalName": "Amylase",
            "labName": "Amylase"
          },
          {
            "generalName": "Vit B12",
            "labName": "Vitamin B12"
          },
          {
            "generalName": "PSA Total",
            "labName": "Prostate Specific Antigen (PSA)-Total"
          }
        ],
        "mrp": 2200,
        "b2b": 900
      },
      {
        "id": "life-health-a8-women-advance",
        "packageName": "Life Health A8 Women Advance",
        "tests": [
          {
            "generalName": "Specific Cardiac Profile",
            "labName": "Specific Cardiac Profile (6 Parameters)"
          },
          {
            "generalName": "CBC",
            "labName": "CBC-Complete Hemogram Test(28)"
          },
          {
            "generalName": "Iron Study",
            "labName": "Iron Studies (Iron,TIBC, Transferrin saturation)"
          },
          {
            "generalName": "LFT",
            "labName": "LFT (Liver Function Test)"
          },
          {
            "generalName": "RFT",
            "labName": "Kidney Profile - RFT (Maxi)"
          },
          {
            "generalName": "Lipid Profile",
            "labName": "Lipid Profile"
          },
          {
            "generalName": "HbA1C",
            "labName": "Hba1c (Whole Blood)"
          },
          {
            "generalName": "Total TFT",
            "labName": "Thyroid Profile - Total T3,Total T4,TSH (TFT)"
          },
          {
            "generalName": "FSH",
            "labName": "Follicle Stimulating Hormone (FSH)"
          },
          {
            "generalName": "LH",
            "labName": "Luteinizing Hormone (LH)"
          },
          {
            "generalName": "Prolactin",
            "labName": "Prolactin"
          },
          {
            "generalName": "Estradiol Level",
            "labName": "Estradiol"
          },
          {
            "generalName": "25 OH Vitamin D",
            "labName": "Vitamin D3"
          },
          {
            "generalName": "Folic Acid Level",
            "labName": "Folic acid"
          },
          {
            "generalName": "Vit B12",
            "labName": "Vitamin B12"
          }
        ],
        "mrp": 2800,
        "b2b": 950
      },
      {
        "id": "comprehensive-full-body-checkup",
        "packageName": "Comprehensive Full Body Checkup",
        "tests": [
          {
            "generalName": "CBC",
            "labName": "CBC-Complete Hemogram Test(28)"
          },
          {
            "generalName": "25 OH Vitamin D",
            "labName": "Vitamin D3"
          },
          {
            "generalName": "HBsAg",
            "labName": "Hepatitis B Surface Antigen (HBsAg) (Quantitative)"
          },
          {
            "generalName": "Vit B12",
            "labName": "Vitamin B12"
          },
          {
            "generalName": "Urine Routine",
            "labName": "Urine Complete"
          },
          {
            "generalName": "Peripheral Smear",
            "labName": "Peripheral blood smear (PBS)"
          },
          {
            "generalName": "ESR",
            "labName": "ESR (Erythrocyte Sedimentation Rate)"
          },
          {
            "generalName": "Electrolytes",
            "labName": "Serum Electrolyte Profile"
          },
          {
            "generalName": "Iron Study",
            "labName": "Iron Studies (Iron,TIBC, Transferrin saturation)"
          },
          {
            "generalName": "LFT",
            "labName": "LFT (Liver Function Test)"
          },
          {
            "generalName": "Lipid Profile",
            "labName": "Lipid Profile"
          },
          {
            "generalName": "Total TFT",
            "labName": "Thyroid Profile - Total T3,Total T4,TSH (TFT)"
          },
          {
            "generalName": "CRP",
            "labName": "C - Reactive Protein (CRP)"
          },
          {
            "generalName": "Urinary Electrolytes Spot",
            "labName": "Urinary Electrolytes Spot"
          },
          {
            "generalName": "KFT",
            "labName": "Kidney Function Test"
          },
          {
            "generalName": "Diabetes Monitoring Profile",
            "labName": "Diabetes Monitoring Profile"
          },
          {
            "generalName": "Arthritis Screen Profile",
            "labName": "Arthritis Screen Profile (4 Marker)"
          }
        ],
        "mrp": 2000,
        "b2b": 1050
      },
      {
        "id": "gd-life-a6",
        "packageName": "GD LIFE - A6",
        "tests": [
          {
            "generalName": "Homocysteine",
            "labName": "Homocysteine"
          },
          {
            "generalName": "Iron Study",
            "labName": "Iron Studies (Iron,TIBC, Transferrin saturation)"
          },
          {
            "generalName": "LFT",
            "labName": "LFT (Liver Function Test)"
          },
          {
            "generalName": "Lipid Profile",
            "labName": "Lipid Profile"
          },
          {
            "generalName": "Total TFT",
            "labName": "Thyroid Profile - Total T3,Total T4,TSH (TFT)"
          },
          {
            "generalName": "HbA1C",
            "labName": "Hba1c (Whole Blood)"
          },
          {
            "generalName": "RFT",
            "labName": "Kidney Profile - RFT (Maxi)"
          },
          {
            "generalName": "CBC",
            "labName": "CBC-Complete Hemogram Test(28)"
          },
          {
            "generalName": "25 OH Vitamin D",
            "labName": "Vitamin D3"
          },
          {
            "generalName": "Vit B12",
            "labName": "Vitamin B12"
          }
        ],
        "mrp": 1800,
        "b2b": 750
      },
      {
        "id": "gd-tax-saver-health-package",
        "packageName": "GD- TAX SAVER HEALTH PACKAGE",
        "tests": [
          {
            "generalName": "25 OH Vitamin D",
            "labName": "Vitamin D3"
          },
          {
            "generalName": "Vit B12",
            "labName": "Vitamin B12"
          },
          {
            "generalName": "RA Factor",
            "labName": "Rheumatoid Factor (RF)"
          },
          {
            "generalName": "ESR",
            "labName": "ESR (Erythrocyte Sedimentation Rate)"
          },
          {
            "generalName": "Electrolytes",
            "labName": "Serum Electrolyte Profile"
          },
          {
            "generalName": "Iron Study",
            "labName": "Iron Studies (Iron,TIBC, Transferrin saturation)"
          },
          {
            "generalName": "LFT",
            "labName": "LFT (Liver Function Test)"
          },
          {
            "generalName": "Lipid Profile",
            "labName": "Lipid Profile"
          },
          {
            "generalName": "Total TFT",
            "labName": "Thyroid Profile - Total T3,Total T4,TSH (TFT)"
          },
          {
            "generalName": "HbA1C",
            "labName": "Hba1c (Whole Blood)"
          },
          {
            "generalName": "GD Wellness Cardiac Risk Marker",
            "labName": "GD Wellness Cardiac Risk Marker (5 Parameters)"
          },
          {
            "generalName": "RFT",
            "labName": "Kidney Profile - RFT (Maxi)"
          },
          {
            "generalName": "CBC",
            "labName": "CBC-Complete Hemogram Test(28)"
          }
        ],
        "mrp": 2499,
        "b2b": 950
      },
      {
        "id": "gd-wellness-15-1",
        "packageName": "GD Wellness 15.1",
        "tests": [
          {
            "generalName": "Iron Study",
            "labName": "Iron Studies (Iron,TIBC, Transferrin saturation)"
          },
          {
            "generalName": "LFT",
            "labName": "LFT (Liver Function Test)"
          },
          {
            "generalName": "Lipid Profile",
            "labName": "Lipid Profile"
          },
          {
            "generalName": "Total TFT",
            "labName": "Thyroid Profile - Total T3,Total T4,TSH (TFT)"
          },
          {
            "generalName": "RFT",
            "labName": "Kidney Profile - RFT (Maxi)"
          },
          {
            "generalName": "25 OH Vitamin D",
            "labName": "Vitamin D3"
          },
          {
            "generalName": "Vit B12",
            "labName": "Vitamin B12"
          }
        ],
        "mrp": 1000,
        "b2b": 550
      }
    ]
  },
  "4": {
    "name": "Trucheck Diagnostics",
    "tests": [
      {
        "id": "add-tests-later",
        "generalName": "Add Tests Later",
        "labName": "",
        "mrp": "",
        "b2b": ""
      },
      {
        "id": "new-tests",
        "generalName": "New Tests",
        "labName": "",
        "mrp": "",
        "b2b": ""
      },
      {
        "id": "extra-collection",
        "generalName": "Extra Collection",
        "labName": "",
        "mrp": "",
        "b2b": ""
      }
    ],
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
"Dr. Sejal Jain",
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
"Yogesh",
"Kalpana Shah",
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
"Dr. Sejal Jain",
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
