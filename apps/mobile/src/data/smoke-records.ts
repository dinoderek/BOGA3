import { asc, desc } from 'drizzle-orm';

import { bootstrapLocalDataLayer } from './bootstrap';
import { smokeRecords } from './schema/smoke';

export type SmokeRecord = typeof smokeRecords.$inferSelect;

export const insertSmokeRecord = async (value: string): Promise<SmokeRecord> => {
  const database = await bootstrapLocalDataLayer();

  database.insert(smokeRecords).values({ value }).run();

  const insertedRecord = database.select().from(smokeRecords).orderBy(desc(smokeRecords.id)).get();

  if (!insertedRecord) {
    throw new Error('Smoke record insert succeeded but no record was returned');
  }

  return insertedRecord;
};

export const listSmokeRecords = async (): Promise<SmokeRecord[]> => {
  const database = await bootstrapLocalDataLayer();

  return database.select().from(smokeRecords).orderBy(asc(smokeRecords.id)).all();
};
