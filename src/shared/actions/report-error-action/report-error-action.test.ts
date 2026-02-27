import { beforeEach, describe, expect, it, vi } from "vitest";

const mockReportError = vi.hoisted(() => vi.fn());

vi.mock("server-only", () => ({}));
vi.mock("@/shared/lib/error-reporter", () => ({
  reportError: mockReportError,
}));

import { reportErrorAction } from "./report-error-action";

describe("reportErrorAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls reportError with an Error constructed from the serialized message", async () => {
    await reportErrorAction({ message: "something broke" });

    expect(mockReportError).toHaveBeenCalledOnce();
    const [err] = mockReportError.mock.calls[0] as [Error, unknown];
    expect(err).toBeInstanceOf(Error);
    expect(err.message).toBe("something broke");
  });

  it("passes boundary and meta from input", async () => {
    await reportErrorAction({
      message: "oops",
      boundary: "app",
      meta: { userId: 42 },
    });

    expect(mockReportError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({ boundary: "app", meta: { userId: 42 } }),
    );
  });

  it("passes digest from input", async () => {
    await reportErrorAction({ message: "err", digest: "abc-123" });

    expect(mockReportError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({ digest: "abc-123" }),
    );
  });

  it("works with only message provided", async () => {
    await reportErrorAction({ message: "bare error" });

    expect(mockReportError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({ digest: undefined, boundary: undefined }),
    );
  });

  it("returns a validation error for missing message", async () => {
    // @ts-expect-error intentionally invalid input
    const result = await reportErrorAction({});

    expect(result?.validationErrors).toBeDefined();
    expect(mockReportError).not.toHaveBeenCalled();
  });
});
