import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateSetVolume,
  calculateWorkoutVolume,
  calculateEstimated1RM,
  formatDuration,
  formatVolume,
  calculateStreak,
  calculateWeeklyStats,
  calculateMuscleDistribution,
  calculatePersonalRecords,
} from './calculations';
import { WorkoutSession, WorkoutExercise } from '../types';

test('calculateSetVolume computes weight * reps correctly', () => {
  assert.equal(calculateSetVolume(225, 5), 1125);
  assert.equal(calculateSetVolume(0, 10), 0);
  assert.equal(calculateSetVolume(135, 0), 0);
  assert.equal(calculateSetVolume(-50, 10), 0);
});

test('calculateWorkoutVolume sums only completed sets with valid weight and reps', () => {
  const mockExercises: WorkoutExercise[] = [
    {
      id: 'we-1',
      exerciseId: 'ex-bench',
      exerciseName: 'Bench Press',
      muscleGroup: 'Chest',
      sets: [
        { id: 's1', setNumber: 1, weight: 135, reps: 10, completed: true },
        { id: 's2', setNumber: 2, weight: 185, reps: 8, completed: true },
        { id: 's3', setNumber: 3, weight: 225, reps: 5, completed: false }, // Not completed, shouldn't count
      ],
    },
    {
      id: 'we-2',
      exerciseId: 'ex-incline',
      exerciseName: 'Incline Dumbbell Press',
      muscleGroup: 'Chest',
      sets: [
        { id: 's4', setNumber: 1, weight: 70, reps: 10, completed: true },
      ],
    },
  ];

  // (135*10 = 1350) + (185*8 = 1480) + (70*10 = 700) = 3530
  const total = calculateWorkoutVolume(mockExercises);
  assert.equal(total, 3530);
});

test('calculateEstimated1RM calculates Brzycki formula accurately', () => {
  // 1 rep should be the weight itself
  assert.equal(calculateEstimated1RM(225, 1), 225);
  // 225 for 5 reps: 225 * (36 / 32) = 253.125 -> 253
  assert.equal(calculateEstimated1RM(225, 5), 253);
  // 315 for 3 reps: 315 * (36 / 34) = 333.5 -> 334
  assert.equal(calculateEstimated1RM(315, 3), 334);
});

test('formatDuration outputs readable hours, minutes, and seconds', () => {
  assert.equal(formatDuration(45), '0m 45s');
  assert.equal(formatDuration(125), '2m 5s');
  assert.equal(formatDuration(3670), '1h 1m 10s');
});

test('formatVolume formats nicely with k/M abbreviations', () => {
  assert.equal(formatVolume(500, 'lbs'), '500 lbs');
  assert.equal(formatVolume(14250, 'lbs'), '14.3k lbs');
  assert.equal(formatVolume(1200000, 'kg'), '1.2M kg');
});

test('calculateStreak counts consecutive workout days correctly', () => {
  const refDate = new Date('2026-11-07T12:00:00Z');
  
  const mockWorkouts: WorkoutSession[] = [
    {
      id: 'w1',
      userId: 'user-test',
      name: 'Push Day',
      type: 'Push',
      startTime: new Date('2026-11-07T10:00:00Z').getTime(),
      createdAt: '2026-11-07T10:00:00Z',
      durationSeconds: 3600,
      exercises: [],
      totalVolume: 5000,
    },
    {
      id: 'w2',
      userId: 'user-test',
      name: 'Pull Day',
      type: 'Pull',
      startTime: new Date('2026-11-06T10:00:00Z').getTime(),
      createdAt: '2026-11-06T10:00:00Z',
      durationSeconds: 3600,
      exercises: [],
      totalVolume: 6000,
    },
    {
      id: 'w3',
      userId: 'user-test',
      name: 'Leg Day',
      type: 'Legs',
      startTime: new Date('2026-11-05T10:00:00Z').getTime(),
      createdAt: '2026-11-05T10:00:00Z',
      durationSeconds: 3600,
      exercises: [],
      totalVolume: 8000,
    },
  ];

  const streak = calculateStreak(mockWorkouts, refDate);
  assert.equal(streak, 3);
});

test('calculatePersonalRecords extracts max weight and estimated 1RM', () => {
  const mockWorkouts: WorkoutSession[] = [
    {
      id: 'w1',
      userId: 'user-test',
      name: 'Chest Focus',
      type: 'Push',
      startTime: new Date('2026-11-01').getTime(),
      createdAt: '2026-11-01T10:00:00Z',
      durationSeconds: 3000,
      totalVolume: 5000,
      exercises: [
        {
          id: 'e1',
          exerciseId: 'bench',
          exerciseName: 'Bench Press',
          muscleGroup: 'Chest',
          sets: [
            { id: 's1', setNumber: 1, weight: 225, reps: 5, completed: true },
            { id: 's2', setNumber: 2, weight: 245, reps: 3, completed: true },
          ],
        },
      ],
    },
  ];

  const prs = calculatePersonalRecords(mockWorkouts);
  assert.ok(prs['Bench Press']);
  assert.equal(prs['Bench Press'].maxWeight, 245);
  assert.equal(prs['Bench Press'].maxRepsAtMaxWeight, 3);
});
