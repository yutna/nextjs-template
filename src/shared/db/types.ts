export type DatabaseEnvironment = "development" | "production" | "test";

export interface ResolveDatabaseUrlOptions {
  databaseUrl?: string;
  databaseUrlProduction?: string;
  databaseUrlTest?: string;
  nodeEnv: DatabaseEnvironment;
}
