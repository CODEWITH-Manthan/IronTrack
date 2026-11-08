import React, { useState, useMemo } from 'react';
import { Search, X, Plus, Check, Dumbbell } from 'lucide-react';
import { useWorkout } from '../context/WorkoutContext';
import { MuscleGroup } from '../types';

interface SelectExerciseModalProps {
  isOpen: boolean;
  onClose: () => void;
  alreadySelectedIds: string[];
  onSelect: (exerciseId: string) => void;
}

export const SelectExerciseModal: React.FC<SelectExerciseModalProps> = ({
  isOpen,
  onClose,
  alreadySelectedIds,
  onSelect,
}) => {
  const { exercises } = useWorkout();
  const [search, setSearch] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState<string>('All');

  const muscleGroups: ('All' | MuscleGroup)[] = [
    'All',
    'Chest',
    'Back',
    'Legs',
    'Shoulders',
    'Arms',
    'Core',
  ];

  const filteredExercises = useMemo(() => {
    return exercises.filter((ex) => {
      const matchesSearch =
        ex.name.toLowerCase().includes(search.toLowerCase()) ||
        ex.muscleGroup.toLowerCase().includes(search.toLowerCase()) ||
        ex.equipment.toLowerCase().includes(search.toLowerCase());
      const matchesMuscle =
        selectedMuscle === 'All' || ex.muscleGroup === selectedMuscle;
      return matchesSearch && matchesMuscle;
    });
  }, [exercises, search, selectedMuscle]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="select-exercise-title"
    >
      <div className="bg-[#141414] border border-[#262626] rounded-2xl max-w-xl w-full p-5 sm:p-6 shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#262626]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#FF6B00]/15 flex items-center justify-center text-[#FF6B00]">
              <Dumbbell className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <h2 id="select-exercise-title" className="text-lg font-bold text-white">
                Add Exercise to Workout
              </h2>
              <p className="text-xs text-[#999999]">
                Choose from vault or search by muscle group
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1.5 rounded-lg text-[#777777] hover:text-white hover:bg-[#1B1B1B] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Input */}
        <div className="pt-4 pb-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#777777]" />
            <input
              type="text"
              placeholder="Search exercise (e.g. Bench, Squat, Cable)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#1B1B1B] border border-[#262626] rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-[#666666] focus:outline-none focus:border-[#FF6B00] transition-colors"
              autoFocus
            />
          </div>
        </div>

        {/* Muscle Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-3 mb-2 scrollbar-none">
          {muscleGroups.map((muscle) => (
            <button
              key={muscle}
              onClick={() => setSelectedMuscle(muscle)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedMuscle === muscle
                  ? 'bg-[#FF6B00] text-black'
                  : 'bg-[#1B1B1B] text-[#999999] hover:text-white hover:bg-[#222222]'
              }`}
            >
              {muscle}
            </button>
          ))}
        </div>

        {/* Exercise List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {filteredExercises.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-sm text-[#777777]">No exercises found matching your search.</p>
            </div>
          ) : (
            filteredExercises.map((ex) => {
              const isAlreadyAdded = alreadySelectedIds.includes(ex.id);

              return (
                <div
                  key={ex.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-[#1B1B1B] border border-[#262626] hover:border-[#FF6B00]/40 transition-colors"
                >
                  <div className="min-w-0 pr-3">
                    <p className="text-sm font-bold text-white truncate">{ex.name}</p>
                    <div className="flex items-center gap-2 text-xs text-[#999999] mt-0.5">
                      <span>{ex.muscleGroup}</span>
                      <span aria-hidden="true">·</span>
                      <span>{ex.equipment}</span>
                      <span aria-hidden="true">·</span>
                      <span className="text-[#CCCCCC]">{ex.difficulty}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      onSelect(ex.id);
                      onClose();
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shrink-0 ${
                      isAlreadyAdded
                        ? 'bg-[#222222] text-[#999999] hover:bg-[#262626]'
                        : 'bg-[#FF6B00] hover:bg-[#FF8C32] text-black shadow-md shadow-[#FF6B00]/20'
                    }`}
                  >
                    {isAlreadyAdded ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Add Again</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5 stroke-[3]" />
                        <span>Select</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
