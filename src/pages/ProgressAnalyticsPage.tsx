import React, { useState, useMemo } from 'react';
import { 
  Trophy, 
  TrendingUp, 
  Dumbbell, 
  PieChart as PieIcon, 
  Calculator, 
  Calendar, 
  Clock 
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { useWorkout } from '../context/WorkoutContext';
import { 
  calculatePersonalRecords, 
  calculateMuscleDistribution, 
  calculateWeeklyStats, 
  calculateEstimated1RM, 
  formatVolume, 
  formatDuration 
} from '../utils/calculations';

export const ProgressAnalyticsPage: React.FC = () => {
  const { workouts, userProfile } = useWorkout();

  // 1RM Calculator Interactive State
  const [calcWeight, setCalcWeight] = useState<number>(225);
  const [calcReps, setCalcReps] = useState<number>(5);

  const calcEstimated1RM = useMemo(() => {
    return calculateEstimated1RM(calcWeight, calcReps);
  }, [calcWeight, calcReps]);

  // Aggregated Stats
  const prs = useMemo(() => calculatePersonalRecords(workouts), [workouts]);
  const prList = useMemo(() => Object.values(prs), [prs]);

  const muscleDistribution = useMemo(() => {
    return calculateMuscleDistribution(workouts);
  }, [workouts]);

  const totalVolumeAllTime = useMemo(() => {
    return workouts.reduce((acc, w) => acc + (w.totalVolume || 0), 0);
  }, [workouts]);

  const totalDurationAllTime = useMemo(() => {
    return workouts.reduce((acc, w) => acc + (w.durationSeconds || 0), 0);
  }, [workouts]);

  const avgSessionDuration = useMemo(() => {
    if (workouts.length === 0) return 0;
    return Math.round(totalDurationAllTime / workouts.length);
  }, [workouts, totalDurationAllTime]);

  // Volume progression chronologically (oldest to newest)
  const volumeProgressionData = useMemo(() => {
    return [...workouts]
      .sort((a, b) => new Date(a.createdAt || a.startTime).getTime() - new Date(b.createdAt || b.startTime).getTime())
      .map((w, index) => ({
        index: index + 1,
        date: new Date(w.createdAt || w.startTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        name: w.name,
        volume: w.totalVolume,
      }));
  }, [workouts]);

  // Colors for Muscle Group Donut Chart
  const MUSCLE_COLORS: Record<string, string> = {
    Chest: '#FF6B00',
    Back: '#32D583',
    Legs: '#FF8C32',
    Shoulders: '#FACC15',
    Arms: '#38BDF8',
    Core: '#A855F7',
  };

  return (
    <div className="space-y-6 sm:space-y-8 max-w-6xl mx-auto animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Progress & Strength Analytics
        </h2>
        <p className="text-sm text-[#999999] mt-1">
          Detailed metrics on overall tonnage, 1RM milestones, and muscle group distribution.
        </p>
      </div>

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-[#141414] rounded-2xl p-4 sm:p-5 border border-[#262626]">
          <div className="flex items-center justify-between text-[#999999] mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">All-Time Volume</span>
            <Dumbbell className="w-4 h-4 text-[#FF6B00]" />
          </div>
          <p className="font-mono text-2xl sm:text-3xl font-black text-white tabular-nums">
            {formatVolume(totalVolumeAllTime, userProfile.unit)}
          </p>
          <p className="text-[11px] text-[#777777] mt-1">Cumulative load lifted</p>
        </div>

        <div className="bg-[#141414] rounded-2xl p-4 sm:p-5 border border-[#262626]">
          <div className="flex items-center justify-between text-[#999999] mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Completed Sessions</span>
            <Calendar className="w-4 h-4 text-[#FF6B00]" />
          </div>
          <p className="font-mono text-2xl sm:text-3xl font-black text-white tabular-nums">
            {workouts.length}
          </p>
          <p className="text-[11px] text-[#777777] mt-1">Total recorded workouts</p>
        </div>

        <div className="bg-[#141414] rounded-2xl p-4 sm:p-5 border border-[#262626]">
          <div className="flex items-center justify-between text-[#999999] mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Personal Records</span>
            <Trophy className="w-4 h-4 text-[#32D583]" />
          </div>
          <p className="font-mono text-2xl sm:text-3xl font-black text-[#32D583] tabular-nums">
            {prList.length}
          </p>
          <p className="text-[11px] text-[#777777] mt-1">Movements with PRs</p>
        </div>

        <div className="bg-[#141414] rounded-2xl p-4 sm:p-5 border border-[#262626]">
          <div className="flex items-center justify-between text-[#999999] mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Avg Session Time</span>
            <Clock className="w-4 h-4 text-[#FF6B00]" />
          </div>
          <p className="font-mono text-2xl sm:text-3xl font-black text-white tabular-nums">
            {formatDuration(avgSessionDuration)}
          </p>
          <p className="text-[11px] text-[#777777] mt-1">Time in the gym</p>
        </div>
      </div>

      {/* Main Charts Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weight / Volume Progression Chart (2 cols) */}
        <div className="lg:col-span-2 bg-[#141414] rounded-2xl p-5 sm:p-6 border border-[#262626]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Workout Volume Progression
              </h3>
              <p className="text-xs text-[#999999]">
                Total volume overload trajectory across recent workouts ({userProfile.unit})
              </p>
            </div>
            <span className="text-xs font-bold text-[#FF8C32] bg-[#FF6B00]/10 px-2.5 py-1 rounded-lg">
              Overload Tracking
            </span>
          </div>

          <div className="h-64 sm:h-72 w-full flex items-center justify-center">
            {volumeProgressionData.length === 0 ? (
              <div className="text-center p-6">
                <TrendingUp className="w-8 h-8 text-[#555555] mx-auto mb-2" />
                <p className="text-sm font-bold text-white mb-1">No Volume Data Yet</p>
                <p className="text-xs text-[#777777] max-w-xs mx-auto">
                  Complete your first workout to start tracking your progressive overload curve.
                </p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={volumeProgressionData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <defs>
                    <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FF6B00" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#FF6B00" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="date" 
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
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-[#1B1B1B] border border-[#262626] rounded-xl p-3 shadow-xl text-xs">
                            <p className="font-bold text-white mb-0.5">{data.name}</p>
                            <p className="text-[#999999] text-[11px] mb-1">{data.date}</p>
                            <p className="text-[#FF8C32] font-mono font-bold tabular-nums">
                              Volume: {data.volume.toLocaleString()} {userProfile.unit}
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="volume" 
                    stroke="#FF6B00" 
                    strokeWidth={2.5} 
                    fillOpacity={1} 
                    fill="url(#volumeGradient)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Muscle Group Training Distribution (1 col) */}
        <div className="bg-[#141414] rounded-2xl p-5 sm:p-6 border border-[#262626] flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight mb-1">
              Muscle Group Distribution
            </h3>
            <p className="text-xs text-[#999999] mb-4">
              Completed working sets breakdown
            </p>

            <div className="h-44 w-full flex items-center justify-center">
              {muscleDistribution.every(m => m.sets === 0) ? (
                <div className="text-center p-4">
                  <div className="w-16 h-16 rounded-full border-4 border-dashed border-[#262626] mx-auto mb-2 flex items-center justify-center">
                    <span className="text-[10px] text-[#555555] font-bold">0 sets</span>
                  </div>
                  <p className="text-xs text-[#777777]">Log sets to see target split</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={muscleDistribution}
                      dataKey="sets"
                      nameKey="muscle"
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={65}
                      paddingAngle={3}
                    >
                      {muscleDistribution.map((entry) => (
                        <Cell
                          key={`cell-${entry.muscle}`}
                          fill={MUSCLE_COLORS[entry.muscle] || '#FF6B00'}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-[#1B1B1B] border border-[#262626] rounded-xl p-2.5 text-xs">
                              <p className="font-bold text-white">{data.muscle}</p>
                              <p className="text-[#FF8C32] font-mono">
                                {data.sets} sets ({data.percentage}%)
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-[#262626]">
            {muscleDistribution.map((item) => (
              <div key={item.muscle} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: MUSCLE_COLORS[item.muscle] || '#FF6B00' }}
                  />
                  <span className="text-[#CCCCCC]">{item.muscle}</span>
                </div>
                <span className="font-mono font-semibold text-white tabular-nums">
                  {item.sets} sets ({item.percentage}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Personal Records (PR) Showcase */}
      <div className="bg-[#141414] rounded-2xl p-5 sm:p-6 border border-[#262626]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#FF6B00]/15 flex items-center justify-center text-[#FF6B00]">
              <Trophy className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Personal Records (PR) Hall
              </h3>
              <p className="text-xs text-[#999999]">
                Heaviest recorded weight and estimated 1 Rep Max
              </p>
            </div>
          </div>
        </div>

        {prList.length === 0 ? (
          <div className="text-center py-8 bg-[#1B1B1B] rounded-xl border border-[#262626]">
            <Trophy className="w-8 h-8 text-[#555555] mx-auto mb-2" />
            <p className="text-xs text-[#777777]">Log exercises and sets to establish personal records.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {prList.map((pr) => (
              <div
                key={pr.exerciseName}
                className="bg-[#1B1B1B] p-4 rounded-xl border border-[#262626] hover:border-[#FF6B00]/40 transition-all"
              >
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-extrabold text-[#FF8C32] uppercase tracking-wider text-[10px] bg-[#FF6B00]/10 px-2 py-0.5 rounded">
                    {pr.muscleGroup}
                  </span>
                  <span className="text-[#777777] text-[11px]">{pr.date}</span>
                </div>

                <h4 className="text-sm font-bold text-white mb-3 truncate">
                  {pr.exerciseName}
                </h4>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#262626]">
                  <div>
                    <span className="text-[10px] text-[#777777] uppercase font-bold block">
                      Max Weight
                    </span>
                    <span className="font-mono text-base font-black text-white tabular-nums">
                      {pr.maxWeight} {userProfile.unit}
                    </span>
                    <span className="text-[10px] text-[#999999] block">
                      for {pr.maxRepsAtMaxWeight} {pr.maxRepsAtMaxWeight === 1 ? 'rep' : 'reps'}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-[#777777] uppercase font-bold block">
                      Estimated 1RM
                    </span>
                    <span className="font-mono text-base font-black text-[#FF6B00] tabular-nums">
                      {pr.estimated1RM} {userProfile.unit}
                    </span>
                    <span className="text-[10px] text-[#999999] block">Brzycki formula</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Interactive 1RM Calculator Widget */}
      <div className="bg-[#141414] rounded-2xl p-5 sm:p-6 border border-[#262626]">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-8 h-8 rounded-lg bg-[#FF6B00]/15 flex items-center justify-center text-[#FF6B00]">
            <Calculator className="w-4 h-4 stroke-[2.5]" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">
              One Rep Max (1RM) Calculator
            </h3>
            <p className="text-xs text-[#999999]">
              Calculate projected single-rep limits and training percentage splits
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          {/* Inputs */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-[#CCCCCC] uppercase tracking-wider mb-1">
                Lifted Weight ({userProfile.unit})
              </label>
              <input
                type="number"
                min="1"
                step="5"
                value={calcWeight}
                onChange={(e) => setCalcWeight(parseFloat(e.target.value) || 0)}
                className="w-full bg-[#1B1B1B] border border-[#262626] rounded-xl px-3.5 py-2 text-sm font-mono font-bold text-white focus:outline-none focus:border-[#FF6B00]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#CCCCCC] uppercase tracking-wider mb-1">
                Repetitions Completed
              </label>
              <input
                type="number"
                min="1"
                max="30"
                value={calcReps}
                onChange={(e) => setCalcReps(parseInt(e.target.value, 10) || 1)}
                className="w-full bg-[#1B1B1B] border border-[#262626] rounded-xl px-3.5 py-2 text-sm font-mono font-bold text-white focus:outline-none focus:border-[#FF6B00]"
              />
            </div>
          </div>

          {/* Primary 1RM Output */}
          <div className="bg-[#1B1B1B] rounded-xl p-5 border border-[#FF6B00]/40 text-center">
            <span className="text-xs font-bold text-[#FF8C32] uppercase tracking-wider block mb-1">
              Estimated 1RM
            </span>
            <span className="font-mono text-3xl sm:text-4xl font-black text-white tabular-nums tracking-tight">
              {calcEstimated1RM}
            </span>
            <span className="text-sm font-bold text-[#FF6B00] ml-1">{userProfile.unit}</span>
            <p className="text-[11px] text-[#777777] mt-2">
              Based on {calcWeight} {userProfile.unit} x {calcReps} reps
            </p>
          </div>

          {/* Percentages Grid */}
          <div className="bg-[#1B1B1B] rounded-xl p-4 border border-[#262626] space-y-1.5 text-xs">
            <div className="flex justify-between py-1 border-b border-[#262626] font-bold text-[#999999]">
              <span>Percentage</span>
              <span>Training Weight</span>
            </div>
            {[
              { pct: 95, label: '95% (Heavy Strength / 2RM)' },
              { pct: 85, label: '85% (Hypertrophy / 5-6RM)' },
              { pct: 75, label: '75% (Volume / 10RM)' },
              { pct: 65, label: '65% (Speed / Endurance)' },
            ].map(({ pct, label }) => (
              <div key={pct} className="flex justify-between py-1 text-white">
                <span className="text-[#AAAAAA]">{label}</span>
                <span className="font-mono font-bold tabular-nums text-[#FF8C32]">
                  {Math.round((calcEstimated1RM * pct) / 100)} {userProfile.unit}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
