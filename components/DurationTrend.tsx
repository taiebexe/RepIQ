'use client'

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
} from 'recharts'
import { SessionDuration } from '@/lib/types'

export default function DurationTrend({ data }: { data: SessionDuration[] }) {
  if (data.length === 0) {
    return (
      <div className="flex h-[250px] items-center justify-center text-sm text-[#888]">
        No duration data available
      </div>
    )
  }

  const avg = Math.round(
    data.reduce((s, d) => s + d.durationMin, 0) / data.length
  )

  return (
    <div>
      <div className="mb-3 flex items-baseline gap-2">
        <span className="text-xs text-[#888]">
          Average: <span className="font-medium text-white">{avg} min</span>
        </span>
      </div>
      <ResponsiveContainer width="100%" height={230}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorDur" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2e" />
          <XAxis
            dataKey="date"
            stroke="#555"
            fontSize={11}
            tickFormatter={(v) =>
              new Date(v).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              })
            }
          />
          <YAxis stroke="#555" fontSize={11} tickFormatter={(v) => `${v}m`} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#111118',
              border: '1px solid #1e1e2e',
              borderRadius: '8px',
              fontSize: '12px',
            }}
            formatter={(value) => [`${value} min`, 'Duration']}
            labelFormatter={(v) =>
              new Date(v).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
              })
            }
          />
          <ReferenceLine
            y={avg}
            stroke="#8b5cf6"
            strokeDasharray="4 4"
            strokeOpacity={0.5}
          />
          <Area
            type="monotone"
            dataKey="durationMin"
            stroke="#8b5cf6"
            strokeWidth={2}
            fill="url(#colorDur)"
            dot={{ fill: '#8b5cf6', r: 2, strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
