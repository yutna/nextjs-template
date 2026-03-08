# Lib Folder Style Guide

This guide defines how to write and organize code inside:

- `src/shared/lib`
- `src/modules/<module-name>/lib`

Use `lib` for infrastructure-oriented, integration-oriented, and
architecture-significant code. These folders are for the parts of the app that
wrap frameworks, connect to external systems, establish runtime behavior, or
provide shared operational building blocks.

## 1. Decide Whether Code Belongs in Lib

Put code in a `lib` folder when it does one or more of the following:

- wraps a framework or platform API
- defines a reusable service boundary or client boundary
- owns cross-cutting application behavior
- centralizes integration logic for HTTP, logging, navigation, auth, or error
  handling
- performs runtime setup with architectural meaning
- provides domain-aware or infrastructure-aware helpers that are too important to
  treat as generic utilities

Examples from the current repository:

- `fetcher/` for API client behavior
- `errors/` for the app error hierarchy and error helpers
- `safe-action/` for next-safe-action setup
- `navigation/` for locale-aware navigation wrappers
- `logger/` for logging setup
- `error-reporter/` for server-side reporting
- `dayjs/` for shared date/runtime configuration

Do **not** put code in `lib` when it belongs somewhere more specific:

- `utils/` for small framework-light transforms, formatters, parsers, guards,
  and normalization helpers
- `schemas/` for Zod validation contracts
- `actions/` for server actions
- `config/` for static configuration values and env setup
- `constants/` for static constants
- component, screen, or hook folders for UI-owned behavior

Rule of thumb:

- If the code mainly transforms values, it is probably a `utils` concern.
- If the code owns integration boundaries, runtime behavior, or app
  architecture, it is probably a `lib` concern.

## 2. Scope and Placement

Choose the narrowest valid scope first.

### Module-Level Lib

Prefer module-level lib code when the integration or service boundary is owned
by one module.

Good fits:

- module-specific API clients
- module-specific orchestration around external services
- module-owned domain service helpers with architectural weight
- feature-local wrappers around shared infrastructure

Examples:

- `src/modules/billing/lib/billing-client/`
- `src/modules/orders/lib/order-sync/`

### Shared Lib

Promote lib code to `shared` only when it is truly cross-module or foundational
to the application.

Good fits:

- app-wide error abstractions
- shared fetch or logging layers
- shared navigation wrappers
- shared runtime setup used across features
- shared integration primitives that multiple modules build on

Examples:

- `src/shared/lib/errors/`
- `src/shared/lib/fetcher/`
- `src/shared/lib/logger/`

Avoid moving module-owned lib code to `shared` too early. Promote only when:

- multiple unrelated modules depend on it
- the language is generic and not feature-specific
- it represents a real shared architectural boundary

## 3. Organize by Architectural Concern

Each top-level lib folder should represent one architectural concern, not a
miscellaneous collection.

Good:

- `fetcher`
- `errors`
- `safe-action`
- `navigation`
- `error-reporter`

Avoid:

- `helpers`
- `common`
- `shared`
- `misc`
- `services`

The folder name should explain the concern from the path alone.

## 4. File and Folder Structure

Follow the project's kebab-case convention for files and folders.

### Simple Lib Module

Use a dedicated leaf folder with a narrow public API.

```text
src/shared/lib/navigation/
├── index.ts
└── navigation.ts

src/modules/billing/lib/billing-client/
├── billing-client.ts
├── index.ts
├── types.ts
└── billing-client.test.ts
```

Recommended rules:

- keep one architectural concern per lib folder
- name the main implementation file after the concern or public API
- add a leaf-level `index.ts` for that folder's public API
- keep tests adjacent to the code they cover
- use `types.ts`, `constants.ts`, or `helpers.ts` only when they materially
  improve clarity

### Complex Lib Module

Allow internal subfolders when one architectural concern naturally contains
multiple related public pieces.

