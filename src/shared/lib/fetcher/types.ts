export interface FetchClientOptions extends Omit<RequestInit, "body"> {
  /**
   * Path relative to NEXT_PUBLIC_API_URL, e.g. "/users/1".
   * Absolute URLs are also accepted and will bypass base URL prepending.
   */
  path: string;

  /** JSON-serialisable request body. Automatically stringified. */
  body?: unknown;

  /**
   * Maximum number of retries on network failure (not on 4xx/5xx).
   * Default: 1.
   */
  retries?: number;

  /**
   * Delay in ms between retries. Default: 300.
   */
  retryDelay?: number;

  /**
   * Returns the Bearer token to attach as `Authorization` header.
   * Called per-request so that refreshed tokens are always used.
   * Return `null` or `undefined` to skip the header.
   */
  getToken?: () => null | string | undefined;
}
