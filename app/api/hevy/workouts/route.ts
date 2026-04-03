import { NextResponse } from 'next/server'
import { fetchAllWorkouts } from '@/lib/hevy'
import { fetchAllWorkoutsInternal } from '@/lib/hevy-internal'
import {
  getTopLifts,
  getWeeklyVolume,
  getTrainingFrequency,
  detectPlateaus,
  getSummaryStats,
  buildAIContext,
  extractRecentPRs,
} from '@/lib/analytics'
import { AuthType } from '@/lib/types'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const authType: AuthType = body.authType || 'api_key'

    let workouts

    if (authType === 'credentials') {
      const { accessToken, username } = body
      if (!accessToken || !username) {
        return NextResponse.json(
          { error: 'Access token and username are required' },
          { status: 400 }
        )
      }
      workouts = await fetchAllWorkoutsInternal(accessToken, username)
    } else {
      const { apiKey } = body
      if (!apiKey) {
        return NextResponse.json(
          { error: 'API key is required' },
          { status: 400 }
        )
      }
      workouts = await fetchAllWorkouts(apiKey)
    }

    const summary = getSummaryStats(workouts)
    const topLifts = getTopLifts(workouts)
    const weeklyVolume = getWeeklyVolume(workouts)
    const frequency = getTrainingFrequency(workouts)
    const plateaus = detectPlateaus(workouts)
    const aiContext = buildAIContext(workouts)
    const recentPRs = extractRecentPRs(workouts)

    return NextResponse.json({
      summary,
      topLifts,
      weeklyVolume,
      frequency,
      plateaus,
      aiContext,
      recentPRs,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
