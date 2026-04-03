import { NextResponse } from 'next/server'
import { aiComplete, hasAIProvider } from '@/lib/ai'
import { StrengthGoal } from '@/lib/types'

export async function POST(req: Request) {
  try {
    if (!hasAIProvider()) {
      return NextResponse.json({ error: 'No AI provider configured' }, { status: 503 })
    }

    const { aiContext, topLifts, biometrics } = await req.json()

    const liftSummary = Object.entries(topLifts || {})
      .slice(0, 6)
      .map(([name, sessions]) => {
        const s = sessions as any[]
        if (!s.length) return `- ${name}: no data`
        const last = s[s.length - 1]
        return `- ${name}: current est. 1RM = ${last.estimated1RM}kg (${s.length} sessions)`
      })
      .join('\n')

    const bioContext = biometrics
      ? `\nAthlete profile: ${biometrics.weightKg ? `${biometrics.weightKg}kg` : 'unknown weight'}, ${biometrics.heightCm ? `${biometrics.heightCm}cm` : 'unknown height'}, ${biometrics.gender || 'unknown gender'}, ${biometrics.age ? `${biometrics.age} years old` : 'unknown age'}`
      : ''

    const systemPrompt = `You are a strength coach setting realistic, evidence-based goals for a lifter. Use their current numbers and progression rate to set achievable 8-week targets.

For each of their top lifts, provide:
- Current estimated 1RM
- A realistic 8-week target 1RM (based on typical progression rates — beginners +10-15%, intermediates +3-7%)
- A brief weekly action plan (1 sentence)

Respond ONLY with valid JSON — no markdown:
{
  "goals": [
    {
      "exercise": "exercise name",
      "current1RM": number,
      "target1RM": number,
      "timeframeWeeks": 8,
      "weeklyPlan": "brief plan"
    }
  ]
}
Be realistic. Under-promise, over-deliver. Base targets on their actual rate of progress.`

    const text = await aiComplete([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `${aiContext}${bioContext}\n\nCurrent top lifts:\n${liftSummary}` },
    ])

    if (!text) {
      return NextResponse.json({ goals: [] })
    }

    const parsed = JSON.parse(text)
    return NextResponse.json({ goals: parsed.goals as StrengthGoal[] })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
