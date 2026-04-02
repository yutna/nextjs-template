# Claude Code Configuration

This file configures Claude Code for this repository. For the universal AI workflow contract, see [AGENTS.md](./AGENTS.md).

## Order of precedence

Apply instructions in this order:

1. Direct user instruction
2. [AGENTS.md](./AGENTS.md) (universal workflow contract)
3. This file (Claude-specific configuration)
4. Relevant `.claude/skills/`
5. Relevant `.claude/commands/`
6. Hooks and deterministic policy checks

If sources conflict, follow the highest-priority source and keep the conflict explicit.

## State API

Prefer the workflow state API when command execution is available:

```bash
node .claude/hooks/scripts/workflow_hook.cjs update-state phase=planning plan.status=proposed
```

Use direct file edits for `.claude/workflow-state.json` only as a fallback when the state API is unavailable.

## Next.js Architecture (Always-On)

This section defines the Next.js-specific architecture contract for this repository.

### Directory Contract

- `src/app/[locale]/` - App Router routes (thin composition shells)
- `src/modules/<feature>/` - Feature modules (domain-driven)
- `src/shared/` - Cross-cutting code

### Module Structure

Each module in `src/modules/` follows:

```
<module>/
├── actions/       # Server actions (internal mutations, next-safe-action + Zod)
├── api/           # Route handlers (external endpoints, webhooks)
├── services/      # Business logic (Effect)
├── repositories/  # Data access (Effect + Drizzle)
├── jobs/          # Background jobs (Trigger.dev)
├── policies/      # Authorization logic
├── schemas/       # Zod schemas (validation)
├── forms/         # Complex form handling (multi-step, validation)
├── presenters/    # Entity-to-JSON transformers (API responses)
├── components/    # Pure UI components (mostly server)
├── constants/     # Module constants
├── containers/    # Logic binding layer (client when needed)
├── contexts/      # React contexts
├── hooks/         # Custom hooks (client)
├── layouts/       # Feature-specific layouts (rare)
├── lib/           # Domain implementations, wrappers (e.g., Stripe API)
├── providers/     # Feature-scoped React providers
├── screens/       # Page-level composition (server)
├── types/         # Module-wide types (when co-location isn't enough)
└── utils/         # Pure utility functions (e.g., format-thai-currency)
```

### Shared Structure

The `src/shared/` directory follows:

```
shared/
├── db/            # Drizzle client, migrations, seeds
│   └── seeds/     # Database seed scripts
├── entities/      # ALL Drizzle schemas (always here, never in modules)
├── factories/     # Test data factories (@faker-js/faker)
├── services/      # Shared services (auth, email, realtime)
├── middleware/    # Request middleware
├── jobs/          # Job infrastructure (Trigger.dev client)
├── queue/         # Queue utilities
├── policies/      # Shared authorization helpers
├── presenters/    # Shared presenters (pagination, errors, API responses)
├── actions/       # Shared server actions
├── api/           # API clients
├── components/    # Shared UI components
├── config/        # Configuration
├── constants/     # App-wide constants
├── contexts/      # Shared React contexts
├── hooks/         # Shared hooks
├── images/        # Static assets
├── layouts/       # App-wide layouts (main, auth, dashboard)
├── lib/           # Domain implementations, wrappers
├── providers/     # App-wide React providers (theme, auth, i18n)
├── routes/        # Route definitions
├── schemas/       # Shared Zod schemas
├── styles/        # Global styles only (modules use CSS modules)
├── types/         # Cross-cutting TypeScript types
├── utils/         # Pure utility functions
└── vendor/        # Third-party integrations
```

### Server-First Rules

1. Default to Server Components
2. Use "use client" only at leaf components (containers/, interactive components)
3. Keep screens/ and components/ as server components
4. Move client logic to containers/ or hooks/

### Stack Conventions

