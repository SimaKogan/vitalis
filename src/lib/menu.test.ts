import { describe, expect, it } from 'vitest'
import { getRecipe } from '../data/recipes'
import { addWeekToList, planWeek, SLOTS } from './menu'

const T2000 = { kcal: 2000, protein: 130, carbs: 220, fat: 65 }

describe('weekly menu', () => {
  it('plans seven days with four meals each', () => {
    const plan = planWeek(T2000, { seed: 1 })
    expect(plan).toHaveLength(7)
    for (const d of plan) expect(d.meals.map((m) => m.slot)).toEqual(SLOTS.map((s) => s.slot))
  })

  it.each([1500, 2000, 2600, 3200])('lands near %i kcal per day', (kcal) => {
    const plan = planWeek({ kcal, protein: kcal * 0.07, carbs: kcal * 0.1, fat: kcal * 0.03 }, { seed: 3 })
    for (const d of plan) {
      expect(d.totals.kcal).toBeGreaterThan(kcal * 0.85)
      expect(d.totals.kcal).toBeLessThan(kcal * 1.15)
    }
  })

  it('uses only gluten-free collection recipes when strict', () => {
    const plan = planWeek(T2000, { strictOnly: true, seed: 5 })
    for (const d of plan) for (const m of d.meals) expect(getRecipe(m.slug)?.collection).toBe('gluten-free')
  })

  it('is deterministic per seed and varies between seeds', () => {
    const a = JSON.stringify(planWeek(T2000, { seed: 7 }))
    expect(JSON.stringify(planWeek(T2000, { seed: 7 }))).toBe(a)
    expect(JSON.stringify(planWeek(T2000, { seed: 8 }))).not.toBe(a)
  })

  it('does not serve the same dish twice in one day or two days running for the same slot', () => {
    const plan = planWeek(T2000, { seed: 2 })
    for (const d of plan) expect(new Set(d.meals.map((m) => m.slug)).size).toBe(d.meals.length)
  })

  it('gets close to the protein target on a fat-loss plan', () => {
    const target = { kcal: 1700, protein: 128, carbs: 182, fat: 51 }
    let ratio = 0
    let days = 0
    for (let seed = 1; seed <= 5; seed++) {
      for (const d of planWeek(target, { seed })) {
        ratio += d.totals.protein / target.protein
        days++
      }
    }
    expect(ratio / days).toBeGreaterThan(0.85)
  })

  it('builds a shopping list from the plan', () => {
    const plan = planWeek(T2000, { seed: 1 })
    const list = addWeekToList([], plan)
    expect(list.length).toBeGreaterThan(10)
    expect(list.every((i) => (i.grams ?? 0) > 0)).toBe(true)
  })
})
