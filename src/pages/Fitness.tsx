import { useMemo, useState } from 'react'
import { IntervalTimer } from '../components/IntervalTimer'
import { WORKOUTS } from '../data/workouts'
import { useI18n, workoutText } from '../i18n'
import { buildIntervals, buildSteps, formatClock, totalSeconds, workoutMinutes } from '../lib/workout'

const CUSTOM = 'custom'

function clamp(n: number, min: number, max: number) {
  return Number.isFinite(n) ? Math.min(max, Math.max(min, Math.round(n))) : min
}

export function Fitness() {
  const { t, content, level } = useI18n()
  const [selected, setSelected] = useState<string>(WORKOUTS[0].slug)
  const [work, setWork] = useState(30)
  const [rest, setRest] = useState(15)
  const [rounds, setRounds] = useState(6)

  const workout = WORKOUTS.find((w) => w.slug === selected)
  const text = workout ? workoutText(content, workout.slug) : undefined

  // memoised: the timer resets whenever this array changes
  const steps = useMemo(
    () => (workout ? buildSteps(workout, text) : buildIntervals(work, rest, rounds)),
    [workout, text, work, rest, rounds],
  )

  return (
    <div className="wrap section">
      <h1 className="page-title">{t('fit.title')}</h1>
      <p className="page-lead">{t('fit.lead')}</p>

      <div className="fitness">
        <div className="fitness-list">
          <ul className="workouts" aria-label={t('fit.list')}>
            {WORKOUTS.map((w) => {
              const wt = workoutText(content, w.slug)
              return (
                <li key={w.slug}>
                  <button type="button" className={`workout${selected === w.slug ? ' on' : ''}`} aria-pressed={selected === w.slug} onClick={() => setSelected(w.slug)} style={{ ['--h' as string]: w.hue }}>
                    <span className="w-emoji" aria-hidden="true">{w.emoji}</span>
                    <span className="w-main">
                      <strong>{wt.title}</strong>
                      <span>{t('fit.meta', { level: level(w.level), min: workoutMinutes(w), equipment: wt.equipment })}</span>
                    </span>
                  </button>
                </li>
              )
            })}
            <li>
              <button type="button" className={`workout${selected === CUSTOM ? ' on' : ''}`} aria-pressed={selected === CUSTOM} onClick={() => setSelected(CUSTOM)} style={{ ['--h' as string]: 190 }}>
                <span className="w-emoji" aria-hidden="true">⏱️</span>
                <span className="w-main">
                  <strong>{t('fit.custom')}</strong>
                  <span>{t('fit.customSub')}</span>
                </span>
              </button>
            </li>
          </ul>

          {workout && text ? (
            <div className="workout-detail">
              <h2>{text.title}</h2>
              <p>
                {text.focus}. {workout.rounds > 1 ? t('fit.roundsCount', { n: workout.rounds }) : ''}
              </p>
              <ol>
                {text.exercises.map((e, i) => (
                  <li key={i}>
                    <strong>{e.name}</strong> <span className="dim">{formatClock(workout.exercises[i].seconds)}</span>
                    <br />
                    <span className="dim">{e.cue}</span>
                  </li>
                ))}
              </ol>
            </div>
          ) : (
            <form className="custom" onSubmit={(e) => e.preventDefault()}>
              <h2>{t('fit.custom')}</h2>
              <label>
                {t('fit.work')}
                <input type="number" min={5} max={600} value={work} onChange={(e) => setWork(clamp(e.target.valueAsNumber, 5, 600))} />
              </label>
              <label>
                {t('fit.rest')}
                <input type="number" min={0} max={600} value={rest} onChange={(e) => setRest(clamp(e.target.valueAsNumber, 0, 600))} />
              </label>
              <label>
                {t('fit.rounds')}
                <input type="number" min={1} max={50} value={rounds} onChange={(e) => setRounds(clamp(e.target.valueAsNumber, 1, 50))} />
              </label>
              <p className="dim">{t('fit.total', { time: formatClock(totalSeconds(steps)) })}</p>
            </form>
          )}
        </div>

        <div className="fitness-timer">
          <IntervalTimer title={text ? text.title : t('fit.custom')} steps={steps} />
        </div>
      </div>
    </div>
  )
}
