'use client'

import { FrequencyDay } from '@/lib/types'

function getColor(count: number): string {
  if (count === 0) return '#1a1a24'
  if (count === 1) return '#14532d'
  if (count === 2) return '#16a34a'
  return '#22c55e'
}

export default function FrequencyGrid({ data }: { data: FrequencyDay[] }) {
  const totalWorkouts = data.reduce((sum, d) => sum + d.count, 0)
  const activeDays = data.filter((d) => d.count > 0).length

  const firstDate = new Date(data[0]?.date || new Date())
  const firstDow = (firstDate.getDay() + 6) % 7

  const cells: { date: string; count: number; empty: boolean }[] = []
  for (let i = 0; i < firstDow; i++) {
    cells.push({ date: '', count: 0, empty: true })
  }
  for (const d of data) {
    cells.push({ date: d.date, count: d.count, empty: false })
  }
  while (cells.length % 7 !== 0) {
    cells.push({ date: '', count: 0, empty: true })
  }

  const numCols = Math.ceil(cells.length / 7)

  const grid: typeof cells = []
  for (let row = 0; row < 7; row++) {
    for (let col = 0; col < numCols; col++) {
      const idx = col * 7 + row
      grid.push(cells[idx] || { date: '', count: 0, empty: true })
    }
  }

  const dayLabels = ['M', '', 'W', '', 'F', '', 'S']

  return (
    <div>
      <div className="mb-4 flex items-baseline gap-4">
        <p className="text-sm text-[#888]">
          <span className="text-lg font-semibold text-white">{totalWorkouts}</span>{' '}
          workouts in 90 days
        </p>
        <p className="text-sm text-[#888]">
          <span className="font-medium text-[#22c55e]">{activeDays}</span> active days
        </p>
      </div>
      <div className="flex gap-2">
        <div className="flex flex-col gap-[3px]">
          {dayLabels.map((label, i) => (
            <div
              key={i}
              className="flex h-[14px] items-center text-[10px] text-[#555]"
            >
              {label}
            </div>
          ))}
        </div>
        <div
          className="grid gap-[3px]"
          style={{
            gridTemplateColumns: `repeat(${numCols}, 14px)`,
            gridTemplateRows: 'repeat(7, 14px)',
          }}
        >
          {grid.map((cell, i) => (
            <div
              key={i}
              className="rounded-[2px] transition-colors"
              style={{
                width: 14,
                height: 14,
                backgroundColor: cell.empty ? 'transparent' : getColor(cell.count),
              }}
              title={
                cell.date
                  ? `${cell.date}: ${cell.count} workout${cell.count !== 1 ? 's' : ''}`
                  : ''
              }
            />
          ))}
        </div>
      </div>
      <div className="mt-3 flex items-center gap-1.5 text-[10px] text-[#555]">
        <span>Less</span>
        {[0, 1, 2, 3].map((n) => (
          <div
            key={n}
            className="rounded-[2px]"
            style={{ width: 10, height: 10, backgroundColor: getColor(n) }}
          />
        ))}
        <span>More</span>
      </div>
    </div>
  )
}
