import React, { useState, useEffect } from 'react';
import { X, Dumbbell, AlertCircle } from 'lucide-react';
import { Exercise, MuscleGroup, EquipmentType, DifficultyLevel } from '../types';
import { useWorkout } from '../context/WorkoutContext';

interface ExerciseModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingExercise?: Exercise | null;
}

export const ExerciseModal: React.FC<ExerciseModalProps> = ({
  isOpen,
  onClose,
  editingExercise,
}) => {
  const { addCustomExercise, updateExercise } = useWorkout();

  const [name, setName] = useState('');
  const [muscleGroup, setMuscleGroup] = useState<MuscleGroup>('Chest');
  const [equipment, setEquipment] = useState<EquipmentType>('Barbell');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('Intermediate');
  const [instructions, setInstructions] = useState('');
  const [targetMusclesInput, setTargetMusclesInput] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingExercise) {
      setName(editingExercise.name);
      setMuscleGroup(editingExercise.muscleGroup);
      setEquipment(editingExercise.equipment);
      setDifficulty(editingExercise.difficulty);
      setInstructions(editingExercise.instructions || '');
      setTargetMusclesInput(editingExercise.targetMuscles ? editingExercise.targetMuscles.join(', ') : '');
    } else {
      setName('');
      setMuscleGroup('Chest');
      setEquipment('Barbell');
      setDifficulty('Intermediate');
      setInstructions('');
      setTargetMusclesInput('');
    }
    setError('');
  }, [editingExercise, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please provide an exercise name.');
      return;
    }

    const targetMuscles = targetMusclesInput
      .split(',')
      .map((m) => m.trim())
      .filter(Boolean);

    if (editingExercise) {
      updateExercise(editingExercise.id, {
        name: name.trim(),
        muscleGroup,
        equipment,
        difficulty,
        instructions: instructions.trim(),
        targetMuscles: targetMuscles.length > 0 ? targetMuscles : [muscleGroup],
      });
    } else {
      addCustomExercise({
        name: name.trim(),
        muscleGroup,
        equipment,
        difficulty,
        instructions: instructions.trim() || 'Execute with controlled eccentric and explosive concentric drive.',
        targetMuscles: targetMuscles.length > 0 ? targetMuscles : [muscleGroup],
      });
    }

    onClose();
  };

  const muscleOptions: MuscleGroup[] = ['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core'];
  const equipmentOptions: EquipmentType[] = ['Barbell', 'Dumbbell', 'Machine', 'Cable', 'Bodyweight', 'Kettlebell', 'Other'];
  const difficultyOptions: DifficultyLevel[] = ['Beginner', 'Intermediate', 'Advanced'];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="exercise-modal-title"
    >
      <div className="bg-[#141414] border border-[#262626] rounded-2xl max-w-lg w-full p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
        <div className="flex items-center justify-between pb-4 border-b border-[#262626]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#FF6B00]/15 flex items-center justify-center text-[#FF6B00]">
              <Dumbbell className="w-4 h-4 stroke-[2.5]" />
            </div>
            <h2 id="exercise-modal-title" className="text-lg font-bold text-white">
              {editingExercise ? 'Edit Exercise' : 'Create Custom Exercise'}
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

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-2 text-xs text-red-400">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Exercise Name */}
          <div>
            <label className="block text-xs font-bold text-[#CCCCCC] uppercase tracking-wider mb-1.5">
              Exercise Name *
            </label>
            <input
              type="text"
              placeholder="e.g. Bulgarian Split Squat"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#1B1B1B] border border-[#262626] rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-[#666666] focus:outline-none focus:border-[#FF6B00] transition-colors"
            />
          </div>

          {/* Muscle Group & Equipment */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#CCCCCC] uppercase tracking-wider mb-1.5">
                Primary Muscle Group
              </label>
              <select
                value={muscleGroup}
                onChange={(e) => setMuscleGroup(e.target.value as MuscleGroup)}
                className="w-full bg-[#1B1B1B] border border-[#262626] rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FF6B00] transition-colors"
              >
                {muscleOptions.map((opt) => (
                  <option key={opt} value={opt} className="bg-[#1B1B1B]">
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#CCCCCC] uppercase tracking-wider mb-1.5">
                Equipment Type
              </label>
              <select
                value={equipment}
                onChange={(e) => setEquipment(e.target.value as EquipmentType)}
                className="w-full bg-[#1B1B1B] border border-[#262626] rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FF6B00] transition-colors"
              >
                {equipmentOptions.map((opt) => (
                  <option key={opt} value={opt} className="bg-[#1B1B1B]">
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Difficulty Level */}
          <div>
            <label className="block text-xs font-bold text-[#CCCCCC] uppercase tracking-wider mb-1.5">
              Difficulty Level
            </label>
            <div className="grid grid-cols-3 gap-2">
              {difficultyOptions.map((diff) => (
                <button
                  type="button"
                  key={diff}
                  onClick={() => setDifficulty(diff)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all text-center ${
                    difficulty === diff
                      ? 'bg-[#FF6B00] text-black shadow-md shadow-[#FF6B00]/20'
                      : 'bg-[#1B1B1B] text-[#999999] hover:bg-[#252525] border border-[#262626]'
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>

          {/* Target Anatomy */}
          <div>
            <label className="block text-xs font-bold text-[#CCCCCC] uppercase tracking-wider mb-1.5">
              Specific Target Muscles (comma separated)
            </label>
            <input
              type="text"
              placeholder="e.g. Quadriceps, Gluteus Medius, Adductors"
              value={targetMusclesInput}
              onChange={(e) => setTargetMusclesInput(e.target.value)}
              className="w-full bg-[#1B1B1B] border border-[#262626] rounded-xl px-3.5 py-2 text-sm text-white placeholder-[#666666] focus:outline-none focus:border-[#FF6B00] transition-colors"
            />
          </div>

          {/* Technique & Form Instructions */}
          <div>
            <label className="block text-xs font-bold text-[#CCCCCC] uppercase tracking-wider mb-1.5">
              Technique & Form Cues
            </label>
            <textarea
              rows={3}
              placeholder="Key cues for setup, trajectory, breath control, and lockout..."
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              className="w-full bg-[#1B1B1B] border border-[#262626] rounded-xl px-3.5 py-2 text-sm text-white placeholder-[#666666] focus:outline-none focus:border-[#FF6B00] transition-colors"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 bg-[#1B1B1B] hover:bg-[#222222] border border-[#262626] text-white text-xs font-bold rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 px-4 bg-[#FF6B00] hover:bg-[#FF8C32] text-black text-xs font-extrabold rounded-xl transition-all shadow-lg shadow-[#FF6B00]/20"
            >
              {editingExercise ? 'Update Exercise' : 'Save Exercise'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
