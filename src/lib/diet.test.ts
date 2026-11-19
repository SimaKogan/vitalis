import { describe, expect, it } from 'vitest'
import { INGREDIENTS, formatAmount } from '../data/ingredients'
import { RECIPES } from '../data/recipes'
import { NEVER_ALLOWED, STRICT_EXCLUDED, highlights, isGlutenFree, isStrict, nutritionPerServing, violations } from './diet'

describe('recipe data integrity', () => {
  it('has unique slugs', () => {
    const slugs = RECIPES.map((r) => r.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
  })

  it('only references known ingredients with positive amounts', () => {
    for (const r of RECIPES) {
      for (const { id, grams } of r.ingredients) {
        expect(INGREDIENTS[id], `${r.slug}: ${id}`).toBeDefined()
        expect(grams, `${r.slug}: ${id}`).toBeGreaterThan(0)
      }
    }
  })

  it('has steps and a sensible serving count', () => {
    for (const r of RECIPES) {
      expect(r.steps.length, r.slug).toBeGreaterThanOrEqual(3)
      expect(r.servings, r.slug).toBeGreaterThan(0)
    }
  })

  it('produces plausible calories per serving', () => {
    for (const r of RECIPES) {
      const { kcal } = nutritionPerServing(r)
      expect(kcal, r.slug).toBeGreaterThan(120)
      expect(kcal, r.slug).toBeLessThan(900)
    }
  })
})

describe('diet rules', () => {
  it('no recipe contains processed or preserved ingredients', () => {
    for (const r of RECIPES) {
      expect(violations(r, NEVER_ALLOWED), r.slug).toEqual([])
    }
  })

  it('every gluten-free collection recipe passes the strict rules (no gluten, soy, iodine or iron blockers)', () => {
    const strict = RECIPES.filter((r) => r.collection === 'gluten-free')
    expect(strict.length).toBeGreaterThanOrEqual(6)
    for (const r of strict) {
      expect(violations(r, STRICT_EXCLUDED), r.slug).toEqual([])
      expect(isStrict(r), r.slug).toBe(true)
      expect(isGlutenFree(r), r.slug).toBe(true)
    }
  })

  it('the strict check really catches forbidden ingredients', () => {
    const oats = RECIPES.find((r) => r.slug === 'blueberry-overnight-oats')!
    expect(isStrict(oats)).toBe(false)
    expect(isGlutenFree(oats)).toBe(false)
    const salmon = RECIPES.find((r) => r.slug === 'salmon-broccoli-sweet-potato')!
    expect(violations(salmon, STRICT_EXCLUDED)).toContain('Broccoli')
  })

  it('highlights iodine and iron + vitamin C pairing', () => {
    const cod = RECIPES.find((r) => r.slug === 'lemon-cod-with-potatoes')!
    expect(highlights(cod).iodine).toBe(true)
    const beef = RECIPES.find((r) => r.slug === 'beef-sweet-potato-skillet')!
    expect(highlights(beef).ironWithVitC).toBe(true)
  })
})

describe('formatAmount', () => {
  it('formats pieces, grams and millilitres', () => {
    expect(formatAmount('egg', 220)).toBe('4 eggs')
    expect(formatAmount('egg', 55)).toBe('1 egg')
    expect(formatAmount('potato', 400)).toBe('400 g')
    expect(formatAmount('olive-oil', 20)).toBe('20 ml')
  })
})
