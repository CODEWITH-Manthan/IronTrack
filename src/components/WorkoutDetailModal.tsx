import React from 'react';
import { X, Calendar, Clock, Dumbbell, Trash2 } from 'lucide-react';
import { WorkoutSession } from '../types';
import { formatDuration, formatVolume } from '../utils/calculations';
import { useWorkout } from '../context/WorkoutContext';

interface WorkoutDetailModalProps {
  workout: WorkoutSession | null;
  onClose: () => void;
}

export const WorkoutDetailModal: React.FC<WorkoutDetailModalProps> = ({ workout, onClose }) => {
  const { userProfile, deleteWorkout } = useWorkout();

  if (!workout) return null;

  const dateFormatted = new Date(workout.createdAt || workout.startTime).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this workout log?')) {
      deleteWorkout(workout.id);
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="detail-modal-title"
    >
      <div className="bg-[#141414] border border-[#262626] rounded-2xl max-w-xl w-full p-6 shadow-2xl overflow-y-auto max-h-[88vh]">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-[#262626]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-md bg-[#FF6B00]/15 text-[#FF8C32] text-xs font-bold uppercase tracking-wider">
                {workout.type}
              </span>
              <span className="text-xs text-[#777777] flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {dateFormatted}
              </span>
            </div>
            <h2 id="detail-modal-title" className="text-xl font-black text-white">
              {workout.name}
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1.5 rounded-lg text-[#777777] hover:text-white hover:bg-[#1B1B1B] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Top summary cards */}
        <div className="grid grid-cols-2 gap-3 my-4">
          <div className="p-3 bg-[#1B1B1B] rounded-xl border border-[#262626] flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#FF6B00]/15 text-[#FF6B00]">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] text-[#999999] uppercase font-semibold">Duration</p>
              <p className="font-mono text-sm font-bold text-white tabular-nums">
                {formatDuration(workout.durationSeconds)}
              </p>
            </div>
          </div>

          <div className="p-3 bg-[#1B1B1B] rounded-xl border border-[#262626] flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#FF6B00]/15 text-[#FF6B00]">
              <Dumbbell className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] text-[#999999] uppercase font-semibold">Total Volume</p>
              <p className="font-mono text-sm font-bold text-white tabular-nums">
                {formatVolume(workout.totalVolume, userProfile.unit)}
              </p>
            </div>
          </div>
        </div>

        {/* Notes if present */}
        {workout.notes && (
          <div className="mb-4 p-3 bg-[#1B1B1B] rounded-xl border border-[#262626] text-xs text-[#CCCCCC]">
            <p className="text-[10px] uppercase font-bold text-[#FF8C32] mb-1">Session Notes</p>
            <p className="italic">"{workout.notes}"</p>
          </div>
        )}

        {/* Exercises Breakdown */}
        <div className="space-y-4">
          <p className="text-xs font-bold text-[#CCCCCC] uppercase tracking-wider">
            Exercises & Sets ({workout.exercises.length})
          </p>

          {workout.exercises.map((ex, exIndex) => (
            <div key={ex.id || exIndex} className="p-4 rounded-xl bg-[#1B1B1B] border border-[#262626]">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-sm text-white">{ex.exerciseName}</span>
                <span className="text-xs text-[#FF8C32] font-semibold">{ex.muscleGroup}</span>
              </div>

              <div className="space-y-1.5">
                <div className="grid grid-cols-4 text-[10px] font-bold text-[#777777] uppercase px-2 pb-1 border-b border-[#262626]">
                  <span>Set</span>
                  <span>Weight</span>
                  <span>Reps</span>
                  <span className="text-right">Volume</span>
                </div>

                {ex.sets.map((set, sIdx) => {
                  const setVol = set.weight * set.reps;
                  return (
                    <div
                      key={set.id || sIdx}
                      className={`grid grid-cols-4 text-xs px-2 py-1.5 rounded-lg ${
                        set.completed ? 'text-white' : 'text-[#666666]'
                      }`}
                    >
                      <span className="font-mono font-bold text-[#999999]">
                        #{set.setNumber || sIdx + 1}
                        {set.isWarmup && ' (W)'}
                      </span>
                      <span className="font-mono tabular-nums">
                        {set.weight} {userProfile.unit}
                      </span>
                      <span className="font-mono tabular-nums">{set.reps} reps</span>
                      <span className="font-mono tabular-nums text-right font-semibold text-[#FF8C32]">
                        {setVol.toLocaleString()} {userProfile.unit}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-6 mt-4 border-t border-[#262626]">
          <button
            onClick={handleDelete}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete Workout</span>
          </button>

          <button
            onClick={onClose}
            className="py-2 px-5 bg-[#FF6B00] hover:bg-[#FF8C32] text-black text-xs font-extrabold rounded-xl transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
