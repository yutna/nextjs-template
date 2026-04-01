---
name: nextjs-architecture
description: This skill should be used when discussing architecture, App Router, RSC, or server components. Provides Next.js App Router fundamentals and React Server Component patterns.
---

# Next.js Architecture

Use this skill when working with Next.js App Router architecture, React Server Components (RSC), or routing decisions.

## Reference

- CLAUDE.md (Next.js Architecture section)
- .claude/workflow-profile.json (stack configuration)

## App Router Fundamentals

### Route Structure

```
src/app/
├── [locale]/
│   ├── layout.tsx          # Root layout with providers
│   ├── page.tsx            # Home page
│   ├── (auth)/             # Route group for auth
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   └── dashboard/
│       ├── layout.tsx      # Dashboard layout
│       └── page.tsx
├── api/                    # API routes (if needed)
└── globals.css
```

### Route Conventions

- Use route groups `(groupName)` for organization without affecting URL
- Use dynamic segments `[param]` for dynamic routes
- Use catch-all segments `[...slug]` for flexible routing
- Use optional catch-all `[[...slug]]` when the route should also match without params

## React Server Components (RSC)

### Default Behavior

- All components in `app/` are Server Components by default
- Server Components can:
  - Fetch data directly (no useEffect needed)
  - Access backend resources directly
  - Keep sensitive data on server
  - Reduce client bundle size

### When to Use Client Components

Add `"use client"` directive only when you need:
- React hooks (useState, useEffect, useContext)
- Browser APIs (window, localStorage)
- Event handlers (onClick, onChange)
- Third-party client-only libraries

### Component Composition Pattern

```tsx
// src/modules/users/screens/UserListScreen.tsx (Server)
import { UserListContainer } from '../containers/UserListContainer';
import { fetchUsers } from '../actions/fetchUsers';

export async function UserListScreen() {
  const users = await fetchUsers();
  return <UserListContainer initialUsers={users} />;
}

// src/modules/users/containers/UserListContainer.tsx (Client)
'use client';

import { useState } from 'react';
import { UserCard } from '../components/UserCard';

export function UserListContainer({ initialUsers }) {
  const [users, setUsers] = useState(initialUsers);
  // Client-side interactivity here
  return <div>{users.map(u => <UserCard key={u.id} user={u} />)}</div>;
}
```

## Data Flow

### Server → Client

1. Fetch data in Server Components or Server Actions
2. Pass as props to Client Components
3. Client Components manage local state

### Client → Server

1. Use Server Actions for mutations
2. Use `revalidatePath` or `revalidateTag` for cache invalidation
3. Use `useTransition` for pending states

## Caching Strategy

- `fetch()` requests are cached by default
- Use `cache: 'no-store'` for dynamic data
- Use `revalidate` for time-based revalidation
- Use `unstable_cache` for function caching

## Do Not

- Add "use client" to screens/ — they should remain server components
- Fetch data in Client Components when Server Components can do it
- Use `getServerSideProps` or `getStaticProps` — use App Router patterns
- Create API routes for data that can be fetched directly in Server Components
