import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  Search,
  Filter,
  Flame,
  Wind,
  Heart,
  Play,
  Clock,
  ShieldAlert,
  Sparkles,
  ExternalLink,
  Video,
} from 'lucide-react';
import { useWellness } from '../context/WellnessContext';
import { ExerciseCategory, BreathworkTechnique } from '../types/wellness';

interface LibraryItem {
  id: string;
  title: string;
  type: 'physical' | 'mental';
  category: string;
  durationLabel: string;
  durationMinutes: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Gentle' | 'All Levels';
  description: string;
  instructions: string[];
  safetyTips: string;
  videoUrl?: string;
  videoTitle?: string;
  actionType: 'exercise' | 'breathwork';
  actionPayload: any;
}

const LIBRARY_DATA: LibraryItem[] = [
  {
    id: 'lib-1',
    title: 'Beginner Full-Body Mobility & Posture Reset',
    type: 'physical',
    category: 'Stretching',
    durationLabel: '10 mins',
    durationMinutes: 10,
    difficulty: 'Beginner',
    description: 'Gentle, low-impact spinal mobilization designed for desk workers and anyone looking to relieve upper-back and neck stiffness.',
    instructions: [
      'Cat-Cow spinal waves (10 smooth breaths)',
      'Thread-the-needle thoracic rotation (5 each side)',
      'Gentle kneeling hip flexor stretch (30s hold each leg)',
      'Standing doorframe chest opening (30s hold)',
      'Deep diaphragmatic rest breathing (1 min)',
    ],
    safetyTips: 'Move within a pain-free range. Avoid bouncing or aggressive overextension of the lumbar spine.',
    videoUrl: 'https://www.youtube-nocookie.com/embed/g_tea8ZNk5A',
    videoTitle: 'Desk Mobility & Posture Routine',
    actionType: 'exercise',
    actionPayload: { name: 'Full-Body Mobility & Posture Reset', category: 'Stretching', targetSeconds: 600 },
  },
  {
    id: 'lib-2',
    title: 'Brisk Interval Walking & Aerobic Conditioning',
    type: 'physical',
    category: 'Walking',
    durationLabel: '20 mins',
    durationMinutes: 20,
    difficulty: 'All Levels',
    description: 'A scientifically validated steady-state cardio session that boosts cardiovascular mitochondrial density and endorphin release.',
    instructions: [
      'Warm-up: 3 minutes of relaxed easy-stride walking',
      'Interval 1: 5 minutes brisk purposeful walking (pumping arms naturally)',
      'Active recovery: 2 minutes conversational walking pace',
      'Interval 2: 7 minutes brisk walking at moderate effort',
      'Cooldown: 3 minutes slow stroll with deep nasal exhalations',
    ],
    safetyTips: 'Wear supportive athletic shoes. Keep your chest tall and shoulders relaxed away from your ears.',
    videoUrl: 'https://www.youtube-nocookie.com/embed/enYITYwvPAQ',
    videoTitle: 'Aerobic Walking Technique Guide',
    actionType: 'exercise',
    actionPayload: { name: 'Brisk Interval Walk', category: 'Walking', targetSeconds: 1200 },
  },
  {
    id: 'lib-3',
    title: 'Foundational Bodyweight Strength (No Equipment)',
    type: 'physical',
    category: 'Strength training',
    durationLabel: '15 mins',
    durationMinutes: 15,
    difficulty: 'Beginner',
    description: 'Compound functional movement patterns to build joint stability, glute activation, and upper body endurance.',
    instructions: [
      'Bodyweight box squats (3 sets of 10 reps)',
      'Incline or knee push-ups (3 sets of 8 reps)',
      'Isometric glute bridges (3 sets of 30-second holds)',
      'Standing wall angels for scapular retraction (3 sets of 10)',
    ],
    safetyTips: 'Keep knees tracking over toes on squats. Engage core muscles throughout to protect the lower back.',
    videoUrl: 'https://www.youtube-nocookie.com/embed/UIPvIjV6lms',
    videoTitle: 'Foundational Bodyweight Exercises',
    actionType: 'exercise',
    actionPayload: { name: 'Foundational Bodyweight Strength', category: 'Strength training', targetSeconds: 900 },
  },
  {
    id: 'lib-4',
    title: 'Box Breathing (4-4-4-4) Autonomous Reset',
    type: 'mental',
    category: 'Breathwork',
    durationLabel: '5 mins',
    durationMinutes: 5,
    difficulty: 'All Levels',
    description: 'Equal-cadence box breathing to regulate sympathetic nervous system arousal and sharpen executive attention.',
    instructions: [
      'Inhale slowly and silently through the nose for 4 seconds',
      'Hold the air in lungs with relaxed throat for 4 seconds',
      'Exhale smoothly through parted lips for 4 seconds',
      'Pause empty before the next breath for 4 seconds',
    ],
    safetyTips: 'Stop immediately if you feel lightheaded. Breathe naturally without force.',
    videoUrl: 'https://www.youtube-nocookie.com/embed/tEmt1Znux58',
    videoTitle: 'Box Breathing Visual Rhythm Guide',
    actionType: 'breathwork',
    actionPayload: { technique: 'Box breathing', targetMinutes: 5 },
  },
  {
    id: 'lib-5',
    title: '4-7-8 Deep Parasympathetic Sleep Breathing',
    type: 'mental',
    category: 'Breathwork',
    durationLabel: '5 mins',
    durationMinutes: 5,
    difficulty: 'Gentle',
    description: 'The natural tranquilizer for insomnia, anxiety, and nighttime racing thoughts developed by integrative medicine physicians.',
    instructions: [
      'Close your mouth and inhale quietly through your nose to a count of 4',
      'Hold your breath for a count of 7 without strain',
      'Exhale audibly through your mouth with a soft whoosh for a count of 8',
      'Repeat for 4 to 8 full breath cycles',
    ],
    safetyTips: 'Best performed lying down or seated with head supported. Do not practice while driving or standing in water.',
    videoUrl: 'https://www.youtube-nocookie.com/embed/1Dv-ldGLnIY',
    videoTitle: '4-7-8 Breathing Guide for Restful Sleep',
    actionType: 'breathwork',
    actionPayload: { technique: 'Gentle relaxation breathing', targetMinutes: 5 },
  },
  {
    id: 'lib-6',
    title: '5-4-3-2-1 Sensory Grounding Technique',
    type: 'mental',
    category: 'Mindfulness',
    durationLabel: '5 mins',
    durationMinutes: 5,
    difficulty: 'Beginner',
    description: 'Cognitive grounding exercise to interrupt panic spirals and acute everyday anxiety by anchoring awareness to external senses.',
    instructions: [
      '5 things you can SEE: observe colors, textures, and shadows around you',
      '4 things you can physically FEEL: feet on floor, fabric on skin, chair support',
      '3 things you can HEAR: distant traffic, birds, hum of an appliance',
      '2 things you can SMELL: fresh air, coffee, pencil, or clothing',
      '1 thing you can TASTE or 1 positive affirmation you can tell yourself',
    ],
    safetyTips: 'Go slowly. Take a smooth breath between each sensory observation.',
    actionType: 'breathwork',
    actionPayload: { technique: 'Mindful breathing', targetMinutes: 3 },
  },
  {
    id: 'lib-7',
    title: 'Evening Digital Sunset & Wind-Down Protocol',
    type: 'mental',
    category: 'Sleep Hygiene',
    durationLabel: '15 mins',
    durationMinutes: 15,
    difficulty: 'All Levels',
    description: 'Circadian-aligned bedtime preparation routine to stimulate natural melatonin production and quiet cortical hyperactivity.',
    instructions: [
      'Turn off high-intensity blue light screens and dim room ambient lighting',
      'Drink a warm cup of herbal chamomile or magnesium-infused water',
      'Perform 3 minutes of gentle supine spinal twists in bed',
      'Write down tomorrow top 3 priorities to offload mental worry onto paper',
    ],
    safetyTips: 'Keep bedroom temperature cool (around 18-20°C / 65-68°F) for optimal sleep stage transitions.',
    actionType: 'exercise',
    actionPayload: { name: 'Bedtime Gentle Wind-Down', category: 'Stretching', targetSeconds: 900 },
  },
];

