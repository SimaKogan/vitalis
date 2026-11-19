import { MARKERS, MARKER_BY_ID, type Marker, type Range } from '../data/markers'
import type { Sex } from './calc'

export interface ParsedValue {
  markerId: string
  /** number exactly as printed in the report */
  value: number
  /** unit exactly as printed, if one was found */
  unit?: string
  /** the report's own reference range, if one was found */
  reportRange?: Range
}

export type Status = 'low' | 'normal' | 'high'

export interface LabResult {
  marker: Marker
  value: number
  unit: string
  range: Range
  source: 'pdf' | 'default'
  status: Status
}

// ───────── text helpers ─────────

const HEBREW_RUN = /[֐-׿]+/g
const HAS_HEBREW = /[֐-׿]/

/** PDFs often store Hebrew in visual order, so each Hebrew word comes out letter-reversed. */
export function reverseHebrewRuns(text: string): string {
  return text.replace(HEBREW_RUN, (w) => [...w].reverse().join(''))
}

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

interface AliasEntry {
  marker: Marker
  alias: string
  re: RegExp
}

/** All aliases from every language, longest first so "hdl cholesterol" beats "cholesterol". */
const ALIASES: AliasEntry[] = MARKERS.flatMap((marker) =>
  [...marker.aliases.en, ...marker.aliases.ru, ...marker.aliases.he].map((alias) => ({
    marker,
    alias,
    re: new RegExp(`(?<![\\p{L}\\p{N}])${escapeRe(alias.toLowerCase()).replace(/ /g, '\\s+')}(?![\\p{L}\\p{N}])`, 'iu'),
  })),
).sort((a, b) => b.alias.length - a.alias.length)

const NUMBER = /(?<![\p{L}\d.,])(\d+(?:[.,]\d+)?)/gu
const RANGE = /(\d+(?:[.,]\d+)?)\s*[-–—−]\s*(\d+(?:[.,]\d+)?)/
const UPPER = /[<≤]\s*=?\s*(\d+(?:[.,]\d+)?)/
const LOWER = /[>≥]\s*=?\s*(\d+(?:[.,]\d+)?)/
const UNIT =
  /(mg\s*\/\s*dl|mmol\s*\/\s*mol|mmol\s*\/\s*l|g\s*\/\s*dl|g\s*\/\s*l|ng\s*\/\s*ml|ng\s*\/\s*dl|pg\s*\/\s*ml|nmol\s*\/\s*l|pmol\s*\/\s*l|[µμu]g\s*\/\s*dl|[µμu]g\s*\/\s*l|[µμu]mol\s*\/\s*l|(?:m|[µμu])?iu\s*\/\s*(?:m)?l|u\s*\/\s*l|mg\s*\/\s*l|%)/i

const toNum = (s: string) => parseFloat(s.replace(',', '.'))

/** Russian unit words to Latin so one set of patterns covers both. */
function normalizeUnits(text: string): string {
  return text
    .replace(/ммоль/gi, 'mmol')
    .replace(/мкмоль/gi, 'umol')
    .replace(/нмоль/gi, 'nmol')
    .replace(/пмоль/gi, 'pmol')
    .replace(/мкг/gi, 'ug')
    .replace(/нг/gi, 'ng')
    .replace(/пг/gi, 'pg')
    .replace(/мг/gi, 'mg')
    .replace(/ме\s*\/\s*л/gi, 'iu/l')
    .replace(/ед\s*\/\s*л/gi, 'u/l')
    .replace(/г\s*\/\s*л/gi, 'g/l')
    .replace(/г\s*\/\s*дл/gi, 'g/dl')
    .replace(/\/\s*мл/gi, '/ml')
    .replace(/\/\s*дл/gi, '/dl')
    .replace(/\/\s*л\b/gi, '/l')
}

function findNumbers(text: string): { value: number; start: number; end: number }[] {
  const out: { value: number; start: number; end: number }[] = []
  for (const m of text.matchAll(NUMBER)) out.push({ value: toNum(m[1]), start: m.index!, end: m.index! + m[0].length })
  return out
}

function parseRangeAndUnit(source: string): Pick<ParsedValue, 'unit' | 'reportRange'> {
  const text = normalizeUnits(source)
  const unit = UNIT.exec(text)?.[0].replace(/\s+/g, '')
  let reportRange: Range | undefined
  const r = RANGE.exec(text)
  if (r) {
    const a = toNum(r[1])
    const b = toNum(r[2])
    reportRange = { lo: Math.min(a, b), hi: Math.max(a, b) }
  } else {
    const u = UPPER.exec(text)
    const l = LOWER.exec(text)
    if (u) reportRange = { lo: 0, hi: toNum(u[1]) }
    else if (l) reportRange = { lo: toNum(l[1]), hi: Number.POSITIVE_INFINITY }
  }
  return { unit, reportRange }
}

