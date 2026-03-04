CREATE TABLE `exercise_tag_definitions` (
	`id` text PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))) NOT NULL,
	`exercise_definition_id` text NOT NULL,
	`name` text NOT NULL,
	`normalized_name` text NOT NULL,
	`deleted_at` integer,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`exercise_definition_id`) REFERENCES `exercise_definitions`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "exercise_tag_definitions_name_non_empty" CHECK("exercise_tag_definitions"."name" <> ''),
	CONSTRAINT "exercise_tag_definitions_normalized_name_non_empty" CHECK("exercise_tag_definitions"."normalized_name" <> '')
);
--> statement-breakpoint
CREATE INDEX `exercise_tag_definitions_exercise_definition_id_idx` ON `exercise_tag_definitions` (`exercise_definition_id`);--> statement-breakpoint
CREATE INDEX `exercise_tag_definitions_deleted_at_idx` ON `exercise_tag_definitions` (`deleted_at`);--> statement-breakpoint
CREATE UNIQUE INDEX `exercise_tag_definitions_exercise_id_normalized_name_unique` ON `exercise_tag_definitions` (`exercise_definition_id`,`normalized_name`);--> statement-breakpoint
CREATE TABLE `session_exercise_tags` (
	`id` text PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))) NOT NULL,
	`session_exercise_id` text NOT NULL,
	`exercise_tag_definition_id` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`session_exercise_id`) REFERENCES `session_exercises`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`exercise_tag_definition_id`) REFERENCES `exercise_tag_definitions`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `session_exercise_tags_session_exercise_id_idx` ON `session_exercise_tags` (`session_exercise_id`);--> statement-breakpoint
CREATE INDEX `session_exercise_tags_exercise_tag_definition_id_idx` ON `session_exercise_tags` (`exercise_tag_definition_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `session_exercise_tags_session_exercise_id_tag_definition_unique` ON `session_exercise_tags` (`session_exercise_id`,`exercise_tag_definition_id`);--> statement-breakpoint
ALTER TABLE `session_exercises` ADD `exercise_definition_id` text REFERENCES exercise_definitions(id);--> statement-breakpoint
CREATE INDEX `session_exercises_exercise_definition_id_idx` ON `session_exercises` (`exercise_definition_id`);
