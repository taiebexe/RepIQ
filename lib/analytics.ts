import {
  HevyWorkout,
  HevyExercise,
  LiftSession,
  WeeklyVolume,
  FrequencyDay,
  PlateauSignal,
  SummaryStats,
} from './types'

const MUSCLE_GROUP_MAP: Record<string, string> = {
  // Chest
  'Bench Press (Barbell)': 'Chest',
  'Bench Press (Dumbbell)': 'Chest',
  'Incline Bench Press (Barbell)': 'Chest',
  'Incline Bench Press (Dumbbell)': 'Chest',
  'Decline Bench Press (Barbell)': 'Chest',
  'Chest Fly (Dumbbell)': 'Chest',
  'Chest Fly (Cable)': 'Chest',
  'Cable Fly': 'Chest',
  'Push Up': 'Chest',
  'Chest Dip': 'Chest',
  'Pec Deck (Machine)': 'Chest',
  // Back
  'Deadlift (Barbell)': 'Back',
  'Pull Up': 'Back',
  'Chin Up': 'Back',
  'Barbell Row': 'Back',
  'Bent Over Row (Barbell)': 'Back',
  'Bent Over Row (Dumbbell)': 'Back',
  'Cable Row (Machine)': 'Back',
  'Lat Pulldown (Cable)': 'Back',
  'Lat Pulldown': 'Back',
  'T-Bar Row': 'Back',
  'Dumbbell Row': 'Back',
  'Seated Cable Row': 'Back',
  'Seated Row (Machine)': 'Back',
  'Cable Row': 'Back',
  // Legs
  'Squat (Barbell)': 'Legs',
  'Back Squat (Barbell)': 'Legs',
  'Front Squat (Barbell)': 'Legs',
  'Leg Press': 'Legs',
  'Leg Press (Machine)': 'Legs',
  'Romanian Deadlift (Barbell)': 'Legs',
  'Romanian Deadlift (Dumbbell)': 'Legs',
  'Romanian Deadlift': 'Legs',
  'Leg Curl (Machine)': 'Legs',
  'Leg Extension (Machine)': 'Legs',
  'Lunge (Dumbbell)': 'Legs',
  'Lunge (Barbell)': 'Legs',
  'Hack Squat': 'Legs',
  'Hack Squat (Machine)': 'Legs',
  'Bulgarian Split Squat': 'Legs',
  'Calf Raise': 'Legs',
  'Calf Raise (Machine)': 'Legs',
  'Standing Calf Raise': 'Legs',
  'Hip Thrust (Barbell)': 'Legs',
  // Shoulders
  'Overhead Press (Barbell)': 'Shoulders',
  'Overhead Press (Dumbbell)': 'Shoulders',
  'Shoulder Press (Dumbbell)': 'Shoulders',
  'Shoulder Press (Machine)': 'Shoulders',
  'Lateral Raise (Dumbbell)': 'Shoulders',
  'Lateral Raise (Cable)': 'Shoulders',
  'Face Pull': 'Shoulders',
  'Face Pull (Cable)': 'Shoulders',
  'Arnold Press (Dumbbell)': 'Shoulders',
  'Front Raise (Dumbbell)': 'Shoulders',
  'Rear Delt Fly (Dumbbell)': 'Shoulders',
  'Rear Delt Fly (Machine)': 'Shoulders',
  // Arms
  'Bicep Curl (Barbell)': 'Arms',
  'Bicep Curl (Dumbbell)': 'Arms',
  'Hammer Curl (Dumbbell)': 'Arms',
  'Tricep Pushdown (Cable)': 'Arms',
  'Tricep Pushdown': 'Arms',
  'Skull Crusher (Barbell)': 'Arms',
  'Tricep Dip': 'Arms',
  'Preacher Curl (Barbell)': 'Arms',
  'Preacher Curl (Dumbbell)': 'Arms',
  'Cable Bicep Curl': 'Arms',
  'Concentration Curl (Dumbbell)': 'Arms',
  'Tricep Extension (Cable)': 'Arms',
  'Tricep Extension (Dumbbell)': 'Arms',
  'Overhead Tricep Extension (Dumbbell)': 'Arms',
  'Overhead Tricep Extension (Cable)': 'Arms',
  // Core
  'Plank': 'Core',
  'Crunch': 'Core',
  'Ab Wheel': 'Core',
  'Hanging Leg Raise': 'Core',
  'Russian Twist': 'Core',
  'Cable Crunch': 'Core',
  'Sit Up': 'Core',
}

