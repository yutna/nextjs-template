---
name: nextjs-module-design
description: This skill should be used when creating a module, feature module, or new feature. Guides module structure with containers, screens, components, and actions.
---

# Next.js Module Design

Use this skill when creating or modifying feature modules in `src/modules/`.

## Reference

- CLAUDE.md (Module Structure section)
- .claude/workflow-profile.json (structure.moduleSubdirs)

## Module Structure

Each feature module follows this structure:

```
src/modules/<module-name>/
├── actions/           # Server actions (next-safe-action + Zod)
│   ├── createUser.ts
│   └── index.ts
├── components/        # Pure UI components (mostly server)
│   ├── UserCard.tsx
│   └── index.ts
├── containers/        # Logic binding layer (client when needed)
│   ├── UserListContainer.tsx
│   └── index.ts
├── screens/           # Page-level composition (server)
│   ├── UserListScreen.tsx
│   └── index.ts
├── hooks/             # Custom hooks (client)
│   ├── useUserFilters.ts
│   └── index.ts
├── contexts/          # React contexts (if needed)
│   └── UserContext.tsx
├── lib/               # Module-specific utilities
│   └── userHelpers.ts
├── styles/            # Module CSS (if needed)
│   └── users.css
├── constants/         # Module constants
│   └── userTypes.ts
└── index.ts           # Barrel export
```

## Role of Each Directory

### actions/
Server-side mutations using next-safe-action + Zod:
```typescript
// src/modules/users/actions/createUser.ts
'use server';

import { actionClient } from '@/shared/lib/safe-action';
import { createUserSchema } from '../schemas/userSchemas';

export const createUser = actionClient
  .schema(createUserSchema)
  .action(async ({ parsedInput }) => {
    // Create user logic
    return { success: true, user };
  });
```

### components/
Pure UI components, mostly Server Components:
```tsx
// src/modules/users/components/UserCard.tsx
interface UserCardProps {
  user: User;
}

export function UserCard({ user }: UserCardProps) {
  return (
    <Card>
      <CardBody>
        <Text>{user.name}</Text>
      </CardBody>
    </Card>
  );
}
```

### containers/
Client Components that bind logic to UI:
```tsx
// src/modules/users/containers/UserFormContainer.tsx
'use client';

import { useAction } from 'next-safe-action/hooks';
import { createUser } from '../actions/createUser';
import { UserForm } from '../components/UserForm';

export function UserFormContainer() {
  const { execute, status } = useAction(createUser);

  return (
    <UserForm
      onSubmit={execute}
      isLoading={status === 'executing'}
    />
  );
}
```

### screens/
Server Components for page composition:
```tsx
// src/modules/users/screens/UserListScreen.tsx
import { fetchUsers } from '../actions/fetchUsers';
import { UserListContainer } from '../containers/UserListContainer';
import { UserHeader } from '../components/UserHeader';

export async function UserListScreen() {
  const users = await fetchUsers();

  return (
    <div>
      <UserHeader />
      <UserListContainer initialUsers={users} />
    </div>
  );
}
```

### hooks/
Custom React hooks for reusable logic:
```tsx
// src/modules/users/hooks/useUserFilters.ts
'use client';

import { useQueryStates } from 'nuqs';

export function useUserFilters() {
  return useQueryStates({
    search: parseAsString,
    role: parseAsString,
  });
}
```

## Creating a New Module

1. Create directory structure:
   ```bash
   mkdir -p src/modules/<name>/{actions,components,containers,screens,hooks}
   ```

2. Create barrel export:
   ```typescript
   // src/modules/<name>/index.ts
   export * from './screens';
   export * from './containers';
   export * from './components';
   ```

3. Add translations:
   ```
   src/messages/en/modules/<name>/index.json
   src/messages/th/modules/<name>/index.json
   ```

4. Connect to route:
   ```tsx
   // src/app/[locale]/<route>/page.tsx
   import { ModuleScreen } from '@/modules/<name>';

   export default function Page() {
     return <ModuleScreen />;
   }
   ```

## Naming Conventions

- Module directory: kebab-case (`user-management`)
- Components: PascalCase (`UserCard.tsx`)
- Actions: camelCase (`createUser.ts`)
- Hooks: camelCase with `use` prefix (`useUserFilters.ts`)

## Do Not

- Put business logic in components/ — use containers/ or actions/
- Add "use client" to screens/ — they should be server components
- Create circular dependencies between modules
- Skip the barrel export — it enables clean imports
