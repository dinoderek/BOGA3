import { eq } from 'drizzle-orm';

import { bootstrapLocalDataLayer } from './bootstrap';
import { gyms } from './schema';
import { enqueueSyncEventsTx } from '@/src/sync';

export type UpsertLocalGymInput = {
  id: string;
  name: string;
  now?: Date;
};

export type LocalGymLookupRecord = {
  id: string;
  name: string;
};

export const upsertLocalGym = async (input: UpsertLocalGymInput) => {
  const database = await bootstrapLocalDataLayer();
  const now = input.now ?? new Date();

  database.transaction((tx) => {
    const existing = tx.select().from(gyms).where(eq(gyms.id, input.id)).get();

    if (existing) {
      tx.update(gyms)
        .set({
          name: input.name,
          updatedAt: now,
        })
        .where(eq(gyms.id, input.id))
        .run();

      enqueueSyncEventsTx(
        tx,
        [
          {
            entityType: 'gyms',
            entityId: input.id,
            eventType: 'upsert',
            occurredAt: now,
            payload: {
              id: input.id,
              name: input.name,
              origin_scope_id: existing.originScopeId,
              origin_source_id: existing.originSourceId,
              created_at_ms: existing.createdAt.getTime(),
              updated_at_ms: now.getTime(),
            },
          },
        ],
        { now }
      );
      return;
    }

    tx.insert(gyms)
      .values({
        id: input.id,
        name: input.name,
        originScopeId: 'private',
        originSourceId: 'local',
        createdAt: now,
        updatedAt: now,
      })
      .run();

    enqueueSyncEventsTx(
      tx,
      [
        {
          entityType: 'gyms',
          entityId: input.id,
          eventType: 'upsert',
          occurredAt: now,
          payload: {
            id: input.id,
            name: input.name,
            origin_scope_id: 'private',
            origin_source_id: 'local',
            created_at_ms: now.getTime(),
            updated_at_ms: now.getTime(),
          },
        },
      ],
      { now }
    );
  });
};

export const loadLocalGymById = async (gymId: string): Promise<LocalGymLookupRecord | null> => {
  const database = await bootstrapLocalDataLayer();
  const row = database.select({ id: gyms.id, name: gyms.name }).from(gyms).where(eq(gyms.id, gymId)).get();
  return row ?? null;
};
