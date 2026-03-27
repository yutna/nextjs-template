---
name: Next.js Storybook
description: Configure Storybook as a safe support surface for server-first Next.js UI, client exceptions, and design verification.
applyTo: ".storybook/**/*,apps/web/.storybook/**/*,apps/web/src/**/*.stories.*,src/**/*.stories.*"
---
# Next.js Storybook

Storybook is a support surface for presentational and client-exception UI, not
a replacement for route verification.

Rules:

- enable async RSC support when the repository uses Storybook for App Router components
- alias `server-only` and other server-bound modules so stories can render safely in the browser
- wrap stories in the same locale, theme, and URL-state providers used by the app
- add locale and color-mode controls when the app supports them
- keep stories focused on visual states, component behavior, and design parity

Do not:

- use Storybook as proof that route ownership, auth, or data boundaries are correct
- import real secrets or raw server runtime APIs into story files
- leave server-only test or story mocks implicit
