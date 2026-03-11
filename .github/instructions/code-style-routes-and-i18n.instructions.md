---
name: Code Style Routes and I18n
description: Route-helper, locale-boundary, and message-tree rules derived from the permanent code-style law.
applyTo: "src/app/**/*,src/shared/routes/**/*,src/shared/config/i18n/**/*,src/messages/**/*,.storybook/**/*"
---
# Code style: Routes and i18n

Treat [the permanent code-style law](../../docs/developers/CODE_STYLE_GUIDES.md) as the full source of truth for routes, locale boundaries, and message ownership.

Keep routing and localization stable:

- use shared route helpers as the source of truth for user-facing internal paths, and keep helper APIs locale-neutral with stable `path()` entrypoints
- keep route helpers grouped by route family instead of hardcoding internal path strings across the app
- keep locale setup at the route-entry or locale-boundary layer instead of deeper presentation layers
- keep all user-facing localized copy in the message tree
- mirror locale structure, files, keys, and interpolation placeholders exactly across English and Thai, with the Thai tree remaining the type-shape reference
- keep explicit message aggregation indexes at each contributing level
- use the locale-aware navigation layer instead of manual locale-prefix handling
- keep Storybook locale-aware when stories surface localized UI

Load related guidance when relevant:

- [nextjs-template-architecture](./nextjs-template-architecture.instructions.md)
- [code-style-tests-and-storybook](./code-style-tests-and-storybook.instructions.md)
- [code-style-reference skill](../skills/code-style-reference/SKILL.md)
