---
name: nextjs-route-design
description: >
  Use this skill when designing routes, planning URL structure, creating new pages or features,
  or deciding how to handle navigation patterns in Next.js App Router.
  Activates on: "design routes", "route structure", "URL design", "parallel routes", "intercepting routes",
  "modal with URL", "deep link modal", "tab routing", "conditional layout", "route group",
  "new feature planning", "decompose requirements" (always include route design questions),
  or any task that introduces new pages or navigation flows.
  Provides file-convention reference, routing pattern decision tree, parallel/intercepting route recipes,
  and workflow integration hooks for discovery and planning phases.
---

# Next.js Route Design

## Core Principle: URL as Source of Truth

Every meaningful navigational state should have a URL. This makes content shareable, bookmarkable, and browser-history-aware.

**ROCA rule (Resource-Oriented Client Architecture for Next.js):**

- Every entity page has a canonical URL (accessible directly by hard navigation)
- Context-preserving overlays (modal over list) use Parallel + Intercepting Routes — the underlying URL stays, the overlay gets its own URL
- Task changes (editing a different entity, entering a new flow) → full navigation, not a panel

---

## 1. File Convention Reference

All special files in `app/` — use these before inventing custom solutions:

| File               | Scope   | Purpose                                                        |
| ------------------ | ------- | -------------------------------------------------------------- |
| `layout.tsx`       | subtree | Persistent shell; wraps descendant pages                       |
| `page.tsx`         | segment | Renders the route; makes segment publicly accessible           |
| `loading.tsx`      | segment | Instant loading UI via React Suspense                          |
| `error.tsx`        | segment | Error boundary for the segment (must be `'use client'`)        |
| `not-found.tsx`    | segment | Renders when `notFound()` is called                            |
| `forbidden.tsx`    | segment | Renders when `forbidden()` is called (RBAC)                    |
| `unauthorized.tsx` | segment | Renders when `unauthorized()` is called                        |
| `default.tsx`      | slot    | Fallback for unmatched parallel route slots on hard navigation |
| `template.tsx`     | segment | Like layout but re-mounts on navigation (use rarely)           |
| `route.ts`         | segment | API Route Handler — external consumers only; no page           |

**Rule**: reach for a file convention before adding `useEffect` or client-only logic.

---

## 2. Route Segment Types — Decision Tree

```
What does the URL segment represent?
│
├── Static path (e.g. /users, /settings)
│   → plain folder: users/page.tsx
│
├── Dynamic value from data (e.g. /users/123)
│   → [param]: [id]/page.tsx
│
├── Multiple unknown segments (e.g. /docs/a/b/c)
│   → [...slug]: [...slug]/page.tsx
│
├── Optional multiple (match /docs AND /docs/a/b)
│   → [[...slug]]: [[...slug]]/page.tsx
│
├── Organize without affecting URL
│   → (group): (auth)/login/page.tsx  ← URL is /login
│
├── Render two+ regions independently in same layout
│   → @slot (Parallel Routes): @panel/page.tsx
│
└── Show content from another route inside current layout
    → (.)segment (Intercepting Routes): (.)photo/page.tsx
```

---

## 3. Route Groups — Repo Pattern

This repo uses route groups for access control. Follow this pattern:

```
src/app/[locale]/
├── (public)/          # No auth required
│   └── <feature>/
│       └── page.tsx
├── (private)/         # Auth required — add auth check in layout
│   └── <feature>/
│       └── page.tsx
├── layout.tsx         # Root locale layout (providers)
├── page.tsx           # Home
├── error.tsx
├── loading.tsx
└── not-found.tsx
```

**Rule**: new features go into `(public)` or `(private)` based on auth requirement. Never add routes directly to `[locale]/` root unless they need the root layout alone.

---

## 4. Parallel Routes — `@folder` Slots

**When to use**: render multiple independently navigable views in the **same layout**.

```
app/dashboard/
├── layout.tsx         ← receives @analytics and @team as props
├── page.tsx
├── @analytics/
│   ├── default.tsx    ← REQUIRED — fallback on hard navigation
│   ├── page.tsx
│   ├── page-views/page.tsx
│   └── visitors/page.tsx
└── @team/
    ├── default.tsx    ← REQUIRED
    └── page.tsx
```

```tsx
// app/dashboard/layout.tsx
import type { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
  analytics: ReactNode;
  team: ReactNode;
}

export default function Layout({ children, analytics, team }: LayoutProps) {
  return (
    <>
      {children}
      {analytics}
      {team}
    </>
  );
}
```

**Critical**: always create `default.tsx` for every `@slot` — without it, hard navigation (refresh) to any route that doesn't match the slot renders a 404.

### Parallel Route Use Cases

| Pattern                                           | Implementation                                                |
| ------------------------------------------------- | ------------------------------------------------------------- |
| Dashboard with independent panels                 | `@panel1/`, `@panel2/` slots in dashboard layout              |
| Tab groups within a module                        | `@tab/` slot with nested `layout.tsx` containing tab nav      |
| Conditional layout by role                        | `layout.tsx` checks role → renders `{admin}` or `{user}` slot |
| Independent error/loading per panel               | `error.tsx` and `loading.tsx` inside each `@slot/` folder     |
| URL-preserving modal (combined with Intercepting) | `@modal/` slot — see §5                                       |

---

## 5. Intercepting Routes — `(..)` Matchers

**When to use**: display content from another route **inside the current layout** on soft navigation, but show the full page on hard navigation (direct URL / refresh).

