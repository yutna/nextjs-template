# Vibe Next Template

> Next.js 16 starter plus a GitHub Copilot-first workflow contract.

This repository is a production-ready Next.js 16 and React 19 template with:

- server-first App Router architecture
- `next-intl` locale-prefixed routing for `en` and `th`
- Chakra UI, Ark UI, and Zag.js-ready primitives
- strict TypeScript, Vitest, Storybook, and structured logging
- the six-phase AI workflow from [AGENTS.md](./AGENTS.md)

## Quick Start

```bash
npx create-next-app \
  --example https://github.com/yutna/vibe-next-template \
  my-app
cd my-app
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`.

## Prerequisites

- Node.js `24.14.0+`
- npm

## Environment

Copy [`.env.example`](./.env.example) to `.env.local`.

Required variables:

| Variable | Description |
| --- | --- |
| `NEXT_PUBLIC_API_URL` | Base URL for the backend API |

For CI or local verification without a real backend URL, use:

```bash
npm run build:example-env
```

## Project Shape

```txt
src/
├── app/                    # Thin App Router entries
│   └── [locale]/           # /en and /th route boundary
├── features/
│   └── landing/            # Landing-page feature family
├── shared/                 # Cross-feature UI, config, routes, and infra
├── messages/               # next-intl messages
└── test/                   # Shared test helpers

.github/                    # Workflow prompts, skills, hooks, agents
.agents/                    # Vendored upstream skill packs
docs/                       # Workflow playbooks and governance docs
```

The current template app keeps the landing experience under [`src/features/landing`](/Users/yutthana/Projects/vibe-next-template/src/features/landing) while shared cross-cutting code remains under [`src/shared`](/Users/yutthana/Projects/vibe-next-template/src/shared).

## Workflow

This repository uses the GitHub Copilot-first six-phase workflow from [AGENTS.md](./AGENTS.md):

1. Discovery
2. Planning
3. Implementation
4. Quality Gates
5. Verification
6. Delivery

Supporting artifacts live in:

- [`.github/copilot-instructions.md`](/Users/yutthana/Projects/vibe-next-template/.github/copilot-instructions.md)
- [`.github/instructions/`](/Users/yutthana/Projects/vibe-next-template/.github/instructions)
- [`.github/prompts/`](/Users/yutthana/Projects/vibe-next-template/.github/prompts)
- [`.github/skills/`](/Users/yutthana/Projects/vibe-next-template/.github/skills)
- [`.github/agents/`](/Users/yutthana/Projects/vibe-next-template/.github/agents)
- [`.github/hooks/`](/Users/yutthana/Projects/vibe-next-template/.github/hooks)

The Next.js enterprise profile and MCP playbooks live in:

- [docs/nextjs-enterprise-workflow-design.md](/Users/yutthana/Projects/vibe-next-template/docs/nextjs-enterprise-workflow-design.md)
- [docs/nextjs-enterprise-mcp-playbook.md](/Users/yutthana/Projects/vibe-next-template/docs/nextjs-enterprise-mcp-playbook.md)
- [docs/pre-commit-audit-policy.md](/Users/yutthana/Projects/vibe-next-template/docs/pre-commit-audit-policy.md)

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Next.js dev server |
| `npm run build` | Production build with real env |
| `npm run build:example-env` | Production build using the example API URL |
| `npm run build:analyze` | Build with bundle analyzer |
| `npm run dev:storybook` | Start Storybook |
| `npm run build:storybook` | Build Storybook |
| `npm run typecheck` | TypeScript validation |
| `npm run lint` | ESLint and Stylelint |
| `npm run test` | Run Vitest |
| `npm run test:coverage` | Run Vitest with coverage |
| `npm run workflow:doctor` | Run the full workflow health check |
| `npm run workflow:audit-structure` | Audit repo-wide structure against the workflow profile |
| `npm run workflow:adopt-report` | Regenerate the repo-specific workflow profile and drift report |
| `npm run workflow:bootstrap` | Reset workflow state for a fresh adoption/discovery bootstrap |
| `npm run workflow:validate-state` | Validate `.github/workflow-state.json` |
| `npm run workflow:validate-repo` | Validate workflow artifacts and vendored skills |
| `npm run workflow:proof` | Run workflow proof suite |

## Verification

Recommended production-readiness pass:

```bash
npm run typecheck
npm run lint
npm test
npm run workflow:doctor
npm run workflow:validate-state
npm run workflow:validate-repo
npm run workflow:audit-structure
npm run workflow:proof
npm run build:example-env
```

## Tech Stack

| Category | Technology |
| --- | --- |
| Framework | Next.js 16 · React 19 |
| i18n | next-intl |
| UI | Chakra UI v3 · Ark UI |
| Interaction primitives | Zag.js |
| State machines | XState |
| Server actions | next-safe-action |
| URL state | nuqs |
| Data fetching | SWR |
| Logging | Pino |
| Validation | Zod |
| Testing | Vitest · Testing Library |
| Component dev | Storybook |

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md).

## License

[MIT](./LICENSE)
