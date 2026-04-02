---
applyTo: "**/*.ts,**/*.tsx"
---
# TypeScript Conventions

## Type Organization

- Types go in `types.ts` files, not inline
- Never use inline param type literals; always extract to `types.ts` (create `types.ts` if missing)
- Export types from the folder's `index.ts`
- Use `type` for object shapes, `interface` for extendable contracts

## Naming

```typescript
// Types: PascalCase with descriptive suffix
type UserFormProps = { ... };
type CreateUserInput = { ... };
type UserListResponse = { ... };

// Constants: SCREAMING_SNAKE_CASE
const MAX_RETRY_COUNT = 3;
const API_BASE_URL = '/api/v1';

// Functions: camelCase, prefer function declaration
function createUser() { ... }

// Arrow function only for callback/anonymous contexts
items.map((item) => item.id);
```

## Imports

```typescript
// Correct: @/ alias for cross-folder
import { User } from '@/shared/entities/user';
import { db } from '@/shared/db';

// Correct: ./ for same folder
import { UserFormProps } from './types';
import { validateEmail } from './helpers';
import type { ChangeEvent } from 'react';

// Wrong: ../ relative
import { User } from '../../../shared/entities/user';
```

## React Event Types

- Prefer `import type { ChangeEvent } from "react"`
- Avoid `React.ChangeEvent<...>` namespace form

## Zod Schemas

```typescript
// In schemas/ folder
import { z } from 'zod';

export const createUserSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
```

## Effect Types

```typescript
// Services return Effect
import { Effect } from 'effect';

export const createUser = (
  input: CreateUserInput
): Effect.Effect<User, CreateUserError, UserRepository> => {
  // ...
};
```

## Forbidden Patterns

- `any` type (use `unknown` or proper typing)
- Type assertions without validation
- Inline type definitions in function params
- Generic `utils.ts` or `helpers.ts` files
- Named arrow function as default style when `function` syntax is suitable
- Deprecated APIs (including deprecated Zod APIs)

## State Rule

- Do not use `useState`
- If local component state is needed, use a single object-based `useImmer({ ... })` store
- Avoid multiple local state stores within one component

## Zero Tolerance Policy (HARD Rules)

See [AGENTS.md](../../AGENTS.md) for full policy. Summary:

### No `any` Type — No Exceptions

```typescript
// FORBIDDEN
const offset = value as any;
function process(data: any) { ... }

// CORRECT - import from library
import type { UseScrollOptions } from "motion/react";
type ScrollOffset = UseScrollOptions["offset"];

// CORRECT - use unknown + type guard
function process(data: unknown) {
  if (isValidData(data)) { ... }
}
```

### No eslint-disable as First Resort

Fix the root cause. If truly needed, add file pattern to `eslint.config.mjs`.

### No Type Assertions That Break Lint

```typescript
// WRONG - breaks section-order lint
const ref = useRef(null) as React.RefObject<HTMLElement>;

// CORRECT
const ref = useRef<HTMLElement | null>(null);
```

### Signature Change Protocol

1. `grep -rn "functionName(" src/` — find all usages
2. Update all callers in same commit
3. Run: `npm run lint && npm run check-types && npm test`
