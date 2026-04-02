---
name: nextjs-module-design
description: This skill should be used when creating a module, feature module, or new feature. Guides module structure with containers, screens, components, and actions.
triggers:
  - create module
  - feature module
  - new feature
  - module structure
---

# Next.js Module Design

Use this skill when creating or modifying feature modules in `src/modules/`.

## Reference

- CLAUDE.md (Module Structure section)
- .claude/workflow-profile.json (structure.moduleSubdirs)
- .claude/skills/code-conventions/ (naming patterns)
- .claude/skills/effect-patterns/ (backend patterns)

## Module Structure (Full-Stack)

Each feature module follows this structure:

```
src/modules/<module-name>/
├── actions/           # Server actions (next-safe-action + Zod)
│   └── create-user-action/
│       ├── index.ts
│       ├── types.ts
│       ├── create-user-action.ts
│       └── create-user-action.test.ts
├── api/               # Route handlers (external endpoints)
│   └── webhook-handler/
├── services/          # Business logic (Effect)
│   └── create-user-service/
├── repositories/      # Data access (Effect + Drizzle)
│   └── user-repository/
├── jobs/              # Background jobs (Trigger.dev)
│   └── send-welcome-email-job/
├── policies/          # Authorization logic
│   └── user-policy/
├── schemas/           # Zod schemas (validation)
│   └── create-user-schema/
├── components/        # Pure UI components (mostly server)
│   └── card-user/
├── containers/        # Logic binding layer (client when needed)
│   └── container-user-list/
├── screens/           # Page-level composition (server)
│   └── screen-user-list/
├── hooks/             # Custom hooks (client)
│   └── use-user-filters/
├── contexts/          # React contexts
├── layouts/           # Feature-specific layouts (rare)
├── lib/               # Domain implementations, wrappers
├── providers/         # Feature-scoped providers
├── types/             # Module-wide types
├── constants/         # Module constants
└── utils/             # Pure utility functions
```

## Naming Patterns (MUST FOLLOW)

| Folder | Pattern | Example |
|--------|---------|---------|
| actions | `<name>-action/` | `create-user-action/` |
| api | `<name>-handler/` | `webhook-stripe-handler/` |
| services | `<name>-service/` | `create-user-service/` |
| repositories | `<name>-repository/` | `user-repository/` |
| jobs | `<name>-job/` | `send-welcome-email-job/` |
| policies | `<name>-policy/` | `user-policy/` |
| components | `<semantic-type>-<name>/` | `form-create-user/`, `card-user/` |
| containers | `container-<name>/` | `container-user-list/` |
| screens | `screen-<name>/` | `screen-user-list/` |
| hooks | `use-<name>/` | `use-user-filters/` |

## Layer Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    screens/ (Server Components)             │
│                      Page composition                       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              containers/ (Client when needed)               │
│                   Logic binding layer                       │
└─────────────────────────────────────────────────────────────┘
          │                                    │
          ▼                                    ▼
┌─────────────────────┐              ┌────────────────────────┐
│    components/      │              │       actions/         │
│   (Pure UI, RSC)    │              │   (Server mutations)   │
└─────────────────────┘              └────────────────────────┘
                                               │
                                               ▼
                              ┌────────────────────────────────┐
                              │         services/              │
                              │   (Business logic, Effect)     │
                              └────────────────────────────────┘
                                               │
                                               ▼
                              ┌────────────────────────────────┐
                              │       repositories/            │
                              │   (Data access, Drizzle)       │
                              └────────────────────────────────┘
                                               │
                                               ▼
                              ┌────────────────────────────────┐
                              │    shared/entities/            │
                              │      (Drizzle schemas)         │
                              └────────────────────────────────┘
```

## Role of Each Directory

### Frontend Layers

#### screens/
Server Components for page composition:
```tsx
// screen-user-list/screen-user-list.tsx
import { ContainerUserList } from "../containers/container-user-list";
import { SectionUserHeader } from "../components/section-user-header";

export async function ScreenUserList() {
  const users = await getUsersService();

  return (
    <div>
      <SectionUserHeader />
      <ContainerUserList initialUsers={users} />
    </div>
  );
}
```

#### containers/
Client Components that bind logic to UI:
```tsx
// container-user-form/container-user-form.tsx
"use client";

