---
name: code-style-reference
description: Consult the permanent code-style law for long-tail conventions, specialized library rules, styling, and review checklists. Use this when scoped overlays are not enough or when validating compliance.
---

# Code Style Reference

Use this skill when work touches conventions that are broader or deeper than the scoped code-style instruction overlays.

Reference:

- [permanent code-style law](../../../docs/developers/CODE_STYLE_GUIDES.md)
- [copilot instructions](../../copilot-instructions.md)
- [code-style-typescript](../../instructions/code-style-typescript.instructions.md)
- [code-style-naming-and-public-api](../../instructions/code-style-naming-and-public-api.instructions.md)
- [code-style-ownership](../../instructions/code-style-ownership.instructions.md)
- [code-style-react-layers](../../instructions/code-style-react-layers.instructions.md)
- [code-style-actions-and-lib](../../instructions/code-style-actions-and-lib.instructions.md)
- [code-style-routes-and-i18n](../../instructions/code-style-routes-and-i18n.instructions.md)
- [code-style-tests-and-storybook](../../instructions/code-style-tests-and-storybook.instructions.md)
- [code-style-ui-system](../../instructions/code-style-ui-system.instructions.md)

## Use when

- a task touches styling, CSS Modules, motion, assets, or inline-style exceptions
- a task uses specialized library policies such as `Effect`, `nuqs`, `ts-pattern`, or raw `Zag.js`
- a task needs the exact rule for schemas, contexts, providers, constants, config, or message aggregation
- a review needs a deeper checklist than the always-on overlays provide
- a template example is sparse and the permanent law must fill the gap

## Navigation map

Use [the permanent code-style law](../../../docs/developers/CODE_STYLE_GUIDES.md) as the source of truth and load the relevant section:

- **TypeScript and public APIs** -> TypeScript, naming, imports/exports, `index.ts`
- **Placement and ownership** -> project shape, leaf-folder convention, quick placement map
- **React layers** -> server-first boundaries, App Router files, screens, containers, components, hooks, contexts, providers, reusable layouts
- **Service and data boundaries** -> actions, lib, vendor wrappers, utils, schemas, types, config, constants, error handling
- **Routing and localization** -> routes and navigation, internationalization and messages
- **UI system** -> styling, motion, images and static assets
- **Validation and examples** -> testing, Storybook, explicit exceptions, canonical decisions
- **Specialized libraries** -> `Effect`, `nuqs`, `ts-pattern`, `Zag.js`
- **Tooling and readability** -> comments and readability, package management and tooling

## Review checklist

When validating code-style compliance, check:

1. Is the concern in the right layer and ownership scope?
2. Are naming, casing, imports, and public exports consistent with the permanent law?
3. Are server/client boundaries explicit and as small as practical?
4. Are routes, locale setup, and message ownership handled in the correct layer?
5. Are tests and stories colocated and limited to the correct owners?
6. If styling or assets changed, did the implementation follow the UI-system rules?
7. If specialized libraries were used, did the code follow the project policy instead of ad hoc usage?
8. If an exception was used, is it one of the documented explicit exceptions?

## Do not

- override the permanent code-style law with weaker local preference
- duplicate the full law into always-on instructions
- raise findings from this skill without citing the permanent law or a scoped overlay
