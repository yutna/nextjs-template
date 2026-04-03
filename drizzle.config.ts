import { resolveDatabaseUrl } from "./src/shared/db/resolve-database-url";

import type { Config } from "drizzle-kit";

const nodeEnv =
  process.env.NODE_ENV === "production"
    ? "production"
    : process.env.NODE_ENV === "test"
      ? "test"
      : "development";

const databaseUrl = resolveDatabaseUrl({
  databaseUrl: process.env.DATABASE_URL,
  databaseUrlProduction: process.env.DATABASE_URL_PRODUCTION,
  databaseUrlTest: process.env.DATABASE_URL_TEST,
  nodeEnv,
});

export default {
  dbCredentials: {
    url: databaseUrl,
  },
  dialect: "sqlite",
  out: "./src/shared/db/migrations",
  schema: "./src/shared/db/schema.ts",
  strict: true,
} satisfies Config;
