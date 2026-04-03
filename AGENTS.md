# AI Workflow Contract

This repository defines a workflow-first operating standard for AI-assisted software engineering. This contract applies to all AI coding agents (Claude Code, GitHub Copilot, Cursor, etc.).

Operational quick reference: [Workflow SOP (One Page)](./docs/general/WORKFLOW-SOP.md)

## Optimize for

1. Workflow adherence
2. Correctness
3. Consistency
4. Error recovery
5. State awareness
6. Minimal rework
7. User satisfaction
8. Token efficiency

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

## Zero Tolerance Policy

**Target: 0 warnings, 0 errors — always.** This applies to lint, type-check, and editor warnings.

### HARD Rules (No Exceptions)

#### No `any` Type

The `any` type is **forbidden**. No exceptions.

| Situation | Wrong | Right |
|-----------|-------|-------|
| Unknown library type | `as any` | Import type from library |
| Complex generic | `any` | Use `unknown` + type guards |
| Quick fix | `// @ts-ignore` | Find the proper type |

#### No eslint-disable as First Resort

Never add `eslint-disable` to bypass a rule. Fix the root cause.

| Problem | Wrong | Right |
|---------|-------|-------|
| Type mismatch | `// eslint-disable ...` | Import proper types |
| Rule violation | Inline disable | Fix code or update config |
| Unused variable | `// eslint-disable no-unused-vars` | Remove the variable |

**Allowed only when:**

- Single exceptional line with clear `-- reason` comment
- After confirming no config-level solution exists

#### No Type Assertions That Break Lint

```typescript
// WRONG - breaks section-order lint (regex can't match generic)
const ref = useRef(null) as React.RefObject<HTMLElement>;

// CORRECT - proper TypeScript
const ref = useRef<HTMLElement | null>(null);
```

#### Function Syntax Default

Default to `function` declarations for named functions.

Use arrow functions only when contextually appropriate:

- anonymous inline callbacks
- lexical `this` behavior is required
- specific hoisting trade-off is intentional

Do not use arrow functions as the default style for named functions.

#### No Inline Param Types

Inline parameter type literals are forbidden.

| Wrong | Right |
|-------|-------|
| `function x({ a }: { a: string }) {}` | Define the param type in `types.ts`, then import and use it |

Rule: if `types.ts` does not exist, create it first.

#### React Event Type Import Style

Prefer direct type imports from React.

| Wrong | Right |
|-------|-------|
| `React.ChangeEvent<HTMLInputElement>` | `import type { ChangeEvent } from "react"` then `ChangeEvent<HTMLInputElement>` |

#### Component State Shape Rule

If local state is required in a component, keep it as a single object state source using `useImmer({ ... })`.

- no `useState`
- no multiple separate state stores in one component

#### No Deprecated APIs

Using deprecated APIs is forbidden (especially Zod deprecations).

- when deprecation warnings/errors appear, fix immediately
- do not ship code that relies on deprecated APIs

### ESLint Config Over Inline Disables

For legitimate technical requirements, add exceptions in `eslint.config.mjs`:

```javascript
{
  files: ["src/shared/components/motion-*/**"],
  rules: {
    "project/no-inline-style": "off",
  },
},
```

### Signature Change Protocol

When changing function signatures:

1. Find all usages: `grep -rn "functionName(" src/`
2. Update all callers in same commit
3. Run: `npm run lint && npm run check-types && npm test`

### Lint Rule Maintenance

If a lint rule doesn't support valid TypeScript patterns, **fix the rule** — don't work around it.

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

Before taking action:

1. identify the current phase
2. check `.claude/workflow-state.json`
3. check `.claude/workflow-profile.json` when the task depends on repo-specific roots, quality gates, or adoption state
4. identify whether the decision surface falls under a hard convention, a strong default, or local freedom
5. confirm the preconditions for the next step

When completing a phase, update the workflow state so the next step can continue without guessing.

## Artifact Model (Critical)

The repository uses different artifact classes. Do not mix them:

