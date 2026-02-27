import { env } from "@/shared/config/env";
import { FetchError } from "@/shared/lib/errors/http/fetch-error";

import { DEFAULT_RETRIES, DEFAULT_RETRY_DELAY_MS } from "./constants";
import { delay, isNetworkError } from "./helpers";

import type { FetchClientOptions } from "./types";

export async function fetchClient<T>(options: FetchClientOptions): Promise<T> {
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
    "Accept": "application/json",
    "Content-Type": "application/json",
    ...Object(customHeaders),
  });

  const token = getToken?.();
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const method = restOptions.method ?? "GET";

  const init: RequestInit = {
    ...restOptions,
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  };

  // Server-side logging (pino is Node-only)
  let log: ReturnType<
    Awaited<typeof import("@/shared/lib/logger")>["logger"]["child"]
  > | null = null;

  if (typeof window === "undefined") {
    const { logger } = await import("@/shared/lib/logger");
    log = logger.child({ url, method });
    log.debug("→ fetch request");
  }

  let attempt = 0;

  while (true) {
    try {
      const start = Date.now();
      const response = await fetch(url, init);
      const duration = Date.now() - start;

      log?.debug({ status: response.status, duration }, "← fetch response");

      if (!response.ok) {
        // Try to extract a machine-readable error code from the response body
        let code: string | undefined;
        try {
          const json = (await response.clone().json()) as { code?: string };
          code = json?.code;
        } catch {
          // Body was not JSON — ignore
        }

        throw new FetchError({ url, method, response, code });
      }

      // 204 No Content — return undefined cast to T
      if (response.status === 204) {
        return undefined as T;
      }

      return (await response.json()) as T;
    } catch (err) {
      if (isNetworkError(err) && attempt < retries) {
        attempt++;
        log?.warn({ attempt, retries }, "network error, retrying");
        await delay(retryDelay);
        continue;
      }
      throw err;
    }
  }
}
