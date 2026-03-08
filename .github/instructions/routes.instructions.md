---
applyTo: "src/shared/routes/**"
---

# Route Helpers

## Purpose

`src/shared/routes/` is the single source of truth for user-facing path builders.
Application code should consume route helpers instead of duplicating raw path strings.

## Core rules

- Every route helper exposes a `path` function
- Return locale-neutral paths — no `/th` or `/en` prefix (locale is handled by
  `@/shared/lib/navigation`)
- Do NOT expose route-group syntax (`(public)`, `(private)`) in returned URLs
- Do NOT expose slot names (`@modal`) or interceptor syntax (`(.)`, `(..)`)
- Return plain strings

## Folder structure

Organize by route family:

```text
src/shared/routes/
├── index.ts
├── root/
│   └── index.ts
├── public/
│   ├── index.ts
│   └── sign-in/
│       └── index.ts
└── private/
    ├── index.ts
    └── dashboard/
        └── index.ts
```

- kebab-case folder names for concrete segments
- `root`, `public`, `private` as organizational groups only
- One route helper per leaf folder
- Top-level `index.ts` aggregates the full route API

## Public API shape

```ts
routes.root.path()
routes.public.signIn.path()
routes.private.dashboard.path()
routes.private.users.detail.path(userId)
```

### Static routes

```ts
export const root = {
  path: () => "/",
};
```

### Dynamic routes

Use explicit, descriptive parameter names:

```ts
export const users = {
  detail: {
    path: (userId: string) => `/users/${userId}`,
  },
};
```

Prefer `userId`, `slug`, `invoiceId` — avoid generic `value` or `id`.

### Catch-all routes

Only when the URL contract truly needs arbitrary segments:

```ts
export const docs = {
  page: {
    path: (...segments: string[]) => `/docs/${segments.join("/")}`,
  },
};
```

## Top-level aggregation

```ts
import { root } from "./root";
import { privateRoutes } from "./private";
import { publicRoutes } from "./public";

export const routes = {
  root,
  private: privateRoutes,
  public: publicRoutes,
};
```

## Consumption

Always use helpers instead of hardcoded strings:

```tsx
<Link href={routes.root.path()} />
```

```ts
redirect(routes.private.dashboard.path());
```

## Anti-patterns

- Route-group syntax in returned URLs
- Slot names or interceptor syntax in helpers
- Hardcoded path strings across components
- Locale prefixes in route helper outputs
- Inconsistent helper names (use `path` everywhere)

## Checklist

- [ ] Represents a real user-facing URL
- [ ] Returns the real URL, not route-group syntax
- [ ] Dynamic routes accept explicit descriptive parameters
- [ ] Locale handling left to the navigation layer
- [ ] Consuming code uses the helper, not a duplicated string
- [ ] Folder is kebab-case, organized by route family
