import test from 'node:test';
import assert from 'node:assert/strict';
import { generatePersonalizedRecommendations } from './recommendations.ts';
import { UserProfile, MoodLog } from '../types/wellness.ts';

test('Recommendations: generates sleep-targeted recommendations when primary goal is sleep', () => {
  const profile: UserProfile = {
    id: 'user-1',
    name: 'Sarah',
    email: 'sarah@example.com',
    age: 32,
    heightCm: 165,
    weightKg: 62,
    bmi: 22.8,
    primaryGoal: 'Improve sleep',
    activityLevel: 'Lightly active',
    typicalSleepHours: 5.5,
    stressLevel: 'Moderate',
    preferredActivities: ['Yoga', 'Walking'],
    hasConsentedDataUse: true,
    onboardingCompleted: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const recs = generatePersonalizedRecommendations(profile, null, [], []);
  assert.equal(recs.length, 3);
  const physicalRec = recs.find((r) => r.category === 'physical');
  assert.ok(physicalRec);
  assert.match(physicalRec!.title, /bedtime|mobility|stretch/i);

  const mentalRec = recs.find((r) => r.category === 'mental');
  assert.ok(mentalRec);
  assert.match(mentalRec!.title, /4-7-8|breathing/i);
});

test('Recommendations: triggers acute stress breathwork when user mood is Stressed or Overwhelmed', () => {
  const moodLog: MoodLog = {
    id: 'm1',
    userId: 'user-1',
    mood: 'Overwhelmed',
    loggedAt: new Date().toISOString(),
  };

  const recs = generatePersonalizedRecommendations(null, null, [], [moodLog]);
  const mentalRec = recs.find((r) => r.category === 'mental');
  assert.ok(mentalRec);
  assert.match(mentalRec!.title, /box breathing/i);
});
