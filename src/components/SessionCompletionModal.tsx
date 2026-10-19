import React from 'react';
import { CheckCircle2, Sparkles, Volume2, ArrowRight, RotateCcw } from 'lucide-react';
import { useWellness } from '../context/WellnessContext';
import { formatDuration } from '../utils/analytics';
import { playWellnessChime } from '../utils/sound';

export const SessionCompletionModal: React.FC = () => {
  const { completedSessionDetails, dismissCompletionModal, setActiveTab, soundSettings } = useWellness();

  if (!completedSessionDetails) return null;

  const handleDone = () => {
    dismissCompletionModal();
    setActiveTab('dashboard');
  };

  const handleStartAnother = () => {
    const nextTab = completedSessionDetails.type === 'exercise' ? 'exercise_tracker' : 'breathwork';
    dismissCompletionModal();
    setActiveTab(nextTab);
  };

  const handleReplayChime = async () => {
    await playWellnessChime(soundSettings.volume);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-violet-100 text-center relative overflow-hidden">
        {/* Soft decorative background glow */}
        <div className="absolute -top-16 -left-16 w-48 h-48 bg-violet-200/50 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -right-16 w-48 h-48 bg-purple-200/50 rounded-full blur-2xl pointer-events-none" />

        {/* Success Icon */}
        <div className="relative z-10 mx-auto w-20 h-20 rounded-full bg-linear-to-tr from-violet-600 via-indigo-600 to-purple-500 text-white flex items-center justify-center shadow-lg shadow-violet-200 mb-5 animate-bounce-short">
          <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
        </div>

        {/* Title & Celebration */}
        <div className="relative z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-100 text-violet-800 text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-violet-600" />
            <span>Recorded to History</span>
          </span>

          <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-slate-900 tracking-tight">
            Session Completed!
          </h2>

          <p className="text-sm text-slate-600 mt-2 leading-relaxed">
            Great job! You made intentional time for your physical and mental well-being today. Every moment counts.
          </p>

          {/* Session Summary Card */}
          <div className="mt-5 p-4 rounded-2xl bg-linear-to-br from-violet-50/90 to-purple-50/60 border border-violet-100/90 text-left">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {completedSessionDetails.type === 'exercise' ? 'Physical Exercise' : 'Guided Breathwork'}
              </span>
              <span className="text-xs font-extrabold text-violet-700 bg-violet-100 px-2 py-0.5 rounded-md">
                {formatDuration(completedSessionDetails.durationSeconds)}
              </span>
            </div>

            <h3 className="font-heading font-bold text-base text-slate-900 truncate">
              {completedSessionDetails.name}
            </h3>

            <p className="text-xs text-violet-900 mt-1 font-medium">
              {completedSessionDetails.metrics}
            </p>
          </div>

          {/* Chime replay or unlock if blocked */}
          <div className="mt-4 flex items-center justify-center">
            <button
              onClick={handleReplayChime}
              className="inline-flex items-center gap-1.5 text-xs text-violet-700 hover:text-violet-900 bg-violet-50 hover:bg-violet-100/80 px-3 py-1.5 rounded-full transition-colors cursor-pointer"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>Play completion chime</span>
            </button>
          </div>

          {/* Action buttons */}
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleDone}
              className="flex-1 py-3 px-4 rounded-xl bg-linear-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-bold text-sm shadow-md shadow-violet-200 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Back to Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={handleStartAnother}
              className="py-3 px-4 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4 text-slate-500" />
              <span>Start Another</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
