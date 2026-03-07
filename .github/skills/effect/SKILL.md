---
name: effect
description: >
  Effect TypeScript library for typed error handling, async
  composition, and resilient API calls. All shared/api/ endpoint
  wrappers MUST use Effect. Actions use next-safe-action + Zod
  and call Effect.runPromise() at the boundary. Client code
  never imports Effect.
metadata:
  version: "3.14"
  source: https://effect.website/llms-full.txt
---

# Effect for this project

Effect is the **mandatory** library for typed error handling and
async composition in the `shared/api/` layer. Every API endpoint
wrapper must use Effect. This keeps error handling consistent
and composable across the entire codebase.

Effect lives **exclusively in server-side layers** —
`shared/api/`, `actions/`, and server containers. Client code
never imports Effect.

## Rules

- Every `shared/api/` wrapper **must** return an `Effect`
- Every API error **must** be typed with a `_tag` discriminant
- Actions call `Effect.runPromise()` at the boundary
- Server containers call `Effect.runPromise()` at the boundary
- Client code **never** imports or uses Effect
- Zod stays for schema validation — do not replace with
  `@effect/schema`
- next-safe-action stays for action binding — do not replace
- fetchClient stays as the HTTP infrastructure — Effect wraps it

## Integration pattern

```text
shared/api/users/get-user.ts     ← Effect.tryPromise wraps fetchClient
  ↓
modules/users/actions/            ← Effect.runPromise() boundary
  ↓
modules/users/containers/         ← normal async component
  ↓
modules/users/components/         ← normal React (no Effect)
```

## Standard API wrapper pattern

Every file in `shared/api/` follows this structure:

```ts
// shared/api/users/get-user.ts
import { Effect } from "effect"

import { fetchClient, FetchError } from "@/shared/lib/fetcher"

import type { User } from "@/modules/users/types"

class UserNotFoundError {
  readonly _tag = "UserNotFoundError"
  constructor(readonly id: string) {}
}

class UserApiError {
  readonly _tag = "UserApiError"
  constructor(readonly cause: unknown) {}
}

export const getUser = (id: string) =>
  Effect.tryPromise({
    try: () =>
      fetchClient<User>({ path: `/users/${id}` }),
    catch: (error) =>
      error instanceof FetchError && error.isNotFound()
        ? new UserNotFoundError(id)
        : new UserApiError(error),
  })
```

Rules for API wrappers:

- one exported function per file
- typed error classes with `readonly _tag` discriminant
- use `Effect.tryPromise` to wrap `fetchClient` calls
- map `FetchError` subtypes to domain-specific errors
- error classes live in the same file or a sibling
  `errors.ts` when shared across multiple endpoints

## Standard action boundary pattern

Actions use next-safe-action + Zod for binding and validation,
then call `Effect.runPromise()` to execute the Effect:

```ts
// modules/users/actions/update-user-action.ts
"use server";

import { Effect } from "effect"

import { getUser } from "@/shared/api/users/get-user"
import { updateUser } from "@/shared/api/users/update-user"
import { updateUserSchema } from "@/modules/users/schemas/update-user-input"
import { authActionClient } from "@/shared/lib/safe-action"

export const updateUserAction = authActionClient
  .schema(updateUserSchema)
  .action(async ({ parsedInput }) => {
    return Effect.runPromise(
      getUser(parsedInput.id).pipe(
        Effect.flatMap(() =>
          updateUser(parsedInput.id, parsedInput)
        )
      )
    )
  })
```

## Standard server container pattern

Server containers call `Effect.runPromise()` directly:

```tsx
// modules/users/containers/container-user-list.tsx
import "server-only"

import { Effect } from "effect"

import { getUsers } from "@/shared/api/users/get-users"
import { UserList } from "@/modules/users/components/user-list"

export async function ContainerUserList() {
  const users = await Effect.runPromise(
    getUsers().pipe(
      Effect.retry({ times: 2 }),
      Effect.catchAll(() => Effect.succeed([])),
    )
  )

  return <UserList users={users} />
}
```

## Standard parallel data fetching pattern

```tsx
import { Effect } from "effect"

const data = await Effect.runPromise(
  Effect.all({
    user: getUser(id),
    orders: getOrders(id).pipe(
      Effect.catchAll(() => Effect.succeed([]))
    ),
    stats: getUserStats(id).pipe(
      Effect.catchAll(() => Effect.succeed(null))
    ),
  }, { concurrency: "unbounded" })
)
```

## Key concepts

- **`Effect.tryPromise`** — wraps a Promise into an Effect with
  typed error handling
- **`Effect.gen`** — generator syntax for sequential composition
  (like async/await but typed)
- **`Effect.pipe`** — functional composition chain
- **`Effect.retry`** — declarative retry with configurable policy
- **`Effect.catchAll`** / **`Effect.catchTag`** — typed error
  recovery
- **`Effect.all`** — parallel or sequential composition of
  multiple effects
- **`Effect.runPromise`** — THE boundary function; unwraps Effect
  back to Promise for the rest of the app

## Stack integration

| Concern | Tool | Role |
| --- | --- | --- |
| Schema validation | Zod | Stays — validates action input |
| Action binding | next-safe-action | Stays — server action framework |
| HTTP infrastructure | fetchClient | Stays — low-level HTTP client |
| API wrappers | **Effect** | Mandatory — typed errors and composition |
| Error types | **Effect** | Mandatory — `_tag` discriminant errors |
| Retry and fallback | **Effect** | Mandatory — composable policies |
| Logging | Pino | Stays — server-side logging |
| Client fetching | SWR | Stays — client-side data fetching |

## Layer boundaries

| Layer | Effect usage |
| --- | --- |
| `shared/api/` | **Mandatory** — all wrappers return Effect |
| `actions/` | `Effect.runPromise()` at boundary |
| `containers/` (server) | `Effect.runPromise()` at boundary |
| `shared/lib/` | Never — stays as infrastructure |
| `screens/` | Never |
| `page.tsx` | Never |
| `containers/` (client) | Never |
| `components/` | Never |
| `hooks/` | Never |

## Relationship to ts-pattern

Effect handles error matching **inside** Effect pipelines with
`catchTag` and `catchAll`. For general pattern matching **outside**
Effect pipelines (control flow, UI branching, discriminated unions),
use ts-pattern instead.

## Full reference

Complete Effect documentation (all modules, patterns, and API):

→ [references/llms-full.md](references/llms-full.md)
