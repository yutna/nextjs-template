# Types Style Guide

This guide defines how to write and organize type definitions across the repository, including:

- `src/shared/types`
- colocated `types.ts` files in components, screens, providers, and lib modules
- shared lib type contracts such as `src/shared/lib/**/types.ts`

The goal is to keep type definitions local by default, promote them only when reuse is real, and make contracts easy to read from the file structure.

## 1. Decide where a type belongs

Choose the narrowest valid scope first.

### Colocated `types.ts`

Prefer a local `types.ts` when a leaf feature folder is the clear owner of the contract.

Allowed examples include component, screen, provider, hook, action, utils, and lib folders when that specific folder owns the contract.

This is about ownership, not limiting usage. Other files may import the type, but the type should stay colocated until it becomes truly cross-cutting and no longer has one obvious owner.

Examples:

- component props
- component state interfaces
- provider props
- module-local view models
- options for one lib module

Good fits:

- `src/shared/components/error-boundary/types.ts`
- `src/shared/providers/app-provider/types.ts`
- `src/modules/static-pages/screens/screen-welcome/types.ts`
- `src/shared/lib/fetcher/types.ts`

### `src/shared/types/<name>.ts`

Use `src/shared/types` only for cross-cutting shared contracts that are not owned by a single feature or module.

Good fits:

- framework-level contracts used in multiple places
- shared app-wide type helpers with clear ownership
- types that would otherwise create awkward cross-feature dependencies

Example:

- `src/shared/types/next.ts`

Do **not** move local props or one-module contracts into `src/shared/types` just to make them feel “organized”.

## 2. Keep types local by default

Default to colocated types and promote to shared only when:

- the same contract is used by multiple unrelated areas
- the type is conceptually cross-cutting
- the shared location improves clarity more than it increases indirection

Rule of thumb:

- If the type only exists to support one folder's public API, keep it in that folder's `types.ts`.
- If multiple features need the same contract and no single feature owns it, move it to `src/shared/types/<name>.ts`.

## 3. File and folder structure

### Colocated types

Use `types.ts` inside the leaf folder that owns the contract.

```txt
src/shared/components/error-boundary/
├── error-boundary.tsx
├── index.ts
└── types.ts

src/modules/static-pages/screens/screen-welcome/
├── index.ts
├── screen-welcome.tsx
└── types.ts
```

### Shared types

In `src/shared/types`, prefer standalone files named by domain or concern.

```txt
src/shared/types/
└── next.ts
```

Rules:

- use `types.ts` only when the types are owned by the current leaf folder
- use specific standalone names in `src/shared/types`, never generic names like `common.ts` or `shared.ts`
- do not create `src/shared/types/index.ts`
- do not create a dedicated `types/` folder inside a component or lib folder unless the existing repo convention changes

## 4. Naming

Name types after the domain concept they model.

Prefer:

- `NextErrorProps`
- `ErrorBoundaryProps`
- `FetchClientOptions`
- `SerializedError`
- `SectionDemoProps`

Avoid:

- `PropsType`
- `DataType`
- `CommonTypes`
- `SharedProps`
- `MiscOptions`

Rules:

- suffix React props with `Props`
- suffix option objects with `Options`
- use domain nouns for value shapes and contracts
- use names that still make sense when imported elsewhere

## 5. Prefer `interface` for object-shaped contracts

Use `interface` for object-like public contracts such as:

- props
- options
- state
- serialized object shapes
- metadata records with named fields

This matches the current codebase patterns:

- `NextErrorProps`
- `ErrorBoundaryProps`
- `AppProviderProps`
- `FetchClientOptions`
- `SerializedError`

Use `type` when the shape is not an object interface or when TypeScript features require it, for example:

- unions
- intersections that read better as aliases
- mapped or conditional types
- function signatures when an alias is clearer than an interface

Do not convert every shape to `type` for style consistency. Pick the form that best matches the contract.

### Property grouping order

For interface definitions in `types.ts` files, use this 4-group order:

1. **Required fields** - non-function properties without `?`
2. **Required functions** - function properties without `?`
3. **Optional fields** - non-function properties with `?`
4. **Optional functions** - function properties with `?`

Within each group:

- sort alphabetically (`a-z`, case-insensitive)
- separate groups with exactly one blank line
- do not add comments solely to label or separate groups

This is a prescriptive convention for new and updated interface definitions in `types.ts` files, even if some older files were written before the rule existed.

