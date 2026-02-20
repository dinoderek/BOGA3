import { sql } from 'drizzle-orm';
import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const gyms = sqliteTable(
  'gyms',
  {
    id: text('id')
      .primaryKey()
      .notNull()
      .default(sql`(lower(hex(randomblob(16))))`),
    name: text('name').notNull(),
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
    nameLookupIdx: index('gyms_name_idx').on(table.name),
    originScopeIdx: index('gyms_origin_scope_id_idx').on(table.originScopeId),
  })
);

export type Gym = typeof gyms.$inferSelect;
export type NewGym = typeof gyms.$inferInsert;
