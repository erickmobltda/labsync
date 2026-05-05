import { supabase } from '@/lib/supabase'
import type { ExtractedReport } from '@/types'
import { resolveCategory } from './categories'
import { computeStatus, parseReferenceRange } from './utils'

export async function extractBiomarkers(rawText: string): Promise<ExtractedReport> {
  const { data, error } = await supabase.functions.invoke('extract-biomarkers', {
    body: { text: rawText },
  })

  if (error) throw new Error(error.message)
  if (data.error) throw new Error(data.error)

  const parsed = data as ExtractedReport

  const enriched = parsed.biomarkers.map(b => {
    const refRange = b.reference_text
      ? parseReferenceRange(b.reference_text)
      : { min: b.reference_min, max: b.reference_max }

    const ref_min = b.reference_min ?? refRange.min
    const ref_max = b.reference_max ?? refRange.max
    const status = computeStatus(b.value, ref_min, ref_max)
    const category = resolveCategory(b.name)

    return { ...b, reference_min: ref_min, reference_max: ref_max, status, category }
  })

  return { ...parsed, biomarkers: enriched }
}
