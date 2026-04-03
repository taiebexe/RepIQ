'use client'

interface PR {
  exercise: string
  type: string
  value: number
  date: string
}

export default function PRTimeline({ data }: { data: PR[] }) {
  if (data.length === 0) {
    return (
      <div className="rounded-xl border border-[#1e1e2e] bg-[#111118] p-6 text-center text-sm text-[#888]">
        No personal records found. Keep training!
      </div>
    )
  }

  // Group by date
  const grouped: Record<string, PR[]> = {}
  for (const pr of data) {
    if (!grouped[pr.date]) grouped[pr.date] = []
    grouped[pr.date].push(pr)
  }

  const dates = Object.keys(grouped).sort((a, b) => b.localeCompare(a))

  return (
    <div className="space-y-4">
      {dates.map((date) => (
        <div key={date} className="flex gap-4">
          <div className="flex flex-col items-center">
            <div className="h-3 w-3 rounded-full bg-[#f59e0b]" />
            <div className="w-px flex-1 bg-[#1e1e2e]" />
          </div>
          <div className="flex-1 pb-4">
            <p className="mb-2 text-xs font-medium text-[#888]">
              {new Date(date).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </p>
            <div className="space-y-2">
              {grouped[date].map((pr, i) => (
                <div
                  key={i}
                  className="rounded-lg border border-[#1e1e2e] bg-[#111118] p-3 transition-colors hover:border-[#2e2e3e]"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-white">
                        {pr.exercise}
                      </p>
                      <p className="text-[10px] text-[#888]">{pr.type}</p>
                    </div>
                    <span className="text-sm font-bold text-[#f59e0b]">
                      {pr.value}
                      {pr.type.toLowerCase().includes('weight') ? 'kg' : ''}
                      {pr.type.toLowerCase().includes('rep') ? ' reps' : ''}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
