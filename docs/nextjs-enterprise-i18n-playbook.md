# Next.js Enterprise i18n Playbook

This workflow treats internationalization as a core architecture concern for
enterprise applications.

## Baseline contract

- required library: `next-intl`
- supported locales: `en`, `th`
- default locale: `en`
- visible application URLs are locale-prefixed, such as `/en/...` and `/th/...`
- no hardcoded user-facing text in product code
- locale-aware routing should be designed up front
- route helpers stay locale-neutral
- message keys and locale files must stay in parity

## Preferred architecture

Use `next-intl` with a locale-aware App Router shape:

```text
src/app/
  [locale]/
    (public)/
    (app)/
```

Common pattern:

- `/` redirects or negotiates to `/en`
- visible routes live under `src/app/[locale]/...`
- route files under `[locale]` call the `next-intl` locale setup for the active request
- reusable route helpers return locale-neutral paths
- navigation utilities add the active locale at the edge of the routing layer through the `next-intl` integration

`next-intl` should stay the single locale contract for:

- locale-aware routing
- message loading
- translated rendering and metadata
- localized navigation surfaces
- canonical locale-prefixed URLs

## Message organization

Recommended structure:

```text
src/messages/
  en/
    common.json
    <feature>.json
  th/
    common.json
    <feature>.json
```

Rules:

- `en` is the source locale
- `th` must keep the same namespace and key shape as `en`
- feature copy belongs to feature namespaces
- shared UI copy belongs to `common`
- message keys should be stable and descriptive, such as
  `customers.list.heading`

## No-hardcoded-text policy

Translate all user-facing copy, including:

- headings and body text
- button labels and links
- placeholders and form labels
- empty states and helper text
- toast and inline validation messages
- metadata titles and descriptions
- alt text and accessibility labels

Internal strings may remain English when they are not user-facing:

- log messages
- metric/event names
- internal identifiers
- test descriptions

## Planning requirements

Every non-trivial feature plan should state:

- how `next-intl` is wired for the affected route area
- which namespaces will be touched
- whether new message keys are required
- where locale ownership lives
- how root default-locale behavior should work
- how reviewers and verifiers will confirm parity in `en` and `th`

## Verification requirements

Verification should cover:

- `next-intl` locale resolution for the affected route area
- default-locale behavior for `/`
- `en` and `th` rendering
- no missing keys or raw fallback strings
- no hardcoded English UI text left in product files
- layout resilience for Thai content
