---
name: Code Style Ownership
description: Ownership, placement, and leaf-folder rules derived from the permanent code-style law.
applyTo: "src/**/*"
---

# Code style: Ownership and placement

Treat [the permanent code-style law](../../docs/developers/CODE_STYLE_GUIDES.md) as the full source of truth for ownership and placement rules.

Keep the project shape stable:

- feature-owned code stays in feature modules and cross-cutting reusable code belongs in shared code
- do not import directly across feature modules; promote genuinely shared behavior instead
- preserve the placement model of route entry -> screen -> container -> component, with hooks, actions, schemas, lib, config, constants, routes, and messages owning their specific concerns
- keep one public concern per leaf folder
- keep the folder name and main file aligned to the owned concern
- use leaf `index.ts` files as the public API instead of parent barrel files
- colocate tests and local `types.ts` files with the owning concern when appropriate
- colocate `constants.ts` when the concern owns values narrower in scope than the module constants folder
- constants must not live in `types.ts`; types must not live in `constants.ts`
- module-internal shared types that are not part of the public API must stay unexported from `index.ts`
- prefer extending an existing owned surface before inventing a parallel structure

Load narrower or deeper guidance when relevant:

- [code-style-react-layers](./code-style-react-layers.instructions.md)
- [code-style-actions-and-lib](./code-style-actions-and-lib.instructions.md)
- [code-style-routes-and-i18n](./code-style-routes-and-i18n.instructions.md)
- [code-style-reference skill](../skills/code-style-reference/SKILL.md)
