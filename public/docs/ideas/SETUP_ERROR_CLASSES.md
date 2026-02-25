# Error Class Hierarchy

Structured, type-safe error system for Next.js 16 + React 19. Designed to work
cleanly across the server/client boundary, integrate with `next-safe-action`,
and produce structured logs via pino.

Implement this **before** `SETUP_ERROR_LOGGING.md` and `SETUP_API_LAYER.md` —
both depend on this hierarchy.

---

## Design Principles

### 1. Every error has a `code`

A machine-readable string constant tied to a specific failure scenario. Used for:

- **i18n** — map `error.code` to a translated user message
- **Logging** — search `grep "USER_NOT_FOUND" tmp/logs/error.log`
- **AI Agents** — structured codes are easier to parse than free-form messages
- **Client handling** — switch on `code` without parsing English strings

Convention: `SCREAMING_SNAKE_CASE`, prefixed by domain.

```ts
"USER_NOT_FOUND"
"ORDER_ALREADY_PAID"
"SESSION_EXPIRED"
"INSUFFICIENT_PERMISSIONS"
"EMAIL_ALREADY_EXISTS"
```

### 2. Every error has a `statusCode`

Maps directly to an HTTP status code. Used by API Route Handlers and
`handleServerError` in `next-safe-action` to return the correct HTTP response
without ad-hoc switch statements scattered across the codebase.

### 3. Errors know their boundary

Not every error should reach the user. Infrastructure errors (database down,
third-party service timeout) should be logged at `error` level and replaced
with a generic message. Domain errors can often show a helpful message.

The `isOperational` flag marks errors that are "expected" business failures
vs true system failures:

- `isOperational = true` → expected, safe to show a message to the user
- `isOperational = false` → unexpected, log the full stack and show a generic 500

### 4. Errors are serializable across the server/client boundary

Next.js Server Actions cannot pass class instances to the client.
All errors expose a `toJSON()` method that returns a plain object safe for
`JSON.stringify`. A matching `SerializedError` type and `fromSerializedError()`
factory allow reconstruction on either side when needed (e.g. `reportErrorAction`
in `SETUP_ERROR_LOGGING.md`).

### 5. `next-safe-action` surface is a string

`next-safe-action` v8 exposes only `serverError: string` to the client — the
actual class never crosses the boundary. `handleServerError` in `safe-action.ts`
is the single place that decides what string to return based on error type.

---

## Full Hierarchy

```text
AppError  (abstract base)
├── DomainError               isOperational = true
│   ├── ValidationError       422 — input failed validation
│   ├── NotFoundError         404 — resource does not exist
│   ├── ConflictError         409 — duplicate or concurrent state conflict
│   ├── AuthorizationError    403 — authenticated, lacks permission
│   └── BusinessRuleError     422 — other business constraint violated
├── AuthenticationError       401 — not logged in, token expired/invalid
├── ApiError                  varies — upstream HTTP error (see SETUP_API_LAYER.md)
└── InfrastructureError       500 — isOperational = false
    ├── DatabaseError
    └── ExternalServiceError
```

---

## Step 1 — Base Class: `AppError`

```ts
// src/shared/lib/errors/app-error.ts

export interface AppErrorOptions {
  /**
   * Machine-readable error code. Use SCREAMING_SNAKE_CASE prefixed with domain.
   * e.g. "USER_NOT_FOUND", "ORDER_ALREADY_PAID"
   */
  code: string;

  /**
   * HTTP status code this error maps to.
   */
  statusCode: number;

  /**
   * Human-readable message. This MAY be shown to the user when isOperational = true.
   * Keep it in English; the caller maps it to i18n via `code` for UI display.
   */
  message: string;

  /**
   * If true, this is an expected business failure — safe to surface a message to the user.
   * If false, this is a system failure — log full details, show a generic 500 UI.
   * Default: false (infrastructure errors default to unexpected).
   */
  isOperational?: boolean;

  /**
   * The original error that caused this one. Used in error chains.
   */
  cause?: unknown;
}

export interface SerializedError {
  name: string;
  code: string;
  statusCode: number;
  message: string;
  isOperational: boolean;
  digest?: string;
}

export abstract class AppError extends Error {
  readonly code: string;
  readonly statusCode: number;
  readonly isOperational: boolean;

  /**
   * Populated by Next.js when this error originated on the server.
   * Correlates the client-side boundary with the server log entry.
   */
  digest?: string;

  constructor(options: AppErrorOptions) {
    super(options.message);
    this.name = this.constructor.name;
    this.code = options.code;
    this.statusCode = options.statusCode;
    this.isOperational = options.isOperational ?? false;

    if (options.cause !== undefined) {
      this.cause = options.cause;
    }

    // Maintain correct prototype chain in compiled/transpiled environments
    Object.setPrototypeOf(this, new.target.prototype);
  }

  /**
   * Returns a plain-object representation safe for JSON.stringify and
   * for passing across the server/client boundary.
   * Stack trace is excluded in production.
   */
  toJSON(): SerializedError {
    return {
      name: this.name,
      code: this.code,
      statusCode: this.statusCode,
      message: this.message,
      isOperational: this.isOperational,
      ...(this.digest ? { digest: this.digest } : {}),
    };
  }

  override toString(): string {
    return `[${this.name}] ${this.code}: ${this.message}`;
  }
}

// ─── Type Guards ──────────────────────────────────────────────────────────────

export function isAppError(err: unknown): err is AppError {
  return err instanceof AppError;
}

export function isOperationalError(err: unknown): err is AppError {
  return isAppError(err) && err.isOperational;
}

/**
 * Reconstruct an AppError-like object from a serialized plain object.
 * Used in reportErrorAction to re-attach context when logging client-side errors.
 */
export function fromSerializedError(raw: SerializedError): SerializedError {
  // Returns the plain object as-is; we cannot reconstruct the class,
  // but the shape is fully typed and usable for logging.
  return raw;
}
```

