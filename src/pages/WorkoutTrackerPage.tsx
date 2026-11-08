import React, { useState } from 'react';
import { 
  Play, 
  Pause, 
  Plus, 
  Trash2, 
  Check, 
  Dumbbell, 
  Clock, 
  Flame, 
  X, 
  Timer,
  ChevronDown,
  Sparkles
} from 'lucide-react';
import { useWorkout } from '../context/WorkoutContext';
import { WorkoutType } from '../types';
import { formatTimerDisplay, formatVolume } from '../utils/calculations';
import { SelectExerciseModal } from '../components/SelectExerciseModal';

export const WorkoutTrackerPage: React.FC = () => {
  const {
    activeWorkout,
    templates,
    userProfile,
    startWorkout,
    addExerciseToActiveWorkout,
    removeExerciseFromActiveWorkout,
    updateWorkoutSet,
    addSetToExercise,
    removeSetFromExercise,
    togglePauseWorkout,
    finishActiveWorkout,
    cancelActiveWorkout,
    startRestTimer,
  } = useWorkout();

  const [isSelectExerciseModalOpen, setIsSelectExerciseModalOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<WorkoutType>('Push');
  const [customWorkoutName, setCustomWorkoutName] = useState('');
  const [workoutNotes, setWorkoutNotes] = useState('');

  const workoutTypes: WorkoutType[] = [
    'Push',
    'Pull',
    'Legs',
    'Upper Body',
    'Lower Body',
    'Full Body',
    'Custom',
  ];

  // If no workout active, show start screen with template & type selector
  if (!activeWorkout.session) {
    return (
      <div className="space-y-6 sm:space-y-8 max-w-4xl mx-auto animate-in fade-in duration-200">
        {/* Header */}
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Start a Workout
          </h2>
          <p className="text-sm text-[#999999] mt-1">
            Choose a structured split template or build a custom session from scratch.
          </p>
        </div>

        {/* Quick Start with Workout Type Selection */}
        <div className="bg-[#141414] rounded-2xl p-6 border border-[#262626]">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3">
            Quick Start by Movement Split
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
            {workoutTypes.slice(0, 4).map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
                  selectedType === type
                    ? 'bg-[#FF6B00] text-black shadow-lg shadow-[#FF6B00]/20'
                    : 'bg-[#1B1B1B] text-[#999999] hover:text-white hover:bg-[#222222] border border-[#262626]'
                }`}
              >
                {type} Day
              </button>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-2 mb-5">
            {workoutTypes.slice(4).map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
                  selectedType === type
                    ? 'bg-[#FF6B00] text-black shadow-lg shadow-[#FF6B00]/20'
                    : 'bg-[#1B1B1B] text-[#999999] hover:text-white hover:bg-[#222222] border border-[#262626]'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder={`Workout name (e.g. Heavy ${selectedType} Session)`}
              value={customWorkoutName}
              onChange={(e) => setCustomWorkoutName(e.target.value)}
              className="flex-1 bg-[#1B1B1B] border border-[#262626] rounded-xl px-4 py-2.5 text-sm text-white placeholder-[#666666] focus:outline-none focus:border-[#FF6B00]"
            />
            <button
              onClick={() => {
                startWorkout(
                  undefined,
                  selectedType,
                  customWorkoutName.trim() || `${selectedType} Session`
                );
              }}
              className="py-2.5 px-6 bg-[#FF6B00] hover:bg-[#FF8C32] text-black font-extrabold text-sm rounded-xl transition-all shadow-md shadow-[#FF6B00]/25 flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4 fill-black" />
              <span>Launch {selectedType} Session</span>
            </button>
          </div>
        </div>

        {/* Workout Templates Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white tracking-tight">
              Pre-built Split Templates
            </h3>
            <span className="text-xs text-[#777777]">
              {templates.length} routines available
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templates.map((tpl) => (
              <div
                key={tpl.id}
                className="bg-[#141414] rounded-2xl p-5 border border-[#262626] hover:border-[#FF6B00]/40 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-extrabold text-[#FF8C32] uppercase tracking-wider text-[10px] bg-[#FF6B00]/10 px-2 py-0.5 rounded">
                      {tpl.type}
                    </span>
                    <span className="text-[#777777] font-mono flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      ~{tpl.estimatedDurationMin}m
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-white mb-1.5">{tpl.name}</h4>
                  <p className="text-xs text-[#999999] leading-relaxed mb-4">
                    {tpl.description}
                  </p>

                  <div className="flex flex-wrap gap-1.5 mb-5">
                    {tpl.exercises.map((exId) => (
                      <span
                        key={exId}
                        className="text-[11px] px-2 py-0.5 rounded-md bg-[#1B1B1B] text-[#CCCCCC] border border-[#262626]"
                      >
                        {exId.replace(/-/g, ' ')}
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => startWorkout(tpl.id)}
                  className="w-full py-2.5 px-4 bg-[#1B1B1B] hover:bg-[#FF6B00] text-white hover:text-black font-extrabold text-xs rounded-xl border border-[#262626] hover:border-[#FF6B00] transition-all flex items-center justify-center gap-2"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Start Routine</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ACTIVE WORKOUT INTERFACE
  const session = activeWorkout.session;
  const alreadySelectedIds = session.exercises.map((e) => e.exerciseId);

  const handleFinish = () => {
    // Check if any completed sets exist
    const completedSetsCount = session.exercises.reduce(
      (acc, ex) => acc + ex.sets.filter((s) => s.completed).length,
      0
    );

    if (completedSetsCount === 0) {
      if (!window.confirm('You have not checked off any completed sets yet. Finish workout anyway?')) {
        return;
      }
    }

    finishActiveWorkout(workoutNotes);
  };

  const handleCancel = () => {
    if (window.confirm('Are you sure you want to discard this workout? All progress will be lost.')) {
      cancelActiveWorkout();
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-24 animate-in fade-in duration-150">
      {/* Sticky Active Workout Control HUD */}
      <div className="sticky top-16 z-20 bg-[#141414]/95 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-[#FF6B00]/40 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded-md bg-[#FF6B00] text-black text-[10px] font-black uppercase tracking-wider">
              {session.type}
            </span>
            <span className="text-xs text-[#999999]">In Progress</span>
          </div>
          <h2 className="text-lg sm:text-xl font-extrabold text-white">
            {session.name}
          </h2>
        </div>

        {/* Live Counters & Finish Action */}
        <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
          {/* Duration Clock */}
          <div className="bg-[#1B1B1B] px-3.5 py-2 rounded-xl border border-[#262626] flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#FF6B00]" />
            <span className="font-mono text-base font-bold text-white tabular-nums">
              {formatTimerDisplay(activeWorkout.elapsedSeconds)}
            </span>
            <button
              onClick={togglePauseWorkout}
              aria-label={activeWorkout.isPaused ? "Resume workout timer" : "Pause workout timer"}
              className="p-1 rounded-lg hover:bg-[#252525] text-[#999999] hover:text-white transition-colors"
              title={activeWorkout.isPaused ? 'Resume Timer' : 'Pause Timer'}
            >
              {activeWorkout.isPaused ? (
                <Play className="w-3.5 h-3.5 fill-white text-white" />
              ) : (
                <Pause className="w-3.5 h-3.5 fill-[#999999]" />
              )}
            </button>
          </div>

          {/* Live Volume */}
          <div className="bg-[#1B1B1B] px-3.5 py-2 rounded-xl border border-[#262626] flex items-center gap-2">
            <Dumbbell className="w-4 h-4 text-[#FF6B00]" />
            <div className="text-left">
              <span className="font-mono text-sm font-bold text-white tabular-nums">
                {formatVolume(session.totalVolume, userProfile.unit)}
              </span>
            </div>
          </div>

          {/* Finish Button */}
          <button
            onClick={handleFinish}
            className="py-2.5 px-5 bg-[#FF6B00] hover:bg-[#FF8C32] text-black font-extrabold text-xs sm:text-sm rounded-xl transition-all shadow-lg shadow-[#FF6B00]/30 hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap"
          >
            Finish Workout
          </button>

          {/* Cancel */}
          <button
            onClick={handleCancel}
            aria-label="Discard workout"
            className="p-2 rounded-xl text-[#777777] hover:text-red-400 hover:bg-[#1B1B1B] transition-colors"
            title="Discard Session"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Exercises List */}
      <div className="space-y-4">
        {session.exercises.length === 0 ? (
          <div className="text-center py-12 bg-[#141414] rounded-2xl border border-[#262626]">
            <Dumbbell className="w-10 h-10 text-[#555555] mx-auto mb-3" />
            <h3 className="text-base font-bold text-white mb-1">No Exercises Added Yet</h3>
            <p className="text-xs text-[#777777] max-w-sm mx-auto mb-4">
              Add your first movement to start tracking your working sets and weights.
            </p>
            <button
              onClick={() => setIsSelectExerciseModalOpen(true)}
              className="py-2.5 px-5 bg-[#FF6B00] hover:bg-[#FF8C32] text-black font-extrabold text-xs rounded-xl shadow-md transition-all inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Add Exercise</span>
            </button>
          </div>
        ) : (
          session.exercises.map((exercise, exIndex) => (
            <div
              key={exercise.id}
              className="bg-[#141414] rounded-2xl p-5 border border-[#262626] transition-all"
            >
              {/* Exercise Card Header */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#262626]">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-lg bg-[#1B1B1B] text-[#999999] font-mono text-xs font-bold flex items-center justify-center">
                    {exIndex + 1}
                  </span>
                  <div>
                    <h3 className="text-base font-bold text-white">
                      {exercise.exerciseName}
                    </h3>
                    <span className="text-xs text-[#FF8C32] font-semibold">
                      {exercise.muscleGroup}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => startRestTimer(90)}
                    aria-label={`Start 90s rest timer for ${exercise.exerciseName}`}
                    className="p-1.5 rounded-lg text-[#777777] hover:text-[#FF8C32] hover:bg-[#1B1B1B] transition-colors"
                    title="Start 90s Rest Timer"
                  >
                    <Timer className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => removeExerciseFromActiveWorkout(exercise.id)}
                    aria-label={`Remove ${exercise.exerciseName} from workout`}
                    className="p-1.5 rounded-lg text-[#777777] hover:text-red-400 hover:bg-[#1B1B1B] transition-colors"
                    title="Remove Exercise"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Sets Table */}
              <div className="space-y-2">
                <div className="grid grid-cols-12 gap-2 text-[10px] font-bold text-[#777777] uppercase px-2 pb-1">
                  <span className="col-span-2">Set</span>
                  <span className="col-span-4">Weight ({userProfile.unit})</span>
                  <span className="col-span-3">Reps</span>
                  <span className="col-span-3 text-right">Done</span>
                </div>

                {exercise.sets.map((set, sIdx) => (
                  <div
                    key={set.id}
                    className={`grid grid-cols-12 gap-2 items-center p-2 rounded-xl transition-colors ${
                      set.completed
                        ? 'bg-[#32D583]/10 border border-[#32D583]/30'
                        : 'bg-[#1B1B1B] border border-[#262626]'
                    }`}
                  >
                    {/* Set # */}
                    <div className="col-span-2 flex items-center gap-1.5">
                      <span className="font-mono text-xs font-bold text-white">
                        #{set.setNumber}
                      </span>
                    </div>

                    {/* Weight Input */}
                    <div className="col-span-4">
                      <input
                        type="number"
                        min="0"
                        step="2.5"
                        value={set.weight || ''}
                        onChange={(e) =>
                          updateWorkoutSet(exercise.id, set.id, {
                            weight: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="w-full bg-[#141414] border border-[#262626] rounded-lg px-2.5 py-1.5 text-xs sm:text-sm font-mono font-bold text-white text-center focus:outline-none focus:border-[#FF6B00]"
                      />
                    </div>

                    {/* Reps Input */}
                    <div className="col-span-3">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={set.reps || ''}
                        onChange={(e) =>
                          updateWorkoutSet(exercise.id, set.id, {
                            reps: parseInt(e.target.value, 10) || 0,
                          })
                        }
                        className="w-full bg-[#141414] border border-[#262626] rounded-lg px-2.5 py-1.5 text-xs sm:text-sm font-mono font-bold text-white text-center focus:outline-none focus:border-[#FF6B00]"
                      />
                    </div>

                    {/* Complete Button & Delete Set */}
                    <div className="col-span-3 flex items-center justify-end gap-1.5">
                      <button
                        onClick={() =>
                          updateWorkoutSet(exercise.id, set.id, {
                            completed: !set.completed,
                          })
                        }
                        aria-label={`Mark set ${set.setNumber} for ${exercise.exerciseName} as ${set.completed ? 'incomplete' : 'complete'}`}
                        className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center transition-all ${
                          set.completed
                            ? 'bg-[#32D583] text-black shadow-md shadow-[#32D583]/30'
                            : 'bg-[#262626] text-[#777777] hover:bg-[#333333] hover:text-white'
                        }`}
                      >
                        <Check className="w-4 h-4 stroke-[3]" />
                      </button>

                      {exercise.sets.length > 1 && (
                        <button
                          onClick={() => removeSetFromExercise(exercise.id, set.id)}
                          aria-label={`Delete set ${set.setNumber}`}
                          className="p-1 rounded-md text-[#555555] hover:text-red-400 transition-colors"
                          title="Delete Set"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Set Button */}
              <div className="pt-3 mt-1">
                <button
                  onClick={() => addSetToExercise(exercise.id)}
                  className="py-1.5 px-3 bg-[#1B1B1B] hover:bg-[#222222] text-[#CCCCCC] hover:text-white rounded-lg text-xs font-bold border border-[#262626] transition-colors flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5 text-[#FF6B00]" />
                  <span>Add Set</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Exercise & Session Notes Bottom Area */}
      <div className="space-y-4">
        <button
          onClick={() => setIsSelectExerciseModalOpen(true)}
          className="w-full py-3.5 bg-[#141414] hover:bg-[#1B1B1B] border-2 border-dashed border-[#262626] hover:border-[#FF6B00]/60 rounded-2xl text-xs sm:text-sm font-bold text-white transition-all flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4 text-[#FF6B00] stroke-[3]" />
          <span>Add Another Exercise to Workout</span>
        </button>

        {/* Workout Notes */}
        <div className="bg-[#141414] rounded-2xl p-4 border border-[#262626]">
          <label className="block text-xs font-bold text-[#CCCCCC] uppercase tracking-wider mb-1.5">
            Workout Notes / RPE
          </label>
          <textarea
            rows={2}
            placeholder="Record subjective pump, energy level, joint sensations, or notes for next time..."
            value={workoutNotes}
            onChange={(e) => setWorkoutNotes(e.target.value)}
            className="w-full bg-[#1B1B1B] border border-[#262626] rounded-xl p-3 text-xs sm:text-sm text-white placeholder-[#666666] focus:outline-none focus:border-[#FF6B00] transition-colors"
          />
        </div>
      </div>

      {/* Modal to pick an exercise */}
      <SelectExerciseModal
        isOpen={isSelectExerciseModalOpen}
        onClose={() => setIsSelectExerciseModalOpen(false)}
        alreadySelectedIds={alreadySelectedIds}
        onSelect={(exerciseId) => addExerciseToActiveWorkout(exerciseId)}
      />
    </div>
  );
};
