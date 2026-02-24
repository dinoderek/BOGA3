ALTER TABLE `sessions` ADD `deleted_at` integer;--> statement-breakpoint
CREATE INDEX `sessions_deleted_at_idx` ON `sessions` (`deleted_at`);