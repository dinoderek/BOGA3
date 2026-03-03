import { asc, eq, inArray, isNull } from 'drizzle-orm';

import { bootstrapLocalDataLayer, type LocalDatabase } from './bootstrap';
import { buildExerciseVariationDescriptor, buildExerciseVariationLabel, normalizeSlug, normalizeWhitespace } from './exercise-variation-utils';
import {
  exerciseDefinitions,
  exerciseMuscleMappings,
  exerciseVariationAttributes,
  exerciseVariationKeys,
  exerciseVariationValues,
  exerciseVariations,
  muscleGroups,
} from './schema';

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

export type ExerciseCatalogVariationValue = {
  id: string;
  variationKeyId: string;
  slug: string;
  displayName: string;
  isSystem: boolean;
};

export type ExerciseCatalogVariationKey = {
  id: string;
  slug: string;
  displayName: string;
  isSystem: boolean;
  values: ExerciseCatalogVariationValue[];
};

export type ExerciseCatalogVariationAttribute = {
  id: string;
  orderIndex: number;
  variationKeyId: string;
  variationKeySlug: string;
  variationKeyDisplayName: string;
  variationValueId: string;
  variationValueSlug: string;
  variationValueDisplayName: string;
};

export type ExerciseCatalogVariation = {
  id: string;
  exerciseDefinitionId: string;
  label: string;
  descriptor: string;
  deletedAt: Date | null;
  attributes: ExerciseCatalogVariationAttribute[];
};

export type ExerciseCatalogExercise = {
  id: string;
  name: string;
  deletedAt: Date | null;
  mappings: ExerciseCatalogExerciseMuscleMapping[];
};

export type ListExerciseCatalogExercisesOptions = {
  includeDeleted?: boolean;
};

