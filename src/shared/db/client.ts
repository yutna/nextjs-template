import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";

import { resolveDatabaseUrl } from "./resolve-database-url";
import * as schema from "./schema";

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

export const databaseClient = createClient({ url: databaseUrl });

export const db = drizzle(databaseClient, { schema });
