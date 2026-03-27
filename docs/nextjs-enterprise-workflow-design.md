# Next.js Enterprise Workflow Design

## Goal

Extend the existing workflow-first Copilot standard into a Next.js 16+/React 19 enterprise profile without changing the canonical six-phase workflow or replacing the current primary agents.

This profile is optimized for:

- App Router only for greenfield work
- server-first rendering and mutations
- minimal shipped client JavaScript
- strict route design and segment conventions
- deterministic module structure
- strict AI-guided implementation and review
- portability across GitHub Copilot in VS Code and GitHub Copilot CLI

## Non-goals

- Replacing the existing state machine in [AGENTS.md](../AGENTS.md)
- Forking the current core agents into a second workflow model
- Encoding every Next.js rule into always-on instructions
- Forcing all projects into the same deployment platform

## Key design decisions

### 1. Preserve the core workflow, extend the stack layer

The existing files stay canonical:

- [AGENTS.md](../AGENTS.md)
- [.github/copilot-instructions.md](../.github/copilot-instructions.md)
- current phase prompts
- current phase skills
- current workflow hooks

The Next.js profile is additive:

- a thin Next.js overlay in instructions
- deep stack procedures in new skills
- stack-specific prompt entrypoints
- stack-specific deterministic hooks
- one optional specialist for legacy migrations

### 2. Keep the same primary agents

The main operating model remains:

- Orchestrator
- Requirements Analyst
- Planner
- Implementer
- Reviewer
- Verifier

Micro-expertise should live mostly in skills and prompt entrypoints, not in many new top-level agents. This keeps handoffs predictable and reduces tool/permission drift.

The only justified extra agent is an optional `Migrator` for legacy Next.js audits and migration planning.

### 3. Use a server-first architecture by default

The baseline posture is:

- Server Components by default
- Server Actions for mutations
- route handlers only when HTTP integration is required
- no client data fetching unless the plan explicitly justifies it
- no broad `"use client"` boundaries
- no business logic in route entry files

### 4. Default to a Turbo monorepo, but keep a single-app compatibility path

Recommended enterprise topology:

```text
apps/
  web/
    src/
      app/
      features/
      shared/
      server/
packages/
  ui/
  config-eslint/
  config-typescript/
  test-utils/
tooling/
docs/
```

Rationale:

- gives AI stable ownership boundaries
- supports future internal packages without forcing premature extraction of domain code
- keeps the main application code in one place: `apps/web`

Compatibility rule:

- if the target repository is not a monorepo, all `apps/web/src/*` conventions map directly to `src/*`

## Dependency baseline

The profile assumes the dependency set from `vibe-next-template` as a minimum baseline, with newer versions allowed.

### Foundation

- `next`
- `react`
- `react-dom`
- `typescript`

### Server/data/security

- `zod`
- `next-safe-action`
- `next-intl`
- `server-only`
- `@t3-oss/env-nextjs`
- `pino`
- `effect`
- `ts-pattern`
- `dayjs`
- `sharp`

### UI and interaction

- `@chakra-ui/react`
- `@ark-ui/react`
- `@zag-js/react`
- `motion`
- `react-icons`
- `next-themes`
- `clsx`
- `@emotion/react`

### Client-side exceptions, not defaults

- `swr`
- `nuqs`
- `xstate`
- `@xstate/react`
- `immer`
- `use-immer`
- `usehooks-ts`

### Tooling

- `eslint`
- `prettier`
- `vitest`
- `storybook`
- `@testing-library/react`
- `@testing-library/user-event`
- `@testing-library/jest-dom`
- `stylelint`
- `agent-browser`
- `babel-plugin-react-compiler`
- `@next/bundle-analyzer`
- `pino-pretty`

## Target architecture

### Interactive UI stack

For interactive primitives, the preferred stack order is:

1. Chakra UI when the existing component solves the problem
2. Ark UI when the team needs headless composition
3. Zag.js when the interaction model itself must be made explicit

Rules:

- do not reimplement standard interactive primitive behavior with ad hoc boolean state if the Chakra/Ark/Zag stack already covers it
- keep Zag.js usage focused on reusable UI interaction models such as comboboxes, menus, popovers, dialogs, and similar primitives
- do not use Zag.js as the default state model for page-level business workflows
- keep all primitive interaction state inside the narrowest justified client island

### Route layer

`app/` files are composition shells only.

Allowed responsibilities:

