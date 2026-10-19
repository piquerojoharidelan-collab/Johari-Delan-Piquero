import React, { useState } from 'react';
import {
  HeartHandshake,
  Smile,
  BookOpen,
  Sparkles,
  Wind,
  ArrowRight,
  CheckCircle2,
  Eye,
  Hand,
  Ear,
  Flower2,
  Cookie,
} from 'lucide-react';
import { useWellness } from '../context/WellnessContext';
import { MoodType } from '../types/wellness';

export const MentalWellnessView: React.FC = () => {
  const { moodLogs, addMoodLog, journalEntries, addJournalEntry, startBreathwork, setActiveTab } = useWellness();

  // Mood state
  const [selectedMood, setSelectedMood] = useState<MoodType>('Good');
  const [moodNote, setMoodNote] = useState('');
  const [moodSuccess, setMoodSuccess] = useState(false);

  // Journaling state
  const journalPrompts = [
    'What is one small thing that brought you genuine ease or peace today?',
    'What thoughts or physical tensions are you holding onto that you can gently release?',
    'If you spoke to yourself with the same compassion you offer a close friend, what would you say right now?',
    'What is one small, achievable boundary that could protect your energy tomorrow?',
  ];
  const [activePromptIdx, setActivePromptIdx] = useState(0);
  const [journalContent, setJournalContent] = useState('');
  const [journalSavedToast, setJournalSavedToast] = useState(false);

  // 5-4-3-2-1 Grounding tool state
  const [groundingStep, setGroundingStep] = useState<number>(0);
  const groundingSteps = [
    { count: 5, icon: Eye, label: 'Look around and name 5 distinct things you can SEE', hint: 'Notice shadows, a plant, a coffee cup, light reflection, wood grain.' },
    { count: 4, icon: Hand, label: 'Notice 4 things you can physically TOUCH or FEEL', hint: 'The floor under your shoes, fabric against your skin, texture of a table.' },
    { count: 3, icon: Ear, label: 'Identify 3 separate sounds you can HEAR right now', hint: 'A clock tick, traffic, wind outside, your own steady breath.' },
    { count: 2, icon: Flower2, label: 'Acknowledge 2 scents you can SMELL in your space', hint: 'Fresh air, coffee, skin lotion, fabric conditioner.' },
    { count: 1, icon: Cookie, label: 'Name 1 positive affirmation or sensation you TASTE', hint: 'Say internally: "I am safe in this present moment. I am here."' },
  ];

  const handleSaveMood = (e: React.FormEvent) => {
    e.preventDefault();
    addMoodLog(selectedMood, moodNote.trim() || undefined);
    setMoodNote('');
    setMoodSuccess(true);
    setTimeout(() => setMoodSuccess(false), 3000);
  };

  const handleSaveJournal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!journalContent.trim()) return;
    addJournalEntry(journalPrompts[activePromptIdx], journalContent.trim());
    setJournalContent('');
    setJournalSavedToast(true);
    setTimeout(() => setJournalSavedToast(false), 3000);
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

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 text-purple-800 text-xs font-bold mb-1.5">
            <HeartHandshake className="w-3.5 h-3.5 text-purple-600" />
            <span>Emotional Equilibrium & Grounding</span>
          </div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-slate-900 tracking-tight">
            Mental Wellness Sanctuary
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Mindful self-regulation tools, sensory grounding, and journaling reflections
          </p>
        </div>

        <button
          onClick={() => startBreathwork('Box breathing', 3)}
          className="px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <Wind className="w-4 h-4" />
          <span>Launch 3-Min Reset Breath</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive 5-4-3-2-1 Grounding Tool */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center text-xs font-bold">5</span>
                <h3 className="font-heading font-bold text-base text-slate-900">5-4-3-2-1 Sensory Grounding</h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">Quickly interrupt racing anxiety by anchoring awareness to external senses</p>
            </div>
            <button
              onClick={() => setGroundingStep(0)}
              className="text-xs font-bold text-violet-700 hover:text-violet-900"
            >
              Restart
            </button>
          </div>

          {/* Active step display */}
          <div className="p-5 rounded-2xl bg-linear-to-br from-teal-50/80 via-slate-50 to-violet-50/50 border border-teal-100/80 text-center space-y-3">
            {React.createElement(groundingSteps[groundingStep].icon, {
              className: 'w-10 h-10 text-teal-600 mx-auto animate-bounce-short',
            })}

            <div className="font-heading font-extrabold text-2xl text-slate-900">
              Step {groundingStep + 1} of 5
            </div>

            <p className="text-sm font-bold text-teal-950 max-w-sm mx-auto">
              {groundingSteps[groundingStep].label}
            </p>

            <p className="text-xs text-slate-600 italic max-w-sm mx-auto">
              {groundingSteps[groundingStep].hint}
            </p>

            <div className="pt-2">
              {groundingStep < groundingSteps.length - 1 ? (
                <button
                  onClick={() => setGroundingStep((s) => s + 1)}
                  className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer inline-flex items-center gap-2"
                >
                  <span>I've Identified These • Next Step</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1.5 rounded-full">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Grounding Sequence Completed!</span>
                  </div>
                  <p className="text-xs text-slate-600">
                    Take one slow, deep belly breath. Notice the quiet space you created in your mind.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Guided Journaling Tool */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-bold text-base text-slate-900 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-violet-600" />
              <span>Guided Reflection Journal</span>
            </h3>
            <button
              onClick={() => setActivePromptIdx((p) => (p + 1) % journalPrompts.length)}
              className="text-xs font-bold text-violet-700 hover:text-violet-900 cursor-pointer"
            >
              Shuffle Prompt
            </button>
          </div>

          <form onSubmit={handleSaveJournal} className="space-y-3">
            <div className="p-3.5 bg-violet-50/70 rounded-2xl border border-violet-100 text-xs font-medium text-violet-950 leading-relaxed">
              "{journalPrompts[activePromptIdx]}"
            </div>

            <textarea
              rows={4}
              value={journalContent}
              onChange={(e) => setJournalContent(e.target.value)}
              placeholder="Reflect freely without judging your words. Your thoughts remain entirely on your device..."
              className="w-full p-3.5 rounded-2xl border border-slate-200 text-xs text-slate-900 focus:border-violet-500 focus:ring-1 focus:ring-violet-200 outline-hidden resize-none"
            />

            <div className="flex items-center justify-between">
              {journalSavedToast && (
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
                  Entry saved to private journal!
                </span>
              )}

              <button
                type="submit"
                disabled={!journalContent.trim()}
                className="ml-auto px-4 py-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
              >
                Save Journal Entry
              </button>
            </div>
          </form>

          {/* Past Journal Entries accordion preview */}
          {journalEntries.length > 0 && (
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Saved Reflection Notes ({journalEntries.length}):
              </span>
              <div className="max-h-36 overflow-y-auto space-y-2 pr-1">
                {journalEntries.slice(0, 3).map((entry) => (
                  <div key={entry.id} className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                    <span className="text-[10px] text-slate-400 block mb-0.5">
                      {new Date(entry.date).toLocaleDateString()}
                    </span>
                    <p className="font-semibold text-slate-800 line-clamp-1 italic">"{entry.prompt}"</p>
                    <p className="text-slate-600 mt-1 line-clamp-2">{entry.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
