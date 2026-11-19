import { useRef, useState, type DragEvent } from 'react'
import { Link } from 'react-router-dom'
import { MARKERS, type MarkerCategory } from '../data/markers'
import { useProfile } from '../hooks/useProfile'
import { markerText, useI18n } from '../i18n'
import type { Sex } from '../lib/calc'
import { analyse, parseLabText, position, type LabResult, type ParsedValue } from '../lib/labs'
import { PdfError, extractPdfText } from '../lib/pdfText'

const CATEGORIES: MarkerCategory[] = ['iron', 'blood', 'thyroid', 'vitamins', 'metabolic', 'lipids', 'other']

type ErrorKey = 'labs.err.notPdf' | 'labs.err.noText' | 'labs.err.noneFound' | 'labs.err.failed' | 'labs.err.noValues'

export function Labs() {
  const { t, content } = useI18n()
  const [profile, setProfile] = useProfile()
  const sex = profile.sex
  const [results, setResults] = useState<LabResult[] | null>(null)
  const [error, setError] = useState<ErrorKey | null>(null)
  const [reading, setReading] = useState<string | null>(null)
  const [manual, setManual] = useState<Record<string, string>>({})
  const [dragging, setDragging] = useState(false)
  const fileInput = useRef<HTMLInputElement>(null)

  const show = (values: ParsedValue[], s: Sex, emptyError: ErrorKey) => {
    const res = analyse(values, s)
    if (res.length === 0) {
      setResults(null)
      setError(emptyError)
    } else {
      setError(null)
      setResults(res)
    }
  }

  const handleFile = async (file: File | undefined) => {
    if (!file) return
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setResults(null)
      setError('labs.err.notPdf')
      return
    }
    setError(null)
    setResults(null)
    setReading(file.name)
    try {
      const text = await extractPdfText(file)
      show(parseLabText(text), sex, 'labs.err.noneFound')
    } catch (e) {
      setError(e instanceof PdfError && e.code === 'noText' ? 'labs.err.noText' : 'labs.err.failed')
    } finally {
      setReading(null)
      if (fileInput.current) fileInput.current.value = ''
    }
  }

  const onDrop = (e: DragEvent) => {
    e.preventDefault()
    setDragging(false)
    void handleFile(e.dataTransfer.files[0])
  }

  const analyseManual = () => {
    const values: ParsedValue[] = MARKERS.flatMap((m) => {
      const raw = manual[m.id]?.replace(',', '.')
      const v = raw ? parseFloat(raw) : NaN
      return Number.isFinite(v) ? [{ markerId: m.id, value: v, unit: m.unit }] : []
    })
    show(values, sex, 'labs.err.noValues')
  }

  const reset = () => {
    setResults(null)
    setError(null)
    setManual({})
  }

  const outside = results?.filter((r) => r.status !== 'normal') ?? []
  const ironOut = outside.some((r) => r.marker.tip === 'iron')
  const thyroidOut = outside.some((r) => r.marker.tip === 'thyroid')

  return (
    <div className="wrap section">
      <h1 className="page-title">{t('labs.title')}</h1>
      <p className="page-lead">{t('labs.lead')}</p>
      <p className="privacy">{t('labs.privacy')}</p>

      <div className="labs-input">
        <div
          className={`dropzone${dragging ? ' over' : ''}`}
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
        >
          <input ref={fileInput} id="lab-file" type="file" accept="application/pdf,.pdf" className="sr-only" onChange={(e) => void handleFile(e.target.files?.[0])} />
          <label htmlFor="lab-file" className="btn primary">
            {t('labs.upload')}
          </label>
          <span className="dim">{t('labs.drop')}</span>
          {reading && <p role="status">{t('labs.reading', { name: reading })}</p>}
        </div>

        <fieldset className="seg-group inline">
          <legend>{t('labs.sex')}</legend>
          {(['female', 'male'] as Sex[]).map((s) => (
            <label key={s} className={`seg-opt${sex === s ? ' on' : ''}`}>
              <input
                type="radio"
                name="lab-sex"
                checked={sex === s}
                onChange={() => {
                  setProfile({ ...profile, sex: s })
                  // re-evaluate what is already on screen with the new sex
                  if (results) setResults(analyse(results.map((r) => ({ markerId: r.marker.id, value: r.value, unit: r.unit, reportRange: r.source === 'pdf' ? r.range : undefined })), s))
                }}
              />
              {t(`calc.${s}`)}
            </label>
          ))}
        </fieldset>
      </div>

      <details className="notes manual">
        <summary>{t('labs.manual')}</summary>
        <p className="dim">{t('labs.manualHint')}</p>
        <div className="manual-grid">
          {MARKERS.map((m) => (
            <label key={m.id} className="field">
              <span>{markerText(content, m.id).name}</span>
              <span className="input-unit">
                <input
                  type="text"
                  inputMode="decimal"
                  value={manual[m.id] ?? ''}
                  onChange={(e) => setManual({ ...manual, [m.id]: e.target.value })}
                />
                <small dir="ltr">{m.unit}</small>
              </span>
            </label>
          ))}
        </div>
        <button type="button" className="btn primary" onClick={analyseManual}>
          {t('labs.analyze')}
        </button>
      </details>

      {error && (
        <p className="note warn" role="alert">
          {t(error)}
        </p>
      )}

      {results && (
        <section className="lab-results" aria-live="polite">
          <div className="section-head">
            <div>
              <h2>{t('labs.found', { n: results.length })}</h2>
              <p className="dim">{t('labs.summary', { ok: results.length - outside.length, out: outside.length })}</p>
            </div>
            <button type="button" className="btn ghost" onClick={reset}>
              {t('labs.clear')}
            </button>
          </div>
          <p className="note">{t('labs.verify')}</p>

          {CATEGORIES.map((cat) => {
            const rows = results.filter((r) => r.marker.category === cat)
            if (rows.length === 0) return null
            return (
              <div key={cat} className="lab-group">
                <h3>{t(`labs.cat.${cat}`)}</h3>
                <ul>
                  {rows.map((r) => (
                    <LabRow key={r.marker.id} r={r} />
                  ))}
                </ul>
              </div>
            )
          })}

          {(ironOut || thyroidOut) && (
            <div className="food-tips">
              <h3>{t('labs.food')}</h3>
              {ironOut && (
                <p>
                  {t('labs.ironTip')}{' '}
                  <Link to="/recipes?c=gluten-free" className="text-link">
                    {t('labs.ironCta')}
                  </Link>
                </p>
              )}
              {thyroidOut && <p>{t('labs.thyroidTip')}</p>}
            </div>
          )}
        </section>
      )}

      <p className="fineprint">{t('labs.disclaimer')}</p>
    </div>
  )
}

