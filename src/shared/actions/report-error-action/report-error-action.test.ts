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

  it("passes boundary and meta from context", async () => {
    await reportErrorAction(
      { message: "oops" },
      { boundary: "app", meta: { userId: 42 } },
    );

    expect(mockReportError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({ boundary: "app", meta: { userId: 42 } }),
    );
  });

  it("uses digest from serializedError, overriding context.digest", async () => {
    await reportErrorAction(
      { message: "err", digest: "from-error" },
      { digest: "from-context" },
    );

    expect(mockReportError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({ digest: "from-error" }),
    );
  });

  it("falls back to context.digest when serializedError has no digest", async () => {
    await reportErrorAction({ message: "err" }, { digest: "ctx-digest" });

    expect(mockReportError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({ digest: "ctx-digest" }),
    );
  });

  it("works with no context argument", async () => {
    await reportErrorAction({ message: "bare error" });

    expect(mockReportError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({ digest: undefined }),
    );
  });
});
