import React from 'react';
import { Timer, Plus, X, RotateCcw } from 'lucide-react';
import { useWorkout } from '../context/WorkoutContext';
import { formatTimerDisplay } from '../utils/calculations';

export const RestTimerBar: React.FC = () => {
  const { activeWorkout, stopRestTimer, addRestTime, startRestTimer } = useWorkout();

  if (!activeWorkout.isRestTimerActive && activeWorkout.restTimerSeconds <= 0) {
    return null;
  }

  const { restTimerSeconds, initialRestDuration } = activeWorkout;
  const progressPercent = initialRestDuration > 0 
    ? Math.min(100, Math.max(0, (restTimerSeconds / initialRestDuration) * 100))
    : 0;

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 sm:right-8 z-30 max-w-sm w-full animate-in fade-in slide-in-from-bottom-4 duration-200">
      <div className="bg-[#141414] border border-[#FF6B00]/40 rounded-2xl p-4 shadow-2xl shadow-black/80 backdrop-blur-xl">
        <div className="flex items-center justify-between gap-3 mb-2.5">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[#FF6B00]/15 text-[#FF6B00]">
              <Timer className="w-4 h-4 animate-spin" style={{ animationDuration: '6s' }} />
            </div>
            <div>
              <p className="text-xs font-bold text-white tracking-wide uppercase">Rest Timer</p>
              <p className="text-[11px] text-[#999999]">Recover for next set</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-mono text-2xl font-black text-[#FF6B00] tabular-nums tracking-tight">
              {formatTimerDisplay(restTimerSeconds)}
            </span>
            <button
              onClick={stopRestTimer}
              aria-label="Close rest timer"
              className="p-1 rounded-lg text-[#777777] hover:text-white hover:bg-[#1B1B1B] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-[#1B1B1B] rounded-full h-2 overflow-hidden mb-3">
          <div
            className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C32] h-full rounded-full transition-all duration-1000 ease-linear shadow-[0_0_8px_#FF6B00]"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => addRestTime(30)}
            className="flex-1 py-1.5 px-2.5 bg-[#1B1B1B] hover:bg-[#252525] border border-[#262626] rounded-xl text-xs font-bold text-white flex items-center justify-center gap-1 transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-[#FF6B00]" />
            <span>+30s</span>
          </button>
          <button
            onClick={() => startRestTimer(90)}
            className="py-1.5 px-3 bg-[#1B1B1B] hover:bg-[#252525] border border-[#262626] rounded-xl text-xs font-semibold text-[#CCCCCC] flex items-center justify-center gap-1 transition-colors"
            title="Reset to 90 seconds"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
          <button
            onClick={stopRestTimer}
            className="py-1.5 px-3 bg-[#FF6B00]/20 hover:bg-[#FF6B00]/30 text-[#FF8C32] rounded-xl text-xs font-bold transition-colors"
          >
            Skip
          </button>
        </div>
      </div>
    </div>
  );
};
