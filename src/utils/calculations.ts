import { WorkoutSession, WorkoutExercise, MuscleGroup } from '../types';

/**
 * Calculates volume for a single set: weight * reps.
 */
export function calculateSetVolume(weight: number, reps: number): number {
  if (weight < 0 || reps < 0) return 0;
  return Math.round(weight * reps);
}

/**
 * Calculates total volume for a list of workout exercises.
 * Only counts completed sets (or sets with valid weight and reps).
 */
export function calculateWorkoutVolume(exercises: WorkoutExercise[]): number {
  if (!exercises || !Array.isArray(exercises)) return 0;
  return exercises.reduce((acc, exercise) => {
    const exerciseVol = exercise.sets.reduce((setAcc, set) => {
      // If completed property is explicitly checked or set has reps
      if (set.completed && set.weight > 0 && set.reps > 0) {
        return setAcc + calculateSetVolume(set.weight, set.reps);
      }
      return setAcc;
    }, 0);
    return acc + exerciseVol;
  }, 0);
}

/**
 * Calculates estimated 1 Rep Max using the Brzycki Formula:
 * 1RM = Weight × (36 / (37 - Reps))
 * When reps === 1, 1RM = Weight.
 * For reps >= 30, estimate based on 1 + 0.0333 * reps.
 */
export function calculateEstimated1RM(weight: number, reps: number): number {
  if (weight <= 0 || reps <= 0) return 0;
  if (reps === 1) return weight;
  if (reps >= 37) return Math.round(weight * (1 + 0.0333 * reps));
  return Math.round(weight * (36 / (37 - reps)));
}

/**
 * Formats duration in seconds to "HH:MM:SS" or "MM:SS" or "Xm Ys".
 */
