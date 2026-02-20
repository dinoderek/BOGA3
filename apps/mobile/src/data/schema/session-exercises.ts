import { sql } from 'drizzle-orm';
import { check, index, integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';

import { sessions } from './sessions';

export const sessionExercises = sqliteTable(
  'session_exercises',
  {
    id: text('id')
      .primaryKey()
      .notNull()
      .default(sql`(lower(hex(randomblob(16))))`),
    sessionId: text('session_id')
      .notNull()
      .references(() => sessions.id, { onDelete: 'cascade' }),
    orderIndex: integer('order_index').notNull(),
    name: text('name').notNull(),
    machineName: text('machine_name'),
    originScopeId: text('origin_scope_id').notNull().default('private'),
    originSourceId: text('origin_source_id').notNull().default('local'),
    createdAt: integer('created_at', { mode: 'timestamp_ms' })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
  },
  (table) => ({
    sessionIdx: index('session_exercises_session_id_idx').on(table.sessionId),
    sessionOrderUnique: uniqueIndex('session_exercises_session_id_order_index_unique').on(
      table.sessionId,
      table.orderIndex
    ),
    orderGuard: check('session_exercises_order_index_non_negative', sql`${table.orderIndex} >= 0`),
  })
);

export type SessionExercise = typeof sessionExercises.$inferSelect;
export type NewSessionExercise = typeof sessionExercises.$inferInsert;
