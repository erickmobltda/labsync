export const CATEGORY_MAP: Record<string, string> = {
  // Lipid Profile
  'HDL': 'Lipid Profile',
  'HDL Cholesterol': 'Lipid Profile',
  'LDL': 'Lipid Profile',
  'LDL Cholesterol': 'Lipid Profile',
  'VLDL': 'Lipid Profile',
  'Total Cholesterol': 'Lipid Profile',
  'Cholesterol': 'Lipid Profile',
  'Triglycerides': 'Lipid Profile',
  'Non-HDL Cholesterol': 'Lipid Profile',

  // Metabolic Panel
  'Glucose': 'Metabolic Panel',
  'Fasting Glucose': 'Metabolic Panel',
  'HbA1c': 'Metabolic Panel',
  'Hemoglobin A1c': 'Metabolic Panel',
  'Insulin': 'Metabolic Panel',
  'Creatinine': 'Metabolic Panel',
  'BUN': 'Metabolic Panel',
  'Blood Urea Nitrogen': 'Metabolic Panel',
  'eGFR': 'Metabolic Panel',
  'Uric Acid': 'Metabolic Panel',
  'Sodium': 'Metabolic Panel',
  'Potassium': 'Metabolic Panel',
  'Calcium': 'Metabolic Panel',
  'Phosphorus': 'Metabolic Panel',
  'Bicarbonate': 'Metabolic Panel',
  'Chloride': 'Metabolic Panel',

  // Blood Count
  'Hemoglobin': 'Blood Count',
  'Hematocrit': 'Blood Count',
  'RBC': 'Blood Count',
  'Red Blood Cells': 'Blood Count',
  'WBC': 'Blood Count',
  'White Blood Cells': 'Blood Count',
  'Platelets': 'Blood Count',
  'MCV': 'Blood Count',
  'MCH': 'Blood Count',
  'MCHC': 'Blood Count',
  'Neutrophils': 'Blood Count',
  'Lymphocytes': 'Blood Count',
  'Monocytes': 'Blood Count',
  'Eosinophils': 'Blood Count',
  'Basophils': 'Blood Count',

  // Liver Function
  'ALT': 'Liver Function',
  'AST': 'Liver Function',
  'ALP': 'Liver Function',
  'GGT': 'Liver Function',
  'Total Bilirubin': 'Liver Function',
  'Direct Bilirubin': 'Liver Function',
  'Indirect Bilirubin': 'Liver Function',
  'Albumin': 'Liver Function',
  'Total Protein': 'Liver Function',

  // Thyroid
  'TSH': 'Thyroid',
  'T3': 'Thyroid',
  'T4': 'Thyroid',
  'Free T3': 'Thyroid',
  'Free T4': 'Thyroid',
  'fT3': 'Thyroid',
  'fT4': 'Thyroid',

  // Vitamins & Minerals
  'Vitamin D': 'Vitamins & Minerals',
  '25-OH Vitamin D': 'Vitamins & Minerals',
  'Vitamin B12': 'Vitamins & Minerals',
  'Folate': 'Vitamins & Minerals',
  'Folic Acid': 'Vitamins & Minerals',
  'Iron': 'Vitamins & Minerals',
  'Ferritin': 'Vitamins & Minerals',
  'TIBC': 'Vitamins & Minerals',
  'Transferrin Saturation': 'Vitamins & Minerals',
  'Zinc': 'Vitamins & Minerals',
  'Magnesium': 'Vitamins & Minerals',
  'Selenium': 'Vitamins & Minerals',

  // Inflammation
  'CRP': 'Inflammation',
  'C-Reactive Protein': 'Inflammation',
  'hs-CRP': 'Inflammation',
  'ESR': 'Inflammation',
  'Homocysteine': 'Inflammation',
  'Fibrinogen': 'Inflammation',

  // Hormones
  'Testosterone': 'Hormones',
  'Free Testosterone': 'Hormones',
  'Estradiol': 'Hormones',
  'Progesterone': 'Hormones',
  'Cortisol': 'Hormones',
  'DHEA': 'Hormones',
  'DHEA-S': 'Hormones',
  'Prolactin': 'Hormones',
  'LH': 'Hormones',
  'FSH': 'Hormones',
}

export const ALL_CATEGORIES = [
  'Lipid Profile',
  'Metabolic Panel',
  'Blood Count',
  'Liver Function',
  'Thyroid',
  'Vitamins & Minerals',
  'Inflammation',
  'Hormones',
  'Other',
]

export function resolveCategory(name: string): string {
  if (CATEGORY_MAP[name]) return CATEGORY_MAP[name]
  // Fuzzy match: check if any key is contained in the name
  const lower = name.toLowerCase()
  for (const [key, cat] of Object.entries(CATEGORY_MAP)) {
    if (lower.includes(key.toLowerCase()) || key.toLowerCase().includes(lower)) {
      return cat
    }
  }
  return 'Other'
}
