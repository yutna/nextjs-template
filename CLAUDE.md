# AI Workflow Contract

This repository defines a Claude Code-first, workflow-first operating standard for AI-assisted software engineering.

Optimize for:

1. Workflow adherence
2. Correctness
3. Consistency
4. Error recovery
5. State awareness
6. Minimal rework
7. User satisfaction
8. Token efficiency

## Order of precedence

Apply instructions in this order:

1. Direct user instruction
2. This `CLAUDE.md`
3. Relevant `.claude/skills/`
4. Relevant `.claude/commands/`
5. Hooks and deterministic policy checks

If sources conflict, follow the highest-priority source and keep the conflict explicit.

## Canonical workflow

Every non-trivial task follows these phases:

1. Discovery
2. Planning
3. Implementation
4. Quality Gates
5. Verification
6. Delivery

The workflow is a loop, not a line. Roll back to the earliest required phase when new information invalidates later work.

## Phase rules

### 1. Discovery

Goals:

- clarify the real problem
- define scope and out-of-scope items
- capture constraints, assumptions, and risks
- write acceptance criteria that can be verified later

Do not:

- create an implementation plan while behavior-changing ambiguity remains
- implement code before requirements are clear
- claim understanding without surfacing unresolved questions

Exit criteria:

- requirements are clarified or explicitly approved as sufficient
- open questions are either resolved or intentionally deferred
- acceptance criteria exist

Rollback trigger:

- if the user says "not what I meant" or ambiguity affects behavior, go back here

### 2. Planning

Goals:

- explore existing patterns and reusable surfaces
- decide where the work belongs
- document the approach, dependencies, risks, and files in scope
- define the validation path before implementation starts
- choose seams and module boundaries that keep changed behavior easy to test

Do not:

- edit implementation files before a plan exists for non-trivial work
- change architecture or conventions without justification
- skip approval when the task needs a plan
- choose a design that forces simple behavior to be verified only through the full app runtime when a smaller seam is practical

Exit criteria:

- plan is explicit
- files and ownership boundaries are clear
- dependencies are identified
- the next implementation step is unambiguous

Rollback trigger:

- if the plan is rejected or a major architectural assumption changes, return here

### 3. Implementation

Goals:

- implement only the approved scope
- preserve established patterns, style, naming, and architecture
- add or update tests for changed behavior
- keep changed behavior behind seams that remain practical to exercise in automated tests
- keep the state record current

Do not:

- expand scope without an explicit reason
- rewrite unrelated areas
- "fix forward" with random edits that are not tied to a root cause

Exit criteria:

- code changes are complete for the approved scope
- impacted behavior has corresponding tests where the project supports tests
- touched files are recorded in state

Rollback trigger:

- if a requirement changes materially, return to Discovery or Planning

### 4. Quality Gates

Run every applicable automated gate in order:

1. Type check
2. Lint
3. Tests

Rules:

- use existing project commands only
- if a gate is not available, record `not-applicable` with a reason
- if any gate fails, fix the root cause and rerun the full gate sequence from the start
- never treat partial success as release-ready
- if automation is weak because the code shape is hard to test, report that as a design issue instead of silently accepting it
- do not present work as done while any required gate is pending, failing, or unverified
- do not confuse green automation with correct UX; verification still matters

Exit criteria:

- all applicable automated gates are green

Rollback trigger:

- if fixes require design changes, return to Implementation or Planning

### 5. Verification

Goals:

- confirm behavior matches acceptance criteria
- confirm review findings are resolved before final delivery
- review the UX and runtime flow
- perform a self-review for correctness, safety, and convention compliance

Do not:

- deliver based on automated checks alone when runtime or UX verification is still required
- ignore edge cases found during self-review

Exit criteria:

- acceptance criteria are satisfied
- self-review is clean or findings are fixed
- review findings are fixed or intentionally resolved

Rollback trigger:

- runtime bug -> Implementation
- convention or correctness issue -> Quality Gates after the fix

### 6. Delivery

Goals:

- summarize what changed and why
- report gate results honestly
- state any remaining follow-up items explicitly

