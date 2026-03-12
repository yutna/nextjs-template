---
name: Code Style Actions and Lib
description: Action, lib, schema, config, and shared-boundary rules derived from the permanent code-style law.
applyTo: "src/**/{actions,lib,utils,schemas,config,constants}/**/*.{ts,tsx},src/shared/vendor/**/*,src/shared/api/**/*"
---

# Code style: Actions and shared boundaries

Treat [the permanent code-style law](../../docs/developers/CODE_STYLE_GUIDES.md) as the full source of truth for actions, shared boundaries, and non-UI concerns.

Keep service and boundary concerns explicit:

- every public action implementation file begins with `"use server"`
- use the shared safe-action clients and validate action input with `.inputSchema(...)`
- keep actions thin and push reusable service logic into `lib` or `src/shared/api/` as appropriate
- keep shared API wrappers in `src/shared/api/<resource>/`; use `Effect` there, and keep normal React rendering layers free from Effect imports
- prefer one primary exported function per `lib` file; add additional exports only when they share strong cohesion with the primary concern
- keep `lib` focused on integrations, service boundaries, and operational concerns rather than presenters or schemas
- keep vendor wrappers thin and library-specific under `src/shared/vendor/`
- keep utils pure and free from React, browser, and framework-side orchestration
- keep Zod as the schema source of truth and derive schema-owned types from the schema with `z.infer`
- schema-derived types belong in `types.ts`; do not define inferred types in `.schema.ts` files
- do not place constants in `.schema.ts` files
- keep config declarative, centralize environment access, and keep constants static and behavior-free
- do not swallow errors silently; reuse meaningful application error shapes
- never re-export a `server-only` module (or any file that imports `"server-only"`) from a barrel `index.ts` that client code may import; put server-only exports in a dedicated `server.ts` sibling entrypoint so client-safe and server-only surfaces are always on separate import paths

Load deeper guidance when relevant:

- [code-style-typescript](./code-style-typescript.instructions.md)
- [code-style-reference skill](../skills/code-style-reference/SKILL.md)