function LabRow({ r }: { r: LabResult }) {
  const { t, num, content } = useI18n()
  const text = markerText(content, r.marker.id)
  const pos = Math.min(97, Math.max(3, 25 + position(r) * 50))
  const { lo, hi } = r.range
  const rangeText = !Number.isFinite(hi)
    ? t('labs.rangeMin', { lo: num(lo, 2), unit: r.unit })
    : lo === 0
      ? t('labs.rangeMax', { hi: num(hi, 2), unit: r.unit })
      : t('labs.range', { lo: num(lo, 2), hi: num(hi, 2), unit: r.unit })
  const advice = r.status === 'low' ? text.low : r.status === 'high' ? text.high : ''

  return (
    <li className={`lab-row ${r.status}`}>
      <div className="lab-main">
        <strong>{text.name}</strong>
        <span className="lab-value" dir="ltr">
          {num(r.value, r.marker.decimals)} {r.unit}
        </span>
        <span className={`pill ${r.status}`}>{t(`labs.status.${r.status}`)}</span>
      </div>
      <div className="range-bar" aria-hidden="true">
        <span className="range-ok" />
        <span className="range-dot" style={{ insetInlineStart: `${pos}%` }} />
      </div>
      <p className="lab-range dim">
        {rangeText} ({r.source === 'pdf' ? t('labs.src.pdf') : t('labs.src.default')})
      </p>
      <details className="lab-more">
        <summary>{t('labs.explain')}</summary>
        <p>{text.about}</p>
        {advice && <p>{advice}</p>}
      </details>
    </li>
  )
}
