import * as schema from '@/src/data/schema';
import { localRuntimeMigrations } from '@/src/data/migrations';

describe('domain schema and runtime migrations', () => {
  it('exports domain tables and no longer exports smoke table from schema index', () => {
    expect(schema).toMatchObject({
      gyms: expect.any(Object),
      sessions: expect.any(Object),
      sessionExercises: expect.any(Object),
      exerciseSets: expect.any(Object),
    });
    expect(schema).not.toHaveProperty('smokeRecords');
  });

  it('includes session lifecycle, provenance defaults, and deterministic ordering constraints in runtime SQL', () => {
    const migrationSql = Object.values(localRuntimeMigrations.migrations).join('\n');

    expect(migrationSql).toContain('CREATE TABLE `gyms`');
    expect(migrationSql).toContain('CREATE TABLE `sessions`');
    expect(migrationSql).toContain('CREATE TABLE `session_exercises`');
    expect(migrationSql).toContain('CREATE TABLE `exercise_sets`');

    expect(migrationSql).toContain('`status` text DEFAULT \'draft\' NOT NULL');
    expect(migrationSql).toContain('`started_at` integer NOT NULL');
    expect(migrationSql).toContain('`completed_at` integer');
    expect(migrationSql).toContain('`duration_sec` integer');

    expect(migrationSql).toContain('`origin_scope_id` text DEFAULT \'private\' NOT NULL');
    expect(migrationSql).toContain('`origin_source_id` text DEFAULT \'local\' NOT NULL');

    expect(migrationSql).toContain(
      'CREATE UNIQUE INDEX `session_exercises_session_id_order_index_unique` ON `session_exercises` (`session_id`,`order_index`)'
    );
    expect(migrationSql).toContain(
      'CREATE UNIQUE INDEX `exercise_sets_session_exercise_id_order_index_unique` ON `exercise_sets` (`session_exercise_id`,`order_index`)'
    );

    expect(migrationSql).not.toContain('`name` text NOT NULL UNIQUE');
  });
});
