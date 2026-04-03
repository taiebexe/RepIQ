import { NextResponse } from 'next/server'
import { aiComplete, hasAIProvider } from '@/lib/ai'
import { NutritionHint } from '@/lib/types'

export async function POST(req: Request) {
  try {
    if (!hasAIProvider()) {
      return NextResponse.json({ error: 'No AI provider configured' }, { status: 503 })
    }

    const { aiContext, biometrics, summary } = await req.json()

    const bioContext = biometrics
      ? `Athlete profile: ${biometrics.weightKg ? `${biometrics.weightKg}kg body weight` : 'unknown weight'}, ${biometrics.heightCm ? `${biometrics.heightCm}cm tall` : 'unknown height'}, ${biometrics.gender || 'unknown gender'}, ${biometrics.age ? `${biometrics.age} years old` : 'unknown age'}`
      : 'No biometric data available'

    const trainingContext = summary
      ? `Training: ${summary.avgSessionsPerWeek} sessions/week, ~${summary.avgSessionDurationMin} min avg, ${summary.totalVolumeKg}kg total volume, top muscle group: ${summary.topMuscleGroup}`
      : ''

    const systemPrompt = `You are a sports nutritionist analyzing a lifter's training load and biometrics to provide personalized nutrition guidance. Use their actual training volume, frequency, body weight, and goals to give specific, actionable nutrition hints.

Provide exactly 4 nutrition hints. Each must:
- Be specific to THEIR numbers (reference their body weight, training volume, frequency)
- Include actual quantities (grams, calories, ml) when possible
- Be practical and easy to implement

Respond ONLY with valid JSON — no markdown:
{
  "hints": [
    {
      "title": "max 4 words",
      "body": "hint text (2-3 sentences)",
      "type": "calories|protein|recovery|hydration|timing"
    }
  ]
}
Be evidence-based. Use standard sports nutrition guidelines (1.6-2.2g protein/kg, etc).`

    const text = await aiComplete([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `${bioContext}\n${trainingContext}\n\n${aiContext}` },
    ])

    if (!text) {
      return NextResponse.json({ hints: [] })
    }

    const parsed = JSON.parse(text)
    return NextResponse.json({ hints: parsed.hints as NutritionHint[] })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
