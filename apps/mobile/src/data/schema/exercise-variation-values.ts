import { sql } from 'drizzle-orm';
import { check, index, integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';

import { exerciseVariationKeys } from './exercise-variation-keys';

export const exerciseVariationValues = sqliteTable(
  'exercise_variation_values',
  {
    id: text('id')
      .primaryKey()
      .notNull()
      .default(sql`(lower(hex(randomblob(16))))`),
    variationKeyId: text('variation_key_id')
      .notNull()
      .references(() => exerciseVariationKeys.id, { onDelete: 'cascade' }),
    slug: text('slug').notNull(),
    displayName: text('display_name').notNull(),
    isSystem: integer('is_system').notNull().default(0),
    createdAt: integer('created_at', { mode: 'timestamp_ms' })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
  },
  (table) => ({
    variationKeyIdx: index('exercise_variation_values_variation_key_id_idx').on(table.variationKeyId),
    variationKeySlugUnique: uniqueIndex('exercise_variation_values_key_id_slug_unique').on(
      table.variationKeyId,
      table.slug
    ),
    variationKeyIdIdUnique: uniqueIndex('exercise_variation_values_key_id_id_unique').on(table.variationKeyId, table.id),
    slugNonEmptyGuard: check('exercise_variation_values_slug_non_empty', sql`${table.slug} <> ''`),
    displayNameNonEmptyGuard: check(
      'exercise_variation_values_display_name_non_empty',
      sql`${table.displayName} <> ''`
    ),
    isSystemBooleanGuard: check(
      'exercise_variation_values_is_system_boolean_guard',
      sql`${table.isSystem} in (0, 1)`
    ),
  })
);

export type ExerciseVariationValue = typeof exerciseVariationValues.$inferSelect;
export type NewExerciseVariationValue = typeof exerciseVariationValues.$inferInsert;
