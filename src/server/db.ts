import fs from 'fs/promises';
import path from 'path';
import { User, WorkoutSession, Exercise, AdvancedProfile } from '../types';
import { INITIAL_EXERCISES } from '../data/initialData';

export interface DbUser extends User {
  passwordHash: string;
}

export interface DatabaseSchema {
  users: DbUser[];
  workouts: WorkoutSession[];
  exercises: Exercise[];
}

const DATA_DIR = path.resolve(process.cwd(), '.data');
const DB_FILE = path.resolve(DATA_DIR, 'irontrack_db.json');
const TMP_FILE = path.resolve(DATA_DIR, 'irontrack_db.json.tmp');

let memoryDb: DatabaseSchema | null = null;
let writeQueue: Promise<void> = Promise.resolve();

export async function initDb(): Promise<DatabaseSchema> {
  if (memoryDb) return memoryDb;

  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    const content = await fs.readFile(DB_FILE, 'utf-8');
    memoryDb = JSON.parse(content);
    return memoryDb!;
  } catch {
    // Fresh new database with NO demo users and NO demo workouts!
    memoryDb = {
      users: [],
      workouts: [],
      exercises: INITIAL_EXERCISES.map(e => ({ ...e, isCustom: false })),
    };
    await persistDb();
    return memoryDb;
  }
}

async function persistDb(): Promise<void> {
  if (!memoryDb) return;
  const snapshot = JSON.stringify(memoryDb, null, 2);

  // Queue writes sequentially to prevent file race conditions
  writeQueue = writeQueue.then(async () => {
    try {
      await fs.writeFile(TMP_FILE, snapshot, 'utf-8');
      await fs.rename(TMP_FILE, DB_FILE);
    } catch (err) {
      console.error('Failed to persist database:', err);
    }
  });
  return writeQueue;
}

// ----------------- USERS -----------------
export async function findUserByEmail(email: string): Promise<DbUser | undefined> {
  const db = await initDb();
  return db.users.find(u => u.email.toLowerCase() === email.toLowerCase().trim());
}

export async function findUserById(id: string): Promise<DbUser | undefined> {
  const db = await initDb();
  return db.users.find(u => u.id === id);
}

export async function createUser(userData: {
  email: string;
  name: string;
  passwordHash: string;
  profile: AdvancedProfile;
}): Promise<DbUser> {
  const db = await initDb();
  const newUser: DbUser = {
    id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    email: userData.email.toLowerCase().trim(),
    name: userData.name.trim(),
    passwordHash: userData.passwordHash,
    profile: userData.profile,
    createdAt: new Date().toISOString(),
  };

  db.users.push(newUser);
  await persistDb();
  return newUser;
}

export async function updateUserProfile(
  userId: string,
  profileUpdates: Partial<AdvancedProfile>,
  name?: string
): Promise<DbUser | null> {
  const db = await initDb();
  const user = db.users.find(u => u.id === userId);
  if (!user) return null;

  if (name) user.name = name.trim();
  user.profile = { ...user.profile, ...profileUpdates };
  await persistDb();
  return user;
}

// ----------------- WORKOUTS -----------------
export async function getWorkoutsByUserId(userId: string): Promise<WorkoutSession[]> {
  const db = await initDb();
  return db.workouts
    .filter(w => w.userId === userId)
    .sort((a, b) => new Date(b.createdAt || b.startTime).getTime() - new Date(a.createdAt || a.startTime).getTime());
}

export async function createWorkout(userId: string, workoutData: Omit<WorkoutSession, 'id' | 'userId'>): Promise<WorkoutSession> {
  const db = await initDb();
  const newWorkout: WorkoutSession = {
    ...workoutData,
    id: `wkt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    userId,
    createdAt: workoutData.createdAt || new Date().toISOString(),
  };

  db.workouts.unshift(newWorkout);
  await persistDb();
  return newWorkout;
}

export async function deleteWorkout(userId: string, workoutId: string): Promise<boolean> {
  const db = await initDb();
  const initialLen = db.workouts.length;
  db.workouts = db.workouts.filter(w => !(w.id === workoutId && w.userId === userId));
  const changed = db.workouts.length !== initialLen;
  if (changed) {
    await persistDb();
  }
  return changed;
}

// ----------------- EXERCISES -----------------
export async function getExercises(userId?: string): Promise<Exercise[]> {
  const db = await initDb();
  // Return global exercises + any custom ones created by this user
  return db.exercises.filter(e => !e.userId || (userId && e.userId === userId));
}

export async function createCustomExercise(userId: string, exerciseData: Omit<Exercise, 'id' | 'userId' | 'isCustom'>): Promise<Exercise> {
  const db = await initDb();
  const newExercise: Exercise = {
    ...exerciseData,
    id: `ex_custom_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    userId,
    isCustom: true,
  };

  db.exercises.unshift(newExercise);
  await persistDb();
  return newExercise;
}

export async function updateCustomExercise(
  userId: string,
  exerciseId: string,
  updates: Partial<Exercise>
): Promise<Exercise | null> {
  const db = await initDb();
  const index = db.exercises.findIndex(e => e.id === exerciseId && e.userId === userId);
  if (index === -1) return null;

  db.exercises[index] = { ...db.exercises[index], ...updates };
  await persistDb();
  return db.exercises[index];
}

export async function deleteCustomExercise(userId: string, exerciseId: string): Promise<boolean> {
  const db = await initDb();
  const initialLen = db.exercises.length;
  db.exercises = db.exercises.filter(e => !(e.id === exerciseId && e.userId === userId));
  const changed = db.exercises.length !== initialLen;
  if (changed) {
    await persistDb();
  }
  return changed;
}

export function sanitizeUser(user: DbUser): User {
  const { passwordHash, ...safeUser } = user;
  return safeUser;
}
