# Routes Folder Style Guide

This guide defines how to design and use route helpers in `src/shared/routes`.

The purpose of `src/shared/routes` is to be the single source of truth for **user-facing path builders**. The `src/app` tree is still the source of rendering structure and Next.js file conventions, but application code should consume route helpers instead of duplicating raw path strings.

## 1. Role of `shared/routes`

Use `src/shared/routes` for:

- user-facing page paths
- explicit path builders for dynamic segments
- stable route group organization such as `root`, `public`, and `private`
- paths consumed by links, redirects, buttons, navigation, and route-aware logic

Do **not** use `shared/routes` for:

- filesystem-only App Router details
- route-group syntax such as `(public)` or `(private)` in returned URLs
- private folders prefixed with `_`
- slot names such as `@modal`
- interceptor matchers such as `(.)`, `(..)`, or `(...)`

Rule of thumb:

- if it is part of the navigable URL contract, model it in `shared/routes`
- if it only exists to organize `src/app`, keep it in the `app/` tree, not in the route helper API

## 2. Relationship to Next.js App Router

The route helper layer should reflect App Router concepts **selectively**.

### Mirror these concepts

- static segments
- dynamic segments
- catch-all segments when they map to a real URL contract
- logical route families such as root/public/private sections

### Do not mirror these literally

- route groups like `(public)` and `(private)`
- private folders like `_components`
- parallel route slots like `@modal`
- intercepting route syntax like `(.)photo/[id]`

These App Router features affect rendering structure, not necessarily the public URL API.

## 3. Route groups should reflect URL meaning, not filesystem syntax

`src/shared/routes` may use `root`, `public`, and `private` as organizational groups, but the generated path must reflect the real URL, not the route-group folder name.

Good:

```ts
export const publicRoutes = {
  signIn: {
    path: () => "/sign-in",
  },
};
```

Avoid:

```ts
export const publicRoutes = {
  signIn: {
    path: () => "/(public)/sign-in",
  },
};
```

Route-group folders help organize `src/app`, but they do not appear in the URL and should not leak into route helpers.

## 4. Keep locale handling out of route paths

This project uses locale-aware navigation wrappers from `@/shared/lib/navigation`.

Because locale handling is already applied there:

- route helpers should return locale-neutral paths such as `"/"` or `"/sign-in"`
- do not add `"/th"` or `"/en"` manually in route helpers
- do not add locale parameters to normal route builder APIs unless a route genuinely needs them for a different reason

Good:

```ts
export const root = {
  path: () => "/",
};
```

Use these helpers with:

- `Link` from `@/shared/lib/navigation`
- `redirect` from `@/shared/lib/navigation`
- router helpers from the same navigation layer

## 5. File and folder structure

Organize route helpers by route family.

Good structure:

```txt
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

Rules:

- use kebab-case folder names for concrete route segments
- use `root`, `public`, and `private` only as organizational route-helper groups
- keep one route helper object per leaf folder
- use a leaf `index.ts` inside each route folder
- keep the top-level `src/shared/routes/index.ts` as the public aggregator for the route API

## 6. Public API shape

Prefer a predictable nested API:

```ts
routes.root.path()
routes.public.signIn.path()
routes.private.dashboard.path()
routes.private.users.detail.path(userId)
```

Rules:

- every route helper should expose a `path` function
- use `path: () => "/static-path"` for static routes
- use `path: (id: string) => \`/users/${id}\`` for dynamic routes
- keep return values as plain strings
- keep the API noun-based and stable

Avoid mixing shapes like:

- `url`
- `href`
- `to`
- `buildPath`

Use `path` consistently.

## 7. Dynamic segment conventions

When an App Router segment is dynamic, the route helper should accept explicit parameters that match the user-facing URL contract.

Good:

```ts
export const users = {
  detail: {
    path: (userId: string) => `/users/${userId}`,
  },
};
```

Prefer descriptive parameter names:

- `userId`
- `slug`
- `invoiceId`

Avoid:

```ts
path: (value: string) => `/users/${value}`;
```

## 8. Catch-all and optional catch-all segments

Use catch-all helpers only when the URL contract truly needs arbitrary nested segments.

Good:

```ts
export const docs = {
  page: {
    path: (...segments: string[]) => `/docs/${segments.join("/")}`,
  },
};
```

If the route can be modeled with a clearer fixed helper, prefer the clearer API.

Do not introduce catch-all route helpers just because the App Router filesystem supports them.

## 9. Parallel and intercepting routes

Most parallel-route and intercepting-route details should stay out of `shared/routes`.

Examples:

- `@modal`
- `(.)photo/[id]`
- `default.tsx` for slot fallback

These are rendering mechanics, not usually separate public route contracts.

If a modal or intercepted route corresponds to a real navigable page such as `/photos/123`, model only the real URL:

```ts
export const photos = {
  detail: {
    path: (photoId: string) => `/photos/${photoId}`,
  },
};
```

Do not create route helpers that expose interceptor syntax or slot names.

## 10. Naming

Name route helper folders and objects after the URL concept they represent.

Prefer:

- `root`
- `sign-in`
- `dashboard`
- `users`
- `settings`

For nested APIs:

- `routes.public.signIn`
- `routes.private.dashboard`
- `routes.private.users.detail`

Avoid:

- `routeHelpers`
- `pages`
- `paths`
- names copied from filesystem-only conventions such as `(private)` or `@modal`

## 11. Imports and exports

The top-level `src/shared/routes/index.ts` should expose the full route API.

Good:

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

Leaf exports should stay focused:

```ts
export const root = {
  path: () => "/",
};
```

Rules:

- export route objects, not unrelated helpers
- keep each route folder responsible only for its own subtree
- avoid dumping all route definitions into one large file as the app grows

## 12. Consumption rules

Application code should use route helpers instead of hardcoded strings.

Good:

```tsx
<Link href={routes.root.path()} />
```

```ts
redirect(routes.private.dashboard.path());
```

Avoid:

```tsx
<Link href="/" />
```

```ts
redirect("/dashboard");
```

Use raw strings only for:

- one-off external URLs
- framework configuration where the shared route helper layer is not appropriate

## 13. Anti-patterns

Avoid:

- leaking route-group syntax into returned URLs
- exposing `@slot` or interceptor syntax in route helpers
- hardcoding app-internal paths across components
- mixing locale prefixes into route helper outputs
- inventing inconsistent helper names instead of `path`
- modeling filesystem structure more literally than the user-facing URL requires

## 14. Review checklist

Before adding a route helper, check:

- Does this represent a real user-facing URL?
- Should this be modeled in `shared/routes`, or is it only an `app/` filesystem concern?
- Does the helper return the real URL rather than route-group syntax?
- Does a dynamic route accept explicit descriptive parameters?
- Is locale handling correctly left to the navigation layer?
- Will consuming code use this helper instead of a duplicated string?
