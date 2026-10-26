import { Database as BunDatabase } from "bun:sqlite";
import {
  type BunSQLiteDatabase,
  drizzle as drizzleBunSqlite,
} from "drizzle-orm/bun-sqlite";
import * as schema from "./schema";

export type LocalDatabase = BunSQLiteDatabase<typeof schema>;

/**
 * Local fallback for `bun run dev` scripts / `bun test`: same schema over
 * `bun:sqlite`, no native addons, no cloud credentials.
 *
 * Bun-only — never import from Workers code (see `./client`).
 */
export function createLocalClient(path = ":memory:"): LocalDatabase {
  const sqlite = new BunDatabase(path, { create: true });
  return drizzleBunSqlite(sqlite, { schema });
}
