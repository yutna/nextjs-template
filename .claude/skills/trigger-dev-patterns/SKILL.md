---
name: trigger-dev-patterns
description: This skill should be used when working with background jobs, queues, or async tasks. Provides Trigger.dev job patterns, scheduling, and error handling.
triggers:
  - job
  - background
  - queue
  - trigger
  - async task
  - scheduled
  - cron
  - worker
---

# Trigger.dev Patterns Skill

Trigger.dev is the background job system for this project. Jobs live in `modules/<feature>/jobs/` or `shared/jobs/`.

## Job Structure

```
jobs/
└── send-welcome-email-job/
    ├── index.ts
    ├── types.ts                    # Payload types
    ├── send-welcome-email-job.ts   # Job definition
    └── send-welcome-email-job.test.ts
```

## Trigger.dev Client Setup

```typescript
// shared/jobs/client.ts
import { TriggerClient } from "@trigger.dev/sdk";

export const triggerClient = new TriggerClient({
  id: "your-project-id",
  apiKey: process.env.TRIGGER_API_KEY!,
});
```

```typescript
// shared/jobs/index.ts
export { triggerClient } from "./client";
```

## Basic Job Definition

### Types

```typescript
// send-welcome-email-job/types.ts
export interface SendWelcomeEmailPayload {
  userId: string;
  email: string;
  name: string;
}

export interface SendWelcomeEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}
```

### Job Implementation

```typescript
// send-welcome-email-job/send-welcome-email-job.ts
import { Effect } from "effect";
import { triggerClient } from "@/shared/jobs";
import { EmailService } from "@/shared/services/email-service";
import { UserRepository } from "@/modules/users/repositories/user-repository";
import type { SendWelcomeEmailPayload, SendWelcomeEmailResult } from "./types";

export const sendWelcomeEmailJob = triggerClient.defineJob({
  id: "send-welcome-email",
  name: "Send Welcome Email",
  version: "1.0.0",
  trigger: eventTrigger({
    name: "user.created",
  }),
  run: async (payload: SendWelcomeEmailPayload, io) => {
    // Log start
    await io.logger.info("Sending welcome email", { userId: payload.userId });

    // Execute with Effect
    const result = await Effect.runPromise(
      sendWelcomeEmail(payload).pipe(
        Effect.map((messageId) => ({
          success: true,
          messageId,
        })),
        Effect.catchAll((error) =>
          Effect.succeed({
            success: false,
            error: error._tag,
          })
        )
      )
    );

    // Log result
    if (result.success) {
      await io.logger.info("Welcome email sent", { messageId: result.messageId });
    } else {
      await io.logger.error("Failed to send welcome email", { error: result.error });
    }

    return result;
  },
});

// Effect-based implementation
const sendWelcomeEmail = (
  payload: SendWelcomeEmailPayload
): Effect.Effect<string, EmailError | UserNotFoundError> =>
  Effect.gen(function* () {
    // Get user details
    const user = yield* UserRepository.findByIdOrFail(payload.userId);

    // Send email
    const messageId = yield* EmailService.send({
      to: payload.email,
      subject: `Welcome, ${payload.name}!`,
      template: "welcome",
      data: { user },
    });

    return messageId;
  });
```

### Index Export

```typescript
// send-welcome-email-job/index.ts
export { sendWelcomeEmailJob } from "./send-welcome-email-job";
export type { SendWelcomeEmailPayload, SendWelcomeEmailResult } from "./types";
```

## Triggering Jobs

### From Server Actions

```typescript
// create-user-action/create-user-action.ts
import { sendWelcomeEmailJob } from "@/modules/users/jobs/send-welcome-email-job";

export const createUserAction = actionClient
  .schema(createUserSchema)
  .action(async ({ parsedInput }) => {
    const result = await Effect.runPromise(
      createUserService(parsedInput)
    );

    // Trigger background job
    await sendWelcomeEmailJob.trigger({
      userId: result.id,
      email: result.email,
      name: result.name,
    });

    return result;
  });
```

