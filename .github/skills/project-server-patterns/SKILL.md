---
name: project-server-patterns
description: >
  Project conventions for server actions and lib code.
  Use when creating, modifying, or reviewing files in
  actions/ or lib/ directories. Covers actionClient and
  authActionClient usage, inputSchema validation with Zod,
  server action structure, and lib code patterns for
  reusable integrations and service boundaries.
---

# Project Server Patterns

## Overview

This skill covers two closely related server-side layers in the repository:

- **`actions/`** — server action definitions that form the
  application command boundary
- **`lib/`** — reusable integrations, service boundaries,
  and architecture-significant code

These two layers work together to keep server-side logic clean, validated, and
well-separated from UI code.

## How Actions and Lib Relate

The recommended flow for server-side mutations is:

```text
action -> schema -> lib
```

- The **action** defines the callable server boundary using `next-safe-action`.
- The **schema** (in `schemas/`) validates the action input with Zod.
- The **lib** module contains the reusable service logic the action delegates to.

Actions are thin command boundaries. Lib code owns the heavy lifting.

## Actions: Key Rules

### Always Server-Only

Every action implementation file must start with the `"use server"` directive.
Do not place client components, hooks, or browser logic in action files.

### Use the Safe-Action Clients

This repository wraps `next-safe-action` through shared clients:

- `actionClient` — default action client for public operations
- `authActionClient` — action client for authenticated operations

Import these from `@/shared/lib/safe-action`. Do not recreate safe-action
infrastructure inside `actions/` folders.

### Basic Action Pattern

```typescript
"use server";

import { actionClient } from "@/shared/lib/safe-action";
import { reportErrorSchema } from "@/shared/schemas/report-error.schema";

export const reportErrorAction = actionClient
  .inputSchema(reportErrorSchema)
  .action(async ({ parsedInput }) => {
    // delegate to lib code
  });
```

### Authenticated Action Pattern

```typescript
"use server";

import { authActionClient } from "@/shared/lib/safe-action";
import { updateProfileSchema } from "@/modules/profile/schemas/update-profile.schema";
import { updateProfile } from "@/modules/profile/lib/update-profile";

export const updateProfileAction = authActionClient
  .inputSchema(updateProfileSchema)
  .action(async ({ parsedInput }) => {
    return updateProfile(parsedInput);
  });
```

### Scope and Placement

- **Module-level** (`src/modules/<module>/actions/`) — prefer this when the action
  belongs to one feature module.
- **Shared** (`src/shared/actions/`) — promote only when the action is truly
  cross-module or app-wide.

### Naming

- Folders: kebab-case ending with `-action` (e.g., `update-profile-action/`)
- Exports: camelCase ending with `Action` (e.g., `updateProfileAction`)

### Folder Structure

```text
src/modules/profile/actions/update-profile-action/
├── index.ts
├── types.ts
├── update-profile-action.test.ts
└── update-profile-action.ts
```

One public action per folder. No parent barrel files for `actions/` directories.

## Lib: Key Rules

### What Belongs in Lib

Code that wraps frameworks, connects to external systems, establishes runtime
behavior, or provides shared operational building blocks. Examples:

- API client wrappers (`fetcher/`)
- Error hierarchy (`errors/`)
- Safe-action setup (`safe-action/`)
- Locale-aware navigation (`navigation/`)
- Logging setup (`logger/`)

### What Does Not Belong in Lib

- Small transforms and formatters → `utils/`
- Zod validation contracts → `schemas/`
- Server actions → `actions/`
- Static configuration → `config/`
- UI-owned behavior → component/screen/hook folders

### Lib Scope and Placement

- **Module-level** (`src/modules/<module>/lib/`) — prefer this
  for module-specific integrations and service boundaries.
- **Shared** (`src/shared/lib/`) — promote only when truly
  cross-module or foundational to the application.

### Lib Folder Structure

Simple lib module:

```text
src/shared/lib/navigation/
├── index.ts
└── navigation.ts
```

Complex lib module:

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

One architectural concern per lib folder. No parent barrel files for `lib/`
directories.

### Public API Design

- Export stable entry points from the folder's `index.ts`.
- Keep internal helpers private.
- Export types separately with `export type`.
- Prefer named exports over default exports.

```typescript
export { fetchClient } from "./fetch-client";
export { swrFetcher } from "./swr-fetcher";

export type { FetchClientOptions } from "./types";
```

### Lib Naming

- Files: kebab-case describing the architectural role
  (e.g., `fetch-client.ts`)
- Exports: noun names for instances (`logger`, `actionClient`),
  verb names for operations (`fetchClient`, `reportError`),
  `create*` for factories

### Server-Only Boundaries

Use `import "server-only"` when a lib module must never enter client bundles:

- Filesystem-backed loggers
- Server-side error reporting
- Database access
- Secret-dependent integrations

## The Action → Schema → Lib Flow

This is the standard pattern for server mutations:

```text
1. Action receives the call from the UI layer
2. Action validates input via .inputSchema(schema)
3. Action delegates to a lib function with parsedInput
4. Lib function performs the actual work
5. Action returns an intentional result shape
```

### Why This Matters

- **Actions stay thin** — they are command boundaries, not service layers.
- **Schemas stay in `schemas/`** — validation is reusable and testable in isolation.
- **Lib code stays reusable** — it can be called from multiple actions or other
  server-side code.
- **Testing is clearer** — each layer can be tested independently.

## Common Mistakes

### Embedding Service Logic in Actions

If an action grows beyond validation and delegation, extract the reusable logic
into `lib/` and keep the action as the thin boundary.

### Recreating Safe-Action Infrastructure

Do not create new safe-action clients inside `actions/`. That setup belongs in
`shared/lib/safe-action`.

### Skipping Input Validation

Use `.inputSchema()` with a Zod schema. Do not validate inline or skip
validation when a schema should exist.

### Putting Small Transforms in Lib

Pure value transforms, formatters, parsers, and guards belong in `utils/`, not
`lib/`. Lib is for integration boundaries and architecture-significant code.

### Moving Module Code to Shared Too Early

Keep feature-owned actions and lib code in the module until multiple unrelated
modules genuinely need the same code.

### Swallowing Errors Silently

Both actions and lib code must surface failures clearly. Do not use empty catch
blocks or return null when the failure should be visible.

## Error Handling

### In Actions

Surface failures through the repository's action/error patterns. Return
intentional error shapes rather than swallowing exceptions.

### In Lib Code

- Validate boundary assumptions early.
- Wrap infrastructure failures in meaningful app errors.
- Preserve original causes when rethrowing.
- Reuse the existing `AppError` hierarchy.
- Catch at the boundary where you can add value.

## Testing

### Actions

- Use Vitest.
- Keep tests adjacent to the action file.
- Test the action contract: valid input, invalid input, and error cases.

### Lib Code

- Use Vitest.
- Keep tests adjacent to the implementation.
- Test the public contract and boundary behavior.
- Cover both success and failure paths.
- Mock external systems at the boundary.

## Quick Reference

```text
Server action boundary?        -> actions/
Reusable integration/service?  -> lib/
Validation contract?           -> schemas/
Small value transform?         -> utils/
Static configuration?          -> config/

Action client (public)?        -> actionClient
Action client (auth)?          -> authActionClient
Action naming (folder)?        -> kebab-case-action
Action naming (export)?        -> camelCaseAction
Lib naming (folder)?           -> kebab-case-concern
Lib naming (export)?           -> descriptiveName
```

## References

- [Action Patterns](references/action-patterns.md) — full actions folder guide
- [Lib Patterns](references/lib-patterns.md) — full lib folder guide