function getMuscleGroup(exercise: { title: string; muscle_group?: string }): string {
  // Prefer the API-provided muscle group if available
  if (exercise.muscle_group) {
    const mg = exercise.muscle_group.toLowerCase()
    if (mg.includes('chest') || mg.includes('pec')) return 'Chest'
    if (mg.includes('back') || mg.includes('lat') || mg.includes('trap')) return 'Back'
    if (mg.includes('quad') || mg.includes('hamstring') || mg.includes('glute') || mg.includes('calf') || mg.includes('leg')) return 'Legs'
    if (mg.includes('shoulder') || mg.includes('delt')) return 'Shoulders'
    if (mg.includes('bicep') || mg.includes('tricep') || mg.includes('forearm') || mg.includes('arm')) return 'Arms'
    if (mg.includes('ab') || mg.includes('core') || mg.includes('oblique')) return 'Core'
  }
  // Fallback to title map
  if (MUSCLE_GROUP_MAP[exercise.title]) return MUSCLE_GROUP_MAP[exercise.title]
  // Fuzzy match: check if any key is contained in the title
  const titleLower = exercise.title.toLowerCase()
  for (const [key, group] of Object.entries(MUSCLE_GROUP_MAP)) {
    if (titleLower.includes(key.toLowerCase().split(' (')[0].toLowerCase())) {
      return group
    }
  }
  return 'Other'
}

function getMonday(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  d.setHours(0, 0, 0, 0)
  return d
}

function formatWeekLabel(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function getValidWeightSets(exercise: HevyExercise) {
  return exercise.sets.filter(
    (s) =>
      (s.set_type === 'normal' || s.set_type === undefined) &&
      s.weight_kg != null &&
      s.weight_kg > 0 &&
      s.reps != null &&
      s.reps > 0
  )
}

export function getTopLifts(
  workouts: HevyWorkout[]
): Record<string, LiftSession[]> {
  const freq: Record<string, number> = {}
  for (const w of workouts) {
    for (const ex of w.exercises) {
      const validSets = getValidWeightSets(ex)
      if (validSets.length > 0) {
        freq[ex.title] = (freq[ex.title] || 0) + 1
      }
    }
  }

  const top6 = Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([title]) => title)

  const result: Record<string, LiftSession[]> = {}

  for (const title of top6) {
    const sessions: LiftSession[] = []

    for (const w of workouts) {
      const exercise = w.exercises.find((ex) => ex.title === title)
      if (!exercise) continue

      const validSets = getValidWeightSets(exercise)
      if (validSets.length === 0) continue

      const estimated1RM = Math.max(
        ...validSets.map((s) => s.weight_kg! * (1 + s.reps! / 30))
      )
      const maxWeightKg = Math.max(...validSets.map((s) => s.weight_kg!))
      const totalVolumeKg = validSets.reduce(
        (sum, s) => sum + s.weight_kg! * s.reps!,
        0
      )

      sessions.push({
        date: w.start_time.split('T')[0],
        estimated1RM: Math.round(estimated1RM * 10) / 10,
        maxWeightKg,
        totalVolumeKg: Math.round(totalVolumeKg),
      })
    }

    sessions.sort((a, b) => a.date.localeCompare(b.date))
    if (sessions.length > 0) {
      result[title] = sessions
    }
  }

  return result
}

export function getWeeklyVolume(workouts: HevyWorkout[]): WeeklyVolume[] {
  const now = new Date()
  const currentMonday = getMonday(now)
  const weeks: { monday: Date; label: string; groups: Record<string, number> }[] = []

  for (let i = 7; i >= 0; i--) {
    const monday = new Date(currentMonday)
    monday.setDate(monday.getDate() - i * 7)
    weeks.push({ monday, label: formatWeekLabel(monday), groups: {} })
  }

  for (const w of workouts) {
    const wDate = new Date(w.start_time)
    const wMonday = getMonday(wDate)

    for (const week of weeks) {
      if (wMonday.getTime() === week.monday.getTime()) {
        for (const ex of w.exercises) {
          const group = getMuscleGroup(ex)
          const normalSets = ex.sets.filter(
            (s) => s.set_type === 'normal' || s.set_type === undefined
          )
          week.groups[group] = (week.groups[group] || 0) + normalSets.length
        }
        break
      }
    }
  }

  return weeks.map((w) => ({ weekLabel: w.label, muscleGroups: w.groups }))
}

