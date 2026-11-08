import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { 
  Exercise, 
  WorkoutSession, 
  WorkoutExercise, 
  WorkoutSet, 
  WorkoutTemplate, 
  WorkoutType,
  AdvancedProfile
} from '../types';
import { 
  INITIAL_EXERCISES, 
  INITIAL_TEMPLATES,
  DEFAULT_ADVANCED_PROFILE
} from '../data/initialData';
import { calculateWorkoutVolume } from '../utils/calculations';
import { playRestTimerCompleteSound } from '../utils/audio';
import { useAuth } from './AuthContext';
import { api } from '../utils/api';

interface ActiveWorkoutState {
  session: WorkoutSession | null;
  elapsedSeconds: number;
  isPaused: boolean;
  restTimerSeconds: number;
  initialRestDuration: number;
  isRestTimerActive: boolean;
}

interface WorkoutContextType {
  exercises: Exercise[];
  workouts: WorkoutSession[];
  userProfile: AdvancedProfile;
  templates: WorkoutTemplate[];
  activeWorkout: ActiveWorkoutState;
  completedWorkoutModal: WorkoutSession | null;
  isLoadingData: boolean;
  closeCompletedModal: () => void;
  // Actions
  startWorkout: (templateId?: string, workoutType?: WorkoutType, customName?: string) => void;
  addExerciseToActiveWorkout: (exerciseId: string) => void;
  removeExerciseFromActiveWorkout: (workoutExerciseId: string) => void;
  updateWorkoutSet: (workoutExerciseId: string, setId: string, updates: Partial<WorkoutSet>) => void;
  addSetToExercise: (workoutExerciseId: string) => void;
  removeSetFromExercise: (workoutExerciseId: string, setId: string) => void;
  togglePauseWorkout: () => void;
  finishActiveWorkout: (notes?: string) => Promise<WorkoutSession | null>;
  cancelActiveWorkout: () => void;
  // Rest timer
  startRestTimer: (seconds?: number) => void;
  stopRestTimer: () => void;
  addRestTime: (seconds: number) => void;
  // Exercise library
  addCustomExercise: (newEx: Omit<Exercise, 'id' | 'userId' | 'isCustom'>) => Promise<Exercise>;
  updateExercise: (id: string, updates: Partial<Exercise>) => Promise<void>;
  deleteExercise: (id: string) => Promise<void>;
  // Workout history
  deleteWorkout: (id: string) => Promise<void>;
  refreshData: () => Promise<void>;
}

const STORAGE_KEYS = {
  ACTIVE_WORKOUT: 'irontrack_active_session_v2',
};

const WorkoutContext = createContext<WorkoutContextType | undefined>(undefined);

