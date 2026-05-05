import Anthropic from '@anthropic-ai/sdk'
import type { ExtractedReport } from '@/types'
import { resolveCategory } from './categories'
import { computeStatus, parseReferenceRange } from './utils'

const client = new Anthropic({
  apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY as string,
  dangerouslyAllowBrowser: true,
})

const EXTRACTION_SYSTEM = `You are a medical data extraction assistant specializing in blood test reports.
Extract all biomarkers/lab values from the provided text with precision.
Return ONLY valid JSON with no markdown, no explanations, no extra text.`

const EXTRACTION_PROMPT = (text: string) => `Extract all blood test results from this lab report text.

Return this exact JSON structure:
{
  "report_date": "YYYY-MM-DD",
  "biomarkers": [
    {
      "name": "Biomarker name as written in the report",
      "value": 123.45,
      "unit": "mg/dL",
      "reference_text": "< 200" or "70-100" or "10.0-14.0",
      "reference_min": null or number,
      "reference_max": null or number
    }
  ]
}

Rules:
- If date is not found, use today's date
- value must be a number (not a string)
- reference_min/max should be parsed from reference_text when possible
- Include ALL biomarkers found in the text
- Use standard English names for biomarkers (e.g., "Hemoglobin", "HDL Cholesterol")

Lab report text:
${text}`

export async function extractBiomarkers(rawText: string): Promise<ExtractedReport> {
  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 4096,
    system: EXTRACTION_SYSTEM,
    messages: [
      { role: 'user', content: EXTRACTION_PROMPT(rawText) },
    ],
  })

  const content = message.content[0]
  if (content.type !== 'text') throw new Error('Unexpected response type from Claude')

  let parsed: ExtractedReport
  try {
    const jsonText = content.text.trim()
    parsed = JSON.parse(jsonText)
  } catch {
    // Try to extract JSON from the response
    const match = content.text.match(/\{[\s\S]*\}/)
    if (!match) throw new Error('Could not parse extraction response as JSON')
    parsed = JSON.parse(match[0])
  }

  // Enrich biomarkers with computed fields
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
      reference_min: ref_min,
      reference_max: ref_max,
      status,
      category,
    }
  })

  return { ...parsed, biomarkers: enriched }
}
