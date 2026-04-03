import { readFile, rm } from "node:fs/promises";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";

import {
  dbIsolation,
  setDbTestIsolationEnvOverridesForTest,
} from "./db-isolation";

afterEach(() => {
  setDbTestIsolationEnvOverridesForTest(null);
});

describe("dbIsolation", () => {
  it("does not touch file when strategy is noop", async () => {
    const testDbPath = join(process.cwd(), "tmp", "db-isolation-noop.sqlite");

    setDbTestIsolationEnvOverridesForTest({
      databaseUrlTest: `file:${testDbPath}`,
      strategy: "noop",
    });

    await dbIsolation.reset();

    await expect(readFile(testDbPath)).rejects.toBeDefined();
  });

  it("provides reset helper", async () => {
    await expect(dbIsolation.reset()).resolves.toBeUndefined();
  });

  it("provides prepare helper", async () => {
    await expect(dbIsolation.prepare?.()).resolves.toBeUndefined();
  });

  it("supports optional transaction hooks", async () => {
    await expect(dbIsolation.begin?.()).resolves.toBeUndefined();
    await expect(dbIsolation.rollback?.()).resolves.toBeUndefined();
  });

  it("removes sqlite file when strategy is sqlite-file-reset", async () => {
    const testDbPath = join(process.cwd(), "tmp", "db-isolation-reset.sqlite");

    setDbTestIsolationEnvOverridesForTest({
      databaseUrlTest: `file:${testDbPath}`,
      strategy: "sqlite-file-reset",
    });

    await rm(testDbPath, { force: true });
    await rm(`${testDbPath}-shm`, { force: true });
    await rm(`${testDbPath}-wal`, { force: true });

    await dbIsolation.reset();

    await expect(readFile(testDbPath)).rejects.toBeDefined();
  });
});
