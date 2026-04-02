---
name: nextjs-data-access
description: This skill should be used when fetching data, setting up SWR, or implementing data fetching patterns. Guides data access patterns for Next.js.
---

# Next.js Data Access

Use this skill when implementing data fetching, caching, or data access patterns.

## Reference

- CLAUDE.md (Next.js Architecture section)
- .claude/workflow-profile.json (stack configuration)

## Server-Side Data Fetching

### In Server Components (Recommended)

```tsx
// src/modules/users/screens/UserListScreen.tsx
import { db } from '@/shared/lib/db';

export async function UserListScreen() {
  // Direct database access in Server Components
  const users = await db.user.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return <UserList users={users} />;
}
```

### With Caching

```tsx
import { unstable_cache } from 'next/cache';
import { db } from '@/shared/lib/db';

const getUsers = unstable_cache(
  async () => {
    return db.user.findMany();
  },
  ['users'],
  {
    revalidate: 60, // 60 seconds
    tags: ['users'],
  }
);

export async function UserListScreen() {
  const users = await getUsers();
  return <UserList users={users} />;
}
```

### External API Fetching

```tsx
// src/modules/products/lib/api.ts
export async function fetchProducts() {
  const res = await fetch('https://api.example.com/products', {
    next: {
      revalidate: 3600, // Cache for 1 hour
      tags: ['products'],
    },
  });

  if (!res.ok) {
    throw new Error('Failed to fetch products');
  }

  return res.json();
}

// Usage in Server Component
export async function ProductListScreen() {
  const products = await fetchProducts();
  return <ProductList products={products} />;
}
```

## Client-Side Data Fetching

### With SWR (Recommended for Client)

```tsx
// src/shared/lib/fetcher.ts
export const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    const error = new Error('An error occurred while fetching');
    error.info = await res.json();
    error.status = res.status;
    throw error;
  }
  return res.json();
};

// src/modules/users/hooks/useUsers.ts
'use client';

import useSWR from 'swr';
import { fetcher } from '@/shared/lib/fetcher';

export function useUsers() {
  const { data, error, isLoading, mutate } = useSWR(
    '/api/users',
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
    }
  );

  return {
    users: data,
    isLoading,
    isError: error,
    mutate,
  };
}
```

### SWR with Optimistic Updates

```tsx
'use client';

import useSWR from 'swr';
import { updateUser } from '../actions/updateUser';

export function useUser(id: string) {
  const { data, mutate } = useSWR(`/api/users/${id}`, fetcher);

  const update = async (updates: Partial<User>) => {
    // Optimistic update
    mutate({ ...data, ...updates }, false);

    try {
      const result = await updateUser({ id, ...updates });
      mutate(result.user);
    } catch (error) {
      // Revert on error
      mutate(data);
      throw error;
    }
  };

  return { user: data, update };
}
```

### SWR Global Configuration

```tsx
// src/shared/providers/SWRProvider.tsx
'use client';

import { SWRConfig } from 'swr';
import { fetcher } from '@/shared/lib/fetcher';

export function SWRProvider({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig
      value={{
        fetcher,
        revalidateOnFocus: false,
        shouldRetryOnError: false,
      }}
    >
      {children}
    </SWRConfig>
  );
}
```

## Hybrid Patterns

### Server Fetch + Client Refresh

```tsx
// Screen fetches initial data
export async function UserListScreen() {
  const initialUsers = await fetchUsers();
  return <UserListContainer initialUsers={initialUsers} />;
}

// Container handles client-side updates
'use client';

export function UserListContainer({ initialUsers }) {
  const { data: users } = useSWR('/api/users', fetcher, {
    fallbackData: initialUsers,
  });

  return <UserList users={users} />;
}
```

### Parallel Data Fetching

```tsx
export async function DashboardScreen() {
  // Parallel fetching for better performance
  const [users, posts, stats] = await Promise.all([
    fetchUsers(),
    fetchPosts(),
    fetchStats(),
  ]);

  return (
    <Dashboard
      users={users}
      posts={posts}
      stats={stats}
    />
  );
}
```

## Caching Strategies

### Static Data (Build Time)

```tsx
// For data that rarely changes
export const dynamic = 'force-static';

export async function StaticPage() {
  const data = await fetchStaticContent();
  return <Content data={data} />;
}
```

### Dynamic Data (Request Time)

```tsx
// For user-specific or frequently changing data
export const dynamic = 'force-dynamic';

export async function DynamicPage() {
  const data = await fetchDynamicContent();
  return <Content data={data} />;
}
```

### Time-Based Revalidation

```tsx
export const revalidate = 60; // Revalidate every 60 seconds

export async function TimedPage() {
  const data = await fetchContent();
  return <Content data={data} />;
}
```

### On-Demand Revalidation

```typescript
// In a Server Action
import { revalidateTag, revalidatePath } from 'next/cache';

export async function updateProduct(data) {
  await db.product.update(data);

  // Revalidate specific tag
  revalidateTag('products');

  // Or revalidate specific path
  revalidatePath('/products');
}
```

## Error Handling

### Server-Side Errors

```tsx
// src/app/[locale]/users/error.tsx
'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={reset}>Try again</button>
    </div>
  );
}
```

### Loading States

```tsx
// src/app/[locale]/users/loading.tsx
export default function Loading() {
  return <UserListSkeleton />;
}
```

## Do Not

- Fetch data in Client Components when Server Components can do it
- Use `useEffect` for initial data fetching — use Server Components
- Skip error boundaries — always handle fetch errors gracefully
- Forget to set appropriate cache headers
- Over-fetch data — only fetch what you need