```text
src/shared/lib/errors/
├── app-error.ts
├── index.ts
├── types.ts
├── authentication/
├── domain/
├── helpers/
├── http/
└── infrastructure/
```

This is appropriate only when the folder is still one cohesive boundary.

Use internal subfolders when:

- the concern contains multiple closely related concepts
- flat files would become noisy or unclear
- the public API still reads as one coherent lib module

Do **not** use subfolders to hide unrelated code under one broad bucket.

### Parent Barrels

Do not create parent barrel files for:

- `src/shared/lib`
- `src/modules/<module-name>/lib`

Keep barrel exports at the leaf level only.

## 5. Public API Design

A lib folder should expose a small, intentional public API.

- export stable entry points from the folder's `index.ts`
- keep internal helpers private unless they are part of the real contract
- export types separately with `export type`
- avoid `export *` when it weakens the boundary
- prefer named exports over default exports

Good:

```typescript
export { fetchClient } from "./fetch-client";
export { swrFetcher } from "./swr-fetcher";

export type { FetchClientOptions } from "./types";
```

Avoid:

```typescript
export * from "./constants";
export * from "./helpers";
export * from "./internal-impl";
```

Helpers and constants may exist inside a lib folder, but they are implementation
details unless they are deliberately part of the contract.

## 6. Naming

Name lib code after what architectural role it plays.

Prefer:

- `fetch-client.ts`
- `auth-action-client.ts`
- `error-reporter.ts`
- `create-file-logger.ts`
- `app-error.ts`
- `business-rule-error.ts`

Avoid:

- `lib.ts`
- `helpers.ts` as the main public file
- `service.ts` without a meaningful domain
- `manager.ts`
- `base.ts`

For exported symbols:

- use noun names for stable instances or wrappers: `logger`, `dayjs`,
  `actionClient`
- use verb names for operations: `fetchClient`, `reportError`
- use `create*` for factories: `createFileLogger`
- use `is*` for guards
- use `assert*` for invariant helpers that throw
- use `*Error` for custom error classes

Names should make sense when imported from another folder.

## 7. Side Effects and Runtime Boundaries

Lib code may contain side effects when those side effects are the point of the
abstraction, but keep them explicit and contained.

Good examples:

- configuring a shared runtime instance such as `dayjs`
- creating a logging client once
- wrapping server-only integrations

Rules:

- keep side effects close to the integration boundary
- do not spread implicit runtime setup across unrelated files
- prefer one obvious entry point for environment-sensitive behavior
- make server-only boundaries explicit with `import "server-only"` when the
  module must never enter client bundles
- do not import Node-only modules into code that should be browser-safe

Use `import "server-only"` for modules such as:

- filesystem-backed loggers
- server-side error reporting
- database access
- secret-dependent integrations

If a lib concern must support both server and client environments:

- keep the shared contract small
- isolate environment-specific branches near the boundary
- avoid leaking browser/server checks throughout consumers

## 8. Function and Module Design

Lib code should be cohesive, explicit, and boundary-oriented.

- keep one primary responsibility per file
- separate public API, helpers, constants, and types when it improves
  readability
- prefer dependency injection through parameters or options when it clarifies
  the boundary
- avoid mixing unrelated concerns such as transport, formatting, fallback
  policy, and UI logic in one file
- keep framework-specific code wrapped inside lib instead of spreading it across
  feature code

Good:

- one file for a fetch client
- one file for error serialization
- one file for safe-action client creation

Avoid:

- a single file that both fetches data, formats it for UI, logs analytics, and
  mutates route state

## 9. TypeScript Rules

Match the repository's strict TypeScript style.

- type public parameters and return values clearly
- prefer `unknown` over `any` at boundaries with untrusted input
- use `import type` for type-only imports
- keep lib-owned object contracts in local `types.ts` when the folder owns them
- use `interface` for object-shaped public contracts such as options and metadata
  records
- use `type` for unions, inferred schema types, and other alias-friendly shapes
- avoid unsafe casts; prefer guards, assertions, and explicit normalization

