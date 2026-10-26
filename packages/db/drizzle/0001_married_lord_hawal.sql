-- Catalog slice (hot-voyage-02-catalog): tours + hot_offers + tour_images + inquiries.
-- Local: `bun run db:migrate:local` (wrangler d1 migrations apply --local).
-- Remote (manual, step 04): `wrangler d1 migrations apply hot-voyage-prod --remote --config apps/web/wrangler.jsonc`.
-- Never auto-seed prod. Additive only; 0000 probe table untouched.
CREATE TABLE `hot_offers` (
	`id` text PRIMARY KEY NOT NULL,
	`tour_id` text NOT NULL,
	`discount_pct` integer NOT NULL,
	`starts_at` integer NOT NULL,
	`ends_at` integer NOT NULL,
	`seats_total` integer NOT NULL,
	`seats_left` integer NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`tour_id`) REFERENCES `tours`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `hot_offers_tour_unique` ON `hot_offers` (`tour_id`);--> statement-breakpoint
CREATE INDEX `hot_offers_ends_at_idx` ON `hot_offers` (`ends_at`);--> statement-breakpoint
CREATE TABLE `inquiries` (
	`id` text PRIMARY KEY NOT NULL,
	`tour_id` text NOT NULL,
	`name` text NOT NULL,
	`contact` text NOT NULL,
	`party_size` integer NOT NULL,
	`message` text DEFAULT '' NOT NULL,
	`honeypot` text DEFAULT '' NOT NULL,
	`status` text DEFAULT 'new' NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`tour_id`) REFERENCES `tours`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `inquiries_tour_idx` ON `inquiries` (`tour_id`);--> statement-breakpoint
CREATE TABLE `tour_images` (
	`id` text PRIMARY KEY NOT NULL,
	`tour_id` text NOT NULL,
	`r2_key` text NOT NULL,
	`width` integer NOT NULL,
	`alt` text DEFAULT '' NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`tour_id`) REFERENCES `tours`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `tour_images_tour_idx` ON `tour_images` (`tour_id`);--> statement-breakpoint
CREATE TABLE `tours` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`title` text NOT NULL,
	`destination` text NOT NULL,
	`duration_days` integer NOT NULL,
	`base_price_cents` integer NOT NULL,
	`currency` text DEFAULT 'USD' NOT NULL,
	`featured` integer DEFAULT 0 NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`published_at` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `tours_slug_unique` ON `tours` (`slug`);--> statement-breakpoint
CREATE INDEX `tours_status_featured_idx` ON `tours` (`status`,`featured`);--> statement-breakpoint
CREATE INDEX `tours_destination_idx` ON `tours` (`destination`);