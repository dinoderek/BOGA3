CREATE TABLE `exercise_variation_attributes` (
	`id` text PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))) NOT NULL,
	`exercise_variation_id` text NOT NULL,
	`variation_key_id` text NOT NULL,
	`variation_value_id` text NOT NULL,
	`order_index` integer DEFAULT 0 NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`exercise_variation_id`) REFERENCES `exercise_variations`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`variation_key_id`) REFERENCES `exercise_variation_keys`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`variation_value_id`) REFERENCES `exercise_variation_values`(`id`) ON UPDATE no action ON DELETE restrict,
	CONSTRAINT "exercise_variation_attributes_order_index_non_negative" CHECK("exercise_variation_attributes"."order_index" >= 0)
);
--> statement-breakpoint
CREATE INDEX `exercise_variation_attributes_exercise_variation_id_idx` ON `exercise_variation_attributes` (`exercise_variation_id`);--> statement-breakpoint
CREATE INDEX `exercise_variation_attributes_variation_key_id_idx` ON `exercise_variation_attributes` (`variation_key_id`);--> statement-breakpoint
CREATE INDEX `exercise_variation_attributes_variation_value_id_idx` ON `exercise_variation_attributes` (`variation_value_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `exercise_variation_attributes_variation_id_order_index_unique` ON `exercise_variation_attributes` (`exercise_variation_id`,`order_index`);--> statement-breakpoint
CREATE UNIQUE INDEX `exercise_variation_attributes_variation_id_key_id_unique` ON `exercise_variation_attributes` (`exercise_variation_id`,`variation_key_id`);--> statement-breakpoint
CREATE TABLE `exercise_variation_keys` (
	`id` text PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))) NOT NULL,
	`slug` text NOT NULL,
	`display_name` text NOT NULL,
	`is_system` integer DEFAULT 0 NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	CONSTRAINT "exercise_variation_keys_slug_non_empty" CHECK("exercise_variation_keys"."slug" <> ''),
	CONSTRAINT "exercise_variation_keys_display_name_non_empty" CHECK("exercise_variation_keys"."display_name" <> ''),
	CONSTRAINT "exercise_variation_keys_is_system_boolean_guard" CHECK("exercise_variation_keys"."is_system" in (0, 1))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `exercise_variation_keys_slug_unique` ON `exercise_variation_keys` (`slug`);--> statement-breakpoint
CREATE TABLE `exercise_variation_values` (
	`id` text PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))) NOT NULL,
	`variation_key_id` text NOT NULL,
	`slug` text NOT NULL,
	`display_name` text NOT NULL,
	`is_system` integer DEFAULT 0 NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`variation_key_id`) REFERENCES `exercise_variation_keys`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "exercise_variation_values_slug_non_empty" CHECK("exercise_variation_values"."slug" <> ''),
	CONSTRAINT "exercise_variation_values_display_name_non_empty" CHECK("exercise_variation_values"."display_name" <> ''),
	CONSTRAINT "exercise_variation_values_is_system_boolean_guard" CHECK("exercise_variation_values"."is_system" in (0, 1))
);
--> statement-breakpoint
CREATE INDEX `exercise_variation_values_variation_key_id_idx` ON `exercise_variation_values` (`variation_key_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `exercise_variation_values_key_id_slug_unique` ON `exercise_variation_values` (`variation_key_id`,`slug`);--> statement-breakpoint
CREATE UNIQUE INDEX `exercise_variation_values_key_id_id_unique` ON `exercise_variation_values` (`variation_key_id`,`id`);--> statement-breakpoint
CREATE TABLE `exercise_variations` (
	`id` text PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))) NOT NULL,
	`exercise_definition_id` text NOT NULL,
	`label` text NOT NULL,
	`descriptor` text NOT NULL,
	`deleted_at` integer,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`exercise_definition_id`) REFERENCES `exercise_definitions`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "exercise_variations_label_non_empty" CHECK("exercise_variations"."label" <> ''),
	CONSTRAINT "exercise_variations_descriptor_non_empty" CHECK("exercise_variations"."descriptor" <> '')
);
--> statement-breakpoint
CREATE INDEX `exercise_variations_exercise_definition_id_idx` ON `exercise_variations` (`exercise_definition_id`);--> statement-breakpoint
CREATE INDEX `exercise_variations_deleted_at_idx` ON `exercise_variations` (`deleted_at`);--> statement-breakpoint
CREATE UNIQUE INDEX `exercise_variations_exercise_id_descriptor_unique` ON `exercise_variations` (`exercise_definition_id`,`descriptor`);--> statement-breakpoint
ALTER TABLE `session_exercises` ADD `exercise_definition_id` text REFERENCES exercise_definitions(id);--> statement-breakpoint
ALTER TABLE `session_exercises` ADD `exercise_variation_id` text REFERENCES exercise_variations(id);--> statement-breakpoint
CREATE INDEX `session_exercises_exercise_definition_id_idx` ON `session_exercises` (`exercise_definition_id`);--> statement-breakpoint
CREATE INDEX `session_exercises_exercise_variation_id_idx` ON `session_exercises` (`exercise_variation_id`);