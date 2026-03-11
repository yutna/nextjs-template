---
name: Code Style TypeScript
description: TypeScript strictness and type-shaping rules derived from the permanent code-style law.
applyTo: "src/**/*.{ts,tsx}"
---
# Code style: TypeScript

Treat [the permanent code-style law](../../docs/developers/CODE_STYLE_GUIDES.md) as the full source of truth for TypeScript rules.

Keep the default TypeScript discipline tight:

- use strict typing and do not introduce `any`
- prefer `unknown` for untrusted values, then narrow explicitly
- prefer guards and narrowing over broad casts or unnecessary assertions
- use `interface` for public object-shaped contracts such as props, options, state, and context values
- use `type` for unions, intersections, mapped types, conditional types, and schema-derived aliases
- use `import type` and `export type` for type-only imports and re-exports
- wrap React boundary props with `Readonly<...>` by default unless a specific API truly needs mutability
- keep interface members grouped as required fields, required functions, optional fields, then optional functions

Load narrower or deeper guidance when relevant:

- [code-style-react-layers](./code-style-react-layers.instructions.md)
- [code-style-actions-and-lib](./code-style-actions-and-lib.instructions.md)
- [code-style-reference skill](../skills/code-style-reference/SKILL.md)
