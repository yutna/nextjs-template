# AGENTS Guide

## Purpose

This document is the AI-facing operating guide for this repository.

Use it to make architecture-safe decisions, place code in the correct folder, and follow the project's implementation priorities without guessing.

## Critical implementation mindset

- default to a server-first approach and ship the smallest possible client surface
- treat client code as an explicit cost, not the default starting point
- preserve folder ownership boundaries and place code in the narrowest correct location
- prefer extending established patterns over inventing parallel structure
- when in doubt, optimize for architecture correctness over convenience

## Project overview

This is a production-ready Next.js 16 starter template with opinionated conventions for scalable, maintainable web applications.

The project emphasizes App Router boundaries, feature modules, strict folder ownership, server actions, structured error handling, i18n, and Chakra UI v3.

## Project structure

```text
src/
├── app/                    # Next.js App Router routes only; keep route-entry files thin
│   └── [locale]/           # Locale segment managed by next-intl
│       ├── (private)/      # Auth-protected route groups
│       └── (public)/       # Public route groups
├── modules/                # Feature modules; each module owns its domain code
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
├── shared/                 # Cross-cutting app code
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
├── messages/               # i18n message trees by locale and namespace owner
├── test/                   # Shared test helpers
└── proxy.ts                # Locale routing middleware
```

Core ownership rules:

- feature-specific code belongs in `modules/<module-name>/`
- cross-cutting reusable code belongs in `shared/`
- `src/app/**` stays minimal and should mostly select the correct screen/layout/runtime boundary
- cross-module imports are forbidden; move shared behavior into `shared/` instead

## Technology stack

| Concern | Choice |
| --- | --- |
| Framework | Next.js 16 + React 19 |
| Language | TypeScript strict mode |
| UI | Chakra UI v3 |
| Headless UI | Ark UI |
| State machines | Zag.js |
| i18n | next-intl |
| Validation | Zod |
| Server actions | next-safe-action |
| Data fetching | SWR |
| URL state | nuqs |
| Logging | Pino |
| Testing | Vitest + Testing Library |

## How to use this guide

Read the guide in order.

- earlier sections define global defaults and architecture flow
- later sections define folder-specific placement and implementation rules
- when two rules overlap, keep the narrower ownership rule and the stronger server-first constraint

## Ordered rulebook

### 01. Common Style Guide

This guide defines repository-wide coding conventions that apply across the project.

Use this guide for cross-cutting rules such as:

- TypeScript style
- naming
- exports and imports
- package management
- formatting and tooling expectations

This guide is intentionally **not** the place for folder-specific structure rules. Keep it focused on project-wide conventions rather than folder-owned responsibilities.

#### Common Style Guide — 1. Scope

Apply this guide everywhere unless a framework requirement or a narrower topic says otherwise.

Examples of valid exceptions:

- Next.js framework entry files that must follow framework APIs
- config files that require a default export
- narrower topic-specific conventions

Rule of thumb:

- use **Common Style Guide** for project-wide behavior
- keep ownership and folder structure guidance with the relevant topic itself

#### Common Style Guide — 2. TypeScript

This project uses TypeScript in **strict** mode.

Follow these rules:

- do **not** use `any`
- use `unknown` with proper narrowing when the value is not yet known
- use generics when the relationship between values should stay type-safe
- avoid unnecessary type assertions
- prefer proper guards and narrowing over `as any`
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

##### Common Style Guide — 2. TypeScript — Basic naming

- functions and variables: `camelCase`
- React components and classes: `PascalCase`
- constants: `SCREAMING_SNAKE_CASE`

Keep this file focused on the project-wide baseline. More detailed type-contract decisions should stay with the type-specific topic, not the common baseline.

#### Common Style Guide — 3. Imports and modules

Use the repository path alias for internal imports from `src`:

```ts
import { fetchClient } from "@/shared/lib/fetcher";
```

Prefer:

- `@/*` imports for cross-folder imports from `src`
- relative imports for nearby files in the same leaf folder when they are clearer
- `import type` for type-only imports

Avoid:

- `../` parent directory imports
- deep, noisy relative imports that cross many folders when `@/*` is clearer
- mixing value imports and type-only imports carelessly

##### Common Style Guide — 3. Imports and modules — Import sorting

Sort imports into these groups, in this exact order:

1. side-effect imports
2. external modules
3. internal modules using `@/`
4. local same-directory imports using `./`
5. `import type` statements

Rules:

- keep one blank line between groups
- sort each group alphabetically by module path, case-insensitive
- sort named imports inside `{}` alphabetically
- consolidate duplicate imports from the same module
- in mixed imports, keep the default import before named imports
- keep `import type` statements separate, even when the source matches a value import
- use `./` only for the same folder
- use `@/...` for cross-directory project imports
- do not use `../`

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

import { FloatingShapes } from "@/modules/static-pages/components/floating-shapes";
import { MotionReveal } from "@/modules/static-pages/components/motion-reveal";
import { ScrollIndicator } from "@/modules/static-pages/components/scroll-indicator";

import { CopyCommand } from "./copy-command";

import type { SectionHeroProps } from "./types";
```

#### Common Style Guide — 4. Exports

Use **named exports** by default.

This is especially important for React components:

- do not use default exports for components

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

Exceptions are allowed only when the framework or tool requires a default export.

#### Common Style Guide — 5. React and Next.js

This project is server-first.

This is not just a technical rule. It is the default implementation mindset for the whole project:

- start from a server-side solution first
- use Next.js and React 19 server capabilities as far as they can reasonably go
- ship the smallest possible client surface
- treat client code as an explicit cost, not a default

Follow these rules:

- prefer server components by default
- add `"use client"` only when hooks, browser APIs, or client-only interaction require it
- keep React components focused and explicit
- let the React Compiler do its job; do not reach for `useMemo` or `useCallback` by habit

Add memoization only when:

- there is a real measured need
- the code becomes clearer, not more defensive

Do not add client boundaries casually just because a component renders UI.

##### Common Style Guide — 5. React and Next.js — Server-first mindset

Before implementing something, prefer asking:

- can this stay on the server?
- can data loading happen in a server component instead of a client effect?
- can this mutation use a server action instead of a client-only API wrapper?
- can this value be derived on the server and passed down as rendered output?
- can interactivity be isolated to a smaller client leaf instead of making the whole tree client-side?

Prefer:

- server data loading over client fetching when the page can render from the server
- server actions over unnecessary client mutation plumbing
- small client islands inside larger server-rendered trees
- serializable props flowing from server boundaries into client leaves
- rendering-ready data prepared on the server instead of client-side orchestration by default

Avoid:

- marking large trees with `"use client"` too early
- fetching in `useEffect` when the same work belongs naturally on the server
- moving logic to the client just because it feels familiar
- wrapping server-friendly flows in extra client state without a real UX reason
- shipping browser JavaScript for concerns that can be solved during server render

##### Common Style Guide — 5. React and Next.js — Practical best practices

Use these habits to protect the server-first approach:

- keep `"use client"` at the smallest possible leaf
- keep data access, async composition, and request-time decisions on the server when possible
- separate interactive leaf components from server-rendered layout and content
- prefer progressive enhancement over client-heavy orchestration
- let the server prepare the view model when that reduces client complexity

Rule of thumb:

- if a feature works well on the server, keep it on the server
- if only one small piece needs the client, isolate only that piece

#### Common Style Guide — 6. General naming and readability

Choose names that describe ownership and intent clearly.

Prefer:

- domain names over vague names
- specific verbs for actions
- specific nouns for values and contracts

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

Code should read clearly without depending on comments to explain basic meaning.

#### Common Style Guide — 7. Comments

Comment only when the code would otherwise be harder to understand.

Prefer comments for:

- non-obvious intent
- framework or platform constraints
- unusual tradeoffs
- short clarifications around complex logic

Avoid comments that only restate the code.

Prefer:

```ts
// next-intl returns the key when a translation is missing, so keep the fallback explicit.
```

Avoid:

```ts
// Set the name variable.
const name = value;
```

#### Common Style Guide — 8. Error handling

Handle errors explicitly and intentionally.

Rules:

- do not swallow errors silently
- do not add broad success-shaped fallbacks that hide real failures
- surface or rethrow errors in a way that matches the app's existing error model
- prefer specific, meaningful errors over generic `Error` usage when the domain already has a clear error concept

Good direction:

- validate early
- return or throw clear error states
- reuse the existing app error hierarchy and helpers where appropriate

Avoid:

- empty `catch` blocks
- `catch { return null; }` when the failure should be visible
- broad fallback values that make debugging harder

#### Common Style Guide — 9. Environment variables

Do not read environment variables ad hoc throughout the codebase.

Rules:

- define environment variables through the shared environment configuration
- validate them with the existing env setup
- use `NEXT_PUBLIC_` only for values intended for the client
- keep server-only values off the client

Prefer:

- one validated source of truth for environment access
- imports from the shared env module instead of raw `process.env` usage in app code

#### Common Style Guide — 10. Reuse before create

Prefer existing abstractions before creating new ones.

Rules:

- reuse an existing helper, component, hook, action, schema, or utility when it already fits
- extract shared logic only when reuse is real, not speculative
- do not add a new dependency when the current stack already solves the problem well

Rule of thumb:

- search first
- reuse second
- create new code only when the existing options are clearly not a fit

#### Common Style Guide — 11. One concern per unit

Keep each file or leaf folder focused on one clear concern.

Good direction:

- one main responsibility per file
- small helpers near the owner when they are private
- separate unrelated behavior instead of mixing many concerns into one unit

Avoid:

- catch-all files with unrelated helpers
- one module doing rendering, fetching, parsing, and persistence all together
- generic "utils" code added without a clear ownership reason

#### Common Style Guide — 12. Package management

Use **npm** only.

Do not use:

- `yarn`
- `pnpm`
- `bun` for dependency management in this project

Install dependencies with exact versions:

```bash
npm install -E <package>
npm install -E -D <package>
```

Rules:

- use `npm install -E` for runtime dependencies
- use `npm install -E -D` for dev dependencies
- keep `package-lock.json` committed and in sync
- use existing npm scripts from `package.json`

#### Common Style Guide — 13. Formatting and tooling

Do not invent local formatting or linting style by hand. Follow the repository tooling.

Current baseline:

- formatting: `npm run format`
- linting: `npm run lint`
- type-checking: `npm run check-types`
- testing: `npm run test`

Rules:

- write code that passes the existing formatter and linter
- prefer fixing the code to satisfy the tooling instead of fighting the tooling
- do not introduce alternate package managers or parallel toolchains for the same concern

#### Common Style Guide — 14. Dependency and library choices

Prefer the libraries and abstractions already used by the repository before introducing new ones.

Examples already in use:

- Chakra UI
- next-intl
- next-safe-action
- SWR
- Zod
- Vitest

Rule of thumb:

- reuse the current stack first
- add a new dependency only when the existing stack clearly does not cover the need

#### Common Style Guide — 15. Keep common rules common

This file should stay focused on rules that truly apply everywhere.

Do not repeat detailed folder-level guidance here when a narrower topic already owns that guidance. Instead:

- keep the common rule short
- let the narrower topic define the narrow rule

Examples:

- keep testing structure with the testing topic
- keep translation ownership with the i18n/messages topic
- keep presenter UI structure with the component topic
- keep route-level composition with the screen topic

#### Common Style Guide — 16. Checklist

Before writing or changing code, check:

- am I following strict TypeScript without `any`?
- are naming and casing consistent?
- should this be a named export?
- should this stay server-side by default?
- am I adding comments only where they help?
- am I handling errors explicitly instead of hiding them?
- am I using validated environment access instead of ad hoc `process.env` reads?
- am I using existing project libraries before adding new ones?
- did I search for an existing abstraction before creating a new one?
- am I using npm with exact dependency versions?
- am I avoiding duplication of folder-specific rules here?

#### Common Style Guide — 17. Quick reference

Remember:

- no `any`
- `camelCase` for functions and variables
- `PascalCase` for components and classes
- `SCREAMING_SNAKE_CASE` for constants
- `kebab-case` for files and folders
- named exports by default
- server components by default
- comments only when needed
- no silent error handling
- use validated env access
- reuse before creating new abstractions
- npm only
- exact dependency versions

### 02. Common Feature Implementation Flow

This guide explains the common implementation flow for building a feature in this repository.

It is a synthesis document that connects the existing rules for:

- `page.tsx`
- `screens/`
- `containers/`
- `components/`
- `actions/`
- `hooks/`
- `schemas/`
- `lib/`
- `layouts/`
- and supporting shared layers such as `config/`, `constants/`, `providers/`, and `contexts/`

Use this document as the high-level architecture reference when deciding where new code should live.

#### Common Feature Implementation Flow — 1. Core idea

This repository uses a layered, server-first feature flow.

The most common UI path is:

```txt
page.tsx -> screen -> container -> component
```

And the most common action/data path is:

```txt
action -> container -> component
```

Supporting layers sit beside that flow:

- `schemas/` define validation contracts
- `lib/` owns reusable integrations and service boundaries
- `hooks/` own extracted client logic
- `layouts/` own reusable framing
- `config/` and `constants/` provide app-wide setup and static values

#### Common Feature Implementation Flow — 2. Primary layer responsibilities

##### Common Feature Implementation Flow — 2. Primary layer responsibilities — `page.tsx`

- server-only route entry
- one `page.tsx` returns one screen directly
- handles route-entry concerns such as params handoff and locale setup

##### Common Feature Implementation Flow — 2. Primary layer responsibilities — `screens/`

- module-level page UI entry
- one screen belongs to one `page.tsx`
- composes containers only
- stays server-first by default

##### Common Feature Implementation Flow — 2. Primary layer responsibilities — `containers/`

- required bridge layer beneath screens
- binds logic to presenter components
- may be server or client depending on the binding need
- should stay self-contained with minimal prop drilling

##### Common Feature Implementation Flow — 2. Primary layer responsibilities — `components/`

- presenter-oriented UI
- stateless or logic-light
- receives prepared props

##### Common Feature Implementation Flow — 2. Primary layer responsibilities — `actions/`

- server action definitions
- use `"use server";`
- use `actionClient` or `authActionClient`

##### Common Feature Implementation Flow — 2. Primary layer responsibilities — `hooks/`

- extracted client logic
- consumed by containers
- not the home of route-entry or presenter composition

##### Common Feature Implementation Flow — 2. Primary layer responsibilities — `schemas/`

- Zod validation contracts
- shared or module-owned depending on ownership

##### Common Feature Implementation Flow — 2. Primary layer responsibilities — `lib/`

- reusable integrations, service boundaries, and architecture-level logic
- not action definitions, not presenter UI

#### Common Feature Implementation Flow — 3. End-to-end overview diagram

```txt
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

Read it like this:

1. `page.tsx` enters the route
2. the page returns one screen
3. the screen assembles one or more containers
4. each container binds logic to presenter components
5. containers may use hooks and actions
6. actions validate input with schemas and call into lib when needed

#### Common Feature Implementation Flow — 4. Server-first flow

Use this flow when the feature is mostly server-driven.

```txt
page.tsx
  -> screen
    -> server container
      -> component
    -> action
      -> schema
      -> lib
```

##### Common Feature Implementation Flow — 4. Server-first flow — What this means

- `page.tsx` stays thin and server-only
- the screen remains server-first
- the container may remain a server component
- the component renders a presenter UI
- the action stays in `actions/`
- reusable service behavior lives in `lib/`

##### Common Feature Implementation Flow — 4. Server-first flow — Example shape

```txt
src/app/[locale]/profile/page.tsx
  -> src/modules/profile/screens/screen-profile/
    -> src/modules/profile/containers/container-form-profile/
      -> src/modules/profile/components/form-profile/
    -> src/modules/profile/actions/update-profile-action/
    -> src/modules/profile/schemas/update-profile-input/
    -> src/modules/profile/lib/update-profile/
```

##### Common Feature Implementation Flow — 4. Server-first flow — Server-first rule

Do not introduce client code unless the interaction truly needs it.

If the binding can stay on the server:

- keep the container server-side
- let the action remain server-side
- let the presenter component receive prepared props

#### Common Feature Implementation Flow — 5. Client-interactive flow

Use this flow when the feature needs client coordination.

```txt
page.tsx
  -> screen
    -> client container
      -> hook
      -> action
      -> component
```

##### Common Feature Implementation Flow — 5. Client-interactive flow — What this means

- `page.tsx` still stays server-only
- the screen still stays server-first when possible
- the container becomes `"use client"` only when needed
- the hook owns the extracted client logic
- the component remains presenter-oriented
- the action still stays in `actions/`

##### Common Feature Implementation Flow — 5. Client-interactive flow — Example shape

```txt
src/app/[locale]/checkout/page.tsx
  -> src/modules/checkout/screens/screen-checkout/
    -> src/modules/checkout/containers/container-form-checkout/
      -> src/modules/checkout/hooks/use-form-checkout/
      -> src/modules/checkout/actions/submit-checkout-action/
      -> src/modules/checkout/components/form-checkout/
```

##### Common Feature Implementation Flow — 5. Client-interactive flow — Client-interactive rule

Do not move business logic into the component just because the feature is interactive.

Instead:

- container binds
- hook encapsulates client logic
- component presents

#### Common Feature Implementation Flow — 6. Relationship to App Router boundaries

App Router files still keep their own responsibilities.

##### Common Feature Implementation Flow — 6. Relationship to App Router boundaries — `page.tsx`

- route entry
- server-only
- returns one screen directly
- handles locale setup where required

##### Common Feature Implementation Flow — 6. Relationship to App Router boundaries — `layout.tsx`

- route or segment boundary layout concerns
- reusable visual structure should still move into `shared/layouts` or `modules/<module>/layouts`
- `src/app/[locale]/layout.tsx` owns locale-boundary setup such as `setRequestLocale(locale)` and locale-aware providers

##### Common Feature Implementation Flow — 6. Relationship to App Router boundaries — `loading.tsx`, `error.tsx`, `template.tsx`

- stay in `app/`
- do not replace them with screen or container patterns

#### Common Feature Implementation Flow — 7. Supporting layers and where they fit

##### Common Feature Implementation Flow — 7. Supporting layers and where they fit — `schemas/`

Use schemas for:

- action input validation
- search param validation
- route param validation
- form payload validation

They usually support:

```txt
action -> schema
```

or

```txt
page/screen -> schema
```

when validating route-shaped inputs.

##### Common Feature Implementation Flow — 7. Supporting layers and where they fit — `lib/`

Use lib for:

- reusable integrations
- service boundaries
- framework wrappers
- infrastructure-aware logic

It usually sits behind actions or other server-side flows:

```txt
action -> lib
```

##### Common Feature Implementation Flow — 7. Supporting layers and where they fit — `hooks/`

Use hooks for:

- extracted client logic
- browser-aware interaction logic
- reusable UI state

They usually sit beneath containers:

```txt
container -> hook
```

##### Common Feature Implementation Flow — 7. Supporting layers and where they fit — `layouts/`

Use layouts for:

- reusable structural framing
- shared page chrome
- route-family shells

They sit around page flows, not inside the action chain.

##### Common Feature Implementation Flow — 7. Supporting layers and where they fit — `config/` and `constants/`

Use these for:

- app-wide configuration
- static shared values

These layers support other layers but are not normally the center of feature flow.

#### Common Feature Implementation Flow — 8. Recommended build order for a new feature

When implementing a new feature, this order usually keeps the architecture clean:

1. define the route entry need in `page.tsx`
2. define the screen for that page
3. define the containers the screen needs
4. define presenter components beneath the containers
5. define actions for mutations
6. define schemas for validation
7. extract reusable service logic into `lib/`
8. extract client logic into hooks if interaction requires it

This is not a rigid time sequence for every task, but it is a useful architectural order.

#### Common Feature Implementation Flow — 9. Practical diagrams

##### Common Feature Implementation Flow — 9. Practical diagrams — Minimal page rendering flow

```txt
page.tsx
  -> Screen*
    -> Container*
      -> Component*
```

##### Common Feature Implementation Flow — 9. Practical diagrams — Action-backed interactive flow

```txt
Screen*
  -> Container*
    -> useSomething()
    -> someAction()
    -> Component*

someAction()
  -> input schema
  -> lib function
```

##### Common Feature Implementation Flow — 9. Practical diagrams — Locale-aware route flow

```txt
app/[locale]/layout.tsx
  -> locale boundary setup
app/[locale]/page.tsx
  -> Screen*
    -> Container*
      -> Component*
```

#### Common Feature Implementation Flow — 10. Common mistakes to avoid

Avoid these architecture mistakes:

- `page.tsx` assembling containers directly
- screens rendering presenter components directly as the main pattern
- containers owning business logic inline
- components becoming mini controllers
- actions embedding reusable service logic that belongs in `lib/`
- hooks becoming the home of server-side behavior
- route-boundary App Router responsibilities leaking into screens or containers

#### Common Feature Implementation Flow — 11. Quick reference

Use this quick map when deciding where code belongs:

```txt
Route entry?                -> page.tsx
Module-level page UI?       -> screens/
Logic binding?              -> containers/
Presenter UI?               -> components/
Server action?              -> actions/
Client interaction logic?   -> hooks/
Validation contract?        -> schemas/
Reusable service logic?     -> lib/
Reusable structural frame?  -> layouts/
App setup/static values?    -> config/ or constants/
```

#### Common Feature Implementation Flow — 12. Related topics

Use this document together with the more specific topics for:

- page entry files
- screens
- containers
- components
- actions
- hooks
- layouts
- schemas
- shared lib code

This document explains the common flow. The narrower topics still define the detailed standards for each folder or file type.

### 03. `page.tsx` Style Guide

This guide defines how to write normal App Router `page.tsx` files under:

- `src/app/**/page.tsx`

This guide focuses on standard route-entry pages such as `src/app/[locale]/page.tsx`. Special pages like a root redirect page or a catch-all notFound page are exceptions and are mentioned only briefly.

Use `page.tsx` as a thin, server-only route-entry adapter. Its main job is to handle route-entry concerns and return one screen directly.

#### `page.tsx` Style Guide — 1. Decide what belongs in `page.tsx`

Put code in `page.tsx` when it does one or more of the following:

- acts as the Next.js route entry
- receives route params or search params
- performs route-entry setup required by the route
- performs locale setup for locale-aware pages
- returns one screen directly

Examples:

- route param handoff
- locale setup for `[locale]`
- route-entry redirect or `notFound()` when that is the page's purpose

Do **not** put code in `page.tsx` when it belongs somewhere more specific:

- `screens/` for module-level page UI
- `containers/` for logic binding
- `components/` for presenter UI
- `layouts/` for reusable framing around `children`
- `loading.tsx`, `error.tsx`, or `template.tsx` for those App Router responsibilities

Rule of thumb:

- if the concern exists because Next.js needs a route entry, it probably belongs in `page.tsx`
- if the concern is about page UI composition, it probably belongs in a screen

#### `page.tsx` Style Guide — 2. Always server-only

Normal `page.tsx` files should always start with:

```ts
import "server-only";
```

Why:

- `page.tsx` is the route-entry boundary
- this repository wants server-first page files
- route-entry setup should stay on the server side

Do not add `"use client"` to normal `page.tsx` files.

If a route needs client interaction, return a server-first screen and let the screen compose containers beneath it.

#### `page.tsx` Style Guide — 3. One `page.tsx` -> one screen

`page.tsx` has a direct 1-to-1 relationship with screens.

Required direction:

- one `page.tsx` returns one screen directly
- one screen belongs to one `page.tsx`

Good direction:

```tsx
import "server-only";

import { ScreenWelcome } from "@/modules/static-pages/screens/screen-welcome";

export default function Page() {
  return <ScreenWelcome />;
}
```

This keeps:

- route-entry concerns in `page.tsx`
- page UI assembly in the screen
- logic binding in containers
- rendering details in components

Do not let `page.tsx`:

- assemble many containers directly
- render presenter components directly as the normal pattern
- become a second screen layer

#### `page.tsx` Style Guide — 4. Keep `page.tsx` thin

`page.tsx` should stay small and focused.

Prefer:

- route params handoff
- locale setup
- route-entry validation or redirect behavior
- returning the screen directly

Avoid:

- page-level visual composition
- presenter wiring
- business logic
- client hooks
- container orchestration

If the file starts looking like a screen, move that composition into `modules/<module-name>/screens`.

#### `page.tsx` Style Guide — 5. `[locale]` pattern and next-intl setup

For locale-aware pages under `[locale]`, follow the repository's existing pattern.

Current example:

