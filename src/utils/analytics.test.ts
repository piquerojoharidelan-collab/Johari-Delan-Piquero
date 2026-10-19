import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateActivityTotals, formatDuration, formatTimerDisplay } from './analytics.ts';
import { ExerciseSession, BreathworkSession } from '../types/wellness.ts';

test('Analytics: calculates zero values for empty activity history', () => {
  const result = calculateActivityTotals([]);
  assert.equal(result.totalExerciseSessions, 0);
  assert.equal(result.totalExerciseMinutes, 0);
  assert.equal(result.totalBreathworkSessions, 0);
  assert.equal(result.totalBreathworkMinutes, 0);
  assert.equal(result.totalCompletedSessions, 0);
  assert.equal(result.streakDays, 0);
});

test('Analytics: accurately calculates exercise and breathwork minutes and sessions', () => {
  const refDate = new Date('2026-10-18T12:00:00Z');

  const exercise1: ExerciseSession = {
    id: 'ex-1',
    userId: 'u1',
    type: 'exercise',
    activityName: 'Morning Jog',
    category: 'Running',
    startedAt: '2026-10-18T08:00:00Z',
    finishedAt: '2026-10-18T08:30:00Z',
    durationSeconds: 1800, // 30 mins
    isCompleted: true,
  };

  const breathwork1: BreathworkSession = {
    id: 'bw-1',
    userId: 'u1',
    type: 'breathwork',
    technique: 'Box breathing',
    startedAt: '2026-10-18T10:00:00Z',
    finishedAt: '2026-10-18T10:05:00Z',
    durationSeconds: 300, // 5 mins
    targetMinutes: 5,
    cyclesCompleted: 15,
    isCompleted: true,
  };

  const partialExercise: ExerciseSession = {
    id: 'ex-2',
    userId: 'u1',
    type: 'exercise',
    activityName: 'Quick Stretch',
    category: 'Stretching',
    startedAt: '2026-10-17T08:00:00Z',
    finishedAt: '2026-10-17T08:04:00Z',
    durationSeconds: 240, // 4 mins
    isCompleted: false,
  };

  const totals = calculateActivityTotals([exercise1, breathwork1, partialExercise], refDate);

  assert.equal(totals.totalExerciseSessions, 2);
  assert.equal(totals.totalExerciseMinutes, 34); // 30 + 4
  assert.equal(totals.totalBreathworkSessions, 1);
  assert.equal(totals.totalBreathworkMinutes, 5);
  assert.equal(totals.totalCompletedSessions, 2);
  assert.equal(totals.totalPartialSessions, 1);
  assert.equal(totals.dailyExerciseMinutes, 30);
  assert.equal(totals.dailyBreathworkMinutes, 5);
});

test('Duration formatters: format seconds accurately for UI display', () => {
  assert.equal(formatDuration(45), '45s');
  assert.equal(formatDuration(125), '2m 05s');
  assert.equal(formatTimerDisplay(75), '01:15');
  assert.equal(formatTimerDisplay(0), '00:00');
});
