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

## Schema naming

- Model schemas: domain noun (`user.schema.ts`)
- Validation schemas: include operation (`create-user-input.schema.ts`)
- Avoid generic names: `common.schema.ts`, `data.schema.ts`

## Schema exports

```ts
export { createUserInputSchema } from "./create-user-input.schema";
export type { CreateUserInput } from "./types";
```

- Named exports only
- Use `export type` for type re-exports
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

## Schema checklist

- [ ] Model vs validation schema correctly classified
- [ ] Model schemas live in `src/shared/schemas/models/`
- [ ] Types derived via `z.infer` — not hand-duplicated
- [ ] File name explicit about the schema role
- [ ] Named exports with `export type` for types

## Types checklist

- [ ] Placement: colocated first, shared only when cross-cutting
- [ ] Name is specific and domain-based
- [ ] `interface` for objects, `type` for unions/inferred
- [ ] `import type` / `export type` used correctly
- [ ] Contract is minimal and explicit
