import { UserProfile, AssessmentData, ActivityRecord, MoodLog, RecommendationItem } from '../types/wellness';

export function generatePersonalizedRecommendations(
  profile?: UserProfile | null,
  assessment?: AssessmentData | null,
  activities: ActivityRecord[] = [],
  moodLogs: MoodLog[] = []
): RecommendationItem[] {
  const recommendations: RecommendationItem[] = [];

  const goal = profile?.primaryGoal || assessment?.primaryGoal || 'Improve physical fitness';
  const stress = profile?.stressLevel || assessment?.stressLevel || 'Moderate';
  const latestMood = moodLogs.length > 0 ? moodLogs[moodLogs.length - 1].mood : assessment?.currentMood;

  // 1. Physical Recommendation
  if (goal === 'Build strength and stamina') {
    recommendations.push({
      id: 'rec_phys_strength_1',
      title: 'Full-Body Foundational Strength',
      category: 'physical',
      reason: 'Designed to match your goal of building lean strength with low joint impact and progressive bodyweight resistance.',
      instructions: 'Complete 3 rounds: 10 bodyweight squats, 8 modified push-ups, 20-second plank, and 12 glute bridges. Rest 60s between rounds.',
      estimatedDuration: '15 mins',
      difficulty: 'Beginner',
      actionType: 'start_exercise',
      actionPayload: {
        name: 'Full-Body Foundational Strength',
        category: 'Strength training',
        targetSeconds: 900,
        notes: '3 rounds: Squats, Push-ups, Plank, Glute bridges',
      },
    });
  } else if (goal === 'Improve sleep') {
    recommendations.push({
      id: 'rec_phys_sleep_stretch',
      title: 'Gentle Bedtime Mobility & Spine Decompression',
      category: 'physical',
      reason: 'Light stretching lowers cortisol and eases muscular tension accumulated during the day, preparing your body for restorative sleep.',
      instructions: 'Hold each gentle stretch for 30-45 seconds: Child pose, Cat-Cow spinal waves, Seated forward bend, and Legs-up-the-wall.',
      estimatedDuration: '10 mins',
      difficulty: 'Gentle',
      actionType: 'start_exercise',
      actionPayload: {
        name: 'Bedtime Mobility & Spine Decompression',
        category: 'Stretching',
        targetSeconds: 600,
        notes: 'Hold each stretch 30-45s gently without straining.',
      },
    });
  } else {
    recommendations.push({
      id: 'rec_phys_brisk_walk',
      title: 'Energizing Aerobic Walk & Posture Flow',
      category: 'physical',
      reason: 'Promotes cardiovascular circulation, releases mood-elevating endorphins, and meets daily baseline aerobic activity guidelines.',
      instructions: 'Start with 2 minutes of relaxed walking, build to a brisk stride for 15 minutes, and finish with 3 minutes of easy cooldown breathing.',
      estimatedDuration: '20 mins',
      difficulty: 'All Levels',
      actionType: 'start_exercise',
      actionPayload: {
        name: 'Brisk Aerobic Walk',
        category: 'Walking',
        targetSeconds: 1200,
        notes: 'Steady natural pace with upright posture and arm swing.',
      },
    });
  }

  // 2. Mental Recommendation
  if (stress === 'High' || stress === 'Severe' || latestMood === 'Stressed' || latestMood === 'Anxious' || latestMood === 'Overwhelmed') {
    recommendations.push({
      id: 'rec_ment_box_breathing',
      title: 'Calming Box Breathing (4-4-4-4) Reset',
      category: 'mental',
      reason: 'You indicated elevated stress. Equal-duration breath pacing rapidly down-regulates sympathetic nervous system overdrive.',
      instructions: 'Inhale for 4 seconds, hold gently for 4, exhale smoothly for 4, and pause for 4. Follow the expanding rhythm guide.',
      estimatedDuration: '3 mins',
      difficulty: 'Beginner',
      actionType: 'start_breathwork',
      actionPayload: {
        technique: 'Box breathing',
        targetMinutes: 3,
      },
    });
  } else if (goal === 'Improve sleep' || latestMood === 'Sad') {
    recommendations.push({
      id: 'rec_ment_478_sleep',
      title: '4-7-8 Parasympathetic Relaxation Breathing',
      category: 'mental',
      reason: 'Prolonged exhalation triggers the vagus nerve to slow heart rate, promoting profound calm and restful mental clarity.',
      instructions: 'Inhale silently through your nose for 4 counts, hold for 7 counts, and exhale gently with an audible whoosh for 8 counts.',
      estimatedDuration: '5 mins',
      difficulty: 'Gentle',
      actionType: 'start_breathwork',
      actionPayload: {
        technique: 'Gentle relaxation breathing',
        targetMinutes: 5,
      },
    });
  } else {
    recommendations.push({
      id: 'rec_ment_mindful_pause',
      title: '5-Minute Mindful Centering & Grounding',
      category: 'mental',
      reason: 'Taking brief mindfulness intervals improves cognitive focus, emotional equilibrium, and resilience against daily fatigue.',
      instructions: 'Sit comfortably with feet flat. Notice 5 things you can see, 4 sensations you feel, 3 sounds, and 2 deep diaphragmatic breaths.',
      estimatedDuration: '5 mins',
      difficulty: 'All Levels',
      actionType: 'start_breathwork',
      actionPayload: {
        technique: 'Mindful breathing',
        targetMinutes: 5,
      },
    });
  }

  // 3. Achievable Daily Habit
  recommendations.push({
    id: 'rec_habit_hydration_sun',
    title: 'Hydration & Morning Sunlight Anchor',
    category: 'habit',
    reason: 'Drinking 400ml of water upon waking kickstarts cellular hydration, while natural light anchors your circadian rhythm.',
    instructions: 'Drink a full glass of room-temperature or lemon water within 30 minutes of waking and step outside for 5 minutes of daylight.',
    estimatedDuration: '5 mins',
    difficulty: 'Beginner',
    actionType: 'check_habit',
  });

  return recommendations;
}
