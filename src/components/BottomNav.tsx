import React from 'react';
import { 
  LayoutDashboard, 
  Dumbbell, 
  BookOpen, 
  TrendingUp, 
  History, 
  Settings 
} from 'lucide-react';
import { NavTab } from './Sidebar';
import { useWorkout } from '../context/WorkoutContext';

interface BottomNavProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onSelectTab }) => {
  const { activeWorkout } = useWorkout();

  const navItems: { id: NavTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'workouts', label: 'Workouts', icon: Dumbbell },
    { id: 'exercises', label: 'Library', icon: BookOpen },
    { id: 'progress', label: 'Progress', icon: TrendingUp },
    { id: 'history', label: 'History', icon: History },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <nav 
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#141414]/95 backdrop-blur-lg border-t border-[#262626] safe-area-pb"
      aria-label="Mobile Navigation"
    >
      <div className="grid grid-cols-6 h-16 items-center px-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          const hasActiveWorkout = item.id === 'workouts' && activeWorkout.session;

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`flex flex-col items-center justify-center h-full relative transition-colors ${
                isActive ? 'text-[#FF6B00]' : 'text-[#777777] hover:text-[#CCCCCC]'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
                {hasActiveWorkout && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#FF6B00] rounded-full border-2 border-[#141414] animate-pulse" />
                )}
              </div>
              <span className="text-[10px] font-medium mt-1 truncate max-w-[54px]">
                {item.label}
              </span>
              {isActive && (
                <div className="absolute top-0 w-8 h-0.5 bg-[#FF6B00] rounded-b-full shadow-[0_0_8px_#FF6B00]" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
