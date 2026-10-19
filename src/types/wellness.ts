export type GoalType =
  | 'Improve physical fitness'
  | 'Build strength and stamina'
  | 'Maintain healthy habits'
  | 'Improve sleep'
  | 'Manage everyday stress'
  | 'Improve emotional well-being'
  | 'Develop a balanced lifestyle';

export type ActivityLevel = 'Sedentary' | 'Lightly active' | 'Moderately active' | 'Very active' | 'Extremely active';

export type MoodType =
  | 'Very good'
  | 'Good'
  | 'Okay'
  | 'Stressed'
  | 'Sad'
  | 'Anxious'
  | 'Overwhelmed';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  age: number;
  heightCm: number;
  weightKg: number;
  bmi: number;
  primaryGoal: GoalType;
  activityLevel: ActivityLevel;
  typicalSleepHours: number;
  stressLevel: 'Low' | 'Moderate' | 'High' | 'Severe';
  preferredActivities: string[];
  physicalLimitations?: string;
  hasConsentedDataUse: boolean;
  onboardingCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AssessmentData {
  id: string;
  userId: string;
  completedAt: string;
  // Physical
  age: number;
  heightCm: number;
  weightKg: number;
  bmi: number;
  activityLevel: ActivityLevel;
  exerciseFrequency: '0-1 days/wk' | '2-3 days/wk' | '4-5 days/wk' | '6-7 days/wk';
  averageWorkoutDuration: '10-20 mins' | '20-40 mins' | '40-60 mins' | '60+ mins';
  preferredExercises: string[];
  primaryGoal: GoalType;
  sleepHours: number;
  sleepQuality: 'Poor' | 'Fair' | 'Good' | 'Excellent';
  dailyEnergy: 'Low' | 'Moderate' | 'High' | 'Fluctuates';
  hydrationGlasses: number;
  physicalLimitations: string;
  // Mental
  currentMood: MoodType;
  stressLevel: 'Low' | 'Moderate' | 'High' | 'Severe';
  sleepDifficulty: 'None' | 'Occasional' | 'Frequent' | 'Chronic';
  abilityToRelax: 'Easy' | 'Moderate' | 'Difficult' | 'Very Difficult';
  emotionalWellbeingRating: number; // 1-10
  stressSources: string[];
  preferredCoping: string[];
  habitConfidence: 'Low' | 'Medium' | 'High';
  // Generated summary
  physicalSummary: string;
  mentalSummary: string;
  suggestedGoals: string[];
}

export type ExerciseCategory =
  | 'Walking'
  | 'Running'
  | 'Stretching'
  | 'Strength training'
  | 'Cardio'
  | 'Yoga'
  | 'Mobility'
  | 'Other';

export interface ExerciseSession {
  id: string;
  userId: string;
  type: 'exercise';
  activityName: string;
  category: ExerciseCategory;
  startedAt: string;
  finishedAt: string;
  durationSeconds: number;
  isCompleted: boolean;
  effortRating?: number; // 1 to 5
  sets?: number;
  reps?: number;
  distanceKm?: number;
  notes?: string;
}

export type BreathworkTechnique =
  | 'Box breathing'
  | 'Slow breathing'
  | 'Diaphragmatic breathing'
  | 'Gentle relaxation breathing'
  | 'Mindful breathing';

export interface BreathworkSession {
  id: string;
  userId: string;
  type: 'breathwork';
  technique: BreathworkTechnique;
  startedAt: string;
  finishedAt: string;
  durationSeconds: number;
  targetMinutes: number;
  cyclesCompleted: number;
  isCompleted: boolean;
  moodBefore?: MoodType;
  moodAfter?: MoodType;
  notes?: string;
}

export type ActivityRecord = ExerciseSession | BreathworkSession;

export interface MoodLog {
  id: string;
  userId: string;
  mood: MoodType;
  notes?: string;
  loggedAt: string;
}

export type ReminderCategory =
  | 'Physical Health'
  | 'Mental Wellness'
  | 'Exercise'
  | 'Breathwork'
  | 'Hydration'
  | 'Sleep'
  | 'Medication'
  | 'Personal';

export type ReminderRepeat = 'Once' | 'Daily' | 'Weekdays' | 'Weekly';

export interface ReminderItem {
  id: string;
  userId: string;
  title: string;
  description?: string;
  category: ReminderCategory;
  dueDate: string; // YYYY-MM-DD
  dueTime: string; // HH:mm
  repeat: ReminderRepeat;
  isCompleted: boolean;
  completedAt?: string;
  createdAt: string;
}

export interface SoundSettings {
  enabled: boolean;
  volume: number; // 0 to 1
  previewPlayedAt?: number;
}

export interface RecommendationItem {
  id: string;
  title: string;
  category: 'physical' | 'mental' | 'habit';
  reason: string;
  instructions: string;
  estimatedDuration: string;
  difficulty?: 'Beginner' | 'Intermediate' | 'Gentle' | 'All Levels';
  actionType: 'start_exercise' | 'start_breathwork' | 'start_journal' | 'check_habit';
  actionPayload?: any;
  saved?: boolean;
  dismissed?: boolean;
}
