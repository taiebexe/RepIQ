'use client'

import { useState } from 'react'
import { StrengthGoal } from '@/lib/types'

function GoalSkeleton() {
  return (
    <div className="animate-pulse space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="rounded-lg bg-[#1a1a2e] p-4">
          <div className="mb-2 h-4 w-1/3 rounded bg-[#2a2a3e]" />
          <div className="h-3 w-full rounded bg-[#2a2a3e]" />
        </div>
      ))}
    </div>
  )
}

export default function GoalGenerator({
  aiContext,
  topLifts,
  biometrics,
}: {
  aiContext: string
  topLifts: Record<string, any[]>
  biometrics?: { weightKg: number | null; heightCm: number | null; age: number | null; gender: string | null }
}) {
  const [goals, setGoals] = useState<StrengthGoal[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function generate() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aiContext, topLifts, biometrics }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setGoals(data.goals || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate goals')
    } finally {
      setLoading(false)
    }
  }

  if (!goals && !loading) {
    return (
      <div className="flex flex-col items-center gap-3 py-6">
        <p className="text-sm text-[#888]">
          AI will analyze your progression and set realistic 8-week targets
        </p>
        <button
          onClick={generate}
          className="rounded-lg bg-[#4f6ef7] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#3d5ce5]"
        >
          Generate Goals
        </button>
      </div>
    )
  }

  if (loading) return <GoalSkeleton />

  if (error) {
    return (
      <div className="py-4 text-center">
        <p className="mb-2 text-sm text-red-400">{error}</p>
        <button
          onClick={generate}
          className="text-sm text-[#4f6ef7] hover:underline"
        >
          Try again
        </button>
      </div>
    )
  }

  if (!goals || goals.length === 0) {
    return (
      <p className="py-4 text-center text-sm text-[#888]">
        No goals generated. Try logging more workouts first.
      </p>
    )
  }

  return (
    <div className="space-y-3">
      {goals.map((goal, i) => {
        const increase = goal.target1RM - goal.current1RM
        const pct = ((increase / goal.current1RM) * 100).toFixed(1)
        return (
          <div key={i} className="rounded-lg border border-[#1e1e2e] bg-[#0d0d15] p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="font-medium text-white">{goal.exercise}</span>
              <span className="rounded-full bg-[#22c55e15] px-2 py-0.5 text-xs font-semibold text-[#22c55e]">
                +{pct}%
              </span>
            </div>
            <div className="mb-2 flex items-center gap-4 text-sm">
              <div>
                <span className="text-[#888]">Now: </span>
                <span className="font-semibold text-white">{goal.current1RM}kg</span>
              </div>
              <svg width="16" height="8" className="text-[#555]">
                <path d="M0 4 L12 4 M10 1 L14 4 L10 7" stroke="currentColor" fill="none" strokeWidth="1.5" />
              </svg>
              <div>
                <span className="text-[#888]">Target: </span>
                <span className="font-semibold text-[#4f6ef7]">{goal.target1RM}kg</span>
              </div>
              <span className="text-xs text-[#555]">{goal.timeframeWeeks}w</span>
            </div>
            {/* Progress bar */}
            <div className="mb-2 h-1.5 w-full overflow-hidden rounded-full bg-[#1a1a2e]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#4f6ef7] to-[#22c55e]"
                style={{ width: '0%' }}
              />
            </div>
            <p className="text-xs text-[#888]">{goal.weeklyPlan}</p>
          </div>
        )
      })}
      <button
        onClick={generate}
        className="w-full rounded-lg border border-[#1e1e2e] py-2 text-xs text-[#888] transition-colors hover:border-[#4f6ef7] hover:text-[#4f6ef7]"
      >
        Regenerate goals
      </button>
    </div>
  )
}
