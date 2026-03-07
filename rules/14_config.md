# Config Folder Style Guide

This guide defines how to write and organize shared configuration inside:

- `src/shared/config`

Use `shared/config` for application-wide and framework-facing configuration that shapes how the app runs. This folder is for declarative setup such as environment validation, font configuration, i18n routing, request config, and formatting definitions.

## 1. Decide whether code belongs in `config`

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

## 2. Scope and ownership

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

## 3. Standalone files vs nested config concern folders

Use the simplest structure that matches the concern.

### Standalone file for one-file concerns

Prefer a standalone file when the concern is small and self-contained.

Current examples:

- `src/shared/config/env.ts`
- `src/shared/config/fonts.ts`

Good fits:

- one env entrypoint
- one font registration file
- one small framework config object

### Nested folder for multi-file concerns

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

## 4. Naming

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

## 5. File design

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

## 6. TypeScript and runtime boundaries

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

## 7. Boundaries with nearby folders

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

## 8. Examples

### Good standalone config

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

### Good nested config concern

```txt
src/shared/config/i18n/
├── formats.ts
├── request.tsx
└── routing.ts
```

This keeps one shared concern together without flattening unrelated config files into the top level.

## 9. Checklist

Before adding a file to `src/shared/config`, check:

- does this file configure app-wide or framework-wide behavior?
- is `config/` a clearer home than `constants/`, `lib/`, or a feature folder?
- should this concern stay a standalone file, or has it grown into a multi-file concern folder?
- is the file name specific and kebab-case?
- are exports explicit and named unless a framework requires a default export?
- are runtime boundaries clear (`server-only` or `"use client"` only when needed)?
- is environment access centralized instead of scattered across the codebase?
