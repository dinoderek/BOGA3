CREATE TABLE `exercise_sets` (
	`id` text PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))) NOT NULL,
	`session_exercise_id` text NOT NULL,
	`order_index` integer NOT NULL,
	`weight_value` text DEFAULT '' NOT NULL,
	`reps_value` text DEFAULT '' NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`session_exercise_id`) REFERENCES `session_exercises`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "exercise_sets_order_index_non_negative" CHECK("exercise_sets"."order_index" >= 0)
);
--> statement-breakpoint
CREATE INDEX `exercise_sets_session_exercise_id_idx` ON `exercise_sets` (`session_exercise_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `exercise_sets_session_exercise_id_order_index_unique` ON `exercise_sets` (`session_exercise_id`,`order_index`);--> statement-breakpoint
CREATE TABLE `gyms` (
	`id` text PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))) NOT NULL,
	`name` text NOT NULL,
	`origin_scope_id` text DEFAULT 'private' NOT NULL,
	`origin_source_id` text DEFAULT 'local' NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `gyms_name_idx` ON `gyms` (`name`);--> statement-breakpoint
CREATE INDEX `gyms_origin_scope_id_idx` ON `gyms` (`origin_scope_id`);--> statement-breakpoint
CREATE TABLE `session_exercises` (
	`id` text PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))) NOT NULL,
	`session_id` text NOT NULL,
	`order_index` integer NOT NULL,
	`name` text NOT NULL,
	`machine_name` text,
	`origin_scope_id` text DEFAULT 'private' NOT NULL,
	`origin_source_id` text DEFAULT 'local' NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`session_id`) REFERENCES `sessions`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "session_exercises_order_index_non_negative" CHECK("session_exercises"."order_index" >= 0)
);
--> statement-breakpoint
CREATE INDEX `session_exercises_session_id_idx` ON `session_exercises` (`session_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `session_exercises_session_id_order_index_unique` ON `session_exercises` (`session_id`,`order_index`);--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` text PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))) NOT NULL,
	`gym_id` text,
	`status` text DEFAULT 'draft' NOT NULL,
	`started_at` integer NOT NULL,
	`completed_at` integer,
	`duration_sec` integer,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`gym_id`) REFERENCES `gyms`(`id`) ON UPDATE no action ON DELETE set null,
	CONSTRAINT "sessions_status_guard" CHECK("sessions"."status" in ('draft', 'active', 'completed')),
	CONSTRAINT "sessions_duration_non_negative" CHECK("sessions"."duration_sec" is null or "sessions"."duration_sec" >= 0)
);
--> statement-breakpoint
CREATE INDEX `sessions_status_idx` ON `sessions` (`status`);--> statement-breakpoint
CREATE INDEX `sessions_completed_at_idx` ON `sessions` (`completed_at`);