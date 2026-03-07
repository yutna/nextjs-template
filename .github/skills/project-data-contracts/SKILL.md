---
name: project-data-contracts
description: >
  Project conventions for Zod schemas and TypeScript
  type definitions. Use when creating, modifying, or
  reviewing files in schemas/ or types/ directories.
  Covers Zod validation contracts for action inputs,
  search params, route params, and form payloads.
  Also covers TypeScript type definitions, import type
  conventions, and narrow ownership patterns.
---

# project-data-contracts

## Overview

This skill covers the two data-contract layers in
this repository:

- **Schemas** — Zod-based validation contracts that
  define what operations accept or what domain
  entities look like at runtime.
- **Types** — TypeScript type definitions that
  describe object shapes, props, options, and other
  compile-time contracts.

Both layers follow narrow-ownership rules: code lives
in the smallest scope that owns it and is promoted to
shared only when reuse is real and cross-cutting.

## When to use this skill

Activate this skill when you are:

- Creating or modifying files in any `schemas/`
  directory
- Creating or modifying `types.ts` files or files
  in `src/shared/types/`
- Reviewing pull requests that touch validation or
  type contracts
- Deciding whether a new contract should be a Zod
  schema, a TypeScript interface, or both
- Choosing where to place a new schema or type
  definition

## Key rules

### Schema classification

Every schema must be classified before placement:

1. **Model schema** — describes what a domain entity
   *is* (e.g., `User`, `Organization`). Lives in
   `src/shared/schemas/models/`.
1. **Validation schema** — describes what one
   operation *accepts or returns* (e.g.,
   `create-user-input`, `search-users-query`). Lives
   in the owning module or in `src/shared/schemas/`
   when cross-cutting.

### Schema placement

| Kind | Location |
| --- | --- |
| Domain model | `src/shared/schemas/models/` |
| Cross-cutting | `src/shared/schemas/<name>/` |
| Module-owned | `src/modules/<mod>/schemas/` |

Model schemas must always be shared. Do not create
model schemas inside module folders.

### Type placement

| Scope | Location |
| --- | --- |
| Owned by one folder | Colocated `types.ts` |
| Cross-cutting | `src/shared/types/<name>.ts` |

Default to colocated. Promote only when multiple
unrelated areas need the same contract.

### Zod is the source of truth

When a type is owned by a schema, derive it with
`z.infer<typeof schema>` instead of writing a manual
interface. This keeps runtime validation and
TypeScript aligned.

```typescript
export const userSchema = z.object({
  email: z.email(),
  id: z.uuid(),
  name: z.string().min(1),
});
```

```typescript
export type User = z.infer<typeof userSchema>;
```

### Interface vs type alias

- Use `interface` for object-shaped public contracts
  (props, options, state, serialized shapes).
- Use `type` for unions, intersections, mapped types,
  conditional types, and function signatures.

### Property grouping order in interfaces

1. Required fields (non-function, no `?`)
1. Required functions
1. Optional fields
1. Optional functions

Sort alphabetically within each group. Separate
groups with one blank line.

### Import conventions

- Always use `import type` for type-only imports.
- Re-export types from the leaf folder's `index.ts`
  with `export type { ... }`.
- Do not create parent-level barrel files that
  aggregate unrelated types.

## Relationship between schemas and types

```text
schemas/        types.ts          shared/types/
   │               │                    │
   │ z.infer<>     │ interface/type      │ cross-cutting
   │ derives types │ handwritten         │ contracts
   │               │                    │
   └─ runtime+TS   └─ TS only           └─ TS only
```

- If the contract needs runtime validation, start
  with a Zod schema and derive the type.
- If the contract is compile-time only (props,
  options, state), use a handwritten interface in
  `types.ts`.
- If the contract is cross-cutting with no single
  owner, place it in `src/shared/types/<name>.ts`.

## Folder structure patterns

### Schema folder

```text
src/modules/users/schemas/create-user-input/
├── create-user-input.schema.ts
├── types.ts
└── index.ts
```

### Component with colocated types

```text
src/shared/components/error-boundary/
├── error-boundary.tsx
├── index.ts
└── types.ts
```

### Shared types

```text
src/shared/types/
└── next.ts
```

## Common mistakes

### Placing validation schemas in models

The `models/` folder is reserved for domain entities.
Do not put `create-user-input` or `report-error`
there.

### Moving local types to shared too early

Keep types colocated until multiple unrelated modules
need the same contract. Premature promotion increases
indirection without benefit.

### Handwriting types a schema already owns

If `userSchema` exists, do not write a separate
`interface User`. Use `z.infer<typeof userSchema>` to
keep them in sync.

### Using generic file names

Avoid `common.schema.ts`, `data.schema.ts`,
`common.ts`, or `shared.ts`. Name files after the
domain concept they validate or describe.

### Creating parent barrel files

Do not create `src/shared/schemas/index.ts` or
`src/shared/types/index.ts`. Keep exports at the leaf
folder level.

### Using any instead of unknown

This project uses strict TypeScript. Prefer `unknown`
with proper narrowing for untrusted values.

## References

- [Schema patterns](references/schema-patterns.md) —
  Full Zod schema conventions
- [Type patterns](references/type-patterns.md) —
  Full TypeScript type conventions
