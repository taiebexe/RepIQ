import Anthropic from '@anthropic-ai/sdk'
import OpenAI from 'openai'
import { GoogleGenerativeAI } from '@google/generative-ai'

interface Message {
  role: 'system' | 'user' | 'assistant'
  content: string
}

/**
 * Sends a prompt to whichever AI provider is configured.
 * Priority: Gemini (free) → Anthropic → OpenAI. Returns raw text response.
 */
export async function aiComplete(
  messages: Message[],
  maxTokens = 800
): Promise<string | null> {
  const systemMsg = messages.find((m) => m.role === 'system')?.content || ''
  const chatMessages = messages.filter((m) => m.role !== 'system')

  // 1. Try Gemini first (free tier, 30 RPM)
  const geminiKey = process.env.GEMINI_API_KEY
  if (geminiKey && geminiKey !== 'your_key_here') {
    try {
      const genAI = new GoogleGenerativeAI(geminiKey)
      const model = genAI.getGenerativeModel({
        model: 'gemini-2.0-flash-lite',
        systemInstruction: systemMsg,
      })

      const history = chatMessages.slice(0, -1).map((m) => ({
        role: m.role === 'assistant' ? 'model' as const : 'user' as const,
        parts: [{ text: m.content }],
      }))

      const lastMessage = chatMessages[chatMessages.length - 1]?.content || ''

      const chat = model.startChat({
        history,
        generationConfig: { maxOutputTokens: maxTokens },
      })

      const result = await chat.sendMessage(lastMessage)
      return result.response.text()
    } catch (err) {
      console.error('[AI] Gemini error:', err instanceof Error ? err.message : err)
    }
  }

  // 2. Try Anthropic
  const anthropicKey = process.env.ANTHROPIC_API_KEY
  if (anthropicKey && anthropicKey !== 'your_key_here' && anthropicKey.startsWith('sk-ant-')) {
    try {
      const client = new Anthropic({ apiKey: anthropicKey })
      const response = await client.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: maxTokens,
        system: systemMsg,
        messages: chatMessages.map((m) => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        })),
      })
      return response.content[0].type === 'text' ? response.content[0].text : null
    } catch (err) {
      console.error('[AI] Anthropic error:', err instanceof Error ? err.message : err)
    }
  }

  // 3. Try OpenAI
  const openaiKey = process.env.OPENAI_API_KEY
  if (openaiKey && openaiKey !== 'your_key_here') {
    try {
      const client = new OpenAI({ apiKey: openaiKey })
      const response = await client.chat.completions.create({
        model: 'gpt-4o-mini',
        max_tokens: maxTokens,
        messages: [
          { role: 'system', content: systemMsg },
          ...chatMessages.map((m) => ({
            role: m.role as 'user' | 'assistant',
            content: m.content,
          })),
        ],
      })
      return response.choices[0]?.message?.content || null
    } catch (err) {
      console.error('[AI] OpenAI error:', err instanceof Error ? err.message : err)
    }
  }

  return null
}

export function hasAIProvider(): boolean {
  const gk = process.env.GEMINI_API_KEY
  const ak = process.env.ANTHROPIC_API_KEY
  const ok = process.env.OPENAI_API_KEY
  return !!(
    (gk && gk !== 'your_key_here') ||
    (ak && ak !== 'your_key_here' && ak.startsWith('sk-ant-')) ||
    (ok && ok !== 'your_key_here')
  )
}
