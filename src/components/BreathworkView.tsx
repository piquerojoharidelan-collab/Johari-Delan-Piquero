import React, { useState, useEffect, useRef } from 'react';
import {
  Wind,
  Play,
  Pause,
  CheckCircle2,
  RotateCcw,
  Sparkles,
  Info,
  ShieldAlert,
  Smile,
  Heart,
  Volume2,
} from 'lucide-react';
import { useWellness } from '../context/WellnessContext';
import { BreathworkTechnique, BreathworkSession, MoodType } from '../types/wellness';
import { formatTimerDisplay } from '../utils/analytics';

interface TechniqueDefinition {
  name: BreathworkTechnique;
  tagline: string;
  purpose: string;
  instructions: string;
  phases: { name: 'Inhale' | 'Hold' | 'Exhale' | 'Rest'; seconds: number }[];
  cycleDuration: number;
}

const TECHNIQUES: TechniqueDefinition[] = [
  {
    name: 'Box breathing',
    tagline: 'Equal-ratio Navy SEAL focus & stress regulation',
    purpose: 'Stabilizes the nervous system, clears mental fog, and resets heart rate variability under high pressure.',
    instructions: 'Inhale smoothly through your nose (4s), gently hold air in your lungs (4s), exhale slowly through lips (4s), and pause with empty lungs (4s).',
    phases: [
      { name: 'Inhale', seconds: 4 },
      { name: 'Hold', seconds: 4 },
      { name: 'Exhale', seconds: 4 },
      { name: 'Rest', seconds: 4 },
    ],
    cycleDuration: 16,
  },
  {
    name: 'Slow breathing',
    tagline: 'Extended exhalation vagal activator',
    purpose: 'Activates the parasympathetic "rest and digest" branch of the nervous system by making exhalation 50% longer than inhalation.',
    instructions: 'Breathe in through your nose for 4 seconds, then gently blow out through softly parted lips for 6 seconds. No breath holding required.',
    phases: [
      { name: 'Inhale', seconds: 4 },
      { name: 'Exhale', seconds: 6 },
    ],
    cycleDuration: 10,
  },
  {
    name: 'Diaphragmatic breathing',
    tagline: 'Deep belly expansion & pelvic relaxation',
    purpose: 'Encourages full oxygen exchange, lowers blood pressure, and reverses shallow thoracic chest breathing.',
    instructions: 'Place one hand on your belly. Breathe deeply into the lower abdomen (4s), hold gently (1s), exhale slowly letting belly sink (6s), and pause (1s).',
    phases: [
      { name: 'Inhale', seconds: 4 },
      { name: 'Hold', seconds: 1 },
      { name: 'Exhale', seconds: 6 },
      { name: 'Rest', seconds: 1 },
    ],
    cycleDuration: 12,
  },
  {
    name: 'Gentle relaxation breathing',
    tagline: 'The classic 4-7-8 tranquility & sleep induction technique',
    purpose: 'A natural tranquilizer for the nervous system designed by Dr. Andrew Weil to soothe racing thoughts before rest.',
    instructions: 'Inhale silently through the nose for 4 counts, hold breath comfortably for 7 counts, and exhale completely with a whoosh sound for 8 counts.',
    phases: [
      { name: 'Inhale', seconds: 4 },
      { name: 'Hold', seconds: 7 },
      { name: 'Exhale', seconds: 8 },
    ],
    cycleDuration: 19,
  },
  {
    name: 'Mindful breathing',
    tagline: 'Present-moment awareness & gentle centering',
    purpose: 'Anchors attention in the current moment without straining, fostering emotional composure.',
    instructions: 'Notice the sensation of air entering the nostrils on the 4-second inhale, and releasing any tightness on the 4-second exhale.',
    phases: [
      { name: 'Inhale', seconds: 4 },
      { name: 'Exhale', seconds: 4 },
    ],
    cycleDuration: 8,
  },
];

