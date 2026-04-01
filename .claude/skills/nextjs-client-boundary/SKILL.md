---
name: nextjs-client-boundary
description: This skill should be used when deciding about "use client", client components, or client boundaries. Guides when to use client components.
---

# Next.js Client Boundary

Use this skill when deciding where to place "use client" directives.

## Reference

- CLAUDE.md (Server-First Rules)
- .claude/workflow-profile.json (conventions)

## The Rule

**Server Components are the default. Add "use client" only when necessary.**

## When "use client" is Required

### 1. React Hooks

```tsx
// NEEDS "use client" - uses useState
'use client';

import { useState } from 'react';

export function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}
```

### 2. Event Handlers

```tsx
// NEEDS "use client" - has onClick
'use client';

export function SubmitButton({ onSubmit }) {
  return <button onClick={onSubmit}>Submit</button>;
}
```

### 3. Browser APIs

```tsx
// NEEDS "use client" - uses window/localStorage
'use client';

import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const saved = localStorage.getItem('theme');
    if (saved) setTheme(saved);
  }, []);

  return <button onClick={() => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    localStorage.setItem('theme', newTheme);
    setTheme(newTheme);
  }}>Toggle</button>;
}
```

### 4. Client-Only Libraries

```tsx
// NEEDS "use client" - uses client-only library
'use client';

import { motion } from 'framer-motion';

export function AnimatedCard({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {children}
    </motion.div>
  );
}
```

## When "use client" is NOT Needed

### 1. Static Content

```tsx
// NO "use client" - just renders data
export function UserCard({ user }) {
  return (
    <div>
      <h2>{user.name}</h2>
      <p>{user.email}</p>
    </div>
  );
}
```

### 2. Data Fetching

```tsx
// NO "use client" - fetches data on server
export async function UserList() {
  const users = await db.user.findMany();
  return (
    <ul>
      {users.map(user => <li key={user.id}>{user.name}</li>)}
    </ul>
  );
}
```

### 3. Server Actions (Form Action)

```tsx
// NO "use client" - uses server action via form action
import { createUser } from './actions';

export function CreateUserForm() {
  return (
    <form action={createUser}>
      <input name="name" />
      <button type="submit">Create</button>
    </form>
  );
}
```

## Boundary Placement Strategy

### Push Client Boundaries to Leaves

```
┌─────────────────────────────────────┐
│ Screen (Server)                     │
│  ├─ Header (Server)                 │
│  ├─ Content (Server)                │
│  │   ├─ UserCard (Server)           │
│  │   └─ Actions                     │
│  │       └─ LikeButton (Client) ←── │ "use client" here
│  └─ Footer (Server)                 │
└─────────────────────────────────────┘
```

### Bad: Too High

```tsx
// BAD - entire page is client
'use client';

export function UserPage() {
  const [user, setUser] = useState(null);
  // Everything is now client-side
}
```

### Good: At the Leaf

```tsx
// GOOD - screen is server, only interactive parts are client

// UserScreen.tsx (Server)
export async function UserScreen({ userId }) {
  const user = await getUser(userId);
  return (
    <div>
      <UserInfo user={user} />      {/* Server */}
      <UserActions userId={userId} /> {/* Client */}
    </div>
  );
}

// UserActions.tsx (Client)
'use client';

export function UserActions({ userId }) {
  return (
    <div>
      <FollowButton userId={userId} />
      <MessageButton userId={userId} />
    </div>
  );
}
```

## Module Directory Guidelines

| Directory | Default | Notes |
|-----------|---------|-------|
| `screens/` | Server | Page-level composition, data fetching |
| `components/` | Server | Pure UI, can have client leaves |
| `containers/` | Client | Logic binding, hooks, event handlers |
| `hooks/` | Client | All hooks are client-side |
| `actions/` | Server | Server actions with "use server" |

## Composition Patterns

### Server Parent, Client Child

```tsx
// ParentScreen.tsx (Server)
export async function ParentScreen() {
  const data = await fetchData();
  return <ClientChild initialData={data} />;
}

// ClientChild.tsx (Client)
'use client';

export function ClientChild({ initialData }) {
  const [data, setData] = useState(initialData);
  // Interactive logic here
}
```

### Client Parent, Server Child (Using children)

```tsx
// ClientWrapper.tsx (Client)
'use client';

export function ClientWrapper({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div>
      <button onClick={() => setIsOpen(!isOpen)}>Toggle</button>
      {isOpen && children}
    </div>
  );
}

// Usage in Server Component
export function Page() {
  return (
    <ClientWrapper>
      <ServerContent /> {/* This stays server! */}
    </ClientWrapper>
  );
}
```

## Common Mistakes

### Mistake 1: Adding "use client" for Server Actions

```tsx
// WRONG - Server actions work without "use client"
'use client'; // <- Remove this

import { submitForm } from './actions';

export function Form() {
  return <form action={submitForm}>...</form>;
}
```

### Mistake 2: Passing Functions to Server Components

```tsx
// WRONG - Can't pass functions from client to server
'use client';

export function Parent() {
  const handleClick = () => console.log('clicked');
  return <ServerComponent onClick={handleClick} />; // Error!
}
```

### Mistake 3: Using "use client" in screens/

```tsx
// WRONG - Screens should be server components
'use client'; // <- Remove, move logic to container

export function UserScreen() {
  const [users, setUsers] = useState([]);
  // ...
}

// RIGHT - Screen fetches data, container handles interactivity
export async function UserScreen() {
  const users = await fetchUsers();
  return <UserListContainer initialUsers={users} />;
}
```

## Do Not

- Add "use client" to screens/ — keep them as server components
- Mark entire pages as client — push boundaries to leaves
- Pass functions from client to server components
- Use "use client" just because a child needs it — extract the child
- Forget that form action works without "use client"
