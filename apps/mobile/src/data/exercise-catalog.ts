import { asc, eq, inArray } from 'drizzle-orm';

import { bootstrapLocalDataLayer, type LocalDatabase } from './bootstrap';
import { exerciseDefinitions, exerciseMuscleMappings, muscleGroups } from './schema';

export type ExerciseCatalogMuscleGroup = {
  id: string;
  displayName: string;
  familyName: string;
  sortOrder: number;
};

export type ExerciseCatalogExerciseMuscleMapping = {
  id: string;
  muscleGroupId: string;
  weight: number;
  role: 'primary' | 'secondary' | 'stabilizer' | null;
};

export type ExerciseCatalogExercise = {
  id: string;
  name: string;
  mappings: ExerciseCatalogExerciseMuscleMapping[];
};

export type SaveExerciseCatalogExerciseInput = {
  id?: string;
  name: string;
  mappings: {
    muscleGroupId: string;
    weight: number;
    role?: 'primary' | 'secondary' | 'stabilizer' | null;
  }[];
  now?: Date;
};

export type ExerciseCatalogStore = {
  listMuscleGroups(): Promise<ExerciseCatalogMuscleGroup[]>;
  listExercises(): Promise<ExerciseCatalogExercise[]>;
  saveExercise(input: {
    id?: string;
    name: string;
    mappings: {
      muscleGroupId: string;
      weight: number;
      role: 'primary' | 'secondary' | 'stabilizer' | null;
    }[];
    now: Date;
  }): Promise<ExerciseCatalogExercise>;
};

const createLocalId = (prefix: string) =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

const mapExerciseGraph = (
  exerciseRow:
    | {
        id: string;
        name: string;
      }
    | undefined,
  mappingRows: {
    id: string;
    exerciseDefinitionId: string;
    muscleGroupId: string;
    weight: number;
    role: 'primary' | 'secondary' | 'stabilizer' | null;
  }[]
): ExerciseCatalogExercise => {
  if (!exerciseRow) {
    throw new Error('Exercise not found after save');
  }

  return {
    id: exerciseRow.id,
    name: exerciseRow.name,
    mappings: mappingRows
      .filter((mapping) => mapping.exerciseDefinitionId === exerciseRow.id)
      .map((mapping) => ({
        id: mapping.id,
        muscleGroupId: mapping.muscleGroupId,
        weight: mapping.weight,
        role: mapping.role,
      })),
  };
};

const listExerciseGraphs = async (database: LocalDatabase): Promise<ExerciseCatalogExercise[]> => {
  const exerciseRows = database
    .select({
      id: exerciseDefinitions.id,
      name: exerciseDefinitions.name,
    })
    .from(exerciseDefinitions)
    .orderBy(asc(exerciseDefinitions.name))
    .all();

  if (exerciseRows.length === 0) {
    return [];
  }

  const exerciseIds = exerciseRows.map((row) => row.id);
  const mappingRows = database
    .select({
      id: exerciseMuscleMappings.id,
      exerciseDefinitionId: exerciseMuscleMappings.exerciseDefinitionId,
      muscleGroupId: exerciseMuscleMappings.muscleGroupId,
      weight: exerciseMuscleMappings.weight,
      role: exerciseMuscleMappings.role,
    })
    .from(exerciseMuscleMappings)
    .where(inArray(exerciseMuscleMappings.exerciseDefinitionId, exerciseIds))
    .orderBy(asc(exerciseMuscleMappings.exerciseDefinitionId), asc(exerciseMuscleMappings.muscleGroupId))
    .all();

  return exerciseRows.map((exerciseRow) => mapExerciseGraph(exerciseRow, mappingRows));
};

