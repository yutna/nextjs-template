---
name: Code Style Tests and Storybook
description: Testing and Storybook rules derived from the permanent code-style law.
applyTo: "src/**/*.test.ts,src/**/*.test.tsx,src/**/*.stories.tsx,src/test/**/*,.storybook/**/*"
---
# Code style: Tests and Storybook

Treat [the permanent code-style law](../../docs/developers/CODE_STYLE_GUIDES.md) as the full source of truth for testing and Storybook rules.

Keep validation and component examples aligned to the template:

- colocate tests with the unit they verify and focus tests on behavior rather than implementation detail
- use shared test support only for reusable infrastructure, not feature-specific tests
- treat thin route-entry files as coverage-light boundaries rather than the main unit-test target
- call async server components directly before rendering them in tests, and use the shared provider-aware render helpers when app providers are required
- use the project query-state testing adapter when UI tests cover URL-state hooks
- create stories only for presenter components, not for screens, containers, providers, layouts, or hooks
- colocate story files beside the component they document and provide at least a `Default` story via typed `meta`
- rely on the shared Storybook provider stack, locale controls, color-mode controls, and async server-rendering support already configured under `.storybook/`

Load deeper guidance when relevant:

- [rendered UI verification skill](../skills/rendered-ui-verification/SKILL.md)
- [code-style-reference skill](../skills/code-style-reference/SKILL.md)
