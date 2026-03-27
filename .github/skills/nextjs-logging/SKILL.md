---
name: nextjs-logging
description: Apply Pino consistently through shared logger boundaries, structured fields, and redaction-aware verification. Use this when Next.js work touches application logging or runtime evidence.
---

# Next.js Logging

Use this skill when a task adds, changes, or audits application logging.

Reference:

- [AGENTS.md](../../../AGENTS.md)
- [Next.js logging instruction](../../instructions/nextjs-logging.instructions.md)
- [Next.js enterprise library decisions](../../../docs/nextjs-enterprise-library-decisions.md)

## Use Pino when

- server actions, route handlers, or integrations need reliable runtime evidence
- reviewers need structured data about failures, retries, cache invalidation, or background work
- the app already has a shared logger surface and the task should extend it

## Process

1. Reuse or define the shared logger boundary first.
2. Decide the stable fields that help verification and incident review.
3. Redact secrets and personal data before logs leave the module boundary.
4. Keep pretty-printing or verbose output scoped to local development.
5. Verify that logs help prove behavior instead of replacing tests.

## Do not

- instantiate `pino()` in random feature files
- log credentials, tokens, cookies, or raw secret payloads
- replace a clear typed result with log-only debugging
