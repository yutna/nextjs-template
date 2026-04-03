# Vibe Next Template

[![CI](https://github.com/yutna/nextjs-template/actions/workflows/ci.yml/badge.svg)](https://github.com/yutna/nextjs-template/actions/workflows/ci.yml)

> AI‑Powered Code. Human‑Level Control.

Built for developers and teams shipping polished apps with confidence.
A fast, opinionated [Next.js 16][nextjs] starter with server-first
architecture, strict TypeScript, and production-ready UI foundations.

## Features

- 🏗️ **Server-first** — App Router, React 19 RSC, minimal client surface
- 🎨 **UI** — [Chakra UI v3][chakra] + [Ark UI][ark] headless primitives
- 🌐 **i18n** — [next-intl][intl] with Thai 🇹🇭 and English 🇺🇸 locales
- ✅ **TypeScript** — [strict][typescript], no `any`, zero exceptions
- ⚡ **Server Actions** — [next-safe-action][safe-action] for type-safe
  mutations
- 🛡️ **Error Handling** — [Effect][effect] for type-safe errors, structured hierarchy
- 🧪 **Testing** — [Vitest][vitest] + [Testing Library][testing-lib],
  80% coverage
- 🔍 **Linting** — [ESLint][eslint] + [Stylelint][stylelint] + custom
  project-specific rules
- 🤖 **AI-ready** — Optimized for both [GitHub Copilot][copilot] and [Claude Code][claude-code]

## Quick Start

```bash
git clone --depth 1 https://github.com/yutna/nextjs-template my-app
cd my-app
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Or use [degit](https://github.com/Rich-Harris/degit) for a faster clone (without git history):

```bash
npx degit yutna/nextjs-template my-app
cd my-app
npm install
npm run dev
```

### AI Assistant Configuration

Both AI assistants are supported out of the box. Pick your preferred tool and follow the onboarding guide:

| AI Assistant | Onboarding Guide | Configuration |
| ------------ | ---------------- | ------------- |
| [GitHub Copilot][copilot] | [Vibe Coding with Copilot](./docs/ai/GITHUB_COPILOT_WORKFLOW.md) | `AGENTS.md` + `.github/instructions/` |
| [Claude Code][claude-code] | [Vibe Coding with Claude](./docs/ai/CLAUDE_WORKFLOW.md) | `CLAUDE.md` + `.claude/skills/`, `.claude/commands/`, `.claude/hooks/` |

#### MCP Servers

Both AI assistants support [MCP servers][mcp] for enhanced capabilities:

| MCP Server | Package | Purpose |
| ---------- | ------- | ------- |
| `ark-ui` | `@ark-ui/mcp` | Ark UI component documentation |
| `chakra-ui` | `@chakra-ui/react-mcp` | Chakra UI v3 component documentation |
| `next-devtools` | `next-devtools-mcp` | Next.js development tools |
| `playwright` | `@playwright/mcp` | Browser automation and E2E testing |

Configuration files:

- GitHub Copilot: `.vscode/mcp.json`
- Claude Code: `.mcp.json`

### Prerequisites

- **Node.js 24.14.0+** — managed by [mise][mise], see [`mise.toml`](./mise.toml)
- **npm** — no yarn/pnpm/bun

### Setup

```bash
npm install
cp .env.example .env.local   # edit with your values
npm run db:migrate           # optional: create local development DB
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Database Scaffold

This template includes a minimal real Drizzle + libSQL/sqlite scaffold.
It is intentionally small: one canonical entity example, one seed entrypoint, and
working migration/test-prepare scripts.

Current DB scaffold:

- [drizzle.config.ts](./drizzle.config.ts) for migration generation and apply flow
- `src/shared/db/` for runtime client, schema entrypoint, migrations, seeds, and local sqlite files
- `src/shared/entities/app-setting/` as the canonical starter entity example
- `src/shared/lib/db-isolation/` for deterministic test DB reset helpers

See [docs/db/database-workflow.md](./docs/db/database-workflow.md) for the full DB scaffold workflow.

Typical local workflow:

```bash
npm run db:generate
npm run db:migrate
npm run db:seed
npm run db:prepare:test
```

## Tech Stack

| Category | Technology |
| --- | --- |
| Framework | [Next.js 16][nextjs] · [React 19][react] |
| Language | [TypeScript][typescript] (strict) |
| UI | [Chakra UI v3][chakra] · [Ark UI][ark] |
| Component Icons | [React Icons][react-icons] |
| i18n | [next-intl][intl] |
| Validation | [Zod][zod] |
| Server Actions | [next-safe-action][safe-action] |
| Data Fetching | [SWR][swr] |
| URL State | [nuqs][nuqs] |
| State | [use-immer][use-immer] · [Immer][immer] |
| State Machines | [XState][xstate] · [Zag.js][zag] |
| Animation | [motion][motion] |
| Theming | [next-themes][next-themes] |
| Utilities | [dayjs][dayjs] · [clsx][clsx] · [usehooks-ts][usehooks-ts] |
| Env Validation | [@t3-oss/env-nextjs][env-nextjs] |
| Error Handling | [Effect][effect] |
| Logging | [Pino][pino] |
| Testing | [Vitest][vitest] · [Testing Library][testing-lib] |
| Component Dev | [Storybook][storybook] |

## Project Structure

```txt
src/
├── app/              # App Router (thin route entries)
│   └── [locale]/     # i18n locale segment
├── modules/          # Feature modules
│   └── {module}/
│       ├── actions/      # Server actions (next-safe-action + Zod)
│       ├── services/     # Business logic (Effect)
│       ├── repositories/ # Data access (Effect + Drizzle)
│       ├── schemas/      # Zod validation schemas
│       ├── components/   # Presenter UI (server-first)
│       ├── containers/   # Logic binding (client when needed)
│       ├── screens/      # Page-level composition (server)
│       └── hooks/        # Client logic
├── shared/           # Cross-cutting code
│   ├── db/           # DB client, schema entrypoint, migrations, seeds, local DB files
│   ├── entities/     # Drizzle schemas (tables)
│   ├── components/   # Shared UI
│   ├── config/       # Env, fonts, i18n
│   ├── lib/          # Integrations, wrappers, infra helpers
│   └── ...
├── messages/         # i18n translations (en/th)
└── test/             # Shared test helpers
```

**Data flow:** `page → screen → container → component`

**Backend flow:** `action → service → repository → entity`

Server components by default — `"use client"` only at the smallest leaf.
Effect is required for all backend layers (services, repositories, jobs).

## AI Tools & Parity

This template uses a **dual-toolchain workflow** supporting both Claude and GitHub Copilot with full parity.

**Setup:**

- **Claude Code:** See [`CLAUDE.md`](./CLAUDE.md) for Claude-specific configuration
- **GitHub Copilot:** See [`.github/copilot-instructions.md`](./.github/copilot-instructions.md)
- **Universal Workflow:** See [`AGENTS.md`](./AGENTS.md) for the 6-phase workflow contract (applies to all AI tools)

**Key Locations:**

- `.claude/commands/` — Claude slash commands (`/create-module`, `/gates`, etc.)
- `.claude/skills/` — Canonical domain skills (architecture, patterns, conventions)
- `.github/prompts/` — Copilot chat prompts (mirrored from Claude commands)
- `.github/agents/` — Specialist agents for each workflow phase
- `.agents/skills/` — Community-contributed skills (auto-loaded by both Copilot and Claude)

**Parity Testing:**

Parity is checked automatically in CI. To verify locally after editing a Claude command or Copilot prompt:

```bash
./bin/vibe parity-check
```

This checks that both toolchains generate identical conventions. See [`.github/instructions/dual-toolchain-parity.instructions.md`](./.github/instructions/dual-toolchain-parity.instructions.md) for details.

**Shared Skills:**

Copilot and Claude both automatically load community-contributed skills from [`.agents/skills/`](./.agents/skills/). See [`.agents/README.md`](./.agents/README.md) for the full list and usage guidance. Canonical skills in `.claude/skills/` and `.github/skills/` take organizational precedence for repo-specific standards.

## Scripts

| Command                   | Description                            |
| ------------------------- | -------------------------------------- |
| `npm run dev`             | Start development server               |
| `npm run build`           | Production build                       |
| `npm run build:analyze`   | Build with bundle analyzer             |
| `npm run build:storybook` | Build Storybook for production         |
| `npm run start`           | Start production server                |
| `npm run dev:storybook`   | Start Storybook dev server             |
| `npm run check-types`     | TypeScript type check                  |
| `npm run lint`            | ESLint + Stylelint + custom checks     |
| `npm run format`          | Format with Prettier                   |
| `npm run test`            | Run all tests                          |
| `npm run test:coverage`   | Run tests with coverage report         |
| `npm run test:watch`      | Run tests in watch mode                |
| `npm run db:generate`     | Generate Drizzle migration files       |
| `npm run db:migrate`      | Apply migrations to the current DB     |
| `npm run db:migrate:test` | Apply migrations to the test DB        |
| `npm run db:prepare:test` | Reset and migrate the test DB          |
| `npm run db:seed`         | Seed the current DB with deterministic starter data |

For AI toolchain and workflow commands, see [docs/general/COMMANDS.md](./docs/general/COMMANDS.md).

## Environment Variables

Copy [`.env.example`](./.env.example) to `.env.local` and fill in:

| Variable                      | Description                                     |
| ----------------------------- | ----------------------------------------------- |
| `NEXT_PUBLIC_API_URL`         | Base URL for the backend API                    |
| `DATABASE_URL`                | Development DB URL, defaults to local sqlite    |
| `DATABASE_URL_TEST`           | Test DB URL, defaults to local sqlite           |
| `DATABASE_URL_PRODUCTION`     | Optional production DB URL or local fallback    |
| `DB_TEST_ISOLATION_STRATEGY`  | Test DB reset mode: `noop` or `sqlite-file-reset` |

Local sqlite defaults:

- development: `file:src/shared/db/local/development.sqlite`
- test: `file:src/shared/db/local/test.sqlite`
- production fallback: `file:src/shared/db/local/production.sqlite`

## Contributing

See [`CONTRIBUTING.md`](./CONTRIBUTING.md).

## License

[MIT](./LICENSE)

[ark]: https://ark-ui.com
[claude-code]: https://docs.anthropic.com/en/docs/claude-code
[copilot]: https://github.com/features/copilot
[chakra]: https://chakra-ui.com
[clsx]: https://github.com/lukeed/clsx
[dayjs]: https://day.js.org
[effect]: https://effect.website
[env-nextjs]: https://env.t3.gg/docs/nextjs
[eslint]: https://eslint.org
[immer]: https://immerjs.github.io/immer/
[intl]: https://next-intl-docs.vercel.app
[mcp]: https://modelcontextprotocol.io
[mise]: https://mise.jdx.dev
[motion]: https://motion.dev
[next-themes]: https://github.com/pacocoursey/next-themes
[nextjs]: https://nextjs.org
[nuqs]: https://nuqs.dev
[pino]: https://getpino.io
[react]: https://react.dev
[react-icons]: https://react-icons.github.io/react-icons
[safe-action]: https://next-safe-action.dev
[storybook]: https://storybook.js.org
[stylelint]: https://stylelint.io
[swr]: https://swr.vercel.app
[testing-lib]: https://testing-library.com
[typescript]: https://www.typescriptlang.org
[use-immer]: https://github.com/immerjs/use-immer
[usehooks-ts]: https://usehooks-ts.com
[vitest]: https://vitest.dev
[xstate]: https://stately.ai/docs/xstate
[zag]: https://zagjs.com
[zod]: https://zod.dev
