# Error Logging Setup (DIY — Rails-style tmp/logs)

Structured, file-based error logging inspired by Rails' `tmp/logs/` convention. No third-party error tracking service required.

## Current State

Both error boundaries receive the `error` prop but silently discard it:

- `ErrorGlobal` (`src/shared/components/error-global/error-global.tsx`) — `reset` is used, but `error` is never logged.
- `ErrorAppBoundary` (`src/shared/components/error-app-boundary/error-app-boundary.tsx`) — same issue; `error.digest` (Next.js server-error correlation ID) is available but unused.

The existing `logger` (pino) is server-only and cannot be called from a client component directly.

## Architecture Overview

```text
Client side                      Server side
────────────────────────         ────────────────────────
ErrorGlobal (client)             Server Action: reportErrorAction
ErrorAppBoundary (client)   ──►  errorReporter.reportError()
  └── useEffect on mount          └── pino → tmp/logs/error.log
```

Flow:

1. Next.js catches an unhandled error and mounts the error boundary component.
2. A `useEffect` inside the error boundary calls a Server Action, passing the serialised error info.
3. The Server Action delegates to `errorReporter`, which writes a structured JSON line to `tmp/logs/error.log` using pino's file transport.
4. Server-side errors (thrown inside Server Components or Route Handlers) are logged directly via `errorReporter` without going through the client.

## Step 1 — Create `tmp/logs/` Directory Convention

Add to `.gitignore`:

```gitignore
# Runtime logs (Rails-style)
tmp/
```

The `tmp/` directory is created at runtime by the error reporter module. It must never be committed.

In production environments where the filesystem is read-only (e.g. Vercel Serverless Functions), the reporter automatically falls back to `console.error`. See Step 2 for the fallback implementation.

## Step 2 — Create `src/shared/lib/error-reporter/error-reporter.ts`

```ts
// src/shared/lib/error-reporter/error-reporter.ts
import "server-only";
import fs from "node:fs";
import path from "node:path";

import pino from "pino";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ErrorContext {
  /** Next.js server-side error correlation ID (available as error.digest) */
  digest?: string;
  /** Which component or boundary caught the error */
  boundary?: "global" | "app" | "route-handler" | "server-action";
  /** Additional arbitrary key/value metadata */
  meta?: Record<string, unknown>;
}

// ─── Log file setup ───────────────────────────────────────────────────────────

const LOG_DIR = path.join(process.cwd(), "tmp", "logs");
const LOG_FILE = path.join(LOG_DIR, "error.log");

function createFileLogger() {
  try {
    fs.mkdirSync(LOG_DIR, { recursive: true });
    return pino(
      {
        level: "error",
        base: { service: "nextjs-app" },
        timestamp: pino.stdTimeFunctions.isoTime,
      },
      pino.destination({ dest: LOG_FILE, sync: false }),
    );
  } catch {
    // Filesystem is read-only (e.g. Vercel) — fall back to console transport
    return pino({ level: "error" });
  }
}

const errorLogger = createFileLogger();

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Report an error to `tmp/logs/error.log`.
 * Falls back to `console.error` when the filesystem is not writable.
 */
export function reportError(error: unknown, context: ErrorContext = {}): void {
  const err = error instanceof Error ? error : new Error(String(error));

  errorLogger.error(
    {
      digest: context.digest,
      boundary: context.boundary,
      meta: context.meta,
      stack: err.stack,
    },
    err.message,
  );
}
```

### Log line example

```json
{
  "level": 50,
  "time": "2026-02-25T10:00:00.000Z",
  "service": "nextjs-app",
  "digest": "1234567890",
  "boundary": "app",
  "stack": "Error: Something broke\n    at ...",
  "msg": "Something broke"
}
```

## Step 3 — Create `src/shared/lib/error-reporter/index.ts`

```ts
// src/shared/lib/error-reporter/index.ts
export { reportError } from "./error-reporter";
export type { ErrorContext } from "./error-reporter";
```

## Step 4 — Create `src/shared/actions/report-error.ts`

