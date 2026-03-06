# Constants Folder Style Guide

This guide defines how to organize dedicated constants inside:

- `src/shared/constants`
- `src/modules/<module-name>/constants`

Use these folders for static values that are intentionally shared across a broad app area, without owning runtime setup, business logic, or framework integration.

## 1. Decide whether code belongs in `constants`

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

## 2. Dedicated `constants/` vs colocated `constants.ts`

This guide is for dedicated constants folders, but the repository also uses local `constants.ts` files inside leaf folders.

### Use colocated `constants.ts` when the values belong to one leaf folder

Good fits:

- animation variants for one component
- static arrays or code samples used by one section
- implementation details for one lib module
- small UI-only mappings used by one screen or layout

Examples already present in the repository:

- `src/modules/static-pages/components/section-features/constants.ts`
- `src/shared/lib/fetcher/constants.ts`

### Use dedicated `shared/constants` or `modules/<module-name>/constants` when the values have broader ownership

Good fits:

- locales used by routing, navigation, and UI
- a module-wide set of tabs, filters, or statuses shared by several screens and hooks
- app-wide constants used by multiple unrelated areas

Examples already present in the repository:

- `src/shared/constants/locale.ts`
- `src/shared/constants/timezone.ts`

Do not move local implementation constants into a dedicated `constants/` folder just to make the tree look more uniform. Promote only when ownership is clearly broader than one leaf folder.

## 3. Scope and placement

Choose the narrowest valid scope first.

### `src/modules/<module-name>/constants`

Prefer module-level constants when the values are shared within one feature module.

Good fits:

- order statuses used by several orders screens
- checkout step identifiers used across module hooks and components
- profile preference options used throughout one profile module

Examples:

- `src/modules/orders/constants/order-status.ts`
- `src/modules/checkout/constants/checkout-step.ts`

### `src/shared/constants`

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

## 4. Keep constants static and boring

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

## 5. File and folder structure

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

## 6. Naming

### File names

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

### Export names

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

## 7. Exports and typing

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

## 8. Boundaries with nearby folders

This guide stays focused on `constants`, so nearby folders are mentioned only to define boundaries.

- use `constants/` for static shared or module-wide values
- use colocated `constants.ts` for values owned by one leaf folder
- use `config/` for environment-aware or runtime configuration
- use `utils/` for helper functions and transformations
- use `lib/` for integrations, wrappers, and architectural behavior
- use `schemas/` for validation contracts

If the value needs runtime setup, it is probably not a `constants` concern.
If the value only supports one implementation folder, it probably should stay colocated.

## 9. Examples

### Good shared constants

```ts
// src/shared/constants/locale.ts
export const LOCALES = ["th", "en"] as const;
```

```ts
// src/shared/constants/timezone.ts
export const TIME_ZONE = "Asia/Bangkok" as const;
```

### Good module constants

```ts
// src/modules/orders/constants/order-status.ts
export const ORDER_STATUSES = ["draft", "confirmed", "shipped"] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];
```

### Better kept colocated

```ts
// src/modules/static-pages/components/section-features/constants.ts
export const FEATURE_COLORS = ["blue", "purple", "green"] as const;
```

This value supports one component concern, so colocating it is clearer than moving it into a module-wide constants folder.

## 10. Checklist

Before adding a file to `shared/constants` or `modules/<module-name>/constants`, check:

- are these values static and behavior-free?
- is ownership broader than one leaf folder?
- is `constants/` clearer than colocating a `constants.ts` file?
- is the scope correct: module first, shared only when truly cross-module?
- is the file name specific and kebab-case?
- are exported constant names descriptive and `SCREAMING_SNAKE_CASE`?
- are the exports direct, named, and easy to import?
