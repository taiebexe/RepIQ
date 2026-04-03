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
import MuscleDistribution from '@/components/MuscleDistribution'
import MuscleRadar from '@/components/MuscleRadar'
import DurationTrend from '@/components/DurationTrend'
import VolumeTrend from '@/components/VolumeTrend'
import RepRangeChart from '@/components/RepRangeChart'
import TimeOfDay from '@/components/TimeOfDay'
import ExerciseRanking from '@/components/ExerciseRanking'
import PRTimeline from '@/components/PRTimeline'
import GoalGenerator from '@/components/GoalGenerator'
import DataChat from '@/components/DataChat'
import NutritionHints from '@/components/NutritionHints'
import Sidebar, { Tab } from '@/components/Sidebar'
import TopBar from '@/components/TopBar'

function formatVolume(kg: number): string {
  if (kg >= 1000) return `${(kg / 1000).toFixed(1)}t`
  return `${kg.toLocaleString('en-US')} kg`
}

function SectionCard({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle?: string
  children: React.ReactNode
}) {
  return (
    <section>
      <h2 className="mb-4 text-lg font-semibold text-white">
        {title}
        {subtitle && (
          <span className="ml-2 text-sm font-normal text-[#888]">{subtitle}</span>
        )}
      </h2>
      <div className="rounded-xl border border-[#1e1e2e] bg-[#111118] p-5">
        {children}
      </div>
    </section>
  )
}

