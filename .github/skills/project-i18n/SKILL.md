---
name: project-i18n
description: >
  Project conventions for i18n message files and translations using next-intl.
  Use when creating, modifying, or reviewing files in src/messages/ or working
  with internationalization. Covers message file structure, owning-layer path
  convention, locale setup, and translation key organization.
---

# Project i18n Conventions

This skill covers the conventions for working with internationalization
message files in this repository. The project uses `next-intl` for
translations. All user-facing copy lives in `src/messages/`.

## Scope

Use this skill when:

- creating or modifying files in `src/messages/`
- adding new translation keys or namespaces
- reviewing i18n-related code for correctness
- working with `getTranslations` or `useTranslations`

## Locale-First Structure

The `src/messages/` folder is organized by locale first:

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

- Each locale has its own top-level folder.
- The structural shape must be identical across all locales.
- Thai (`th`) is the source of truth for the `Messages` type.

## Top-Level Namespace Ownership

Each locale exposes three namespaces with distinct ownership rules:

### `common/`

App-wide vocabulary reused broadly across unrelated features.

- actions, validation, status, pagination, datetime

### `shared/`

Translations owned by shared cross-cutting UI or shared app concerns.

- shared component copy, shared layout copy, shared provider UI text

### `modules/`

Feature-owned translations scoped to a single module.

- screen copy, module-specific forms, feature-specific empty states

## Owning-Layer Path Convention

The namespace used in code must match the folder structure. The message
file path mirrors the UI owner that renders the copy.

```txt
src/messages/en/modules/static-pages/components/section-hero.json
→ modules.staticPages.components.sectionHero

src/messages/en/shared/components/not-found.json
→ shared.components.notFound

src/messages/en/common/actions.json
→ common.actions
```

Usage in code:

```ts
const t = useTranslations("modules.staticPages.components.sectionHero");
```

## File and Key Naming

- JSON filenames use **kebab-case**: `section-hero.json`, `not-found.json`
- Translation keys use **camelCase**: `heading`, `description`, `goHome`
- Name files after the UI surface or concern they own
- Keep keys stable, descriptive, and semantic

## Aggregation Indexes

Each folder level that contributes to the message object must have an
explicit `index.ts` that aggregates its children:

```ts
import error from "./error.json";
import notFound from "./not-found.json";

export const components = {
  error,
  notFound,
};
```

- Keep aggregation explicit, not dynamic.
- Mirror aggregation shape across all locales.

## Mirror Locales Exactly

When adding or modifying messages:

- If a file exists in `th/`, create the same file in `en/` and vice versa.
- If a key exists in one locale, it must exist in all locales.
- Interpolation placeholders must be identical across locales.

Bad: `{year}` in one locale and `{currentYear}` in another.

## Messages Are Content-Only

JSON message files contain translation content, not logic:

- Plain strings and interpolation placeholders only
- No rendering logic, HTML structure, or behavior flags
- Rich text uses only tags configured by the app (`<b>`, `<i>`, `<br>`)

## Ownership Rules

Choose the narrowest valid ownership first:

1. **`modules/`** when copy belongs to one feature module
1. **`shared/`** when copy belongs to shared cross-module UI
1. **`common/`** when text is generic app-wide vocabulary

Do not promote feature copy into `shared/` or `common/` too early.

## Common Mistakes

- Adding a message file in only one locale
- Using vague filenames like `data.json` or `labels.json`
- Inventing code namespaces that do not match the folder structure
- Putting module-owned copy under `shared/` because multiple files
  inside one module reuse it
- Centralizing unrelated owners into one catch-all message file
- Mismatching interpolation placeholders across locales
- Skipping `index.ts` aggregation when adding a new folder
- Using positional key names like `text1` instead of semantic names

## Checklist

Before adding or changing messages:

- [ ] Is this user-facing localized copy?
- [ ] Does it belong in `common/`, `shared/`, or `modules/`?
- [ ] Does the folder structure match the intended namespace?
- [ ] Did I add the same file and keys in both `th/` and `en/`?
- [ ] Did I update the necessary `index.ts` aggregation files?
- [ ] Are JSON filenames kebab-case?
- [ ] Are translation keys camelCase and descriptive?
- [ ] Are interpolation placeholders aligned across locales?
- [ ] Does the namespace read clearly in code?

## Quick Reference

```txt
src/messages/<locale>/common/<topic>.json
src/messages/<locale>/shared/<shared-scope>/<message-file>.json
src/messages/<locale>/modules/<module-name>/<folder-scope>/<message-file>.json
```

- Locale first
- Mirror every locale
- Namespace follows folder structure
- Message ownership follows the UI owner
- Filenames are kebab-case
- JSON keys are camelCase
- Thai defines the typed message shape today

## References

See `references/message-patterns.md` for the full detailed guide.
