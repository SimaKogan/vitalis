import { useCallback, useEffect, useRef, useState } from 'react'
import { useI18n } from '../i18n'
import { formatClock, totalSeconds, type TimerStep } from '../lib/workout'

interface Props {
  title: string
  steps: TimerStep[]
}

const RADIUS = 92
const CIRC = 2 * Math.PI * RADIUS

export function IntervalTimer({ title, steps }: Props) {
  const { t } = useI18n()
  const [index, setIndex] = useState(0)
  const [remaining, setRemaining] = useState(steps[0]?.seconds ?? 0)
  const [running, setRunning] = useState(false)
  const [done, setDone] = useState(false)
  const [sound, setSound] = useState(true)
  const audio = useRef<AudioContext | null>(null)

  // new workout selected: start over
  useEffect(() => {
    setIndex(0)
    setRemaining(steps[0]?.seconds ?? 0)
    setRunning(false)
    setDone(false)
  }, [steps])

  const beep = useCallback(
    (freq: number, ms: number) => {
      if (!sound) return
      try {
        audio.current ??= new AudioContext()
        const ctx = audio.current
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.frequency.value = freq
        gain.gain.value = 0.08
        osc.connect(gain).connect(ctx.destination)
        osc.start()
        osc.stop(ctx.currentTime + ms / 1000)
      } catch {
        /* audio not available */
      }
    },
    [sound],
  )

  // tick once per second while running
  useEffect(() => {
    if (!running) return
    const id = window.setInterval(() => setRemaining((r) => r - 1), 1000)
    return () => window.clearInterval(id)
  }, [running])

  // move on when a step reaches zero
  useEffect(() => {
    if (!running || remaining > 0) return
    if (index + 1 >= steps.length) {
      setRunning(false)
      setDone(true)
      beep(880, 600)
      return
    }
    const next = steps[index + 1]
    setIndex(index + 1)
    setRemaining(next.seconds)
    beep(next.kind === 'work' ? 880 : 520, 250)
  }, [remaining, running, index, steps, beep])

  // short countdown beeps
  useEffect(() => {
    if (running && remaining > 0 && remaining <= 3) beep(660, 120)
  }, [remaining, running, beep])

  const step = steps[index]
  const elapsed = totalSeconds(steps.slice(0, index)) + (step ? step.seconds - remaining : 0)
  const total = totalSeconds(steps)
  const next = steps[index + 1]
  const stepProgress = step ? 1 - remaining / step.seconds : 0

  const reset = () => {
    setRunning(false)
    setDone(false)
    setIndex(0)
    setRemaining(steps[0]?.seconds ?? 0)
  }

  const skip = (dir: 1 | -1) => {
    const target = Math.min(steps.length - 1, Math.max(0, index + dir))
    setIndex(target)
    setRemaining(steps[target].seconds)
    setDone(false)
  }

  if (!step) return null
  const label = step.name ?? (step.kind === 'rest' ? t('timer.rest') : t('timer.work'))
  const nextLabel = next ? (next.name ?? (next.kind === 'rest' ? t('timer.rest') : t('timer.work'))) : ''
  const roundText = step.round ? t('timer.round', { i: step.round.i, n: step.round.n }) : ''

  return (
    <section className={`timer ${step.kind}${done ? ' finished' : ''}`} aria-label={t('timer.aria', { title })}>
      <div className="timer-head">
        <h3>{title}</h3>
        <button type="button" className="text-btn" onClick={() => setSound((s) => !s)} aria-pressed={sound}>
          {sound ? t('timer.soundOn') : t('timer.soundOff')}
        </button>
      </div>

      <div className="timer-dial">
        <svg viewBox="0 0 220 220" aria-hidden="true">
          <circle cx="110" cy="110" r={RADIUS} className="dial-track" />
          <circle
            cx="110"
            cy="110"
            r={RADIUS}
            className="dial-bar"
            strokeDasharray={CIRC}
            strokeDashoffset={CIRC * (1 - (done ? 1 : stepProgress))}
            transform="rotate(-90 110 110)"
          />
        </svg>
        <div className="dial-text">
          <span className="dial-time">{done ? t('timer.done') : formatClock(remaining)}</span>
          <span className="dial-kind">{done ? t('timer.great') : step.kind === 'work' ? t('timer.go') : t('timer.rest')}</span>
        </div>
      </div>

      <div className="timer-now" aria-live="polite">
        <strong>{done ? t('timer.complete') : label}</strong>
        {!done && step.cue && <span>{step.cue}</span>}
        {!done && next && <em>{t('timer.next', { name: nextLabel })}</em>}
      </div>

      <div className="timer-bar" role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={Math.min(elapsed, total)} aria-label={t('timer.progress')}>
        <span style={{ width: `${Math.min(100, (elapsed / total) * 100)}%` }} />
      </div>
      <p className="timer-foot">
        {roundText ? `${roundText}, ` : ''}{t('timer.foot', { i: index + 1, n: steps.length, left: formatClock(Math.max(0, total - elapsed)) })}
      </p>

      <div className="timer-controls">
        <button type="button" className="btn ghost" onClick={() => skip(-1)} disabled={index === 0}>
          {t('timer.back')}
        </button>
        {done ? (
          <button type="button" className="btn primary" onClick={reset}>
            {t('timer.restart')}
          </button>
        ) : (
          <button type="button" className="btn primary" onClick={() => setRunning((r) => !r)}>
            {running ? t('timer.pause') : index === 0 && remaining === step.seconds ? t('timer.start') : t('timer.resume')}
          </button>
        )}
        <button type="button" className="btn ghost" onClick={() => skip(1)} disabled={index >= steps.length - 1}>
          {t('timer.skip')}
        </button>
        <button type="button" className="btn ghost" onClick={reset}>
          {t('timer.reset')}
        </button>
      </div>
    </section>
  )
}
