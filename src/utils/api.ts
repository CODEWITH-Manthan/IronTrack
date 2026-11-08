import { User, WorkoutSession, Exercise, AdvancedProfile, AuthResponse } from '../types';

const TOKEN_KEY = 'irontrack_jwt_token';

export function getStoredToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setStoredToken(token: string | null) {
  try {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  } catch (e) {
    console.error('Failed to update stored token', e);
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const res = await fetch(endpoint, {
    ...options,
    headers,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const errorMsg = data?.error || `Request failed with status ${res.status}`;
    throw new Error(errorMsg);
  }

  return data as T;
}

export const api = {
  // Auth
  async register(payload: { email: string; password: string; name: string; profile?: Partial<AdvancedProfile> }): Promise<AuthResponse> {
    const res = await request<AuthResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    setStoredToken(res.token);
    return res;
  },

  async login(payload: { email: string; password: string }): Promise<AuthResponse> {
    const res = await request<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    setStoredToken(res.token);
    return res;
  },

  async getMe(): Promise<{ user: User }> {
    return request<{ user: User }>('/api/auth/me');
  },

  async updateProfile(payload: { profile: Partial<AdvancedProfile>; name?: string }): Promise<{ user: User }> {
    return request<{ user: User }>('/api/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  logout() {
    setStoredToken(null);
  },

  // Workouts
  async getWorkouts(): Promise<{ workouts: WorkoutSession[] }> {
    return request<{ workouts: WorkoutSession[] }>('/api/workouts');
  },

  async createWorkout(workout: Omit<WorkoutSession, 'id' | 'userId'>): Promise<{ workout: WorkoutSession }> {
    return request<{ workout: WorkoutSession }>('/api/workouts', {
      method: 'POST',
      body: JSON.stringify(workout),
    });
  },

  async deleteWorkout(id: string): Promise<{ success: boolean }> {
    return request<{ success: boolean }>(`/api/workouts/${id}`, {
      method: 'DELETE',
    });
  },

  // Exercises
  async getExercises(): Promise<{ exercises: Exercise[] }> {
    return request<{ exercises: Exercise[] }>('/api/exercises');
  },

  async createExercise(exercise: Omit<Exercise, 'id' | 'userId' | 'isCustom'>): Promise<{ exercise: Exercise }> {
    return request<{ exercise: Exercise }>('/api/exercises', {
      method: 'POST',
      body: JSON.stringify(exercise),
    });
  },

  async updateExercise(id: string, updates: Partial<Exercise>): Promise<{ exercise: Exercise }> {
    return request<{ exercise: Exercise }>(`/api/exercises/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  async deleteExercise(id: string): Promise<{ success: boolean }> {
    return request<{ success: boolean }>(`/api/exercises/${id}`, {
      method: 'DELETE',
    });
  },
};
