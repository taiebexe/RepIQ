'use client'

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Bar,
  ComposedChart,
  Line,
} from 'recharts'
import { WeeklyVolumeTrend } from '@/lib/types'

export default function VolumeTrend({ data }: { data: WeeklyVolumeTrend[] }) {
  if (data.length === 0) {
    return (
      <div className="flex h-[250px] items-center justify-center text-sm text-[#888]">
        No volume data available
      </div>
    )
  }

  const maxVol = Math.max(...data.map((d) => d.totalVolume))
  const hasVolume = maxVol > 0

  return (
    <ResponsiveContainer width="100%" height={250}>
      <ComposedChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2e" />
        <XAxis dataKey="weekLabel" stroke="#555" fontSize={11} />
        <YAxis
          yAxisId="left"
          stroke="#555"
          fontSize={11}
          tickFormatter={(v) =>
            hasVolume ? (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)) : String(v)
          }
        />
        <YAxis
          yAxisId="right"
          orientation="right"
          stroke="#555"
          fontSize={11}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#111118',
            border: '1px solid #1e1e2e',
            borderRadius: '8px',
            fontSize: '12px',
          }}
          formatter={(value, name) => {
            if (name === 'Volume (kg)') return [`${Number(value).toLocaleString()} kg`, name]
            return [String(value), String(name)]
          }}
        />
        {hasVolume && (
          <Bar
            yAxisId="left"
            dataKey="totalVolume"
            fill="#22c55e"
            fillOpacity={0.3}
            radius={[2, 2, 0, 0]}
            name="Volume (kg)"
          />
        )}
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="totalSets"
          stroke="#4f6ef7"
          strokeWidth={2}
          dot={{ fill: '#4f6ef7', r: 3, strokeWidth: 0 }}
          name="Sets"
        />
      </ComposedChart>
    </ResponsiveContainer>
  )
}
