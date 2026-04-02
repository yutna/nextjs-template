---
description: Add a next-safe-action server action with Zod schema validation
argument-hint: <module-name>/<action-name>
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

Create `src/modules/<module>/actions/<actionName>.ts`:

```typescript
'use server';

import { z } from 'zod';
import { actionClient } from '@/shared/lib/safe-action';
import { revalidatePath } from 'next/cache';

// Define input schema
const <actionName>Schema = z.object({
  // Add fields based on action requirements
  // Example:
  // name: z.string().min(1, 'Name is required'),
  // email: z.string().email('Invalid email'),
});

// Define return type
type <ActionName>Result = {
  success: boolean;
  // Add additional return fields
};

export const <actionName> = actionClient
  .schema(<actionName>Schema)
  .action(async ({ parsedInput }): Promise<<ActionName>Result> => {
    // Implement action logic

    // Revalidate cache if needed
    // revalidatePath('/path');

    return { success: true };
  });
```

### 2. Update Barrel Export

Add to `src/modules/<module>/actions/index.ts`:

```typescript
export { <actionName> } from './<actionName>';
```

### 3. Type Export (if needed)

If the action has complex types, add to module types:

```typescript
// src/modules/<module>/types.ts
export type { <ActionName>Input, <ActionName>Result } from './actions/<actionName>';
```

## Action Templates

### Create Action

```typescript
'use server';

import { z } from 'zod';
import { actionClient } from '@/shared/lib/safe-action';
import { revalidatePath } from 'next/cache';
import { db } from '@/shared/lib/db';

const createUserSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  role: z.enum(['admin', 'user']).default('user'),
});

export const createUser = actionClient
  .schema(createUserSchema)
  .action(async ({ parsedInput }) => {
    const user = await db.user.create({
      data: parsedInput,
    });

    revalidatePath('/users');

    return { success: true, user };
  });
```

### Update Action

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

    const user = await db.user.update({
      where: { id },
      data,
    });

    revalidatePath(`/users/${id}`);
    revalidatePath('/users');

    return { success: true, user };
  });
```

### Delete Action

```typescript
'use server';

import { z } from 'zod';
import { authActionClient } from '@/shared/lib/safe-action';
import { revalidatePath } from 'next/cache';

const deleteUserSchema = z.object({
  id: z.string().uuid(),
});

export const deleteUser = authActionClient
  .schema(deleteUserSchema)
  .action(async ({ parsedInput }) => {
    await db.user.delete({
      where: { id: parsedInput.id },
    });

    revalidatePath('/users');

    return { success: true };
  });
```

## Client Usage Example

```tsx
'use client';

import { useAction } from 'next-safe-action/hooks';
import { createUser } from '../actions/createUser';

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

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      execute({
        name: formData.get('name') as string,
        email: formData.get('email') as string,
      });
    }}>
      {/* Form fields */}
    </form>
  );
}
```

## Do Not

- Create actions without Zod validation
- Skip the 'use server' directive
- Forget to update barrel exports
- Create actions for read operations (use Server Components instead)
- Skip cache revalidation after mutations
