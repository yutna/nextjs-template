---
applyTo: "src/shared/config/**,src/**/constants/**"
---

# Config and Constants

## Config (`src/shared/config`)

App-wide and framework-facing configuration. Declarative setup such as environment
validation, font registration, i18n routing, and formatting definitions.

### What belongs in config

- Validated environment variables (`env.ts`)
- Framework configuration (fonts, i18n routing, request config)
- Shared setup consumed by entry points, providers, or infrastructure

### Config exclusions

- Static domain values -> use `constants/`
- Runtime integrations or wrappers -> use `lib/`
- Pure helper functions -> use `utils/`
- Validation schemas -> use `schemas/`

### Config structure

- **Standalone files** for simple concerns: `env.ts`, `fonts.ts`
- **Nested folders** for multi-file concerns: `i18n/routing.ts`, `i18n/formats.ts`
- Do **not** create `src/shared/config/index.ts` (no barrel exports)
- Import directly from the config file: `@/shared/config/i18n/routing`

### Environment variables

- Centralize all `process.env` access through `shared/config/env.ts`
- No ad hoc `process.env` reads scattered across the codebase
- Use `NEXT_PUBLIC_` only for values intended for the client
- Keep server-only values off the client

### Config naming

- Files: kebab-case, specific names (`env.ts`, `fonts.ts`, `routing.ts`)
- Exports: descriptive noun-style (`env`, `routing`, `formats`)
- Avoid vague names: `config.ts`, `shared.ts`, `setup.ts`

## Constants (`src/shared/constants`, `src/modules/<module>/constants`)

Static values with broad ownership that are intentionally shared
across a module or the app.

### What belongs in constants

- Fixed values reused by multiple files: locales, timezones, status lists
- Stable options, identifiers, limits, or mappings
- Values imported as static data, not computed at runtime

### Constants exclusions

- Runtime configuration -> use `config/`
- Values only supporting one leaf folder -> colocate as `constants.ts` in that folder
- Functions with behavior -> use `utils/` or `lib/`

### Constants structure

- **Standalone files** named by concern: `locale.ts`, `timezone.ts`, `order-status.ts`
- One file per constants concern, keep folders flat
- Do **not** create barrel files (`index.ts`) for constants directories
- Module-first scope; promote to `shared/` only when truly cross-module

### Constants naming

- Files: kebab-case (`locale.ts`, `order-status.ts`)
- Exports: `SCREAMING_SNAKE_CASE` (`LOCALES`, `TIME_ZONE`, `ORDER_STATUSES`)
- Use `as const` when literal inference helps derive narrow unions
- Named exports only, no default exports

### Example

```ts
// src/shared/constants/locale.ts
export const LOCALES = ["th", "en"] as const;
```

```ts
// src/shared/constants/timezone.ts
export const TIME_ZONE = "Asia/Bangkok" as const;
```

## Checklist

- [ ] Config: does this file configure app-wide or framework-wide behavior?
- [ ] Config: is environment access centralized through `env.ts`?
- [ ] Config: no barrel exports for `shared/config`
- [ ] Constants: are values static and behavior-free?
- [ ] Constants: is ownership broader than one leaf folder?
- [ ] Constants: exports use `SCREAMING_SNAKE_CASE`
- [ ] Constants: no barrel exports for constants directories
- [ ] Scope correct: module-first, shared only when cross-cutting
- [ ] File names are specific and kebab-case
- [ ] Named exports only
