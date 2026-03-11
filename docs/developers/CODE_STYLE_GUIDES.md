# CODE_STYLE

## Purpose

This document defines the canonical coding standards, architecture rules, naming conventions, folder ownership rules, and library-specific policies for this project. It is the source of truth for how code should look, where it should live, and how each layer should behave.

## Related developer guides

- [`START_HERE.md`](./START_HERE.md) for the quickest human onboarding path
- [`ADOPTION_LEVELS.md`](./ADOPTION_LEVELS.md) for Lite, Standard, and Strict
  rollout choices
- [`AI_SURFACE_MAP.md`](./AI_SURFACE_MAP.md) for prompt, skill, and agent
  selection
- [`WORKED_EXAMPLE.md`](./WORKED_EXAMPLE.md) for one end-to-end task
- [`ESCAPE_HATCHES.md`](./ESCAPE_HATCHES.md) for narrow, explicit deviations

These guides explain how to adopt this law. This file remains the canonical
source of code style, placement, and boundary rules.

## Rule Precedence

When rules overlap, apply them in this order:

1. project-wide standards
2. narrower ownership rules that refine placement or API shape
3. stronger server-first constraints
4. framework-required exceptions

When a stricter rule and a broader example disagree, the stricter rule wins.

## Core Engineering Mindset

### Mandatory engineering rules

- Default to a server-first implementation.
- Treat client code as an explicit cost, not the default.
- Keep code in the narrowest correct ownership scope.
- Preserve strict folder and layer boundaries.
- Reuse existing abstractions before creating new ones.
- Prefer extending established patterns over inventing parallel structure.
- Keep one primary concern per file or folder unit.

### Recommended engineering practices

- Optimize for architecture correctness over local convenience.
- Prefer progressive enhancement over client-heavy orchestration.
- Let the server prepare rendering-ready data whenever that reduces client complexity.

## Project Shape and Ownership

### Mandatory ownership rules

- Route-boundary files stay thin.
- Feature-owned code lives in feature modules.
- Cross-cutting reusable code lives in shared code.
- Cross-module imports are forbidden.
- If behavior must be reused across modules, promote it to shared code instead of importing directly across feature boundaries.

### Core placement model

- route entry files handle route-boundary concerns only
- screens assemble containers
- containers bind logic to presenters
- components present
- hooks own extracted client logic
- actions define server command boundaries
- schemas define validation contracts
- `src/shared/api/` owns shared API wrappers
- `src/shared/vendor/` owns project-wrapped third-party surfaces
- lib owns integrations and service boundaries
- layouts own structural framing
- config and constants own app-wide setup and static values

## Leaf Folder Convention

Use a leaf-folder pattern for public concerns that own a reusable API:

- one public concern per folder
- folder and main file share the same name
- leaf-level `index.ts` as the public API
- colocated `types.ts` when the concern owns contracts
- colocated tests beside the implementation
- no parent barrel files for concern directories unless a specific area explicitly allows them

This pattern applies to:

- components
- screens
- containers
- layouts
- hooks
- contexts
- providers
- actions
- lib concerns
- utils
- schema folders

Exceptions:

- constants stay flat by concern file rather than one folder per constant
- config uses standalone files or focused multi-file concern folders
- routes use a top-level aggregator plus route-family folders
- message trees use explicit aggregation indexes at each level

## TypeScript

### Mandatory TypeScript rules

- Use TypeScript in strict mode.
- Do not use `any`.
- Prefer `unknown` for untrusted values, then narrow explicitly.
- Use generics when value relationships should remain type-safe.
- Avoid unnecessary type assertions.
- Prefer guards and narrowing over broad casts.
- Use `import type` for type-only imports.
- Use `export type` for type-only re-exports.
- Wrap object-shaped props with `Readonly<...>` at React boundaries by default, including route entries, layouts, screens, components, and providers, unless a specific API shape requires otherwise.

### Type-shaping rules

Use `interface` for object-shaped public contracts such as:

- props
- options
- state objects
- context values
- serialized object shapes

Use `type` for:

- unions
- intersections
- mapped or conditional types
- schema-derived aliases
- function-signature aliases when they are clearer

### Interface property order

Order interface members like this:

1. required fields
2. required functions
3. optional fields
4. optional functions

Rules:

- alphabetize within each group
- separate groups with one blank line
- do not add comment lines just to label the groups

## Naming and Casing

### Mandatory casing

- functions and variables: `camelCase`
- components and classes: `PascalCase`
- constants: `SCREAMING_SNAKE_CASE`
- files and folders: `kebab-case`

