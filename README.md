# Next.js Template

Production-ready Next.js 16 starter with opinionated conventions for scalable, maintainable web applications.

## Features

- **Next.js 16** — App Router, React 19, server-first architecture
- **TypeScript** — strict mode, no `any`
- **Chakra UI v3** — component library with Ark UI headless primitives
- **i18n** — next-intl with Thai and English locales
- **Server Actions** — type-safe mutations via next-safe-action
- **Error Handling** — structured error hierarchy with operational/non-operational distinction
- **Testing** — Vitest + Testing Library with 80% coverage thresholds
- **Linting** — ESLint + Stylelint + custom Effect-based checks
- **AI Agent Support** — AGENTS.md with instruction files and skills for Copilot

## Quick Start

```bash
npx create-next-app --example https://github.com/yutna/nextjs-template my-app
cd my-app
```

### Prerequisites

- **Node.js 24+** (managed by [mise](https://mise.jdx.dev) — see `mise.toml`)
- **npm** (no yarn/pnpm/bun)

### Setup

```bash
npm install
cp .env.example .env.local   # edit with your values
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command                    | Description                                          |
| -------------------------- | ---------------------------------------------------- |
| `npm run build`            | Production build                                     |
| `npm run build:analyze`    | Production build with bundle analyzer                |
| `npm run build:storybook`  | Build Storybook for production                       |
| `npm run check-types`      | TypeScript type checking                             |
| `npm run dev`              | Start development server                             |
| `npm run dev:storybook`    | Start Storybook dev server                           |
| `npm run format`           | Format code with Prettier                            |
| `npm run lint`             | Run all linters (ESLint + Stylelint + custom checks) |
| `npm run start`            | Start production server                              |
| `npm run test`             | Run all tests                                        |
| `npm run test:coverage`    | Run tests with coverage report                       |
| `npm run test:watch`       | Run tests in watch mode                              |

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

**Key conventions**: page → screen → container → component flow, server components by default, `"use client"` only at the smallest leaf.

## Environment Variables

Copy `.env.example` to `.env.local` and configure:

| Variable              | Description                          |
| --------------------- | ------------------------------------ |
| `NEXT_PUBLIC_API_URL` | API endpoint for the backend service |

## Technology Stack

Next.js 16 · React 19 · TypeScript · Chakra UI v3 · Ark UI · next-intl · Zod · next-safe-action · SWR · Effect · Vitest · Pino

## License

MIT