import { useAction } from "next-safe-action/hooks";
import { createUserAction } from "../../actions/create-user-action";
import { FormCreateUser } from "../../components/form-create-user";

export function ContainerUserForm() {
  const { execute, status } = useAction(createUserAction);

  return (
    <FormCreateUser
      onSubmit={execute}
      isLoading={status === "executing"}
    />
  );
}
```

#### components/
Pure UI components, mostly Server Components:
```tsx
// card-user/card-user.tsx
import { Card, CardBody, Text } from "@chakra-ui/react";
import type { CardUserProps } from "./types";

export function CardUser({ user }: CardUserProps) {
  return (
    <Card>
      <CardBody>
        <Text>{user.name}</Text>
      </CardBody>
    </Card>
  );
}
```

### Backend Layers

#### actions/
Server actions using next-safe-action + Zod:
```typescript
// create-user-action/create-user-action.ts
"use server";

import { Effect } from "effect";
import { actionClient } from "@/shared/lib/safe-action";
import { createUserService } from "../../services/create-user-service";
import { createUserSchema } from "../../schemas/create-user-schema";

export const createUserAction = actionClient
  .schema(createUserSchema)
  .action(async ({ parsedInput }) => {
    const result = await Effect.runPromise(
      createUserService(parsedInput).pipe(
        Effect.map((user) => ({ success: true, user })),
        Effect.catchAll((error) =>
          Effect.succeed({ success: false, error: error._tag })
        )
      )
    );
    return result;
  });
```

#### services/
Business logic using Effect (ALWAYS):
```typescript
// create-user-service/create-user-service.ts
import { Effect } from "effect";
import { UserRepository } from "../../repositories/user-repository";
import type { CreateUserInput } from "./types";

export const createUserService = (input: CreateUserInput) =>
  Effect.gen(function* () {
    // Check for duplicate
    const existing = yield* UserRepository.findByEmail(input.email);
    if (existing) {
      yield* Effect.fail(new DuplicateEmailError(input.email));
    }

    // Create user
    const user = yield* UserRepository.create(input);

    // Trigger welcome email job
    yield* triggerWelcomeEmail(user);

    return user;
  });
```

#### repositories/
Data access using Effect + Drizzle:
```typescript
// user-repository/user-repository.ts
import { Effect } from "effect";
import { eq } from "drizzle-orm";
import { db } from "@/shared/db";
import { users } from "@/shared/entities/user";

export const UserRepository = {
  findByEmail: (email: string) =>
    Effect.tryPromise({
      try: () => db.query.users.findFirst({ where: eq(users.email, email) }),
      catch: (error) => new DatabaseError(error),
    }),

  create: (data: NewUser) =>
    Effect.tryPromise({
      try: async () => {
        const [user] = await db.insert(users).values(data).returning();
        return user;
      },
      catch: (error) => new DatabaseError(error),
    }),
};
```

## Creating a New Module

1. Create directory structure:
   ```bash
   mkdir -p src/modules/<name>/{actions,services,repositories,components,containers,screens,hooks,schemas}
   ```

2. Create types and schemas first
3. Create repository (Effect + Drizzle)
4. Create service (Effect business logic)
5. Create action (next-safe-action wrapper)
6. Create UI components
7. Create containers
8. Create screen
9. Add translations in `src/messages/{en,th}/modules/<name>/`
10. Connect to route in `src/app/[locale]/`

## Import Rules

```typescript
// ✅ Same folder
import { UserProps } from "./types";

// ✅ Cross folder with alias
import { db } from "@/shared/db";
import { users } from "@/shared/entities/user";

// ❌ NO relative imports beyond current folder
import { something } from "../../services/some-service";

// ❌ NO cross-module imports
import { something } from "@/modules/other-module/...";
```

## Do Not

- Put business logic in components/ — use services/
- Add "use client" to screens/ — they should be server components
- Create circular dependencies between modules
- Import from other modules — move shared code to shared/
- Write backend code without Effect
- Put entities in modules — always in shared/entities/
- Use relative imports like `../../`
