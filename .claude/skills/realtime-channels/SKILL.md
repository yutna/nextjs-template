---
name: realtime-channels
description: This skill should be used when working with real-time communication, WebSockets, or live updates. Provides patterns for SSE and Pusher/Ably integration (Rails ActionCable equivalent).
triggers:
  - channel
  - websocket
  - real-time
  - realtime
  - pusher
  - SSE
  - broadcast
  - live updates
  - ActionCable
---

# Real-time Channels Skill

Real-time channels are the Next.js equivalent of Rails ActionCable. This skill covers two approaches: Server-Sent Events (SSE) for simple use cases and Pusher/Ably for full WebSocket support.

## Option A: Server-Sent Events (Simple, No External Dependency)

Best for: Simple notifications, live updates where only server-to-client communication is needed.

### Location

```
shared/services/realtime/
├── index.ts
├── sse-handler.ts           # SSE route handler helper
├── event-emitter.ts         # In-memory event emitter
└── types.ts
```

### Types

```typescript
// shared/services/realtime/types.ts

export interface SSEMessage<T = unknown> {
  event: string;
  data: T;
  id?: string;
}

export class RealtimeError {
  readonly _tag = "RealtimeError";
  constructor(
    readonly message: string,
    readonly cause?: unknown
  ) {}
}
```

### Event Emitter (In-Memory)

```typescript
// shared/services/realtime/event-emitter.ts

type Listener<T> = (data: T) => void;

class EventEmitter {
  private listeners: Map<string, Set<Listener<unknown>>> = new Map();

  on<T>(event: string, listener: Listener<T>): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(listener as Listener<unknown>);

    // Return unsubscribe function
    return () => {
      this.listeners.get(event)?.delete(listener as Listener<unknown>);
    };
  }

  emit<T>(event: string, data: T): void {
    this.listeners.get(event)?.forEach((listener) => {
      try {
        listener(data);
      } catch (error) {
        console.error(`Error in event listener for ${event}:`, error);
      }
    });
  }

  removeAllListeners(event?: string): void {
    if (event) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
    }
  }
}

// Global singleton for the application
export const eventEmitter = new EventEmitter();
```

### SSE Handler Helper

```typescript
// shared/services/realtime/sse-handler.ts

import type { SSEMessage } from "./types";

export interface SSEHandlerOptions<T> {
  /** Called when a client connects */
  onConnect?: () => void;
  /** Called when a client disconnects */
  onDisconnect?: () => void;
  /** Subscribe to events and return cleanup function */
  subscribe: (send: (message: SSEMessage<T>) => void) => () => void;
}

/**
 * Create an SSE route handler.
 */
export function createSSEHandler<T>(options: SSEHandlerOptions<T>) {
  return async function GET(request: Request): Promise<Response> {
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      start(controller) {
        options.onConnect?.();

        const send = (message: SSEMessage<T>) => {
          const lines: string[] = [];

          if (message.id) {
            lines.push(`id: ${message.id}`);
          }
          lines.push(`event: ${message.event}`);
          lines.push(`data: ${JSON.stringify(message.data)}`);
          lines.push(""); // Empty line to end the message

          controller.enqueue(encoder.encode(lines.join("\n") + "\n"));
        };

        // Send initial connection message
        send({ event: "connected", data: { timestamp: Date.now() } as T });

        // Subscribe to events
        const cleanup = options.subscribe(send);

        // Handle client disconnect
        request.signal.addEventListener("abort", () => {
          cleanup();
          options.onDisconnect?.();
          controller.close();
        });
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no", // Disable nginx buffering
      },
    });
  };
}
```

### SSE Usage Example

```typescript
// app/api/notifications/stream/route.ts

import { createSSEHandler } from "@/shared/services/realtime/sse-handler";
import { eventEmitter } from "@/shared/services/realtime/event-emitter";

interface NotificationData {
  id: string;
  title: string;
  message: string;
  createdAt: string;
}

export const GET = createSSEHandler<NotificationData>({
  onConnect: () => {
    console.log("Client connected to notifications stream");
  },
  onDisconnect: () => {
    console.log("Client disconnected from notifications stream");
  },
  subscribe: (send) => {
    // Subscribe to notification events
    const unsubscribe = eventEmitter.on<NotificationData>(
      "notification:new",
      (data) => {
        send({ event: "notification", data });
      }
    );

    return unsubscribe;
  },
});

// To emit from anywhere in the app:
// eventEmitter.emit("notification:new", { id: "1", title: "Hello", ... });
```

