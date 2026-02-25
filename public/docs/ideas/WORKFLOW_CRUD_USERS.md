# CRUD Workflow: `/api/v1/users`

End-to-end implementation guide for a Users CRUD feature in this Next.js 16
App Router project. This document serves as the **reference architecture** for
every future feature module.

The approach balances enterprise-grade structure (services, policies, presenters,
error codes) with practical simplicity — flat folders, no unnecessary
abstractions, and every file earns its place.

---

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Directory Layout](#directory-layout)
- [Implementation Order](#implementation-order)
- [Phase 1 — Types and Schemas](#phase-1--types-and-schemas)
- [Phase 2 — Error Codes](#phase-2--error-codes)
- [Phase 3 — Services (Business Logic)](#phase-3--services-business-logic)
- [Phase 4 — Policies (Authorization)](#phase-4--policies-authorization)
- [Phase 5 — Presenters (Response Shaping)](#phase-5--presenters-response-shaping)
- [Phase 6 — API Route Handlers](#phase-6--api-route-handlers)
- [Phase 7 — Server Actions (for UI Forms)](#phase-7--server-actions-for-ui-forms)
- [Phase 8 — Client Hooks (SWR)](#phase-8--client-hooks-swr)
- [Phase 9 — UI Pages and Components](#phase-9--ui-pages-and-components)
- [Phase 10 — Tests](#phase-10--tests)
- [Phase 11 — Routes Registry](#phase-11--routes-registry)
- [Data Flow Diagrams](#data-flow-diagrams)
- [Conventions Summary](#conventions-summary)
- [Anti-Patterns to Avoid](#anti-patterns-to-avoid)

---

## Architecture Overview

```txt
Browser/Client                    Server
─────────────────────             ─────────────────────────────────────────
Pages (Server Components)    ──►  services/   (business logic, pure functions)
  └── Components (Client)         │
       ├── useSWR ──── GET ──►    ├── API Route Handlers (/api/v1/users)
       └── Server Actions ──►    │     └── calls services + policies
            └── toast result      │
                                  ├── policies/  (authorization checks)
                                  ├── presenters/ (shape data for output)
                                  └── errors.ts  (domain error codes)
```

**Key rule:** Services are the only layer that touch the database or external
APIs. Route Handlers and Server Actions are thin wrappers that:

1. Parse input (Zod)
2. Check authorization (policies)
3. Call a service
4. Shape output (presenters)
5. Return response

---

## Directory Layout

```txt
src/
  modules/
    users/
      actions/              ← Server Actions ("use server")
        create-user.ts
        update-user.ts
        delete-user.ts
      api/                  ← SWR hooks for client-side data fetching
        use-user.ts
        use-users.ts
      components/           ← UI components scoped to this module
        user-form.tsx
        user-table.tsx
        user-detail-card.tsx
        delete-user-dialog.tsx
      errors.ts             ← Error code registry (flat, not in lib/)
      policies.ts           ← Authorization rules (flat)
      presenters.ts         ← Response shaping (flat)
      services.ts           ← Business logic (flat)
      types.ts              ← Zod schemas + TypeScript types (flat)
  app/
    api/
      v1/
        users/
          route.ts          ← GET (list), POST (create)
          [id]/
            route.ts        ← GET (detail), PATCH (update), DELETE
    [locale]/
      (private)/
        users/
          page.tsx          ← Users list page
          [id]/
            page.tsx        ← User detail page
            edit/
              page.tsx      ← User edit page
        users-new/
          page.tsx          ← New user page (or use dialog)
  shared/
    routes/
      private/
        users.ts            ← Route path helpers
```

### Why flat?

The user module has **7 files** at the root level:

```txt
errors.ts
policies.ts
presenters.ts
services.ts
types.ts
+ actions/   (folder because Server Actions need "use server" per file)
+ api/       (folder because each SWR hook is its own export)
+ components/ (folder because UI tends to grow)
```

Flat files (`services.ts` not `services/user-service.ts`) work well when a
module is cohesive. If a service file grows beyond ~200 lines, split it into a
folder:

```txt
services.ts  →  services/
                  create-user.ts
                  update-user.ts
                  index.ts
```

---

## Implementation Order

| Phase | Files | Depends on |
| --- | --- | --- |
| 1 | `types.ts` | nothing |
| 2 | `errors.ts` | `SETUP_ERROR_CLASSES.md` |
| 3 | `services.ts` | types, errors |
| 4 | `policies.ts` | types |
| 5 | `presenters.ts` | types |
| 6 | `app/api/v1/users/route.ts` | services, policies, presenters, errors |
| 7 | `actions/*.ts` | services, policies, types |
| 8 | `api/use-user.ts` | `SETUP_API_LAYER.md` |
| 9 | Pages + Components | actions, hooks, presenters |
| 10 | Tests | everything above |
| 11 | `routes/private/users.ts` | nothing |

---

## Phase 1 — Types and Schemas

Single file owns ALL Zod schemas and derived types for the domain. Schemas
handle both validation and coercion (like Rails form objects).

```ts
// src/modules/users/types.ts
import { z } from "zod";

// ─── Database / API entity ────────────────────────────────────────────────────

export const userSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  firstName: z.string(),
  lastName: z.string(),
  role: z.enum(["admin", "member"]),
  status: z.enum(["active", "suspended", "pending"]),
  emailVerifiedAt: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type User = z.infer<typeof userSchema>;

// ─── Create ───────────────────────────────────────────────────────────────────

export const createUserSchema = z.object({
  email: z.string().email().toLowerCase().trim(),
  firstName: z.string().min(1).max(100).trim(),
  lastName: z.string().min(1).max(100).trim(),
  role: z.enum(["admin", "member"]).default("member"),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;

// ─── Update ───────────────────────────────────────────────────────────────────

export const updateUserSchema = z.object({
  firstName: z.string().min(1).max(100).trim().optional(),
  lastName: z.string().min(1).max(100).trim().optional(),
  role: z.enum(["admin", "member"]).optional(),
  status: z.enum(["active", "suspended"]).optional(),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;

// ─── Filters (for list endpoint) ──────────────────────────────────────────────

export const userFiltersSchema = z.object({
  search: z.string().optional(),
  role: z.enum(["admin", "member"]).optional(),
  status: z.enum(["active", "suspended", "pending"]).optional(),
  page: z.coerce.number().int().positive().default(1),
  perPage: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.enum(["createdAt", "email", "firstName"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export type UserFilters = z.infer<typeof userFiltersSchema>;

// ─── Paginated response ──────────────────────────────────────────────────────

export interface PaginatedUsers {
  data: User[];
  meta: {
    total: number;
    page: number;
    perPage: number;
    totalPages: number;
  };
}
```

---

## Phase 2 — Error Codes

Flat registry of all error codes the Users domain can produce. Imported by
services, route handlers, and tests.

```ts
// src/modules/users/errors.ts

export const USER_ERRORS = {
  NOT_FOUND: "USER_NOT_FOUND",
  EMAIL_DUPLICATE: "USER_EMAIL_DUPLICATE",
  SELF_DELETE: "USER_SELF_DELETE",
  SELF_ROLE_CHANGE: "USER_SELF_ROLE_CHANGE",
  LAST_ADMIN: "USER_LAST_ADMIN",
  ALREADY_SUSPENDED: "USER_ALREADY_SUSPENDED",
  ALREADY_ACTIVE: "USER_ALREADY_ACTIVE",
} as const;

export type UserErrorCode = (typeof USER_ERRORS)[keyof typeof USER_ERRORS];
```

---

## Phase 3 — Services (Business Logic)

Services are **pure business logic**. They:

- Accept validated input (already parsed by Zod)
- Throw domain errors from `@/shared/lib/errors`
- Return plain data objects
- Do NOT know about HTTP, React, or Next.js
- Are easily testable with mocked dependencies

```ts
// src/modules/users/services.ts
import "server-only";

import {
  BusinessRuleError,
  ConflictError,
  NotFoundError,
} from "@/shared/lib/errors";

import { USER_ERRORS } from "./errors";

import type {
  CreateUserInput,
  PaginatedUsers,
  UpdateUserInput,
  User,
  UserFilters,
} from "./types";

// ─── List ─────────────────────────────────────────────────────────────────────

export async function listUsers(filters: UserFilters): Promise<PaginatedUsers> {
  // TODO: replace with real DB query (drizzle / prisma)
  // const users = await db.users.findMany({ where: ..., limit: filters.perPage, offset: ... });
  // const total = await db.users.count({ where: ... });

  return {
    data: [],
    meta: {
      total: 0,
      page: filters.page,
      perPage: filters.perPage,
      totalPages: 0,
    },
  };
}

// ─── Get by ID ────────────────────────────────────────────────────────────────

export async function getUserById(id: string): Promise<User> {
  // TODO: replace with real DB query
  // const user = await db.users.findById(id);
  const user = null as User | null;

  if (!user) {
    throw new NotFoundError("User", id, USER_ERRORS.NOT_FOUND);
  }

  return user;
}

// ─── Create ───────────────────────────────────────────────────────────────────

export async function createUser(input: CreateUserInput): Promise<User> {
  // Check email uniqueness
  // const existing = await db.users.findByEmail(input.email);
  const existing = null;

  if (existing) {
    throw new ConflictError(
      "A user with this email already exists",
      USER_ERRORS.EMAIL_DUPLICATE,
    );
  }

  // TODO: insert into DB
  // const user = await db.users.create({ data: input });
  const user = { id: "new-uuid", ...input } as unknown as User;

  return user;
}

// ─── Update ───────────────────────────────────────────────────────────────────

export async function updateUser(
  id: string,
  input: UpdateUserInput,
  currentUserId: string,
): Promise<User> {
  const user = await getUserById(id);

  // Business rule: cannot change own role
  if (input.role && id === currentUserId) {
    throw new BusinessRuleError(
      "You cannot change your own role",
      USER_ERRORS.SELF_ROLE_CHANGE,
    );
  }

  // TODO: update in DB
  // const updated = await db.users.update(id, input);
  const updated = { ...user, ...input } as User;

  return updated;
}

// ─── Delete ───────────────────────────────────────────────────────────────────

export async function deleteUser(
  id: string,
  currentUserId: string,
): Promise<void> {
  await getUserById(id); // Throws NotFoundError if missing

  // Business rule: cannot delete yourself
  if (id === currentUserId) {
    throw new BusinessRuleError(
      "You cannot delete your own account",
      USER_ERRORS.SELF_DELETE,
    );
  }

  // Business rule: cannot delete the last admin
  // const adminCount = await db.users.count({ where: { role: "admin" } });
  // if (adminCount <= 1) {
  //   throw new BusinessRuleError(
  //     "Cannot delete the last admin",
  //     USER_ERRORS.LAST_ADMIN,
  //   );
  // }

  // TODO: soft delete or hard delete
  // await db.users.delete(id);
}
```

### Why a single `services.ts`?

For a typical CRUD domain, 5 functions fit comfortably in one file (~100-150
lines of real code). When business logic grows complex (e.g. `createUser` needs
email verification, welcome email, audit log, onboarding workflow), split:

```txt
services.ts  →  services/
                  list-users.ts
                  create-user.ts     ← now 80 lines of complex logic
                  update-user.ts
                  delete-user.ts
                  index.ts           ← re-exports all
```

The rest of the codebase imports from `@/modules/users/services` regardless.

---

## Phase 4 — Policies (Authorization)

Policies answer **"can user X do action Y to resource Z?"** — pure functions
with no side effects. Inspired by Rails' Pundit.

```ts
// src/modules/users/policies.ts
import "server-only";

import { AuthorizationError } from "@/shared/lib/errors";

import type { User } from "./types";

interface AuthUser {
  id: string;
  role: "admin" | "member";
}

function createUserPolicy(actor: AuthUser, target?: User) {
  const isAdmin = actor.role === "admin";
  const isSelf = target ? actor.id === target.id : false;

  return {
    canList: isAdmin || actor.role === "member",
    canView: isAdmin || isSelf,
    canCreate: isAdmin,
    canUpdate: isAdmin || isSelf,
    canDelete: isAdmin && !isSelf,
    canChangeRole: isAdmin && !isSelf,
  } as const;
}

export type UserPolicy = ReturnType<typeof createUserPolicy>;

// ─── Imperative helpers (throw on denial) ─────────────────────────────────────

export function authorizeUserAction(
  action: keyof UserPolicy,
  actor: AuthUser,
  target?: User,
): void {
  const policy = createUserPolicy(actor, target);

  if (!policy[action]) {
    throw new AuthorizationError(
      `You do not have permission to ${action.replace("can", "").toLowerCase()} this user`,
    );
  }
}

export { createUserPolicy };
```

Usage in a route handler:

```ts
authorizeUserAction("canDelete", session.user, targetUser);
// throws AuthorizationError if denied — caught by the error handler
```

---

## Phase 5 — Presenters (Response Shaping)

Presenters transform raw database entities into the shape the API or UI
expects. Keeps formatting logic out of components and route handlers.

```ts
// src/modules/users/presenters.ts
import { dayjs } from "@/shared/lib/dayjs";

import type { PaginatedUsers, User } from "./types";

// ─── Single user ──────────────────────────────────────────────────────────────

export interface PresentedUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  initials: string;
  role: User["role"];
  status: User["status"];
  isVerified: boolean;
  joinedAt: string;
  joinedAtRelative: string;
}

export function presentUser(user: User): PresentedUser {
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    fullName: `${user.firstName} ${user.lastName}`,
    initials: `${user.firstName[0]}${user.lastName[0]}`.toUpperCase(),
    role: user.role,
    status: user.status,
    isVerified: user.emailVerifiedAt !== null,
    joinedAt: dayjs(user.createdAt).format("D MMM BBBB"),
    joinedAtRelative: dayjs(user.createdAt).fromNow(),
  };
}

// ─── List ─────────────────────────────────────────────────────────────────────

export interface PresentedUserList {
  data: PresentedUser[];
  meta: PaginatedUsers["meta"];
}

export function presentUserList(result: PaginatedUsers): PresentedUserList {
  return {
    data: result.data.map(presentUser),
    meta: result.meta,
  };
}
```

---

## Phase 6 — API Route Handlers

Route handlers are the **thinnest possible layer**. Their job:

1. Parse and validate input
2. Authorize
3. Call service
4. Present response
5. Catch errors and return proper HTTP status

```ts
// src/app/api/v1/users/route.ts
import "server-only";

import { NextResponse } from "next/server";

import { isAppError } from "@/shared/lib/errors";
import { logger } from "@/shared/lib/logger";
import { authorizeUserAction } from "@/modules/users/policies";
import { presentUserList } from "@/modules/users/presenters";
import { createUser, listUsers } from "@/modules/users/services";
import { createUserSchema, userFiltersSchema } from "@/modules/users/types";

import type { NextRequest } from "next/server";

// ─── Error response helper ────────────────────────────────────────────────────

function errorResponse(err: unknown): NextResponse {
  if (isAppError(err)) {
    return NextResponse.json(
      { error: { code: err.code, message: err.message } },
      { status: err.statusCode },
    );
  }

  logger.error(err, "Unhandled API error");
  return NextResponse.json(
    { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
    { status: 500 },
  );
}

// ─── GET /api/v1/users ────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  try {
    // TODO: get session from auth
    // const session = await getSession();
    // authorizeUserAction("canList", session.user);

    const params = Object.fromEntries(request.nextUrl.searchParams);
    const filters = userFiltersSchema.parse(params);
    const result = await listUsers(filters);

    return NextResponse.json(presentUserList(result));
  } catch (err) {
    return errorResponse(err);
  }
}

// ─── POST /api/v1/users ───────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    // TODO: get session from auth
    // const session = await getSession();
    // authorizeUserAction("canCreate", session.user);

    const body = await request.json();
    const input = createUserSchema.parse(body);
    const user = await createUser(input);

    return NextResponse.json(
      { data: user },
      { status: 201 },
    );
  } catch (err) {
    return errorResponse(err);
  }
}
```

```ts
// src/app/api/v1/users/[id]/route.ts
import "server-only";

import { NextResponse } from "next/server";

import { isAppError } from "@/shared/lib/errors";
import { logger } from "@/shared/lib/logger";
import { authorizeUserAction } from "@/modules/users/policies";
import { presentUser } from "@/modules/users/presenters";
import { deleteUser, getUserById, updateUser } from "@/modules/users/services";
import { updateUserSchema } from "@/modules/users/types";

import type { NextRequest } from "next/server";

function errorResponse(err: unknown): NextResponse {
  if (isAppError(err)) {
    return NextResponse.json(
      { error: { code: err.code, message: err.message } },
      { status: err.statusCode },
    );
  }
  logger.error(err, "Unhandled API error");
  return NextResponse.json(
    { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
    { status: 500 },
  );
}

interface RouteContext {
  params: Promise<{ id: string }>;
}

// ─── GET /api/v1/users/:id ────────────────────────────────────────────────────

export async function GET(_request: NextRequest, ctx: RouteContext) {
  try {
    const { id } = await ctx.params;
    const user = await getUserById(id);

    // TODO: authorizeUserAction("canView", session.user, user);

    return NextResponse.json({ data: presentUser(user) });
  } catch (err) {
    return errorResponse(err);
  }
}

// ─── PATCH /api/v1/users/:id ──────────────────────────────────────────────────

export async function PATCH(request: NextRequest, ctx: RouteContext) {
  try {
    const { id } = await ctx.params;

    // TODO: const session = await getSession();
    // authorizeUserAction("canUpdate", session.user, await getUserById(id));
    const currentUserId = "placeholder";

    const body = await request.json();
    const input = updateUserSchema.parse(body);
    const user = await updateUser(id, input, currentUserId);

    return NextResponse.json({ data: presentUser(user) });
  } catch (err) {
    return errorResponse(err);
  }
}

// ─── DELETE /api/v1/users/:id ─────────────────────────────────────────────────

export async function DELETE(_request: NextRequest, ctx: RouteContext) {
  try {
    const { id } = await ctx.params;

    // TODO: const session = await getSession();
    // authorizeUserAction("canDelete", session.user, await getUserById(id));
    const currentUserId = "placeholder";

    await deleteUser(id, currentUserId);

    return new NextResponse(null, { status: 204 });
  } catch (err) {
    return errorResponse(err);
  }
}
```

### Extracting `errorResponse` (when you have multiple route files)

When the pattern repeats across modules, extract into a shared utility:

```ts
// src/shared/api/route-error.ts
import "server-only";

import { NextResponse } from "next/server";

import { isAppError } from "@/shared/lib/errors";
import { logger } from "@/shared/lib/logger";

export function routeErrorResponse(err: unknown): NextResponse {
  if (isAppError(err)) {
    return NextResponse.json(
      { error: { code: err.code, message: err.message } },
      { status: err.statusCode },
    );
  }

  logger.error(err, "Unhandled API error");
  return NextResponse.json(
    { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
    { status: 500 },
  );
}
```

---

## Phase 7 — Server Actions (for UI Forms)

Server Actions are for **form submissions from UI components** — NOT for
programmatic API access. They use `next-safe-action` which handles validation,
error serialization, and middleware.

```ts
// src/modules/users/actions/create-user.ts
"use server";

import { authActionClient } from "@/shared/lib/safe-action";
import { createUser } from "@/modules/users/services";
import { createUserSchema } from "@/modules/users/types";

export const createUserAction = authActionClient
  .inputSchema(createUserSchema)
  .action(async ({ parsedInput, ctx }) => {
    // ctx.user is injected by authActionClient middleware
    // authorizeUserAction("canCreate", ctx.user);

    const user = await createUser(parsedInput);

    return { id: user.id };
  });
```

```ts
// src/modules/users/actions/update-user.ts
"use server";

import { z } from "zod";

import { authActionClient } from "@/shared/lib/safe-action";
import { updateUser } from "@/modules/users/services";
import { updateUserSchema } from "@/modules/users/types";

export const updateUserAction = authActionClient
  .inputSchema(
    z.object({
      id: z.string().uuid(),
      data: updateUserSchema,
    }),
  )
  .action(async ({ parsedInput, ctx }) => {
    const user = await updateUser(
      parsedInput.id,
      parsedInput.data,
      ctx.user?.id ?? "",
    );

    return { id: user.id };
  });
```

```ts
// src/modules/users/actions/delete-user.ts
"use server";

import { z } from "zod";

import { authActionClient } from "@/shared/lib/safe-action";
import { deleteUser } from "@/modules/users/services";

export const deleteUserAction = authActionClient
  .inputSchema(z.object({ id: z.string().uuid() }))
  .action(async ({ parsedInput, ctx }) => {
    await deleteUser(parsedInput.id, ctx.user?.id ?? "");

    return { success: true };
  });
```

### Why both API Routes AND Server Actions?

| Layer | Consumer | Use case |
| --- | --- | --- |
| API Routes (`/api/v1/users`) | External clients, mobile apps, AI agents, webhooks | Programmatic REST API |
| Server Actions | UI form components within THIS app | Form submissions with `useActionState`, optimistic updates |

Both call the **same services**. No business logic is duplicated.

---

## Phase 8 — Client Hooks (SWR)

SWR hooks wrap `apiFetch` (from `SETUP_API_LAYER.md`) and provide reactive
data to client components.

```ts
// src/modules/users/api/use-users.ts
import useSWR from "swr";

import { fetcher } from "@/shared/api";

import type { PresentedUserList } from "../presenters";
import type { UserFilters } from "../types";

export function useUsers(filters?: Partial<UserFilters>) {
  const params = new URLSearchParams();

  if (filters?.search) params.set("search", filters.search);
  if (filters?.role) params.set("role", filters.role);
  if (filters?.status) params.set("status", filters.status);
  if (filters?.page) params.set("page", String(filters.page));
  if (filters?.perPage) params.set("per_page", String(filters.perPage));

  const query = params.toString();
  const key = `/api/v1/users${query ? `?${query}` : ""}`;

  return useSWR<PresentedUserList>(key, fetcher);
}
```

```ts
// src/modules/users/api/use-user.ts
import useSWR from "swr";

import { fetcher } from "@/shared/api";

import type { PresentedUser } from "../presenters";

export function useUser(id: string | null) {
  return useSWR<{ data: PresentedUser }>(
    id ? `/api/v1/users/${id}` : null,
    fetcher,
  );
}
```

---

## Phase 9 — UI Pages and Components

### Route structure

```txt
src/app/[locale]/(private)/users/page.tsx         ← list
src/app/[locale]/(private)/users/[id]/page.tsx     ← detail
src/app/[locale]/(private)/users/[id]/edit/page.tsx ← edit form
```

### List page (Server Component)

```tsx
// src/app/[locale]/(private)/users/page.tsx
import "server-only";
import { setRequestLocale } from "next-intl/server";
import { use } from "react";

import { UserTable } from "@/modules/users/components/user-table";

interface PageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default function UsersPage({ params, searchParams }: Readonly<PageProps>) {
  const { locale } = use(params);
  setRequestLocale(locale);
  const filters = use(searchParams);

  // Server Component renders the shell; UserTable (client) fetches via SWR
  return (
    <main>
      <UserTable initialFilters={filters} />
    </main>
  );
}
```

### UserTable (Client Component)

```tsx
// src/modules/users/components/user-table.tsx
"use client";

import {
  Box,
  Button,
  HStack,
  Heading,
  Input,
  Table,
  Text,
} from "@chakra-ui/react";
import { useQueryState } from "nuqs";
import { LuPlus, LuSearch } from "react-icons/lu";

import { Link } from "@/shared/lib/navigation";

import { useUsers } from "../api/use-users";

interface UserTableProps {
  initialFilters: Record<string, string | string[] | undefined>;
}

export function UserTable({ initialFilters }: UserTableProps) {
  const [search, setSearch] = useQueryState("search");
  const { data, isLoading, error } = useUsers({ search: search ?? undefined });

  return (
    <Box>
      <HStack justify="space-between" mb={6}>
        <Heading size="lg">Users</Heading>
        <Button colorPalette="brand" asChild>
          <Link href="/users/new"><LuPlus /> New User</Link>
        </Button>
      </HStack>

      {/* Search */}
      <HStack mb={4}>
        <Input
          placeholder="Search users..."
          value={search ?? ""}
          onChange={(e) => setSearch(e.target.value || null)}
        />
      </HStack>

      {/* Table */}
      <Table.Root>
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader>Name</Table.ColumnHeader>
            <Table.ColumnHeader>Email</Table.ColumnHeader>
            <Table.ColumnHeader>Role</Table.ColumnHeader>
            <Table.ColumnHeader>Status</Table.ColumnHeader>
            <Table.ColumnHeader>Joined</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {data?.data.map((user) => (
            <Table.Row key={user.id}>
              <Table.Cell>
                <Link href={`/users/${user.id}`}>{user.fullName}</Link>
              </Table.Cell>
              <Table.Cell>{user.email}</Table.Cell>
              <Table.Cell>{user.role}</Table.Cell>
              <Table.Cell>{user.status}</Table.Cell>
              <Table.Cell>{user.joinedAtRelative}</Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>

      {data?.meta && (
        <Text mt={4} color="fg.muted" fontSize="sm">
          {data.meta.total} users total — page {data.meta.page} of {data.meta.totalPages}
        </Text>
      )}
    </Box>
  );
}
```

### UserForm (Client Component — used for both Create and Edit)

```tsx
// src/modules/users/components/user-form.tsx
"use client";

import { Button, Field, HStack, Input, NativeSelect, VStack } from "@chakra-ui/react";
import { useActionState } from "react";
import { LuSave } from "react-icons/lu";

import { toaster } from "@/shared/vendor/chakra-ui/toaster";

import { createUserAction } from "../actions/create-user";
import { updateUserAction } from "../actions/update-user";

import type { User } from "../types";

interface UserFormProps {
  user?: User; // undefined = create mode, defined = edit mode
}

export function UserForm({ user }: UserFormProps) {
  const isEditing = !!user;

  // React 19 useActionState for progressive enhancement
  const [state, formAction, isPending] = useActionState(
    async (_prev: unknown, formData: FormData) => {
      const data = {
        email: formData.get("email") as string,
        firstName: formData.get("firstName") as string,
        lastName: formData.get("lastName") as string,
        role: formData.get("role") as "admin" | "member",
      };

      const result = isEditing
        ? await updateUserAction({ id: user.id, data })
        : await createUserAction(data);

      if (result?.serverError) {
        toaster.create({ title: result.serverError, type: "error" });
        return { error: result.serverError };
      }

      toaster.create({
        title: isEditing ? "User updated" : "User created",
        type: "success",
      });

      return { success: true };
    },
    null,
  );

  return (
    <form action={formAction}>
      <VStack align="stretch" gap={4} maxW="md">
        {!isEditing && (
          <Field.Root>
            <Field.Label>Email</Field.Label>
            <Input name="email" type="email" required defaultValue={user?.email} />
          </Field.Root>
        )}

        <Field.Root>
          <Field.Label>First Name</Field.Label>
          <Input name="firstName" required defaultValue={user?.firstName} />
        </Field.Root>

        <Field.Root>
          <Field.Label>Last Name</Field.Label>
          <Input name="lastName" required defaultValue={user?.lastName} />
        </Field.Root>

        <Field.Root>
          <Field.Label>Role</Field.Label>
          <NativeSelect.Root>
            <NativeSelect.Field name="role" defaultValue={user?.role ?? "member"}>
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </NativeSelect.Field>
          </NativeSelect.Root>
        </Field.Root>

        <HStack justify="flex-end">
          <Button type="submit" colorPalette="brand" loading={isPending}>
            <LuSave /> {isEditing ? "Save Changes" : "Create User"}
          </Button>
        </HStack>
      </VStack>
    </form>
  );
}
```

---

## Phase 10 — Tests

### Service tests (most important — test business logic in isolation)

```ts
// src/modules/users/services.test.ts
import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { BusinessRuleError, ConflictError, NotFoundError } from "@/shared/lib/errors";

import { createUser, deleteUser, getUserById } from "./services";
import { USER_ERRORS } from "./errors";

describe("getUserById", () => {
  it("throws NotFoundError when user does not exist", async () => {
    // TODO: mock DB layer
    await expect(getUserById("nonexistent-id")).rejects.toThrow(NotFoundError);
    await expect(getUserById("nonexistent-id")).rejects.toMatchObject({
      code: USER_ERRORS.NOT_FOUND,
      statusCode: 404,
    });
  });
});

describe("deleteUser", () => {
  it("throws BusinessRuleError when deleting self", async () => {
    const userId = "user-123";
    // TODO: mock getUserById to return a user with this ID

    await expect(deleteUser(userId, userId)).rejects.toThrow(BusinessRuleError);
    await expect(deleteUser(userId, userId)).rejects.toMatchObject({
      code: USER_ERRORS.SELF_DELETE,
    });
  });
});
```

### Policy tests

```ts
// src/modules/users/policies.test.ts
import { describe, expect, it } from "vitest";

vi.mock("server-only", () => ({}));

import { createUserPolicy } from "./policies";

describe("createUserPolicy", () => {
  const admin = { id: "admin-1", role: "admin" as const };
  const member = { id: "member-1", role: "member" as const };
  const targetUser = { id: "member-2" } as any;
  const selfUser = { id: "admin-1" } as any;

  it("admin can delete other users", () => {
    const policy = createUserPolicy(admin, targetUser);
    expect(policy.canDelete).toBe(true);
  });

  it("admin cannot delete self", () => {
    const policy = createUserPolicy(admin, selfUser);
    expect(policy.canDelete).toBe(false);
  });

  it("member cannot create users", () => {
    const policy = createUserPolicy(member);
    expect(policy.canCreate).toBe(false);
  });

  it("member can view self", () => {
    const policy = createUserPolicy(member, { id: "member-1" } as any);
    expect(policy.canView).toBe(true);
  });
});
```

### Schema tests

```ts
// src/modules/users/types.test.ts
import { describe, expect, it } from "vitest";

import { createUserSchema, userFiltersSchema } from "./types";

describe("createUserSchema", () => {
  it("trims and lowercases email", () => {
    const result = createUserSchema.parse({
      email: "  ADMIN@Example.COM  ",
      firstName: "John",
      lastName: "Doe",
    });

    expect(result.email).toBe("admin@example.com");
  });

  it("defaults role to member", () => {
    const result = createUserSchema.parse({
      email: "test@example.com",
      firstName: "A",
      lastName: "B",
    });

    expect(result.role).toBe("member");
  });

  it("rejects invalid email", () => {
    expect(() =>
      createUserSchema.parse({ email: "not-email", firstName: "A", lastName: "B" }),
    ).toThrow();
  });
});

describe("userFiltersSchema", () => {
  it("coerces string page to number", () => {
    const result = userFiltersSchema.parse({ page: "3" });
    expect(result.page).toBe(3);
  });

  it("applies defaults", () => {
    const result = userFiltersSchema.parse({});
    expect(result.page).toBe(1);
    expect(result.perPage).toBe(20);
    expect(result.sortBy).toBe("createdAt");
    expect(result.sortOrder).toBe("desc");
  });
});
```

### Presenter tests

```ts
// src/modules/users/presenters.test.ts
import { describe, expect, it } from "vitest";

import { presentUser } from "./presenters";

import type { User } from "./types";

const mockUser: User = {
  id: "uuid-1",
  email: "john@example.com",
  firstName: "John",
  lastName: "Doe",
  role: "admin",
  status: "active",
  emailVerifiedAt: "2026-01-01T00:00:00Z",
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
};

describe("presentUser", () => {
  it("computes fullName", () => {
    expect(presentUser(mockUser).fullName).toBe("John Doe");
  });

  it("computes initials", () => {
    expect(presentUser(mockUser).initials).toBe("JD");
  });

  it("marks verified users", () => {
    expect(presentUser(mockUser).isVerified).toBe(true);
    expect(
      presentUser({ ...mockUser, emailVerifiedAt: null }).isVerified,
    ).toBe(false);
  });
});
```

---

## Phase 11 — Routes Registry

```ts
// src/shared/routes/private/users.ts
export const usersRoutes = {
  list: () => "/users",
  detail: (id: string) => `/users/${id}`,
  edit: (id: string) => `/users/${id}/edit`,
  new: () => "/users/new",
} as const;
```

```ts
// src/shared/routes/index.ts
import { root } from "./root";
import { usersRoutes } from "./private/users";

export const routes = {
  root,
  users: usersRoutes,
};
```

Usage:

```tsx
import { routes } from "@/shared/routes";

<Link href={routes.users.detail(user.id)}>View</Link>
<Link href={routes.users.edit(user.id)}>Edit</Link>
redirect(routes.users.list());
```

---

## Data Flow Diagrams

### Create User (via UI Form → Server Action)

```txt
UserForm.tsx (client)
  │  formAction(formData)
  ▼
createUserAction.ts (server)          "use server"
  │  1. authActionClient validates session (middleware)
  │  2. Zod parses createUserSchema
  │  3. authorizeUserAction("canCreate", ctx.user)
  ▼
services.ts :: createUser(input)
  │  1. Check email uniqueness        → ConflictError
  │  2. Insert into DB
  │  3. Return User
  ▼
Result flows back to client
  │  success → toaster.create({ type: "success" })
  │  serverError → toaster.create({ type: "error" })
```

### Get Users List (via API → SWR)

```txt
UserTable.tsx (client)
  │  useUsers({ search, page })
  │  SWR calls fetcher("/api/v1/users?search=...")
  ▼
GET /api/v1/users (route.ts)
  │  1. Parse searchParams → userFiltersSchema
  │  2. authorizeUserAction("canList", session.user)
  ▼
services.ts :: listUsers(filters)
  │  1. Query DB with filters
  │  2. Return PaginatedUsers
  ▼
presenters.ts :: presentUserList(result)
  │  Map each User → PresentedUser (fullName, initials, dates)
  ▼
NextResponse.json(presentedResult)
  │
  ▼
SWR caches + UserTable re-renders with data
```

### Delete User (via UI Dialog → Server Action)

```txt
DeleteUserDialog.tsx (client)
  │  onClick → execute deleteUserAction({ id })
  ▼
deleteUserAction.ts (server)
  │  1. Auth middleware
  │  2. authorizeUserAction("canDelete")
  ▼
services.ts :: deleteUser(id, currentUserId)
  │  1. getUserById(id)                → NotFoundError
  │  2. id === currentUserId?          → BusinessRuleError (SELF_DELETE)
  │  3. Last admin check?              → BusinessRuleError (LAST_ADMIN)
  │  4. Delete from DB
  ▼
Result → toast + SWR mutate (revalidate list)
```

---

## Conventions Summary

| Concern | Location | Naming | Guard |
| --- | --- | --- | --- |
| Types and Schemas | `modules/*/types.ts` | `camelCaseSchema`, `PascalCaseType` | — |
| Error Codes | `modules/*/errors.ts` | `SCREAMING_SNAKE` const object | — |
| Business Logic | `modules/*/services.ts` | async function, verb-noun | `import "server-only"` |
| Authorization | `modules/*/policies.ts` | `create*Policy()` returns object | `import "server-only"` |
| Response Shaping | `modules/*/presenters.ts` | `present*()` returns shaped object | — |
| Server Actions | `modules/*/actions/*.ts` | `*Action` suffix, one per file | `"use server"` |
| SWR Hooks | `modules/*/api/use-*.ts` | `use*()` hook | — |
| Components | `modules/*/components/*.tsx` | `PascalCase.tsx` | `"use client"` if needed |
| Route Handlers | `app/api/v1/*/route.ts` | HTTP verbs (`GET`, `POST`, etc.) | `import "server-only"` |
| Pages | `app/[locale]/(private or public)/*/page.tsx` | `default export` | — |
| Route Paths | `shared/routes/*/` | `*Routes` object with functions | — |

---

## Anti-Patterns to Avoid

### 1. Business logic in Route Handlers or Server Actions

```ts
// ❌ BAD — logic scattered in the handler
export async function POST(request: NextRequest) {
  const body = await request.json();
  const existing = await db.users.findByEmail(body.email); // logic here
  if (existing) return NextResponse.json({ error: "exists" }, { status: 409 });
  const user = await db.users.create({ data: body });        // and here
  return NextResponse.json(user);
}

// ✅ GOOD — handler is a thin wrapper
export async function POST(request: NextRequest) {
  try {
    const input = createUserSchema.parse(await request.json());
    const user = await createUser(input);   // all logic in service
    return NextResponse.json({ data: user }, { status: 201 });
  } catch (err) {
    return errorResponse(err);
  }
}
```

### 2. Formatting dates or names in components

```tsx
// ❌ BAD — formatting in JSX
<Text>{dayjs(user.createdAt).format("D MMM BBBB")}</Text>
<Text>{user.firstName} {user.lastName}</Text>

// ✅ GOOD — use presenter
const presented = presentUser(user);
<Text>{presented.joinedAt}</Text>
<Text>{presented.fullName}</Text>
```

### 3. String-based error checking

```ts
// ❌ BAD
if (error.message.includes("not found")) { ... }

// ✅ GOOD
if (error instanceof NotFoundError) { ... }
if (error.code === USER_ERRORS.NOT_FOUND) { ... }
```

### 4. Duplicating validation between client and server

```ts
// ❌ BAD — separate schemas for form and action
const clientSchema = z.object({ email: z.string().email() });  // in component
const serverSchema = z.object({ email: z.string().email() });  // in action

// ✅ GOOD — single source of truth
// types.ts defines createUserSchema
// Both the form and the action import from types.ts
```

### 5. Deeply nested folders for simple modules

```txt
// ❌ BAD — over-engineered for a CRUD
modules/users/lib/services/user-service/create-user-service.ts

// ✅ GOOD — flat is better until complexity demands otherwise
modules/users/services.ts
```

### 6. Calling `notFound()` from services

```ts
// ❌ BAD — service depends on Next.js
import { notFound } from "next/navigation";
if (!user) notFound(); // couples service to Next.js runtime

// ✅ GOOD — service throws pure domain error
if (!user) throw new NotFoundError("User", id, USER_ERRORS.NOT_FOUND);
// The page/route handler converts to notFound() or HTTP 404
```

---

## When to Split from Flat Files

| Signal | Action |
| --- | --- |
| `services.ts` exceeds ~200 lines | Split into `services/create-user.ts`, etc. |
| Need shared service helpers | Create `services/helpers.ts` |
| Multiple Zod schemas with transforms | Split `types.ts` into `types/schemas/` |
| More than 5 UI components | Already in `components/` folder |
| Cross-module shared logic | Move to `src/shared/lib/` |