```tsx
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

Rules for this pattern:

- read the locale from route params
- call `setRequestLocale(locale)` in the locale page
- pass the locale or other route-shaped inputs into the screen
- keep the page thin even when locale setup is required

This locale setup supports the route's static rendering strategy under `[locale]`. Keep that setup in `page.tsx` instead of pushing it down into the screen.

#### `page.tsx` Style Guide — 6. Relationship with other App Router files

This guide stays focused on `page.tsx`, so other App Router files are mentioned only enough to define the boundary.

Use:

- `page.tsx` for route entry
- `layout.tsx` for route-boundary layout concerns
- `loading.tsx` for loading UI
- `error.tsx` for route-segment error UI
- `template.tsx` for template boundaries

Do not move those responsibilities into `page.tsx`.

#### `page.tsx` Style Guide — 7. Naming

For exported symbols in normal `page.tsx` files:

- use the default export required by Next.js
- name the function `Page`

Good:

- `export default function Page() {}`

Avoid:

- `export default function WelcomePage() {}`
- `export default function LocalePage() {}`
- `export default function PageWelcome() {}`

Keep route-entry naming boring and consistent. The meaningful name belongs to the screen, not to the route-entry function.

#### `page.tsx` Style Guide — 8. Props and API shape

`page.tsx` should only accept route-entry inputs.

Prefer:

- `params`
- `searchParams` when the route actually needs them
- readonly typing for props

Avoid:

- large custom prop types unrelated to the route
- passing many concern-owned dependencies from `page.tsx` into the screen
- treating `page.tsx` like a generic wrapper component

If many concern-owned values are being passed downward, the file is likely carrying responsibilities that belong in the screen or container layer.

#### `page.tsx` Style Guide — 9. Exceptions

This guide focuses on normal route-entry pages, but some `page.tsx` files are special-purpose exceptions.

Examples in the current repository:

- root redirect page
- catch-all notFound page

These files may:

- call `redirect(...)`
- call `notFound()`
- skip screen rendering entirely because the route entry itself is the whole purpose

Treat these as exceptions, not the default `page.tsx` pattern.

#### `page.tsx` Style Guide — 10. Examples

##### `page.tsx` Style Guide — 10. Examples — Good normal route-entry page

```tsx
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

##### `page.tsx` Style Guide — 10. Examples — Good special exception

```tsx
import { redirect } from "next/navigation";

export default function RootPage() {
  redirect("/en");
}
```

This is acceptable because the route entry itself is only a redirect and does not represent a normal page-to-screen flow.

#### `page.tsx` Style Guide — 11. Checklist

Before writing a normal `page.tsx`, check:

- does the file start with `import "server-only";`?
- is the file staying thin and route-focused?
- does it return exactly one screen directly?
- is the screen the real owner of page UI composition?
- are locale-aware pages doing `setRequestLocale(locale)` where required?
- are route-entry concerns staying in `page.tsx` instead of leaking into the screen?
- are other App Router responsibilities staying in their own files?
- is the default export named `Page` for normal route entries?

### 04. Layouts Folder Style Guide

This guide defines how to write and organize code inside:

- `src/shared/layouts`
- `src/modules/<module-name>/layouts`

It also defines how reusable layouts should relate to route-boundary files such as:

- `src/app/layout.tsx`
- `src/app/**/layout.tsx`

Use `layouts` for reusable page framing components that provide structure around `children` and establish consistent composition patterns. Keep route-boundary App Router `layout.tsx` files thin and move reusable structure into `shared/layouts` or `modules/<module-name>/layouts`.

#### Layouts Folder Style Guide — 1. Decide whether code belongs in `layouts`

Put code in a `layouts` folder when it does one or more of the following:

- provides a reusable structural frame around `children`
- composes repeated page chrome such as headers, sidebars, shells, content regions, or section rails
- establishes consistent page-level or feature-level spacing, slots, and layout regions
- is intended to be shared across multiple routes within a feature or across multiple features
- represents layout composition rather than one specific page's final content

Examples:

- an app shell with navigation and content regions
- an auth layout wrapping sign-in and forgot-password pages
- a dashboard layout shared by multiple private pages
- a marketing layout that provides shared hero/footer framing for a family of routes

Do **not** put code in `layouts` when it belongs somewhere more specific:

- `src/app/**/layout.tsx` for the route-boundary file required by Next.js
- other UI folders such as page, screen, container, or component folders when the code is not defining a reusable frame
- `lib/` for infrastructure and integrations
- `providers/` for context/provider composition
- `styles/` or Chakra props for styling concerns without reusable structural ownership

Rule of thumb:

- If the code's main purpose is to frame `children`, it is likely a layout.
- If it does not define a reusable frame, it likely belongs in another UI layer.

#### Layouts Folder Style Guide — 2. Relationship to App Router `layout.tsx`

`src/app/**/layout.tsx` files are route-boundary adapters. They exist because Next.js requires them, but they should stay thin.

Naming:

- use `Layout` for App Router `layout.tsx` components
- use `RootLayout` only for `src/app/layout.tsx`

Use App Router layout files for:

- defining the route boundary
- handling route-boundary concerns such as metadata, `generateStaticParams`, locale validation, and request-level setup
- wiring providers or wrappers that must live at that route boundary
- delegating reusable structure to a layout component when the UI frame is not route-specific

Special case: `src/app/[locale]/layout.tsx`

- treat this file as the locale boundary for the app
- use `import "server-only";`
- read and validate the locale from params
- call `setRequestLocale(locale)` there, just like locale-aware `page.tsx` does at its own boundary
- keep `generateStaticParams()` there for the locale segment when needed
- load locale-aware messages and wire locale-aware providers there when the root app shell depends on them

Do **not** let `src/app/**/layout.tsx` become the long-term home for reusable visual structure.

Prefer:

- thin route `layout.tsx`
- reusable layout component in `shared/layouts` or `modules/<module-name>/layouts`

Good direction:

```tsx
// src/app/[locale]/(private)/dashboard/layout.tsx
import { LayoutTwoColumns } from "@/modules/dashboard/layouts/layout-two-columns";

import type { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({
  children,
}: Readonly<LayoutProps>) {
  return <LayoutTwoColumns>{children}</LayoutTwoColumns>;
}
```

This keeps the route file focused on Next.js boundary needs while the reusable frame lives in the owning folder.

Locale-boundary direction:

```tsx
// src/app/[locale]/layout.tsx
import "server-only";

import { hasLocale } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

import { routing } from "@/shared/config/i18n/routing";
import { AppProvider } from "@/shared/providers/app-provider";

import type { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function Layout({
  children,
  params,
}: Readonly<LayoutProps>) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <AppProvider locale={locale} messages={messages}>
      {children}
    </AppProvider>
  );
}
```

This is still a route-boundary adapter, but for the locale segment it is expected to own next-intl setup that must happen at the layout boundary.

#### Layouts Folder Style Guide — 3. Boundaries with other UI folders

This guide stays focused on `layouts`, so other UI layers are mentioned here only to define the boundary.

- use `layouts/` for reusable structural frames around `children`
- use other UI folders when the code is mainly page assembly, self-contained UI logic, or presenter-only rendering

If a wrapper is only meaningful for one route and does not frame multiple pages or children-based content, it likely does not belong in `layouts/`.

#### Layouts Folder Style Guide — 4. Scope and placement

Choose the narrowest valid scope first.

##### Layouts Folder Style Guide — 4. Scope and placement — `src/modules/<module-name>/layouts`

Prefer module-level layouts when the structural frame belongs to one feature module.

Good fits:

- a dashboard layout used only by dashboard routes
- an account settings layout shared only inside the account module
- a checkout layout owned by the checkout feature

Examples:

- `src/modules/dashboard/layouts/layout-two-columns/`
- `src/modules/account/layouts/layout-settings/`

##### Layouts Folder Style Guide — 4. Scope and placement — `src/shared/layouts`

Promote a layout to shared only when it is truly cross-module or app-wide.

Good fits:

- an app shell used across multiple modules
- a public marketing shell used by unrelated route families
- a minimal content layout used by multiple feature areas

Examples:

- `src/shared/layouts/layout-default/`
- `src/shared/layouts/layout-public/`

Avoid moving feature-owned layouts into `shared` too early. Promote only when:

- multiple unrelated modules use the same frame
- the structure is generic and not feature-branded
- the shared location improves clarity more than it increases indirection

#### Layouts Folder Style Guide — 5. File and folder structure

Follow the repository's kebab-case convention for files and folders.

Each reusable layout should live in its own leaf folder:

```txt
src/shared/layouts/layout-default/
├── layout-default.tsx
├── index.ts
└── types.ts

src/modules/dashboard/layouts/layout-two-columns/
├── layout-two-columns.tsx
├── layout-two-columns.test.tsx
├── index.ts
└── types.ts
```

Rules:

- keep one public layout per folder
- prefix reusable layout folder names with `layout-`
- name the folder and main implementation file the same
- add a leaf-level `index.ts` for the layout folder
- colocate `types.ts` when the layout owns its props
- keep tests adjacent to the layout they cover
- do not create parent barrel files for `src/shared/layouts` or `src/modules/<module-name>/layouts`
- add extra files such as `slots.ts`, `constants.ts`, or internal helpers only when they materially improve clarity

If a layout grows enough to need supporting internal pieces, keep them inside the same layout folder so ownership stays obvious.

#### Layouts Folder Style Guide — 6. Naming

Name layouts after the structural role they play.

Prefer:

- `layout-default`
- `layout-two-columns`
- `layout-settings`
- `layout-auth`
- `layout-public`

Avoid:

- `layout-1`
- `dashboard-layout`
- `settings-layout`
- `main`
- `wrapper`
- `container`
- `page-layout` when the page name is more specific
- `shared-layout`

For exported symbols:

- use PascalCase component names derived from the file name: `LayoutDefault`, `LayoutTwoColumns`
- keep the `Layout` prefix in the component name to mirror the `layout-` file convention
- use clear slot prop names such as `children`, `header`, `sidebar`, or `footer`

Names should make sense when imported from another folder.

#### Layouts Folder Style Guide — 7. Public API and props

A layout folder should expose a small, intentional public API.

- export the main layout component from `index.ts`
- export layout-owned types separately with `export type`
- keep internal helper components private unless they are intentionally reusable
- prefer explicit props over vague config objects

Good:

```ts
export { LayoutTwoColumns } from "./layout-two-columns";
export type { LayoutTwoColumnsProps } from "./types";
```

Prefer layout props that describe structure clearly:

- `children`
- `header`
- `sidebar`
- `footer`
- `actions`

Avoid generic props such as:

- `data`
- `config`
- `options`

unless those names reflect a real, well-defined contract.

Use `types.ts` when the layout folder owns the props contract:

```ts
export interface LayoutTwoColumnsProps {
  children: ReactNode;
  sidebar?: ReactNode;
}
```

As with the rest of the repository, wrap props with `Readonly<...>` at the component boundary when appropriate.

#### Layouts Folder Style Guide — 8. Composition and data flow

Layouts should compose structure, not own unrelated business workflows.

- accept `children` and explicit slots for structural regions
- keep layout responsibilities focused on framing and composition
- let route boundaries and page-specific UI layers prepare route-specific data unless the shared frame truly owns that data
- avoid turning a layout into a hidden service layer
- keep layout logic understandable from the file structure

Good responsibilities for a layout:

- arranging header, sidebar, main content, and footer
- applying shared spacing and region wrappers
- rendering shared navigation or chrome for a route family

Usually not a fit for a layout:

- page-specific data orchestration unrelated to the frame
- one-off business logic for a single route
- generic infrastructure setup better owned by providers or lib code

If a layout needs smaller building blocks, place them in:

- the same layout folder if they are private to that layout
- the appropriate adjacent UI folder if the piece is independently owned outside the layout boundary

#### Layouts Folder Style Guide — 9. Server and client boundaries

Layouts should follow the repository default: Server Components first.

- keep layouts as Server Components unless they need hooks, browser APIs, or client-only behavior
- add `"use client"` only when it is truly required
- keep client-only behavior as low in the tree as practical
- do not convert an entire layout to client-only just because one child widget needs interactivity

If a layout needs interactive pieces:

- keep the main layout server-friendly when possible
- move the interactive piece into a child component
- isolate browser-only code behind a client component boundary

App Router `layout.tsx` files should also stay thin in this regard:

- keep route-boundary server work there when required
- delegate reusable visual structure to the layout folder
- avoid mixing route setup, interactivity, and large markup trees in the route file

Use `import "server-only"` only when the layout file itself must never be imported into a client bundle.

#### Layouts Folder Style Guide — 10. Styling expectations

Layouts should express structure first and styling second.

- use Chakra layout primitives and props for structural styling
- keep layout-level spacing, container width, and region alignment close to the layout component
- move purely visual reusable pieces into components when they are not structural
- use CSS Modules only when Chakra props are not a good fit and the styling is still owned by the layout

Avoid creating a `layouts/` folder just to hold styled wrappers with no meaningful structural contract.

#### Layouts Folder Style Guide — 11. Imports and exports

- use relative imports within the same layout folder
- use the `@/*` alias for cross-folder imports
- keep imports aligned with ownership boundaries
- let consumers import from the layout folder's public API when possible
- avoid deep imports into another layout folder's internals

Good:

```ts
import { SidebarNav } from "@/modules/dashboard/components/sidebar-nav";
import type { LayoutTwoColumnsProps } from "./types";
```

Avoid:

```ts
import { someInternalSlotHelper } from "@/shared/layouts/layout-default/internal-helper";
```

unless both files are part of the same owned layout boundary and the deep import is intentionally internal.

#### Layouts Folder Style Guide — 12. Testing

Every non-trivial reusable layout should have adjacent tests.

- use Vitest and Testing Library
- keep tests next to the layout they cover
- test the layout contract and rendered regions
- verify `children` and any explicit slots render in the correct places
- test structural behavior, not implementation details

Typical layout tests should cover:

- rendering `children`
- rendering optional regions such as `header`, `sidebar`, or `footer`
- conditional layout branches when the contract supports them
- client/server boundary behavior when relevant

If a layout is extremely small and purely presentational, tests may be light, but reusable structural behavior should still be validated.

#### Layouts Folder Style Guide — 13. Example patterns

##### Layouts Folder Style Guide — 13. Example patterns — Good shared layout

```txt
src/shared/layouts/layout-default/
├── layout-default.tsx
├── index.ts
└── types.ts
```

Why it fits:

- shared across unrelated areas
- clearly structural
- owns a small public API

##### Layouts Folder Style Guide — 13. Example patterns — Good module layout

```txt
src/modules/dashboard/layouts/layout-two-columns/
├── layout-two-columns.tsx
├── layout-two-columns.test.tsx
├── index.ts
└── types.ts
```

Why it fits:

- owned by one feature module
- frames multiple pages in that feature
- not generic enough for `shared`

##### Layouts Folder Style Guide — 13. Example patterns — Thin route layout file

```txt
src/app/[locale]/(public)/layout.tsx
```

```tsx
import { LayoutDefault } from "@/shared/layouts/layout-default";

import type { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({
  children,
}: Readonly<LayoutProps>) {
  return <LayoutDefault>{children}</LayoutDefault>;
}
```

Why it fits:

- route-boundary file stays thin
- reusable frame lives in the owning shared folder
- Next.js-specific boundary remains in `app/`

#### Layouts Folder Style Guide — 14. Final checklist

Before placing code in `layouts`, check:

- does it provide a reusable structural frame around `children`?
- should it live in `layouts` instead of `screens`, `components`, or `app/layout.tsx`?
- is the scope correct: module first, shared only when truly cross-cutting?
- is the App Router `layout.tsx` file staying thin?
- is the folder named after one clear structural role?
- are props explicit and layout-oriented?
- are server/client boundaries kept as low as possible?
- are tests covering the layout contract?

### 05. Routes Folder Style Guide

This guide defines how to design and use route helpers in `src/shared/routes`.

The purpose of `src/shared/routes` is to be the single source of truth for **user-facing path builders**. The `src/app` tree is still the source of rendering structure and Next.js file conventions, but application code should consume route helpers instead of duplicating raw path strings.

#### Routes Folder Style Guide — 1. Role of `shared/routes`

Use `src/shared/routes` for:

- user-facing page paths
- explicit path builders for dynamic segments
- stable route group organization such as `root`, `public`, and `private`
- paths consumed by links, redirects, buttons, navigation, and route-aware logic

Do **not** use `shared/routes` for:

- filesystem-only App Router details
- route-group syntax such as `(public)` or `(private)` in returned URLs
- private folders prefixed with `_`
- slot names such as `@modal`
- interceptor matchers such as `(.)`, `(..)`, or `(...)`

Rule of thumb:

- if it is part of the navigable URL contract, model it in `shared/routes`
- if it only exists to organize `src/app`, keep it in the `app/` tree, not in the route helper API

#### Routes Folder Style Guide — 2. Relationship to Next.js App Router

The route helper layer should reflect App Router concepts **selectively**.

##### Routes Folder Style Guide — 2. Relationship to Next.js App Router — Mirror these concepts

- static segments
- dynamic segments
- catch-all segments when they map to a real URL contract
- logical route families such as root/public/private sections

##### Routes Folder Style Guide — 2. Relationship to Next.js App Router — Do not mirror these literally

- route groups like `(public)` and `(private)`
- private folders like `_components`
- parallel route slots like `@modal`
- intercepting route syntax like `(.)photo/[id]`

These App Router features affect rendering structure, not necessarily the public URL API.

#### Routes Folder Style Guide — 3. Route groups should reflect URL meaning, not filesystem syntax

`src/shared/routes` may use `root`, `public`, and `private` as organizational groups, but the generated path must reflect the real URL, not the route-group folder name.

Good:

```ts
export const publicRoutes = {
  signIn: {
    path: () => "/sign-in",
  },
};
```

Avoid:

```ts
export const publicRoutes = {
  signIn: {
    path: () => "/(public)/sign-in",
  },
};
```

Route-group folders help organize `src/app`, but they do not appear in the URL and should not leak into route helpers.

#### Routes Folder Style Guide — 4. Keep locale handling out of route paths

This project uses locale-aware navigation wrappers from `@/shared/lib/navigation`.

Because locale handling is already applied there:

- route helpers should return locale-neutral paths such as `"/"` or `"/sign-in"`
- do not add `"/th"` or `"/en"` manually in route helpers
- do not add locale parameters to normal route builder APIs unless a route genuinely needs them for a different reason

Good:

```ts
export const root = {
  path: () => "/",
};
```

Use these helpers with:

- `Link` from `@/shared/lib/navigation`
- `redirect` from `@/shared/lib/navigation`
- router helpers from the same navigation layer

#### Routes Folder Style Guide — 5. File and folder structure

Organize route helpers by route family.

Good structure:

```txt
src/shared/routes/
├── index.ts
├── root/
│   └── index.ts
├── public/
│   ├── index.ts
│   └── sign-in/
│       └── index.ts
└── private/
    ├── index.ts
    └── dashboard/
        └── index.ts
```

Rules:

- use kebab-case folder names for concrete route segments
- use `root`, `public`, and `private` only as organizational route-helper groups
- keep one route helper object per leaf folder
- use a leaf `index.ts` inside each route folder
- keep the top-level `src/shared/routes/index.ts` as the public aggregator for the route API

#### Routes Folder Style Guide — 6. Public API shape

Prefer a predictable nested API:

```ts
routes.root.path()
routes.public.signIn.path()
routes.private.dashboard.path()
routes.private.users.detail.path(userId)
```

Rules:

- every route helper should expose a `path` function
- use `path: () => "/static-path"` for static routes
- use `path: (id: string) => \`/users/${id}\`` for dynamic routes
- keep return values as plain strings
- keep the API noun-based and stable

Avoid mixing shapes like:

- `url`
- `href`
- `to`
- `buildPath`

Use `path` consistently.

#### Routes Folder Style Guide — 7. Dynamic segment conventions

When an App Router segment is dynamic, the route helper should accept explicit parameters that match the user-facing URL contract.

Good:

```ts
export const users = {
  detail: {
    path: (userId: string) => `/users/${userId}`,
  },
};
```

Prefer descriptive parameter names:

- `userId`
- `slug`
- `invoiceId`

Avoid:

```ts
path: (value: string) => `/users/${value}`;
```

#### Routes Folder Style Guide — 8. Catch-all and optional catch-all segments

Use catch-all helpers only when the URL contract truly needs arbitrary nested segments.

Good:

```ts
export const docs = {
  page: {
    path: (...segments: string[]) => `/docs/${segments.join("/")}`,
  },
};
```

If the route can be modeled with a clearer fixed helper, prefer the clearer API.

Do not introduce catch-all route helpers just because the App Router filesystem supports them.

#### Routes Folder Style Guide — 9. Parallel and intercepting routes

Most parallel-route and intercepting-route details should stay out of `shared/routes`.

Examples:

- `@modal`
- `(.)photo/[id]`
- `default.tsx` for slot fallback

These are rendering mechanics, not usually separate public route contracts.

If a modal or intercepted route corresponds to a real navigable page such as `/photos/123`, model only the real URL:

```ts
export const photos = {
  detail: {
    path: (photoId: string) => `/photos/${photoId}`,
  },
};
```

Do not create route helpers that expose interceptor syntax or slot names.

#### Routes Folder Style Guide — 10. Naming

Name route helper folders and objects after the URL concept they represent.

Prefer:

- `root`
- `sign-in`
- `dashboard`
- `users`
- `settings`

For nested APIs:

- `routes.public.signIn`
- `routes.private.dashboard`
- `routes.private.users.detail`

Avoid:

- `routeHelpers`
- `pages`
- `paths`
- names copied from filesystem-only conventions such as `(private)` or `@modal`

#### Routes Folder Style Guide — 11. Imports and exports

The top-level `src/shared/routes/index.ts` should expose the full route API.

Good:

```ts
import { root } from "./root";
import { privateRoutes } from "./private";
import { publicRoutes } from "./public";

export const routes = {
  root,
  private: privateRoutes,
  public: publicRoutes,
};
```

Leaf exports should stay focused:

```ts
export const root = {
  path: () => "/",
};
```

Rules:

- export route objects, not unrelated helpers
- keep each route folder responsible only for its own subtree
- avoid dumping all route definitions into one large file as the app grows

#### Routes Folder Style Guide — 12. Consumption rules

Application code should use route helpers instead of hardcoded strings.

Good:

```tsx
<Link href={routes.root.path()} />
```

```ts
redirect(routes.private.dashboard.path());
```

Avoid:

```tsx
<Link href="/" />
```

```ts
redirect("/dashboard");
```

Use raw strings only for:

- one-off external URLs
- framework configuration where the shared route helper layer is not appropriate

#### Routes Folder Style Guide — 13. Anti-patterns

Avoid:

- leaking route-group syntax into returned URLs
- exposing `@slot` or interceptor syntax in route helpers
- hardcoding app-internal paths across components
- mixing locale prefixes into route helper outputs
- inventing inconsistent helper names instead of `path`
- modeling filesystem structure more literally than the user-facing URL requires

#### Routes Folder Style Guide — 14. Review checklist

Before adding a route helper, check:

- Does this represent a real user-facing URL?
- Should this be modeled in `shared/routes`, or is it only an `app/` filesystem concern?
- Does the helper return the real URL rather than route-group syntax?
- Does a dynamic route accept explicit descriptive parameters?
- Is locale handling correctly left to the navigation layer?
- Will consuming code use this helper instead of a duplicated string?

### 06. Screens Folder Style Guide

This guide defines how to write and organize screen components inside:

- `src/modules/<module-name>/screens`

Use `screens/` for module-level UI entries that sit directly under `page.tsx` and directly above containers. A screen represents one page-level module UI concern, and in this architecture it has a 1-to-1 relationship with `page.tsx`: one `page.tsx` returns one screen directly, and one screen belongs to one `page.tsx`.

#### Screens Folder Style Guide — 1. Decide whether code belongs in `screens`

Put code in a `screens` folder when it does one or more of the following:

- acts as the module-level entry for one page
- assembles one page-shaped UI concern for one `page.tsx`
- binds page-level server inputs to module containers
- defines the top-level composition for one screen, without dropping down into presenter-level details

Examples:

- welcome screen
- profile screen
- checkout screen
- order detail screen

Do **not** put code in `screens` when it belongs somewhere more specific:

- `app/**/page.tsx` for the Next.js route entry file
- `containers/` for logic binding
- `components/` for presenter UI
- `layouts/` for reusable framing around `children`
- `hooks/` for extracted client logic

Rule of thumb:

- if the file is the module-level page UI entry returned by one `page.tsx`, `screens/` is usually correct
- if the file mainly binds logic or mainly renders presenters, it likely belongs in another layer

#### Screens Folder Style Guide — 2. One `page.tsx` -> one screen

Screens have a direct 1-to-1 relationship with `page.tsx`.

Required direction:

- one `page.tsx` returns one screen directly
- one screen belongs to one `page.tsx`

Good direction:

```tsx
// src/app/[locale]/page.tsx
import { ScreenWelcome } from "@/modules/static-pages/screens/screen-welcome";

export default function Page() {
  return <ScreenWelcome />;
}
```

This keeps:

- route-entry concerns in `page.tsx`
- module-level UI assembly in the screen
- logic binding in containers
- rendering details in components

Do not let one `page.tsx` assemble many containers directly. That composition belongs in the screen.

#### Screens Folder Style Guide — 3. Relationship to App Router

This guide stays focused on `screens`, so App Router files are mentioned only enough to define the boundary.

Use `page.tsx` for:

- route entry
- params and search params handoff
- locale setup when required by the route
- redirects or `notFound()` when they belong to the route entry
- returning the screen directly

Keep other App Router segment files in `app/`:

- `layout.tsx`
- `loading.tsx`
- `error.tsx`
- `template.tsx`

Screens should not replace those files. Screens live beneath `page.tsx`, not alongside App Router framework responsibilities.

#### Screens Folder Style Guide — 4. Screens compose containers only

In this architecture, screens compose containers, not presenter components directly.

Required direction:

`page.tsx` -> `screen` -> `container` -> `component`

Keep the responsibility clear:

- `page.tsx` enters the route
- `screen` assembles the module-level page
- `container` binds logic
- `component` presents

Do not let screens:

- render presenter components directly as the primary page assembly pattern
- absorb business logic that belongs in containers, hooks, actions, or lib
- become a second route layer that duplicates `page.tsx`

If a screen starts orchestrating presenter props directly, that usually means a container is missing.

#### Screens Folder Style Guide — 5. Server-first default

Screens should stay server-first by default.

Prefer screens that:

- remain server components unless there is a real reason otherwise
- receive route-boundary inputs from `page.tsx`
- compose containers in a clear top-down way
- avoid owning client interaction logic

Good fits for screens:

- receiving `locale`, params-derived identifiers, or server-safe values from `page.tsx`
- arranging the order of containers on the page
- defining the page-level structure inside the module boundary

Avoid:

- putting `"use client"` on screens by default
- consuming client hooks directly in screens
- turning the screen into a container

If a screen needs client interaction, prefer moving that concern into a container beneath it.

#### Screens Folder Style Guide — 6. Scope and placement

Screens are module-owned.

Use:

- `src/modules/<module-name>/screens`

Do **not** use:

- `src/shared/screens`

Why:

- a screen belongs to one page
- one page belongs to one route entry
- that ownership is inherently module-local

If something becomes reusable across pages or modules, it likely belongs in `layouts/`, `components/`, `hooks/`, or another shared layer instead of `screens/`.

#### Screens Folder Style Guide — 7. File and folder structure

Follow the repository's kebab-case convention for files and folders.

Each public screen should live in its own leaf folder:

```txt
src/modules/static-pages/screens/screen-welcome/
├── index.ts
├── screen-welcome.test.tsx
├── screen-welcome.tsx
└── types.ts

src/modules/profile/screens/screen-profile/
├── index.ts
├── screen-profile.tsx
└── types.ts
```

Rules:

- keep one public screen per folder
- prefix the folder and main implementation file with `screen-`
- add a leaf-level `index.ts` for the public API
- colocate `types.ts` when the screen owns reusable contracts
- keep tests adjacent to the screen they cover
- do not create parent barrel files for `src/modules/<module-name>/screens`
- do not colocate presenter components inside the screen folder unless the repository convention changes

If code inside a screen folder starts splitting into presenter pieces or reusable logic helpers, move those concerns to `components/`, `containers/`, `hooks/`, or another more specific layer.

#### Screens Folder Style Guide — 8. Naming

Use specific kebab-case folder and file names:

- `screen-welcome`
- `screen-profile`
- `screen-checkout`
- `screen-order-detail`

Avoid vague names such as:

- `screen`
- `page-screen`
- `main-screen`
- `content`

For exported symbols:

- use PascalCase names prefixed with `Screen`
- derive the name from the page concern, not from a low-level presenter name

Examples:

- `ScreenWelcome`
- `ScreenProfile`
- `ScreenCheckout`
- `ScreenOrderDetail`

#### Screens Folder Style Guide — 9. Props and API shape

Screens should have small, route-shaped APIs.

Prefer:

- only the inputs that come naturally from `page.tsx`
- props such as `locale`, route params, or route-derived identifiers
- readonly prop typing for object-shaped inputs

Avoid:

- large prop bags passed down from `page.tsx`
- passing many concern-owned actions or data loaders into the screen
- turning the screen into a generic wrapper with no clear page ownership

If many values are being threaded through the screen into a container, reconsider whether the container should import or load more of its own concern-owned dependencies.

#### Screens Folder Style Guide — 10. Examples

##### Screens Folder Style Guide — 10. Examples — Good page entry

```tsx
// src/app/[locale]/page.tsx
import "server-only";

import { use } from "react";
import { setRequestLocale } from "next-intl/server";

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

##### Screens Folder Style Guide — 10. Examples — Good screen direction

```tsx
// src/modules/profile/screens/screen-profile/screen-profile.tsx
import "server-only";

import { Box } from "@chakra-ui/react";

import { ContainerFormProfile } from "@/modules/profile/containers/container-form-profile";
import { ContainerHeaderProfile } from "@/modules/profile/containers/container-header-profile";

import type { ScreenProfileProps } from "./types";