Good:

```ts
export interface FetchClientOptions extends Omit<RequestInit, "body"> {
  path: string;

  body?: unknown;
  retries?: number;
  retryDelay?: number;

  getToken?: () => string | null | undefined;
}
```

## 6. Imports and exports

- Use `import type` for type-only imports.
- Re-export types from the leaf folder's `index.ts` when that folder has a public API.
- Export types with `export type { ... }` from `index.ts`.
- Keep exports specific and intentional.
- Do not create catch-all barrels for unrelated shared types.

Good:

```ts
// src/shared/components/error-boundary/index.ts
export { ErrorBoundary } from "./error-boundary";
export type {
  ErrorBoundaryFallbackProps,
  ErrorBoundaryProps,
  ErrorBoundaryState,
} from "./types";
```

```ts
// src/modules/static-pages/screens/screen-welcome/index.ts
export { WelcomeScreen } from "./screen-welcome";
export type { WelcomeScreenProps } from "./types";
```

Avoid:

```ts
// Avoid parent-level aggregation of unrelated shared types
export type { NextErrorProps } from "./next";
export type { FetchClientOptions } from "@/shared/lib/fetcher/types";
export type { ErrorBoundaryProps } from "@/shared/components/error-boundary/types";
```

## 7. Keep contracts minimal and explicit

Types should be small and intentional.

- include only fields required by the contract
- prefer explicit property names over broad index signatures
- reuse existing platform types when they fit, such as `ReactNode`, `Locale`, or `RequestInit`
- compose from existing types when that improves clarity, such as `extends Omit<RequestInit, "body">`
- avoid placeholder fields or speculative extensibility

Good:

```ts
export interface WelcomeScreenProps {
  locale: Locale;
}
```

```ts
export interface FetchClientOptions extends Omit<RequestInit, "body"> {
  path: string;

  body?: unknown;
  retries?: number;
  retryDelay?: number;

  getToken?: () => string | null | undefined;
}
```

## 8. Documentation

Add JSDoc only when the contract or field semantics need explanation.

Good cases:

- framework-specific contracts
- fields with behavior expectations
- contracts that are easy to misuse without context

Examples already in the codebase:

- `src/shared/types/next.ts`
- `src/shared/lib/fetcher/types.ts`
- `src/shared/lib/errors/types.ts`

Keep documentation concise:

- document why the type exists or how a field should be used
- document tricky behavior or invariants
- do not restate obvious property names

## 9. Type safety rules

- Prefer `unknown` over `any` for untrusted values.
- Use `Record<string, unknown>` only when arbitrary keyed metadata is truly intended.
- Keep nullable and optional fields explicit.
- Do not hide weak modeling behind broad casts.
- Prefer reusing existing domain types over duplicating near-identical shapes.

Examples to emulate:

- `cause?: unknown`
- `meta?: Record<string, unknown>`
- `error: Error | null`

## 10. React-specific guidance

For React folders:

- keep component props in the component's local `types.ts`
- import `ReactNode` with `import type`
- type callback props explicitly
- keep state interfaces local unless another file genuinely shares them

Good:

```ts
import type { ReactNode } from "react";

export interface ErrorBoundaryProps {
  children: ReactNode;

  fallback?: (props: ErrorBoundaryFallbackProps) => ReactNode;
}
```

## 11. Shared lib guidance

For shared library modules:

- keep module-owned contracts in that module's `types.ts`
- colocate them with the implementation they support
- promote them to `src/shared/types` only when they stop belonging to one lib module

Good fits for lib-local `types.ts`:

- fetch client options
- serialized error shapes
- logger or reporter context contracts

## 12. Anti-patterns

Avoid:

- creating `types.ts` when a folder has only one trivial private type that can stay in the implementation file
- moving feature-local props into `src/shared/types`
- creating parent barrels for all types
- generic names like `common.ts`, `shared.ts`, or `misc.ts`
- duplicate aliases that only rename existing framework types without adding meaning

## 13. Review checklist

Before adding or moving a type, check:

- Is the placement correct: local `types.ts` first, shared only when truly cross-cutting?
- Is the name specific and domain-based?
- Should this be an `interface` or does it need `type` features?
- Are imports type-only where appropriate?
- Does the folder's `index.ts` export only its own public types?
- Is JSDoc present only where it adds meaning?
- Is the contract as small and explicit as possible?
