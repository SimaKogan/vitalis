import { describe, expect, it } from 'vitest'
import { WORKOUTS } from '../data/workouts'
import { buildIntervals, buildSteps, formatClock, totalSeconds, workoutMinutes } from './workout'

describe('workout timer steps', () => {
  it('interleaves rest and omits the final rest', () => {
    const w = WORKOUTS.find((x) => x.slug === 'hiit-express')!
    const steps = buildSteps(w)
    const work = w.exercises.length * w.rounds
    expect(steps.filter((s) => s.kind === 'work')).toHaveLength(work)
    expect(steps.filter((s) => s.kind === 'rest')).toHaveLength(work - 1)
    expect(steps[steps.length - 1].kind).toBe('work')
  })

  it('skips rest entirely when rest is 0', () => {
    const w = WORKOUTS.find((x) => x.slug === 'brisk-walk-intervals')!
    expect(buildSteps(w).every((s) => s.kind === 'work')).toBe(true)
    expect(workoutMinutes(w)).toBe(23)
  })

  it('builds custom intervals', () => {
    const steps = buildIntervals(30, 10, 4)
    expect(steps).toHaveLength(7)
    expect(totalSeconds(steps)).toBe(4 * 30 + 3 * 10)
  })

  it('every workout has a reasonable length', () => {
    for (const w of WORKOUTS) {
      const m = workoutMinutes(w)
      expect(m, w.slug).toBeGreaterThanOrEqual(5)
      expect(m, w.slug).toBeLessThanOrEqual(40)
    }
  })

  it('formats the clock', () => {
    expect(formatClock(0)).toBe('0:00')
    expect(formatClock(65)).toBe('1:05')
  })
})
