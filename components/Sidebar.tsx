'use client'

import { useState } from 'react'

export type Tab = 'dashboard' | 'ai-coach' | 'exercises' | 'records'

const TABS: { id: Tab; label: string; icon: JSX.Element }[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    id: 'ai-coach',
    label: 'AI Coach',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a8 8 0 0 1 8 8c0 3.3-2 6.2-5 7.5V19a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2v-1.5C6 16.2 4 13.3 4 10a8 8 0 0 1 8-8z" />
        <path d="M9 22h6" />
        <path d="M10 2v1" />
        <path d="M14 2v1" />
      </svg>
    ),
  },
  {
    id: 'exercises',
    label: 'Exercises',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6.5 6.5h11" />
        <path d="M6.5 17.5h11" />
        <path d="M4 6.5a2.5 2.5 0 0 1 0-5h0a2.5 2.5 0 0 1 0 5" />
        <path d="M20 6.5a2.5 2.5 0 0 0 0-5h0a2.5 2.5 0 0 0 0 5" />
        <path d="M4 22.5a2.5 2.5 0 0 1 0-5h0a2.5 2.5 0 0 1 0 5" />
        <path d="M20 22.5a2.5 2.5 0 0 0 0-5h0a2.5 2.5 0 0 0 0 5" />
        <path d="M12 2v20" />
      </svg>
    ),
  },
  {
    id: 'records',
    label: 'Records',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5C6 4 6 7 6 7" />
        <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5C18 4 18 7 18 7" />
        <path d="M4 22h16" />
        <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20 7 22" />
        <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20 17 22" />
        <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
      </svg>
    ),
  },
]

export default function Sidebar({
  activeTab,
  onTabChange,
  collapsed,
  onToggle,
}: {
  activeTab: Tab
  onTabChange: (tab: Tab) => void
  collapsed: boolean
  onToggle: () => void
}) {
  return (
    <aside
      className={`fixed left-0 top-0 z-30 flex h-screen flex-col border-r border-[#1e1e2e] bg-[#0c0c14] transition-all duration-300 ${
        collapsed ? 'w-[68px]' : 'w-[220px]'
      }`}
    >
      {/* Logo */}
      <div className="flex h-16 items-center gap-2.5 border-b border-[#1e1e2e] px-4">
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-[#4f6ef7]">
          <span className="text-sm font-bold text-white">R</span>
        </div>
        {!collapsed && (
          <span className="text-lg font-bold text-white">RepIQ</span>
        )}
        <button
          onClick={onToggle}
          className={`ml-auto flex h-6 w-6 items-center justify-center rounded text-[#555] transition-colors hover:bg-[#1e1e2e] hover:text-white ${
            collapsed ? 'mx-auto ml-0' : ''
          }`}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`transition-transform ${collapsed ? 'rotate-180' : ''}`}
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                isActive
                  ? 'bg-[#4f6ef715] text-[#4f6ef7]'
                  : 'text-[#888] hover:bg-[#1e1e2e] hover:text-white'
              }`}
              title={collapsed ? tab.label : undefined}
            >
              <span className={`flex-shrink-0 ${isActive ? 'text-[#4f6ef7]' : ''}`}>
                {tab.icon}
              </span>
              {!collapsed && <span>{tab.label}</span>}
            </button>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-[#1e1e2e] px-3 py-3">
        <a
          href="https://paypal.me/TaiebBourbia"
          target="_blank"
          rel="noopener noreferrer"
          className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-all hover:bg-[#f59e0b15] ${
            collapsed ? 'justify-center' : ''
          }`}
          title={collapsed ? 'Buy me a coffee' : undefined}
        >
          <span className="flex-shrink-0 text-base">☕</span>
          {!collapsed && (
            <span className="text-xs font-medium text-[#f59e0b]">Buy me a coffee</span>
          )}
        </a>
        {!collapsed && (
          <p className="mt-1 text-center text-[10px] text-[#333]">v1.0.0</p>
        )}
      </div>
    </aside>
  )
}
