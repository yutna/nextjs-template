import fs from "node:fs";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { LOG_DIR } from "./constants";
import { createFileLogger } from "./create-file-logger";

import type { MockInstance } from "vitest";

const { mockDestination, mockPinoFn } = vi.hoisted(() => {
  const mockLogger = { error: vi.fn(), level: "error" };
  const mockDestination = vi.fn(() => ({}));
  const mockPinoFn = vi.fn(() => mockLogger);
  Object.assign(mockPinoFn, {
    destination: mockDestination,
    stdTimeFunctions: { isoTime: "isoTime" },
  });
  return { mockDestination, mockPinoFn };
});

vi.mock("pino", () => ({ default: mockPinoFn }));

describe("createFileLogger", () => {
  let mkdirSyncSpy: MockInstance;

  beforeEach(() => {
    vi.clearAllMocks();
    mkdirSyncSpy = vi.spyOn(fs, "mkdirSync");
  });

  afterEach(() => {
    mkdirSyncSpy.mockRestore();
  });

  it("creates log directory and returns a pino logger with file destination", () => {
    mkdirSyncSpy.mockReturnValue(undefined);

    const logger = createFileLogger();

    expect(mkdirSyncSpy).toHaveBeenCalledWith(LOG_DIR, { recursive: true });
    expect(mockDestination).toHaveBeenCalled();
    expect(mockPinoFn).toHaveBeenCalledWith(
      expect.objectContaining({
        base: { service: "nextjs-app" },
        level: "error",
      }),
      expect.anything(),
    );
    expect(logger).toBeDefined();
  });

  it("falls back to a console pino logger when mkdirSync throws", () => {
    mkdirSyncSpy.mockImplementation(() => {
      throw new Error("read-only filesystem");
    });

    const logger = createFileLogger();

    expect(mockPinoFn).toHaveBeenCalledWith({ level: "error" });
    expect(mockDestination).not.toHaveBeenCalled();
    expect(logger).toBeDefined();
  });
});
