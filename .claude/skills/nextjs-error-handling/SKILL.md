---
name: nextjs-error-handling
description: This skill should be used when implementing error handling, error boundaries, or app error patterns. Guides error handling architecture.
---

# Next.js Error Handling

Use this skill when implementing error handling, error boundaries, or recovery patterns.

## Reference

- CLAUDE.md (workflow contract)
- src/shared/lib/errors.ts (error utilities)

## Error Hierarchy

### Custom Error Classes

```typescript
// src/shared/lib/errors.ts
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public isOperational: boolean = true
  ) {
    super(message);
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, public fields?: Record<string, string[]>) {
    super(message, 'VALIDATION_ERROR', 400);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, id?: string) {
    super(
      id ? `${resource} with id ${id} not found` : `${resource} not found`,
      'NOT_FOUND',
      404
    );
    this.name = 'NotFoundError';
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 'UNAUTHORIZED', 401);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(message, 'FORBIDDEN', 403);
    this.name = 'ForbiddenError';
  }
}
```

## Error Boundaries

### Global Error Boundary

```tsx
// src/app/[locale]/error.tsx
'use client';

import { useEffect } from 'react';
import { Button, VStack, Heading, Text, Container } from '@chakra-ui/react';
import { logger } from '@/shared/lib/logger';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    logger.error({ err: error, digest: error.digest }, 'Unhandled error');
  }, [error]);

  return (
    <Container maxW="container.md" py={20}>
      <VStack gap={6} textAlign="center">
        <Heading>Something went wrong</Heading>
        <Text color="fg.muted">
          An unexpected error occurred. Our team has been notified.
        </Text>
        {error.digest && (
          <Text fontSize="sm" color="fg.muted">
            Error ID: {error.digest}
          </Text>
        )}
        <Button onClick={reset}>Try again</Button>
      </VStack>
    </Container>
  );
}
```

### Route-Level Error Boundary

```tsx
// src/app/[locale]/dashboard/error.tsx
'use client';

import { useEffect } from 'react';
import { Alert, Button, VStack } from '@chakra-ui/react';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Dashboard error:', error);
  }, [error]);

  return (
    <VStack gap={4} p={6}>
      <Alert.Root status="error">
        <Alert.Indicator />
        <Alert.Title>Failed to load dashboard</Alert.Title>
        <Alert.Description>{error.message}</Alert.Description>
      </Alert.Root>
      <Button onClick={reset}>Retry</Button>
    </VStack>
  );
}
```

## Not Found Handling

### Global Not Found

```tsx
// src/app/[locale]/not-found.tsx
import { Container, VStack, Heading, Text, Button } from '@chakra-ui/react';
import { Link } from '@/shared/components/Link';

export default function NotFound() {
  return (
    <Container maxW="container.md" py={20}>
      <VStack gap={6} textAlign="center">
        <Heading size="4xl">404</Heading>
        <Heading size="lg">Page not found</Heading>
        <Text color="fg.muted">
          The page you're looking for doesn't exist or has been moved.
        </Text>
        <Button asChild>
          <Link href="/">Go home</Link>
        </Button>
      </VStack>
    </Container>
  );
}
```

### Triggering Not Found

```tsx
// In a Server Component
import { notFound } from 'next/navigation';

export async function UserScreen({ params }: { params: { id: string } }) {
  const user = await getUser(params.id);

  if (!user) {
    notFound();
  }

  return <UserProfile user={user} />;
}
```

## Server Action Error Handling

### With next-safe-action

```typescript
// src/shared/lib/safe-action.ts
import { createSafeActionClient } from 'next-safe-action';
import { logger } from './logger';
import { AppError, ValidationError } from './errors';

export const actionClient = createSafeActionClient({
  handleReturnedServerError(error) {
    if (error instanceof AppError && error.isOperational) {
      return error.message;
    }

    logger.error({ err: error }, 'Unhandled server action error');
    return 'An unexpected error occurred. Please try again.';
  },
  handleServerErrorLog(error) {
    logger.error({ err: error }, 'Server action error');
  },
});
```

### Action with Error Handling

```typescript
// src/modules/users/actions/createUser.ts
'use server';

import { z } from 'zod';
import { actionClient } from '@/shared/lib/safe-action';
import { ValidationError, AppError } from '@/shared/lib/errors';

const schema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
});

export const createUser = actionClient
  .schema(schema)
  .action(async ({ parsedInput }) => {
    try {
      const user = await db.user.create({
        data: parsedInput,
      });
      return { success: true, user };
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ValidationError('Email already exists', {
          email: ['This email is already registered'],
        });
      }
      throw error;
    }
  });
```

### Client-Side Error Handling

```tsx
'use client';

import { useAction } from 'next-safe-action/hooks';
import { createUser } from '../actions/createUser';
import { toaster } from '@/shared/components/Toaster';

export function CreateUserContainer() {
  const { execute, result, status } = useAction(createUser, {
    onSuccess: ({ data }) => {
      if (data?.success) {
        toaster.success('User created successfully');
      }
    },
    onError: ({ error }) => {
      if (error.validationErrors) {
        // Field-level errors handled by form
      } else if (error.serverError) {
        toaster.error(error.serverError);
      } else {
        toaster.error('An unexpected error occurred');
      }
    },
  });

  return (
    <UserForm
      onSubmit={execute}
      errors={result.validationErrors}
      isLoading={status === 'executing'}
    />
  );
}
```

## API Route Error Handling

```typescript
// src/app/api/users/route.ts
import { NextResponse } from 'next/server';
import { AppError, ValidationError } from '@/shared/lib/errors';
import { logger } from '@/shared/lib/logger';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const user = await createUser(body);
    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json(
        { error: error.message, fields: error.fields },
        { status: 400 }
      );
    }

    if (error instanceof AppError && error.isOperational) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }

    logger.error({ err: error }, 'API route error');
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

## Loading States

```tsx
// src/app/[locale]/dashboard/loading.tsx
import { Skeleton, VStack, Container } from '@chakra-ui/react';

export default function Loading() {
  return (
    <Container maxW="container.xl" py={8}>
      <VStack gap={4} align="stretch">
        <Skeleton height="40px" width="200px" />
        <Skeleton height="200px" />
        <Skeleton height="200px" />
      </VStack>
    </Container>
  );
}
```

## Do Not

- Swallow errors silently — always log them
- Show technical error messages to users — use friendly messages
- Skip error boundaries — every route should have error handling
- Throw non-operational errors as operational — distinguish between bugs and expected errors
- Forget loading states — always show feedback during async operations