| Category | Technology | Notes |
|----------|------------|-------|
| UI | Chakra UI v3 + Ark UI | Headless primitives from Ark UI |
| State | XState, Zag.js, nuqs, immer | XState for machines, Zag for UI primitives, nuqs for URL state |
| Functional | Effect | **ALWAYS for backend** (services, repositories, jobs, api handlers) |
| Database | Drizzle | Always through repositories |
| Jobs | Trigger.dev | Background job processing |
| Server Actions | next-safe-action + Zod | Type-safe server mutations |
| i18n | next-intl | en/th locales, always prefix |
| Logging | Pino | Structured logging |
| Env | @t3-oss/env-nextjs | Environment validation |
| Testing | Vitest + Testing Library | 80% coverage target |

### lib/ vs utils/ Distinction

| Folder | Purpose | Examples |
|--------|---------|----------|
| `lib/` | Domain implementations, wrappers, integrations | `lib/stripe/`, `lib/analytics/` |
| `utils/` | Pure, stateless utility functions | `format-thai-currency.ts`, `transform-date.ts` |

### lib/ Effect Usage

| lib/ Type | Use Effect? | Used By | Pattern |
|-----------|-------------|---------|---------|
| **Backend integrations** | Yes | services, repositories, jobs | `Effect.Effect<A, E, R>` |
| **Frontend utilities** | No | components, hooks, SWR | `Promise<T>` / sync |
| **Infrastructure** | No | everything | Plain exports |

**Backend lib/ (Effect):**
```typescript
// shared/lib/stripe/stripe-client.ts
export class StripeClient extends Context.Tag("StripeClient")<...>() {}
export const StripeClientLive = Layer.succeed(StripeClient, { ... });
```

**Frontend lib/ (Promise-based):**
```typescript
// shared/lib/fetcher/fetch-client.ts - for SWR integration
export async function fetchClient<T>(options): Promise<T> { ... }
```

**Infrastructure (Plain):**
```typescript
// shared/lib/logger/logger.ts
export const logger = pino({ ... });
```

**Rule:** If lib/ is consumed by services/repositories/jobs -> Effect. If consumed by React components/hooks -> Promise.

### File Structure Conventions

#### Naming Patterns

| Folder Type | Pattern | Examples |
|-------------|---------|----------|
| Components | `<semantic-type>-<name>/` | `form-contact/`, `modal-confirmation/`, `alert-warning/`, `section-hero/`, `menu-sidebar/` |
| Containers | `container-<name>/` | `container-user-list/`, `container-checkout/` |
| Screens | `screen-<name>/` | `screen-welcome/`, `screen-user-detail/` |
| Hooks | `use-<name>/` | `use-vibe-background/`, `use-user-form/` |
| Actions | `<name>-action/` | `create-user-action/`, `report-error-action/` |
| API Handlers | `<name>-handler/` | `webhook-stripe-handler/`, `get-users-handler/` |
| Services | `<name>-service/` | `create-user-service/`, `checkout-service/` |
| Repositories | `<name>-repository/` | `user-repository/`, `order-repository/` |
| Jobs | `<name>-job/` | `send-welcome-email-job/`, `sync-inventory-job/` |
| Policies | `<name>-policy/` | `user-policy/`, `post-policy/` |
| Forms | `<name>-form/` | `user-registration-form/`, `checkout-form/` |
| Presenters | `<name>-presenter/` | `user-presenter/`, `order-presenter/` |
| Entities | `<name>/` | `user/`, `post/`, `order/` |

Component semantic types: `form-`, `modal-`, `alert-`, `section-`, `menu-`, `card-`, `table-`, `list-`, `button-`, `input-`, `dialog-`, `drawer-`, `toast-`, `badge-`, `avatar-`, `icon-`

#### Folder vs Flat Files