- route segment structure
- metadata
- calling feature-level loaders/presenters
- composing server components
- wiring forms/actions into views

Disallowed responsibilities:

- raw database access
- direct environment parsing
- inline authorization policy
- ad hoc transformation pipelines
- client-state orchestration

### Routing system

Routing is a first-class design surface in this profile, not just a file-system byproduct.

Every non-trivial feature plan must define:

- canonical URL shape
- route ownership by feature or workflow
- layout boundaries
- auth and access boundary
- cache and data-loading boundary
- error/loading UX ownership
- search param ownership
- whether special routing features are truly justified

#### Route taxonomy

Enterprise applications should classify routes into explicit buckets:

- public routes
- authenticated application routes
- workspace or tenant-scoped routes
- settings and administration routes
- mutation-driven workflows
- integration endpoints
- webhooks and machine-facing handlers

Each bucket should have a stable placement strategy.

Recommended shape:

```text
app/
  [locale]/
    (public)/
    (auth)/
    (app)/
      [workspaceSlug]/
        dashboard/
        customers/
        settings/
  api/
    internal/
    integrations/
    webhooks/
```

Rules:

- visible application URLs should be locale-prefixed, for example `/en/customers` and `/th/customers`
- use route groups to express product areas and layout boundaries without polluting URLs
- use path segments to represent user-visible information architecture, not internal team structure
- keep feature pages under the feature's canonical route instead of scattering them by technical concern
- design URLs around stable domain nouns and workflows, not UI widget names

#### Layout and segment rules

- root `layout.tsx` should stay minimal and app-global
- nested layouts should correspond to real shell changes such as auth, locale, tenant, or major product area
- do not add nested layouts only for convenience or file grouping
- use `template.tsx` only when remount semantics are intentionally required
- `loading.tsx`, `error.tsx`, and `not-found.tsx` should exist only where segment-specific UX is needed

#### Dynamic route rules

- use dynamic segments only for stable resource identifiers or intentional workflow state
- prefer human-readable stable identifiers when the product already has them
- do not encode optional UI state as extra path segments when `searchParams` is the correct model
- catch-all routes require explicit justification in the plan because they increase ambiguity
- every dynamic segment should document whether it is cacheable, private, tenant-scoped, or user-generated

#### Search param and URL state rules

- use path segments for resource identity and hierarchy
- use `searchParams` for filtering, sorting, tabs, pagination, and reversible view state
- parse and validate search params in server entry points unless a client-only interaction truly requires client ownership
- if client-managed URL state is needed, use `nuqs` behind an approved client boundary
- plans must state which layer owns URL parsing and normalization

#### Parallel and intercepting routes

- do not use parallel routes by default
- do not use intercepting routes by default
- both require a recorded reason in Planning and a verification scenario
- acceptable cases include enterprise dashboards with persistent shells, modal flows tied to canonical pages, and advanced multi-pane workflows
- if parallel or intercepting routes are introduced, the plan must define fallback behavior, deep-link behavior, refresh behavior, and auth behavior

#### Route handlers and API boundaries

- prefer Server Actions for first-party UI mutations
- use Route Handlers only for public HTTP interfaces, webhooks, machine callbacks, streaming endpoints, or integration boundaries
- do not mirror internal feature actions into `api/*` routes without a real HTTP consumer
- route handlers must stay thin and call feature/server modules, not inline business logic

#### Route design review checklist

Reviewer and Verifier should check:

- is the URL structure understandable to users and maintainers?
- do layout boundaries map to actual product shells?
- are dynamic segments justified and stable?
- are `searchParams` used for view state instead of accidental path inflation?
- are route groups used for organization rather than leaking technical names into URLs?
- are special files (`loading`, `error`, `not-found`, `template`, `default`) placed intentionally?
- are route handlers used only where HTTP boundaries are real?
- does the route tree minimize accidental client work and duplicate data fetching?

### Feature layer

Every feature follows the same shape:

```text
src/features/<feature>/
  actions/
  components/
    client/
  constants/
  contracts/
  data/
  policies/
  schemas/
  tests/
  index.ts
```

Rules:

- `actions/`: server mutations only
- `components/`: server components by default
- `components/client/`: smallest possible interactive islands
- `constants/`: immutable literals, copy, config tables, and feature flags
- `contracts/`: DTOs and public feature interfaces
- `data/`: server-only queries, repositories, and integrations
- `policies/`: authorization and business rules
- `schemas/`: zod input/output validation
- `tests/`: feature-local tests

