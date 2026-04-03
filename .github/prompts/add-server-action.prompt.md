---
name: add-server-action
description: Add a next-safe-action server action with Zod schema validation
---

# /add-server-action

Create a new server action using next-safe-action with Zod schema validation.

## Behavioral Mode

You are in **Implementation** phase for adding server functionality.

## Prerequisites

- Module must exist in `src/modules/<module-name>/`
- Check existing actions in the module for patterns

## Input

Argument format: `<module-name>/<action-name>`

Examples:
- `users/create-user`
- `orders/process-payment`
- `auth/reset-password`

## Required Output

### 1. Action Folder

Create `src/modules/<module>/actions/<action-name>-action/` with:

- `<action-name>-action.ts`
- `types.ts` when result or payload types are non-trivial
- `<action-name>-action.test.ts`
- `index.ts` only if required for local folder consumption

Do not create `src/modules/<module>/actions/index.ts` grouping barrels.

### 2. Action Implementation Pattern

```typescript
'use server';

import { Effect } from 'effect';
import { revalidatePath } from 'next/cache';

import { actionClient } from '@/shared/lib/safe-action';
import { createUserSchema } from '@modules/users/schemas/create-user-schema';
import { createUserService } from '@modules/users/services/create-user-service';

import type { CreateUserActionResult } from './types';

export const createUserAction = actionClient
  .schema(createUserSchema)
  .action(async ({ parsedInput }): Promise<CreateUserActionResult> => {
    const result = await Effect.runPromise(createUserService(parsedInput));

    if (result.success) {
      revalidatePath('/users');
    }

    return result;
  });
```

### 3. Authenticated Action Pattern

```typescript
'use server';

import { Effect } from 'effect';
import { revalidatePath } from 'next/cache';

import { authActionClient } from '@/shared/lib/safe-action';
import { updateUserSchema } from '@modules/users/schemas/update-user-schema';
import { updateUserService } from '@modules/users/services/update-user-service';

export const updateUserAction = authActionClient
  .schema(updateUserSchema)
  .action(async ({ ctx, parsedInput }) => {
    const result = await Effect.runPromise(
      updateUserService({
        actorId: ctx.session.userId,
        input: parsedInput,
      }),
    );

    if (result.success) {
      revalidatePath(`/users/${parsedInput.id}`);
      revalidatePath('/users');
    }

    return result;
  });
```

## Client Usage Example

```tsx
'use client';

import { useAction } from 'next-safe-action/hooks';
import { createUserAction } from '@modules/users/actions/create-user-action';

export function CreateUserContainer() {
  const { execute, result, status } = useAction(createUserAction, {
    onError: ({ error }) => {
      toast.error(error.serverError || 'Failed');
    },
    onSuccess: ({ data }) => {
      if (data?.success) {
        toast.success('User created!');
      }
    },
  });

  // Bind execute to your form or event handlers here.
}
```

## Do Not

- Create actions without Zod validation
- Skip the 'use server' directive
- Create grouping-folder barrels such as `actions/index.ts`
- Call the database directly from the action instead of delegating to the service layer
- Create actions for read operations (use Server Components instead)
- Skip cache revalidation after mutations
