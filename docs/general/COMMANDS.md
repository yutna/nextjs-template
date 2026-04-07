# Commands Reference

This project runs all scripts through a single CLI entrypoint (`./bin/vibe`) and
mirrors phase entrypoints between Claude Code slash commands and GitHub Copilot Chat
prompts. GitHub Copilot CLI uses its own built-in commands plus the same repo
instruction files. The workflow is guardrailed by prompts, hooks, and CI by default —
these commands are here when you want to drive a step explicitly, run something in
isolation, or just understand what's available.

Operational quick reference: [Workflow SOP (One Page)](./WORKFLOW-SOP.md)

## Project CLI: `./bin/vibe task`

All project tasks run through this entrypoint:

```bash
./bin/vibe task <name>
./bin/vibe --help       # list all available commands
```

**Convention:** Use `:` for user-facing namespaced task names such as
`hooks:build`, `workflow:hook`, and `sync:copilot`. Use `-` for filenames and
standalone direct commands such as `parity-check`, so `hooks:build` maps to
`bin/cli/commands/hooks-build.ts`.

### Development

| Task | Description |
|------|-------------|
| `dev` | Start development server |
| `start` | Start production server |
| `build` | Production build |
| `build:analyze` | Build with bundle analyzer |
| `dev:storybook` | Start Storybook dev server |
| `build:storybook` | Build Storybook for production |

### Quality Gates

| Task | Description |
|------|-------------|
| `check-types` | TypeScript type check |
| `lint` | All lint checks (ESLint + Stylelint + custom) |
| `lint:eslint` | ESLint only |
| `lint:css` | Stylelint only |
| `format` | Format with Prettier |
| `test` | Run tests once |
| `test:watch` | Run tests in watch mode |
| `test:coverage` | Run tests with coverage report |
| `test:e2e` | Run Playwright E2E tests |
| `test:e2e:headed` | Run E2E tests in headed browser |
| `test:e2e:ui` | Run E2E tests with Playwright UI |

### Speed And Stability Bundles

| Task | Description |
|------|-------------|
| `qa:fast` | Fast local confidence check (`check-types` + `lint:eslint` + `test`) |
| `qa:stable` | Full local stability check (`check-types` + `lint` + `test` + `sync:copilot:check`) |
| `qa:repo` | Repository readiness check (`qa:stable` + `workflow:audit` + `docs:automation:guard` + `parity:all`) |
| `parity:all` | Check all Claude/Copilot prompt parity pairs |

### Database

| Task | Description |
|------|-------------|
| `db:generate` | Generate Drizzle migration files |
| `db:migrate` | Apply migrations to the development DB |
| `db:migrate:test` | Apply migrations to the test DB |
| `db:prepare:test` | Reset and migrate the test DB |
| `db:reset:test` | Reset test database file only |
| `db:seed` | Seed the database with starter data |
| `db:studio` | Open Drizzle Studio GUI |

### Workflow & AI Toolchain

| Task | Description |
|------|-------------|
| `workflow:bootstrap` | Bootstrap or reset workflow state for a new task |
| `workflow:doctor` | Diagnose workflow and project health |
| `workflow:audit` | Audit module and shared structure against conventions |
| `workflow:state:validate` | Validate workflow state file schema |
| `codebase:index` | Rebuild the codebase index |
| `sync:copilot` | Sync Claude commands to Copilot prompts |
| `sync:copilot:check` | Check Claude↔Copilot sync status (no changes written) |
| `hooks:build` | Regenerate hook configurations from source |
| `docs:automation:guard` | Check docs for automation-first guideline compliance |

---

## Direct CLI Commands

A small set of commands run directly (not through `task`):

```bash
./bin/vibe parity-check           # check staged files for content drift
./bin/vibe parity-check --all     # check all paired command files
```

CI runs `parity-check` automatically. Use it locally after editing a Claude command or
Copilot Chat prompt to verify the configured hard parity pairs before pushing.

---

## Claude Slash Commands

Available in any Claude Code session. Type `/` to see the full list, or invoke any command directly.

### Workflow Commands

