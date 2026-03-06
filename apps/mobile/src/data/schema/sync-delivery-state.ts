import { sql } from 'drizzle-orm';
import { check, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const syncDeliveryState = sqliteTable(
  'sync_delivery_state',
  {
    id: text('id').primaryKey().notNull(),
    deviceId: text('device_id').notNull(),
    nextSequenceInDevice: integer('next_sequence_in_device').notNull().default(1),
    consecutiveFailures: integer('consecutive_failures').notNull().default(0),
    retryBlocked: integer('retry_blocked').notNull().default(0),
    nextAttemptAt: integer('next_attempt_at', { mode: 'timestamp_ms' }),
    lastAttemptAt: integer('last_attempt_at', { mode: 'timestamp_ms' }),
    lastSuccessAt: integer('last_success_at', { mode: 'timestamp_ms' }),
    lastErrorMessage: text('last_error_message'),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
  },
  (table) => ({
    nextSequencePositiveGuard: check(
      'sync_delivery_state_next_sequence_positive',
      sql`${table.nextSequenceInDevice} >= 1`
    ),
    consecutiveFailuresNonNegativeGuard: check(
      'sync_delivery_state_consecutive_failures_non_negative',
      sql`${table.consecutiveFailures} >= 0`
    ),
    retryBlockedBooleanGuard: check(
      'sync_delivery_state_retry_blocked_boolean_guard',
      sql`${table.retryBlocked} in (0, 1)`
    ),
  })
);

export type SyncDeliveryState = typeof syncDeliveryState.$inferSelect;
export type NewSyncDeliveryState = typeof syncDeliveryState.$inferInsert;
