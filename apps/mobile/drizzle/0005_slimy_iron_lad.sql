ALTER TABLE `exercise_definitions` ADD `deleted_at` integer;--> statement-breakpoint
CREATE INDEX `exercise_definitions_deleted_at_idx` ON `exercise_definitions` (`deleted_at`);