Good fits for lib-local `types.ts`:

- client options
- logger metadata
- serialized error shapes
- module-specific integration contracts

Do not move lib-owned types into `src/shared/types` unless they become truly
cross-cutting and are no longer clearly owned by one lib folder.

## 10. Error Handling

Lib code should surface failures clearly and preserve useful context.

- prefer explicit failures over silent fallback behavior
- validate boundary assumptions early
- wrap infrastructure failures in meaningful app errors when the abstraction
  owns that responsibility
- preserve original causes when rethrowing
- include operational context that helps debugging, such as method, URL, digest,
  or boundary metadata

When the lib concern participates in application error handling, reuse the
existing `AppError` hierarchy.

Good fits:

- `FetchError` for HTTP boundary failures
- `BusinessRuleError` for rule assertions
- infrastructure-specific errors for service wrappers

Be careful with catch blocks:

- catch at the boundary where you can add value
- do not swallow errors silently
- only provide fallback behavior when it is an intentional part of the contract

A deliberate fallback can be acceptable at an infrastructure boundary, for
example switching to a simpler logger transport when the filesystem is
unavailable. If you do this, keep the behavior explicit and narrow.

## 11. Imports

- use relative imports within the same lib folder
- use the `@/*` alias for cross-folder imports
- keep dependency direction clear: consumers import from a lib folder's public
  API, not from its internals, unless they are part of the same folder
- avoid deep imports into another lib folder's internal files

Good:

```typescript
import { env } from "@/shared/config/env";
import { handleServerError } from "./helpers";
```

Avoid:

```typescript
import { someInternalHelper } from "@/shared/lib/fetcher/helpers";
```

Unless both files are part of the same owned lib boundary and the deep import is
intentionally internal.

## 12. Testing

Every non-trivial lib module should have adjacent tests.

- use Vitest
- keep tests close to the implementation
- name tests after the file they cover
- test the public contract and boundary behavior
- cover both success and failure paths
- mock external systems at the boundary instead of testing vendor internals

Typical lib tests should cover:

- happy paths
- environment-specific branches when they exist
- thrown errors and wrapped errors
- retry, fallback, or serialization behavior when applicable
- public API behavior rather than private helper details

For server-only lib code, mock server-only dependencies explicitly and test the
contract, not the platform implementation.

## 13. Example Patterns

### Good Shared Lib Concern

```text
src/shared/lib/fetcher/
├── constants.ts
├── fetch-client.ts
├── fetch-client.test.ts
├── helpers.ts
├── helpers.test.ts
├── index.ts
├── swr-fetcher.ts
├── swr-fetcher.test.ts
└── types.ts
```

Why it fits:

- one cohesive concern
- clear public entry point
- support files stay inside the boundary
- tests sit next to the behavior they validate

### Good Complex Shared Lib Concern

```text
src/shared/lib/errors/
├── app-error.ts
├── index.ts
├── types.ts
├── authentication/
├── domain/
├── helpers/
├── http/
└── infrastructure/
```

Why it fits:

- one architectural boundary
- internal segmentation reflects related error categories
- public API is still intentional through the leaf `index.ts`

### Good Module Lib Concern

```text
src/modules/orders/lib/order-sync/
├── index.ts
├── order-sync.ts
├── order-sync.test.ts
└── types.ts
```

Why it fits:

- owned by one module
- clearly not generic enough for `shared`
- architecture-significant enough to be more than a utility

## 14. Final Checklist

Before placing code in `lib`, check:

- Does it represent an integration boundary, runtime boundary, or architectural
  service?
- Is `lib` a better fit than `utils`, `actions`, `schemas`, `config`, or
  UI-owned code?
- Is the scope correct: module first, shared only when truly cross-cutting?
- Is the folder named after one clear concern?
- Is the public API small and intentional?
- Are side effects and server-only boundaries explicit?
- Are types, errors, and tests handled as part of the contract?