- `docs/tasks/*.md`: Human-readable decomposition/spec artifacts.
  - Produced by decomposition flows (e.g., `/decompose-requirements`).
  - Intended for human review and later AI reference.
  - Not runtime state.
- Session `plan.md`: AI runtime planning artifact for the current task/session.
  - Tracks implementation sequencing during active execution.
  - Not a replacement for `docs/tasks/*.md` feature specs.
- `.claude/workflow-state.json`: AI runtime state machine.
  - Tracks current phase/status/gates.
  - Not a requirements document and not an E2E spec.

Rules:

1. Do not treat `docs/tasks/*.md` as mutable runtime state.
2. Do not write runtime execution status into `docs/tasks/*.md`.
3. When a command says output is `docs/tasks/*`, create those files explicitly.
4. If file creation is unavailable in the runtime, report it as a blocked parity issue.

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

## Self-Healing Contract

**First-Result Excellence**: Deliver production-ready code on the first attempt. Do not present work to the user until it meets all quality standards.

### Autonomous Quality Loop

When implementing any change, automatically execute this loop before presenting results:

```txt
1. Implement change
2. Run type check → if errors, fix and goto 1
3. Run lint → if errors/warnings, fix and goto 1
4. Run tests → if failures, fix and goto 1
5. Verify all acceptance criteria → if incomplete, fix and goto 1
6. Only when ALL pass → present to user
**This loop is MANDATORY for Implementation phase.** Never skip to Delivery when gates are incomplete or failing.
```

### Self-Healing Rules

- **Never stop at first failure**: Continue fixing until all gates pass or retry budget is exhausted
- **Never present broken code**: If any gate fails, fix it before showing results to user
- **Never ask user to fix AI mistakes**: Type errors, lint warnings, and test failures caused by AI changes must be fixed by the AI
- **Never skip gates**: All applicable quality gates must run and pass
- **Never deliver partial work**: All planned items must be implemented before delivery

### What "Done" Means

Work is NOT done if any of these are true:

- Type check has errors
- Lint has warnings or errors
- Tests are failing
- Implementation is incomplete vs. plan
- Acceptance criteria are not met

### Self-Healing Examples

| Situation | Wrong | Right |
|-----------|-------|-------|
| Type error after edit | "There's a type error, please fix" | Fix the type error, rerun checks, then present |
| Lint warning | Present code with warning | Fix warning, verify clean, then present |
| Test failure | "Test is failing, might need adjustment" | Fix the code or test, verify pass, then present |
| Missing implementation | "I've done part of it" | Complete all planned items, then present |
| Forgot to add test | Deliver without test | Add test, verify pass, then deliver |

### Escalation Criteria

Only escalate to user when:

- Retry budget (3 attempts) is exhausted for the same issue
- The fix requires clarification on requirements (not technical issues)
- The failure reveals a pre-existing issue unrelated to current work
- External dependency or environment issue blocks progress

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
- the source of truth is the local workflow contract expressed through configuration files, skills, commands, profiles, and hooks
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

During **Implementation**: stay inside the approved scope. Preserve hard conventions and follow strong-default decisions from the approved plan. Update tests for changed behavior. Keep workflow state current. Upon completion:

  1. Run type check → lint → tests in canonical order
  2. Verify all acceptance criteria
  3. If any gate fails, fix root cause and rerun from step 1
  4. When all pass, automatically proceed to Quality Gates and Verification
  5. Present results only when fully ready (never intermediate states)

Use only `implementation.status` values: `not-started`, `in-progress`, `completed`, or `blocked`. Do not run commit, push, release, or PR commands unless the user explicitly asks.

**Note**: This is the autonomous happy-path. For strict phase-by-phase workflow (user approval between phases), that must be invoked explicitly as a different mode.

During **Review**: findings only. Do not edit implementation files. Classify findings by convention tier. Route material findings back to Implementation or Planning. Stop after returning findings.

During **Quality Gates / Verification**: run gates in canonical order (type → lint → tests), verify acceptance criteria, report honestly. Route failures to the earliest valid recovery phase. Use delivery status values: `blocked`, `ready-for-review`, or `approved`. Do not hide failures or partial validation.