---

## Step 2 — Domain Errors

Business logic failures. All `isOperational = true` because they are expected
scenarios that the application deliberately handles.

```ts
// src/shared/lib/errors/domain-error.ts
import { AppError } from "./app-error";

import type { AppErrorOptions } from "./app-error";
import type { ZodError, ZodIssue } from "zod";

// ─── Base ─────────────────────────────────────────────────────────────────────

export abstract class DomainError extends AppError {
  constructor(options: Omit<AppErrorOptions, "isOperational">) {
    super({ ...options, isOperational: true });
  }
}

// ─── Validation Error ─────────────────────────────────────────────────────────

export interface FieldErrors {
  [field: string]: string[];
}

export class ValidationError extends DomainError {
  /**
   * Field-level errors in the same shape as next-safe-action's validationErrors.
   * Allows the client to display per-field feedback without special-casing.
   */
  readonly fieldErrors: FieldErrors;

  constructor(
    message: string,
    fieldErrors: FieldErrors = {},
    code = "VALIDATION_ERROR",
  ) {
    super({ code, statusCode: 422, message });
    this.fieldErrors = fieldErrors;
  }

  /**
   * Convenience factory: create a ValidationError from a ZodError.
   * Collapses multiple issues per field into a string array.
   */
  static fromZodError(error: ZodError, code = "VALIDATION_ERROR"): ValidationError {
    const fieldErrors: FieldErrors = {};

    for (const issue of error.issues) {
      const field = issue.path.join(".") || "_root";
      if (!fieldErrors[field]) {
        fieldErrors[field] = [];
      }
      fieldErrors[field].push(issue.message);
    }

    return new ValidationError(
      "Validation failed",
      fieldErrors,
      code,
    );
  }

  /**
   * Convenience factory for a single-field validation error.
   */
  static forField(field: string, message: string, code = "VALIDATION_ERROR"): ValidationError {
    return new ValidationError(message, { [field]: [message] }, code);
  }
}

// ─── Not Found Error ──────────────────────────────────────────────────────────

export class NotFoundError extends DomainError {
  /**
   * @param resource - The entity type that was not found, e.g. "User", "Order"
   * @param id       - The identifier that was looked up (optional; omit in public routes)
   * @param code     - Override the default code if the module has a specific one
   */
  constructor(resource: string, id?: string | number, code = "NOT_FOUND") {
    const detail = id !== undefined ? ` with id "${id}"` : "";
    super({
      code,
      statusCode: 404,
      message: `${resource}${detail} not found`,
    });
  }
}

// ─── Conflict Error ───────────────────────────────────────────────────────────

export class ConflictError extends DomainError {
  constructor(message: string, code = "CONFLICT") {
    super({ code, statusCode: 409, message });
  }
}

// ─── Authorization Error ──────────────────────────────────────────────────────

export class AuthorizationError extends DomainError {
  constructor(
    message = "You do not have permission to perform this action",
    code = "INSUFFICIENT_PERMISSIONS",
  ) {
    super({ code, statusCode: 403, message });
  }
}

// ─── Business Rule Error ──────────────────────────────────────────────────────

/**
 * Use when a specific business rule is violated that doesn't fit the other categories.
 * Always provide a domain-specific `code`.
 *
 * @example
 * throw new BusinessRuleError("Order is already paid", "ORDER_ALREADY_PAID");
 */
export class BusinessRuleError extends DomainError {
  constructor(message: string, code: string) {
    super({ code, statusCode: 422, message });
  }
}
```

