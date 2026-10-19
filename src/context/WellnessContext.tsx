import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import {
  UserProfile,
  AssessmentData,
  ActivityRecord,
  ExerciseSession,
  BreathworkSession,
  MoodLog,
  ReminderItem,
  SoundSettings,
  MoodType,
  ExerciseCategory,
  BreathworkTechnique,
} from '../types/wellness';
import { calculateBMI } from '../utils/bmi';
import { calculateActivityTotals, ActivitySummaryStats } from '../utils/analytics';
import { getStoredSoundSettings, saveSoundSettings, playSessionCompletionSound } from '../utils/sound';

interface JournalEntry {
  id: string;
  prompt: string;
  content: string;
  date: string;
}

interface WellnessContextType {
  // Auth & Profile
  currentUser: UserProfile | null;
  isAuthenticated: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, pass: string, name: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  loadDemoUser: () => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  saveAssessment: (data: AssessmentData) => void;
  reassess: () => void;

  // Activities & Sessions
  activities: ActivityRecord[];
  saveActivity: (activity: ActivityRecord) => Promise<void>;
  updateActivity: (id: string, updates: Partial<ActivityRecord>) => void;
  deleteActivity: (id: string) => void;
  stats: ActivitySummaryStats;

  // Active workout & breathwork state
  activeExercise: {
    name: string;
    category: ExerciseCategory;
    targetSeconds?: number;
    initialNotes?: string;
  } | null;
  activeBreathwork: {
    technique: BreathworkTechnique;
    targetMinutes: number;
  } | null;
  startExercise: (name: string, category: ExerciseCategory, targetSeconds?: number, notes?: string) => void;
  cancelExercise: () => void;
  startBreathwork: (technique: BreathworkTechnique, targetMinutes: number) => void;
  cancelBreathwork: () => void;

  // Completion Screen state
  completedSessionDetails: {
    type: 'exercise' | 'breathwork';
    name: string;
    durationSeconds: number;
    metrics: string;
    isCompleted: boolean;
    category?: string;
    cycles?: number;
  } | null;
  dismissCompletionModal: () => void;

  // Mood logs
  moodLogs: MoodLog[];
  addMoodLog: (mood: MoodType, notes?: string) => void;

  // Reminders
  reminders: ReminderItem[];
  addReminder: (rem: Omit<ReminderItem, 'id' | 'userId' | 'createdAt'>) => void;
  toggleReminder: (id: string) => void;
  updateReminder: (id: string, updates: Partial<ReminderItem>) => void;
  deleteReminder: (id: string) => void;

  // Daily Habits
  dailyHabits: Record<string, boolean>;
  toggleDailyHabit: (habitKey: string) => void;

  // Journal entries
  journalEntries: JournalEntry[];
  addJournalEntry: (prompt: string, content: string) => void;

  // Sound Settings
  soundSettings: SoundSettings;
  updateSoundSettings: (updates: Partial<SoundSettings>) => void;