### Naming and file-system conventions

- feature folders use canonical lowercase kebab-case slugs such as `customers`, `orders`, or `billing-settings`
- feature slug, route-registry family, and i18n namespace should align whenever practical
- product file names use lowercase kebab-case even when exported symbols use PascalCase
- role-specific suffixes should be explicit when they improve scanning: `.action`, `.schema`, `.policy`, `.contract`, `.query`, `.constants`
- nested feature barrels are discouraged; keep `index.ts` at the feature root only
- avoid generic names such as `utils`, `helpers`, `common`, `lib`, or `types` as dumping grounds
- App Router segment folders should use user-facing lowercase names unless the framework requires dynamic or special syntax

### Shared layer

Use `src/shared/` or `packages/*` for truly cross-feature code only.

Allowed examples:

- design-system primitives
- formatting helpers
- logger
- env access
- auth/session primitives
- shared DTO helpers

Avoid moving code into shared folders before at least two features need it.

### Internationalization contract

- `next-intl` is the required i18n layer for this profile
- locale-aware App Router work should be designed around `next-intl`, not a parallel translation stack
- feature namespaces, route ownership, and locale message files should stay aligned

## Convention set

### Server/client boundary rules

- default every new component to server
- only add `"use client"` at leaf boundaries
- client files should live under `components/client/` or use a `.client.tsx` suffix
- client files may not access secrets, database code, or server-only modules
- route segments should pass serialized props to client islands

### Mutation rules

- use `next-safe-action` as the default mutation boundary
- validate every mutation input with `zod`
- authorize inside every Server Action
- explicitly revalidate cache tags or paths after mutation
- prefer `<form action={...}>` over client fetch-based form submission

### Data access rules

- place database and external service calls in feature `data/` modules
- mark server-only modules with `import 'server-only'`
- expose DTOs from `contracts/`, not raw ORM/domain records
- avoid importing repositories directly into route shells when a feature query/presenter exists

### Environment rules

- centralize env validation with `@t3-oss/env-nextjs`
- no direct `process.env` access outside the env module
- separate server and client-safe env surfaces

### Caching rules

Every plan for a new feature must classify data into one of these buckets:

- shared cached
- user-private dynamic
- mutation-driven revalidated
- real-time or explicitly uncached

Every feature plan should record:

- cache source
- invalidation trigger
- tags or paths affected
- whether a client island is actually necessary

### Logging and observability rules

- use `pino` for application logging
- enable agent-friendly dev logging in `next.config.*`
- favor runtime evidence over guesswork during verification

### Client-exception rules

- `swr` is an approved exception only for browser-owned cache or refresh behavior that the server-first path does not cover cleanly
- `nuqs` is an approved exception only for browser-owned URL state that belongs in the interaction layer
- `usehooks-ts`, `immer`, and `use-immer` stay inside narrow client leaves when they improve ergonomics without widening architecture boundaries
- if a client exception is introduced, the plan must record why the route, Server Action, or form boundary was insufficient

### State-machine rules

- `xstate` and `@xstate/react` are allowed for explicit client workflows with clear states, guards, retries, or cancellation
- keep machine definitions in dedicated `*.machine.ts` or `*.machine.tsx` files
- do not use XState for simple toggles, basic disclosures, or primitive interactions that Chakra, Ark, or Zag already models

### Functional-pattern rules

- `effect` is an escalation for multi-step server workflows with typed failures, retries, or resource safety, not a default coding style
- `ts-pattern` is preferred for exhaustive matching over discriminated unions or domain states, not trivial branching
- `dayjs` should be wrapped in named formatting or parsing helpers when locale or timezone behavior matters

### UI-runtime rules

- use `motion` only inside narrow client leaves when CSS or Chakra transitions are not enough
- keep `next-themes` at the app-shell theme boundary
- import `react-icons` from explicit icon subpackages, not the root package
- use `clsx` for deterministic class composition when that is clearer than manual string building
- treat `@emotion/react` as Chakra infrastructure, not a parallel styling system
- keep `sharp` in server or build-time image workflows only

## Optional state extensions

Keep the core workflow schema intact and add stack-specific context only as optional fields.

Recommended extension:

```json
{
  "stackContext": {
    "profile": "nextjs-enterprise",
    "repoTopology": "turbo-monorepo",
    "appLocation": "apps/web",
    "routeMode": "app-router",
    "routeDesign": {
      "canonicalAreas": [],
      "dynamicSegments": [],
      "specialRoutingFeatures": []
    },
    "runtimeModel": "server-first",
    "cacheModel": "cache-components",
    "clientBudget": {
      "defaultPolicy": "minimal",
      "approvedIslands": []
    },
    "migration": {
      "mode": "greenfield-or-legacy",
      "legacySurface": []
    }
  }
}
```

This lets hooks and prompts enforce stack-specific decisions without changing the canonical state machine.

## Artifact plan

### Instructions

1. `.github/instructions/nextjs-docs-first.instructions.md`
   Purpose: require agents to consult project-local Next.js docs and agent context before guessing framework behavior.
   Applies to: `apps/web/**/*,src/**/*,next.config.*,package.json,AGENTS.md`

2. `.github/instructions/nextjs-app-router.instructions.md`
   Purpose: enforce App Router placement, thin route files, and route-shell responsibilities.
   Applies to: `apps/web/src/app/**/*,src/app/**/*`

3. `.github/instructions/nextjs-routing.instructions.md`
   Purpose: enforce route taxonomy, URL design rules, layout boundaries, and safe use of dynamic, parallel, and intercepting routes.
   Applies to: `apps/web/src/app/**/*,src/app/**/*,next.config.*`

4. `.github/instructions/nextjs-server-first.instructions.md`
   Purpose: encode server-first rendering, Server Component defaults, and minimal client-boundary rules.
   Applies to: `apps/web/src/**/*.{ts,tsx},src/**/*.{ts,tsx}`

5. `.github/instructions/nextjs-security.instructions.md`
   Purpose: enforce action authorization, env access rules, DTO boundaries, and mutation safety.
   Applies to: `**/actions/**/*.{ts,tsx},**/route.ts,**/route.tsx,**/proxy.ts,**/middleware.ts,next.config.*`

6. `.github/instructions/nextjs-tooling.instructions.md`
   Purpose: keep lint, typecheck, test, route typing, and governance-file scope aligned with the profile.
   Applies to: `package.json,eslint.config.*,tsconfig*.json,next.config.*`

7. `.github/instructions/nextjs-migration.instructions.md`
   Purpose: guide legacy upgrades from Pages Router and client-heavy code into the new architecture.
   Applies to: `docs/migrations/**/*,.github/prompts/migrate-legacy-nextjs.prompt.md,.github/agents/migrator.agent.md`

8. `.github/instructions/nextjs-app-router-specials.instructions.md`
   Purpose: treat `loading.tsx`, `error.tsx`, `not-found.tsx`, `template.tsx`, and `default.tsx` as first-class route-boundary files with the correct server/client defaults.
   Applies to: `apps/web/src/app/**/*,src/app/**/*`

9. `.github/instructions/nextjs-route-registry.instructions.md`
   Purpose: centralize user-facing path builders and keep route-group or slot syntax out of product code.
   Applies to: `apps/web/src/shared/routes/**,src/shared/routes/**,apps/web/src/app/**/*,src/app/**/*`

10. `.github/instructions/nextjs-mcp.instructions.md`
    Purpose: define how MCP should be used as a design/runtime evidence layer without replacing the local workflow contract.
    Applies to: `apps/web/src/**/*,src/**/*,.vscode/mcp.json,.github/prompts/**/*,.github/agents/**/*`

11. `.github/instructions/nextjs-storybook.instructions.md`
    Purpose: keep Storybook aligned with server-first Next.js patterns, provider wrappers, and safe server-only mocks.
    Applies to: `.storybook/**/*,apps/web/.storybook/**/*,apps/web/src/**/*.stories.*,src/**/*.stories.*`

12. `.github/instructions/nextjs-file-system.instructions.md`
    Purpose: enforce deterministic folder structure, file naming, and export boundaries across routes, features, and shared route helpers.
    Applies to: `apps/web/src/**/*,src/**/*`

13. `.github/instructions/nextjs-i18n.instructions.md`
    Purpose: make `en`/`th` support, default locale `en`, and no-hardcoded-user-facing-text part of the architecture contract.
    Applies to: `apps/web/src/**/*,src/**/*,apps/web/src/messages/**/*,src/messages/**/*`

14. `.github/instructions/nextjs-zag-js.instructions.md`
    Purpose: make Chakra UI, Ark UI, and Zag.js decision order explicit for complex interactive primitives.
    Applies to: `apps/web/src/**/*,src/**/*`