---

## Step 3 — Authentication Error

A first-class citizen separate from `AuthorizationError`. The distinction matters:

- `AuthenticationError` → 401 — **who are you?** (not logged in, token expired)
- `AuthorizationError` → 403 — **you can't do that** (logged in but no permission)

```ts
// src/shared/lib/errors/authentication-error.ts
import { AppError } from "./app-error";

export class AuthenticationError extends AppError {
  constructor(
    message = "Authentication required. Please log in.",
    code = "AUTHENTICATION_REQUIRED",
  ) {
    super({ code, statusCode: 401, message, isOperational: true });
  }
}

// Sub-class for expired tokens — useful for auth interceptors
export class SessionExpiredError extends AuthenticationError {
  constructor() {
    super("Your session has expired. Please log in again.", "SESSION_EXPIRED");
  }
}
```

---

## Step 4 — Infrastructure Errors

System-level failures. `isOperational = false` — never show details to the user,
always log the full cause.

```ts
// src/shared/lib/errors/infrastructure-error.ts
import { AppError } from "./app-error";

import type { AppErrorOptions } from "./app-error";

export abstract class InfrastructureError extends AppError {
  constructor(options: Omit<AppErrorOptions, "isOperational" | "statusCode">) {
    super({ ...options, statusCode: 500, isOperational: false });
  }
}

// ─── Database Error ───────────────────────────────────────────────────────────

export class DatabaseError extends InfrastructureError {
  /**
   * @param operation - e.g. "findUser", "createOrder"
   * @param cause     - original DB driver error
   */
  constructor(operation: string, cause?: unknown) {
    super({
      code: "DATABASE_ERROR",
      message: `Database operation failed: ${operation}`,
      cause,
    });
  }
}

// ─── External Service Error ───────────────────────────────────────────────────

export class ExternalServiceError extends InfrastructureError {
  readonly service: string;

  /**
   * @param service - e.g. "stripe", "sendgrid", "aws-s3"
   * @param cause   - original error from the service SDK
   */
  constructor(service: string, cause?: unknown) {
    super({
      code: "EXTERNAL_SERVICE_ERROR",
      message: `External service "${service}" is unavailable`,
      cause,
    });
    this.service = service;
  }
}
```

---

## Step 5 — `ApiError` Placement

`ApiError` (from `SETUP_API_LAYER.md`) fits into this hierarchy as a direct
child of `AppError`. When implementing the API layer, extend `AppError` instead
of `Error`:

```ts
// src/shared/api/error.ts  ← update when doing SETUP_API_LAYER.md

import { AppError } from "@/shared/lib/errors/app-error";

export class ApiError extends AppError {
  readonly response: Response;

  constructor(message: string, response: Response, code?: string) {
    super({
      code: code ?? `HTTP_${response.status}`,
      statusCode: response.status,
      message,
      isOperational: response.status < 500, // 4xx = operational, 5xx = not
    });
    this.response = response;
    Object.setPrototypeOf(this, ApiError.prototype);
  }

  get isNotFound(): boolean    { return this.statusCode === 404; }
  get isUnauthorized(): boolean { return this.statusCode === 401; }
  get isForbidden(): boolean   { return this.statusCode === 403; }
  get isClientError(): boolean { return this.statusCode >= 400 && this.statusCode < 500; }
  get isServerError(): boolean { return this.statusCode >= 500; }
}
```

---

## Step 6 — Barrel Export

```ts
// src/shared/lib/errors/index.ts
export { AppError, isAppError, isOperationalError, fromSerializedError } from "./app-error";
export { ValidationError, NotFoundError, ConflictError, AuthorizationError, BusinessRuleError } from "./domain-error";
export { AuthenticationError, SessionExpiredError } from "./authentication-error";
export { InfrastructureError, DatabaseError, ExternalServiceError } from "./infrastructure-error";

export type { AppErrorOptions, SerializedError, FieldErrors } from "./app-error";
export type { FieldErrors as DomainFieldErrors } from "./domain-error";
```

---

## Step 7 — Update `safe-action.ts`

`next-safe-action` v8 exposes `handleServerError` to control what is returned in
`serverError`. Without this, any thrown error (including stack traces) might
leak to the client.

