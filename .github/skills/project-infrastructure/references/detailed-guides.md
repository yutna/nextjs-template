# Detailed Guides for Project Infrastructure

This reference contains the full detailed guides for all six project
infrastructure concern areas: config, constants, providers, hooks, contexts,
and utils.

## Config Folder Style Guide

This guide defines how to write and organize shared configuration inside
`src/shared/config`.

Use `shared/config` for application-wide and framework-facing configuration
that shapes how the app runs. This folder is for declarative setup such as
environment validation, font configuration, i18n routing, request config, and
formatting definitions.

### Decide Whether Code Belongs in Config

Put code in `shared/config` when it does one or more of the following:

- defines shared application or framework configuration
- centralizes setup values consumed by app entry points, providers, or shared
  infrastructure
- declares runtime configuration in a mostly data-oriented or framework-oriented
  way
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

- if the file mainly configures how the app or a framework behaves, `config/` is
  usually correct
- if the file mainly stores fixed domain values, it is probably a `constants/`
  concern
- if the file mainly performs behavior, orchestration, or integration work, it is
  probably a `lib/` concern

### Scope and Ownership

`src/shared/config` is for configuration with app-wide ownership.

Good fits:

- environment schema and runtime env access
- shared font registration
- i18n routing and request configuration
- formatting definitions used across providers, layouts, or shared
  infrastructure

Avoid putting feature-owned settings in `shared/config` just because they feel
important. If a configuration concern belongs clearly to one module, keep it
with that module unless the repository later introduces a dedicated module config
pattern.

Promote a concern to `shared/config` only when:

- multiple unrelated parts of the app depend on it
- it configures a shared framework boundary
- there is one obvious app-wide owner

### Standalone Files vs Nested Config Concern Folders

Use the simplest structure that matches the concern.

#### Standalone File for One-File Concerns

Prefer a standalone file when the concern is small and self-contained.

Current examples:

- `src/shared/config/env.ts`
- `src/shared/config/fonts.ts`

Good fits:

- one env entrypoint
- one font registration file
- one small framework config object

#### Nested Folder for Multi-File Concerns

Create a nested concern folder when one shared configuration area has multiple
closely related files.

Current example:

