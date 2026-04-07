# Repository AI Instructions (`CLAUDE.md`)

Claude Code reads this file automatically, and GitHub Copilot CLI also respects
`CLAUDE.md` as a custom instruction surface. Keep repo-wide guidance here accurate for
both tools, and label tool-specific runtime notes clearly. **For the universal AI
workflow contract, see [AGENTS.md](./AGENTS.md)**—that is the single source of truth.

## Instruction Precedence

For repo decisions, apply instructions in this order:

1. Direct user instruction
2. [AGENTS.md](./AGENTS.md) (universal workflow contract + all patterns)
3. Relevant path-specific `.github/instructions/*.md`
4. The repo skill, prompt, or command surface for the current tool
5. Tool runtime hooks and policy checks when that tool supports them

If sources conflict, follow the highest-priority source.

### Tool-Specific Surfaces

- **Claude Code**: `.claude/skills/`, `.claude/commands/`, `.claude/settings.json`,
  `.mcp.json`
- **GitHub Copilot Chat**: `.github/prompts/`, `.github/skills/`,
  `.github/copilot-instructions.md`, `.vscode/mcp.json`
- **GitHub Copilot CLI**: built-in slash commands plus `AGENTS.md`, `CLAUDE.md`,
  `.github/instructions/**/*.md`, and `.github/copilot-instructions.md`; MCP comes
  from `/mcp`, `~/.copilot/mcp-config.json`, or `--additional-mcp-config`

## Skill Invocation Contract

Repo-specific skills live in `.claude/skills/` and are mirrored into
`.github/skills/` for Copilot Chat / workspace-aware surfaces. Copilot CLI can inspect
the active skill set through `/skills`; do not assume browsing `.github/skills/` is
how the CLI consumes skills.

When a relevant skill exists for the current task, invoke or read it before planning,
implementation, review, recovery, or delivery work. If the current tool's repo
command or prompt names one or more skills, invoke them in the order stated there
instead of assuming they were already loaded.

## Claude Code Runtime Notes

### Workflow State API

When command execution is available, use the workflow state API:

```bash
node --experimental-strip-types --no-warnings bin/vibe task workflow:hook -- update-state phase=planning plan.status=proposed
```

Fallback: Edit `.claude/workflow-state.json` directly only if the workflow hook
command itself cannot run locally (for example, a runtime or permission failure), then
run `npm run workflow:state:validate`.

### MCP Servers

For Claude Code sessions, repo MCP servers are configured in `.mcp.json` and
auto-loaded by Claude Code:

- **ark-ui**: Component properties and examples
- **chakra-ui**: Theme, components, props
- **next-devtools**: Next.js routes, errors, cache
- **playwright**: Browser automation for QA

GitHub Copilot uses different MCP surfaces:

- **Copilot Chat in VS Code**: `.vscode/mcp.json`
- **Copilot CLI**: `/mcp`, `~/.copilot/mcp-config.json`, or `--additional-mcp-config`

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

For workflow-oriented pattern mapping, see
[AGENTS.md § Rails to Next.js Pattern Mapping](./AGENTS.md#rails-to-nextjs-pattern-mapping).
For detailed naming grammar and file templates, see
`.claude/skills/code-conventions/SKILL.md`.

## Where to Find What

| Need | Location |
|------|----------|
| Workflow phases + contract | [AGENTS.md](./AGENTS.md) |
| Architecture rules (hard/strong/local) | [AGENTS.md](./AGENTS.md) |
| Pattern selection flowcharts | [AGENTS.md](./AGENTS.md) |
| Code conventions + naming | `.claude/skills/code-conventions/SKILL.md` (primary) |
| Module structure | `.github/instructions/nextjs-modules.instructions.md` (primary), plus [AGENTS.md](./AGENTS.md) for module boundaries |
| Shared structure | `.github/instructions/nextjs-shared.instructions.md` (primary), plus [AGENTS.md](./AGENTS.md) for entity and DB ownership |
| Copilot instructions | `.github/copilot-instructions.md` |
| Copilot Chat prompts | `.github/prompts/` |
| Claude commands | `.claude/commands/` |
| Effect patterns | `.claude/skills/effect-patterns/SKILL.md` |
| Drizzle patterns | `.claude/skills/drizzle-patterns/SKILL.md` |
| Testing setup | `.github/instructions/tests.instructions.md` |
| E2E selectors + data-testid | `.github/instructions/e2e-testing.instructions.md` |
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
