# Next.js Template

Built for front-end developers shipping polished UIs on top of an external
API — **NOT** a full-stack template. No database. No auth server. Just a
fast, opinionated [Next.js 16][nextjs] starter for clean front-ends that
talk to a backend.

## Features

- 🏗️ **Server-first** — App Router, React 19 RSC, minimal client surface
- 🎨 **UI** — [Chakra UI v3][chakra] + [Ark UI][ark] headless primitives
- 🌐 **i18n** — [next-intl][intl] with Thai 🇹🇭 and English 🇺🇸 locales
- ✅ **TypeScript** — [strict][typescript], no `any`, zero exceptions
- ⚡ **Server Actions** — [next-safe-action][safe-action] for type-safe
  mutations
- 🛡️ **Error Handling** — structured hierarchy, operational vs
  non-operational
- 🧪 **Testing** — [Vitest][vitest] + [Testing Library][testing-lib],
  80% coverage
- 🔍 **Linting** — [ESLint][eslint] + [Stylelint][stylelint] + custom
  [Effect][effect]-based checks
- 🤖 **AI-ready** — [`AGENTS.md`](./AGENTS.md) with Copilot instruction
  files and skills

## Quick Start

```bash
npx create-next-app \
  --example https://github.com/yutna/nextjs-template \
  my-app
cd my-app
```

### Prerequisites

- **Node.js 24+** — managed by [mise][mise], see [`mise.toml`](./mise.toml)
- **npm** — no yarn/pnpm/bun

### Setup

```bash
npm install
cp .env.example .env.local   # edit with your values
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Tech Stack

| Category        | Technology                                           |
| --------------- | ---------------------------------------------------- |
| Framework       | [Next.js 16][nextjs] · [React 19][react]             |
| Language        | [TypeScript][typescript] (strict)                    |
| UI              | [Chakra UI v3][chakra] · [Ark UI][ark]               |
| i18n            | [next-intl][intl]                                    |
| Validation      | [Zod][zod]                                           |
| Server Actions  | [next-safe-action][safe-action]                      |
| Data Fetching   | [SWR][swr]                                           |
| Error Handling  | [Effect][effect]                                     |
| Testing         | [Vitest][vitest] · [Testing Library][testing-lib]    |
| Logging         | [Pino][pino]                                         |
| Components      | [Storybook][storybook]                               |

## Project Structure

```txt
src/
├── app/              # App Router (thin route entries)
│   └── [locale]/     # i18n locale segment
├── modules/          # Feature modules
│   └── {module}/
│       ├── actions/      # Server actions
│       ├── components/   # Presenter UI
│       ├── containers/   # Logic binding (bridge layer)
│       ├── hooks/        # Client logic
│       ├── screens/      # Page-level composition
│       └── schemas/      # Validation contracts
├── shared/           # Cross-cutting code
│   ├── components/   # Shared UI
│   ├── config/       # Env, fonts, i18n
│   ├── lib/          # Integrations and services
│   └── ...
├── messages/         # i18n translations (en/th)
└── test/             # Shared test helpers
```

Data flows `page → screen → container → component`. Server components by
default — `"use client"` only at the smallest leaf.

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
[chakra]: https://chakra-ui.com
[effect]: https://effect.website
[eslint]: https://eslint.org
[intl]: https://next-intl-docs.vercel.app
[mise]: https://mise.jdx.dev
[nextjs]: https://nextjs.org
[pino]: https://getpino.io
[react]: https://react.dev
[safe-action]: https://next-safe-action.dev
[storybook]: https://storybook.js.org
[stylelint]: https://stylelint.io
[swr]: https://swr.vercel.app
[testing-lib]: https://testing-library.com
[typescript]: https://www.typescriptlang.org
[vitest]: https://vitest.dev
[zod]: https://zod.dev
