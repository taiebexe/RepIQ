import {
  HevyWorkout,
  HevyExercise,
  LiftSession,
  WeeklyVolume,
  FrequencyDay,
  PlateauSignal,
  SummaryStats,
  MuscleDistribution,
  SessionDuration,
  WeeklyVolumeTrend,
  RepRangeBreakdown,
  TimeOfDayBucket,
  ExerciseRank,
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

  // Show last 365 days (52 weeks) for a full year heatmap
  const totalDays = 365
  for (let i = totalDays - 1; i >= 0; i--) {
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

  // Calculate weeks from actual data range
  const firstWorkout = workouts.length > 0 ? new Date(workouts[0].start_time) : now
  const dayRange = Math.max(1, (now.getTime() - firstWorkout.getTime()) / (1000 * 60 * 60 * 24))
  const weeksInRange = Math.max(1, dayRange / 7)

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

// ── New analytics functions ─────────────────────────────────

export function getMuscleDistribution(
  workouts: HevyWorkout[]
): MuscleDistribution[] {
  const groups: Record<string, { sets: number; volume: number }> = {}

  for (const w of workouts) {
    for (const ex of w.exercises) {
      const group = getMuscleGroup(ex)
      if (!groups[group]) groups[group] = { sets: 0, volume: 0 }
      for (const s of ex.sets) {
        if (s.set_type === 'normal' || s.set_type === undefined) {
          groups[group].sets++
          if (s.weight_kg != null && s.reps != null) {
            groups[group].volume += s.weight_kg * s.reps
          }
        }
      }
    }
  }

  const totalSets = Object.values(groups).reduce((s, g) => s + g.sets, 0)

  return Object.entries(groups)
    .map(([group, data]) => ({
      group,
      sets: data.sets,
      volume: Math.round(data.volume),
      percentage: totalSets > 0 ? Math.round((data.sets / totalSets) * 100) : 0,
    }))
    .sort((a, b) => b.sets - a.sets)
}

export function getSessionDurations(
  workouts: HevyWorkout[]
): SessionDuration[] {
  return workouts
    .map((w) => {
      const start = new Date(w.start_time).getTime()
      const end = new Date(w.end_time).getTime()
      const durationMin = Math.round((end - start) / 60000)
      return {
        date: w.start_time.split('T')[0],
        durationMin: durationMin > 0 && durationMin < 300 ? durationMin : 0,
      }
    })
    .filter((d) => d.durationMin > 0)
}

export function getWeeklyVolumeTrend(
  workouts: HevyWorkout[]
): WeeklyVolumeTrend[] {
  const now = new Date()
  const currentMonday = getMonday(now)
  const weeks: { monday: Date; label: string; volume: number; sets: number }[] = []

  for (let i = 11; i >= 0; i--) {
    const monday = new Date(currentMonday)
    monday.setDate(monday.getDate() - i * 7)
    weeks.push({
      monday,
      label: formatWeekLabel(monday),
      volume: 0,
      sets: 0,
    })
  }

  for (const w of workouts) {
    const wMonday = getMonday(new Date(w.start_time))
    for (const week of weeks) {
      if (wMonday.getTime() === week.monday.getTime()) {
        if (w.estimated_volume_kg) {
          week.volume += w.estimated_volume_kg
        }
        for (const ex of w.exercises) {
          for (const s of ex.sets) {
            if (s.set_type === 'normal' || s.set_type === undefined) {
              week.sets++
              if (!w.estimated_volume_kg && s.weight_kg != null && s.reps != null) {
                week.volume += s.weight_kg * s.reps
              }
            }
          }
        }
        break
      }
    }
  }

  return weeks.map((w) => ({
    weekLabel: w.label,
    totalVolume: Math.round(w.volume),
    totalSets: w.sets,
  }))
}

export function getRepRangeBreakdown(
  workouts: HevyWorkout[]
): RepRangeBreakdown[] {
  const ranges: Record<string, number> = {
    'Strength (1-5)': 0,
    'Hypertrophy (6-12)': 0,
    'Endurance (13-20)': 0,
    'High Rep (21+)': 0,
  }

  for (const w of workouts) {
    for (const ex of w.exercises) {
      for (const s of ex.sets) {
        if ((s.set_type === 'normal' || s.set_type === undefined) && s.reps != null && s.reps > 0) {
          if (s.reps <= 5) ranges['Strength (1-5)']++
          else if (s.reps <= 12) ranges['Hypertrophy (6-12)']++
          else if (s.reps <= 20) ranges['Endurance (13-20)']++
          else ranges['High Rep (21+)']++
        }
      }
    }
  }

  const total = Object.values(ranges).reduce((s, n) => s + n, 0)

  return Object.entries(ranges)
    .filter(([, count]) => count > 0)
    .map(([range, count]) => ({
      range,
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0,
    }))
}

export function getTimeOfDay(
  workouts: HevyWorkout[]
): TimeOfDayBucket[] {
  const buckets: Record<number, number> = {}
  for (let h = 0; h < 24; h++) buckets[h] = 0

  for (const w of workouts) {
    const hour = new Date(w.start_time).getHours()
    buckets[hour]++
  }

  const labels = [
    '12a', '1a', '2a', '3a', '4a', '5a', '6a', '7a', '8a', '9a', '10a', '11a',
    '12p', '1p', '2p', '3p', '4p', '5p', '6p', '7p', '8p', '9p', '10p', '11p',
  ]

  return Object.entries(buckets).map(([hour, count]) => ({
    hour: Number(hour),
    label: labels[Number(hour)],
    count,
  }))
}

export function getExerciseRanking(
  workouts: HevyWorkout[]
): ExerciseRank[] {
  const exercises: Record<string, {
    muscleGroup: string
    sessions: number
    totalVolume: number
    best1RM: number
    recentRMs: number[]
  }> = {}

  for (const w of workouts) {
    for (const ex of w.exercises) {
      if (!exercises[ex.title]) {
        exercises[ex.title] = {
          muscleGroup: getMuscleGroup(ex),
          sessions: 0,
          totalVolume: 0,
          best1RM: 0,
          recentRMs: [],
        }
      }
      const e = exercises[ex.title]
      e.sessions++

      let sessionBest1RM = 0
      for (const s of ex.sets) {
        if ((s.set_type === 'normal' || s.set_type === undefined) && s.weight_kg != null && s.reps != null) {
          e.totalVolume += s.weight_kg * s.reps
          const rm = s.weight_kg * (1 + s.reps / 30)
          if (rm > sessionBest1RM) sessionBest1RM = rm
          if (rm > e.best1RM) e.best1RM = rm
        }
      }
      if (sessionBest1RM > 0) e.recentRMs.push(sessionBest1RM)
    }
  }

  return Object.entries(exercises)
    .map(([title, data]) => {
      let trend: 'up' | 'down' | 'stable' = 'stable'
      if (data.recentRMs.length >= 3) {
        const recent = data.recentRMs.slice(-3)
        const avg = recent.reduce((s, n) => s + n, 0) / recent.length
        const older = data.recentRMs.slice(0, Math.max(1, data.recentRMs.length - 3))
        const olderAvg = older.reduce((s, n) => s + n, 0) / older.length
        const change = ((avg - olderAvg) / olderAvg) * 100
        if (change > 2) trend = 'up'
        else if (change < -2) trend = 'down'
      }

      return {
        title,
        muscleGroup: data.muscleGroup,
        sessions: data.sessions,
        totalVolume: Math.round(data.totalVolume),
        best1RM: Math.round(data.best1RM * 10) / 10,
        trend,
      }
    })
    .sort((a, b) => b.sessions - a.sessions)
    .slice(0, 12)
}