export type ListExerciseCatalogVariationsOptions = {
  includeDeleted?: boolean;
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

export type SaveExerciseCatalogVariationKeyInput = {
  id?: string;
  displayName: string;
  slug?: string;
  now?: Date;
};

export type SaveExerciseCatalogVariationValueInput = {
  id?: string;
  variationKeyId: string;
  displayName: string;
  slug?: string;
  now?: Date;
};

export type SaveExerciseCatalogVariationInput = {
  id?: string;
  exerciseDefinitionId: string;
  label?: string;
  attributes: {
    variationKeyId: string;
    variationValueId: string;
    orderIndex?: number;
  }[];
  now?: Date;
};

export type SetExerciseCatalogExerciseDeletedStateInput = {
  id: string;
  isDeleted: boolean;
  now?: Date;
};

export type SetExerciseCatalogVariationDeletedStateInput = {
  id: string;
  isDeleted: boolean;
  now?: Date;
};

type DrizzleExerciseRow = {
  id: string;
  name: string;
  deletedAt: Date | null;
};

type DrizzleVariationRow = {
  id: string;
  exerciseDefinitionId: string;
  label: string;
  descriptor: string;
  deletedAt: Date | null;
};

export type ExerciseCatalogStore = {
  listMuscleGroups(): Promise<ExerciseCatalogMuscleGroup[]>;
  listExercises(input: { includeDeleted: boolean }): Promise<ExerciseCatalogExercise[]>;
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
  setExerciseDeletedState(input: {
    id: string;
    deletedAt: Date | null;
    now: Date;
  }): Promise<void>;
  listVariationKeys(): Promise<ExerciseCatalogVariationKey[]>;
  saveVariationKey(input: {
    id?: string;
    slug: string;
    displayName: string;
    now: Date;
  }): Promise<ExerciseCatalogVariationKey>;
  saveVariationValue(input: {
    id?: string;
    variationKeyId: string;
    slug: string;
    displayName: string;
    now: Date;
  }): Promise<ExerciseCatalogVariationValue>;
  listExerciseVariations(input: {
    exerciseDefinitionId: string;
    includeDeleted: boolean;
  }): Promise<ExerciseCatalogVariation[]>;
  saveExerciseVariation(input: {
    id?: string;
    exerciseDefinitionId: string;
    label: string;
    descriptor: string;
    attributes: {
      variationKeyId: string;
      variationValueId: string;
      orderIndex: number;
    }[];
    now: Date;
  }): Promise<ExerciseCatalogVariation>;
  setExerciseVariationDeletedState(input: {
    id: string;
    deletedAt: Date | null;
    now: Date;
  }): Promise<void>;
};

const createLocalId = (prefix: string) =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

const mapExerciseGraph = (
  exerciseRow: DrizzleExerciseRow | undefined,
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
    deletedAt: exerciseRow.deletedAt,
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

const listExerciseGraphs = async (
  database: LocalDatabase,
  input: { includeDeleted: boolean }
): Promise<ExerciseCatalogExercise[]> => {
  const baseQuery = database
    .select({
      id: exerciseDefinitions.id,
      name: exerciseDefinitions.name,
      deletedAt: exerciseDefinitions.deletedAt,
    })
    .from(exerciseDefinitions);

  const exerciseRows = (
    input.includeDeleted
      ? baseQuery.orderBy(asc(exerciseDefinitions.name)).all()
      : baseQuery
          .where(isNull(exerciseDefinitions.deletedAt))
          .orderBy(asc(exerciseDefinitions.name))
          .all()
  ) as DrizzleExerciseRow[];

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

const loadVariationKeyGraph = (database: LocalDatabase, variationKeyId: string): ExerciseCatalogVariationKey => {
  const keyRow = database
    .select({
      id: exerciseVariationKeys.id,
      slug: exerciseVariationKeys.slug,
      displayName: exerciseVariationKeys.displayName,
      isSystem: exerciseVariationKeys.isSystem,
    })
    .from(exerciseVariationKeys)
    .where(eq(exerciseVariationKeys.id, variationKeyId))
    .get();

  if (!keyRow) {
    throw new Error(`Variation key ${variationKeyId} not found after save`);
  }

  const valueRows = database
    .select({
      id: exerciseVariationValues.id,
      variationKeyId: exerciseVariationValues.variationKeyId,
      slug: exerciseVariationValues.slug,
      displayName: exerciseVariationValues.displayName,
      isSystem: exerciseVariationValues.isSystem,
    })
    .from(exerciseVariationValues)
    .where(eq(exerciseVariationValues.variationKeyId, variationKeyId))
    .orderBy(asc(exerciseVariationValues.displayName))
    .all();

  return {
    id: keyRow.id,
    slug: keyRow.slug,
    displayName: keyRow.displayName,
    isSystem: keyRow.isSystem === 1,
    values: valueRows.map((valueRow) => ({
      id: valueRow.id,
      variationKeyId: valueRow.variationKeyId,
      slug: valueRow.slug,
      displayName: valueRow.displayName,
      isSystem: valueRow.isSystem === 1,
    })),
  };
};

const listVariationKeyGraphs = (database: LocalDatabase): ExerciseCatalogVariationKey[] => {
  const keyRows = database
    .select({
      id: exerciseVariationKeys.id,
      slug: exerciseVariationKeys.slug,
      displayName: exerciseVariationKeys.displayName,
      isSystem: exerciseVariationKeys.isSystem,
    })
    .from(exerciseVariationKeys)
    .orderBy(asc(exerciseVariationKeys.displayName))
    .all();

  if (keyRows.length === 0) {
    return [];
  }

  const keyIds = keyRows.map((row) => row.id);
  const valueRows = database
    .select({
      id: exerciseVariationValues.id,
      variationKeyId: exerciseVariationValues.variationKeyId,
      slug: exerciseVariationValues.slug,
      displayName: exerciseVariationValues.displayName,
      isSystem: exerciseVariationValues.isSystem,
    })
    .from(exerciseVariationValues)
    .where(inArray(exerciseVariationValues.variationKeyId, keyIds))
    .orderBy(asc(exerciseVariationValues.variationKeyId), asc(exerciseVariationValues.displayName))
    .all();

  return keyRows.map((keyRow) => ({
    id: keyRow.id,
    slug: keyRow.slug,
    displayName: keyRow.displayName,
    isSystem: keyRow.isSystem === 1,
    values: valueRows
      .filter((valueRow) => valueRow.variationKeyId === keyRow.id)
      .map((valueRow) => ({
        id: valueRow.id,
        variationKeyId: valueRow.variationKeyId,
        slug: valueRow.slug,
        displayName: valueRow.displayName,
        isSystem: valueRow.isSystem === 1,
      })),
  }));
};

const loadExerciseVariationGraph = (database: LocalDatabase, variationId: string): ExerciseCatalogVariation => {
  const variationRow = database
    .select({
      id: exerciseVariations.id,
      exerciseDefinitionId: exerciseVariations.exerciseDefinitionId,
      label: exerciseVariations.label,
      descriptor: exerciseVariations.descriptor,
      deletedAt: exerciseVariations.deletedAt,
    })
    .from(exerciseVariations)
    .where(eq(exerciseVariations.id, variationId))
    .get() as DrizzleVariationRow | undefined;

  if (!variationRow) {
    throw new Error(`Exercise variation ${variationId} not found after save`);
  }

  const attributeRows = database
    .select({
      id: exerciseVariationAttributes.id,
      exerciseVariationId: exerciseVariationAttributes.exerciseVariationId,
      variationKeyId: exerciseVariationAttributes.variationKeyId,
      variationValueId: exerciseVariationAttributes.variationValueId,
      orderIndex: exerciseVariationAttributes.orderIndex,
    })
    .from(exerciseVariationAttributes)
    .where(eq(exerciseVariationAttributes.exerciseVariationId, variationId))
    .orderBy(asc(exerciseVariationAttributes.orderIndex))
    .all();

  const keyIds = Array.from(new Set(attributeRows.map((row) => row.variationKeyId)));
  const valueIds = Array.from(new Set(attributeRows.map((row) => row.variationValueId)));
  const keyRows =
    keyIds.length > 0
      ? database
          .select({
            id: exerciseVariationKeys.id,
            slug: exerciseVariationKeys.slug,
            displayName: exerciseVariationKeys.displayName,
          })
          .from(exerciseVariationKeys)
          .where(inArray(exerciseVariationKeys.id, keyIds))
          .all()
      : [];
  const valueRows =
    valueIds.length > 0
      ? database
          .select({
            id: exerciseVariationValues.id,
            slug: exerciseVariationValues.slug,
            displayName: exerciseVariationValues.displayName,
          })
          .from(exerciseVariationValues)
          .where(inArray(exerciseVariationValues.id, valueIds))
          .all()
      : [];

  const keyById = new Map(keyRows.map((row) => [row.id, row]));
  const valueById = new Map(valueRows.map((row) => [row.id, row]));

  return {
    id: variationRow.id,
    exerciseDefinitionId: variationRow.exerciseDefinitionId,
    label: variationRow.label,
    descriptor: variationRow.descriptor,
    deletedAt: variationRow.deletedAt,
    attributes: attributeRows.map((attributeRow) => {
      const keyRow = keyById.get(attributeRow.variationKeyId);
      const valueRow = valueById.get(attributeRow.variationValueId);
      if (!keyRow || !valueRow) {
        throw new Error(`Exercise variation ${variationId} contains unresolved variation metadata`);
      }

      return {
        id: attributeRow.id,
        orderIndex: attributeRow.orderIndex,
        variationKeyId: attributeRow.variationKeyId,
        variationKeySlug: keyRow.slug,
        variationKeyDisplayName: keyRow.displayName,
        variationValueId: attributeRow.variationValueId,
        variationValueSlug: valueRow.slug,
        variationValueDisplayName: valueRow.displayName,
      };
    }),
  };
};

const listExerciseVariationGraphs = (
  database: LocalDatabase,
  input: { exerciseDefinitionId: string; includeDeleted: boolean }
): ExerciseCatalogVariation[] => {
  const variationRows = (
    input.includeDeleted
      ? database
          .select({
            id: exerciseVariations.id,
            exerciseDefinitionId: exerciseVariations.exerciseDefinitionId,
            label: exerciseVariations.label,
            descriptor: exerciseVariations.descriptor,
            deletedAt: exerciseVariations.deletedAt,
          })
          .from(exerciseVariations)
          .where(eq(exerciseVariations.exerciseDefinitionId, input.exerciseDefinitionId))
          .orderBy(asc(exerciseVariations.label))
          .all()
      : database
          .select({
            id: exerciseVariations.id,
            exerciseDefinitionId: exerciseVariations.exerciseDefinitionId,
            label: exerciseVariations.label,
            descriptor: exerciseVariations.descriptor,
            deletedAt: exerciseVariations.deletedAt,
          })
          .from(exerciseVariations)
          .where(eq(exerciseVariations.exerciseDefinitionId, input.exerciseDefinitionId))
          .all()
          .filter((variationRow) => variationRow.deletedAt === null)
          .sort((left, right) => left.label.localeCompare(right.label))
  ) as DrizzleVariationRow[];

  return variationRows.map((variationRow) => loadExerciseVariationGraph(database, variationRow.id));
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
  async listExercises(input) {
    const database = await bootstrapLocalDataLayer();
    return listExerciseGraphs(database, input);
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
            deletedAt: null,
            updatedAt: input.now,
          })
          .where(eq(exerciseDefinitions.id, exerciseId))
          .run();
      } else {
        tx.insert(exerciseDefinitions)
          .values({
            id: exerciseId,
            name: input.name,
            deletedAt: null,
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
        deletedAt: exerciseDefinitions.deletedAt,
      })
      .from(exerciseDefinitions)
      .where(eq(exerciseDefinitions.id, exerciseId))
      .get() as DrizzleExerciseRow | undefined;

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
  async setExerciseDeletedState(input) {
    const database = await bootstrapLocalDataLayer();

    database
      .update(exerciseDefinitions)
      .set({
        deletedAt: input.deletedAt,
        updatedAt: input.now,
      })
      .where(eq(exerciseDefinitions.id, input.id))
      .run();
  },
  async listVariationKeys() {
    const database = await bootstrapLocalDataLayer();
    return listVariationKeyGraphs(database);
  },
  async saveVariationKey(input) {
    const database = await bootstrapLocalDataLayer();
    const variationKeyId = input.id ?? createLocalId('variation-key');

    database.transaction((tx) => {
      const existing = tx
        .select({ id: exerciseVariationKeys.id })
        .from(exerciseVariationKeys)
        .where(eq(exerciseVariationKeys.id, variationKeyId))
        .get();

      if (existing) {
        tx.update(exerciseVariationKeys)
          .set({
            slug: input.slug,
            displayName: input.displayName,
            updatedAt: input.now,
          })
          .where(eq(exerciseVariationKeys.id, variationKeyId))
          .run();
      } else {
        tx.insert(exerciseVariationKeys)
          .values({
            id: variationKeyId,
            slug: input.slug,
            displayName: input.displayName,
            isSystem: 0,
            createdAt: input.now,
            updatedAt: input.now,
          })
          .run();
      }
    });

    return loadVariationKeyGraph(database, variationKeyId);
  },
  async saveVariationValue(input) {
    const database = await bootstrapLocalDataLayer();
    const variationValueId = input.id ?? createLocalId('variation-value');

    database.transaction((tx) => {
      const existing = tx
        .select({ id: exerciseVariationValues.id })
        .from(exerciseVariationValues)
        .where(eq(exerciseVariationValues.id, variationValueId))
        .get();

      if (existing) {
        tx.update(exerciseVariationValues)
          .set({
            variationKeyId: input.variationKeyId,
            slug: input.slug,
            displayName: input.displayName,
            updatedAt: input.now,
          })
          .where(eq(exerciseVariationValues.id, variationValueId))
          .run();
      } else {
        tx.insert(exerciseVariationValues)
          .values({
            id: variationValueId,
            variationKeyId: input.variationKeyId,
            slug: input.slug,
            displayName: input.displayName,
            isSystem: 0,
            createdAt: input.now,
            updatedAt: input.now,
          })
          .run();
      }
    });

    const valueRow = database
      .select({
        id: exerciseVariationValues.id,
        variationKeyId: exerciseVariationValues.variationKeyId,
        slug: exerciseVariationValues.slug,
        displayName: exerciseVariationValues.displayName,
        isSystem: exerciseVariationValues.isSystem,
      })
      .from(exerciseVariationValues)
      .where(eq(exerciseVariationValues.id, variationValueId))
      .get();

    if (!valueRow) {
      throw new Error(`Variation value ${variationValueId} not found after save`);
    }

    return {
      id: valueRow.id,
      variationKeyId: valueRow.variationKeyId,
      slug: valueRow.slug,
      displayName: valueRow.displayName,
      isSystem: valueRow.isSystem === 1,
    };
  },
  async listExerciseVariations(input) {
    const database = await bootstrapLocalDataLayer();
    return listExerciseVariationGraphs(database, input);
  },
  async saveExerciseVariation(input) {
    const database = await bootstrapLocalDataLayer();
    const variationId = input.id ?? createLocalId('exercise-variation');

    database.transaction((tx) => {
      const existing = tx
        .select({ id: exerciseVariations.id })
        .from(exerciseVariations)
        .where(eq(exerciseVariations.id, variationId))
        .get();

      if (existing) {
        tx.update(exerciseVariations)
          .set({
            exerciseDefinitionId: input.exerciseDefinitionId,
            label: input.label,
            descriptor: input.descriptor,
            deletedAt: null,
            updatedAt: input.now,
          })
          .where(eq(exerciseVariations.id, variationId))
          .run();

        tx.delete(exerciseVariationAttributes)
          .where(eq(exerciseVariationAttributes.exerciseVariationId, variationId))
          .run();
      } else {
        tx.insert(exerciseVariations)
          .values({
            id: variationId,
            exerciseDefinitionId: input.exerciseDefinitionId,
            label: input.label,
            descriptor: input.descriptor,
            deletedAt: null,
            createdAt: input.now,
            updatedAt: input.now,
          })
          .run();
      }

      for (const attribute of input.attributes) {
        tx.insert(exerciseVariationAttributes)
          .values({
            id: createLocalId('exercise-variation-attribute'),
            exerciseVariationId: variationId,
            variationKeyId: attribute.variationKeyId,
            variationValueId: attribute.variationValueId,
            orderIndex: attribute.orderIndex,
            createdAt: input.now,
            updatedAt: input.now,
          })
          .run();
      }
    });

    return loadExerciseVariationGraph(database, variationId);
  },
  async setExerciseVariationDeletedState(input) {
    const database = await bootstrapLocalDataLayer();

    database
      .update(exerciseVariations)
      .set({
        deletedAt: input.deletedAt,
        updatedAt: input.now,
      })
      .where(eq(exerciseVariations.id, input.id))
      .run();
  },
});

const assertFiniteDate = (value: Date) => {
  if (!(value instanceof Date) || Number.isNaN(value.getTime())) {
    throw new Error('now must be a valid Date');
  }
};

const deriveRoleFromWeight = (weight: number): 'primary' | 'secondary' => (weight > 0.75 ? 'primary' : 'secondary');

const normalizeVariationKeyPayload = (input: SaveExerciseCatalogVariationKeyInput) => {
  const displayName = normalizeWhitespace(input.displayName);
  if (!displayName) {
    throw new Error('Variation key display name is required');
  }

  const slug = normalizeSlug(input.slug ?? displayName);
  if (!slug) {
    throw new Error('Variation key slug is required');
  }

  return {
    id: input.id?.trim() || undefined,
    displayName,
    slug,
  };
};

const normalizeVariationValuePayload = (input: SaveExerciseCatalogVariationValueInput) => {
  const variationKeyId = input.variationKeyId.trim();
  if (!variationKeyId) {
    throw new Error('Variation key id is required');
  }

  const displayName = normalizeWhitespace(input.displayName);
  if (!displayName) {
    throw new Error('Variation value display name is required');
  }

  const slug = normalizeSlug(input.slug ?? displayName);
  if (!slug) {
    throw new Error('Variation value slug is required');
  }

  return {
    id: input.id?.trim() || undefined,
    variationKeyId,
    displayName,
    slug,
  };
};

export const createExerciseCatalogRepository = (store: ExerciseCatalogStore = createDrizzleExerciseCatalogStore()) => {
  const persistDeletedState = async (input: SetExerciseCatalogExerciseDeletedStateInput): Promise<void> => {
    const trimmedId = input.id.trim();
    if (!trimmedId) {
      throw new Error('Exercise id is required');
    }

    const now = input.now ?? new Date();
    assertFiniteDate(now);

    await store.setExerciseDeletedState({
      id: trimmedId,
      deletedAt: input.isDeleted ? now : null,
      now,
    });
  };

  const persistVariationDeletedState = async (
    input: SetExerciseCatalogVariationDeletedStateInput
  ): Promise<void> => {
    const trimmedId = input.id.trim();
    if (!trimmedId) {
      throw new Error('Exercise variation id is required');
    }

    const now = input.now ?? new Date();
    assertFiniteDate(now);

    await store.setExerciseVariationDeletedState({
      id: trimmedId,
      deletedAt: input.isDeleted ? now : null,
      now,
    });
  };

  return {
    listMuscleGroups() {
      return store.listMuscleGroups();
    },
    listExercises(options: ListExerciseCatalogExercisesOptions = {}) {
      return store.listExercises({
        includeDeleted: options.includeDeleted === true,
      });
    },
    async saveExercise(input: SaveExerciseCatalogExerciseInput): Promise<ExerciseCatalogExercise> {
      const name = normalizeWhitespace(input.name);
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

        if (!Number.isFinite(mapping.weight) || mapping.weight <= 0 || mapping.weight > 1) {
          throw new Error(`Invalid muscle weight for ${mapping.muscleGroupId}: ${mapping.weight}`);
        }

        return {
          muscleGroupId: mapping.muscleGroupId,
          weight: mapping.weight,
          role: mapping.role ?? deriveRoleFromWeight(mapping.weight),
        };
      });

      return store.saveExercise({
        id: input.id?.trim() || undefined,
        name,
        mappings: normalizedMappings,
        now,
      });
    },
    async saveVariationKey(input: SaveExerciseCatalogVariationKeyInput): Promise<ExerciseCatalogVariationKey> {
      const now = input.now ?? new Date();
      assertFiniteDate(now);
      const normalized = normalizeVariationKeyPayload(input);

      return store.saveVariationKey({
        ...normalized,
        now,
      });
    },
    async saveVariationValue(input: SaveExerciseCatalogVariationValueInput): Promise<ExerciseCatalogVariationValue> {
      const now = input.now ?? new Date();
      assertFiniteDate(now);
      const normalized = normalizeVariationValuePayload(input);

      const variationKeys = await store.listVariationKeys();
      if (!variationKeys.some((variationKey) => variationKey.id === normalized.variationKeyId)) {
        throw new Error(`Unknown variation key: ${normalized.variationKeyId}`);
      }

      return store.saveVariationValue({
        ...normalized,
        now,
      });
    },
    listVariationKeys() {
      return store.listVariationKeys();
    },
    listExerciseVariations(
      exerciseDefinitionId: string,
      options: ListExerciseCatalogVariationsOptions = {}
    ) {
      const trimmedExerciseDefinitionId = exerciseDefinitionId.trim();
      if (!trimmedExerciseDefinitionId) {
        throw new Error('Exercise definition id is required');
      }

      return store.listExerciseVariations({
        exerciseDefinitionId: trimmedExerciseDefinitionId,
        includeDeleted: options.includeDeleted === true,
      });
    },
    async saveExerciseVariation(input: SaveExerciseCatalogVariationInput): Promise<ExerciseCatalogVariation> {
      const exerciseDefinitionId = input.exerciseDefinitionId.trim();
      if (!exerciseDefinitionId) {
        throw new Error('Exercise definition id is required');
      }

      if (input.attributes.length < 1) {
        throw new Error('At least one variation attribute is required');
      }

      const now = input.now ?? new Date();
      assertFiniteDate(now);

      const variationKeys = await store.listVariationKeys();
      const variationKeyById = new Map(variationKeys.map((variationKey) => [variationKey.id, variationKey]));
      const variationValueById = new Map(
        variationKeys.flatMap((variationKey) => variationKey.values.map((variationValue) => [variationValue.id, variationValue]))
      );
      const seenVariationKeys = new Set<string>();

      const normalizedAttributes = input.attributes.map((attribute, index) => {
        const variationKeyId = attribute.variationKeyId.trim();
        const variationValueId = attribute.variationValueId.trim();
        const variationKey = variationKeyById.get(variationKeyId);
        const variationValue = variationValueById.get(variationValueId);

        if (!variationKey) {
          throw new Error(`Unknown variation key: ${variationKeyId}`);
        }
        if (!variationValue || variationValue.variationKeyId !== variationKeyId) {
          throw new Error(`Variation value ${variationValueId} does not belong to key ${variationKeyId}`);
        }
        if (seenVariationKeys.has(variationKeyId)) {
          throw new Error(`Duplicate variation key at index ${index}: ${variationKeyId}`);
        }

        seenVariationKeys.add(variationKeyId);

        return {
          variationKeyId,
          variationValueId,
          orderIndex: attribute.orderIndex ?? index,
          variationKeySlug: variationKey.slug,
          variationKeyDisplayName: variationKey.displayName,
          variationValueSlug: variationValue.slug,
          variationValueDisplayName: variationValue.displayName,
        };
      });

      const descriptor = buildExerciseVariationDescriptor(
        normalizedAttributes.map((attribute) => ({
          keySlug: attribute.variationKeySlug,
          valueSlug: attribute.variationValueSlug,
        }))
      );

      if (!descriptor) {
        throw new Error('Variation descriptor is required');
      }

      const label =
        normalizeWhitespace(input.label) ||
        buildExerciseVariationLabel(
          [...normalizedAttributes]
            .sort((left, right) => left.orderIndex - right.orderIndex)
            .map((attribute) => ({
              keyDisplayName: attribute.variationKeyDisplayName,
              valueDisplayName: attribute.variationValueDisplayName,
            }))
        );

      if (!label) {
        throw new Error('Variation label is required');
      }

      return store.saveExerciseVariation({
        id: input.id?.trim() || undefined,
        exerciseDefinitionId,
        label,
        descriptor,
        attributes: normalizedAttributes.map(({ variationKeyId, variationValueId, orderIndex }) => ({
          variationKeyId,
          variationValueId,
          orderIndex,
        })),
        now,
      });
    },
    deleteExercise(id: string, now?: Date) {
      return persistDeletedState({
        id,
        isDeleted: true,
        now,
      });
    },
    undeleteExercise(id: string, now?: Date) {
      return persistDeletedState({
        id,
        isDeleted: false,
        now,
      });
    },
    deleteExerciseVariation(id: string, now?: Date) {
      return persistVariationDeletedState({
        id,
        isDeleted: true,
        now,
      });
    },
    undeleteExerciseVariation(id: string, now?: Date) {
      return persistVariationDeletedState({
        id,
        isDeleted: false,
        now,
      });
    },
  };
};

