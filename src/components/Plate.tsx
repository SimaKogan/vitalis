import { useState } from 'react'
import { PLATE, type PlateSegment } from '../data/rules'
import { useI18n } from '../i18n'

const CX = 200
const CY = 200

/** Angle in degrees clockwise from 12 o'clock. */
function point(r: number, deg: number) {
  const a = (deg * Math.PI) / 180
  return { x: CX + r * Math.sin(a), y: CY - r * Math.cos(a) }
}

function wedge(r: number, from: number, to: number) {
  const a = point(r, from)
  const b = point(r, to)
  const large = to - from > 180 ? 1 : 0
  return `M ${CX} ${CY} L ${a.x} ${a.y} A ${r} ${r} 0 ${large} 1 ${b.x} ${b.y} Z`
}

const GEOMETRY: Record<PlateSegment['key'], { from: number; to: number; fill: string; text: string }> = {
  veg: { from: 180, to: 360, fill: 'var(--plate-veg)', text: '#ffffff' },
  protein: { from: 0, to: 90, fill: 'var(--plate-protein)', text: '#ffffff' },
  carbs: { from: 90, to: 180, fill: 'var(--plate-carbs)', text: '#0e2b27' },
}

/** Interactive "healthy plate": hover, focus or tap a section to learn what goes in it. */
export function Plate() {
  const { t, content } = useI18n()
  const [active, setActive] = useState<PlateSegment['key']>('veg')
  const current = content.plate[active]

  return (
    <figure className="plate">
      <svg viewBox="0 0 400 400" role="group" aria-label={t('plate.aria')}>
        <circle cx={CX} cy={CY} r="192" className="plate-rim" />
        <circle cx={CX} cy={CY} r="168" className="plate-well" />
        {PLATE.map((seg, i) => {
          const g = GEOMETRY[seg.key]
          const mid = (g.from + g.to) / 2
          const label = point(seg.key === 'veg' ? 88 : 96, mid)
          const isActive = seg.key === active
          return (
            <g
              key={seg.key}
              className={`seg${isActive ? ' on' : ''}`}
              style={{ ['--i' as string]: i }}
              role="button"
              tabIndex={0}
              aria-pressed={isActive}
              aria-label={`${content.plate[seg.key].share}: ${content.plate[seg.key].label}`}
              onMouseEnter={() => setActive(seg.key)}
              onFocus={() => setActive(seg.key)}
              onClick={() => setActive(seg.key)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  setActive(seg.key)
                }
              }}
            >
              <path d={wedge(152, g.from, g.to)} fill={g.fill} className="seg-shape" />
              <text x={label.x} y={label.y - 8} textAnchor="middle" className="seg-emoji" aria-hidden="true">
                {seg.emoji}
              </text>
              <text x={label.x} y={label.y + 32} textAnchor="middle" className="seg-label" fill={g.text} aria-hidden="true">
                {seg.key === 'veg' ? '½' : '¼'}
              </text>
            </g>
          )
        })}
        {/* gaps between portions */}
        <path d={`M ${CX} ${CY - 152} V ${CY + 152} M ${CX} ${CY} H ${CX + 152}`} className="plate-gap" />
      </svg>

      <figcaption className="plate-caption" aria-live="polite">
        <strong>{current.title}</strong>
        <span>{current.text}</span>
        <em>{t('plate.try', { examples: current.examples })}</em>
      </figcaption>
    </figure>
  )
}
