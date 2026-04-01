---
name: nextjs-server-actions
description: This skill should be used when creating server actions, mutations, or form actions. Guides next-safe-action + Zod patterns for type-safe server mutations.
---

# Next.js Server Actions

Use this skill when creating server actions for mutations, form handling, or server-side operations.

## Reference

- .claude/workflow-profile.json (stack.serverActions, stack.validation)
- src/shared/lib/safe-action.ts (action client configuration)

## next-safe-action Setup

### Action Client Configuration

```typescript
// src/shared/lib/safe-action.ts
import { createSafeActionClient } from 'next-safe-action';
import { logger } from './logger';

export const actionClient = createSafeActionClient({
  handleReturnedServerError(e) {
    logger.error({ err: e }, 'Server action error');
    return 'An unexpected error occurred';
  },
});

// Authenticated action client
export const authActionClient = actionClient.use(async ({ next }) => {
  const session = await getSession();
  if (!session) {
    throw new Error('Unauthorized');
  }
  return next({ ctx: { session } });
});
```

## Creating Server Actions

### Basic Action

```typescript
// src/modules/users/actions/createUser.ts
'use server';

import { z } from 'zod';
import { actionClient } from '@/shared/lib/safe-action';
import { revalidatePath } from 'next/cache';

const createUserSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  role: z.enum(['admin', 'user']),
});

export const createUser = actionClient
  .schema(createUserSchema)
  .action(async ({ parsedInput }) => {
    const { name, email, role } = parsedInput;

    const user = await db.user.create({
      data: { name, email, role },
    });

    revalidatePath('/users');

    return { success: true, user };
  });
```

### Action with Context (Authenticated)

```typescript
// src/modules/users/actions/updateProfile.ts
'use server';

import { z } from 'zod';
import { authActionClient } from '@/shared/lib/safe-action';

const updateProfileSchema = z.object({
  name: z.string().min(1),
  bio: z.string().optional(),
});

export const updateProfile = authActionClient
  .schema(updateProfileSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { session } = ctx;

    const user = await db.user.update({
      where: { id: session.userId },
      data: parsedInput,
    });

    return { success: true, user };
  });
```

### Action with Metadata

```typescript
// src/modules/posts/actions/publishPost.ts
'use server';

import { z } from 'zod';
import { authActionClient } from '@/shared/lib/safe-action';

const publishPostSchema = z.object({
  postId: z.string().uuid(),
});

export const publishPost = authActionClient
  .metadata({ actionName: 'publishPost' })
  .schema(publishPostSchema)
  .action(async ({ parsedInput, ctx }) => {
    // Action implementation
  });
```

## Using Actions in Components

### With useAction Hook

```tsx
// src/modules/users/containers/CreateUserContainer.tsx
'use client';

import { useAction } from 'next-safe-action/hooks';
import { createUser } from '../actions/createUser';
import { CreateUserForm } from '../components/CreateUserForm';

export function CreateUserContainer() {
  const { execute, result, status, reset } = useAction(createUser, {
    onSuccess: ({ data }) => {
      toast.success('User created!');
      reset();
    },
    onError: ({ error }) => {
      toast.error(error.serverError || 'Failed to create user');
    },
  });

  return (
    <CreateUserForm
      onSubmit={(data) => execute(data)}
      isLoading={status === 'executing'}
      errors={result.validationErrors}
    />
  );
}
```

### With useOptimisticAction

```tsx
'use client';

import { useOptimisticAction } from 'next-safe-action/hooks';
import { toggleLike } from '../actions/toggleLike';

export function LikeButton({ postId, initialLiked }) {
  const { execute, optimisticState } = useOptimisticAction(toggleLike, {
    currentState: { liked: initialLiked },
    updateFn: (state) => ({ liked: !state.liked }),
  });

  return (
    <Button onClick={() => execute({ postId })}>
      {optimisticState.liked ? 'Unlike' : 'Like'}
    </Button>
  );
}
```

### With Form Action

```tsx
// Direct form action usage
'use client';

import { useFormState } from 'react-dom';
import { createUser } from '../actions/createUser';

export function UserForm() {
  const [state, formAction] = useFormState(createUser, null);

  return (
    <form action={formAction}>
      <input name="name" />
      <input name="email" type="email" />
      {state?.validationErrors && (
        <div>{JSON.stringify(state.validationErrors)}</div>
      )}
      <button type="submit">Create</button>
    </form>
  );
}
```

## Error Handling

### Action-Level Error Handling

```typescript
export const riskyAction = actionClient
  .schema(schema)
  .action(async ({ parsedInput }) => {
    try {
      // Risky operation
      return { success: true };
    } catch (error) {
      if (error instanceof UniqueConstraintError) {
        return { success: false, error: 'Already exists' };
      }
      throw error; // Re-throw for global handler
    }
  });
```

### Client-Side Error Handling

```tsx
const { execute, result } = useAction(riskyAction, {
  onError: ({ error }) => {
    if (error.validationErrors) {
      // Handle validation errors
    } else if (error.serverError) {
      // Handle server errors
    }
  },
});
```

## Patterns

### Revalidation

```typescript
import { revalidatePath, revalidateTag } from 'next/cache';

// Revalidate specific path
revalidatePath('/users');

// Revalidate tagged cache
revalidateTag('users');

// Revalidate layout
revalidatePath('/dashboard', 'layout');
```

### Redirect After Action

```typescript
import { redirect } from 'next/navigation';

export const createAndRedirect = actionClient
  .schema(schema)
  .action(async ({ parsedInput }) => {
    const item = await create(parsedInput);
    redirect(`/items/${item.id}`);
  });
```

## Do Not

- Create server actions without Zod validation
- Use server actions for read operations — use Server Components instead
- Skip error handling — always handle both validation and server errors
- Forget to revalidate cache after mutations
