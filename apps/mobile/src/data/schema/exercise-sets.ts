import { sql } from 'drizzle-orm';
import { check, index, integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';

import { sessionExercises } from './session-exercises';

export const exerciseSets = sqliteTable(
  'exercise_sets',
  {
    id: text('id')
      .primaryKey()
      .notNull()
      .default(sql`(lower(hex(randomblob(16))))`),
    sessionExerciseId: text('session_exercise_id')
      .notNull()
      .references(() => sessionExercises.id, { onDelete: 'cascade' }),
    orderIndex: integer('order_index').notNull(),
    weightValue: text('weight_value').notNull().default(''),
    repsValue: text('reps_value').notNull().default(''),
    createdAt: integer('created_at', { mode: 'timestamp_ms' })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
  },
  (table) => ({
    sessionExerciseIdx: index('exercise_sets_session_exercise_id_idx').on(table.sessionExerciseId),
    sessionExerciseOrderUnique: uniqueIndex('exercise_sets_session_exercise_id_order_index_unique').on(
      table.sessionExerciseId,
      table.orderIndex
    ),
    orderGuard: check('exercise_sets_order_index_non_negative', sql`${table.orderIndex} >= 0`),
  })
);

export type ExerciseSet = typeof exerciseSets.$inferSelect;
export type NewExerciseSet = typeof exerciseSets.$inferInsert;
