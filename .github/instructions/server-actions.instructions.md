---
applyTo: "src/**/actions/**"
---

# Server Actions

## Directive

Every action implementation file must start with `"use server";` at the top.

Do not place client components, hooks, or browser-only logic in action files.

## Action clients

Use the repository safe-action wrappers from `@/shared/lib/safe-action`:

- `actionClient` — default action client
- `authActionClient` — for actions requiring authenticated context

Do not recreate safe-action clients inside `actions/`.

## Input validation

Always define an `inputSchema` with Zod. Place the schema in
`schemas/`, import it into the action, and use `.inputSchema(...)`
so the action body receives `parsedInput`.

```ts
"use server";

import { actionClient } from "@/shared/lib/safe-action";
import {
  updateProfileSchema,
} from "@/modules/profile/schemas/update-profile-input";

export const updateProfileAction = actionClient
  .inputSchema(updateProfileSchema)
  .action(async ({ parsedInput }) => {
    return updateProfile(parsedInput);
  });
```

## Keep actions thin

- One action concern per folder
- Call reusable lib functions for business logic —
  do NOT embed service orchestration inline
- Return small, explicit result shapes
- Surface failures through the repository error patterns

## Folder structure

```text
src/modules/<module>/actions/<action-name>/
├── <action-name>.ts
├── <action-name>.test.ts
├── index.ts
└── types.ts          # only when action owns reusable contracts
```

- One public action per folder
- Folder and main file name must match
- Leaf `index.ts` for the public API
- No parent barrel files for `actions/`

## Leaf index.ts exports

When a `types.ts` file exists, `index.ts` must re-export its types.
Value exports come first, type exports come last.

```ts
export { updateProfileAction } from "./update-profile-action";

export type { UpdateProfileActionResult } from "./types";
```

## Naming

- Folders: kebab-case, suffixed with `-action` (e.g. `update-profile-action`)
- Exports: camelCase ending with `Action` (e.g. `updateProfileAction`)
- Named exports only — no default exports

## Scope

- Module-first: place in `src/modules/<module>/actions/` when owned by one feature
- Promote to `src/shared/actions/` only when truly cross-module

## Boundaries

- `actions/` — server action definitions
- `lib/` — reusable service logic called by actions
- `schemas/` — validation contracts consumed by actions
- `containers/` — binds actions to UI

## Checklist

- [ ] File starts with `"use server";`
- [ ] Uses `actionClient` or `authActionClient`
- [ ] Input validated via `.inputSchema(...)` with a Zod schema
- [ ] Folder is kebab-case and suffixed with `-action`
- [ ] Export is camelCase `*Action` named export
- [ ] Business logic lives in `lib/`, not inline
- [ ] Scope is correct: module-first, shared only when cross-module
- [ ] `index.ts` re-exports types from `types.ts` when it exists
- [ ] Value exports before type exports in `index.ts`