### Client-Side SSE Hook

```typescript
// shared/hooks/use-sse/use-sse.ts
"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface UseSSEOptions<T> {
  url: string;
  onMessage?: (event: string, data: T) => void;
  onError?: (error: Event) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  reconnectInterval?: number;
  maxRetries?: number;
}

export function useSSE<T>({
  url,
  onMessage,
  onError,
  onConnect,
  onDisconnect,
  reconnectInterval = 3000,
  maxRetries = 5,
}: UseSSEOptions<T>) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState<{ event: string; data: T } | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const retriesRef = useRef(0);

  const connect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const eventSource = new EventSource(url);
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      setIsConnected(true);
      retriesRef.current = 0;
      onConnect?.();
    };

    eventSource.onerror = (error) => {
      setIsConnected(false);
      onError?.(error);
      onDisconnect?.();

      // Auto-reconnect with backoff
      if (retriesRef.current < maxRetries) {
        retriesRef.current++;
        setTimeout(connect, reconnectInterval * retriesRef.current);
      }
    };

    // Listen for custom events
    eventSource.addEventListener("notification", (event) => {
      const data = JSON.parse(event.data) as T;
      setLastEvent({ event: "notification", data });
      onMessage?.("notification", data);
    });

    eventSource.addEventListener("connected", () => {
      console.log("SSE connected");
    });
  }, [url, onMessage, onError, onConnect, onDisconnect, reconnectInterval, maxRetries]);

  useEffect(() => {
    connect();

    return () => {
      eventSourceRef.current?.close();
      setIsConnected(false);
    };
  }, [connect]);

  const disconnect = useCallback(() => {
    eventSourceRef.current?.close();
    eventSourceRef.current = null;
    setIsConnected(false);
  }, []);

  return {
    isConnected,
    lastEvent,
    disconnect,
    reconnect: connect,
  };
}
```

---

## Option B: Pusher (Production WebSockets)

Best for: Production apps needing bi-directional communication, presence channels, private channels.

### Required Packages

```bash
npm install -E pusher pusher-js
```

### Location

```
shared/services/realtime/
├── index.ts
├── realtime-service.ts      # Effect-based service
├── realtime-client.ts       # Pusher server client
├── types.ts
└── channels/                # Channel definitions
    ├── index.ts
    ├── user-channel.ts
    └── notification-channel.ts
```

### Realtime Client (Server-Side)

```typescript
// shared/services/realtime/realtime-client.ts

import Pusher from "pusher";

import { env } from "@/shared/config/env";

export const pusher = new Pusher({
  appId: env.PUSHER_APP_ID,
  key: env.PUSHER_KEY,
  secret: env.PUSHER_SECRET,
  cluster: env.PUSHER_CLUSTER,
  useTLS: true,
});
```

### Types

```typescript
// shared/services/realtime/types.ts

export class RealtimeError {
  readonly _tag = "RealtimeError";
  constructor(
    readonly message: string,
    readonly cause?: unknown
  ) {}
}

export interface BroadcastResult {
  success: boolean;
}
```

### Channel Definitions

```typescript
// shared/services/realtime/channels/notification-channel.ts

export const NotificationChannel = {
  /** Channel name for a specific user */
  name: (userId: string) => `private-user-${userId}`,

  /** Event names */
  events: {
    NEW_NOTIFICATION: "new-notification",
    NOTIFICATION_READ: "notification-read",
    NOTIFICATION_CLEARED: "notification-cleared",
  },
} as const;
```