```text
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
- create a nested folder only when one configuration concern naturally splits
  into several related files
- name the folder after the concern, such as `i18n`
- keep nested folders focused on one configuration concern
- do not create `src/shared/config/index.ts`

Prefer direct imports from the actual config file, such as
`@/shared/config/i18n/routing`, instead of adding barrel layers.

### Naming

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

Prefer descriptive noun-style exports over generic names like `data`, `options`,
or `settings`.

### File Design

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

If a file starts becoming an operational service or wrapper around external
systems, it likely belongs in `lib/` instead.

### TypeScript and Runtime Boundaries

Match the repository's strict TypeScript style.

- use `.ts` by default
- use `.tsx` only when the configuration requires JSX or `ReactNode`, such as
  rich-text translation defaults
- type config objects explicitly when the framework provides a useful contract,
  such as `Formats`
- prefer named exports by default
- allow a default export only when a framework or library expects it explicitly

Examples from the current repository:

- `formats.ts` exports `formats: Formats`
- `request.tsx` default-exports `getRequestConfig(...)` because the next-intl
  integration expects that pattern

Respect runtime boundaries:

- add `import "server-only";` when a config file is server-only
- add `"use client"` only when a config file truly configures client-only
  behavior
- do not read `process.env` throughout the app; centralize that through shared
  config entrypoints such as `env.ts`

### Boundaries With Nearby Folders

This guide stays focused on `shared/config`, so nearby folders are mentioned
only to define the boundary.

- use `config/` for shared app or framework configuration
- use `constants/` for static values that are not themselves configuration
- use `lib/` for runtime integrations, wrappers, and architectural behavior
- use `utils/` for pure helper logic
- use `providers/` or app route files to consume config, not to redefine it

Examples from the current repository:

- `LOCALES` and `TIME_ZONE` live in `shared/constants`
- `routing` consumes `LOCALES` from `shared/constants/locale`
- `request.tsx` wires config together and consumes shared constants and shared
  lib logging

### Config Examples

#### Good Standalone Config

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

#### Good Nested Config Concern

```text
src/shared/config/i18n/
├── formats.ts
├── request.tsx
└── routing.ts
```

This keeps one shared concern together without flattening unrelated config files
into the top level.

### Config Checklist

Before adding a file to `src/shared/config`, check:

- does this file configure app-wide or framework-wide behavior?
- is `config/` a clearer home than `constants/`, `lib/`, or a feature folder?
- should this concern stay a standalone file, or has it grown into a multi-file
  concern folder?
- is the file name specific and kebab-case?
- are exports explicit and named unless a framework requires a default export?
- are runtime boundaries clear (`server-only` or `"use client"` only when
  needed)?
- is environment access centralized instead of scattered across the codebase?

## Constants Folder Style Guide

This guide defines how to organize dedicated constants inside
`src/shared/constants` and `src/modules/<module-name>/constants`.

Use these folders for static values that are intentionally shared across a broad
app area, without owning runtime setup, business logic, or framework
integration.

### Decide Whether Code Belongs in Constants

Put values in a dedicated `constants` folder when they do one or more of the
following:

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

- runtime configuration or environment setup → use `config/`
- pure helper functions → use `utils/`
- validation schemas → use `schemas/`
- framework wrappers, integrations, or architectural code → use `lib/`
- values that only support one leaf folder → keep them in that folder's
  colocated `constants.ts`

Rule of thumb:

- if the value is static and its ownership is broader than one leaf folder,
  `constants/` is usually correct
- if the value only exists to support one component, hook, layout, screen, or
  lib module, colocated `constants.ts` is usually better

### Dedicated Constants vs Colocated constants.ts

#### Use Colocated constants.ts When Values Belong to One Leaf Folder

Good fits:

- animation variants for one component
- static arrays or code samples used by one section
- implementation details for one lib module
- small UI-only mappings used by one screen or layout

Examples already present in the repository:

- `src/modules/static-pages/components/section-features/constants.ts`
- `src/shared/lib/fetcher/constants.ts`

#### Use Dedicated Folder When Values Have Broader Ownership

Good fits:

- locales used by routing, navigation, and UI
- a module-wide set of tabs, filters, or statuses shared by several screens and
  hooks
- app-wide constants used by multiple unrelated areas

Examples already present in the repository:

- `src/shared/constants/locale.ts`
- `src/shared/constants/timezone.ts`

Do not move local implementation constants into a dedicated `constants/` folder
just to make the tree look more uniform. Promote only when ownership is clearly
broader than one leaf folder.

### Constants Scope and Placement

Choose the narrowest valid scope first.

#### Module-Level Constants

Prefer module-level constants when the values are shared within one feature
module.

Good fits:

- order statuses used by several orders screens
- checkout step identifiers used across module hooks and components
- profile preference options used throughout one profile module

Examples:

- `src/modules/orders/constants/order-status.ts`
- `src/modules/checkout/constants/checkout-step.ts`

#### Shared Constants

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

### Keep Constants Static and Boring

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

If a file starts needing logic, parsing, validation, or runtime setup, it
probably belongs somewhere other than `constants/`.

### Constants File and Folder Structure

Follow the repository's kebab-case convention for files and folders.

For dedicated constants folders, prefer standalone files named by concern:

```text
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
- do not create one folder per constant concern unless the repository convention
  changes
- do not create `src/shared/constants/index.ts`
- do not create `src/modules/<module-name>/constants/index.ts`

Keep dedicated constants folders flat unless a future repository convention
requires otherwise.

### Constants Naming

#### File Names

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

Inside a dedicated `constants/` folder, the path should already tell the reader
these are constants. The file name should add the domain meaning.

#### Export Names

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

The export name should explain the value without depending on the import site
for context.

### Constants Exports and Typing

Export constants directly from their file.

Prefer:

```ts
export const LOCALES = ["th", "en"] as const;

export const TIME_ZONE = "Asia/Bangkok" as const;
```

Use `as const` when literal inference is meaningful and helps derive narrow
unions safely.

Example:

```ts
export const ORDER_STATUSES = ["draft", "submitted", "paid"] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];
```

If a constants file needs a related type, it is acceptable to export that type
from the same file when the type is tightly coupled to the constant values.

Keep exports small and explicit:

