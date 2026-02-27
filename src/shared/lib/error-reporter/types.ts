export interface ErrorContext {
  /** Which component or boundary caught the error */
  boundary?: "global" | "app" | "route-handler" | "server-action";
  /** Next.js server-side error correlation ID (available as error.digest) */
  digest?: string;
  /** Additional arbitrary key/value metadata */
  meta?: Record<string, unknown>;
}
