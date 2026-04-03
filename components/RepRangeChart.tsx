'use client'

import { RepRangeBreakdown } from '@/lib/types'

const RANGE_COLORS: Record<string, { color: string; bg: string }> = {
  'Strength (1-5)': { color: '#ef4444', bg: '#ef444425' },
  'Hypertrophy (6-12)': { color: '#4f6ef7', bg: '#4f6ef725' },
  'Endurance (13-20)': { color: '#22c55e', bg: '#22c55e25' },
  'High Rep (21+)': { color: '#f59e0b', bg: '#f59e0b25' },
}

export default function RepRangeChart({ data }: { data: RepRangeBreakdown[] }) {
  if (data.length === 0) {
    return (
      <div className="flex h-[200px] items-center justify-center text-sm text-[#888]">
        No rep data available
      </div>
    )
  }

  const maxCount = Math.max(...data.map((d) => d.count))

  return (
    <div className="space-y-3">
      {data.map((d) => {
        const style = RANGE_COLORS[d.range] || { color: '#888', bg: '#88888825' }
        const width = maxCount > 0 ? (d.count / maxCount) * 100 : 0

        return (
          <div key={d.range}>
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-xs font-medium text-[#ccc]">{d.range}</span>
              <span className="text-xs text-[#888]">
                {d.count} sets ({d.percentage}%)
              </span>
            </div>
            <div className="h-6 w-full overflow-hidden rounded-md bg-[#0a0a0f]">
              <div
                className="flex h-full items-center rounded-md px-2 transition-all duration-500"
                style={{
                  width: `${Math.max(width, 2)}%`,
                  backgroundColor: style.bg,
                  borderLeft: `3px solid ${style.color}`,
                }}
              >
                <span
                  className="text-[10px] font-semibold"
                  style={{ color: style.color }}
                >
                  {d.percentage}%
                </span>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
