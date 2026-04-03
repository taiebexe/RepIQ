'use client'

import { PlateauSignal } from '@/lib/types'

const TREND_CONFIG = {
  plateau: { color: '#f59e0b', bg: '#f59e0b15', label: 'Plateaued', icon: '~' },
  declining: { color: '#ef4444', bg: '#ef444415', label: 'Declining', icon: '\u2193' },
  gaining: { color: '#22c55e', bg: '#22c55e15', label: 'Gaining', icon: '\u2191' },
}

export default function PlateauSection({
  plateaus,
}: {
  plateaus: PlateauSignal[]
}) {
  if (plateaus.length === 0) {
    return (
      <div className="rounded-xl border border-[#1e1e2e] bg-[#111118] p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#22c55e15]">
            <svg
              className="h-5 w-5 text-[#22c55e]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-white">All clear</p>
            <p className="text-xs text-[#888]">
              No plateau or decline signals detected. Your lifts are progressing well.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {plateaus.map((p) => {
        const config = TREND_CONFIG[p.trend] || TREND_CONFIG.plateau
        return (
          <div
            key={p.exercise}
            className="rounded-xl border border-[#1e1e2e] bg-[#111118] p-5 transition-colors hover:border-[#2e2e3e]"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold text-white">{p.exercise}</p>
                <p className="mt-1 text-xs text-[#888]">
                  Stalled for {p.sessionsStalled} sessions — last PR was{' '}
                  {p.lastPRWeightKg}kg on{' '}
                  {new Date(p.lastPRDate).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </p>
              </div>
              <span
                className="flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold"
                style={{ color: config.color, backgroundColor: config.bg }}
              >
                {config.icon} {config.label}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
