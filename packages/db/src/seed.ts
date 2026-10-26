import { Database as BunDatabase } from "bun:sqlite";
import { readdirSync } from "node:fs";
import { join } from "node:path";
import { drizzle as drizzleBunSqlite } from "drizzle-orm/bun-sqlite";
import * as schema from "./schema";
import { hotOffers, inquiries, tourImages, tours } from "./schema";

export type SeedDatabase = ReturnType<typeof drizzleBunSqlite<typeof schema>>;

const DAY = 86_400_000;
const WIDTHS = [480, 800, 1200];

interface SeedTour {
  slug: string;
  title: string;
  destination: string;
  durationDays: number;
  basePriceCents: number;
  currency: string;
  featured: number;
  status: string;
  summary: string;
  itinerary: string[];
  includes: string[];
  excludes: string[];
  offer?: {
    discountPct: number;
    startsInDays: number;
    endsInDays: number;
    seatsTotal: number;
    seatsLeft: number;
  };
}

/**
 * Placeholder-licensed seed content. Titles, itineraries, and prices are
 * synthetic for local dev and tests — safe to ship as fixtures.
 */
export const SEED_TOURS: SeedTour[] = [
  {
    slug: "santorini-sunset",
    title: "Santorini Sunset Escape",
    destination: "Santorini",
    durationDays: 5,
    basePriceCents: 129900,
    currency: "USD",
    featured: 1,
    status: "published",
    summary: "Whitewashed villages, caldera sunsets, and volcanic beaches.",
    itinerary: [
      "Arrive in Fira, caldera walk",
      "Oia sunset + catamaran",
      "Red Beach + Akrotiri",
      "Wine tasting in Pyrgos",
      "Depart",
    ],
    includes: ["4 nights hotel", "Daily breakfast", "Catamaran cruise"],
    excludes: ["Flights", "Travel insurance"],
    offer: {
      discountPct: 25,
      startsInDays: -1,
      endsInDays: 2,
      seatsTotal: 20,
      seatsLeft: 4,
    },
  },
  {
    slug: "bali-escape",
    title: "Bali Jungle & Beach Escape",
    destination: "Bali",
    durationDays: 7,
    basePriceCents: 99900,
    currency: "USD",
    featured: 1,
    status: "published",
    summary: "Temples, rice terraces, and surf beaches in one week.",
    itinerary: [
      "Ubud temples",
      "Rice terrace trek",
      "Volcano sunrise",
      "Uluwatu + beach",
      "Nusa Penida day trip",
      "Spa + free day",
      "Depart",
    ],
    includes: ["6 nights hotel", "Airport transfers", "Guided treks"],
    excludes: ["Flights", "Lunches"],
    offer: {
      discountPct: 30,
      startsInDays: -2,
      endsInDays: 5,
      seatsTotal: 24,
      seatsLeft: 8,
    },
  },
  {
    slug: "amalfi-drive",
    title: "Amalfi Coast Drive",
    destination: "Amalfi",
    durationDays: 4,
    basePriceCents: 149900,
    currency: "USD",
    featured: 1,
    status: "published",
    summary: "Lemon groves, cliff roads, and seaside trattorias.",
    itinerary: [
      "Naples → Positano",
      "Ravello + Villa Cimbrone",
      "Capri boat day",
      "Depart",
    ],
    includes: ["3 nights hotel", "Rental car", "Boat tour"],
    excludes: ["Flights", "Fuel"],
    offer: {
      discountPct: 20,
      startsInDays: -1,
      endsInDays: 1,
      seatsTotal: 16,
      seatsLeft: 2,
    },
  },
  {
    slug: "kyoto-blossom",
    title: "Kyoto Blossom Week",
    destination: "Kyoto",
    durationDays: 6,
    basePriceCents: 179900,
    currency: "USD",
    featured: 0,
    status: "published",
    summary: "Temples, tea houses, and cherry blossoms.",
    itinerary: [
      "Fushimi Inari",
      "Arashiyama bamboo",
      "Tea ceremony",
      "Nara day trip",
      "Philosopher's Path",
      "Depart",
    ],
    includes: ["5 nights ryokan", "Rail pass", "Tea ceremony"],
    excludes: ["Flights", "Some meals"],
    offer: {
      discountPct: 15,
      startsInDays: -1,
      endsInDays: 3,
      seatsTotal: 20,
      seatsLeft: 10,
    },
  },
  {
    slug: "marrakech-souk",
    title: "Marrakech Souk Adventure",
    destination: "Marrakech",
    durationDays: 5,
    basePriceCents: 89900,
    currency: "USD",
    featured: 0,
    status: "published",
    summary: "Medinas, Atlas views, and desert-night option.",
    itinerary: [
      "Medina tour",
      "Jardin Majorelle",
      "Atlas foothills",
      "Souk cooking class",
      "Depart",
    ],
    includes: ["4 nights riad", "Guided medina tour", "Cooking class"],
    excludes: ["Flights", "Desert camp upgrade"],
  },
  {
    slug: "iceland-aurora",
    title: "Iceland Aurora Hunt",
    destination: "Reykjavik",
    durationDays: 4,
    basePriceCents: 159900,
    currency: "USD",
    featured: 1,
    status: "published",
    summary: "Waterfalls, black beaches, and northern lights.",
    itinerary: [
      "Golden Circle",
      "South coast waterfalls",
      "Glacier lagoon",
      "Aurora hunt + depart",
    ],
    includes: ["3 nights hotel", "Superjeep tour", "Aurora guide"],
    excludes: ["Flights", "Winter gear rental"],
    offer: {
      discountPct: 35,
      startsInDays: -10,
      endsInDays: -2,
      seatsTotal: 16,
      seatsLeft: 6,
    },
  },
  {
    slug: "patagonia-trek",
    title: "Patagonia Trek Base",
    destination: "Patagonia",
    durationDays: 8,
    basePriceCents: 219900,
    currency: "USD",
    featured: 0,
    status: "published",
    summary: "Granite towers and glacier trails.",
    itinerary: [
      "El Chalten base",
      "Laguna de los Tres",
      "Laguna Torre",
      "Rest + estancia",
      "Glacier trek",
      "Condor lookout",
      "Grey Lake",
      "Depart",
    ],
    includes: ["7 nights lodge", "Trek guides", "Park fees"],
    excludes: ["Flights", "Personal gear"],
    offer: {
      discountPct: 20,
      startsInDays: -1,
      endsInDays: 4,
      seatsTotal: 12,
      seatsLeft: 0,
    },
  },
  {
    slug: "algarve-coast",
    title: "Algarve Coast Week",
    destination: "Algarve",
    durationDays: 6,
    basePriceCents: 109900,
    currency: "USD",
    featured: 0,
    status: "published",
    summary: "Cliffs, caves, and surf towns.",
    itinerary: [
      "Lagos cliffs",
      "Benagil caves",
      "Surf day",
      "Sagres + lighthouse",
      "Market + free day",
      "Depart",
    ],
    includes: ["5 nights hotel", "Kayak tour", "Surf lesson"],
    excludes: ["Flights", "Car rental"],
  },
  {
    slug: "zanzibar-spice",
    title: "Zanzibar Spice Isles",
    destination: "Zanzibar",
    durationDays: 7,
    basePriceCents: 119900,
    currency: "USD",
    featured: 0,
    status: "draft",
    summary: "Spice farms and white-sand dhows (draft preview).",
    itinerary: [
      "Stone Town",
      "Spice farm",
      "Beach days",
      "Dhow sunset",
      "Depart",
    ],
    includes: ["6 nights resort", "Spice tour", "Dhow trip"],
    excludes: ["Flights", "Visa fees"],
  },
  {
    slug: "dubrovnik-walls",
    title: "Dubrovnik Old Walls",
    destination: "Dubrovnik",
    durationDays: 4,
    basePriceCents: 139900,
    currency: "USD",
    featured: 0,
    status: "archived",
    summary: "City walls and island hops (archived).",
    itinerary: ["Walls walk", "Lokrum island", "Kayak + free day", "Depart"],
    includes: ["3 nights hotel", "Walls ticket", "Kayak tour"],
    excludes: ["Flights", "Meals"],
  },
];

