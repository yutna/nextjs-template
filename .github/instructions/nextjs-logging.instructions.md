---
name: Next.js Logging
description: Use Pino through a stable logger boundary with structured fields, redaction, and environment-aware output.
applyTo: "apps/web/src/**/*.{ts,tsx},src/**/*.{ts,tsx},**/instrumentation*.{ts,tsx},next.config.*"
---
# Next.js logging

Treat logs as product evidence, not console noise.

Rules:

- use `pino` through a shared logger module instead of creating one-off logger instances
- prefer structured logs with stable keys for route, action, feature, and outcome
- redact secrets, tokens, cookies, auth headers, and raw personal data
- keep `pino-pretty` or similar formatting in development-only paths
- use runtime evidence from the logger during verification when it helps prove cache, mutation, or route behavior

Do not:

- scatter `pino()` calls across feature files
- log secrets or raw request bodies
- use `console.*` as the primary application logging strategy when the shared logger exists