### Mandatory naming quality

- Prefer domain-specific, intention-revealing names.
- Avoid vague names such as `common`, `shared`, `thing`, `widget`, `data`, `value`, `temp`, `helpers`, `misc`, `service`, `manager`, or `base` when they do not describe a real concern.

### React naming pattern

Use UI-type-first, domain-last naming for React layers.

Examples of the shape:

- `FormCheckout`
- `CardProductDetail`
- `HeaderProfile`
- `ScreenCheckout`
- `ContainerFormCheckout`
- `LayoutTwoColumns`

### Prefix and suffix rules

- screens use `Screen...`
- containers use `Container...`
- layouts use `Layout...`
- providers use `...Provider`
- actions end with `Action`
- hooks start with `use`
- prop contracts end with `Props`
- option contracts end with `Options`

## Event Naming

Use a strict three-part event naming pattern:

- callback props: `on` + event verb + target (optional)
- handler implementations: `handle` + event verb + target (optional)

The verb must come immediately after the prefix.

Good shapes:

- `onClick`
- `onClickBack`
- `onSubmitForm`
- `handleClick`
- `handleClickBack`
- `handleSubmitForm`

Hooks that return event handlers for binding must also use the `handle...` pattern.

Allowed non-event function prop prefixes include:

- `render...`
- `get...`
- `format...`

## Imports, Exports, and Public APIs

### Imports

- Use the `@/` alias for cross-folder internal imports.
- Use relative `./` imports only within the same leaf folder.
- Never use parent-directory imports such as `../`.
- Consume other concerns through their leaf public API when one exists.
- Avoid deep imports into another concern's internals unless both files live inside the same owned leaf folder.

### Import order

Sort imports into these groups, in this order:

1. runtime side-effect boundary imports such as `server-only`
2. external modules
3. internal project imports
4. local same-folder imports
5. `import type` statements

Rules:

- one blank line between groups
- alphabetize within each group, case-insensitively
- alphabetize named imports
- consolidate duplicate imports
- place a default import before named imports when both come from the same module
- keep `import type` separate even when the source matches a value import

### Exports

- Use named exports by default.
- Use default exports only when a framework or integration explicitly requires them.
- Do not use `export *` where it weakens ownership and API boundaries.

### `index.ts` rules

When a leaf folder has a public API:

- `index.ts` must contain pure re-exports only
- value exports come first
- type exports come last
- when `types.ts` exists, `index.ts` must re-export its types

## JSX Prop Binding

Do not spread hook return objects directly into JSX props.

Rules:

- bind props explicitly so the rendered API stays clear
- treat explicit prop mapping as the default for container-to-component binding
- spreading a component's own rest props from its parameter object remains allowed

## Server-First and Client Boundaries

### Mandatory server-first rules

- Prefer server components by default.
- Add `"use client"` only when hooks, browser APIs, or client-only interactivity require it.
- Keep `"use client"` at the smallest possible leaf.
- Use `import "server-only";` when a file must never enter a client bundle.
- Do not move server data loading into client code without a real need.
- Prefer server data loading over client fetching whenever practical.
- Prefer server actions over client-only mutation plumbing.
- Pass serializable, prepared props into client leaves whenever possible.

### Recommended server-first practices

- Do not reach for `useMemo` or `useCallback` by habit.
- Add memoization only when a real measured need exists.
- Keep interactive client islands small inside larger server-rendered trees.

## App Router Boundaries

### `page.tsx`

Mandatory rules:

- normal pages begin with `import "server-only";`
- normal pages do not use `"use client"`
- a page returns exactly one screen directly
- normal route-entry pages use the default export name `Page`
- pages remain thin and route-focused

Allowed responsibilities:

- params handoff
- search params handoff
- locale setup
- redirects
- route-entry `notFound()` handling when the boundary belongs there

Forbidden responsibilities:

- page-level visual composition
- rendering containers directly
- rendering presenter components directly
- business logic
- client hooks
- presenter wiring

Locale-boundary pages should perform request-locale setup before returning the screen.

Special-purpose pages such as root redirects or direct not-found boundaries may skip the normal page template, including the screen pattern, when the route entry itself owns that direct concern.

### `layout.tsx`

Mandatory rules:

- keep route layouts thin
- use `Layout` as the component name for route layouts
- use `RootLayout` only for the root layout
- reusable visual structure belongs in reusable layout components, not inside the route-boundary layout file
- route-boundary layouts may own metadata and static-params generation when that responsibility belongs at the layout boundary
- route-boundary layouts should usually remain thin adapters that delegate reusable structure to a reusable layout component

