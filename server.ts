import express, { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import path from 'path';
import { fileURLToPath } from 'url';
import { 
  findUserByEmail, 
  findUserById, 
  createUser, 
  updateUserProfile, 
  getWorkoutsByUserId, 
  createWorkout, 
  deleteWorkout, 
  getExercises, 
  createCustomExercise, 
  updateCustomExercise, 
  deleteCustomExercise, 
  sanitizeUser,
  initDb
} from './src/server/db';
import { AdvancedProfile } from './src/types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JWT_SECRET = process.env.JWT_SECRET || 'irontrack_secure_jwt_token_secret_fitness_2026';
const PORT = parseInt(process.env.PORT || '3000', 10);
const isProd = process.env.NODE_ENV === 'production';

interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
  };
}

async function startServer() {
  await initDb();
  const app = express();
  app.use(express.json());

  // JWT Middleware
  const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Authentication required. No token provided.' });
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string };
      req.user = decoded;
      next();
    } catch {
      return res.status(403).json({ error: 'Invalid or expired token.' });
    }
  };

  // ---------------- AUTH ROUTES ----------------
  // Register
  app.post('/api/auth/register', async (req: Request, res: Response) => {
    try {
      const { email, password, name, profile } = req.body;

      if (!email || !password || !name) {
        return res.status(400).json({ error: 'Name, email, and password are required.' });
      }
      if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
      }

      const existing = await findUserByEmail(email);
      if (existing) {
        return res.status(409).json({ error: 'An account with this email already exists.' });
      }

      const passwordHash = await bcrypt.hash(password, 10);

      const defaultProfile: AdvancedProfile = {
        age: profile?.age || 26,
        gender: profile?.gender || 'Prefer not to say',
        bodyWeight: profile?.bodyWeight || 170,
        height: profile?.height || 175,
        unit: profile?.unit || 'lbs',
        goal: profile?.goal || 'Hypertrophy (Muscle Growth)',
        preferredSplit: profile?.preferredSplit || 'Push / Pull / Legs',
        experienceLevel: profile?.experienceLevel || 'Intermediate (1-3 yrs)',
        weeklyTargetDays: profile?.weeklyTargetDays || 4,
        dailyCalorieTarget: profile?.dailyCalorieTarget || 2500,
        dailyWaterMl: profile?.dailyWaterMl || 3000,
      };

      const newUser = await createUser({
        email,
        name,
        passwordHash,
        profile: defaultProfile,
      });

      const token = jwt.sign(
        { userId: newUser.id, email: newUser.email },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.status(201).json({
        token,
        user: sanitizeUser(newUser),
      });
    } catch (err) {
      console.error('Registration error:', err);
      res.status(500).json({ error: 'Internal server error during registration.' });
    }
  });

  // Login
  app.post('/api/auth/login', async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required.' });
      }

      const user = await findUserByEmail(email);
      if (!user) {
        return res.status(401).json({ error: 'Invalid email or password.' });
      }

      const isValidPassword = await bcrypt.compare(password, user.passwordHash);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid email or password.' });
      }

      const token = jwt.sign(
        { userId: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.json({
        token,
        user: sanitizeUser(user),
      });
    } catch (err) {
      console.error('Login error:', err);
      res.status(500).json({ error: 'Internal server error during login.' });
    }
  });

  // Get Current User (Me)
  app.get('/api/auth/me', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const user = await findUserById(req.user!.userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found.' });
      }
      res.json({ user: sanitizeUser(user) });
    } catch (err) {
      console.error('Me error:', err);
      res.status(500).json({ error: 'Internal server error.' });
    }
  });

  // Update Profile
  app.put('/api/auth/profile', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const { profile, name } = req.body;
      const updatedUser = await updateUserProfile(req.user!.userId, profile || {}, name);
      if (!updatedUser) {
        return res.status(404).json({ error: 'User not found.' });
      }
      res.json({ user: sanitizeUser(updatedUser) });
    } catch (err) {
      console.error('Update profile error:', err);
      res.status(500).json({ error: 'Failed to update profile.' });
    }
  });

  // ---------------- WORKOUT ROUTES ----------------
  app.get('/api/workouts', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const userWorkouts = await getWorkoutsByUserId(req.user!.userId);
      res.json({ workouts: userWorkouts });
    } catch (err) {
      console.error('Get workouts error:', err);
      res.status(500).json({ error: 'Failed to fetch workouts.' });
    }
  });

  app.post('/api/workouts', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const workoutData = req.body;
      if (!workoutData.name || !workoutData.type) {
        return res.status(400).json({ error: 'Workout name and type are required.' });
      }

      const savedWorkout = await createWorkout(req.user!.userId, workoutData);
      res.status(201).json({ workout: savedWorkout });
    } catch (err) {
      console.error('Create workout error:', err);
      res.status(500).json({ error: 'Failed to save workout session.' });
    }
  });

  app.delete('/api/workouts/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const success = await deleteWorkout(req.user!.userId, id);
      if (!success) {
        return res.status(404).json({ error: 'Workout not found or access denied.' });
      }
      res.json({ success: true });
    } catch (err) {
      console.error('Delete workout error:', err);
      res.status(500).json({ error: 'Failed to delete workout.' });
    }
  });

  // ---------------- EXERCISE ROUTES ----------------
  app.get('/api/exercises', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const exercisesList = await getExercises(req.user!.userId);
      res.json({ exercises: exercisesList });
    } catch (err) {
      console.error('Get exercises error:', err);
      res.status(500).json({ error: 'Failed to fetch exercises.' });
    }
  });

  app.post('/api/exercises', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const exerciseData = req.body;
      if (!exerciseData.name || !exerciseData.muscleGroup) {
        return res.status(400).json({ error: 'Exercise name and muscle group are required.' });
      }

      const newEx = await createCustomExercise(req.user!.userId, exerciseData);
      res.status(201).json({ exercise: newEx });
    } catch (err) {
      console.error('Create exercise error:', err);
      res.status(500).json({ error: 'Failed to create exercise.' });
    }
  });

  app.put('/api/exercises/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const updated = await updateCustomExercise(req.user!.userId, id, req.body);
      if (!updated) {
        return res.status(404).json({ error: 'Exercise not found or cannot be modified.' });
      }
      res.json({ exercise: updated });
    } catch (err) {
      console.error('Update exercise error:', err);
      res.status(500).json({ error: 'Failed to update exercise.' });
    }
  });

  app.delete('/api/exercises/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const success = await deleteCustomExercise(req.user!.userId, id);
      if (!success) {
        return res.status(404).json({ error: 'Exercise not found or cannot be deleted.' });
      }
      res.json({ success: true });
    } catch (err) {
      console.error('Delete exercise error:', err);
      res.status(500).json({ error: 'Failed to delete exercise.' });
    }
  });

  // ---------------- VITE MIDDLEWARE / STATIC FILES ----------------
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`IronTrack Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
