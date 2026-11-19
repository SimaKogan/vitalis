import type { Level } from '../data/workouts'

export type Lang = 'en' | 'ru' | 'he'
export const LANGS: Lang[] = ['en', 'ru', 'he']

export interface RecipeText {
  title: string
  summary: string
  steps: string[]
  tip?: string
}

export interface WorkoutText {
  title: string
  focus: string
  equipment: string
  /** same order as the exercises in src/data/workouts.ts */
  exercises: { name: string; cue: string }[]
}

/** Words for counting pieces, keyed by Intl plural category. `other` is required. */
export type PieceWords = Partial<Record<Intl.LDMLPluralRule, string>> & { other: string }

export interface MarkerText {
  name: string
  about: string
  low: string
  high: string
}

/** Everything in src/data/* that needs translating. English is built from the data files themselves. */
export interface Content {
  ingredients: Record<string, string>
  pieces: Record<string, PieceWords>
  recipes: Record<string, RecipeText>
  plate: Record<'veg' | 'protein' | 'carbs', { label: string; share: string; title: string; text: string; examples: string }>
  rules: Record<string, { title: string; text: string }>
  minerals: Record<string, { heading: string; text: string }>
  workouts: Record<string, WorkoutText>
  levels: Record<Level, string>
  markers: Record<string, MarkerText>
}
