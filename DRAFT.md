# Draft AGENTS.md file

## Project overview

A production-ready Next.js 16 starter template with opinionated conventions for building scalable, maintainable web applications. It ships with i18n, type-safe environment variables, structured error handling, server actions, and a component system built on Chakra UI v3.

The template is designed to be cloned as a foundation for new projects — conventions are pre-established so teams can focus on product features without debating setup.

## Project structure

```text
src/
├── app/                                # Next.js App Router — Next.js file conventions only, no co-location
│   └── [locale]/                       # i18n routing via next-intl
│       ├── (private)/                  # Auth-protected routes
│       │   └── {route}/                # route segment — static, dynamic ([id]/), catch-all ([...slug]/)
│       │       ├── {nested-route}/     # can be nested arbitrarily deep
│       │       ├── page.tsx
│       │       ├── layout.tsx
│       │       ├── loading.tsx
│       │       └── error.tsx
│       └── (public)/                   # Public routes — same structure as (private)/
├── modules/                            # Feature modules
│   └── {module}/                       # e.g. static-pages/ — create only the subfolders the feature needs
│       ├── actions/                    # feature-specific server actions
│       ├── components/                 # feature UI building blocks
│       ├── containers/                 # distinct UI sections with self-contained logic, composed inside screens
│       ├── contexts/                   # feature-scoped React context
│       ├── hooks/                      # feature data / behavior hooks
│       ├── providers/                  # feature-scoped React providers
│       ├── schemas/                    # feature Zod validation schemas
│       ├── screens/                    # page-level compositions (entry point for each route)
│       └── utils/                      # feature-specific helper functions
├── shared/                             # Cross-cutting infrastructure and UI — not feature-specific
│   ├── actions/                        # app-wide server actions (next-safe-action)
│   ├── api/                            # shared API fetchers / clients
│   ├── components/                     # reusable UI components
│   ├── config/                         # env (t3-env), fonts, i18n config
│   ├── constants/                      # app-wide constants (locale, timezone)
│   ├── contexts/                       # app-wide React context providers
│   ├── hooks/                          # app-wide custom hooks
│   ├── images/                         # static image assets
│   ├── layouts/                        # app-level layout components
│   ├── lib/                            # core utilities (errors, fetcher, logger, safe-action, etc.)
│   ├── providers/                      # app-level React providers (Chakra, intl, nuqs)
│   ├── routes/                         # centralized route path definitions
│   ├── schemas/                        # shared Zod validation schemas
│   ├── styles/                         # global CSS
│   ├── types/                          # framework-level TypeScript types
│   ├── utils/                          # shared helper functions
│   └── vendor/                         # third-party customizations (Chakra UI system)
├── messages/                           # i18n translation files: {locale}/{namespace}/*.json
├── test/                               # Test helpers (renderWithProviders, setup)
└── proxy.ts                            # Next.js middleware (next-intl locale routing)
```

Module rules:

- New features belong in `modules/{feature}/` — each module owns all code for its business domain (actions, UI, hooks, schemas, etc.)
- **Cross-module imports are strictly forbidden** — `modules/y` must never import from `modules/x`
- If two modules need the same code, the only correct move is to refactor it into `shared/`

## Technology stack & key dependencies

