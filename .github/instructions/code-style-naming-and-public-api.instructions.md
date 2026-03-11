---
name: Code Style Naming and Public API
description: Naming, import/export, and leaf public-API rules derived from the permanent code-style law.
applyTo: "src/**/*.{ts,tsx}"
---

# Code style: Naming and public APIs

Treat [the permanent code-style law](../../docs/developers/CODE_STYLE_GUIDES.md) as the full source of truth for naming and public-API rules.

Keep names and file APIs predictable:

- use `camelCase` for functions and variables, `PascalCase` for components and classes, and `SCREAMING_SNAKE_CASE` for shared constants
- keep files and folders in `kebab-case`
- prefer intention-revealing domain names over vague catch-all names
- follow the project prefixes and suffixes such as `Screen...`, `Container...`, `Layout...`, `...Provider`, `...Action`, `use...`, and `...Props`
- keep callback props on the `on...` pattern and implementation handlers on the `handle...` pattern
- use the `@/` alias for cross-folder internal imports and `./` only inside the same leaf folder
- keep import order aligned to the project groups: side-effect boundaries, external modules, internal project imports, local imports, then `import type`
- prefer named exports; use default exports only when a framework or integration boundary requires them
- keep `index.ts` files as pure re-export surfaces with value exports first and type exports last

Load narrower or deeper guidance when relevant:

- [code-style-ownership](./code-style-ownership.instructions.md)
- [code-style-react-layers](./code-style-react-layers.instructions.md)
- [code-style-reference skill](../skills/code-style-reference/SKILL.md)