15. `.github/instructions/nextjs-testability.instructions.md`
    Purpose: keep route shells, Server Actions, and feature logic easy to exercise through automated tests.
    Applies to: `apps/web/src/**/*,src/**/*,package.json,vitest.config.*,**/*.{test,spec}.*`

16. `.github/instructions/nextjs-env.instructions.md`
    Purpose: centralize validated env access around `@t3-oss/env-nextjs` and keep raw env parsing out of feature code.
    Applies to: `apps/web/src/**/*,src/**/*,**/env/**/*,**/env.*`

17. `.github/instructions/nextjs-logging.instructions.md`
    Purpose: keep `pino` structured, redacted, and centralized through shared logger boundaries.
    Applies to: `apps/web/src/**/*,src/**/*,**/instrumentation*.*`

18. `.github/instructions/nextjs-client-exceptions.instructions.md`
    Purpose: make `swr`, `nuqs`, `immer`, `use-immer`, and `usehooks-ts` explicit exceptions to the server-first default.
    Applies to: `apps/web/src/**/*,src/**/*`

19. `.github/instructions/nextjs-state-machines.instructions.md`
    Purpose: define when `xstate` and `@xstate/react` are justified and where machine files should live.
    Applies to: `apps/web/src/**/*,src/**/*`

20. `.github/instructions/nextjs-functional-patterns.instructions.md`
    Purpose: keep `effect`, `ts-pattern`, and shared date helpers deliberate and readable.
    Applies to: `apps/web/src/**/*,src/**/*`

21. `.github/instructions/nextjs-ui-runtime.instructions.md`
    Purpose: constrain `motion`, `next-themes`, `react-icons`, `clsx`, and `sharp` so they preserve server-first boundaries.
    Applies to: `apps/web/src/**/*,src/**/*,**/theme*.*,**/providers/**/*`

### Skills

1. `.github/skills/nextjs-architecture/SKILL.md`
   Used by: Planner, Orchestrator
   Focus: choose topology, route ownership, package boundaries, cache model

2. `.github/skills/nextjs-routing/SKILL.md`
   Used by: Planner, Reviewer, Verifier
   Focus: route taxonomy, segment boundaries, layout strategy, URL ownership, and special routing features

3. `.github/skills/nextjs-feature-module/SKILL.md`
   Used by: Planner, Implementer, Reviewer
   Focus: scaffold and review the standard feature folder shape

4. `.github/skills/nextjs-data-access/SKILL.md`
   Used by: Planner, Implementer, Reviewer
   Focus: DAL, DTO, server-only imports, repository/query patterns

5. `.github/skills/nextjs-server-actions/SKILL.md`
   Used by: Planner, Implementer, Verifier
   Focus: `next-safe-action`, zod validation, authorization, revalidation

6. `.github/skills/nextjs-client-boundary/SKILL.md`
   Used by: Planner, Reviewer, Verifier
   Focus: justify every client island, URL state, optimistic UI exceptions

7. `.github/skills/nextjs-runtime-debugging/SKILL.md`
   Used by: Implementer, Verifier
   Focus: `next dev`, terminal/browser evidence, error overlays, runtime traces

8. `.github/skills/nextjs-security-review/SKILL.md`
   Used by: Reviewer, Verifier
   Focus: auth, CSRF surface, env leakage, DTO exposure, unsafe server actions

9. `.github/skills/nextjs-migration/SKILL.md`
   Used by: Migrator, Planner
   Focus: inventory, sequencing, codemods, rollback checkpoints, parity checks

10. `.github/skills/nextjs-mcp-orchestration/SKILL.md`
    Used by: Planner, Verifier, Migrator
    Focus: Figma MCP, Next DevTools MCP, evidence capture, and fallback rules

11. `.github/skills/nextjs-route-registry/SKILL.md`
    Used by: Planner, Implementer, Reviewer
    Focus: canonical shared route helpers and URL consistency

12. `.github/skills/nextjs-browser-qa/SKILL.md`
    Used by: Verifier
    Focus: browser verification, responsive coverage, theme coverage, locale coverage, and runtime evidence

13. `.github/skills/nextjs-storybook-harness/SKILL.md`
    Used by: Implementer, Reviewer
    Focus: Storybook RSC support, server-only mocks, provider wrappers, and client-exception verification

