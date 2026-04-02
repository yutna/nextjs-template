---
applyTo: "**"
---
# GitHub Copilot Configuration

Follow [AGENTS.md](../AGENTS.md) as the canonical workflow contract.

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