  // Navigation
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const STORAGE_KEYS = {
  USER: 'carenova_user_profile',
  ASSESSMENT: 'carenova_assessment',
  ACTIVITIES: 'carenova_activities',
  MOODS: 'carenova_moods',
  REMINDERS: 'carenova_reminders',
  HABITS: 'carenova_habits',
  JOURNAL: 'carenova_journal',
};

const WellnessContext = createContext<WellnessContextType | null>(null);

export const WellnessProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.USER);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [assessment, setAssessment] = useState<AssessmentData | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.ASSESSMENT);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [activities, setActivities] = useState<ActivityRecord[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.ACTIVITIES);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [moodLogs, setMoodLogs] = useState<MoodLog[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.MOODS);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [reminders, setReminders] = useState<ReminderItem[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.REMINDERS);
      if (stored) return JSON.parse(stored);
      // Default initial starter reminders
      return [
        {
          id: 'rem-1',
          userId: 'default',
          title: 'Hydration check-in (500ml water)',
          description: 'Drink a glass of water to keep energy and focus high.',
          category: 'Hydration',
          dueDate: new Date().toISOString().slice(0, 10),
          dueTime: '10:00',
          repeat: 'Daily',
          isCompleted: false,
          createdAt: new Date().toISOString(),
        },
        {
          id: 'rem-2',
          userId: 'default',
          title: 'Mid-day 3-Minute Breathing Break',
          description: 'Box breathing to reset calm and posture.',
          category: 'Breathwork',
          dueDate: new Date().toISOString().slice(0, 10),
          dueTime: '14:30',
          repeat: 'Weekdays',
          isCompleted: false,
          createdAt: new Date().toISOString(),
        },
      ];
    } catch {
      return [];
    }
  });

  const [dailyHabits, setDailyHabits] = useState<Record<string, boolean>>(() => {
    try {
      const today = new Date().toISOString().slice(0, 10);
      const stored = localStorage.getItem(`${STORAGE_KEYS.HABITS}_${today}`);
      return stored ? JSON.parse(stored) : { morning_water: false, movement_break: false, mindful_breath: false, evening_winddown: false };
    } catch {
      return { morning_water: false, movement_break: false, mindful_breath: false, evening_winddown: false };
    }
  });

  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.JOURNAL);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [soundSettings, setSoundSettings] = useState<SoundSettings>(() => getStoredSoundSettings());

  // Active workout / breathwork navigation & state
  const [activeExercise, setActiveExercise] = useState<{
    name: string;
    category: ExerciseCategory;
    targetSeconds?: number;
    initialNotes?: string;
  } | null>(null);

  const [activeBreathwork, setActiveBreathwork] = useState<{
    technique: BreathworkTechnique;
    targetMinutes: number;
  } | null>(null);

  const [completedSessionDetails, setCompletedSessionDetails] = useState<{
    type: 'exercise' | 'breathwork';
    name: string;
    durationSeconds: number;
    metrics: string;
    isCompleted: boolean;
    category?: string;
    cycles?: number;
  } | null>(null);

  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Sync state to localStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(STORAGE_KEYS.USER);
    }
  }, [currentUser]);

  useEffect(() => {
    if (assessment) {
      localStorage.setItem(STORAGE_KEYS.ASSESSMENT, JSON.stringify(assessment));
    }
  }, [assessment]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(activities));
  }, [activities]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MOODS, JSON.stringify(moodLogs));
  }, [moodLogs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.REMINDERS, JSON.stringify(reminders));
  }, [reminders]);

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    localStorage.setItem(`${STORAGE_KEYS.HABITS}_${today}`, JSON.stringify(dailyHabits));
  }, [dailyHabits]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.JOURNAL, JSON.stringify(journalEntries));
  }, [journalEntries]);

  // Auth operations
  const login = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    if (!email || !pass) {
      return { success: false, error: 'Please enter both email and password' };
    }
    // Simulate real user credentials verification
    const stored = localStorage.getItem(`carenova_user_account_${email.toLowerCase().trim()}`);
    if (stored) {
      const user = JSON.parse(stored);
      if (user.password === pass) {
        setCurrentUser(user.profile);
        return { success: true };
      }
      return { success: false, error: 'Incorrect password. Please verify and try again.' };
    }

    // New or standard session login
    const nameFromEmail = email.split('@')[0];
    const newProfile: UserProfile = {
      id: `usr_${Date.now()}`,
      name: nameFromEmail.charAt(0).toUpperCase() + nameFromEmail.slice(1),
      email: email.toLowerCase().trim(),
      age: 28,
      heightCm: 172,
      weightKg: 68,
      bmi: 23.0,
      primaryGoal: 'Develop a balanced lifestyle',
      activityLevel: 'Moderately active',
      typicalSleepHours: 7.5,
      stressLevel: 'Moderate',
      preferredActivities: ['Walking', 'Stretching'],
      hasConsentedDataUse: true,
      onboardingCompleted: false, // forces onboarding on new login
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setCurrentUser(newProfile);
    localStorage.setItem(`carenova_user_account_${email.toLowerCase().trim()}`, JSON.stringify({ password: pass, profile: newProfile }));
    return { success: true };
  };

  const register = async (email: string, pass: string, name: string): Promise<{ success: boolean; error?: string }> => {
    if (!email || !pass || !name) {
      return { success: false, error: 'All fields are required to register an account.' };
    }
    if (pass.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters long.' };
    }
    const cleanEmail = email.toLowerCase().trim();
    const newProfile: UserProfile = {
      id: `usr_${Date.now()}`,
      name: name.trim(),
      email: cleanEmail,
      age: 28,
      heightCm: 172,
      weightKg: 68,
      bmi: 23.0,
      primaryGoal: 'Improve physical fitness',
      activityLevel: 'Lightly active',
      typicalSleepHours: 7,
      stressLevel: 'Moderate',
      preferredActivities: ['Walking', 'Stretching'],
      hasConsentedDataUse: true,
      onboardingCompleted: false, // user will complete assessment
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setCurrentUser(newProfile);
    localStorage.setItem(`carenova_user_account_${cleanEmail}`, JSON.stringify({ password: pass, profile: newProfile }));
    return { success: true };
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const loadDemoUser = () => {
    const demoProfile: UserProfile = {
      id: 'demo-user-1',
      name: 'Elena Rostova',
      email: 'elena@example.com',
      age: 29,
      heightCm: 168,
      weightKg: 63,
      bmi: 22.3,
      primaryGoal: 'Develop a balanced lifestyle',
      activityLevel: 'Moderately active',
      typicalSleepHours: 7.5,
      stressLevel: 'Moderate',
      preferredActivities: ['Walking', 'Yoga', 'Stretching'],
      physicalLimitations: 'Mild lower-back stiffness after long desk sitting',
      hasConsentedDataUse: true,
      onboardingCompleted: true,
      createdAt: new Date(Date.now() - 14 * 24 * 3600 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Pre-populate realistic activity history
    const now = Date.now();
    const oneDay = 24 * 3600 * 1000;
    const demoActivities: ActivityRecord[] = [
      {
        id: 'demo-act-1',
        userId: 'demo-user-1',
        type: 'exercise',
        activityName: 'Brisk Morning Walk & Posture Flow',
        category: 'Walking',
        startedAt: new Date(now - 2 * 3600 * 1000).toISOString(),
        finishedAt: new Date(now - 1.5 * 3600 * 1000).toISOString(),
        durationSeconds: 1200, // 20 mins
        isCompleted: true,
        effortRating: 4,
        distanceKm: 1.8,
        notes: 'Felt very revitalizing in the morning breeze.',
      },
      {
        id: 'demo-act-2',
        userId: 'demo-user-1',
        type: 'breathwork',
        technique: 'Box breathing',
        startedAt: new Date(now - oneDay - 4 * 3600 * 1000).toISOString(),
        finishedAt: new Date(now - oneDay - 3.9 * 3600 * 1000).toISOString(),
        durationSeconds: 300, // 5 mins
        targetMinutes: 5,
        cyclesCompleted: 15,
        isCompleted: true,
        moodBefore: 'Stressed',
        moodAfter: 'Good',
        notes: 'Noticeable drop in heart rate and shoulder tension.',
      },
      {
        id: 'demo-act-3',
        userId: 'demo-user-1',
        type: 'exercise',
        activityName: 'Desk Stretch & Spine Reset',
        category: 'Stretching',
        startedAt: new Date(now - 2 * oneDay).toISOString(),
        finishedAt: new Date(now - 2 * oneDay + 600 * 1000).toISOString(),
        durationSeconds: 600, // 10 mins
        isCompleted: true,
        effortRating: 3,
        notes: 'Helped reduce midday shoulder knots.',
      },
      {
        id: 'demo-act-4',
        userId: 'demo-user-1',
        type: 'breathwork',
        technique: 'Gentle relaxation breathing',
        startedAt: new Date(now - 3 * oneDay).toISOString(),
        finishedAt: new Date(now - 3 * oneDay + 480 * 1000).toISOString(),
        durationSeconds: 480, // 8 mins
        targetMinutes: 10,
        cyclesCompleted: 12,
        isCompleted: false, // partial session test case
        moodBefore: 'Anxious',
        moodAfter: 'Okay',
        notes: 'Saved partial session when interrupted by phone.',
      },
    ];

    const demoMoods: MoodLog[] = [
      { id: 'm-1', userId: 'demo-user-1', mood: 'Good', notes: 'Feeling centered and ready for the day', loggedAt: new Date(now - 2 * 3600 * 1000).toISOString() },
      { id: 'm-2', userId: 'demo-user-1', mood: 'Stressed', notes: 'High workload afternoon deadline', loggedAt: new Date(now - oneDay).toISOString() },
      { id: 'm-3', userId: 'demo-user-1', mood: 'Very good', notes: 'Great sleep and morning workout', loggedAt: new Date(now - 2 * oneDay).toISOString() },
    ];

    setCurrentUser(demoProfile);
    setActivities(demoActivities);
    setMoodLogs(demoMoods);
  };

  const updateProfile = (updates: Partial<UserProfile>) => {
    if (!currentUser) return;
    const updated = { ...currentUser, ...updates, updatedAt: new Date().toISOString() };
    if (updates.weightKg || updates.heightCm || updates.age) {
      const h = updates.heightCm || currentUser.heightCm;
      const w = updates.weightKg || currentUser.weightKg;
      const a = updates.age || currentUser.age;
      updated.bmi = calculateBMI(w, h, a).bmi;
    }
    setCurrentUser(updated);
  };

  const saveAssessment = (data: AssessmentData) => {
    setAssessment(data);
    if (currentUser) {
      updateProfile({
        age: data.age,
        heightCm: data.heightCm,
        weightKg: data.weightKg,
        bmi: data.bmi,
        primaryGoal: data.primaryGoal,
        activityLevel: data.activityLevel,
        typicalSleepHours: data.sleepHours,
        stressLevel: data.stressLevel,
        preferredActivities: data.preferredExercises,
        physicalLimitations: data.physicalLimitations,
        onboardingCompleted: true,
        hasConsentedDataUse: true,
      });
    }
    setActiveTab('dashboard');
  };

  const reassess = () => {
    if (currentUser) {
      setCurrentUser({ ...currentUser, onboardingCompleted: false });
    }
  };

  // Activity recording with sound trigger & completion screen
  const saveActivity = useCallback(async (activity: ActivityRecord) => {
    setActivities((prev) => {
      // Prevent duplicates by ID
      if (prev.some((a) => a.id === activity.id)) return prev;
      return [activity, ...prev];
    });

    // If completed, trigger sound & show completion modal
    if (activity.isCompleted) {
      await playSessionCompletionSound(activity.id, soundSettings);

      const mins = Math.round(activity.durationSeconds / 60);
      let metrics = `${mins} min${mins === 1 ? '' : 's'} recorded`;
      let cycles: number | undefined;

      if (activity.type === 'breathwork') {
        const bw = activity as BreathworkSession;
        cycles = bw.cyclesCompleted;
        metrics = `${bw.cyclesCompleted} breath cycles completed (${mins}m)`;
      } else if (activity.type === 'exercise') {
        const ex = activity as ExerciseSession;
        if (ex.distanceKm) metrics += ` • ${ex.distanceKm} km`;
        if (ex.sets) metrics += ` • ${ex.sets} sets`;
        if (ex.effortRating) metrics += ` • Effort: ${ex.effortRating}/5`;
      }

      setCompletedSessionDetails({
        type: activity.type,
        name: activity.type === 'exercise' ? (activity as ExerciseSession).activityName : (activity as BreathworkSession).technique,
        durationSeconds: activity.durationSeconds,
        metrics,
        isCompleted: true,
        category: activity.type === 'exercise' ? (activity as ExerciseSession).category : undefined,
        cycles,
      });
    }
  }, [soundSettings]);

  const updateActivity = (id: string, updates: Partial<ActivityRecord>) => {
    setActivities((prev) => prev.map((a) => (a.id === id ? ({ ...a, ...updates } as ActivityRecord) : a)));
  };

  const deleteActivity = (id: string) => {
    setActivities((prev) => prev.filter((a) => a.id !== id));
  };

  const dismissCompletionModal = () => {
    setCompletedSessionDetails(null);
  };

  // Exercise & Breathwork Launcher
  const startExercise = (name: string, category: ExerciseCategory, targetSeconds?: number, notes?: string) => {
    setActiveExercise({ name, category, targetSeconds, initialNotes: notes });
    setActiveTab('exercise_tracker');
  };

  const cancelExercise = () => {
    setActiveExercise(null);
  };

  const startBreathwork = (technique: BreathworkTechnique, targetMinutes: number) => {
    setActiveBreathwork({ technique, targetMinutes });
    setActiveTab('breathwork');
  };

  const cancelBreathwork = () => {
    setActiveBreathwork(null);
  };

  // Mood logs
  const addMoodLog = (mood: MoodType, notes?: string) => {
    const newLog: MoodLog = {
      id: `mood_${Date.now()}`,
      userId: currentUser?.id || 'guest',
      mood,
      notes,
      loggedAt: new Date().toISOString(),
    };
    setMoodLogs((prev) => [newLog, ...prev]);
  };

  // Reminders
  const addReminder = (rem: Omit<ReminderItem, 'id' | 'userId' | 'createdAt'>) => {
    const newRem: ReminderItem = {
      ...rem,
      id: `rem_${Date.now()}`,
      userId: currentUser?.id || 'guest',
      createdAt: new Date().toISOString(),
    };
    setReminders((prev) => [newRem, ...prev]);
  };

  const toggleReminder = (id: string) => {
    setReminders((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              isCompleted: !r.isCompleted,
              completedAt: !r.isCompleted ? new Date().toISOString() : undefined,
            }
          : r
      )
    );
  };

  const updateReminder = (id: string, updates: Partial<ReminderItem>) => {
    setReminders((prev) => prev.map((r) => (r.id === id ? { ...r, ...updates } : r)));
  };

  const deleteReminder = (id: string) => {
    setReminders((prev) => prev.filter((r) => r.id !== id));
  };

  // Habits
  const toggleDailyHabit = (habitKey: string) => {
    setDailyHabits((prev) => ({ ...prev, [habitKey]: !prev[habitKey] }));
  };

  // Journal
  const addJournalEntry = (prompt: string, content: string) => {
    const entry: JournalEntry = {
      id: `jrnl_${Date.now()}`,
      prompt,
      content,
      date: new Date().toISOString(),
    };
    setJournalEntries((prev) => [entry, ...prev]);
  };

  // Sound settings
  const updateSoundSettings = (updates: Partial<SoundSettings>) => {
    setSoundSettings((prev) => {
      const next = { ...prev, ...updates };
      saveSoundSettings(next);
      return next;
    });
  };

  const stats = calculateActivityTotals(activities);

  return (
    <WellnessContext.Provider
      value={{
        currentUser,
        isAuthenticated: Boolean(currentUser),
        login,
        register,
        logout,
        loadDemoUser,
        updateProfile,
        saveAssessment,
        reassess,
        activities,
        saveActivity,
        updateActivity,
        deleteActivity,
        stats,
        activeExercise,
        activeBreathwork,
        startExercise,
        cancelExercise,
        startBreathwork,
        cancelBreathwork,
        completedSessionDetails,
        dismissCompletionModal,
        moodLogs,
        addMoodLog,
        reminders,
        addReminder,
        toggleReminder,
        updateReminder,
        deleteReminder,
        dailyHabits,
        toggleDailyHabit,
        journalEntries,
        addJournalEntry,
        soundSettings,
        updateSoundSettings,
        activeTab,
        setActiveTab,
      }}
    >
      {children}
    </WellnessContext.Provider>
  );
};

export const useWellness = (): WellnessContextType => {
  const ctx = useContext(WellnessContext);
  if (!ctx) {
    throw new Error('useWellness must be used within a WellnessProvider');
  }
  return ctx;
};
