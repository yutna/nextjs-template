import path from "node:path";
import { describe, expect, it } from "vitest";

import { LOG_DIR, LOG_FILE } from "./constants";

describe("error-reporter constants", () => {
  it("LOG_DIR points to src/tmp/logs relative to cwd", () => {
    expect(LOG_DIR).toBe(path.join(process.cwd(), "src", "tmp", "logs"));
  });

  it("LOG_FILE is error.log inside LOG_DIR", () => {
    expect(LOG_FILE).toBe(path.join(LOG_DIR, "error.log"));
  });
});