export async function ScreenProfile({ locale }: Readonly<ScreenProfileProps>) {
  return (
    <Box as="main">
      <ContainerHeaderProfile locale={locale} />
      <ContainerFormProfile />
    </Box>
  );
}
```

This keeps the screen focused on page-level assembly while containers own the binding below it.

#### Screens Folder Style Guide — 11. Checklist

Before adding a file to `src/modules/<module-name>/screens`, check:

- does one `page.tsx` return this one screen directly?
- does this one screen belong to one `page.tsx`?
- is the screen composing containers rather than presenter components directly?
- is the screen staying server-first unless there is a real reason not to?
- is the folder name specific and prefixed with `screen-`?
- is the exported symbol a clear `*Screen` name?
- are route-boundary concerns still staying in `page.tsx` or other App Router files?
- are props small and route-shaped rather than a large drilled object?

### 07. Containers Folder Style Guide

This guide defines how to write and organize container components inside:

- `src/modules/<module-name>/containers`

Use `containers/` for module-owned bridge layers that bind logic to presenter components. In this architecture, screens compose containers, and containers compose presenter components. A container is not the home of the business logic itself. Instead, it composes existing hooks, actions, and prepared server data into a UI-facing shape that presenter components can consume cleanly.

#### Containers Folder Style Guide — 1. Decide whether code belongs in `containers`

Put code in a `containers` folder when it does one or more of the following:

- binds prepared logic to one or more presenter components
- coordinates a self-contained interactive UI concern inside one module
- adapts hook outputs into component props
- connects server-provided inputs, actions, or identifiers to client-side interaction
- keeps orchestration out of `components/` while avoiding business logic directly inside the container

Examples:

- a checkout form container that binds a form hook to a presenter form component
- an order filters container that binds URL state and selection logic to filter presenters
- a profile editor container that wires save actions, local draft state, and presenter sections

Do **not** put code in `containers` when it belongs somewhere more specific:

- `app/**` route files for `loading.tsx`, `error.tsx`, `template.tsx`, route `layout.tsx`, metadata, and other route-boundary behavior
- `screens/` for module-level page or route assembly
- `components/` for presenter-only rendering
- `hooks/` for extracted client logic
- `actions/` for server actions
- `lib/` for integrations and architectural services

Rule of thumb:

- if the file mainly binds prepared logic to presenter components, `containers/` is usually correct
- if the file mainly defines the logic itself, it likely belongs in `hooks/`, `actions/`, `lib/`, or another logic-owning layer

#### Containers Folder Style Guide — 2. Containers are module-only

Containers are a feature-level pattern.

Use:

- `src/modules/<module-name>/containers`

Do **not** use:

- `src/shared/containers`

Why:

- containers are usually shaped by one module's workflows, presenter components, and hook APIs
- a container that becomes generic enough for `shared` usually wants to be split into shared components, hooks, or providers instead

Keep ownership local to the module that owns the interaction flow.

#### Containers Folder Style Guide — 3. Reinterpret the pattern for App Router

Containers still make sense in App Router, but they should be reinterpreted for a server-first architecture rather than copied as a purely client-era pattern.

Keep this boundary clear:

- `app/**` owns route-boundary framework features
- `screens/` own module-level UI entry and page assembly
- `containers/` are the required binding layer beneath screens
- `components/` present
- `hooks/` own extracted client logic

Recommended direction:

`app route file` -> `screen` -> `container` -> `component`

That means:

- keep `loading.tsx`, `error.tsx`, `template.tsx`, route `layout.tsx`, metadata, params, redirects, and route validation in `app/`
- keep screens server-first by default
- let screens compose containers rather than presenter components directly
- use server or client containers depending on the binding needs
- do not move route-boundary framework behavior out of `app/`

The pattern still works, but it must be subordinate to App Router rather than competing with it.

#### Containers Folder Style Guide — 4. Server-first default

This repository aims to use server-side Next.js and React 19 features seriously and keep client code minimal.

Because of that:

- do not move server data loading into a client container
- do not turn every container into a client component by default
- do not pull server actions or server data into hooks just to satisfy the container layer

Use a client container when client coordination is truly needed, for example:

- local interactive state
- browser APIs
- optimistic UI
- URL state binding
- client-only interaction hooks
- multi-part presenter coordination that would otherwise leak into components

If the concern is mostly server-side, keep the container as a server component and let it bind server-loaded data or server actions to presenter components without introducing unnecessary client code.

#### Containers Folder Style Guide — 5. Keep business logic out of the container

The container is a bridge, not the business logic owner.

Prefer minimal prop drilling into containers.

Prefer this split:

- `hooks/` own extracted client logic
- `actions/` own server mutations
- `lib/` owns integrations and service boundaries
- `containers/` bind those pieces to presenters

Good container behavior:

- call custom hooks
- select which presenters to render
- map hook outputs into presenter props
- load or import concern-owned inputs when that keeps the container self-contained
- pass prepared values into hooks or presenters
- keep the binding readable and self-contained

Avoid:

- large business rule implementations inside the container
- duplicated domain logic copied from hooks or actions
- integration code directly inside the container
- deeply nested state machines built inline in the container file
- forwarding long prop chains from screen to container when the container can own that concern itself

If the container starts owning the logic instead of binding it, extract that logic out.

#### Containers Folder Style Guide — 6. Relationship with screens, components, and hooks

This guide stays focused on `containers`, so nearby layers are mentioned here only to define the boundary.

##### Containers Folder Style Guide — 6. Relationship with screens, components, and hooks — `screens/`

- screen is the module-level route or page entry
- screen assembles the page and can stay server-first
- screen composes containers, not presenter components directly

##### Containers Folder Style Guide — 6. Relationship with screens, components, and hooks — `components/`

- components are presenter-oriented and logic-light
- components should receive prepared props from the container
- components should not absorb orchestration just because no container exists yet

##### Containers Folder Style Guide — 6. Relationship with screens, components, and hooks — `hooks/`

- hooks hold extracted client logic
- containers consume hooks
- do not define reusable hooks inside the container file

Recommended responsibility split:

- screens assemble
- containers coordinate and bind
- components present
- hooks encapsulate client logic

#### Containers Folder Style Guide — 7. File and folder structure

Follow the repository's kebab-case convention for files and folders.

Each public container should live in its own leaf folder:

```txt
src/modules/checkout/containers/container-checkout-form/
├── container-checkout-form.tsx
├── container-checkout-form.test.tsx
├── index.ts
└── types.ts

src/modules/orders/containers/container-order-filters/
├── container-order-filters.tsx
├── index.ts
└── types.ts
```

Rules:

- keep one public container per folder
- prefix the folder and main implementation file with `container-`
- add a leaf-level `index.ts` for the public API
- colocate `types.ts` when the container owns reusable contracts
- keep tests adjacent to the container they cover
- keep only container-specific adapter helpers inside the same folder
- do not colocate reusable hook definitions inside the container folder
- do not create parent barrel files for `src/modules/<module-name>/containers`

If helper code becomes reusable or grows into real logic ownership, move it to `hooks/`, `utils/`, `actions/`, or `lib/`.

#### Containers Folder Style Guide — 8. Naming

Use specific kebab-case folder and file names:

- `container-checkout-form`
- `container-order-filters`
- `container-profile-editor`

Avoid vague names such as:

- `container`
- `main-container`
- `common-container`
- `wrapper`
- `binding`

For exported symbols:

- use PascalCase names prefixed with `Container`
- derive the name from the concern, not from the route path

Examples:

- `ContainerFormCheckout`
- `ContainerFiltersOrder`
- `ContainerEditorProfile`

#### Containers Folder Style Guide — 9. Client and server boundaries

Containers may be server or client components depending on the binding they perform.

- keep containers as server components by default when they only bind server-fetched data, server actions, or server-safe values to presenter components
- add `"use client"` only when the container consumes hooks, browser APIs, or client-only interaction
- prefer importing concern-owned actions and loading concern-owned server data inside the container when that keeps the container self-contained
- pass only minimal route-boundary inputs into the container when they are truly needed, such as params-derived identifiers
- do not import server-only modules into a client container

Typical server-first pattern:

1. a route file delegates to a module screen
2. the screen renders one or more containers with only the minimal boundary inputs they need
3. the container imports or loads the concern-owned data, actions, and hooks it is responsible for binding
4. the container either binds server-side values directly or consumes hooks when client interaction is needed
5. the container renders presenter components

#### Containers Folder Style Guide — 10. Example direction

##### Containers Folder Style Guide — 10. Example direction — Good server-first flow

```tsx
// screen-checkout.tsx
import { ContainerFormCheckout } from "@/modules/checkout/containers/container-checkout-form";

export async function CheckoutScreen() {
  return <ContainerFormCheckout />;
}
```

```tsx
// container-checkout-form.tsx
"use client";

import { submitCheckoutAction } from "@/modules/checkout/actions/submit-checkout-action";
import { CheckoutForm } from "@/modules/checkout/components/checkout-form";
import { useCheckoutForm } from "@/modules/checkout/hooks/use-checkout-form";
import { useCheckoutInitialValues } from "@/modules/checkout/hooks/use-checkout-initial-values";

export function ContainerFormCheckout() {
  const initialValues = useCheckoutInitialValues();
  const form = useCheckoutForm({ initialValues, submitAction: submitCheckoutAction });

  return <CheckoutForm {...form} />;
}
```

##### Containers Folder Style Guide — 10. Example direction — Good server container direction

```tsx
// screen-profile.tsx
import { ContainerFormProfile } from "@/modules/profile/containers/container-profile-form";

export async function ProfileScreen() {
  return <ContainerFormProfile />;
}
```

```tsx
// container-profile-form.tsx
import { updateProfileAction } from "@/modules/profile/actions/update-profile-action";
import { ProfileForm } from "@/modules/profile/components/profile-form";
import { getProfile } from "@/modules/profile/lib/get-profile";

export async function ContainerFormProfile() {
  const profile = await getProfile();

  return (
    <ProfileForm
      defaultDisplayName={profile.displayName}
      defaultEmail={profile.email}
      submitAction={updateProfileAction}
    />
  );
}
```

```tsx
// profile-form.tsx
import type { ProfileFormProps } from "./types";

export function ProfileForm({
  defaultDisplayName,
  defaultEmail,
  submitAction,
}: Readonly<ProfileFormProps>) {
  return (
    <form action={submitAction}>
      <input defaultValue={defaultDisplayName} name="displayName" />
      <input defaultValue={defaultEmail} name="email" type="email" />
      <button type="submit">Save</button>
    </form>
  );
}
```

This is still a container pattern:

- the screen stays responsible for server loading
- the container binds server data and a server action to a presenter form
- the presenter component renders the form
- no `"use client"` is needed unless client interaction is added later

#### Containers Folder Style Guide — 11. Checklist

Before adding a file to `src/modules/<module-name>/containers`, check:

- does this screen delegate UI binding through a container instead of rendering presenters directly?
- is this concern module-owned rather than shared?
- is the container binding existing logic rather than implementing the business logic itself?
- should the real logic live in `hooks/`, `actions/`, `lib/`, or another folder?
- are App Router route-boundary concerns still staying in `app/`?
- is the folder name specific and prefixed with `container-`?
- is the exported symbol a clear `*Container` name?
- are client boundaries explicit and minimal when `"use client"` is needed?

### 08. Components Folder Style Guide

This guide defines how to write and organize UI components inside:

- `src/shared/components`
- `src/modules/<module-name>/components`

Use `components/` for stateless or presenter-oriented UI pieces. These folders are for components whose main job is rendering, visual composition, and exposing a clear props API, not owning feature orchestration or heavy stateful behavior.

#### Components Folder Style Guide — 1. Decide whether code belongs in `components`

Put code in a `components` folder when it does one or more of the following:

- renders reusable UI
- exposes a presenter-style props API
- focuses mainly on markup, styling, slots, and visual composition
- stays logic-light and does not own broader feature workflows
- can be understood primarily as a view concern

Examples:

- cards, badges, buttons, and section presenters
- empty states, not-found UIs, and error presenters
- visual wrappers used by one screen or across many screens
- small UI pieces that receive prepared data and handlers from callers

Do **not** put code in `components` when it belongs somewhere more specific:

- `containers/` for stateful orchestration and feature wiring
- `screens/` for page-level or route-level UI assembly
- `layouts/` for reusable structural frames around `children`
- `hooks/` for extracted UI logic and hook APIs
- `lib/` for integrations and architectural behavior

Rule of thumb:

- if the file is mostly about how something looks and renders, `components/` is usually correct
- if the file is mostly about how a feature works, it likely belongs outside `components/`

#### Components Folder Style Guide — 2. Presenter-first mindset

`components/` is the home of presenter-style UI.

Prefer components that:

- receive data, state, and handlers through props
- keep view logic close to rendering
- avoid owning multi-step workflows or broad feature rules
- remain easy to preview, test, and reuse

Good fits:

- a `GlassCard` that renders styling and children
- a `SectionHero` that focuses on presenting a hero section
- a `ButtonGoBack` that wraps one interaction behind a simple UI API

Avoid turning components into mini feature controllers.

If state, derived behavior, or side effects start to dominate the file:

- extract logic into `hooks/`
- move orchestration into a `container`
- keep the component focused on presentation

This matches the repository direction that view and logic should be separated even when the extracted logic is only locally reused.

#### Components Folder Style Guide — 3. Boundaries with nearby UI layers

This guide stays focused on `components`, so nearby layers are mentioned here only to define the boundary.

- use `components/` for presenter-oriented rendering units
- use `containers/` for logic binding between screens and presenter components
- use `screens/` for screen-level assembly of containers
- use `layouts/` for reusable structural framing around `children`
- use `hooks/` for extracted UI logic, even when reuse is still local

Recommended flow:

`screen` -> `container` -> `component`

Common variations:

- `layout` -> `screen` -> `container` -> `component`
- `component` -> private child presenter components

Keep the responsibility clear:

- screens assemble
- containers coordinate
- components present
- hooks hold extracted logic
- layouts frame

#### Components Folder Style Guide — 4. Scope and placement

Choose the narrowest valid scope first.

##### Components Folder Style Guide — 4. Scope and placement — `src/modules/<module-name>/components`

Prefer module-level components when the UI is owned by one feature module.

Good fits:

- marketing sections for one module
- checkout presenters used only by checkout flows
- feature-specific cards, filters, and visual widgets

Examples:

- `src/modules/static-pages/components/section-hero/`
- `src/modules/orders/components/order-summary-card/`

##### Components Folder Style Guide — 4. Scope and placement — `src/shared/components`

Promote a component to shared only when it is truly cross-module or app-wide.

Good fits:

- reusable error presenters
- shared loading or not-found UI
- generic visual building blocks used by unrelated modules

Examples:

- `src/shared/components/error-boundary/`
- `src/shared/components/not-found/`

Avoid moving feature-owned UI into `shared` too early. Promote only when:

- multiple unrelated modules use the component
- the props API is generic rather than feature-branded
- shared ownership is clearer than module ownership

#### Components Folder Style Guide — 5. File and folder structure

Follow the repository's kebab-case convention for files and folders.

Each public component should live in its own leaf folder:

```txt
src/shared/components/not-found/
├── button-go-back.tsx
├── not-found.stories.tsx
├── index.ts
├── not-found.tsx
└── types.ts

src/modules/static-pages/components/section-hero/
├── copy-command.tsx
├── index.ts
├── section-hero.stories.tsx
├── section-hero.test.tsx
├── section-hero.tsx
├── types.ts
└── constants.ts
```

Rules:

- keep one public component per folder
- name the folder and main implementation file the same
- add a leaf-level `index.ts` for the public API
- colocate `types.ts` when the component owns reusable contracts
- colocate Storybook files such as `component-name.stories.tsx` in the same component folder
- keep tests adjacent to the component they cover
- allow private child components inside the same folder when they only support that component
- allow colocated `constants.ts` when the values belong only to that component folder
- do not create parent barrel files for `src/shared/components` or `src/modules/<module-name>/components`

If a helper file becomes broadly reusable or logic-heavy, move it to a more appropriate folder instead of letting the component folder become a grab bag.

#### Components Folder Style Guide — 6. Naming

Use specific kebab-case folder and file names:

- `glass-card`
- `section-hero`
- `error-boundary`
- `not-found`

Avoid vague names such as:

- `component`
- `common`
- `shared`
- `widget`
- `thing`

For exported symbols:

- use PascalCase component names derived from the file name
- name the public component after what it presents, not where it happens to be used
- use `Props` suffixes for prop types when exported

Examples:

- `GlassCard`
- `SectionHero`
- `ErrorBoundary`
- `NotFound`
- `SectionHeroProps`

#### Components Folder Style Guide — 7. Props and API design

Presenter components should have clear, explicit inputs.

Prefer:

- props that describe rendered content and interaction hooks
- narrow, meaningful prop names
- composition through `children` when it improves flexibility
- readonly prop typing for object-shaped props

Avoid:

- huge prop bags that mirror internal implementation details
- leaking container or screen responsibilities into the component API
- making callers understand internal state machinery just to render the component

Good presenter API direction:

```ts
interface EmptyStateProps {
  description: string;
  heading: string;
  onRetry?: () => void;
}
```

Prefer component APIs that still read clearly when imported into another folder.

#### Components Folder Style Guide — 8. Client and server boundaries

Components can be server or client components, but they should stay presenter-oriented in either case.

- use server components by default when the component only needs server-safe rendering
- add `"use client"` only when the component needs hooks, browser APIs, or client-only interactivity
- add `import "server-only";` when a component must stay server-only
- do not pull client-only behavior into a server component just for convenience
- do not keep heavy client state in a presenter component when a hook or container would make the boundary clearer

Examples from the repository:

- `section-hero.tsx` is a server component focused on presentation
- `button-go-back.tsx` is a client component because it uses a navigation hook
- `not-found.tsx` stays server-oriented and delegates one client interaction to a child presenter

#### Components Folder Style Guide — 9. Styling and implementation detail boundaries

Components may own their local styling details.

Good fits inside a component folder:

- Chakra props and composition
- CSS Modules used only by that component
- small visual constants used only by that component
- private child presenters

Move code out when:

- styles are global cross-cutting concerns -> `shared/styles`
- values become broader than one component folder -> `constants/`
- logic becomes reusable or test-heavy -> `hooks/` or `utils/`

#### Components Folder Style Guide — 10. Examples

##### Components Folder Style Guide — 10. Examples — Good shared presenter component

```tsx
// src/shared/components/not-found/not-found.tsx
export async function NotFound() {
  return <Flex minH="100vh">...</Flex>;
}
```

##### Components Folder Style Guide — 10. Examples — Good module presenter component

```tsx
// src/modules/static-pages/components/glass-card/glass-card.tsx
export function GlassCard({ children, ...props }: Readonly<GlassCardProps>) {
  return <Box {...props}>{children}</Box>;
}
```

##### Components Folder Style Guide — 10. Examples — Better extracted out of a component

- search-param state management
- form workflow orchestration
- async mutation handling
- cross-component selection state

These concerns usually belong in a hook or container, with the component receiving the prepared values and callbacks.

#### Components Folder Style Guide — 11. Checklist

Before adding a file to `shared/components` or `modules/<module-name>/components`, check:

- is this primarily a presenter or stateless UI concern?
- is `components/` a clearer home than `containers/`, `screens/`, `layouts/`, or `hooks/`?
- is the scope correct: module first, shared only when truly cross-module?
- does the component folder expose one public component?
- are file names specific and kebab-case?
- is the props API clear and presenter-oriented?
- should extracted logic live in a hook or container instead?
- are client and server boundaries explicit and minimal?

### 09. Actions Folder Style Guide

This guide defines how to write and organize server actions inside:

- `src/shared/actions`
- `src/modules/<module-name>/actions`

Use `actions/` for Next.js server actions built on the repository’s safe-action layer. These folders are the home of action definitions, not of action infrastructure.

#### Actions Folder Style Guide — 1. Decide whether code belongs in `actions`

Put code in an `actions` folder when it does one or more of the following:

- defines a server action
- exposes a mutation or server-side command for UI or server consumers
- validates action input before executing server-side behavior
- represents an application action boundary rather than a reusable service helper

Examples:

- submit form actions
- profile update actions
- checkout submit actions
- error reporting actions

Do **not** put code in `actions` when it belongs somewhere more specific:

- `lib/` for safe-action setup, integrations, and reusable service boundaries
- `schemas/` for validation contracts
- `hooks/` for client logic
- `containers/` for binding actions to UI
- `components/` for presenter rendering

Rule of thumb:

- if the file defines a callable server action boundary, `actions/` is usually correct
- if the file mainly supports actions rather than being an action itself, it likely belongs elsewhere

#### Actions Folder Style Guide — 2. Server actions only

Action implementation files should be server actions.

Required direction:

```ts
"use server";
```

Use `"use server";` at the top of the main action implementation file.

Do not put client components, client hooks, or browser-only logic in an action file.

If a flow needs client interaction:

- keep the action in `actions/`
- consume it from a container, hook, or screen
- keep the client logic outside the action definition

#### Actions Folder Style Guide — 3. Use the repository safe-action clients

This repository uses `next-safe-action` through shared wrappers in `@/shared/lib/safe-action`.

Use:

- `actionClient` as the default action client
- `authActionClient` when the action requires authenticated context

Good direction:

```ts
"use server";

import { actionClient } from "@/shared/lib/safe-action";
import { updateProfileSchema } from "@/shared/schemas/update-profile.schema";

export const updateProfileAction = actionClient
  .inputSchema(updateProfileSchema)
  .action(async ({ parsedInput }) => {
    // ...
  });
```

Authenticated direction:

```ts
"use server";

import { authActionClient } from "@/shared/lib/safe-action";

export const submitPrivateAction = authActionClient.action(async () => {
  // ...
});
```

Do not recreate safe-action clients inside `actions/`. That infrastructure belongs in `shared/lib/safe-action`.

#### Actions Folder Style Guide — 4. Scope and placement

Choose the narrowest valid scope first.

##### Actions Folder Style Guide — 4. Scope and placement — `src/modules/<module-name>/actions`

Prefer module-level actions when the mutation or command is owned by one feature module.

Good fits:

- checkout submit action
- profile update action
- order cancel action
- feature-local draft save action

Examples:

- `src/modules/checkout/actions/submit-checkout-action/`
- `src/modules/profile/actions/update-profile-action/`

##### Actions Folder Style Guide — 4. Scope and placement — `src/shared/actions`

Promote an action to shared only when it is truly cross-module or app-wide.

Good fits:

- shared error reporting action
- app-wide telemetry action
- shared support or feedback action used by unrelated modules

Examples:

- `src/shared/actions/report-error-action/`

Avoid moving feature-owned actions into `shared` too early. Promote only when:

- multiple unrelated modules need the same action
- the action’s language is generic rather than feature-specific
- shared ownership is clearer than module ownership

#### Actions Folder Style Guide — 5. Keep actions focused

An action should define one clear server-side command boundary.

Prefer:

- one action concern per folder
- explicit input schema usage
- calling reusable lib functions from inside the action
- returning a clear, intentional result shape

Avoid:

- large service orchestration embedded directly in the action
- multiple unrelated actions in one folder
- skipping input validation when a schema should exist
- hiding action behavior across many unclear helper layers

Good action behavior:

- validate input
- call domain or infrastructure helpers
- return an intentional result
- surface failures through the repository’s action/error patterns

If the action starts becoming a service layer, extract the reusable logic into `lib/` and keep the action as the thin boundary.

#### Actions Folder Style Guide — 6. File and folder structure

Follow the repository's kebab-case convention for files and folders.

Each public action should live in its own leaf folder:

```txt
src/shared/actions/report-error-action/
├── index.ts
├── report-error-action.test.ts
└── report-error-action.ts

src/modules/profile/actions/update-profile-action/
├── index.ts
├── types.ts
├── update-profile-action.test.ts
└── update-profile-action.ts
```

Rules:

- keep one public action per folder
- name the folder and main implementation file the same
- add a leaf-level `index.ts` for the public API
- colocate `types.ts` only when the action folder owns reusable contracts
- keep tests adjacent to the action they cover
- do not create parent barrel files for `src/shared/actions` or `src/modules/<module-name>/actions`

If an action needs helper code:

- keep tiny action-specific helpers inside the folder only when they are private and truly local
- move reusable helpers to `lib/`, `utils/`, or `schemas/` as appropriate

#### Actions Folder Style Guide — 7. Naming

Use specific kebab-case folder and file names:

- `report-error-action`
- `update-profile-action`
- `submit-checkout-action`
- `cancel-order-action`

Avoid vague names such as:

- `action`
- `server-action`
- `common-action`
- `submit`
- `handler`

For exported symbols:

- use camelCase names ending with `Action`
- derive the name from the domain command

Examples:

- `reportErrorAction`
- `updateProfileAction`
- `submitCheckoutAction`
- `cancelOrderAction`

#### Actions Folder Style Guide — 8. Inputs, schemas, and return shape

Prefer explicit input schemas for action contracts.

Good direction:

- define the validation schema in `schemas/`
- import the schema into the action
- use `.inputSchema(...)`
- rely on `parsedInput` inside the action body

Example:

```ts
export const reportErrorAction = actionClient
  .inputSchema(reportErrorSchema)
  .action(async ({ parsedInput }) => {
    reportError(new Error(parsedInput.message));
  });
```

Prefer action outputs that are:

- small
- explicit
- shaped for the caller’s needs

Avoid large, ambiguous return objects when the caller only needs a narrow success result.

#### Actions Folder Style Guide — 9. Boundaries with other folders

This guide stays focused on `actions`, so nearby layers are mentioned here only to define the boundary.

- use `actions/` for server action definitions
- use `lib/` for safe-action setup, integrations, and reusable service logic
- use `schemas/` for validation schemas
- use `containers/` to bind actions to UI
- use `hooks/` for client interaction logic around actions
- use `screens/` and `components/` to consume actions through the correct UI layers, not to define them

Recommended direction:

`action` -> `container` -> `component`

The action defines the server boundary. The container binds it into the UI flow.

#### Actions Folder Style Guide — 10. Examples

##### Actions Folder Style Guide — 10. Examples — Good shared action

```ts
"use server";

import { reportError } from "@/shared/lib/error-reporter";
import { actionClient } from "@/shared/lib/safe-action";
import { reportErrorSchema } from "@/shared/schemas/report-error.schema";

export const reportErrorAction = actionClient
  .inputSchema(reportErrorSchema)
  .action(async ({ parsedInput }) => {
    reportError(new Error(parsedInput.message), {
      boundary: parsedInput.boundary,
      digest: parsedInput.digest,
      meta: parsedInput.meta,
    });
  });
```

##### Actions Folder Style Guide — 10. Examples — Good authenticated module action

```ts
"use server";

import { authActionClient } from "@/shared/lib/safe-action";
import { updateProfileSchema } from "@/modules/profile/schemas/update-profile.schema";
import { updateProfile } from "@/modules/profile/lib/update-profile";

export const updateProfileAction = authActionClient
  .inputSchema(updateProfileSchema)
  .action(async ({ parsedInput }) => {
    return updateProfile(parsedInput);
  });
```

#### Actions Folder Style Guide — 11. Checklist

Before adding a file to `src/shared/actions` or `src/modules/<module-name>/actions`, check:

- is this actually a server action boundary?
- does the implementation file start with `"use server";`?
- is the scope correct: module first, shared only when truly cross-module?
- should this use `actionClient` or `authActionClient`?
- is the folder name specific and kebab-case?
- is the exported symbol a clear camelCase `*Action` name?
- should validation live in `schemas/` instead of inline?
- does reusable logic belong in `lib/` instead of inside the action body?

### 10. Lib Folder Style Guide

This guide defines how to write and organize code inside:

- `src/shared/lib`
- `src/modules/<module-name>/lib`

Use `lib` for infrastructure-oriented, integration-oriented, and architecture-significant code. These folders are for the parts of the app that wrap frameworks, connect to external systems, establish runtime behavior, or provide shared operational building blocks.

#### Lib Folder Style Guide — 1. Decide whether code belongs in `lib`

Put code in a `lib` folder when it does one or more of the following:

- wraps a framework or platform API
- defines a reusable service boundary or client boundary
- owns cross-cutting application behavior
- centralizes integration logic for HTTP, logging, navigation, auth, or error handling
- performs runtime setup with architectural meaning
- provides domain-aware or infrastructure-aware helpers that are too important to treat as generic utilities

Examples from the current repository:

- `fetcher/` for API client behavior
- `errors/` for the app error hierarchy and error helpers
- `safe-action/` for next-safe-action setup
- `navigation/` for locale-aware navigation wrappers
- `logger/` for logging setup
- `error-reporter/` for server-side reporting
- `dayjs/` for shared date/runtime configuration

Do **not** put code in `lib` when it belongs somewhere more specific:

- `utils/` for small framework-light transforms, formatters, parsers, guards, and normalization helpers
- `schemas/` for Zod validation contracts
- `actions/` for server actions
- `config/` for static configuration values and env setup
- `constants/` for static constants
- component, screen, or hook folders for UI-owned behavior

Rule of thumb:

- If the code mainly transforms values, it is probably a `utils` concern.
- If the code owns integration boundaries, runtime behavior, or app architecture, it is probably a `lib` concern.

#### Lib Folder Style Guide — 2. Scope and placement

Choose the narrowest valid scope first.

##### Lib Folder Style Guide — 2. Scope and placement — `src/modules/<module-name>/lib`

Prefer module-level lib code when the integration or service boundary is owned by one module.

Good fits:

- module-specific API clients
- module-specific orchestration around external services
- module-owned domain service helpers with architectural weight
- feature-local wrappers around shared infrastructure

Examples:

- `src/modules/billing/lib/billing-client/`
- `src/modules/orders/lib/order-sync/`

##### Lib Folder Style Guide — 2. Scope and placement — `src/shared/lib`

Promote lib code to `shared` only when it is truly cross-module or foundational to the application.

Good fits:

- app-wide error abstractions
- shared fetch or logging layers
- shared navigation wrappers
- shared runtime setup used across features
- shared integration primitives that multiple modules build on

Examples:

- `src/shared/lib/errors/`
- `src/shared/lib/fetcher/`
- `src/shared/lib/logger/`

Avoid moving module-owned lib code to `shared` too early. Promote only when:

- multiple unrelated modules depend on it
- the language is generic and not feature-specific
- it represents a real shared architectural boundary

#### Lib Folder Style Guide — 3. Organize by architectural concern

Each top-level lib folder should represent one architectural concern, not a miscellaneous collection.

Good:

- `fetcher`
- `errors`
- `safe-action`
- `navigation`
- `error-reporter`

Avoid:

- `helpers`
- `common`
- `shared`
- `misc`
- `services`

The folder name should explain the concern from the path alone.

#### Lib Folder Style Guide — 4. File and folder structure

Follow the project's kebab-case convention for files and folders.

##### Lib Folder Style Guide — 4. File and folder structure — Simple lib module

Use a dedicated leaf folder with a narrow public API.

```txt
src/shared/lib/navigation/
├── index.ts
└── navigation.ts

src/modules/billing/lib/billing-client/
├── billing-client.ts
├── index.ts
├── types.ts
└── billing-client.test.ts
```

Recommended rules:

- keep one architectural concern per lib folder
- name the main implementation file after the concern or public API
- add a leaf-level `index.ts` for that folder's public API
- keep tests adjacent to the code they cover
- use `types.ts`, `constants.ts`, or `helpers.ts` only when they materially improve clarity

##### Lib Folder Style Guide — 4. File and folder structure — Complex lib module

Allow internal subfolders when one architectural concern naturally contains multiple related public pieces.

```txt
src/shared/lib/errors/
├── app-error.ts
├── index.ts
├── types.ts
├── authentication/
├── domain/
├── helpers/
├── http/
└── infrastructure/
```

This is appropriate only when the folder is still one cohesive boundary.

Use internal subfolders when:

- the concern contains multiple closely related concepts
- flat files would become noisy or unclear
- the public API still reads as one coherent lib module

Do **not** use subfolders to hide unrelated code under one broad bucket.

##### Lib Folder Style Guide — 4. File and folder structure — Parent barrels

Do not create parent barrel files for:

- `src/shared/lib`
- `src/modules/<module-name>/lib`

Keep barrel exports at the leaf level only.

#### Lib Folder Style Guide — 5. Public API design

A lib folder should expose a small, intentional public API.

- export stable entry points from the folder's `index.ts`
- keep internal helpers private unless they are part of the real contract
- export types separately with `export type`
- avoid `export *` when it weakens the boundary
- prefer named exports over default exports

Good:

```ts
export { fetchClient } from "./fetch-client";
export { swrFetcher } from "./swr-fetcher";

export type { FetchClientOptions } from "./types";
```

Avoid:

```ts
export * from "./constants";
export * from "./helpers";
export * from "./internal-impl";
```

Helpers and constants may exist inside a lib folder, but they are implementation details unless they are deliberately part of the contract.

#### Lib Folder Style Guide — 6. Naming

Name lib code after what architectural role it plays.

Prefer:

- `fetch-client.ts`
- `auth-action-client.ts`
- `error-reporter.ts`
- `create-file-logger.ts`
- `app-error.ts`
- `business-rule-error.ts`

Avoid:

- `lib.ts`
- `helpers.ts` as the main public file
- `service.ts` without a meaningful domain
- `manager.ts`
- `base.ts`

For exported symbols:

- use noun names for stable instances or wrappers: `logger`, `dayjs`, `actionClient`
- use verb names for operations: `fetchClient`, `reportError`
- use `create*` for factories: `createFileLogger`
- use `is*` for guards
- use `assert*` for invariant helpers that throw
- use `*Error` for custom error classes

Names should make sense when imported from another folder.

#### Lib Folder Style Guide — 7. Side effects and runtime boundaries

Lib code may contain side effects when those side effects are the point of the abstraction, but keep them explicit and contained.

Good examples:

- configuring a shared runtime instance such as `dayjs`
- creating a logging client once
- wrapping server-only integrations

Rules:

- keep side effects close to the integration boundary
- do not spread implicit runtime setup across unrelated files
- prefer one obvious entry point for environment-sensitive behavior
- make server-only boundaries explicit with `import "server-only"` when the module must never enter client bundles
- do not import Node-only modules into code that should be browser-safe

Use `import "server-only"` for modules such as:

- filesystem-backed loggers
- server-side error reporting
- database access
- secret-dependent integrations

If a lib concern must support both server and client environments:

- keep the shared contract small
- isolate environment-specific branches near the boundary
- avoid leaking browser/server checks throughout consumers

#### Lib Folder Style Guide — 8. Function and module design

Lib code should be cohesive, explicit, and boundary-oriented.

- keep one primary responsibility per file
- separate public API, helpers, constants, and types when it improves readability
- prefer dependency injection through parameters or options when it clarifies the boundary
- avoid mixing unrelated concerns such as transport, formatting, fallback policy, and UI logic in one file
- keep framework-specific code wrapped inside lib instead of spreading it across feature code

Good:

- one file for a fetch client
- one file for error serialization
- one file for safe-action client creation

Avoid:

- a single file that both fetches data, formats it for UI, logs analytics, and mutates route state

#### Lib Folder Style Guide — 9. TypeScript rules

Match the repository's strict TypeScript style.

- type public parameters and return values clearly
- prefer `unknown` over `any` at boundaries with untrusted input
- use `import type` for type-only imports
- keep lib-owned object contracts in local `types.ts` when the folder owns them
- use `interface` for object-shaped public contracts such as options and metadata records
- use `type` for unions, inferred schema types, and other alias-friendly shapes
- avoid unsafe casts; prefer guards, assertions, and explicit normalization

Good fits for lib-local `types.ts`:

- client options
- logger metadata
- serialized error shapes
- module-specific integration contracts

Do not move lib-owned types into `src/shared/types` unless they become truly cross-cutting and are no longer clearly owned by one lib folder.

#### Lib Folder Style Guide — 10. Error handling

Lib code should surface failures clearly and preserve useful context.

- prefer explicit failures over silent fallback behavior
- validate boundary assumptions early
- wrap infrastructure failures in meaningful app errors when the abstraction owns that responsibility
- preserve original causes when rethrowing
- include operational context that helps debugging, such as method, URL, digest, or boundary metadata

When the lib concern participates in application error handling, reuse the existing `AppError` hierarchy.

Good fits:

- `FetchError` for HTTP boundary failures
- `BusinessRuleError` for rule assertions
- infrastructure-specific errors for service wrappers

Be careful with catch blocks:

- catch at the boundary where you can add value
- do not swallow errors silently
- only provide fallback behavior when it is an intentional part of the contract

A deliberate fallback can be acceptable at an infrastructure boundary, for example switching to a simpler logger transport when the filesystem is unavailable. If you do this, keep the behavior explicit and narrow.

#### Lib Folder Style Guide — 11. Imports

- use relative imports within the same lib folder
- use the `@/*` alias for cross-folder imports
- keep dependency direction clear: consumers import from a lib folder's public API, not from its internals, unless they are part of the same folder
- avoid deep imports into another lib folder's internal files

Good:

```ts
import { env } from "@/shared/config/env";
import { handleServerError } from "./helpers";
```

Avoid:

```ts
import { someInternalHelper } from "@/shared/lib/fetcher/helpers";
```

unless both files are part of the same owned lib boundary and the deep import is intentionally internal.

#### Lib Folder Style Guide — 12. Testing

Every non-trivial lib module should have adjacent tests.

- use Vitest
- keep tests close to the implementation
- name tests after the file they cover
- test the public contract and boundary behavior
- cover both success and failure paths
- mock external systems at the boundary instead of testing vendor internals

Typical lib tests should cover:

- happy paths
- environment-specific branches when they exist
- thrown errors and wrapped errors
- retry, fallback, or serialization behavior when applicable
- public API behavior rather than private helper details

For server-only lib code, mock server-only dependencies explicitly and test the contract, not the platform implementation.

#### Lib Folder Style Guide — 13. Example patterns

##### Lib Folder Style Guide — 13. Example patterns — Good shared lib concern

```txt
src/shared/lib/fetcher/
├── constants.ts
├── fetch-client.ts
├── fetch-client.test.ts
├── helpers.ts
├── helpers.test.ts
├── index.ts
├── swr-fetcher.ts
├── swr-fetcher.test.ts
└── types.ts
```

Why it fits:

- one cohesive concern
- clear public entry point
- support files stay inside the boundary
- tests sit next to the behavior they validate

##### Lib Folder Style Guide — 13. Example patterns — Good complex shared lib concern

```txt
src/shared/lib/errors/
├── app-error.ts
├── index.ts
├── types.ts
├── authentication/
├── domain/
├── helpers/
├── http/
└── infrastructure/
```

Why it fits:

- one architectural boundary
- internal segmentation reflects related error categories
- public API is still intentional through the leaf `index.ts`

##### Lib Folder Style Guide — 13. Example patterns — Good module lib concern

```txt
src/modules/orders/lib/order-sync/
├── index.ts
├── order-sync.ts
├── order-sync.test.ts
└── types.ts
```

Why it fits:

- owned by one module
- clearly not generic enough for `shared`
- architecture-significant enough to be more than a utility

#### Lib Folder Style Guide — 14. Final checklist

Before placing code in `lib`, check:

- does it represent an integration boundary, runtime boundary, or architectural service?
- is `lib` a better fit than `utils`, `actions`, `schemas`, `config`, or UI-owned code?
- is the scope correct: module first, shared only when truly cross-cutting?
- is the folder named after one clear concern?
- is the public API small and intentional?
- are side effects and server-only boundaries explicit?
- are types, errors, and tests handled as part of the contract?

### 11. Messages Folder Style Guide

This guide defines how to write and organize translation messages inside:

- `src/messages`

Use `messages/` for the repository's `next-intl` message source. This folder owns locale-specific translation content and the aggregation shape that is loaded by the i18n request config.

Message placement should follow the owning UI layer as closely as practical. That owner might be a screen, component, container, hook, layout, or another clear UI concern.

#### Messages Folder Style Guide — 1. Decide whether content belongs in `messages`

Put content in `src/messages` when it does one or more of the following:

- provides user-facing translated copy
- defines locale-specific text for UI, validation, status labels, or content blocks
- contributes to the `next-intl` messages object loaded at request time
- is referenced through `getTranslations(...)` or `useTranslations(...)`

Examples:

- button labels
- form validation text
- empty-state copy
- screen headings and descriptions
- shared component copy

Do **not** put content in `messages` when it belongs somewhere more specific:

- `constants/` for non-translated constant values
- `config/` for i18n setup, routing, formats, and request configuration
- `schemas/` for validation rules themselves
- `components/`, `containers/`, or `screens/` for rendering logic
- `lib/` for reusable helpers and integrations

Rule of thumb:

- if the value is user-facing copy that changes by locale, it belongs in `messages/`
- if the value is behavior, structure, or configuration, it belongs elsewhere

#### Messages Folder Style Guide — 2. Locale-first structure

Organize `src/messages` by locale first.

Current repository direction:

```txt
src/messages/
├── index.ts
├── en/
│   ├── index.ts
│   ├── common/
│   ├── modules/
│   └── shared/
└── th/
    ├── index.ts
    ├── common/
    ├── modules/
    └── shared/
```

Rules:

- keep each locale in its own top-level folder
- keep the same structural shape across locales
- aggregate each locale through a locale `index.ts`
- aggregate the whole folder through `src/messages/index.ts`
- do not mix multiple locales in one file

This matches the current runtime loading shape:

```ts
messages[locale]
```

and the current type-safety setup where Thai is the source of truth for `Messages`.

#### Messages Folder Style Guide — 3. Top-level namespace ownership

Each locale currently exposes three top-level namespaces:

- `common`
- `shared`
- `modules`

Use them intentionally.

##### Messages Folder Style Guide — 3. Top-level namespace ownership — `common`

Use `common/` for app-wide vocabulary reused broadly across unrelated features.

Good fits:

- actions
- validation
- status
- pagination
- datetime

Examples:

- `src/messages/en/common/actions.json`
- `src/messages/th/common/validation.json`

##### Messages Folder Style Guide — 3. Top-level namespace ownership — `shared`

Use `shared/` for translations owned by shared cross-cutting UI or shared app concerns.

Good fits:

- shared component copy
- shared layout copy
- shared provider-related UI text

Examples:

- `src/messages/en/shared/components/not-found.json`
- `src/messages/th/shared/components/error.json`

##### Messages Folder Style Guide — 3. Top-level namespace ownership — `modules`

Use `modules/` for feature-owned translations.

Good fits:

- screen copy for a module
- module-specific forms
- feature-specific empty states
- content owned by one feature area
- owner-aligned copy for module screens, components, containers, hooks, or layouts

Examples:

- `src/messages/en/modules/static-pages/components/section-hero.json`
- `src/messages/th/modules/profile/screens/screen-edit-profile.json`

Avoid putting module-owned copy under `shared` just because multiple files inside one module reuse it. Shared means cross-module ownership, not merely repeated usage.

Within a module, do not centralize unrelated owners into one catch-all message file just to reduce duplication. If `SectionHero` renders the copy, keep that copy under the `section-hero` ownership path unless it clearly belongs in an existing broader namespace such as `common`.

#### Messages Folder Style Guide — 4. Mirror locales exactly

Locales should stay structurally aligned.

Required direction:

- if a namespace exists in `th`, create the same namespace in `en`
- if a JSON file exists in one locale, create the same file in the other locale
- if a key exists in one locale, create the same key in the other locale
- keep interpolation placeholders aligned across locales

Good direction:

```txt
src/messages/en/modules/profile/screens/screen-edit-profile.json
src/messages/th/modules/profile/screens/screen-edit-profile.json
```

Bad direction:

- add a new file only in one locale
- add extra keys in one locale without updating the other
- rename a namespace only in one locale
- change `{count}` to `{total}` in one locale but not the other

This matters because:

- runtime loading expects a consistent shape
- Thai currently defines the `Messages` type shape
- mismatched placeholders create broken translations even when keys exist

#### Messages Folder Style Guide — 5. Namespace path should match folder structure

The namespace used in code should reflect the message object path.

Current examples:

- `modules.staticPages.components.sectionHero`
- `shared.components.notFound`
- `shared.components.error`

The path mapping should stay straightforward:

```txt
src/messages/en/modules/static-pages/components/section-hero.json
→ modules.staticPages.components.sectionHero

src/messages/en/shared/components/not-found.json
→ shared.components.notFound

src/messages/en/common/actions.json
→ common.actions
```

Rules:

- use folder structure to express ownership and grouping
- use the final JSON filename as the final namespace segment
- keep namespace depth meaningful, not arbitrary
- do not invent code namespaces that do not match the aggregation shape
- keep the namespace aligned with the actual owner that renders the copy

If you need a namespace like:

```ts
useTranslations("modules.profile.screens.screenEditProfile")
```

then the locale structure should read like:

```txt
src/messages/<locale>/modules/profile/screens/screen-edit-profile.json
```

with matching locale index aggregation.

#### Messages Folder Style Guide — 6. Use aggregation indexes intentionally

This repository uses `index.ts` files to build the message object shape. Keep those indexes explicit and predictable.

Examples from the current structure:

```ts
import { common } from "./common";
import { modules } from "./modules";
import { shared } from "./shared";

export const en = {
  common,
  modules,
  shared,
};
```

```ts
import error from "./error.json";
import notFound from "./not-found.json";

export const components = {
  error,
  notFound,
};
```

Rules:

- add an `index.ts` at each folder level that contributes a public message object
- keep aggregation explicit rather than dynamic
- mirror aggregation shape across locales
- use object property names that become the namespace segments used in code

Do not:

- skip an index where a folder needs to export grouped messages
- build message objects with opaque dynamic filesystem tricks
- let one locale export a different object structure than another

#### Messages Folder Style Guide — 7. JSON file naming

Use kebab-case JSON filenames.

Good names:

- `not-found.json`
- `screen-edit-profile.json`
- `order-summary.json`
- `section-hero.json`
- `actions.json`

Avoid vague or overly broad names such as:

- `data.json`
- `text.json`
- `labels.json`
- `misc.json`
- `stuff.json`

Name the file after the UI surface or concern it owns.

Rule of thumb:

- if the namespace reads clearly in code, the file name is probably good

#### Messages Folder Style Guide — 8. Translation key naming

Inside JSON files, use stable camelCase keys.

Good examples from the current repository:

- `heading`
- `description`
- `goHome`
- `goBack`
- `feature1Title`
- `feature1Description`
- `copyright`

Rules:

- use camelCase for keys
- keep keys stable and descriptive
- group related keys by concern, not by sentence order alone
- prefer semantic names over purely positional names
- keep placeholder names explicit and stable

Prefer:

- `emptyTitle`
- `emptyDescription`
- `submitButton`
- `copyright`
- `successMessage`

Avoid:

- `text1`
- `line2`
- `labelA`
- `message`
- `value`

For repeated structured sections, a numbered pattern is acceptable only when the UI is truly a fixed ordered set and clearer naming would not improve understanding.

Acceptable example:

- `feature1Title`
- `feature1Description`

Prefer a semantic grouping shape when the section has durable identities:

- `performanceTitle`
- `performanceDescription`

#### Messages Folder Style Guide — 9. Keep messages content-only

JSON message files should contain translation content, not logic.

Keep message files limited to:

- plain strings
- interpolation placeholders such as `{year}` or `{count}`
- message groupings represented by the file boundary and namespace shape

Do not put these concerns in JSON messages:

- rendering logic
- HTML structure assumptions that belong in components
- behavior flags
- environment-specific configuration
- duplicated domain rules already defined elsewhere

Rich text support should stay compatible with the repository's shared default translation values:

- `<b>`
- `<i>`
- `<br>`

That setup belongs in i18n config, not in the messages folder itself.

#### Messages Folder Style Guide — 10. Placeholder and rich-text consistency

When using interpolation or rich text:

- use the same placeholder names in every locale
- keep the same semantic meaning across locales
- only use supported rich-text tags already configured by the app

Good direction:

```json
{
  "copyright": "© {year} Next.js Template. All rights reserved."
}
```

paired with the same `{year}` placeholder in every locale.

Avoid:

- `{year}` in one locale and `{currentYear}` in another
- ad hoc tag names that the request config does not provide
- embedding component concerns into translation structure

#### Messages Folder Style Guide — 11. Shared vs module ownership

Choose the narrowest valid ownership first.

##### Messages Folder Style Guide — 11. Shared vs module ownership — Put messages under `modules/` when

- the copy belongs to one feature module
- the text is specific to one screen, flow, or feature-local component
- another module would not naturally reuse the namespace

##### Messages Folder Style Guide — 11. Shared vs module ownership — Put messages under `shared/` when

- the copy belongs to shared UI used across unrelated modules
- ownership is clearly cross-cutting
- the namespace remains generic outside any one module

##### Messages Folder Style Guide — 11. Shared vs module ownership — Put messages under `common/` when

- the text is generic vocabulary reused across the app
- the wording is not owned by one component or one module

Do not promote feature copy into `shared` or `common` too early. Repetition inside one module is still module ownership.

#### Messages Folder Style Guide — 12. Example structure

Feature-owned messages:

```txt
src/messages/en/modules/static-pages/
├── components/
│   ├── section-hero.json
│   └── index.ts
└── index.ts

src/messages/th/modules/static-pages/
├── components/
│   ├── section-hero.json
│   └── index.ts
└── index.ts
```

with namespace usage:

```ts
const t = useTranslations("modules.staticPages.components.sectionHero");
```

Shared component messages:

```txt
src/messages/en/shared/components/
├── error.json
├── not-found.json
└── index.ts
```

with namespace usage:

```ts
const t = useTranslations("shared.components.notFound");
```

Common app vocabulary:

```txt
src/messages/en/common/
├── actions.json
├── validation.json
└── index.ts
```

with namespace usage:

```ts
const t = useTranslations("common.actions");
```

#### Messages Folder Style Guide — 13. Checklist

Before adding or changing messages, check:

- is this user-facing localized copy?
- does it belong in `common`, `shared`, or `modules`?
- does the folder structure match the intended namespace?
- did I add the same file and keys in both `th` and `en`?
- did I update the necessary `index.ts` aggregation files?
- are the JSON filenames kebab-case?
- are the translation keys camelCase and descriptive?
- are interpolation placeholders aligned across locales?
- does the namespace read clearly in `getTranslations(...)` or `useTranslations(...)`?

#### Messages Folder Style Guide — 14. Quick reference

Use this:

```txt
src/messages/<locale>/common/<topic>.json
src/messages/<locale>/shared/<shared-scope>/<message-file>.json
src/messages/<locale>/modules/<module-name>/<folder-scope>/<message-file>.json
```

Remember:

- locale first
- mirror every locale
- namespace follows folder structure
- message ownership follows the UI owner
- filenames are kebab-case
- JSON keys are camelCase
- Thai defines the typed message shape today

### 12. Schemas Style Guide

This guide defines how to write and organize Zod schemas inside:

- `src/shared/schemas`
- `src/modules/<module-name>/schemas`

Only schemas that are true domain models may live in:

- `src/shared/schemas/models/**`

#### Schemas Style Guide — 1. Decide what kind of schema you are writing

Classify each schema by its role before choosing a folder.

##### Schemas Style Guide — 1. Decide what kind of schema you are writing — Model schema

A model schema describes what a domain entity **is**.

Good model characteristics:

- represents a stable business/domain concept
- reusable across multiple features or flows
- owns a model type derived from the schema
- is not tied to one request, form, action, or page

Examples:

- `User`
- `Organization`
- `Invoice`

##### Schemas Style Guide — 1. Decide what kind of schema you are writing — Validation schema

A validation schema describes what one operation **accepts or returns**.

Good validation-schema characteristics:

- validates form input
- validates action payloads
- validates search params
- validates route params
- validates one request/response shape
- validates internal utility or reporting payloads

Examples:

- `create-user-input`
- `update-profile-input`
- `report-error`
- `search-users-query`

Rule of thumb:

- If the schema answers “what is this entity?”, it is a model schema.
- If the schema answers “what does this operation validate?”, it is a validation schema.

#### Schemas Style Guide — 2. Folder placement rules

##### Schemas Style Guide — 2. Folder placement rules — `src/shared/schemas/models/**`

Use this folder only for shared domain-model schemas.

A schema belongs here only when all of the following are true:

- it represents a real domain entity
- it is reusable beyond one module or operation
- it should be the canonical shared definition of that model

Good:

- `src/shared/schemas/models/user/`
- `src/shared/schemas/models/organization/`

Avoid:

- `src/shared/schemas/models/create-user-input/`
- `src/shared/schemas/models/report-error/`
- `src/shared/schemas/models/search-users-query/`

##### Schemas Style Guide — 2. Folder placement rules — `src/shared/schemas/**`

Use shared non-model schemas for cross-cutting validation that is not a domain model.

Good fits:

- shared payload validation
- shared error/reporting schemas
- shared query/filter schemas
- shared infrastructure or platform-related schemas

Example:

- `src/shared/schemas/report-error/`

##### Schemas Style Guide — 2. Folder placement rules — `src/modules/<module-name>/schemas/**`

Use module schemas when the schema is owned by one feature module.

Good fits:

- form input for one module
- one module's filters or query params
- action payloads owned by one module
- module-specific response normalization schemas

Examples:

- `src/modules/users/schemas/create-user-input/`
- `src/modules/orders/schemas/order-filters/`

#### Schemas Style Guide — 3. Model schemas must stay shared

If a schema is considered a model, it should live in `src/shared/schemas/models/**`.

Do not create model schemas inside `src/modules/<module-name>/schemas`.

Reason:

- domain models are shared concepts, not feature-local contracts
- the canonical model definition should exist in one place
- this prevents the same entity from being modeled differently across modules

If a module needs a narrowed or operation-specific shape based on a model, create a separate module schema for that operation instead of redefining the model there.

#### Schemas Style Guide — 4. Recommended folder structure

##### Schemas Style Guide — 4. Recommended folder structure — Shared model schema

Use a dedicated folder per model:

```txt
src/shared/schemas/models/user/
├── user.schema.ts
├── types.ts
└── index.ts
```

Recommended contents:

- `user.schema.ts` for the Zod schema
- `types.ts` for schema-derived model types
- `index.ts` for the public API of that model folder

##### Schemas Style Guide — 4. Recommended folder structure — Shared non-model schema

Shared validation schemas should also always live in their own folder:

```txt
src/shared/schemas/report-error/
├── report-error.schema.ts
├── types.ts
└── index.ts
```

##### Schemas Style Guide — 4. Recommended folder structure — Module schema

Use module-owned schema folders under the module:

```txt
src/modules/users/schemas/create-user-input/
├── create-user-input.schema.ts
├── types.ts
└── index.ts
```

#### Schemas Style Guide — 5. Naming

Use role-based names that explain what the schema validates.

##### Schemas Style Guide — 5. Naming — Model schema naming

- folder name: domain noun in kebab-case
- schema file: `<model>.schema.ts`
- schema constant: `<model>Schema`
- inferred model type: singular PascalCase noun

Example:

```ts
export const userSchema = z.object({
  email: z.email(),
  id: z.uuid(),
  name: z.string().min(1),
});
```

```ts
export type User = z.infer<typeof userSchema>;
```

##### Schemas Style Guide — 5. Naming — Validation schema naming

- include the operation or boundary in the name
- make the purpose obvious from the file path alone

Prefer:

- `create-user-input.schema.ts`
- `update-profile-input.schema.ts`
- `user-search-query.schema.ts`
- `report-error.schema.ts`

Avoid:

- `user.schema.ts` for a form input schema
- `common.schema.ts`
- `data.schema.ts`
- `validation.schema.ts`

#### Schemas Style Guide — 6. Zod is the source of truth for schema-owned types

When a type is owned by a schema, derive it from the schema instead of rewriting the shape manually.

Good:

```ts
import { z } from "zod";

export const userSchema = z.object({
  email: z.email(),
  id: z.uuid(),
  name: z.string().min(1),
});
```

```ts
import { z } from "zod";

import { userSchema } from "./user.schema";

export type User = z.infer<typeof userSchema>;
```

Why:

- schema and type cannot drift
- runtime validation and TypeScript stay aligned
- ownership stays clear

Do not handwrite an `interface User` beside `userSchema` unless there is a strong reason the type must diverge from the schema.

#### Schemas Style Guide — 7. Relationship to types rules

These rules complement the types rules:

- use `interface` for handwritten object contracts such as props, options, and state
- use schema-derived `type` aliases for schema-owned model or validation shapes when using `z.infer`
- keep schema-owned types with the schema that owns them

In short:

- handwritten contract -> follow the types rules
- schema-owned contract -> schema is the source of truth

#### Schemas Style Guide — 8. Imports and exports

Keep each schema folder's public API focused.

##### Schemas Style Guide — 8. Imports and exports — Good model export

```ts
// src/shared/schemas/models/user/index.ts
export { userSchema } from "./user.schema";
export type { User } from "./types";
```

##### Schemas Style Guide — 8. Imports and exports — Good module schema export

```ts
// src/modules/users/schemas/create-user-input/index.ts
export { createUserInputSchema } from "./create-user-input.schema";
export type { CreateUserInput } from "./types";
```

Rules:

- export only what the folder owns
- use `export type` for type-only exports
- do not create a top-level `src/shared/schemas/index.ts`
- do not create a top-level `src/modules/<module-name>/schemas/index.ts` unless module conventions explicitly require it later

#### Schemas Style Guide — 9. Anti-patterns

Avoid:

- placing non-model validation schemas in `src/shared/schemas/models/**`
- creating module-local model schemas
- hand-copying a schema shape into a separate manual type when `z.infer` should own it
- using generic names like `common.schema.ts` or `data.schema.ts`
- mixing multiple unrelated schemas in one file

#### Schemas Style Guide — 10. Review checklist

Before adding a schema, check:

- Is this a domain model or an operation-specific validation schema?
- If it is a model, does it live in `src/shared/schemas/models/**`?
- If it is not a model, would `src/shared/schemas/**` or `src/modules/<module-name>/schemas/**` be clearer?
- Is the file name explicit about the schema's role?
- Should the type be derived with `z.infer<typeof schema>`?
- Is the schema colocated with its owned derived types and exports?

### 13. Types Style Guide

This guide defines how to write and organize type definitions across the repository, including:

- `src/shared/types`
- colocated `types.ts` files in components, screens, providers, and lib modules
- shared lib type contracts such as `src/shared/lib/**/types.ts`

The goal is to keep type definitions local by default, promote them only when reuse is real, and make contracts easy to read from the file structure.

#### Types Style Guide — 1. Decide where a type belongs

Choose the narrowest valid scope first.

##### Types Style Guide — 1. Decide where a type belongs — Colocated `types.ts`

Prefer a local `types.ts` when a leaf feature folder is the clear owner of the contract.

Allowed examples include component, screen, provider, hook, action, utils, and lib folders when that specific folder owns the contract.

This is about ownership, not limiting usage. Other files may import the type, but the type should stay colocated until it becomes truly cross-cutting and no longer has one obvious owner.

Examples:

- component props
- component state interfaces
- provider props
- module-local view models
- options for one lib module

Good fits:

- `src/shared/components/error-boundary/types.ts`
- `src/shared/providers/app-provider/types.ts`
- `src/modules/static-pages/screens/screen-welcome/types.ts`
- `src/shared/lib/fetcher/types.ts`

##### Types Style Guide — 1. Decide where a type belongs — `src/shared/types/<name>.ts`

Use `src/shared/types` only for cross-cutting shared contracts that are not owned by a single feature or module.

Good fits:

- framework-level contracts used in multiple places
- shared app-wide type helpers with clear ownership
- types that would otherwise create awkward cross-feature dependencies

Example:

- `src/shared/types/next.ts`

Do **not** move local props or one-module contracts into `src/shared/types` just to make them feel “organized”.

#### Types Style Guide — 2. Keep types local by default

Default to colocated types and promote to shared only when:

- the same contract is used by multiple unrelated areas
- the type is conceptually cross-cutting
- the shared location improves clarity more than it increases indirection

Rule of thumb:

- If the type only exists to support one folder's public API, keep it in that folder's `types.ts`.
- If multiple features need the same contract and no single feature owns it, move it to `src/shared/types/<name>.ts`.

#### Types Style Guide — 3. File and folder structure

##### Types Style Guide — 3. File and folder structure — Colocated types

Use `types.ts` inside the leaf folder that owns the contract.

```txt
src/shared/components/error-boundary/
├── error-boundary.tsx
├── index.ts
└── types.ts