export function getTrainingFrequency(workouts: HevyWorkout[]): FrequencyDay[] {
  const days: FrequencyDay[] = []
  const now = new Date()
  now.setHours(0, 0, 0, 0)

  const countMap: Record<string, number> = {}
  for (const w of workouts) {
    const dateStr = w.start_time.split('T')[0]
    countMap[dateStr] = (countMap[dateStr] || 0) + 1
  }

  for (let i = 89; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().split('T')[0]
    days.push({ date: dateStr, count: countMap[dateStr] || 0 })
  }

  return days
}

export function detectPlateaus(workouts: HevyWorkout[]): PlateauSignal[] {
  const topLifts = getTopLifts(workouts)
  const plateaus: PlateauSignal[] = []

  for (const [exercise, sessions] of Object.entries(topLifts)) {
    if (sessions.length < 4) continue

    const last5 = sessions.slice(-5)
    const firstHalf = last5.slice(0, Math.floor(last5.length / 2))
    const secondHalf = last5.slice(Math.floor(last5.length / 2))

    const avgFirst = firstHalf.reduce((s, x) => s + x.estimated1RM, 0) / firstHalf.length
    const avgSecond = secondHalf.reduce((s, x) => s + x.estimated1RM, 0) / secondHalf.length
    const change = ((avgSecond - avgFirst) / avgFirst) * 100

    let trend: 'plateau' | 'declining' | 'gaining'
    if (change > 2) trend = 'gaining'
    else if (change < -2) trend = 'declining'
    else trend = 'plateau'

    if (trend !== 'gaining') {
      let stalled = 0
      for (let i = sessions.length - 1; i > 0; i--) {
        const diff =
          ((sessions[i].estimated1RM - sessions[i - 1].estimated1RM) /
            sessions[i - 1].estimated1RM) * 100
        if (diff < 1) stalled++
        else break
      }

      let prSession = sessions[0]
      for (const s of sessions) {
        if (s.estimated1RM > prSession.estimated1RM) prSession = s
      }

      plateaus.push({
        exercise,
        sessionsStalled: Math.max(stalled, 2),
        lastPRDate: prSession.date,
        lastPRWeightKg: prSession.maxWeightKg,
        trend,
      })
    }
  }

  return plateaus
}

export function getSummaryStats(workouts: HevyWorkout[]): SummaryStats {
  let totalVolumeKg = 0
  let totalSets = 0
  let totalDurationMs = 0
  const muscleSetCount: Record<string, number> = {}

  for (const w of workouts) {
    // Duration
    const start = new Date(w.start_time).getTime()
    const end = new Date(w.end_time).getTime()
    if (end > start) totalDurationMs += end - start

    // Use estimated volume if available (internal API)
    if (w.estimated_volume_kg) {
      totalVolumeKg += w.estimated_volume_kg
    }

    for (const ex of w.exercises) {
      const group = getMuscleGroup(ex)
      const normalSets = ex.sets.filter(
        (s) => s.set_type === 'normal' || s.set_type === undefined
      )
      totalSets += normalSets.length
      muscleSetCount[group] = (muscleSetCount[group] || 0) + normalSets.length

      // Calculate volume from sets if no estimated volume
      if (!w.estimated_volume_kg) {
        for (const s of normalSets) {
          if (s.weight_kg != null && s.reps != null) {
            totalVolumeKg += s.weight_kg * s.reps
          }
        }
      }
    }
  }

  const topMuscleGroup =
    Object.entries(muscleSetCount)
      .filter(([g]) => g !== 'Other')
      .sort((a, b) => b[1] - a[1])[0]?.[0] ||
    Object.entries(muscleSetCount).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'

  const now = new Date()
  let streakWeeks = 0
  for (let weekOffset = 0; weekOffset < 52; weekOffset++) {
    const weekStart = new Date(now)
    weekStart.setDate(weekStart.getDate() - weekOffset * 7)
    const monday = getMonday(weekStart)
    const sunday = new Date(monday)
    sunday.setDate(sunday.getDate() + 6)
    sunday.setHours(23, 59, 59, 999)

    const sessionsThisWeek = workouts.filter((w) => {
      const d = new Date(w.start_time)
      return d >= monday && d <= sunday
    }).length

    if (sessionsThisWeek >= 2) streakWeeks++
    else break
  }

  const weeksInRange = Math.max(1, 90 / 7)

  return {
    totalWorkouts: workouts.length,
    totalVolumeKg: Math.round(totalVolumeKg),
    topMuscleGroup,
    trainingStreakWeeks: streakWeeks,
    avgSessionDurationMin: workouts.length > 0
      ? Math.round(totalDurationMs / workouts.length / 60000)
      : 0,
    totalSets,
    avgSessionsPerWeek: Math.round((workouts.length / weeksInRange) * 10) / 10,
  }
}

