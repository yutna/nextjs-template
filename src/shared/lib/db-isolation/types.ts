export interface DbTestIsolation {
  begin?(): Promise<void>;
  prepare?(): Promise<void>;
  reset(): Promise<void>;
  rollback?(): Promise<void>;
}

export type DbTestIsolationStrategy = "noop" | "sqlite-file-reset";

export interface DbTestIsolationEnvOverrides {
  databaseUrl?: string;
  databaseUrlTest?: string;
  strategy?: DbTestIsolationStrategy;
}