```ts
// src/shared/lib/safe-action/safe-action.ts
import { createSafeActionClient } from "next-safe-action";

import { AppError } from "@/shared/lib/errors";

function handleServerError(err: unknown): string {
  // Known operational errors: return their message directly
  if (err instanceof AppError && err.isOperational) {
    return err.message;
  }

  // Unknown / infrastructure errors: hide details from the client
  // The full error is logged by reportError() in SETUP_ERROR_LOGGING.md
  return "An unexpected error occurred. Please try again.";
}

export const actionClient = createSafeActionClient({
  handleServerError,
});

export const authActionClient = actionClient.use(async ({ next }) => {
  // Add auth check here when needed
  return next();
});
```

The client reads the result as:

```ts
const result = await myAction({ ... });

if (result?.serverError) {
  // result.serverError is a string — the safe message from handleServerError
  toast.error(result.serverError);
}
```

---

## Step 8 — Module-Level Error Code Registry

Each feature module owns its error codes to avoid collisions. Define them as
`const` objects so they are typed as string literals, not `string`.

```ts
// src/modules/users/lib/errors.ts
export const USER_ERROR_CODES = {
  NOT_FOUND:        "USER_NOT_FOUND",
  EMAIL_DUPLICATE:  "USER_EMAIL_DUPLICATE",
  SUSPENDED:        "USER_SUSPENDED",
  INVALID_ROLE:     "USER_INVALID_ROLE",
} as const;

export type UserErrorCode = typeof USER_ERROR_CODES[keyof typeof USER_ERROR_CODES];
```

Usage:

```ts
import { NotFoundError, ConflictError } from "@/shared/lib/errors";
import { USER_ERROR_CODES } from "../lib/errors";

// In a service function
const user = await db.users.findById(id);
if (!user) {
  throw new NotFoundError("User", id, USER_ERROR_CODES.NOT_FOUND);
}

if (await db.users.emailExists(email)) {
  throw new ConflictError("Email is already registered", USER_ERROR_CODES.EMAIL_DUPLICATE);
}
```

---

## Step 9 — Pattern Matching with `ts-pattern`

`ts-pattern` (already in dependencies) enables exhaustive error matching in
Server Actions and Server Components instead of chained `if/instanceof` blocks.

```ts
import { match } from "ts-pattern";
import { notFound, redirect } from "next/navigation";

import {
  NotFoundError,
  AuthenticationError,
  AuthorizationError,
  ValidationError,
  isAppError,
} from "@/shared/lib/errors";

// In a Server Component or Server Action:
function handleError(err: unknown): never {
  match(err)
    .when(
      (e) => e instanceof NotFoundError,
      () => notFound(),                          // → triggers not-found.tsx
    )
    .when(
      (e) => e instanceof AuthenticationError,
      () => redirect("/login"),                  // → redirects to login
    )
    .when(
      (e) => e instanceof AuthorizationError,
      () => { throw err; },                      // → bubble to error boundary (403 page)
    )
    .when(
      (e) => e instanceof ValidationError,
      (e) => {
        // ValidationError is operational — return errors to the form
        throw e;
      },
    )
    .otherwise(() => {
      // Unknown error — re-throw and let Next.js error boundary handle it
      throw err;
    });
}
```

---

## Step 10 — `notFound()` vs `throw new NotFoundError()`

Next.js provides `notFound()` from `next/navigation` which throws a special
internal error that triggers `not-found.tsx`. Use the right one based on context:

| Context | Use | Why |
| --- | --- | --- |
| Server Component rendering a page | `notFound()` | Triggers `not-found.tsx` layout automatically |
| Server Action | `throw new NotFoundError(...)` | Caller decides how to handle (show inline, toast, etc.) |
| Service / repository function | `throw new NotFoundError(...)` | Pure business logic, no Next.js dependency |
| API Route Handler | `throw new NotFoundError(...)` | Map to `Response` with `statusCode` |
| Middleware | `notFound()` is not available — return `NextResponse.rewrite(new URL("/not-found", req.url))` | Middleware runs before the React tree |

```ts
// ✅ Server Component — use notFound() for page-level 404
export default async function UserPage({ params }: { params: { id: string } }) {
  const user = await getUserById(params.id); // throws NotFoundError internally
  // Service wraps like this:
  // catch (err) { if (err instanceof NotFoundError) notFound(); throw err; }
}

// ✅ Server Action — use NotFoundError, let the action return serverError
export const updateUserAction = actionClient
  .inputSchema(z.object({ id: z.string() }))
  .action(async ({ parsedInput }) => {
    const user = await getUserById(parsedInput.id); // throws NotFoundError
    // next-safe-action catches it via handleServerError → returns serverError string
  });
```

---

## Step 11 — Logging Integration Preview

