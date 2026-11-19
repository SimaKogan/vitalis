/** Read the text of a PDF in the browser. The file never leaves the device. */

export class PdfError extends Error {
  constructor(public code: 'noText' | 'failed') {
    super(code)
  }
}

interface TextItem {
  str: string
  transform: number[]
}

/** Group text fragments into visual rows (same baseline), ordered left to right. */
export function itemsToLines(items: TextItem[]): string[] {
  const rows = new Map<number, { x: number; s: string }[]>()
  for (const it of items) {
    if (!it.str.trim()) continue
    const y = Math.round(it.transform[5] / 3)
    const row = rows.get(y) ?? []
    row.push({ x: it.transform[4], s: it.str.trim() })
    rows.set(y, row)
  }
  return [...rows.entries()]
    .sort((a, b) => b[0] - a[0])
    .map(([, row]) => row.sort((a, b) => a.x - b.x).map((c) => c.s).join('  '))
}

export async function extractPdfText(file: File, maxPages = 20): Promise<string> {
  try {
    // loaded on demand: the PDF engine is large and only needed on the labs page
    const pdfjs = await import('pdfjs-dist')
    const worker = await import('pdfjs-dist/build/pdf.worker.min.mjs?url')
    pdfjs.GlobalWorkerOptions.workerSrc = worker.default

    const data = new Uint8Array(await file.arrayBuffer())
    const doc = await pdfjs.getDocument({ data }).promise
    const lines: string[] = []
    for (let p = 1; p <= Math.min(doc.numPages, maxPages); p++) {
      const page = await doc.getPage(p)
      const content = await page.getTextContent()
      lines.push(...itemsToLines(content.items as unknown as TextItem[]))
    }
    const text = lines.join('\n')
    if (text.replace(/\s/g, '').length < 20) throw new PdfError('noText')
    return text
  } catch (e) {
    if (e instanceof PdfError) throw e
    throw new PdfError('failed')
  }
}
