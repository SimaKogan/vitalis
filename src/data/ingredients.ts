/**
 * Ingredient catalogue.
 *
 * Nutrition is per 100 g and approximate (rounded values in line with common
 * food-composition tables). Flags describe why an ingredient may be unwelcome
 * in a given collection; the strict "gluten-free" collection is validated
 * against them in `src/lib/diet.test.ts`.
 */

export type Flag =
  | 'gluten' // wheat, barley, rye, and oats (cross-contamination)
  | 'soy' // soy and soy derivatives
  | 'goitrogen' // cruciferous vegetables, millet: may interfere with iodine use
  | 'phytate' // legumes, nuts, seeds, whole grains: may lower iron absorption
  | 'oxalate' // spinach, beet, chard: bind iron and calcium
  | 'tannin' // tea, coffee, cocoa: lower iron absorption when taken with meals
  | 'processed' // refined, preserved or with additives

export type Category = 'produce' | 'protein' | 'grain' | 'dairy' | 'pantry'

export interface Ingredient {
  id: string
  name: string
  category: Category
  /** per 100 g */
  kcal: number
  protein: number
  carbs: number
  fat: number
  flags?: Flag[]
  /** good source of iodine */
  iodine?: boolean
  /** good source of iron (heme or otherwise easily absorbed) */
  iron?: boolean
  /** rich in vitamin C, which helps iron absorption */
  vitC?: boolean
  /** shown as a count instead of grams, e.g. 3 eggs */
  piece?: { grams: number; one: string; many: string }
  /** liquids are shown in ml */
  unit?: 'g' | 'ml'
}

