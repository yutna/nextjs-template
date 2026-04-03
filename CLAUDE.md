# Claude Code Configuration

This file configures Claude Code for this repository. **For the universal AI workflow contract, see [AGENTS.md](./AGENTS.md)**—that is the single source of truth.

## Instruction Precedence

Apply instructions in this order:

1. Direct user instruction
2. [AGENTS.md](./AGENTS.md) (universal workflow contract + all patterns)
3. Relevant path-specific `.github/instructions/*.md`
4. Relevant `.claude/skills/`
5. Relevant `.claude/commands/`
6. Workflow hooks and policy checks

If sources conflict, follow the highest-priority source.

## Claude-Specific Tools

### Workflow State API

When command execution is available, use the workflow state API:

```bash
node --experimental-strip-types --no-warnings bin/vibe task workflow:hook -- update-state phase=planning plan.status=proposed
```

Fallback: Direct file edits to `.claude/workflow-state.json` (only if API unavailable).

### MCP Servers

Configured in `.mcp.json` (auto-loaded):

- **ark-ui**: Component properties and examples
- **chakra-ui**: Theme, components, props
- **next-devtools**: Next.js routes, errors, cache
- **playwright**: Browser automation for QA

## Quick Reference: Next.js Stack

| Category | Technology |
|----------|------------|
| UI | Chakra UI v3 + Ark UI |
| State | XState, Zag.js, nuqs, immer |
| Backend | Effect (ALWAYS for services, repositories, jobs, api) |
| Database | Drizzle ORM |
| Jobs | Trigger.dev |
| Server Actions | next-safe-action + Zod |
| i18n | next-intl (en/th locales) |
| Testing | Vitest + Testing Library |
| Logging | Pino |

## Database Workflow (Local File Default)

- local DB files: `src/shared/db/local/`
- migrations: `src/shared/db/migrations/`
- seeds: `src/shared/db/seeds/`
- split DB by environment (`development.sqlite`, `test.sqlite`, `production.sqlite` local default)
- if production uses remote libSQL/Turso, keep production URL externalized and separate from local dev/test files

For the runnable template DB scaffold and command flow, see `docs/db/database-workflow.md`.

## Directory Summary

- `src/app/[locale]/` → App Router routes (thin shells)
- `src/modules/<feature>/` → Feature modules with actions, services, repositories, components, etc.
- `src/shared/` → Cross-cutting: db, entities, services, components, lib, providers
- `.claude/` → Claude Code config, commands, skills, hooks, state
- `.github/` → GitHub Copilot config, prompts, agents, instructions, hooks

For complete file structure and naming patterns, see [AGENTS.md § Rails to Next.js Pattern Mapping](./AGENTS.md#rails-to-nextjs-pattern-mapping).

## Where to Find What

| Need | Location |
|------|----------|
| Workflow phases + contract | [AGENTS.md](./AGENTS.md) |
| Architecture rules (hard/strong/local) | [AGENTS.md](./AGENTS.md) |
| Pattern selection flowcharts | [AGENTS.md](./AGENTS.md) |
| Code conventions + naming | [AGENTS.md](./AGENTS.md) or `.claude/skills/code-conventions/SKILL.md` |
| Module structure | [AGENTS.md](./AGENTS.md) or `.github/instructions/nextjs-modules.instructions.md` |
| Shared structure | [AGENTS.md](./AGENTS.md) or `.github/instructions/nextjs-shared.instructions.md` |
| Effect patterns | `.claude/skills/effect-patterns/SKILL.md` |
| Drizzle patterns | `.claude/skills/drizzle-patterns/SKILL.md` |
| Testing setup | `.github/instructions/tests.instructions.md` |
| TypeScript rules | `.github/instructions/typescript.instructions.md` |
| Backend patterns | `.github/instructions/effect-backend.instructions.md` |
| App Router patterns | `.github/instructions/nextjs-app-router.instructions.md` |

## Zero Tolerance Policy

NO exceptions:

- No `any` type (use proper typing or `unknown` + type guards)
- No eslint-disable as first resort (fix root cause or update config)
- No type assertions that break lint rules
- Prefer named `function` declarations (use arrow only when contextually required)
- No inline param type literals (extract to `types.ts`, create it if missing)
- Prefer direct React type imports (e.g. `import type { ChangeEvent } from "react"`)
- Single object local state only (`useImmer({ ... })`, no `useState`)
- No deprecated APIs (especially Zod deprecations)

See [AGENTS.md § Zero Tolerance Policy](./AGENTS.md#zero-tolerance-policy) for details and examples.

## Workflow Best Practices

### One Component Per File

Each component file exports ONE component. Multiple exports → separate folders.

### Testing

- Read source before writing tests (don't assume)
- One test file per source file
- 80% coverage target

### Signature Changes

1. Find all usages: `grep -rn "functionName(" src/`
2. Update all callers in same commit
3. Run: `npm run lint && npm run check-types && npm test`

For complete workflow details, see [AGENTS.md](./AGENTS.md).
