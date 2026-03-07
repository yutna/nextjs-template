---
name: create-action
description: >-
  Create a server action with schema, input validation,
  and test file
agent: agent
tools: ['edit/editFiles', 'search/codebase']
argument-hint: >-
  [module-name] [action-name]
  e.g. profile update-profile
---

# Create server action

Create a server action with Zod input schema and a
matching test file.

## Input

`${input}` contains two space-separated values:

1. **module-name** — kebab-case feature module name
1. **action-name** — kebab-case action name

## File creation steps

### 1 — Schema

Create a folder at
`src/modules/${module}/schemas/${action}-input/` with:

- `${action}-input.ts` — Zod schema defining the input
- `index.ts` — barrel export

Example schema:

```typescript
import { z } from "zod";

export const updateProfileInput = z.object({
  name: z.string().min(1),
});

export type UpdateProfileInput = z.infer<
  typeof updateProfileInput
>;
```

### 2 — Action

Create a folder at
`src/modules/${module}/actions/${action}-action/` with:

- `${action}-action.ts` — the server action
- `index.ts` — barrel export

Example action:

```typescript
"use server";

import { actionClient } from "@/shared/lib/safe-action";

import { updateProfileInput } from "../../schemas/update-profile-input";

export const updateProfileAction = actionClient
  .schema(updateProfileInput)
  .action(async ({ parsedInput }) => {
    // implementation
    return { success: true };
  });
```

Use `actionClient` for public actions or
`authActionClient` for authenticated actions. Both are
exported from `@/shared/lib/safe-action`.

### 3 — Test

Create `${action}-action.test.ts` next to the action
file. Mock `"server-only"` if needed:

```typescript
vi.mock("server-only", () => ({}));
```

## Conventions

- Use `"use server"` directive at the top of action files
- Folders use **kebab-case**
- Use **named exports** for actions and schemas
- Suffix action folders with `-action`
- Suffix schema folders with `-input`
- Use `@/` alias for cross-module imports
