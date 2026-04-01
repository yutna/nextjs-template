---
name: nextjs-server-actions
description: This skill should be used when creating server actions, mutations, or form actions. Guides next-safe-action + Zod patterns for type-safe server mutations.
triggers:
  - server action
  - mutation
  - form action
  - next-safe-action
---

# Next.js Server Actions

Use this skill when creating server actions for mutations, form handling, or server-side operations.

## Reference

- .claude/workflow-profile.json (stack.serverActions, stack.validation)
- .claude/skills/effect-patterns/ (Effect patterns for services)
- src/shared/lib/safe-action/ (action client configuration)

## Architecture: Actions → Services → Repositories

Server actions are thin wrappers that delegate to Effect-based services:

```
┌─────────────────────────────────────────────────────────────┐
│                    Server Action                            │
│           (Zod validation, Effect execution)                │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      Service                                │
│              (Business logic, Effect)                       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     Repository                              │
│               (Data access, Drizzle)                        │
└─────────────────────────────────────────────────────────────┘
```

## File Structure

```
actions/
└── create-user-action/
    ├── index.ts
    ├── types.ts
    ├── create-user-action.ts
    └── create-user-action.test.ts
```

## next-safe-action Setup

### Action Client Configuration

```typescript
// src/shared/lib/safe-action/client.ts
import { createSafeActionClient } from "next-safe-action";
import { logger } from "@/shared/lib/logger";

export const actionClient = createSafeActionClient({
  handleReturnedServerError(e) {
    logger.error({ err: e }, "Server action error");
    return "An unexpected error occurred";
  },
});

// Authenticated action client
export const authActionClient = actionClient.use(async ({ next }) => {
  const session = await getSession();
  if (!session) {
    throw new Error("Unauthorized");
  }
  return next({ ctx: { session } });
});
```

## Creating Server Actions

### Basic Action with Service Layer

```typescript
// actions/create-user-action/types.ts
export interface CreateUserActionResult {
  success: boolean;
  user?: { id: string; email: string; name: string };
  error?: string;
}
```

```typescript
// actions/create-user-action/create-user-action.ts
"use server";

import { Effect } from "effect";
import { revalidatePath } from "next/cache";
import { actionClient } from "@/shared/lib/safe-action";
import { createUserService } from "../../services/create-user-service";
import { createUserSchema } from "../../schemas/create-user-schema";
import type { CreateUserActionResult } from "./types";

export const createUserAction = actionClient
  .schema(createUserSchema)
  .action(async ({ parsedInput }): Promise<CreateUserActionResult> => {
    const result = await Effect.runPromise(
      createUserService(parsedInput).pipe(
        Effect.map((user) => ({
          success: true as const,
          user: { id: user.id, email: user.email, name: user.name },
        })),
        Effect.catchAll((error) =>
          Effect.succeed({
            success: false as const,
            error: error._tag,
          })
        )
      )
    );

    if (result.success) {
      revalidatePath("/users");
    }

    return result;
  });
```

### Authenticated Action

```typescript
// actions/update-profile-action/update-profile-action.ts
"use server";

import { Effect } from "effect";
import { authActionClient } from "@/shared/lib/safe-action";
import { updateProfileService } from "../../services/update-profile-service";
import { updateProfileSchema } from "../../schemas/update-profile-schema";

export const updateProfileAction = authActionClient
  .schema(updateProfileSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { session } = ctx;

    const result = await Effect.runPromise(
      updateProfileService(session.userId, parsedInput).pipe(
        Effect.map((user) => ({ success: true, user })),
        Effect.catchAll((error) =>
          Effect.succeed({ success: false, error: error._tag })
        )
      )
    );

    return result;
  });
```

### Action with Background Job

```typescript
// actions/create-order-action/create-order-action.ts
"use server";

import { Effect } from "effect";
import { actionClient } from "@/shared/lib/safe-action";
import { createOrderService } from "../../services/create-order-service";
import { sendOrderConfirmationJob } from "../../jobs/send-order-confirmation-job";
import { createOrderSchema } from "../../schemas/create-order-schema";

export const createOrderAction = actionClient
  .schema(createOrderSchema)
  .action(async ({ parsedInput }) => {
    const result = await Effect.runPromise(
      createOrderService(parsedInput).pipe(
        Effect.tap((order) =>
          Effect.tryPromise({
            try: () => sendOrderConfirmationJob.trigger({
              orderId: order.id,
              email: order.customerEmail,
            }),
            catch: () => new JobTriggerError(),
          })
        ),
        Effect.map((order) => ({ success: true, orderId: order.id })),
        Effect.catchAll((error) =>
          Effect.succeed({ success: false, error: error._tag })
        )
      )
    );

    return result;
  });
```

