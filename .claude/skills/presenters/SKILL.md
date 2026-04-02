---
name: presenters
description: This skill should be used when transforming entities for API responses or client display. Provides presenter patterns (Rails serializers equivalent).
triggers:
  - serializer
  - presenter
  - API response
  - JSON format
  - transform
  - view model
  - response format
---

# Presenters Skill

Presenters are the Next.js equivalent of Rails serializers (ActiveModel::Serializer, JBuilder). They transform entities into the format needed for API responses or client consumption.

## Location

```
# Module-specific presenters
modules/<name>/presenters/
├── index.ts
├── <name>-presenter/
│   ├── index.ts
│   ├── types.ts
│   ├── <name>-presenter.ts
│   └── <name>-presenter.test.ts

# Shared presenters (pagination, errors, etc.)
shared/presenters/
├── index.ts
├── pagination-presenter/
├── error-presenter/
└── api-response-presenter/
```

## Basic Presenter Pattern

```typescript
// modules/users/presenters/user-presenter/types.ts

import type { User } from "@/shared/entities/user";

/** Public user representation for API responses */
export interface UserJSON {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  role: string;
  createdAt: string;
}

/** Minimal user representation for lists/dropdowns */
export interface UserOptionJSON {
  value: string;
  label: string;
}

/** User with related data */
export interface UserWithPostsJSON extends UserJSON {
  posts: PostJSON[];
  postsCount: number;
}

/** Paginated user list */
export interface UserListJSON {
  users: UserJSON[];
  pagination: PaginationJSON;
}
```

```typescript
// modules/users/presenters/user-presenter/user-presenter.ts

import type { User, UserWithPosts } from "@/shared/entities/user";
import type { PaginationMeta } from "@/shared/presenters/pagination-presenter";

import type {
  UserJSON,
  UserListJSON,
  UserOptionJSON,
  UserWithPostsJSON,
} from "./types";

/**
 * Transform User entity to JSON representation.
 */
export const UserPresenter = {
  /**
   * Full user representation for detail views.
   */
  toJSON(user: User): UserJSON {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl,
      role: user.role,
      createdAt: user.createdAt.toISOString(),
    };
  },

  /**
   * Minimal representation for select options.
   */
  toOption(user: User): UserOptionJSON {
    return {
      value: user.id,
      label: user.name,
    };
  },

  /**
   * List of users with pagination metadata.
   */
  toList(users: User[], pagination: PaginationMeta): UserListJSON {
    return {
      users: users.map(UserPresenter.toJSON),
      pagination: {
        page: pagination.page,
        pageSize: pagination.pageSize,
        total: pagination.total,
        totalPages: Math.ceil(pagination.total / pagination.pageSize),
        hasNext: pagination.page < Math.ceil(pagination.total / pagination.pageSize),
        hasPrev: pagination.page > 1,
      },
    };
  },

  /**
   * User with related posts.
   */
  toJSONWithPosts(user: UserWithPosts): UserWithPostsJSON {
    return {
      ...UserPresenter.toJSON(user),
      posts: user.posts.map(PostPresenter.toJSON),
      postsCount: user.posts.length,
    };
  },

  /**
   * Transform array to options (for dropdowns).
   */
  toOptions(users: User[]): UserOptionJSON[] {
    return users.map(UserPresenter.toOption);
  },
};
```

## Index Export

```typescript
// modules/users/presenters/user-presenter/index.ts
export { UserPresenter } from "./user-presenter";
export type {
  UserJSON,
  UserListJSON,
  UserOptionJSON,
  UserWithPostsJSON,
} from "./types";
```

## Shared Presenters

### Pagination Presenter

```typescript
// shared/presenters/pagination-presenter/types.ts

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
}

export interface PaginationJSON {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}
```

```typescript
// shared/presenters/pagination-presenter/pagination-presenter.ts

import type { PaginationJSON, PaginationMeta } from "./types";

export const PaginationPresenter = {
  toJSON(meta: PaginationMeta): PaginationJSON {
    const totalPages = Math.ceil(meta.total / meta.pageSize);

    return {
      page: meta.page,
      pageSize: meta.pageSize,
      total: meta.total,
      totalPages,
      hasNext: meta.page < totalPages,
      hasPrev: meta.page > 1,
    };
  },

  /** Generate page numbers for pagination UI */
  getPageNumbers(
    currentPage: number,
    totalPages: number,
    maxVisible: number = 5
  ): (number | "...")[] {
    if (totalPages <= maxVisible) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages: (number | "...")[] = [];
    const half = Math.floor(maxVisible / 2);

    let start = Math.max(1, currentPage - half);
    let end = Math.min(totalPages, currentPage + half);

    if (currentPage <= half) {
      end = maxVisible;
    } else if (currentPage >= totalPages - half) {
      start = totalPages - maxVisible + 1;
    }

    if (start > 1) {
      pages.push(1);
      if (start > 2) pages.push("...");
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (end < totalPages) {
      if (end < totalPages - 1) pages.push("...");
      pages.push(totalPages);
    }

    return pages;
  },
};
```