Do not:

- claim completion before gates and verification pass
- hide uncertainty, missing validation, or blocked items

Exit criteria:

- user can review a clear, honest handoff
- if the user approves, the task is done

Rollback trigger:

- "close but needs tweaks" -> Implementation
- "not what I meant" -> Discovery

## Non-negotiable rules

- No implementation before clarified requirements.
- No non-trivial code changes before a plan exists.
- No delivery before applicable gates and verification pass.
- No silent architecture, convention, or style changes.

## Definition of done

Work is done only when all applicable conditions are true:

- the requested behavior works end-to-end
- acceptance criteria are satisfied
- existing tests still pass
- new or changed behavior is covered appropriately
- the code shape still supports appropriate automated testing without unnecessary framework coupling
- type checking passes or is explicitly not applicable
- lint passes or is explicitly not applicable
- verification is complete
- no unresolved correctness, security, or convention issues remain
- the handoff is clear enough that the user does not need to reverse-engineer the work

## State contract

Keep task state explicit. The state file lives at `.claude/workflow-state.json`.

At minimum, state must include:

- current phase
- task identifier or short title
- requirements status
- acceptance criteria
- constraints
- open questions
- plan status
- files in scope
- implementation status
- quality gate status
- verification status
- delivery readiness
- retry count and blocked items

If state is missing or stale, refresh it before taking risky actions.

Prefer the workflow state API when command execution is available:

```bash
node .claude/hooks/scripts/workflow_hook.cjs update-state phase=planning plan.status=proposed
```

Use direct file edits for `.claude/workflow-state.json` only as a fallback when the state API is unavailable.

Before taking action:

1. identify the current phase
2. check `.claude/workflow-state.json`
3. check `.claude/workflow-profile.json` when the task depends on repo-specific roots, quality gates, or adoption state
4. identify whether the decision surface falls under a hard convention, a strong default, or local freedom
5. confirm the preconditions for the next step

When completing a phase, update the workflow state so the next step can continue without guessing.

## Recovery contract

When something fails:

1. identify the failing phase
2. read the actual failure signal
3. find the root cause
4. roll back to the earliest required phase
5. fix deliberately
6. rerun all required downstream gates

Never patch blindly.

### Retry budget

- default maximum: 3 repair attempts per work item
- after the budget is exhausted, mark the work item as blocked
- record the blocker, current evidence, and the recommended rollback phase

## Consistency contract

Be predictable:

- reuse existing architecture and conventions
- do not invent naming schemes or folder structure changes
- keep prompts, skills, and commands aligned with the same phase model
- keep always-on guidance short and stable
- move detailed procedures into on-demand skills

## Convention model

The workflow is contract-driven, not reference-driven.

- sample repositories, generated apps, and migrations can validate the workflow, but they are not the source of truth
- the source of truth is the local workflow contract expressed through `CLAUDE.md`, skills, commands, profiles, and hooks
- prefer convention over deliberation: remove recurring structural decisions from task-level reasoning when the workflow can decide them once

Classify convention decisions into these tiers:

- Hard conventions: fixed rules that should not drift without an explicit user or profile-level decision
- Strong defaults: preferred answers that should be reused unless the plan records a justified deviation
- Local freedom: implementation details that may vary inside a stable contract without harming consistency

Examples:

- Hard conventions: workflow phase order, state contract, required quality gates, required route or boundary grammar, required naming schemes declared by the active profile
- Strong defaults: recommended repo topology, recommended module shapes, preferred library choices, preferred verification paths
- Local freedom: helper extraction, internal function decomposition, local component factoring, small private naming choices that do not change public grammar

Rules:

- planning must state when work follows strong defaults and when it intentionally deviates from them
- review must treat hard-convention violations as blocking unless the requirements changed deliberately
- review may treat unjustified strong-default drift as a finding even when the code still works
- local-freedom variation is acceptable unless it harms correctness, testability, or future consistency
- do not use a sample repository as the reason a design is correct; use the contract that governs the repository

## Behavioral modes by phase