### From Services

```typescript
// create-user-service/create-user-service.ts
import { Effect } from "effect";
import { sendWelcomeEmailJob } from "@/modules/users/jobs/send-welcome-email-job";

export const createUserService = (input: CreateUserInput) =>
  Effect.gen(function* () {
    const user = yield* UserRepository.create(input);

    // Trigger job (fire and forget)
    yield* Effect.tryPromise({
      try: () => sendWelcomeEmailJob.trigger({
        userId: user.id,
        email: user.email,
        name: user.name,
      }),
      catch: (error) => new JobTriggerError(error),
    });

    return user;
  });
```

## Scheduled Jobs (Cron)

```typescript
// sync-inventory-job/sync-inventory-job.ts
import { triggerClient } from "@/shared/jobs";
import { cronTrigger } from "@trigger.dev/sdk";

export const syncInventoryJob = triggerClient.defineJob({
  id: "sync-inventory",
  name: "Sync Inventory",
  version: "1.0.0",
  trigger: cronTrigger({
    cron: "0 */6 * * *", // Every 6 hours
  }),
  run: async (payload, io) => {
    await io.logger.info("Starting inventory sync");

    const result = await Effect.runPromise(
      syncInventoryService().pipe(
        Effect.map((count) => ({ success: true, syncedCount: count })),
        Effect.catchAll((error) =>
          Effect.succeed({ success: false, error: error._tag })
        )
      )
    );

    await io.logger.info("Inventory sync complete", result);
    return result;
  },
});
```

## Delayed Jobs

```typescript
// send-reminder-job/send-reminder-job.ts
export const sendReminderJob = triggerClient.defineJob({
  id: "send-reminder",
  name: "Send Reminder",
  version: "1.0.0",
  trigger: eventTrigger({
    name: "reminder.scheduled",
  }),
  run: async (payload: SendReminderPayload, io) => {
    // Wait for specified delay
    await io.wait("wait-for-reminder", payload.delayMs);

    // Then send reminder
    const result = await Effect.runPromise(
      sendReminderEmail(payload)
    );

    return result;
  },
});

// Trigger with delay
await sendReminderJob.trigger(
  { userId: "123", message: "Don't forget!" },
  { delay: "1h" } // 1 hour delay
);
```

## Job with Retries

```typescript
export const processPaymentJob = triggerClient.defineJob({
  id: "process-payment",
  name: "Process Payment",
  version: "1.0.0",
  trigger: eventTrigger({
    name: "payment.initiated",
  }),
  // Retry configuration
  retry: {
    maxAttempts: 3,
    factor: 2,
    minTimeout: 1000,
    maxTimeout: 60000,
  },
  run: async (payload: ProcessPaymentPayload, io) => {
    const result = await Effect.runPromise(
      processPayment(payload).pipe(
        Effect.catchTag("RetryableError", (error) => {
          // Throw to trigger retry
          throw new Error(error.message);
        }),
        Effect.catchTag("NonRetryableError", (error) => {
          // Don't retry, just fail
          return Effect.succeed({ success: false, error: error.message });
        })
      )
    );

    return result;
  },
});
```

## Job with Steps

```typescript
export const onboardUserJob = triggerClient.defineJob({
  id: "onboard-user",
  name: "Onboard User",
  version: "1.0.0",
  trigger: eventTrigger({
    name: "user.created",
  }),
  run: async (payload: OnboardUserPayload, io) => {
    // Step 1: Create profile
    const profile = await io.runTask("create-profile", async () => {
      return Effect.runPromise(createUserProfile(payload.userId));
    });

    // Step 2: Send welcome email
    await io.runTask("send-welcome-email", async () => {
      return Effect.runPromise(sendWelcomeEmail(payload));
    });

    // Step 3: Create initial settings
    await io.runTask("create-settings", async () => {
      return Effect.runPromise(createUserSettings(payload.userId));
    });

    // Step 4: Notify team (parallel)
    await io.runTask("notify-team", async () => {
      return Effect.runPromise(notifyTeamOfNewUser(payload));
    });

    return { success: true, profileId: profile.id };
  },
});
```

