import { sql } from 'drizzle-orm';
import { check, index, integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';

import { exerciseDefinitions } from './exercise-definitions';

export const exerciseVariations = sqliteTable(
  'exercise_variations',
  {
    id: text('id')
      .primaryKey()
      .notNull()
      .default(sql`(lower(hex(randomblob(16))))`),
    exerciseDefinitionId: text('exercise_definition_id')
      .notNull()
      .references(() => exerciseDefinitions.id, { onDelete: 'cascade' }),
    label: text('label').notNull(),
    descriptor: text('descriptor').notNull(),
    deletedAt: integer('deleted_at', { mode: 'timestamp_ms' }),
    createdAt: integer('created_at', { mode: 'timestamp_ms' })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
  },
  (table) => ({
    exerciseDefinitionIdx: index('exercise_variations_exercise_definition_id_idx').on(table.exerciseDefinitionId),
    deletedAtIdx: index('exercise_variations_deleted_at_idx').on(table.deletedAt),
    exerciseDescriptorUnique: uniqueIndex('exercise_variations_exercise_id_descriptor_unique').on(
      table.exerciseDefinitionId,
      table.descriptor
    ),
    labelNonEmptyGuard: check('exercise_variations_label_non_empty', sql`${table.label} <> ''`),
    descriptorNonEmptyGuard: check('exercise_variations_descriptor_non_empty', sql`${table.descriptor} <> ''`),
  })
);

export type ExerciseVariation = typeof exerciseVariations.$inferSelect;
export type NewExerciseVariation = typeof exerciseVariations.$inferInsert;
