import React from 'react';
import { Play, Plus, Dumbbell } from 'lucide-react';
import { NavTab } from './Sidebar';
import { useWorkout } from '../context/WorkoutContext';
import { formatTimerDisplay } from '../utils/calculations';

interface TopHeaderProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onQuickStart: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({ currentTab, onSelectTab, onQuickStart }) => {
  const { activeWorkout } = useWorkout();

  const tabLabels: Record<NavTab, { title: string; subtitle: string }> = {
    dashboard: { title: 'Dashboard', subtitle: 'Performance Overview' },
    workouts: { title: 'Workout Tracker', subtitle: 'Live Training Session' },
    exercises: { title: 'Exercise Library', subtitle: 'Technique & Movement Vault' },
    progress: { title: 'Progress Analytics', subtitle: 'Volume & 1RM Progression' },
    history: { title: 'Workout History', subtitle: 'Past Training Logs' },
    settings: { title: 'Settings', subtitle: 'Profile & Preferences' },
  };

  const currentInfo = tabLabels[currentTab];

  return (
    <header className="sticky top-0 z-20 bg-[#090909]/90 backdrop-blur-md border-b border-[#262626] px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4">
      {/* Left: Breadcrumbs / Title */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="md:hidden flex items-center justify-center w-8 h-8 rounded-lg bg-[#FF6B00] shrink-0">
          <Dumbbell className="w-4 h-4 text-black stroke-[2.5]" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-xs text-[#999999]">
            <span className="hidden sm:inline">IronTrack</span>
            <span className="hidden sm:inline" aria-hidden="true">/</span>
            <span className="text-[#FF8C32] font-semibold">{currentInfo.subtitle}</span>
          </div>
          <h1 className="text-lg sm:text-xl font-extrabold text-white tracking-tight truncate">
            {currentInfo.title}
          </h1>
        </div>
      </div>

      {/* Right: Active Workout Ticker & Quick Start CTA */}
      <div className="flex items-center gap-3 shrink-0">
        {activeWorkout.session ? (
          <button
            onClick={() => onSelectTab('workouts')}
            className="flex items-center gap-2.5 px-3 py-1.5 sm:px-4 sm:py-2 bg-[#1B1B1B] hover:bg-[#222222] border border-[#FF6B00]/40 rounded-xl transition-all shadow-sm group"
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF6B00] opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#FF6B00]" />
            </span>
            <span className="text-xs sm:text-sm font-bold text-white group-hover:text-[#FF8C32] transition-colors">
              {activeWorkout.session.name}
            </span>
            <span className="font-mono text-xs sm:text-sm font-semibold text-[#FF8C32] tabular-nums">
              {formatTimerDisplay(activeWorkout.elapsedSeconds)}
            </span>
          </button>
        ) : (
          <button
            onClick={onQuickStart}
            className="flex items-center gap-2 px-3.5 py-1.5 sm:px-4 sm:py-2 bg-[#FF6B00] hover:bg-[#FF8C32] text-black font-extrabold text-xs sm:text-sm rounded-xl shadow-lg shadow-[#FF6B00]/20 transition-all hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Quick Start</span>
          </button>
        )}
      </div>
    </header>
  );
};
