export interface AppErrorOptions {
  /**
   * Machine-readable error code. Use SCREAMING_SNAKE_CASE prefixed with domain.
   * e.g. "USER_NOT_FOUND", "ORDER_ALREADY_PAID"
   */
  code: string;

  /**
   * Human-readable message. This MAY be shown to the user when isOperational = true.
   * Keep it in English; the caller maps it to i18n via `code` for UI display.
   */
  message: string;

  /**
   * HTTP status code this error maps to.
   */
  statusCode: number;

  /**
   * The original error that caused this one. Used in error chains.
   */
  cause?: unknown;

  /**
   * If true, this is an expected business failure — safe to surface a message to the user.
   * If false, this is a system failure — log full details, show a generic 500 UI.
   * Default: false (infrastructure errors default to unexpected).
   */
  isOperational?: boolean;
}

export interface SerializedError {
  code: string;
  isOperational: boolean;
  message: string;
  name: string;
  statusCode: number;

  digest?: string;
}

export interface FieldErrors {
  [field: string]: string[];
}
