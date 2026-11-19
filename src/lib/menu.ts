import { RECIPES, getRecipe, type Meal, type Recipe } from '../data/recipes'
import { nutritionPerServing, type Nutrition } from './diet'
import { addRecipeToList, type ShoppingItem } from './shopping'

export interface MacroTargets {
  kcal: number
  protein: number
  carbs: number
  fat: number
}

export interface PlannedMeal {
  slot: Meal
  slug: string
  /** multiple of one serving */
  portion: number
  nutrition: Nutrition
}

export interface PlannedDay {
  meals: PlannedMeal[]
  totals: Nutrition
}

export const SLOTS: { slot: Meal; share: number }[] = [
  { slot: 'breakfast', share: 0.25 },
  { slot: 'lunch', share: 0.3 },
  { slot: 'dinner', share: 0.3 },
  { slot: 'snack', share: 0.15 },
]

/** Small deterministic PRNG so a menu is the same for the same seed. */
function mulberry32(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Which recipes may fill a slot. Lunch and dinner share a pool; breakfast borrows snacks if short. */
export function poolFor(slot: Meal, recipes: Recipe[]): Recipe[] {
  const by = (...meals: Meal[]) => recipes.filter((r) => meals.includes(r.meal))
  switch (slot) {
    case 'breakfast': {
      const b = by('breakfast')
      return b.length >= 3 ? b : [...b, ...by('snack')]
    }
    case 'lunch':
    case 'dinner':
      return by('lunch', 'dinner')
    default:
      return by('snack')
  }
}

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n))

export interface PlanOptions {
  /** only recipes from the strict gluten-free, soy-free collection */
  strictOnly?: boolean
  seed?: number
  days?: number
}

export function planWeek(target: MacroTargets, options: PlanOptions = {}): PlannedDay[] {
  const { strictOnly = false, seed = 1, days = 7 } = options
  const recipes = strictOnly ? RECIPES.filter((r) => r.collection === 'gluten-free') : RECIPES
  const uses = new Map<string, number>()
  const plan: PlannedDay[] = []
  let yesterday = new Set<string>()

  for (let d = 0; d < days; d++) {
    const today = new Set<string>()
    const meals: PlannedMeal[] = []

    SLOTS.forEach(({ slot, share }, s) => {
      const rand = mulberry32(seed * 1000 + d * 10 + s)
      const slotKcal = target.kcal * share
      const slotProtein = target.protein * share
      let best: { r: Recipe; portion: number; n: Nutrition; score: number } | null = null

      for (const r of poolFor(slot, recipes)) {
        const per = nutritionPerServing(r)
        const portion = clamp(Math.round((slotKcal / Math.max(per.kcal, 1)) * 4) / 4, 0.5, 2.5)
        const n: Nutrition = {
          kcal: Math.round(per.kcal * portion),
          protein: Math.round(per.protein * portion),
          carbs: Math.round(per.carbs * portion),
          fat: Math.round(per.fat * portion),
        }
        const kcalErr = Math.abs(n.kcal - slotKcal) / slotKcal
        // falling short of protein is worse than going over it
        const gap = (n.protein - slotProtein) / Math.max(slotProtein, 1)
        const proteinErr = gap < 0 ? -gap * 1.6 : gap * 0.25
        const repeat = (uses.get(r.slug) ?? 0) * 0.35 + (yesterday.has(r.slug) ? 1.2 : 0) + (today.has(r.slug) ? 3 : 0)
        const score = kcalErr * 1.0 + proteinErr * 1.4 + repeat + rand() * 0.3
        if (!best || score < best.score) best = { r, portion, n, score }
      }
      // a pool can only be empty if the recipe data is broken
      if (!best) return
      today.add(best.r.slug)
      uses.set(best.r.slug, (uses.get(best.r.slug) ?? 0) + 1)
      meals.push({ slot, slug: best.r.slug, portion: best.portion, nutrition: best.n })
    })

    plan.push({
      meals,
      totals: meals.reduce<Nutrition>(
        (a, m) => ({
          kcal: a.kcal + m.nutrition.kcal,
          protein: a.protein + m.nutrition.protein,
          carbs: a.carbs + m.nutrition.carbs,
          fat: a.fat + m.nutrition.fat,
        }),
        { kcal: 0, protein: 0, carbs: 0, fat: 0 },
      ),
    })
    yesterday = today
  }
  return plan
}

/** Add every meal of the plan to a shopping list. */
export function addWeekToList(items: ShoppingItem[], plan: PlannedDay[]): ShoppingItem[] {
  let next = items
  for (const day of plan) {
    for (const m of day.meals) {
      const recipe = getRecipe(m.slug)
      if (recipe) next = addRecipeToList(next, recipe, m.portion / recipe.servings)
    }
  }
  return next
}