| Structure | Subdirs | Notes |
|-----------|---------|-------|
| **Always folders** | actions, api, components, containers, contexts, entities, forms, hooks, jobs, layouts, lib, middleware, policies, presenters, providers, repositories, schemas, services, utils | Each item is a folder with `index.ts` barrel export |
| **Always flat files** | config, constants, images, styles, types | Can have nested folders for grouping, but NO `index.ts` re-export |
| **Special** | routes, db | routes mirrors app router; db has client and migrations |

#### Required Files in Folders

| File | Required? | Notes |
|------|-----------|-------|
| `index.ts` | **Always** | Barrel export |
| `types.ts` | If types/props exist | No inline type declarations |
| `constants.ts` | If constants exist | No inline constants |
| `helpers.ts` | If helper functions exist | **Internal only**, NOT exported via `index.ts` |
| `*.test.ts(x)` | **Always** | Tests required for all code |
| `*.stories.tsx` | **Components only** | Required for components; NOT for containers, screens, providers, layouts |

#### Code Organization Rules

- **No inline functions** outside main declaration - helpers go in `helpers.ts`
- **No inline constants** - constants go in `constants.ts`
- **No inline types** - types/interfaces go in `types.ts`
- **helpers.ts is internal** - specific to that folder, NOT exported, NOT used outside

#### Folder Structure Examples

**Component (always has stories):**
```
form-create-user/
├── index.ts                      # Export: FormCreateUser
├── types.ts                      # FormCreateUserProps
├── constants.ts                  # (optional) FORM_FIELDS
├── helpers.ts                    # (optional, internal) validateEmail()
├── form-create-user.tsx
├── form-create-user.test.tsx
└── form-create-user.stories.tsx  # Required for components
```

**Container (no stories):**
```
container-user-list/
├── index.ts
├── types.ts
├── container-user-list.tsx
└── container-user-list.test.tsx
```

**Flat files (config, constants, types):**
```
constants/
├── api-endpoints.ts              # No index.ts
├── error-codes.ts
└── ui/                           # Grouping folder allowed
    ├── colors.ts
    └── breakpoints.ts            # No index.ts for re-export
```

**Service (Effect-based):**
```
create-user-service/
├── index.ts
├── types.ts
├── create-user-service.ts        # Effect-based business logic
└── create-user-service.test.ts
```

**Repository (Effect + Drizzle):**
```
user-repository/
├── index.ts
├── types.ts
├── user-repository.ts            # Drizzle queries wrapped in Effect
└── user-repository.test.ts
```

### Import Rules

| Context | Allowed | Example |
|---------|---------|---------|
| Same folder | `./` relative | `import { UserProps } from "./types"` |
| Cross folder | `@/` alias only | `import { db } from "@/shared/db"` |

**Forbidden:**
- `../` or `../../` relative imports - use `@/` alias instead
- Barrel re-exports from grouping folders - no `components/index.ts` that re-exports all
- Cross-module imports - if module A needs from module B, move to shared

```typescript
// Allowed
import { UserForm } from "./user-form";
import { UserRepository } from "@/modules/users/repositories/user-repository";
import { db } from "@/shared/db";

// Not allowed
import { UserForm } from "../../components/user-form";
import { Button, Card, Modal } from "@/shared/components"; // No barrel re-export
import { something } from "@/modules/other-module/...";    // No cross-module
```

### Backend Architecture (BFF/Full-Stack)

#### Architecture Principle

**Heavy server-side approach:** Minimize client logic, maximize server-side processing.

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT (Minimal)                         │
│               Only: UI state, interactions                  │
└─────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┴───────────────┐
              ▼                               ▼
┌─────────────────────────┐     ┌─────────────────────────────┐
│   Server Components     │     │      Server Actions         │
│  (Data fetching, UI)    │     │  (Internal mutations)       │
└─────────────────────────┘     └─────────────────────────────┘
              │                               │
              └───────────────┬───────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   SERVICES LAYER (Effect)                   │
