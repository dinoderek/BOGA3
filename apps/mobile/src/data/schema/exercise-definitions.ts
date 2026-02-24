import { sql } from 'drizzle-orm';
import { check, index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const exerciseDefinitions = sqliteTable(
  'exercise_definitions',
  {
    id: text('id')
      .primaryKey()
      .notNull()
      .default(sql`(lower(hex(randomblob(16))))`),
    name: text('name').notNull(),
    createdAt: integer('created_at', { mode: 'timestamp_ms' })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
  },
  (table) => ({
    nameIdx: index('exercise_definitions_name_idx').on(table.name),
    nameNonEmptyGuard: check('exercise_definitions_name_non_empty', sql`${table.name} <> ''`),
  })
);

export type ExerciseDefinition = typeof exerciseDefinitions.$inferSelect;
export type NewExerciseDefinition = typeof exerciseDefinitions.$inferInsert;