- prefer named exports
- avoid default exports
- avoid re-export chains for constants folders

### Constants Boundaries With Nearby Folders

- use `constants/` for static shared or module-wide values
- use colocated `constants.ts` for values owned by one leaf folder
- use `config/` for environment-aware or runtime configuration
- use `utils/` for helper functions and transformations
- use `lib/` for integrations, wrappers, and architectural behavior
- use `schemas/` for validation contracts

If the value needs runtime setup, it is probably not a `constants` concern.
If the value only supports one implementation folder, it probably should stay
colocated.

### Constants Examples

#### Good Shared Constants

```ts
// src/shared/constants/locale.ts
export const LOCALES = ["th", "en"] as const;
```

```ts
// src/shared/constants/timezone.ts
export const TIME_ZONE = "Asia/Bangkok" as const;
```

#### Good Module Constants

```ts
// src/modules/orders/constants/order-status.ts
export const ORDER_STATUSES = ["draft", "confirmed", "shipped"] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];
```

#### Better Kept Colocated

```ts
// src/modules/static-pages/components/section-features/constants.ts
export const FEATURE_COLORS = ["blue", "purple", "green"] as const;
```

This value supports one component concern, so colocating it is clearer than
moving it into a module-wide constants folder.

### Constants Checklist

Before adding a file to `shared/constants` or
`modules/<module-name>/constants`, check:

- are these values static and behavior-free?
- is ownership broader than one leaf folder?
- is `constants/` clearer than colocating a `constants.ts` file?
- is the scope correct: module first, shared only when truly cross-module?
- is the file name specific and kebab-case?
- are exported constant names descriptive and `SCREAMING_SNAKE_CASE`?
- are the exports direct, named, and easy to import?

## Providers Folder Style Guide

This guide defines how to write and organize provider components inside
`src/shared/providers` and `src/modules/<module-name>/providers`.

Use these folders for provider components that expose one concern or compose
multiple providers at a higher boundary.

### Decide Whether Code Belongs in Providers

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
- UI folders when the file is primarily rendering and not providing subtree
  state or dependencies

Rule of thumb:

- if the file's main job is wrapping `children` in one or more providers,
  `providers/` is usually correct
- if the file defines the context primitive, it belongs in `contexts/`

### Providers Scope and Placement

Choose the narrowest valid scope first.

#### Module-Level Providers

Prefer module-level providers when the provider is owned by one feature module.

Good fits:

- order filters provider
- checkout flow provider
- profile editor provider

Examples:

- `src/modules/orders/providers/order-filters-provider/`
- `src/modules/checkout/providers/checkout-flow-provider/`

#### Shared Providers

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

### Providers Boundaries With Other Folders

- use `providers/` for provider components
- use `contexts/` for context objects and context-owned contracts
- use `hooks/` for consumer hooks
- use `layouts/` or route boundaries to place providers where they should wrap UI

Recommended flow:

```text
contexts/  →  providers/  →  hooks/
```

The provider depends on the context. Consumers depend on hooks. Rendering layers
depend on providers.

### Providers File and Folder Structure

Follow the repository's kebab-case convention for files and folders.

Each provider should live in its own leaf folder:

```text
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
- do not create parent barrel files for `src/shared/providers` or
  `src/modules/<module-name>/providers`
- keep provider composition helpers inside the same folder when they are
  private to that provider

### Providers Naming

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

- use PascalCase provider component names such as `AppProvider` and
  `OrderFiltersProvider`
- keep names meaningful when imported elsewhere

### Providers Client Boundaries

Provider components in this codebase should be treated as client-side
boundaries.

- place `"use client"` at the top of provider implementation files when required
- keep provider logic in the client layer
- do not import server-only modules into providers
- pass server-prepared data into providers through explicit props

If a provider needs server-derived initial data:

- prepare the data before the provider boundary
- pass it through typed props
- keep the provider focused on client-side sharing and composition

### Provider Design Rules

Providers should stay narrow and intentional.

- keep one clear responsibility per provider
- compose multiple providers only when a higher-level boundary truly needs one
  entry point
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

### Providers TypeScript Rules

Match the repository's strict TypeScript style.

- type provider props clearly
- keep provider-owned contracts in local `types.ts`
- use `interface` for object-shaped provider props
- use `import type` for type-only imports

Good fits for provider-local `types.ts`:

- provider props
- composition-specific prop contracts

Do not move provider-owned contracts into `src/shared/types` unless they become
truly cross-cutting and are no longer clearly owned by one provider.

### Providers Relationship to Contexts

Providers should consume context primitives from `contexts/` rather than
redefining them.

Good direction:

```text
src/modules/orders/contexts/order-filters/
└── order-filters-context.ts

