CREATE TABLE `exercise_definitions` (
	`id` text PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))) NOT NULL,
	`name` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	CONSTRAINT "exercise_definitions_name_non_empty" CHECK("exercise_definitions"."name" <> '')
);
--> statement-breakpoint
CREATE INDEX `exercise_definitions_name_idx` ON `exercise_definitions` (`name`);--> statement-breakpoint
CREATE TABLE `exercise_muscle_mappings` (
	`id` text PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))) NOT NULL,
	`exercise_definition_id` text NOT NULL,
	`muscle_group_id` text NOT NULL,
	`weight` real NOT NULL,
	`role` text,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`exercise_definition_id`) REFERENCES `exercise_definitions`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`muscle_group_id`) REFERENCES `muscle_groups`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "exercise_muscle_mappings_weight_positive" CHECK("exercise_muscle_mappings"."weight" > 0),
	CONSTRAINT "exercise_muscle_mappings_role_guard" CHECK("exercise_muscle_mappings"."role" is null or "exercise_muscle_mappings"."role" in ('primary', 'secondary', 'stabilizer'))
);
--> statement-breakpoint
CREATE INDEX `exercise_muscle_mappings_exercise_definition_id_idx` ON `exercise_muscle_mappings` (`exercise_definition_id`);--> statement-breakpoint
CREATE INDEX `exercise_muscle_mappings_muscle_group_id_idx` ON `exercise_muscle_mappings` (`muscle_group_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `exercise_muscle_mappings_exercise_id_muscle_group_id_unique` ON `exercise_muscle_mappings` (`exercise_definition_id`,`muscle_group_id`);--> statement-breakpoint
CREATE TABLE `muscle_groups` (
	`id` text PRIMARY KEY NOT NULL,
	`display_name` text NOT NULL,
	`family_name` text NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`is_editable` integer DEFAULT 0 NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	CONSTRAINT "muscle_groups_sort_order_non_negative" CHECK("muscle_groups"."sort_order" >= 0),
	CONSTRAINT "muscle_groups_is_editable_boolean_guard" CHECK("muscle_groups"."is_editable" in (0, 1)),
	CONSTRAINT "muscle_groups_non_editable_guard" CHECK("muscle_groups"."is_editable" = 0)
);
--> statement-breakpoint
CREATE INDEX `muscle_groups_family_name_idx` ON `muscle_groups` (`family_name`);--> statement-breakpoint
CREATE INDEX `muscle_groups_sort_order_idx` ON `muscle_groups` (`sort_order`);--> statement-breakpoint
CREATE INDEX `muscle_groups_display_name_idx` ON `muscle_groups` (`display_name`);