export const ActivityLibraryView: React.FC = () => {
  const { startExercise, startBreathwork } = useWellness();

  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'physical' | 'mental'>('all');
  const [durationFilter, setDurationFilter] = useState<'all' | 'under10' | '10to20' | '20plus'>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<'all' | 'Beginner' | 'Intermediate' | 'Gentle' | 'All Levels'>('all');

  const [activeVideoModal, setActiveVideoModal] = useState<{ url: string; title: string } | null>(null);

  const filteredItems = useMemo(() => {
    return LIBRARY_DATA.filter((item) => {
      // Type
      if (typeFilter !== 'all' && item.type !== typeFilter) return false;

      // Difficulty
      if (difficultyFilter !== 'all' && item.difficulty !== difficultyFilter) return false;

      // Duration
      if (durationFilter === 'under10' && item.durationMinutes >= 10) return false;
      if (durationFilter === '10to20' && (item.durationMinutes < 10 || item.durationMinutes > 20)) return false;
      if (durationFilter === '20plus' && item.durationMinutes < 20) return false;

      // Search term
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matches =
          item.title.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q);
        if (!matches) return false;
      }

      return true;
    });
  }, [searchTerm, typeFilter, durationFilter, difficultyFilter]);

  const handleStartActivity = (item: LibraryItem) => {
    if (item.actionType === 'exercise') {
      startExercise(
        item.actionPayload.name,
        item.actionPayload.category,
        item.actionPayload.targetSeconds
      );
    } else {
      startBreathwork(
        item.actionPayload.technique,
        item.actionPayload.targetMinutes
      );
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-100 text-violet-800 text-xs font-bold mb-1.5">
            <BookOpen className="w-3.5 h-3.5 text-violet-600" />
            <span>Curated Evidence-Based Library</span>
          </div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-slate-900 tracking-tight">
            Wellness Activity Library
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Search scientifically grounded workouts, guided breathwork, and mental resilience practices
          </p>
        </div>

        <span className="text-xs font-bold bg-violet-50 text-violet-700 px-3 py-1.5 rounded-xl border border-violet-100 self-start sm:self-auto">
          {filteredItems.length} curated activities
        </span>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3">
        {/* Search input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search activities by name, category, or symptom (e.g. 'stretching', 'sleep', 'stress')..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:border-violet-500 focus:ring-1 focus:ring-violet-200 outline-hidden bg-slate-50/50"
          />
        </div>

        {/* Filter chips */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          {/* Type filter */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setTypeFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                typeFilter === 'all' ? 'bg-violet-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Types
            </button>
            <button
              onClick={() => setTypeFilter('physical')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                typeFilter === 'physical' ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              <span>Physical</span>
            </button>
            <button
              onClick={() => setTypeFilter('mental')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                typeFilter === 'mental' ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Wind className="w-3.5 h-3.5" />
              <span>Mental</span>
            </button>
          </div>

          {/* Duration filter */}
          <div className="flex items-center gap-2">
            <select
              value={durationFilter}
              onChange={(e) => setDurationFilter(e.target.value as any)}
              aria-label="Filter by duration"
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-medium text-slate-700 outline-hidden"
            >
              <option value="all">Any Duration</option>
              <option value="under10">&lt; 10 mins</option>
              <option value="10to20">10–20 mins</option>
              <option value="20plus">20+ mins</option>
            </select>

            <select
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value as any)}
              aria-label="Filter by difficulty"
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-medium text-slate-700 outline-hidden"
            >
              <option value="all">All Difficulties</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Gentle">Gentle</option>
              <option value="All Levels">All Levels</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid of Library Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs hover:border-violet-300 transition-all flex flex-col justify-between gap-4"
          >
            <div>
              {/* Badges */}
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                    item.type === 'physical' ? 'bg-amber-100 text-amber-800' : 'bg-purple-100 text-purple-800'
                  }`}>
                    {item.category}
                  </span>
                  <span className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                    {item.difficulty}
                  </span>
                </div>

                <span className="flex items-center gap-1 text-xs font-extrabold text-violet-700 bg-violet-50 px-2 py-0.5 rounded-md">
                  <Clock className="w-3 h-3" />
                  <span>{item.durationLabel}</span>
                </span>
              </div>

              {/* Title & Description */}
              <h3 className="font-heading font-extrabold text-base sm:text-lg text-slate-900 leading-snug">
                {item.title}
              </h3>

              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                {item.description}
              </p>

              {/* Instructions preview */}
              <div className="mt-3 bg-slate-50 p-3 rounded-2xl border border-slate-100 text-xs text-slate-700 space-y-1">
                <span className="font-bold text-slate-800 block text-[11px] uppercase tracking-wider mb-1">
                  Step-by-Step Instructions:
                </span>
                {item.instructions.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-1.5">
                    <span className="text-violet-600 font-bold shrink-0">{idx + 1}.</span>
                    <span>{step}</span>
                  </div>
                ))}
              </div>

              {/* Safety notice */}
              <div className="mt-2.5 text-[11px] text-amber-800 bg-amber-50/60 p-2 rounded-xl flex items-start gap-1.5 border border-amber-100">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                <span><strong>Safety:</strong> {item.safetyTips}</span>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
              {item.videoUrl ? (
                <button
                  type="button"
                  onClick={() => setActiveVideoModal({ url: item.videoUrl!, title: item.videoTitle || item.title })}
                  className="text-xs font-semibold text-violet-700 hover:text-violet-900 flex items-center gap-1.5 cursor-pointer"
                >
                  <Video className="w-4 h-4 text-violet-600" />
                  <span>Watch Demo Video</span>
                </button>
              ) : (
                <span className="text-[11px] text-slate-400">Step-by-step verified</span>
              )}

              <button
                type="button"
                onClick={() => handleStartActivity(item)}
                className="px-4 py-2 bg-linear-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs shadow-violet-200 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Start in Tracker</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="bg-white rounded-3xl p-10 text-center border border-dashed border-slate-200">
          <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="font-heading font-bold text-base text-slate-700">No activities match your search</h3>
          <p className="text-xs text-slate-500 mt-1">Try clearing filters or search terms.</p>
          <button
            onClick={() => {
              setSearchTerm('');
              setTypeFilter('all');
              setDurationFilter('all');
              setDifficultyFilter('all');
            }}
            className="mt-3 px-3 py-1.5 bg-violet-100 text-violet-800 rounded-xl text-xs font-bold"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Video Demo Modal */}
      {activeVideoModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-4 sm:p-6 shadow-2xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h4 className="font-heading font-bold text-sm text-slate-900 truncate">
                {activeVideoModal.title}
              </h4>
              <button
                onClick={() => setActiveVideoModal(null)}
                className="text-xs font-bold text-slate-500 hover:text-slate-800 p-1"
              >
                Close
              </button>
            </div>

            <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black">
              <iframe
                src={activeVideoModal.url}
                title={activeVideoModal.title}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            <p className="text-[11px] text-slate-500 text-center">
              Verified clinical demonstration. Remember to practice at your own comfort level.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