src/modules/orders/providers/order-filters-provider/
└── order-filters-provider.tsx
```

The provider owns provider behavior. The context folder owns the context object.

### Providers Testing

Every non-trivial provider should have adjacent tests.

- use Vitest and Testing Library
- test the provider through consumer behavior where practical
- verify that provider props seed state correctly
- test composition providers by checking that children render within the
  expected provider boundary

Typical provider tests should cover:

- children rendering
- initial prop handling
- provider updates exposed through consumers
- composition behavior for multi-provider wrappers

### Providers Example Patterns

#### Good Shared Provider

```text
src/shared/providers/app-provider/
├── app-provider.tsx
├── index.ts
└── types.ts
```

Why it fits:

- app-wide ownership is clear
- one provider concern owns one folder
- composition is explicit

#### Good Module Provider

```text
src/modules/orders/providers/order-filters-provider/
├── index.ts
├── order-filters-provider.tsx
└── types.ts
```

Why it fits:

- provider is owned by one module
- it stays separate from the raw context definition
- the boundary is clear to consumers

#### Good Provider Leaf Export

```ts
export { OrderFiltersProvider } from "./order-filters-provider";
export type { OrderFiltersProviderProps } from "./types";
```

### Providers Checklist

Before adding a provider, check:

- is the file really a provider component?
- should it live in a module first, or is it truly shared?
- does one provider own one folder?
- is it separate from the raw context definition?
- are client boundaries explicit?
- are props typed clearly?
- are tests covering provider behavior or composition?

## Hooks Folder Style Guide

This guide defines how to write and organize user-authored custom hooks inside
`src/shared/hooks` and `src/modules/<module-name>/hooks`.

Use these folders for custom React hooks that package reusable client-side
behavior behind a stable `use*` API.

### Decide Whether Code Belongs in Hooks

Put code in a `hooks` folder when it does one or more of the following:

- uses React hooks internally
- packages reusable client-side state or effect logic
- provides a stable `use*` API consumed by components, containers, screens, or
  layouts
- coordinates browser-aware behavior that belongs close to UI usage

Examples:

- URL or search-param state hooks
- viewport or media-query hooks
- form interaction hooks
- reusable UI state hooks such as disclosure, selection, or filters

Do **not** put code in `hooks` when it belongs somewhere more specific:

- `lib/` for infrastructure, integrations, or framework wrappers without a
  hook-shaped UI API
- `utils/` for pure functions with no React hook behavior
- `contexts/` for the context object itself
- `providers/` for provider components
- UI folders only when the code is truly view-only and does not represent
  extracted logic

Rule of thumb:

- if the abstraction is consumed as `useSomething()`, `hooks/` is usually
  correct
- if the logic is pure and React-free, it is probably not a hook

### Hooks Scope and Placement

Choose the narrowest valid scope first.

#### Module-Level Hooks

Prefer module-level hooks when the behavior is owned by one feature module.

Good fits:

- order filter state
- checkout step navigation
- profile editor draft state

Examples:

- `src/modules/orders/hooks/use-order-filters/`
- `src/modules/checkout/hooks/use-checkout-step/`

#### Shared Hooks

Promote a hook to shared only when it is truly cross-module and generic enough
to be reused outside one feature.

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

### Hooks Boundaries With Other Folders

- use `hooks/` for extracted hook logic, including logic separated for clarity
  and testability even when reuse is currently local
- use `contexts/` for context objects
- use `providers/` for provider components
- use `lib/` for non-hook infrastructure or integration code
- use `utils/` for pure React-free helpers
- use UI folders when the file is primarily rendering and the extracted logic
  does not need its own hook abstraction

If a function can run without React and is mainly data transformation, it likely
belongs outside `hooks/`.
If a hook consumes context through `useContext`, the hook still belongs in
`hooks/`, not in `contexts/`.

### Hooks File and Folder Structure

Follow the repository's kebab-case convention for files and folders.

Each custom hook should live in its own leaf folder:

```text
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
- do not create parent barrel files for `src/shared/hooks` or
  `src/modules/<module-name>/hooks`