| Concern | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router, React 19) |
| Language | TypeScript 5 (strict mode) |
| UI — styled | Chakra UI v3 + Framer Motion 12 |
| UI — headless | Ark UI (backed by Zag.js state machines) |
| UI — state machines | Zag.js (use directly only when Chakra/Ark don't cover the case) |
| i18n | next-intl (default locale: Thai `th`) |
| Forms / validation | Zod 4 |
| Server actions | next-safe-action 8 |
| Data fetching | SWR |
| State management | Immer / use-immer |
| URL state | nuqs |
| Logging | Pino |
| Testing | Vitest 4 + Testing Library |

UI layer selection — always prefer the highest layer that meets the need:
**Chakra UI** (styled, default) → **Ark UI** (headless, when Chakra doesn't have it) → **Zag.js** (state machines, last resort)

## Code style guidelines

## Security requirements & error handling

This section covers error handling patterns and security conventions that must be followed consistently across the codebase.

### Error handling

Always use the `AppError` hierarchy from `@/shared/lib/errors` — prefer existing classes with a custom `code` over creating new ones. If a new error class is truly needed, extend from the appropriate base class within the hierarchy (`DomainError`, `InfrastructureError`, etc.). Do not create standalone error classes outside the hierarchy. `try/catch` is fine, but caught errors must always be wrapped or re-thrown as an `AppError` subclass.

| Category | Classes | `isOperational` | HTTP status |
| --- | --- | --- | --- |
| Domain (user-facing) | `NotFoundError`, `ValidationError`, `BusinessRuleError`, `ConflictError`, `AuthorizationError` | `true` | 4xx |
| Auth | `AuthenticationError`, `SessionExpiredError` | `true` | 401/403 |
| Infrastructure (unexpected) | `DatabaseError`, `ExternalServiceError`, `UnknownError` | `false` | 500 |
| HTTP | `FetchError` | — | wraps fetch failures |

- Error codes use `SCREAMING_SNAKE_CASE` (e.g. `USER_NOT_FOUND`, `ORDER_ALREADY_PAID`)
- `isOperational: true` → safe to surface message to user; `false` → log details, show generic 500 UI
- Use helper `assertFound(value, message)` and `assertRule(condition, message)` instead of throwing manually

### Server actions

- All server actions use `next-safe-action` — see `@/shared/lib/safe-action`
- Use `actionClient` for public actions, `authActionClient` for auth-protected actions
- Extend `authActionClient` middleware when adding session/token validation

### Security

- Add `import "server-only"` to any file that must never be bundled on the client
- Environment variables are validated at build time via `@t3-oss/env-nextjs` in `@/shared/config/env.ts`
- Never prefix server secrets with `NEXT_PUBLIC_` — client vars must only be safe-to-expose values
- `authActionClient` middleware is the single place to add auth checks — do not duplicate in individual actions

## Build, test & development commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Dev server (Webpack) |
| `npm run build` | Production build |
| `npm run build:analyze` | Production build with bundle analyzer |
| `npm run start` | Start production server |
| `npm run check-types` | `tsc --noEmit` |
| `npm run lint` | ESLint |
| `npm run format` | Prettier |
| `npm run test` | Vitest (single run) |
| `npm run test:watch` | Vitest (watch mode) |
| `npm run test:coverage` | Coverage (v8) |

Node version: **24.13.1** (managed via `mise.toml`)

## Agent workflow

This section describes the tools and workflow conventions for AI agents working in this codebase. Read this before starting any task.

### Available MCP servers

| Server | When to use |
| --- | --- |
| `chakra-ui` | Looking up Chakra UI component props, examples, theme tokens, or migration from v2→v3 |
| `ark-ui` | Building custom headless components with Ark UI when Chakra UI doesn't have what you need |
| `next-devtools` | Inspecting running dev server — routes, build errors, runtime diagnostics, Cache Components |

### Available skills

| Skill | When to use |
| --- | --- |
| `frontend-design` | Building new UI components, pages, or visual layouts |
| `next-best-practices` | Writing or reviewing Next.js code — RSC boundaries, data fetching, metadata, routing |
| `next-cache-components` | Working with `use cache`, `cacheLife`, `cacheTag`, or PPR in Next.js 16 |
| `next-upgrade` | Upgrading Next.js to a newer version |
| `vercel-composition-patterns` | Refactoring components — compound components, context interfaces, avoiding boolean props |
| `vercel-react-best-practices` | Optimizing React performance, bundle size, or rendering patterns |
| `vitest` | Writing or configuring tests, mocking, coverage |
| `zag-js` | Building custom headless components directly with Zag.js state machines |
| `skill-creator` | Creating or updating a skill in `.agents/skills/` |
| `find-skills` | Discovering whether a skill exists before starting a task |

### Preferred workflow

1. Read `AGENTS.md` before starting any task
2. For UI tasks — check `chakra-ui` MCP before writing component code from scratch
3. For Next.js tasks — consult `next-devtools` MCP if dev server is running, then apply relevant skill
4. After making changes: `npm run check-types` → `npm run lint` → `npm run test`
5. Never expose server env vars with `NEXT_PUBLIC_` prefix
