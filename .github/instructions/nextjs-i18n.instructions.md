---
name: Next.js i18n
description: Treat internationalization as a required architecture concern with en/th support, en as default, and no hardcoded user-facing text.
applyTo: "apps/web/src/**/*.{ts,tsx,js,jsx,json},src/**/*.{ts,tsx,js,jsx,json},apps/web/src/messages/**/*,src/messages/**/*"
---
# Next.js i18n

Internationalization is mandatory for enterprise app work.

Rules:

- use `next-intl` as the required i18n layer for App Router work in this profile
- support `en` and `th`
- treat `en` as the default locale
- visible application routes must resolve under a `[locale]` boundary so canonical URLs look like `/en/...` and `/th/...`
- do not hardcode user-facing text in product code
- use `next-intl` for headings, body copy, labels, placeholders, metadata, errors, toasts, alt text, and accessibility labels
- keep route helpers locale-neutral
- keep locale message files in parity so `th` mirrors the key structure from `en`
- when the app uses a locale segment, keep visible application routes under `[locale]`
- root `/` should redirect or negotiate to the default locale path instead of acting as a separate product surface

Do not:

- leave English text inline in JSX, metadata, or UI config just because the feature is internal
- ship `en` keys without the matching `th` keys
- leak locale prefixes into shared route helpers
- introduce a parallel i18n stack when `next-intl` already owns the locale contract
- treat translation as a polishing step after implementation
