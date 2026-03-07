# Common Style Guide

This guide defines repository-wide coding conventions that apply across the project.

Use this guide for cross-cutting rules such as:

- TypeScript style
- naming
- exports and imports
- package management
- formatting and tooling expectations

This guide is intentionally **not** the place for folder-specific structure rules. Keep it focused on project-wide conventions rather than folder-owned responsibilities.

## 1. Scope

Apply this guide everywhere unless a framework requirement or a narrower topic says otherwise.

Examples of valid exceptions:

- Next.js framework entry files that must follow framework APIs
- config files that require a default export
- narrower topic-specific conventions

Rule of thumb:

- use **Common Style Guide** for project-wide behavior
- keep ownership and folder structure guidance with the relevant topic itself

## 2. TypeScript

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

### Basic naming

- functions and variables: `camelCase`
- React components and classes: `PascalCase`
- constants: `SCREAMING_SNAKE_CASE`

Keep this file focused on the project-wide baseline. More detailed type-contract decisions should stay with the type-specific topic, not the common baseline.

## 3. Imports and modules

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

### Import sorting

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

## 4. Exports

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

## 5. React and Next.js

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

### Server-first mindset

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

### Practical best practices

Use these habits to protect the server-first approach:

- keep `"use client"` at the smallest possible leaf
- keep data access, async composition, and request-time decisions on the server when possible
- separate interactive leaf components from server-rendered layout and content
- prefer progressive enhancement over client-heavy orchestration
- let the server prepare the view model when that reduces client complexity

Rule of thumb:

- if a feature works well on the server, keep it on the server
- if only one small piece needs the client, isolate only that piece

## 6. General naming and readability

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

## 7. Comments

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

## 8. Error handling

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

## 9. Environment variables

Do not read environment variables ad hoc throughout the codebase.

Rules:

- define environment variables through the shared environment configuration
- validate them with the existing env setup
- use `NEXT_PUBLIC_` only for values intended for the client
- keep server-only values off the client

Prefer:

- one validated source of truth for environment access
- imports from the shared env module instead of raw `process.env` usage in app code

## 10. Reuse before create

Prefer existing abstractions before creating new ones.

Rules:

- reuse an existing helper, component, hook, action, schema, or utility when it already fits
- extract shared logic only when reuse is real, not speculative
- do not add a new dependency when the current stack already solves the problem well

Rule of thumb:

- search first
- reuse second
- create new code only when the existing options are clearly not a fit

## 11. One concern per unit

Keep each file or leaf folder focused on one clear concern.

Good direction:

- one main responsibility per file
- small helpers near the owner when they are private
- separate unrelated behavior instead of mixing many concerns into one unit

Avoid:

- catch-all files with unrelated helpers
- one module doing rendering, fetching, parsing, and persistence all together
- generic "utils" code added without a clear ownership reason

## 12. Package management

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

## 13. Formatting and tooling

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

## 14. Dependency and library choices

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

## 15. Keep common rules common

This file should stay focused on rules that truly apply everywhere.

Do not repeat detailed folder-level guidance here when a narrower topic already owns that guidance. Instead:

- keep the common rule short
- let the narrower topic define the narrow rule

Examples:

- keep testing structure with the testing topic
- keep translation ownership with the i18n/messages topic
- keep presenter UI structure with the component topic
- keep route-level composition with the screen topic

## 16. Checklist

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

## 17. Quick reference

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
