CREATE TABLE `app_settings` (
	`created_at` integer NOT NULL,
	`description` text,
	`key` text PRIMARY KEY NOT NULL,
	`updated_at` integer NOT NULL,
	`value` text NOT NULL
);