14. `.github/skills/nextjs-file-system-governance/SKILL.md`
    Used by: Planner, Implementer, Reviewer, Migrator
    Focus: canonical feature slugs, fixed folder shape, file naming, and export boundaries

15. `.github/skills/nextjs-i18n/SKILL.md`
    Used by: Planner, Implementer, Reviewer, Verifier
    Focus: locale routing, message organization, parity, and no-hardcoded-text enforcement

16. `.github/skills/nextjs-zag-js/SKILL.md`
    Used by: Planner, Implementer, Reviewer
    Focus: when to use Chakra UI, Ark UI, or Zag.js for interactive primitives

17. `.github/skills/nextjs-testability/SKILL.md`
    Used by: Planner, Implementer, Reviewer, Verifier
    Focus: narrow seams, isolated side effects, and automation-friendly code shape

18. `.github/skills/nextjs-env/SKILL.md`
    Used by: Planner, Implementer, Reviewer
    Focus: `@t3-oss/env-nextjs`, validated env boundaries, and secret-safe access

19. `.github/skills/nextjs-logging/SKILL.md`
    Used by: Implementer, Reviewer, Verifier
    Focus: `pino`, shared logger boundaries, structured evidence, and redaction

20. `.github/skills/nextjs-client-exceptions/SKILL.md`
    Used by: Planner, Reviewer, Migrator
    Focus: deciding when `swr`, `nuqs`, `immer`, or client helper hooks are justified

21. `.github/skills/nextjs-state-machines/SKILL.md`
    Used by: Planner, Implementer, Reviewer
    Focus: when to use `xstate` and `@xstate/react` for explicit workflows

22. `.github/skills/nextjs-functional-patterns/SKILL.md`
    Used by: Planner, Implementer, Reviewer
    Focus: when `effect`, `ts-pattern`, and shared date helpers clarify domain logic

23. `.github/skills/nextjs-ui-runtime/SKILL.md`
    Used by: Planner, Implementer, Reviewer, Verifier
    Focus: `motion`, `next-themes`, `react-icons`, `clsx`, and `sharp` boundaries

### Prompts

1. `.github/prompts/design-nextjs-feature.prompt.md`
   Agent: `Planner`
   Purpose: design a feature using the standard Next.js enterprise module shape

2. `.github/prompts/design-nextjs-routes.prompt.md`
   Agent: `Planner`
   Purpose: design or refactor route trees, layouts, dynamic segments, and URL ownership before implementation

3. `.github/prompts/implement-nextjs-feature.prompt.md`
   Agent: `Implementer`
   Purpose: implement an approved Next.js feature while respecting server-first conventions

4. `.github/prompts/review-nextjs-boundaries.prompt.md`
   Agent: `Reviewer`
   Purpose: audit server/client boundaries, module placement, and consistency

5. `.github/prompts/review-nextjs-routes.prompt.md`
   Agent: `Reviewer`
   Purpose: audit route structure, layout boundaries, URL semantics, and misuse of advanced routing features

6. `.github/prompts/verify-nextjs-runtime.prompt.md`
   Agent: `Verifier`
   Purpose: verify runtime behavior, logging evidence, and acceptance criteria in a Next.js app

7. `.github/prompts/audit-nextjs-security.prompt.md`
   Agent: `Reviewer`
   Purpose: run a focused security and mutation audit before final delivery

8. `.github/prompts/migrate-legacy-nextjs.prompt.md`
   Agent: `Migrator`
   Purpose: inventory a legacy Next.js repo and produce a migration backlog with sequencing

9. `.github/prompts/design-from-figma.prompt.md`
   Agent: `Planner`
   Purpose: turn a Figma-driven request into a route, module, and verification plan

10. `.github/prompts/verify-nextjs-browser.prompt.md`
    Agent: `Verifier`
    Purpose: collect browser-level evidence before delivery for rendered work

11. `.github/prompts/sync-figma-code-connect.prompt.md`
    Agent: `Planner`
    Purpose: audit Code Connect coverage and missing design-system mappings

12. `.github/prompts/audit-nextjs-file-system.prompt.md`
    Agent: `Reviewer`
    Purpose: audit folder-structure drift, file naming, and module placement consistency

13. `.github/prompts/audit-nextjs-i18n.prompt.md`
    Agent: `Reviewer`
    Purpose: audit locale coverage, hardcoded text, translation parity, and default-locale behavior

14. `.github/prompts/audit-nextjs-testability.prompt.md`
    Agent: `Reviewer`
    Purpose: audit hard-to-test code shape, weak automation seams, and avoidable framework coupling

