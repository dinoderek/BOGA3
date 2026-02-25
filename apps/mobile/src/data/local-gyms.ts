import { eq } from 'drizzle-orm';

import { bootstrapLocalDataLayer } from './bootstrap';
import { gyms } from './schema';

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
    const existing = tx.select({ id: gyms.id }).from(gyms).where(eq(gyms.id, input.id)).get();

    if (existing) {
      tx.update(gyms)
        .set({
          name: input.name,
          updatedAt: now,
        })
        .where(eq(gyms.id, input.id))
        .run();
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
  });
};

export const loadLocalGymById = async (gymId: string): Promise<LocalGymLookupRecord | null> => {
  const database = await bootstrapLocalDataLayer();
  const row = database.select({ id: gyms.id, name: gyms.name }).from(gyms).where(eq(gyms.id, gymId)).get();
  return row ?? null;
};