When a layout owns the locale boundary, it must:

- validate the locale
- perform request-locale setup
- load locale messages
- wire locale-aware providers
- keep locale static params at the locale boundary when needed

### Special App Router files

These files are framework boundaries and do not use the screen/container pattern.

Common rules:

- keep them thin
- delegate reusable UI to shared components when helpful
- never import special files across route segments

File-specific rules:

- `loading.tsx`
  - server component
  - simple loading UI only
  - no screen or container layer
- `error.tsx`
  - must be `"use client"`
  - accepts `error` and `reset`
  - must wire error reporting
  - may directly use hooks and actions as a documented exception
- `global-error.tsx`
  - must be `"use client"`
  - must render `<html>` and `<body>`
  - may directly use hooks and actions as a documented exception
  - inline body style is allowed only here, with an explicit lint-disable reason
- the shared-component exception is intentionally limited to `src/shared/components/error-global/**` and `src/shared/components/error-app-boundary/**`
- `not-found.tsx`
  - route-local not-found boundaries are server components by default
  - keep route-local not-found UI thin
  - route-local not-found UI uses the locale-aware navigation layer rather than raw framework navigation
  - the root global `src/app/not-found.tsx` may be a client fallback outside the locale/provider boundary when handling unmatched global routes
- `template.tsx`
  - server component by default
  - use only when a route truly needs re-instantiation per navigation
- `forbidden.tsx` and `unauthorized.tsx`
  - server components
  - thin access-control fallback UI
- `default.tsx`
  - server component
  - return `null` when no visible fallback is required
  - do not duplicate layout chrome
- instrumentation files
  - live at the project root
  - export `register()`
  - contain side-effect initialization only
  - do not render UI
- metadata files
  - live at the route boundary they describe
  - follow the framework return types for sitemap, robots, and manifest
  - image-generation files export the required metadata constants such as `alt`, `size`, and `contentType`
  - sitemap generation uses route helpers rather than duplicated paths

## Screens

Mandatory rules:

- one page returns one screen, and one screen belongs to one page
- screens compose containers only
- screens are module-owned only
- screens are server-first by default
- screens do not have story files

Structure rules:

- folder and file names are prefixed with `screen-`
- exported symbol uses `Screen...`
- tests are adjacent
- no parent barrel files

Props rules:

- keep props small and route-shaped
- accept only route-boundary inputs such as locale and params-derived identifiers
- do not pass large dependency bags through screens

Forbidden:

- presenter-first assembly
- client hooks directly in screens
- business logic that belongs in containers, hooks, actions, or lib
- duplicating the route layer inside the screen

## Containers

Mandatory rules:

- containers are the required bridge layer between screens and components
- containers are module-owned only
- containers bind logic to presenter components; they do not own business logic

### Server and client split

- keep a container server-side when it only binds server data, server-safe values, or server actions
- add `"use client"` only when hooks, browser APIs, optimistic UI, URL state, or local client interaction require it

### Client-container rules

Client containers must delegate all stateful logic to custom hooks.

Client containers must contain none of the following directly:

- `useImmer`
- `useEffect`
- `useRef`
- `useMemo`
- `useCallback`
- browser API usage
- inline event handlers with real logic

The only React hooks allowed directly in a client container are custom hooks.

### Server-container rules

Server containers may:

- call lib functions
- load async data
- import and bind server actions
- map loaded values into presenter props

Server containers must not:

- embed large transformation logic inline
- absorb integration logic that belongs in lib or utils

### Prop and binding rules

- keep containers self-contained
- prefer minimal prop drilling
- import concern-owned dependencies directly inside the container when appropriate
- do not spread hook return objects directly into presenter props

### Structure rules

- folder and file names are prefixed with `container-`
- exported symbol uses `Container...`
- tests are adjacent
- no parent barrel files

## Components

Mandatory rules:

- components are presenter-first and logic-light
- components receive prepared data, state, and handlers through props
- components are server components by default
- add `"use client"` only when hooks, browser APIs, or direct client interactivity are required
- keep heavy client logic out of presenter components

Import boundaries:

Components may import:

- other components
- shared utilities, lib, config, and constants
- external libraries

Components must not import:

- containers
- screens
- actions
- hooks
- contexts
- providers

Props and API rules:

