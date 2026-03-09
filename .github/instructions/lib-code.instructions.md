---
applyTo: "src/**/lib/**"
---

# Lib Code

## Purpose

`lib/` is the home for reusable integrations, service boundaries, framework
wrappers, and architecture-significant code.

Good fits:

- Framework or platform API wrappers
- Service boundaries and client boundaries
- Cross-cutting application behavior (HTTP, logging, navigation, auth, errors)
- Runtime setup with architectural meaning

## What does NOT belong in lib

- `actions/` — server action definitions
- `schemas/` — Zod validation contracts
- `utils/` — small framework-light transforms, formatters, parsers, guards
- `config/` — static configuration and env setup
- `constants/` — static constants
- Component, screen, or hook folders — UI-owned behavior

Rule of thumb: if the code mainly transforms values, it belongs in `utils/`.
If it owns integration boundaries or runtime behavior, it belongs in `lib/`.

## Scope

- `src/modules/<module>/lib/` — module-specific integrations
- `src/shared/lib/` — cross-module or foundational lib code

Promote to `shared` only when multiple unrelated modules depend on the code.

## Folder structure

### Simple concern

```text
src/shared/lib/navigation/
├── navigation.ts
├── index.ts
└── types.ts
```

### Complex concern

```text
src/shared/lib/errors/
├── app-error.ts
├── index.ts
├── types.ts
├── authentication/
├── domain/
├── helpers/
└── http/
```

Rules:

- One architectural concern per folder
- Name the main file after the concern
- Leaf `index.ts` for the public API
- Tests adjacent to the code they cover
- No parent barrel files for `src/shared/lib` or `src/modules/<module>/lib`

## Naming

- Folders: kebab-case, named after the architectural role
- Noun names for instances: `logger`, `dayjs`, `actionClient`
- Verb names for operations: `fetchClient`, `reportError`
- `create*` for factories, `is*` for guards, `*Error` for error classes
- Named exports only

Avoid: `lib.ts`, `helpers.ts` as main file, `service.ts`, `manager.ts`, `base.ts`

## Public API

- Export stable entry points from `index.ts`
- Keep internal helpers private
- Use `export type` for type-only exports
- Avoid `export *`
- When a `types.ts` file exists, `index.ts` must re-export its types
- Value exports come first, type exports come last

```ts
export { fetchClient } from "./fetch-client";
export { swrFetcher } from "./swr-fetcher";

export type { FetchClientOptions } from "./types";
```

## Server boundaries

- Use `import "server-only"` when the module must never enter client bundles
- Keep side effects close to the integration boundary
- Do not import Node-only modules into browser-safe code

## Error handling

- Prefer explicit failures over silent fallback
- Wrap infrastructure failures in meaningful app errors
- Preserve original causes when rethrowing
- Reuse the existing `AppError` hierarchy

## Checklist

- [ ] Represents an integration, runtime, or architectural boundary
- [ ] Better fit than `utils/`, `actions/`, `schemas/`, or `config/`
- [ ] Scope correct: module-first, shared only when cross-cutting
- [ ] Folder named after one clear concern
- [ ] Public API is small and intentional
- [ ] `index.ts` re-exports types from `types.ts` when it exists
- [ ] Value exports before type exports in `index.ts`
- [ ] Server-only boundaries are explicit
- [ ] Types, errors, and tests handled as part of the contract
