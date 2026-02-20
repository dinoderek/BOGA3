import { sql } from 'drizzle-orm';
import { check, index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

import { gyms } from './gyms';

export const sessions = sqliteTable(
  'sessions',
  {
    id: text('id')
      .primaryKey()
      .notNull()
      .default(sql`(lower(hex(randomblob(16))))`),
    gymId: text('gym_id').references(() => gyms.id, { onDelete: 'set null' }),
    status: text('status', { enum: ['draft', 'active', 'completed'] })
      .notNull()
      .default('draft'),
    startedAt: integer('started_at', { mode: 'timestamp_ms' }).notNull(),
    completedAt: integer('completed_at', { mode: 'timestamp_ms' }),
    durationSec: integer('duration_sec'),
    createdAt: integer('created_at', { mode: 'timestamp_ms' })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
  },
  (table) => ({
    statusIdx: index('sessions_status_idx').on(table.status),
    completedAtIdx: index('sessions_completed_at_idx').on(table.completedAt),
    statusGuard: check(
      'sessions_status_guard',
      sql`${table.status} in ('draft', 'active', 'completed')`
    ),
    durationGuard: check('sessions_duration_non_negative', sql`${table.durationSec} is null or ${table.durationSec} >= 0`),
  })
);

export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;