### Error Presenter

```typescript
// shared/presenters/error-presenter/types.ts

export interface ErrorJSON {
  code: string;
  message: string;
  details?: Record<string, string[]>;
}

export interface ValidationErrorJSON extends ErrorJSON {
  code: "VALIDATION_ERROR";
  details: Record<string, string[]>;
}
```

```typescript
// shared/presenters/error-presenter/error-presenter.ts

import type { ErrorJSON, ValidationErrorJSON } from "./types";

export const ErrorPresenter = {
  /**
   * Generic error response.
   */
  toJSON(code: string, message: string): ErrorJSON {
    return { code, message };
  },

  /**
   * Not found error.
   */
  notFound(resource: string): ErrorJSON {
    return {
      code: "NOT_FOUND",
      message: `${resource} not found`,
    };
  },

  /**
   * Unauthorized error.
   */
  unauthorized(message: string = "Unauthorized"): ErrorJSON {
    return {
      code: "UNAUTHORIZED",
      message,
    };
  },

  /**
   * Forbidden error.
   */
  forbidden(message: string = "Access denied"): ErrorJSON {
    return {
      code: "FORBIDDEN",
      message,
    };
  },

  /**
   * Validation error with field details.
   */
  validation(details: Record<string, string[]>): ValidationErrorJSON {
    return {
      code: "VALIDATION_ERROR",
      message: "Validation failed",
      details,
    };
  },

  /**
   * Convert Zod error to validation error.
   */
  fromZodError(error: z.ZodError): ValidationErrorJSON {
    const details: Record<string, string[]> = {};

    for (const issue of error.issues) {
      const path = issue.path.join(".");
      if (!details[path]) {
        details[path] = [];
      }
      details[path].push(issue.message);
    }

    return ErrorPresenter.validation(details);
  },

  /**
   * Internal server error.
   */
  internal(message: string = "Internal server error"): ErrorJSON {
    return {
      code: "INTERNAL_ERROR",
      message,
    };
  },
};
```

### API Response Presenter

```typescript
// shared/presenters/api-response-presenter/types.ts

import type { ErrorJSON } from "../error-presenter";

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  error: ErrorJSON;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;
```

```typescript
// shared/presenters/api-response-presenter/api-response-presenter.ts

import type { ErrorJSON } from "../error-presenter";
import type { ApiErrorResponse, ApiSuccessResponse } from "./types";

export const ApiResponsePresenter = {
  /**
   * Wrap data in success response.
   */
  success<T>(data: T): ApiSuccessResponse<T> {
    return {
      success: true,
      data,
    };
  },

  /**
   * Wrap error in error response.
   */
  error(error: ErrorJSON): ApiErrorResponse {
    return {
      success: false,
      error,
    };
  },
};
```

## Usage Examples

### In API Handlers

```typescript
// modules/users/api/list-users-handler/list-users-handler.ts
import { Effect } from "effect";

import { UserPresenter } from "@/modules/users/presenters/user-presenter";
import { ApiResponsePresenter } from "@/shared/presenters/api-response-presenter";
import { ErrorPresenter } from "@/shared/presenters/error-presenter";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") ?? "1");
  const pageSize = parseInt(searchParams.get("pageSize") ?? "20");

  const result = await Effect.runPromiseExit(
    UserService.findPaginated({ page, pageSize })
  );

  if (result._tag === "Failure") {
    return Response.json(
      ApiResponsePresenter.error(ErrorPresenter.internal()),
      { status: 500 }
    );
  }

  const { users, total } = result.value;
  const response = UserPresenter.toList(users, { page, pageSize, total });

  return Response.json(ApiResponsePresenter.success(response));
}
```

### In Server Actions

```typescript
// modules/users/actions/get-user-action/get-user-action.ts
import { actionClient } from "@/shared/lib/safe-action";
import { z } from "zod";

import { UserPresenter } from "@/modules/users/presenters/user-presenter";
import { UserService } from "@/modules/users/services/user-service";

export const getUserAction = actionClient
  .schema(z.object({ id: z.string().uuid() }))
  .action(async ({ parsedInput }) => {
    const user = await Effect.runPromise(
      UserService.findById(parsedInput.id)
    );

    if (!user) {
      return { error: "User not found" };
    }

    // Return presented data
    return { data: UserPresenter.toJSON(user) };
  });
```

