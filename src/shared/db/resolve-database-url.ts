import type { ResolveDatabaseUrlOptions } from "./types";

const DEFAULT_DATABASE_URLS = {
  development: "file:src/shared/db/local/development.sqlite",
  production: "file:src/shared/db/local/production.sqlite",
  test: "file:src/shared/db/local/test.sqlite",
} as const;

export function resolveDatabaseUrl(options: ResolveDatabaseUrlOptions): string {
  if (options.nodeEnv === "test") {
    return (
      options.databaseUrlTest ??
      options.databaseUrl ??
      DEFAULT_DATABASE_URLS.test
    );
  }

  if (options.nodeEnv === "production") {
    return (
      options.databaseUrlProduction ??
      options.databaseUrl ??
      DEFAULT_DATABASE_URLS.production
    );
  }

  return options.databaseUrl ?? DEFAULT_DATABASE_URLS.development;
}
