'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { MuscleDistribution as MuscleDistData } from '@/lib/types'

const COLORS: Record<string, string> = {
  Chest: '#4f6ef7',
  Back: '#22c55e',
  Legs: '#f59e0b',
  Shoulders: '#8b5cf6',
  Arms: '#14b8a6',
  Core: '#ec4899',
  Other: '#6b7280',
}

export default function MuscleDistribution({ data }: { data: MuscleDistData[] }) {
  if (data.length === 0) {
    return (
      <div className="flex h-[280px] items-center justify-center text-sm text-[#888]">
        No muscle data available
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-4 md:flex-row">
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie
            data={data}
            dataKey="sets"
            nameKey="group"
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={2}
            strokeWidth={0}
          >
            {data.map((entry) => (
              <Cell
                key={entry.group}
                fill={COLORS[entry.group] || '#6b7280'}
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: '#111118',
              border: '1px solid #1e1e2e',
              borderRadius: '8px',
              fontSize: '12px',
            }}
            formatter={(value, name) => [
              `${value} sets`,
              name,
            ]}
          />
        </PieChart>
      </ResponsiveContainer>

      <div className="grid w-full grid-cols-2 gap-2 md:w-auto md:grid-cols-1">
        {data.map((d) => (
          <div key={d.group} className="flex items-center gap-2">
            <div
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: COLORS[d.group] || '#6b7280' }}
            />
            <span className="text-xs text-[#888]">
              {d.group}{' '}
              <span className="font-medium text-white">{d.percentage}%</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
