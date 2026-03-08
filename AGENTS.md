# AGENTS Guide

## Purpose

This document is the AI-facing operating guide for this
repository.

It provides project-wide rules and architecture flow that
apply to every task. Folder-specific conventions live in
`.github/instructions/` (auto-loaded) and `.github/skills/`
(on-demand). See the
[Skill and instruction index](#skill-and-instruction-index)
for the full map.

## Critical implementation mindset

- default to a server-first approach and ship the smallest
  possible client surface
- treat client code as an explicit cost, not the default
  starting point
- preserve folder ownership boundaries and place code in
  the narrowest correct location
- prefer extending established patterns over inventing
  parallel structure
- when in doubt, optimize for architecture correctness
  over convenience

## Definition of Done

Every delivered feature must meet all of these criteria
before presenting to the user. If any criterion is not met,
keep working.

- feature works end-to-end exactly as requirements describe
- zero bugs — every code path tested and verified
- zero type errors on all touched files
- zero lint errors on all touched files
- zero warnings on all touched files
- all existing tests still pass — no regressions
- new tests cover the new feature
- code review passed — no security or convention issues
- ready for production use — not a prototype, not a draft
- human has nothing to fix, debug, or clean up

## Project overview

This is a production-ready Next.js 16 starter template
with opinionated conventions for scalable, maintainable
web applications.

The project emphasizes App Router boundaries, feature
modules, strict folder ownership, server actions,
structured error handling, i18n, and Chakra UI v3.

## Project structure

```text
src/
├── app/              # App Router routes only
│   └── [locale]/     # Locale segment (next-intl)
│       ├── (private)/
│       └── (public)/
├── modules/          # Feature modules
│   └── {module}/
│       ├── actions/
│       ├── components/
│       ├── containers/
│       ├── contexts/
│       ├── hooks/
│       ├── layouts/
│       ├── lib/
│       ├── providers/
│       ├── schemas/
│       ├── screens/
│       ├── types/
│       └── utils/
├── shared/           # Cross-cutting app code
│   ├── actions/
│   ├── components/
│   ├── config/
│   ├── constants/
│   ├── contexts/
│   ├── hooks/
│   ├── images/
│   ├── layouts/
│   ├── lib/
│   ├── providers/
│   ├── routes/
│   ├── schemas/
│   ├── styles/
│   ├── types/
│   ├── utils/
│   └── vendor/
├── messages/         # i18n message trees
├── test/             # Shared test helpers
└── proxy.ts          # Locale routing middleware

.github/
├── instructions/     # Auto-loaded conventions
└── skills/           # On-demand deep knowledge
```

Core ownership rules:

- feature-specific code belongs in
  `modules/<module-name>/`
- cross-cutting reusable code belongs in `shared/`
- `src/app/**` stays minimal and should mostly select the
  correct screen/layout/runtime boundary
- cross-module imports are forbidden; move shared behavior
  into `shared/` instead

## Technology stack

- **Framework:** Next.js 16 + React 19
- **Language:** TypeScript strict mode
- **UI:** Chakra UI v3
- **Headless UI:** Ark UI
- **State machines:** Zag.js
- **Pattern matching:** ts-pattern
- **API composition:** Effect
- **i18n:** next-intl
- **Validation:** Zod
- **Server actions:** next-safe-action
- **Data fetching:** SWR
- **URL state:** nuqs
- **State management:** useImmer (replaces useState)
- **Animation:** motion (v12)
- **Dates:** dayjs
- **Color mode:** next-themes
- **Env validation:** @t3-oss/env-nextjs
- **Utility hooks:** usehooks-ts
- **CSS utility:** clsx
- **Logging:** Pino
- **Testing:** Vitest + Testing Library

## How to use this guide

This guide has three layers:

1. **AGENTS.md** (this file) — project-wide rules and
   architecture flow. Always loaded. Read the Common Style
   Guide and Common Feature Implementation Flow in order.
2. **Instruction files** (`.github/instructions/`) —
   folder-specific conventions that load automatically
   when you edit matching files.
3. **Skills** (`.github/skills/`) — deep reference
   knowledge invoked on demand when a task needs it.

For autonomous feature delivery, use the `build-feature`
prompt or load the `autonomous-workflow` skill. These
implement the 2-touchpoint model: gather requirements from
the user, then execute everything autonomously until
delivery.

When two rules overlap, keep the narrower ownership rule
and the stronger server-first constraint.

## Common Style Guide

### Scope

Apply this guide everywhere unless a framework
requirement or a narrower instruction file says otherwise.
Use this guide for project-wide behavior; keep
folder-specific guidance in the matching instruction file.

### TypeScript

This project uses TypeScript in **strict** mode.

- do **not** use `any`; use `unknown` with proper
  narrowing
- use generics when the relationship between values should
  stay type-safe
- avoid unnecessary type assertions; prefer guards and
  narrowing over `as any`
- use `import type` for type-only imports

Prefer:

```ts
function parseValue(value: unknown) {
  if (typeof value === "string") {
    return value.trim();
  }

  return null;
}
```

Avoid:

```ts
function parseValue(value: any) {
  return value.trim();
}
```

Naming:

- functions and variables: `camelCase`
- React components and classes: `PascalCase`
- constants: `SCREAMING_SNAKE_CASE`
- files and folders: `kebab-case`

React component naming uses a **UI-type-first,
domain-last** pattern:

- optional layer prefix (`Screen`, `Container`) +
  UI type chain (outermost → innermost) + domain noun
- Examples:
  - `FormCheckout`, `FormFiltersOrder`,
    `HeaderProfile`, `CardProductDetail`
  - `ContainerFormCheckout`,
    `ContainerHeaderProfile`
  - `ScreenCheckout`, `ScreenProfile`
- Folder names are the kebab-case equivalent:
  `form-checkout`, `card-product-detail`,
  `container-form-checkout`, `screen-checkout`

### Imports and modules

Use the repository path alias for internal imports:

```ts
import { fetchClient } from "@/shared/lib/fetcher";
```

- `@/*` for cross-folder imports from `src`
- relative `./` imports for same leaf folder only
- `import type` for type-only imports
- never use `../` parent directory imports

#### Import sorting

Sort imports into five groups in this exact order:

1. side-effect imports
2. external modules
3. internal modules using `@/`
4. local same-directory imports using `./`
5. `import type` statements

Rules:

- one blank line between groups
- alphabetical within each group (case-insensitive)
- named imports inside `{}` sorted alphabetically
- consolidate duplicates; default before named imports
- keep `import type` separate even when the source
  matches a value import

Template:

```ts
import "server-only";

import { Box, Heading, Text } from "@chakra-ui/react";
import { getTranslations } from "next-intl/server";

import { MotionReveal } from "@/modules/static-pages/components/motion-reveal";
import { fetchClient } from "@/shared/lib/fetcher";

import { CopyCommand } from "./copy-command";

import type { SectionHeroProps } from "./types";
```

Example:

```ts
// Good
import "server-only";

import { Box, Flex, Heading, Text, VStack } from "@chakra-ui/react";
import { getTranslations } from "next-intl/server";

import { LandingHero } from "@/modules/static-pages/components/landing-hero";
import { MotionReveal } from "@/modules/static-pages/components/motion-reveal";
import { ScrollIndicator } from "@/modules/static-pages/components/scroll-indicator";

import { CopyCommand } from "./copy-command";

import type { SectionHeroProps } from "./types";
```

### Exports

Use **named exports** by default. Do not use default
exports for components.

Prefer:

```ts
export function SectionHero() {
  return null;
}
```

Avoid:

```ts
export default function SectionHero() {
  return null;
}
```

Exceptions: only when the framework requires a default
export (e.g., `page.tsx`, `layout.tsx`).

### Server-first mindset

This is the default implementation mindset for the whole
project:

- start from a server-side solution first
- use Next.js and React 19 server capabilities as far as
  they can reasonably go
- ship the smallest possible client surface
- treat client code as an explicit cost, not a default

Follow these rules:

- prefer server components by default
- add `"use client"` only when hooks, browser APIs, or
  client-only interaction require it
- let the React Compiler do its job; do not reach for
  `useMemo` or `useCallback` by habit
- add memoization only when there is a real measured need

Before implementing something, prefer asking:

- can this stay on the server?
- can data loading happen in a server component instead
  of a client effect?
- can this mutation use a server action instead of a
  client-only API wrapper?
- can interactivity be isolated to a smaller client leaf?

Prefer:

- server data loading over client fetching
- server actions over client mutation plumbing
- small client islands inside larger server-rendered trees
- serializable props flowing from server boundaries into
  client leaves
- rendering-ready data prepared on the server

Avoid:

- marking large trees with `"use client"` too early
- fetching in `useEffect` when the same work belongs on
  the server
- moving logic to the client just because it feels
  familiar
- shipping browser JavaScript for concerns solved during
  server render

Rule of thumb: if a feature works well on the server,
keep it there. If only one small piece needs the client,
isolate only that piece.

Practical habits to protect server-first:

- keep `"use client"` at the smallest possible leaf
- keep data access, async composition, and request-time
  decisions on the server when possible
- separate interactive leaf components from
  server-rendered layout and content
- prefer progressive enhancement over client-heavy
  orchestration
- let the server prepare the view model when that reduces
  client complexity

### Naming and readability

Choose names that describe ownership and intent clearly.

- prefer domain names over vague names
- specific verbs for actions, specific nouns for values
- code should read clearly without depending on comments

Prefer:

- `reportErrorAction`
- `fetchClient`
- `ValidationError`
- `copyright`

Avoid:

- `handleData`
- `commonUtil`
- `value`
- `temp`

### Comments

Comment only when the code would otherwise be harder to
understand: non-obvious intent, framework constraints,
unusual tradeoffs. Avoid comments that restate the code.

Prefer:

```ts
// next-intl returns the key when a translation is
// missing, so keep the fallback explicit.
```

Avoid:

```ts
// Set the name variable.
const name = value;
```

### Error handling

Handle errors explicitly and intentionally.

- do not swallow errors silently
- do not add broad success-shaped fallbacks that hide
  real failures
- surface or rethrow errors matching the app's existing
  error model
- prefer specific, meaningful errors over generic `Error`
  usage when the domain already has a clear error concept

Good direction:

- validate early
- return or throw clear error states
- reuse the existing app error hierarchy and helpers
  where appropriate

Avoid:

- empty `catch` blocks
- `catch { return null; }` when the failure should be
  visible
- broad fallback values that make debugging harder

### Environment variables

Do not read environment variables ad hoc throughout the
codebase.

- define environment variables through the shared
  environment configuration
- validate them with the existing env setup
- use `NEXT_PUBLIC_` only for values intended for the
  client
- keep server-only values off the client
- import from the shared env module instead of raw
  `process.env` usage in app code

Prefer one validated source of truth for environment
access over scattered `process.env` reads.

### Reuse before create

- reuse existing helpers, components, hooks, actions,
  schemas, or utilities
- extract shared logic only when reuse is real, not
  speculative
- do not add a new dependency when the current stack
  already solves it
- search first, reuse second, create only when existing
  options are not a fit

### One concern per unit

- one main responsibility per file
- small helpers near the owner when they are private
- avoid catch-all files with unrelated helpers or generic
  "utils" without clear ownership

### Package management

Use **npm** only. Do not use yarn, pnpm, or bun.

Install dependencies with exact versions:

```bash
npm install -E <package>
npm install -E -D <package>
```

Rules:

- use `npm install -E` for runtime dependencies
- use `npm install -E -D` for dev dependencies
- exact versions (`-E`) always
- keep `package-lock.json` committed and in sync
- use existing npm scripts from `package.json`

### Formatting and tooling

Do not invent local formatting or linting style by hand.
Follow the repository tooling.

Current baseline:

- formatting: `npm run format`
- linting: `npm run lint`
- type-checking: `npm run check-types`
- testing: `npm run test`

Rules:

- write code that passes the existing formatter and linter
- prefer fixing the code to satisfy the tooling instead
  of fighting the tooling
- do not introduce alternate package managers or parallel
  toolchains for the same concern

### Dependency choices

Prefer the libraries and abstractions already used by the
repository before introducing new ones.

Examples already in use:

- Chakra UI
- next-intl
- next-safe-action
- SWR
- Zod
- Vitest

Rule of thumb: reuse the current stack first. Add a new
dependency only when the existing stack clearly does not
cover the need.

### Checklist

Before writing or changing code, check:

- strict TypeScript without `any`?
- naming and casing consistent?
- named export (unless framework requires default)?
- server-side by default?
- comments only where they help?
- errors handled explicitly?
- validated environment access?
- existing project libraries used first?
- existing abstraction searched before creating new?
- npm with exact dependency versions?

### Quick reference

- no `any`
- `camelCase` functions/variables
- `PascalCase` components/classes
- `SCREAMING_SNAKE_CASE` constants
- `kebab-case` files/folders
- component names: UI-type first, domain last
- named exports by default
- server components by default
- comments only when needed
- no silent error handling
- validated env access
- reuse before creating new abstractions
- npm only, exact dependency versions

## Common Feature Implementation Flow

### Core idea

This repository uses a layered, server-first feature
flow.

UI path:

```text
page.tsx -> screen -> container -> component
```

Action/data path:

```text
action -> container -> component
```

Supporting layers:

- `schemas/` — validation contracts
- `lib/` — reusable integrations and service boundaries
- `hooks/` — extracted client logic
- `layouts/` — reusable framing
- `config/` and `constants/` — app-wide setup and static
  values

### Primary layer responsibilities

- **`page.tsx`** — server-only route entry. One page
  returns one screen. Handles params and locale setup.
- **`screens/`** — module-level page UI. 1:1 with page.
  Composes containers only. Server-first.
- **`containers/`** — required bridge layer. Binds logic
  to presenters. Server or client. Self-contained.
- **`components/`** — presenter UI. Stateless or
  logic-light. Receives prepared props.
- **`actions/`** — server actions. `"use server"`,
  `actionClient` or `authActionClient`.
- **`hooks/`** — extracted client logic. Consumed by
  containers.
- **`schemas/`** — Zod validation contracts. Shared or
  module-owned.
- **`lib/`** — integrations and services. Not action
  definitions, not presenter UI.

### End-to-end diagram

```text
app/**/layout.tsx
  -> route / segment boundary
  -> locale boundary setup when needed

app/**/page.tsx
  -> server-only route entry
  -> returns one Screen*

modules/<module>/screens/screen-*/
  -> Screen*
  -> assembles one or more Container*

modules/<module>/containers/container-*/
  -> Container*
  -> binds logic to presenter components
  -> may use hooks
  -> may call actions

modules/<module>/components/*
  -> presenter UI

shared/actions or modules/<module>/actions
  -> *Action
  -> inputSchema(...)
  -> server command boundary
    -> schemas/
    -> lib/
```

1. `page.tsx` enters the route
2. the page returns one screen
3. the screen assembles one or more containers
4. each container binds logic to presenter components
5. containers may use hooks and actions
6. actions validate input with schemas and call into lib

### Supporting layers and where they fit

- **`schemas/`** — action input, search param, route
  param, and form payload validation. Usually sits behind
  `action -> schema` or `page/screen -> schema`.
- **`lib/`** — reusable integrations, service boundaries,
  framework wrappers, infrastructure-aware logic. Usually
  sits behind `action -> lib`.
- **`hooks/`** — extracted client logic, browser-aware
  interaction, reusable UI state. Usually sits beneath
  `container -> hook`.
- **`layouts/`** — reusable structural framing, shared
  page chrome, route-family shells. Sits around page
  flows, not inside the action chain.
- **`config/`** and **`constants/`** — app-wide
  configuration and static shared values. Support other
  layers but are not normally the center of feature flow.

### Server-first flow

Use when the feature is mostly server-driven:

```text
page.tsx
  -> screen
    -> server container
      -> component
    -> action -> schema -> lib
```

- `page.tsx` stays thin and server-only
- the container may remain a server component
- reusable service behavior lives in `lib/`
- do not introduce client code unless the interaction
  truly needs it

Example shape:

```text
src/app/[locale]/profile/page.tsx
  -> modules/profile/screens/screen-profile/
    -> containers/container-form-profile/
      -> components/form-profile/
    -> actions/update-profile-action/
    -> schemas/update-profile-input/
    -> lib/update-profile/
```

### Client-interactive flow

Use when the feature needs client coordination:

```text
page.tsx
  -> screen
    -> client container
      -> hook + action + component
```

- `page.tsx` still stays server-only
- the container becomes `"use client"` only when needed
- the hook owns extracted client logic
- the component remains presenter-only

Example shape:

```text
src/app/[locale]/checkout/page.tsx
  -> modules/checkout/screens/screen-checkout/
    -> containers/container-form-checkout/
      -> hooks/use-form-checkout/
      -> actions/submit-checkout-action/
      -> components/form-checkout/
```

### App Router boundary rules

- **`page.tsx`** — route entry, server-only, returns one
  screen
- **`layout.tsx`** — route/segment boundary; reusable
  structure moves to `shared/layouts` or
  `modules/<module>/layouts`
- **`loading.tsx`**, **`error.tsx`**, **`template.tsx`** —
  stay in `app/`; do not replace with screen or container
  patterns

### Practical diagrams

Minimal page rendering flow:

```text
page.tsx
  -> Screen*
    -> Container*
      -> Component*
```

Action-backed interactive flow:

```text
Screen*
  -> Container*
    -> useSomething()
    -> someAction()
    -> Component*

someAction()
  -> input schema
  -> lib function
```

Locale-aware route flow:

```text
app/[locale]/layout.tsx
  -> locale boundary setup
app/[locale]/page.tsx
  -> Screen*
    -> Container*
      -> Component*
```

### Recommended build order

1. define the route entry in `page.tsx`
2. define the screen for that page
3. define the containers the screen needs
4. define presenter components beneath the containers
5. define actions for mutations
6. define schemas for validation
7. extract reusable service logic into `lib/`
8. extract client logic into hooks if interaction requires
   it

### Common mistakes to avoid

- `page.tsx` assembling containers directly
- screens rendering presenter components directly as the
  main pattern
- containers owning business logic inline
- components becoming mini controllers
- actions embedding reusable service logic that belongs
  in `lib/`
- hooks becoming the home of server-side behavior
- route-boundary App Router responsibilities leaking into
  screens or containers

### Quick placement reference

```text
Route entry?           -> page.tsx
Module-level page UI?  -> screens/
Logic binding?         -> containers/
Presenter UI?          -> components/
Server action?         -> actions/
Client interaction?    -> hooks/
Validation contract?   -> schemas/
Reusable service?      -> lib/
Structural frame?      -> layouts/
App setup/statics?     -> config/ or constants/
```

## Skill and instruction index

Detailed conventions live in targeted layers that load
automatically or on demand. This section maps every
concern to its home so you never need to search.

### Automatic instruction files

These load when editing matching files.

- **`page-entry`** —
  applies to `src/app/**/page.tsx`.
  Server-only entry, one-screen-per-page, locale setup.
- **`layout-entry`** —
  applies to `src/app/**/layout.tsx`.
  Thin route-boundary adapters, Layout naming.
- **`screens`** —
  applies to `src/modules/**/screens/**`.
  1:1 page relationship, compose containers only.
- **`containers`** —
  applies to `src/modules/**/containers/**`.
  Required bridge layer, self-contained logic binding.
- **`components`** —
  applies to `src/modules/**/components/**` and
  `src/shared/components/**`.
  Presenter UI, stateless, prepared props.
- **`server-actions`** —
  applies to `src/**/actions/**`.
  `"use server"`, `actionClient`, `inputSchema`.
- **`lib-code`** —
  applies to `src/**/lib/**`.
  Integrations, service boundaries.
- **`schemas-types`** —
  applies to `src/**/schemas/**` and
  `src/**/types/**`.
  Zod contracts, TypeScript definitions.
- **`messages`** —
  applies to `src/messages/**`.
  i18n structure, owning-layer paths.
- **`routes`** —
  applies to `src/shared/routes/**`.
  Path builders, locale-neutral.
- **`hooks-contexts`** —
  applies to `src/**/hooks/**` and
  `src/**/contexts/**`.
  Extracted logic, context objects.
- **`providers`** —
  applies to `src/**/providers/**`.
  Provider components.
- **`config-constants`** —
  applies to `src/shared/config/**` and
  `src/**/constants/**`.
  Validated env, standalone files.
- **`styles`** —
  applies to `src/shared/styles/**` and
  `**/*.module.css`.
  Global CSS, CSS Modules.
- **`layouts`** —
  applies to `src/shared/layouts/**` and
  `src/modules/**/layouts/**`.
  Reusable structural framing.
- **`utils`** —
  applies to `src/**/utils/**`.
  Pure transforms, formatters, guards.
- **`test-files`** —
  applies to `**/*.test.ts` and `**/*.test.tsx`.
  Vitest, Testing Library patterns.

### On-demand skills

These provide deep knowledge when the task needs it.

- **`project-feature-flow`** —
  building a complete feature end-to-end.
- **`project-ui-layers`** —
  working with page/screen/container/component layers.
- **`project-server-patterns`** —
  creating or modifying actions or lib code.
- **`project-data-contracts`** —
  working with schemas or type definitions.
- **`project-i18n`** —
  adding or modifying translations.
- **`project-structure`** —
  working with layouts or route helpers.
- **`project-infrastructure`** —
  working with config, constants, providers, hooks,
  contexts, or utils.
- **`project-styling`** —
  styling with Chakra UI, CSS, or managing images.
- **`project-testing`** —
  writing or fixing tests.
- **`effect`** —
  Effect TypeScript library for typed error handling.
  Mandatory in `shared/api/`. Free to use in `shared/lib/`,
  `modules/*/lib/`, and `utils/` for custom libraries.
  React rendering layers never import Effect.
- **`ts-pattern`** —
  exhaustive pattern matching for complex control flow.
  Mandatory for 3+ branches and discriminated unions.
  Replaces switch-case. Works in all layers.
- **`zag-js`** —
  Zag.js UI component state machines for React when Ark UI
  or Chakra UI do not cover the use case. Covers the
  service-based API pattern (v1.35.3+).
- **`nuqs`** —
  type-safe URL search params state management. Covers
  useQueryState, useQueryStates, createLoader for server-side
  parsing, typed parsers, and NuqsAdapter setup.
- **`autonomous-workflow`** —
  autonomous multi-agent execution protocol. Use when
  entering autopilot mode or building a complete feature
  with zero human interaction after plan approval. Defines
  the 2-touchpoint model, role-to-tool mapping, self-healing
  loops, retry budgets, and Definition of Done.

### Installed skills

External skills in `.agents/skills/` provide additional
capabilities beyond project conventions.

- **`agent-browser`** —
  browser automation for navigating pages, filling forms,
  clicking buttons, taking screenshots, and scraping data.
- **`find-skills`** —
  discover and install new agent skills.
- **`next-best-practices`** —
  Next.js file conventions, RSC boundaries, data patterns,
  async APIs, metadata, error handling, and optimization.
- **`next-cache-components`** —
  Next.js 16 cache components, PPR, `use cache` directive,
  `cacheLife`, `cacheTag`, and `updateTag`.
- **`next-upgrade`** —
  upgrade Next.js to the latest version following official
  migration guides and codemods.
- **`skill-creator`** —
  guide for creating new skills that extend AI capabilities.
- **`vercel-composition-patterns`** —
  Vercel composition patterns for React and Next.js.
- **`vercel-react-best-practices`** —
  React and Next.js performance optimization guidelines
  from Vercel Engineering.
- **`vitest`** —
  Vitest testing framework with Jest-compatible API,
  mocking, coverage, and fixtures.

## Concrete module walkthrough

The `static-pages` module demonstrates the standard
feature architecture with the required container bridge
layer.

### File tree

```text
src/modules/static-pages/
├── components/
│   ├── copy-command/
│   │   ├── constants.ts
│   │   ├── copy-command.tsx
│   │   ├── copy-command.test.tsx
│   │   └── index.ts
│   ├── landing-ai-workflow/
│   │   ├── constants.ts
│   │   ├── landing-ai-workflow.tsx
│   │   ├── landing-ai-workflow.test.tsx
│   │   ├── index.ts
│   │   └── types.ts
│   ├── landing-copilot/
│   ├── landing-cli-usage/
│   ├── landing-cta/
│   ├── landing-footer/
│   ├── landing-hero/
│   ├── landing-strengths/
│   ├── landing-tech-stack/
│   ├── marquee-row/
│   │   ├── marquee-row.tsx
│   │   ├── marquee-row.module.css
│   │   ├── marquee-row.test.tsx
│   │   ├── index.ts
│   │   └── types.ts
│   ├── motion-reveal/
│   ├── motion-stagger/
│   ├── page-chrome/
│   └── scroll-indicator/
├── containers/
│   └── container-welcome-page/
│       ├── container-welcome-page.tsx
│       ├── container-welcome-page.test.tsx
│       ├── index.ts
│       └── types.ts
└── screens/
    └── screen-welcome/
        ├── screen-welcome.tsx
        ├── screen-welcome.test.tsx
        ├── index.ts
        └── types.ts
```

### How the layers connect

The route entry is thin — it reads the locale and
delegates to the screen:

```tsx
// src/app/[locale]/page.tsx
import "server-only";

import { setRequestLocale } from "next-intl/server";
import { use } from "react";

import { ScreenWelcome } from "@/modules/static-pages/screens/screen-welcome";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default function Page({ params }: Readonly<PageProps>) {
  const { locale } = use(params);
  setRequestLocale(locale);

  return <ScreenWelcome locale={locale} />;
}
```

The screen composes exactly one container:

```tsx
// screen-welcome/screen-welcome.tsx
import "server-only";

import { ContainerWelcomePage } from "@/modules/static-pages/containers/container-welcome-page";

import type { ScreenWelcomeProps } from "./types";

export async function ScreenWelcome({ locale }: Readonly<ScreenWelcomeProps>) {
  return <ContainerWelcomePage locale={locale} />;
}
```

The container is the required bridge layer — it binds
presenter components together:

```tsx
// container-welcome-page/container-welcome-page.tsx
import "server-only";

import { Box } from "@chakra-ui/react";

import { LandingAiWorkflow } from "@/modules/static-pages/components/landing-ai-workflow";
import { LandingCliUsage } from "@/modules/static-pages/components/landing-cli-usage";
import { LandingCopilot } from "@/modules/static-pages/components/landing-copilot";
import { LandingCta } from "@/modules/static-pages/components/landing-cta";
import { LandingFooter } from "@/modules/static-pages/components/landing-footer";
import { LandingHero } from "@/modules/static-pages/components/landing-hero";
import { LandingStrengths } from "@/modules/static-pages/components/landing-strengths";
import { LandingTechStack } from "@/modules/static-pages/components/landing-tech-stack";
import { PageChrome } from "@/modules/static-pages/components/page-chrome";

import type { ContainerWelcomePageProps } from "./types";

export async function ContainerWelcomePage({
  locale,
}: Readonly<ContainerWelcomePageProps>) {
  return (
    <Box as="main" position="relative">
      <PageChrome locale={locale} />
      <LandingHero locale={locale} />
      <LandingStrengths locale={locale} />
      <LandingAiWorkflow locale={locale} />
      <LandingCopilot locale={locale} />
      <LandingCliUsage locale={locale} />
      <LandingTechStack locale={locale} />
      <LandingCta locale={locale} />
      <LandingFooter locale={locale} />
    </Box>
  );
}
```

Key patterns demonstrated:

- **1:1 page-to-screen** — `page.tsx` returns exactly one
  `ScreenWelcome`
- **screen → container → component** — the screen
  composes a container, the container binds presenter
  components
- **server-only throughout** — `page.tsx`, screen, and
  container all use `import "server-only"`
- **container as required bridge** — even for a static
  page, the container layer is present
- **leaf folder convention** — each component has its own
  folder with implementation, types, index re-export, and
  colocated tests
- **named exports** — every component uses named exports;
  only `page.tsx` uses `export default` as required by
  Next.js
- **`@/` imports** — cross-folder imports use the path
  alias
- **Readonly props** — props are wrapped with
  `Readonly<...>` at the boundary
