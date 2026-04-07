import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { main } from "./main.ts";

describe("main", () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;
  let consoleLogSpy: ReturnType<typeof vi.spyOn>;
  let originalExitCode: NodeJS.Process["exitCode"];

  beforeEach(() => {
    originalExitCode = process.exitCode;
    process.exitCode = undefined;

    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    consoleLogSpy.mockRestore();

    if (originalExitCode === undefined) {
      process.exitCode = undefined;
      return;
    }

    process.exitCode = originalExitCode;
  });

  it("rejects unsafe path-like command names as unknown commands", async () => {
    await main(["../command-module"]);

    expect(consoleLogSpy).not.toHaveBeenCalled();
    expect(consoleErrorSpy.mock.calls).toEqual([
      ['  Unknown command: ../command-module\n'],
      ['  Run ./bin/vibe --help to see available commands.\n'],
    ]);
    expect(process.exitCode).toBe(1);
  });
});