export const WorkoutProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  const [exercises, setExercises] = useState<Exercise[]>(INITIAL_EXERCISES);
  const [workouts, setWorkouts] = useState<WorkoutSession[]>([]);
  const [templates] = useState<WorkoutTemplate[]>(INITIAL_TEMPLATES);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(false);

  // Active Workout State
  const [activeWorkout, setActiveWorkout] = useState<ActiveWorkoutState>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.ACTIVE_WORKOUT);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          session: parsed.session || null,
          elapsedSeconds: parsed.elapsedSeconds || 0,
          isPaused: parsed.isPaused || false,
          restTimerSeconds: 0,
          initialRestDuration: 90,
          isRestTimerActive: false,
        };
      }
    } catch {
      // fallback
    }
    return {
      session: null,
      elapsedSeconds: 0,
      isPaused: false,
      restTimerSeconds: 0,
      initialRestDuration: 90,
      isRestTimerActive: false,
    };
  });

  const [completedWorkoutModal, setCompletedWorkoutModal] = useState<WorkoutSession | null>(null);

  // Load database workouts & exercises whenever user logs in
  const refreshData = async () => {
    if (!user) {
      setWorkouts([]);
      return;
    }

    setIsLoadingData(true);
    try {
      const [workoutsRes, exercisesRes] = await Promise.all([
        api.getWorkouts(),
        api.getExercises(),
      ]);
      setWorkouts(workoutsRes.workouts || []);
      if (exercisesRes.exercises && exercisesRes.exercises.length > 0) {
        setExercises(exercisesRes.exercises);
      }
    } catch (err) {
      console.error('Failed to load user data from database:', err);
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, [user?.id]);

  // Sync active draft to LocalStorage
  useEffect(() => {
    try {
      if (activeWorkout.session) {
        localStorage.setItem(
          STORAGE_KEYS.ACTIVE_WORKOUT,
          JSON.stringify({
            session: activeWorkout.session,
            elapsedSeconds: activeWorkout.elapsedSeconds,
            isPaused: activeWorkout.isPaused,
          })
        );
      } else {
        localStorage.removeItem(STORAGE_KEYS.ACTIVE_WORKOUT);
      }
    } catch (e) {
      console.error('Failed to sync active session', e);
    }
  }, [activeWorkout.session, activeWorkout.elapsedSeconds, activeWorkout.isPaused]);

  // Workout duration clock
  useEffect(() => {
    if (!activeWorkout.session || activeWorkout.isPaused) return;

    const interval = setInterval(() => {
      setActiveWorkout(prev => ({
        ...prev,
        elapsedSeconds: prev.elapsedSeconds + 1,
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, [activeWorkout.session, activeWorkout.isPaused]);

  // Rest Timer countdown
  const restTimerBeepRef = useRef(false);
  useEffect(() => {
    if (!activeWorkout.isRestTimerActive || activeWorkout.restTimerSeconds <= 0) return;

    const restInterval = setInterval(() => {
      setActiveWorkout(prev => {
        if (prev.restTimerSeconds <= 1) {
          if (!restTimerBeepRef.current) {
            restTimerBeepRef.current = true;
            playRestTimerCompleteSound();
          }
          return {
            ...prev,
            restTimerSeconds: 0,
            isRestTimerActive: false,
          };
        }
        return {
          ...prev,
          restTimerSeconds: prev.restTimerSeconds - 1,
        };
      });
    }, 1000);

    return () => clearInterval(restInterval);
  }, [activeWorkout.isRestTimerActive, activeWorkout.restTimerSeconds]);

  const startRestTimer = (seconds: number = 90) => {
    restTimerBeepRef.current = false;
    setActiveWorkout(prev => ({
      ...prev,
      restTimerSeconds: seconds,
      initialRestDuration: seconds,
      isRestTimerActive: true,
    }));
  };

  const stopRestTimer = () => {
    setActiveWorkout(prev => ({
      ...prev,
      restTimerSeconds: 0,
      isRestTimerActive: false,
    }));
  };

  const addRestTime = (seconds: number) => {
    setActiveWorkout(prev => ({
      ...prev,
      restTimerSeconds: Math.max(0, prev.restTimerSeconds + seconds),
      initialRestDuration: Math.max(prev.initialRestDuration, prev.restTimerSeconds + seconds),
      isRestTimerActive: true,
    }));
  };

  // Start Workout
  const startWorkout = (templateId?: string, workoutType?: WorkoutType, customName?: string) => {
    let type: WorkoutType = workoutType || 'Push';
    let name = customName || `${type} Session`;
    let initialExercises: WorkoutExercise[] = [];

    if (templateId) {
      const template = templates.find(t => t.id === templateId);
      if (template) {
        type = template.type;
        name = template.name;
        initialExercises = template.exercises
          .map(exId => exercises.find(e => e.id === exId))
          .filter((e): e is Exercise => !!e)
          .map(ex => ({
            id: `we-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            exerciseId: ex.id,
            exerciseName: ex.name,
            muscleGroup: ex.muscleGroup,
            sets: [
              { id: `s-${Math.random().toString(36).substring(2, 7)}`, setNumber: 1, weight: 135, reps: 10, completed: false },
              { id: `s-${Math.random().toString(36).substring(2, 7)}`, setNumber: 2, weight: 135, reps: 10, completed: false },
              { id: `s-${Math.random().toString(36).substring(2, 7)}`, setNumber: 3, weight: 135, reps: 10, completed: false },
            ],
          }));
      }
    }

    if (initialExercises.length === 0) {
      const match = exercises.filter(e => {
        if (type === 'Push') return e.muscleGroup === 'Chest' || e.muscleGroup === 'Shoulders';
        if (type === 'Pull') return e.muscleGroup === 'Back' || e.muscleGroup === 'Arms';
        if (type === 'Legs') return e.muscleGroup === 'Legs';
        if (type === 'Upper Body') return e.muscleGroup === 'Chest' || e.muscleGroup === 'Back';
        if (type === 'Lower Body') return e.muscleGroup === 'Legs' || e.muscleGroup === 'Core';
        return true;
      });

      const chosen = match.slice(0, 3);
      initialExercises = chosen.map(ex => ({
        id: `we-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        exerciseId: ex.id,
        exerciseName: ex.name,
        muscleGroup: ex.muscleGroup,
        sets: [
          { id: `s-${Math.random().toString(36).substring(2, 7)}`, setNumber: 1, weight: 135, reps: 10, completed: false },
          { id: `s-${Math.random().toString(36).substring(2, 7)}`, setNumber: 2, weight: 135, reps: 10, completed: false },
          { id: `s-${Math.random().toString(36).substring(2, 7)}`, setNumber: 3, weight: 135, reps: 10, completed: false },
        ],
      }));
    }

    const newSession: WorkoutSession = {
      id: `draft-${Date.now()}`,
      userId: user?.id || 'guest',
      name,
      type,
      startTime: Date.now(),
      durationSeconds: 0,
      exercises: initialExercises,
      totalVolume: 0,
      createdAt: new Date().toISOString(),
    };

    setActiveWorkout({
      session: newSession,
      elapsedSeconds: 0,
      isPaused: false,
      restTimerSeconds: 0,
      initialRestDuration: 90,
      isRestTimerActive: false,
    });
  };

  const addExerciseToActiveWorkout = (exerciseId: string) => {
    const exercise = exercises.find(e => e.id === exerciseId);
    if (!exercise || !activeWorkout.session) return;

    let lastWeight = 100;
    for (const w of workouts) {
      const ex = w.exercises.find(e => e.exerciseId === exerciseId);
      if (ex && ex.sets.length > 0) {
        const comp = ex.sets.filter(s => s.completed);
        if (comp.length > 0) {
          lastWeight = comp[comp.length - 1].weight;
          break;
        }
      }
    }

    const newWorkoutExercise: WorkoutExercise = {
      id: `we-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      muscleGroup: exercise.muscleGroup,
      sets: [
        { id: `s-${Math.random().toString(36).substring(2, 7)}`, setNumber: 1, weight: lastWeight, reps: 10, completed: false },
        { id: `s-${Math.random().toString(36).substring(2, 7)}`, setNumber: 2, weight: lastWeight, reps: 10, completed: false },
        { id: `s-${Math.random().toString(36).substring(2, 7)}`, setNumber: 3, weight: lastWeight, reps: 10, completed: false },
      ],
    };

    setActiveWorkout(prev => {
      if (!prev.session) return prev;
      const updatedExercises = [...prev.session.exercises, newWorkoutExercise];
      return {
        ...prev,
        session: {
          ...prev.session,
          exercises: updatedExercises,
          totalVolume: calculateWorkoutVolume(updatedExercises),
        },
      };
    });
  };

  const removeExerciseFromActiveWorkout = (workoutExerciseId: string) => {
    setActiveWorkout(prev => {
      if (!prev.session) return prev;
      const updatedExercises = prev.session.exercises.filter(e => e.id !== workoutExerciseId);
      return {
        ...prev,
        session: {
          ...prev.session,
          exercises: updatedExercises,
          totalVolume: calculateWorkoutVolume(updatedExercises),
        },
      };
    });
  };

  const updateWorkoutSet = (workoutExerciseId: string, setId: string, updates: Partial<WorkoutSet>) => {
    setActiveWorkout(prev => {
      if (!prev.session) return prev;
      let shouldStartRest = false;

      const updatedExercises = prev.session.exercises.map(ex => {
        if (ex.id !== workoutExerciseId) return ex;
        return {
          ...ex,
          sets: ex.sets.map(s => {
            if (s.id !== setId) return s;
            const updated = { ...s, ...updates };
            if (!s.completed && updated.completed) {
              shouldStartRest = true;
            }
            return updated;
          }),
        };
      });

      if (shouldStartRest) {
        startRestTimer(90);
      }

      return {
        ...prev,
        session: {
          ...prev.session,
          exercises: updatedExercises,
          totalVolume: calculateWorkoutVolume(updatedExercises),
        },
      };
    });
  };

  const addSetToExercise = (workoutExerciseId: string) => {
    setActiveWorkout(prev => {
      if (!prev.session) return prev;
      const updatedExercises = prev.session.exercises.map(ex => {
        if (ex.id !== workoutExerciseId) return ex;
        const lastSet = ex.sets[ex.sets.length - 1];
        const newSet: WorkoutSet = {
          id: `s-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          setNumber: ex.sets.length + 1,
          weight: lastSet ? lastSet.weight : 100,
          reps: lastSet ? lastSet.reps : 10,
          completed: false,
        };
        return {
          ...ex,
          sets: [...ex.sets, newSet],
        };
      });

      return {
        ...prev,
        session: {
          ...prev.session,
          exercises: updatedExercises,
          totalVolume: calculateWorkoutVolume(updatedExercises),
        },
      };
    });
  };

  const removeSetFromExercise = (workoutExerciseId: string, setId: string) => {
    setActiveWorkout(prev => {
      if (!prev.session) return prev;
      const updatedExercises = prev.session.exercises.map(ex => {
        if (ex.id !== workoutExerciseId) return ex;
        const filtered = ex.sets.filter(s => s.id !== setId);
        const renumbered = filtered.map((s, index) => ({
          ...s,
          setNumber: index + 1,
        }));
        return {
          ...ex,
          sets: renumbered,
        };
      });

      return {
        ...prev,
        session: {
          ...prev.session,
          exercises: updatedExercises,
          totalVolume: calculateWorkoutVolume(updatedExercises),
        },
      };
    });
  };

  const togglePauseWorkout = () => {
    setActiveWorkout(prev => ({
      ...prev,
      isPaused: !prev.isPaused,
    }));
  };

  // Finish Active Workout and persist to database
  const finishActiveWorkout = async (notes?: string): Promise<WorkoutSession | null> => {
    if (!activeWorkout.session) return null;

    const completedTime = Date.now();
    const duration = activeWorkout.elapsedSeconds || 60;
    const finalVolume = calculateWorkoutVolume(activeWorkout.session.exercises);

    const workoutPayload = {
      name: activeWorkout.session.name,
      type: activeWorkout.session.type,
      startTime: activeWorkout.session.startTime,
      endTime: completedTime,
      durationSeconds: duration,
      exercises: activeWorkout.session.exercises,
      totalVolume: finalVolume,
      notes: notes || activeWorkout.session.notes || '',
      createdAt: new Date().toISOString(),
    };

    let savedSession: WorkoutSession;

    try {
      const res = await api.createWorkout(workoutPayload);
      savedSession = res.workout;
    } catch (err) {
      console.warn('Backend save error, creating locally:', err);
      savedSession = {
        ...workoutPayload,
        id: `wkt_${Date.now()}`,
        userId: user?.id || 'local',
      };
    }

    setWorkouts(prev => [savedSession, ...prev]);

    // Clear active session
    setActiveWorkout({
      session: null,
      elapsedSeconds: 0,
      isPaused: false,
      restTimerSeconds: 0,
      initialRestDuration: 90,
      isRestTimerActive: false,
    });
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_WORKOUT);

    // Trigger celebration modal
    setCompletedWorkoutModal(savedSession);
    return savedSession;
  };

  const cancelActiveWorkout = () => {
    setActiveWorkout({
      session: null,
      elapsedSeconds: 0,
      isPaused: false,
      restTimerSeconds: 0,
      initialRestDuration: 90,
      isRestTimerActive: false,
    });
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_WORKOUT);
  };

  const closeCompletedModal = () => {
    setCompletedWorkoutModal(null);
  };

  // Exercise Library CRUD with database sync
  const addCustomExercise = async (newEx: Omit<Exercise, 'id' | 'userId' | 'isCustom'>): Promise<Exercise> => {
    try {
      const res = await api.createExercise(newEx);
      setExercises(prev => [res.exercise, ...prev]);
      return res.exercise;
    } catch {
      const fallback: Exercise = {
        ...newEx,
        id: `custom-${Date.now()}`,
        isCustom: true,
      };
      setExercises(prev => [fallback, ...prev]);
      return fallback;
    }
  };

  const updateExercise = async (id: string, updates: Partial<Exercise>) => {
    try {
      const res = await api.updateExercise(id, updates);
      setExercises(prev => prev.map(e => (e.id === id ? res.exercise : e)));
    } catch {
      setExercises(prev => prev.map(e => (e.id === id ? { ...e, ...updates } : e)));
    }
  };

  const deleteExercise = async (id: string) => {
    try {
      await api.deleteExercise(id);
    } catch {
      // fallback
    }
    setExercises(prev => prev.filter(e => e.id !== id));
  };

  // Delete Workout from database
  const deleteWorkout = async (id: string) => {
    try {
      await api.deleteWorkout(id);
    } catch {
      // fallback
    }
    setWorkouts(prev => prev.filter(w => w.id !== id));
  };

  return (
    <WorkoutContext.Provider
      value={{
        exercises,
        workouts,
        userProfile: user?.profile || DEFAULT_ADVANCED_PROFILE,
        templates,
        activeWorkout,
        completedWorkoutModal,
        isLoadingData,
        closeCompletedModal,
        startWorkout,
        addExerciseToActiveWorkout,
        removeExerciseFromActiveWorkout,
        updateWorkoutSet,
        addSetToExercise,
        removeSetFromExercise,
        togglePauseWorkout,
        finishActiveWorkout,
        cancelActiveWorkout,
        startRestTimer,
        stopRestTimer,
        addRestTime,
        addCustomExercise,
        updateExercise,
        deleteExercise,
        deleteWorkout,
        refreshData,
      }}
    >
      {children}
    </WorkoutContext.Provider>
  );
};

export function useWorkout() {
  const context = useContext(WorkoutContext);
  if (!context) {
    throw new Error('useWorkout must be used within a WorkoutProvider');
  }
  return context;
}
