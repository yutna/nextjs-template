# Next.js Migration Tracker

Use this template for legacy Next.js migrations into the enterprise profile.

## Migration summary

- Current application:
- Target application:
- Migration mode:
- Owner:
- Last updated:

## Current-state inventory

- Pages Router usage:
- `getServerSideProps` / `getStaticProps` usage:
- API Routes:
- global `"use client"` boundaries:
- auth/session surfaces:
- env access surfaces:
- i18n surfaces, `next-intl` adoption status, and locale strategy:
- custom server or webpack behavior:
- caching and invalidation assumptions:
- testing and parity gaps:

## Route mapping

| Legacy route or surface | Current implementation | Target App Router route | Target feature/module owner | Migration wave | Notes |
| --- | --- | --- | --- | --- | --- |

Target App Router routes should be written in locale-prefixed form when user-facing, for example `/en/customers` and `/th/customers`.

## UI and client-boundary inventory

| Surface | Why it is client-heavy today | Target server-first shape | Approved client exception? | Notes |
| --- | --- | --- | --- | --- |

## Data and mutation migration map

| Current surface | Current pattern | Target pattern | Codemod-safe? | Notes |
| --- | --- | --- | --- | --- |

## Codemod-safe batch

- [ ] Pages Router file moves
- [ ] async API updates
- [ ] route helper renames
- [ ] framework config updates

## Manual redesign batch

- [ ] route-tree redesign
- [ ] auth/session redesign
- [ ] client-boundary reduction
- [ ] `next-intl` routing and message migration
- [ ] Server Action adoption
- [ ] cache and revalidation redesign

## Rollout waves

1. Discovery and inventory
2. Foundation and tooling
3. Route and module migration
4. Verification and parity review

## Parity verification plan

- affected routes:
- affected roles or permissions:
- locale coverage:
- browser/runtime flows:
- automated gates:
- manual QA:

## Rollback checkpoints

- wave 1 rollback:
- wave 2 rollback:
- wave 3 rollback:

## Blockers and decisions

| Item | Type | Evidence | Recommended rollback phase | Owner |
| --- | --- | --- | --- | --- |