- use narrow, meaningful prop names
- use `children` for composition when it improves flexibility
- avoid huge prop bags
- keep APIs presenter-oriented

Structure rules:

- one public component per folder
- folder and main file share the same name
- private child components may live in the same folder
- colocated `constants.ts`, tests, and stories are allowed
- no parent barrel files

## Reusable Layout Components

Mandatory rules:

- reusable layouts provide structural framing around `children`
- keep them separate from App Router `layout.tsx`
- module-specific layouts stay module-owned
- cross-module frames may be shared

Structure rules:

- folder and file names are prefixed with `layout-`
- exported symbol uses `Layout...`
- tests are adjacent
- no parent barrel files

Props rules:

- `children` is the primary slot
- use explicit structural props such as `header`, `sidebar`, `footer`, or `actions`
- do not turn layouts into business-data wrappers

## Server Actions

Mandatory rules:

- every action implementation file starts with `"use server";`
- actions are module-first by default
- promote actions to `src/shared/actions/` only when they are truly cross-module
- use the shared safe-action clients:
  - `actionClient`
  - `authActionClient`
- do not create new safe-action clients inside action folders
- validate input with a Zod schema via `.inputSchema(...)`
- use parsed input, not raw input

Action design rules:

- actions are thin command boundaries
- reusable service logic belongs in lib, not inline in the action
- return small, intentional result shapes
- surface failures clearly rather than swallowing them

Structure rules:

- one public action per folder
- folder and file names end with `-action`
- export name is `camelCase` ending with `Action`
- tests are adjacent
- no parent barrel files

## Lib Code

Use lib for:

- framework wrappers
- service boundaries
- platform boundaries
- runtime setup with architectural meaning
- shared operational behavior such as logging, fetch clients, auth wrappers, navigation wrappers, or error handling

Exception:

- shared API wrappers live in `src/shared/api/`, not in `lib`

Do not use lib for:

- server action definitions
- Zod schemas
- small pure transforms
- static config
- static constants
- presenter-owned behavior

Public API rules:

- one architectural concern per folder
- leaf `index.ts` exposes the stable public API
- avoid `export *`
- keep helpers private unless they are part of the real contract
- use named exports only

Server and runtime rules:

- mark server-only lib boundaries explicitly
- do not import Node-only modules into browser-safe code
- keep side effects close to the integration boundary

Error rules:

- validate boundary assumptions early
- prefer explicit failures over silent fallbacks
- wrap infrastructure failures in meaningful app errors
- preserve original causes when rethrowing
- reuse the application error hierarchy

## Vendor Wrappers

Use `src/shared/vendor/` for:

- thin project-owned wrappers or adapters around third-party packages
- stabilized internal import surfaces for external UI, provider, system, or helper packages
- external-library integration points that the project intentionally wants to centralize behind shared internal modules

Rules:

- keep vendor wrappers thin and library-specific
- do not place app business logic in vendor wrappers
- prefer `src/shared/vendor/` when the project wants a controlled internal surface over scattered direct package imports
- keep application-specific logic in `components/`, `providers/`, `lib/`, or other owned layers rather than growing vendor wrappers into app code

## Utils

Use utils for:

- pure transforms
- formatters
- parsers
- guards
- normalization helpers

Do not use utils for:

- integrations
- runtime setup
- React logic
- actions
- schemas
- configuration
- domain workflows that deserve a service boundary

Design rules:

- keep functions pure
- use explicit parameters and returns
- avoid hidden side effects
- do not import from actions, hooks, contexts, or lib
- do not depend on React, framework APIs, or browser APIs
- Effect-based typed composition is allowed when it still remains a utility concern

Structure rules:

- one public utility concern per folder
- tests are adjacent
- no parent barrel files
- named exports only

## Schemas and Types

### Schemas

Every schema must be classified before placement:

- model schema - describes what a domain entity is
- validation schema - describes what an operation accepts or returns

Placement rules:

- model schemas live in `src/shared/schemas/models/`
- validation schemas live with the owning feature or in shared code when truly cross-cutting
- every schema lives in its own leaf folder
- schema files use the `.schema.ts` suffix
- `types.ts` must exist for schema-derived types

Naming rules:

- model schema file: domain noun
- validation schema file: include the operation or boundary
- schema constant: `camelCase` ending with `Schema`

Source-of-truth rules:

- Zod is the source of truth for schema-owned types
- derive types with `z.infer<typeof schema>`
- do not hand-duplicate schema-owned types

Export rules:

- re-export both the schema and its derived types
- do not create catch-all top-level schema barrels

