export type Sex = 'female' | 'male'
export type Goal = 'lose' | 'maintain' | 'gain'
export type Activity = 'sedentary' | 'light' | 'moderate' | 'high' | 'athlete'

export interface Profile {
  sex: Sex
  age: number | null
  heightCm: number | null
  weightKg: number | null
  activity: Activity
  goal: Goal
  neckCm: number | null
  waistCm: number | null
  hipCm: number | null
}

export const DEFAULT_PROFILE: Profile = {
  sex: 'female',
  age: null,
  heightCm: null,
  weightKg: null,
  activity: 'moderate',
  goal: 'maintain',
  neckCm: null,
  waistCm: null,
  hipCm: null,
}

export const ACTIVITY_FACTOR: Record<Activity, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  high: 1.725,
  athlete: 1.9,
}

export interface ValidProfile extends Profile {
  age: number
  heightCm: number
  weightKg: number
}

export function isValid(p: Profile): p is ValidProfile {
  return (
    p.age != null && p.age >= 14 && p.age <= 90 &&
    p.heightCm != null && p.heightCm >= 120 && p.heightCm <= 230 &&
    p.weightKg != null && p.weightKg >= 30 && p.weightKg <= 300
  )
}

/** Mifflin-St Jeor resting energy expenditure, kcal/day. */
export function bmr(p: ValidProfile): number {
  return 10 * p.weightKg + 6.25 * p.heightCm - 5 * p.age + (p.sex === 'male' ? 5 : -161)
}

export interface Targets {
  bmr: number
  tdee: number
  kcal: number
  protein: number
  carbs: number
  fat: number
  fiber: number
  waterL: number
  proteinPerKg: number
  /** calories were raised to the safe minimum */
  floored: boolean
  floor: number
}

const PROTEIN_PER_KG: Record<Goal, number> = { lose: 2.0, maintain: 1.6, gain: 1.8 }
const GOAL_FACTOR: Record<Goal, number> = { lose: 0.8, maintain: 1, gain: 1.1 }

const round10 = (n: number) => Math.round(n / 10) * 10

export function targets(p: ValidProfile): Targets {
  const base = bmr(p)
  const tdee = base * ACTIVITY_FACTOR[p.activity]
  const floor = p.sex === 'male' ? 1500 : 1200
  let kcal = round10(tdee * GOAL_FACTOR[p.goal])
  const floored = p.goal === 'lose' && kcal < floor
  if (floored) kcal = floor

  // protein by body weight, but never more than 35% of calories
  const proteinPerKg = PROTEIN_PER_KG[p.goal]
  const protein = Math.round(Math.min(p.weightKg * proteinPerKg, (kcal * 0.35) / 4))
  // fat: at least 0.8 g/kg and 25% of calories
  const fat = Math.round(Math.max(p.weightKg * 0.8, (kcal * 0.25) / 9))
  const carbs = Math.max(50, Math.round((kcal - protein * 4 - fat * 9) / 4))

  const extraWater = p.activity === 'high' || p.activity === 'athlete' ? 0.5 : 0
  return {
    bmr: Math.round(base),
    tdee: round10(tdee),
    kcal,
    protein,
    carbs,
    fat,
    fiber: Math.round((kcal / 1000) * 14),
    waterL: Math.round((p.weightKg * 0.033 + extraWater) * 10) / 10,
    proteinPerKg: Math.round((protein / p.weightKg) * 10) / 10,
    floored,
    floor,
  }
}

// ───────── body analysis ─────────

export type BmiCategory = 'under' | 'normal' | 'over' | 'obese'
export type FatCategory = 'essential' | 'athletic' | 'fit' | 'average' | 'high'

export interface BodyAnalysis {
  bmi: number
  bmiCategory: BmiCategory
  fatPct: number
  fatMethod: 'navy' | 'bmi'
  fatCategory: FatCategory
  leanKg: number
  fatKg: number
  whtr: number | null
  healthyKg: { lo: number; hi: number }
}

export function bmiCategory(bmi: number): BmiCategory {
  if (bmi < 18.5) return 'under'
  if (bmi < 25) return 'normal'
  if (bmi < 30) return 'over'
  return 'obese'
}

export function fatCategory(sex: Sex, pct: number): FatCategory {
  const cuts = sex === 'male' ? [6, 14, 18, 25] : [14, 21, 25, 32]
  if (pct < cuts[0]) return 'essential'
  if (pct < cuts[1]) return 'athletic'
  if (pct < cuts[2]) return 'fit'
  if (pct < cuts[3]) return 'average'
  return 'high'
}

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n))

/** US Navy tape-measure estimate. Returns null if the measurements are missing or impossible. */
export function navyBodyFat(p: ValidProfile): number | null {
  const { neckCm: neck, waistCm: waist, hipCm: hip, heightCm: h } = p
  if (!neck || !waist) return null
  if (p.sex === 'male') {
    if (waist <= neck) return null
    return 495 / (1.0324 - 0.19077 * Math.log10(waist - neck) + 0.15456 * Math.log10(h)) - 450
  }
  if (!hip || waist + hip <= neck) return null
  return 495 / (1.29579 - 0.35004 * Math.log10(waist + hip - neck) + 0.221 * Math.log10(h)) - 450
}

/** Deurenberg estimate from BMI, age and sex. Rough. */
export function bmiBodyFat(bmi: number, age: number, sex: Sex): number {
  return 1.2 * bmi + 0.23 * age - 10.8 * (sex === 'male' ? 1 : 0) - 5.4
}

export function analyseBody(p: ValidProfile): BodyAnalysis {
  const m = p.heightCm / 100
  const bmi = p.weightKg / (m * m)
  const navy = navyBodyFat(p)
  const raw = navy ?? bmiBodyFat(bmi, p.age, p.sex)
  const fatPct = Math.round(clamp(raw, 3, 60) * 10) / 10
  const fatKg = (p.weightKg * fatPct) / 100
  return {
    bmi: Math.round(bmi * 10) / 10,
    bmiCategory: bmiCategory(bmi),
    fatPct,
    fatMethod: navy != null ? 'navy' : 'bmi',
    fatCategory: fatCategory(p.sex, fatPct),
    leanKg: Math.round((p.weightKg - fatKg) * 10) / 10,
    fatKg: Math.round(fatKg * 10) / 10,
    whtr: p.waistCm ? Math.round((p.waistCm / p.heightCm) * 100) / 100 : null,
    healthyKg: { lo: Math.round(18.5 * m * m), hi: Math.round(24.9 * m * m) },
  }
}
