import type { ExerciseCatalogExercise, ExerciseCatalogMuscleGroup } from '@/src/data/exercise-catalog';

export const normalizeExerciseSearchWords = (value: string): string[] =>
  value
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter((word) => word.length > 0);

export const indexExerciseCatalogMuscleGroupsById = (
  muscleGroups: ExerciseCatalogMuscleGroup[]
): Record<string, ExerciseCatalogMuscleGroup> =>
  muscleGroups.reduce<Record<string, ExerciseCatalogMuscleGroup>>((indexed, muscleGroup) => {
    indexed[muscleGroup.id] = muscleGroup;
    return indexed;
  }, {});

const buildExerciseCatalogSearchText = (
  exercise: ExerciseCatalogExercise,
  muscleGroupsById: Record<string, ExerciseCatalogMuscleGroup>
): string => {
  const muscleTerms = exercise.mappings.flatMap((mapping) => {
    if (mapping.role !== 'primary') {
      return [];
    }

    const matchedMuscleGroup = muscleGroupsById[mapping.muscleGroupId];
    if (!matchedMuscleGroup) {
      return [];
    }

    return [matchedMuscleGroup.displayName, matchedMuscleGroup.familyName];
  });

  return [exercise.name, ...muscleTerms].join(' ').toLowerCase();
};

export const filterExerciseCatalogExercises = (
  exercises: ExerciseCatalogExercise[],
  muscleGroupsById: Record<string, ExerciseCatalogMuscleGroup>,
  query: string
): ExerciseCatalogExercise[] => {
  const searchWords = normalizeExerciseSearchWords(query);
  if (searchWords.length === 0) {
    return exercises;
  }

  return exercises.filter((exercise) => {
    const searchText = buildExerciseCatalogSearchText(exercise, muscleGroupsById);
    return searchWords.every((searchWord) => searchText.includes(searchWord));
  });
};
