import { HevyWorkout } from './types'

const BASE_URL = 'https://api.hevyapp.com/v1'

function headers(apiKey: string): HeadersInit {
  return { 'api-key': apiKey }
}

export async function validateHevyKey(apiKey: string): Promise<boolean> {
  try {
    const res = await fetch(`${BASE_URL}/workouts/count`, {
      headers: headers(apiKey),
    })
    return res.ok
  } catch {
    return false
  }
}

export async function fetchAllWorkouts(apiKey: string): Promise<HevyWorkout[]> {
  const countRes = await fetch(`${BASE_URL}/workouts/count`, {
    headers: headers(apiKey),
  })
  if (!countRes.ok) throw new Error('Failed to fetch workout count')
  const { workout_count } = await countRes.json()

  const pageSize = 10
  const totalPages = Math.ceil(workout_count / pageSize)

  const pagePromises = Array.from({ length: totalPages }, (_, i) =>
    fetch(`${BASE_URL}/workouts?page=${i + 1}&pageSize=${pageSize}`, {
      headers: headers(apiKey),
    }).then((res) => {
      if (!res.ok) throw new Error(`Failed to fetch page ${i + 1}`)
      return res.json()
    })
  )

  const pages = await Promise.all(pagePromises)
  const allWorkouts: HevyWorkout[] = pages.flatMap((p) => {
    const workouts = p.workouts || []
    // Normalize PRO API response to our standard format
    return workouts.map((w: any) => ({
      id: w.id,
      title: w.title || 'Untitled',
      description: w.description || '',
      start_time: w.start_time,
      end_time: w.end_time,
      updated_at: w.updated_at,
      created_at: w.created_at,
      exercises: (w.exercises || []).map((ex: any, exIdx: number) => ({
        index: ex.index ?? exIdx,
        title: ex.title || 'Unknown',
        notes: ex.notes || '',
        exercise_template_id: ex.exercise_template_id,
        muscle_group: ex.muscle_group,
        sets: (ex.sets || []).map((s: any, sIdx: number) => ({
          index: s.index ?? sIdx,
          set_type: s.set_type || s.type || 'normal',
          weight_kg: s.weight_kg ?? null,
          reps: s.reps ?? null,
          rpe: s.rpe ?? null,
          distance_meters: s.distance_meters ?? null,
          duration_seconds: s.duration_seconds ?? null,
          prs: s.prs || [],
        })),
      })),
    }))
  })

  allWorkouts.sort(
    (a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
  )

  return allWorkouts
}
