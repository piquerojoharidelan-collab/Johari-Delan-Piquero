import React, { useState } from 'react';
import {
  Dumbbell,
  Flame,
  Droplet,
  Utensils,
  Moon,
  ShieldAlert,
  Play,
  Clock,
  Sparkles,
  ArrowRight,
  Activity,
  Heart,
} from 'lucide-react';
import { useWellness } from '../context/WellnessContext';

export const PhysicalWellnessView: React.FC = () => {
  const { currentUser, startExercise, setActiveTab } = useWellness();

  // Water calculator based on weight
  const weight = currentUser?.weightKg || 70;
  // Baseline hydration recommendation: ~35ml per kg of bodyweight
  const recommendedWaterMl = Math.round(weight * 35);
  const recommendedGlasses = Math.round(recommendedWaterMl / 250);

  const physicalRoutines = [
    {
      title: 'Full-Body Foundational Strength',
      category: 'Strength training',
      durationMins: 15,
      targetSeconds: 900,
      level: 'Beginner',
      benefits: 'Stimulates bone mineral density, strengthens stabilizing tendons, and balances core posture without requiring weights.',
      instructions: '3 rounds: 10 bodyweight squats, 8 modified push-ups, 20-second plank hold, and 12 glute bridges. Rest 60s between rounds.',
    },
    {
      title: 'Energizing Morning Spine & Hip Mobility',
      category: 'Stretching',
      durationMins: 10,
      targetSeconds: 600,
      level: 'All Levels',
      benefits: 'Lubricates synovial joint fluid, releases morning stiffness, and prepares the spine for daily seated work.',
      instructions: 'Smooth sequence: Cat-Cow waves, Deep lunge with twist, Downward facing dog pedal, and gentle side bends.',
    },
    {
      title: 'Brisk Cardiovascular Interval Walk',
      category: 'Walking',
      durationMins: 20,
      targetSeconds: 1200,
      level: 'Beginner / Moderate',
      benefits: 'Improves insulin sensitivity, regulates blood pressure, and boosts mood through sustained aerobic circulation.',
      instructions: '3 min warm-up stroll -> 5 min brisk stride -> 2 min easy pace -> 7 min brisk stride -> 3 min cooldown.',
    },
    {
      title: 'Evening Full-Body Relaxation & Decompression',
      category: 'Stretching',
      durationMins: 12,
      targetSeconds: 720,
      level: 'Gentle',
      benefits: 'Cools down central nervous system arousal, unloads vertebral discs, and supports deeper Stage 3 slow-wave sleep.',
      instructions: 'Hold gently for 45 seconds each: Child pose, Seated forward bend, Reclining figure-four, and Legs-up-the-wall.',
    },
  ];

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold mb-1.5">
            <Dumbbell className="w-3.5 h-3.5 text-amber-600" />
            <span>Biomechanics & Movement Coaching</span>
          </div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-slate-900 tracking-tight">
            Physical Wellness Coach
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Personalized functional movement, balanced hydration targets, and joint-friendly workouts
          </p>
        </div>

        <button
          onClick={() => setActiveTab('exercise_tracker')}
          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <Play className="w-4 h-4 fill-current" />
          <span>Open Workout Tracker</span>
        </button>
      </div>

      {/* Medical Safety Disclaimer */}
      <div className="p-4 bg-amber-50/80 border border-amber-200/80 rounded-2xl flex items-start gap-3 text-xs text-amber-900">
        <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold block mb-0.5">Physical Safety & Pain Boundary</span>
          Exercise should feel stimulating, not excruciating. Never attempt to push through sharp, acute, or stabbing pain. If you experience dizziness, joint swelling, or unusual shortness of breath, cease activity immediately and seek medical evaluation from a physician or physical therapist.
        </div>
      </div>

      {/* HYDRATION CALCULATOR CARD */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        <div className="md:col-span-8 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-wider">
            <Droplet className="w-4 h-4" />
            <span>Personalized Daily Hydration Blueprint</span>
          </div>
          <h3 className="font-heading font-extrabold text-xl text-slate-900">
            Target: ~{recommendedWaterMl} ml / day ({recommendedGlasses} glasses)
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Calculated for your recorded bodyweight of <strong>{weight} kg</strong> based on standard clinical physiology (35ml water per kg bodyweight). Add 350–500ml for every 30 minutes of vigorous perspiration.
          </p>
        </div>

        <div className="md:col-span-4 bg-blue-50/70 p-4 rounded-2xl border border-blue-100 text-center">
          <span className="text-[11px] font-bold text-blue-800 uppercase block mb-1">Optimal Intake Rhythm</span>
          <div className="space-y-1 text-xs text-slate-700">
            <div>🌅 Wake-up: <strong>500 ml</strong></div>
            <div>☀️ Mid-day: <strong>1,000 ml</strong></div>
            <div>🌙 Evening: <strong>500–700 ml</strong></div>
          </div>
        </div>
      </div>

      {/* CURATED WORKOUT ROUTINES */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-heading font-bold text-lg text-slate-900">Recommended Physical Routines</h2>
            <p className="text-xs text-slate-500">Low joint-strain, functional sessions tailored to your goals</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {physicalRoutines.map((routine, idx) => (
            <div
              key={idx}
              className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs hover:border-amber-300 transition-all flex flex-col justify-between gap-4"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full">
                    {routine.category}
                  </span>
                  <span className="flex items-center gap-1 text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                    <Clock className="w-3 h-3 text-slate-500" />
                    <span>{routine.durationMins} mins</span>
                  </span>
                </div>

                <h3 className="font-heading font-extrabold text-base text-slate-900">
                  {routine.title}
                </h3>

                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  <strong className="text-slate-800 font-semibold">Purpose: </strong>
                  {routine.benefits}
                </p>

                <div className="mt-3 bg-slate-50 p-3 rounded-2xl border border-slate-100 text-xs text-slate-700">
                  <span className="font-bold text-slate-800 block text-[11px] uppercase tracking-wider mb-1">
                    Prescribed Sequence:
                  </span>
                  {routine.instructions}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-500">Difficulty: {routine.level}</span>
                <button
                  type="button"
                  onClick={() => startExercise(routine.title, routine.category as any, routine.targetSeconds, routine.instructions)}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>Start in Tracker</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* BALANCED NUTRITION & RECOVERY PILLARS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 uppercase tracking-wider">
            <Utensils className="w-4 h-4" />
            <span>Balanced Nutrition Education</span>
          </div>
          <h3 className="font-heading font-extrabold text-lg text-slate-900">
            Nourishing Whole-Food Guidelines
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            CareNova emphasizes sustainable, non-restrictive nutrition rather than extreme diets or severe calorie deficits:
          </p>
          <ul className="space-y-1.5 text-xs text-slate-700">
            <li>• <strong>Plate Harmony:</strong> Half plate vibrant vegetables, quarter lean protein, quarter complex unrefined carbohydrates.</li>
            <li>• <strong>Fiber Anchor:</strong> Aim for 25–35 grams of daily dietary fiber to support healthy microbiome and blood sugar stability.</li>
            <li>• <strong>Mindful Eating:</strong> Chew slowly, minimize distracted screen dining, and honor physiological hunger and satiety cues.</li>
          </ul>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 uppercase tracking-wider">
            <Moon className="w-4 h-4" />
            <span>Recovery & Tissue Repair</span>
          </div>
          <h3 className="font-heading font-extrabold text-lg text-slate-900">
            Circadian Rest Architecture
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Physical progress occurs during rest, not workout strain:
          </p>
          <ul className="space-y-1.5 text-xs text-slate-700">
            <li>• <strong>Consistent Sleep Timing:</strong> Go to bed and wake up within the same 30-minute window daily to anchor circadian hormones.</li>
            <li>• <strong>Post-Workout Refueling:</strong> Consume a light protein and complex carbohydrate snack within 45–60 minutes following resistance workouts.</li>
            <li>• <strong>Active Recovery Days:</strong> Gentle 20-minute walks or light stretching promote lymphatic circulation without fatiguing the central nervous system.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