15. `.github/prompts/audit-nextjs-library-decisions.prompt.md`
    Agent: `Reviewer`
    Purpose: audit whether env, logging, client-exception, state-machine, functional, and UI-runtime libraries fit the profile

### Hooks

Create a separate stack hook runtime so the core workflow hook stays generic:

- `.github/hooks/scripts/nextjs_policy.cjs`

Recommended hook configs:

1. `.github/hooks/nextjs-session-context.json`
   Event: session start
   Purpose: remind the agent to read local Next.js docs, check the active topology, and look for stack context

2. `.github/hooks/nextjs-workflow-guard.json`
   Event: pre-tool use
   Purpose: block high-confidence bad moves, such as creating Pages Router files in greenfield mode or bypassing the agreed app location

3. `.github/hooks/nextjs-post-edit-checks.json`
   Event: post-tool use
   Purpose: run deterministic checks on changed files

These Next.js hook configs are additive overlays. Install them alongside the
core `session-context.json`, `workflow-guard.json`, `post-edit-checks.json`,
and `stop-gate.json` files rather than replacing the base workflow hooks. The
stop gate stays in the core layer because task completion rules are stack
agnostic.

Post-edit checks should start with only low-false-positive rules:

- `"use client"` only in approved locations or suffix patterns
- no direct `process.env` outside env modules
- no client imports of server-only modules
- no route-shell direct imports of low-level data adapters where a feature query/presenter layer is required
- no greenfield `pages/` router files
- no route groups named after teams or technical layers
- no `pino()` instances outside approved logger modules
- no client-only runtime libraries such as `swr`, `nuqs`, `motion`, or `next-themes` in server files
- no `effect` in route shells or client leaves without an explicit plan-backed reason
- no root `react-icons` imports
- no parallel or intercepting routes without a recorded planning note
- no new feature module that breaks the standard folder shape

### Workspace support and external context

The strongest version of this profile also ships a small support layer for MCP
and upstream skill packs:

1. `.vscode/mcp.json`
   Purpose: workspace MCP configuration for Ark UI, Chakra UI, Next DevTools, and Figma in VS Code
   Note: the workspace sample should request the Figma Personal Access Token
   through an input variable such as `figma-personal-access-token`, not through
   a committed secret value

2. `skills-lock.json`
   Purpose: lock the recommended upstream skill-pack sources, paths, refs, and hashes used by the profile

3. `.agents/README.md`
   Purpose: explain how upstream packs relate to the local workflow contract

4. `.agents/skills/`
   Purpose: vendor the approved upstream skill packs into the repository so adopters inherit a ready-to-use expert layer without a separate install step

5. `docs/nextjs-enterprise-mcp-playbook.md`
   Purpose: operational playbook for Figma MCP, Next DevTools MCP, and evidence capture

6. `docs/nextjs-enterprise-i18n-playbook.md`
   Purpose: operational playbook for locale strategy, message parity, and no-hardcoded-text policy

7. `docs/migrations/MIGRATION.template.md`
   Purpose: migration tracker template consumed by the Migrator and Planner

8. `docs/nextjs-enterprise-file-system-playbook.md`
   Purpose: operational playbook for canonical slugs, folder shape, and naming consistency

9. `docs/nextjs-enterprise-testability-playbook.md`
   Purpose: operational playbook for keeping changed behavior easy to cover through automated tests

## Proof-driven adoption notes

Disposable live proofing surfaced three stack-specific adoption requirements that should be treated as first-class guidance:

- if a feature uses `import "server-only"`, the target app must declare the `server-only` package explicitly
- if standalone tests import `server-only` modules, the repo needs a stub or alias strategy for the test runner
- if the app relies on route-aware global helpers such as `PageProps`, the validation path must include route type generation or the implementation should use explicit props instead
- app lint should ignore governance automation such as `.github/**` unless the repository intentionally lints workflow assets alongside product code
- route shells and Server Action entrypoints should stay thin enough that changed behavior can be exercised through focused automated tests
- canonical slugs, fixed feature folders, and role-specific file names reduce AI drift enough that they should be treated as first-class governance

### Optional custom agent

1. `.github/agents/migrator.agent.md`
   Scope: Discovery and Planning only
   Purpose: convert legacy Next.js projects into a structured migration inventory and ordered backlog

The Migrator should not replace Planner or Implementer. It feeds them.