const defaultExerciseCatalogRepository = createExerciseCatalogRepository();

export const listExerciseCatalogMuscleGroups = defaultExerciseCatalogRepository.listMuscleGroups;
export const listExerciseCatalogExercises = defaultExerciseCatalogRepository.listExercises;
export const saveExerciseCatalogExercise = defaultExerciseCatalogRepository.saveExercise;
export const deleteExerciseCatalogExercise = defaultExerciseCatalogRepository.deleteExercise;
export const undeleteExerciseCatalogExercise = defaultExerciseCatalogRepository.undeleteExercise;
export const listExerciseCatalogVariationKeys = defaultExerciseCatalogRepository.listVariationKeys;
export const saveExerciseCatalogVariationKey = defaultExerciseCatalogRepository.saveVariationKey;
export const saveExerciseCatalogVariationValue = defaultExerciseCatalogRepository.saveVariationValue;
export const listExerciseCatalogVariations = defaultExerciseCatalogRepository.listExerciseVariations;
export const saveExerciseCatalogVariation = defaultExerciseCatalogRepository.saveExerciseVariation;
export const deleteExerciseCatalogVariation = defaultExerciseCatalogRepository.deleteExerciseVariation;
export const undeleteExerciseCatalogVariation = defaultExerciseCatalogRepository.undeleteExerciseVariation;
