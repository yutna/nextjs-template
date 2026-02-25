# API Layer Setup (Native Fetch)

Production-ready HTTP client built on top of native `fetch` — no external HTTP library required.

## Current State

`src/shared/api/` contains only a `.gitkeep` placeholder. There is no:

- Typed fetch wrapper
- API error class
- Base URL configuration
- Auth token injection
- Retry logic
- Server-side request logging
- SWR-compatible fetcher

`swr` 2.x is already installed but never used in source files.

## Goals

| Goal | Approach |
| --- | --- |
| Type-safe responses | Generic `apiFetch<T>()` returning `Promise<T>` |
| Centralised base URL | `env.NEXT_PUBLIC_API_URL` via `@t3-oss/env-nextjs` |
| Consistent headers | Default `Accept` / `Content-Type` headers |
| Future auth support | Optional `getToken` hook injected per-call |
| Resilience | Configurable retry on network errors (not 4xx/5xx) |
| Observability | Server-side pino logging for every request/response |
| SWR integration | Thin `fetcher` wrapper for `useSWR` |

## Step 1 — Add `NEXT_PUBLIC_API_URL` to Environment Config

Edit `src/shared/config/env.ts`:

```ts
import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    NODE_ENV: z.enum(["development", "production", "test"]),
  },
  client: {
    NEXT_PUBLIC_API_URL: z.string().url(),
  },
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
});
```

Add `NEXT_PUBLIC_API_URL=http://localhost:3001` (or the real API URL) to `.env.local`.

## Step 2 — Create `src/shared/api/error.ts`

A typed error class that carries HTTP context alongside the JavaScript `Error`.

```ts
// src/shared/api/error.ts

export class ApiError extends Error {
  readonly status: number;
  readonly code: string | undefined;
  readonly url: string;
  readonly response: Response;

  constructor(
    message: string,
    response: Response,
    code?: string,
  ) {
    super(message);
    this.name = "ApiError";
    this.status = response.status;
    this.url = response.url;
    this.response = response;
    this.code = code;

    // Maintain correct prototype chain in transpiled environments
    Object.setPrototypeOf(this, ApiError.prototype);
  }

  get isClientError(): boolean {
    return this.status >= 400 && this.status < 500;
  }

  get isServerError(): boolean {
    return this.status >= 500;
  }

  get isNotFound(): boolean {
    return this.status === 404;
  }

  get isUnauthorized(): boolean {
    return this.status === 401;
  }

  get isForbidden(): boolean {
    return this.status === 403;
  }
}
```

### Usage in catch blocks

```ts
import { ApiError } from "@/shared/api/error";

try {
  const data = await apiFetch<User>("/users/1");
} catch (err) {
  if (err instanceof ApiError) {
    if (err.isUnauthorized) {
      // redirect to login
    }
    if (err.isNotFound) {
      // render 404 UI
    }
  }
}
```

## Step 3 — Create `src/shared/api/client.ts`

The core fetch wrapper. This is the only file that calls `fetch` directly.

```ts
// src/shared/api/client.ts
import { env } from "@/shared/config/env";

import { ApiError } from "./error";

import type { RequestInit } from "next/dist/server/web/spec-extension/request";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ApiFetchOptions extends Omit<RequestInit, "body"> {
  /**
   * Path relative to NEXT_PUBLIC_API_URL, e.g. "/users/1".
   * Absolute URLs are also accepted and will bypass base URL prepending.
   */
  path: string;

  /** JSON-serialisable request body. Automatically stringified. */
  body?: unknown;

  /**
   * Returns the Bearer token to attach as `Authorization` header.
   * Called per-request so that refreshed tokens are always used.
   * Return `null` or `undefined` to skip the header.
   */
  getToken?: () => string | null | undefined;

  /**
   * Maximum number of retries on network failure (not on 4xx/5xx).
   * Default: 1.
   */
  retries?: number;

  /**
   * Delay in ms between retries. Default: 300.
   */
  retryDelay?: number;
}

// ─── Implementation ───────────────────────────────────────────────────────────

const DEFAULT_RETRIES = 1;
const DEFAULT_RETRY_DELAY_MS = 300;

function isNetworkError(err: unknown): boolean {
  return err instanceof TypeError && err.message === "Failed to fetch";
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function apiFetch<T>(options: ApiFetchOptions): Promise<T> {
  const {
    path,
    body,
    getToken,
    retries = DEFAULT_RETRIES,
    retryDelay = DEFAULT_RETRY_DELAY_MS,
    headers: customHeaders,
    ...restOptions
  } = options;

  const url = path.startsWith("http")
    ? path
    : `${env.NEXT_PUBLIC_API_URL}${path}`;

  // Build headers
  const headers = new Headers({
    Accept: "application/json",
    "Content-Type": "application/json",
    ...Object(customHeaders),
  });

  const token = getToken?.();
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const init: RequestInit = {
    ...restOptions,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  };

  // Server-side logging (pino is Node-only)
  let logger: Awaited<ReturnType<typeof import("@/shared/lib/logger")["logger"]["child"]>> | null = null;
  if (typeof window === "undefined") {
    const { logger: pinoLogger } = await import("@/shared/lib/logger");
    logger = pinoLogger.child({ url, method: init.method ?? "GET" });
    logger.debug("→ api request");
  }

  let attempt = 0;

  while (true) {
    try {
      const start = Date.now();
      const response = await fetch(url, init);
      const duration = Date.now() - start;

      logger?.debug({ status: response.status, duration }, "← api response");

      if (!response.ok) {
        // Try to extract a machine-readable error code from the response body
        let code: string | undefined;
        try {
          const json = await response.clone().json() as { code?: string };
          code = json?.code;
        } catch {
          // Body was not JSON — ignore
        }

        throw new ApiError(
          `HTTP ${response.status}: ${response.statusText}`,
          response,
          code,
        );
      }

      // 204 No Content — return undefined cast to T
      if (response.status === 204) {
        return undefined as T;
      }

      return (await response.json()) as T;
    } catch (err) {
      if (isNetworkError(err) && attempt < retries) {
        attempt++;
        logger?.warn({ attempt, retries }, "network error, retrying");
        await delay(retryDelay);
        continue;
      }
      throw err;
    }
  }
}
```

