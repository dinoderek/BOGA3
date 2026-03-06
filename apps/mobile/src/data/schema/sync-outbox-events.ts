import { sql } from 'drizzle-orm';
import { check, index, integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';

export const syncOutboxEvents = sqliteTable(
  'sync_outbox_events',
  {
    id: integer('id').primaryKey({ autoIncrement: true }).notNull(),
    eventId: text('event_id').notNull(),
    sequenceInDevice: integer('sequence_in_device').notNull(),
    occurredAt: integer('occurred_at', { mode: 'timestamp_ms' }).notNull(),
    entityType: text('entity_type', {
      enum: [
        'gyms',
        'sessions',
        'session_exercises',
        'exercise_sets',
        'exercise_definitions',
        'exercise_muscle_mappings',
        'exercise_tag_definitions',
        'session_exercise_tags',
      ],
    }).notNull(),
    entityId: text('entity_id').notNull(),
    eventType: text('event_type', {
      enum: ['upsert', 'delete', 'attach', 'detach', 'reorder', 'complete'],
    }).notNull(),
    payloadJson: text('payload_json').notNull(),
    schemaVersion: integer('schema_version').notNull().default(1),
    traceId: text('trace_id'),
    createdAt: integer('created_at', { mode: 'timestamp_ms' })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
  },
  (table) => ({
    eventIdUnique: uniqueIndex('sync_outbox_events_event_id_unique').on(table.eventId),
    sequenceUnique: uniqueIndex('sync_outbox_events_sequence_in_device_unique').on(table.sequenceInDevice),
    createdAtIdx: index('sync_outbox_events_created_at_idx').on(table.createdAt),
    sequencePositiveGuard: check('sync_outbox_events_sequence_in_device_positive', sql`${table.sequenceInDevice} >= 1`),
    payloadNonEmptyGuard: check('sync_outbox_events_payload_json_non_empty', sql`${table.payloadJson} <> ''`),
  })
);

export type SyncOutboxEvent = typeof syncOutboxEvents.$inferSelect;
export type NewSyncOutboxEvent = typeof syncOutboxEvents.$inferInsert;
