---
name: nextjs-i18n
description: Design, implement, review, and verify Next.js internationalization with en/th support, en default locale, and no hardcoded user-facing text. Use this when locale routing, message files, or rendered copy changes.
---

# Next.js i18n

Use this skill whenever a Next.js task affects visible copy, locale routing,
metadata, accessibility labels, or translation files.

Reference:

- [AGENTS.md](../../../AGENTS.md)
- [Next.js enterprise design](../../../docs/nextjs-enterprise-workflow-design.md)
- [Next.js i18n playbook](../../../docs/nextjs-enterprise-i18n-playbook.md)

## Contract

- required i18n library: `next-intl`
- supported locales: `en`, `th`
- default locale: `en`
- visible application URLs are locale-prefixed, such as `/en/...` and `/th/...`
- no hardcoded user-facing text in product code
- route helpers stay locale-neutral

## Planning checklist

1. Which namespaces or message files will change?
2. Does the route tree need a locale boundary or locale-aware behavior?
3. What is the locale-prefixed canonical URL for the feature in `en` and `th`?
4. What is the default-locale behavior for `/`?
5. Which visible texts, metadata values, errors, and accessibility labels are affected?
6. How will `next-intl` routing, message loading, and parity be verified in `en` and `th`?

## Implementation checklist

- add or update message keys in `en`
- mirror the same keys in `th`
- replace hardcoded UI copy with `next-intl` APIs
- keep `next-intl` locale routing, request configuration, and message loading aligned with the approved locale contract
- keep visible App Router pages under the locale boundary so public paths resolve as `/en/...` and `/th/...`
- keep metadata and accessibility text translated
- keep route helpers locale-neutral

## Review checklist

- no hardcoded user-facing text remains
- no missing locale coverage for `th`
- `next-intl` remains the single source of truth for locale-aware rendering and navigation
- message keys are stable and consistent
- locale behavior does not leak into shared route helpers
- default locale remains `en`

## Verification checklist

- `/` resolves to the default locale behavior
- `en` renders correctly
- `th` renders correctly
- no translation keys or English fallback strings leak into the UI
- Thai layout remains readable

## Do not

- hardcode visible English strings in JSX or metadata
- update only one locale file for shipped user-facing copy
- treat i18n as optional for internal enterprise features
