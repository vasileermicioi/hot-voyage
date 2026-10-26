-- Catalog detail fields for tour pages (summary, itinerary/includes/excludes as JSON).
-- Local: `bun run db:migrate:local`. Remote: manual apply in step 04, never auto-seed prod.
ALTER TABLE `tours` ADD `summary` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `tours` ADD `itinerary_json` text DEFAULT '[]' NOT NULL;--> statement-breakpoint
ALTER TABLE `tours` ADD `includes_json` text DEFAULT '[]' NOT NULL;--> statement-breakpoint
ALTER TABLE `tours` ADD `excludes_json` text DEFAULT '[]' NOT NULL;