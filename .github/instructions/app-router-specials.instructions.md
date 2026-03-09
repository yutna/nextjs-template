---
applyTo: "src/app/**/loading.{ts,tsx},src/app/**/error.{ts,tsx},src/app/global-error.{ts,tsx},src/app/**/not-found.{ts,tsx},src/app/**/template.{ts,tsx},src/app/**/forbidden.{ts,tsx},src/app/**/unauthorized.{ts,tsx},src/app/**/default.{ts,tsx},instrumentation.ts,instrumentation-client.ts,src/app/**/opengraph-image.{ts,tsx},src/app/**/twitter-image.{ts,tsx},src/app/**/sitemap.{ts,tsx},src/app/**/robots.{ts,tsx},src/app/**/manifest.{ts,tsx},src/app/**/icon.{ts,tsx}"
---

# App Router Special Files

Rules for Next.js special file conventions that are not already covered by
`page-entry` or `layout-entry` instructions.

These files are App Router boundary files that stay in `src/app/**`. They do
**not** follow the `page → screen → container → component` flow — they are
route-level concerns that Next.js handles automatically.

## Common rules for all special files

- Keep them thin — delegate display logic to shared components when needed
- Do **not** nest them inside the screen or container pattern
- Never import other special files across route segments

---

## `loading.tsx`

Rendered while a route segment is streaming. Wraps the segment in a Suspense
boundary automatically.

- Server component
- May render shared `Skeleton` or loading spinner components from `shared/components/`
- No screen or container layer needed
- Keep it simple: a skeleton or spinner is the correct content

```tsx
import "server-only";

import { Skeleton } from "@chakra-ui/react";

export default function Loading() {
  return <Skeleton height="400px" />;
}
```

---

## `error.tsx`

Rendered when an unhandled error is thrown inside a route segment.

- **Must be `"use client"`** — Next.js requires this; it receives `error` and
  `reset` props at the client boundary
- Receives `error: Error & { digest?: string }` and `reset: () => void` as props
- **Documented exception**: may import from `actions/` and call React hooks
  directly — there is no parent container that can wrap an error boundary
- Use the shared `ErrorAppBoundary` component when available
- Do **not** swallow errors silently; always wire error reporting

```tsx
"use client";

import { ErrorAppBoundary } from "@/shared/components/error-app-boundary";

import type { NextErrorProps } from "@/shared/types/next";

export default function Error({ error, reset }: Readonly<NextErrorProps>) {
  return <ErrorAppBoundary error={error} reset={reset} />;
}
```

The `"use client"` requirement and direct action imports are valid here because
the error boundary sits above the container layer. See
[App Router error boundary exception] in AGENTS.md for the full rationale.

---

## `global-error.tsx`

Replaces the root layout when the root layout itself throws. This is the
top-level error fallback.

- **Must be `"use client"`** — same requirement as `error.tsx`
- Must include `<html>` and `<body>` because it replaces the root layout
- Inline style on `<body>` is an acceptable exception here (add an
  `eslint-disable-next-line project/no-inline-style -- reason` comment)
- **Documented exception**: same as `error.tsx` — may use hooks and import
  from `actions/` directly
- Use the shared `ErrorGlobal` component when available

```tsx
"use client";

import { ErrorGlobal } from "@/shared/components/error-global";

import type { NextErrorProps } from "@/shared/types/next";

export default function GlobalError({ error, reset }: Readonly<NextErrorProps>) {
  return (
    <html lang="en">
      {/* eslint-disable-next-line project/no-inline-style -- global-error renders outside all providers; inline style is the only way to reset body margin */}
      <body style={{ margin: 0 }}>
        <ErrorGlobal error={error} reset={reset} />
      </body>
    </html>
  );
}
```

---

## `not-found.tsx`

Rendered when `notFound()` is called inside a route or when a URL has no
matching route.

- Server component
- May render shared components directly — no screen or container layer required
- Keep it thin: a helpful message, a link back to home, and nothing else
- Use `@/shared/lib/navigation` for locale-aware links, not `next/link` directly

```tsx
import "server-only";

import { NotFound } from "@/shared/components/not-found";

export default function NotFoundPage() {
  return <NotFound />;
}
```

