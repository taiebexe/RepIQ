'use client'

import { useState } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Area,
  AreaChart,
} from 'recharts'
import { LiftSession } from '@/lib/types'

export default function ProgressChart({
  topLifts,
}: {
  topLifts: Record<string, LiftSession[]>
}) {
  const exercises = Object.keys(topLifts)
  const [selected, setSelected] = useState(exercises[0] || '')

  const sessions = topLifts[selected] || []

  if (exercises.length === 0) {
    return (
      <div className="flex h-[300px] items-center justify-center text-sm text-[#888]">
        No lift data available yet. Keep training!
      </div>
    )
  }

  // Calculate progress
  const firstRM = sessions[0]?.estimated1RM || 0
  const lastRM = sessions[sessions.length - 1]?.estimated1RM || 0
  const change = firstRM > 0 ? ((lastRM - firstRM) / firstRM) * 100 : 0
  const isUp = change > 0

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          className="rounded-lg border border-[#1e1e2e] bg-[#0a0a0f] px-3 py-2 text-sm text-white outline-none focus:border-[#4f6ef7]"
        >
          {exercises.map((ex) => (
            <option key={ex} value={ex}>{ex}</option>
          ))}
        </select>

        {sessions.length >= 2 && (
          <div className="flex items-center gap-2">
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                isUp
                  ? 'bg-[#22c55e15] text-[#22c55e]'
                  : 'bg-[#ef444415] text-[#ef4444]'
              }`}
            >
              {isUp ? '+' : ''}{change.toFixed(1)}%
            </span>
            <span className="text-xs text-[#888]">
              {firstRM}kg → {lastRM}kg over {sessions.length} sessions
            </span>
          </div>
        )}
      </div>

      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={sessions}>
          <defs>
            <linearGradient id="colorRM" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#4f6ef7" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#4f6ef7" stopOpacity={0} />
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
          <YAxis
            stroke="#555"
            fontSize={11}
            domain={['dataMin - 5', 'dataMax + 5']}
            tickFormatter={(v) => `${v}kg`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#111118',
              border: '1px solid #1e1e2e',
              borderRadius: '8px',
              fontSize: '12px',
            }}
            labelFormatter={(v) =>
              new Date(v).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
              })
            }
            formatter={(value) => [`${value}kg`, 'Est. 1RM']}
          />
          <Area
            type="monotone"
            dataKey="estimated1RM"
            stroke="#4f6ef7"
            strokeWidth={2}
            fill="url(#colorRM)"
            dot={{ fill: '#4f6ef7', r: 3, strokeWidth: 0 }}
            activeDot={{ fill: '#4f6ef7', r: 5, strokeWidth: 2, stroke: '#fff' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
