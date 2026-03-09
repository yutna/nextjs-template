---
applyTo: "src/**/schemas/**,src/**/types/**"
---

# Schemas and Types

## Schemas — overview

Schemas are Zod validation contracts. Classify each schema before placing it:

- **Model schema** — describes what a domain entity *is* (e.g. `User`, `Organization`).
  Must live in `src/shared/schemas/models/`.
- **Validation schema** — describes what one operation *accepts*
  (e.g. `create-user-input`, `report-error`).
  Lives in `src/shared/schemas/` or `src/modules/<module>/schemas/`.

## Schema folder structure

Schemas must always live in their own leaf folder with `index.ts`.
Do **not** place standalone `.schema.ts` files directly in the `schemas/`
directory — every schema gets a folder.

```text
src/shared/schemas/models/user/
├── user.schema.ts
├── types.ts
└── index.ts

src/modules/users/schemas/create-user-input/
├── create-user-input.schema.ts
├── types.ts
└── index.ts
```

- One schema per folder
- File suffix: `.schema.ts`
- Schema constant: `camelCase` + `Schema` (e.g. `userSchema`)
- Derive types from schemas with `z.infer<typeof schema>` — do not hand-duplicate
- `types.ts` must exist with the inferred type(s)

## Schema naming

- Model schemas: domain noun (`user.schema.ts`)
- Validation schemas: include operation (`create-user-input.schema.ts`)
- Avoid generic names: `common.schema.ts`, `data.schema.ts`

## Schema exports

`index.ts` must re-export both the schema and its derived types.
Value exports come first, type exports come last.

```ts
export { createUserInputSchema } from "./create-user-input.schema";

export type { CreateUserInput } from "./types";
```

- Named exports only
- Use `export type` for type re-exports
- Never omit type re-exports when `types.ts` exists
- No top-level barrel `src/shared/schemas/index.ts`

## Types — overview

Type definitions use `interface` for object-shaped contracts and `type` for
unions, intersections, mapped types, and `z.infer` aliases.

## Type placement

1. **Colocated `types.ts`** (default) — keep in the leaf folder
   that owns the contract
2. **`src/shared/types/<name>.ts`** — only for truly cross-cutting
   contracts with no single owner

Do not move feature-local props into `src/shared/types`.

## Type conventions

- Use `import type` for type-only imports
- Use `export type` for type-only re-exports
- Suffix React props with `Props`, option objects with `Options`
- Prefer `unknown` over `any` for untrusted values
- Keep contracts minimal — no speculative fields

### Interface property order

1. Required fields (alphabetical)
2. Required functions (alphabetical)
3. Optional fields (alphabetical)
4. Optional functions (alphabetical)

Separate groups with one blank line.

```ts
export interface FetchClientOptions extends Omit<RequestInit, "body"> {
  path: string;

  body?: unknown;
  retries?: number;

  getToken?: () => string | null | undefined;
}
```

## Checklist

### Schemas

- [ ] Model vs validation schema correctly classified
- [ ] Model schemas live in `src/shared/schemas/models/`
- [ ] Schema lives in its own folder with `index.ts` (not standalone)
- [ ] `types.ts` exists with `z.infer` derived type(s)
- [ ] Types derived via `z.infer` — not hand-duplicated
- [ ] File name explicit about the schema role
- [ ] `index.ts` re-exports both schema and types
- [ ] Value exports before type exports in `index.ts`
- [ ] Named exports with `export type` for types

### Types

- [ ] Placement: colocated first, shared only when cross-cutting
- [ ] Name is specific and domain-based
- [ ] `interface` for objects, `type` for unions/inferred
- [ ] `import type` / `export type` used correctly
- [ ] Contract is minimal and explicit
