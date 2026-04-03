import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const appSettings = sqliteTable("app_settings", {
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  description: text("description"),
  key: text("key").primaryKey(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
  value: text("value").notNull(),
});
