import { INGREDIENTS } from '../data/ingredients'
import { MARKERS } from '../data/markers'
import { RECIPES } from '../data/recipes'
import { MINERAL_NOTES, PLATE, RULES } from '../data/rules'
import { WORKOUTS } from '../data/workouts'
import type { Content } from './types'

/** English content is derived from the data files so it is never duplicated. */
export const contentEn: Content = {
  ingredients: Object.fromEntries(Object.values(INGREDIENTS).map((i) => [i.id, i.name])),
  pieces: Object.fromEntries(
    Object.values(INGREDIENTS)
      .filter((i) => i.piece)
      .map((i) => [i.id, { one: i.piece!.one, other: i.piece!.many }]),
  ),
  recipes: Object.fromEntries(
    RECIPES.map((r) => [r.slug, { title: r.title, summary: r.summary, steps: r.steps, tip: r.tip }]),
  ),
  plate: Object.fromEntries(
    PLATE.map((p) => [p.key, { label: p.label, share: p.share, title: p.title, text: p.text, examples: p.examples }]),
  ) as Content['plate'],
  rules: Object.fromEntries(RULES.map((r) => [r.id, { title: r.title, text: r.text }])),
  minerals: Object.fromEntries(MINERAL_NOTES.map((m) => [m.id, { heading: m.heading, text: m.text }])),
  workouts: Object.fromEntries(
    WORKOUTS.map((w) => [
      w.slug,
      {
        title: w.title,
        focus: w.focus,
        equipment: w.equipment,
        exercises: w.exercises.map((e) => ({ name: e.name, cue: e.cue })),
      },
    ]),
  ),
  levels: { Easy: 'Easy', Moderate: 'Moderate', Hard: 'Hard' },
  markers: Object.fromEntries(MARKERS.map((m) => [m.id, { name: m.name, about: m.about, low: m.low, high: m.high }])),
}
