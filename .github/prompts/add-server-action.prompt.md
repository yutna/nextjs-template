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
- `users/createUser`
- `orders/processPayment`
- `auth/resetPassword`

## Required Output

### 1. Action File

Create `src/modules/<module>/actions/<actionName>/`:

```typescript
'use server';

import { z } from 'zod';
import { actionClient } from '@/shared/lib/safe-action';
import { revalidatePath } from 'next/cache';

// Define input schema
const schema = z.object({
  // Add fields based on action requirements
});

// Define return type
type Result = {
  success: boolean;
  // Add additional return fields
};

export const actionName = actionClient
  .schema(schema)
  .action(async ({ parsedInput }): Promise<Result> => {
    // Implement action logic

    // Revalidate cache if needed
    // revalidatePath('/path');

    return { success: true };
  });
```

### 2. Update Barrel Export

Add to `src/modules/<module>/actions/index.ts`:

```typescript
export { actionName } from './action-name';
```

## Action Templates

### Create Action

```typescript
'use server';

import { z } from 'zod';
import { actionClient } from '@/shared/lib/safe-action';
import { revalidatePath } from 'next/cache';

const createUserSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  role: z.enum(['admin', 'user']).default('user'),
});

export const createUser = actionClient
  .schema(createUserSchema)
  .action(async ({ parsedInput }) => {
    // Call service layer (Effect-based)
    // const result = await Effect.runPromise(CreateUserService.execute(parsedInput));

    revalidatePath('/users');

    return { success: true };
  });
```

### Update Action (with auth)

```typescript
'use server';

import { z } from 'zod';
import { authActionClient } from '@/shared/lib/safe-action';
import { revalidatePath } from 'next/cache';

const updateUserSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
});

export const updateUser = authActionClient
  .schema(updateUserSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { id, ...data } = parsedInput;

    // Call service layer
    // ...

    revalidatePath(`/users/${id}`);
    revalidatePath('/users');

    return { success: true };
  });
```

## Client Usage Example

```tsx
'use client';

import { useAction } from 'next-safe-action/hooks';
import { createUser } from '../actions/create-user';

export function CreateUserContainer() {
  const { execute, result, status } = useAction(createUser, {
    onSuccess: ({ data }) => {
      if (data?.success) {
        toast.success('User created!');
      }
    },
    onError: ({ error }) => {
      toast.error(error.serverError || 'Failed');
    },
  });

  // ...
}
```

## Do Not

- Create actions without Zod validation
- Skip the 'use server' directive
- Forget to update barrel exports
- Create actions for read operations (use Server Components instead)
- Skip cache revalidation after mutations
