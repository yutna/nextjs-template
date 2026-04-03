import { describe, expect, it } from "vitest";

import { resolveDatabaseUrl } from "./resolve-database-url";

describe("resolveDatabaseUrl", () => {
  it("uses development default when no env url is provided", () => {
    expect(
      resolveDatabaseUrl({
        nodeEnv: "development",
      }),
    ).toBe("file:src/shared/db/local/development.sqlite");
  });

  it("uses test database url for test environment", () => {
    expect(
      resolveDatabaseUrl({
        databaseUrl: "file:src/shared/db/local/development.sqlite",
        databaseUrlTest: "file:src/shared/db/local/test.sqlite",
        nodeEnv: "test",
      }),
    ).toBe("file:src/shared/db/local/test.sqlite");
  });

  it("uses production database url when provided", () => {
    expect(
      resolveDatabaseUrl({
        databaseUrl: "file:src/shared/db/local/development.sqlite",
        databaseUrlProduction: "libsql://example.turso.io",
        nodeEnv: "production",
      }),
    ).toBe("libsql://example.turso.io");
  });
});