export default function Dashboard() {
  const router = useRouter()
  const [data, setData] = useState<DashboardData | null>(null)
  const [insights, setInsights] = useState<AIInsight[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingMsg, setLoadingMsg] = useState('Fetching your Hevy data...')
  const [error, setError] = useState('')
  const [authType, setAuthType] = useState<string>('')
  const [username, setUsername] = useState<string>('')
  const [activeTab, setActiveTab] = useState<Tab>('dashboard')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  useEffect(() => {
    const authStr = sessionStorage.getItem('hevy_auth')
    if (!authStr) {
      router.push('/')
      return
    }

    const auth: AuthSession = JSON.parse(authStr)
    setAuthType(auth.type)
    setUsername(auth.username || 'User')

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
          <p className="mb-4 text-sm text-red-400">{error}</p>
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
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Top Bar */}
      <TopBar
        username={username}
        authType={authType}
        onDisconnect={handleDisconnect}
        sidebarCollapsed={sidebarCollapsed}
      />

      {/* Main Content */}
      <main
        className={`pt-16 transition-all duration-300 ${
          sidebarCollapsed ? 'ml-[68px]' : 'ml-[220px]'
        }`}
      >
        <div className="mx-auto max-w-7xl space-y-8 px-6 py-8">
          {/* ── Dashboard Tab ── */}
          {activeTab === 'dashboard' && (
            <>
              {/* Page title */}
              <div>
                <h1 className="text-2xl font-bold text-white">Dashboard</h1>
                <p className="mt-1 text-sm text-[#555]">Your training overview at a glance</p>
              </div>

              {/* Summary Stats */}
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
                <StatCard label="Workouts" value={String(data.summary.totalWorkouts)} sub="All time" />
                <StatCard label="Volume" value={formatVolume(data.summary.totalVolumeKg)} sub="Total weight moved" />
                <StatCard label="Total Sets" value={data.summary.totalSets.toLocaleString()} sub="Normal sets" />
                <StatCard
                  label="Streak"
                  value={`${data.summary.trainingStreakWeeks}w`}
                  sub="Consecutive weeks"
                  accent={data.summary.trainingStreakWeeks >= 4 ? '#22c55e' : '#f59e0b'}
                />
                <StatCard label="Avg Duration" value={`${data.summary.avgSessionDurationMin}m`} sub="Per session" />
                <StatCard label="Frequency" value={`${data.summary.avgSessionsPerWeek}/wk`} sub="Avg sessions" />
              </div>

              {/* Muscle Distribution + Balance */}
              <div className="grid gap-6 lg:grid-cols-2">
                <SectionCard title="Muscle Distribution" subtitle="Sets by group">
                  <MuscleDistribution data={data.muscleDistribution} />
                </SectionCard>
                <SectionCard title="Muscle Balance" subtitle="Radar view">
                  <MuscleRadar data={data.muscleDistribution} />
                </SectionCard>
              </div>

              {/* Lift Progression + Weekly Volume */}
              <div className="grid gap-6 lg:grid-cols-2">
                <SectionCard
                  title="Lift Progression"
                  subtitle={liftCount > 0 ? `${liftCount} exercises` : undefined}
                >
                  <ProgressChart topLifts={data.topLifts} />
                </SectionCard>
                <SectionCard title="Weekly Volume" subtitle="Sets by muscle group">
                  <VolumeChart data={data.weeklyVolume} />
                </SectionCard>
              </div>

              {/* Volume Trend + Duration Trend */}
              <div className="grid gap-6 lg:grid-cols-2">
                <SectionCard title="Volume Trend" subtitle="12-week overview">
                  <VolumeTrend data={data.weeklyVolumeTrend} />
                </SectionCard>
                <SectionCard title="Session Duration" subtitle="Over time">
                  <DurationTrend data={data.sessionDurations} />
                </SectionCard>
              </div>

              {/* Rep Ranges + Time of Day */}
              <div className="grid gap-6 lg:grid-cols-2">
                <SectionCard title="Rep Range Distribution" subtitle="Training style">
                  <RepRangeChart data={data.repRanges} />
                </SectionCard>
                <SectionCard title="Workout Time" subtitle="When you train">
                  <TimeOfDay data={data.timeOfDay} />
                </SectionCard>
              </div>

              {/* Training Frequency Heatmap */}
              <SectionCard title="Training Frequency" subtitle="All time">
                <FrequencyGrid data={data.frequency} />
              </SectionCard>

              {/* Strength Signals */}
              <section>
                <h2 className="mb-4 text-lg font-semibold text-white">Strength Signals</h2>
                <PlateauSection plateaus={data.plateaus} />
              </section>
            </>
          )}

          {/* ── AI Coach Tab ── */}
          {activeTab === 'ai-coach' && (
            <>
              <div>
                <h1 className="text-2xl font-bold text-white">AI Coach</h1>
                <p className="mt-1 text-sm text-[#555]">
                  Personalized insights, goals, and nutrition powered by AI
                </p>
              </div>

              {/* AI Insights */}
              <section>
                <div className="mb-4 flex items-center gap-2">
                  <h2 className="text-lg font-semibold text-white">Coaching Insights</h2>
                  <span className="rounded-full bg-[#4f6ef715] px-2 py-0.5 text-[10px] font-semibold text-[#4f6ef7]">
                    AI
                  </span>
                </div>
                <div className="grid gap-3 md:grid-cols-3">
                  {insights === null ? (
                    <><InsightSkeleton /><InsightSkeleton /><InsightSkeleton /></>
                  ) : insights.length > 0 ? (
                    insights.map((insight, i) => <InsightCard key={i} insight={insight} />)
                  ) : (
                    <p className="col-span-3 rounded-xl border border-[#1e1e2e] bg-[#111118] p-6 text-center text-sm text-[#888]">
                      Configure an AI API key in .env.local for personalized insights
                    </p>
                  )}
                </div>
              </section>

              {/* Chat + Goals + Nutrition */}
              <div className="grid gap-6 lg:grid-cols-2">
                <SectionCard title="Chat with Your Data" subtitle="Ask anything">
                  <DataChat aiContext={data.aiContext} biometrics={data.biometrics} />
                </SectionCard>
                <div className="space-y-6">
                  <SectionCard title="Goal Generator" subtitle="8-week targets">
                    <GoalGenerator
                      aiContext={data.aiContext}
                      topLifts={data.topLifts}
                      biometrics={data.biometrics}
                    />
                  </SectionCard>
                  <SectionCard title="Nutrition Hints" subtitle="Fuel your training">
                    <NutritionHints
                      aiContext={data.aiContext}
                      biometrics={data.biometrics}
                      summary={data.summary}
                    />
                  </SectionCard>
                </div>
              </div>
            </>
          )}

          {/* ── Exercises Tab ── */}
          {activeTab === 'exercises' && (
            <>
              <div>
                <h1 className="text-2xl font-bold text-white">Exercises</h1>
                <p className="mt-1 text-sm text-[#555]">
                  {data.exerciseRanking.length} exercises tracked across all workouts
                </p>
              </div>

              <SectionCard
                title="Exercise Ranking"
                subtitle={`Top ${data.exerciseRanking.length} by sessions`}
              >
                <ExerciseRanking data={data.exerciseRanking} />
              </SectionCard>

              <div className="grid gap-6 lg:grid-cols-2">
                <SectionCard
                  title="Lift Progression"
                  subtitle={liftCount > 0 ? `${liftCount} exercises` : undefined}
                >
                  <ProgressChart topLifts={data.topLifts} />
                </SectionCard>
                <SectionCard title="Rep Range Distribution" subtitle="Training style">
                  <RepRangeChart data={data.repRanges} />
                </SectionCard>
              </div>
            </>
          )}

          {/* ── Records Tab ── */}
          {activeTab === 'records' && (
            <>
              <div>
                <h1 className="text-2xl font-bold text-white">Records</h1>
                <p className="mt-1 text-sm text-[#555]">
                  Personal records and strength signals
                </p>
              </div>

              {data.recentPRs && data.recentPRs.length > 0 && (
                <SectionCard title="Personal Records" subtitle="Recent PRs timeline">
                  <PRTimeline data={data.recentPRs} />
                </SectionCard>
              )}

              <section>
                <h2 className="mb-4 text-lg font-semibold text-white">Strength Signals</h2>
                <PlateauSection plateaus={data.plateaus} />
              </section>

              <div className="grid gap-6 lg:grid-cols-2">
                <SectionCard
                  title="Lift Progression"
                  subtitle={liftCount > 0 ? `${liftCount} exercises` : undefined}
                >
                  <ProgressChart topLifts={data.topLifts} />
                </SectionCard>
                <SectionCard title="Volume Trend" subtitle="12-week overview">
                  <VolumeTrend data={data.weeklyVolumeTrend} />
                </SectionCard>
              </div>
            </>
          )}

          {/* Footer */}
          <footer className="border-t border-[#1e1e2e] py-6 text-center text-xs text-[#555]">
            RepIQ — AI-powered workout analytics
          </footer>
        </div>
      </main>
    </div>
  )
}
