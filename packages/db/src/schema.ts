import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

/**
 * Placeholder probe table for the foundation slice.
 *
 * Lets the Drizzle migration journal, D1 client, and local bootstrap prove
 * end-to-end (generate -> migrate:local -> SELECT 1) without locking in any
 * domain shape. Tours/offers tables belong to step 02
 * (`hot-voyage-02-catalog`).
 */
export const schemaProbe = sqliteTable("schema_probe", {
  id: integer("id").primaryKey(),
  note: text("note").notNull(),
});
