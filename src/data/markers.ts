/**
 * Blood-test markers the analyzer understands.
 * Ranges are typical adult reference ranges in the canonical unit. Labs differ, so when a
 * report prints its own range the analyzer uses that instead.
 */

export interface Range {
  lo: number
  hi: number
}

export type MarkerCategory = 'blood' | 'iron' | 'thyroid' | 'vitamins' | 'metabolic' | 'lipids' | 'other'

export interface Conversion {
  /** matches the unit text found next to the value */
  unit: RegExp
  /** canonical = raw * factor + offset */
  factor: number
  offset?: number
}

export interface Marker {
  id: string
  category: MarkerCategory
  /** canonical unit shown in the UI and used for default ranges */
  unit: string
  decimals: number
  range: Range | { male: Range; female: Range }
  /** lowercase search names per language; the longest match on a line wins */
  aliases: { en: string[]; ru: string[]; he: string[] }
  /** lines matching this are never read as this marker */
  exclude?: RegExp
  conversions?: Conversion[]
  /** English texts; other languages live in src/i18n/content.*.ts */
  name: string
  about: string
  low: string
  high: string
  /** which food tip to show when out of range */
  tip?: 'iron' | 'thyroid'
}

export const MARKERS: Marker[] = [
  {
    id: 'hemoglobin',
    category: 'blood',
    unit: 'g/dL',
    decimals: 1,
    range: { male: { lo: 13.5, hi: 17.5 }, female: { lo: 12, hi: 15.5 } },
    aliases: { en: ['hemoglobin', 'haemoglobin', 'hgb', 'hb'], ru: ['гемоглобин'], he: ['המוגלובין'] },
    conversions: [{ unit: /g\s*\/\s*l\b/i, factor: 0.1 }],
    name: 'Hemoglobin',
    about: 'Carries oxygen in red blood cells.',
    low: 'Low levels can cause tiredness and are often linked to low iron, B12 or folate. Your doctor can find the cause.',
    high: 'High levels can happen with dehydration, smoking or living at altitude, and sometimes with other conditions.',
    tip: 'iron',
  },
  {
    id: 'ferritin',
    category: 'iron',
    unit: 'ng/mL',
    decimals: 0,
    range: { male: { lo: 30, hi: 400 }, female: { lo: 15, hi: 150 } },
    aliases: { en: ['ferritin'], ru: ['ферритин'], he: ['פריטין'] },
    name: 'Ferritin',
    about: 'Shows how much iron your body has stored.',
    low: 'Low stores often come before iron-deficiency anaemia. Iron-rich foods with vitamin C help, but ask your doctor before taking supplements.',
    high: 'It can rise with inflammation, liver conditions or iron overload. It is not a reason to take iron.',
    tip: 'iron',
  },
  {
    id: 'iron',
    category: 'iron',
    unit: 'µg/dL',
    decimals: 0,
    range: { lo: 50, hi: 170 },
    aliases: { en: ['serum iron', 'iron'], ru: ['железо сыворотки', 'железо'], he: ['ברזל'] },
    exclude: /binding|tibc|saturation|transferrin|ferritin|capacity|связыв|ожсс|насыщ|ферритин|трансферрин|קישור|רוויה|פריטין|טרנספרין/i,
    conversions: [{ unit: /[µμu]mol\s*\/\s*l/i, factor: 5.585 }],
    name: 'Serum iron',
    about: 'Iron circulating in the blood right now. It changes through the day and after meals.',
    low: 'Often goes with low ferritin. Read it together with ferritin and transferrin saturation.',
    high: 'Can be raised by iron supplements taken shortly before the test.',
    tip: 'iron',
  },
  {
    id: 'tsat',
    category: 'iron',
    unit: '%',
    decimals: 0,
    range: { lo: 20, hi: 50 },
    aliases: {
      en: ['transferrin saturation', 'iron saturation', 'tsat'],
      ru: ['насыщение трансферрина', 'коэффициент насыщения трансферрина'],
      he: ['רוויית טרנספרין'],
    },
    name: 'Transferrin saturation',
    about: 'How much of the iron-carrying protein (transferrin) is loaded with iron.',
    low: 'Low values suggest little iron is available to the body.',
    high: 'High values can point to iron overload and should be reviewed by a doctor.',
    tip: 'iron',
  },
  {
    id: 'tsh',
    category: 'thyroid',
    unit: 'mIU/L',
    decimals: 2,
    range: { lo: 0.4, hi: 4.0 },
    aliases: { en: ['tsh', 'thyroid stimulating hormone', 'thyrotropin'], ru: ['ттг', 'тиреотропный гормон'], he: ['tsh', 'תירוטרופין'] },
    name: 'TSH',
    about: 'The signal that tells the thyroid how much hormone to make.',
    low: 'A low TSH can mean an overactive thyroid. Please see your doctor.',
    high: 'A high TSH often means an underactive thyroid. Please see your doctor, and do not treat it with iodine on your own.',
    tip: 'thyroid',
  },
  {
    id: 'ft4',
    category: 'thyroid',
    unit: 'ng/dL',
    decimals: 2,
    range: { lo: 0.8, hi: 1.8 },
    aliases: {
      en: ['free t4', 'ft4', 't4 free', 'free thyroxine'],
      ru: ['т4 свободный', 'свободный т4', 'св. т4', 'ft4'],
      he: ['free t4', 'ft4', 'תירוקסין חופשי'],
    },
    conversions: [{ unit: /pmol\s*\/\s*l/i, factor: 0.0777 }],
    name: 'Free T4',
    about: 'Free thyroxine, the main thyroid hormone in the blood.',
    low: 'Low values with a high TSH suggest an underactive thyroid. Please see your doctor.',
    high: 'High values with a low TSH suggest an overactive thyroid. Please see your doctor.',
    tip: 'thyroid',
  },
  {
    id: 'vitd',
    category: 'vitamins',
    unit: 'ng/mL',
    decimals: 0,
    range: { lo: 30, hi: 100 },
    aliases: {
      en: ['25-hydroxy vitamin d', '25-oh vitamin d', '25 oh vitamin d', 'vitamin d', '25(oh)d', 'vit d'],
      ru: ['25-гидроксивитамин d', 'витамин d', 'витамин д', '25-oh'],
      he: ['ויטמין d', 'd ויטמין', 'vitamin d'],
    },
    conversions: [{ unit: /nmol\s*\/\s*l/i, factor: 0.4006 }],
    name: 'Vitamin D (25-OH)',
    about: 'The best single measure of vitamin D status.',
    low: 'Common in winter and with little sun. Ask your doctor about the right dose, because too much is harmful.',
    high: 'Usually comes from high-dose supplements. Talk to your doctor.',
  },
  {
    id: 'b12',
    category: 'vitamins',
    unit: 'pg/mL',
    decimals: 0,
    range: { lo: 200, hi: 900 },
    aliases: {
      en: ['vitamin b12', 'vitamin b-12', 'cobalamin', 'b12', 'b-12'],
      ru: ['витамин b12', 'витамин в12', 'цианокобаламин', 'b12', 'в12'],
      he: ['ויטמין b12', 'b12'],
    },
    conversions: [{ unit: /pmol\s*\/\s*l/i, factor: 1.355 }],
    name: 'Vitamin B12',
    about: 'Needed for nerves and red blood cells. Found in animal foods.',
    low: 'More common with little animal food or absorption problems. Ask your doctor.',
    high: '',
  },
  {
    id: 'folate',
    category: 'vitamins',
    unit: 'ng/mL',
    decimals: 1,
    range: { lo: 4, hi: 20 },
    aliases: { en: ['folate', 'folic acid', 'vitamin b9'], ru: ['фолиевая кислота', 'фолат'], he: ['חומצה פולית', 'פולאט'] },
    conversions: [{ unit: /nmol\s*\/\s*l/i, factor: 0.4414 }],
    name: 'Folate',
    about: 'A B vitamin needed to make red blood cells and DNA.',
    low: 'Leafy vegetables, eggs and fruit are good sources. Ask your doctor if it stays low.',
    high: '',
  },
  {
    id: 'glucose',
    category: 'metabolic',
    unit: 'mg/dL',
    decimals: 0,
    range: { lo: 70, hi: 99 },
    aliases: { en: ['fasting glucose', 'glucose'], ru: ['глюкоза'], he: ['גלוקוז', 'סוכר'] },
    conversions: [{ unit: /mmol\s*\/\s*l/i, factor: 18.016 }],
    name: 'Fasting glucose',
    about: 'Blood sugar after an overnight fast.',
    low: 'Low values can cause shakiness and sweating. Check with your doctor if it repeats.',
    high: 'Repeated high fasting values should be checked by a doctor for prediabetes or diabetes.',
  },
  {
    id: 'hba1c',
    category: 'metabolic',
    unit: '%',
    decimals: 1,
    range: { lo: 4, hi: 5.6 },
    aliases: {
      en: ['hba1c', 'hemoglobin a1c', 'glycated hemoglobin', 'glycosylated hemoglobin', 'a1c'],
      ru: ['гликированный гемоглобин', 'hba1c'],
      he: ['המוגלובין מסוכרר', 'hba1c'],
    },
    conversions: [{ unit: /mmol\s*\/\s*mol/i, factor: 1 / 10.929, offset: 2.15 }],
    name: 'HbA1c',
    about: 'Average blood sugar over about three months.',
    low: '',
    high: 'Values above the range suggest raised average blood sugar. Please see your doctor.',
  },
  {
    id: 'chol',
    category: 'lipids',
    unit: 'mg/dL',
    decimals: 0,
    range: { lo: 0, hi: 200 },
    aliases: {
      en: ['total cholesterol', 'cholesterol'],
      ru: ['холестерин общий', 'общий холестерин', 'холестерин'],
      he: ['כולסטרול כללי', 'כולסטרול'],
    },
    exclude: /ldl|hdl|non-hdl|lipoprotein|лпнп|лпвп|липопротеид|ליפופרוטאין/i,
    conversions: [{ unit: /mmol\s*\/\s*l/i, factor: 38.67 }],
    name: 'Total cholesterol',
    about: 'All cholesterol carried in the blood.',
    low: '',
    high: 'Food, weight, activity and genes all play a part. Discuss your overall heart risk with your doctor.',
  },
  {
    id: 'ldl',
    category: 'lipids',
    unit: 'mg/dL',
    decimals: 0,
    range: { lo: 0, hi: 130 },
    aliases: {
      en: ['ldl cholesterol', 'ldl-c', 'ldl'],
      ru: ['холестерин лпнп', 'лпнп', 'ldl'],
      he: ['ldl', 'כולסטרול רע'],
    },
    conversions: [{ unit: /mmol\s*\/\s*l/i, factor: 38.67 }],
    name: 'LDL cholesterol',
    about: 'The “bad” cholesterol, linked to plaque in the arteries.',
    low: '',
    high: 'Vegetables, fibre, oily fish and regular exercise can help. Discuss your target with your doctor.',
  },
  {
    id: 'hdl',
    category: 'lipids',
    unit: 'mg/dL',
    decimals: 0,
    range: { male: { lo: 40, hi: 120 }, female: { lo: 50, hi: 120 } },
    aliases: {
      en: ['hdl cholesterol', 'hdl-c', 'hdl'],
      ru: ['холестерин лпвп', 'лпвп', 'hdl'],
      he: ['hdl', 'כולסטרול טוב'],
    },
    conversions: [{ unit: /mmol\s*\/\s*l/i, factor: 38.67 }],
    name: 'HDL cholesterol',
    about: 'The “good” cholesterol that carries cholesterol away from the arteries.',
    low: 'Regular exercise, not smoking and healthy fats such as olive oil and fish can raise it.',
    high: '',
  },
  {
    id: 'trig',
    category: 'lipids',
    unit: 'mg/dL',
    decimals: 0,
    range: { lo: 0, hi: 150 },
    aliases: { en: ['triglycerides', 'triglyceride'], ru: ['триглицериды'], he: ['טריגליצרידים'] },
    conversions: [{ unit: /mmol\s*\/\s*l/i, factor: 88.57 }],
    name: 'Triglycerides',
    about: 'Fats in the blood. They rise with sugar, alcohol and extra calories.',
    low: '',
    high: 'Cutting sugary drinks, sweets and alcohol, and moving more, usually helps.',
  },
  {
    id: 'crp',
    category: 'other',
    unit: 'mg/L',
    decimals: 1,
    range: { lo: 0, hi: 5 },
    aliases: { en: ['c-reactive protein', 'hs-crp', 'crp'], ru: ['с-реактивный белок', 'срб', 'crp'], he: ['crp', 'c-reactive protein'] },
    conversions: [{ unit: /mg\s*\/\s*dl/i, factor: 10 }],
    name: 'C-reactive protein',
    about: 'A general marker of inflammation.',
    low: '',
    high: 'It rises with infections and many conditions. One high value is not a diagnosis. Ask your doctor.',
  },
  {
    id: 'alt',
    category: 'other',
    unit: 'U/L',
    decimals: 0,
    range: { lo: 0, hi: 45 },
    aliases: { en: ['alanine aminotransferase', 'sgpt', 'alt'], ru: ['аланинаминотрансфераза', 'алт'], he: ['alt', 'sgpt'] },
    name: 'ALT',
    about: 'A liver enzyme.',
    low: '',
    high: 'It can rise with fatty liver, alcohol, some medicines and illness. Ask your doctor.',
  },
  {
    id: 'creatinine',
    category: 'other',
    unit: 'mg/dL',
    decimals: 2,
    range: { male: { lo: 0.74, hi: 1.35 }, female: { lo: 0.59, hi: 1.04 } },
    aliases: { en: ['creatinine'], ru: ['креатинин'], he: ['קראטינין', 'קריאטינין'] },
    exclude: /clearance|egfr|gfr|клиренс|скф/i,
    conversions: [{ unit: /[µμu]mol\s*\/\s*l/i, factor: 0.01131 }],
    name: 'Creatinine',
    about: 'A waste product used to estimate kidney function. It depends on muscle mass.',
    low: 'Often reflects low muscle mass.',
    high: 'It can reflect kidney function, dehydration or a lot of muscle. Ask your doctor.',
  },
]

export const MARKER_BY_ID: Record<string, Marker> = Object.fromEntries(MARKERS.map((m) => [m.id, m]))
