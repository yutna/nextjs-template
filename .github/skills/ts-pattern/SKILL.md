---
name: ts-pattern
description: >
  Exhaustive pattern matching for TypeScript. Mandatory for
  complex control flow with 3+ branches, discriminated unions,
  and nested conditionals. Replaces switch-case and long
  if/else chains. Works in all layers (server and client).
metadata:
  version: "5.9"
  source: https://github.com/gvergnaud/ts-pattern
---

# ts-pattern for this project

ts-pattern is the **mandatory** pattern matching library for all
complex branching logic in this codebase. It replaces switch-case
and long if/else chains with exhaustive, type-safe matching.

Unlike Effect (which is server-only), ts-pattern works in **every
layer** — server components, client components, actions, hooks,
containers, lib code, and utilities.

## Rules

- **Use `match().exhaustive()`** for 3+ branches or any
  discriminated union
- **Use simple if/else** for 1-2 branches — no overhead
- **Always `.exhaustive()`** — forces compile-time exhaustiveness;
  use `.otherwise()` only for truly open-ended inputs like
  `unknown` or `string`
- **Never mix** — if a function uses `match()`, all branches go
  through match, not a mix of if + match
- **Import from `ts-pattern`** — always `import { match, P }`

## When to use

Use `match()` when:

- matching on discriminated unions (`type`, `_tag`, `status`, etc.)
- replacing a switch-case with 3+ cases
- replacing nested if/else chains
- matching on complex nested object shapes
- matching on tuples (e.g. `[state, event]` pairs)
- you need exhaustiveness checking to catch missing cases

## When to keep if/else

Keep simple `if`/`else` when:

- there are only 1-2 branches
- the condition is a simple boolean check
- the logic is trivially readable without pattern matching

## Standard patterns for this project

### Discriminated union matching

The most common use case — matching on `type`, `_tag`, `status`,
or `kind` discriminants:

```ts
import { match } from "ts-pattern"

import type { ApiResponse } from "@/modules/users/types"

export function formatResponse(response: ApiResponse) {
  return match(response)
    .with({ status: "success" }, ({ data }) => data)
    .with({ status: "error" }, ({ error }) => {
      throw error
    })
    .with({ status: "loading" }, () => null)
    .exhaustive()
}
```

### Matching Effect error types

When handling errors from `shared/api/` at the boundary layer,
use ts-pattern to match on `_tag` discriminants:

```ts
import { Effect } from "effect"
import { match } from "ts-pattern"

import { getUser } from "@/shared/api/users/get-user"

const result = await Effect.runPromise(
  getUser(id).pipe(
    Effect.either
  )
)

const message = match(result)
  .with({ _tag: "Right" }, ({ right }) => right)
  .with(
    { _tag: "Left", left: { _tag: "UserNotFoundError" } },
    () => null,
  )
  .with(
    { _tag: "Left", left: { _tag: "UserApiError" } },
    ({ left }) => { throw left.cause },
  )
  .exhaustive()
```

### Component render branching

For components that render different UI based on data shape:

```tsx
import { match } from "ts-pattern"

import type { ContentBlock } from "@/modules/content/types"

interface ContentRendererProps {
  block: ContentBlock
}

export function ContentRenderer({
  block,
}: Readonly<ContentRendererProps>) {
  return match(block)
    .with({ type: "text" }, ({ content }) => (
      <Text>{content}</Text>
    ))
    .with({ type: "image" }, ({ src, alt }) => (
      <Image src={src} alt={alt} />
    ))
    .with({ type: "video" }, ({ src }) => (
      <VideoPlayer src={src} />
    ))
    .exhaustive()
}
```

### Tuple matching for state + event pairs

For reducer-like logic or state machine transitions:

```ts
import { match, P } from "ts-pattern"

import type { FormState, FormEvent } from "./types"

export function formReducer(
  state: FormState,
  event: FormEvent,
): FormState {
  return match([state, event] as const)
    .with(
      [{ status: "idle" }, { type: "submit" }],
      () => ({ status: "submitting" as const }),
    )
    .with(
      [{ status: "submitting" }, { type: "success" }],
      ([, { data }]) => ({
        status: "success" as const,
        data,
      }),
    )
    .with(
      [{ status: "submitting" }, { type: "error" }],
      ([, { error }]) => ({
        status: "error" as const,
        error,
      }),
    )
    .otherwise(() => state)
}
```

### Using `P.select` for deep extraction

Extract nested values without destructuring:

```ts
import { match, P } from "ts-pattern"

const userName = match(response)
  .with(
    {
      status: "success",
      data: { user: { name: P.select() } },
    },
    (name) => name,
  )
  .otherwise(() => "Anonymous")
```

### Using `P.when` for predicates

Add runtime conditions beyond structural matching:

```ts
import { match, P } from "ts-pattern"

const category = match(score)
  .with(P.number.gte(90), () => "excellent")
  .with(P.number.gte(70), () => "good")
  .with(P.number.gte(50), () => "average")
  .with(P.number.lt(50), () => "needs improvement")
  .exhaustive()
```

### Using `isMatching` as a type guard

For narrowing unknown data (e.g. API responses):

```ts
import { isMatching, P } from "ts-pattern"

const isUser = isMatching({
  id: P.string,
  name: P.string,
  email: P.string,
})

if (isUser(data)) {
  // data is narrowed to { id: string; name: string; email: string }
}
```

## Key API reference

- **`match(value)`** — create a pattern matching expression
- **`.with(pattern, handler)`** — add a matching case
- **`.exhaustive()`** — finalize with compile-time exhaustiveness
- **`.otherwise(handler)`** — finalize with a default fallback
- **`P._`** — wildcard, matches anything
- **`P.select()`** — extract a value into the handler
- **`P.when(predicate)`** — add a runtime predicate
- **`P.not(pattern)`** — match everything except this
- **`P.union(...patterns)`** — match any of these patterns
- **`P.string`** / **`P.number`** — type-specific wildcards
  with chainable predicates (`.startsWith()`, `.gte()`, etc.)
- **`isMatching(pattern, value)`** — type guard function

## Layer usage

| Layer | ts-pattern | Notes |
| --- | --- | --- |
| `shared/api/` | Rarely | Errors handled by Effect inside |
| `actions/` | Yes | Match on Effect results at boundary |
| `containers/` (server) | Yes | Match on data shapes for rendering |
| `containers/` (client) | Yes | Match on UI states |
| `components/` | Yes | Match on discriminated union props |
| `hooks/` | Yes | Match on state transitions |
| `shared/lib/` | Yes | Match on config or input variants |
| `schemas/` | Rarely | Zod handles validation |

## Relationship to Effect

- **ts-pattern** — general pattern matching in all layers
- **Effect `catchTag`/`catchAll`** — error handling inside
  Effect pipelines only
- **No overlap** — they serve different purposes

When consuming Effect results at the boundary, use ts-pattern
to match on the `Either` result after `Effect.runPromise` with
`Effect.either`.

## Full reference

Complete ts-pattern documentation (all patterns, API, and types):

→ [references/readme.md](references/readme.md)