## Webhook Handler Job

```typescript
// webhook-stripe-job/webhook-stripe-job.ts
export const webhookStripeJob = triggerClient.defineJob({
  id: "webhook-stripe",
  name: "Process Stripe Webhook",
  version: "1.0.0",
  trigger: eventTrigger({
    name: "stripe.webhook",
  }),
  run: async (payload: StripeWebhookPayload, io) => {
    const { type, data } = payload;

    await io.logger.info("Processing Stripe webhook", { type });

    switch (type) {
      case "payment_intent.succeeded":
        await io.runTask("handle-payment-success", async () => {
          return Effect.runPromise(handlePaymentSuccess(data));
        });
        break;

      case "customer.subscription.updated":
        await io.runTask("handle-subscription-update", async () => {
          return Effect.runPromise(handleSubscriptionUpdate(data));
        });
        break;

      default:
        await io.logger.warn("Unhandled webhook type", { type });
    }

    return { processed: true };
  },
});
```

## Testing Jobs

```typescript
// send-welcome-email-job.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { Effect } from "effect";

// Mock the job
vi.mock("@/shared/jobs", () => ({
  triggerClient: {
    defineJob: vi.fn((config) => ({
      ...config,
      trigger: vi.fn(),
    })),
  },
}));

describe("sendWelcomeEmailJob", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should send welcome email successfully", async () => {
    // Mock dependencies
    vi.mock("@/shared/services/email-service", () => ({
      EmailService: {
        send: () => Effect.succeed("message-id-123"),
      },
    }));

    vi.mock("@/modules/users/repositories/user-repository", () => ({
      UserRepository: {
        findByIdOrFail: () => Effect.succeed({
          id: "user-123",
          email: "test@example.com",
          name: "Test User",
        }),
      },
    }));

    // Import after mocking
    const { sendWelcomeEmailJob } = await import("./send-welcome-email-job");

    // Create mock io object
    const mockIo = {
      logger: {
        info: vi.fn(),
        error: vi.fn(),
      },
    };

    // Run the job
    const result = await sendWelcomeEmailJob.run(
      { userId: "user-123", email: "test@example.com", name: "Test User" },
      mockIo as any
    );

    expect(result.success).toBe(true);
    expect(result.messageId).toBe("message-id-123");
  });
});
```

## Job Registration

```typescript
// shared/jobs/register.ts
// Import all jobs to register them with Trigger.dev

// User jobs
import "@/modules/users/jobs/send-welcome-email-job";
import "@/modules/users/jobs/cleanup-inactive-users-job";

// Order jobs
import "@/modules/orders/jobs/process-order-job";
import "@/modules/orders/jobs/send-order-confirmation-job";

// Shared jobs
import "@/shared/jobs/sync-analytics-job";
import "@/shared/jobs/cleanup-expired-sessions-job";

export {};
```

## Common Patterns

### Fire and Forget

```typescript
// Don't await, just trigger
sendWelcomeEmailJob.trigger(payload).catch(console.error);
```

### Wait for Completion

```typescript
// Wait for job to complete
const handle = await sendWelcomeEmailJob.trigger(payload);
const result = await handle.wait();
```

### Batch Processing

```typescript
export const processBatchJob = triggerClient.defineJob({
  id: "process-batch",
  name: "Process Batch",
  version: "1.0.0",
  trigger: eventTrigger({
    name: "batch.process",
  }),
  run: async (payload: { items: string[] }, io) => {
    const results = [];

    for (const item of payload.items) {
      const result = await io.runTask(`process-${item}`, async () => {
        return Effect.runPromise(processItem(item));
      });
      results.push(result);
    }

    return { processed: results.length, results };
  },
});
```
