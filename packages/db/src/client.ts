import type { D1Database } from "@cloudflare/workers-types";
import { type DrizzleD1Database, drizzle as drizzleD1 } from "drizzle-orm/d1";
import * as schema from "./schema";

export type RemoteDatabase = DrizzleD1Database<typeof schema>;
/** Workers query client. For local Bun scripts/tests see `./local`. */
export type Database = RemoteDatabase;

/** Create a Drizzle client from the Workers D1 binding (`env.DB`). */
export function createD1Client(binding: D1Database): RemoteDatabase {
  return drizzleD1(binding, { schema });
}
