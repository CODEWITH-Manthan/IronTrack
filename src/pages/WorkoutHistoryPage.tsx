import React, { useState, useMemo } from 'react';
import { 
  Calendar, 
  Clock, 
  Dumbbell, 
  Trash2, 
  Search, 
  Filter, 
  Eye, 
  ArrowRight 
} from 'lucide-react';
import { useWorkout } from '../context/WorkoutContext';
import { WorkoutType, WorkoutSession } from '../types';
import { formatDuration, formatVolume } from '../utils/calculations';
import { WorkoutDetailModal } from '../components/WorkoutDetailModal';

export const WorkoutHistoryPage: React.FC = () => {
  const { workouts, userProfile, deleteWorkout } = useWorkout();

  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [detailModalWorkout, setDetailModalWorkout] = useState<WorkoutSession | null>(null);

  const workoutTypes: ('All' | WorkoutType)[] = [
    'All',
    'Push',
    'Pull',
    'Legs',
    'Upper Body',
    'Lower Body',
    'Full Body',
  ];

  const filteredWorkouts = useMemo(() => {
    return workouts.filter((w) => {
      const matchesType = selectedType === 'All' || w.type === selectedType;
      const matchesSearch =
        w.name.toLowerCase().includes(search.toLowerCase()) ||
        w.exercises.some((e) => e.exerciseName.toLowerCase().includes(search.toLowerCase())) ||
        (w.notes && w.notes.toLowerCase().includes(search.toLowerCase()));

      return matchesType && matchesSearch;
    });
  }, [workouts, selectedType, search]);

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      deleteWorkout(id);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Workout History
        </h2>
        <p className="text-sm text-[#999999] mt-1">
          Review past training sessions, volume logs, and exercise details.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#141414] rounded-2xl p-4 sm:p-5 border border-[#262626] space-y-3">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#777777]" />
          <input
            type="text"
            placeholder="Search history by workout name, exercise, or notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#1B1B1B] border border-[#262626] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-[#666666] focus:outline-none focus:border-[#FF6B00] transition-colors"
          />
        </div>

        {/* Workout Type Segmented Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {workoutTypes.map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedType === type
                  ? 'bg-[#FF6B00] text-black shadow-md shadow-[#FF6B00]/20'
                  : 'bg-[#1B1B1B] text-[#999999] hover:text-white hover:bg-[#222222] border border-[#262626]'
              }`}
            >
              {type}
            </button>
          ))}
          <span className="ml-auto text-xs text-[#777777] hidden sm:inline">
            {filteredWorkouts.length} logged sessions
          </span>
        </div>
      </div>

      {/* History List */}
      {filteredWorkouts.length === 0 ? (
        <div className="text-center py-16 bg-[#141414] rounded-2xl border border-[#262626]">
          <Calendar className="w-10 h-10 text-[#555555] mx-auto mb-3" />
          <h3 className="text-base font-bold text-white mb-1">No Workout Logs Found</h3>
          <p className="text-xs text-[#777777] max-w-sm mx-auto mb-4">
            No logged sessions match your search or filters.
          </p>
          <button
            onClick={() => {
              setSearch('');
              setSelectedType('All');
            }}
            className="py-2 px-4 bg-[#1B1B1B] hover:bg-[#252525] text-[#FF8C32] rounded-xl text-xs font-bold border border-[#262626]"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredWorkouts.map((workout) => {
            const dateObj = new Date(workout.createdAt || workout.startTime);
            const dateFormatted = dateObj.toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            });
            const timeFormatted = dateObj.toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
            });

            const completedSets = workout.exercises.reduce(
              (acc, ex) => acc + ex.sets.filter((s) => s.completed).length,
              0
            );

            return (
              <div
                key={workout.id}
                className="bg-[#141414] rounded-2xl p-5 sm:p-6 border border-[#262626] hover:border-[#FF6B00]/40 transition-all group"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#262626]">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="px-2.5 py-0.5 rounded-md bg-[#FF6B00]/15 text-[#FF8C32] text-xs font-extrabold uppercase tracking-wider">
                        {workout.type}
                      </span>
                      <span className="text-xs text-[#777777] flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {dateFormatted} · {timeFormatted}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-white group-hover:text-[#FF8C32] transition-colors">
                      {workout.name}
                    </h3>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setDetailModalWorkout(workout)}
                      className="py-2 px-4 bg-[#1B1B1B] hover:bg-[#222222] text-white text-xs font-bold rounded-xl border border-[#262626] hover:border-[#FF6B00]/40 transition-all flex items-center gap-2"
                    >
                      <Eye className="w-4 h-4 text-[#FF6B00]" />
                      <span>View Details</span>
                    </button>

                    <button
                      onClick={() => handleDelete(workout.id, workout.name)}
                      aria-label={`Delete ${workout.name}`}
                      className="p-2 rounded-xl text-[#777777] hover:text-red-400 hover:bg-[#1B1B1B] transition-colors"
                      title="Delete Log"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* 3 Metric Pills */}
                <div className="grid grid-cols-3 gap-3 py-4 text-xs">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#FF6B00] shrink-0" />
                    <div>
                      <p className="text-[10px] text-[#777777] uppercase font-bold">Duration</p>
                      <p className="font-mono text-white font-bold tabular-nums">
                        {formatDuration(workout.durationSeconds)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Dumbbell className="w-4 h-4 text-[#FF6B00] shrink-0" />
                    <div>
                      <p className="text-[10px] text-[#777777] uppercase font-bold">Volume</p>
                      <p className="font-mono text-white font-bold tabular-nums">
                        {formatVolume(workout.totalVolume, userProfile.unit)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-[#32D583]/20 flex items-center justify-center shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#32D583]" />
                    </div>
                    <div>
                      <p className="text-[10px] text-[#777777] uppercase font-bold">Sets Finished</p>
                      <p className="font-mono text-white font-bold tabular-nums">
                        {completedSets} sets
                      </p>
                    </div>
                  </div>
                </div>

                {/* Exercises Completed List */}
                <div className="pt-2 border-t border-[#262626]/80 flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] font-bold text-[#888888] mr-1">Movements:</span>
                  {workout.exercises.map((ex) => (
                    <span
                      key={ex.id}
                      className="text-[11px] px-2.5 py-1 bg-[#1B1B1B] text-[#CCCCCC] rounded-lg border border-[#262626]"
                    >
                      {ex.exerciseName}
                    </span>
                  ))}
                </div>

                {/* Notes preview if available */}
                {workout.notes && (
                  <p className="text-xs text-[#888888] italic mt-3 pt-2 border-t border-[#262626]/60 line-clamp-1">
                    "{workout.notes}"
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Workout Detail Modal */}
      <WorkoutDetailModal
        workout={detailModalWorkout}
        onClose={() => setDetailModalWorkout(null)}
      />
    </div>
  );
};
