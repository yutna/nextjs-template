import { beforeEach, describe, expect, it, vi } from "vitest";

const mockLoggerError = vi.hoisted(() => vi.fn());

vi.mock("server-only", () => ({}));
vi.mock("./create-file-logger", () => ({
  createFileLogger: () => ({ error: mockLoggerError }),
}));

import { reportError } from "./error-reporter";

describe("reportError", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls errorLogger.error with message and context fields", () => {
    const err = new Error("boom");

    reportError(err, {
      boundary: "app",
      digest: "abc123",
      meta: { userId: 1 },
    });

    expect(mockLoggerError).toHaveBeenCalledWith(
      expect.objectContaining({
        boundary: "app",
        digest: "abc123",
        meta: { userId: 1 },
        stack: expect.stringContaining("boom"),
      }),
      "boom",
    );
  });

  it("coerces a non-Error value into an Error", () => {
    reportError("plain string error");

    expect(mockLoggerError).toHaveBeenCalledWith(
      expect.objectContaining({ stack: expect.any(String) }),
      "plain string error",
    );
  });

  it("uses empty context when no context is provided", () => {
    reportError(new Error("no context"));

    expect(mockLoggerError).toHaveBeenCalledWith(
      expect.objectContaining({
        boundary: undefined,
        digest: undefined,
        meta: undefined,
      }),
      "no context",
    );
  });

  it("passes digest from context", () => {
    reportError(new Error("server error"), {
      boundary: "route-handler",
      digest: "xyz789",
    });

    expect(mockLoggerError).toHaveBeenCalledWith(
      expect.objectContaining({ boundary: "route-handler", digest: "xyz789" }),
      "server error",
    );
  });
});