src/modules/static-pages/screens/screen-welcome/
├── index.ts
├── screen-welcome.tsx
└── types.ts
```

##### Types Style Guide — 3. File and folder structure — Shared types

In `src/shared/types`, prefer standalone files named by domain or concern.

```txt
src/shared/types/
└── next.ts
```

Rules:

- use `types.ts` only when the types are owned by the current leaf folder
- use specific standalone names in `src/shared/types`, never generic names like `common.ts` or `shared.ts`
- do not create `src/shared/types/index.ts`
- do not create a dedicated `types/` folder inside a component or lib folder unless the existing repo convention changes

#### Types Style Guide — 4. Naming

Name types after the domain concept they model.

Prefer:

- `NextErrorProps`
- `ErrorBoundaryProps`
- `FetchClientOptions`
- `SerializedError`
- `SectionDemoProps`

Avoid:

- `PropsType`
- `DataType`
- `CommonTypes`
- `SharedProps`
- `MiscOptions`

Rules:

- suffix React props with `Props`
- suffix option objects with `Options`
- use domain nouns for value shapes and contracts
- use names that still make sense when imported elsewhere

#### Types Style Guide — 5. Prefer `interface` for object-shaped contracts

Use `interface` for object-like public contracts such as:

- props
- options
- state
- serialized object shapes
- metadata records with named fields

This matches the current codebase patterns:

- `NextErrorProps`
- `ErrorBoundaryProps`
- `AppProviderProps`
- `FetchClientOptions`
- `SerializedError`

Use `type` when the shape is not an object interface or when TypeScript features require it, for example:

- unions
- intersections that read better as aliases
- mapped or conditional types
- function signatures when an alias is clearer than an interface

Do not convert every shape to `type` for style consistency. Pick the form that best matches the contract.

##### Types Style Guide — 5. Prefer `interface` for object-shaped contracts — Property grouping order

For interface definitions in `types.ts` files, use this 4-group order:

1. **Required fields** - non-function properties without `?`
2. **Required functions** - function properties without `?`
3. **Optional fields** - non-function properties with `?`
4. **Optional functions** - function properties with `?`

Within each group:

- sort alphabetically (`a-z`, case-insensitive)
- separate groups with exactly one blank line
- do not add comments solely to label or separate groups

This is a prescriptive convention for new and updated interface definitions in `types.ts` files, even if some older files were written before the rule existed.

Good:

```ts
export interface FetchClientOptions extends Omit<RequestInit, "body"> {
  path: string;

  body?: unknown;
  retries?: number;
  retryDelay?: number;

  getToken?: () => string | null | undefined;
}
```

#### Types Style Guide — 6. Imports and exports

- Use `import type` for type-only imports.
- Re-export types from the leaf folder's `index.ts` when that folder has a public API.
- Export types with `export type { ... }` from `index.ts`.
- Keep exports specific and intentional.
- Do not create catch-all barrels for unrelated shared types.

Good:

```ts
// src/shared/components/error-boundary/index.ts
export { ErrorBoundary } from "./error-boundary";
export type {
  ErrorBoundaryFallbackProps,
  ErrorBoundaryProps,
  ErrorBoundaryState,
} from "./types";
```

```ts
// src/modules/static-pages/screens/screen-welcome/index.ts
export { WelcomeScreen } from "./screen-welcome";
export type { WelcomeScreenProps } from "./types";
```

Avoid:

```ts
// Avoid parent-level aggregation of unrelated shared types
export type { NextErrorProps } from "./next";
export type { FetchClientOptions } from "@/shared/lib/fetcher/types";
export type { ErrorBoundaryProps } from "@/shared/components/error-boundary/types";
```

#### Types Style Guide — 7. Keep contracts minimal and explicit

Types should be small and intentional.

- include only fields required by the contract
- prefer explicit property names over broad index signatures
- reuse existing platform types when they fit, such as `ReactNode`, `Locale`, or `RequestInit`
- compose from existing types when that improves clarity, such as `extends Omit<RequestInit, "body">`
- avoid placeholder fields or speculative extensibility

Good:

```ts
export interface WelcomeScreenProps {
  locale: Locale;
}
```

```ts
export interface FetchClientOptions extends Omit<RequestInit, "body"> {
  path: string;

  body?: unknown;
  retries?: number;
  retryDelay?: number;

  getToken?: () => string | null | undefined;
}
```

#### Types Style Guide — 8. Documentation

Add JSDoc only when the contract or field semantics need explanation.

Good cases:

- framework-specific contracts
- fields with behavior expectations
- contracts that are easy to misuse without context

Examples already in the codebase:

- `src/shared/types/next.ts`
- `src/shared/lib/fetcher/types.ts`
- `src/shared/lib/errors/types.ts`

Keep documentation concise:

- document why the type exists or how a field should be used
- document tricky behavior or invariants
- do not restate obvious property names

#### Types Style Guide — 9. Type safety rules

- Prefer `unknown` over `any` for untrusted values.
- Use `Record<string, unknown>` only when arbitrary keyed metadata is truly intended.
- Keep nullable and optional fields explicit.
- Do not hide weak modeling behind broad casts.
- Prefer reusing existing domain types over duplicating near-identical shapes.

Examples to emulate:

- `cause?: unknown`
- `meta?: Record<string, unknown>`
- `error: Error | null`

#### Types Style Guide — 10. React-specific guidance

For React folders:

- keep component props in the component's local `types.ts`
- import `ReactNode` with `import type`
- type callback props explicitly
- keep state interfaces local unless another file genuinely shares them

Good:

```ts
import type { ReactNode } from "react";

export interface ErrorBoundaryProps {
  children: ReactNode;

