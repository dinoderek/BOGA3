import { asc, eq } from 'drizzle-orm';

import type { LocalDatabase } from './bootstrap';
import { buildExerciseVariationLabel, normalizeSlug } from './exercise-variation-utils';
import {
  exerciseVariationAttributes,
  exerciseVariationKeys,
  exerciseVariationValues,
  exerciseVariations,
} from './schema';

type ExerciseVariationSeedDatabase = Pick<LocalDatabase, 'select' | 'insert' | 'update' | 'delete'>;

export const SYSTEM_MACHINE_VARIATION_KEY_SLUG = 'machine';

export type SystemExerciseVariationKeySeed = {
  id: string;
  slug: string;
  displayName: string;
};

export type SystemExerciseVariationValueSeed = {
  id: string;
  variationKeyId: string;
  slug: string;
  displayName: string;
};

export const SYSTEM_EXERCISE_VARIATION_KEY_SEEDS: SystemExerciseVariationKeySeed[] = [
  { id: 'var_key_grip', slug: 'grip', displayName: 'Grip' },
  { id: 'var_key_hold', slug: 'hold', displayName: 'Hold' },
  { id: 'var_key_machine', slug: 'machine', displayName: 'Machine' },
  { id: 'var_key_implement', slug: 'implement', displayName: 'Implement' },
  { id: 'var_key_incline', slug: 'incline', displayName: 'Incline' },
];

export const SYSTEM_EXERCISE_VARIATION_VALUE_SEEDS: SystemExerciseVariationValueSeed[] = [
  { id: 'var_value_grip_pronated', variationKeyId: 'var_key_grip', slug: 'pronated', displayName: 'Pronated' },
  { id: 'var_value_grip_supinated', variationKeyId: 'var_key_grip', slug: 'supinated', displayName: 'Supinated' },
  { id: 'var_value_grip_neutral', variationKeyId: 'var_key_grip', slug: 'neutral', displayName: 'Neutral' },
  { id: 'var_value_grip_mixed', variationKeyId: 'var_key_grip', slug: 'mixed', displayName: 'Mixed' },
  { id: 'var_value_hold_straight_bar', variationKeyId: 'var_key_hold', slug: 'straight_bar', displayName: 'Straight Bar' },
  { id: 'var_value_hold_ez_bar', variationKeyId: 'var_key_hold', slug: 'ez_bar', displayName: 'EZ Bar' },
  { id: 'var_value_hold_rope', variationKeyId: 'var_key_hold', slug: 'rope', displayName: 'Rope' },
  { id: 'var_value_hold_single_handle', variationKeyId: 'var_key_hold', slug: 'single_handle', displayName: 'Single Handle' },
  { id: 'var_value_machine_cable', variationKeyId: 'var_key_machine', slug: 'cable', displayName: 'Cable' },
  { id: 'var_value_machine_smith_machine', variationKeyId: 'var_key_machine', slug: 'smith_machine', displayName: 'Smith Machine' },
  { id: 'var_value_machine_plate_loaded', variationKeyId: 'var_key_machine', slug: 'plate_loaded', displayName: 'Plate Loaded' },
  { id: 'var_value_machine_hammer_strength', variationKeyId: 'var_key_machine', slug: 'hammer_strength', displayName: 'Hammer Strength' },
  { id: 'var_value_implement_barbell', variationKeyId: 'var_key_implement', slug: 'barbell', displayName: 'Barbell' },
  { id: 'var_value_implement_dumbbell', variationKeyId: 'var_key_implement', slug: 'dumbbell', displayName: 'Dumbbell' },
  { id: 'var_value_implement_kettlebell', variationKeyId: 'var_key_implement', slug: 'kettlebell', displayName: 'Kettlebell' },
  { id: 'var_value_implement_bodyweight', variationKeyId: 'var_key_implement', slug: 'bodyweight', displayName: 'Bodyweight' },
  { id: 'var_value_incline_decline', variationKeyId: 'var_key_incline', slug: 'decline', displayName: 'Decline' },
  { id: 'var_value_incline_flat', variationKeyId: 'var_key_incline', slug: 'flat', displayName: 'Flat' },
  { id: 'var_value_incline_low_incline', variationKeyId: 'var_key_incline', slug: 'low_incline', displayName: 'Low Incline' },
  { id: 'var_value_incline_high_incline', variationKeyId: 'var_key_incline', slug: 'high_incline', displayName: 'High Incline' },
  { id: 'var_value_incline_vertical', variationKeyId: 'var_key_incline', slug: 'vertical', displayName: 'Vertical' },
];