### Types

- keep types colocated by default
- promote to shared only when truly cross-cutting and no single owner is obvious
- suffix props with `Props` and option objects with `Options`
- keep contracts minimal and explicit
- do not create catch-all shared type barrels

## Hooks

Mandatory rules:

- hook implementation files begin with `"use client"`
- extract client logic into hooks even when it is currently used only once
- hooks are consumed primarily by containers
- do not import server-only modules into hooks

State rules:

- always use `useImmer`; never use `useState`
- state value must be an object
- maximum one `useImmer({ ... })` call per file
- use `useImmerReducer` for more complex state transitions

API rules:

- one clear responsibility per hook
- prefer object returns for multi-value hooks
- keep APIs small and predictable
- move pure helper logic into utils or private helpers

Integration rules:

- use the shared SWR fetcher for SWR-based client data fetching
- prefer server-side data loading when possible
- check the existing utility-hook library before creating a custom hook
- if a utility hook fits exactly, use it directly; if the project needs added behavior, wrap it in a project-owned hook

Structure rules:

- one public hook per folder
- tests are adjacent
- no parent barrel files
- named exports only

## Contexts

Mandatory rules:

- context folders own the context object and its contracts only
- providers do not belong in context folders
- consumer hooks do not belong in context folders

Flow:

`context -> provider -> hook`

Structure rules:

- one context per folder
- context file name is `<concern>-context.ts`
- colocate `types.ts` for the context value contract
- no parent barrel files

Design rules:

- keep one clear responsibility per context
- prefer multiple focused contexts over one oversized global context
- use context only when props or a plain hook are no longer a good fit

## Providers

Mandatory rules:

- providers own provider components that wrap `children`
- providers are separate from contexts and hooks
- providers become client boundaries only when required
- pass server-prepared data into providers through explicit typed props
- keep one clear responsibility per provider
- compose multiple providers only when a higher-level boundary truly needs one entry point
- do not import server-only modules into providers

Structure rules:

- one provider per folder
- folder and file use the `-provider` suffix
- exported symbol is PascalCase
- no parent barrel files

## Config and Constants

### Config

Use config for:

- app-wide and framework-facing configuration
- validated environment access
- font setup
- i18n routing and request configuration
- shared formatting definitions

Rules:

- keep config declarative and easy to scan
- centralize environment access in the shared env configuration
- do not read `process.env` ad hoc throughout the codebase
- use `NEXT_PUBLIC_` only for values intended for the client
- keep server-only values off the client
- do not create a top-level config barrel
- use `.ts` for config files by default
- use `.tsx` only when the config truly requires JSX or `ReactNode`
- mark server-only config files explicitly
- use default exports only when a framework or integration requires them

### Constants

Use constants for:

- static, behavior-free values
- shared options, identifiers, limits, and mappings
- values with ownership broader than one leaf folder

Rules:

- export names use `SCREAMING_SNAKE_CASE`
- use `as const` when literal inference is useful
- use named exports only
- keep constants static and behavior-free
- do not create barrel files for constants directories

Exception:

If a value supports only one leaf folder, keep it as colocated `constants.ts` instead of promoting it.

## Routes and Navigation

Mandatory rules:

- user-facing route entries normally live under `src/app/[locale]/(public)/...` or `src/app/[locale]/(private)/...` based on access level
- locale-root entry and locale-boundary files may still live directly under `src/app/[locale]/` when they own the locale boundary or root route concern
- route helpers are the single source of truth for user-facing paths
- every route helper exposes a `path()` function
- route helpers return locale-neutral plain strings
- do not expose route-group syntax, slot names, or interceptor syntax in route helpers
- do not hardcode internal path strings across the app

API rules:

- organize shared route helpers by route family
- use `root/`, `public/`, and `private/` as the top-level route-helper grouping shape
- keep a top-level route aggregation entrypoint that exposes the route API
- use `path` consistently
- use descriptive parameter names for dynamic segments
- keep route helper APIs noun-based and stable
- use catch-all route helpers only when the URL contract truly needs arbitrary segments

Consumption rules:

- use route helpers for links, redirects, and route-aware behavior
- use the locale-aware navigation layer instead of manual locale-prefix handling
- use raw path strings only for external URLs or narrow framework-only configuration cases where a route-helper abstraction is not the right fit

## Internationalization and Messages

Mandatory rules:

