import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  Flame,
  Wind,
  Smile,
  Moon,
  Scale,
  Calendar,
  CheckCircle2,
  Circle,
  Play,
  ArrowRight,
  TrendingUp,
  History,
  Heart,
  Droplet,
  Plus,
  Bookmark,
  X,
} from 'lucide-react';
import { useWellness } from '../context/WellnessContext';
import { MoodType, RecommendationItem } from '../types/wellness';
import { generatePersonalizedRecommendations } from '../utils/recommendations';
import { formatDuration } from '../utils/analytics';

export const DashboardView: React.FC = () => {
  const {
    currentUser,
    stats,
    activities,
    moodLogs,
    addMoodLog,
    dailyHabits,
    toggleDailyHabit,
    startExercise,
    startBreathwork,
    setActiveTab,
  } = useWellness();

  const [selectedMood, setSelectedMood] = useState<MoodType | null>(null);
  const [moodNote, setMoodNote] = useState('');
  const [moodSavedToast, setMoodSavedToast] = useState(false);
  const [dismissedRecIds, setDismissedRecIds] = useState<Set<string>>(new Set());
  const [savedRecIds, setSavedRecIds] = useState<Set<string>>(new Set());

  // Date and daily message
  const todayFormatted = useMemo(() => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }, []);

  const dailyInspiration = useMemo(() => {
    const quotes = [
      'Small, consistent acts of self-care produce profound transformations over time.',
      'Movement is medicine for the physical body; mindful stillness is medicine for the mind.',
      'Listen closely to your body today. Rest when tired, move when sluggish, breathe when tense.',
      'Wellness is not perfection; it is honoring your biology with gentle attention.',
    ];
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    return quotes[dayOfYear % quotes.length];
  }, []);

  // Recommendations
  const rawRecommendations = useMemo(() => {
    return generatePersonalizedRecommendations(currentUser, null, activities, moodLogs);
  }, [currentUser, activities, moodLogs]);

  const activeRecommendations = rawRecommendations.filter((r) => !dismissedRecIds.has(r.id));

  const handleSaveMood = (mood: MoodType) => {
    setSelectedMood(mood);
    addMoodLog(mood, moodNote.trim() || undefined);
    setMoodNote('');
    setMoodSavedToast(true);
    setTimeout(() => setMoodSavedToast(false), 3000);
  };

  const handleStartRec = (rec: RecommendationItem) => {
    if (rec.actionType === 'start_exercise' && rec.actionPayload) {
      startExercise(
        rec.actionPayload.name,
        rec.actionPayload.category,
        rec.actionPayload.targetSeconds,
        rec.actionPayload.notes
      );
    } else if (rec.actionType === 'start_breathwork' && rec.actionPayload) {
      startBreathwork(rec.actionPayload.technique, rec.actionPayload.targetMinutes);
    } else if (rec.actionType === 'check_habit') {
      toggleDailyHabit('morning_water');
    }
  };

  const toggleSaveRec = (id: string) => {
    setSavedRecIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const dismissRec = (id: string) => {
    setDismissedRecIds((prev) => new Set(prev).add(id));
  };

  const moodsList: { label: MoodType; emoji: string }[] = [
    { label: 'Very good', emoji: '🌟' },
    { label: 'Good', emoji: '😊' },
    { label: 'Okay', emoji: '😐' },
    { label: 'Stressed', emoji: '😰' },
    { label: 'Sad', emoji: '🌧️' },
    { label: 'Anxious', emoji: '⚡' },
    { label: 'Overwhelmed', emoji: '🌊' },
  ];

  // Daily Wellness Plan items
  const dailyPlanItems = [
    { key: 'morning_water', time: '07:30 AM', title: 'Morning Hydration & Sunlight', desc: '500ml water + 5 min natural daylight', category: 'Physical' },
    { key: 'movement_break', time: '12:00 PM', title: 'Midday Physical Movement', desc: '15-20 min brisk walking or full-body stretch', category: 'Exercise' },
    { key: 'mindful_breath', time: '03:30 PM', title: 'Afternoon Nervous System Reset', desc: '3 min Box Breathing to clear mental fatigue', category: 'Breathwork' },
    { key: 'evening_winddown', time: '09:30 PM', title: 'Nighttime Sleep Transition', desc: 'Dim blue light & practice 4-7-8 relaxation', category: 'Rest' },
  ];

  const completedHabitsCount = Object.values(dailyHabits).filter(Boolean).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 animate-fade-in">
      {/* Welcome & Date Section */}
      <div className="bg-linear-to-r from-violet-900 via-indigo-900 to-purple-900 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-lg shadow-purple-950/10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-violet-200 text-xs font-semibold mb-2">
              <Calendar className="w-3.5 h-3.5" />
              <span>{todayFormatted}</span>
            </div>
            <h1 className="font-heading font-extrabold text-2xl sm:text-3xl tracking-tight">
              Good day, {currentUser?.name || 'Friend'}
            </h1>
            <p className="text-sm text-violet-100/90 mt-2 max-w-2xl italic leading-relaxed">
              "{dailyInspiration}"
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setActiveTab('exercise_tracker')}
              className="py-2.5 px-4 bg-white text-violet-900 hover:bg-violet-50 rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-2 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Quick Workout</span>
            </button>
            <button
              onClick={() => setActiveTab('breathwork')}
              className="py-2.5 px-4 bg-white/15 hover:bg-white/25 text-white rounded-xl text-xs font-bold border border-white/20 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Wind className="w-3.5 h-3.5" />
              <span>Take a Breath</span>
            </button>
          </div>
        </div>
      </div>

      {/* TODAY'S WELLNESS SUMMARY METRICS */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-heading font-bold text-lg text-slate-900">Today's Wellness Summary</h2>
          <span className="text-xs text-slate-500">Live recorded data</span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
          {/* 1. BMI Card */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-semibold">Calculated BMI</span>
              <Scale className="w-4 h-4 text-violet-500" />
            </div>
            <div className="mt-2">
              <span className="text-2xl font-extrabold text-slate-900">
                {currentUser?.bmi ? currentUser.bmi : '--'}
              </span>
              <span className="block text-[11px] font-semibold text-violet-700 mt-0.5">
                {currentUser?.bmi ? (currentUser.bmi < 18.5 ? 'Underweight' : currentUser.bmi < 25 ? 'Normal weight' : currentUser.bmi < 30 ? 'Overweight' : 'Obesity') : 'Screening metric'}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Screening estimate</p>
          </div>

          {/* 2. Exercise Today */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-semibold">Exercise Today</span>
              <Flame className="w-4 h-4 text-amber-500" />
            </div>
            <div className="mt-2">
              <span className="text-2xl font-extrabold text-slate-900">
                {stats.dailyExerciseMinutes} <span className="text-sm font-normal text-slate-500">min</span>
              </span>
              <span className="block text-[11px] text-slate-600 mt-0.5">
                {stats.totalExerciseSessions} total session{stats.totalExerciseSessions === 1 ? '' : 's'}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Accurate timestamp duration</p>
          </div>

          {/* 3. Breathwork Today */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-semibold">Breathwork Today</span>
              <Wind className="w-4 h-4 text-violet-500" />
            </div>
            <div className="mt-2">
              <span className="text-2xl font-extrabold text-slate-900">
                {stats.dailyBreathworkMinutes} <span className="text-sm font-normal text-slate-500">min</span>
              </span>
              <span className="block text-[11px] text-slate-600 mt-0.5">
                {stats.totalBreathworkSessions} total session{stats.totalBreathworkSessions === 1 ? '' : 's'}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Vagal tone & calm</p>
          </div>

          {/* 4. Sleep Target */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-semibold">Sleep Duration</span>
              <Moon className="w-4 h-4 text-indigo-500" />
            </div>
            <div className="mt-2">
              <span className="text-2xl font-extrabold text-slate-900">
                {currentUser?.typicalSleepHours || 7.5} <span className="text-sm font-normal text-slate-500">hrs</span>
              </span>
              <span className="block text-[11px] text-slate-600 mt-0.5">
                Target: 7–8.5 hrs
              </span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Circadian rhythm window</p>
          </div>

          {/* 5. Habit Streak */}
          <div className="col-span-2 lg:col-span-1 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-semibold">Active Streak</span>
              <TrendingUp className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="mt-2">
              <span className="text-2xl font-extrabold text-slate-900">
                {stats.streakDays} <span className="text-sm font-normal text-slate-500">days</span>
              </span>
              <span className="block text-[11px] text-emerald-700 font-semibold mt-0.5">
                {completedHabitsCount} of 4 habits checked today
              </span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Consecutive activity</p>
          </div>
        </div>
      </div>

      {/* QUICK MOOD CHECK-IN */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-heading font-bold text-base text-slate-900 flex items-center gap-2">
              <Smile className="w-4 h-4 text-violet-600" />
              <span>How are you feeling at this moment?</span>
            </h3>
            <p className="text-xs text-slate-500">Select a mood to check in and record to your wellness timeline</p>
          </div>
          {moodSavedToast && (
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 animate-fade-in">
              Mood logged!
            </span>
          )}
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
          {moodsList.map((m) => {
            const isSelected = selectedMood === m.label;
            return (
              <button
                key={m.label}
                type="button"
                onClick={() => handleSaveMood(m.label)}
                className={`p-2.5 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                  isSelected
                    ? 'border-violet-600 bg-violet-50 text-violet-900 font-bold ring-2 ring-violet-200 shadow-xs'
                    : 'border-slate-100 hover:border-violet-200 hover:bg-violet-50/40 text-slate-700'
                }`}
              >
                <span className="text-xl sm:text-2xl">{m.emoji}</span>
                <span className="text-[11px] truncate w-full font-medium">{m.label}</span>
              </button>
            );
          })}
        </div>

        {selectedMood && (
          <div className="mt-3 flex items-center gap-2">
            <input
              type="text"
              value={moodNote}
              onChange={(e) => setMoodNote(e.target.value)}
              placeholder="Add an optional brief reflection note (e.g. 'productive morning', 'deadline tension')..."
              className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-violet-500 focus:ring-1 focus:ring-violet-200 outline-hidden"
            />
            <button
              onClick={() => handleSaveMood(selectedMood)}
              className="px-3 py-2 bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold rounded-xl cursor-pointer"
            >
              Update Note
            </button>
          </div>
        )}
      </div>

      {/* TWO COLUMNS: PERSONALIZED RECOMMENDATIONS + DAILY WELLNESS PLAN */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Personalized Recommendations */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-heading font-bold text-lg text-slate-900">Personalized Recommendations</h2>
              <p className="text-xs text-slate-500">Based on your goals, energy, and saved history</p>
            </div>
            <button
              onClick={() => setActiveTab('activity_library')}
              className="text-xs text-violet-700 hover:text-violet-900 font-semibold flex items-center gap-1"
            >
              <span>Explore Library</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {activeRecommendations.map((rec) => {
              const isSaved = savedRecIds.has(rec.id);
              return (
                <div
                  key={rec.id}
                  className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs hover:border-violet-200 transition-all flex flex-col justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                        rec.category === 'physical'
                          ? 'bg-amber-100 text-amber-800'
                          : rec.category === 'mental'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {rec.category} recommendation
                      </span>

                      <div className="flex items-center gap-1 text-slate-400">
                        <button
                          onClick={() => toggleSaveRec(rec.id)}
                          aria-label="Save recommendation"
                          className={`p-1.5 rounded-lg hover:bg-slate-100 transition-colors ${
                            isSaved ? 'text-violet-600' : 'text-slate-400'
                          }`}
                        >
                          <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
                        </button>
                        <button
                          onClick={() => dismissRec(rec.id)}
                          aria-label="Dismiss recommendation"
                          className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <h3 className="font-heading font-bold text-sm sm:text-base text-slate-900">
                      {rec.title}
                    </h3>

                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      <strong className="text-violet-800 font-medium">Why it helps: </strong>
                      {rec.reason}
                    </p>

                    <p className="text-xs text-slate-600 mt-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      {rec.instructions}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-3 text-[11px] text-slate-500">
                      <span>Est. {rec.estimatedDuration}</span>
                      {rec.difficulty && <span>• {rec.difficulty}</span>}
                    </div>

                    <button
                      onClick={() => handleStartRec(rec)}
                      className="px-3.5 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs shadow-violet-200 transition-all cursor-pointer"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>Start Activity</span>
                    </button>
                  </div>
                </div>
              );
            })}

            {activeRecommendations.length === 0 && (
              <div className="bg-white rounded-2xl p-6 text-center border border-dashed border-slate-200">
                <p className="text-xs text-slate-500">You have completed or dismissed all current recommendations.</p>
                <button
                  onClick={() => setDismissedRecIds(new Set())}
                  className="mt-2 text-xs font-bold text-violet-700 hover:underline"
                >
                  Reset Recommendations
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right: Daily Wellness Plan */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-heading font-bold text-lg text-slate-900">Daily Wellness Plan</h2>
              <p className="text-xs text-slate-500">Interactive healthy habit anchors</p>
            </div>
            <span className="text-xs font-bold text-violet-700 bg-violet-50 px-2 py-0.5 rounded-md">
              {completedHabitsCount} / 4 Done
            </span>
          </div>

          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs space-y-3">
            {dailyPlanItems.map((item) => {
              const isChecked = Boolean(dailyHabits[item.key]);
              return (
                <div
                  key={item.key}
                  onClick={() => toggleDailyHabit(item.key)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                    isChecked
                      ? 'border-emerald-200 bg-emerald-50/40 text-slate-500'
                      : 'border-slate-100 hover:border-violet-200 hover:bg-slate-50/60 text-slate-900'
                  }`}
                >
                  <button
                    type="button"
                    className="mt-0.5 text-slate-400 shrink-0"
                    aria-label={`Toggle habit: ${item.title}`}
                  >
                    {isChecked ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <Circle className="w-5 h-5 text-slate-300 hover:text-violet-500" />
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-semibold text-violet-700 uppercase">{item.time}</span>
                      <span className="text-[10px] text-slate-400">{item.category}</span>
                    </div>
                    <h4 className={`text-xs font-bold truncate mt-0.5 ${isChecked ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                      {item.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">{item.desc}</p>
                  </div>
                </div>
              );
            })}

            <div className="pt-2 text-center">
              <button
                onClick={() => setActiveTab('reminders')}
                className="text-xs text-violet-700 hover:text-violet-900 font-bold inline-flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add custom reminder to daily planner</span>
              </button>
            </div>
          </div>

          {/* Quick link to AI Assistant */}
          <div className="p-4 rounded-2xl bg-linear-to-br from-violet-600 to-indigo-700 text-white shadow-md shadow-violet-200 flex items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-1.5 text-xs text-violet-200 font-semibold mb-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Conversational AI</span>
              </div>
              <h4 className="font-heading font-bold text-sm">Ask CareNova about your history</h4>
              <p className="text-xs text-violet-100 mt-0.5">"How many minutes did I exercise this week?"</p>
            </div>
            <button
              onClick={() => setActiveTab('ai_chat')}
              className="py-2 px-3 bg-white text-violet-900 hover:bg-violet-50 rounded-xl text-xs font-bold shrink-0 transition-colors cursor-pointer"
            >
              Open Chat
            </button>
          </div>
        </div>
      </div>

      {/* RECENT RECORDED SESSIONS PREVIEW */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-heading font-bold text-base text-slate-900">Recent Completed Sessions</h3>
            <p className="text-xs text-slate-500">Your latest recorded workouts and breathing exercises</p>
          </div>
          <button
            onClick={() => setActiveTab('activity_history')}
            className="text-xs text-violet-700 hover:text-violet-900 font-bold flex items-center gap-1"
          >
            <span>View Full History</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {activities.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-slate-200 rounded-2xl">
            <History className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-slate-700">No recorded sessions yet</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Start your first physical workout or guided breathwork practice to see real duration, metrics, and progress here.
            </p>
            <div className="mt-4 flex items-center justify-center gap-3">
              <button
                onClick={() => setActiveTab('exercise_tracker')}
                className="px-3.5 py-1.5 rounded-xl bg-violet-600 text-white text-xs font-bold"
              >
                Record Exercise
              </button>
              <button
                onClick={() => setActiveTab('breathwork')}
                className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold"
              >
                Practice Breathwork
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {activities.slice(0, 3).map((act) => {
              const isExercise = act.type === 'exercise';
              return (
                <div
                  key={act.id}
                  className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-violet-50/30 transition-colors flex items-center justify-between"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      isExercise ? 'bg-amber-100 text-amber-700' : 'bg-purple-100 text-purple-700'
                    }`}>
                      {isExercise ? <Flame className="w-4 h-4" /> : <Wind className="w-4 h-4" />}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-900 truncate">
                        {isExercise ? (act as any).activityName : (act as any).technique}
                      </h4>
                      <p className="text-[11px] text-slate-500 truncate">
                        {new Date(act.startedAt).toLocaleDateString()} • {act.isCompleted ? 'Completed' : 'Partial'}
                      </p>
                    </div>
                  </div>

                  <span className="text-xs font-bold text-violet-800 bg-violet-100/70 px-2 py-0.5 rounded-md shrink-0">
                    {formatDuration(act.durationSeconds)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
