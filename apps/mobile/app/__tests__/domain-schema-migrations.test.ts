import * as schema from '@/src/data/schema';
import { localRuntimeMigrations } from '@/src/data/migrations';

describe('domain schema and runtime migrations', () => {
  it('exports domain tables and no longer exports smoke table from schema index', () => {
    expect(schema).toMatchObject({
      muscleGroups: expect.any(Object),
      exerciseDefinitions: expect.any(Object),
      exerciseMuscleMappings: expect.any(Object),
      gyms: expect.any(Object),
      sessions: expect.any(Object),
      sessionExercises: expect.any(Object),
      exerciseSets: expect.any(Object),
    });
    expect(schema).not.toHaveProperty('smokeRecords');
  });

  it('includes session lifecycle, taxonomy tables, and deterministic ordering constraints in runtime SQL', () => {
    const migrationSql = Object.values(localRuntimeMigrations.migrations).join('\n');

    expect(migrationSql).toContain('CREATE TABLE `muscle_groups`');
    expect(migrationSql).toContain('CREATE TABLE `exercise_definitions`');
    expect(migrationSql).toContain('CREATE TABLE `exercise_muscle_mappings`');

    expect(migrationSql).toContain('CREATE TABLE `gyms`');
    expect(migrationSql).toContain('CREATE TABLE `sessions`');
    expect(migrationSql).toContain('CREATE TABLE `session_exercises`');
    expect(migrationSql).toContain('CREATE TABLE `exercise_sets`');

    expect(migrationSql).toContain('`status` text DEFAULT \'draft\' NOT NULL');
    expect(migrationSql).toContain('`started_at` integer NOT NULL');
    expect(migrationSql).toContain('`completed_at` integer');
    expect(migrationSql).toContain('`duration_sec` integer');
    expect(migrationSql).toContain('`deleted_at` integer');

    expect(migrationSql).toContain('`is_editable` integer DEFAULT 0 NOT NULL');
    expect(migrationSql).toContain('`weight` real NOT NULL');

    expect(migrationSql).toContain(
      'CREATE UNIQUE INDEX `session_exercises_session_id_order_index_unique` ON `session_exercises` (`session_id`,`order_index`)'
    );
    expect(migrationSql).toContain(
      'CREATE UNIQUE INDEX `exercise_sets_session_exercise_id_order_index_unique` ON `exercise_sets` (`session_exercise_id`,`order_index`)'
    );
    expect(migrationSql).toContain(
      'CREATE UNIQUE INDEX `exercise_muscle_mappings_exercise_id_muscle_group_id_unique` ON `exercise_muscle_mappings` (`exercise_definition_id`,`muscle_group_id`)'
    );
    expect(migrationSql).toContain('CREATE INDEX `sessions_deleted_at_idx` ON `sessions` (`deleted_at`)');
    expect(migrationSql).toContain(
      'CONSTRAINT "exercise_muscle_mappings_weight_positive" CHECK("exercise_muscle_mappings"."weight" > 0)'
    );
    expect(migrationSql).toContain(
      'CONSTRAINT "muscle_groups_non_editable_guard" CHECK("muscle_groups"."is_editable" = 0)'
    );
    expect(migrationSql).toContain(
      'CONSTRAINT "exercise_definitions_name_non_empty" CHECK("exercise_definitions"."name" <> \'\')'
    );

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
