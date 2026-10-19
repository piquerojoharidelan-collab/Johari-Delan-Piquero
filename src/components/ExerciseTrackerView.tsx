import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  CheckCircle2,
  RotateCcw,
  Trash2,
  Timer,
  Dumbbell,
  AlertCircle,
  Plus,
  Minus,
  Sparkles,
  ShieldCheck,
  Star,
  Info,
} from 'lucide-react';
import { useWellness } from '../context/WellnessContext';
import { ExerciseCategory, ExerciseSession } from '../types/wellness';
import { formatTimerDisplay } from '../utils/analytics';

export const ExerciseTrackerView: React.FC = () => {
  const { activeExercise, cancelExercise, saveActivity, setActiveTab } = useWellness();

  // Configuration state before starting
  const [exerciseName, setExerciseName] = useState(activeExercise?.name || 'Full-Body Movement Flow');
  const [category, setCategory] = useState<ExerciseCategory>(activeExercise?.category || 'Stretching');
  const [targetMinutes, setTargetMinutes] = useState<number>(activeExercise?.targetSeconds ? Math.round(activeExercise.targetSeconds / 60) : 15);
  const [sessionNotes, setSessionNotes] = useState(activeExercise?.initialNotes || '');

  // Workout run state
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [pausedDuration, setPausedDuration] = useState(0);
  const [pauseTimestamp, setPauseTimestamp] = useState<number | null>(null);

  // Performance metrics recorded during workout
  const [sets, setSets] = useState<number>(0);
  const [reps, setReps] = useState<number>(0);
  const [distanceKm, setDistanceKm] = useState<number | ''>('');
  const [effortRating, setEffortRating] = useState<number>(3); // 1-5
  const [isSaving, setIsSaving] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  // Reference for timer interval
  const timerRef = useRef<any>(null);

  // Handle active exercise payload from recommendations / library
  useEffect(() => {
    if (activeExercise) {
      setExerciseName(activeExercise.name);
      setCategory(activeExercise.category);
      if (activeExercise.targetSeconds) {
        setTargetMinutes(Math.round(activeExercise.targetSeconds / 60));
      }
      if (activeExercise.initialNotes) {
        setSessionNotes(activeExercise.initialNotes);
      }
    }
  }, [activeExercise]);

  // Timestamp-based elapsed timer loop
  useEffect(() => {
    if (isRunning && !isPaused && startTime) {
      timerRef.current = setInterval(() => {
        const now = Date.now();
        const totalElapsed = Math.floor((now - startTime - pausedDuration) / 1000);
        setElapsedSeconds(Math.max(0, totalElapsed));
      }, 500);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, isPaused, startTime, pausedDuration]);

  const handleStartWorkout = () => {
    const now = Date.now();
    setStartTime(now);
    setIsRunning(true);
    setIsPaused(false);
    setElapsedSeconds(0);
    setPausedDuration(0);
    setPauseTimestamp(null);
    setIsFinished(false);
  };

  const handlePauseWorkout = () => {
    setIsPaused(true);
    setPauseTimestamp(Date.now());
  };

  const handleResumeWorkout = () => {
    if (pauseTimestamp) {
      const additionalPaused = Date.now() - pauseTimestamp;
      setPausedDuration((prev) => prev + additionalPaused);
    }
    setPauseTimestamp(null);
    setIsPaused(false);
  };

  const handleFinishWorkout = async (isPartial: boolean = false) => {
    if (isSaving || isFinished) return; // Prevent duplicate triggers on repeated clicks
    setIsSaving(true);

    if (timerRef.current) clearInterval(timerRef.current);

    const now = Date.now();
    const startIso = startTime ? new Date(startTime).toISOString() : new Date().toISOString();
    const finishIso = new Date(now).toISOString();
    const finalSeconds = elapsedSeconds > 0 ? elapsedSeconds : 1;

    const completed = !isPartial && (targetMinutes === 0 || elapsedSeconds >= Math.min(30, targetMinutes * 15));

    const sessionRecord: ExerciseSession = {
      id: `ex_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId: 'current',
      type: 'exercise',
      activityName: exerciseName.trim() || 'Exercise Session',
      category,
      startedAt: startIso,
      finishedAt: finishIso,
      durationSeconds: finalSeconds,
      isCompleted: completed,
      effortRating,
      sets: sets > 0 ? sets : undefined,
      reps: reps > 0 ? reps : undefined,
      distanceKm: typeof distanceKm === 'number' && distanceKm > 0 ? distanceKm : undefined,
      notes: sessionNotes.trim() || undefined,
    };

    setIsFinished(true);
    await saveActivity(sessionRecord);
    setIsSaving(false);
    setIsRunning(false);
    setIsPaused(false);
  };

  const handleDiscardWorkout = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsRunning(false);
    setIsPaused(false);
    setElapsedSeconds(0);
    setStartTime(null);
    cancelExercise();
  };

  const categories: ExerciseCategory[] = [
    'Walking',
    'Running',
    'Stretching',
    'Strength training',
    'Cardio',
    'Yoga',
    'Mobility',
    'Other',
  ];

  const targetSecondsTotal = targetMinutes * 60;
  const progressPercent = targetSecondsTotal > 0 ? Math.min(100, Math.round((elapsedSeconds / targetSecondsTotal) * 100)) : 0;

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold mb-1.5">
            <Timer className="w-3.5 h-3.5 text-amber-600" />
            <span>Real-Time Workout Session Tracker</span>
          </div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-slate-900 tracking-tight">
            Exercise Tracker
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Accurate timestamp-grounded physical movement records with completion chimes
          </p>
        </div>

        {isRunning && (
          <div className="flex items-center gap-2">
            <span className="flex h-3 w-3 relative">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isPaused ? 'bg-amber-400' : 'bg-emerald-400'}`} />
              <span className={`relative inline-flex rounded-full h-3 w-3 ${isPaused ? 'bg-amber-500' : 'bg-emerald-500'}`} />
            </span>
            <span className="text-xs font-bold text-slate-700">
              {isPaused ? 'Paused' : 'Active Session'}
            </span>
          </div>
        )}
      </div>

      {/* WORKOUT INTERFACE */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm relative overflow-hidden">
        {/* Soft background tint */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        {!isRunning ? (
          /* PRE-WORKOUT SETUP VIEW */
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5" htmlFor="exName">
                  Exercise / Workout Name
                </label>
                <input
                  id="exName"
                  type="text"
                  value={exerciseName}
                  onChange={(e) => setExerciseName(e.target.value)}
                  placeholder="e.g. Morning Brisk Walk, Core & Mobility"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-900 focus:border-violet-500 focus:ring-2 focus:ring-violet-200 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ExerciseCategory)}
                  aria-label="Select exercise category"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-900 focus:border-violet-500 focus:ring-2 focus:ring-violet-200 outline-hidden bg-white"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Target Duration Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Target Session Duration
              </label>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {[5, 10, 15, 20, 30, 45].map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => setTargetMinutes(mins)}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      targetMinutes === mins
                        ? 'border-violet-600 bg-violet-50 text-violet-900 ring-2 ring-violet-200'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    {mins} min
                  </button>
                ))}
              </div>
            </div>

            {/* Notes / Plan */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5" htmlFor="notes">
                Session Focus or Routine Notes <span className="font-normal text-slate-400">(Optional)</span>
              </label>
              <textarea
                id="notes"
                rows={2}
                value={sessionNotes}
                onChange={(e) => setSessionNotes(e.target.value)}
                placeholder="e.g. 3 sets of squats, gentle spinal warm-up, focus on steady breathing..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:border-violet-500 focus:ring-2 focus:ring-violet-200 outline-hidden resize-none"
              />
            </div>

            {/* Sensor & Safety Disclaimer */}
            <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-start gap-3 text-xs text-slate-600">
              <ShieldCheck className="w-5 h-5 text-violet-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-800 block">CareNova Integrity Guarantee</span>
                CareNova records your genuine active timestamps. We never fabricate biometric data, repetition sensors, or calorie counts without connected certified hardware.
              </div>
            </div>

            {/* Launch Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleStartWorkout}
                className="w-full py-4 rounded-2xl bg-linear-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-extrabold text-base shadow-lg shadow-violet-200 transition-all flex items-center justify-center gap-3 cursor-pointer"
              >
                <Play className="w-5 h-5 fill-current" />
                <span>Start Workout Session</span>
              </button>
            </div>
          </div>
        ) : (
          /* ACTIVE WORKOUT IN-PROGRESS VIEW */
          <div className="space-y-6 text-center">
            {/* Workout Details Pill */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-50 border border-violet-100 text-xs font-bold text-violet-900">
              <Dumbbell className="w-3.5 h-3.5 text-violet-600" />
              <span>{category}</span>
              <span>•</span>
              <span className="text-slate-600 truncate max-w-xs">{exerciseName}</span>
            </div>

            {/* Huge Elapsed Timer */}
            <div className="py-4">
              <div className="font-heading font-extrabold text-6xl sm:text-7xl lg:text-8xl text-slate-900 tracking-tight font-mono select-none">
                {formatTimerDisplay(elapsedSeconds)}
              </div>
              <div className="text-xs text-slate-500 mt-2 flex items-center justify-center gap-3">
                <span>Target: {targetMinutes} min</span>
                <span>•</span>
                <span>Started: {startTime ? new Date(startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--'}</span>
              </div>

              {/* Progress bar */}
              {targetMinutes > 0 && (
                <div className="max-w-md mx-auto mt-4">
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-linear-to-r from-violet-600 to-indigo-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                    <span>{progressPercent}% completed</span>
                    <span>{Math.round(elapsedSeconds / 60)} / {targetMinutes} min</span>
                  </div>
                </div>
              )}
            </div>

            {/* Live Interactive Measurements (Sets, Reps, Distance, Effort) */}
            <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200/80 max-w-xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
              {/* Sets */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Sets</label>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setSets(Math.max(0, sets - 1))}
                    className="w-7 h-7 rounded-lg bg-white border border-slate-200 text-slate-700 flex items-center justify-center font-bold"
                  >
                    -
                  </button>
                  <span className="text-sm font-bold text-slate-900 w-6 text-center">{sets}</span>
                  <button
                    onClick={() => setSets(sets + 1)}
                    className="w-7 h-7 rounded-lg bg-white border border-slate-200 text-slate-700 flex items-center justify-center font-bold"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Reps */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Total Reps</label>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setReps(Math.max(0, reps - 5))}
                    className="w-7 h-7 rounded-lg bg-white border border-slate-200 text-slate-700 flex items-center justify-center font-bold"
                  >
                    -
                  </button>
                  <span className="text-sm font-bold text-slate-900 w-8 text-center">{reps}</span>
                  <button
                    onClick={() => setReps(reps + 5)}
                    className="w-7 h-7 rounded-lg bg-white border border-slate-200 text-slate-700 flex items-center justify-center font-bold"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Distance */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1" htmlFor="dist">Distance (km)</label>
                <input
                  id="dist"
                  type="number"
                  step={0.1}
                  min={0}
                  value={distanceKm}
                  onChange={(e) => setDistanceKm(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="0.0"
                  className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-900"
                />
              </div>

              {/* Effort rating */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Effort (1-5)</label>
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setEffortRating(star)}
                      className="p-0.5 text-amber-400 hover:text-amber-500"
                    >
                      <Star className={`w-3.5 h-3.5 ${star <= effortRating ? 'fill-current' : 'text-slate-300'}`} />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Primary Tracker Controls */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
              {!isPaused ? (
                <button
                  type="button"
                  onClick={handlePauseWorkout}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Pause className="w-4 h-4" />
                  <span>Pause Session</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleResumeWorkout}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Resume Workout</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => handleFinishWorkout(false)}
                disabled={isSaving}
                className="w-full sm:flex-1 py-3 px-6 rounded-xl bg-linear-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-extrabold text-sm shadow-md shadow-violet-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isSaving ? 'Saving...' : 'Finish Workout'}</span>
              </button>
            </div>

            {/* Secondary actions: Save partial or discard */}
            <div className="flex items-center justify-center gap-4 pt-2 text-xs text-slate-500">
              <button
                type="button"
                onClick={() => handleFinishWorkout(true)}
                className="hover:text-violet-700 transition-colors cursor-pointer underline"
              >
                Save as partial session
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={handleDiscardWorkout}
                className="hover:text-rose-600 transition-colors cursor-pointer flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Discard session</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
