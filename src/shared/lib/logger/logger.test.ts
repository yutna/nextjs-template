import { describe, expect, it } from "vitest";
import { logger } from "./logger";

describe("logger", () => {
  it("is a valid pino logger instance", () => {
    expect(typeof logger.info).toBe("function");
    expect(typeof logger.error).toBe("function");
    expect(typeof logger.warn).toBe("function");
    expect(typeof logger.debug).toBe("function");
  });

  it("uses debug level in non-production environment", () => {
    // Vitest sets NODE_ENV=test which is not "production"
    expect(logger.level).toBe("debug");
  });
});
