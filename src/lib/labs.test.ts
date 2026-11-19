import { describe, expect, it } from 'vitest'
import { analyse, parseLabText, reverseHebrewRuns } from './labs'

const one = (text: string, sex: 'female' | 'male' = 'female') => {
  const parsed = parseLabText(text)
  return { parsed, result: analyse(parsed, sex) }
}

describe('parsing English reports', () => {
  it('reads value, unit and the report range', () => {
    const { parsed, result } = one('Ferritin 12 ng/mL (15 - 150)')
    expect(parsed[0]).toMatchObject({ markerId: 'ferritin', value: 12, unit: 'ng/mL', reportRange: { lo: 15, hi: 150 } })
    expect(result[0]).toMatchObject({ status: 'low', source: 'pdf' })
  })

  it('reads several markers and keeps order', () => {
    const text = `Patient: Test
Hemoglobin  14.2  g/dL  13.5 - 17.5
Ferritin  85  ng/mL  30 - 400
TSH  5.1  mIU/L  0.4 - 4.0
Glucose, fasting  92  mg/dL  70 - 99`
    const ids = parseLabText(text).map((p) => p.markerId)
    expect(ids).toEqual(['hemoglobin', 'ferritin', 'tsh', 'glucose'])
    const res = analyse(parseLabText(text), 'male')
    expect(res.find((r) => r.marker.id === 'tsh')?.status).toBe('high')
    expect(res.find((r) => r.marker.id === 'hemoglobin')?.status).toBe('normal')
  })

  it('does not confuse HDL, LDL and total cholesterol', () => {
    const text = `Total Cholesterol 210 mg/dL < 200
HDL Cholesterol 38 mg/dL > 40
LDL Cholesterol 140 mg/dL < 130`
    const res = analyse(parseLabText(text), 'male')
    const by = Object.fromEntries(res.map((r) => [r.marker.id, r]))
    expect(by.chol.value).toBe(210)
    expect(by.hdl.value).toBe(38)
    expect(by.hdl.status).toBe('low')
    expect(by.ldl.value).toBe(140)
    expect(by.ldl.status).toBe('high')
  })

  it('does not read HbA1c as hemoglobin, or iron-binding capacity as iron', () => {
    const text = `Hemoglobin A1c 5.4 %
Iron binding capacity 310 ug/dL
Iron 85 ug/dL 50 - 170`
    const ids = parseLabText(text).map((p) => `${p.markerId}:${p.value}`)
    expect(ids).toEqual(['iron:85', 'hba1c:5.4'])
  })

  it('skips the "25" in 25-hydroxy vitamin D', () => {
    const { parsed } = one('Vitamin D, 25-Hydroxy 22.4 ng/mL 30 - 100')
    expect(parsed[0]).toMatchObject({ markerId: 'vitd', value: 22.4 })
  })

  it('handles an upper-limit range like < 5.0', () => {
    const { result } = one('C-Reactive Protein 8.2 mg/L < 5.0')
    expect(result[0].range).toEqual({ lo: 0, hi: 5 })
    expect(result[0].status).toBe('high')
  })
})

describe('default ranges and unit conversion', () => {
  it('uses sex-specific defaults when the report prints no range', () => {
    expect(one('Hemoglobin 12.5 g/dL', 'female').result[0].status).toBe('normal')
    expect(one('Hemoglobin 12.5 g/dL', 'male').result[0].status).toBe('low')
  })

  it('converts mmol/L glucose and cholesterol', () => {
    const r = one('Glucose 5.1 mmol/L\nCholesterol 6.5 mmol/L', 'male').result
    expect(r[0].value).toBeCloseTo(91.9, 0)
    expect(r[0].status).toBe('normal')
    expect(r[1].value).toBeCloseTo(251, 0)
    expect(r[1].status).toBe('high')
  })

  it('converts g/L hemoglobin and nmol/L vitamin D', () => {
    expect(one('Hemoglobin 138 g/L', 'male').result[0].value).toBeCloseTo(13.8, 1)
    expect(one('Vitamin D 60 nmol/L').result[0].value).toBeCloseTo(24, 0)
  })
})

describe('Russian reports', () => {
  it('reads Cyrillic names, decimal commas and units', () => {
    const text = `Ферритин 8,5 нг/мл 10 - 120
Гемоглобин 128 г/л
Глюкоза 5,1 ммоль/л
Холестерин общий 5,9 ммоль/л
ТТГ 2,1 мМЕ/л 0,4 - 4,0`
    const res = analyse(parseLabText(text), 'female')
    const by = Object.fromEntries(res.map((r) => [r.marker.id, r]))
    expect(by.ferritin.value).toBe(8.5)
    expect(by.ferritin.status).toBe('low')
    expect(by.hemoglobin.value).toBeCloseTo(12.8, 1)
    expect(by.hemoglobin.status).toBe('normal')
    expect(by.glucose.status).toBe('normal')
    expect(by.chol.status).toBe('high')
    expect(by.tsh.value).toBe(2.1)
  })
})

describe('Hebrew reports', () => {
  it('reads Hebrew names in logical order', () => {
    const res = analyse(parseLabText('פריטין 9 ng/mL 15 - 150\nהמוגלובין 13.1 g/dL'), 'female')
    expect(res.map((r) => r.marker.id)).toEqual(['hemoglobin', 'ferritin'])
    expect(res.find((r) => r.marker.id === 'ferritin')?.status).toBe('low')
  })

  it('reads Hebrew names stored in visual (letter-reversed) order', () => {
    const visual = reverseHebrewRuns('פריטין') + ' 9 ng/mL 15 - 150'
    const res = analyse(parseLabText(visual), 'female')
    expect(res[0].marker.id).toBe('ferritin')
    expect(res[0].status).toBe('low')
  })

  it('reads a right-to-left row where the value sits before the name', () => {
    const row = '(15 - 150) ng/mL 9 ' + reverseHebrewRuns('פריטין')
    const res = analyse(parseLabText(row), 'female')
    expect(res[0]).toMatchObject({ value: 9, status: 'low' })
  })

  it('reads a visual-order row where the Latin letter D precedes the Hebrew word', () => {
    const row = '100  -  30  ng/mL  24  D  ויטמין'
    const res = analyse(parseLabText(row), 'female')
    expect(res[0]).toMatchObject({ value: 24, status: 'low' })
    expect(res[0].marker.id).toBe('vitd')
  })

  it('tolerates repeated spaces between words of a test name', () => {
    expect(parseLabText('Total   Cholesterol   210 mg/dL')[0]).toMatchObject({ markerId: 'chol', value: 210 })
  })

  it('reads Latin test names inside Hebrew reports', () => {
    const res = analyse(parseLabText('TSH 6.2 mIU/L 0.4 - 4.0'), 'female')
    expect(res[0].status).toBe('high')
  })
})

describe('robustness', () => {
  it('returns nothing for unrelated text', () => {
    expect(parseLabText('Appointment on 12/05/2024 at 10:30. Please bring your ID.')).toEqual([])
  })

  it('takes the first occurrence of a marker', () => {
    const res = parseLabText('Ferritin 40 ng/mL\nFerritin 12 ng/mL (previous)')
    expect(res).toHaveLength(1)
    expect(res[0].value).toBe(40)
  })
})
