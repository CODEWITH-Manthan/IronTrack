import React, { useState } from 'react';
import { 
  Dumbbell, 
  Lock, 
  Mail, 
  User, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2, 
  Scale, 
  Target, 
  Calendar, 
  Zap,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { AdvancedProfile } from '../types';

export const AuthPage: React.FC = () => {
  const { login, register } = useAuth();

  const [mode, setMode] = useState<'signin' | 'register'>('signin');
  const [registerStep, setRegisterStep] = useState<1 | 2>(1);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Advanced Profile Setup State
  const [age, setAge] = useState<number>(25);
  const [gender, setGender] = useState<AdvancedProfile['gender']>('Prefer not to say');
  const [bodyWeight, setBodyWeight] = useState<number>(170);
  const [height, setHeight] = useState<number>(178);
  const [unit, setUnit] = useState<'lbs' | 'kg'>('lbs');
  const [goal, setGoal] = useState<AdvancedProfile['goal']>('Hypertrophy (Muscle Growth)');
  const [preferredSplit, setPreferredSplit] = useState<AdvancedProfile['preferredSplit']>('Push / Pull / Legs');
  const [experienceLevel, setExperienceLevel] = useState<AdvancedProfile['experienceLevel']>('Intermediate (1-3 yrs)');
  const [weeklyTargetDays, setWeeklyTargetDays] = useState<number>(4);
  const [dailyCalorieTarget, setDailyCalorieTarget] = useState<number>(2600);
  const [dailyWaterMl, setDailyWaterMl] = useState<number>(3000);

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Please provide both email and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      await login(email.trim(), password);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Invalid credentials. Please verify your email and password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Please provide a valid email address.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    // Proceed to Step 2: Advanced Profile
    setRegisterStep(2);
  };

  const handleRegisterComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    setIsSubmitting(true);
    try {
      await register({
        name: name.trim(),
        email: email.trim(),
        password,
        profile: {
          age,
          gender,
          bodyWeight,
          height,
          unit,
          goal,
          preferredSplit,
          experienceLevel,
          weeklyTargetDays,
          dailyCalorieTarget,
          dailyWaterMl,
        },
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create account.');
      setRegisterStep(1);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090909] text-white flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden">
      {/* Background radial accent */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#FF6B00]/5 rounded-full blur-[140px] pointer-events-none" />

      {/* Brand Header */}
      <div className="text-center mb-8 relative z-10">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[#FF6B00] to-[#FF8C32] shadow-xl shadow-[#FF6B00]/25 mb-3.5">
          <Dumbbell className="w-7 h-7 text-black stroke-[2.5]" />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center justify-center gap-1.5">
          IRON<span className="text-[#FF6B00]">TRACK</span>
        </h1>
        <p className="text-xs font-semibold uppercase tracking-widest text-[#999999] mt-1">
          Modern Strength & Progressive Overload Engine
        </p>
      </div>

      {/* Main Auth Card */}
      <div className="w-full max-w-md bg-[#141414] border border-[#262626] rounded-2xl p-6 sm:p-8 shadow-2xl relative z-10">
        {/* Mode Toggle Tabs */}
        <div className="flex p-1 bg-[#1B1B1B] rounded-xl border border-[#262626] mb-6">
          <button
            type="button"
            onClick={() => {
              setMode('signin');
              setError('');
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              mode === 'signin'
                ? 'bg-[#FF6B00] text-black shadow-md shadow-[#FF6B00]/20'
                : 'text-[#999999] hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setRegisterStep(1);
              setError('');
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              mode === 'register'
                ? 'bg-[#FF6B00] text-black shadow-md shadow-[#FF6B00]/20'
                : 'text-[#999999] hover:text-white'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-5 p-3 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-2.5 text-xs text-red-400">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* 1. SIGN IN FORM */}
        {mode === 'signin' && (
          <form onSubmit={handleSignIn} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#CCCCCC] uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#777777]" />
                <input
                  type="email"
                  placeholder="athlete@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#1B1B1B] border border-[#262626] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-[#555555] focus:outline-none focus:border-[#FF6B00] transition-colors"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#CCCCCC] uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#777777]" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#1B1B1B] border border-[#262626] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-[#555555] focus:outline-none focus:border-[#FF6B00] transition-colors"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 bg-[#FF6B00] hover:bg-[#FF8C32] disabled:opacity-50 text-black font-extrabold text-sm rounded-xl transition-all shadow-lg shadow-[#FF6B00]/25 mt-2 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <span>Signing In...</span>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* 2. REGISTRATION FLOW */}
        {mode === 'register' && registerStep === 1 && (
          <form onSubmit={handleRegisterStep1} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#CCCCCC] uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#777777]" />
                <input
                  type="text"
                  placeholder="e.g. Jordan Hayes"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#1B1B1B] border border-[#262626] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-[#555555] focus:outline-none focus:border-[#FF6B00] transition-colors"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#CCCCCC] uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#777777]" />
                <input
                  type="email"
                  placeholder="jordan@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#1B1B1B] border border-[#262626] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-[#555555] focus:outline-none focus:border-[#FF6B00] transition-colors"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#CCCCCC] uppercase tracking-wider mb-1.5">
                Password (min 6 characters)
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#777777]" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#1B1B1B] border border-[#262626] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-[#555555] focus:outline-none focus:border-[#FF6B00] transition-colors"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#CCCCCC] uppercase tracking-wider mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#777777]" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-[#1B1B1B] border border-[#262626] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-[#555555] focus:outline-none focus:border-[#FF6B00] transition-colors"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 bg-[#FF6B00] hover:bg-[#FF8C32] text-black font-extrabold text-sm rounded-xl transition-all shadow-lg shadow-[#FF6B00]/25 mt-2 flex items-center justify-center gap-2"
            >
              <span>Next: Setup Athlete Profile</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* 3. STEP 2: ADVANCED PROFILE SETUP */}
        {mode === 'register' && registerStep === 2 && (
          <form onSubmit={handleRegisterComplete} className="space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-[#262626]">
              <span className="text-xs font-bold text-[#FF8C32] uppercase tracking-wider">
                Step 2 of 2: Athlete Profile
              </span>
              <button
                type="button"
                onClick={() => setRegisterStep(1)}
                className="text-xs text-[#999999] hover:text-white"
              >
                Back
              </button>
            </div>

            {/* Units & Body Weight */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-[#CCCCCC] uppercase tracking-wider mb-1">
                  Weight ({unit})
                </label>
                <input
                  type="number"
                  min="40"
                  max="350"
                  value={bodyWeight}
                  onChange={(e) => setBodyWeight(parseFloat(e.target.value) || 0)}
                  className="w-full bg-[#1B1B1B] border border-[#262626] rounded-xl px-3 py-2 text-sm font-mono font-bold text-white focus:outline-none focus:border-[#FF6B00]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#CCCCCC] uppercase tracking-wider mb-1">
                  Unit System
                </label>
                <div className="grid grid-cols-2 gap-1 bg-[#1B1B1B] p-1 rounded-xl border border-[#262626]">
                  <button
                    type="button"
                    onClick={() => setUnit('lbs')}
                    className={`py-1 text-xs font-bold rounded-lg transition-all ${
                      unit === 'lbs' ? 'bg-[#FF6B00] text-black' : 'text-[#888888]'
                    }`}
                  >
                    lbs
                  </button>
                  <button
                    type="button"
                    onClick={() => setUnit('kg')}
                    className={`py-1 text-xs font-bold rounded-lg transition-all ${
                      unit === 'kg' ? 'bg-[#FF6B00] text-black' : 'text-[#888888]'
                    }`}
                  >
                    kg
                  </button>
                </div>
              </div>
            </div>

            {/* Height & Age */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-[#CCCCCC] uppercase tracking-wider mb-1">
                  Height (cm)
                </label>
                <input
                  type="number"
                  min="120"
                  max="230"
                  value={height}
                  onChange={(e) => setHeight(parseInt(e.target.value, 10) || 0)}
                  className="w-full bg-[#1B1B1B] border border-[#262626] rounded-xl px-3 py-2 text-sm font-mono font-bold text-white focus:outline-none focus:border-[#FF6B00]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#CCCCCC] uppercase tracking-wider mb-1">
                  Age
                </label>
                <input
                  type="number"
                  min="14"
                  max="100"
                  value={age}
                  onChange={(e) => setAge(parseInt(e.target.value, 10) || 0)}
                  className="w-full bg-[#1B1B1B] border border-[#262626] rounded-xl px-3 py-2 text-sm font-mono font-bold text-white focus:outline-none focus:border-[#FF6B00]"
                />
              </div>
            </div>

            {/* Fitness Goal */}
            <div>
              <label className="block text-[11px] font-bold text-[#CCCCCC] uppercase tracking-wider mb-1">
                Primary Goal
              </label>
              <select
                value={goal}
                onChange={(e) => setGoal(e.target.value as AdvancedProfile['goal'])}
                className="w-full bg-[#1B1B1B] border border-[#262626] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FF6B00]"
              >
                <option value="Hypertrophy (Muscle Growth)">Hypertrophy (Muscle Growth)</option>
                <option value="Strength & Power">Strength & Power</option>
                <option value="Endurance & Conditioning">Endurance & Conditioning</option>
                <option value="Weight Loss & Tone">Weight Loss & Tone</option>
              </select>
            </div>

            {/* Preferred Split & Weekly Target */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-[#CCCCCC] uppercase tracking-wider mb-1">
                  Preferred Split
                </label>
                <select
                  value={preferredSplit}
                  onChange={(e) => setPreferredSplit(e.target.value as AdvancedProfile['preferredSplit'])}
                  className="w-full bg-[#1B1B1B] border border-[#262626] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FF6B00]"
                >
                  <option value="Push / Pull / Legs">Push / Pull / Legs</option>
                  <option value="Upper / Lower">Upper / Lower</option>
                  <option value="Full Body (3x/wk)">Full Body (3x/wk)</option>
                  <option value="Body Part Split (Bro Split)">Body Part Split</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#CCCCCC] uppercase tracking-wider mb-1">
                  Days / Week
                </label>
                <select
                  value={weeklyTargetDays}
                  onChange={(e) => setWeeklyTargetDays(parseInt(e.target.value, 10) || 4)}
                  className="w-full bg-[#1B1B1B] border border-[#262626] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FF6B00]"
                >
                  <option value={3}>3 Days</option>
                  <option value={4}>4 Days</option>
                  <option value={5}>5 Days</option>
                  <option value={6}>6 Days</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 bg-[#FF6B00] hover:bg-[#FF8C32] disabled:opacity-50 text-black font-extrabold text-sm rounded-xl transition-all shadow-lg shadow-[#FF6B00]/25 mt-3 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <span>Creating Account...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                  <span>Launch My IronTrack Account</span>
                </>
              )}
            </button>
          </form>
        )}

        <div className="mt-6 pt-4 border-t border-[#262626] flex items-center justify-center gap-1.5 text-xs text-[#777777]">
          <ShieldCheck className="w-3.5 h-3.5 text-[#32D583]" />
          <span>Persistent Database & JWT Encrypted</span>
        </div>
      </div>
    </div>
  );
};
