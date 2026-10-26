import {
  index,
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

/**
 * Placeholder probe table for the foundation slice.
 *
 * Lets the Drizzle migration journal, D1 client, and local bootstrap prove
 * end-to-end (generate -> migrate:local -> SELECT 1) without locking in any
 * domain shape. Kept so the 01 baseline migration stays valid.
 */
export const schemaProbe = sqliteTable("schema_probe", {
  id: integer("id").primaryKey(),
  note: text("note").notNull(),
});

/** Published tour. Prices in integer cents; timestamps as unix-ms integers. */
export const tours = sqliteTable(
  "tours",
  {
    id: text("id").primaryKey(),
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    destination: text("destination").notNull(),
    durationDays: integer("duration_days").notNull(),
    basePriceCents: integer("base_price_cents").notNull(),
    currency: text("currency").notNull().default("USD"),
    featured: integer("featured").notNull().default(0),
    status: text("status").notNull().default("draft"),
    summary: text("summary").notNull().default(""),
    itineraryJson: text("itinerary_json").notNull().default("[]"),
    includesJson: text("includes_json").notNull().default("[]"),
    excludesJson: text("excludes_json").notNull().default("[]"),
    publishedAt: integer("published_at"),
    createdAt: integer("created_at").notNull(),
    updatedAt: integer("updated_at").notNull(),
  },
  (t) => [
    uniqueIndex("tours_slug_unique").on(t.slug),
    index("tours_status_featured_idx").on(t.status, t.featured),
    index("tours_destination_idx").on(t.destination),
  ],
);

/** Time-boxed hot window for a tour. One row per tour at most. */
export const hotOffers = sqliteTable(
  "hot_offers",
  {
    id: text("id").primaryKey(),
    tourId: text("tour_id")
      .notNull()
      .references(() => tours.id, { onDelete: "cascade" }),
    discountPct: integer("discount_pct").notNull(),
    startsAt: integer("starts_at").notNull(),
    endsAt: integer("ends_at").notNull(),
    seatsTotal: integer("seats_total").notNull(),
    seatsLeft: integer("seats_left").notNull(),
    createdAt: integer("created_at").notNull(),
  },
  (t) => [
    uniqueIndex("hot_offers_tour_unique").on(t.tourId),
    index("hot_offers_ends_at_idx").on(t.endsAt),
  ],
);

/** Gallery image referencing an R2 object key. */
export const tourImages = sqliteTable(
  "tour_images",
  {
    id: text("id").primaryKey(),
    tourId: text("tour_id")
      .notNull()
      .references(() => tours.id, { onDelete: "cascade" }),
    r2Key: text("r2_key").notNull(),
    width: integer("width").notNull(),
    alt: text("alt").notNull().default(""),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (t) => [index("tour_images_tour_idx").on(t.tourId)],
);

/** Payment-free inquiry submitted from a tour detail page. */
export const inquiries = sqliteTable(
  "inquiries",
  {
    id: text("id").primaryKey(),
    tourId: text("tour_id")
      .notNull()
      .references(() => tours.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    contact: text("contact").notNull(),
    partySize: integer("party_size").notNull(),
    message: text("message").notNull().default(""),
    honeypot: text("honeypot").notNull().default(""),
    status: text("status").notNull().default("new"),
    createdAt: integer("created_at").notNull(),
  },
  (t) => [index("inquiries_tour_idx").on(t.tourId)],
);

export type Tour = typeof tours.$inferSelect;
export type NewTour = typeof tours.$inferInsert;
export type HotOffer = typeof hotOffers.$inferSelect;
export type NewHotOffer = typeof hotOffers.$inferInsert;
export type TourImage = typeof tourImages.$inferSelect;
export type NewTourImage = typeof tourImages.$inferInsert;
export type Inquiry = typeof inquiries.$inferSelect;
export type NewInquiry = typeof inquiries.$inferInsert;
