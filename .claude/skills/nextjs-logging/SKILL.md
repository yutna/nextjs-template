---
name: nextjs-logging
description: This skill should be used when implementing logging, Pino, or structured logging patterns. Guides Pino structured logging setup.
---

# Next.js Logging

Use this skill when implementing structured logging with Pino.

## Reference

- .claude/workflow-profile.json (stack.logging)
- src/shared/lib/logger.ts (logger configuration)

## Pino Setup

### Logger Configuration

```typescript
// src/shared/lib/logger.ts
import pino from 'pino';

const isServer = typeof window === 'undefined';
const isDev = process.env.NODE_ENV === 'development';

export const logger = pino({
  level: process.env.LOG_LEVEL || (isDev ? 'debug' : 'info'),
  ...(isDev && {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        ignore: 'pid,hostname',
        translateTime: 'SYS:standard',
      },
    },
  }),
  base: {
    env: process.env.NODE_ENV,
    ...(isServer && { pid: process.pid }),
  },
  redact: {
    paths: ['password', 'token', 'authorization', '*.password', '*.token'],
    censor: '[REDACTED]',
  },
});

// Create child loggers for modules
export function createLogger(module: string) {
  return logger.child({ module });
}
```

### Browser Logger

```typescript
// src/shared/lib/browser-logger.ts
const LOG_LEVELS = ['debug', 'info', 'warn', 'error'] as const;
type LogLevel = (typeof LOG_LEVELS)[number];

const currentLevel = (process.env.NEXT_PUBLIC_LOG_LEVEL || 'info') as LogLevel;
const levelIndex = LOG_LEVELS.indexOf(currentLevel);

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS.indexOf(level) >= levelIndex;
}

export const browserLogger = {
  debug: (msg: string, data?: object) => {
    if (shouldLog('debug')) console.debug(msg, data);
  },
  info: (msg: string, data?: object) => {
    if (shouldLog('info')) console.info(msg, data);
  },
  warn: (msg: string, data?: object) => {
    if (shouldLog('warn')) console.warn(msg, data);
  },
  error: (msg: string, data?: object) => {
    if (shouldLog('error')) console.error(msg, data);
  },
};
```

## Usage Patterns

### Basic Logging

```typescript
import { logger } from '@/shared/lib/logger';

// Simple message
logger.info('User logged in');

// With structured data
logger.info({ userId: '123', action: 'login' }, 'User logged in');

// Error logging
logger.error({ err: error, userId: '123' }, 'Failed to process payment');
```

### Module-Specific Logger

```typescript
// src/modules/users/lib/logger.ts
import { createLogger } from '@/shared/lib/logger';

export const usersLogger = createLogger('users');

// Usage
usersLogger.info({ userId }, 'User profile updated');
```

### In Server Actions

```typescript
// src/modules/users/actions/createUser.ts
'use server';

import { createLogger } from '@/shared/lib/logger';

const logger = createLogger('users:actions');

export const createUser = actionClient
  .schema(createUserSchema)
  .action(async ({ parsedInput }) => {
    logger.info({ email: parsedInput.email }, 'Creating user');

    try {
      const user = await db.user.create({ data: parsedInput });
      logger.info({ userId: user.id }, 'User created successfully');
      return { success: true, user };
    } catch (error) {
      logger.error({ err: error, email: parsedInput.email }, 'Failed to create user');
      throw error;
    }
  });
```

### In API Routes

```typescript
// src/app/api/users/route.ts
import { createLogger } from '@/shared/lib/logger';
import { NextResponse } from 'next/server';

const logger = createLogger('api:users');

export async function GET(request: Request) {
  const start = Date.now();

  logger.debug({ url: request.url }, 'Incoming request');

  try {
    const users = await getUsers();

    logger.info(
      { duration: Date.now() - start, count: users.length },
      'Users fetched successfully'
    );

    return NextResponse.json(users);
  } catch (error) {
    logger.error(
      { err: error, duration: Date.now() - start },
      'Failed to fetch users'
    );
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
```

### Request Context

```typescript
// src/shared/lib/request-context.ts
import { AsyncLocalStorage } from 'node:async_hooks';
import { createLogger } from './logger';

interface RequestContext {
  requestId: string;
  userId?: string;
  path: string;
}

export const requestContextStorage = new AsyncLocalStorage<RequestContext>();

export function getRequestLogger() {
  const context = requestContextStorage.getStore();
  const baseLogger = createLogger('request');

  if (context) {
    return baseLogger.child({
      requestId: context.requestId,
      userId: context.userId,
      path: context.path,
    });
  }

  return baseLogger;
}
```

### Middleware Logging

```typescript
// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createLogger } from '@/shared/lib/logger';

const logger = createLogger('middleware');

export function middleware(request: NextRequest) {
  const start = Date.now();
  const requestId = crypto.randomUUID();

  logger.info({
    requestId,
    method: request.method,
    path: request.nextUrl.pathname,
    userAgent: request.headers.get('user-agent'),
  }, 'Incoming request');

  const response = NextResponse.next();
  response.headers.set('x-request-id', requestId);

  // Log on response (Note: middleware runs before response is complete)
  logger.info({
    requestId,
    duration: Date.now() - start,
  }, 'Request processed');

  return response;
}
```

## Log Levels

| Level | When to Use |
|-------|-------------|
| `debug` | Detailed debugging info, disabled in production |
| `info` | Normal operations, user actions, business events |
| `warn` | Unexpected but recoverable situations |
| `error` | Errors that need attention |

## Structured Logging Best Practices

### Do

```typescript
// Good: Structured data with message
logger.info({ userId, action: 'purchase', amount }, 'Purchase completed');

// Good: Error with context
logger.error({ err: error, userId, orderId }, 'Payment failed');

// Good: Performance metrics
logger.info({ duration, query, resultCount }, 'Database query executed');
```

### Don't

```typescript
// Bad: String interpolation loses structure
logger.info(`User ${userId} made a purchase of ${amount}`);

// Bad: Logging sensitive data
logger.info({ password, creditCard }, 'User data');

// Bad: Too verbose in production
logger.debug({ fullRequestBody }, 'Request received');
```

## Environment Configuration

```bash
# .env.local
LOG_LEVEL=debug                    # Server-side log level
NEXT_PUBLIC_LOG_LEVEL=warn         # Client-side log level
```

## Do Not

- Log sensitive data (passwords, tokens, PII) — use redaction
- Use console.log in production — use structured logger
- Log at wrong levels — debug for dev, info for ops, error for failures
- Skip error context — always include relevant IDs and state
- Log synchronously in hot paths — consider async logging for high throughput