export const BreathworkView: React.FC = () => {
  const { activeBreathwork, cancelBreathwork, saveActivity, soundSettings } = useWellness();

  // Selection state
  const [selectedTechnique, setSelectedTechnique] = useState<BreathworkTechnique>(
    activeBreathwork?.technique || 'Box breathing'
  );
  const [targetMinutes, setTargetMinutes] = useState<number>(activeBreathwork?.targetMinutes || 3);
  const [moodBefore, setMoodBefore] = useState<MoodType | undefined>('Stressed');
  const [moodAfter, setMoodAfter] = useState<MoodType | undefined>(undefined);
  const [notes, setNotes] = useState('');

  // Active guide state
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [phaseSecondsLeft, setPhaseSecondsLeft] = useState(4);
  const [completedCycles, setCompletedCycles] = useState(0);
  const [startTimestamp, setStartTimestamp] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const activeTechniqueObj = TECHNIQUES.find((t) => t.name === selectedTechnique) || TECHNIQUES[0];

  // Set technique from external launcher
  useEffect(() => {
    if (activeBreathwork) {
      setSelectedTechnique(activeBreathwork.technique);
      setTargetMinutes(activeBreathwork.targetMinutes);
    }
  }, [activeBreathwork]);

  // Main breath clock
  const intervalRef = useRef<any>(null);

  useEffect(() => {
    if (isActive && !isPaused) {
      intervalRef.current = setInterval(() => {
        setElapsedSeconds((prev) => {
          const nextElapsed = prev + 1;
          const targetSeconds = targetMinutes * 60;
          if (nextElapsed >= targetSeconds) {
            // Target time reached!
            handleFinishSession(false);
          }
          return nextElapsed;
        });

        setPhaseSecondsLeft((currentSeconds) => {
          if (currentSeconds <= 1) {
            // Advance phase
            setPhaseIndex((prevPhase) => {
              const nextPhase = (prevPhase + 1) % activeTechniqueObj.phases.length;
              if (nextPhase === 0) {
                setCompletedCycles((c) => c + 1);
              }
              return nextPhase;
            });
            // Look up next phase duration
            const nextIdx = (phaseIndex + 1) % activeTechniqueObj.phases.length;
            return activeTechniqueObj.phases[nextIdx].seconds;
          }
          return currentSeconds - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isActive, isPaused, phaseIndex, activeTechniqueObj, targetMinutes]);

  const handleStartSession = () => {
    setIsActive(true);
    setIsPaused(false);
    setElapsedSeconds(0);
    setCompletedCycles(0);
    setPhaseIndex(0);
    setPhaseSecondsLeft(activeTechniqueObj.phases[0].seconds);
    setStartTimestamp(Date.now());
  };

  const handlePause = () => {
    setIsPaused(true);
  };

  const handleResume = () => {
    setIsPaused(false);
  };

  const handleFinishSession = async (isPartial: boolean = false) => {
    if (isSaving) return;
    setIsSaving(true);

    if (intervalRef.current) clearInterval(intervalRef.current);

    const now = Date.now();
    const startedAt = startTimestamp ? new Date(startTimestamp).toISOString() : new Date().toISOString();
    const finishedAt = new Date(now).toISOString();
    const duration = elapsedSeconds > 0 ? elapsedSeconds : 1;
    const targetSeconds = targetMinutes * 60;
    const isCompleted = !isPartial && elapsedSeconds >= Math.min(30, targetSeconds * 0.75);

    const session: BreathworkSession = {
      id: `bw_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId: 'current',
      type: 'breathwork',
      technique: selectedTechnique,
      startedAt,
      finishedAt,
      durationSeconds: duration,
      targetMinutes,
      cyclesCompleted: completedCycles,
      isCompleted,
      moodBefore,
      moodAfter,
      notes: notes.trim() || undefined,
    };

    await saveActivity(session);
    setIsSaving(false);
    setIsActive(false);
    setIsPaused(false);
    cancelBreathwork();
  };

  const handleCancelSession = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsActive(false);
    setIsPaused(false);
    setElapsedSeconds(0);
    cancelBreathwork();
  };

  const currentPhase = activeTechniqueObj.phases[phaseIndex];
  const targetSecondsTotal = targetMinutes * 60;
  const remainingSeconds = Math.max(0, targetSecondsTotal - elapsedSeconds);

  // Dynamic animation scale for the breathing circle:
  // Inhale: smoothly grows to 1.35
  // Hold: stays steady at current expanded size
  // Exhale: gently returns to 0.85
  // Rest: rests softly at 0.85
  let circleScaleClass = 'scale-95';
  let phaseText = 'Prepare';
  let phaseColor = 'text-violet-600';
  let circleBg = 'from-violet-400 via-indigo-400 to-purple-400';

  if (isActive) {
    if (currentPhase.name === 'Inhale') {
      circleScaleClass = 'scale-130 transition-transform ease-out duration-3000';
      phaseText = 'Breathe In Slowly';
      phaseColor = 'text-indigo-600';
      circleBg = 'from-indigo-500 via-violet-500 to-purple-500';
    } else if (currentPhase.name === 'Hold') {
      circleScaleClass = 'scale-130 transition-none';
      phaseText = 'Hold Gently';
      phaseColor = 'text-purple-600';
      circleBg = 'from-purple-500 via-violet-600 to-indigo-600';
    } else if (currentPhase.name === 'Exhale') {
      circleScaleClass = 'scale-85 transition-transform ease-in duration-3000';
      phaseText = 'Exhale Smoothly';
      phaseColor = 'text-teal-600';
      circleBg = 'from-teal-400 via-violet-500 to-indigo-400';
    } else if (currentPhase.name === 'Rest') {
      circleScaleClass = 'scale-85 transition-none';
      phaseText = 'Pause with Stillness';
      phaseColor = 'text-slate-600';
      circleBg = 'from-slate-400 via-indigo-400 to-violet-400';
    }
  }

  const moodChoices: MoodType[] = ['Very good', 'Good', 'Okay', 'Stressed', 'Sad', 'Anxious', 'Overwhelmed'];

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-100 text-violet-800 text-xs font-bold mb-1.5">
            <Wind className="w-3.5 h-3.5 text-violet-600" />
            <span>Guided Breathwork System</span>
          </div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-slate-900 tracking-tight">
            Mindful Breathing Guide
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Science-grounded breath pacing for autonomic regulation and emotional composure
          </p>
        </div>

        {soundSettings.enabled && (
          <div className="inline-flex items-center gap-1.5 text-xs text-violet-700 bg-violet-50 px-3 py-1.5 rounded-full border border-violet-100">
            <Volume2 className="w-3.5 h-3.5" />
            <span>Completion chime armed</span>
          </div>
        )}
      </div>

      {!isActive ? (
        /* TECHNIQUE SELECTION & CONFIGURATION VIEW */
        <div className="space-y-6">
          {/* Technique Cards */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-3">
              Select Breathing Technique
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {TECHNIQUES.map((tech) => {
                const isSelected = selectedTechnique === tech.name;
                return (
                  <button
                    key={tech.name}
                    type="button"
                    onClick={() => setSelectedTechnique(tech.name)}
                    className={`text-left p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'border-violet-600 bg-violet-50/70 shadow-xs ring-2 ring-violet-200'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-heading font-bold text-sm text-slate-900">{tech.name}</span>
                        <span className="text-[10px] font-bold bg-violet-100 text-violet-800 px-2 py-0.5 rounded-md">
                          {tech.cycleDuration}s cycle
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-violet-800 mb-1">{tech.tagline}</p>
                      <p className="text-xs text-slate-600 leading-relaxed mb-2">{tech.purpose}</p>
                    </div>

                    <div className="mt-2 pt-2 border-t border-slate-100 flex items-center gap-2 text-[11px] text-slate-500">
                      {tech.phases.map((p, idx) => (
                        <span key={idx} className="bg-slate-100 px-2 py-0.5 rounded-md font-medium">
                          {p.name}: {p.seconds}s
                        </span>
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Session Duration Selector */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <label className="block text-xs font-bold text-slate-700 mb-2">
              Select Session Duration
            </label>
            <div className="grid grid-cols-4 gap-3">
              {[1, 3, 5, 10].map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => setTargetMinutes(mins)}
                  className={`py-3 px-4 rounded-xl border text-sm font-extrabold transition-all cursor-pointer text-center ${
                    targetMinutes === mins
                      ? 'border-violet-600 bg-violet-50 text-violet-900 ring-2 ring-violet-200'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <span>{mins} Minute{mins === 1 ? '' : 's'}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Mood Check-In Before Session */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <label className="block text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
              <Smile className="w-4 h-4 text-violet-600" />
              <span>Current Mood Before Session <span className="font-normal text-slate-400">(Optional)</span></span>
            </label>
            <div className="flex flex-wrap gap-2">
              {moodChoices.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMoodBefore(m)}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                    moodBefore === m
                      ? 'bg-violet-600 border-violet-600 text-white'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Safety Notice */}
          <div className="p-4 bg-amber-50/80 border border-amber-200/80 rounded-2xl flex items-start gap-3 text-xs text-amber-900">
            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block mb-0.5">Gentle Body Autonomy Advice</span>
              Never force or strain your breath holding. If at any moment you experience dizziness, shortness of breath, or anxiety, pause immediately and resume your normal natural breathing rhythm.
            </div>
          </div>

          {/* Launch Breathwork Button */}
          <button
            type="button"
            onClick={handleStartSession}
            className="w-full py-4 rounded-2xl bg-linear-to-r from-violet-600 via-indigo-600 to-purple-600 hover:from-violet-700 hover:to-indigo-700 text-white font-extrabold text-base shadow-lg shadow-violet-200 transition-all flex items-center justify-center gap-3 cursor-pointer"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>Begin Guided Breathwork ({targetMinutes} min)</span>
          </button>
        </div>
      ) : (
        /* ACTIVE GUIDED BREATHWORK VISUALIZER */
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-sm text-center relative overflow-hidden flex flex-col items-center">
          {/* Technique pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-50 border border-violet-100 text-xs font-bold text-violet-900 mb-6">
            <Wind className="w-3.5 h-3.5 text-violet-600" />
            <span>{selectedTechnique}</span>
            <span>•</span>
            <span>{completedCycles} cycles completed</span>
          </div>

          {/* Calming Animated Circle Guide */}
          <div className="relative w-72 h-72 sm:w-80 sm:h-80 flex items-center justify-center my-4">
            {/* Soft pulsing ambient halos */}
            <div
              className={`absolute inset-0 rounded-full bg-linear-to-tr ${circleBg} opacity-20 blur-xl transform ${circleScaleClass}`}
            />
            <div
              className={`absolute inset-4 rounded-full bg-linear-to-tr ${circleBg} opacity-30 blur-md transform ${circleScaleClass}`}
            />

            {/* Main breathing disc */}
            <div
              className={`w-48 h-48 sm:w-56 sm:h-56 rounded-full bg-linear-to-tr ${circleBg} text-white shadow-2xl shadow-violet-300/50 flex flex-col items-center justify-center p-6 transform ${circleScaleClass}`}
            >
              <span className="text-xs uppercase font-extrabold tracking-widest opacity-90 drop-shadow-xs">
                {currentPhase.name}
              </span>
              <span className="font-heading font-extrabold text-5xl sm:text-6xl my-1 font-mono drop-shadow-sm">
                {phaseSecondsLeft}
              </span>
              <span className="text-[11px] font-medium opacity-80">seconds</span>
            </div>
          </div>

          {/* Phase Guidance text */}
          <div className="mt-4">
            <h3 className={`font-heading font-extrabold text-2xl ${phaseColor} tracking-tight transition-colors`}>
              {phaseText}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Time remaining: {formatTimerDisplay(remainingSeconds)}
            </p>
          </div>

          {/* Post-session mood selection (optional, can be selected while winding down) */}
          <div className="mt-6 pt-4 border-t border-slate-100 max-w-sm w-full">
            <label className="block text-[11px] font-bold text-slate-500 mb-1.5">
              Feeling after session (Optional):
            </label>
            <div className="flex flex-wrap justify-center gap-1.5">
              {(['Good', 'Very good', 'Okay', 'Calm', 'Relaxed'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setMoodAfter(m as any)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                    moodAfter === (m as any) ? 'bg-violet-600 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Controls */}
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-md">
            {!isPaused ? (
              <button
                type="button"
                onClick={handlePause}
                className="w-full sm:w-auto px-6 py-3 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <Pause className="w-4 h-4" />
                <span>Pause</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleResume}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Resume</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => handleFinishSession(false)}
              disabled={isSaving}
              className="w-full sm:flex-1 py-3 px-6 rounded-xl bg-linear-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-extrabold text-sm shadow-md shadow-violet-200 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSaving ? 'Saving...' : 'Finish & Save Session'}</span>
            </button>
          </div>

          {/* Secondary options */}
          <div className="mt-4 flex items-center justify-center gap-4 text-xs text-slate-500">
            <button
              type="button"
              onClick={() => handleFinishSession(true)}
              className="hover:text-violet-700 underline cursor-pointer"
            >
              Save partial session
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={handleCancelSession}
              className="hover:text-rose-600 cursor-pointer"
            >
              Cancel session
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