export function formatDuration(seconds: number): string {
  if (seconds < 0) seconds = 0;
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`;
  }
  return `${minutes}m ${secs}s`;
}

/**
 * Formats duration in timer format (00:00:00 or 00:00).
 */
export function formatTimerDisplay(seconds: number): string {
  if (seconds < 0) seconds = 0;
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  const pad = (n: number) => n.toString().padStart(2, '0');

  if (hours > 0) {
    return `${pad(hours)}:${pad(minutes)}:${pad(secs)}`;
  }
  return `${pad(minutes)}:${pad(secs)}`;
}

/**
 * Formats volume numbers cleanly, e.g. 14,250 lbs or 14.3k lbs.
 */
export function formatVolume(volume: number, unit: 'lbs' | 'kg' = 'lbs'): string {
  if (volume >= 1_000_000) {
    return `${(volume / 1_000_000).toFixed(1)}M ${unit}`;
  }
  if (volume >= 10_000) {
    return `${(volume / 1_000).toFixed(1)}k ${unit}`;
  }
  return `${volume.toLocaleString()} ${unit}`;
}

/**
 * Calculates current streak in consecutive days or active workout cadence.
 * Looks back day by day. If workout today or yesterday, streak is alive.
 */
export function calculateStreak(workouts: WorkoutSession[], referenceDate: Date = new Date()): number {
  if (!workouts || workouts.length === 0) return 0;

  // Extract unique workout dates in 'YYYY-MM-DD' format (local time)
  const uniqueDates = new Set<string>();
  workouts.forEach(w => {
    const d = new Date(w.createdAt || w.startTime);
    const dateStr = d.toISOString().split('T')[0];
    uniqueDates.add(dateStr);
  });

  const refDay = new Date(referenceDate);
  refDay.setHours(0, 0, 0, 0);

  const getDayString = (offsetDays: number) => {
    const d = new Date(refDay);
    d.setDate(d.getDate() - offsetDays);
    return d.toISOString().split('T')[0];
  };

  const todayStr = getDayString(0);
  const yesterdayStr = getDayString(1);

  // If user worked out neither today nor yesterday, streak is broken
  let startOffset = 0;
  if (uniqueDates.has(todayStr)) {
    startOffset = 0;
  } else if (uniqueDates.has(yesterdayStr)) {
    startOffset = 1;
  } else {
    return 0;
  }

  let streak = 0;
  let offset = startOffset;
  while (uniqueDates.has(getDayString(offset))) {
    streak++;
    offset++;
  }

  return streak;
}

/**
 * Calculates weekly workout statistics:
 * - Total workouts in the last 7 days
 * - Total volume in the last 7 days
 * - Daily activity array for the 7 days (Mon-Sun or past 7 days)
 */
export function calculateWeeklyStats(workouts: WorkoutSession[], referenceDate: Date = new Date()) {
  const ref = new Date(referenceDate);
  ref.setHours(23, 59, 59, 999);

  const past7Days: { day: string; date: string; volume: number; workouts: number }[] = [];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  for (let i = 6; i >= 0; i--) {
    const target = new Date(ref);
    target.setDate(target.getDate() - i);
    const dateStr = target.toISOString().split('T')[0];
    const dayName = dayNames[target.getDay()];

    past7Days.push({
      day: dayName,
      date: dateStr,
      volume: 0,
      workouts: 0,
    });
  }

  let totalWorkouts = 0;
  let totalVolume = 0;

  const sevenDaysAgoTime = new Date(ref);
  sevenDaysAgoTime.setDate(sevenDaysAgoTime.getDate() - 6);
  sevenDaysAgoTime.setHours(0, 0, 0, 0);

  workouts.forEach(w => {
    const wDate = new Date(w.createdAt || w.startTime);
    if (wDate >= sevenDaysAgoTime && wDate <= ref) {
      totalWorkouts++;
      totalVolume += w.totalVolume || 0;

      const dateStr = wDate.toISOString().split('T')[0];
      const daySlot = past7Days.find(d => d.date === dateStr);
      if (daySlot) {
        daySlot.volume += w.totalVolume || 0;
        daySlot.workouts += 1;
      }
    }
  });

  return {
    totalWorkouts,
    totalVolume,
    weeklyActivity: past7Days,
  };
}

/**
 * Calculates muscle group training distribution across workouts.
 */
export function calculateMuscleDistribution(workouts: WorkoutSession[]): { muscle: MuscleGroup; sets: number; percentage: number }[] {
  const counts: Record<MuscleGroup, number> = {
    Chest: 0,
    Back: 0,
    Legs: 0,
    Shoulders: 0,
    Arms: 0,
    Core: 0,
  };

  let totalSets = 0;

  workouts.forEach(w => {
    w.exercises.forEach(ex => {
      const completedSets = ex.sets.filter(s => s.completed).length;
      if (counts[ex.muscleGroup] !== undefined) {
        counts[ex.muscleGroup] += completedSets;
        totalSets += completedSets;
      }
    });
  });

  const muscleList: MuscleGroup[] = ['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core'];

  return muscleList.map(muscle => {
    const sets = counts[muscle];
    const percentage = totalSets > 0 ? Math.round((sets / totalSets) * 100) : 0;
    return { muscle, sets, percentage };
  });
}

/**
 * Calculates Personal Records (PR) for each exercise found in history.
 */
export interface ExercisePR {
  exerciseName: string;
  muscleGroup: MuscleGroup;
  maxWeight: number;
  maxRepsAtMaxWeight: number;
  estimated1RM: number;
  maxSetVolume: number;
  date: string;
}

export function calculatePersonalRecords(workouts: WorkoutSession[]): Record<string, ExercisePR> {
  const records: Record<string, ExercisePR> = {};

  workouts.forEach(w => {
    const workoutDate = new Date(w.createdAt || w.startTime).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });

    w.exercises.forEach(ex => {
      ex.sets.forEach(set => {
        if (!set.completed || set.weight <= 0 || set.reps <= 0) return;

        const est1RM = calculateEstimated1RM(set.weight, set.reps);
        const setVol = set.weight * set.reps;

        if (!records[ex.exerciseName]) {
          records[ex.exerciseName] = {
            exerciseName: ex.exerciseName,
            muscleGroup: ex.muscleGroup,
            maxWeight: set.weight,
            maxRepsAtMaxWeight: set.reps,
            estimated1RM: est1RM,
            maxSetVolume: setVol,
            date: workoutDate,
          };
        } else {
          const current = records[ex.exerciseName];
          if (set.weight > current.maxWeight) {
            current.maxWeight = set.weight;
            current.maxRepsAtMaxWeight = set.reps;
            current.date = workoutDate;
          }
          if (est1RM > current.estimated1RM) {
            current.estimated1RM = est1RM;
          }
          if (setVol > current.maxSetVolume) {
            current.maxSetVolume = setVol;
          }
        }
      });
    });
  });

  return records;
}
