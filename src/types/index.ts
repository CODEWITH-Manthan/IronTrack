export type MuscleGroup = 'Chest' | 'Back' | 'Legs' | 'Shoulders' | 'Arms' | 'Core';

export type EquipmentType = 'Barbell' | 'Dumbbell' | 'Machine' | 'Cable' | 'Bodyweight' | 'Kettlebell' | 'Other';

export type DifficultyLevel = 'Beginner' | 'Intermediate' | 'Advanced';

export type WorkoutType = 'Push' | 'Pull' | 'Legs' | 'Upper Body' | 'Lower Body' | 'Full Body' | 'Custom';

export interface Exercise {
  id: string;
  userId?: string; // If custom to a user
  name: string;
  muscleGroup: MuscleGroup;
  equipment: EquipmentType;
  difficulty: DifficultyLevel;
  instructions: string;
  targetMuscles: string[];
  isCustom?: boolean;
}

export interface WorkoutSet {
  id: string;
  setNumber: number;
  weight: number;
  reps: number;
  completed: boolean;
  isWarmup?: boolean;
  rpe?: number;
}

export interface WorkoutExercise {
  id: string;
  exerciseId: string;
  exerciseName: string;
  muscleGroup: MuscleGroup;
  sets: WorkoutSet[];
  notes?: string;
}

export interface WorkoutSession {
  id: string;
  userId: string;
  name: string;
  type: WorkoutType;
  startTime: number;
  endTime?: number;
  durationSeconds: number;
  exercises: WorkoutExercise[];
  totalVolume: number;
  notes?: string;
  createdAt: string; // ISO date string
}

export interface AdvancedProfile {
  age: number;
  gender: 'Male' | 'Female' | 'Non-binary' | 'Prefer not to say';
  bodyWeight: number; // in user's unit
  height: number; // in cm
  unit: 'lbs' | 'kg';
  goal: 'Strength & Power' | 'Hypertrophy (Muscle Growth)' | 'Endurance & Conditioning' | 'Weight Loss & Tone';
  preferredSplit: 'Push / Pull / Legs' | 'Upper / Lower' | 'Full Body (3x/wk)' | 'Body Part Split (Bro Split)';
  experienceLevel: 'Beginner (< 1 yr)' | 'Intermediate (1-3 yrs)' | 'Advanced (3+ yrs)';
  weeklyTargetDays: number; // e.g. 4 or 5
  dailyCalorieTarget: number; // e.g. 2600
  dailyWaterMl: number; // e.g. 3500
}

export interface User {
  id: string;
  email: string;
  name: string;
  profile: AdvancedProfile;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface WorkoutTemplate {
  id: string;
  name: string;
  type: WorkoutType;
  description: string;
  exercises: string[]; // exercise IDs
  estimatedDurationMin: number;
}
