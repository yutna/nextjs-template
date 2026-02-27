import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { fetchClient } from "./fetch-client";
import { FetchError } from "./fetch-error";

// Mock env so tests don't need a real .env file
vi.mock("@/shared/config/env", () => ({
  env: { NEXT_PUBLIC_API_URL: "https://api.example.com" },
}));

// Mock logger to silence output and prevent pino from loading
vi.mock("server-only", () => ({}));
vi.mock("@/shared/lib/logger", () => ({
  logger: { child: vi.fn(() => ({ debug: vi.fn(), warn: vi.fn() })) },
}));

describe("fetchClient", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns parsed JSON on 200", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ id: 1 }), { status: 200 }),
    );

    const result = await fetchClient<{ id: number }>({ path: "/items/1" });
    expect(result).toEqual({ id: 1 });
  });

  it("prepends base URL to relative paths", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({}), { status: 200 }),
    );

    await fetchClient({ path: "/users" });

    expect(fetch).toHaveBeenCalledWith(
      "https://api.example.com/users",
      expect.any(Object),
    );
  });

  it("does not prepend base URL to absolute URLs", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({}), { status: 200 }),
    );

    await fetchClient({ path: "https://other.com/data" });

    expect(fetch).toHaveBeenCalledWith(
      "https://other.com/data",
      expect.any(Object),
    );
  });

  it("throws FetchError on non-ok response", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ code: "NOT_FOUND" }), {
        status: 404,
        statusText: "Not Found",
      }),
    );

    await expect(fetchClient({ path: "/items/99" })).rejects.toBeInstanceOf(
      FetchError,
    );
  });

  it("includes API error code from response body in FetchError", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ code: "ITEM_NOT_FOUND" }), {
        status: 404,
        statusText: "Not Found",
      }),
    );

    try {
      await fetchClient({ path: "/items/99" });
    } catch (err) {
      expect(err).toBeInstanceOf(FetchError);
      expect((err as FetchError).code).toBe("ITEM_NOT_FOUND");
    }
  });

  it("retries on network failure", async () => {
    vi.mocked(fetch)
      .mockRejectedValueOnce(new TypeError("Failed to fetch"))
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ id: 1 }), { status: 200 }),
      );

    const result = await fetchClient<{ id: number }>({
      path: "/items/1",
      retries: 1,
      retryDelay: 0,
    });

    expect(result).toEqual({ id: 1 });
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it("does not retry on 4xx/5xx responses", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(null, { status: 500, statusText: "Internal Server Error" }),
    );

    await expect(
      fetchClient({ path: "/items/1", retries: 3 }),
    ).rejects.toBeInstanceOf(FetchError);

    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("attaches Authorization header when getToken is provided", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({}), { status: 200 }),
    );

    await fetchClient({ path: "/me", getToken: () => "my-token" });

    const callInit = vi.mocked(fetch).mock.calls[0][1] as RequestInit;
    expect((callInit.headers as Headers).get("Authorization")).toBe(
      "Bearer my-token",
    );
  });

  it("skips Authorization header when getToken returns null", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({}), { status: 200 }),
    );

    await fetchClient({ path: "/public", getToken: () => null });

    const callInit = vi.mocked(fetch).mock.calls[0][1] as RequestInit;
    expect((callInit.headers as Headers).get("Authorization")).toBeNull();
  });

  it("returns undefined for 204 No Content", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(null, { status: 204, statusText: "No Content" }),
    );

    const result = await fetchClient<void>({
      path: "/items/1",
      method: "DELETE",
    });
    expect(result).toBeUndefined();
  });

  it("stringifies body as JSON", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ id: 1 }), { status: 201 }),
    );

    await fetchClient({
      path: "/items",
      method: "POST",
      body: { name: "test" },
    });

    const callInit = vi.mocked(fetch).mock.calls[0][1] as RequestInit;
    expect(callInit.body).toBe(JSON.stringify({ name: "test" }));
  });
});
