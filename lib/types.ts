// ── Auth types ──────────────────────────────────────────────

export type AuthType = 'credentials' | 'api_key'

export interface AuthSession {
  type: AuthType
  accessToken?: string   // for credentials login
  apiKey?: string         // for PRO API key login
  username?: string
}

export interface LoginResponse {
  access_token: string
  refresh_token: string
  user_id: string
  expires_at: number
  username?: string
}

// ── Hevy API types (normalized) ─────────────────────────────

export interface HevySet {
  index: number
  set_type: 'normal' | 'warmup' | 'dropset' | 'failure'
  weight_kg: number | null
  reps: number | null
  rpe: number | null
  distance_meters: number | null
  duration_seconds: number | null
  prs?: { type: string; value: number }[]
}

export interface HevyExercise {
  index: number
  title: string
  notes: string
  exercise_template_id?: string
  supersets_id?: number | null
  muscle_group?: string
  sets: HevySet[]
}

export interface HevyWorkout {
  id: string
  title: string
  description: string
  start_time: string    // ISO 8601 or unix timestamp (normalized to ISO)
  end_time: string
  updated_at?: string
  created_at?: string
  estimated_volume_kg?: number
  exercises: HevyExercise[]
}

// ── Analytics output types ──────────────────────────────────

export interface LiftSession {
  date: string
  estimated1RM: number
  maxWeightKg: number
  totalVolumeKg: number
}

export interface WeeklyVolume {
  weekLabel: string
  muscleGroups: Record<string, number>
}

export interface FrequencyDay {
  date: string
  count: number
}

export interface PlateauSignal {
  exercise: string
  sessionsStalled: number
  lastPRDate: string
  lastPRWeightKg: number
  trend: 'plateau' | 'declining' | 'gaining'
}

export interface SummaryStats {
  totalWorkouts: number
  totalVolumeKg: number
  topMuscleGroup: string
  trainingStreakWeeks: number
  avgSessionDurationMin: number
  totalSets: number
  avgSessionsPerWeek: number
}

export interface AIInsight {
  title: string
  body: string
  type: 'plateau' | 'volume' | 'frequency' | 'recovery' | 'progress'
}

export interface MuscleDistribution {
  group: string
  sets: number
  volume: number
  percentage: number
}

export interface SessionDuration {
  date: string
  durationMin: number
}

export interface WeeklyVolumeTrend {
  weekLabel: string
  totalVolume: number
  totalSets: number
}

export interface RepRangeBreakdown {
  range: string
  count: number
  percentage: number
}

export interface TimeOfDayBucket {
  hour: number
  label: string
  count: number
}

export interface ExerciseRank {
  title: string
  muscleGroup: string
  sessions: number
  totalVolume: number
  best1RM: number
  trend: 'up' | 'down' | 'stable'
}

// ── AI Feature types ───────────────────────────────────────

export interface UserBiometrics {
  weightKg: number | null
  heightCm: number | null
  age: number | null
  gender: string | null
}

export interface StrengthGoal {
  exercise: string
  current1RM: number
  target1RM: number
  timeframeWeeks: number
  weeklyPlan: string
}

export interface NutritionHint {
  title: string
  body: string
  type: 'calories' | 'protein' | 'recovery' | 'hydration' | 'timing'
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface DashboardData {
  summary: SummaryStats
  topLifts: Record<string, LiftSession[]>
  weeklyVolume: WeeklyVolume[]
  frequency: FrequencyDay[]
  plateaus: PlateauSignal[]
  aiContext: string
  recentPRs: { exercise: string; type: string; value: number; date: string }[]
  muscleDistribution: MuscleDistribution[]
  sessionDurations: SessionDuration[]
  weeklyVolumeTrend: WeeklyVolumeTrend[]
  repRanges: RepRangeBreakdown[]
  timeOfDay: TimeOfDayBucket[]
  exerciseRanking: ExerciseRank[]
  biometrics?: UserBiometrics
}
