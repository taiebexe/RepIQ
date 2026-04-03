'use client'

import { useState } from 'react'
import { NutritionHint, SummaryStats } from '@/lib/types'

const TYPE_CONFIG: Record<string, { color: string; icon: string }> = {
  calories: { color: '#f59e0b', icon: '🔥' },
  protein: { color: '#ef4444', icon: '🥩' },
  recovery: { color: '#8b5cf6', icon: '😴' },
  hydration: { color: '#3b82f6', icon: '💧' },
  timing: { color: '#22c55e', icon: '⏰' },
}

function HintSkeleton() {
  return (
    <div className="animate-pulse space-y-3">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="rounded-lg bg-[#1a1a2e] p-4">
          <div className="mb-2 h-4 w-1/4 rounded bg-[#2a2a3e]" />
          <div className="h-3 w-full rounded bg-[#2a2a3e]" />
          <div className="mt-1 h-3 w-2/3 rounded bg-[#2a2a3e]" />
        </div>
      ))}
    </div>
  )
}

export default function NutritionHints({
  aiContext,
  biometrics,
  summary,
}: {
  aiContext: string
  biometrics?: { weightKg: number | null; heightCm: number | null; age: number | null; gender: string | null }
  summary: SummaryStats
}) {
  const [hints, setHints] = useState<NutritionHint[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function generate() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/nutrition', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aiContext, biometrics, summary }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setHints(data.hints || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate hints')
    } finally {
      setLoading(false)
    }
  }

  if (!hints && !loading) {
    return (
      <div className="flex flex-col items-center gap-3 py-6">
        <p className="text-sm text-[#888]">
          AI-powered nutrition guidance based on your training volume and body metrics
        </p>
        {biometrics?.weightKg ? (
          <div className="mb-1 flex gap-3 text-xs text-[#555]">
            {biometrics.weightKg && <span>{biometrics.weightKg}kg</span>}
            {biometrics.heightCm && <span>{biometrics.heightCm}cm</span>}
            {biometrics.age && <span>{biometrics.age}y</span>}
          </div>
        ) : (
          <p className="text-xs text-[#555]">
            Add weight &amp; height in Hevy for personalized calorie/protein targets
          </p>
        )}
        <button
          onClick={generate}
          className="rounded-lg bg-[#4f6ef7] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#3d5ce5]"
        >
          Get Nutrition Hints
        </button>
      </div>
    )
  }

  if (loading) return <HintSkeleton />

  if (error) {
    return (
      <div className="py-4 text-center">
        <p className="mb-2 text-sm text-red-400">{error}</p>
        <button onClick={generate} className="text-sm text-[#4f6ef7] hover:underline">
          Try again
        </button>
      </div>
    )
  }

  if (!hints || hints.length === 0) {
    return <p className="py-4 text-center text-sm text-[#888]">No hints generated.</p>
  }

  return (
    <div className="space-y-3">
      {hints.map((hint, i) => {
        const config = TYPE_CONFIG[hint.type] || TYPE_CONFIG.calories
        return (
          <div
            key={i}
            className="rounded-lg border bg-[#0d0d15] p-4"
            style={{ borderColor: `${config.color}30` }}
          >
            <div className="mb-1.5 flex items-center gap-2">
              <span>{config.icon}</span>
              <span className="font-medium text-white">{hint.title}</span>
              <span
                className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase"
                style={{ color: config.color, backgroundColor: `${config.color}15` }}
              >
                {hint.type}
              </span>
            </div>
            <p className="text-sm leading-relaxed text-[#aaa]">{hint.body}</p>
          </div>
        )
      })}
      <button
        onClick={generate}
        className="w-full rounded-lg border border-[#1e1e2e] py-2 text-xs text-[#888] transition-colors hover:border-[#4f6ef7] hover:text-[#4f6ef7]"
      >
        Regenerate hints
      </button>
    </div>
  )
}