- all user-facing localized copy lives in the message tree
- organize messages locale-first
- mirror locale structure exactly across locales
- keep matching files and matching keys in every locale
- keep interpolation placeholder names identical across locales
- the Thai locale tree is the type-shape reference for message typing, so its structure must stay authoritative and mirrored exactly by the other locales

Ownership levels:

- `common` for generic app-wide vocabulary
- `shared` for copy owned by shared cross-cutting UI
- `modules` for feature-owned copy

Namespace rules:

- namespace shape must match aggregation shape
- message placement mirrors the owner that renders the copy
- do not centralize unrelated owners into a catch-all file

JSON rules:

- filenames are `kebab-case`
- keys are `camelCase`
- content only: no logic, no behavior flags, and no ad hoc markup
- only the supported rich-text tags may appear in message values
- rich-text tags and interpolation placeholders must stay aligned across locales
- interpolation uses stable placeholder names

Aggregation rules:

- add explicit `index.ts` files at every level that contributes to the messages object
- keep aggregation static and explicit

## Styling

### Styling priority

Use styling layers in this order:

1. Chakra style props
2. Chakra theme configuration or global theme CSS
3. CSS Modules
4. shared global CSS

### Shared rules

- do not use inline `style` objects
- if inline style is truly unavoidable, add an explicit lint-disable reason
- prefer CSS variables over hardcoded design literals
- use Chakra CSS variables first, then project-owned custom properties, then literals only for narrow exceptions

### Shared global CSS

- use shared global CSS only for cross-application browser-level concerns
- import each global CSS file once from an app-level boundary
- keep one global concern per file
- do not use shared global CSS for component-specific styling
- do not create barrel-style CSS entries

### CSS Modules

- keep CSS Modules beside the component or layout they style
- use class names that describe the local role, such as `.root`, `.container`, `.heading`, or `.actions`
- keep selectors narrow and intentional
- avoid deep descendant selectors when a local class is clearer
- avoid global selectors inside CSS Modules unless the escape is truly necessary

### CSS property order

Use this declaration group order, with one blank line between groups:

1. position and z-index
2. display, flex, and grid
3. box model
4. typography
5. visual

Within each group:

- alphabetize properties
- keep vendor-prefixed properties directly above their standard property when paired
- use exactly one blank line between declaration groups
- do not add comment lines just to label the groups

Within the box-model group, use this order:

- margin
- border
- border-radius
- box-sizing
- padding
- height
- min-height
- max-height
- width
- min-width
- max-width
- overflow

### Motion

- import animation primitives from `motion/react`
- keep animation concerns in client leaves
- prefer server-rendered structure around small animated client surfaces

## Images and Static Assets

Ownership rules:

- source-owned imported images live with the narrowest owner first
- shared image assets are only for truly cross-module assets
- URL-addressed public assets belong in the public asset area

Naming rules:

- use `kebab-case`
- include a meaningful asset role when helpful, such as `logo-`, `icon-`, `banner-`, `illustration-`, or `empty-state-`
- avoid revision names such as `final`, `v2`, or `new`

Structure rules:

- keep image folders shallow
- group only by clear concern when needed
- do not create barrel files for image folders
- do not place code or React icon components in image folders

Recommended format choices:

- `svg` for logos, icons, and vector illustrations
- `webp` or `avif` for banners and raster artwork
- `png` when transparency or source constraints require it
- `jpg` or `jpeg` mainly for photos without transparency needs

## Testing

Mandatory rules:

- tests are colocated with the unit they verify
- use `.test.tsx` for React tests and `.test.ts` for non-React tests
- shared test support is for reusable infrastructure only
- do not move feature-specific tests into shared test support
- test behavior, not implementation details
- prefer meaningful public behavior, visible text, landmarks, validation behavior, and dependency calls over low-value assertions
- thin route-entry files are not the primary unit-test target
- prefer testing screens, containers, components, actions, lib, hooks, and utils below route boundaries

Server-side testing rules:

- call async server components directly and await the JSX before rendering
- mock `server-only` when importing server-guarded modules into tests

Mocking rules:

- use `vi.mock(...)` for module mocks
- use `vi.hoisted(...)` when a mock must exist before module evaluation
- clear mocks between tests when shared call history matters

Shared helper rules:

- use the shared provider-aware render helper when UI tests need the app provider stack
- use the shared test setup for global test bootstrapping only
- for UI that consumes URL query-state hooks, use the project query-state testing adapter rather than recreating URL state by hand
- follow the surrounding local Vitest style consistently rather than arbitrarily mixing globals with explicit helper imports
- do not write barrel-file tests just for coverage

