'use client'

export default function TopBar({
  username,
  authType,
  onDisconnect,
  sidebarCollapsed,
}: {
  username: string
  authType: string
  onDisconnect: () => void
  sidebarCollapsed: boolean
}) {
  const initials = username
    .split(/[\s._-]/)
    .map((w) => w[0]?.toUpperCase() || '')
    .slice(0, 2)
    .join('')

  return (
    <header
      className={`fixed right-0 top-0 z-20 flex h-16 items-center justify-between border-b border-[#1e1e2e] bg-[#0a0a0f]/80 px-6 backdrop-blur-sm transition-all duration-300 ${
        sidebarCollapsed ? 'left-[68px]' : 'left-[220px]'
      }`}
    >
      <div />

      {/* Right side: account info + logout */}
      <div className="flex items-center gap-4">
        {/* Auth badge */}
        {authType === 'credentials' && (
          <span className="rounded-full bg-[#22c55e15] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-[#22c55e]">
            Full Access
          </span>
        )}
        {authType === 'api_key' && (
          <span className="rounded-full bg-[#f59e0b15] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-[#f59e0b]">
            API Key
          </span>
        )}

        {/* Account */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#4f6ef7]">
            <span className="text-xs font-bold text-white">{initials || 'U'}</span>
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium leading-tight text-white">{username}</p>
            <p className="text-[10px] leading-tight text-[#555]">Hevy Account</p>
          </div>
        </div>

        {/* Divider */}
        <div className="h-6 w-px bg-[#1e1e2e]" />

        {/* Logout */}
        <button
          onClick={onDisconnect}
          className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-[#888] transition-colors hover:bg-[#1e1e2e] hover:text-red-400"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16,17 21,12 16,7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  )
}
