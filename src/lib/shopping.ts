import { getIngredient } from '../data/ingredients'
import type { Recipe } from '../data/recipes'

export interface ShoppingItem {
  id: string
  name: string
  /** set for catalogue items; custom items have no amount */
  ingredientId?: string
  grams?: number
  checked: boolean
}

/** Add a recipe's ingredients (scaled) to a list, merging amounts of the same ingredient. */
export function addRecipeToList(items: ShoppingItem[], recipe: Recipe, factor = 1): ShoppingItem[] {
  const next = items.map((i) => ({ ...i }))
  for (const { id, grams } of recipe.ingredients) {
    // pantry staples that are never worth a separate trip
    if (id === 'water' || id === 'salt') continue
    const amount = grams * factor
    const existing = next.find((i) => i.ingredientId === id)
    if (existing) {
      existing.grams = (existing.grams ?? 0) + amount
      existing.checked = false
    } else {
      next.push({ id: `ing-${id}`, name: getIngredient(id).name, ingredientId: id, grams: amount, checked: false })
    }
  }
  return next
}

export function addCustomItem(items: ShoppingItem[], name: string): ShoppingItem[] {
  const clean = name.trim()
  if (!clean) return items
  if (items.some((i) => !i.ingredientId && i.name.toLowerCase() === clean.toLowerCase())) return items
  return [...items, { id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, name: clean, checked: false }]
}
