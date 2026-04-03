import { NextResponse } from 'next/server'
import { aiComplete, hasAIProvider } from '@/lib/ai'
import { ChatMessage } from '@/lib/types'

export async function POST(req: Request) {
  try {
    if (!hasAIProvider()) {
      return NextResponse.json({ error: 'No AI provider configured' }, { status: 503 })
    }

    const { messages, aiContext, biometrics } = (await req.json()) as {
      messages: ChatMessage[]
      aiContext: string
      biometrics?: { weightKg: number | null; heightCm: number | null; age: number | null; gender: string | null }
    }

    const bioContext = biometrics
      ? `\nAthlete profile: ${biometrics.weightKg ? `${biometrics.weightKg}kg` : 'unknown weight'}, ${biometrics.heightCm ? `${biometrics.heightCm}cm` : 'unknown height'}, ${biometrics.gender || 'unknown gender'}, ${biometrics.age ? `${biometrics.age} years old` : 'unknown age'}`
      : ''

    const systemPrompt = `You are RepIQ, an AI training analyst. You have access to the user's complete workout history and analytics. Answer their questions about their training data accurately and concisely.

Here is the user's training data:
${aiContext}${bioContext}

Rules:
- Be concise (2-4 sentences per answer)
- Reference specific numbers from their data when relevant
- If they ask about something not in the data, say so honestly
- Be encouraging but evidence-based
- Do not use markdown formatting — respond in plain text`

    const aiMessages = [
      { role: 'system' as const, content: systemPrompt },
      ...messages.map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
    ]

    const text = await aiComplete(aiMessages, 400)

    if (!text) {
      return NextResponse.json({
        reply: 'AI service is unavailable. Please check your API key configuration.',
      })
    }

    return NextResponse.json({ reply: text })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
