---
applyTo: "**"
---
# GitHub Copilot Configuration

Follow [AGENTS.md](../AGENTS.md) as the canonical workflow contract.

Operational quick reference: [Workflow SOP (One Page)](../docs/general/WORKFLOW-SOP.md)

## Quick Reference

### Workflow Phases
1. **Discovery** - Clarify requirements, define scope, write acceptance criteria
2. **Planning** - Explore patterns, document approach, identify dependencies
3. **Implementation** - Code within approved scope, preserve conventions
4. **Quality Gates** - Type check, lint, tests (in order)
5. **Verification** - Confirm behavior matches acceptance criteria
6. **Delivery** - Summarize changes, report gate results honestly

### State Files
- **Workflow state**: `.claude/workflow-state.json` (shared with Claude Code)
- **Profile config**: `.claude/workflow-profile.json` (stack and conventions)
- **Codebase index**: `.claude/generated/codebase-index.json` (dynamic)

## Copilot-Specific Resources

### Agents
Phase specialist agents in `.github/agents/`:
- `orchestrator.agent.md` - Coordinates workflow, delegates to specialists
- `requirements-analyst.agent.md` - Discovery phase specialist
- `planner.agent.md` - Planning phase specialist
- `implementer.agent.md` - Implementation phase specialist
- `reviewer.agent.md` - Review phase specialist
- `verifier.agent.md` - Quality gates and verification specialist

### Prompts
Workflow commands in `.github/prompts/`:
- `/discover` - Start discovery phase
- `/plan-work` - Create implementation plan
- `/implement` - Execute approved plan
- `/review` - Review implemented work
- `/gates` - Run quality gates
- `/deliver` - Prepare delivery summary
- `/recover` - Recover from failures

**Note**: These prompts are designed for **GitHub Copilot Chat** (VS Code extension or web interface). Invoke them via the Copilot Chat interface in your IDE or on github.com. GitHub Copilot does not provide automated phase orchestration via CLI; the workflow is chat-driven.

**Parity Note**: GitHub Copilot does not have automatic stop-time workflow gates like Claude Code does. Follow [AGENTS.md](../AGENTS.md) phase rules, non-negotiable rules, and quality gates for manual gate discipline.

### Skills
Deep pattern documentation in `.github/skills/` (symlinked from `.claude/skills/`).

### Instructions
Path-specific guidance in `.github/instructions/`:
- `workflow-core.instructions.md` - Core workflow rules
- `nextjs-modules.instructions.md` - Module conventions
- `nextjs-shared.instructions.md` - Shared conventions
- `nextjs-app-router.instructions.md` - Route conventions
- `typescript.instructions.md` - TypeScript rules
- `effect-backend.instructions.md` - Effect patterns
- `tests.instructions.md` - Testing conventions

## Stack Summary (Next.js Enterprise)

| Category | Technology |
|----------|------------|
| UI | Chakra UI v3 + Ark UI |
| State | XState, Zag.js, nuqs, immer |
| Backend | Effect (always for services, repositories, jobs) |
| Database | Drizzle ORM |
| Jobs | Trigger.dev |
| Server Actions | next-safe-action + Zod |
| i18n | next-intl (en/th) |
| Testing | Vitest + Testing Library |

## Directory Structure

```
src/
├── app/[locale]/     # App Router routes (thin shells)
├── modules/<name>/   # Feature modules (domain-driven)
│   ├── actions/      # Server actions
│   ├── services/     # Business logic (Effect)
│   ├── repositories/ # Data access (Effect + Drizzle)
│   ├── components/   # UI components
│   ├── containers/   # Client binding
│   └── screens/      # Page composition
└── shared/           # Cross-cutting code
    ├── entities/     # ALL Drizzle schemas
    ├── db/           # Database client
    └── ...
```

## Key Rules

1. **Server-first**: Default to Server Components
2. **Effect for backend**: Services, repositories, jobs, API handlers
3. **No cross-module imports**: Move shared code to `shared/`
4. **Entities in shared only**: Never in modules
5. **Tests required**: For all code except entities

## Database Workflow (Local File Default)

- Use local DB files under `src/shared/db/local/`
- Keep migrations in `src/shared/db/migrations/`
- Keep seeds in `src/shared/db/seeds/`
- Split DB by environment (`development.sqlite`, `test.sqlite`, `production.sqlite` local default)
- For remote production DBs, keep production URL in env and do not reuse local dev/test files

## Zero Tolerance Policy

**Target: 0 warnings, 0 errors — always.**

HARD rules (no exceptions):
- **No `any` type** — import types from libraries, use `unknown` + type guards
- **No eslint-disable as first resort** — fix root cause or add config exception
- **No type assertions that break lint** — use proper TypeScript patterns
- **Prefer named `function` declarations** — use arrow only when contextually required
- **No inline param type literals** — extract to `types.ts` (create it if missing)
- **Prefer direct React type imports** — e.g. `import type { ChangeEvent } from "react"`
- **Single object local state only** — use one `useImmer({ ... })` store, no `useState`
- **No deprecated APIs** — especially Zod deprecations

See [AGENTS.md](../AGENTS.md) for full Zero Tolerance Policy.
