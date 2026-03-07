# Schemas Style Guide

This guide defines how to write and organize Zod schemas inside:

- `src/shared/schemas`
- `src/modules/<module-name>/schemas`

Only schemas that are true domain models may live in:

- `src/shared/schemas/models/**`

## 1. Decide what kind of schema you are writing

Classify each schema by its role before choosing a folder.

### Model schema

A model schema describes what a domain entity **is**.

Good model characteristics:

- represents a stable business/domain concept
- reusable across multiple features or flows
- owns a model type derived from the schema
- is not tied to one request, form, action, or page

Examples:

- `User`
- `Organization`
- `Invoice`

### Validation schema

A validation schema describes what one operation **accepts or returns**.

Good validation-schema characteristics:

- validates form input
- validates action payloads
- validates search params
- validates route params
- validates one request/response shape
- validates internal utility or reporting payloads

Examples:

- `create-user-input`
- `update-profile-input`
- `report-error`
- `search-users-query`

Rule of thumb:

- If the schema answers “what is this entity?”, it is a model schema.
- If the schema answers “what does this operation validate?”, it is a validation schema.

## 2. Folder placement rules

### `src/shared/schemas/models/**`

Use this folder only for shared domain-model schemas.

A schema belongs here only when all of the following are true:

- it represents a real domain entity
- it is reusable beyond one module or operation
- it should be the canonical shared definition of that model

Good:

- `src/shared/schemas/models/user/`
- `src/shared/schemas/models/organization/`

Avoid:

- `src/shared/schemas/models/create-user-input/`
- `src/shared/schemas/models/report-error/`
- `src/shared/schemas/models/search-users-query/`

### `src/shared/schemas/**`

Use shared non-model schemas for cross-cutting validation that is not a domain model.

Good fits:

- shared payload validation
- shared error/reporting schemas
- shared query/filter schemas
- shared infrastructure or platform-related schemas

Example:

- `src/shared/schemas/report-error/`

### `src/modules/<module-name>/schemas/**`

Use module schemas when the schema is owned by one feature module.

Good fits:

- form input for one module
- one module's filters or query params
- action payloads owned by one module
- module-specific response normalization schemas

Examples:

- `src/modules/users/schemas/create-user-input/`
- `src/modules/orders/schemas/order-filters/`

## 3. Model schemas must stay shared

If a schema is considered a model, it should live in `src/shared/schemas/models/**`.

Do not create model schemas inside `src/modules/<module-name>/schemas`.

Reason:

- domain models are shared concepts, not feature-local contracts
- the canonical model definition should exist in one place
- this prevents the same entity from being modeled differently across modules

If a module needs a narrowed or operation-specific shape based on a model, create a separate module schema for that operation instead of redefining the model there.

## 4. Recommended folder structure

### Shared model schema

Use a dedicated folder per model:

```txt
src/shared/schemas/models/user/
├── user.schema.ts
├── types.ts
└── index.ts
```

Recommended contents:

- `user.schema.ts` for the Zod schema
- `types.ts` for schema-derived model types
- `index.ts` for the public API of that model folder

### Shared non-model schema

Shared validation schemas should also always live in their own folder:

```txt
src/shared/schemas/report-error/
├── report-error.schema.ts
├── types.ts
└── index.ts
```

### Module schema

Use module-owned schema folders under the module:

```txt
src/modules/users/schemas/create-user-input/
├── create-user-input.schema.ts
├── types.ts
└── index.ts
```

## 5. Naming

Use role-based names that explain what the schema validates.

### Model schema naming

- folder name: domain noun in kebab-case
- schema file: `<model>.schema.ts`
- schema constant: `<model>Schema`
- inferred model type: singular PascalCase noun

Example:

```ts
export const userSchema = z.object({
  email: z.email(),
  id: z.uuid(),
  name: z.string().min(1),
});
```

```ts
export type User = z.infer<typeof userSchema>;
```

### Validation schema naming

- include the operation or boundary in the name
- make the purpose obvious from the file path alone

Prefer:

- `create-user-input.schema.ts`
- `update-profile-input.schema.ts`
- `user-search-query.schema.ts`
- `report-error.schema.ts`

Avoid:

- `user.schema.ts` for a form input schema
- `common.schema.ts`
- `data.schema.ts`
- `validation.schema.ts`

## 6. Zod is the source of truth for schema-owned types

When a type is owned by a schema, derive it from the schema instead of rewriting the shape manually.

Good:

```ts
import { z } from "zod";

export const userSchema = z.object({
  email: z.email(),
  id: z.uuid(),
  name: z.string().min(1),
});
```

```ts
import { z } from "zod";

import { userSchema } from "./user.schema";

export type User = z.infer<typeof userSchema>;
```

Why:

- schema and type cannot drift
- runtime validation and TypeScript stay aligned
- ownership stays clear

Do not handwrite an `interface User` beside `userSchema` unless there is a strong reason the type must diverge from the schema.

## 7. Relationship to types rules

These rules complement the types rules:

- use `interface` for handwritten object contracts such as props, options, and state
- use schema-derived `type` aliases for schema-owned model or validation shapes when using `z.infer`
- keep schema-owned types with the schema that owns them

In short:

- handwritten contract -> follow the types rules
- schema-owned contract -> schema is the source of truth

## 8. Imports and exports

Keep each schema folder's public API focused.

### Good model export

```ts
// src/shared/schemas/models/user/index.ts
export { userSchema } from "./user.schema";
export type { User } from "./types";
```

### Good module schema export

```ts
// src/modules/users/schemas/create-user-input/index.ts
export { createUserInputSchema } from "./create-user-input.schema";
export type { CreateUserInput } from "./types";
```

Rules:

- export only what the folder owns
- use `export type` for type-only exports
- do not create a top-level `src/shared/schemas/index.ts`
- do not create a top-level `src/modules/<module-name>/schemas/index.ts` unless module conventions explicitly require it later

## 9. Anti-patterns

Avoid:

- placing non-model validation schemas in `src/shared/schemas/models/**`
- creating module-local model schemas
- hand-copying a schema shape into a separate manual type when `z.infer` should own it
- using generic names like `common.schema.ts` or `data.schema.ts`
- mixing multiple unrelated schemas in one file

## 10. Review checklist

Before adding a schema, check:

- Is this a domain model or an operation-specific validation schema?
- If it is a model, does it live in `src/shared/schemas/models/**`?
- If it is not a model, would `src/shared/schemas/**` or `src/modules/<module-name>/schemas/**` be clearer?
- Is the file name explicit about the schema's role?
- Should the type be derived with `z.infer<typeof schema>`?
- Is the schema colocated with its owned derived types and exports?