- add helper files only when they materially improve clarity

If a hook needs private helpers, keep them inside the same hook folder so
ownership stays obvious.

### Hooks Naming

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
- use camelCase hook identifiers derived from the file name, such as
  `useLocalStorage` and `useOrderFilters`
- use names that still make sense when imported elsewhere

### Hooks Client and Server Boundaries

Custom hooks are client-side abstractions.

- place `"use client"` at the top of custom hook implementation files
- do not put custom hooks in server-only files
- keep browser-only logic inside hooks or their private helpers rather than
  leaking it across consumers
- do not import server-only modules into hooks

If a concern spans both server and client:

- keep server work outside the hook
- pass the hook the client-usable data it needs
- keep the hook focused on client behavior and client state

Rule of thumb:

- server data preparation happens before the hook
- hook logic happens in the client layer

### Hooks API and Return-Shape Guidance

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

### Hooks TypeScript Rules

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

Do not move hook-owned contracts into `src/shared/types` unless they become
truly cross-cutting and are no longer clearly owned by the hook.

### Hook Design Rules

Hooks should stay cohesive and UI-facing.

- keep one clear responsibility per hook
- compose smaller hooks when needed instead of growing one large hook
- keep side effects explicit and understandable
- derive values when possible instead of storing redundant state
- move pure helper logic into local helper files or `utils/` when React is not
  required

Good fits:

- state coordination
- browser event subscriptions
- reusable UI interaction state
- adapting a context or client API into a focused hook API

Usually not a fit:

- generic pure formatting helpers
- direct infrastructure clients
- view-only code with no hook-shaped behavior

### Hooks Testing

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

### Hooks Example Patterns

#### Good Shared Hook

```text
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

#### Good Module Hook

```text
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

#### Good Hook Leaf Export

```ts
export { useOrderFilters } from "./use-order-filters";
export type { UseOrderFiltersOptions, UseOrderFiltersReturn } from "./types";
```

### Hooks Checklist

Before adding a custom hook, check:

- does it truly need to be a reusable `use*` abstraction?
- should it live in a module first, or is it truly shared?
- does one hook own one folder?
- is the name descriptive and hook-shaped?
- is `"use client"` present where needed?
- is the API focused and predictable?
- are types colocated when the hook owns them?
- are tests covering the public behavior?

## Contexts Folder Style Guide

This guide defines how to write and organize user-authored React contexts inside
`src/shared/contexts` and `src/modules/<module-name>/contexts`.

Use these folders for the context object and its context-owned contracts. Keep
providers in `providers/` and consumer hooks in `hooks/`.

### Decide Whether Code Belongs in Contexts

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

- if the file's main job is defining the context object, `contexts/` is usually
  correct
- if the file's main job is providing or consuming that context, it belongs
  elsewhere

### Contexts Scope and Placement

Choose the narrowest valid scope first.

#### Module-Level Contexts

Prefer module-level contexts when the context is owned by one feature module.

Good fits:

- order filter context
- checkout flow context
- profile editor context

Examples:

- `src/modules/orders/contexts/order-filters/`
- `src/modules/checkout/contexts/checkout-flow/`

#### Shared Contexts

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

### Contexts Boundaries With Other Folders

- use `contexts/` for the context object and context-owned contracts
- use `providers/` for provider components built on top of those contexts
- use `hooks/` for consumer hooks that wrap `useContext`
- use `types.ts` inside the context folder when the context owns those contracts

Recommended flow:

```text
contexts/  →  providers/  →  hooks/
```

The context is the primitive. The provider exposes it to a subtree. The hook
gives consumers a clean API.

### Contexts File and Folder Structure

Follow the repository's kebab-case convention for files and folders.

Each context should live in its own leaf folder:

```text
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
- do not create parent barrel files for `src/shared/contexts` or
  `src/modules/<module-name>/contexts`
- keep provider and consumer hook files out of `contexts/`

### Contexts Naming

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
- use descriptive exported names such as `OrderFiltersContext` and
  `UiPreferencesContext`
- keep names meaningful when imported elsewhere

### Contexts Client Boundaries

React context creation in this codebase should be treated as a client-side
concern.

- place `"use client"` in context implementation files when required
- do not import server-only modules into contexts
- keep server data preparation outside the context folder
- keep the context file focused on the context primitive and its owned contracts

If server data needs to reach consumers:

- prepare that data before the provider boundary
- pass it into the provider through explicit props
- keep the context definition itself free of server-only concerns

### Contexts TypeScript Rules

Match the repository's strict TypeScript style.

- keep context-owned contracts in local `types.ts`
- type the context value shape explicitly
- use `interface` for object-shaped context value contracts
- use `import type` for type-only imports
- keep the context value shape owned by the context folder, not scattered across
  providers and hooks

Good fits for context-local `types.ts`:

- context value interface
- default-value helper types
- other contracts shared by the context file and provider

Do not move context-owned contracts into `src/shared/types` unless they become
truly cross-cutting and are no longer clearly owned by one context.

### Context Design Rules

Contexts should stay narrow and intentional.

- keep one clear responsibility per context
- prefer multiple focused contexts over one oversized global context
- use context only when props or a plain hook are no longer a good fit
- keep the context value explicit and understandable
- move pure helper logic into local helpers or `utils/` when React is not
  required

Good fits:

- shared subtree state
- feature-scoped coordination state
- shared client-side dependency access

Usually not a fit:

- pure formatting helpers
- app-wide miscellaneous dumping grounds
- server-only dependencies

### Contexts Testing

Contexts usually do not need heavy direct tests on their own.

- test context behavior through the provider and consumer hook when that is
  clearer
- add direct tests only when the context folder owns meaningful logic beyond a
  simple context definition
- keep tests adjacent to the context concern if they exist

### Contexts Example Patterns

#### Good Shared Context

```text
src/shared/contexts/ui-preferences/
├── index.ts
├── types.ts
└── ui-preferences-context.ts
```

Why it fits:

- one context owns one folder
- provider and hook stay out of the context folder
- shared ownership is clear

#### Good Module Context

```text
src/modules/orders/contexts/order-filters/
├── index.ts
├── order-filters-context.ts
└── types.ts
```

Why it fits:

- context is owned by one module
- the folder contains only the context concern
- provider and hook can evolve independently in their own folders

#### Good Context Leaf Export

```ts
export { OrderFiltersContext } from "./order-filters-context";
export type { OrderFiltersContextValue } from "./types";
```

### Contexts Checklist

Before adding a context, check:

- does the concern really need React context?
- should it live in a module first, or is it truly shared?
- does one context own one folder?
- is the folder focused on the context object and its contracts only?
- are provider and consumer pieces kept out of `contexts/`?
- are client boundaries explicit?
- are types colocated when the context owns them?

## Utils Folder Style Guide

This guide defines how to write and organize code inside `src/shared/utils` and
`src/modules/<module-name>/utils`.

Use these folders for small, framework-light utilities that are easy to reuse
and test. Keep the guide aligned with the repository's existing TypeScript,
naming, and testing conventions.

### Decide Whether Code Belongs in Utils

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

- `lib/` for infrastructure, integrations, shared service wrappers, or code with
  stronger architectural meaning
- `schemas/` for Zod schemas and validation contracts
- `actions/` for server actions
- `hooks/` for React hook logic
- component or screen folders for logic used by only one UI feature
- `constants/` or `config/` for static values and configuration

Rule of thumb:

- If the code mainly translates data, checks values, or formats output, `utils`
  is usually correct.
- If the code owns app behavior, talks to external systems, or encodes domain
  workflows, it likely belongs elsewhere.

### Utils Scope and Placement

Choose the narrowest valid scope first.

#### Module-Level Utils

Prefer module-level utils when the utility is only relevant to one feature
module.

Examples:

- `src/modules/static-pages/utils/format-stat.ts`
- `src/modules/orders/utils/build-order-label.ts`

#### Shared Utils

Promote a utility to shared only when it is truly cross-module and generic
enough to be reused without leaking feature-specific language.

Examples:

- `src/shared/utils/format-number.ts`
- `src/shared/utils/is-non-empty-string.ts`

Avoid moving code to `shared` too early. Start local to the module unless reuse
is already proven or clearly intended.

### Utils File and Folder Structure

Follow the project's kebab-case convention for files and folders.

#### One Utility Per Folder

Each utility should live in its own folder, even when it exports only one
public function.

```text
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
- do not create parent barrel files for `shared/utils` or
  `modules/<module>/utils`
