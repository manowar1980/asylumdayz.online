CREATE TABLE `battlepass_config` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`season_name` text DEFAULT 'Genesis' NOT NULL,
	`days_left` integer DEFAULT 25 NOT NULL,
	`theme_color` text DEFAULT 'tech-blue' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `battlepass_levels` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`level` integer NOT NULL,
	`free_reward` text NOT NULL,
	`premium_reward` text NOT NULL,
	`image_url` text,
	`free_image_url` text,
	`premium_image_url` text
);
--> statement-breakpoint
CREATE TABLE `servers` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`map` text NOT NULL,
	`description` text NOT NULL,
	`multiplier` text NOT NULL,
	`features` text,
	`connection_info` text
);
--> statement-breakpoint
CREATE TABLE `support_requests` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text,
	`email` text,
	`discord_username` text,
	`category` text NOT NULL,
	`subject` text NOT NULL,
	`message` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `user_challenge_progress` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`discord_id` text NOT NULL,
	`challenge_id` integer NOT NULL,
	`progress` integer DEFAULT 0 NOT NULL,
	`claimed` integer DEFAULT false NOT NULL,
	`week_start` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `weekly_challenges` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`xp_reward` integer DEFAULT 100 NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`target_count` integer DEFAULT 1 NOT NULL,
	`challenge_type` text DEFAULT 'manual' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`sid` text PRIMARY KEY NOT NULL,
	`sess` text NOT NULL,
	`expire` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `IDX_session_expire` ON `sessions` (`expire`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text,
	`first_name` text,
	`last_name` text,
	`profile_image_url` text,
	`discord_id` text,
	`discord_username` text,
	`is_admin` integer DEFAULT false,
	`created_at` integer,
	`updated_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_discord_id_unique` ON `users` (`discord_id`);