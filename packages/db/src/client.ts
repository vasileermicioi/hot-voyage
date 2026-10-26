import { Database as BunDatabase } from "bun:sqlite";
import type { D1Database } from "@cloudflare/workers-types";
import {
  type BunSQLiteDatabase,
  drizzle as drizzleBunSqlite,
} from "drizzle-orm/bun-sqlite";
import { type DrizzleD1Database, drizzle as drizzleD1 } from "drizzle-orm/d1";
import * as schema from "./schema";

export type RemoteDatabase = DrizzleD1Database<typeof schema>;
export type LocalDatabase = BunSQLiteDatabase<typeof schema>;
export type Database = RemoteDatabase | LocalDatabase;

/** Create a Drizzle client from the Workers D1 binding (`env.DB`). */
export function createD1Client(binding: D1Database): RemoteDatabase {
  return drizzleD1(binding, { schema });
}

/**
 * Local fallback for `bun run dev` / `bun test`: same schema over
 * `bun:sqlite`, no native addons, no cloud credentials.
 */
export function createLocalClient(path = ":memory:"): LocalDatabase {
  const sqlite = new BunDatabase(path, { create: true });
  return drizzleBunSqlite(sqlite, { schema });
}