## Recommended Next.js runtime defaults

These belong in the eventual implementation profile:

- App Router only for greenfield
- `typedRoutes` enabled
- `cacheComponents` enabled after compatibility review
- explicit `serverActions.allowedOrigins`
- explicit `serverActions.bodySizeLimit`
- agent-friendly logging for browser/runtime evidence in development
- Turbopack as the default bundler path, with compatibility fallback only when evidence requires it
- shared route helpers for reusable user-facing URLs
- Figma MCP and Next DevTools MCP available in teams that rely on design or runtime evidence
- Ark UI MCP and Chakra UI MCP available when the dependency baseline follows `vibe-next-template`
- Zag.js available as the explicit interaction-machine layer for custom primitives
- locale-aware routing with `en` default and `en`/`th` support
- `next-intl` as the required locale-routing and message-loading layer
- visible application routes under `[locale]` so the external URL layer resolves as `/en/...` and `/th/...`
- changed behavior kept behind narrow seams with isolated side effects so tests stay practical
- deterministic feature and route file naming with no generic utility buckets inside product code

## Routing decisions the Planner must make explicitly

Every non-trivial Next.js task should answer these routing questions before implementation:

1. What is the canonical URL for the feature?
2. Which route segment owns data fetching and which feature module owns the business logic?
3. Which layouts are truly needed, and what shell responsibility does each one carry?
4. Are dynamic segments necessary, and what identifier contract do they rely on?
5. Which state belongs in the path and which belongs in `searchParams`?
6. Is any advanced routing feature being proposed, and what exact user experience requires it?
7. What route-level loading, error, unauthorized, or not-found states are required?
8. Does the route shape preserve future extensibility for i18n, tenancy, or admin boundaries?
9. Which shared route helpers or route-registry updates are required?
10. Which i18n namespaces, locale files, and default-locale behaviors are affected?
11. Which behaviors should be covered by focused automated tests, and which seams own that coverage?
12. What canonical feature slug, route family, and file naming pattern should implementation follow?

## Legacy migration design

The migration workflow should produce a checklist across these surfaces:

- Pages Router usage
- `getServerSideProps` / `getStaticProps` / API Routes inventory
- client-heavy components and global `"use client"` boundaries
- ad hoc fetch patterns
- auth/session implementation
- env access patterns
- custom webpack/server config
- caching and invalidation gaps
- test coverage parity
- testability debt caused by route shells, client-heavy workflows, or hidden side effects
- security regressions and exposed data paths

Migration output should include:

- target route mapping
- feature/module ownership mapping
- codemods to run
- manual rewrites required
- rollout order
- rollback plan
- parity verification plan

## Implementation sequence

### Phase A. Foundation

- add instruction overlays
- add Next.js architecture and boundary skills
- add design and implementation prompts
- document the optional state extension

### Phase B. Enforcement

- implement `nextjs_policy.cjs`
- add deterministic stack hook configs
- extend `validate_repo.cjs` and proof coverage for new artifacts

### Phase C. Runtime proof

- create a disposable Next.js project
- install the profile
- generate one server-first feature end to end
- verify route structure, actions, tests, and runtime evidence
- delete the disposable project

### Phase D. Migration support

- add the `Migrator` agent
- add migration prompt and skill
- proof against a small legacy fixture

## Why this design is AI-efficient

- the core workflow stays stable, so phase reasoning does not change
- stack-specific detail moves into on-demand skills, not always-on prose
- route, feature, and package boundaries are explicit, reducing agent guesswork
- hooks enforce only deterministic, high-signal rules
- the same six agents continue to own the phase model
- migration is isolated behind one specialist instead of leaking legacy rules into greenfield work
- i18n is enforced at planning, implementation, review, verification, and deterministic policy levels

## Source notes

This design is informed by the current official Next.js guidance available on March 27, 2026, including:

- Next.js 16.2 AI improvements
- Next.js 16.2 Turbopack updates
- Next.js 16.2 release notes
- Next.js guidance on Server and Client Components
- Next.js guidance on forms and Server Actions
- Next.js security/auth guidance for Server Actions
- Next.js `serverActions` configuration options

These sources reinforce the profile's emphasis on:

- agent-readable project context
- intentional route and layout design
- server-first rendering
- secure Server Actions
- minimal client boundaries
- runtime visibility during debugging
- MCP-backed design and runtime evidence
- external skill packs as an additive framework-knowledge layer
