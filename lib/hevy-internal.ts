import { HevyWorkout, LoginResponse, UserBiometrics } from './types'

const BASE_URL = 'https://api.hevyapp.com'
const INTERNAL_API_KEY = 'klean_kanteen_insulated'

function internalHeaders(accessToken?: string): HeadersInit {
  const h: HeadersInit = {
    'x-api-key': INTERNAL_API_KEY,
    'Content-Type': 'application/json',
    'Hevy-Platform': 'ios',
  }
  if (accessToken) {
    h['Authorization'] = `Bearer ${accessToken}`
  }
  return h
}

export async function loginWithCredentials(
  emailOrUsername: string,
  password: string
): Promise<LoginResponse> {
  const res = await fetch(`${BASE_URL}/login`, {
    method: 'POST',
    headers: internalHeaders(),
    body: JSON.stringify({
      emailOrUsername,
      password,
      useAuth2_0: true,
    }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(
      res.status === 401
        ? 'Invalid email/username or password'
        : `Login failed (${res.status}): ${text}`
    )
  }

  const data = await res.json()
  return {
    access_token: data.access_token || data.auth_token,
    refresh_token: data.refresh_token,
    user_id: data.user_id,
    expires_at: data.expires_at,
    username: data.username,
  }
}

export async function refreshToken(
  refreshTok: string
): Promise<LoginResponse> {
  const res = await fetch(`${BASE_URL}/refresh_token`, {
    method: 'POST',
    headers: internalHeaders(),
    body: JSON.stringify({ refresh_token: refreshTok }),
  })

  if (!res.ok) throw new Error('Token refresh failed')

  const data = await res.json()
  return {
    access_token: data.access_token || data.auth_token,
    refresh_token: data.refresh_token,
    user_id: data.user_id,
    expires_at: data.expires_at,
  }
}

export async function fetchUserAccount(accessToken: string) {
  const res = await fetch(`${BASE_URL}/user/account`, {
    headers: internalHeaders(accessToken),
  })
  if (!res.ok) throw new Error('Failed to fetch user account')
  return res.json()
}

export async function fetchUserBiometrics(accessToken: string): Promise<UserBiometrics> {
  try {
    const account = await fetchUserAccount(accessToken)
    return {
      weightKg: account.weight_kg ?? account.body_weight_kg ?? null,
      heightCm: account.height_cm ?? null,
      age: account.date_of_birth
        ? Math.floor(
            (Date.now() - new Date(account.date_of_birth).getTime()) /
              (365.25 * 24 * 60 * 60 * 1000)
          )
        : null,
      gender: account.gender ?? null,
    }
  } catch {
    return { weightKg: null, heightCm: null, age: null, gender: null }
  }
}

function normalizeTimestamp(ts: number | string): string {
  if (typeof ts === 'number') {
    // Unix timestamp (seconds) → ISO string
    return new Date(ts * 1000).toISOString()
  }
  return String(ts)
}

export async function fetchAllWorkoutsInternal(
  accessToken: string,
  username: string
): Promise<HevyWorkout[]> {
  const allWorkouts: HevyWorkout[] = []
  let offset = 0

  while (true) {
    const res = await fetch(
      `${BASE_URL}/user_workouts_paged?offset=${offset}&username=${username}`,
      { headers: internalHeaders(accessToken) }
    )

    if (!res.ok) throw new Error(`Failed to fetch workouts at offset ${offset}`)

    const data = await res.json()
    const workouts = data.workouts || data || []

    if (!Array.isArray(workouts) || workouts.length === 0) break

    for (const w of workouts) {
      const startTime = normalizeTimestamp(w.start_time)

      allWorkouts.push({
        id: w.id,
        title: w.title || w.name || 'Untitled',
        description: w.description || '',
        start_time: startTime,
        end_time: normalizeTimestamp(w.end_time),
        updated_at: w.updated_at ? normalizeTimestamp(w.updated_at) : undefined,
        created_at: w.created_at ? normalizeTimestamp(w.created_at) : undefined,
        estimated_volume_kg: w.estimated_volume_kg,
        exercises: (w.exercises || []).map((ex: any, exIdx: number) => ({
          index: ex.index ?? exIdx,
          title: ex.title || 'Unknown',
          notes: ex.notes || '',
          exercise_template_id: ex.exercise_template_id,
          muscle_group: ex.muscle_group || ex.primary_muscle_group,
          sets: (ex.sets || []).map((s: any, sIdx: number) => ({
            index: s.index ?? sIdx,
            set_type: s.set_type || s.type || 'normal',
            weight_kg: s.weight_kg ?? null,
            reps: s.reps ?? null,
            rpe: s.rpe ?? null,
            distance_meters: s.distance_meters ?? s.distance_km ? (s.distance_km * 1000) : null,
            duration_seconds: s.duration_seconds ?? null,
            prs: s.prs || s.personalRecords || [],
          })),
        })),
      })
    }

    // Internal API pages by 5
    offset += 5

    // Safety: if we got fewer than 5, we're done
    if (workouts.length < 5) break
  }

  allWorkouts.sort(
    (a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
  )

  return allWorkouts
}
