---
applyTo: "src/messages/**"
---

# Messages (i18n)

## Purpose

`src/messages/` holds `next-intl` translation content organized by locale.
Message placement must follow the owning UI layer path.

## Locale-first structure

```text
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

- Each locale in its own top-level folder
- Same structural shape across all locales
- Aggregate via `index.ts` at each folder level

## Namespace ownership

- **`common/`** — app-wide vocabulary (actions, validation, status, pagination)
- **`shared/`** — translations for shared cross-cutting UI components
- **`modules/`** — feature-owned translations matching module structure

## File placement mirrors the UI owner

```text
src/messages/<locale>/modules/<module>/<layer>/<component>.json
```

Example:

```text
src/messages/en/modules/static-pages/components/section-hero.json
→ modules.staticPages.components.sectionHero
```

Do NOT centralize unrelated module copy into one catch-all file.
If `SectionHero` renders the copy, keep it under `section-hero` ownership.

## Mirror locales exactly

- If a namespace exists in `th/`, create the same in `en/`
- If a JSON file exists in one locale, create it in the other
- If a key exists in one locale, add the same key in the other
- Keep interpolation placeholders aligned (`{year}`, not `{currentYear}` in one)

Thai (`th`) currently defines the `Messages` type shape.

## Aggregation indexes

Add an explicit `index.ts` at each folder level. Keep aggregation static, not dynamic.

```ts
import sectionHero from "./section-hero.json";

export const components = {
  sectionHero,
};
```

## JSON file rules

- Filenames: kebab-case (e.g. `section-hero.json`, `not-found.json`)
- Keys: camelCase, stable, descriptive (e.g. `heading`, `goHome`, `copyright`)
- Content only — no logic, no HTML structure, no behavior flags
- Interpolation uses `{placeholder}` syntax

Avoid vague names: `data.json`, `text.json`, `labels.json`

## Scope decisions

- Module-owned copy → `modules/<module>/`
- Shared cross-module UI copy → `shared/`
- Generic app vocabulary → `common/`

Do not promote feature copy to `shared` or `common` prematurely.

## Checklist

- [ ] Content is user-facing localized copy
- [ ] Placed in correct namespace: `common`, `shared`, or `modules`
- [ ] Folder structure matches the intended namespace path
- [ ] Same file and keys exist in both `th/` and `en/`
- [ ] `index.ts` aggregation files updated
- [ ] JSON filenames are kebab-case
- [ ] Translation keys are camelCase and descriptive
- [ ] Interpolation placeholders aligned across locales
