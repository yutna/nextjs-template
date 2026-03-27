---
name: Next.js Migration
description: Guide legacy Next.js migrations into the server-first App Router architecture without losing parity.
applyTo: "docs/migrations/**/*,.github/prompts/migrate-legacy-nextjs.prompt.md,.github/agents/migrator.agent.md"
---
# Next.js migration

Migration work is discovery and planning heavy.

Rules:

- inventory the legacy surface before proposing rewrites
- separate codemod-safe work from manual redesign work
- map every legacy route to a target App Router destination
- identify client-heavy boundaries, Pages Router dependencies, and custom webpack/server assumptions early
- inventory testability debt such as logic trapped in route files, hidden side effects, or browser-only verification paths
- inventory legacy library decisions for env, logging, SWR, URL-state, state machines, theming, and animation before proposing replacements
- define parity checks before implementation begins
- use a migration tracker artifact so rollout waves, rollback points, and blockers stay explicit

Do not:

- promise one-shot migrations without a rollback plan
- mix greenfield guidance with legacy exceptions
- implement migration fixes before the inventory and sequencing plan are explicit
