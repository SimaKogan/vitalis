import { getIngredient, type Flag } from '../data/ingredients'
import type { Recipe } from '../data/recipes'

export interface Nutrition {
  kcal: number
  protein: number
  carbs: number
  fat: number
}

/** Flags that must not appear in the strict gluten-free, mineral-friendly collection. */
export const STRICT_EXCLUDED: Flag[] = ['gluten', 'soy', 'goitrogen', 'phytate', 'oxalate', 'tannin', 'processed']

/** Flags that must not appear in any recipe. */
export const NEVER_ALLOWED: Flag[] = ['processed']

export function recipeFlags(recipe: Recipe): Set<Flag> {
  const flags = new Set<Flag>()
  for (const { id } of recipe.ingredients) {
    for (const f of getIngredient(id).flags ?? []) flags.add(f)
  }
  return flags
}

/** Ingredient names in a recipe that carry any of the given flags. */
export function violations(recipe: Recipe, excluded: Flag[]): string[] {
  return recipe.ingredients
    .map(({ id }) => getIngredient(id))
    .filter((ing) => ing.flags?.some((f) => excluded.includes(f)))
    .map((ing) => ing.name)
}

export function isGlutenFree(recipe: Recipe): boolean {
  return !recipeFlags(recipe).has('gluten')
}

export function isStrict(recipe: Recipe): boolean {
  return violations(recipe, STRICT_EXCLUDED).length === 0
}

export function nutritionPerServing(recipe: Recipe): Nutrition {
  const total = recipe.ingredients.reduce<Nutrition>(
    (acc, { id, grams }) => {
      const ing = getIngredient(id)
      const k = grams / 100
      return {
        kcal: acc.kcal + ing.kcal * k,
        protein: acc.protein + ing.protein * k,
        carbs: acc.carbs + ing.carbs * k,
        fat: acc.fat + ing.fat * k,
      }
    },
    { kcal: 0, protein: 0, carbs: 0, fat: 0 },
  )
  const n = recipe.servings
  return {
    kcal: Math.round(total.kcal / n),
    protein: Math.round(total.protein / n),
    carbs: Math.round(total.carbs / n),
    fat: Math.round(total.fat / n),
  }
}

export interface Highlights {
  iodine: boolean
  iron: boolean
  /** iron-rich food and a vitamin C source in the same recipe */
  ironWithVitC: boolean
}

export function highlights(recipe: Recipe): Highlights {
  const ings = recipe.ingredients.map(({ id }) => getIngredient(id))
  const iodine = ings.some((i) => i.iodine)
  const iron = ings.some((i) => i.iron)
  const vitC = ings.some((i) => i.vitC)
  return { iodine, iron, ironWithVitC: iron && vitC }
}