function readLine(text: string, entry: AliasEntry): ParsedValue | null {
  const m = entry.re.exec(text.toLowerCase())
  if (!m) return null
  const before = text.slice(0, m.index)
  // drop "25-OH" style prefixes so the 25 is not read as the result
  const rest = text.slice(m.index + m[0].length).replace(/\b25\s*[-(]?\s*(?:oh|hydroxy)\)?(?:\s*d\b)?/gi, ' ')

  const after = findNumbers(rest)
  if (after.length > 0) {
    const first = after[0]
    return { markerId: entry.marker.id, value: first.value, ...parseRangeAndUnit(rest.slice(first.end)) }
  }
  // right-to-left reports put the value before the test name
  const prior = findNumbers(before)
  if (prior.length > 0) {
    const last = prior[prior.length - 1]
    const others = before.slice(0, last.start) + ' ' + before.slice(last.end)
    return { markerId: entry.marker.id, value: last.value, ...parseRangeAndUnit(others) }
  }
  return null
}

/** Find known markers in the text of a lab report. The first occurrence of each marker wins. */
export function parseLabText(text: string): ParsedValue[] {
  const found = new Map<string, ParsedValue>()
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim()
    if (line.length < 3) continue
    const candidates = HAS_HEBREW.test(line) ? [line, reverseHebrewRuns(line)] : [line]
    let consumed = false
    for (const candidate of candidates) {
      if (consumed) break
      const lower = candidate.toLowerCase()
      for (const entry of ALIASES) {
        if (found.has(entry.marker.id)) continue
        if (entry.marker.exclude?.test(lower)) continue
        const parsed = readLine(candidate, entry)
        if (parsed && Number.isFinite(parsed.value)) {
          found.set(entry.marker.id, parsed)
          consumed = true
          break
        }
      }
    }
  }
  return MARKERS.filter((m) => found.has(m.id)).map((m) => found.get(m.id)!)
}

// ───────── evaluation ─────────

/** Best guess at converting a printed value to the marker's canonical unit. */
export function toCanonical(marker: Marker, value: number, unit?: string): number {
  const text = unit ? normalizeUnits(unit) : ''
  const conv = marker.conversions?.find((c) => c.unit.test(text))
  if (conv) return value * conv.factor + (conv.offset ?? 0)
  if (unit && text.toLowerCase().includes(marker.unit.toLowerCase().replace(/\s/g, ''))) return value

  // no usable unit: guess from the magnitude of the number
  const guess: Record<string, () => number> = {
    hemoglobin: () => (value > 30 ? value * 0.1 : value),
    glucose: () => (value < 30 ? value * 18.016 : value),
    chol: () => (value < 20 ? value * 38.67 : value),
    ldl: () => (value < 15 ? value * 38.67 : value),
    hdl: () => (value < 6 ? value * 38.67 : value),
    trig: () => (value < 15 ? value * 88.57 : value),
    creatinine: () => (value > 20 ? value * 0.01131 : value),
    vitd: () => (value > 150 ? value * 0.4006 : value),
    hba1c: () => (value > 20 ? value / 10.929 + 2.15 : value),
  }
  return guess[marker.id]?.() ?? value
}

export function defaultRange(marker: Marker, sex: Sex): Range {
  return 'lo' in marker.range ? marker.range : marker.range[sex]
}

export function statusOf(value: number, range: Range): Status {
  if (value < range.lo) return 'low'
  if (value > range.hi) return 'high'
  return 'normal'
}

export function evaluate(parsed: ParsedValue, sex: Sex): LabResult | null {
  const marker = MARKER_BY_ID[parsed.markerId]
  if (!marker) return null
  const r = parsed.reportRange
  // the report's own range is compared with the value exactly as printed, so no unit conversion is needed
  if (r && Number.isFinite(r.lo) && r.hi > r.lo) {
    return { marker, value: parsed.value, unit: parsed.unit ?? marker.unit, range: r, source: 'pdf', status: statusOf(parsed.value, r) }
  }
  if (r && r.hi === Number.POSITIVE_INFINITY) {
    const range = { lo: r.lo, hi: Number.POSITIVE_INFINITY }
    return { marker, value: parsed.value, unit: parsed.unit ?? marker.unit, range, source: 'pdf', status: statusOf(parsed.value, range) }
  }
  const value = toCanonical(marker, parsed.value, parsed.unit)
  const range = defaultRange(marker, sex)
  return { marker, value, unit: marker.unit, range, source: 'default', status: statusOf(value, range) }
}

export function analyse(values: ParsedValue[], sex: Sex): LabResult[] {
  return values.map((v) => evaluate(v, sex)).filter((r): r is LabResult => r !== null)
}

/** Where the value sits relative to its range: 0 is the low edge, 1 the high edge. */
export function position(r: LabResult): number {
  const { lo, hi } = r.range
  if (!Number.isFinite(hi)) return r.value >= lo ? 0.75 : 0.25
  const span = hi - lo || 1
  return (r.value - lo) / span
}