### In Server Components

```typescript
// modules/users/screens/screen-user-list/screen-user-list.tsx
import { UserPresenter } from "@/modules/users/presenters/user-presenter";
import { UserService } from "@/modules/users/services/user-service";

export async function ScreenUserList() {
  const { users, total } = await Effect.runPromise(
    UserService.findPaginated({ page: 1, pageSize: 20 })
  );

  // Present for client consumption
  const presentedUsers = UserPresenter.toList(users, {
    page: 1,
    pageSize: 20,
    total,
  });

  return <UserListContainer users={presentedUsers} />;
}
```

## Advanced Patterns

### Conditional Fields

```typescript
export const UserPresenter = {
  toJSON(user: User, options?: { includeEmail?: boolean }): UserJSON {
    const base = {
      id: user.id,
      name: user.name,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt.toISOString(),
    };

    // Only include email if requested (e.g., for admin views)
    if (options?.includeEmail) {
      return { ...base, email: user.email };
    }

    return base;
  },
};
```

### Nested Presenters

```typescript
// modules/posts/presenters/post-presenter/post-presenter.ts
import { UserPresenter } from "@/modules/users/presenters/user-presenter";

export const PostPresenter = {
  toJSON(post: Post): PostJSON {
    return {
      id: post.id,
      title: post.title,
      content: post.content,
      createdAt: post.createdAt.toISOString(),
    };
  },

  toJSONWithAuthor(post: PostWithAuthor): PostWithAuthorJSON {
    return {
      ...PostPresenter.toJSON(post),
      author: UserPresenter.toJSON(post.author),
    };
  },
};
```

### Presenter with Computed Fields

```typescript
export const OrderPresenter = {
  toJSON(order: Order): OrderJSON {
    const subtotal = order.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const tax = subtotal * 0.07;
    const total = subtotal + tax + order.shippingCost;

    return {
      id: order.id,
      status: order.status,
      items: order.items.map(OrderItemPresenter.toJSON),
      subtotal,
      tax,
      shippingCost: order.shippingCost,
      total,
      createdAt: order.createdAt.toISOString(),
    };
  },
};
```

## Testing Presenters

```typescript
// modules/users/presenters/user-presenter/user-presenter.test.ts
import { describe, it, expect } from "vitest";

import { UserFactory } from "@/shared/factories/user-factory";

import { UserPresenter } from "./user-presenter";

describe("UserPresenter", () => {
  describe("toJSON", () => {
    it("should transform user entity to JSON", () => {
      const user = UserFactory.build({
        id: "123",
        name: "John Doe",
        email: "john@example.com",
        createdAt: new Date("2024-01-01"),
      });

      const result = UserPresenter.toJSON(user);

      expect(result).toEqual({
        id: "123",
        name: "John Doe",
        email: "john@example.com",
        avatarUrl: user.avatarUrl,
        role: user.role,
        createdAt: "2024-01-01T00:00:00.000Z",
      });
    });
  });

  describe("toOption", () => {
    it("should transform user to select option", () => {
      const user = UserFactory.build({ id: "123", name: "John Doe" });

      const result = UserPresenter.toOption(user);

      expect(result).toEqual({
        value: "123",
        label: "John Doe",
      });
    });
  });

  describe("toList", () => {
    it("should transform users with pagination", () => {
      const users = UserFactory.buildList(2);
      const pagination = { page: 1, pageSize: 10, total: 25 };

      const result = UserPresenter.toList(users, pagination);

      expect(result.users).toHaveLength(2);
      expect(result.pagination).toEqual({
        page: 1,
        pageSize: 10,
        total: 25,
        totalPages: 3,
        hasNext: true,
        hasPrev: false,
      });
    });
  });
});
```

## Rails Serializer Mapping

| Rails Serializer | Next.js Presenter |
|------------------|-------------------|
| `UserSerializer.new(user).as_json` | `UserPresenter.toJSON(user)` |
| `has_many :posts` | `PostPresenter.toJSON` in nested call |
| `attribute :full_name { "#{first} #{last}" }` | Computed field in presenter |
| `ActiveModel::Serializer::CollectionSerializer` | `users.map(UserPresenter.toJSON)` |
| Conditional attributes | Options parameter |
| JBuilder templates | Presenter methods |
