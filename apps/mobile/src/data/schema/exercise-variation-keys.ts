import { sql } from 'drizzle-orm';
import { check, integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';

export const exerciseVariationKeys = sqliteTable(
  'exercise_variation_keys',
  {
    id: text('id')
      .primaryKey()
      .notNull()
      .default(sql`(lower(hex(randomblob(16))))`),
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
    slugUnique: uniqueIndex('exercise_variation_keys_slug_unique').on(table.slug),
    slugNonEmptyGuard: check('exercise_variation_keys_slug_non_empty', sql`${table.slug} <> ''`),
    displayNameNonEmptyGuard: check(
      'exercise_variation_keys_display_name_non_empty',
      sql`${table.displayName} <> ''`
    ),
    isSystemBooleanGuard: check('exercise_variation_keys_is_system_boolean_guard', sql`${table.isSystem} in (0, 1)`),
  })
);

export type ExerciseVariationKey = typeof exerciseVariationKeys.$inferSelect;
export type NewExerciseVariationKey = typeof exerciseVariationKeys.$inferInsert;
