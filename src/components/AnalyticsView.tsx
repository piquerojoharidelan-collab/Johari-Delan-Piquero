import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  Flame,
  Wind,
  Smile,
  Calendar,
  CheckCircle2,
  Award,
  Sparkles,
  ArrowRight,
  BarChart2,
} from 'lucide-react';
import { useWellness } from '../context/WellnessContext';
import { formatDuration } from '../utils/analytics';

export const AnalyticsView: React.FC = () => {
  const { stats, activities, moodLogs, setActiveTab } = useWellness();

  const [timeScope, setTimeScope] = useState<'weekly' | 'alltime'>('weekly');

  // Mood distribution counts
  const moodCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const log of moodLogs) {
      counts[log.mood] = (counts[log.mood] || 0) + 1;
    }
    return counts;
  }, [moodLogs]);

  // Max minute for chart normalization
  const maxDayMinutes = useMemo(() => {
    let max = 15;
    for (const b of stats.weeklyDayBuckets) {
      const sum = b.exerciseMins + b.breathworkMins;
      if (sum > max) max = sum;
    }
    return max;
  }, [stats.weeklyDayBuckets]);

  const completionRatePercent = useMemo(() => {
    const total = stats.totalCompletedSessions + stats.totalPartialSessions;
    if (total === 0) return 0;
    return Math.round((stats.totalCompletedSessions / total) * 100);
  }, [stats]);

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-100 text-violet-800 text-xs font-bold mb-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-violet-600" />
            <span>Progress & Biometric Analytics</span>
          </div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-slate-900 tracking-tight">
            Wellness Analytics
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Data computed strictly from your verified saved activity sessions and mood check-ins
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl self-start sm:self-auto">
          <button
            onClick={() => setTimeScope('weekly')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              timeScope === 'weekly' ? 'bg-white text-violet-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            Past 7 Days
          </button>
          <button
            onClick={() => setTimeScope('alltime')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              timeScope === 'alltime' ? 'bg-white text-violet-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            All-Time History
          </button>
        </div>
      </div>

      {/* 4 PRIMARY METRICS CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Exercise Total */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="font-bold">Total Exercise</span>
            <div className="w-7 h-7 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="font-heading font-extrabold text-3xl text-slate-900">
            {timeScope === 'weekly' ? stats.weeklyExerciseMinutes : stats.totalExerciseMinutes}{' '}
            <span className="text-sm font-semibold text-slate-500">mins</span>
          </div>
          <p className="text-xs text-slate-600 mt-1 font-medium">
            {stats.totalExerciseSessions} completed session{stats.totalExerciseSessions === 1 ? '' : 's'}
          </p>
        </div>

        {/* Breathwork Total */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="font-bold">Total Breathwork</span>
            <div className="w-7 h-7 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
              <Wind className="w-4 h-4" />
            </div>
          </div>
          <div className="font-heading font-extrabold text-3xl text-slate-900">
            {timeScope === 'weekly' ? stats.weeklyBreathworkMinutes : stats.totalBreathworkMinutes}{' '}
            <span className="text-sm font-semibold text-slate-500">mins</span>
          </div>
          <p className="text-xs text-slate-600 mt-1 font-medium">
            {stats.totalBreathworkSessions} completed session{stats.totalBreathworkSessions === 1 ? '' : 's'}
          </p>
        </div>

        {/* Active Streak */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="font-bold">Consistency Streak</span>
            <div className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="font-heading font-extrabold text-3xl text-slate-900">
            {stats.streakDays}{' '}
            <span className="text-sm font-semibold text-slate-500">days</span>
          </div>
          <p className="text-xs text-emerald-700 font-semibold mt-1">
            {stats.streakDays > 0 ? 'Consistent habit formation' : 'Record a session today to start'}
          </p>
        </div>

        {/* Completion Rate */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="font-bold">Completion Rate</span>
            <div className="w-7 h-7 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="font-heading font-extrabold text-3xl text-slate-900">
            {completionRatePercent}%
          </div>
          <p className="text-xs text-slate-600 mt-1 font-medium">
            {stats.totalCompletedSessions} finished / {stats.totalPartialSessions} partial
          </p>
        </div>
      </div>

      {/* WEEKLY ACTIVITY DURATION BAR CHART */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="font-heading font-bold text-lg text-slate-900 flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-violet-600" />
              <span>Weekly Movement & Breathwork Distribution</span>
            </h2>
            <p className="text-xs text-slate-500">Daily duration in minutes over the past 7 days</p>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-amber-500" />
              <span className="text-slate-600 font-medium">Exercise (min)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-violet-600" />
              <span className="text-slate-600 font-medium">Breathwork (min)</span>
            </div>
          </div>
        </div>

        {/* SVG/HTML Responsive Bar Chart */}
        <div className="pt-6 pb-2">
          <div className="grid grid-cols-7 gap-2 sm:gap-4 h-48 sm:h-56 items-end border-b border-slate-100 pb-2">
            {stats.weeklyDayBuckets.map((bucket, i) => {
              const totalMins = bucket.exerciseMins + bucket.breathworkMins;
              const exHeightPct = maxDayMinutes > 0 ? (bucket.exerciseMins / maxDayMinutes) * 100 : 0;
              const bwHeightPct = maxDayMinutes > 0 ? (bucket.breathworkMins / maxDayMinutes) * 100 : 0;

              return (
                <div key={i} className="flex flex-col items-center h-full justify-end group">
                  <div className="text-[10px] font-bold text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity mb-1">
                    {totalMins > 0 ? `${totalMins}m` : ''}
                  </div>

                  <div className="w-full max-w-[42px] bg-slate-50 rounded-xl overflow-hidden flex flex-col-reverse h-full justify-start border border-slate-100">
                    {/* Breathwork bar portion */}
                    <div
                      className="w-full bg-violet-600 transition-all duration-500 rounded-t-xs"
                      style={{ height: `${bwHeightPct}%` }}
                      title={`Breathwork: ${bucket.breathworkMins} mins`}
                    />
                    {/* Exercise bar portion */}
                    <div
                      className="w-full bg-amber-500 transition-all duration-500 rounded-b-xs"
                      style={{ height: `${exHeightPct}%` }}
                      title={`Exercise: ${bucket.exerciseMins} mins`}
                    />
                  </div>

                  <span className="text-[11px] font-semibold text-slate-600 mt-2 text-center truncate w-full">
                    {bucket.day}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* MOOD TRENDS & REFLECTION LOGS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Mood Distribution */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-bold text-base text-slate-900 flex items-center gap-2">
              <Smile className="w-4 h-4 text-violet-600" />
              <span>Emotional Wellbeing Logs</span>
            </h3>
            <span className="text-xs font-semibold text-slate-500">{moodLogs.length} logged check-ins</span>
          </div>

          {moodLogs.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center italic">
              No mood check-ins recorded yet. Check in on the Dashboard to see your emotional patterns over time.
            </p>
          ) : (
            <div className="space-y-2">
              {Object.entries(moodCounts).map(([m, count]) => {
                const pct = Math.round((count / moodLogs.length) * 100);
                return (
                  <div key={m} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-slate-700">
                      <span>{m}</span>
                      <span>{count} times ({pct}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-violet-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Habit & Long-Term Coaching Insight */}
        <div className="bg-linear-to-br from-violet-50/90 to-purple-50/50 rounded-3xl p-6 border border-violet-100 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-violet-800 uppercase tracking-wider mb-2">
              <Sparkles className="w-4 h-4 text-violet-600" />
              <span>Habit Formation Science</span>
            </div>

            <h3 className="font-heading font-extrabold text-lg text-slate-900 mb-2">
              Consistency Over Intensity
            </h3>

            <p className="text-xs text-slate-600 leading-relaxed">
              Research in neuroplasticity shows that 10 minutes of daily physical movement and 3 minutes of daily conscious breathwork yields greater long-term autonomic resilience than occasional high-intensity sessions.
            </p>

            <div className="mt-4 p-3 bg-white/80 rounded-xl border border-violet-100 text-xs text-slate-700 space-y-1.5">
              <div>• Weekly target: <strong>150 mins</strong> moderate exercise</div>
              <div>• Breathwork target: <strong>20 mins</strong> conscious vagal regulation</div>
              <div>• Current weekly pace: <strong>{stats.weeklyExerciseMinutes + stats.weeklyBreathworkMinutes} mins</strong></div>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-violet-100/60">
            <button
              onClick={() => setActiveTab('activity_library')}
              className="text-xs font-bold text-violet-700 hover:text-violet-900 flex items-center gap-1"
            >
              <span>Explore recommended routines in Activity Library</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