function findWranglerLocalSqlite(): string | null {
  const candidates = [
    join(
      import.meta.dir,
      "..",
      "..",
      "..",
      "apps",
      "web",
      ".wrangler",
      "state",
      "v3",
      "d1",
      "miniflare-D1DatabaseObject",
    ),
    join(
      process.cwd(),
      ".wrangler",
      "state",
      "v3",
      "d1",
      "miniflare-D1DatabaseObject",
    ),
    join(
      process.cwd(),
      "..",
      "..",
      "apps",
      "web",
      ".wrangler",
      "state",
      "v3",
      "d1",
      "miniflare-D1DatabaseObject",
    ),
  ];
  for (const dir of candidates) {
    try {
      const files = readdirSync(dir).filter(
        (f) => f.endsWith(".sqlite") && f !== "metadata.sqlite",
      );
      if (files.length > 0) return join(dir, files[0] as string);
    } catch {
      // directory missing — fall through
    }
  }
  return null;
}

/** Idempotent upsert of all seed tours by slug. Returns counts. */
export async function seedDatabase(db: SeedDatabase, now = Date.now()) {
  let tourCount = 0;
  let offerCount = 0;
  for (const t of SEED_TOURS) {
    const nowMs = now;
    const tourId = `seed-${t.slug}`;
    await db
      .insert(tours)
      .values({
        id: tourId,
        slug: t.slug,
        title: t.title,
        destination: t.destination,
        durationDays: t.durationDays,
        basePriceCents: t.basePriceCents,
        currency: t.currency,
        featured: t.featured,
        status: t.status,
        summary: t.summary,
        itineraryJson: JSON.stringify(t.itinerary),
        includesJson: JSON.stringify(t.includes),
        excludesJson: JSON.stringify(t.excludes),
        publishedAt: t.status === "published" ? nowMs : null,
        createdAt: nowMs,
        updatedAt: nowMs,
      })
      .onConflictDoUpdate({
        target: tours.slug,
        set: {
          title: t.title,
          destination: t.destination,
          durationDays: t.durationDays,
          basePriceCents: t.basePriceCents,
          currency: t.currency,
          featured: t.featured,
          status: t.status,
          summary: t.summary,
          itineraryJson: JSON.stringify(t.itinerary),
          includesJson: JSON.stringify(t.includes),
          excludesJson: JSON.stringify(t.excludes),
          updatedAt: nowMs,
        },
      });
    tourCount += 1;

    // Images: one row per width, keyed tours/<slug>/<width>w.webp
    for (let i = 0; i < WIDTHS.length; i += 1) {
      const width = WIDTHS[i] as number;
      const imageId = `seed-${t.slug}-${width}`;
      await db
        .insert(tourImages)
        .values({
          id: imageId,
          tourId,
          r2Key: `tours/${t.slug}/${width}w.webp`,
          width,
          alt: `${t.title} photo`,
          sortOrder: i,
        })
        .onConflictDoNothing();
    }

    if (t.offer) {
      const offerId = `seed-offer-${t.slug}`;
      await db
        .insert(hotOffers)
        .values({
          id: offerId,
          tourId,
          discountPct: t.offer.discountPct,
          startsAt: nowMs + t.offer.startsInDays * DAY,
          endsAt: nowMs + t.offer.endsInDays * DAY,
          seatsTotal: t.offer.seatsTotal,
          seatsLeft: t.offer.seatsLeft,
          createdAt: nowMs,
        })
        .onConflictDoNothing();
      offerCount += 1;
    }
  }
  return { tourCount, offerCount };
}

export { inquiries };

// Run directly: `bun --filter @hot-voyage/db db:seed:local`
if (import.meta.main) {
  const sqlitePath = findWranglerLocalSqlite();
  if (!sqlitePath) {
    console.error(
      "No wrangler local D1 sqlite found. Run `bun run db:migrate:local` first (it creates apps/web/.wrangler/state/v3/d1/...).",
    );
    process.exit(1);
  }
  const sqlite = new BunDatabase(sqlitePath, { create: true });
  const db = drizzleBunSqlite(sqlite, { schema });
  const result = await seedDatabase(db);
  console.log(
    `Seeded ${result.tourCount} tours (${result.offerCount} offers) into ${sqlitePath}`,
  );
  // Re-running is idempotent: same slugs upsert, images/offers do nothing.
}
