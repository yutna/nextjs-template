---
name: Next.js Client Exceptions
description: Keep SWR, nuqs, and client-side helper libraries as explicit exceptions to the server-first default.
applyTo: "apps/web/src/**/*.{ts,tsx},src/**/*.{ts,tsx}"
---
# Next.js client exceptions

Client-side runtime libraries are allowed only when the server-first path is insufficient.

Rules:

- treat `swr` as an exception for user-driven refresh, optimistic cache interaction, or live-ish client polling that Server Components and revalidation do not cover well
- treat `nuqs` as an exception for client-owned URL state that truly belongs in the browser interaction layer
- keep `usehooks-ts`, `immer`, and `use-immer` inside narrow client leaves when they improve ergonomics without widening architecture boundaries
- record why the server-first path was not sufficient before introducing a client exception
- keep client exception usage local to the smallest feature or component boundary that needs it

Do not:

- use `swr` as the default read path for server-owned data
- introduce `nuqs` just to avoid designing `searchParams`, route handlers, or form submission correctly
- spread client helper hooks across route shells or shared server modules
