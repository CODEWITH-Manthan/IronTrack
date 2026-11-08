import React from 'react';
import { 
  LayoutDashboard, 
  Dumbbell, 
  BookOpen, 
  TrendingUp, 
  History, 
  Settings, 
  Flame, 
  Play,
  LogOut
} from 'lucide-react';
import { useWorkout } from '../context/WorkoutContext';
import { useAuth } from '../context/AuthContext';
import { formatTimerDisplay } from '../utils/calculations';

export type NavTab = 'dashboard' | 'workouts' | 'exercises' | 'progress' | 'history' | 'settings';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onSelectTab }) => {
  const { activeWorkout } = useWorkout();
  const { user, logout } = useAuth();

  const navItems: { id: NavTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'workouts', label: 'Workouts', icon: Dumbbell },
    { id: 'exercises', label: 'Exercise Library', icon: BookOpen },
    { id: 'progress', label: 'Progress Analytics', icon: TrendingUp },
    { id: 'history', label: 'Workout History', icon: History },
    { id: 'settings', label: 'Settings & Profile', icon: Settings },
  ];

  const displayName = user?.name || 'Athlete';
  const displayWeight = user?.profile?.bodyWeight || 170;
  const displayUnit = user?.profile?.unit || 'lbs';

  return (
    <aside 
      className="hidden md:flex flex-col w-64 bg-[#141414] border-r border-[#262626] h-screen sticky top-0 shrink-0 z-30"
      aria-label="Desktop Sidebar"
    >
      {/* Brand Header */}
      <div className="p-6 border-b border-[#262626]/80 flex items-center justify-between">
        <button 
          onClick={() => onSelectTab('dashboard')}
          className="flex items-center gap-3 group text-left focus:outline-none"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF6B00] to-[#FF8C32] flex items-center justify-center shadow-lg shadow-[#FF6B00]/20 group-hover:scale-105 transition-transform duration-200">
            <Dumbbell className="w-5 h-5 text-black stroke-[2.5]" />
          </div>
          <div>
            <span className="font-extrabold text-xl tracking-tight text-white flex items-center gap-1.5">
              IRON<span className="text-[#FF6B00]">TRACK</span>
            </span>
            <p className="text-[11px] font-medium text-[#999999] tracking-wider uppercase">Strength SaaS</p>
          </div>
        </button>
      </div>

      {/* Active Workout Widget in Sidebar (if active) */}
      {activeWorkout.session && (
        <div className="mx-4 mt-4 p-3.5 rounded-xl bg-[#1B1B1B] border border-[#FF6B00]/30 shadow-md">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="flex items-center gap-1.5 font-semibold text-[#FF8C32]">
              <span className="w-2 h-2 rounded-full bg-[#FF6B00] animate-ping" />
              Active Session
            </span>
            <span className="font-mono text-white font-bold tabular-nums">
              {formatTimerDisplay(activeWorkout.elapsedSeconds)}
            </span>
          </div>
          <p className="text-xs text-white font-medium truncate mb-2.5">
            {activeWorkout.session.name}
          </p>
          <button
            onClick={() => onSelectTab('workouts')}
            className="w-full py-1.5 px-3 bg-[#FF6B00] hover:bg-[#FF8C32] text-black text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5"
          >
            <Play className="w-3.5 h-3.5 fill-black" />
            Resume Tracker
          </button>
        </div>
      )}

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto">
        <p className="px-3 mb-2 text-[11px] font-semibold text-[#777777] uppercase tracking-wider">
          Main Menu
        </p>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          const hasActiveWorkout = item.id === 'workouts' && activeWorkout.session;

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 group text-left ${
                isActive
                  ? 'bg-[#FF6B00]/15 text-[#FF8C32] border border-[#FF6B00]/30'
                  : 'text-[#999999] hover:text-white hover:bg-[#1B1B1B]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive ? 'text-[#FF6B00]' : 'text-[#777777] group-hover:text-white'
                  }`}
                />
                <span className="whitespace-nowrap">{item.label}</span>
              </div>
              {hasActiveWorkout && (
                <span className="px-1.5 py-0.5 text-[10px] font-extrabold bg-[#FF6B00] text-black rounded-md animate-pulse">
                  LIVE
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* User Profile Footer */}
      <div className="p-3 border-t border-[#262626] bg-[#0E0E0E] flex items-center justify-between gap-2">
        <button
          onClick={() => onSelectTab('settings')}
          className="flex-1 flex items-center gap-2.5 text-left p-1.5 rounded-xl hover:bg-[#1B1B1B] transition-colors group min-w-0"
        >
          <div className="w-9 h-9 rounded-full bg-[#1B1B1B] border border-[#262626] flex items-center justify-center font-black text-xs text-[#FF8C32] shrink-0">
            {displayName.slice(0, 2).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-white truncate group-hover:text-[#FF8C32] transition-colors">
              {displayName}
            </p>
            <div className="flex items-center gap-1.5 text-[11px] text-[#999999]">
              <span className="font-mono tabular-nums">{displayWeight} {displayUnit}</span>
              <span aria-hidden="true">·</span>
              <span className="text-[#32D583] flex items-center gap-0.5 text-[10px]">
                <Flame className="w-2.5 h-2.5 fill-[#32D583]" />
                Ready
              </span>
            </div>
          </div>
        </button>

        <button
          onClick={logout}
          aria-label="Log Out"
          title="Sign Out"
          className="p-2 rounded-xl text-[#777777] hover:text-red-400 hover:bg-[#1B1B1B] transition-colors shrink-0"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
};
