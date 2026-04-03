'use client'

import { useState, useRef, useEffect } from 'react'
import { ChatMessage } from '@/lib/types'

const SUGGESTIONS = [
  'What muscle group am I training most?',
  'Am I overtraining?',
  'What is my strongest lift?',
  'How has my volume changed recently?',
]

export default function DataChat({
  aiContext,
  biometrics,
}: {
  aiContext: string
  biometrics?: { weightKg: number | null; heightCm: number | null; age: number | null; gender: string | null }
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  async function send(text?: string) {
    const question = (text || input).trim()
    if (!question || loading) return

    const newMessages: ChatMessage[] = [...messages, { role: 'user', content: question }]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages, aiContext, biometrics }),
      })
      const data = await res.json()
      setMessages([...newMessages, { role: 'assistant', content: data.reply || data.error || 'No response' }])
    } catch {
      setMessages([...newMessages, { role: 'assistant', content: 'Failed to get a response. Please try again.' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col" style={{ height: 380 }}>
      {/* Messages area */}
      <div
        ref={scrollRef}
        className="flex-1 space-y-3 overflow-y-auto pr-1"
        style={{ scrollbarWidth: 'thin', scrollbarColor: '#333 transparent' }}
      >
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-3">
            <p className="text-sm text-[#888]">Ask anything about your training data</p>
            <div className="flex flex-wrap justify-center gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="rounded-full border border-[#1e1e2e] px-3 py-1.5 text-xs text-[#888] transition-colors hover:border-[#4f6ef7] hover:text-[#4f6ef7]"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-xl px-3.5 py-2.5 text-sm ${
                  msg.role === 'user'
                    ? 'bg-[#4f6ef7] text-white'
                    : 'border border-[#1e1e2e] bg-[#0d0d15] text-[#ccc]'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))
        )}
        {loading && (
          <div className="flex justify-start">
            <div className="rounded-xl border border-[#1e1e2e] bg-[#0d0d15] px-4 py-3">
              <div className="flex gap-1">
                <span className="h-2 w-2 animate-bounce rounded-full bg-[#555]" style={{ animationDelay: '0ms' }} />
                <span className="h-2 w-2 animate-bounce rounded-full bg-[#555]" style={{ animationDelay: '150ms' }} />
                <span className="h-2 w-2 animate-bounce rounded-full bg-[#555]" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="mt-3 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
          placeholder="Ask about your training..."
          className="flex-1 rounded-lg border border-[#1e1e2e] bg-[#0d0d15] px-3.5 py-2.5 text-sm text-white placeholder-[#555] outline-none focus:border-[#4f6ef7]"
        />
        <button
          onClick={() => send()}
          disabled={loading || !input.trim()}
          className="rounded-lg bg-[#4f6ef7] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#3d5ce5] disabled:opacity-40"
        >
          Send
        </button>
      </div>
    </div>
  )
}