| Command | What It Does |
|---------|--------------|
| `/discover` | Clarifies requirements and defines scope |
| `/plan-work` | Creates an implementation plan |
| `/implement` | Builds the feature |
| `/review` | Reviews for correctness and convention compliance |
| `/gates` | Runs type-check, lint, and tests |
| `/deliver` | Prepares handoff summary |
| `/recover` | Diagnoses and fixes build failures |

### Scaffolding Commands

| Command | What It Creates |
|---------|----------------|
| `/create-module` | Full feature module (components, screens, actions, etc.) |
| `/add-server-action` | Server action with Zod validation |
| `/add-translation` | i18n messages for en/th |
| `/implement-e2e` | Playwright E2E tests from scenario specs |
| `/audit-structure` | Checks module structure against conventions |

### Requirements Command

| Command | What It Does |
|---------|--------------|
| `/decompose-requirements` | Breaks large features into phased tasks with Gherkin scenarios, state machines, and E2E test specs |

---

## GitHub Copilot Chat Prompts

Mirrored from Claude commands. Use in VS Code Copilot Chat — add `@workspace` for broader file context.

### Workflow Prompts

| Prompt | What It Does |
|--------|--------------|
| `/discover` | Clarifies requirements and defines scope |
| `/plan-work` | Creates an implementation plan |
| `/implement` | Builds the feature |
| `/review` | Reviews for correctness |
| `/gates` | Runs type-check, lint, and tests |
| `/deliver` | Prepares handoff summary |
| `/recover` | Diagnoses and fixes failures |

### Scaffolding Prompts

| Prompt | What It Creates |
|--------|----------------|
| `/create-module` | Full feature module |
| `/add-server-action` | Server action with Zod validation |
| `/add-translation` | i18n messages for en/th |
| `/implement-e2e` | Playwright E2E tests from scenario specs |
| `/audit-structure` | Checks module structure against conventions |

### Requirements Prompt

| Prompt | What It Does |
|--------|--------------|
| `/decompose-requirements` | Breaks large features into phased tasks with Gherkin scenarios, state machines, and E2E test specs |

---

## GitHub Copilot CLI Built-Ins

GitHub Copilot CLI uses its own built-in commands together with the repo instruction
surfaces (`AGENTS.md`, `CLAUDE.md`, `.github/instructions/**/*.md`, and
`.github/copilot-instructions.md`).

Use plain-language requests to drive Discovery, Implementation, Recovery, and
Delivery in terminal sessions, and use these built-ins when they match the task:

| Command | What It Does |
|---------|--------------|
| `/plan` | Create an implementation plan before coding |
| `/research` | Run a deeper investigation using code, GitHub, and web sources |
| `/review` | Run Copilot's code review agent |
| `/agent` | Inspect or select available agents |
| `/skills` | Inspect or manage available skills |
| `/instructions` | Inspect active instruction files |
| `/mcp` | Inspect or manage MCP server configuration |

The repo-defined `/discover`, `/plan-work`, `/implement`, `/gates`, `/deliver`, and
`/recover` surfaces remain **Copilot Chat prompts**, not native Copilot CLI slash
commands.

---

## npm Script Aliases

The most common tasks have `npm run` aliases. Workflow and AI toolchain tasks use `./bin/vibe task` directly.

| `npm run ...` | `./bin/vibe task ...` |
|---------------|-----------------------|
| `dev` | `dev` |
| `build` | `build` |
| `start` | `start` |
| `check-types` | `check-types` |
| `lint` | `lint` |
| `lint:eslint` | `lint:eslint` |
| `lint:css` | `lint:css` |
| `format` | `format` |
| `test` | `test` |
| `test:coverage` | `test:coverage` |
| `test:watch` | `test:watch` |
| `test:e2e` | `test:e2e` |
| `test:e2e:headed` | `test:e2e:headed` |
| `test:e2e:ui` | `test:e2e:ui` |
| `db:generate` | `db:generate` |
| `db:migrate` | `db:migrate` |
| `db:migrate:test` | `db:migrate:test` |
| `db:prepare:test` | `db:prepare:test` |
| `db:reset:test` | `db:reset:test` |
| `db:seed` | `db:seed` |
| `db:studio` | `db:studio` |
| `sync:copilot` | `sync:copilot` |
| `sync:copilot:check` | `sync:copilot:check` |
| `workflow:state:validate` | `workflow:state:validate` |
