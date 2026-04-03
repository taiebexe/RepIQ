'use client'

import { AIInsight } from '@/lib/types'

const TYPE_CONFIG: Record<
  AIInsight['type'],
  { color: string; bg: string; label: string }
> = {
  plateau: { color: '#f59e0b', bg: '#f59e0b15', label: 'Plateau' },
  volume: { color: '#4f6ef7', bg: '#4f6ef715', label: 'Volume' },
  frequency: { color: '#14b8a6', bg: '#14b8a615', label: 'Frequency' },
  recovery: { color: '#8b5cf6', bg: '#8b5cf615', label: 'Recovery' },
  progress: { color: '#22c55e', bg: '#22c55e15', label: 'Progress' },
}

export default function InsightCard({ insight }: { insight: AIInsight }) {
  const config = TYPE_CONFIG[insight.type] || TYPE_CONFIG.progress

  return (
    <div
      className="rounded-xl border border-[#1e1e2e] bg-[#111118] p-5 transition-colors hover:border-[#2e2e3e]"
      style={{ borderLeftWidth: '3px', borderLeftColor: config.color }}
    >
      <div className="mb-3 flex items-center gap-2">
        <span
          className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
          style={{ color: config.color, backgroundColor: config.bg }}
        >
          {config.label}
        </span>
      </div>
      <p className="mb-2 text-sm font-semibold text-white">{insight.title}</p>
      <p className="text-[13px] leading-relaxed text-[#999]">{insight.body}</p>
    </div>
  )
}

export function InsightSkeleton() {
  return (
    <div className="animate-pulse rounded-xl border border-[#1e1e2e] bg-[#111118] p-5">
      <div className="mb-3 h-5 w-16 rounded-full bg-[#1e1e2e]" />
      <div className="mb-2 h-4 w-28 rounded bg-[#1e1e2e]" />
      <div className="space-y-2">
        <div className="h-3 w-full rounded bg-[#1e1e2e]" />
        <div className="h-3 w-3/4 rounded bg-[#1e1e2e]" />
      </div>
    </div>
  )
}
