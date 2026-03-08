# Messages Folder Style Guide

This guide defines how to write and organize translation messages inside:

- `src/messages`

Use `messages/` for the repository's `next-intl` message source. This folder
owns locale-specific translation content and the aggregation shape that is
loaded by the i18n request config.

Message placement should follow the owning UI layer as closely as practical.
That owner might be a screen, component, container, hook, layout, or another
clear UI concern.

## 1. Decide Whether Content Belongs in messages

Put content in `src/messages` when it does one or more of the following:

- provides user-facing translated copy
- defines locale-specific text for UI, validation, status labels, or content
  blocks
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

- if the value is user-facing copy that changes by locale, it belongs in
  `messages/`
- if the value is behavior, structure, or configuration, it belongs elsewhere

## 2. Locale-First Structure

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
messages[locale];
```

and the current type-safety setup where Thai is the source of truth for
`Messages`.

## 3. Top-Level Namespace Ownership

Each locale currently exposes three top-level namespaces:

- `common`
- `shared`
- `modules`

Use them intentionally.

### common

Use `common/` for app-wide vocabulary reused broadly across unrelated
features.

Good fits:

- actions
- validation
- status
- pagination
- datetime

Examples:

- `src/messages/en/common/actions.json`
- `src/messages/th/common/validation.json`

### shared

Use `shared/` for translations owned by shared cross-cutting UI or shared
app concerns.

Good fits:

- shared component copy
- shared layout copy
- shared provider-related UI text

Examples:

- `src/messages/en/shared/components/not-found.json`
- `src/messages/th/shared/components/error.json`

### modules

Use `modules/` for feature-owned translations.

Good fits:

- screen copy for a module
- module-specific forms
- feature-specific empty states
- content owned by one feature area
- owner-aligned copy for module screens, components, containers, hooks, or
  layouts

Examples:

- `src/messages/en/modules/static-pages/components/section-hero.json`
- `src/messages/th/modules/profile/screens/screen-edit-profile.json`

Avoid putting module-owned copy under `shared` just because multiple files
inside one module reuse it. Shared means cross-module ownership, not merely
repeated usage.

Within a module, do not centralize unrelated owners into one catch-all message
file just to reduce duplication. If `SectionHero` renders the copy, keep that
copy under the `section-hero` ownership path unless it clearly belongs in an
existing broader namespace such as `common`.

## 4. Mirror Locales Exactly

Locales should stay structurally aligned.

Required direction:

- if a namespace exists in `th`, create the same namespace in `en`
- if a JSON file exists in one locale, create the same file in the other
  locale
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

## 5. Namespace Path Should Match Folder Structure

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
useTranslations("modules.profile.screens.screenEditProfile");
```

then the locale structure should read like:

```txt
src/messages/<locale>/modules/profile/screens/screen-edit-profile.json
```

with matching locale index aggregation.

## 6. Use Aggregation Indexes Intentionally

This repository uses `index.ts` files to build the message object shape. Keep
those indexes explicit and predictable.

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

- add an `index.ts` at each folder level that contributes a public message
  object
- keep aggregation explicit rather than dynamic
- mirror aggregation shape across locales
- use object property names that become the namespace segments used in code

Do not:

- skip an index where a folder needs to export grouped messages
- build message objects with opaque dynamic filesystem tricks
- let one locale export a different object structure than another

## 7. JSON File Naming

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

## 8. Translation Key Naming

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

For repeated structured sections, a numbered pattern is acceptable only when
the UI is truly a fixed ordered set and clearer naming would not improve
understanding.

Acceptable example:

- `feature1Title`
- `feature1Description`

Prefer a semantic grouping shape when the section has durable identities:

- `performanceTitle`
- `performanceDescription`

## 9. Keep Messages Content-Only

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

Rich text support should stay compatible with the repository's shared default
translation values:

- `<b>`
- `<i>`
- `<br>`

That setup belongs in i18n config, not in the messages folder itself.

## 10. Placeholder and Rich-Text Consistency

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

## 11. Shared vs Module Ownership

Choose the narrowest valid ownership first.

### Put Messages Under modules When

- the copy belongs to one feature module
- the text is specific to one screen, flow, or feature-local component
- another module would not naturally reuse the namespace

### Put Messages Under shared When

- the copy belongs to shared UI used across unrelated modules
- ownership is clearly cross-cutting
- the namespace remains generic outside any one module

### Put Messages Under common When

- the text is generic vocabulary reused across the app
- the wording is not owned by one component or one module

Do not promote feature copy into `shared` or `common` too early. Repetition
inside one module is still module ownership.

## 12. Example Structure

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

## 13. Checklist

Before adding or changing messages, check:

- is this user-facing localized copy?
- does it belong in `common`, `shared`, or `modules`?
- does the folder structure match the intended namespace?
- did I add the same file and keys in both `th` and `en`?
- did I update the necessary `index.ts` aggregation files?
- are the JSON filenames kebab-case?
- are the translation keys camelCase and descriptive?
- are interpolation placeholders aligned across locales?
- does the namespace read clearly in `getTranslations(...)` or
  `useTranslations(...)`?

## 14. Quick Reference

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
