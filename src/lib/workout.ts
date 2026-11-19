import type { Workout } from '../data/workouts'
import type { WorkoutText } from '../i18n/types'

export interface TimerStep {
  /** exercise name; missing for rest and for plain interval "work" steps (the UI supplies the word) */
  name?: string
  seconds: number
  kind: 'work' | 'rest'
  cue?: string
  round?: { i: number; n: number }
}

/** Expand a workout into a flat list of timer steps (work, rest, work, ...). */
export function buildSteps(workout: Workout, text?: WorkoutText): TimerStep[] {
  const steps: TimerStep[] = []
  for (let r = 1; r <= workout.rounds; r++) {
    const round = workout.rounds > 1 ? { i: r, n: workout.rounds } : undefined
    workout.exercises.forEach((ex, i) => {
      const local = text?.exercises[i]
      steps.push({ name: local?.name ?? ex.name, seconds: ex.seconds, kind: 'work', cue: local?.cue ?? ex.cue, round })
      const isLast = r === workout.rounds && i === workout.exercises.length - 1
      const rest = ex.rest ?? workout.restSeconds
      if (!isLast && rest > 0) steps.push({ seconds: rest, kind: 'rest', round })
    })
  }
  return steps
}

/** Simple interval workout: `rounds` × (work + rest). */
export function buildIntervals(work: number, rest: number, rounds: number): TimerStep[] {
  const steps: TimerStep[] = []
  for (let r = 1; r <= rounds; r++) {
    steps.push({ seconds: work, kind: 'work', round: { i: r, n: rounds } })
    if (r < rounds && rest > 0) steps.push({ seconds: rest, kind: 'rest', round: { i: r, n: rounds } })
  }
  return steps
}

export function totalSeconds(steps: TimerStep[]): number {
  return steps.reduce((sum, s) => sum + s.seconds, 0)
}

export function formatClock(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.max(0, Math.floor(seconds % 60))
  return `${m}:${String(s).padStart(2, '0')}`
}

export function workoutMinutes(workout: Workout): number {
  return Math.max(1, Math.round(totalSeconds(buildSteps(workout)) / 60))
}