During **Delivery**: summarize changes honestly. Report exact gate results. State any remaining follow-up items explicitly. Do not claim completion before gates and verification pass. Do not continue into commit, push, release, or PR actions unless the user explicitly asks.

When in doubt, move one phase earlier, make state explicit, and choose the smaller safe step.

## Pattern Selection Rules

Before implementing, check which patterns apply:

### Data Layer

| If you need to... | Use |
|-------------------|-----|
| Define database table | Entity (`shared/entities/`) |
| Validate API/form input | Zod Schema (`schemas/`) |
| CRUD operations | Repository |
| Always run on create/update/delete | Entity Hooks (`hooks.ts`) |
| Reusable query filters | Query Scopes (`scopes.ts`) |

### Business Logic

| If you need to... | Use |
|-------------------|-----|
| Orchestrate business logic | Service |
| Handle UI mutation | Server Action |
| Expose external endpoint | API Route Handler |
| Long-running task (>10s) | Background Job |
| Resource authorization | Policy |

### Data Transformation

| If you need to... | Use |
|-------------------|-----|
| Format entity for API response | Presenter |
| Hide sensitive fields | Presenter |
| Multi-step form validation | Form Object |
| Cross-field validation | Form Object |
| Simple field validation | Zod Schema only |

### State Management

| If you need to... | Use |
|-------------------|-----|
| Local component state | Single object `useImmer({ ... })` store |
| 4+ states with transitions | State Machine (XState) |
| Standard UI primitive (menu, dialog) | UI State Library (Zag.js) |
| URL-persisted state (filters, pagination) | URL State Library (nuqs) |

### Communication

| If you need to... | Use |
|-------------------|-----|
| Send transactional email | Email Service + Job |
| Server -> client updates only | SSE |
| Bi-directional / presence / private channels | WebSocket Service |

### UI Components

| If you need to... | Use |
|-------------------|-----|
| Page-level composition | Screen (server) |
| Data fetching + client binding | Container (client) |
| Pure UI rendering | Component (server) |
| Used by 2+ modules | `shared/components/` |
| Used by 1 module | `modules/<name>/components/` |

### Quick Decision Shortcuts

- **Returning entity from API?** → Use Presenter
- **Form with steps or complex validation?** → Use Form Object
- **More than 3 states?** → Consider State Machine
- **Same filter in 2+ places?** → Extract to Query Scope
- **Side effect on every save?** → Use Entity Hook
- **Task takes >10 seconds?** → Use Background Job

### Folder Placement Decision Tree

### Clarification: Generic Files & helpers.ts Rule

**FORBIDDEN**: Root-level `helpers.ts`, `utils.ts`, `common.ts` at module/shared root (grab-bags).
**ALLOWED**: Scoped `helpers.ts` inside domain folders, NOT exported.

- ✅ `src/modules/users/services/create-user-service/helpers.ts` (internal)
- ❌ `src/modules/users/helpers.ts` (root level, forbidden)

When creating new code, ask in order:

| Question | If Yes → |
|----------|----------|
| Does it render UI (JSX)? | `components/` |
| Is it a React hook? | `hooks/` |
| Is it a React context/provider? | `contexts/` or `providers/` |
| Does it wrap an external service/API? | `lib/` |
| Is it domain configuration (variants, presets, mappings)? | `lib/` |
| Is it a pure stateless utility function? | `utils/` |
| Is it a constant value (no logic)? | `constants/` (flat file) |
| Is it a TypeScript type/interface? | `types/` (flat file) |

**Key distinctions:**

- `lib/` = Has structure, may have state, wraps complexity, domain-specific
- `utils/` = Pure functions, stateless, generic, could be in any project
- `constants/` = Just values, no functions, flat files only
- `components/` = Must return JSX

**Backend vs Frontend `lib/` (Critical)*:

| lib/ Type | Technology | Used By | Pattern |
|-----------|-----------|---------|---------|
| **Backend integrations** | Effect (REQUIRED) | services, repositories, jobs | `Effect.Effect<A, E, R>` |
| **Frontend utilities** | Promise or sync | components, hooks, SWR | `Promise<T>` or sync function |
| **Infrastructure** | Native/no framework | all | Plain exports (logger, config) |

**backend lib/ (Effect)**:

```typescript
// shared/lib/stripe/stripe-client.ts
export class StripeClient extends Context.Tag("StripeClient")<...>() {}
export const StripeClientLive = Layer.succeed(StripeClient, { ... });
```

**Frontend lib/ (Promise or sync)**:

```typescript
// shared/lib/fetcher/fetch-client.ts - for SWR integration
export async function fetchClient<T>(options): Promise<T> { ... }
```

**RULE**: If `lib/` is consumed by services/repositories/jobs → Effect (MANDATORY). If consumed by React components/hooks → Promise or sync.

## Rails to Next.js Pattern Mapping

| Rails Pattern | Next.js Equivalent | Location |
|---------------|-------------------|----------|
| Model | Entity (Drizzle) | `shared/entities/<name>/` |
| Model callbacks | Entity Hooks | `shared/entities/<name>/hooks.ts` |
| Model scopes | Query Scopes | `shared/entities/<name>/scopes.ts` |
| Validations | Zod Schema | `modules/<name>/schemas/` |
| Controller | Server Action | `modules/<name>/actions/` |
| Service Object | Service (Effect) | `modules/<name>/services/` |
| Repository | Repository (Effect + Drizzle) | `modules/<name>/repositories/` |
| Serializer | Presenter | `modules/<name>/presenters/` |
| Form Object | Form | `modules/<name>/forms/` |
| Policy (Pundit) | Policy (Effect) | `modules/<name>/policies/` |
| Mailer (ActionMailer) | Email Service | `shared/services/email/` |
| Channel (ActionCable) | Realtime Service | `shared/services/realtime/` |
| Background Job | Background Job | `modules/<name>/jobs/` |
| Migration | Database Migration | `shared/db/migrations/` |
| Seeds | Seeds | `shared/db/seeds/` |
| Factory (FactoryBot) | Factory | `shared/factories/` |

### Pattern Details

- **Entity Hooks**: Lifecycle callbacks (`beforeCreate`, `afterCreate`, `beforeUpdate`, `afterUpdate`, `beforeDelete`, `afterDelete`)
- **Query Scopes**: Composable WHERE conditions (`active()`, `withRole(role)`, `createdAfter(date)`)
- **Presenters**: Transform entities to JSON for API responses (`toJSON()`, `toList()`, `toOption()`)
- **Forms**: Multi-step form validation and entity transformation (`schema`, `validateStep()`, `toCreateData()`)
- **Realtime**: SSE for simple cases, WebSocket for bi-directional communication

## Database Conventions

Apply these conventions to all database backends.
For file-based local databases (SQLite/libSQL file mode), also follow the local file path rules below.

### DB Layout

- migrations: `src/shared/db/migrations/`
- seeds: `src/shared/db/seeds/`

For file-based local DBs only:

- local DB files: `src/shared/db/local/`

### Environment Separation

Use different DB targets per environment:

File-based local DB defaults (SQLite/libSQL file mode):

- development: `file:src/shared/db/local/development.sqlite`
- test: `file:src/shared/db/local/test.sqlite`
- production local default (if needed): `file:src/shared/db/local/production.sqlite`

If production uses a remote provider (Turso/libSQL remote), keep production URL externalized in env and do not share development/test DB files.

### Ownership Rules

- DB runtime and schema plumbing live in `src/shared/db/`
- feature modules never own migrations or seed entrypoints
- entities remain in `src/shared/entities/`

### Workflow Requirements

For DB-related changes, planning and verification must explicitly include:

1. target environment (`dev`/`test`/`prod`)
2. migration impact and rollback strategy
3. seed impact and determinism expectations
4. post-change gate run including tests that depend on DB state
5. test DB isolation strategy (transaction rollback, truncate/reset, or per-run isolated DB)