  fallback?: (props: ErrorBoundaryFallbackProps) => ReactNode;
}
```

#### Types Style Guide — 11. Shared lib guidance

For shared library modules:

- keep module-owned contracts in that module's `types.ts`
- colocate them with the implementation they support
- promote them to `src/shared/types` only when they stop belonging to one lib module

Good fits for lib-local `types.ts`:

- fetch client options
- serialized error shapes
- logger or reporter context contracts

#### Types Style Guide — 12. Anti-patterns

Avoid:

- creating `types.ts` when a folder has only one trivial private type that can stay in the implementation file
- moving feature-local props into `src/shared/types`
- creating parent barrels for all types
- generic names like `common.ts`, `shared.ts`, or `misc.ts`
- duplicate aliases that only rename existing framework types without adding meaning

#### Types Style Guide — 13. Review checklist

Before adding or moving a type, check:

- Is the placement correct: local `types.ts` first, shared only when truly cross-cutting?
- Is the name specific and domain-based?
- Should this be an `interface` or does it need `type` features?
- Are imports type-only where appropriate?
- Does the folder's `index.ts` export only its own public types?
- Is JSDoc present only where it adds meaning?
- Is the contract as small and explicit as possible?

### 14. Config Folder Style Guide

This guide defines how to write and organize shared configuration inside:

- `src/shared/config`

Use `shared/config` for application-wide and framework-facing configuration that shapes how the app runs. This folder is for declarative setup such as environment validation, font configuration, i18n routing, request config, and formatting definitions.

#### Config Folder Style Guide — 1. Decide whether code belongs in `config`

Put code in `shared/config` when it does one or more of the following:

- defines shared application or framework configuration
- centralizes setup values consumed by app entry points, providers, or shared infrastructure
- declares runtime configuration in a mostly data-oriented or framework-oriented way
- provides one canonical configuration source for a concern used across the app

Examples from the current repository:

- `env.ts` for validated environment variables
- `fonts.ts` for Next.js font setup
- `i18n/routing.ts` for next-intl routing
- `i18n/formats.ts` for next-intl formats
- `i18n/request.tsx` for next-intl request configuration

Do **not** put code in `config` when it belongs somewhere more specific:

- `constants/` for static values with no configuration role
- `lib/` for integrations, wrappers, and architectural runtime behavior
- `utils/` for pure helper functions
- `schemas/` for validation contracts
- feature folders for module-owned or UI-local settings

Rule of thumb:

- if the file mainly configures how the app or a framework behaves, `config/` is usually correct
- if the file mainly stores fixed domain values, it is probably a `constants/` concern
- if the file mainly performs behavior, orchestration, or integration work, it is probably a `lib/` concern

#### Config Folder Style Guide — 2. Scope and ownership

`src/shared/config` is for configuration with app-wide ownership.

Good fits:

- environment schema and runtime env access
- shared font registration
- i18n routing and request configuration
- formatting definitions used across providers, layouts, or shared infrastructure

Avoid putting feature-owned settings in `shared/config` just because they feel important. If a configuration concern belongs clearly to one module, keep it with that module unless the repository later introduces a dedicated module config pattern.

Promote a concern to `shared/config` only when:

- multiple unrelated parts of the app depend on it
- it configures a shared framework boundary
- there is one obvious app-wide owner

#### Config Folder Style Guide — 3. Standalone files vs nested config concern folders

Use the simplest structure that matches the concern.

##### Config Folder Style Guide — 3. Standalone files vs nested config concern folders — Standalone file for one-file concerns

Prefer a standalone file when the concern is small and self-contained.

Current examples:

- `src/shared/config/env.ts`
- `src/shared/config/fonts.ts`

Good fits:

- one env entrypoint
- one font registration file
- one small framework config object

##### Config Folder Style Guide — 3. Standalone files vs nested config concern folders — Nested folder for multi-file concerns

Create a nested concern folder when one shared configuration area has multiple closely related files.

Current example:

```txt
src/shared/config/i18n/
├── formats.ts
├── request.tsx
└── routing.ts
```

Good fits:

- i18n with routing, formats, and request config
- a future auth config concern with several related config files
- a future analytics config concern with multiple framework-specific definitions

Rules:

- use standalone files for simple concerns
- create a nested folder only when one configuration concern naturally splits into several related files
- name the folder after the concern, such as `i18n`
- keep nested folders focused on one configuration concern
- do not create `src/shared/config/index.ts`

Prefer direct imports from the actual config file, such as `@/shared/config/i18n/routing`, instead of adding barrel layers.

#### Config Folder Style Guide — 4. Naming

Follow the repository's kebab-case convention for file and folder names.

Prefer specific names that describe the configuration concern:

- `env.ts`
- `fonts.ts`
- `routing.ts`
- `formats.ts`
- `request.tsx`

Avoid vague names such as:

- `config.ts`
- `shared.ts`
- `setup.ts`
- `misc.ts`

Use export names that match the configured concept.

Examples from the repository:

- `env`
- `routing`
- `formats`
- `jetBrainsMono`
- `notoSansThai`

Prefer descriptive noun-style exports over generic names like `data`, `options`, or `settings`.

#### Config Folder Style Guide — 5. File design

Config files should stay declarative and easy to scan.

Prefer:

- framework configuration objects
- validated setup entrypoints
- small mappings or definitions that shape shared behavior
- explicit imports for dependencies such as constants, types, or framework APIs

Avoid:

- unrelated helper functions mixed into config files
- feature-specific business rules
- hidden side effects beyond what the configuration API requires
- large amounts of orchestration logic

If a file starts becoming an operational service or wrapper around external systems, it likely belongs in `lib/` instead.

#### Config Folder Style Guide — 6. TypeScript and runtime boundaries

Match the repository's strict TypeScript style.

- use `.ts` by default
- use `.tsx` only when the configuration requires JSX or `ReactNode`, such as rich-text translation defaults
- type config objects explicitly when the framework provides a useful contract, such as `Formats`
- prefer named exports by default
- allow a default export only when a framework or library expects it explicitly

Examples from the current repository:

- `formats.ts` exports `formats: Formats`
- `request.tsx` default-exports `getRequestConfig(...)` because the next-intl integration expects that pattern

Respect runtime boundaries:

- add `import "server-only";` when a config file is server-only
- add `"use client"` only when a config file truly configures client-only behavior
- do not read `process.env` throughout the app; centralize that through shared config entrypoints such as `env.ts`

#### Config Folder Style Guide — 7. Boundaries with nearby folders

This guide stays focused on `shared/config`, so nearby folders are mentioned only to define the boundary.

- use `config/` for shared app or framework configuration
- use `constants/` for static values that are not themselves configuration
- use `lib/` for runtime integrations, wrappers, and architectural behavior
- use `utils/` for pure helper logic
- use `providers/` or app route files to consume config, not to redefine it

Examples from the current repository:

- `LOCALES` and `TIME_ZONE` live in `shared/constants`
- `routing` consumes `LOCALES` from `shared/constants/locale`
- `request.tsx` wires config together and consumes shared constants and shared lib logging

#### Config Folder Style Guide — 8. Examples

##### Config Folder Style Guide — 8. Examples — Good standalone config

```ts
// src/shared/config/env.ts
import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    NODE_ENV: z.enum(["development", "production", "test"]),
  },
  client: {
    NEXT_PUBLIC_API_URL: z.url(),
  },
  runtimeEnv: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NODE_ENV: process.env.NODE_ENV,
  },
});
```

##### Config Folder Style Guide — 8. Examples — Good nested config concern

```txt
src/shared/config/i18n/
├── formats.ts
├── request.tsx
└── routing.ts
```

This keeps one shared concern together without flattening unrelated config files into the top level.

#### Config Folder Style Guide — 9. Checklist

Before adding a file to `src/shared/config`, check:

- does this file configure app-wide or framework-wide behavior?
- is `config/` a clearer home than `constants/`, `lib/`, or a feature folder?
- should this concern stay a standalone file, or has it grown into a multi-file concern folder?
- is the file name specific and kebab-case?
- are exports explicit and named unless a framework requires a default export?
- are runtime boundaries clear (`server-only` or `"use client"` only when needed)?
- is environment access centralized instead of scattered across the codebase?

### 15. Constants Folder Style Guide

This guide defines how to organize dedicated constants inside:

- `src/shared/constants`
- `src/modules/<module-name>/constants`

Use these folders for static values that are intentionally shared across a broad app area, without owning runtime setup, business logic, or framework integration.

#### Constants Folder Style Guide — 1. Decide whether code belongs in `constants`

Put values in a dedicated `constants` folder when they do one or more of the following:

- represent fixed values with clear shared or module-wide ownership
- are reused by multiple files in the same module or across the app
- express stable options, identifiers, limits, or mappings
- should be imported as static data, not computed at runtime

Examples:

- supported locales
- default timezone
- module-wide status lists
- shared enum-like option lists
- app-wide size or pagination limits

Do **not** use a dedicated `constants` folder for:

- runtime configuration or environment setup -> use `config/`
- pure helper functions -> use `utils/`
- validation schemas -> use `schemas/`
- framework wrappers, integrations, or architectural code -> use `lib/`
- values that only support one leaf folder -> keep them in that folder's colocated `constants.ts`

Rule of thumb:

- if the value is static and its ownership is broader than one leaf folder, `constants/` is usually correct
- if the value only exists to support one component, hook, layout, screen, or lib module, colocated `constants.ts` is usually better

#### Constants Folder Style Guide — 2. Dedicated `constants/` vs colocated `constants.ts`

This guide is for dedicated constants folders, but the repository also uses local `constants.ts` files inside leaf folders.

##### Constants Folder Style Guide — 2. Dedicated `constants/` vs colocated `constants.ts` — Use colocated `constants.ts` when the values belong to one leaf folder

Good fits:

- animation variants for one component
- static arrays or code samples used by one section
- implementation details for one lib module
- small UI-only mappings used by one screen or layout

Examples already present in the repository:

- `src/modules/static-pages/components/section-features/constants.ts`
- `src/shared/lib/fetcher/constants.ts`

##### Constants Folder Style Guide — 2. Dedicated `constants/` vs colocated `constants.ts` — Use dedicated `shared/constants` or `modules/<module-name>/constants` when the values have broader ownership

Good fits:

- locales used by routing, navigation, and UI
- a module-wide set of tabs, filters, or statuses shared by several screens and hooks
- app-wide constants used by multiple unrelated areas

Examples already present in the repository:

- `src/shared/constants/locale.ts`
- `src/shared/constants/timezone.ts`

Do not move local implementation constants into a dedicated `constants/` folder just to make the tree look more uniform. Promote only when ownership is clearly broader than one leaf folder.

#### Constants Folder Style Guide — 3. Scope and placement

Choose the narrowest valid scope first.

##### Constants Folder Style Guide — 3. Scope and placement — `src/modules/<module-name>/constants`

Prefer module-level constants when the values are shared within one feature module.

Good fits:

- order statuses used by several orders screens
- checkout step identifiers used across module hooks and components
- profile preference options used throughout one profile module

Examples:

- `src/modules/orders/constants/order-status.ts`
- `src/modules/checkout/constants/checkout-step.ts`

##### Constants Folder Style Guide — 3. Scope and placement — `src/shared/constants`

Promote constants to shared only when they are truly app-wide or cross-module.

Good fits:

- locale lists
- timezone constants
- app-wide formatting limits
- shared identifiers used by multiple unrelated modules

Examples:

- `src/shared/constants/locale.ts`
- `src/shared/constants/timezone.ts`

Avoid moving module-owned constants to `shared` too early. Promote only when:

- multiple unrelated modules depend on them
- the naming is generic rather than feature-specific
- shared ownership is clearer than module ownership

#### Constants Folder Style Guide — 4. Keep constants static and boring

Dedicated constants files should stay simple.

Prefer:

- literal arrays, objects, strings, numbers, and maps
- readonly-friendly values
- values declared near the top level
- simple type imports when needed

Avoid:

- functions with behavior
- lazy initialization
- environment access
- side effects
- hidden coupling to browser-only or server-only runtime state

If a file starts needing logic, parsing, validation, or runtime setup, it probably belongs somewhere other than `constants/`.

#### Constants Folder Style Guide — 5. File and folder structure

Follow the repository's kebab-case convention for files and folders.

For dedicated constants folders, prefer standalone files named by concern:

```txt
src/shared/constants/
├── locale.ts
└── timezone.ts

src/modules/orders/constants/
├── order-status.ts
└── order-tabs.ts
```

Rules:

- prefer one standalone file per constants concern
- name the file after the domain meaning, not after the word "constants"
- do not create one folder per constant concern unless the repository convention changes
- do not create `src/shared/constants/index.ts`
- do not create `src/modules/<module-name>/constants/index.ts`

Keep dedicated constants folders flat unless a future repository convention requires otherwise.

#### Constants Folder Style Guide — 6. Naming

##### Constants Folder Style Guide — 6. Naming — File names

Use specific kebab-case file names:

- `locale.ts`
- `timezone.ts`
- `order-status.ts`
- `checkout-step.ts`

Avoid generic names such as:

- `constants.ts`
- `common.ts`
- `shared.ts`
- `data.ts`

Inside a dedicated `constants/` folder, the path should already tell the reader these are constants. The file name should add the domain meaning.

##### Constants Folder Style Guide — 6. Naming — Export names

Use descriptive `SCREAMING_SNAKE_CASE` names for exported constants.

Prefer:

- `LOCALES`
- `TIME_ZONE`
- `ORDER_STATUSES`
- `CHECKOUT_STEPS`
- `MAX_UPLOAD_SIZE_MB`

Avoid:

- `localeList`
- `timezoneValue`
- `data`
- `items`
- `config`

The export name should explain the value without depending on the import site for context.

#### Constants Folder Style Guide — 7. Exports and typing

Export constants directly from their file.

Prefer:

```ts
export const LOCALES = ["th", "en"] as const;

export const TIME_ZONE = "Asia/Bangkok" as const;
```

Use `as const` when literal inference is meaningful and helps derive narrow unions safely.

Example:

```ts
export const ORDER_STATUSES = ["draft", "submitted", "paid"] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];
```

If a constants file needs a related type, it is acceptable to export that type from the same file when the type is tightly coupled to the constant values.

Keep exports small and explicit:

- prefer named exports
- avoid default exports
- avoid re-export chains for constants folders

#### Constants Folder Style Guide — 8. Boundaries with nearby folders

This guide stays focused on `constants`, so nearby folders are mentioned only to define boundaries.

- use `constants/` for static shared or module-wide values
- use colocated `constants.ts` for values owned by one leaf folder
- use `config/` for environment-aware or runtime configuration
- use `utils/` for helper functions and transformations
- use `lib/` for integrations, wrappers, and architectural behavior
- use `schemas/` for validation contracts

If the value needs runtime setup, it is probably not a `constants` concern.
If the value only supports one implementation folder, it probably should stay colocated.

#### Constants Folder Style Guide — 9. Examples

##### Constants Folder Style Guide — 9. Examples — Good shared constants

```ts
// src/shared/constants/locale.ts
export const LOCALES = ["th", "en"] as const;
```

```ts
// src/shared/constants/timezone.ts
export const TIME_ZONE = "Asia/Bangkok" as const;
```

##### Constants Folder Style Guide — 9. Examples — Good module constants

```ts
// src/modules/orders/constants/order-status.ts
export const ORDER_STATUSES = ["draft", "confirmed", "shipped"] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];
```

##### Constants Folder Style Guide — 9. Examples — Better kept colocated

```ts
// src/modules/static-pages/components/section-features/constants.ts
export const FEATURE_COLORS = ["blue", "purple", "green"] as const;
```

This value supports one component concern, so colocating it is clearer than moving it into a module-wide constants folder.

#### Constants Folder Style Guide — 10. Checklist

Before adding a file to `shared/constants` or `modules/<module-name>/constants`, check:

- are these values static and behavior-free?
- is ownership broader than one leaf folder?
- is `constants/` clearer than colocating a `constants.ts` file?
- is the scope correct: module first, shared only when truly cross-module?
- is the file name specific and kebab-case?
- are exported constant names descriptive and `SCREAMING_SNAKE_CASE`?
- are the exports direct, named, and easy to import?

### 16. Providers Folder Style Guide

This guide defines how to write and organize provider components inside:

- `src/shared/providers`
- `src/modules/<module-name>/providers`

Use these folders for provider components that expose one concern or compose multiple providers at a higher boundary.

#### Providers Folder Style Guide — 1. Decide whether code belongs in `providers`

Put code in a `providers` folder when it does one or more of the following:

- renders a provider component
- wires a context provider around `children`
- composes multiple providers into one boundary component
- exposes a subtree-level provider API for app or feature code

Examples:

- app provider composition
- feature-level provider for one context concern
- route-level provider wrapper for a feature subtree

Do **not** put code in `providers` when it belongs somewhere more specific:

- `contexts/` for the context object itself
- `hooks/` for consumer hooks and other custom hooks
- `lib/` for infrastructure or integration code
- UI folders when the file is primarily rendering and not providing subtree state or dependencies

Rule of thumb:

- if the file's main job is wrapping `children` in one or more providers, `providers/` is usually correct
- if the file defines the context primitive, it belongs in `contexts/`

#### Providers Folder Style Guide — 2. Scope and placement

Choose the narrowest valid scope first.

##### Providers Folder Style Guide — 2. Scope and placement — `src/modules/<module-name>/providers`

Prefer module-level providers when the provider is owned by one feature module.

Good fits:

- order filters provider
- checkout flow provider
- profile editor provider

Examples:

- `src/modules/orders/providers/order-filters-provider/`
- `src/modules/checkout/providers/checkout-flow-provider/`

##### Providers Folder Style Guide — 2. Scope and placement — `src/shared/providers`

Promote a provider to shared only when it is truly cross-module or app-wide.

Good fits:

- `app-provider`
- shared UI preferences provider
- shared composition providers used by unrelated features

Examples:

- `src/shared/providers/app-provider/`
- `src/shared/providers/ui-preferences-provider/`

Avoid moving feature-owned providers into `shared` too early. Promote only when:

- multiple unrelated modules need the same provider
- the provider API is generic rather than feature-specific
- shared ownership improves clarity more than it increases indirection

#### Providers Folder Style Guide — 3. Boundaries with other folders

This guide stays focused on `providers`, so adjacent folders are mentioned here only to define the boundary.

- use `providers/` for provider components
- use `contexts/` for context objects and context-owned contracts
- use `hooks/` for consumer hooks
- use `layouts/` or route boundaries to place providers where they should wrap UI

Recommended flow:

`contexts/` -> `providers/` -> `hooks/`

The provider depends on the context. Consumers depend on hooks. Rendering layers depend on providers.

#### Providers Folder Style Guide — 4. File and folder structure

Follow the repository's kebab-case convention for files and folders.

Each provider should live in its own leaf folder:

```txt
src/shared/providers/app-provider/
├── app-provider.tsx
├── index.ts
└── types.ts

src/modules/orders/providers/order-filters-provider/
├── index.ts
├── order-filters-provider.tsx
└── types.ts
```

Rules:

- keep one public provider per folder
- name the folder and main implementation file the same
- add a leaf-level `index.ts` for the provider folder
- colocate `types.ts` when the provider owns reusable contracts
- keep tests adjacent to the provider they cover
- do not create parent barrel files for `src/shared/providers` or `src/modules/<module-name>/providers`
- keep provider composition helpers inside the same folder when they are private to that provider

#### Providers Folder Style Guide — 5. Naming

Provider names should describe the concern they provide.

Prefer:

- `app-provider`
- `ui-preferences-provider`
- `order-filters-provider`
- `checkout-flow-provider`

Avoid:

- `provider`
- `shared-provider`
- `common-provider`
- `context-provider`

For exported symbols:

- use PascalCase provider component names such as `AppProvider` and `OrderFiltersProvider`
- keep names meaningful when imported elsewhere

#### Providers Folder Style Guide — 6. Client boundaries

Provider components in this codebase should be treated as client-side boundaries.

- place `"use client"` at the top of provider implementation files when required
- keep provider logic in the client layer
- do not import server-only modules into providers
- pass server-prepared data into providers through explicit props

If a provider needs server-derived initial data:

- prepare the data before the provider boundary
- pass it through typed props
- keep the provider focused on client-side sharing and composition

#### Providers Folder Style Guide — 7. Provider design rules

Providers should stay narrow and intentional.

- keep one clear responsibility per provider
- compose multiple providers only when a higher-level boundary truly needs one entry point
- keep provider props explicit
- avoid turning one provider into a dumping ground for unrelated concerns

Good fits:

- wrapping one context concern
- composing app-wide providers in one top-level provider
- exposing one feature subtree state boundary

Usually not a fit:

- pure rendering wrappers with no provider responsibility
- infrastructure code
- raw context definitions

#### Providers Folder Style Guide — 8. TypeScript rules

Match the repository's strict TypeScript style.

- type provider props clearly
- keep provider-owned contracts in local `types.ts`
- use `interface` for object-shaped provider props
- use `import type` for type-only imports

Good fits for provider-local `types.ts`:

- provider props
- composition-specific prop contracts

Do not move provider-owned contracts into `src/shared/types` unless they become truly cross-cutting and are no longer clearly owned by one provider.

#### Providers Folder Style Guide — 9. Relationship to `contexts/`

Providers should consume context primitives from `contexts/` rather than redefining them.

Good direction:

```txt
src/modules/orders/contexts/order-filters/
└── order-filters-context.ts

src/modules/orders/providers/order-filters-provider/
└── order-filters-provider.tsx
```

The provider owns provider behavior. The context folder owns the context object.

#### Providers Folder Style Guide — 10. Testing

Every non-trivial provider should have adjacent tests.

- use Vitest and Testing Library
- test the provider through consumer behavior where practical
- verify that provider props seed state correctly
- test composition providers by checking that children render within the expected provider boundary

Typical provider tests should cover:

- children rendering
- initial prop handling
- provider updates exposed through consumers
- composition behavior for multi-provider wrappers

#### Providers Folder Style Guide — 11. Example patterns

##### Providers Folder Style Guide — 11. Example patterns — Good shared provider

```txt
src/shared/providers/app-provider/
├── app-provider.tsx
├── index.ts
└── types.ts
```

Why it fits:

- app-wide ownership is clear
- one provider concern owns one folder
- composition is explicit

##### Providers Folder Style Guide — 11. Example patterns — Good module provider

```txt
src/modules/orders/providers/order-filters-provider/
├── index.ts
├── order-filters-provider.tsx
└── types.ts
```

Why it fits:

- provider is owned by one module
- it stays separate from the raw context definition
- the boundary is clear to consumers

##### Providers Folder Style Guide — 11. Example patterns — Good leaf export

```ts
export { OrderFiltersProvider } from "./order-filters-provider";
export type { OrderFiltersProviderProps } from "./types";
```

#### Providers Folder Style Guide — 12. Final checklist

Before adding a provider, check:

- is the file really a provider component?
- should it live in a module first, or is it truly shared?
- does one provider own one folder?
- is it separate from the raw context definition?
- are client boundaries explicit?
- are props typed clearly?
- are tests covering provider behavior or composition?

### 17. Hooks Folder Style Guide

This guide defines how to write and organize user-authored custom hooks inside:

- `src/shared/hooks`
- `src/modules/<module-name>/hooks`

Use these folders for custom React hooks that package reusable client-side behavior behind a stable `use*` API.

#### Hooks Folder Style Guide — 1. Decide whether code belongs in `hooks`

Put code in a `hooks` folder when it does one or more of the following:

- uses React hooks internally
- packages reusable client-side state or effect logic
- provides a stable `use*` API consumed by components, containers, screens, or layouts
- coordinates browser-aware behavior that belongs close to UI usage

Examples:

- URL or search-param state hooks
- viewport or media-query hooks
- form interaction hooks
- reusable UI state hooks such as disclosure, selection, or filters

Do **not** put code in `hooks` when it belongs somewhere more specific:

- `lib/` for infrastructure, integrations, or framework wrappers without a hook-shaped UI API
- `utils/` for pure functions with no React hook behavior
- `contexts/` for the context object itself
- `providers/` for provider components
- UI folders only when the code is truly view-only and does not represent extracted logic

Rule of thumb:

- if the abstraction is consumed as `useSomething()`, `hooks/` is usually correct
- if the logic is pure and React-free, it is probably not a hook

#### Hooks Folder Style Guide — 2. Scope and placement

Choose the narrowest valid scope first.

##### Hooks Folder Style Guide — 2. Scope and placement — `src/modules/<module-name>/hooks`

Prefer module-level hooks when the behavior is owned by one feature module.

Good fits:

- order filter state
- checkout step navigation
- profile editor draft state

Examples:

- `src/modules/orders/hooks/use-order-filters/`
- `src/modules/checkout/hooks/use-checkout-step/`

##### Hooks Folder Style Guide — 2. Scope and placement — `src/shared/hooks`

Promote a hook to shared only when it is truly cross-module and generic enough to be reused outside one feature.

Good fits:

- viewport hooks
- reusable URL state hooks
- generic local storage hooks
- app-wide interaction hooks with no feature language

Examples:

- `src/shared/hooks/use-media-query/`
- `src/shared/hooks/use-local-storage/`

Avoid moving feature-owned hooks into `shared` too early. Promote only when:

- multiple unrelated modules use the same hook
- the hook name and API are generic rather than feature-specific
- shared ownership improves clarity more than it increases indirection

#### Hooks Folder Style Guide — 3. Boundaries with other folders

This guide stays focused on `hooks`, so adjacent folders are mentioned here only to define the boundary.

- use `hooks/` for extracted hook logic, including logic separated for clarity and testability even when reuse is currently local
- use `contexts/` for context objects
- use `providers/` for provider components
- use `lib/` for non-hook infrastructure or integration code
- use `utils/` for pure React-free helpers
- use UI folders when the file is primarily rendering and the extracted logic does not need its own hook abstraction

If a function can run without React and is mainly data transformation, it likely belongs outside `hooks/`.
If a hook consumes context through `useContext`, the hook still belongs in `hooks/`, not in `contexts/`.

#### Hooks Folder Style Guide — 4. File and folder structure

Follow the repository's kebab-case convention for files and folders.

Each custom hook should live in its own leaf folder:

```txt
src/shared/hooks/use-local-storage/
├── index.ts
├── types.ts
└── use-local-storage.ts