│             Business logic, orchestration                   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                REPOSITORIES LAYER (Effect + Drizzle)        │
│                      Data access                            │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    DATABASE (Drizzle)                       │
└─────────────────────────────────────────────────────────────┘

        EXTERNAL CONSUMERS (webhooks, mobile, third-party)
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  API ROUTES (Effect)                        │
│              External endpoints only                        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    SERVICES LAYER (same)
```

#### actions/ vs api/ Distinction

| Folder | Purpose | Triggered By |
|--------|---------|--------------|
| `actions/` | Internal mutations | Next.js UI (Server Actions) |
| `api/` | External endpoints | Webhooks, mobile apps, third-party |

**Rule:** From your own UI -> Server Actions (`actions/`)
**Rule:** From external sources -> API Routes (`api/`)

#### Layer Responsibilities

| Layer | Responsibility | Effect Usage |
|-------|----------------|--------------|
| Actions | Validate input, call services, return response | next-safe-action |
| API Handlers | Parse request, call services, format response | **Always Effect** |
| Services | Business logic, orchestration, side effects | **Always Effect** |
| Repositories | Data access, Drizzle queries | **Always Effect** |
| Jobs | Background task execution | **Always Effect** |
| Policies | Authorization checks | **Always Effect** |

#### Backend File Structure

##### Services (folders, tests required)
```
services/
└── create-user-service/
    ├── index.ts
    ├── types.ts                    # Input/output types
    ├── helpers.ts                  # (optional, internal)
    ├── create-user-service.ts      # Effect-based logic
    └── create-user-service.test.ts
```

##### Repositories (folders, tests required)
```
repositories/
└── user-repository/
    ├── index.ts
    ├── types.ts                    # Query result types
    ├── user-repository.ts          # Drizzle + Effect
    └── user-repository.test.ts
```

##### Jobs (folders, tests required)
```
jobs/
└── send-welcome-email-job/
    ├── index.ts
    ├── types.ts                    # Payload types
    ├── send-welcome-email-job.ts   # Trigger.dev job
    └── send-welcome-email-job.test.ts
```

##### Policies (folders, tests required)
```
policies/
└── user-policy/
    ├── index.ts
    ├── types.ts                    # Actor, resource types
    ├── user-policy.ts              # Authorization rules
    └── user-policy.test.ts
```

##### API Handlers (folders, tests required)
```
api/
└── webhook-stripe-handler/
    ├── index.ts
    ├── types.ts                    # Request/response types
    ├── helpers.ts                  # (optional) signature verification
    ├── webhook-stripe-handler.ts   # Effect-based handler
    └── webhook-stripe-handler.test.ts
```

##### Middleware (shared only, folders, tests required)
```
shared/middleware/
└── auth-middleware/
    ├── index.ts
    ├── types.ts
    ├── auth-middleware.ts
    └── auth-middleware.test.ts
```

##### Entities (shared only, folders, NO tests required)

Entities are declarative Drizzle schemas - no business logic to test.
Repository tests verify schema works correctly.

```
shared/entities/
└── user/
    ├── index.ts
    ├── user.ts                     # Drizzle schema
    ├── types.ts                    # Inferred types (InferSelectModel, etc.)
    └── relations.ts                # (optional) Drizzle relations
```

##### DB (shared only, infrastructure, flat)
```
shared/db/
├── client.ts                       # Drizzle client instance
├── schema.ts                       # Re-exports all entities
├── types.ts                        # DB-level types
└── migrations/                     # Drizzle migrations
    ├── 0000_initial.sql
    └── 0001_add_posts.sql
