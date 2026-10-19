import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Heart,
  Activity,
  Smile,
  Shield,
  Scale,
  Moon,
  Droplet,
  Info,
} from 'lucide-react';
import { useWellness } from '../context/WellnessContext';
import { GoalType, ActivityLevel, MoodType, AssessmentData } from '../types/wellness';
import { calculateBMI } from '../utils/bmi';

export const OnboardingAssessment: React.FC = () => {
  const { currentUser, saveAssessment } = useWellness();

  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Physical Fields
  const [age, setAge] = useState<number>(currentUser?.age || 28);
  const [heightCm, setHeightCm] = useState<number>(currentUser?.heightCm || 172);
  const [weightKg, setWeightKg] = useState<number>(currentUser?.weightKg || 68);
  const [primaryGoal, setPrimaryGoal] = useState<GoalType>(currentUser?.primaryGoal || 'Improve physical fitness');
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>(currentUser?.activityLevel || 'Moderately active');
  const [exerciseFrequency, setExerciseFrequency] = useState<'0-1 days/wk' | '2-3 days/wk' | '4-5 days/wk' | '6-7 days/wk'>('2-3 days/wk');
  const [averageWorkoutDuration, setAverageWorkoutDuration] = useState<'10-20 mins' | '20-40 mins' | '40-60 mins' | '60+ mins'>('20-40 mins');
  const [preferredExercises, setPreferredExercises] = useState<string[]>(['Walking', 'Stretching']);
  const [sleepHours, setSleepHours] = useState<number>(7.5);
  const [sleepQuality, setSleepQuality] = useState<'Poor' | 'Fair' | 'Good' | 'Excellent'>('Good');
  const [dailyEnergy, setDailyEnergy] = useState<'Low' | 'Moderate' | 'High' | 'Fluctuates'>('Moderate');
  const [hydrationGlasses, setHydrationGlasses] = useState<number>(6);
  const [physicalLimitations, setPhysicalLimitations] = useState<string>('');

  // Mental Fields
  const [currentMood, setCurrentMood] = useState<MoodType>('Good');
  const [stressLevel, setStressLevel] = useState<'Low' | 'Moderate' | 'High' | 'Severe'>('Moderate');
  const [sleepDifficulty, setSleepDifficulty] = useState<'None' | 'Occasional' | 'Frequent' | 'Chronic'>('Occasional');
  const [abilityToRelax, setAbilityToRelax] = useState<'Easy' | 'Moderate' | 'Difficult' | 'Very Difficult'>('Moderate');
  const [emotionalWellbeingRating, setEmotionalWellbeingRating] = useState<number>(7);
  const [stressSources, setStressSources] = useState<string[]>(['Work/Studies']);
  const [preferredCoping, setPreferredCoping] = useState<string[]>(['Breathwork', 'Walking outdoors']);
  const [habitConfidence, setHabitConfidence] = useState<'Low' | 'Medium' | 'High'>('Medium');

  // Consent checkbox
  const [consentGiven, setConsentGiven] = useState<boolean>(true);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Live BMI calculation
  const bmiResult = useMemo(() => {
    return calculateBMI(weightKg, heightCm, age);
  }, [weightKg, heightCm, age]);

  const toggleArrayItem = (list: string[], item: string, setter: (val: string[]) => void) => {
    if (list.includes(item)) {
      if (list.length > 1) {
        setter(list.filter((x) => x !== item));
      }
    } else {
      setter([...list, item]);
    }
  };

  const goalsList: GoalType[] = [
    'Improve physical fitness',
    'Build strength and stamina',
    'Maintain healthy habits',
    'Improve sleep',
    'Manage everyday stress',
    'Improve emotional well-being',
    'Develop a balanced lifestyle',
  ];

  const activityLevelOptions: ActivityLevel[] = [
    'Sedentary',
    'Lightly active',
    'Moderately active',
    'Very active',
    'Extremely active',
  ];

  const exerciseOptions = ['Walking', 'Running', 'Stretching', 'Strength training', 'Cardio', 'Yoga', 'Mobility', 'Swimming', 'Cycling'];
  const stressOptions = ['Work/Studies', 'Personal Relationships', 'Time Constraints', 'Health Concerns', 'Information Overload'];
  const copingOptions = ['Breathwork', 'Mindfulness Meditation', 'Walking outdoors', 'Journaling', 'Gentle Stretching', 'Listening to Music'];

  const handleNextStep1 = () => {
    if (age < 5 || age > 115) {
      setValidationError('Please enter a realistic age between 5 and 115.');
      return;
    }
    if (heightCm < 50 || heightCm > 250) {
      setValidationError('Please enter a height between 50 cm and 250 cm.');
      return;
    }
    if (weightKg < 20 || weightKg > 300) {
      setValidationError('Please enter a weight between 20 kg and 300 kg.');
      return;
    }
    setValidationError(null);
    setStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNextStep2 = () => {
    setValidationError(null);
    setStep(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFinalSubmit = () => {
    if (!consentGiven) {
      setValidationError('Please confirm consent to save your wellness preferences to customize your assistant.');
      return;
    }

    const assessmentPayload: AssessmentData = {
      id: `assess_${Date.now()}`,
      userId: currentUser?.id || 'user',
      completedAt: new Date().toISOString(),
      age,
      heightCm,
      weightKg,
      bmi: bmiResult.bmi,
      activityLevel,
      exerciseFrequency,
      averageWorkoutDuration,
      preferredExercises,
      primaryGoal,
      sleepHours,
      sleepQuality,
      dailyEnergy,
      hydrationGlasses,
      physicalLimitations: physicalLimitations.trim(),
      currentMood,
      stressLevel,
      sleepDifficulty,
      abilityToRelax,
      emotionalWellbeingRating,
      stressSources,
      preferredCoping,
      habitConfidence,
      physicalSummary: `Baseline calculated BMI: ${bmiResult.bmi} (${bmiResult.category}). Goal: ${primaryGoal}. Enjoys ${preferredExercises.join(', ')}.`,
      mentalSummary: `Current mood: ${currentMood}. Stress level: ${stressLevel}. Coping methods: ${preferredCoping.join(', ')}.`,
      suggestedGoals: [
        'Complete 15-20 minutes of daily conscious movement',
        'Practice 3-5 minutes of guided breathwork during stress peaks',
        'Maintain a consistent bedtime relaxation window',
      ],
    };

    saveAssessment(assessmentPayload);
  };

  return (
    <div className="min-h-screen bg-slate-50/60 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-100 text-violet-700 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>CareNova Wellness Protocol</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-900 tracking-tight">
            Personal Wellness Assessment
          </h1>
          <p className="text-sm text-slate-600 mt-2 max-w-xl mx-auto">
            Welcome, {currentUser?.name || 'Friend'}! Let us tailor your physical coaching and mental wellness companion to your unique biology, daily routine, and personal goals.
          </p>

          {/* Stepper progress */}
          <div className="flex items-center justify-center gap-3 mt-6">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
              step === 1 ? 'bg-violet-600 text-white shadow-xs' : 'bg-violet-100 text-violet-800'
            }`}>
              <span>1</span>
              <span>Physical Health</span>
            </div>
            <div className="w-8 h-0.5 bg-slate-200" />
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
              step === 2 ? 'bg-violet-600 text-white shadow-xs' : step > 2 ? 'bg-violet-100 text-violet-800' : 'bg-slate-200 text-slate-600'
            }`}>
              <span>2</span>
              <span>Mental Balance</span>
            </div>
            <div className="w-8 h-0.5 bg-slate-200" />
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
              step === 3 ? 'bg-violet-600 text-white shadow-xs' : 'bg-slate-200 text-slate-600'
            }`}>
              <span>3</span>
              <span>Summary & Consent</span>
            </div>
          </div>
        </div>

        {validationError && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs sm:text-sm text-rose-700 flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Please check your inputs</p>
              <p>{validationError}</p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80">
          {/* STEP 1: PHYSICAL WELLNESS */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
                <div className="w-9 h-9 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-heading font-bold text-lg text-slate-900">Physical Wellness & Biology</h2>
                  <p className="text-xs text-slate-500">Measurements, energy levels, and movement habits</p>
                </div>
              </div>

              {/* Age, Height, Weight row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5" htmlFor="age">
                    Age (Years)
                  </label>
                  <input
                    id="age"
                    type="number"
                    min={5}
                    max={115}
                    value={age}
                    onChange={(e) => setAge(Number(e.target.value) || 0)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-900 focus:border-violet-500 focus:ring-2 focus:ring-violet-200 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5" htmlFor="height">
                    Height (cm)
                  </label>
                  <input
                    id="height"
                    type="number"
                    min={50}
                    max={250}
                    value={heightCm}
                    onChange={(e) => setHeightCm(Number(e.target.value) || 0)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-900 focus:border-violet-500 focus:ring-2 focus:ring-violet-200 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5" htmlFor="weight">
                    Weight (kg)
                  </label>
                  <input
                    id="weight"
                    type="number"
                    min={20}
                    max={300}
                    step={0.5}
                    value={weightKg}
                    onChange={(e) => setWeightKg(Number(e.target.value) || 0)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-900 focus:border-violet-500 focus:ring-2 focus:ring-violet-200 outline-hidden"
                  />
                </div>
              </div>

              {/* Dynamic Live BMI Card */}
              <div className="p-4 rounded-2xl bg-linear-to-r from-violet-50/80 via-purple-50/50 to-indigo-50/60 border border-violet-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-violet-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Scale className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Calculated BMI</span>
                      <span className="text-lg font-extrabold text-violet-900">{bmiResult.bmi || '--'}</span>
                      <span className="px-2 py-0.5 rounded-md bg-violet-200/80 text-violet-900 text-xs font-bold">
                        {bmiResult.category}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{bmiResult.description}</p>
                  </div>
                </div>

                <div className="text-left sm:text-right shrink-0">
                  <span className="text-[11px] text-slate-500 block">Healthy Ref. Weight</span>
                  <span className="text-xs font-bold text-slate-800">
                    {bmiResult.healthyWeightRangeKg.min} kg – {bmiResult.healthyWeightRangeKg.max} kg
                  </span>
                </div>
              </div>

              {/* BMI screening disclaimer note */}
              <div className="flex items-start gap-2 p-3 bg-slate-50 rounded-xl text-[11px] text-slate-500 border border-slate-200/60">
                <Info className="w-4 h-4 text-violet-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Clinical note:</strong> BMI is a preliminary statistical screening formula [kg / m²] and does not measure visceral fat, muscle mass, bone density, or cardiovascular fitness.
                </span>
              </div>

              {/* Primary Wellness Goal */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">Primary Wellness Goal</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {goalsList.map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setPrimaryGoal(g)}
                      className={`text-left p-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                        primaryGoal === g
                          ? 'border-violet-600 bg-violet-50/80 text-violet-900 ring-2 ring-violet-200'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              {/* Physical Activity Level */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">Current Daily Activity Level</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {activityLevelOptions.map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setActivityLevel(lvl)}
                      className={`p-2.5 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                        activityLevel === lvl
                          ? 'border-violet-600 bg-violet-50 text-violet-900 font-bold'
                          : 'border-slate-200 hover:border-slate-300 text-slate-600'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              {/* Preferred Exercises (Multi-select) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Preferred Movement Types (Select all that you enjoy)
                </label>
                <div className="flex flex-wrap gap-2">
                  {exerciseOptions.map((ex) => {
                    const isSelected = preferredExercises.includes(ex);
                    return (
                      <button
                        key={ex}
                        type="button"
                        onClick={() => toggleArrayItem(preferredExercises, ex, setPreferredExercises)}
                        className={`px-3 py-1.5 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-violet-600 border-violet-600 text-white font-semibold'
                            : 'border-slate-200 hover:border-slate-300 text-slate-700'
                        }`}
                      >
                        {ex}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Sleep & Hydration row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-1.5">
                    <Moon className="w-3.5 h-3.5 text-violet-600" />
                    <span>Average Sleep Duration: {sleepHours} hrs</span>
                  </label>
                  <input
                    type="range"
                    min={4}
                    max={12}
                    step={0.5}
                    value={sleepHours}
                    onChange={(e) => setSleepHours(Number(e.target.value))}
                    className="w-full accent-violet-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                    <span>4 hrs</span>
                    <span>7–8 hrs (optimal)</span>
                    <span>12 hrs</span>
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-1.5">
                    <Droplet className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Daily Water Intake: {hydrationGlasses} glasses (~{hydrationGlasses * 250} ml)</span>
                  </label>
                  <input
                    type="range"
                    min={2}
                    max={16}
                    step={1}
                    value={hydrationGlasses}
                    onChange={(e) => setHydrationGlasses(Number(e.target.value))}
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                    <span>2 glasses</span>
                    <span>8 glasses</span>
                    <span>16 glasses</span>
                  </div>
                </div>
              </div>

              {/* Optional Physical Limitations */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5" htmlFor="limitations">
                  Physical Restrictions or Injuries <span className="font-normal text-slate-400">(Optional)</span>
                </label>
                <input
                  id="limitations"
                  type="text"
                  value={physicalLimitations}
                  onChange={(e) => setPhysicalLimitations(e.target.value)}
                  placeholder="e.g. Lower back sensitivity, knee surgery recovery, mild asthma..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:border-violet-500 focus:ring-2 focus:ring-violet-200 outline-hidden"
                />
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  onClick={handleNextStep1}
                  className="px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-sm flex items-center gap-2 shadow-sm shadow-violet-200 transition-all cursor-pointer"
                >
                  <span>Continue to Mental Balance</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: MENTAL WELLNESS */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
                <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                  <Heart className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-heading font-bold text-lg text-slate-900">Mental Wellness & Stress Resilience</h2>
                  <p className="text-xs text-slate-500">Emotional state, stress management, and coping practices</p>
                </div>
              </div>

              {/* Current Mood */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">How are you feeling right now?</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(['Very good', 'Good', 'Okay', 'Stressed', 'Sad', 'Anxious', 'Overwhelmed'] as MoodType[]).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setCurrentMood(m)}
                      className={`p-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                        currentMood === m
                          ? 'border-violet-600 bg-violet-50 text-violet-900 ring-2 ring-violet-200'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              {/* Stress Level */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">General Daily Stress Level</label>
                <div className="grid grid-cols-4 gap-2">
                  {(['Low', 'Moderate', 'High', 'Severe'] as const).map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setStressLevel(lvl)}
                      className={`p-2.5 rounded-xl border text-xs font-medium text-center transition-all cursor-pointer ${
                        stressLevel === lvl
                          ? 'border-violet-600 bg-violet-50 text-violet-900 font-bold'
                          : 'border-slate-200 hover:border-slate-300 text-slate-600'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              {/* Emotional Wellbeing 1-10 slider */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    Self-Reported Emotional Well-Being
                  </label>
                  <span className="text-sm font-extrabold text-violet-700">{emotionalWellbeingRating} / 10</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={10}
                  step={1}
                  value={emotionalWellbeingRating}
                  onChange={(e) => setEmotionalWellbeingRating(Number(e.target.value))}
                  className="w-full accent-violet-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>1 (Depleted)</span>
                  <span>5 (Neutral)</span>
                  <span>10 (Thriving)</span>
                </div>
              </div>

              {/* Primary Stress Sources */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Primary Daily Stress Sources (Select all that apply)
                </label>
                <div className="flex flex-wrap gap-2">
                  {stressOptions.map((opt) => {
                    const isSelected = stressSources.includes(opt);
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => toggleArrayItem(stressSources, opt, setStressSources)}
                        className={`px-3 py-1.5 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-violet-600 border-violet-600 text-white font-semibold'
                            : 'border-slate-200 hover:border-slate-300 text-slate-700'
                        }`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Preferred Coping Activities */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Helpful Coping Activities (What helps you regain calm?)
                </label>
                <div className="flex flex-wrap gap-2">
                  {copingOptions.map((opt) => {
                    const isSelected = preferredCoping.includes(opt);
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => toggleArrayItem(preferredCoping, opt, setPreferredCoping)}
                        className={`px-3 py-1.5 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-purple-600 border-purple-600 text-white font-semibold'
                            : 'border-slate-200 hover:border-slate-300 text-slate-700'
                        }`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold flex items-center gap-2 hover:bg-slate-50 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>

                <button
                  type="button"
                  onClick={handleNextStep2}
                  className="px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-sm flex items-center gap-2 shadow-sm shadow-violet-200 transition-all cursor-pointer"
                >
                  <span>Review & Summary</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: SUMMARY & CONSENT */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-heading font-bold text-lg text-slate-900">Your Wellness Blueprint</h2>
                  <p className="text-xs text-slate-500">Summary generated from your self-reported inputs</p>
                </div>
              </div>

              {/* Generated summary cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-violet-50/70 border border-violet-100">
                  <span className="text-xs font-bold text-violet-900 uppercase tracking-wider block mb-2">
                    Physical Blueprint
                  </span>
                  <ul className="space-y-1.5 text-xs text-slate-700">
                    <li>• Calculated BMI: <strong>{bmiResult.bmi}</strong> ({bmiResult.category})</li>
                    <li>• Target Goal: <strong>{primaryGoal}</strong></li>
                    <li>• Activity Level: <strong>{activityLevel}</strong></li>
                    <li>• Movement Preferences: <strong>{preferredExercises.join(', ')}</strong></li>
                    <li>• Sleep Window: <strong>{sleepHours} hrs/night</strong> ({sleepQuality})</li>
                  </ul>
                </div>

                <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-100">
                  <span className="text-xs font-bold text-purple-900 uppercase tracking-wider block mb-2">
                    Mental Blueprint
                  </span>
                  <ul className="space-y-1.5 text-xs text-slate-700">
                    <li>• Current Mood: <strong>{currentMood}</strong></li>
                    <li>• Stress Level: <strong>{stressLevel}</strong></li>
                    <li>• Emotional Rating: <strong>{emotionalWellbeingRating}/10</strong></li>
                    <li>• Coping Anchors: <strong>{preferredCoping.join(', ')}</strong></li>
                    <li>• Habit Confidence: <strong>{habitConfidence}</strong></li>
                  </ul>
                </div>
              </div>

              {/* Achievable daily goals preview */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                <span className="text-xs font-bold text-slate-900 block mb-2">Initial Achievable Recommendations:</span>
                <div className="space-y-2 text-xs text-slate-700">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-violet-600 shrink-0" />
                    <span>Daily 15-min {preferredExercises[0] || 'Walking'} movement break</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-violet-600 shrink-0" />
                    <span>3-5 min {stressLevel === 'High' ? 'Box Breathing' : 'Mindful Breathing'} reset</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-violet-600 shrink-0" />
                    <span>Hydration milestone: {hydrationGlasses} glasses of water daily</span>
                  </div>
                </div>
              </div>

              {/* Consent checkbox */}
              <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={consentGiven}
                    onChange={(e) => setConsentGiven(e.target.checked)}
                    className="mt-1 w-4 h-4 rounded text-violet-600 accent-violet-600 focus:ring-violet-500 cursor-pointer"
                  />
                  <div className="text-xs text-slate-700 leading-relaxed">
                    <span className="font-bold text-slate-900 block mb-1">Consent to Save Wellness Preferences</span>
                    I consent to storing my self-reported physical and mental wellness metrics in my private CareNova account to generate personalized coaching and recommendations. I understand that CareNova provides general wellness education, not medical diagnosis or prescription.
                  </div>
                </label>
              </div>

              <div className="pt-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold flex items-center gap-2 hover:bg-slate-50 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>

                <button
                  type="button"
                  onClick={handleFinalSubmit}
                  className="px-6 py-3 rounded-xl bg-linear-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-bold text-sm flex items-center gap-2 shadow-md shadow-violet-200 transition-all cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Enter My Personalized Dashboard</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