### Design decisions

- **No global singleton.** `apiFetch` is a plain async function. No class, no state. Easier to test and tree-shake.
- **`getToken` is a callback, not a value.** This ensures that a refreshed token is always read at request time, not captured at construction time.
- **Retry only on network errors.** 4xx/5xx are business errors and should not be retried automatically.
- **Server-side pino import is dynamic (`await import(...)`) and guarded by `typeof window === "undefined"`** so the logger import is never bundled into client-side code.

## Step 4 — Create `src/shared/api/fetcher.ts`

A thin SWR-compatible fetcher for use with `useSWR`.

```ts
// src/shared/api/fetcher.ts
import { apiFetch } from "./client";

/**
 * SWR fetcher. Pass as the second argument to `useSWR`.
 *
 * @example
 * const { data } = useSWR<User>("/users/1", fetcher);
 */
export async function fetcher<T>(path: string): Promise<T> {
  return apiFetch<T>({ path });
}
```

### SWR usage in a component

```tsx
import useSWR from "swr";

import { fetcher } from "@/shared/api/fetcher";

import type { User } from "@/modules/users/types";

export function UserProfile({ id }: { id: string }) {
  const { data, error, isLoading } = useSWR<User>(`/users/${id}`, fetcher);

  if (isLoading) return <Spinner />;
  if (error instanceof ApiError && error.isNotFound) return <NotFound />;
  if (error) return <ErrorMessage />;

  return <div>{data?.name}</div>;
}
```

## Step 5 — Create `src/shared/api/index.ts`

```ts
// src/shared/api/index.ts
export { apiFetch } from "./client";
export { ApiError } from "./error";
export { fetcher } from "./fetcher";
export type { ApiFetchOptions } from "./client";
```

## Step 6 — Write Tests

```ts
// src/shared/api/client.test.ts
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ApiError } from "./error";
import { apiFetch } from "./client";

// Mock env so tests don't need a real .env file
vi.mock("@/shared/config/env", () => ({
  env: { NEXT_PUBLIC_API_URL: "https://api.example.com" },
}));

// Mock logger to silence output
vi.mock("server-only", () => ({}));
vi.mock("@/shared/lib/logger", () => ({
  logger: { child: vi.fn(() => ({ debug: vi.fn(), warn: vi.fn() })) },
}));

describe("apiFetch", () => {
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

    const result = await apiFetch<{ id: number }>({ path: "/items/1" });
    expect(result).toEqual({ id: 1 });
  });

  it("throws ApiError on non-ok response", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ code: "NOT_FOUND" }), { status: 404 }),
    );

    await expect(apiFetch({ path: "/items/99" })).rejects.toBeInstanceOf(ApiError);
  });

  it("retries on network failure", async () => {
    vi.mocked(fetch)
      .mockRejectedValueOnce(new TypeError("Failed to fetch"))
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ id: 1 }), { status: 200 }),
      );

    const result = await apiFetch<{ id: number }>({
      path: "/items/1",
      retries: 1,
      retryDelay: 0,
    });

    expect(result).toEqual({ id: 1 });
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it("attaches Authorization header when getToken is provided", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({}), { status: 200 }),
    );

    await apiFetch({ path: "/me", getToken: () => "my-token" });

    const callInit = vi.mocked(fetch).mock.calls[0][1] as RequestInit;
    expect((callInit.headers as Headers).get("Authorization")).toBe(
      "Bearer my-token",
    );
  });
});
```

## Final Directory Structure

```text
src/
  shared/
    api/
      client.ts     ← apiFetch<T>() — core fetch wrapper
      error.ts      ← ApiError class
      fetcher.ts    ← SWR-compatible fetcher
      index.ts      ← barrel export
      client.test.ts ← unit tests
  shared/
    config/
      env.ts        ← updated with NEXT_PUBLIC_API_URL
```

## Module-Level API Hooks Pattern

Feature modules should define their own SWR hooks in `src/modules/<feature>/api/`:

```ts
// src/modules/users/api/use-users.ts
import useSWR from "swr";

import { fetcher } from "@/shared/api";

import type { User } from "../types";

export function useUsers() {
  return useSWR<User[]>("/users", fetcher);
}
```

This keeps data-fetching logic co-located with the feature and keeps `src/shared/api/` as pure infrastructure.
