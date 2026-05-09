import { supabase } from '@/lib/supabase'
import { IS_LOCAL, apiFetch } from '@/lib/data-api'
import type { ExtractedReport } from '@/types'
import { resolveCategory } from './categories'
import { computeStatus, parseReferenceRange } from './utils'

export async function extractBiomarkers(rawText: string): Promise<ExtractedReport> {
  let rawData: unknown

  if (IS_LOCAL) {
    const { data, error } = await apiFetch<ExtractedReport>('/api/functions/extract-biomarkers', {
      method: 'POST',
      body: JSON.stringify({ text: rawText }),
    })
    if (error) throw new Error(error.message)
    rawData = data
  } else {
    const { data, error } = await supabase.functions.invoke('extract-biomarkers', {
      body: { text: rawText },
    })
    if (error) throw new Error(error.message)
    if (data.error) throw new Error(data.error)
    rawData = data
  }

  const parsed = rawData as ExtractedReport

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
