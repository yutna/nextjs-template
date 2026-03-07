# Actions Folder Style Guide

This guide defines how to write and organize server actions inside:

- `src/shared/actions`
- `src/modules/<module-name>/actions`

Use `actions/` for Next.js server actions built on the repository’s safe-action layer. These folders are the home of action definitions, not of action infrastructure.

## 1. Decide whether code belongs in `actions`

Put code in an `actions` folder when it does one or more of the following:

- defines a server action
- exposes a mutation or server-side command for UI or server consumers
- validates action input before executing server-side behavior
- represents an application action boundary rather than a reusable service helper

Examples:

- submit form actions
- profile update actions
- checkout submit actions
- error reporting actions

Do **not** put code in `actions` when it belongs somewhere more specific:

- `lib/` for safe-action setup, integrations, and reusable service boundaries
- `schemas/` for validation contracts
- `hooks/` for client logic
- `containers/` for binding actions to UI
- `components/` for presenter rendering

Rule of thumb:

- if the file defines a callable server action boundary, `actions/` is usually correct
- if the file mainly supports actions rather than being an action itself, it likely belongs elsewhere

## 2. Server actions only

Action implementation files should be server actions.

Required direction:

```ts
"use server";
```

Use `"use server";` at the top of the main action implementation file.

Do not put client components, client hooks, or browser-only logic in an action file.

If a flow needs client interaction:

- keep the action in `actions/`
- consume it from a container, hook, or screen
- keep the client logic outside the action definition

## 3. Use the repository safe-action clients

This repository uses `next-safe-action` through shared wrappers in `@/shared/lib/safe-action`.

Use:

- `actionClient` as the default action client
- `authActionClient` when the action requires authenticated context

Good direction:

```ts
"use server";

import { actionClient } from "@/shared/lib/safe-action";
import { updateProfileSchema } from "@/shared/schemas/update-profile.schema";

export const updateProfileAction = actionClient
  .inputSchema(updateProfileSchema)
  .action(async ({ parsedInput }) => {
    // ...
  });
```

Authenticated direction:

```ts
"use server";

import { authActionClient } from "@/shared/lib/safe-action";

export const submitPrivateAction = authActionClient.action(async () => {
  // ...
});
```

Do not recreate safe-action clients inside `actions/`. That infrastructure belongs in `shared/lib/safe-action`.

## 4. Scope and placement

Choose the narrowest valid scope first.

### `src/modules/<module-name>/actions`

Prefer module-level actions when the mutation or command is owned by one feature module.

Good fits:

- checkout submit action
- profile update action
- order cancel action
- feature-local draft save action

Examples:

- `src/modules/checkout/actions/submit-checkout-action/`
- `src/modules/profile/actions/update-profile-action/`

### `src/shared/actions`

Promote an action to shared only when it is truly cross-module or app-wide.

Good fits:

- shared error reporting action
- app-wide telemetry action
- shared support or feedback action used by unrelated modules

Examples:

- `src/shared/actions/report-error-action/`

Avoid moving feature-owned actions into `shared` too early. Promote only when:

- multiple unrelated modules need the same action
- the action’s language is generic rather than feature-specific
- shared ownership is clearer than module ownership

## 5. Keep actions focused

An action should define one clear server-side command boundary.

Prefer:

- one action concern per folder
- explicit input schema usage
- calling reusable lib functions from inside the action
- returning a clear, intentional result shape

Avoid:

- large service orchestration embedded directly in the action
- multiple unrelated actions in one folder
- skipping input validation when a schema should exist
- hiding action behavior across many unclear helper layers

Good action behavior:

- validate input
- call domain or infrastructure helpers
- return an intentional result
- surface failures through the repository’s action/error patterns

If the action starts becoming a service layer, extract the reusable logic into `lib/` and keep the action as the thin boundary.

## 6. File and folder structure

Follow the repository's kebab-case convention for files and folders.

Each public action should live in its own leaf folder:

