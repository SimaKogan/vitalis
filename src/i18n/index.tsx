import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { getIngredient } from '../data/ingredients'
import type { Level } from '../data/workouts'
import { contentEn } from './content.en'
import { contentHe } from './content.he'
import { contentRu } from './content.ru'
import { en, type Key } from './en'
import { he } from './he'
import { ru } from './ru'
import type { Content, Lang } from './types'

export { LANGS, type Lang } from './types'
export type { Key }

export const DICTS: Record<Lang, Record<string, string>> = { en, ru, he }
export const CONTENT: Record<Lang, Content> = { en: contentEn, ru: contentRu, he: contentHe }
export const LOCALE: Record<Lang, string> = { en: 'en-US', ru: 'ru-RU', he: 'he-IL' }
export const LANG_LABEL: Record<Lang, string> = { en: 'English', ru: 'Русский', he: 'עברית' }

type Vars = Record<string, string | number>

function fill(template: string, vars?: Vars): string {
  if (!vars) return template
  return template.replace(/\{(\w+)\}/g, (_, name: string) => (name in vars ? String(vars[name]) : `{${name}}`))
}

/** Translate a key. Falls back to English, then to the key itself. */
export function translate(lang: Lang, key: Key, vars?: Vars): string {
  return fill(DICTS[lang][key] ?? en[key] ?? key, vars)
}

/** Translate a plural key family (`base.one`, `base.few`, `base.many`, `base.other`). */
export function translatePlural(lang: Lang, base: string, n: number, vars?: Vars): string {
  const rule = new Intl.PluralRules(LOCALE[lang]).select(n)
  const dict = DICTS[lang]
  const tpl = dict[`${base}.${rule}`] ?? dict[`${base}.other`] ?? (en as Record<string, string>)[`${base}.other`] ?? base
  return fill(tpl, { n, ...vars })
}

/** "3 eggs", "250 g": localised pieces and units. */
export function formatAmountLocal(
  lang: Lang,
  ingredientId: string,
  grams: number,
  piece: { grams: number } | undefined,
  unit: 'g' | 'ml' | undefined,
): string {
  const locale = LOCALE[lang]
  if (piece) {
    const n = Math.round((grams / piece.grams) * 2) / 2
    const words = CONTENT[lang].pieces[ingredientId] ?? contentEn.pieces[ingredientId]
    const rule = new Intl.PluralRules(locale).select(n)
    const word = words[rule] ?? words.other
    return `${new Intl.NumberFormat(locale).format(n)} ${word}`
  }
  const u = translate(lang, unit === 'ml' ? 'unit.ml' : 'unit.g')
  return `${new Intl.NumberFormat(locale).format(Math.round(grams))} ${u}`
}

export function detectLang(): Lang {
  try {
    const stored = localStorage.getItem('vitalis.lang')
    if (stored === 'en' || stored === 'ru' || stored === 'he') return stored
  } catch {
    /* ignore */
  }
  const nav = (typeof navigator !== 'undefined' ? navigator.language : 'en').toLowerCase()
  if (nav.startsWith('ru')) return 'ru'
  if (nav.startsWith('he') || nav.startsWith('iw')) return 'he'
  return 'en'
}

interface I18n {
  lang: Lang
  dir: 'ltr' | 'rtl'
  setLang: (l: Lang) => void
  t: (key: Key, vars?: Vars) => string
  /** plural-aware: tp('recipes.count', 3) */
  tp: (base: 'recipes.count' | 'detail.servings', n: number, vars?: Vars) => string
  /** locale-aware number */
  num: (n: number, digits?: number) => string
  content: Content
  /** localised ingredient helpers */
  ing: (id: string) => string
  /** "4 eggs" / "250 g" in the current language */
  amount: (id: string, grams: number) => string
  level: (l: Level) => string
}

const Ctx = createContext<I18n | null>(null)

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(detectLang)
  const dir = lang === 'he' ? 'rtl' : 'ltr'

  useEffect(() => {
    document.documentElement.lang = lang
    document.documentElement.dir = dir
    document.title = translate(lang, 'page.title')
    try {
      localStorage.setItem('vitalis.lang', lang)
    } catch {
      /* ignore */
    }
  }, [lang, dir])

  const value = useMemo<I18n>(() => {
    const locale = LOCALE[lang]
    const content = CONTENT[lang]
    return {
      lang,
      dir,
      setLang: setLangState,
      t: (key, vars) => translate(lang, key, vars),
      tp: (base, n, vars) => translatePlural(lang, base, n, vars),
      num: (n, digits = 0) =>
        new Intl.NumberFormat(locale, { maximumFractionDigits: digits, minimumFractionDigits: 0 }).format(n),
      content,
      ing: (id) => content.ingredients[id] ?? contentEn.ingredients[id] ?? id,
      amount: (id, grams) => {
        const ing = getIngredient(id)
        return formatAmountLocal(lang, id, grams, ing.piece, ing.unit)
      },
      level: (l) => content.levels[l] ?? l,
    }
  }, [lang, dir])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useI18n(): I18n {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useI18n must be used inside <I18nProvider>')
  return ctx
}

/** Fallback-aware lookups for localised data. */
export function recipeText(content: Content, slug: string) {
  return content.recipes[slug] ?? contentEn.recipes[slug]
}
export function workoutText(content: Content, slug: string) {
  return content.workouts[slug] ?? contentEn.workouts[slug]
}
export function markerText(content: Content, id: string) {
  return content.markers[id] ?? contentEn.markers[id]
}