export const validateSystemExerciseVariationSeeds = () => {
  const issues: string[] = [];
  const keyIds = new Set<string>();
  const keySlugs = new Set<string>();
  const valueKeys = new Set<string>();

  for (const key of SYSTEM_EXERCISE_VARIATION_KEY_SEEDS) {
    if (!key.id) {
      issues.push('variation key id is required');
    }
    if (!key.slug || normalizeSlug(key.slug) !== key.slug) {
      issues.push(`variation key slug must be normalized: ${key.slug}`);
    }
    if (!key.displayName.trim()) {
      issues.push(`variation key display name is required: ${key.id}`);
    }
    if (keyIds.has(key.id)) {
      issues.push(`duplicate variation key id: ${key.id}`);
    }
    if (keySlugs.has(key.slug)) {
      issues.push(`duplicate variation key slug: ${key.slug}`);
    }
    keyIds.add(key.id);
    keySlugs.add(key.slug);
  }

  for (const value of SYSTEM_EXERCISE_VARIATION_VALUE_SEEDS) {
    if (!keyIds.has(value.variationKeyId)) {
      issues.push(`variation value references unknown key: ${value.id}`);
    }
    if (!value.displayName.trim()) {
      issues.push(`variation value display name is required: ${value.id}`);
    }
    if (!value.slug || normalizeSlug(value.slug) !== value.slug) {
      issues.push(`variation value slug must be normalized: ${value.id}`);
    }
    const compositeKey = `${value.variationKeyId}:${value.slug}`;
    if (valueKeys.has(compositeKey)) {
      issues.push(`duplicate variation value slug within key: ${compositeKey}`);
    }
    valueKeys.add(compositeKey);
  }

  return issues;
};

export const assertValidSystemExerciseVariationSeeds = () => {
  const issues = validateSystemExerciseVariationSeeds();
  if (issues.length > 0) {
    throw new Error(`Invalid exercise variation seeds: ${issues.join('; ')}`);
  }
};

export const getSystemExerciseVariationSeedSummary = () => ({
  keyCount: SYSTEM_EXERCISE_VARIATION_KEY_SEEDS.length,
  valueCount: SYSTEM_EXERCISE_VARIATION_VALUE_SEEDS.length,
  keySlugs: SYSTEM_EXERCISE_VARIATION_KEY_SEEDS.map((entry) => entry.slug),
});

export const seedSystemExerciseVariationMetadata = (database: LocalDatabase, now: Date = new Date()) => {
  assertValidSystemExerciseVariationSeeds();

  database.transaction((tx) => {
    for (const key of SYSTEM_EXERCISE_VARIATION_KEY_SEEDS) {
      tx.insert(exerciseVariationKeys)
        .values({
          ...key,
          isSystem: 1,
          createdAt: now,
          updatedAt: now,
        })
        .onConflictDoUpdate({
          target: exerciseVariationKeys.id,
          set: {
            slug: key.slug,
            displayName: key.displayName,
            isSystem: 1,
            updatedAt: now,
          },
        })
        .run();
    }

    for (const value of SYSTEM_EXERCISE_VARIATION_VALUE_SEEDS) {
      tx.insert(exerciseVariationValues)
        .values({
          ...value,
          isSystem: 1,
          createdAt: now,
          updatedAt: now,
        })
        .onConflictDoUpdate({
          target: exerciseVariationValues.id,
          set: {
            variationKeyId: value.variationKeyId,
            slug: value.slug,
            displayName: value.displayName,
            isSystem: 1,
            updatedAt: now,
          },
        })
        .run();
    }
  });
};

