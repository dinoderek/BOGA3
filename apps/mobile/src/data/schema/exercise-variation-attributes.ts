import { sql } from 'drizzle-orm';
import { check, index, integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';

import { exerciseVariationKeys } from './exercise-variation-keys';
import { exerciseVariationValues } from './exercise-variation-values';
import { exerciseVariations } from './exercise-variations';

export const exerciseVariationAttributes = sqliteTable(
  'exercise_variation_attributes',
  {
    id: text('id')
      .primaryKey()
      .notNull()
      .default(sql`(lower(hex(randomblob(16))))`),
    exerciseVariationId: text('exercise_variation_id')
      .notNull()
      .references(() => exerciseVariations.id, { onDelete: 'cascade' }),
    variationKeyId: text('variation_key_id')
      .notNull()
      .references(() => exerciseVariationKeys.id, { onDelete: 'restrict' }),
    variationValueId: text('variation_value_id')
      .notNull()
      .references(() => exerciseVariationValues.id, { onDelete: 'restrict' }),
    orderIndex: integer('order_index').notNull().default(0),
    createdAt: integer('created_at', { mode: 'timestamp_ms' })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
  },
  (table) => ({
    exerciseVariationIdx: index('exercise_variation_attributes_exercise_variation_id_idx').on(table.exerciseVariationId),
    variationKeyIdx: index('exercise_variation_attributes_variation_key_id_idx').on(table.variationKeyId),
    variationValueIdx: index('exercise_variation_attributes_variation_value_id_idx').on(table.variationValueId),
    variationOrderUnique: uniqueIndex('exercise_variation_attributes_variation_id_order_index_unique').on(
      table.exerciseVariationId,
      table.orderIndex
    ),
    variationKeyUnique: uniqueIndex('exercise_variation_attributes_variation_id_key_id_unique').on(
      table.exerciseVariationId,
      table.variationKeyId
    ),
    orderIndexNonNegativeGuard: check(
      'exercise_variation_attributes_order_index_non_negative',
      sql`${table.orderIndex} >= 0`
    ),
  })
);

export type ExerciseVariationAttribute = typeof exerciseVariationAttributes.$inferSelect;
export type NewExerciseVariationAttribute = typeof exerciseVariationAttributes.$inferInsert;
