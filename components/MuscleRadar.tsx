'use client'

import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import { MuscleDistribution } from '@/lib/types'

export default function MuscleRadar({ data }: { data: MuscleDistribution[] }) {
  const filtered = data.filter((d) => d.group !== 'Other')

  if (filtered.length < 3) {
    return (
      <div className="flex h-[280px] items-center justify-center text-sm text-[#888]">
        Not enough muscle groups to display radar
      </div>
    )
  }

  // Normalize to 0-100 scale
  const maxSets = Math.max(...filtered.map((d) => d.sets))
  const radarData = filtered.map((d) => ({
    group: d.group,
    value: maxSets > 0 ? Math.round((d.sets / maxSets) * 100) : 0,
    sets: d.sets,
  }))

  return (
    <ResponsiveContainer width="100%" height={280}>
      <RadarChart data={radarData}>
        <PolarGrid stroke="#1e1e2e" />
        <PolarAngleAxis
          dataKey="group"
          tick={{ fill: '#888', fontSize: 11 }}
        />
        <Radar
          dataKey="value"
          stroke="#4f6ef7"
          fill="#4f6ef7"
          fillOpacity={0.2}
          strokeWidth={2}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#111118',
            border: '1px solid #1e1e2e',
            borderRadius: '8px',
            fontSize: '12px',
          }}
          formatter={(_value, _name, props: any) => [
            `${props?.payload?.sets ?? 0} sets`,
            props?.payload?.group ?? '',
          ]}
        />
      </RadarChart>
    </ResponsiveContainer>
  )
}
