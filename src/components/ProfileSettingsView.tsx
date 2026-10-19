import React, { useState } from 'react';
import {
  UserCheck,
  Scale,
  Volume2,
  VolumeX,
  RotateCcw,
  Shield,
  Download,
  Trash2,
  Database,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Info,
  Sliders,
} from 'lucide-react';
import { useWellness } from '../context/WellnessContext';
import { calculateBMI } from '../utils/bmi';
import { playWellnessChime } from '../utils/sound';

export const ProfileSettingsView: React.FC = () => {
  const {
    currentUser,
    updateProfile,
    reassess,
    soundSettings,
    updateSoundSettings,
    activities,
    moodLogs,
    reminders,
    logout,
  } = useWellness();

  // Profile edit states
  const [name, setName] = useState(currentUser?.name || '');
  const [age, setAge] = useState(currentUser?.age || 28);
  const [heightCm, setHeightCm] = useState(currentUser?.heightCm || 172);
  const [weightKg, setWeightKg] = useState(currentUser?.weightKg || 68);
  const [saveToast, setSaveToast] = useState(false);

  // Live BMI calculation
  const bmiResult = calculateBMI(weightKg, heightCm, age);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name: name.trim(),
      age,
      heightCm,
      weightKg,
      bmi: bmiResult.bmi,
    });
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 3000);
  };

  const handleTestSoundPreview = async () => {
    await playWellnessChime(soundSettings.volume);
  };

  const handleExportData = () => {
    const exportBundle = {
      profile: currentUser,
      activities,
      moodLogs,
      reminders,
      soundSettings,
      exportedAt: new Date().toISOString(),
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportBundle, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `carenova_wellness_backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleClearAllData = () => {
    if (window.confirm('Are you sure you want to erase all your recorded wellness activities, moods, and profile? This action is permanent.')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-100 text-violet-800 text-xs font-bold mb-1.5">
            <UserCheck className="w-3.5 h-3.5 text-violet-600" />
            <span>Account, Biometrics & Audio Settings</span>
          </div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-slate-900 tracking-tight">
            Profile & Settings
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure your biometric parameters, session audio chime, privacy, and account preferences
          </p>
        </div>

        <button
          onClick={reassess}
          className="px-4 py-2 bg-violet-50 hover:bg-violet-100 text-violet-800 rounded-xl text-xs font-bold border border-violet-200 transition-all flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Retake Wellness Assessment</span>
        </button>
      </div>

      {/* SECTION 1: BIOMETRIC PROFILE & BMI */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="font-heading font-bold text-base text-slate-900">Biometric Profile & Screening</h2>
            <p className="text-xs text-slate-500">Update your measurements to keep your BMI and recommendations accurate</p>
          </div>
          {saveToast && (
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 animate-fade-in">
              Profile updated!
            </span>
          )}
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="pname">Preferred Name</label>
              <input
                id="pname"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 focus:border-violet-500 outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="page">Age (Years)</label>
              <input
                id="page"
                type="number"
                min={5}
                max={115}
                required
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 focus:border-violet-500 outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="pheight">Height (cm)</label>
              <input
                id="pheight"
                type="number"
                min={50}
                max={250}
                required
                value={heightCm}
                onChange={(e) => setHeightCm(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 focus:border-violet-500 outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="pweight">Weight (kg)</label>
              <input
                id="pweight"
                type="number"
                min={20}
                max={300}
                step={0.5}
                required
                value={weightKg}
                onChange={(e) => setWeightKg(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 focus:border-violet-500 outline-hidden"
              />
            </div>
          </div>

          {/* Live Calculated BMI Display Card */}
          <div className="p-4 rounded-2xl bg-linear-to-r from-violet-50/80 via-purple-50/50 to-indigo-50/60 border border-violet-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-violet-600 text-white flex items-center justify-center shrink-0">
                <Scale className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Screening BMI</span>
                  <span className="text-lg font-extrabold text-violet-900">{bmiResult.bmi}</span>
                  <span className="px-2 py-0.5 rounded-md bg-violet-200/80 text-violet-900 text-xs font-bold">
                    {bmiResult.category}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-0.5">{bmiResult.description}</p>
              </div>
            </div>

            <div className="text-left sm:text-right shrink-0">
              <span className="text-[11px] text-slate-500 block">Healthy Ref. Weight Range</span>
              <span className="text-xs font-bold text-slate-800">
                {bmiResult.healthyWeightRangeKg.min} kg – {bmiResult.healthyWeightRangeKg.max} kg
              </span>
            </div>
          </div>

          <div className="flex items-start gap-2 p-3 bg-slate-50 rounded-xl text-[11px] text-slate-500 border border-slate-200/60">
            <Info className="w-4 h-4 text-violet-600 shrink-0 mt-0.5" />
            <span>
              {bmiResult.disclaimer}
            </span>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
            >
              Save Profile Changes
            </button>
          </div>
        </form>
      </div>

      {/* SECTION 2: SESSION COMPLETION SOUND SETTINGS (MANDATORY REQUIREMENT) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-violet-100 text-violet-700 flex items-center justify-center">
                <Volume2 className="w-4 h-4" />
              </div>
              <h2 className="font-heading font-bold text-base text-slate-900">Session Completion Sound Reminders</h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Calming acoustic notification played whenever a workout or breathing exercise reaches completion
            </p>
          </div>

          <button
            type="button"
            onClick={handleTestSoundPreview}
            className="px-3.5 py-1.5 rounded-xl bg-violet-50 hover:bg-violet-100 text-violet-800 text-xs font-bold border border-violet-200 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Volume2 className="w-3.5 h-3.5 text-violet-600" />
            <span>Preview Sound</span>
          </button>
        </div>

        {/* Toggle On/Off */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
          <div>
            <span className="text-xs font-bold text-slate-900 block">Play Completion Chime</span>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Synthesizes a 528 Hz harmonic chime on your device when a session finishes. Never plays on cancel or pause.
            </p>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={soundSettings.enabled}
              onChange={(e) => updateSoundSettings({ enabled: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-600"></div>
          </label>
        </div>

        {/* Volume Slider */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-700 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-violet-600" />
              <span>Chime Volume</span>
            </span>
            <span className="font-extrabold text-violet-700">
              {Math.round(soundSettings.volume * 100)}%
            </span>
          </div>

          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            disabled={!soundSettings.enabled}
            value={soundSettings.volume}
            onChange={(e) => updateSoundSettings({ volume: Number(e.target.value) })}
            className="w-full accent-violet-600 cursor-pointer disabled:opacity-40"
          />

          <div className="flex justify-between text-[10px] text-slate-400">
            <span>Mute (0%)</span>
            <span>Gentle (50%)</span>
            <span>Full (100%)</span>
          </div>
        </div>
      </div>

      {/* SECTION 3: DATA PRIVACY, EXPORT & FIREBASE STATUS */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-5">
        <div className="pb-3 border-b border-slate-100">
          <h2 className="font-heading font-bold text-base text-slate-900 flex items-center gap-2">
            <Database className="w-4 h-4 text-violet-600" />
            <span>Data Storage & Privacy Controls</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Your wellness information is securely kept in private browser storage with optional cloud backup
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 flex items-start gap-3 text-xs text-emerald-950">
          <Shield className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block mb-0.5">Consent & Confidentiality Confirmed</span>
            Your consent was obtained prior to storing activity records. All metrics, durations, and reflections are strictly user-scoped and not broadcast to third parties.
          </div>
        </div>

        {/* Backend & Firebase status guide */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700 space-y-2">
          <span className="font-bold text-slate-900 block">External Persistence / Firebase Setup Guide</span>
          <p className="text-slate-600 leading-relaxed">
            CareNova is configured with client-side persistent storage and server proxy endpoints. To connect Firebase Authentication and Cloud Firestore for multi-device sync, you can provision Firebase in AI Studio with the <code>set_up_firebase</code> tool when ready.
          </p>
        </div>

        {/* Export & Reset Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <button
            type="button"
            onClick={handleExportData}
            className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4 text-violet-600" />
            <span>Export My Wellness Data (JSON)</span>
          </button>

          <button
            type="button"
            onClick={handleClearAllData}
            className="px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold border border-rose-200 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Trash2 className="w-4 h-4 text-rose-600" />
            <span>Reset All Applet Data</span>
          </button>
        </div>
      </div>
    </div>
  );
};
