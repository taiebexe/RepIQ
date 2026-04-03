'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from 'recharts'
import { WeeklyVolume } from '@/lib/types'

const MUSCLE_COLORS: Record<string, string> = {
  Chest: '#4f6ef7',
  Back: '#22c55e',
  Legs: '#f59e0b',
  Shoulders: '#8b5cf6',
  Arms: '#14b8a6',
  Core: '#ec4899',
  Other: '#6b7280',
}

export default function VolumeChart({ data }: { data: WeeklyVolume[] }) {
  const allGroups = new Set<string>()
  for (const week of data) {
    for (const group of Object.keys(week.muscleGroups)) {
      allGroups.add(group)
    }
  }

  const chartData = data.map((week) => ({
    week: week.weekLabel,
    ...week.muscleGroups,
  }))

  const groups = Array.from(allGroups).sort((a, b) => {
    const order = ['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core', 'Other']
    return order.indexOf(a) - order.indexOf(b)
  })

  if (groups.length === 0) {
    return (
      <div className="flex h-[300px] items-center justify-center text-sm text-[#888]">
        No volume data available yet
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2e" />
        <XAxis dataKey="week" stroke="#555" fontSize={11} />
        <YAxis
          stroke="#555"
          fontSize={11}
          label={{
            value: 'Sets',
            angle: -90,
            position: 'insideLeft',
            style: { fill: '#555', fontSize: 11 },
          }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#111118',
            border: '1px solid #1e1e2e',
            borderRadius: '8px',
            fontSize: '12px',
          }}
        />
        <Legend
          wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
          iconType="circle"
          iconSize={8}
        />
        {groups.map((group) => (
          <Bar
            key={group}
            dataKey={group}
            stackId="volume"
            fill={MUSCLE_COLORS[group] || '#6b7280'}
            name={group}
            radius={group === groups[groups.length - 1] ? [2, 2, 0, 0] : undefined}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  )
}