## Using Actions in Components

### With useAction Hook

```tsx
// containers/container-create-user/container-create-user.tsx
"use client";

import { useAction } from "next-safe-action/hooks";
import { createUserAction } from "../../actions/create-user-action";
import { FormCreateUser } from "../../components/form-create-user";
import { toaster } from "@/shared/components/toaster";

export function ContainerCreateUser() {
  const { execute, result, status, reset } = useAction(createUserAction, {
    onSuccess: ({ data }) => {
      if (data?.success) {
        toaster.success({ title: "User created!" });
        reset();
      } else {
        toaster.error({ title: data?.error || "Failed to create user" });
      }
    },
    onError: ({ error }) => {
      toaster.error({ title: error.serverError || "An error occurred" });
    },
  });

  return (
    <FormCreateUser
      onSubmit={(data) => execute(data)}
      isLoading={status === "executing"}
      errors={result.validationErrors}
    />
  );
}
```

### With useOptimisticAction

```tsx
"use client";

import { useOptimisticAction } from "next-safe-action/hooks";
import { toggleLikeAction } from "../../actions/toggle-like-action";

export function ButtonLike({ postId, initialLiked }: ButtonLikeProps) {
  const { execute, optimisticState } = useOptimisticAction(toggleLikeAction, {
    currentState: { liked: initialLiked },
    updateFn: (state) => ({ liked: !state.liked }),
  });

  return (
    <Button onClick={() => execute({ postId })}>
      {optimisticState.liked ? "Unlike" : "Like"}
    </Button>
  );
}
```

## Error Handling

### Mapping Effect Errors to Action Results

```typescript
export const riskyAction = actionClient
  .schema(schema)
  .action(async ({ parsedInput }) => {
    const result = await Effect.runPromise(
      riskyService(parsedInput).pipe(
        Effect.map((data) => ({ success: true, data })),
        Effect.catchTags({
          ValidationError: (e) =>
            Effect.succeed({ success: false, error: "validation", message: e.message }),
          NotFoundError: (e) =>
            Effect.succeed({ success: false, error: "not_found", id: e.id }),
          UnauthorizedError: () =>
            Effect.succeed({ success: false, error: "unauthorized" }),
        }),
        Effect.catchAll((e) =>
          Effect.succeed({ success: false, error: "unknown", message: String(e) })
        )
      )
    );

    return result;
  });
```

### Client-Side Error Handling

```tsx
const { execute, result } = useAction(riskyAction, {
  onSuccess: ({ data }) => {
    if (!data?.success) {
      switch (data?.error) {
        case "validation":
          toaster.error({ title: data.message });
          break;
        case "not_found":
          toaster.error({ title: "Item not found" });
          break;
        case "unauthorized":
          router.push("/login");
          break;
        default:
          toaster.error({ title: "Something went wrong" });
      }
    }
  },
  onError: ({ error }) => {
    if (error.validationErrors) {
      // Handle Zod validation errors
    } else if (error.serverError) {
      // Handle server errors
    }
  },
});
```

## Revalidation Patterns

```typescript
import { revalidatePath, revalidateTag } from "next/cache";

// After successful mutation
if (result.success) {
  // Revalidate specific path
  revalidatePath("/users");

  // Revalidate tagged cache
  revalidateTag("users");

  // Revalidate layout
  revalidatePath("/dashboard", "layout");
}
```

## Redirect After Action

```typescript
import { redirect } from "next/navigation";

export const createAndRedirectAction = actionClient
  .schema(schema)
  .action(async ({ parsedInput }) => {
    const result = await Effect.runPromise(
      createItemService(parsedInput)
    );

    redirect(`/items/${result.id}`);
  });
```

## Testing Actions

```typescript
// create-user-action.test.ts
import { describe, it, expect, vi } from "vitest";
import { createUserAction } from "./create-user-action";

describe("createUserAction", () => {
  it("should create user successfully", async () => {
    // Mock the service
    vi.mock("../../services/create-user-service", () => ({
      createUserService: () => Effect.succeed({
        id: "1",
        email: "test@example.com",
        name: "Test",
      }),
    }));

    const result = await createUserAction({
      email: "test@example.com",
      name: "Test",
    });

    expect(result?.data?.success).toBe(true);
    expect(result?.data?.user?.email).toBe("test@example.com");
  });
});
```

## Do Not

- Put business logic in actions — use services/ with Effect
- Create server actions without Zod validation
- Use server actions for read operations — use Server Components instead
- Skip error handling — always map Effect errors to action results
- Forget to revalidate cache after mutations
- Access database directly — use repositories through services
