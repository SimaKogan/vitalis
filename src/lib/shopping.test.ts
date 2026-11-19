import { describe, expect, it } from 'vitest'
import { RECIPES } from '../data/recipes'
import { addCustomItem, addRecipeToList } from './shopping'

describe('shopping list', () => {
  const shakshuka = RECIPES.find((r) => r.slug === 'garden-shakshuka')!

  it('adds recipe ingredients and skips salt and water', () => {
    const list = addRecipeToList([], shakshuka)
    expect(list.find((i) => i.ingredientId === 'egg')?.grams).toBe(220)
    expect(list.some((i) => i.ingredientId === 'salt')).toBe(false)
  })

  it('merges amounts and unchecks when the same recipe is added twice', () => {
    let list = addRecipeToList([], shakshuka)
    list = list.map((i) => ({ ...i, checked: true }))
    list = addRecipeToList(list, shakshuka, 2)
    const egg = list.find((i) => i.ingredientId === 'egg')!
    expect(egg.grams).toBe(220 + 440)
    expect(egg.checked).toBe(false)
  })

  it('ignores empty and duplicate custom items', () => {
    let list = addCustomItem([], '  ')
    expect(list).toHaveLength(0)
    list = addCustomItem(list, 'Lemons')
    list = addCustomItem(list, 'lemons')
    expect(list).toHaveLength(1)
  })
})