export const createDrizzleExerciseCatalogStore = (): ExerciseCatalogStore => ({
  async listMuscleGroups() {
    const database = await bootstrapLocalDataLayer();

    return database
      .select({
        id: muscleGroups.id,
        displayName: muscleGroups.displayName,
        familyName: muscleGroups.familyName,
        sortOrder: muscleGroups.sortOrder,
      })
      .from(muscleGroups)
      .orderBy(asc(muscleGroups.sortOrder), asc(muscleGroups.displayName))
      .all();
  },
  async listExercises() {
    const database = await bootstrapLocalDataLayer();
    return listExerciseGraphs(database);
  },
  async saveExercise(input) {
    const database = await bootstrapLocalDataLayer();
    const exerciseId = input.id ?? createLocalId('exercise-definition');

    database.transaction((tx) => {
      const existing = tx
        .select({ id: exerciseDefinitions.id })
        .from(exerciseDefinitions)
        .where(eq(exerciseDefinitions.id, exerciseId))
        .get();

      if (existing) {
        tx.update(exerciseDefinitions)
          .set({
            name: input.name,
            updatedAt: input.now,
          })
          .where(eq(exerciseDefinitions.id, exerciseId))
          .run();
      } else {
        tx.insert(exerciseDefinitions)
          .values({
            id: exerciseId,
            name: input.name,
            createdAt: input.now,
            updatedAt: input.now,
          })
          .run();
      }

      tx.delete(exerciseMuscleMappings)
        .where(eq(exerciseMuscleMappings.exerciseDefinitionId, exerciseId))
        .run();

      for (const mapping of input.mappings) {
        tx.insert(exerciseMuscleMappings)
          .values({
            id: createLocalId('exercise-muscle-mapping'),
            exerciseDefinitionId: exerciseId,
            muscleGroupId: mapping.muscleGroupId,
            weight: mapping.weight,
            role: mapping.role,
            createdAt: input.now,
            updatedAt: input.now,
          })
          .run();
      }
    });

    const exerciseRow = database
      .select({
        id: exerciseDefinitions.id,
        name: exerciseDefinitions.name,
      })
      .from(exerciseDefinitions)
      .where(eq(exerciseDefinitions.id, exerciseId))
      .get();

    const mappingRows = database
      .select({
        id: exerciseMuscleMappings.id,
        exerciseDefinitionId: exerciseMuscleMappings.exerciseDefinitionId,
        muscleGroupId: exerciseMuscleMappings.muscleGroupId,
        weight: exerciseMuscleMappings.weight,
        role: exerciseMuscleMappings.role,
      })
      .from(exerciseMuscleMappings)
      .where(eq(exerciseMuscleMappings.exerciseDefinitionId, exerciseId))
      .orderBy(asc(exerciseMuscleMappings.muscleGroupId))
      .all();

    return mapExerciseGraph(exerciseRow, mappingRows);
  },
});

const assertFiniteDate = (value: Date) => {
  if (!(value instanceof Date) || Number.isNaN(value.getTime())) {
    throw new Error('now must be a valid Date');
  }
};

export const createExerciseCatalogRepository = (store: ExerciseCatalogStore = createDrizzleExerciseCatalogStore()) => ({
  listMuscleGroups() {
    return store.listMuscleGroups();
  },
  listExercises() {
    return store.listExercises();
  },
  async saveExercise(input: SaveExerciseCatalogExerciseInput): Promise<ExerciseCatalogExercise> {
    const name = input.name.trim();
    if (!name) {
      throw new Error('Exercise name is required');
    }

    if (input.mappings.length < 1) {
      throw new Error('At least one muscle link is required');
    }

    const now = input.now ?? new Date();
    assertFiniteDate(now);

    const knownMuscleIds = new Set((await store.listMuscleGroups()).map((muscleGroup) => muscleGroup.id));
    const seenMuscleIds = new Set<string>();

    const normalizedMappings = input.mappings.map((mapping, index) => {
      if (seenMuscleIds.has(mapping.muscleGroupId)) {
        throw new Error(`Duplicate muscle link at index ${index}: ${mapping.muscleGroupId}`);
      }
      seenMuscleIds.add(mapping.muscleGroupId);

      if (!knownMuscleIds.has(mapping.muscleGroupId)) {
        throw new Error(`Unknown muscle group: ${mapping.muscleGroupId}`);
      }

      if (!Number.isFinite(mapping.weight) || mapping.weight <= 0 || mapping.weight > 10) {
        throw new Error(`Invalid muscle weight for ${mapping.muscleGroupId}: ${mapping.weight}`);
      }

      return {
        muscleGroupId: mapping.muscleGroupId,
        weight: mapping.weight,
        role: mapping.role ?? null,
      };
    });

    return store.saveExercise({
      id: input.id,
      name,
      mappings: normalizedMappings,
      now,
    });
  },
});

const defaultExerciseCatalogRepository = createExerciseCatalogRepository();

export const listExerciseCatalogMuscleGroups = defaultExerciseCatalogRepository.listMuscleGroups;
export const listExerciseCatalogExercises = defaultExerciseCatalogRepository.listExercises;
export const saveExerciseCatalogExercise = defaultExerciseCatalogRepository.saveExercise;
