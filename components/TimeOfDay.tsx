'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from 'recharts'
import { TimeOfDayBucket } from '@/lib/types'

function getBarColor(hour: number): string {
  if (hour >= 5 && hour < 9) return '#f59e0b'   // early morning
  if (hour >= 9 && hour < 12) return '#22c55e'   // morning
  if (hour >= 12 && hour < 17) return '#4f6ef7'  // afternoon
  if (hour >= 17 && hour < 21) return '#8b5cf6'  // evening
  return '#6b7280'                                 // night
}

export default function TimeOfDay({ data }: { data: TimeOfDayBucket[] }) {
  // Only show hours 5am-11pm for cleaner display
  const filtered = data.filter((d) => d.hour >= 5 && d.hour <= 23)
  const totalWorkouts = data.reduce((s, d) => s + d.count, 0)
  const peakHour = data.reduce((best, d) => (d.count > best.count ? d : best), data[0])

  if (totalWorkouts === 0) {
    return (
      <div className="flex h-[200px] items-center justify-center text-sm text-[#888]">
        No time data available
      </div>
    )
  }

  return (
    <div>
      <div className="mb-3 flex items-center gap-4">
        <span className="text-xs text-[#888]">
          Peak hour:{' '}
          <span className="font-medium text-white">{peakHour?.label}</span>
        </span>
        <div className="flex items-center gap-2 text-[10px] text-[#888]">
          <span className="flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-full bg-[#f59e0b]" />
            Early
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-full bg-[#22c55e]" />
            Morning
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-full bg-[#4f6ef7]" />
            Afternoon
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-full bg-[#8b5cf6]" />
            Evening
          </span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={filtered}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2e" vertical={false} />
          <XAxis dataKey="label" stroke="#555" fontSize={10} />
          <YAxis stroke="#555" fontSize={11} allowDecimals={false} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#111118',
              border: '1px solid #1e1e2e',
              borderRadius: '8px',
              fontSize: '12px',
            }}
            formatter={(value) => [`${value} workouts`, 'Count']}
          />
          <Bar dataKey="count" radius={[3, 3, 0, 0]}>
            {filtered.map((entry) => (
              <Cell key={entry.hour} fill={getBarColor(entry.hour)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