```

##### Queue (shared only, infrastructure, flat)
```
shared/queue/
├── client.ts                       # Queue client (Redis, etc.)
├── types.ts                        # Queue types
└── helpers.ts                      # (optional) Queue utilities
```

#### Shared-Only Folders

These folders exist **only in `shared/`**, never in modules:

| Folder | Reason |
|--------|--------|
| `db/` | Single database connection |
| `entities/` | Drizzle schemas shared across modules |
| `middleware/` | Request interceptors are cross-cutting |
| `queue/` | Single queue connection |

### Forbidden Patterns

- Generic files: `utils.ts`, `helpers.ts`, `common.ts` - use specific named modules
- "use client" in screens/ - screens should be server components
- Direct DOM manipulation - use React patterns
- Untyped server actions - always use Zod validation
- `../` relative imports - use `@/` alias
- Barrel re-exports from grouping folders - import directly from item folder
- Cross-module imports - move shared code to `shared/`
- Entities in modules - always in `shared/entities/`
- Backend code without Effect - services, repositories, jobs, api handlers must use Effect

## Knowledge Graph (A + D)

Before implementing, check existing patterns and relationships:

### A. Pattern Graph (Static)

The pattern dependency graph is defined in `.claude/workflow-profile.json` under `patternGraph`. It defines:
- **Nodes**: All available patterns and their locations
- **Edges**: How patterns relate (calls, uses, transforms, triggers)
- **Workflows**: Common pattern combinations for typical features

### D. Codebase Index (Dynamic)

Generate the current codebase index:
```bash
node .claude/hooks/scripts/codebase_indexer.cjs
```

Output: `.claude/generated/codebase-index.json`

The index shows:
- **Existing entities** and their features (hooks, scopes, relations)
- **Existing modules** and their patterns
- **Analysis** of what exists per entity
- **Suggestions** for missing patterns

### Usage

1. **Before implementing a new feature:**
   - Run the indexer to see what exists
   - Check if entity/repository/service already exists
   - Reuse existing patterns instead of creating duplicates

2. **When adding patterns:**
   - Check `patternGraph.edges` for dependencies
   - Check `patternGraph.workflows` for common combinations
   - Ensure required dependencies exist first

## Workflow Best Practices

### One Component Per File

Each component file should export only ONE component. If a file exports multiple components:
- Create a separate folder for each component
- Each component gets its own `types.ts`, `constants.ts`, tests, and stories

**Bad:**
```
motion-scroll/
├── motion-scroll.tsx  # exports MotionScroll AND MotionParallax ❌
```

**Good:**
```
motion-scroll/
├── motion-scroll.tsx  # exports only MotionScroll ✓
motion-parallax/
├── motion-parallax.tsx  # exports only MotionParallax ✓
```

### Testing Best Practices

#### Read Source Before Writing Tests
Always read the actual implementation before writing tests. Don't assume values.

**Bad:** Assuming `scale: 0.8` without reading the source
**Good:** Read `variants.ts` first, then write tests with actual values

#### Test File Per Source File
The project requires individual test files per source file, not combined test files.

**Bad:** `motion.test.ts` testing timing, variants, and reduced-motion
**Good:** `timing.test.ts`, `variants.test.ts`, `reduced-motion.test.ts`

#### Motion Component Test Environment
When testing motion/framer-motion components:

```typescript
beforeEach(() => {
  // Suppress framer-motion warnings in test environment
  vi.spyOn(console, "warn").mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});
```

Don't override the global `IntersectionObserver` stub - the test setup already provides one.

### Hook Migration Checklist

When replacing a React hook (e.g., `useState` → `useSyncExternalStore`):

1. Update the import statement
2. **Rewrite the hook implementation** (don't just change the import)
3. Update any dependent code that uses the old hook pattern

### Prop Removal Checklist

When removing props from a component:

1. Remove from component file (`.tsx`)
2. Remove from `types.ts`
3. Remove from `constants.ts` (if default values exist)
4. Update tests to not use removed props
5. Update stories to not use removed props

### ESLint Rules Apply Everywhere

Lint rules apply to ALL code including:
- Storybook stories (use `useImmer` instead of `useState`)
- Test files
- Demo/example code

The only exceptions are explicit `eslint-disable` comments with justification.

### SSR-Safe Hooks

When creating hooks that use browser APIs:

```typescript
function getSnapshot(): boolean {
  // Guard against SSR and test environments
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }
  return window.matchMedia(QUERY).matches;
}
```

## Zero Tolerance Policy

**Target: 0 warnings, 0 errors — always.** This applies to lint, type-check, and editor warnings.

### HARD Rules (No Exceptions)

#### No `any` Type

The `any` type is **forbidden** in this project. No exceptions.

| Situation | Wrong | Right |
|-----------|-------|-------|
| Unknown library type | `as any` | Import type from library: `UseScrollOptions["offset"]` |
| Complex generic | `any` | Use `unknown` + type guards |
| Quick fix | `// @ts-ignore` | Find and use the proper type |

