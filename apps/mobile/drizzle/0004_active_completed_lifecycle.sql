PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_sessions` (
	`id` text PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))) NOT NULL,
	`gym_id` text,
	`status` text DEFAULT 'active' NOT NULL,
	`started_at` integer NOT NULL,
	`completed_at` integer,
	`duration_sec` integer,
	`deleted_at` integer,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`gym_id`) REFERENCES `gyms`(`id`) ON UPDATE no action ON DELETE set null,
	CONSTRAINT "sessions_status_guard" CHECK("status" in ('active', 'completed')),
	CONSTRAINT "sessions_duration_non_negative" CHECK("duration_sec" is null or "duration_sec" >= 0)
);
--> statement-breakpoint
INSERT INTO `__new_sessions` (`id`, `gym_id`, `status`, `started_at`, `completed_at`, `duration_sec`, `deleted_at`, `created_at`, `updated_at`)
SELECT
	`id`,
	`gym_id`,
	CASE
		WHEN `status` = 'completed' THEN 'completed'
		ELSE 'active'
	END,
	`started_at`,
	`completed_at`,
	`duration_sec`,
	`deleted_at`,
	`created_at`,
	`updated_at`
FROM `sessions`;--> statement-breakpoint
DROP TABLE `sessions`;--> statement-breakpoint
ALTER TABLE `__new_sessions` RENAME TO `sessions`;--> statement-breakpoint
CREATE INDEX `sessions_status_idx` ON `sessions` (`status`);--> statement-breakpoint
CREATE INDEX `sessions_completed_at_idx` ON `sessions` (`completed_at`);--> statement-breakpoint
CREATE INDEX `sessions_deleted_at_idx` ON `sessions` (`deleted_at`);--> statement-breakpoint
PRAGMA foreign_keys=ON;