Matcher convention (based on route segments, not file-system depth — `@slot` folders do not count):

| Syntax            | Intercepts            |
| ----------------- | --------------------- |
| `(.)segment`      | Same segment level    |
| `(..)segment`     | One segment level up  |
| `(..)(..)segment` | Two segment levels up |
| `(...)segment`    | From `app/` root      |

Example:

```
app/
├── feed/
│   └── page.tsx              ← /feed (gallery list)
└── @modal/
    ├── default.tsx           ← null (modal closed)
    └── (.)photo/
        └── [id]/
            └── page.tsx      ← intercepts /photo/[id] on soft nav
```

---

## 6. Parallel + Intercepting — The URL-Preserving Modal Pattern

This is the canonical pattern for modals that need deep links. Use it for:

- Photo / media gallery overlay
- Record detail over a list
- Login modal that can also be a standalone `/login` page
- Shopping cart side modal

**File structure** (login modal example):

```
app/[locale]/
├── layout.tsx                        ← receives @auth slot
├── @auth/
│   ├── default.tsx                   ← export default function Default() { return null }
│   └── (.)login/
│       └── page.tsx                  ← modal version: <Modal><Login /></Modal>
└── (public)/
    └── login/
        └── page.tsx                  ← full page version: <Login />
```

```tsx
// app/[locale]/layout.tsx
import type { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
  auth: ReactNode;
}

export default function Layout({ children, auth }: LayoutProps) {
  return (
    <>
      {children}
      {auth} {/* renders Modal when @auth slot is active */}
    </>
  );
}
```

```tsx
// app/[locale]/@auth/default.tsx
export default function Default() {
  return null;
}

// app/[locale]/@auth/(.)login/page.tsx
import { Modal } from "@/shared/components/modal";
import { LoginForm } from "@/modules/auth/components/form-login";
export default function Page() {
  return (
    <Modal>
      <LoginForm />
    </Modal>
  );
}
```

**Closing the modal**:

```tsx
// 'use client'
const router = useRouter();
router.back(); // closes modal, restores previous page
```

For `<Link href="/">` style close — add `@auth/[...catchAll]/page.tsx` returning `null` to handle unmatched slots.

---

## 7. Route Design Checklist (use during Discovery and Planning)

Ask and document these before implementation:

### Discovery questions (must answer before planning routes)

- [ ] What is the **canonical URL** for each entity? (e.g. `/orders/[id]`)
- [ ] Which flows can be accessed **directly via URL** vs overlay-only?
- [ ] Does any content need to be **shareable / bookmarkable**? → must have its own URL
- [ ] Are there **role-based layout differences** on the same path? → Parallel Routes (conditional)
- [ ] Does any route need a **different layout** from its siblings without affecting the URL? → Route Group
- [ ] Are there **tab groups** that navigate independently within a page? → Parallel Route + slot layout
- [ ] Is there a **modal** that overlays a list but also works as a standalone page? → Parallel + Intercepting

### Planning checklist

- [ ] Map every new URL: list all `page.tsx` paths before writing code
- [ ] Identify every `layout.tsx` needed and what it provides
- [ ] Identify every `error.tsx` and `loading.tsx` scope
- [ ] If a `@slot` is introduced, plan its `default.tsx` immediately
- [ ] If intercepting routes are used, confirm the `(..)` matcher depth (count segments, not folders — `@slot` folders don't count)
- [ ] Confirm `(public)` vs `(private)` placement for all new routes

---

## 8. Anti-Patterns to Reject

| Anti-Pattern                                                 | Problem                                                  | Correct Approach                      |
| ------------------------------------------------------------ | -------------------------------------------------------- | ------------------------------------- |
| Opening Drawer/Sheet for content that has its own entity URL | Not shareable, breaks back button                        | Use Parallel + Intercepting Routes    |
| Storing "which tab is active" in `useState`                  | URL not bookmarkable, lost on refresh                    | Use `@tab` slot or `nuqs` URL param   |
| Adding `?modal=true` query param and showing modal           | URL works but awkward; loses slot's independent loading  | Use Parallel + Intercepting Routes    |
| Using optional catch-all `[[...slug]]` for everything        | Over-flexible; loses type safety and meaningful segments | Use specific segments for known paths |
| Putting all routes at `[locale]/` root                       | Mixes auth requirements; no layout separation            | Use `(public)` / `(private)` groups   |

---

## 9. Integration with Workflow Phases

### During Discovery (always ask)

When a new feature introduces any navigation, add to requirements scope:

> "Map the URL structure: what is the canonical URL for each entity? Which views are overlays that preserve context? Which require full navigation?"

### During Planning (always include)

The plan must include a **Route Map** section:

```
Route Map:
  /[locale]/(private)/orders              → screen-order-list
  /[locale]/(private)/orders/[id]         → screen-order-detail  (canonical)
  @modal / (.)orders/[id]/page.tsx        → modal-order-detail   (overlay on list)
  @modal / default.tsx                    → null (modal closed)
```

### During Implementation

- Create all `page.tsx` shells first, then fill with Screens
- Always create `default.tsx` for every `@slot` before first test
- Add `error.tsx` and `loading.tsx` per segment when that segment fetches data

### During Verification

- Hard navigate (paste URL directly) to every new route — must render without modal
- Back button from modal must restore the list, not navigate away
- Refresh on modal URL must show **full page**, not modal overlay