When `SETUP_ERROR_LOGGING.md` is implemented, the `reportError()` function will
use this hierarchy to set the correct log level:

```ts
// src/shared/lib/error-reporter/error-reporter.ts  (future)

import { isAppError, isOperationalError } from "@/shared/lib/errors";

export function reportError(error: unknown, context: ErrorContext = {}): void {
  const isOp = isOperationalError(error);
  const err = error instanceof Error ? error : new Error(String(error));

  if (isOp) {
    // Expected business failure — warn level, no stack trace
    errorLogger.warn(
      { code: (error as AppError).code, digest: context.digest },
      err.message,
    );
  } else {
    // System failure — error level, full stack
    errorLogger.error(
      {
        code: isAppError(error) ? error.code : "UNKNOWN",
        digest: context.digest,
        stack: err.stack,
      },
      err.message,
    );
  }
}
```

---

## Directory Structure

```text
src/
  shared/
    lib/
      errors/
        app-error.ts              ← AppError base class + SerializedError type
        domain-error.ts           ← ValidationError, NotFoundError, ConflictError,
        │                            AuthorizationError, BusinessRuleError
        authentication-error.ts   ← AuthenticationError, SessionExpiredError
        infrastructure-error.ts   ← DatabaseError, ExternalServiceError
        index.ts                  ← barrel export
      safe-action/
        safe-action.ts            ← updated: handleServerError using AppError
  modules/
    <feature>/
      lib/
        errors.ts                 ← feature-specific error codes registry
```

---

## Testing Error Classes

```ts
// src/shared/lib/errors/domain-error.test.ts
import { describe, expect, it } from "vitest";
import { z } from "zod";

import {
  ValidationError,
  NotFoundError,
  ConflictError,
  AuthorizationError,
} from "./domain-error";
import { isAppError, isOperationalError } from "./app-error";

describe("NotFoundError", () => {
  it("has correct statusCode and code", () => {
    const err = new NotFoundError("User", 42);
    expect(err.statusCode).toBe(404);
    expect(err.code).toBe("NOT_FOUND");
    expect(err.message).toBe('User with id "42" not found');
    expect(err.isOperational).toBe(true);
  });

  it("accepts a custom code", () => {
    const err = new NotFoundError("User", 1, "USER_NOT_FOUND");
    expect(err.code).toBe("USER_NOT_FOUND");
  });

  it("serializes cleanly", () => {
    const json = new NotFoundError("Order", "abc-123").toJSON();
    expect(json).toMatchObject({
      name: "NotFoundError",
      statusCode: 404,
      isOperational: true,
    });
    expect(json).not.toHaveProperty("stack");
  });
});

describe("ValidationError", () => {
  it("builds from ZodError", () => {
    const schema = z.object({ email: z.string().email(), age: z.number().min(0) });
    const result = schema.safeParse({ email: "not-an-email", age: -1 });

    expect(result.success).toBe(false);
    if (!result.success) {
      const err = ValidationError.fromZodError(result.error);
      expect(err.statusCode).toBe(422);
      expect(err.fieldErrors).toHaveProperty("email");
      expect(err.fieldErrors).toHaveProperty("age");
    }
  });
});

describe("isOperationalError", () => {
  it("returns true for domain errors", () => {
    expect(isOperationalError(new NotFoundError("X"))).toBe(true);
    expect(isOperationalError(new ConflictError("dup"))).toBe(true);
    expect(isOperationalError(new AuthorizationError())).toBe(true);
  });

  it("returns false for plain errors", () => {
    expect(isOperationalError(new Error("oops"))).toBe(false);
    expect(isOperationalError("string error")).toBe(false);
    expect(isOperationalError(null)).toBe(false);
  });
});
```

---

## Quick Reference

```ts
// Throw a 404
throw new NotFoundError("User", userId, "USER_NOT_FOUND");

// Throw a 409 duplicate
throw new ConflictError("Email is already registered", "USER_EMAIL_DUPLICATE");

// Throw a 403
throw new AuthorizationError("Only admins can delete posts", "ADMIN_REQUIRED");

// Throw a 401
throw new SessionExpiredError();

// Throw a 422 from Zod
throw ValidationError.fromZodError(zodError, "CREATE_USER_VALIDATION");

// Throw a 422 business rule
throw new BusinessRuleError("Order cannot be cancelled after shipment", "ORDER_NOT_CANCELLABLE");

// Check in catch
if (err instanceof NotFoundError) { ... }
if (isOperationalError(err)) { ... }   // show err.message to user
if (!isOperationalError(err)) { ... }  // system failure — show generic message
```