export function extractRecentPRs(
  workouts: HevyWorkout[]
): { exercise: string; type: string; value: number; date: string }[] {
  const prs: { exercise: string; type: string; value: number; date: string }[] = []

  for (const w of workouts) {
    for (const ex of w.exercises) {
      for (const s of ex.sets) {
        if (s.prs && s.prs.length > 0) {
          for (const pr of s.prs) {
            prs.push({
              exercise: ex.title,
              type: pr.type,
              value: pr.value,
              date: w.start_time.split('T')[0],
            })
          }
        }
      }
    }
  }

  // Sort by date descending, take last 10
  prs.sort((a, b) => b.date.localeCompare(a.date))
  return prs.slice(0, 10)
}

export function buildAIContext(workouts: HevyWorkout[]): string {
  const now = new Date()
  const fourWeeksAgo = new Date(now)
  fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28)

  const recentWorkouts = workouts.filter(
    (w) => new Date(w.start_time) >= fourWeeksAgo
  )
  const totalSessions = recentWorkouts.length
  const avgPerWeek = (totalSessions / 4).toFixed(1)

  const muscleSetCount: Record<string, number> = {}
  for (const w of recentWorkouts) {
    for (const ex of w.exercises) {
      const group = getMuscleGroup(ex)
      const normalSets = ex.sets.filter(
        (s) => s.set_type === 'normal' || s.set_type === undefined
      )
      muscleSetCount[group] = (muscleSetCount[group] || 0) + normalSets.length
    }
  }

  const muscleSummary = Object.entries(muscleSetCount)
    .sort((a, b) => b[1] - a[1])
    .map(([group, sets]) => `- ${group}: ${(sets / 4).toFixed(1)} sets/week`)
    .join('\n')

  const topLifts = getTopLifts(workouts)
  const liftEntries = Object.entries(topLifts).slice(0, 4)
  const liftSummary = liftEntries
    .map(([name, sessions]) => {
      if (sessions.length < 2)
        return `- ${name}: ${sessions[0]?.estimated1RM}kg (1 session)`
      const first = sessions[0].estimated1RM
      const last = sessions[sessions.length - 1].estimated1RM
      const change = (((last - first) / first) * 100).toFixed(1)
      return `- ${name}: ${first}kg → ${last}kg over ${sessions.length} sessions (${change}%)`
    })
    .join('\n')

  const plateaus = detectPlateaus(workouts)
  const plateauSummary =
    plateaus.length > 0
      ? plateaus
          .map(
            (p) =>
              `- ${p.exercise}: ${p.sessionsStalled} sessions without progress (last PR: ${p.lastPRDate}, ${p.lastPRWeightKg}kg) [${p.trend}]`
          )
          .join('\n')
      : 'None detected'

  return `Training summary — last 4 weeks:
- Total sessions: ${totalSessions}
- Average sessions/week: ${avgPerWeek}

Weekly sets by muscle group (avg over last 4 weeks):
${muscleSummary}

Top lift progression (estimated 1RM):
${liftSummary}

Plateau signals:
${plateauSummary}`
}
