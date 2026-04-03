'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardData, AIInsight, AuthSession } from '@/lib/types'
import LoadingOverlay from '@/components/LoadingOverlay'
import StatCard from '@/components/StatCard'
import InsightCard, { InsightSkeleton } from '@/components/InsightCard'
import ProgressChart from '@/components/ProgressChart'
import VolumeChart from '@/components/VolumeChart'
import FrequencyGrid from '@/components/FrequencyGrid'
import PlateauSection from '@/components/PlateauSection'

function formatVolume(kg: number): string {
  if (kg >= 1000) return `${(kg / 1000).toFixed(1)}t`
  return `${kg.toLocaleString('en-US')} kg`
}

export default function Dashboard() {
  const router = useRouter()
  const [data, setData] = useState<DashboardData | null>(null)
  const [insights, setInsights] = useState<AIInsight[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingMsg, setLoadingMsg] = useState('Fetching your Hevy data...')
  const [error, setError] = useState('')
  const [authType, setAuthType] = useState<string>('')

  useEffect(() => {
    const authStr = sessionStorage.getItem('hevy_auth')
    if (!authStr) {
      router.push('/')
      return
    }

    const auth: AuthSession = JSON.parse(authStr)
    setAuthType(auth.type)

    // Build request body based on auth type
    const body =
      auth.type === 'credentials'
        ? { authType: 'credentials', accessToken: auth.accessToken, username: auth.username }
        : { authType: 'api_key', apiKey: auth.apiKey }

    setLoadingMsg('Fetching your workouts...')

    fetch('/api/hevy/workouts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch workouts')
        return res.json()
      })
      .then((dashData: DashboardData) => {
        setData(dashData)
        setLoading(false)

        // Fetch AI insights in parallel
        fetch('/api/insights', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            aiContext: dashData.aiContext,
            plateaus: dashData.plateaus,
          }),
        })
          .then((res) => res.json())
          .then((d) => setInsights(d.insights))
          .catch(() => setInsights([]))
      })
      .catch((err) => {
        setError(err.message)
        setLoading(false)
      })
  }, [router])

  function handleDisconnect() {
    sessionStorage.removeItem('hevy_auth')
    router.push('/')
  }

  if (loading) return <LoadingOverlay message={loadingMsg} />

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a0f]">
        <div className="max-w-sm text-center">
          <div className="mb-4 text-4xl">:(</div>
          <p className="mb-2 text-sm text-red-400">{error}</p>
          <button
            onClick={handleDisconnect}
            className="rounded-lg bg-[#1e1e2e] px-4 py-2 text-sm text-white hover:bg-[#2e2e3e]"
          >
            Go back
          </button>
        </div>
      </div>
    )
  }

  if (!data) return null

  const liftCount = Object.keys(data.topLifts).length

  return (
    <div className="min-h-screen bg-[#0a0a0f] px-4 py-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-[#4f6ef7]">RepIQ</h1>
            {authType === 'credentials' && (
              <span className="rounded-full bg-[#22c55e15] px-2 py-0.5 text-[10px] font-semibold text-[#22c55e]">
                FULL ACCESS
              </span>
            )}
          </div>
          <button
            onClick={handleDisconnect}
            className="rounded-lg border border-[#1e1e2e] px-4 py-2 text-sm text-[#888] transition-colors hover:border-red-500/30 hover:text-red-400"
          >
            Disconnect
          </button>
        </div>

        {/* Summary Stats */}
        <div className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
          <StatCard
            label="Workouts"
            value={String(data.summary.totalWorkouts)}
            sub="Last 90 days"
            icon={
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5" />
              </svg>
            }
          />
          <StatCard
            label="Volume"
            value={formatVolume(data.summary.totalVolumeKg)}
            sub="Total weight moved"
          />
          <StatCard
            label="Top Group"
            value={data.summary.topMuscleGroup}
            sub="Most trained"
            accent="#4f6ef7"
          />
          <StatCard
            label="Streak"
            value={`${data.summary.trainingStreakWeeks}w`}
            sub="Consecutive weeks"
            accent={data.summary.trainingStreakWeeks >= 4 ? '#22c55e' : '#f59e0b'}
          />
          <StatCard
            label="Avg Duration"
            value={`${data.summary.avgSessionDurationMin}m`}
            sub="Per session"
          />
          <StatCard
            label="Frequency"
            value={`${data.summary.avgSessionsPerWeek}/wk`}
            sub="Avg sessions"
          />
        </div>

        {/* AI Insights */}
        <section className="mb-8">
          <div className="mb-4 flex items-center gap-2">
            <h2 className="text-lg font-semibold text-white">AI Coach Insights</h2>
            <span className="rounded-full bg-[#4f6ef715] px-2 py-0.5 text-[10px] font-semibold text-[#4f6ef7]">
              CLAUDE
            </span>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {insights === null ? (
              <>
                <InsightSkeleton />
                <InsightSkeleton />
                <InsightSkeleton />
              </>
            ) : insights.length > 0 ? (
              insights.map((insight, i) => (
                <InsightCard key={i} insight={insight} />
              ))
            ) : (
              <p className="col-span-3 rounded-xl border border-[#1e1e2e] bg-[#111118] p-6 text-center text-sm text-[#888]">
                Configure ANTHROPIC_API_KEY in .env.local for AI insights
              </p>
            )}
          </div>
        </section>

        {/* Charts Grid */}
        <div className="mb-8 grid gap-6 lg:grid-cols-2">
          {/* Lift Progression */}
          <section>
            <h2 className="mb-4 text-lg font-semibold text-white">
              Lift Progression
              {liftCount > 0 && (
                <span className="ml-2 text-sm font-normal text-[#888]">
                  {liftCount} exercises tracked
                </span>
              )}
            </h2>
            <div className="rounded-xl border border-[#1e1e2e] bg-[#111118] p-5">
              <ProgressChart topLifts={data.topLifts} />
            </div>
          </section>

          {/* Weekly Volume */}
          <section>
            <h2 className="mb-4 text-lg font-semibold text-white">
              Weekly Volume
              <span className="ml-2 text-sm font-normal text-[#888]">
                Sets by muscle group
              </span>
            </h2>
            <div className="rounded-xl border border-[#1e1e2e] bg-[#111118] p-5">
              <VolumeChart data={data.weeklyVolume} />
            </div>
          </section>
        </div>

        {/* Training Frequency */}
        <section className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-white">
            Training Frequency
          </h2>
          <div className="rounded-xl border border-[#1e1e2e] bg-[#111118] p-5">
            <FrequencyGrid data={data.frequency} />
          </div>
        </section>

        {/* Recent PRs */}
        {data.recentPRs && data.recentPRs.length > 0 && (
          <section className="mb-8">
            <h2 className="mb-4 text-lg font-semibold text-white">
              Recent PRs
              <span className="ml-2 text-sm font-normal text-[#888]">
                Personal records
              </span>
            </h2>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {data.recentPRs.slice(0, 6).map((pr, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-[#1e1e2e] bg-[#111118] p-4 transition-colors hover:border-[#2e2e3e]"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-white">{pr.exercise}</p>
                      <p className="mt-1 text-xs text-[#888]">{pr.type}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-[#f59e0b]">
                        {pr.value}
                        {pr.type.toLowerCase().includes('weight') ? 'kg' : ''}
                      </p>
                      <p className="text-[10px] text-[#888]">
                        {new Date(pr.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Plateau Signals */}
        <section className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-white">
            Strength Signals
          </h2>
          <PlateauSection plateaus={data.plateaus} />
        </section>

        {/* Footer */}
        <footer className="border-t border-[#1e1e2e] py-6 text-center text-xs text-[#555]">
          RepIQ — AI-powered workout analytics
        </footer>
      </div>
    </div>
  )
}
