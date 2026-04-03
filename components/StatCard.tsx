'use client'

export default function StatCard({
  label,
  value,
  sub,
  icon,
  accent,
}: {
  label: string
  value: string
  sub?: string
  icon?: React.ReactNode
  accent?: string
}) {
  return (
    <div className="group rounded-xl border border-[#1e1e2e] bg-[#111118] p-5 transition-colors hover:border-[#2e2e3e]">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-[#666]">
            {label}
          </p>
          <p
            className="mt-2 text-2xl font-semibold"
            style={{ color: accent || '#fff' }}
          >
            {value}
          </p>
          {sub && <p className="mt-1 text-xs text-[#888]">{sub}</p>}
        </div>
        {icon && (
          <div className="rounded-lg bg-[#1e1e2e] p-2 text-[#888]">{icon}</div>
        )}
      </div>
    </div>
  )
}