Testing environment defaults:

- test runner: Vitest
- DOM environment: jsdom
- globals: enabled
- DOM matchers: `@testing-library/jest-dom`
- shared setup file: the project test setup entrypoint

Coverage thresholds:

- statements: `80`
- functions: `80`
- lines: `80`
- branches: `75`

## Storybook

Mandatory rules:

- stories are only for presenter components
- do not create stories for screens, containers, layouts, providers, or hooks
- colocate story files beside the component they document
- name story files `{component-name}.stories.tsx`
- export a default `meta` object using `satisfies Meta<typeof Component>`
- import Storybook types with `import type`
- provide at least a `Default` story

Title and layout rules:

- story titles match the component's logical filesystem path from the source tree
- use `centered` for self-contained components
- use `fullscreen` for page-wide presenter components
- use `padded` when default padding is the right fit

Server-component story rules:

- include a locale arg in `meta` when locale is required
- read locale from Storybook globals in the render function
- provide an English fallback when the global is not set
- rely on the shared Storybook provider stack rather than recreating wrappers locally
- keep stories compatible with both supported locales and both color modes

Storybook environment rules:

- Storybook infrastructure is owned centrally rather than ad hoc inside stories
- `main.ts` owns framework selection, addons, Vite customization, aliasing, and async server-rendering support
- keep async server-component rendering enabled in the shared Storybook configuration
- `preview.tsx` owns the global decorators, toolbar globals, and shared provider chain
- the shared preview decorator reads locale and color mode from toolbar globals and keeps server-side locale mocks in sync
- `preview-head.html` owns shared font preloading for story rendering
- `.storybook/vitest.setup.ts` owns the portable-stories Vitest setup for Storybook-integrated test execution
- shared mock files own browser-safe replacements for server-only and server-side localization modules
- use the shared Storybook provider stack for locale, query-state, and UI system setup
- rely on the shared server-only mock instead of creating ad hoc browser-safe replacements
- rely on the shared server-side localization mock instead of inventing one-off translation stubs
- use the built-in locale toolbar for English and Thai review
- use the built-in color-mode toolbar for light and dark review
- keep stories compatible with async server rendering support in the existing Storybook configuration
- preserve the shared font setup for code rendering and Thai text rendering in story previews

Recommended practices:

- add named variants for visual states, loading, empty, error, disabled, and edge cases
- use accessibility checks as part of story review

## Specialized Library Policies

### Effect

Use Effect as the mandatory typed async and error-handling library for shared API wrappers.

Placement rule:

- shared API wrappers live in `src/shared/api/`

Mandatory rules:

- every shared API wrapper returns an `Effect`
- every API-facing error is represented by a typed error class with a `readonly _tag` discriminant
- wrap HTTP calls with `Effect.tryPromise`
- keep one main exported operation per shared API file
- keep typed API error classes in the same file or a close sibling error module when they are shared
- keep using the existing fetch infrastructure; Effect wraps it rather than replacing it
- actions and server containers terminate Effect pipelines with `Effect.runPromise()` at the boundary
- normal React rendering layers never import Effect
- server containers are the explicit rendering-boundary exception and may import Effect only to execute the pipeline and hand ordinary data to the render tree
- Zod remains the validation standard; do not replace it with Effect schema
- safe-action remains the action-binding standard; do not replace it with Effect

Recommended practices:

- keep one main exported operation per shared API file
- map infrastructure failures into domain-specific typed errors
- use Effect freely inside non-UI logic layers such as shared libraries, module libraries, and utilities when it improves composition or resilience

### nuqs

Use nuqs for all URL-driven state.

Mandatory rules:

- never parse query state manually in client code
- always use typed parsers
- apply `.withDefault()` unless a value is intentionally optional or nullable
- prefer `useQueryStates` when handling two or more params together
- parse query state on the server with `createLoader`
- define shared search-param descriptors that can be reused by both server parsing and client hooks
- keep URL-state ownership at the route boundary, container, and hook layers
- components receive prepared values as props and do not call nuqs directly
- actions do not read URL state directly
- rely on the root-level Nuqs adapter instead of creating extra adapters in leaf features

Recommended practices:

- use serializer helpers when building URLs or redirects from query descriptors
- keep reusable query-state logic in hooks rather than presenters

### ts-pattern

Use ts-pattern for complex branching.

Mandatory rules:

