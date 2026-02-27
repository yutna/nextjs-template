import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { FetchError } from "@/shared/lib/errors/http/fetch-error";

import { swrFetcher } from "./swr-fetcher";

// Mock env so tests don't need a real .env file
vi.mock("@/shared/config/env", () => ({
  env: { NEXT_PUBLIC_API_URL: "https://api.example.com" },
}));

// Mock logger to silence output and prevent pino from loading
vi.mock("server-only", () => ({}));
vi.mock("@/shared/lib/logger", () => ({
  logger: { child: vi.fn(() => ({ debug: vi.fn(), warn: vi.fn() })) },
}));

describe("swrFetcher", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("delegates to fetchClient and returns the result", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ id: 1, name: "Alice" }), { status: 200 }),
    );

    const result = await swrFetcher<{ id: number; name: string }>("/users/1");
    expect(result).toEqual({ id: 1, name: "Alice" });
  });

  it("passes the path to fetch with the correct base URL", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify([]), { status: 200 }),
    );

    await swrFetcher("/users");

    expect(fetch).toHaveBeenCalledWith(
      "https://api.example.com/users",
      expect.any(Object),
    );
  });

  it("propagates FetchError on failure", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(null, { status: 500, statusText: "Internal Server Error" }),
    );

    await expect(swrFetcher("/failing")).rejects.toBeInstanceOf(FetchError);
  });
});
