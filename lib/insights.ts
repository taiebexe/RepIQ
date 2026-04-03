import { aiComplete } from './ai'
import { AIInsight, PlateauSignal } from './types'

const FALLBACK_INSIGHTS: AIInsight[] = [
  {
    title: 'Keep pushing',
    body: 'Your training data has been recorded. Continue logging workouts for more personalized insights.',
    type: 'progress',
  },
  {
    title: 'Track consistency',
    body: 'Aim for at least 3-4 sessions per week to see steady progress across your main lifts.',
    type: 'frequency',
  },
  {
    title: 'Volume matters',
    body: 'Gradually increase weekly sets per muscle group over time. Progressive overload drives adaptation.',
    type: 'volume',
  },
]

const SYSTEM_PROMPT = `You are an expert strength and conditioning coach analyzing a lifter's training data. Provide exactly 3 specific, actionable insights based on their actual numbers.

Each insight must:
- Reference specific numbers from their data
- Explain WHY it is happening mechanistically
- Give ONE concrete action to take this week
- Be 2-3 sentences max

Prioritize plateau insights when present.
Respond ONLY with valid JSON — no markdown, no explanation:
{
  "insights": [
    {
      "title": "max 4 words",
      "body": "insight text",
      "type": "plateau|volume|frequency|recovery|progress"
    }
  ]
}
Be direct. Talk like a coach who studied the numbers.`

export async function generateInsights(
  aiContext: string,
  plateaus: PlateauSignal[]
): Promise<AIInsight[]> {
  const plateauDetail =
    plateaus.length > 0
      ? `\n\nPlateau details:\n${plateaus
          .map(
            (p) =>
              `- ${p.exercise}: stalled for ${p.sessionsStalled} sessions, last PR was ${p.lastPRWeightKg}kg on ${p.lastPRDate}`
          )
          .join('\n')}`
      : ''

  const userMessage = aiContext + plateauDetail

  try {
    const text = await aiComplete([
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: userMessage },
    ], 600)

    if (!text) return FALLBACK_INSIGHTS

    const parsed = JSON.parse(text)
    return parsed.insights as AIInsight[]
  } catch {
    return FALLBACK_INSIGHTS
  }
}
