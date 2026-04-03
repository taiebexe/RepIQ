'use client'

import { ExerciseRank } from '@/lib/types'

const TREND_ICON = {
  up: { symbol: '\u2191', color: '#22c55e' },
  down: { symbol: '\u2193', color: '#ef4444' },
  stable: { symbol: '~', color: '#888' },
}

const GROUP_COLORS: Record<string, string> = {
  Chest: '#4f6ef7',
  Back: '#22c55e',
  Legs: '#f59e0b',
  Shoulders: '#8b5cf6',
  Arms: '#14b8a6',
  Core: '#ec4899',
  Other: '#6b7280',
}

export default function ExerciseRanking({ data }: { data: ExerciseRank[] }) {
  if (data.length === 0) {
    return (
      <div className="rounded-xl border border-[#1e1e2e] bg-[#111118] p-6 text-center text-sm text-[#888]">
        No exercise data available
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-[#1e1e2e] text-[11px] uppercase tracking-wider text-[#666]">
            <th className="pb-3 pr-4">#</th>
            <th className="pb-3 pr-4">Exercise</th>
            <th className="pb-3 pr-4 text-right">Sessions</th>
            <th className="hidden pb-3 pr-4 text-right md:table-cell">Volume</th>
            <th className="pb-3 pr-4 text-right">Best 1RM</th>
            <th className="pb-3 text-right">Trend</th>
          </tr>
        </thead>
        <tbody>
          {data.map((ex, i) => {
            const trend = TREND_ICON[ex.trend]
            return (
              <tr
                key={ex.title}
                className="border-b border-[#1e1e2e]/50 transition-colors hover:bg-[#1e1e2e]/30"
              >
                <td className="py-3 pr-4 text-xs text-[#555]">{i + 1}</td>
                <td className="py-3 pr-4">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-2 w-2 rounded-full"
                      style={{
                        backgroundColor: GROUP_COLORS[ex.muscleGroup] || '#6b7280',
                      }}
                    />
                    <div>
                      <p className="text-sm font-medium text-white">{ex.title}</p>
                      <p className="text-[10px] text-[#888]">{ex.muscleGroup}</p>
                    </div>
                  </div>
                </td>
                <td className="py-3 pr-4 text-right text-sm text-[#ccc]">
                  {ex.sessions}
                </td>
                <td className="hidden py-3 pr-4 text-right text-sm text-[#ccc] md:table-cell">
                  {ex.totalVolume > 0
                    ? `${(ex.totalVolume / 1000).toFixed(1)}t`
                    : '-'}
                </td>
                <td className="py-3 pr-4 text-right text-sm font-medium text-white">
                  {ex.best1RM > 0 ? `${ex.best1RM}kg` : '-'}
                </td>
                <td className="py-3 text-right">
                  <span
                    className="text-sm font-semibold"
                    style={{ color: trend.color }}
                  >
                    {trend.symbol}
                  </span>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