src/modules/orders/hooks/use-order-filters/
├── index.ts
├── types.ts
├── use-order-filters.test.ts
└── use-order-filters.ts
```

Rules:

- keep one public hook per folder
- name the folder and main implementation file the same
- add a leaf-level `index.ts` for the hook folder
- colocate `types.ts` when the hook owns reusable contracts
- keep tests adjacent to the hook they cover
- do not create parent barrel files for `src/shared/hooks` or `src/modules/<module-name>/hooks`
- add helper files only when they materially improve clarity

If a hook needs private helpers, keep them inside the same hook folder so ownership stays obvious.

#### Hooks Folder Style Guide — 5. Naming

Hook names should describe the behavior they provide.

Prefer:

- `use-local-storage`
- `use-media-query`
- `use-order-filters`
- `use-checkout-step`
- `use-selection-state`

Avoid:

- `hook.ts`
- `use-data`
- `use-helper`
- `use-common`
- `state-hook`

For exported symbols:

- prefix public hooks with `use`
- use camelCase hook identifiers derived from the file name, such as `useLocalStorage` and `useOrderFilters`
- use names that still make sense when imported elsewhere

#### Hooks Folder Style Guide — 6. Client and server boundaries

Custom hooks are client-side abstractions.

- place `"use client"` at the top of custom hook implementation files
- do not put custom hooks in server-only files
- keep browser-only logic inside hooks or their private helpers rather than leaking it across consumers
- do not import server-only modules into hooks

If a concern spans both server and client:

- keep server work outside the hook
- pass the hook the client-usable data it needs
- keep the hook focused on client behavior and client state

Rule of thumb:

- server data preparation happens before the hook
- hook logic happens in the client layer

#### Hooks Folder Style Guide — 7. API and return-shape guidance

Keep hook APIs small, predictable, and explicit.

- prefer a focused parameter list or one clear options object
- return only the values and actions the consumer needs
- keep naming consistent between state and actions
- avoid mixing unrelated concerns into one hook

Good patterns:

- primitive return values for simple hooks
- object returns for multi-value hooks
- stable action names such as `setValue`, `reset`, `toggle`, or `select`

Prefer object returns when the hook exposes multiple values or actions:

```ts
export interface UseOrderFiltersReturn {
  filters: OrderFilters;
  reset: () => void;
  setFilters: (filters: OrderFilters) => void;
}
```

Avoid hooks that:

- fetch unrelated data and manage unrelated UI state in one place
- hide too much business logic behind a vague API
- expose awkward names like `doThing` or `handleStuff`

#### Hooks Folder Style Guide — 8. TypeScript rules

Match the repository's strict TypeScript style.

- type hook parameters and return values clearly
- prefer explicit return contracts for non-trivial hooks
- keep hook-owned reusable contracts in local `types.ts`
- use `interface` for object-shaped options and return contracts
- use `type` for unions, aliases, and other non-object shapes
- prefer `unknown` over `any` when handling untyped input

Good fits for hook-local `types.ts`:

- options objects
- return interfaces
- local value contracts shared across multiple files in the hook folder

Do not move hook-owned contracts into `src/shared/types` unless they become truly cross-cutting and are no longer clearly owned by the hook.

#### Hooks Folder Style Guide — 9. Hook design rules

Hooks should stay cohesive and UI-facing.

- keep one clear responsibility per hook
- compose smaller hooks when needed instead of growing one large hook
- keep side effects explicit and understandable
- derive values when possible instead of storing redundant state
- move pure helper logic into local helper files or `utils/` when React is not required

Good fits:

- state coordination
- browser event subscriptions
- reusable UI interaction state
- adapting a context or client API into a focused hook API

Usually not a fit:

- generic pure formatting helpers
- direct infrastructure clients
- view-only code with no hook-shaped behavior

#### Hooks Folder Style Guide — 10. Testing

Every non-trivial custom hook should have adjacent tests.

- use Vitest
- keep tests next to the hook they cover
- test public behavior, not implementation details
- cover both happy paths and edge cases
- test returned state and actions as the consumer sees them

Typical hook tests should cover:

- initial state
- state transitions
- returned actions
- boundary cases
- browser-dependent behavior when relevant

#### Hooks Folder Style Guide — 11. Example patterns

##### Hooks Folder Style Guide — 11. Example patterns — Good shared hook

```txt
src/shared/hooks/use-local-storage/
├── index.ts
├── types.ts
└── use-local-storage.ts
```

```ts
"use client";

export function useLocalStorage() {
  // ...
}
```

Why it fits:

- generic enough for cross-module reuse
- clearly client-side
- one hook owns one folder

##### Hooks Folder Style Guide — 11. Example patterns — Good module hook

```txt
src/modules/orders/hooks/use-order-filters/
├── index.ts
├── types.ts
├── use-order-filters.test.ts
└── use-order-filters.ts
```

```ts
"use client";

export function useOrderFilters() {
  // ...
}
```

Why it fits:

- behavior is owned by one module
- hook API is feature-specific
- tests stay next to the hook

##### Hooks Folder Style Guide — 11. Example patterns — Good leaf export

```ts
export { useOrderFilters } from "./use-order-filters";
export type { UseOrderFiltersOptions, UseOrderFiltersReturn } from "./types";
```

#### Hooks Folder Style Guide — 12. Final checklist

Before adding a custom hook, check:

- does it truly need to be a reusable `use*` abstraction?
- should it live in a module first, or is it truly shared?
- does one hook own one folder?
- is the name descriptive and hook-shaped?
- is `"use client"` present where needed?
- is the API focused and predictable?
- are types colocated when the hook owns them?
- are tests covering the public behavior?

### 18. Contexts Folder Style Guide

This guide defines how to write and organize user-authored React contexts inside:

- `src/shared/contexts`
- `src/modules/<module-name>/contexts`

Use these folders for the context object and its context-owned contracts. Keep providers in `providers/` and consumer hooks in `hooks/`.

#### Contexts Folder Style Guide — 1. Decide whether code belongs in `contexts`

Put code in a `contexts` folder when it does one or more of the following:

- creates a React context with `createContext`
- defines the context value contract
- defines context-related types owned by that context
- provides the low-level context object consumed by a provider or consumer hook

Examples:

- order filters context
- checkout flow context
- UI preferences context
- selection state context

Do **not** put code in `contexts` when it belongs somewhere more specific:

- `providers/` for provider components
- `hooks/` for consumer hooks and other custom hooks
- `lib/` for infrastructure or integration concerns
- `utils/` for pure React-free helpers
- UI folders when the file is only rendering

Rule of thumb:

- if the file's main job is defining the context object, `contexts/` is usually correct
- if the file's main job is providing or consuming that context, it belongs elsewhere

#### Contexts Folder Style Guide — 2. Scope and placement

Choose the narrowest valid scope first.

##### Contexts Folder Style Guide — 2. Scope and placement — `src/modules/<module-name>/contexts`

Prefer module-level contexts when the context is owned by one feature module.

Good fits:

- order filter context
- checkout flow context
- profile editor context

Examples:

- `src/modules/orders/contexts/order-filters/`
- `src/modules/checkout/contexts/checkout-flow/`

##### Contexts Folder Style Guide — 2. Scope and placement — `src/shared/contexts`

Promote a context to shared only when it is truly cross-module or app-wide.

Good fits:

- shared UI preferences context
- app-wide client-side selection context
- shared subtree state used by unrelated features

Examples:

- `src/shared/contexts/ui-preferences/`
- `src/shared/contexts/app-selection/`

Avoid moving feature-owned contexts into `shared` too early. Promote only when:

- multiple unrelated modules depend on the same context
- the value shape is generic rather than feature-specific
- shared ownership improves clarity more than it increases indirection

#### Contexts Folder Style Guide — 3. Boundaries with other folders

This guide stays focused on `contexts`, so adjacent folders are mentioned here only to define the boundary.

- use `contexts/` for the context object and context-owned contracts
- use `providers/` for provider components built on top of those contexts
- use `hooks/` for consumer hooks that wrap `useContext`
- use `types.ts` inside the context folder when the context owns those contracts

Recommended flow:

`contexts/` -> `providers/` -> `hooks/`

The context is the primitive. The provider exposes it to a subtree. The hook gives consumers a clean API.

#### Contexts Folder Style Guide — 4. File and folder structure

Follow the repository's kebab-case convention for files and folders.

Each context should live in its own leaf folder:

```txt
src/shared/contexts/ui-preferences/
├── index.ts
├── types.ts
└── ui-preferences-context.ts

src/modules/orders/contexts/order-filters/
├── index.ts
├── order-filters-context.ts
└── types.ts
```

Rules:

- keep one context per folder
- name the folder after the concern
- name the context file `<concern>-context.ts`
- add a leaf-level `index.ts` for that context folder
- colocate `types.ts` when the context owns reusable contracts
- do not create parent barrel files for `src/shared/contexts` or `src/modules/<module-name>/contexts`
- keep provider and consumer hook files out of `contexts/`

#### Contexts Folder Style Guide — 5. Naming

Name the folder after the concern, not after React primitives alone.

Prefer:

- `ui-preferences`
- `checkout-flow`
- `order-filters`
- `selection-state`

Avoid:

- `context`
- `provider`
- `shared-context`
- `app-context`
- `common-state`

For files and exports:

- name the file `<concern>-context.ts`
- use descriptive exported names such as `OrderFiltersContext` and `UiPreferencesContext`
- keep names meaningful when imported elsewhere

#### Contexts Folder Style Guide — 6. Client boundaries

React context creation in this codebase should be treated as a client-side concern.

- place `"use client"` in context implementation files when required
- do not import server-only modules into contexts
- keep server data preparation outside the context folder
- keep the context file focused on the context primitive and its owned contracts

If server data needs to reach consumers:

- prepare that data before the provider boundary
- pass it into the provider through explicit props
- keep the context definition itself free of server-only concerns

#### Contexts Folder Style Guide — 7. TypeScript rules

Match the repository's strict TypeScript style.

- keep context-owned contracts in local `types.ts`
- type the context value shape explicitly
- use `interface` for object-shaped context value contracts
- use `import type` for type-only imports
- keep the context value shape owned by the context folder, not scattered across providers and hooks

Good fits for context-local `types.ts`:

- context value interface
- default-value helper types
- other contracts shared by the context file and provider

Do not move context-owned contracts into `src/shared/types` unless they become truly cross-cutting and are no longer clearly owned by one context.

#### Contexts Folder Style Guide — 8. Context design rules

Contexts should stay narrow and intentional.

- keep one clear responsibility per context
- prefer multiple focused contexts over one oversized global context
- use context only when props or a plain hook are no longer a good fit
- keep the context value explicit and understandable
- move pure helper logic into local helpers or `utils/` when React is not required

Good fits:

- shared subtree state
- feature-scoped coordination state
- shared client-side dependency access

Usually not a fit:

- pure formatting helpers
- app-wide miscellaneous dumping grounds
- server-only dependencies

#### Contexts Folder Style Guide — 9. Testing

Contexts usually do not need heavy direct tests on their own.

- test context behavior through the provider and consumer hook when that is clearer
- add direct tests only when the context folder owns meaningful logic beyond a simple context definition
- keep tests adjacent to the context concern if they exist

#### Contexts Folder Style Guide — 10. Example patterns

##### Contexts Folder Style Guide — 10. Example patterns — Good shared context

```txt
src/shared/contexts/ui-preferences/
├── index.ts
├── types.ts
└── ui-preferences-context.ts
```

Why it fits:

- one context owns one folder
- provider and hook stay out of the context folder
- shared ownership is clear

##### Contexts Folder Style Guide — 10. Example patterns — Good module context

```txt
src/modules/orders/contexts/order-filters/
├── index.ts
├── order-filters-context.ts
└── types.ts
```

Why it fits:

- context is owned by one module
- the folder contains only the context concern
- provider and hook can evolve independently in their own folders

##### Contexts Folder Style Guide — 10. Example patterns — Good leaf export

```ts
export { OrderFiltersContext } from "./order-filters-context";
export type { OrderFiltersContextValue } from "./types";
```

#### Contexts Folder Style Guide — 11. Final checklist

Before adding a context, check:

- does the concern really need React context?
- should it live in a module first, or is it truly shared?
- does one context own one folder?
- is the folder focused on the context object and its contracts only?
- are provider and consumer pieces kept out of `contexts/`?
- are client boundaries explicit?
- are types colocated when the context owns them?

### 19. Utils Folder Style Guide

This guide defines how to write and organize code inside:

- `src/shared/utils`
- `src/modules/<module-name>/utils`

Use these folders for small, framework-light utilities that are easy to reuse and test. Keep the guide aligned with the repository's existing TypeScript, naming, and testing conventions.

#### Utils Folder Style Guide — 1. Decide whether code belongs in `utils`

Put code in a `utils` folder when it is:

- a small reusable function or a tiny group of related functions
- mostly framework-agnostic
- easy to describe by input/output behavior
- safe to reuse across multiple files in the same scope

Examples:

- string formatting
- array/object transforms
- date/value normalization
- query param serialization or parsing
- small type guards

Do **not** put code in `utils` when it belongs somewhere more specific:

- `lib/` for infrastructure, integrations, shared service wrappers, or code with stronger architectural meaning
- `schemas/` for Zod schemas and validation contracts
- `actions/` for server actions
- `hooks/` for React hook logic
- component or screen folders for logic used by only one UI feature
- `constants/` or `config/` for static values and configuration

Rule of thumb:

- If the code mainly translates data, checks values, or formats output, `utils` is usually correct.
- If the code owns app behavior, talks to external systems, or encodes domain workflows, it likely belongs elsewhere.

#### Utils Folder Style Guide — 2. Scope and placement

Choose the narrowest valid scope first.

##### Utils Folder Style Guide — 2. Scope and placement — `src/modules/<module-name>/utils`

Prefer module-level utils when the utility is only relevant to one feature module.

Examples:

- `src/modules/static-pages/utils/format-stat.ts`
- `src/modules/orders/utils/build-order-label.ts`

##### Utils Folder Style Guide — 2. Scope and placement — `src/shared/utils`

Promote a utility to shared only when it is truly cross-module and generic enough to be reused without leaking feature-specific language.

Examples:

- `src/shared/utils/format-number.ts`
- `src/shared/utils/is-non-empty-string.ts`

Avoid moving code to `shared` too early. Start local to the module unless reuse is already proven or clearly intended.

#### Utils Folder Style Guide — 3. File and folder structure

Follow the project's kebab-case convention for files and folders.

##### Utils Folder Style Guide — 3. File and folder structure — One utility per folder

Each utility should live in its own folder, even when it exports only one public function.

```txt
src/shared/utils/format-phone-number/
├── format-phone-number.ts
├── format-phone-number.test.ts
└── index.ts