```typescript
// shared/services/realtime/channels/presence-channel.ts

export const PresenceChannel = {
  /** Channel name for a room/chat */
  name: (roomId: string) => `presence-room-${roomId}`,

  /** Event names */
  events: {
    USER_JOINED: "user-joined",
    USER_LEFT: "user-left",
    MESSAGE: "message",
    TYPING: "typing",
  },
} as const;
```

```typescript
// shared/services/realtime/channels/index.ts
export { NotificationChannel } from "./notification-channel";
export { PresenceChannel } from "./presence-channel";
```

### Realtime Service (Effect-Based)

```typescript
// shared/services/realtime/realtime-service.ts

import { Effect } from "effect";

import { pusher } from "./realtime-client";
import { NotificationChannel } from "./channels/notification-channel";

import type { BroadcastResult, RealtimeError } from "./types";

/**
 * Broadcast to a channel.
 */
export const broadcast = (
  channel: string,
  event: string,
  data: unknown
): Effect.Effect<BroadcastResult, RealtimeError> =>
  Effect.tryPromise({
    try: async () => {
      await pusher.trigger(channel, event, data);
      return { success: true };
    },
    catch: (error) =>
      new RealtimeError(
        error instanceof Error ? error.message : "Broadcast failed",
        error
      ),
  });

/**
 * Send notification to a specific user.
 */
export const notifyUser = (
  userId: string,
  event: string,
  data: unknown
): Effect.Effect<BroadcastResult, RealtimeError> =>
  broadcast(NotificationChannel.name(userId), event, data);

/**
 * Send new notification to user.
 */
export const sendNotification = (
  userId: string,
  notification: {
    id: string;
    title: string;
    message: string;
    type: string;
  }
): Effect.Effect<BroadcastResult, RealtimeError> =>
  notifyUser(userId, NotificationChannel.events.NEW_NOTIFICATION, notification);

/**
 * Broadcast to multiple users.
 */
export const broadcastToUsers = (
  userIds: string[],
  event: string,
  data: unknown
): Effect.Effect<BroadcastResult[], RealtimeError> =>
  Effect.all(
    userIds.map((userId) => notifyUser(userId, event, data)),
    { concurrency: 10 }
  );

// Export as namespace
export const RealtimeService = {
  broadcast,
  notifyUser,
  sendNotification,
  broadcastToUsers,
};
```

### Pusher Auth Endpoint

```typescript
// app/api/pusher/auth/route.ts

import { auth } from "@/shared/services/auth";
import { pusher } from "@/shared/services/realtime/realtime-client";

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const formData = await request.formData();
  const socketId = formData.get("socket_id") as string;
  const channel = formData.get("channel_name") as string;

  // Validate user has access to channel
  if (channel.startsWith("private-user-")) {
    const channelUserId = channel.replace("private-user-", "");
    if (channelUserId !== session.user.id) {
      return new Response("Forbidden", { status: 403 });
    }
  }

  // For presence channels, include user info
  if (channel.startsWith("presence-")) {
    const presenceData = {
      user_id: session.user.id,
      user_info: {
        name: session.user.name,
        avatar: session.user.image,
      },
    };
    const authResponse = pusher.authorizeChannel(socketId, channel, presenceData);
    return Response.json(authResponse);
  }

  // For private channels
  const authResponse = pusher.authorizeChannel(socketId, channel);
  return Response.json(authResponse);
}
```

### Client-Side Pusher Hook

```typescript
// shared/hooks/use-realtime/use-realtime.ts
"use client";

import Pusher from "pusher-js";
import { useCallback, useEffect, useRef, useState } from "react";

import { env } from "@/shared/config/env.client";

interface UseRealtimeOptions {
  /** Auto-connect on mount */
  autoConnect?: boolean;
}

export function useRealtime(options: UseRealtimeOptions = {}) {
  const { autoConnect = true } = options;
  const [isConnected, setIsConnected] = useState(false);
  const pusherRef = useRef<Pusher | null>(null);

  const connect = useCallback(() => {
    if (pusherRef.current) return;

    const pusher = new Pusher(env.NEXT_PUBLIC_PUSHER_KEY, {
      cluster: env.NEXT_PUBLIC_PUSHER_CLUSTER,
      authEndpoint: "/api/pusher/auth",
    });

    pusher.connection.bind("connected", () => {
      setIsConnected(true);
    });

    pusher.connection.bind("disconnected", () => {
      setIsConnected(false);
    });

    pusherRef.current = pusher;
  }, []);

  const disconnect = useCallback(() => {
    pusherRef.current?.disconnect();
    pusherRef.current = null;
    setIsConnected(false);
  }, []);

  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [autoConnect, connect, disconnect]);

  return {
    pusher: pusherRef.current,
    isConnected,
    connect,
    disconnect,
  };
}
```

