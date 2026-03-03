import * as schema from '@/src/data/schema';
import { localRuntimeMigrations } from '@/src/data/migrations';

describe('domain schema and runtime migrations', () => {
  it('exports domain tables and no longer exports smoke table from schema index', () => {
    expect(schema).toMatchObject({
      muscleGroups: expect.any(Object),
      exerciseDefinitions: expect.any(Object),
      exerciseMuscleMappings: expect.any(Object),
      exerciseVariationKeys: expect.any(Object),
      exerciseVariationValues: expect.any(Object),
      exerciseVariations: expect.any(Object),
      exerciseVariationAttributes: expect.any(Object),
      gyms: expect.any(Object),
      syncState: expect.any(Object),
      sessions: expect.any(Object),
      sessionExercises: expect.any(Object),
      exerciseSets: expect.any(Object),
    });
    expect(schema).not.toHaveProperty('smokeRecords');
  });

  it('includes session lifecycle, taxonomy tables, and deterministic ordering constraints in runtime SQL', () => {
    const migrationSql = Object.values(localRuntimeMigrations.migrations).join('\n');
    const lifecycleStatusMigration = localRuntimeMigrations.migrations.m0004;

    expect(migrationSql).toContain('CREATE TABLE `muscle_groups`');
    expect(migrationSql).toContain('CREATE TABLE `exercise_definitions`');
    expect(migrationSql).toContain('CREATE TABLE `exercise_muscle_mappings`');
    expect(migrationSql).toContain('CREATE TABLE `exercise_variation_keys`');
    expect(migrationSql).toContain('CREATE TABLE `exercise_variation_values`');
    expect(migrationSql).toContain('CREATE TABLE `exercise_variations`');
    expect(migrationSql).toContain('CREATE TABLE `exercise_variation_attributes`');

    expect(migrationSql).toContain('CREATE TABLE `gyms`');
    expect(migrationSql).toContain('CREATE TABLE `sync_state`');
    expect(migrationSql).toContain('CREATE TABLE `sessions`');
    expect(migrationSql).toContain('CREATE TABLE `session_exercises`');
    expect(migrationSql).toContain('CREATE TABLE `exercise_sets`');

    expect(migrationSql).toContain('`started_at` integer NOT NULL');
    expect(migrationSql).toContain('`completed_at` integer');
    expect(migrationSql).toContain('`duration_sec` integer');
    expect(migrationSql).toContain('`deleted_at` integer');
    expect(lifecycleStatusMigration).toContain('`status` text DEFAULT \'active\' NOT NULL');
    expect(lifecycleStatusMigration).toContain(
      'CONSTRAINT "sessions_status_guard" CHECK("status" in (\'active\', \'completed\'))'
    );
    expect(lifecycleStatusMigration).toContain('INSERT INTO `__new_sessions`');
    expect(lifecycleStatusMigration).toContain("ELSE 'active'");
    expect(lifecycleStatusMigration).toContain('PRAGMA foreign_keys=OFF;');
    expect(lifecycleStatusMigration).toContain('PRAGMA foreign_keys=ON;');

    expect(migrationSql).toContain('`is_editable` integer DEFAULT 0 NOT NULL');
    expect(migrationSql).toContain('`weight` real NOT NULL');
    expect(migrationSql).toContain('`exercise_definition_id` text');
    expect(migrationSql).toContain('`exercise_variation_id` text');

    expect(migrationSql).toContain(
      'CREATE UNIQUE INDEX `session_exercises_session_id_order_index_unique` ON `session_exercises` (`session_id`,`order_index`)'
    );
    expect(migrationSql).toContain(
      'CREATE UNIQUE INDEX `exercise_sets_session_exercise_id_order_index_unique` ON `exercise_sets` (`session_exercise_id`,`order_index`)'
    );
    expect(migrationSql).toContain(
      'CREATE UNIQUE INDEX `exercise_muscle_mappings_exercise_id_muscle_group_id_unique` ON `exercise_muscle_mappings` (`exercise_definition_id`,`muscle_group_id`)'
    );
    expect(migrationSql).toContain(
      'CREATE UNIQUE INDEX `exercise_variation_values_key_id_slug_unique` ON `exercise_variation_values` (`variation_key_id`,`slug`)'
    );
    expect(migrationSql).toContain(
      'CREATE UNIQUE INDEX `exercise_variations_exercise_id_descriptor_unique` ON `exercise_variations` (`exercise_definition_id`,`descriptor`)'
    );
    expect(migrationSql).toContain(
      'CREATE UNIQUE INDEX `exercise_variation_attributes_variation_id_key_id_unique` ON `exercise_variation_attributes` (`exercise_variation_id`,`variation_key_id`)'
    );
    expect(migrationSql).toContain('CREATE INDEX `sessions_deleted_at_idx` ON `sessions` (`deleted_at`)');
    expect(migrationSql).toContain('`last_successful_sync_at` integer');
    expect(migrationSql).toContain('`last_failed_sync_at` integer');
    expect(migrationSql).toContain('`last_attempted_sync_at` integer');
    expect(migrationSql).toContain('CREATE INDEX `sync_state_status_idx` ON `sync_state` (`status`)');
    expect(migrationSql).toContain(
      'CONSTRAINT "sync_state_status_guard" CHECK("sync_state"."status" in (\'never_initialized\', \'idle\', \'syncing\', \'paused\', \'error\'))'
    );
    expect(migrationSql).toContain(
      'CONSTRAINT "sync_state_paused_reason_guard" CHECK("sync_state"."paused_reason" is null or "sync_state"."paused_reason" in (\'auth_missing\', \'auth_expired\', \'backend_unconfigured\', \'offline\', \'backend_unavailable\'))'
    );
    expect(migrationSql).toContain(
      'CONSTRAINT "exercise_muscle_mappings_weight_positive" CHECK("exercise_muscle_mappings"."weight" > 0)'
    );
    expect(migrationSql).toContain(
      'CONSTRAINT "exercise_variation_keys_is_system_boolean_guard" CHECK("exercise_variation_keys"."is_system" in (0, 1))'
    );
    expect(migrationSql).toContain(
      'CONSTRAINT "muscle_groups_non_editable_guard" CHECK("muscle_groups"."is_editable" = 0)'
    );
    expect(migrationSql).toContain(
      'CONSTRAINT "exercise_definitions_name_non_empty" CHECK("exercise_definitions"."name" <> \'\')'
    );
    expect(migrationSql).toContain('CREATE INDEX `exercise_definitions_deleted_at_idx` ON `exercise_definitions` (`deleted_at`)');

    expect(migrationSql).not.toContain('CREATE INDEX `exercise_definitions_origin_scope_id_idx`');
    expect(migrationSql).not.toContain('CREATE INDEX `exercise_definitions_origin_source_id_idx`');
    expect(migrationSql).not.toContain('CREATE UNIQUE INDEX `exercise_definitions_origin_identity_unique`');
    expect(migrationSql).not.toContain('CONSTRAINT "exercise_definitions_origin_scope_id_non_empty"');
    expect(migrationSql).not.toContain('CONSTRAINT "exercise_definitions_origin_source_id_non_empty"');
    expect(migrationSql).not.toContain('CONSTRAINT "exercise_definitions_origin_source_key_non_empty"');
    expect(migrationSql).not.toContain('`is_user_editable` integer');

    expect(migrationSql).not.toContain('`name` text NOT NULL UNIQUE');
  });
});