- do not group multiple public utilities into one folder

### Utils Naming

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

- use descriptive verb names for transformers and actions: `formatCurrency`,
  `normalizePhoneNumber`, `buildSearchParams`
- use `is*`, `has*`, or `can*` for booleans and type guards
- use `assert*` for functions that throw on invalid state
- use noun names only for true values or constants

### Utils Function Design

Utilities should be small, predictable, and explicit.

- Prefer pure functions with no hidden side effects.
- Make dependencies obvious through parameters instead of reading mutable
  external state.
- Return values instead of mutating inputs unless mutation is the explicit
  purpose.
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

### Utils TypeScript Rules

Match the repository's strict TypeScript style.

- Type all parameters and return values when they are not trivially inferred.
- Prefer `unknown` over `any` for untrusted input.
- Use narrow unions, type guards, and assertions instead of unsafe casts.
- Extract shared types to `types.ts` only when multiple files need them.
- Use `Readonly<T>` for object-shaped public inputs when immutability improves
  safety and matches usage.

Examples from the codebase to emulate:

- focused typed exports like `delay(ms: number): Promise<void>`
- guard-style helpers like `isNetworkError(err: unknown): boolean`
- assertion helpers like `assertFound<T>(...): asserts value is T`

### Utils Error Handling

Utilities should fail clearly and consistently.

- Throw only when invalid input or impossible state is part of the contract.
- Prefer explicit validation over silent fallback behavior.
- If a utility needs domain-aware or infrastructure-aware errors, it may belong
  in `lib/` instead of `utils`.
- Reuse the existing `AppError` hierarchy when the helper participates in
  application error handling.

Good fits for `utils`:

- parsing, normalization, comparison, formatting, guards

Usually not a fit for `utils`:

- database wrappers
- HTTP clients
- auth/session flows
- app-wide error reporting

### Utils Comments and Documentation

Keep comments minimal.

- Add JSDoc only when the contract, edge cases, or thrown behavior need
  explanation.
- Prefer expressive naming over explanatory comments.
- Include examples in docs only when the function's behavior is not obvious.

This mirrors existing patterns such as:

- concise no-comment helpers for obvious behavior
- short JSDoc on assertion helpers where failure semantics matter

### Utils Imports and Exports

- Use the `@/*` path alias for cross-folder imports.
- Use relative imports within the same utility folder.
- Keep public exports small and intentional.
- Export types separately when helpful:
  `export type { QueryStringOptions } from "./types";`
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

### Utils Testing

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

### Utils Example Patterns

#### Good Shared Utility

```text
src/shared/utils/is-non-empty-string.ts
src/shared/utils/is-non-empty-string.test.ts
```

```ts
export function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}
```

#### Good Module Utility

```text
src/modules/orders/utils/build-order-reference.ts
src/modules/orders/utils/build-order-reference.test.ts
```

```ts
export function buildOrderReference(prefix: string, id: number): string {
  return `${prefix}-${id.toString().padStart(6, "0")}`;
}
```

#### When to Move Out of Utils

If a helper starts doing any of the following, move it to a more specific
folder:

- depends on React, browser-only APIs, or hooks
- wraps fetch/database/auth/external services
- encodes domain rules that deserve a named service or `lib` module
- grows into a multi-step workflow instead of a focused helper

### Utils Checklist

Before adding a new utility, check:

- Is `utils` the right folder, or would `lib`, `schemas`, `hooks`, `actions`,
  or a local feature file be clearer?
- Is the scope correct: module first, shared only when truly reusable?
- Is the file or folder name specific and kebab-case?
- Is the exported API focused and easy to understand?
- Are types explicit and safe?
- Are edge cases and failure cases tested?
- Is there any unnecessary abstraction, comment, or barrel export?
