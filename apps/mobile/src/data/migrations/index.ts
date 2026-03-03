import type { migrate as migrateExpoSqlite } from 'drizzle-orm/expo-sqlite/migrator';

type RuntimeMigrationConfig = Parameters<typeof migrateExpoSqlite>[1];

export const localRuntimeMigrations: RuntimeMigrationConfig = {
  // Keep this bundle aligned with files generated under apps/mobile/drizzle/**.
  journal: {
    entries: [
      {
        idx: 0,
        when: 1771519674243,
        tag: '0000_quiet_famine',
        breakpoints: true,
      },
      {
        idx: 1,
        when: 1771597303513,
        tag: '0001_wet_moondragon',
        breakpoints: true,
      },
      {
        idx: 2,
        when: 1771865922639,
        tag: '0002_pink_justice',
        breakpoints: true,
      },
      {
        idx: 3,
        when: 1771955085482,
        tag: '0003_tiny_captain_universe',
        breakpoints: true,
      },
      {
        idx: 4,
        when: 1772125192000,
        tag: '0004_active_completed_lifecycle',
        breakpoints: true,
      },
      {
        idx: 5,
        when: 1772190386093,
        tag: '0005_slimy_iron_lad',
        breakpoints: true,
      },
      {
        idx: 6,
        when: 1772538794922,
        tag: '0006_ordinary_madame_masque',
        breakpoints: true,
      },
      {
        idx: 7,
        when: 1772543998782,
        tag: '0007_good_the_professor',
        breakpoints: true,
      },
    ],
  },
  migrations: {
    m0000: `CREATE TABLE \`smoke_records\` (
	\`id\` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	\`value\` text NOT NULL,
	\`created_at\` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	\`updated_at\` integer DEFAULT (unixepoch() * 1000) NOT NULL
);
`,
    m0001: `CREATE TABLE \`exercise_sets\` (
	\`id\` text PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))) NOT NULL,
	\`session_exercise_id\` text NOT NULL,
	\`order_index\` integer NOT NULL,
	\`weight_value\` text DEFAULT '' NOT NULL,
	\`reps_value\` text DEFAULT '' NOT NULL,
	\`created_at\` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	\`updated_at\` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (\`session_exercise_id\`) REFERENCES \`session_exercises\`(\`id\`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "exercise_sets_order_index_non_negative" CHECK("exercise_sets"."order_index" >= 0)
);
--> statement-breakpoint
CREATE INDEX \`exercise_sets_session_exercise_id_idx\` ON \`exercise_sets\` (\`session_exercise_id\`);--> statement-breakpoint
CREATE UNIQUE INDEX \`exercise_sets_session_exercise_id_order_index_unique\` ON \`exercise_sets\` (\`session_exercise_id\`,\`order_index\`);--> statement-breakpoint
CREATE TABLE \`gyms\` (
	\`id\` text PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))) NOT NULL,
	\`name\` text NOT NULL,
	\`origin_scope_id\` text DEFAULT 'private' NOT NULL,
	\`origin_source_id\` text DEFAULT 'local' NOT NULL,
	\`created_at\` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	\`updated_at\` integer DEFAULT (unixepoch() * 1000) NOT NULL
);
--> statement-breakpoint
CREATE INDEX \`gyms_name_idx\` ON \`gyms\` (\`name\`);--> statement-breakpoint
CREATE INDEX \`gyms_origin_scope_id_idx\` ON \`gyms\` (\`origin_scope_id\`);--> statement-breakpoint
CREATE TABLE \`session_exercises\` (
	\`id\` text PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))) NOT NULL,
	\`session_id\` text NOT NULL,
	\`order_index\` integer NOT NULL,
	\`name\` text NOT NULL,
	\`machine_name\` text,
	\`origin_scope_id\` text DEFAULT 'private' NOT NULL,
	\`origin_source_id\` text DEFAULT 'local' NOT NULL,
	\`created_at\` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	\`updated_at\` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (\`session_id\`) REFERENCES \`sessions\`(\`id\`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "session_exercises_order_index_non_negative" CHECK("session_exercises"."order_index" >= 0)
);
--> statement-breakpoint
CREATE INDEX \`session_exercises_session_id_idx\` ON \`session_exercises\` (\`session_id\`);--> statement-breakpoint
CREATE UNIQUE INDEX \`session_exercises_session_id_order_index_unique\` ON \`session_exercises\` (\`session_id\`,\`order_index\`);--> statement-breakpoint
CREATE TABLE \`sessions\` (
	\`id\` text PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))) NOT NULL,
	\`gym_id\` text,
	\`status\` text DEFAULT 'draft' NOT NULL,
	\`started_at\` integer NOT NULL,
	\`completed_at\` integer,
	\`duration_sec\` integer,
	\`created_at\` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	\`updated_at\` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (\`gym_id\`) REFERENCES \`gyms\`(\`id\`) ON UPDATE no action ON DELETE set null,
	CONSTRAINT "sessions_status_guard" CHECK("sessions"."status" in ('draft', 'active', 'completed')),
	CONSTRAINT "sessions_duration_non_negative" CHECK("sessions"."duration_sec" is null or "sessions"."duration_sec" >= 0)
);
--> statement-breakpoint
CREATE INDEX \`sessions_status_idx\` ON \`sessions\` (\`status\`);--> statement-breakpoint
CREATE INDEX \`sessions_completed_at_idx\` ON \`sessions\` (\`completed_at\`);
`,
    m0002: `ALTER TABLE \`sessions\` ADD \`deleted_at\` integer;--> statement-breakpoint
CREATE INDEX \`sessions_deleted_at_idx\` ON \`sessions\` (\`deleted_at\`);`,
    m0003: `CREATE TABLE \`exercise_definitions\` (
	\`id\` text PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))) NOT NULL,
	\`name\` text NOT NULL,
	\`created_at\` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	\`updated_at\` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	CONSTRAINT "exercise_definitions_name_non_empty" CHECK("exercise_definitions"."name" <> '')
);
--> statement-breakpoint
CREATE INDEX \`exercise_definitions_name_idx\` ON \`exercise_definitions\` (\`name\`);--> statement-breakpoint
CREATE TABLE \`exercise_muscle_mappings\` (
	\`id\` text PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))) NOT NULL,
	\`exercise_definition_id\` text NOT NULL,
	\`muscle_group_id\` text NOT NULL,
	\`weight\` real NOT NULL,
	\`role\` text,
	\`created_at\` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	\`updated_at\` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (\`exercise_definition_id\`) REFERENCES \`exercise_definitions\`(\`id\`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (\`muscle_group_id\`) REFERENCES \`muscle_groups\`(\`id\`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "exercise_muscle_mappings_weight_positive" CHECK("exercise_muscle_mappings"."weight" > 0),
	CONSTRAINT "exercise_muscle_mappings_role_guard" CHECK("exercise_muscle_mappings"."role" is null or "exercise_muscle_mappings"."role" in ('primary', 'secondary', 'stabilizer'))
);
--> statement-breakpoint
CREATE INDEX \`exercise_muscle_mappings_exercise_definition_id_idx\` ON \`exercise_muscle_mappings\` (\`exercise_definition_id\`);--> statement-breakpoint
CREATE INDEX \`exercise_muscle_mappings_muscle_group_id_idx\` ON \`exercise_muscle_mappings\` (\`muscle_group_id\`);--> statement-breakpoint
CREATE UNIQUE INDEX \`exercise_muscle_mappings_exercise_id_muscle_group_id_unique\` ON \`exercise_muscle_mappings\` (\`exercise_definition_id\`,\`muscle_group_id\`);--> statement-breakpoint
CREATE TABLE \`muscle_groups\` (
	\`id\` text PRIMARY KEY NOT NULL,
	\`display_name\` text NOT NULL,
	\`family_name\` text NOT NULL,
	\`sort_order\` integer DEFAULT 0 NOT NULL,
	\`is_editable\` integer DEFAULT 0 NOT NULL,
	\`created_at\` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	\`updated_at\` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	CONSTRAINT "muscle_groups_sort_order_non_negative" CHECK("muscle_groups"."sort_order" >= 0),
	CONSTRAINT "muscle_groups_is_editable_boolean_guard" CHECK("muscle_groups"."is_editable" in (0, 1)),
	CONSTRAINT "muscle_groups_non_editable_guard" CHECK("muscle_groups"."is_editable" = 0)
);
--> statement-breakpoint
CREATE INDEX \`muscle_groups_family_name_idx\` ON \`muscle_groups\` (\`family_name\`);--> statement-breakpoint
CREATE INDEX \`muscle_groups_sort_order_idx\` ON \`muscle_groups\` (\`sort_order\`);--> statement-breakpoint
CREATE INDEX \`muscle_groups_display_name_idx\` ON \`muscle_groups\` (\`display_name\`);`,
    m0004: `PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE \`__new_sessions\` (
	\`id\` text PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))) NOT NULL,
	\`gym_id\` text,
	\`status\` text DEFAULT 'active' NOT NULL,
	\`started_at\` integer NOT NULL,
	\`completed_at\` integer,
	\`duration_sec\` integer,
	\`deleted_at\` integer,
	\`created_at\` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	\`updated_at\` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (\`gym_id\`) REFERENCES \`gyms\`(\`id\`) ON UPDATE no action ON DELETE set null,
	CONSTRAINT "sessions_status_guard" CHECK("status" in ('active', 'completed')),
	CONSTRAINT "sessions_duration_non_negative" CHECK("duration_sec" is null or "duration_sec" >= 0)
);
--> statement-breakpoint
INSERT INTO \`__new_sessions\` (\`id\`, \`gym_id\`, \`status\`, \`started_at\`, \`completed_at\`, \`duration_sec\`, \`deleted_at\`, \`created_at\`, \`updated_at\`)
SELECT
	\`id\`,
	\`gym_id\`,
	CASE
		WHEN \`status\` = 'completed' THEN 'completed'
		ELSE 'active'
	END,
	\`started_at\`,
	\`completed_at\`,
	\`duration_sec\`,
	\`deleted_at\`,
	\`created_at\`,
	\`updated_at\`
FROM \`sessions\`;--> statement-breakpoint
DROP TABLE \`sessions\`;--> statement-breakpoint
ALTER TABLE \`__new_sessions\` RENAME TO \`sessions\`;--> statement-breakpoint
CREATE INDEX \`sessions_status_idx\` ON \`sessions\` (\`status\`);--> statement-breakpoint
CREATE INDEX \`sessions_completed_at_idx\` ON \`sessions\` (\`completed_at\`);--> statement-breakpoint
CREATE INDEX \`sessions_deleted_at_idx\` ON \`sessions\` (\`deleted_at\`);--> statement-breakpoint
PRAGMA foreign_keys=ON;`,
    m0005: `ALTER TABLE \`exercise_definitions\` ADD \`deleted_at\` integer;--> statement-breakpoint
CREATE INDEX \`exercise_definitions_deleted_at_idx\` ON \`exercise_definitions\` (\`deleted_at\`);`,
    m0006: `CREATE TABLE \`sync_state\` (
	\`id\` text PRIMARY KEY DEFAULT 'device' NOT NULL,
	\`status\` text DEFAULT 'never_initialized' NOT NULL,
	\`paused_reason\` text,
	\`last_successful_sync_at\` integer,
	\`last_failed_sync_at\` integer,
	\`last_attempted_sync_at\` integer,
	\`created_at\` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	\`updated_at\` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	CONSTRAINT "sync_state_status_guard" CHECK("sync_state"."status" in ('never_initialized', 'idle', 'syncing', 'paused', 'error')),
	CONSTRAINT "sync_state_paused_reason_guard" CHECK("sync_state"."paused_reason" is null or "sync_state"."paused_reason" in ('auth_missing', 'auth_expired', 'backend_unconfigured', 'offline', 'backend_unavailable'))
);
--> statement-breakpoint
CREATE INDEX \`sync_state_status_idx\` ON \`sync_state\` (\`status\`);`,
    m0007: `CREATE TABLE \`exercise_variation_attributes\` (
	\`id\` text PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))) NOT NULL,
	\`exercise_variation_id\` text NOT NULL,
	\`variation_key_id\` text NOT NULL,
	\`variation_value_id\` text NOT NULL,
	\`order_index\` integer DEFAULT 0 NOT NULL,
	\`created_at\` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	\`updated_at\` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (\`exercise_variation_id\`) REFERENCES \`exercise_variations\`(\`id\`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (\`variation_key_id\`) REFERENCES \`exercise_variation_keys\`(\`id\`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (\`variation_value_id\`) REFERENCES \`exercise_variation_values\`(\`id\`) ON UPDATE no action ON DELETE restrict,
	CONSTRAINT "exercise_variation_attributes_order_index_non_negative" CHECK("exercise_variation_attributes"."order_index" >= 0)
);
--> statement-breakpoint
CREATE INDEX \`exercise_variation_attributes_exercise_variation_id_idx\` ON \`exercise_variation_attributes\` (\`exercise_variation_id\`);--> statement-breakpoint
CREATE INDEX \`exercise_variation_attributes_variation_key_id_idx\` ON \`exercise_variation_attributes\` (\`variation_key_id\`);--> statement-breakpoint
CREATE INDEX \`exercise_variation_attributes_variation_value_id_idx\` ON \`exercise_variation_attributes\` (\`variation_value_id\`);--> statement-breakpoint
CREATE UNIQUE INDEX \`exercise_variation_attributes_variation_id_order_index_unique\` ON \`exercise_variation_attributes\` (\`exercise_variation_id\`,\`order_index\`);--> statement-breakpoint
CREATE UNIQUE INDEX \`exercise_variation_attributes_variation_id_key_id_unique\` ON \`exercise_variation_attributes\` (\`exercise_variation_id\`,\`variation_key_id\`);--> statement-breakpoint
CREATE TABLE \`exercise_variation_keys\` (
	\`id\` text PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))) NOT NULL,
	\`slug\` text NOT NULL,
	\`display_name\` text NOT NULL,
	\`is_system\` integer DEFAULT 0 NOT NULL,
	\`created_at\` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	\`updated_at\` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	CONSTRAINT "exercise_variation_keys_slug_non_empty" CHECK("exercise_variation_keys"."slug" <> ''),
	CONSTRAINT "exercise_variation_keys_display_name_non_empty" CHECK("exercise_variation_keys"."display_name" <> ''),
	CONSTRAINT "exercise_variation_keys_is_system_boolean_guard" CHECK("exercise_variation_keys"."is_system" in (0, 1))
);
--> statement-breakpoint
CREATE UNIQUE INDEX \`exercise_variation_keys_slug_unique\` ON \`exercise_variation_keys\` (\`slug\`);--> statement-breakpoint
CREATE TABLE \`exercise_variation_values\` (
	\`id\` text PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))) NOT NULL,
	\`variation_key_id\` text NOT NULL,
	\`slug\` text NOT NULL,
	\`display_name\` text NOT NULL,
	\`is_system\` integer DEFAULT 0 NOT NULL,
	\`created_at\` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	\`updated_at\` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (\`variation_key_id\`) REFERENCES \`exercise_variation_keys\`(\`id\`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "exercise_variation_values_slug_non_empty" CHECK("exercise_variation_values"."slug" <> ''),
	CONSTRAINT "exercise_variation_values_display_name_non_empty" CHECK("exercise_variation_values"."display_name" <> ''),
	CONSTRAINT "exercise_variation_values_is_system_boolean_guard" CHECK("exercise_variation_values"."is_system" in (0, 1))
);
--> statement-breakpoint
CREATE INDEX \`exercise_variation_values_variation_key_id_idx\` ON \`exercise_variation_values\` (\`variation_key_id\`);--> statement-breakpoint
CREATE UNIQUE INDEX \`exercise_variation_values_key_id_slug_unique\` ON \`exercise_variation_values\` (\`variation_key_id\`,\`slug\`);--> statement-breakpoint
CREATE UNIQUE INDEX \`exercise_variation_values_key_id_id_unique\` ON \`exercise_variation_values\` (\`variation_key_id\`,\`id\`);--> statement-breakpoint
CREATE TABLE \`exercise_variations\` (
	\`id\` text PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))) NOT NULL,
	\`exercise_definition_id\` text NOT NULL,
	\`label\` text NOT NULL,
	\`descriptor\` text NOT NULL,
	\`deleted_at\` integer,
	\`created_at\` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	\`updated_at\` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (\`exercise_definition_id\`) REFERENCES \`exercise_definitions\`(\`id\`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "exercise_variations_label_non_empty" CHECK("exercise_variations"."label" <> ''),
	CONSTRAINT "exercise_variations_descriptor_non_empty" CHECK("exercise_variations"."descriptor" <> '')
);
--> statement-breakpoint
CREATE INDEX \`exercise_variations_exercise_definition_id_idx\` ON \`exercise_variations\` (\`exercise_definition_id\`);--> statement-breakpoint
CREATE INDEX \`exercise_variations_deleted_at_idx\` ON \`exercise_variations\` (\`deleted_at\`);--> statement-breakpoint
CREATE UNIQUE INDEX \`exercise_variations_exercise_id_descriptor_unique\` ON \`exercise_variations\` (\`exercise_definition_id\`,\`descriptor\`);--> statement-breakpoint
ALTER TABLE \`session_exercises\` ADD \`exercise_definition_id\` text REFERENCES exercise_definitions(id);--> statement-breakpoint
ALTER TABLE \`session_exercises\` ADD \`exercise_variation_id\` text REFERENCES exercise_variations(id);--> statement-breakpoint
CREATE INDEX \`session_exercises_exercise_definition_id_idx\` ON \`session_exercises\` (\`exercise_definition_id\`);--> statement-breakpoint
CREATE INDEX \`session_exercises_exercise_variation_id_idx\` ON \`session_exercises\` (\`exercise_variation_id\`);`,
  },
};
