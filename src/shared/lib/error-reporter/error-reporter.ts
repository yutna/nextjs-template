import "server-only";

import { createFileLogger } from "./create-file-logger";

import type { ErrorContext } from "./types";

const errorLogger = createFileLogger();

/**
 * Report an error to `tmp/logs/error.log`.
 * Falls back to `console.error` when the filesystem is not writable.
 */
export function reportError(error: unknown, context: ErrorContext = {}): void {
  const err = error instanceof Error ? error : new Error(String(error));

  errorLogger.error(
    {
      boundary: context.boundary,
      digest: context.digest,
      meta: context.meta,
      stack: err.stack,
    },
    err.message,
  );
}
