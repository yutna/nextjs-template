---
name: nextjs-storybook-harness
description: Configure Storybook for server-first Next.js applications, including RSC support, provider wrappers, and safe server-only mocks. Use this when the project relies on Storybook for UI development or verification.
---

# Next.js Storybook Harness

Use this skill when a Next.js repository uses Storybook as a UI support surface.

Reference:

- [AGENTS.md](../../../AGENTS.md)
- [Next.js enterprise design](../../../docs/nextjs-enterprise-workflow-design.md)
- [Next.js Storybook instruction](../../instructions/nextjs-storybook.instructions.md)

## Setup goals

- allow server-first components to render safely in Storybook
- keep locale, theme, and URL-state behavior close to the application
- make client exceptions easy to review in isolation

## Configuration checklist

- enable Storybook support for async React Server Components when applicable
- alias `server-only` to a safe mock
- mock any server-only module that would import Node-only APIs in the browser
- wrap stories in locale, theme, and URL-state providers
- expose locale and color-mode controls when the app supports them
- keep story files near the components they exercise

## Good use cases

- shared presentational components
- client islands
- reusable layout pieces
- visual regression review

## Do not

- prove route ownership or authorization behavior in Storybook
- let story mocks drift away from the application provider model
- hide missing runtime verification behind a green Storybook render
