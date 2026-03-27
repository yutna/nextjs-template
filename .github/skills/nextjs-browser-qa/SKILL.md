---
name: nextjs-browser-qa
description: Verify rendered Next.js features in a real browser with responsive, locale, theme, and interaction evidence. Use this during Verification after automated quality gates pass.
---

# Next.js Browser QA

Use this skill when a Next.js change affects rendered output.

Reference:

- [AGENTS.md](../../../AGENTS.md)
- [quality gate instructions](../../instructions/quality-gates.instructions.md)
- [Next.js runtime debugging skill](../nextjs-runtime-debugging/SKILL.md)
- [Next.js MCP playbook](../../../docs/nextjs-enterprise-mcp-playbook.md)

## When to run

- new or changed routes
- layout or styling changes
- locale or theme changes
- interactive UI or Server Action flows

## Evidence sequence

1. Open the affected route in a real browser.
2. Confirm the page loads without console or network failures.
3. Capture a screenshot or equivalent visual evidence.
4. Verify content and interaction expectations.
5. Repeat for desktop, tablet, and mobile widths.
6. Repeat for light and dark mode when supported.
7. Repeat for each supported locale that could change layout or copy.
8. If available, inspect runtime details with Next DevTools MCP.

## Required evidence

- routes verified
- browser or MCP tooling used
- viewport coverage
- theme and locale coverage
- console/network status
- interaction results
- screenshots or equivalent artifacts

Locale coverage is not optional for this profile:

- verify `en`
- verify `th`
- verify default-locale behavior for `/` when the route is part of the application shell

## If browser tooling is unavailable

- use the best available runtime evidence
- record the limitation explicitly
- do not claim full UI verification if responsive or interaction evidence is missing
- report when browser-only verification is covering for code that should have narrower automated seams

## Do not

- substitute Storybook-only verification for route verification
- claim delivery readiness from static checks alone when UI changed
- let browser QA become an excuse to skip automation that should exist