```txt
src/shared/actions/report-error-action/
├── index.ts
├── report-error-action.test.ts
└── report-error-action.ts

src/modules/profile/actions/update-profile-action/
├── index.ts
├── types.ts
├── update-profile-action.test.ts
└── update-profile-action.ts
```

Rules:

- keep one public action per folder
- name the folder and main implementation file the same
- add a leaf-level `index.ts` for the public API
- colocate `types.ts` only when the action folder owns reusable contracts
- keep tests adjacent to the action they cover
- do not create parent barrel files for `src/shared/actions` or `src/modules/<module-name>/actions`

If an action needs helper code:

- keep tiny action-specific helpers inside the folder only when they are private and truly local
- move reusable helpers to `lib/`, `utils/`, or `schemas/` as appropriate

## 7. Naming

Use specific kebab-case folder and file names:

- `report-error-action`
- `update-profile-action`
- `submit-checkout-action`
- `cancel-order-action`

Avoid vague names such as:

- `action`
- `server-action`
- `common-action`
- `submit`
- `handler`

For exported symbols:

- use camelCase names ending with `Action`
- derive the name from the domain command

Examples:

- `reportErrorAction`
- `updateProfileAction`
- `submitCheckoutAction`
- `cancelOrderAction`

## 8. Inputs, schemas, and return shape

Prefer explicit input schemas for action contracts.

Good direction:

- define the validation schema in `schemas/`
- import the schema into the action
- use `.inputSchema(...)`
- rely on `parsedInput` inside the action body

Example:

```ts
export const reportErrorAction = actionClient
  .inputSchema(reportErrorSchema)
  .action(async ({ parsedInput }) => {
    reportError(new Error(parsedInput.message));
  });
```

Prefer action outputs that are:

- small
- explicit
- shaped for the caller’s needs

Avoid large, ambiguous return objects when the caller only needs a narrow success result.

## 9. Boundaries with other folders

This guide stays focused on `actions`, so nearby layers are mentioned here only to define the boundary.

- use `actions/` for server action definitions
- use `lib/` for safe-action setup, integrations, and reusable service logic
- use `schemas/` for validation schemas
- use `containers/` to bind actions to UI
- use `hooks/` for client interaction logic around actions
- use `screens/` and `components/` to consume actions through the correct UI layers, not to define them

Recommended direction:

`action` -> `container` -> `component`

The action defines the server boundary. The container binds it into the UI flow.

## 10. Examples

### Good shared action

```ts
"use server";

import { reportError } from "@/shared/lib/error-reporter";
import { actionClient } from "@/shared/lib/safe-action";
import { reportErrorSchema } from "@/shared/schemas/report-error.schema";

export const reportErrorAction = actionClient
  .inputSchema(reportErrorSchema)
  .action(async ({ parsedInput }) => {
    reportError(new Error(parsedInput.message), {
      boundary: parsedInput.boundary,
      digest: parsedInput.digest,
      meta: parsedInput.meta,
    });
  });
```

### Good authenticated module action

```ts
"use server";

import { authActionClient } from "@/shared/lib/safe-action";
import { updateProfileSchema } from "@/modules/profile/schemas/update-profile.schema";
import { updateProfile } from "@/modules/profile/lib/update-profile";

export const updateProfileAction = authActionClient
  .inputSchema(updateProfileSchema)
  .action(async ({ parsedInput }) => {
    return updateProfile(parsedInput);
  });
```

## 11. Checklist

Before adding a file to `src/shared/actions` or `src/modules/<module-name>/actions`, check:

- is this actually a server action boundary?
- does the implementation file start with `"use server";`?
- is the scope correct: module first, shared only when truly cross-module?
- should this use `actionClient` or `authActionClient`?
- is the folder name specific and kebab-case?
- is the exported symbol a clear camelCase `*Action` name?
- should validation live in `schemas/` instead of inline?
- does reusable logic belong in `lib/` instead of inside the action body?
