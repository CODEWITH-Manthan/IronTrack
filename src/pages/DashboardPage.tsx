import React, { useMemo } from 'react';
import { 
  Flame, 
  Dumbbell, 
  TrendingUp, 
  Calendar, 
  Play, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';
import { useWorkout } from '../context/WorkoutContext';
import { useAuth } from '../context/AuthContext';
import { 
  calculateStreak, 
  calculateWeeklyStats, 
  formatDuration, 
  formatVolume 
} from '../utils/calculations';
import { WorkoutSession } from '../types';

interface DashboardPageProps {
  onStartWorkout: (templateId?: string) => void;
  onNavigateToWorkouts: () => void;
  onNavigateToHistory: () => void;
  onViewWorkoutDetails: (workout: WorkoutSession) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onStartWorkout,
  onNavigateToWorkouts,
  onNavigateToHistory,
  onViewWorkoutDetails,
}) => {
  const { workouts, templates, activeWorkout } = useWorkout();
  const { user } = useAuth();

  const userProfile = user?.profile || {
    bodyWeight: 170,
    unit: 'lbs' as const,
    goal: 'Hypertrophy (Muscle Growth)',
    preferredSplit: 'Push / Pull / Legs',
    weeklyTargetDays: 4,
  };
  const userName = user?.name ? user.name.split(' ')[0] : 'Athlete';

  // Streak calculation
  const currentStreak = useMemo(() => calculateStreak(workouts), [workouts]);

  // Weekly stats
  const weeklyStats = useMemo(() => calculateWeeklyStats(workouts), [workouts]);

  // Check if today already has a workout logged
  const todayWorkout = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    return workouts.find(w => {
      const wStr = new Date(w.createdAt || w.startTime).toISOString().split('T')[0];
      return wStr === todayStr;
    });
  }, [workouts]);

  // Recommended workout based on user's split
  const recommendedTemplate = useMemo(() => {
    if (workouts.length > 0) {
      const lastType = workouts[0].type;
      if (lastType === 'Push') return templates.find(t => t.type === 'Pull') || templates[1];
      if (lastType === 'Pull') return templates.find(t => t.type === 'Legs') || templates[2];
      if (lastType === 'Legs') return templates.find(t => t.type === 'Upper Body') || templates[3];
      if (lastType === 'Upper Body') return templates.find(t => t.type === 'Lower Body') || templates[4];
    }
    // New user default based on split preference
    if (userProfile.preferredSplit.includes('Upper')) return templates[3] || templates[0];
    return templates[0];
  }, [workouts, templates, userProfile.preferredSplit]);

  const recentWorkouts = useMemo(() => workouts.slice(0, 3), [workouts]);

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* 1. Welcome & Motivational Banner */}
      <div className="relative rounded-2xl bg-gradient-to-r from-[#171717] via-[#141414] to-[#1a1410] border border-[#262626] p-6 sm:p-8 overflow-hidden shadow-xl">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-[#FF6B00]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-xl">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-[#FF6B00]/15 text-[#FF8C32] text-xs font-extrabold uppercase tracking-widest border border-[#FF6B00]/30">
                DAILY BRIEFING
              </span>
              <span className="text-xs text-[#999999]">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Ready to get stronger, {userName}?
            </h2>
            <p className="text-sm text-[#999999] mt-1.5 leading-relaxed">
              {workouts.length === 0 ? (
                <>Welcome to IronTrack. Your database is ready. Target goal: <span className="text-white font-semibold">{userProfile.goal}</span>. Log your first session below to establish your initial benchmarks.</>
              ) : todayWorkout ? (
                "You have already put in the work today. Recovery is where the muscle grows."
              ) : (
                `Stick to your ${userProfile.preferredSplit} split and lock in your progressive overload.`
              )}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {activeWorkout.session ? (
              <button
                onClick={onNavigateToWorkouts}
                className="py-3 px-6 bg-[#FF6B00] hover:bg-[#FF8C32] text-black font-extrabold text-sm rounded-xl shadow-lg shadow-[#FF6B00]/25 transition-all flex items-center gap-2.5"
              >
                <Play className="w-4 h-4 fill-black" />
                <span>Resume Active Session</span>
              </button>
            ) : (
              <button
                onClick={() => onStartWorkout()}
                className="py-3 px-6 bg-[#FF6B00] hover:bg-[#FF8C32] text-black font-extrabold text-sm rounded-xl shadow-lg shadow-[#FF6B00]/25 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2"
              >
                <Play className="w-4 h-4 fill-black" />
                <span>{workouts.length === 0 ? 'Start First Workout' : 'Quick Start Workout'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. Top Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Workouts this week */}
        <div className="bg-[#1B1B1B] rounded-2xl p-4 sm:p-5 border border-[#262626] hover:border-[#FF6B00]/30 transition-all">
          <div className="flex items-center justify-between text-[#999999] mb-3">
            <span className="text-xs font-bold uppercase tracking-wider">This Week</span>
            <div className="w-8 h-8 rounded-xl bg-[#252525] flex items-center justify-center text-[#FF6B00]">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-2xl sm:text-3xl font-black text-white tabular-nums">
              {weeklyStats.totalWorkouts}
            </span>
            <span className="text-xs text-[#777777] font-semibold">/ {userProfile.weeklyTargetDays || 4} target</span>
          </div>
          <p className="text-[11px] text-[#999999] mt-1.5 flex items-center gap-1">
            <span className={weeklyStats.totalWorkouts >= (userProfile.weeklyTargetDays || 4) ? 'text-[#32D583] font-bold' : 'text-[#888888]'}>
              {weeklyStats.totalWorkouts === 0 ? 'Fresh week' : 'Active routine'}
            </span>
            <span>· last 7 days</span>
          </p>
        </div>

        {/* Total Training Volume */}
        <div className="bg-[#1B1B1B] rounded-2xl p-4 sm:p-5 border border-[#262626] hover:border-[#FF6B00]/30 transition-all">
          <div className="flex items-center justify-between text-[#999999] mb-3">
            <span className="text-xs font-bold uppercase tracking-wider">Volume (7D)</span>
            <div className="w-8 h-8 rounded-xl bg-[#252525] flex items-center justify-center text-[#FF6B00]">
              <Dumbbell className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-2xl sm:text-3xl font-black text-white tabular-nums">
              {formatVolume(weeklyStats.totalVolume, userProfile.unit)}
            </span>
          </div>
          <p className="text-[11px] text-[#999999] mt-1.5 flex items-center gap-1">
            {weeklyStats.totalVolume > 0 ? (
              <>
                <TrendingUp className="w-3 h-3 text-[#32D583]" />
                <span className="text-[#32D583] font-bold">Overload Active</span>
              </>
            ) : (
              <span>Ready for first session</span>
            )}
          </p>
        </div>

        {/* Current Workout Streak */}
        <div className="bg-[#1B1B1B] rounded-2xl p-4 sm:p-5 border border-[#262626] hover:border-[#FF6B00]/30 transition-all">
          <div className="flex items-center justify-between text-[#999999] mb-3">
            <span className="text-xs font-bold uppercase tracking-wider">Workout Streak</span>
            <div className="w-8 h-8 rounded-xl bg-[#252525] flex items-center justify-center text-[#FF6B00]">
              <Flame className="w-4 h-4 text-[#FF6B00] fill-[#FF6B00]" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-2xl sm:text-3xl font-black text-[#FF6B00] tabular-nums">
              {currentStreak}
            </span>
            <span className="text-xs text-[#777777] font-semibold">days active</span>
          </div>
          <p className="text-[11px] text-[#999999] mt-1.5 flex items-center gap-1">
            <span>{currentStreak > 0 ? 'Consistency is king' : 'Log a workout to ignite streak'}</span>
          </p>
        </div>

        {/* Today's Workout Status */}
        <div className="bg-[#1B1B1B] rounded-2xl p-4 sm:p-5 border border-[#262626] hover:border-[#FF6B00]/30 transition-all">
          <div className="flex items-center justify-between text-[#999999] mb-3">
            <span className="text-xs font-bold uppercase tracking-wider">Today's Status</span>
            <div className="w-8 h-8 rounded-xl bg-[#252525] flex items-center justify-center text-[#32D583]">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-sm sm:text-base font-bold text-white truncate">
              {todayWorkout ? todayWorkout.name : 'No Workout Today'}
            </span>
          </div>
          <p className="text-[11px] text-[#999999] mt-1.5 truncate">
            {todayWorkout 
              ? `${formatDuration(todayWorkout.durationSeconds)} · ${formatVolume(todayWorkout.totalVolume, userProfile.unit)}`
              : 'Suggested: ' + recommendedTemplate.name}
          </p>
        </div>
      </div>

      {/* 3. Middle Split: Weekly Activity Chart + Recommended Workout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Workout Activity Chart (2 cols) */}
        <div className="lg:col-span-2 bg-[#141414] rounded-2xl p-5 sm:p-6 border border-[#262626]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Weekly Training Volume & Frequency
              </h3>
              <p className="text-xs text-[#999999]">
                Day-by-day tonnage lifted ({userProfile.unit})
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-[#FF8C32] bg-[#FF6B00]/10 px-2.5 py-1 rounded-lg border border-[#FF6B00]/20">
              Total: {formatVolume(weeklyStats.totalVolume, userProfile.unit)}
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyStats.weeklyActivity} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis 
                  dataKey="day" 
                  stroke="#555555" 
                  fontSize={11} 
                  tickLine={false}
                  axisLine={{ stroke: '#262626' }}
                />
                <YAxis 
                  stroke="#555555" 
                  fontSize={10} 
                  tickLine={false}
                  axisLine={{ stroke: '#262626' }}
                  tickFormatter={(val) => val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(255, 107, 0, 0.08)' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-[#1B1B1B] border border-[#262626] rounded-xl p-3 shadow-xl text-xs">
                          <p className="font-bold text-white mb-1">{data.day} ({data.date})</p>
                          <p className="text-[#FF8C32] font-mono tabular-nums">
                            Volume: {data.volume.toLocaleString()} {userProfile.unit}
                          </p>
                          <p className="text-[#999999]">
                            Workouts: {data.workouts} {data.workouts === 1 ? 'session' : 'sessions'}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="volume" radius={[6, 6, 0, 0]} maxBarSize={44}>
                  {weeklyStats.weeklyActivity.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.volume > 0 ? '#FF6B00' : '#222222'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recommended Workout Card (1 col) */}
        <div className="bg-[#141414] rounded-2xl p-5 sm:p-6 border border-[#262626] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-extrabold text-[#FF8C32] tracking-wider uppercase bg-[#FF6B00]/10 px-2 py-0.5 rounded-md">
                Recommended Routine
              </span>
              <span className="text-xs text-[#777777] flex items-center gap-1 font-mono">
                <Clock className="w-3.5 h-3.5" />
                ~{recommendedTemplate.estimatedDurationMin}m
              </span>
            </div>

            <h3 className="text-lg font-black text-white mb-1.5">
              {recommendedTemplate.name}
            </h3>
            <p className="text-xs text-[#999999] line-clamp-2 mb-4 leading-relaxed">
              {recommendedTemplate.description}
            </p>

            <div className="space-y-2 mb-6">
              <p className="text-[11px] font-bold text-[#CCCCCC] uppercase tracking-wider">
                Planned Exercises ({recommendedTemplate.exercises.length})
              </p>
              <div className="flex flex-wrap gap-1.5">
                {recommendedTemplate.exercises.map((exId) => (
                  <span
                    key={exId}
                    className="text-[11px] px-2.5 py-1 bg-[#1B1B1B] text-[#CCCCCC] border border-[#262626] rounded-lg"
                  >
                    {exId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={() => onStartWorkout(recommendedTemplate.id)}
            className="w-full py-3 px-4 bg-[#FF6B00] hover:bg-[#FF8C32] text-black font-extrabold text-xs sm:text-sm rounded-xl transition-all shadow-md shadow-[#FF6B00]/20 flex items-center justify-center gap-2"
          >
            <Play className="w-4 h-4 fill-black" />
            <span>{workouts.length === 0 ? 'Start This Routine' : 'Start This Session'}</span>
          </button>
        </div>
      </div>

      {/* 4. Recent Workout History */}
      <div className="bg-[#141414] rounded-2xl p-5 sm:p-6 border border-[#262626]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">
              Recent Workout Logs
            </h3>
            <p className="text-xs text-[#999999]">
              Latest completed training sessions
            </p>
          </div>
          {workouts.length > 0 && (
            <button
              onClick={onNavigateToHistory}
              className="text-xs font-bold text-[#FF8C32] hover:text-[#FFA04D] flex items-center gap-1 transition-colors"
            >
              <span>View All</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>

        {recentWorkouts.length === 0 ? (
          <div className="text-center py-12 bg-[#1B1B1B] rounded-xl border border-[#262626] p-6">
            <Dumbbell className="w-10 h-10 text-[#555555] mx-auto mb-3" />
            <p className="text-base font-bold text-white mb-1">No Workouts Logged Yet</p>
            <p className="text-xs text-[#777777] max-w-sm mx-auto mb-4">
              Your training log is pristine. Complete your first workout above or start from scratch.
            </p>
            <button
              onClick={() => onStartWorkout()}
              className="py-2.5 px-5 bg-[#FF6B00] hover:bg-[#FF8C32] text-black font-extrabold text-xs rounded-xl shadow-md transition-all inline-flex items-center gap-2"
            >
              <Play className="w-3.5 h-3.5 fill-black" />
              <span>Log First Workout</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recentWorkouts.map((workout) => {
              const workoutDate = new Date(workout.createdAt || workout.startTime).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              });

              return (
                <div
                  key={workout.id}
                  className="bg-[#1B1B1B] p-4 rounded-xl border border-[#262626] hover:border-[#FF6B00]/40 transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="font-extrabold text-[#FF8C32] uppercase tracking-wider text-[10px] bg-[#FF6B00]/10 px-2 py-0.5 rounded">
                        {workout.type}
                      </span>
                      <span className="text-[#777777] font-medium">{workoutDate}</span>
                    </div>

                    <h4 className="text-sm font-bold text-white group-hover:text-[#FF8C32] transition-colors truncate mb-1">
                      {workout.name}
                    </h4>

                    <div className="flex items-center gap-3 text-xs text-[#999999] mb-3">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-[#777777]" />
                        {formatDuration(workout.durationSeconds)}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono tabular-nums text-white font-semibold">
                        {formatVolume(workout.totalVolume, userProfile.unit)}
                      </span>
                    </div>

                    <p className="text-xs text-[#777777] line-clamp-1 mb-3">
                      {workout.exercises.map(e => e.exerciseName).join(', ')}
                    </p>
                  </div>

                  <button
                    onClick={() => onViewWorkoutDetails(workout)}
                    className="w-full py-1.5 px-3 bg-[#222222] hover:bg-[#282828] text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span>View Details</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#FF6B00]" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
