import { ActivityRecord, ExerciseSession, BreathworkSession, MoodLog } from '../types/wellness';

export interface ActivitySummaryStats {
  totalExerciseSessions: number;
  totalExerciseMinutes: number;
  totalBreathworkSessions: number;
  totalBreathworkMinutes: number;
  totalCompletedSessions: number;
  totalPartialSessions: number;
  weeklyExerciseMinutes: number;
  weeklyBreathworkMinutes: number;
  dailyExerciseMinutes: number;
  dailyBreathworkMinutes: number;
  streakDays: number;
  recentExercises: { name: string; durationMins: number; date: string; category: string }[];
  recentBreathwork: { technique: string; durationMins: number; date: string }[];
  weeklyDayBuckets: { day: string; exerciseMins: number; breathworkMins: number }[];
}

export function calculateActivityTotals(
  activities: ActivityRecord[],
  referenceDate: Date = new Date()
): ActivitySummaryStats {
  let totalExerciseSessions = 0;
  let totalExerciseSeconds = 0;
  let totalBreathworkSessions = 0;
  let totalBreathworkSeconds = 0;
  let totalCompletedSessions = 0;
  let totalPartialSessions = 0;

  // Set date boundaries
  const now = referenceDate.getTime();
  const oneDayMs = 24 * 60 * 60 * 1000;
  const sevenDaysAgo = now - 7 * oneDayMs;

  const todayStr = referenceDate.toISOString().slice(0, 10);

  let weeklyExerciseSeconds = 0;
  let weeklyBreathworkSeconds = 0;
  let dailyExerciseSeconds = 0;
  let dailyBreathworkSeconds = 0;

  // Prepare weekly day buckets (last 7 days ending today)
  const daysMap: Record<string, { exerciseMins: number; breathworkMins: number }> = {};
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const weeklyDayBuckets: { day: string; exerciseMins: number; breathworkMins: number }[] = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date(now - i * oneDayMs);
    const dateKey = d.toISOString().slice(0, 10);
    const label = `${dayNames[d.getDay()]} ${d.getDate()}`;
    daysMap[dateKey] = { exerciseMins: 0, breathworkMins: 0 };
    weeklyDayBuckets.push({ day: label, exerciseMins: 0, breathworkMins: 0 });
  }

  const activeDates = new Set<string>();
  const recentExercises: { name: string; durationMins: number; date: string; category: string }[] = [];
  const recentBreathwork: { technique: string; durationMins: number; date: string }[] = [];

  // Sort activities chronologically (newest first)
  const sorted = [...activities].sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());

  for (const act of sorted) {
    const actTime = new Date(act.startedAt).getTime();
    const actDateStr = act.startedAt.slice(0, 10);
    const mins = Math.round(act.durationSeconds / 60);

    if (act.isCompleted) {
      totalCompletedSessions++;
      activeDates.add(actDateStr);
    } else {
      totalPartialSessions++;
    }

    if (act.type === 'exercise') {
      const ex = act as ExerciseSession;
      totalExerciseSessions++;
      totalExerciseSeconds += ex.durationSeconds;

      if (recentExercises.length < 5) {
        recentExercises.push({
          name: ex.activityName,
          durationMins: mins,
          date: actDateStr,
          category: ex.category,
        });
      }

      if (actTime >= sevenDaysAgo) {
        weeklyExerciseSeconds += ex.durationSeconds;
      }
      if (actDateStr === todayStr) {
        dailyExerciseSeconds += ex.durationSeconds;
      }
      if (daysMap[actDateStr]) {
        daysMap[actDateStr].exerciseMins += mins;
      }
    } else if (act.type === 'breathwork') {
      const bw = act as BreathworkSession;
      totalBreathworkSessions++;
      totalBreathworkSeconds += bw.durationSeconds;

      if (recentBreathwork.length < 5) {
        recentBreathwork.push({
          technique: bw.technique,
          durationMins: mins,
          date: actDateStr,
        });
      }

      if (actTime >= sevenDaysAgo) {
        weeklyBreathworkSeconds += bw.durationSeconds;
      }
      if (actDateStr === todayStr) {
        dailyBreathworkSeconds += bw.durationSeconds;
      }
      if (daysMap[actDateStr]) {
        daysMap[actDateStr].breathworkMins += mins;
      }
    }
  }

  // Populate weeklyDayBuckets with actual totals from daysMap
  let bucketIdx = 0;
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now - i * oneDayMs);
    const dateKey = d.toISOString().slice(0, 10);
    if (daysMap[dateKey] && weeklyDayBuckets[bucketIdx]) {
      weeklyDayBuckets[bucketIdx].exerciseMins = daysMap[dateKey].exerciseMins;
      weeklyDayBuckets[bucketIdx].breathworkMins = daysMap[dateKey].breathworkMins;
    }
    bucketIdx++;
  }

  // Calculate consecutive streak days
  let streakDays = 0;
  let checkDate = new Date(referenceDate);
  // If active today, start streak from today; otherwise check yesterday
  const todayActive = activeDates.has(todayStr);
  if (todayActive) {
    streakDays = 1;
    checkDate.setDate(checkDate.getDate() - 1);
  } else {
    // Check if yesterday was active
    checkDate.setDate(checkDate.getDate() - 1);
    if (activeDates.has(checkDate.toISOString().slice(0, 10))) {
      streakDays = 1;
      checkDate.setDate(checkDate.getDate() - 1);
    }
  }

  while (streakDays > 0) {
    const dateStr = checkDate.toISOString().slice(0, 10);
    if (activeDates.has(dateStr)) {
      streakDays++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  return {
    totalExerciseSessions,
    totalExerciseMinutes: Math.round(totalExerciseSeconds / 60),
    totalBreathworkSessions,
    totalBreathworkMinutes: Math.round(totalBreathworkSeconds / 60),
    totalCompletedSessions,
    totalPartialSessions,
    weeklyExerciseMinutes: Math.round(weeklyExerciseSeconds / 60),
    weeklyBreathworkMinutes: Math.round(weeklyBreathworkSeconds / 60),
    dailyExerciseMinutes: Math.round(dailyExerciseSeconds / 60),
    dailyBreathworkMinutes: Math.round(dailyBreathworkSeconds / 60),
    streakDays,
    recentExercises,
    recentBreathwork,
    weeklyDayBuckets,
  };
}

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins === 0) {
    return `${secs}s`;
  }
  return `${mins}m ${secs.toString().padStart(2, '0')}s`;
}

export function formatTimerDisplay(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}
