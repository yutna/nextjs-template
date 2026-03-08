# Utils

applyTo: src/**/utils/**

## Purpose

Utils hold small, pure, framework-light helper functions. They transform
values, format strings, parse data, validate shapes, or provide type
guards.

## When to use utils vs lib

- **`utils/`** — pure transforms, formatters, parsers, guards.
  No side effects, no framework integrations, no runtime setup.
- **`lib/`** — integrations, service boundaries, framework wrappers,
  architecture-significant runtime code.

Rule of thumb: if the function has no dependencies beyond the language
itself (no HTTP, no database, no framework), it belongs in `utils/`.

## Scope and placement

- **Module-first**: place in `src/modules/<module>/utils/` when owned
  by one feature
- **Shared**: promote to `src/shared/utils/` only when truly cross-module
- **Colocated**: if a helper supports only one leaf folder, keep it as
  a local `helpers.ts` or `utils.ts` inside that folder instead

## Folder structure

Each util concern lives in its own leaf folder:

```text
src/shared/utils/format-currency/
├── format-currency.ts
├── format-currency.test.ts
├── index.ts
└── types.ts
```

Rules:

- One concern per folder
- Folder and main file share the same kebab-case name
- Leaf-level `index.ts` for the public API
- Tests adjacent to the implementation
- No parent barrel files for `utils/`

## Naming

- Folders: kebab-case, named after the concern (`format-currency`,
  `parse-date`, `is-valid-email`)
- Exports: camelCase (`formatCurrency`, `parseDate`, `isValidEmail`)
- `format*` for formatters, `parse*` for parsers, `is*` for guards,
  `to*` for converters
- Named exports only — no default exports
- Avoid vague names: `helpers.ts`, `common.ts`, `misc.ts`

## Design rules

- Keep functions pure — no side effects
- Accept explicit parameters, return explicit values
- Do not import from `lib/`, `actions/`, `hooks/`, or `contexts/`
- Do not depend on React, Next.js, or browser APIs
- Effect is allowed in utils when building typed compositions

## Checklist

- [ ] Pure transform or guard — no side effects
- [ ] Better fit than `lib/` (no integrations or runtime behavior)
- [ ] Scope correct: module-first, shared only when cross-module
- [ ] One concern per leaf folder
- [ ] Named exports only
- [ ] Tests adjacent to the implementation
- [ ] No parent barrel files
