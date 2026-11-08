import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Clock, Dumbbell, CheckCircle2, Flame, ArrowRight } from 'lucide-react';
import { WorkoutSession } from '../types';
import { formatDuration, formatVolume } from '../utils/calculations';
import { useWorkout } from '../context/WorkoutContext';

interface WorkoutSummaryModalProps {
  workout: WorkoutSession | null;
  onClose: () => void;
  onGoToHistory: () => void;
}

export const WorkoutSummaryModal: React.FC<WorkoutSummaryModalProps> = ({
  workout,
  onClose,
  onGoToHistory,
}) => {
  const { userProfile } = useWorkout();
  const [notes, setNotes] = useState(workout?.notes || '');

  useEffect(() => {
    if (workout) {
      setNotes(workout.notes || '');
      // Fire festive neon orange confetti burst!
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          ticks: 120,
          origin: { y: 0.6 },
          colors: ['#FF6B00', '#FF8C32', '#FFA04D', '#FFFFFF', '#32D583'],
        });
      } catch {
        // Safe fallback if confetti blocked
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [workout, onClose]);

  if (!workout) return null;

  const totalSets = workout.exercises.reduce(
    (acc, ex) => acc + ex.sets.filter(s => s.completed).length,
    0
  );

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="summary-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className="bg-[#141414] border border-[#262626] rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative text-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glowing Badge */}
        <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-[#FF6B00] to-[#FF8C32] flex items-center justify-center shadow-xl shadow-[#FF6B00]/30 mb-4 animate-bounce">
          <Trophy className="w-8 h-8 text-black stroke-[2.5]" />
        </div>

        <p className="text-xs font-bold text-[#FF8C32] uppercase tracking-widest mb-1">
          Session Complete
        </p>
        <h2 id="summary-title" className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-2">
          Workout Crushed!
        </h2>
        <p className="text-sm text-[#999999] mb-6">
          Phenomenal consistency. Every single rep builds the iron foundation.
        </p>

        {/* 3 Metric Cards */}
        <div className="grid grid-cols-3 gap-3 mb-6 text-left">
          <div className="bg-[#1B1B1B] p-3.5 rounded-xl border border-[#262626]">
            <div className="flex items-center gap-1.5 text-xs text-[#999999] mb-1">
              <Clock className="w-3.5 h-3.5 text-[#FF6B00]" />
              <span>Time</span>
            </div>
            <p className="font-mono text-base sm:text-lg font-bold text-white tabular-nums">
              {formatDuration(workout.durationSeconds)}
            </p>
          </div>

          <div className="bg-[#1B1B1B] p-3.5 rounded-xl border border-[#262626]">
            <div className="flex items-center gap-1.5 text-xs text-[#999999] mb-1">
              <Dumbbell className="w-3.5 h-3.5 text-[#FF6B00]" />
              <span>Volume</span>
            </div>
            <p className="font-mono text-base sm:text-lg font-bold text-white tabular-nums">
              {formatVolume(workout.totalVolume, userProfile.unit)}
            </p>
          </div>

          <div className="bg-[#1B1B1B] p-3.5 rounded-xl border border-[#262626]">
            <div className="flex items-center gap-1.5 text-xs text-[#999999] mb-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#32D583]" />
              <span>Sets Done</span>
            </div>
            <p className="font-mono text-base sm:text-lg font-bold text-white tabular-nums">
              {totalSets} sets
            </p>
          </div>
        </div>

        {/* Exercises Breakdown */}
        <div className="bg-[#1B1B1B] rounded-xl p-4 border border-[#262626] mb-6 text-left max-h-48 overflow-y-auto">
          <p className="text-xs font-bold text-[#CCCCCC] uppercase tracking-wider mb-2.5">
            Exercises Performed ({workout.exercises.length})
          </p>
          <div className="space-y-2">
            {workout.exercises.map((ex) => {
              const compSets = ex.sets.filter(s => s.completed);
              const maxSet = compSets.reduce((max, s) => (s.weight > max ? s.weight : max), 0);

              return (
                <div key={ex.id} className="flex items-center justify-between text-xs py-1 border-b border-[#262626]/60 last:border-0">
                  <div>
                    <span className="font-semibold text-white">{ex.exerciseName}</span>
                    <span className="text-[#777777] ml-2">({ex.muscleGroup})</span>
                  </div>
                  <div className="font-mono text-[#999999] tabular-nums">
                    {compSets.length} sets {maxSet > 0 ? `· max ${maxSet} ${userProfile.unit}` : ''}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-5 bg-[#FF6B00] hover:bg-[#FF8C32] text-black font-extrabold text-sm rounded-xl transition-all shadow-lg shadow-[#FF6B00]/25"
          >
            Done & Return to Dashboard
          </button>
          <button
            onClick={() => {
              onClose();
              onGoToHistory();
            }}
            className="py-3 px-5 bg-[#1B1B1B] hover:bg-[#252525] border border-[#262626] text-white font-bold text-sm rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <span>View in History</span>
            <ArrowRight className="w-4 h-4 text-[#FF6B00]" />
          </button>
        </div>
      </div>
    </div>
  );
};
