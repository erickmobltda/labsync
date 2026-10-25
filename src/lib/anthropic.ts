import type { ExtractedReport } from '@/types'
import { apiFetch } from './api'
import { resolveCategory } from './categories'
import { computeStatus, parseReferenceRange } from './utils'

export async function extractBiomarkers(rawText: string): Promise<ExtractedReport> {
  const res = await apiFetch('/labsync/extract-biomarkers', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ text: rawText }),
  })

  const parsed = (await res.json()) as ExtractedReport

  const enriched = parsed.biomarkers.map(b => {
    const refRange = b.reference_text
      ? parseReferenceRange(b.reference_text)
      : { min: b.reference_min, max: b.reference_max }

    const ref_min = b.reference_min ?? refRange.min
    const ref_max = b.reference_max ?? refRange.max
    const status = computeStatus(b.value, ref_min, ref_max)
    const category = resolveCategory(b.name)

    return {
      ...b,
      value_text: b.value_text ?? null,
      reference_min: ref_min,
      reference_max: ref_max,
      status,
      category,
    }
  })

  return { ...parsed, biomarkers: enriched }
}