```typescript
// FORBIDDEN - will fail lint
const offset = value as any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any

// CORRECT - import from library
import type { UseScrollOptions } from "motion/react";
type ScrollOffset = UseScrollOptions["offset"];
```

#### No eslint-disable as First Resort

Never add `eslint-disable` to bypass a rule. Fix the root cause.

| Problem | Wrong | Right |
|---------|-------|-------|
| Type mismatch | `// eslint-disable @typescript-eslint/...` | Import proper types from library |
| Inline style needed | `// eslint-disable project/no-inline-style` | Add file pattern to `eslint.config.mjs` |
| Unused variable | `// eslint-disable no-unused-vars` | Remove the variable |

**When eslint-disable IS allowed:**
- Single exceptional line with clear `-- reason` comment
- After confirming no config-level solution exists
- Approved in code review

#### No Type Assertions That Break Other Rules

```typescript
// WRONG - breaks section-order lint rule (regex can't match generic)
const ref = useRef(null) as React.RefObject<HTMLElement>;

// CORRECT - proper TypeScript that lint rules understand
const ref = useRef<HTMLElement | null>(null);
```

### Signature Change Protocol

When changing function signatures:

1. **Find all usages first:**
   ```bash
   grep -rn "functionName(" src/
   ```

2. **Update all callers in same commit**

3. **Run full checks after:**
   ```bash
   npm run lint && npm run check-types && npm test
   ```

### ESLint Config Over Inline Disables

For legitimate technical requirements (not hacks), add exceptions in `eslint.config.mjs`:

```javascript
// eslint.config.mjs
{
  files: ["src/shared/components/motion-*/**"],
  rules: {
    "project/no-inline-style": "off", // Motion requires style prop for MotionValue
  },
},
```

This is transparent, documented, and applies consistently to all files matching the pattern.

### Lint Rule Maintenance

If a lint rule doesn't support valid TypeScript patterns:

1. **Fix the rule** (in `bin/cli/commands/lint-check.ts` or `eslint/`)
2. **Don't work around it** with type assertions or disables

Example: Section-order regex updated to support generics:
```javascript
// Before: /\buse[A-Z]\w*\(/  — didn't match useRef<T>(
// After:  /\buse[A-Z]\w*(?:<[^>]*>)?\(/  — matches both
```

## Self-Healing Behavior

Claude Code must follow the **Self-Healing Contract** defined in [AGENTS.md](./AGENTS.md#self-healing-contract).

**Core principle**: Deliver production-ready code on the first attempt. Never present broken code to the user.

### Autonomous Quality Loop

Before presenting any result to the user, automatically run this loop:

```
implement → check-types → lint → test → verify criteria → present
     ↑                                                        |
     └──────────── if ANY failure, fix and retry ─────────────┘
```

### Key Rules

1. **Fix before presenting**: Type errors, lint warnings, test failures must be fixed before showing results
2. **Complete the plan**: All planned items must be implemented before delivery
3. **Run all gates**: `npm run check-types && npm run lint && npm run test`
4. **Never ask user to fix AI mistakes**: If Claude caused it, Claude fixes it
5. **Escalate only when stuck**: After 3 failed attempts on the same issue, escalate to user
