import { eq } from 'drizzle-orm';

import type { LocalDatabase } from './bootstrap';
import {
  findVariationKeyBySlug,
  ensureVariationValueForKey,
  SYSTEM_MACHINE_VARIATION_KEY_SLUG,
  upsertSingleAttributeExerciseVariation,
} from './exercise-variation-seeds';
import { buildExerciseVariationDescriptor, normalizeSlug, normalizeWhitespace } from './exercise-variation-utils';
import { exerciseDefinitions, exerciseVariationValues, exerciseVariations, sessionExercises } from './schema';

type SessionExerciseReferenceDatabase = Pick<LocalDatabase, 'select' | 'insert' | 'update' | 'delete'>;

type ExerciseDefinitionLookupRow = {
  id: string;
  name: string;
};

export type SessionExerciseReferencePlan = {
  exerciseDefinitionId: string | null;
  exerciseVariationId: string | null;
  normalizedMachineName: string | null;
  shouldCreateMachineVariation: boolean;
};

export type SessionExerciseReferenceResolution = {
  exerciseDefinitionId: string | null;
  exerciseVariationId: string | null;
  machineName: string | null;
};

const createLocalEntityId = (prefix: string) =>
  `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

export const resolveExerciseDefinitionNameMatch = (
  name: string,
  exerciseDefinitionsToSearch: ExerciseDefinitionLookupRow[]
): ExerciseDefinitionLookupRow | null => {
  const normalizedName = normalizeWhitespace(name).toLowerCase();
  if (!normalizedName) {
    return null;
  }

  const matches = exerciseDefinitionsToSearch.filter(
    (row) => normalizeWhitespace(row.name).toLowerCase() === normalizedName
  );

  return matches.length === 1 ? matches[0] : null;
};

export const planSessionExerciseReferenceResolution = (input: {
  name: string;
  machineName?: string | null;
  exerciseDefinitionId?: string | null;
  exerciseVariationId?: string | null;
  resolvedVariationExerciseDefinitionId?: string | null;
  exerciseDefinitionsToSearch: ExerciseDefinitionLookupRow[];
}): SessionExerciseReferencePlan => {
  const normalizedMachineName = normalizeWhitespace(input.machineName) || null;
  let exerciseDefinitionId = input.exerciseDefinitionId?.trim() || null;
  const exerciseVariationId = input.exerciseVariationId?.trim() || null;

  if (exerciseVariationId && input.resolvedVariationExerciseDefinitionId) {
    if (exerciseDefinitionId && exerciseDefinitionId !== input.resolvedVariationExerciseDefinitionId) {
      throw new Error(
        `Exercise variation ${exerciseVariationId} does not belong to exercise definition ${exerciseDefinitionId}`
      );
    }

    exerciseDefinitionId = input.resolvedVariationExerciseDefinitionId;
  }

  if (!exerciseDefinitionId) {
    exerciseDefinitionId = resolveExerciseDefinitionNameMatch(input.name, input.exerciseDefinitionsToSearch)?.id ?? null;
  }

  return {
    exerciseDefinitionId,
    exerciseVariationId,
    normalizedMachineName,
    shouldCreateMachineVariation: Boolean(exerciseDefinitionId && !exerciseVariationId && normalizedMachineName),
  };
};

export const resolveSessionExerciseReferences = (
  database: SessionExerciseReferenceDatabase,
  input: {
    name: string;
    machineName?: string | null;
    exerciseDefinitionId?: string | null;
    exerciseVariationId?: string | null;
    now: Date;
  }
): SessionExerciseReferenceResolution => {
  let resolvedVariationExerciseDefinitionId: string | null = null;

  if (input.exerciseVariationId?.trim()) {
    const variationRow = database
      .select({
        id: exerciseVariations.id,
        exerciseDefinitionId: exerciseVariations.exerciseDefinitionId,
      })
      .from(exerciseVariations)
      .where(eq(exerciseVariations.id, input.exerciseVariationId.trim()))
      .get();

    if (!variationRow) {
      throw new Error(`Unknown exercise variation: ${input.exerciseVariationId.trim()}`);
    }

    resolvedVariationExerciseDefinitionId = variationRow.exerciseDefinitionId;
  }

  const definitionRows = database
    .select({
      id: exerciseDefinitions.id,
      name: exerciseDefinitions.name,
    })
    .from(exerciseDefinitions)
    .all();
  const referencePlan = planSessionExerciseReferenceResolution({
    name: input.name,
    machineName: input.machineName,
    exerciseDefinitionId: input.exerciseDefinitionId,
    exerciseVariationId: input.exerciseVariationId,
    resolvedVariationExerciseDefinitionId,
    exerciseDefinitionsToSearch: definitionRows,
  });

  if (!referencePlan.exerciseDefinitionId) {
    return {
      exerciseDefinitionId: null,
      exerciseVariationId: null,
      machineName: referencePlan.normalizedMachineName,
    };
  }

  if (referencePlan.exerciseVariationId) {
    return {
      exerciseDefinitionId: referencePlan.exerciseDefinitionId,
      exerciseVariationId: referencePlan.exerciseVariationId,
      machineName: referencePlan.normalizedMachineName,
    };
  }

  if (!referencePlan.normalizedMachineName) {
    return {
      exerciseDefinitionId: referencePlan.exerciseDefinitionId,
      exerciseVariationId: null,
      machineName: null,
    };
  }

  const machineKey = findVariationKeyBySlug(database, SYSTEM_MACHINE_VARIATION_KEY_SLUG);
  if (!machineKey) {
    throw new Error(`Missing seeded variation key: ${SYSTEM_MACHINE_VARIATION_KEY_SLUG}`);
  }

  const variationValue = ensureVariationValueForKey(database, {
    variationKeyId: machineKey.id,
    displayName: referencePlan.normalizedMachineName,
    now: input.now,
    createId: () => createLocalEntityId('variation-value'),
  });

  const descriptor = buildExerciseVariationDescriptor([
    {
      keySlug: machineKey.slug,
      valueSlug: variationValue.slug,
    },
  ]);

  const variation = upsertSingleAttributeExerciseVariation(database, {
    exerciseDefinitionId: referencePlan.exerciseDefinitionId,
    variationKeyId: machineKey.id,
    variationKeyDisplayName: machineKey.displayName,
    variationValueId: variationValue.id,
    variationValueDisplayName: variationValue.displayName,
    descriptor,
    now: input.now,
    createId: createLocalEntityId,
  });

  return {
    exerciseDefinitionId: referencePlan.exerciseDefinitionId,
    exerciseVariationId: variation.id,
    machineName: variation.label,
  };
};

export const deriveLegacyMachineNameFromVariation = (
  database: SessionExerciseReferenceDatabase,
  exerciseVariationId: string | null | undefined
) => {
  if (!exerciseVariationId) {
    return null;
  }

  const variation = database
    .select({
      label: exerciseVariations.label,
    })
    .from(exerciseVariations)
    .where(eq(exerciseVariations.id, exerciseVariationId))
    .get();

  if (!variation) {
    return null;
  }

  const machineKey = findVariationKeyBySlug(database, SYSTEM_MACHINE_VARIATION_KEY_SLUG);
  if (!machineKey) {
    return variation.label;
  }

  const machineAttribute = database
    .select({
      displayName: exerciseVariationValues.displayName,
    })
    .from(exerciseVariationValues)
    .where(eq(exerciseVariationValues.variationKeyId, machineKey.id))
    .all()
    .find((valueRow) => normalizeSlug(valueRow.displayName) === normalizeSlug(variation.label));

  return machineAttribute?.displayName ?? variation.label;
};

export const backfillLegacySessionExerciseReferences = (database: LocalDatabase, now: Date = new Date()) => {
  const rowsNeedingBackfill = database
    .select({
      id: sessionExercises.id,
      name: sessionExercises.name,
      machineName: sessionExercises.machineName,
      exerciseDefinitionId: sessionExercises.exerciseDefinitionId,
      exerciseVariationId: sessionExercises.exerciseVariationId,
    })
    .from(sessionExercises)
    .all()
    .filter(
      (row) =>
        row.exerciseDefinitionId === null ||
        (normalizeWhitespace(row.machineName) && row.exerciseVariationId === null)
    );

  for (const row of rowsNeedingBackfill) {
    const resolved = resolveSessionExerciseReferences(database, {
      name: row.name,
      machineName: row.machineName,
      exerciseDefinitionId: row.exerciseDefinitionId,
      exerciseVariationId: row.exerciseVariationId,
      now,
    });

    database
      .update(sessionExercises)
      .set({
        exerciseDefinitionId: resolved.exerciseDefinitionId,
        exerciseVariationId: resolved.exerciseVariationId,
        updatedAt: now,
      })
      .where(eq(sessionExercises.id, row.id))
      .run();
  }
};
