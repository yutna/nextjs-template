import { mkdir, rm } from "node:fs/promises";
import { dirname } from "node:path";

import type { DbTestIsolation } from "./types";
import type { DbTestIsolationEnvOverrides } from "./types";
import type { DbTestIsolationStrategy } from "./types";

let dbTestIsolationOverrides: DbTestIsolationEnvOverrides | null = null;

async function beginIsolation(): Promise<void> {
  await Promise.resolve();
}

function createDbTestIsolation(): DbTestIsolation {
  return {
    begin: beginIsolation,
    prepare: prepareIsolation,
    reset: resetIsolation,
    rollback: rollbackIsolation,
  };
}

async function prepareIsolation(): Promise<void> {
  await resetIsolation();
}

async function resetIsolation(): Promise<void> {
  const strategy = resolveIsolationStrategy();
  if (strategy === "noop") {
    await Promise.resolve();
    return;
  }

  const filePath = resolveSqliteFilePath();
  if (!filePath) {
    await Promise.resolve();
    return;
  }

  await mkdir(dirname(filePath), { recursive: true });
  await Promise.all([
    rm(filePath, { force: true }),
    rm(`${filePath}-shm`, { force: true }),
    rm(`${filePath}-wal`, { force: true }),
  ]);
}

async function rollbackIsolation(): Promise<void> {
  await Promise.resolve();
}

function resolveIsolationStrategy(): DbTestIsolationStrategy {
  const strategy =
    dbTestIsolationOverrides?.strategy ??
    process.env.DB_TEST_ISOLATION_STRATEGY;

  return strategy === "sqlite-file-reset" ? "sqlite-file-reset" : "noop";
}

function resolveSqliteFilePath(): null | string {
  const databaseUrl =
    dbTestIsolationOverrides?.databaseUrlTest ??
    process.env.DATABASE_URL_TEST ??
    dbTestIsolationOverrides?.databaseUrl ??
    process.env.DATABASE_URL ??
    "file:src/shared/db/local/test.sqlite";

  if (!databaseUrl.startsWith("file:")) {
    return null;
  }

  return databaseUrl.slice("file:".length);
}

export function setDbTestIsolationEnvOverridesForTest(
  overrides: DbTestIsolationEnvOverrides | null,
): void {
  dbTestIsolationOverrides = overrides;
}

export const dbIsolation = createDbTestIsolation();