export const findVariationKeyBySlug = (database: ExerciseVariationSeedDatabase, slug: string) =>
  database
    .select({
      id: exerciseVariationKeys.id,
      slug: exerciseVariationKeys.slug,
      displayName: exerciseVariationKeys.displayName,
      isSystem: exerciseVariationKeys.isSystem,
    })
    .from(exerciseVariationKeys)
    .where(eq(exerciseVariationKeys.slug, slug))
    .get() ?? null;

export const ensureVariationValueForKey = (
  database: ExerciseVariationSeedDatabase,
  input: {
    variationKeyId: string;
    displayName: string;
    now: Date;
    createId: () => string;
  }
) => {
  const normalizedSlug = normalizeSlug(input.displayName);
  if (!normalizedSlug) {
    throw new Error('Variation value displayName is required');
  }

  const existing = database
    .select({
      id: exerciseVariationValues.id,
      variationKeyId: exerciseVariationValues.variationKeyId,
      slug: exerciseVariationValues.slug,
      displayName: exerciseVariationValues.displayName,
    })
    .from(exerciseVariationValues)
    .where(eq(exerciseVariationValues.variationKeyId, input.variationKeyId))
    .orderBy(asc(exerciseVariationValues.displayName))
    .all()
    .find((row) => row.slug === normalizedSlug);

  if (existing) {
    if (existing.displayName !== input.displayName) {
      database
        .update(exerciseVariationValues)
        .set({
          displayName: input.displayName,
          updatedAt: input.now,
        })
        .where(eq(exerciseVariationValues.id, existing.id))
        .run();
    }

    return {
      id: existing.id,
      variationKeyId: existing.variationKeyId,
      slug: existing.slug,
      displayName: input.displayName,
    };
  }

  const id = input.createId();

  database
    .insert(exerciseVariationValues)
    .values({
      id,
      variationKeyId: input.variationKeyId,
      slug: normalizedSlug,
      displayName: input.displayName,
      isSystem: 0,
      createdAt: input.now,
      updatedAt: input.now,
    })
    .run();

  return {
    id,
    variationKeyId: input.variationKeyId,
    slug: normalizedSlug,
    displayName: input.displayName,
  };
};

export const upsertSingleAttributeExerciseVariation = (
  database: ExerciseVariationSeedDatabase,
  input: {
    exerciseDefinitionId: string;
    variationKeyId: string;
    variationKeyDisplayName: string;
    variationValueId: string;
    variationValueDisplayName: string;
    descriptor: string;
    now: Date;
    createId: (prefix: string) => string;
  }
) => {
  const label = buildExerciseVariationLabel([
    {
      keyDisplayName: input.variationKeyDisplayName,
      valueDisplayName: input.variationValueDisplayName,
    },
  ]);

  const existing = database
    .select({
      id: exerciseVariations.id,
      descriptor: exerciseVariations.descriptor,
    })
    .from(exerciseVariations)
    .where(eq(exerciseVariations.exerciseDefinitionId, input.exerciseDefinitionId))
    .all()
    .find((row) => row.descriptor === input.descriptor);

  const variationId = existing?.id ?? input.createId('exercise-variation');

  if (existing) {
    database
      .update(exerciseVariations)
      .set({
        label,
        descriptor: input.descriptor,
        deletedAt: null,
        updatedAt: input.now,
      })
      .where(eq(exerciseVariations.id, variationId))
      .run();

    database.delete(exerciseVariationAttributes).where(eq(exerciseVariationAttributes.exerciseVariationId, variationId)).run();
  } else {
    database
      .insert(exerciseVariations)
      .values({
        id: variationId,
        exerciseDefinitionId: input.exerciseDefinitionId,
        label,
        descriptor: input.descriptor,
        deletedAt: null,
        createdAt: input.now,
        updatedAt: input.now,
      })
      .run();
  }

  database
    .insert(exerciseVariationAttributes)
    .values({
      id: input.createId('exercise-variation-attribute'),
      exerciseVariationId: variationId,
      variationKeyId: input.variationKeyId,
      variationValueId: input.variationValueId,
      orderIndex: 0,
      createdAt: input.now,
      updatedAt: input.now,
    })
    .run();

  return {
    id: variationId,
    label,
  };
};