src/modules/profile/utils/normalize-display-name/
├── normalize-display-name.ts
├── normalize-display-name.test.ts
└── index.ts
```

Rules:

- keep one public utility per folder
- name the folder and main implementation file the same
- add a leaf-level `index.ts` for that utility folder
- use `types.ts` only when shared types improve clarity
- keep tests adjacent to the utility they cover
- do not create parent barrel files for `shared/utils` or `modules/<module>/utils`
- do not group multiple public utilities into one folder

#### Utils Folder Style Guide — 4. Naming

Name utilities after what they do, not where they are used.

Prefer:

- `format-currency.ts`
- `build-pagination-label.ts`
- `is-browser-error.ts`
- `clamp-number.ts`
- `parse-locale-cookie.ts`

Avoid:

- `helpers.ts`
- `common.ts`
- `utils.ts`
- `misc.ts`
- `shared.ts`

For exported symbols:

- use descriptive verb names for transformers and actions: `formatCurrency`, `normalizePhoneNumber`, `buildSearchParams`
- use `is*`, `has*`, or `can*` for booleans and type guards
- use `assert*` for functions that throw on invalid state
- use noun names only for true values or constants

#### Utils Folder Style Guide — 5. Function design

Utilities should be small, predictable, and explicit.

- Prefer pure functions with no hidden side effects.
- Make dependencies obvious through parameters instead of reading mutable external state.
- Return values instead of mutating inputs unless mutation is the explicit purpose.
- Keep one clear responsibility per function.
- Split long conditionals or mixed responsibilities into smaller helpers.

Good:

```ts
export function clampNumber(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
```

Avoid packing unrelated behavior into one utility:

```ts
// Avoid: formatting, validation, fallback behavior, and logging in one place
export function handlePrice(value: unknown): string {
  // ...
}
```

#### Utils Folder Style Guide — 6. TypeScript rules

Match the repository's strict TypeScript style.

- Type all parameters and return values when they are not trivially inferred.
- Prefer `unknown` over `any` for untrusted input.
- Use narrow unions, type guards, and assertions instead of unsafe casts.
- Extract shared types to `types.ts` only when multiple files need them.
- Use `Readonly<T>` for object-shaped public inputs when immutability improves safety and matches usage.

Examples from the codebase to emulate:

- focused typed exports like `delay(ms: number): Promise<void>`
- guard-style helpers like `isNetworkError(err: unknown): boolean`
- assertion helpers like `assertFound<T>(...): asserts value is T`

#### Utils Folder Style Guide — 7. Error handling

Utilities should fail clearly and consistently.

- Throw only when invalid input or impossible state is part of the contract.
- Prefer explicit validation over silent fallback behavior.
- If a utility needs domain-aware or infrastructure-aware errors, it may belong in `lib/` instead of `utils`.
- Reuse the existing `AppError` hierarchy when the helper participates in application error handling.

Good fits for `utils`:

- parsing, normalization, comparison, formatting, guards

Usually not a fit for `utils`:

- database wrappers
- HTTP clients
- auth/session flows
- app-wide error reporting

#### Utils Folder Style Guide — 8. Comments and documentation

Keep comments minimal.

- Add JSDoc only when the contract, edge cases, or thrown behavior need explanation.
- Prefer expressive naming over explanatory comments.
- Include examples in docs only when the function's behavior is not obvious.

This mirrors existing patterns such as:

- concise no-comment helpers for obvious behavior
- short JSDoc on assertion helpers where failure semantics matter

#### Utils Folder Style Guide — 9. Imports and exports

- Use the `@/*` path alias for cross-folder imports.
- Use relative imports within the same utility folder.
- Keep public exports small and intentional.
- Export types separately when helpful: `export type { QueryStringOptions } from "./types";`
- Keep `index.ts` limited to the public API of that single utility folder.
- Do not create catch-all exports for unrelated utilities.

Good:

```ts
// src/shared/utils/format-phone-number/index.ts
export { formatPhoneNumber } from "./format-phone-number";
```

Avoid:

```ts
// Avoid re-exporting multiple utility folders from one place
export * from "../format-currency";
export * from "../format-phone-number";
export * from "../is-non-empty-string";
```

#### Utils Folder Style Guide — 10. Testing

Every non-trivial utility should have adjacent tests.

- Use Vitest.
- Name test files after the utility:
  - `format-phone-number.test.ts`
  - `build-order-reference.test.ts`
- Cover both happy paths and edge cases.
- Test contract behavior, not implementation details.
- For guards and assertions, include invalid inputs and failure cases.

Typical utility tests should cover:

- valid inputs
- edge cases
- invalid or unknown inputs
- thrown errors when applicable
- stable output shape

#### Utils Folder Style Guide — 11. Example patterns

##### Utils Folder Style Guide — 11. Example patterns — Good shared utility

```txt
src/shared/utils/is-non-empty-string.ts
src/shared/utils/is-non-empty-string.test.ts
```

```ts
export function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}
```

##### Utils Folder Style Guide — 11. Example patterns — Good module utility

```txt
src/modules/orders/utils/build-order-reference.ts
src/modules/orders/utils/build-order-reference.test.ts
```

```ts
export function buildOrderReference(prefix: string, id: number): string {
  return `${prefix}-${id.toString().padStart(6, "0")}`;
}
```

##### Utils Folder Style Guide — 11. Example patterns — Move out of `utils`

If a helper starts doing any of the following, move it to a more specific folder:

- depends on React, browser-only APIs, or hooks
- wraps fetch/database/auth/external services
- encodes domain rules that deserve a named service or `lib` module
- grows into a multi-step workflow instead of a focused helper

#### Utils Folder Style Guide — 12. Review checklist

Before adding a new utility, check:

- Is `utils` the right folder, or would `lib`, `schemas`, `hooks`, `actions`, or a local feature file be clearer?
- Is the scope correct: module first, shared only when truly reusable?
- Is the file or folder name specific and kebab-case?
- Is the exported API focused and easy to understand?
- Are types explicit and safe?
- Are edge cases and failure cases tested?
- Is there any unnecessary abstraction, comment, or barrel export?

### 20. Styles Folder Style Guide

This guide defines how to use `src/shared/styles`.

`src/shared/styles` is a narrow home for shared global CSS files that must exist outside component-local styling and outside Chakra theme configuration.

#### Styles Folder Style Guide — 1. Purpose of `shared/styles`

Use `src/shared/styles` only for cross-cutting global CSS concerns that:

- affect browser-level elements or platform UI
- need raw CSS selectors or pseudo-elements that are awkward in Chakra theme config
- are shared across the whole app
- are not owned by one component or one feature module

Current example:

- `scrollbar.css`

Think of `shared/styles` as the place for low-level global CSS, not as a general-purpose styling folder.

#### Styles Folder Style Guide — 2. What belongs in `shared/styles`

Good fits:

- custom scrollbar styles
- browser-selection behavior
- cross-app CSS resets or overrides not already handled by Chakra
- global element styling that must target raw selectors such as `html`, `body`, or browser pseudo-elements

Typical valid patterns:

- `html::-webkit-scrollbar`
- `::selection`
- `@media (pointer: fine)`
- browser-specific selectors that cannot be expressed cleanly through component props

#### Styles Folder Style Guide — 3. What does not belong in `shared/styles`

Do **not** use `shared/styles` for:

- one component's styling
- one screen's styling
- one module's styling
- Chakra theme tokens
- Chakra `globalCss` values that fit naturally in the theme system
- styles that are better expressed with Chakra props on a component
- CSS Modules owned by a specific component

Use the right layer instead:

- Chakra theme config for global theme tokens and theme-level global CSS
- component style props for component-local Chakra styling
- CSS Modules for component-scoped raw CSS

#### Styles Folder Style Guide — 4. Boundary with Chakra `globalCss`

Prefer Chakra `globalCss` when the style is part of the app's design system or theme layer.

Good Chakra `globalCss` fits:

- base typography on `html, body`
- theme-aware global values tied to fonts, colors, tokens, or design-system defaults

Prefer `shared/styles` when the rule needs raw CSS features that are more natural outside the Chakra system.

Good `shared/styles` fits:

- scrollbar pseudo-elements
- browser-specific CSS behavior
- global selectors that would be noisy or awkward inside theme config

Rule of thumb:

- theme concern -> Chakra system/globalCss
- browser or raw global CSS concern -> `shared/styles`

#### Styles Folder Style Guide — 5. Boundary with CSS Modules

If the style is owned by a single component, keep it beside that component in a CSS Module.

Example:

- `src/shared/components/error-global/error-global.module.css`

Use CSS Modules when:

- selectors are local to one component
- the styles are referenced through `styles.className`
- the CSS should not leak globally

Do not promote a CSS Module into `shared/styles` just because it is written in CSS.

#### Styles Folder Style Guide — 6. Boundary with Chakra style props

Prefer Chakra style props when the styling belongs directly to a Chakra component and does not need raw global CSS.

Good Chakra prop fits:

- spacing
- colors
- layout
- typography
- responsive values
- pseudo-states already supported by Chakra

Do not move normal component styling into `shared/styles` when Chakra props already express it clearly.

#### Styles Folder Style Guide — 7. File structure

Each shared global style concern should live in its own file.

Good:

```txt
src/shared/styles/scrollbar.css
src/shared/styles/selection.css
```

Rules:

- use kebab-case file names
- keep one global concern per file
- do not create `index.css` or a barrel-style CSS entry in `shared/styles`
- avoid grouping unrelated global rules into one large catch-all file

#### Styles Folder Style Guide — 8. Import location

Import shared global style files from a top-level app entry where the effect is intentionally global.

Good fit:

- `src/app/[locale]/layout.tsx`

Good example:

```ts
import "@/shared/styles/scrollbar.css";
```

Rules:

- import `shared/styles` files once at an app-level boundary
- do not import them deep inside leaf components
- do not import the same global CSS file from multiple places

#### Styles Folder Style Guide — 9. Writing style rules

Keep files focused and low-level.

- write plain CSS when plain CSS is the clearest tool
- keep selectors narrow and intentional
- avoid styling app-specific component classes in `shared/styles`
- prefer comments only when browser behavior or non-obvious constraints need explanation
- keep global side effects easy to understand from the file name

Good example characteristics from `scrollbar.css`:

- targets `html`
- uses browser-specific scrollbar selectors
- scopes behavior with `@media (pointer: fine)`
- documents why the rule exists

#### Styles Folder Style Guide — 10. Naming

Name files after the global concern they style.

Prefer:

- `scrollbar.css`
- `selection.css`
- `focus-ring.css`

Avoid:

- `global.css`
- `shared.css`
- `common.css`
- `styles.css`
- `misc.css`

The file name should tell the reader what global concern it affects before they open it.

#### Styles Folder Style Guide — 11. Anti-patterns

Avoid:

- putting component classes for one feature into `shared/styles`
- using `shared/styles` as a dump for leftover CSS
- copying theme-level design-system defaults into raw CSS
- importing global CSS from random leaf components
- bundling unrelated browser tweaks into one vague file

#### Styles Folder Style Guide — 12. Review checklist

Before adding a file to `shared/styles`, check:

- Is this truly global and shared across the app?
- Does it need raw CSS instead of Chakra theme config or Chakra props?
- Is it not better as a component CSS Module?
- Does the file have one clear global concern?
- Is the file imported once from an app-level boundary?
- Is the file name specific and kebab-case?

### 21. CSS Style Guide

This guide applies to:

- files in `src/shared/styles`
- any `*.module.css` file

Use raw CSS intentionally. In this codebase, raw CSS is for shared global CSS concerns and component-scoped CSS Modules, while Chakra theme config and Chakra style props remain the first choice for most component styling.

#### CSS Style Guide — 1. Scope

Use this guide for:

- shared global CSS files such as `src/shared/styles/scrollbar.css`
- component-scoped CSS Modules such as `error-global.module.css`

This guide does **not** redefine when CSS should be used. It defines how CSS should be written once raw CSS is the right tool.

Within the box-model group, use this exact order: `margin`, `border`, `border-radius`, `box-sizing`, `padding`, `height`, `min-height`, `max-height`, `width`, `min-width`, `max-width`, `overflow`.

#### CSS Style Guide — 2. Prefer CSS variables over literals

Always use CSS variables instead of hardcoded design values when a variable-backed token exists.

Prefer variable sources in this order:

1. Chakra CSS variables/tokens first
2. existing shared custom properties already owned by the app, such as font variables
3. literal values only for narrow browser-specific or one-off cases where a token is not practical

Prefer:

```css
.root {
  border-radius: var(--chakra-radii-lg);
  padding: var(--chakra-spacing-4);

  color: var(--chakra-colors-gray-900);
  font-size: var(--chakra-font-sizes-sm);
}
```

Avoid:

```css
.root {
  border-radius: 8px;
  color: #111827;
  font-size: 14px;
  padding: 16px;
}
```

Valid shared examples in this repo already include app-owned CSS variables such as:

- `var(--font-noto-sans-thai)`
- `var(--font-jetbrains-mono)`

#### CSS Style Guide — 3. Allowed exceptions to the variable rule

Literals are allowed only when a variable is not realistic or would make the CSS harder to understand.

Typical exceptions:

- browser-specific properties such as `scrollbar-width`
- vendor pseudo-element styling such as `::-webkit-scrollbar`
- transparent/background keywords
- one-off fallback values in browser behavior rules
- highly specific gradient or rgba values when no token exists yet

If you use a literal for a reusable design value, prefer creating or reusing a token instead.

#### CSS Style Guide — 4. CSS property order

Always order declarations in this 5-group sequence, with exactly one blank line between groups:

1. **Position / z-index**
2. **Display / flex / grid**
3. **Box model**
4. **Typography**
5. **Visual**

##### CSS Style Guide — 4. CSS property order — Group details

###### CSS Style Guide — 4. CSS property order — Group details — 1. Position / z-index

Examples:

- `position`
- `top`
- `right`
- `bottom`
- `left`
- `inset`
- `z-index`

###### CSS Style Guide — 4. CSS property order — Group details — 2. Display / flex / grid

Examples:

- `display`
- `flex-direction`
- `flex-wrap`
- `align-items`
- `justify-content`
- `place-items`
- `grid-template-columns`
- `gap`

###### CSS Style Guide — 4. CSS property order — Group details — 3. Box model

Examples:

- `margin`
- `border`
- `border-radius`
- `box-sizing`
- `padding`
- `height`
- `min-height`
- `max-height`
- `width`
- `min-width`
- `max-width`
- `overflow`

###### CSS Style Guide — 4. CSS property order — Group details — 4. Typography

Examples:

- `color`
- `font-family`
- `font-size`
- `font-weight`
- `line-height`
- `letter-spacing`
- `text-align`
- `text-decoration`

###### CSS Style Guide — 4. CSS property order — Group details — 5. Visual

Examples:

- `background`
- `background-color`
- `background-image`
- `box-shadow`
- `opacity`
- `cursor`
- `user-select`
- `transition`
- `animation`

#### CSS Style Guide — 5. Property ordering example

Good:

```css
.root {
  position: relative;
  z-index: 1;

  align-items: center;
  display: flex;
  flex-direction: column;
  gap: var(--chakra-spacing-4);
  justify-content: center;

  margin: 0;
  border: 1px solid var(--chakra-colors-gray-200);
  border-radius: var(--chakra-radii-lg);
  box-sizing: border-box;
  padding: var(--chakra-spacing-4);
  width: 100%;

  color: var(--chakra-colors-gray-900);
  font-family: var(--font-noto-sans-thai), sans-serif;
  font-size: var(--chakra-font-sizes-sm);
  font-weight: var(--chakra-font-weights-semibold);
  line-height: 1.5;
  text-align: left;

  background-color: var(--chakra-colors-white);
  box-shadow: var(--chakra-shadows-sm);
  opacity: 1;
  transition: background-color 0.2s ease;
}
```

Avoid:

```css
.root {
  background-color: white;
  padding: 16px;
  display: flex;
  color: #111827;
  border-radius: 8px;
  align-items: center;
}
```

#### CSS Style Guide — 6. Sorting inside each group

Within each group:

- sort properties alphabetically (`a-z`, case-insensitive)
- keep vendor-prefixed properties directly above the standard property they support when both are needed
- use exactly one blank line between groups
- do not add comments just to label the groups in normal code

Example:

```css
.number {
  color: transparent;
  font-size: clamp(6rem, 20vw, 11rem);
  font-weight: 900;
  line-height: 1;

  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  background-image: linear-gradient(
    to right,
    var(--chakra-colors-red-500),
    var(--chakra-colors-red-700)
  );
  user-select: none;
}
```

#### CSS Style Guide — 7. Shared global CSS vs CSS Modules

##### CSS Style Guide — 7. Shared global CSS vs CSS Modules — `src/shared/styles`

Use shared global CSS for cross-app concerns such as:

- scrollbars
- selection styling
- browser-level global behavior
- raw selectors targeting `html`, `body`, or browser pseudo-elements

##### CSS Style Guide — 7. Shared global CSS vs CSS Modules — `*.module.css`

Use CSS Modules for component-owned styling such as:

- local layout
- local typography treatment
- component-specific gradients, dividers, and buttons
- selectors referenced through `styles.className`

Rule of thumb:

- global concern -> `src/shared/styles`
- component concern -> `*.module.css`

#### CSS Style Guide — 8. Boundary with Chakra styling

Prefer Chakra theme config or Chakra props when they express the styling cleanly.

Use raw CSS only when you need:

- browser-specific selectors
- global CSS side effects
- CSS Modules for component-owned selectors not worth expressing as prop objects
- CSS behavior that is clearer in a stylesheet than in inline style props

Do not move normal Chakra component styling into CSS just because CSS can express it.

#### CSS Style Guide — 9. Selector rules

- keep selectors narrow and intentional
- avoid deep descendant selectors when a local class is clearer
- do not style unrelated app areas from one CSS Module
- do not use global selectors inside CSS Modules unless the escape is truly necessary

Good:

```css
.actions {
  display: flex;
  gap: var(--chakra-spacing-4);
  justify-content: center;
}
```

Avoid:

```css
.root div div a {
  color: red;
}
```

#### CSS Style Guide — 10. Comments

Keep comments rare and useful.

Good reasons to comment:

- browser quirks
- vendor-specific behavior
- non-obvious constraints

Do not add comments just to describe obvious declarations.

#### CSS Style Guide — 11. Naming

##### CSS Style Guide — 11. Naming — Shared styles

Use kebab-case file names based on the global concern:

- `scrollbar.css`
- `selection.css`
- `focus-ring.css`

Avoid:

- `global.css`
- `common.css`
- `misc.css`

##### CSS Style Guide — 11. Naming — CSS Modules

Follow the component file name:

- `error-global.module.css`
- `section-hero.module.css`

Class names should describe the local role:

- `.root`
- `.container`
- `.heading`
- `.actions`

Avoid vague names such as:

- `.box`
- `.item2`
- `.redText`

#### CSS Style Guide — 12. Anti-patterns

Avoid:

- hardcoded token-like values when a Chakra CSS variable exists
- inconsistent declaration ordering
- mixing unrelated concerns in one selector
- importing shared global CSS from random leaf components
- using CSS Modules for styles that clearly belong in Chakra props
- using shared global CSS for one component's private styling

#### CSS Style Guide — 13. Review checklist

Before committing a CSS file, check:

- Is raw CSS the right layer here?
- Are Chakra CSS variables/tokens used first?
- Are literals limited to justified exceptions?
- Do declarations follow the 5-group order?
- Are properties alphabetized within each group?
- Is there exactly one blank line between groups?
- Is the selector scope appropriate for shared global CSS or a CSS Module?

### 22. Images Folder Style Guide

This guide defines how to organize static image assets inside:

- `src/shared/images`
- `src/modules/<module-name>/images`

Use these folders for source-owned static image assets such as logos, icons, banners, illustrations, and similar files that belong to the application codebase.

#### Images Folder Style Guide — 1. Decide whether an asset belongs in `images`

Put an asset in an `images` folder when it does one or more of the following:

- is a static image owned by the app source
- belongs to one shared UI concern or one feature module
- is imported by components, containers, screens, or layouts
- should live near the code that owns its meaning

Examples:

- product or brand logos
- feature-specific icons
- hero or banner artwork
- empty-state illustrations
- decorative section images

Do **not** use `images` for:

- assets that need a stable public URL and are better owned by `public/`
- non-image files
- generated runtime files
- code wrappers, React components, or icon component implementations

Rule of thumb:

- if the asset is source-owned and imported by app code, `images/` is usually correct
- if the asset is primarily served by URL, `public/` is usually correct

#### Images Folder Style Guide — 2. Scope and placement

Choose the narrowest valid scope first.

##### Images Folder Style Guide — 2. Scope and placement — `src/modules/<module-name>/images`

Prefer module-level image assets when the asset is owned by one feature module.

Good fits:

- a checkout banner
- a dashboard empty-state illustration
- a profile feature logo variant used only in that module

Examples:

- `src/modules/checkout/images/banner-payment-success.webp`
- `src/modules/dashboard/images/empty-state-analytics.svg`

##### Images Folder Style Guide — 2. Scope and placement — `src/shared/images`

Promote an asset to shared only when it is truly cross-module or app-wide.

Good fits:

- primary brand logos
- app-wide decorative assets
- shared empty-state or onboarding artwork
- shared icon files that are not module-specific

Examples:

- `src/shared/images/logo-brand.svg`
- `src/shared/images/banner-auth.webp`

Avoid moving module-owned assets into `shared` too early. Promote only when:

- multiple unrelated modules use the same asset
- the asset is generic and not feature-branded
- shared ownership is clearer than module ownership

#### Images Folder Style Guide — 3. Relationship to `public/`

Use `public/` for assets that are primarily URL-addressed.

Good fits for `public/`:

- favicon and app icon files
- Open Graph or social share images referenced by metadata
- assets referenced by stable URL strings
- files used outside the React component tree
- assets that must be reachable directly by the browser at a known path

Examples:

- `public/favicon.ico`
- `public/og-image.png`
- `public/icons/icon-192.png`

Use `src/shared/images` or `src/modules/<module-name>/images` when:

- the asset is imported from TypeScript or TSX
- ownership belongs clearly to shared UI or one module
- colocating the asset with the owning source code improves clarity

Rule of thumb:

- import-based ownership -> `src/**/images`
- URL-based ownership -> `public/`

Do not duplicate the same asset in both `public/` and `src/**/images` unless there is a deliberate reason.

#### Images Folder Style Guide — 4. File and folder structure

Follow the project's kebab-case convention for files and folders.

Keep image folders simple and ownership-based.

##### Images Folder Style Guide — 4. File and folder structure — Flat structure for small sets

Use direct files when the folder has only a few assets:

```txt
src/shared/images/
├── logo-brand.svg
├── banner-auth.webp
└── icon-app-mark.svg
```

```txt
src/modules/dashboard/images/
├── banner-analytics.webp
└── empty-state-analytics.svg
```

##### Images Folder Style Guide — 4. File and folder structure — Subfolders for one clear concern

Introduce subfolders only when they help group one clear asset concern.

```txt
src/shared/images/brand/
├── logo-brand.svg
└── logo-brand-mark.svg

src/modules/checkout/images/payment/
├── banner-success.webp
└── icon-card.svg
```

Rules:

- keep folder structure shallow and obvious
- group by ownership or concern, not by vague buckets
- use subfolders only when they improve clarity
- do not create `index.ts` or barrel exports for image folders
- do not mix unrelated asset families in one subfolder

#### Images Folder Style Guide — 5. Naming

Name assets by what they represent, not by where they happen to be used.

Prefer:

- `logo-brand.svg`
- `logo-brand-mark.svg`
- `icon-search.svg`
- `banner-auth.webp`
- `empty-state-orders.svg`
- `illustration-onboarding-step-1.svg`

Avoid:

- `image1.png`
- `icon-new.svg`
- `banner-final-final.webp`
- `temp-logo.svg`
- `shared-banner.png`

Rules:

- use kebab-case
- include the asset role in the name when it helps clarity, such as `logo-`, `icon-`, `banner-`, `illustration-`, or `empty-state-`
- make names meaningful outside their immediate file location
- prefer stable names over workflow or revision names such as `final`, `v2`, or `new`

#### Images Folder Style Guide — 6. Format guidance

Choose the simplest format that fits the asset.

Prefer:

- `svg` for logos, icons, and vector illustrations
- `webp` or `avif` for banners, photos, and raster artwork when supported by the asset pipeline
- `png` when transparency or source constraints make it the practical choice
- `jpg` or `jpeg` only when transparency is unnecessary and the source is photographic

Use formats intentionally:

- do not convert everything to one format for consistency alone
- do not use large raster files for simple vector assets
- avoid low-signal duplicates of the same asset in many formats unless they serve a real purpose

#### Images Folder Style Guide — 7. Usage guidance

Use source image folders as asset ownership folders, not as code folders.

- import image assets from `src/**/images` when they are owned by app code
- keep image rendering logic in components, containers, screens, or layouts
- keep raw assets separate from code that renders them
- do not store React icon components in `images/`

Good:

```tsx
import Image from "next/image";

import bannerAuth from "@/shared/images/banner-auth.webp";

export function HeroBanner() {
  return <Image alt="" src={bannerAuth}  />;
}
```

Also good:

```tsx
import Image from "next/image";

import illustrationOrderSuccess from "@/modules/orders/images/illustration-order-success.webp";

export function OrdersEmptyState() {
  return <Image alt="" src={illustrationOrderSuccess}  />;
}
```

For `public/` assets, use URL paths when direct public serving is the reason the asset lives there.

#### Images Folder Style Guide — 8. Optimization and quality

Keep image assets intentional and lightweight.

- prefer optimized source files over oversized originals
- avoid committing very large files when a smaller export would preserve quality
- keep exact duplicates out of the repository
- use descriptive alt text at the rendering site, not in the asset file name
- review whether a shared asset should become module-owned, or vice versa, as the UI evolves

#### Images Folder Style Guide — 9. Boundaries with other folders

This guide stays focused on `images`, so adjacent folders are mentioned here only to define boundaries.

- use `images/` for raw static image assets
- use UI folders for code that renders those assets
- use `public/` for URL-addressed assets

If the item is code, it does not belong in `images/`.

#### Images Folder Style Guide — 10. Example patterns

##### Images Folder Style Guide — 10. Example patterns — Good shared images folder

```txt
src/shared/images/
├── brand/
│   ├── logo-brand.svg
│   └── logo-brand-mark.svg
├── banner-auth.webp
└── icon-app-mark.svg
```

Why it fits:

- shared ownership is clear
- names are descriptive
- structure stays shallow

##### Images Folder Style Guide — 10. Example patterns — Good module images folder

```txt
src/modules/orders/images/
├── banner-orders-summary.webp
└── illustration-order-success.webp
```

Why it fits:

- assets are owned by one module
- no unnecessary barrel or code wrapper is added
- file names still make sense when imported elsewhere

##### Images Folder Style Guide — 10. Example patterns — Good `public/` assets

```txt
public/
├── favicon.ico
├── og-image.png
└── icons/
    ├── icon-192.png
    └── icon-512.png
```

Why it fits:

- assets are URL-addressed
- browser and metadata use cases are clear
- they do not need source-level ownership under one module

#### Images Folder Style Guide — 11. Final checklist

Before adding an asset, check:

- is it a static image asset rather than code?
- does it belong to one module first, or is it truly shared?
- should it live in `src/**/images` or in `public/`?
- is the file name descriptive and stable?
- is the format appropriate for the asset type?
- is the folder structure as shallow as possible while still clear?

### 23. Test Style Guide

This guide defines how to write and organize tests in this repository, including:

- shared test support in `src/test`
- colocated `*.test.ts` and `*.test.tsx` files across `src/shared` and `src/modules`

Use this guide to keep tests consistent with the repository's Vitest, Testing Library, and server-first Next.js architecture.

#### Test Style Guide — 1. Decide whether code belongs in `src/test` or beside the unit

Use `src/test` for shared test infrastructure reused by many tests.

Good fits:

- global test setup
- shared render helpers
- reusable wrappers or providers for tests
- test-only utilities that are intentionally cross-cutting

Current examples:

- `src/test/setup.ts`
- `src/test/render-with-providers.tsx`

Use colocated test files when the test exists to verify one specific unit.

Good fits:

- component tests
- screen tests
- lib tests
- action tests
- feature-local presenter or utility tests

Examples:

- `src/modules/static-pages/components/section-hero/section-hero.test.tsx`
- `src/modules/static-pages/screens/screen-welcome/screen-welcome.test.tsx`
- `src/shared/lib/navigation/navigation.test.ts`
- `src/shared/actions/report-error-action/report-error-action.test.ts`

Rule of thumb:

- shared test support belongs in `src/test`
- the actual test for a unit belongs beside that unit

Do **not** turn `src/test` into a dumping ground for unrelated test files. Prefer colocation first.

#### Test Style Guide — 2. Testing stack and baseline assumptions

This repository currently uses:

- **Vitest**
- **Testing Library**
- **jsdom**
- **@testing-library/jest-dom**

Current configuration from `vitest.config.mts`:

- environment: `jsdom`
- globals: enabled
- setup file: `./src/test/setup.ts`
- coverage provider: `v8`

Coverage thresholds:

- statements: 80
- functions: 80
- lines: 80
- branches: 75

Coverage exclusions currently include:

- `src/test/**`
- `src/**/*.d.ts`
- `src/**/*.stories.{ts,tsx}`
- `src/**/index.ts`
- `src/app/**`

Implication:

- test meaningful behavior below route-entry files
- keep helpers in `src/test` without expecting them to count toward coverage
- do not write tests around barrel files

#### Test Style Guide — 3. File placement and naming

Test files should be colocated and named after the unit they cover.

Use:

- `component-name.test.tsx` for React components
- `screen-name.test.tsx` for screens
- `thing-name.test.ts` for non-React utilities, actions, helpers, and services

Examples:

```txt
src/modules/static-pages/components/section-demo/
├── demo-content.tsx
├── demo-content.test.tsx
├── section-demo.tsx
└── section-demo.test.tsx

src/shared/lib/safe-action/
├── action-client.ts
└── action-client.test.ts
```

Rules:

- keep tests beside the implementation they verify
- keep the test filename aligned to the implementation filename
- prefer one primary test file per public unit
- do not move feature tests into `src/test` just because they are small

#### Test Style Guide — 4. Responsibility of `src/test`

`src/test` is for reusable test support only.

##### Test Style Guide — 4. Responsibility of `src/test` — `setup.ts`

Use `src/test/setup.ts` for global environment configuration that should apply to the entire test suite.

Current example:

- importing `@testing-library/jest-dom`
- stubbing `IntersectionObserver` for jsdom

Good fits:

- global DOM polyfills or stubs
- framework-wide test bootstrapping
- one-time environment setup needed by many tests

Avoid putting per-test mocks or feature-specific setup in `setup.ts`.

##### Test Style Guide — 4. Responsibility of `src/test` — `render-with-providers.tsx`

Use `renderWithProviders` when UI tests need the repository's shared provider setup.

Current example:

- wrapping rendered UI with `ChakraProvider` and the custom Chakra system

Good direction:

```ts
renderWithProviders(<DemoContent codeComment="// test comment" />);
```

If a UI test needs the same app-level wrapper that many other tests need, add or update a shared helper in `src/test` instead of duplicating wrappers in many files.

#### Test Style Guide — 5. UI component tests

Use colocated `*.test.tsx` files for components and screens.

Prefer testing:

- rendered output
- important landmarks
- visible text
- user-relevant structure
- key props or data flowing into the rendered UI

Current examples:

- `SectionHero` checks that a section renders and translated text appears
- `DemoContent` checks rendered comment text and visible code lines
- `ScreenWelcome` checks that all major child surfaces render

Good direction:

- assert what the user can see or interact with
- use `screen.getBy...` and related Testing Library queries where appropriate
- keep assertions focused on meaningful behavior

Avoid:

- snapshot-heavy tests as the default
- asserting implementation details that provide little behavioral value
- over-mocking when rendering the real unit is straightforward

#### Test Style Guide — 6. Server component tests

This repository uses server components by default. Test async server components by calling them directly and awaiting the result.

Current direction:

```ts
renderWithProviders(await ScreenWelcome({ locale: "en" }));
```

Rules:

- call the async component function directly
- await the returned JSX
- then render the result with the appropriate helper

If the test imports server-only code, follow the repository pattern:

```ts
vi.mock("server-only", () => ({}));
```

Use this when needed so test environments can import server-only guarded modules safely.

#### Test Style Guide — 7. Action and lib tests

Non-React units such as actions and library helpers should usually use `*.test.ts`.

Prefer direct unit tests for:

- action result shapes
- validation behavior
- operational vs unexpected error behavior
- pure utilities
- small shared helpers

Current examples:

- `src/shared/actions/report-error-action/report-error-action.test.ts`
- `src/shared/lib/safe-action/action-client.test.ts`
- `src/shared/lib/navigation/navigation.test.ts`

Good direction:

- call the unit directly
- mock only true external boundaries
- assert explicit return values and error outcomes

Avoid mounting React helpers just to test non-React logic.

#### Test Style Guide — 8. Mocking conventions

Follow the existing mocking patterns already used in the repository.

##### Test Style Guide — 8. Mocking conventions — Use `vi.mock(...)` for module mocks

Examples already used:

- `vi.mock("server-only", () => ({}))`
- `vi.mock("next-intl/server", ...)`
- `vi.mock("@/shared/lib/error-reporter", ...)`

##### Test Style Guide — 8. Mocking conventions — Use `vi.hoisted(...)` when a mock function must exist before module evaluation

Current pattern:

```ts
const mockReportError = vi.hoisted(() => vi.fn());
```

Use this for mock functions referenced inside `vi.mock(...)` factories.

##### Test Style Guide — 8. Mocking conventions — Clear mocks between tests when needed

Current pattern:

```ts
beforeEach(() => {
  vi.clearAllMocks();
});
```

Do this when multiple tests share the same mocked module and call history matters.

#### Test Style Guide — 9. Imports and test readability

Vitest globals are enabled, but the current codebase commonly imports `describe`, `it`, `expect`, and `vi` explicitly.

Follow the existing local style of the surrounding tests:

- if nearby tests import Vitest helpers explicitly, stay consistent
- prefer readable, intentional imports over mixing styles arbitrarily

For test helpers:

- import shared helpers from `@/test/...`
- import the unit under test from its colocated path

#### Test Style Guide — 10. What to assert

Prefer assertions that express behavior clearly.

Good assertions:

- rendered landmark exists
- translated text is shown
- helper returns the expected shape
- validation errors are returned for invalid input
- mocked dependency receives the expected arguments

Examples from the repository:

- `expect(screen.getByText("title")).toBeInTheDocument()`
- `expect(result?.validationErrors).toBeDefined()`
- `expect(mockReportError).toHaveBeenCalledWith(...)`

Avoid tests that only restate trivial implementation with little confidence gain.

#### Test Style Guide — 11. App Router boundary guidance

Because `src/app/**` is thin route-entry code and excluded from coverage, prefer testing the layers below it:

- screens
- containers
- components
- actions
- lib

Do not over-invest in unit tests for thin route boundary files when the meaningful behavior lives in deeper layers.

#### Test Style Guide — 12. Example structure

Shared test support:

```txt
src/test/
├── render-with-providers.tsx
└── setup.ts
```

Colocated UI tests:

```txt
src/modules/static-pages/components/section-hero/
├── section-hero.tsx
└── section-hero.test.tsx
```

Colocated non-UI tests:

```txt
src/shared/lib/safe-action/
├── action-client.ts
└── action-client.test.ts
```

#### Test Style Guide — 13. Checklist

Before adding a test, check:

- should this be a shared helper in `src/test`, or a colocated unit test?
- is the test file named after the unit it covers?
- am I testing meaningful behavior rather than trivia?
- should UI rendering use `renderWithProviders`?
- does this server-side test need `vi.mock("server-only", () => ({}))`?
- should a mocked function be created with `vi.hoisted(...)`?
- am I mocking only the necessary boundaries?
- does the test follow the surrounding file's existing style?

#### Test Style Guide — 14. Quick reference

Use this:

```txt
src/test/setup.ts                       # global test bootstrapping
src/test/render-with-providers.tsx     # shared UI render helper
src/**/thing-name.test.ts              # colocated non-UI test
src/**/thing-name.test.tsx             # colocated React/UI test
```

Remember:

- colocate tests with the unit
- keep `src/test` for shared support only
- use `renderWithProviders` for shared UI provider setup
- call async server components directly in tests
- mock `server-only` when importing server-guarded modules