const list: Ingredient[] = [
  // proteins
  { id: 'egg', name: 'Egg', category: 'protein', kcal: 143, protein: 12.6, carbs: 0.7, fat: 9.5, iodine: true, piece: { grams: 55, one: 'egg', many: 'eggs' } },
  { id: 'salmon', name: 'Salmon fillet', category: 'protein', kcal: 208, protein: 20, carbs: 0, fat: 13, iodine: true },
  { id: 'cod', name: 'Cod fillet', category: 'protein', kcal: 82, protein: 18, carbs: 0, fat: 0.7, iodine: true },
  { id: 'shrimp', name: 'Shrimp', category: 'protein', kcal: 85, protein: 20, carbs: 0, fat: 0.5, iodine: true, iron: true },
  { id: 'chicken-breast', name: 'Chicken breast', category: 'protein', kcal: 120, protein: 22.5, carbs: 0, fat: 2.6 },
  { id: 'chicken-thigh', name: 'Chicken thigh, skinless', category: 'protein', kcal: 121, protein: 19.7, carbs: 0, fat: 4.1, iron: true },
  { id: 'beef-mince', name: 'Lean beef mince', category: 'protein', kcal: 137, protein: 21, carbs: 0, fat: 5, iron: true },
  { id: 'turkey-mince', name: 'Turkey mince', category: 'protein', kcal: 148, protein: 19, carbs: 0, fat: 8, iron: true },
  { id: 'lentils', name: 'Red lentils, dry', category: 'protein', kcal: 358, protein: 24, carbs: 60, fat: 2, flags: ['phytate'], iron: true },
  { id: 'chickpeas', name: 'Chickpeas, dry', category: 'protein', kcal: 378, protein: 20, carbs: 63, fat: 6, flags: ['phytate'] },

  // grains and starches
  { id: 'rice', name: 'White rice, dry', category: 'grain', kcal: 365, protein: 7, carbs: 80, fat: 0.7 },
  { id: 'potato', name: 'Potato', category: 'grain', kcal: 77, protein: 2, carbs: 17, fat: 0.1 },
  { id: 'sweet-potato', name: 'Sweet potato', category: 'grain', kcal: 86, protein: 1.6, carbs: 20, fat: 0.1 },
  { id: 'oats', name: 'Rolled oats', category: 'grain', kcal: 389, protein: 17, carbs: 66, fat: 7, flags: ['gluten', 'phytate'] },
  { id: 'bulgur', name: 'Bulgur, dry', category: 'grain', kcal: 342, protein: 12, carbs: 76, fat: 1.3, flags: ['gluten', 'phytate'] },
  { id: 'quinoa', name: 'Quinoa, dry', category: 'grain', kcal: 368, protein: 14, carbs: 64, fat: 6, flags: ['phytate'] },

  // vegetables
  { id: 'tomato', name: 'Tomato', category: 'produce', kcal: 18, protein: 0.9, carbs: 3.9, fat: 0.2, vitC: true },
  { id: 'onion', name: 'Onion', category: 'produce', kcal: 40, protein: 1.1, carbs: 9.3, fat: 0.1 },
  { id: 'red-onion', name: 'Red onion', category: 'produce', kcal: 40, protein: 1.1, carbs: 9.3, fat: 0.1 },
  { id: 'garlic', name: 'Garlic', category: 'produce', kcal: 149, protein: 6.4, carbs: 33, fat: 0.5, piece: { grams: 4, one: 'clove', many: 'cloves' } },
  { id: 'bell-pepper', name: 'Red bell pepper', category: 'produce', kcal: 31, protein: 1, carbs: 6, fat: 0.3, vitC: true },
  { id: 'cucumber', name: 'Cucumber', category: 'produce', kcal: 15, protein: 0.7, carbs: 3.6, fat: 0.1 },
  { id: 'zucchini', name: 'Zucchini', category: 'produce', kcal: 17, protein: 1.2, carbs: 3.1, fat: 0.3 },
  { id: 'carrot', name: 'Carrot', category: 'produce', kcal: 41, protein: 0.9, carbs: 10, fat: 0.2 },
  { id: 'pumpkin', name: 'Pumpkin', category: 'produce', kcal: 26, protein: 1, carbs: 6.5, fat: 0.1 },
  { id: 'eggplant', name: 'Eggplant', category: 'produce', kcal: 25, protein: 1, carbs: 6, fat: 0.2 },
  { id: 'green-beans', name: 'Green beans', category: 'produce', kcal: 31, protein: 1.8, carbs: 7, fat: 0.2 },
  { id: 'mushrooms', name: 'Mushrooms', category: 'produce', kcal: 22, protein: 3.1, carbs: 3.3, fat: 0.3 },
  { id: 'lettuce', name: 'Romaine lettuce', category: 'produce', kcal: 17, protein: 1.2, carbs: 3.3, fat: 0.3 },
  { id: 'avocado', name: 'Avocado', category: 'produce', kcal: 160, protein: 2, carbs: 9, fat: 15, piece: { grams: 150, one: 'avocado', many: 'avocados' } },
  { id: 'broccoli', name: 'Broccoli', category: 'produce', kcal: 34, protein: 2.8, carbs: 7, fat: 0.4, flags: ['goitrogen'], vitC: true },
  { id: 'kale', name: 'Kale', category: 'produce', kcal: 49, protein: 4.3, carbs: 9, fat: 0.9, flags: ['goitrogen'], vitC: true },
  { id: 'spinach', name: 'Spinach', category: 'produce', kcal: 23, protein: 2.9, carbs: 3.6, fat: 0.4, flags: ['oxalate'] },
  { id: 'ginger', name: 'Fresh ginger', category: 'produce', kcal: 80, protein: 1.8, carbs: 18, fat: 0.8 },
  { id: 'parsley', name: 'Fresh parsley', category: 'produce', kcal: 36, protein: 3, carbs: 6.3, fat: 0.8, vitC: true },
  { id: 'herbs', name: 'Fresh dill or basil', category: 'produce', kcal: 25, protein: 3, carbs: 4, fat: 0.6 },
  { id: 'lemon', name: 'Lemon juice', category: 'produce', kcal: 22, protein: 0.4, carbs: 6.9, fat: 0.2, vitC: true, unit: 'ml' },

  // fruit
  { id: 'banana', name: 'Banana', category: 'produce', kcal: 89, protein: 1.1, carbs: 23, fat: 0.3, piece: { grams: 110, one: 'banana', many: 'bananas' } },
  { id: 'blueberries', name: 'Blueberries', category: 'produce', kcal: 57, protein: 0.7, carbs: 14, fat: 0.3 },
  { id: 'strawberries', name: 'Strawberries', category: 'produce', kcal: 32, protein: 0.7, carbs: 8, fat: 0.3, vitC: true },
  { id: 'kiwi', name: 'Kiwi', category: 'produce', kcal: 61, protein: 1.1, carbs: 15, fat: 0.5, vitC: true, piece: { grams: 75, one: 'kiwi', many: 'kiwis' } },
  { id: 'orange', name: 'Orange', category: 'produce', kcal: 47, protein: 0.9, carbs: 12, fat: 0.1, vitC: true, piece: { grams: 150, one: 'orange', many: 'oranges' } },
  { id: 'apple', name: 'Apple', category: 'produce', kcal: 52, protein: 0.3, carbs: 14, fat: 0.2, piece: { grams: 180, one: 'apple', many: 'apples' } },

  // dairy
  { id: 'yogurt', name: 'Plain yogurt', category: 'dairy', kcal: 59, protein: 10, carbs: 3.6, fat: 0.4 },
  { id: 'ghee', name: 'Ghee or butter', category: 'dairy', kcal: 800, protein: 0.5, carbs: 0, fat: 90 },

  // pantry
  { id: 'olive-oil', name: 'Extra virgin olive oil', category: 'pantry', kcal: 884, protein: 0, carbs: 0, fat: 100, unit: 'ml' },
  { id: 'honey', name: 'Raw honey', category: 'pantry', kcal: 304, protein: 0.3, carbs: 82, fat: 0 },
  { id: 'walnuts', name: 'Walnuts', category: 'pantry', kcal: 654, protein: 15, carbs: 14, fat: 65, flags: ['phytate'] },
  { id: 'chia', name: 'Chia seeds', category: 'pantry', kcal: 486, protein: 17, carbs: 42, fat: 31, flags: ['phytate'] },
  { id: 'paprika', name: 'Sweet paprika', category: 'pantry', kcal: 282, protein: 14, carbs: 54, fat: 13 },
  { id: 'cinnamon', name: 'Ground cinnamon', category: 'pantry', kcal: 247, protein: 4, carbs: 81, fat: 1.2 },
  { id: 'cumin', name: 'Ground cumin', category: 'pantry', kcal: 375, protein: 18, carbs: 44, fat: 22 },
  { id: 'salt', name: 'Sea salt', category: 'pantry', kcal: 0, protein: 0, carbs: 0, fat: 0 },
  { id: 'pepper', name: 'Black pepper', category: 'pantry', kcal: 251, protein: 10, carbs: 64, fat: 3.3 },
  { id: 'water', name: 'Water', category: 'pantry', kcal: 0, protein: 0, carbs: 0, fat: 0, unit: 'ml' },
]

export const INGREDIENTS: Record<string, Ingredient> = Object.fromEntries(
  list.map((i) => [i.id, i]),
)

export function getIngredient(id: string): Ingredient {
  const found = INGREDIENTS[id]
  if (!found) throw new Error(`Unknown ingredient: ${id}`)
  return found
}

/** Human-readable amount, e.g. "3 eggs" or "250 g". */
export function formatAmount(id: string, grams: number): string {
  const ing = getIngredient(id)
  if (ing.piece) {
    const n = Math.round((grams / ing.piece.grams) * 2) / 2
    return `${n} ${n === 1 ? ing.piece.one : ing.piece.many}`
  }
  return `${Math.round(grams)} ${ing.unit ?? 'g'}`
}
