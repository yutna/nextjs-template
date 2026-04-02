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
