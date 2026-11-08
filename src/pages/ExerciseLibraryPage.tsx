import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Plus, 
  Dumbbell, 
  Edit3, 
  Trash2, 
  Trophy, 
  Info, 
  Filter,
  Check
} from 'lucide-react';
import { useWorkout } from '../context/WorkoutContext';
import { Exercise, MuscleGroup, EquipmentType, DifficultyLevel } from '../types';
import { calculatePersonalRecords } from '../utils/calculations';
import { ExerciseModal } from '../components/ExerciseModal';

interface ExerciseLibraryPageProps {
  onStartWithExercise?: (exerciseId: string) => void;
}

export const ExerciseLibraryPage: React.FC<ExerciseLibraryPageProps> = () => {
  const { exercises, workouts, userProfile, deleteExercise } = useWorkout();

  const [search, setSearch] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState<string>('All');
  const [selectedEquipment, setSelectedEquipment] = useState<string>('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const [selectedDetailExercise, setSelectedDetailExercise] = useState<Exercise | null>(null);

  // Compute PRs for badge display
  const prs = useMemo(() => calculatePersonalRecords(workouts), [workouts]);

  const muscleCategories: ('All' | MuscleGroup)[] = [
    'All',
    'Chest',
    'Back',
    'Legs',
    'Shoulders',
    'Arms',
    'Core',
  ];

  const equipmentOptions: ('All' | EquipmentType)[] = [
    'All',
    'Barbell',
    'Dumbbell',
    'Machine',
    'Cable',
    'Bodyweight',
  ];

  const difficultyOptions: ('All' | DifficultyLevel)[] = [
    'All',
    'Beginner',
    'Intermediate',
    'Advanced',
  ];

  // Filtering
  const filteredExercises = useMemo(() => {
    return exercises.filter((ex) => {
      const matchesSearch =
        ex.name.toLowerCase().includes(search.toLowerCase()) ||
        ex.muscleGroup.toLowerCase().includes(search.toLowerCase()) ||
        ex.equipment.toLowerCase().includes(search.toLowerCase()) ||
        ex.targetMuscles.some((m) => m.toLowerCase().includes(search.toLowerCase()));

      const matchesMuscle =
        selectedMuscle === 'All' || ex.muscleGroup === selectedMuscle;
      const matchesEquipment =
        selectedEquipment === 'All' || ex.equipment === selectedEquipment;
      const matchesDifficulty =
        selectedDifficulty === 'All' || ex.difficulty === selectedDifficulty;

      return matchesSearch && matchesMuscle && matchesEquipment && matchesDifficulty;
    });
  }, [exercises, search, selectedMuscle, selectedEquipment, selectedDifficulty]);

  const handleOpenAdd = () => {
    setEditingExercise(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (ex: Exercise) => {
    setEditingExercise(ex);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}" from your library?`)) {
      deleteExercise(id);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-in fade-in duration-200">
      {/* Header + Add CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Exercise Library
          </h2>
          <p className="text-sm text-[#999999] mt-1">
            Browse movement patterns, muscle anatomy cues, and logged personal records.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="py-2.5 px-4 bg-[#FF6B00] hover:bg-[#FF8C32] text-black font-extrabold text-xs sm:text-sm rounded-xl transition-all shadow-md shadow-[#FF6B00]/20 flex items-center justify-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Add Custom Exercise</span>
        </button>
      </div>

      {/* Search & Category Filter Controls */}
      <div className="bg-[#141414] rounded-2xl p-4 sm:p-5 border border-[#262626] space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#777777]" />
          <input
            type="text"
            placeholder="Search exercises by name, muscle, or equipment..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#1B1B1B] border border-[#262626] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-[#666666] focus:outline-none focus:border-[#FF6B00] transition-colors"
          />
        </div>

        {/* Muscle Group Segmented Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {muscleCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedMuscle(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedMuscle === cat
                  ? 'bg-[#FF6B00] text-black shadow-md shadow-[#FF6B00]/20'
                  : 'bg-[#1B1B1B] text-[#999999] hover:text-white hover:bg-[#222222] border border-[#262626]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Sub-Filters: Equipment & Difficulty */}
        <div className="flex flex-wrap items-center gap-3 pt-1 border-t border-[#262626]/80 text-xs text-[#999999]">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#CCCCCC]">Equipment:</span>
            <select
              value={selectedEquipment}
              onChange={(e) => setSelectedEquipment(e.target.value)}
              className="bg-[#1B1B1B] border border-[#262626] rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-[#FF6B00]"
            >
              {equipmentOptions.map((eq) => (
                <option key={eq} value={eq} className="bg-[#1B1B1B]">
                  {eq}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#CCCCCC]">Difficulty:</span>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="bg-[#1B1B1B] border border-[#262626] rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-[#FF6B00]"
            >
              {difficultyOptions.map((diff) => (
                <option key={diff} value={diff} className="bg-[#1B1B1B]">
                  {diff}
                </option>
              ))}
            </select>
          </div>

          <span className="ml-auto text-[11px] text-[#777777]">
            Showing {filteredExercises.length} of {exercises.length} movements
          </span>
        </div>
      </div>

      {/* Exercises Grid */}
      {filteredExercises.length === 0 ? (
        <div className="text-center py-16 bg-[#141414] rounded-2xl border border-[#262626]">
          <Dumbbell className="w-10 h-10 text-[#555555] mx-auto mb-3" />
          <h3 className="text-base font-bold text-white mb-1">No Exercises Found</h3>
          <p className="text-xs text-[#777777] max-w-sm mx-auto mb-4">
            Try adjusting your search query or muscle group filters.
          </p>
          <button
            onClick={() => {
              setSearch('');
              setSelectedMuscle('All');
              setSelectedEquipment('All');
              setSelectedDifficulty('All');
            }}
            className="py-2 px-4 bg-[#1B1B1B] hover:bg-[#252525] text-[#FF8C32] rounded-xl text-xs font-bold border border-[#262626]"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredExercises.map((exercise) => {
            const pr = prs[exercise.name];

            return (
              <div
                key={exercise.id}
                className="bg-[#141414] rounded-2xl p-5 border border-[#262626] hover:border-[#FF6B00]/40 transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Top Bar: Muscle & Equipment */}
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-extrabold text-[#FF8C32] uppercase tracking-wider text-[10px] bg-[#FF6B00]/10 px-2 py-0.5 rounded">
                      {exercise.muscleGroup}
                    </span>
                    <span className="text-[11px] font-semibold text-[#888888]">
                      {exercise.equipment} · {exercise.difficulty}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white mb-1.5 group-hover:text-[#FF8C32] transition-colors">
                    {exercise.name}
                  </h3>

                  {/* Target muscles */}
                  {exercise.targetMuscles && exercise.targetMuscles.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {exercise.targetMuscles.slice(0, 3).map((tm) => (
                        <span
                          key={tm}
                          className="text-[10px] px-2 py-0.5 bg-[#1B1B1B] text-[#AAAAAA] rounded-md border border-[#262626]"
                        >
                          {tm}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Technique instructions preview */}
                  <p className="text-xs text-[#777777] line-clamp-2 leading-relaxed mb-4">
                    {exercise.instructions}
                  </p>
                </div>

                {/* Footer: PR preview & Actions */}
                <div className="pt-3 border-t border-[#262626] flex items-center justify-between">
                  {pr ? (
                    <div className="flex items-center gap-1.5 text-xs">
                      <Trophy className="w-3.5 h-3.5 text-[#FF6B00]" />
                      <span className="font-mono text-white font-bold tabular-nums">
                        PR: {pr.maxWeight} {userProfile.unit}
                      </span>
                      <span className="text-[10px] text-[#777777]">x {pr.maxRepsAtMaxWeight}</span>
                    </div>
                  ) : (
                    <span className="text-[11px] text-[#666666]">No logs yet</span>
                  )}

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(exercise)}
                      className="p-1.5 rounded-lg text-[#777777] hover:text-white hover:bg-[#1B1B1B] transition-colors"
                      title="Edit Exercise"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    {exercise.isCustom && (
                      <button
                        onClick={() => handleDelete(exercise.id, exercise.name)}
                        className="p-1.5 rounded-lg text-[#777777] hover:text-red-400 hover:bg-[#1B1B1B] transition-colors"
                        title="Delete Exercise"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Exercise Modal */}
      <ExerciseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editingExercise={editingExercise}
      />
    </div>
  );
};
