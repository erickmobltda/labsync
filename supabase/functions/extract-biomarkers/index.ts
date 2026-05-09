import Anthropic from 'npm:@anthropic-ai/sdk@^0.37.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { text } = await req.json()

    if (!text) {
      return new Response(JSON.stringify({ error: 'text is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const client = new Anthropic()

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
      throw new Error('Unexpected response type from AI')
    }

    // Strip markdown fences if present
    const jsonText = content.text
      .replace(/^```(?:json)?\n?/m, '')
      .replace(/\n?```$/m, '')
      .trim()

    const parsed = JSON.parse(jsonText)

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
