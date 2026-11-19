import { describe, expect, it } from 'vitest'
import { INGREDIENTS } from '../data/ingredients'
import { MARKERS } from '../data/markers'
import { RECIPES } from '../data/recipes'
import { MINERAL_NOTES, RULES } from '../data/rules'
import { WORKOUTS } from '../data/workouts'
import { CONTENT, DICTS, formatAmountLocal, translate, translatePlural } from './index'
import { en } from './en'
import type { Lang } from './types'

const OTHER: Lang[] = ['ru', 'he']

describe('UI dictionaries', () => {
  for (const lang of OTHER) {
    it(`${lang} has every English key and the same placeholders`, () => {
      for (const [key, value] of Object.entries(en)) {
        const tr = DICTS[lang][key]
        expect(tr, `${lang}: missing ${key}`).toBeTruthy()
        const ph = (s: string) => (s.match(/\{\w+\}/g) ?? []).sort().join(',')
        // plural keys may drop {n} in some forms, everything else must match exactly
        if (!/\.(one|few|many|other)$/.test(key)) expect(ph(tr), `${lang}: placeholders in ${key}`).toBe(ph(value))
      }
    })
  }

  it('russian has all four plural forms', () => {
    for (const base of ['recipes.count', 'detail.servings']) {
      for (const form of ['one', 'few', 'many', 'other']) expect(DICTS.ru[`${base}.${form}`], `${base}.${form}`).toBeTruthy()
    }
  })

  it('plural rules pick the right Russian form', () => {
    expect(translatePlural('ru', 'recipes.count', 1)).toContain('рецепт')
    expect(translatePlural('ru', 'recipes.count', 2)).not.toBe(translatePlural('ru', 'recipes.count', 5))
    expect(translatePlural('en', 'recipes.count', 16)).toBe('16 recipes')
    expect(translatePlural('en', 'recipes.count', 1)).toBe('1 recipe')
  })

  it('fills placeholders', () => {
    expect(translate('en', 'nav.shoppingAria', { n: 3 })).toBe('Shopping list, 3 left')
  })
})

describe('localised content', () => {
  for (const lang of OTHER) {
    const c = CONTENT[lang]
    it(`${lang}: every ingredient, recipe, rule, workout and marker is translated`, () => {
      for (const id of Object.keys(INGREDIENTS)) expect(c.ingredients[id], `ingredient ${id}`).toBeTruthy()
      for (const i of Object.values(INGREDIENTS).filter((x) => x.piece)) expect(c.pieces[i.id]?.other, `piece ${i.id}`).toBeTruthy()
      for (const r of RECIPES) {
        const t = c.recipes[r.slug]
        expect(t, `recipe ${r.slug}`).toBeDefined()
        expect(t.title && t.summary, r.slug).toBeTruthy()
        expect(t.steps.length, `${r.slug} steps`).toBe(r.steps.length)
        expect(Boolean(t.tip), `${r.slug} tip`).toBe(Boolean(r.tip))
      }
      for (const r of RULES) expect(c.rules[r.id]?.text, `rule ${r.id}`).toBeTruthy()
      for (const m of MINERAL_NOTES) expect(c.minerals[m.id]?.text, `mineral ${m.id}`).toBeTruthy()
      for (const k of ['veg', 'protein', 'carbs'] as const) expect(c.plate[k]?.text, `plate ${k}`).toBeTruthy()
      for (const w of WORKOUTS) {
        const t = c.workouts[w.slug]
        expect(t, `workout ${w.slug}`).toBeDefined()
        expect(t.exercises.length, `${w.slug} exercises`).toBe(w.exercises.length)
        for (const e of t.exercises) expect(e.name && e.cue).toBeTruthy()
      }
      for (const m of MARKERS) {
        const t = c.markers[m.id]
        expect(t?.name, `marker ${m.id}`).toBeTruthy()
        expect(Boolean(t.low), `${m.id} low`).toBe(Boolean(m.low))
        expect(Boolean(t.high), `${m.id} high`).toBe(Boolean(m.high))
      }
    })
  }

  it('formats localised amounts with plural pieces', () => {
    expect(formatAmountLocal('en', 'egg', 220, { grams: 55 }, undefined)).toBe('4 eggs')
    expect(formatAmountLocal('ru', 'egg', 220, { grams: 55 }, undefined)).toMatch(/^4 яйца$/)
    expect(formatAmountLocal('ru', 'egg', 275, { grams: 55 }, undefined)).toMatch(/^5 яиц$/)
    expect(formatAmountLocal('ru', 'olive-oil', 20, undefined, 'ml')).toBe('20 мл')
    expect(formatAmountLocal('he', 'egg', 220, { grams: 55 }, undefined)).toMatch(/^4 /)
  })
})
