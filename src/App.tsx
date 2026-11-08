/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { WorkoutProvider, useWorkout } from './context/WorkoutContext';
import { Sidebar, NavTab } from './components/Sidebar';
import { BottomNav } from './components/BottomNav';
import { TopHeader } from './components/TopHeader';
import { RestTimerBar } from './components/RestTimerBar';
import { WorkoutSummaryModal } from './components/WorkoutSummaryModal';
import { WorkoutDetailModal } from './components/WorkoutDetailModal';

// Pages
import { AuthPage } from './pages/AuthPage';
import { DashboardPage } from './pages/DashboardPage';
import { WorkoutTrackerPage } from './pages/WorkoutTrackerPage';
import { ExerciseLibraryPage } from './pages/ExerciseLibraryPage';
import { ProgressAnalyticsPage } from './pages/ProgressAnalyticsPage';
import { WorkoutHistoryPage } from './pages/WorkoutHistoryPage';
import { SettingsPage } from './pages/SettingsPage';
import { WorkoutSession } from './types';
import { Dumbbell } from 'lucide-react';

function AuthenticatedApp() {
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [detailWorkout, setDetailWorkout] = useState<WorkoutSession | null>(null);

  const { 
    startWorkout, 
    activeWorkout, 
    completedWorkoutModal, 
    closeCompletedModal 
  } = useWorkout();

  const handleStartWorkout = (templateId?: string) => {
    if (!activeWorkout.session) {
      startWorkout(templateId);
    }
    setCurrentTab('workouts');
  };

  const handleQuickStart = () => {
    handleStartWorkout();
  };

  return (
    <div className="min-h-screen bg-[#090909] text-white flex flex-col md:flex-row font-sans">
      {/* Desktop Sidebar */}
      <Sidebar currentTab={currentTab} onSelectTab={setCurrentTab} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-20 md:pb-8">
        <TopHeader
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          onQuickStart={handleQuickStart}
        />

        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          {currentTab === 'dashboard' && (
            <DashboardPage
              onStartWorkout={handleStartWorkout}
              onNavigateToWorkouts={() => setCurrentTab('workouts')}
              onNavigateToHistory={() => setCurrentTab('history')}
              onViewWorkoutDetails={(workout) => setDetailWorkout(workout)}
            />
          )}

          {currentTab === 'workouts' && <WorkoutTrackerPage />}

          {currentTab === 'exercises' && <ExerciseLibraryPage />}

          {currentTab === 'progress' && <ProgressAnalyticsPage />}

          {currentTab === 'history' && <WorkoutHistoryPage />}

          {currentTab === 'settings' && <SettingsPage />}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav currentTab={currentTab} onSelectTab={setCurrentTab} />

      {/* Floating Rest Timer Widget */}
      <RestTimerBar />

      {/* Workout Completion Summary Modal */}
      <WorkoutSummaryModal
        workout={completedWorkoutModal}
        onClose={() => {
          closeCompletedModal();
          setCurrentTab('dashboard');
        }}
        onGoToHistory={() => {
          closeCompletedModal();
          setCurrentTab('history');
        }}
      />

      {/* Workout Detail Modal */}
      <WorkoutDetailModal
        workout={detailWorkout}
        onClose={() => setDetailWorkout(null)}
      />
    </div>
  );
}

function RootApp() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#090909] flex flex-col items-center justify-center">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#FF6B00] to-[#FF8C32] flex items-center justify-center animate-pulse shadow-xl shadow-[#FF6B00]/30 mb-3">
          <Dumbbell className="w-6 h-6 text-black stroke-[2.5]" />
        </div>
        <p className="text-xs font-bold text-[#888888] tracking-widest uppercase">
          Loading IronTrack...
        </p>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  return (
    <WorkoutProvider>
      <AuthenticatedApp />
    </WorkoutProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <RootApp />
    </AuthProvider>
  );
}
