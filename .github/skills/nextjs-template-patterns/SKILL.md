---
name: nextjs-template-patterns
description: Apply the repository's server-first Next.js template patterns for routes, layers, localization, and shared helpers. Use this when changing application code under src/.
---

# Next.js Template Patterns

Use this skill when a task changes application code in `src/`.

Reference:

- [README.md](../../../README.md)
- [AGENTS.md](../../../AGENTS.md)
- [locale page example](../../../src/app/[locale]/page.tsx)
- [locale layout example](../../../src/app/[locale]/layout.tsx)
- [app provider](../../../src/shared/providers/app-provider/app-provider.tsx)
- [shared route helper](../../../src/shared/routes/root/index.ts)
- [env config](../../../src/shared/config/env.ts)

## Working defaults

- start server-first
- keep route entries thin
- preserve `page -> screen -> container -> component`
- move client behavior to the smallest leaf that needs it
- keep shared providers and adapters in shared provider surfaces

## Route and locale expectations

- locale route entries already unwrap `params`, derive `locale`, and call `setRequestLocale(locale)`
- route-boundary layouts may own metadata, static params, and route-level setup
- special files such as `layout`, `loading`, `error`, and `not-found` stay route-layer concerns instead of forcing the screen/container chain
- user-facing text should stay aligned across English and Thai

## Shared helper expectations

- reuse helpers under `src/shared/routes/` for user-facing paths instead of duplicating raw path strings
- keep environment access behind `src/shared/config/env.ts`
- prefer the existing template stack when a task needs those capabilities:
  - Chakra UI or Ark UI for UI primitives
  - Zod for validation
  - `next-safe-action` for server actions
  - `nuqs` for URL-driven state

## Planning checklist

Before implementation, identify:

1. which layer owns the change
2. whether a route-boundary file is involved
3. whether both locales are affected
4. whether a shared route helper should change
5. whether the task really needs new client code

## Do not

- move logic into presenter components that should stay display-focused
- duplicate user-facing paths inline when a shared route helper should own them
- read environment variables ad hoc outside the shared env surface
- invent parallel architecture when the existing template layers already fit
