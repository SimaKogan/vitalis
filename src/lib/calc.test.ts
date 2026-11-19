import { describe, expect, it } from 'vitest'
import { DEFAULT_PROFILE, analyseBody, bmr, isValid, targets, type Profile, type ValidProfile } from './calc'

const man: ValidProfile = { ...DEFAULT_PROFILE, sex: 'male', age: 30, heightCm: 180, weightKg: 80 }
const woman: ValidProfile = { ...DEFAULT_PROFILE, sex: 'female', age: 25, heightCm: 165, weightKg: 60 }

describe('calculator', () => {
  it('computes Mifflin-St Jeor BMR', () => {
    expect(bmr(man)).toBe(1780)
    expect(bmr(woman)).toBeCloseTo(1345.25, 2)
  })

  it('rejects incomplete or implausible profiles', () => {
    expect(isValid(DEFAULT_PROFILE)).toBe(false)
    expect(isValid({ ...man, age: 5 } as Profile)).toBe(false)
    expect(isValid(man)).toBe(true)
  })

  it('orders calories by goal and keeps macros consistent', () => {
    const lose = targets({ ...man, goal: 'lose' })
    const keep = targets({ ...man, goal: 'maintain' })
    const gain = targets({ ...man, goal: 'gain' })
    expect(lose.kcal).toBeLessThan(keep.kcal)
    expect(gain.kcal).toBeGreaterThan(keep.kcal)
    expect(keep.kcal).toBe(keep.tdee)
    expect(lose.protein).toBeGreaterThan(keep.protein)
    for (const t of [lose, keep, gain]) {
      const kcalFromMacros = t.protein * 4 + t.carbs * 4 + t.fat * 9
      expect(Math.abs(kcalFromMacros - t.kcal)).toBeLessThan(60)
    }
  })

  it('scales with activity', () => {
    const a = targets({ ...man, activity: 'sedentary' })
    const b = targets({ ...man, activity: 'athlete' })
    expect(b.tdee).toBeGreaterThan(a.tdee * 1.4)
  })

  it('never goes below a safe calorie floor when losing fat', () => {
    const tiny: ValidProfile = { ...woman, weightKg: 45, heightCm: 150, age: 60, activity: 'sedentary', goal: 'lose' }
    const t = targets(tiny)
    expect(t.kcal).toBe(1200)
    expect(t.floored).toBe(true)
  })

  it('caps protein at 35% of calories for heavy people', () => {
    const big: ValidProfile = { ...man, weightKg: 130, goal: 'lose' }
    const t = targets(big)
    expect((t.protein * 4) / t.kcal).toBeLessThanOrEqual(0.351)
  })
})

describe('body analysis', () => {
  it('computes BMI and healthy range', () => {
    const b = analyseBody(man)
    expect(b.bmi).toBe(24.7)
    expect(b.bmiCategory).toBe('normal')
    expect(b.healthyKg).toEqual({ lo: 60, hi: 81 })
  })

  it('uses the US Navy method when tape measurements exist', () => {
    const b = analyseBody({ ...man, neckCm: 38, waistCm: 85 })
    expect(b.fatMethod).toBe('navy')
    expect(b.fatPct).toBeGreaterThan(14)
    expect(b.fatPct).toBeLessThan(18)
    expect(b.whtr).toBeCloseTo(0.47, 2)
  })

  it('needs hips for women and otherwise falls back to the BMI estimate', () => {
    expect(analyseBody({ ...woman, neckCm: 32, waistCm: 70 }).fatMethod).toBe('bmi')
    expect(analyseBody({ ...woman, neckCm: 32, waistCm: 70, hipCm: 95 }).fatMethod).toBe('navy')
  })

  it('keeps lean + fat mass equal to body weight', () => {
    const b = analyseBody(woman)
    expect(b.leanKg + b.fatKg).toBeCloseTo(woman.weightKg, 0)
  })
})