A Server Action that acts as the bridge between client-side error boundaries and the server-side error reporter.

```ts
// src/shared/actions/report-error.ts
"use server";

import { reportError } from "@/shared/lib/error-reporter";

import type { ErrorContext } from "@/shared/lib/error-reporter";

export interface SerializedError {
  message: string;
  digest?: string;
}

/**
 * Called from client-side error boundaries.
 * Accepts a serialized (plain-object) representation of the error
 * because actual Error instances cannot be passed across the server/client boundary.
 */
export async function reportErrorAction(
  serializedError: SerializedError,
  context: ErrorContext = {},
): Promise<void> {
  reportError(new Error(serializedError.message), {
    ...context,
    digest: serializedError.digest ?? context.digest,
  });
}
```

## Step 5 — Update `ErrorAppBoundary`

Add a `useEffect` that fires once when the error boundary mounts, calling the Server Action.

```tsx
// src/shared/components/error-app-boundary/error-app-boundary.tsx
// Add these imports to the existing file:
import { useEffect } from "react";
import { reportErrorAction } from "@/shared/actions/report-error";

// Inside the ErrorAppBoundary function, add before the return:
useEffect(() => {
  void reportErrorAction(
    { message: error.message, digest: error.digest },
    { boundary: "app" },
  );
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);
// The empty dependency array is intentional — report only once per mount.
```

The `error` prop is available via `NextErrorProps` which is already destructured in the component signature.

## Step 6 — Update `ErrorGlobal`

`global-error.tsx` renders outside `ChakraProvider` and `IntlProvider`. The component is already a client component (`"use client"`).

```tsx
// src/shared/components/error-global/error-global.tsx
// Add these imports:
import { useEffect } from "react";
import { reportErrorAction } from "@/shared/actions/report-error";

// Inside ErrorGlobal function, add before the return:
useEffect(() => {
  void reportErrorAction(
    { message: error.message, digest: error.digest },
    { boundary: "global" },
  );
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);
```

## Step 7 — Use in Server-Side Code

For errors caught inside Server Components, Route Handlers, or Server Actions, call `reportError` directly without going through the Server Action bridge:

```ts
// src/modules/payments/actions/process-payment.ts
"use server";

import { reportError } from "@/shared/lib/error-reporter";

export async function processPaymentAction(input: PaymentInput) {
  try {
    await stripe.charges.create(...);
  } catch (err) {
    reportError(err, {
      boundary: "server-action",
      meta: { userId: input.userId, amount: input.amount },
    });
    throw err; // re-throw so the action still returns an error state
  }
}
```

## Reading Logs in Development

```bash
# Tail the log file
tail -f tmp/logs/error.log

# Pretty-print with pino-pretty
tail -f tmp/logs/error.log | npx pino-pretty

# Search by digest
grep "1234567890" tmp/logs/error.log | npx pino-pretty
```

## Production Considerations

| Environment | Behavior |
| --- | --- |
| Local development | Writes to `tmp/logs/error.log` |
| Docker (writable FS) | Writes to `tmp/logs/error.log` inside the container |
| Vercel Serverless | Filesystem is read-only → falls back to `console.error` → logs appear in Vercel dashboard |
| Vercel Edge Runtime | `fs` is not available at all — do not call `reportError` in Edge routes |

To ensure correctness in all environments, the `createFileLogger()` function wraps `fs.mkdirSync` in a try/catch. If it fails for any reason, the logger silently degrades to stdout (pino's default), which is captured by any platform log aggregator.

## Final Directory Structure

```text
src/
  shared/
    actions/
      report-error.ts          ← Server Action bridge
    lib/
      error-reporter/
        error-reporter.ts      ← pino file transport + reportError()
        index.ts               ← barrel export
    components/
      error-app-boundary/
        error-app-boundary.tsx ← updated: calls reportErrorAction
      error-global/
        error-global.tsx       ← updated: calls reportErrorAction
tmp/
  logs/
    error.log                  ← runtime generated, git-ignored
```
