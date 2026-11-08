import React, { useState, useEffect } from 'react';
import { 
  User, 
  Scale, 
  Ruler, 
  Target, 
  Layers, 
  RotateCcw, 
  Download, 
  Check, 
  Moon, 
  Shield, 
  LogOut,
  Flame,
  Award,
  Calendar,
  Droplets,
  Activity
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useWorkout } from '../context/WorkoutContext';
import { AdvancedProfile } from '../types';

export const SettingsPage: React.FC = () => {
  const { user, updateProfile, logout } = useAuth();
  const { workouts } = useWorkout();

  const profile = user?.profile;

  const [name, setName] = useState(user?.name || '');
  const [age, setAge] = useState<number>(profile?.age || 26);
  const [gender, setGender] = useState<AdvancedProfile['gender']>(profile?.gender || 'Prefer not to say');
  const [bodyWeight, setBodyWeight] = useState<number>(profile?.bodyWeight || 170);
  const [height, setHeight] = useState<number>(profile?.height || 175);
  const [unit, setUnit] = useState<'lbs' | 'kg'>(profile?.unit || 'lbs');
  const [goal, setGoal] = useState<AdvancedProfile['goal']>(profile?.goal || 'Hypertrophy (Muscle Growth)');
  const [preferredSplit, setPreferredSplit] = useState<AdvancedProfile['preferredSplit']>(profile?.preferredSplit || 'Push / Pull / Legs');
  const [experienceLevel, setExperienceLevel] = useState<AdvancedProfile['experienceLevel']>(profile?.experienceLevel || 'Intermediate (1-3 yrs)');
  const [weeklyTargetDays, setWeeklyTargetDays] = useState<number>(profile?.weeklyTargetDays || 4);
  const [dailyCalorieTarget, setDailyCalorieTarget] = useState<number>(profile?.dailyCalorieTarget || 2500);
  const [dailyWaterMl, setDailyWaterMl] = useState<number>(profile?.dailyWaterMl || 3000);

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
      if (user.profile) {
        setAge(user.profile.age);
        setGender(user.profile.gender);
        setBodyWeight(user.profile.bodyWeight);
        setHeight(user.profile.height);
        setUnit(user.profile.unit);
        setGoal(user.profile.goal);
        setPreferredSplit(user.profile.preferredSplit);
        setExperienceLevel(user.profile.experienceLevel);
        setWeeklyTargetDays(user.profile.weeklyTargetDays);
        setDailyCalorieTarget(user.profile.dailyCalorieTarget || 2500);
        setDailyWaterMl(user.profile.dailyWaterMl || 3000);
      }
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateProfile(
        {
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
        name.trim()
      );
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to update profile', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportData = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(
      JSON.stringify({ user, workouts }, null, 2)
    );
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `irontrack-backup-${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6 sm:space-y-8 max-w-3xl mx-auto pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Athlete Settings & Profile
          </h2>
          <p className="text-sm text-[#999999] mt-1">
            Manage your credentials, training metrics, and advanced biometrics.
          </p>
        </div>

        <button
          onClick={logout}
          className="py-2 px-4 bg-[#1B1B1B] hover:bg-red-500/10 border border-[#262626] hover:border-red-500/40 text-[#CCCCCC] hover:text-red-400 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-2 self-start sm:self-auto"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* User Identity Card */}
        <div className="bg-[#141414] rounded-2xl p-6 border border-[#262626]">
          <div className="flex items-center gap-3.5 mb-5 pb-4 border-b border-[#262626]">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#FF6B00] to-[#FF8C32] flex items-center justify-center font-black text-lg text-black shadow-lg shadow-[#FF6B00]/20 shrink-0">
              {name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h3 className="text-base font-bold text-white">{name}</h3>
              <p className="text-xs text-[#999999]">{user?.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#CCCCCC] uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#1B1B1B] border border-[#262626] rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#FF6B00]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#CCCCCC] uppercase tracking-wider mb-1.5">
                Account Email
              </label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full bg-[#181818] border border-[#262626] rounded-xl px-3.5 py-2.5 text-sm text-[#777777] cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* Advanced Biometrics */}
        <div className="bg-[#141414] rounded-2xl p-6 border border-[#262626]">
          <h3 className="text-base font-bold text-white mb-1">Advanced Biometrics & Target Units</h3>
          <p className="text-xs text-[#999999] mb-5">
            Real-world athlete parameters for volume progression and load ratios
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-xs font-bold text-[#CCCCCC] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5 text-[#FF6B00]" />
                <span>Body Weight ({unit})</span>
              </label>
              <input
                type="number"
                min="30"
                max="350"
                step="0.5"
                value={bodyWeight}
                onChange={(e) => setBodyWeight(parseFloat(e.target.value) || 0)}
                className="w-full bg-[#1B1B1B] border border-[#262626] rounded-xl px-3.5 py-2.5 text-sm font-mono font-bold text-white focus:outline-none focus:border-[#FF6B00]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#CCCCCC] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Ruler className="w-3.5 h-3.5 text-[#FF6B00]" />
                <span>Height (cm)</span>
              </label>
              <input
                type="number"
                min="100"
                max="250"
                value={height}
                onChange={(e) => setHeight(parseInt(e.target.value, 10) || 0)}
                className="w-full bg-[#1B1B1B] border border-[#262626] rounded-xl px-3.5 py-2.5 text-sm font-mono font-bold text-white focus:outline-none focus:border-[#FF6B00]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#CCCCCC] uppercase tracking-wider mb-1.5">
                Unit Preference
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setUnit('lbs')}
                  className={`py-2 rounded-xl text-xs font-bold transition-all ${
                    unit === 'lbs'
                      ? 'bg-[#FF6B00] text-black shadow-md shadow-[#FF6B00]/20'
                      : 'bg-[#1B1B1B] text-[#999999] border border-[#262626]'
                  }`}
                >
                  lbs
                </button>
                <button
                  type="button"
                  onClick={() => setUnit('kg')}
                  className={`py-2 rounded-xl text-xs font-bold transition-all ${
                    unit === 'kg'
                      ? 'bg-[#FF6B00] text-black shadow-md shadow-[#FF6B00]/20'
                      : 'bg-[#1B1B1B] text-[#999999] border border-[#262626]'
                  }`}
                >
                  kg
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#CCCCCC] uppercase tracking-wider mb-1.5">
                Age
              </label>
              <input
                type="number"
                min="14"
                max="100"
                value={age}
                onChange={(e) => setAge(parseInt(e.target.value, 10) || 0)}
                className="w-full bg-[#1B1B1B] border border-[#262626] rounded-xl px-3.5 py-2.5 text-sm font-mono font-bold text-white focus:outline-none focus:border-[#FF6B00]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#CCCCCC] uppercase tracking-wider mb-1.5">
                Gender Identity
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as AdvancedProfile['gender'])}
                className="w-full bg-[#1B1B1B] border border-[#262626] rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#FF6B00]"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Non-binary">Non-binary</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </div>
          </div>
        </div>

        {/* Goals & Training Philosophy */}
        <div className="bg-[#141414] rounded-2xl p-6 border border-[#262626]">
          <h3 className="text-base font-bold text-white mb-1">Training Split & Target Cadence</h3>
          <p className="text-xs text-[#999999] mb-5">
            Configures daily recommendation algorithms and weekly target bars
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#CCCCCC] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-[#FF6B00]" />
                <span>Primary Fitness Goal</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  'Hypertrophy (Muscle Growth)',
                  'Strength & Power',
                  'Endurance & Conditioning',
                  'Weight Loss & Tone',
                ].map((g) => (
                  <button
                    type="button"
                    key={g}
                    onClick={() => setGoal(g as AdvancedProfile['goal'])}
                    className={`p-3 rounded-xl text-xs font-bold text-left transition-all ${
                      goal === g
                        ? 'bg-[#FF6B00]/20 text-[#FF8C32] border border-[#FF6B00]'
                        : 'bg-[#1B1B1B] text-[#999999] hover:bg-[#222222] border border-[#262626]'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#CCCCCC] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-[#FF6B00]" />
                  <span>Preferred Split</span>
                </label>
                <select
                  value={preferredSplit}
                  onChange={(e) => setPreferredSplit(e.target.value as AdvancedProfile['preferredSplit'])}
                  className="w-full bg-[#1B1B1B] border border-[#262626] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#FF6B00]"
                >
                  <option value="Push / Pull / Legs">Push / Pull / Legs</option>
                  <option value="Upper / Lower">Upper / Lower</option>
                  <option value="Full Body (3x/wk)">Full Body (3x/wk)</option>
                  <option value="Body Part Split (Bro Split)">Body Part Split (Bro Split)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#CCCCCC] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-[#FF6B00]" />
                  <span>Experience Level</span>
                </label>
                <select
                  value={experienceLevel}
                  onChange={(e) => setExperienceLevel(e.target.value as AdvancedProfile['experienceLevel'])}
                  className="w-full bg-[#1B1B1B] border border-[#262626] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#FF6B00]"
                >
                  <option value="Beginner (< 1 yr)">Beginner (&lt; 1 yr)</option>
                  <option value="Intermediate (1-3 yrs)">Intermediate (1-3 yrs)</option>
                  <option value="Advanced (3+ yrs)">Advanced (3+ yrs)</option>
                </select>
              </div>
            </div>

            {/* Daily Nutrition & Hydration Targets */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-[#CCCCCC] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#FF6B00]" />
                  <span>Target Days/Wk</span>
                </label>
                <input
                  type="number"
                  min="2"
                  max="7"
                  value={weeklyTargetDays}
                  onChange={(e) => setWeeklyTargetDays(parseInt(e.target.value, 10) || 4)}
                  className="w-full bg-[#1B1B1B] border border-[#262626] rounded-xl px-3.5 py-2 text-sm font-mono font-bold text-white focus:outline-none focus:border-[#FF6B00]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#CCCCCC] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-[#FF6B00]" />
                  <span>Calories Target</span>
                </label>
                <input
                  type="number"
                  min="1200"
                  max="6000"
                  step="50"
                  value={dailyCalorieTarget}
                  onChange={(e) => setDailyCalorieTarget(parseInt(e.target.value, 10) || 2500)}
                  className="w-full bg-[#1B1B1B] border border-[#262626] rounded-xl px-3.5 py-2 text-sm font-mono font-bold text-white focus:outline-none focus:border-[#FF6B00]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#CCCCCC] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Droplets className="w-3.5 h-3.5 text-[#38BDF8]" />
                  <span>Water Target (ml)</span>
                </label>
                <input
                  type="number"
                  min="1000"
                  max="8000"
                  step="250"
                  value={dailyWaterMl}
                  onChange={(e) => setDailyWaterMl(parseInt(e.target.value, 10) || 3000)}
                  className="w-full bg-[#1B1B1B] border border-[#262626] rounded-xl px-3.5 py-2 text-sm font-mono font-bold text-white focus:outline-none focus:border-[#FF6B00]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-between pt-2">
          {savedSuccess ? (
            <div className="flex items-center gap-2 text-xs text-[#32D583] font-bold">
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Advanced athlete profile synced to database!</span>
            </div>
          ) : (
            <div />
          )}

          <button
            type="submit"
            disabled={isSaving}
            className="py-3 px-8 bg-[#FF6B00] hover:bg-[#FF8C32] disabled:opacity-50 text-black font-extrabold text-sm rounded-xl transition-all shadow-lg shadow-[#FF6B00]/25"
          >
            {isSaving ? 'Saving Changes...' : 'Save Profile Changes'}
          </button>
        </div>
      </form>

      {/* Data Backup */}
      <div className="bg-[#141414] rounded-2xl p-6 border border-[#262626] space-y-4">
        <h3 className="text-base font-bold text-white">Database Backup</h3>
        <p className="text-xs text-[#999999]">
          Export your user account data and logged workouts as a JSON backup.
        </p>

        <div className="pt-1">
          <button
            type="button"
            onClick={handleExportData}
            className="py-2.5 px-4 bg-[#1B1B1B] hover:bg-[#252525] border border-[#262626] text-white text-xs font-bold rounded-xl transition-colors inline-flex items-center gap-2"
          >
            <Download className="w-4 h-4 text-[#FF6B00]" />
            <span>Download My Workout Logs (JSON)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
