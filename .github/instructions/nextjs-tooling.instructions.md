---
name: Next.js Tooling
description: Keep quality gates focused on product code and align route typing, lint scope, and server-only dependencies with the profile.
applyTo: "package.json,eslint.config.*,tsconfig*.json,next.config.*,apps/web/package.json,apps/web/eslint.config.*,apps/web/tsconfig*.json"
---
# Next.js tooling

Treat workspace tooling as part of the architecture contract.

Rules:

- define explicit `typecheck`, `lint`, and `test` commands before marking those gates as applicable
- prefer a fast deterministic test runner setup such as Vitest when it fits the stack, and keep test commands easy for agents to reuse
- keep lint scope focused on product and shared code; ignore governance and automation folders such as `.github/**` unless the repository intentionally lints them
- if a server module imports `server-only`, ensure the `server-only` package is present in dependencies
- if standalone tests import modules that use `server-only`, provide an explicit alias or preload stub for the test runner
- if Storybook is used with server-first components, configure safe mocks or aliases for `server-only` and other server-bound modules
- use route-aware helpers such as `PageProps` or `LayoutProps` only after route type generation is part of the workflow; otherwise prefer explicit prop typing
- if route-aware helpers are part of the project contract, include a build or typegen-aware step in the validation path
- if the repository ships `.vscode/mcp.json`, keep it aligned with the approved MCP servers and do not let stale local experiments leak into version control
- if the repository ships `skills-lock.json`, keep it aligned with the approved upstream skill packs used by the workflow and the vendored copies in `.agents/skills/`
- keep test aliasing, setup files, and shared fixtures aligned with the actual server-first module boundaries so tests do not drift from production imports
- if the stack uses `pino-pretty`, `@next/bundle-analyzer`, or React Compiler tooling, keep those scripts explicit and environment-scoped instead of letting agents improvise them

Do not:

- let copied workflow hooks or governance scripts break application lint by accident
- assume route helper types already exist in a fresh app before type generation has run
- rely on framework-only runtime conventions without adding the corresponding dependency or script
