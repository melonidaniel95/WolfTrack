import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json',
}

serve(async (req) => {
  try {
    if (req.method === 'OPTIONS') {
      return new Response('ok', { headers: corsHeaders })
    }

    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: corsHeaders,
      })
    }

    if (!OPENAI_API_KEY) {
      return new Response(JSON.stringify({ error: 'OPENAI_API_KEY mancante' }), {
        status: 500,
        headers: corsHeaders,
      })
    }

    const { imageBase64 } = await req.json()

    if (!imageBase64) {
      return new Response(JSON.stringify({ error: 'imageBase64 mancante' }), {
        status: 400,
        headers: corsHeaders,
      })
    }

    const cleanBase64 = imageBase64.includes('base64,')
      ? imageBase64.split('base64,')[1]
      : imageBase64

    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-mini',
        input: [
          {
            role: 'user',
            content: [
              {
                type: 'input_text',
                text:
                  'Analizza questa foto di cibo. Rispondi SOLO in JSON valido con: foodName, quantity, calories, protein, carbs, fat. I valori nutrizionali devono essere stime realistiche per la porzione visibile. Usa grammi per quantity.',
              },
              {
                type: 'input_image',
                image_url: `data:image/jpeg;base64,${cleanBase64}`,
              },
            ],
          },
        ],
        text: {
          format: {
            type: 'json_schema',
            name: 'food_nutrition',
            strict: true,
            schema: {
              type: 'object',
              additionalProperties: false,
              properties: {
                foodName: { type: 'string' },
                quantity: { type: 'string' },
                calories: { type: 'number' },
                protein: { type: 'number' },
                carbs: { type: 'number' },
                fat: { type: 'number' },
              },
              required: [
                'foodName',
                'quantity',
                'calories',
                'protein',
                'carbs',
                'fat',
              ],
            },
          },
        },
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      return new Response(JSON.stringify({ error: data }), {
        status: response.status,
        headers: corsHeaders,
      })
    }

    const text = data.output
      ?.flatMap((item: any) => item.content ?? [])
      ?.find((content: any) => content.type === 'output_text')
      ?.text

    if (!text) {
      return new Response(
        JSON.stringify({
          error: 'Risposta AI non valida',
          data,
        }),
        {
          status: 500,
          headers: corsHeaders,
        }
      )
    }

    return new Response(text, {
      status: 200,
      headers: corsHeaders,
    })
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Errore sconosciuto',
      }),
      {
        status: 500,
        headers: corsHeaders,
      }
    )
  }
})