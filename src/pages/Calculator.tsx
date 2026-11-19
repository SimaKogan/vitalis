import { Link } from 'react-router-dom'
import { useProfile } from '../hooks/useProfile'
import { useI18n, type Key } from '../i18n'
import { ACTIVITY_FACTOR, analyseBody, isValid, targets, type Activity, type Goal, type Profile, type Sex } from '../lib/calc'

interface NumFieldProps {
  label: string
  value: number | null
  onChange: (v: number | null) => void
  min: number
  max: number
  step?: number
}

function NumField({ label, value, onChange, min, max, step = 1 }: NumFieldProps) {
  return (
    <label className="field">
      <span>{label}</span>
      <input
        type="number"
        inputMode="decimal"
        min={min}
        max={max}
        step={step}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value === '' ? null : e.target.valueAsNumber)}
      />
    </label>
  )
}

const ACTIVITIES = Object.keys(ACTIVITY_FACTOR) as Activity[]
const GOALS: Goal[] = ['lose', 'maintain', 'gain']

export function Calculator() {
  const { t, num } = useI18n()
  const [profile, setProfile] = useProfile()
  const set = <K extends keyof Profile>(key: K, value: Profile[K]) => setProfile({ ...profile, [key]: value })

  const valid = isValid(profile)
  const tg = valid ? targets(profile) : null
  const body = valid ? analyseBody(profile) : null

  // share of calories from each macro, for the stacked bar
  const kcalShare = tg
    ? [
        { key: 'macro.protein' as Key, grams: tg.protein, pct: Math.round(((tg.protein * 4) / tg.kcal) * 100), cls: 'm-protein' },
        { key: 'macro.carbs' as Key, grams: tg.carbs, pct: Math.round(((tg.carbs * 4) / tg.kcal) * 100), cls: 'm-carbs' },
        { key: 'macro.fat' as Key, grams: tg.fat, pct: Math.round(((tg.fat * 9) / tg.kcal) * 100), cls: 'm-fat' },
      ]
    : []

  return (
    <div className="wrap section">
      <h1 className="page-title">{t('calc.title')}</h1>
      <p className="page-lead">{t('calc.lead')}</p>

      <div className="calc">
        <form className="panel" onSubmit={(e) => e.preventDefault()}>
          <h2>{t('calc.you')}</h2>

          <fieldset className="seg-group">
            <legend>{t('calc.sex')}</legend>
            {(['female', 'male'] as Sex[]).map((s) => (
              <label key={s} className={`seg-opt${profile.sex === s ? ' on' : ''}`}>
                <input type="radio" name="sex" value={s} checked={profile.sex === s} onChange={() => set('sex', s)} />
                {t(`calc.${s}`)}
              </label>
            ))}
          </fieldset>

          <div className="field-row">
            <NumField label={t('calc.age')} value={profile.age} onChange={(v) => set('age', v)} min={14} max={90} />
            <NumField label={t('calc.height')} value={profile.heightCm} onChange={(v) => set('heightCm', v)} min={120} max={230} />
            <NumField label={t('calc.weight')} value={profile.weightKg} onChange={(v) => set('weightKg', v)} min={30} max={300} step={0.1} />
          </div>

          <label className="field">
            <span>{t('calc.activity')}</span>
            <select value={profile.activity} onChange={(e) => set('activity', e.target.value as Activity)}>
              {ACTIVITIES.map((a) => (
                <option key={a} value={a}>
                  {t(`calc.act.${a}`)}
                </option>
              ))}
            </select>
          </label>

          <fieldset className="goal-group">
            <legend>{t('calc.goal')}</legend>
            {GOALS.map((g) => (
              <label key={g} className={`goal-opt${profile.goal === g ? ' on' : ''}`}>
                <input type="radio" name="goal" value={g} checked={profile.goal === g} onChange={() => set('goal', g)} />
                <strong>{t(`calc.goal.${g}`)}</strong>
                <span>{t(`calc.goal.${g}.note`)}</span>
              </label>
            ))}
          </fieldset>
        </form>

        <section className="panel result" aria-live="polite">
          <h2>{t('calc.result')}</h2>
          {!tg ? (
            <p className="dim">{t('calc.invalid')}</p>
          ) : (
            <>
              <p className="big-number">
                {num(tg.kcal)} <small>{t('unit.kcal')}</small>
              </p>
              {tg.floored && <p className="note warn">{t('calc.floorNote', { n: tg.floor })}</p>}

              <div className="macro-bar" role="img" aria-label={kcalShare.map((m) => `${t(m.key)} ${m.pct}%`).join(', ')}>
                {kcalShare.map((m) => (
                  <span key={m.cls} className={m.cls} style={{ flexGrow: m.pct }} />
                ))}
              </div>
              <ul className="macro-list">
                {kcalShare.map((m) => (
                  <li key={m.cls}>
                    <i className={m.cls} aria-hidden="true" />
                    <span>{t(m.key)}</span>
                    <b>{m.grams} {t('unit.g')}</b>
                    <em>{m.pct}%</em>
                  </li>
                ))}
              </ul>

              <dl className="facts">
                <div><dt>{t('calc.protein')}</dt><dd>{t('calc.perKg', { n: num(tg.proteinPerKg, 1) })}</dd></div>
                <div><dt>{t('calc.fiber')}</dt><dd>{tg.fiber} {t('unit.g')}</dd></div>
                <div><dt>{t('calc.water')}</dt><dd>{num(tg.waterL, 1)} L</dd></div>
                <div><dt>{t('calc.bmr')}</dt><dd>{num(tg.bmr)} {t('unit.kcal')}</dd></div>
                <div><dt>{t('calc.tdee')}</dt><dd>{num(tg.tdee)} {t('unit.kcal')}</dd></div>
              </dl>

              <Link to="/menu" className="btn primary wide">
                {t('calc.menuCta')}
              </Link>
              <p className="fineprint">{t('calc.note')}</p>
            </>
          )}
        </section>
      </div>

      <section className="body-section" aria-labelledby="body-h">
        <h2 id="body-h">{t('body.title')}</h2>
        <p className="page-lead">{t('body.lead')}</p>

        <div className="field-row narrow-row">
          <NumField label={t('body.neck')} value={profile.neckCm} onChange={(v) => set('neckCm', v)} min={20} max={70} step={0.5} />
          <NumField label={t('body.waist')} value={profile.waistCm} onChange={(v) => set('waistCm', v)} min={40} max={200} step={0.5} />
          {profile.sex === 'female' && (
            <NumField label={t('body.hip')} value={profile.hipCm} onChange={(v) => set('hipCm', v)} min={50} max={200} step={0.5} />
          )}
        </div>

        {!body ? (
          <p className="dim">{t('calc.invalid')}</p>
        ) : (
          <>
            <div className="tiles">
              <div className="tile">
                <span className="tile-label">{t('body.bmi')}</span>
                <span className="tile-value">{num(body.bmi, 1)}</span>
                <span className={`tile-note bmi-${body.bmiCategory}`}>{t(`body.bmi.${body.bmiCategory}`)}</span>
              </div>
              <div className="tile">
                <span className="tile-label">{t('body.fat')}</span>
                <span className="tile-value">{num(body.fatPct, 1)}%</span>
                <span className="tile-note">{t(`body.cat.${body.fatCategory}`)}</span>
              </div>
              <div className="tile">
                <span className="tile-label">{t('body.lean')}</span>
                <span className="tile-value">{num(body.leanKg, 1)} <small>{t('unit.kg')}</small></span>
                <span className="tile-note">{t('body.fatMass')}: {num(body.fatKg, 1)} {t('unit.kg')}</span>
              </div>
              <div className="tile">
                <span className="tile-label">{t('body.healthy')}</span>
                <span className="tile-value tile-small">{t('body.healthyText', { lo: body.healthyKg.lo, hi: body.healthyKg.hi })}</span>
              </div>
              {body.whtr != null && (
                <div className="tile">
                  <span className="tile-label">{t('body.whtr')}</span>
                  <span className="tile-value">{num(body.whtr, 2)}</span>
                  <span className="tile-note">{body.whtr < 0.5 ? t('body.whtr.good') : t('body.whtr.warn')}</span>
                </div>
              )}
            </div>
            <p className="fineprint">{body.fatMethod === 'navy' ? t('body.method.navy') : t('body.method.bmi')}</p>
            <p className="fineprint">{t('body.note')}</p>
          </>
        )}
      </section>
    </div>
  )
}
