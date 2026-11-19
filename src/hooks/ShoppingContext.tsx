import { createContext, useContext, useMemo, type ReactNode } from 'react'
import type { Recipe } from '../data/recipes'
import { addCustomItem, addRecipeToList, type ShoppingItem } from '../lib/shopping'
import { useLocalStorage } from './useLocalStorage'

interface ShoppingState {
  items: ShoppingItem[]
  remaining: number
  addRecipe: (recipe: Recipe, factor?: number) => void
  addCustom: (name: string) => void
  toggle: (id: string) => void
  remove: (id: string) => void
  clearChecked: () => void
  clearAll: () => void
  /** replace the whole list, e.g. after adding a week of meals */
  replaceAll: (items: ShoppingItem[]) => void
}

const Ctx = createContext<ShoppingState | null>(null)

export function ShoppingProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useLocalStorage<ShoppingItem[]>('vitalis.shopping', [])

  const value = useMemo<ShoppingState>(
    () => ({
      items,
      remaining: items.filter((i) => !i.checked).length,
      addRecipe: (recipe, factor = 1) => setItems((prev) => addRecipeToList(prev, recipe, factor)),
      addCustom: (name) => setItems((prev) => addCustomItem(prev, name)),
      toggle: (id) => setItems((prev) => prev.map((i) => (i.id === id ? { ...i, checked: !i.checked } : i))),
      remove: (id) => setItems((prev) => prev.filter((i) => i.id !== id)),
      clearChecked: () => setItems((prev) => prev.filter((i) => !i.checked)),
      clearAll: () => setItems([]),
      replaceAll: (next) => setItems(next),
    }),
    [items, setItems],
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useShopping(): ShoppingState {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useShopping must be used inside <ShoppingProvider>')
  return ctx
}