- use `match(...).exhaustive()` for discriminated unions, nested structural branching, tuple-based branching, or any branching with three or more meaningful branches
- use simple `if` or `else` for one or two trivial branches
- use `.otherwise()` only for genuinely open-ended input
- do not mix partial `if` chains with `match()` inside the same branching function
- import from `ts-pattern` using `match` and `P`

Recommended practices:

- use tuple matching for reducer-like state and event logic
- use `P.select` or `isMatching` when they make narrowing clearer
- use ts-pattern at boundaries after Effect results have been materialized, rather than letting Effect leak into rendering code

### Zag.js

Treat raw Zag.js as an escape hatch for custom headless state machines.

Mandatory rules:

- prefer Chakra UI or Ark UI first
- use raw Zag.js only when higher-level primitives do not cover the need well
- use the service-based API pattern with the exported `machine`, `useMachine`, `connect`, and `normalizeProps`
- always provide a stable id via `useId()`
- use `splitProps` when building reusable wrappers around machine props and local props

Recommended practices:

- if external state must control a machine, still follow the project's state-management convention instead of falling back to ad hoc local state patterns
- reserve raw Zag.js for bespoke headless widgets or machine composition, not as the default UI starting point

## Error Handling

Mandatory rules:

- do not swallow errors silently
- do not return success-shaped fallbacks that hide real failures
- surface or rethrow errors that match the application's error model
- prefer meaningful domain or application-specific errors over generic `Error` when the domain is clear

Recommended practices:

- validate early
- catch only where you can add value
- preserve original causes and debugging context when rethrowing

## Comments and Readability

Mandatory rules:

- comments must add value
- do not write comments that merely restate the code
- use comments only for framework constraints, non-obvious intent, unusual tradeoffs, browser quirks, or justified exceptions

Recommended practices:

- prefer expressive naming over explanatory comments
- keep comments concise

## Package Management and Tooling

Mandatory rules:

- use npm only
- install dependencies with exact versions:
  - `npm install -E <package>`
  - `npm install -E -D <package>`
- keep the lockfile committed and in sync
- use the existing repository scripts for formatting, linting, type-checking, testing, and Storybook
- fix code to satisfy tooling rather than working around the toolchain
- do not introduce overlapping package managers or parallel toolchains for the same concern

Recommended practices:

- reuse the project's existing libraries and abstractions before adding new dependencies

## Explicit Exceptions

### App Router error boundaries

Only App Router error boundaries and their dedicated shared delegates may:

- use hooks directly inside the component
- import actions directly

This exception exists because those files sit above the normal container layer. Do not generalize it elsewhere.

### Framework-required default exports

Default exports are allowed only where the framework or integration explicitly requires them, such as:

- route entry files
- route layout files
- special App Router files
- specific framework configuration entry points

### Inline body style in `global-error.tsx`

Inline body style is allowed there only with an explicit lint-disable reason.

## Canonical Decisions

- stories are limited to presenter components; broader visual examples do not override this rule
- the canonical safe-action validation style is `.inputSchema(...)`
- locale setup belongs to route-entry and locale-boundary files, not to deeper presentation layers
- URL state belongs to route parsing, containers, and hooks, not to actions or presenter components
- raw Zag.js is an escape hatch, not the default UI primitive choice
- Effect belongs in `src/shared/api/` and non-UI logic layers; server containers may use it only as a boundary runner, while normal React rendering layers do not import it

## Quick Placement Map

- route entry -> `page.tsx`
- module-level page UI -> `screens/`
- logic binding -> `containers/`
- presenter UI -> `components/`
- server action -> `actions/`
- client interaction logic -> `hooks/`
- validation contract -> `schemas/`
- vendor wrapper or vendored third-party adapter -> `src/shared/vendor/`
- shared API wrapper -> `src/shared/api/`
- reusable service logic -> `lib/`
- reusable structural frame -> `layouts/`
- app setup or static values -> `config/` or `constants/`

## Coverage Checklist

- core engineering mindset
- ownership and project shape
- leaf-folder convention
- TypeScript rules
- naming and casing
- event naming
- imports and exports
- server-first boundaries
- App Router pages
- App Router layouts
- App Router special files
- screens
- containers
- components
- reusable layouts
- server actions
- lib code
- utils
- schemas
- types
- hooks
- contexts
- providers
- config
- constants
- routes and navigation
- internationalization and messages
- styling
- motion
- images and static assets
- testing
- Storybook
- Effect policy
- nuqs policy
- ts-pattern policy
- Zag.js policy
- error handling
- comments and readability
- package management and tooling
- explicit exceptions
- canonical decisions
