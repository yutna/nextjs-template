export interface FetchErrorOptions {
  /** The request URL. */
  url: string;

  /** HTTP method used (e.g. "GET", "POST"). */
  method: string;

  /** The original Response object. */
  response: Response;

  /**
   * Machine-readable error code from the API response body.
   * Falls back to "FETCH_ERROR" when not provided.
   */
  code?: string;
}