---

## `template.tsx`

Like `layout.tsx` but re-creates a new instance on every navigation instead
of preserving state. Use when you need per-navigation effects (e.g. page
transition animations, per-page analytics events).

- Server component by default (add `"use client"` only for animations or
  client-side per-navigation effects)
- Same constraints as `layout.tsx`: stay thin, delegate reusable frames to
  `shared/layouts/` or `modules/<module>/layouts/`
- Do not use `template.tsx` where `layout.tsx` is sufficient — prefer layout

```tsx
import "server-only";

import type { ReactNode } from "react";

interface TemplateProps {
  children: ReactNode;
}

export default function Template({ children }: Readonly<TemplateProps>) {
  return <>{children}</>;
}
```

---

## `forbidden.tsx` and `unauthorized.tsx`

Rendered when `forbidden()` or `unauthorized()` is called (Next.js 15+
access control API).

- Server component
- Similar pattern to `not-found.tsx`: thin, may render shared components
  directly, no screen/container needed
- Keep it thin: a clear message and a path back to safety

```tsx
import "server-only";

export default function Forbidden() {
  return <p>You do not have permission to view this page.</p>;
}
```

---

## `default.tsx`

Fallback UI rendered for a parallel route slot when no active match exists.
Prevents a hard 404 for unmatched slots during navigation.

- Server component
- Keep it thin or return `null` when no visible fallback is needed
- Do not replicate layout chrome here; this is a slot placeholder

```tsx
import "server-only";

export default function Default() {
  return null;
}
```

---

## `instrumentation.ts` and `instrumentation-client.ts`

Lifecycle hooks for initializing observability and monitoring integrations.
These files live at the **project root** (not inside `src/app/`).

- `instrumentation.ts` — runs on the server (Node.js runtime); use for
  server-side SDK initialization (OpenTelemetry, error monitoring, APM)
- `instrumentation-client.ts` — runs in the browser; use for client-side
  SDK initialization (analytics, session recording)
- Export a `register()` function from each
- Side-effect only — no component rendering, no imports from `src/app/`
- Keep initialization logic thin; delegate to `shared/lib/` when non-trivial

```ts
// instrumentation.ts
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    // server-side SDK initialization
  }
}
```

---

## Metadata files

These generate static or computed metadata responses. They belong in
`src/app/**` alongside the route they describe.

### `opengraph-image.tsx` / `twitter-image.tsx`

Dynamic open graph and twitter card images.

- Export default a React component rendered by `@vercel/og` (or Next.js
  built-in image generation)
- Export `alt`, `size`, and `contentType` named constants
- No component pattern from the app architecture — these are server-side
  image renderers

### `sitemap.ts`

Generates the XML sitemap.

- Export default an async function returning `MetadataRoute.Sitemap`
- Use route helpers from `@/shared/routes` for path generation
- Server-only; no UI component pattern needed

```ts
import { MetadataRoute } from "next";

import { routes } from "@/shared/routes";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `https://example.com${routes.root.path()}`,
      lastModified: new Date(),
    },
  ];
}
```

### `robots.ts`

Generates the `robots.txt` response.

- Export default a function returning `MetadataRoute.Robots`
- Keep it simple; no app architecture pattern needed

### `icon.tsx` / `apple-icon.tsx`

Dynamic favicon generation.

- Export default a React component for image generation
- Export `size` and `contentType` named constants

### `manifest.ts`

Generates the Web App Manifest.

- Export default a function returning `MetadataRoute.Manifest`

---

## Checklist

- [ ] File is in `src/app/**` (except `instrumentation.*` at project root)
- [ ] Not following the screen/container pattern — these are boundary files
- [ ] `error.tsx` and `global-error.tsx` are `"use client"`
- [ ] `global-error.tsx` includes `<html>` and `<body>`
- [ ] `loading.tsx`, `not-found.tsx`, `template.tsx` are server components
- [ ] `not-found.tsx` uses `@/shared/lib/navigation` for links (not `next/link`)
- [ ] `instrumentation.*` files export `register()` and live at project root
- [ ] Metadata files export the correct named constants (`alt`, `size`, `contentType`)
- [ ] Error components wire error reporting — no silent swallowing