During **Discovery**: ask questions, do not plan or implement, do not create implementation files. Use only `requirements.status` values: `needs-clarification`, `clarified`, or `approved`. Stop after delivering the discovery result.

During **Planning**: explore and plan, do not implement. Classify convention decisions. Make the plan specific enough that implementation does not guess. Use only `plan.status` values: `not-started`, `proposed`, `approved`, or `blocked`. Stop after delivering the plan.

During **Implementation**: stay inside the approved scope. Preserve hard conventions and follow strong-default decisions from the approved plan. Update tests for changed behavior. Keep workflow state current. You may run a narrow smoke test, but do not mark quality gates complete. Use only `implementation.status` values: `not-started`, `in-progress`, `completed`, or `blocked`. Do not run commit, push, release, or PR commands unless the user explicitly asks.

During **Review**: findings only. Do not edit implementation files. Classify findings by convention tier. Route material findings back to Implementation or Planning. Stop after returning findings.

During **Quality Gates / Verification**: run gates in canonical order, verify acceptance criteria, report honestly. Route failures to the earliest valid recovery phase. Use delivery status values: `blocked`, `ready-for-review`, or `approved`. Do not hide failures or partial validation.

During **Delivery**: summarize changes honestly. Do not claim completion before gates and verification pass. Do not continue into commit, push, release, or PR actions unless the user explicitly asks.

When in doubt, move one phase earlier, make state explicit, and choose the smaller safe step.

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
├── actions/       # Server actions (next-safe-action + Zod)
├── components/    # Pure UI components (mostly server)
├── constants/     # Module constants
├── containers/    # Logic binding layer (client when needed)
├── contexts/      # React contexts
├── hooks/         # Custom hooks (client)
├── layouts/       # Feature-specific layouts (rare)
├── lib/           # Domain implementations, wrappers (e.g., Stripe API)
├── providers/     # Feature-scoped React providers
├── schemas/       # Zod schemas (not in lib/)
├── screens/       # Page-level composition (server)
├── types/         # Module-wide types (when co-location isn't enough)
└── utils/         # Pure utility functions (e.g., format-thai-currency)
```

### Shared Structure

The `src/shared/` directory follows:

```
shared/
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
| Functional | Effect | Composable, type-safe error handling and async flows |
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

### File Structure Conventions

#### Naming Patterns

| Folder Type | Pattern | Examples |
|-------------|---------|----------|
| Components | `<semantic-type>-<name>/` | `form-contact/`, `modal-confirmation/`, `alert-warning/`, `section-hero/`, `menu-sidebar/` |
| Containers | `container-<name>/` | `container-user-list/`, `container-checkout/` |
| Screens | `screen-<name>/` | `screen-welcome/`, `screen-user-detail/` |
| Hooks | `use-<name>/` | `use-vibe-background/`, `use-user-form/` |
| Actions | `<name>-action/` | `create-user-action/`, `report-error-action/` |

Component semantic types: `form-`, `modal-`, `alert-`, `section-`, `menu-`, `card-`, `table-`, `list-`, `button-`, `input-`, `dialog-`, `drawer-`, `toast-`, `badge-`, `avatar-`, `icon-`

#### Folder vs Flat Files

| Structure | Subdirs | Notes |
|-----------|---------|-------|
| **Always folders** | actions, api, components, containers, contexts, hooks, layouts, lib, providers, schemas, utils | Each item is a folder with `index.ts` barrel export |
| **Always flat files** | config, constants, images, styles, types | Can have nested folders for grouping, but NO `index.ts` re-export |
| **Special** | routes | Mirrors app router path structure |

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

- **No inline functions** outside main declaration — helpers go in `helpers.ts`
- **No inline constants** — constants go in `constants.ts`
- **No inline types** — types/interfaces go in `types.ts`
- **helpers.ts is internal** — specific to that folder, NOT exported, NOT used outside

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

### Forbidden Patterns

- Generic files: `utils.ts`, `helpers.ts`, `common.ts` — use specific named modules
- "use client" in screens/ — screens should be server components
- Direct DOM manipulation — use React patterns
- Untyped server actions — always use Zod validation
