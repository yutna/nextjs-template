---
name: nextjs-runtime-debugging
description: Verify Next.js runtime behavior with concrete server and browser evidence instead of guesses. Use this during Verification for route, loading, error, caching, or mutation behavior.
---

# Next.js Runtime Debugging

Use this skill during Verification when runtime behavior matters.

Reference:

- [AGENTS.md](../../../AGENTS.md)
- [quality gate instructions](../../instructions/quality-gates.instructions.md)
- [Next.js enterprise design](../../../docs/nextjs-enterprise-workflow-design.md)
- [Next.js browser QA skill](../nextjs-browser-qa/SKILL.md)
- [Next.js MCP playbook](../../../docs/nextjs-enterprise-mcp-playbook.md)
- [Next.js logging skill](../nextjs-logging/SKILL.md)

## Process

1. Run the existing project gates in canonical order.
2. Start the app with the repository's dev or test runtime if needed.
3. Verify the changed route or workflow directly.
4. Capture evidence from terminal logs, browser-visible behavior, browser automation, or deterministic test output.
5. Use Next DevTools MCP when runtime inspection is available and useful.
6. Record whether the runtime behavior matches acceptance criteria.
7. If repeated runtime checks are compensating for hard-to-test code shape, record that as a testability issue.

## Focus areas

- route transitions
- loading and error states
- Server Action outcomes
- cache invalidation behavior
- client/server boundary regressions
- structured logging evidence when `pino` or runtime instrumentation is part of the implementation
- client-exception behavior for `swr`, `nuqs`, `xstate`, `motion`, or `next-themes` when those libraries were introduced
- viewport, locale, and theme regressions when rendered output changed
- incorrect default-locale behavior or missing translation coverage

## Do not

- rely on green static checks alone when route UX changed
- guess what the runtime probably did
