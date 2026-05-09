import { Router, Request, Response } from 'express'
import Anthropic from '@anthropic-ai/sdk'
import { requireAuth } from '../middleware/auth'

const router = Router()
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

router.post('/extract-biomarkers', requireAuth, async (req: Request, res: Response) => {
  const { text } = req.body

  if (!text || typeof text !== 'string') {
    res.status(400).json({ error: 'text is required' })
    return
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    res.status(503).json({ error: 'ANTHROPIC_API_KEY is not configured on the server' })
    return
  }

  try {
    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: `Extract all biomarkers from the following lab report text. Return a JSON object with this exact structure:
{
  "report_date": "YYYY-MM-DD",
  "biomarkers": [
    {
      "name": "biomarker name in English",
      "value": numeric value or null if not numeric,
      "value_text": "original text value if not numeric, otherwise null",
      "unit": "measurement unit",
      "reference_text": "original reference range as text",
      "reference_min": numeric min or null,
      "reference_max": numeric max or null
    }
  ]
}

Rules:
- Use today's date if report date is not found: ${new Date().toISOString().split('T')[0]}
- For non-numeric values (e.g. "Negative", "Reactive"), set value to null and use value_text
- reference_min/reference_max should be null if range cannot be parsed numerically
- Include ALL biomarkers found in the report
- Use standard English biomarker names
- Return ONLY the JSON, no other text

Lab report text:
${text}`,
        },
      ],
    })

    const content = message.content[0]
    if (content.type !== 'text') {
      res.status(500).json({ error: 'Unexpected response from AI' })
      return
    }

    // Extract JSON from response (strip markdown fences if present)
    const jsonText = content.text.replace(/^```(?:json)?\n?/m, '').replace(/\n?```$/m, '').trim()

    try {
      const parsed = JSON.parse(jsonText)
      res.json(parsed)
    } catch {
      res.status(500).json({ error: 'AI returned invalid JSON', raw: content.text })
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Extraction failed' })
  }
})

export default router