### Channel Subscription Hook

```typescript
// shared/hooks/use-channel/use-channel.ts
"use client";

import type { Channel } from "pusher-js";
import { useCallback, useEffect, useRef, useState } from "react";

import { useRealtime } from "../use-realtime";

interface UseChannelOptions<T> {
  channelName: string;
  eventName: string;
  onEvent?: (data: T) => void;
}

export function useChannel<T>({
  channelName,
  eventName,
  onEvent,
}: UseChannelOptions<T>) {
  const { pusher, isConnected } = useRealtime();
  const [lastMessage, setLastMessage] = useState<T | null>(null);
  const channelRef = useRef<Channel | null>(null);

  useEffect(() => {
    if (!pusher || !isConnected) return;

    const channel = pusher.subscribe(channelName);
    channelRef.current = channel;

    channel.bind(eventName, (data: T) => {
      setLastMessage(data);
      onEvent?.(data);
    });

    return () => {
      channel.unbind(eventName);
      pusher.unsubscribe(channelName);
      channelRef.current = null;
    };
  }, [pusher, isConnected, channelName, eventName, onEvent]);

  return {
    channel: channelRef.current,
    lastMessage,
    isSubscribed: channelRef.current !== null,
  };
}
```

### Usage in Components

```typescript
// components/notification-listener.tsx
"use client";

import { useChannel } from "@/shared/hooks/use-channel";
import { NotificationChannel } from "@/shared/services/realtime/channels";

interface NotificationListenerProps {
  userId: string;
  onNotification: (notification: Notification) => void;
}

export function NotificationListener({
  userId,
  onNotification,
}: NotificationListenerProps) {
  useChannel<Notification>({
    channelName: NotificationChannel.name(userId),
    eventName: NotificationChannel.events.NEW_NOTIFICATION,
    onEvent: onNotification,
  });

  return null; // Invisible listener component
}
```

### Triggering Events from Server

```typescript
// modules/notifications/services/notification-service/notification-service.ts

import { Effect, pipe } from "effect";

import { RealtimeService } from "@/shared/services/realtime";
import { NotificationRepository } from "@/modules/notifications/repositories/notification-repository";

export const createNotification = (
  userId: string,
  data: CreateNotificationInput
) =>
  pipe(
    // Create in database
    NotificationRepository.create({ userId, ...data }),
    // Send real-time notification
    Effect.tap((notification) =>
      RealtimeService.sendNotification(userId, {
        id: notification.id,
        title: notification.title,
        message: notification.message,
        type: notification.type,
      }).pipe(
        Effect.catchAll(() => Effect.void) // Don't fail if realtime fails
      )
    )
  );
```

## Index Export

```typescript
// shared/services/realtime/index.ts

// SSE exports
export { createSSEHandler } from "./sse-handler";
export { eventEmitter } from "./event-emitter";

// Pusher exports (when using Pusher)
export { RealtimeService } from "./realtime-service";
export { pusher } from "./realtime-client";

// Channel definitions
export * from "./channels";

// Types
export type { RealtimeError, BroadcastResult, SSEMessage } from "./types";
```

## Rails ActionCable Mapping

| Rails ActionCable | Next.js Realtime |
|-------------------|------------------|
| `ActionCable.server.broadcast` | `RealtimeService.broadcast()` |
| `stream_from "channel"` | Pusher subscribe |
| `stream_for @user` | `NotificationChannel.name(userId)` |
| `received(data)` | `onEvent` callback |
| Connection authentication | `/api/pusher/auth` endpoint |
| `appear/disappear` | Presence channels |
