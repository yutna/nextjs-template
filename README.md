# Vibe Next Template

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
- 🤖 **AI-ready** — Optimized for both GitHub Copilot and Claude Code

## Quick Start

Choose your preferred AI coding assistant:

```bash
# For GitHub Copilot (main branch)
npx create-next-app --example https://github.com/yutna/nextjs-template my-app

# For Claude Code (claude-workflow branch)
npx create-next-app --example https://github.com/yutna/nextjs-template/tree/claude-workflow my-app
```

| Branch | AI Assistant | Configuration |
| ------ | ------------ | ------------- |
| `main` | [GitHub Copilot][copilot] | `AGENTS.md` + `.github/instructions/` |
| `claude-workflow` | [Claude Code][claude-code] | `CLAUDE.md` + `.claude/skills/`, `.claude/commands/`, `.claude/hooks/` |

### Prerequisites

- **Node.js 24.14.0+** — managed by [mise][mise], see [`mise.toml`](./mise.toml)
- **npm** — no yarn/pnpm/bun

### Setup

```bash
npm install
cp .env.example .env.local   # edit with your values
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

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
│   ├── db/           # Database client (Drizzle)
│   ├── entities/     # Drizzle schemas (tables)
│   ├── components/   # Shared UI
│   ├── config/       # Env, fonts, i18n
│   ├── lib/          # Integrations and wrappers
│   └── ...
├── messages/         # i18n translations (en/th)
└── test/             # Shared test helpers
```

**Data flow:** `page → screen → container → component`

**Backend flow:** `action → service → repository → entity`

Server components by default — `"use client"` only at the smallest leaf.
Effect is required for all backend layers (services, repositories, jobs).

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

## Environment Variables

Copy [`.env.example`](./.env.example) to `.env.local` and fill in:

| Variable              | Description                          |
| --------------------- | ------------------------------------ |
| `NEXT_PUBLIC_API_URL` | Base URL for the backend API         |

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
