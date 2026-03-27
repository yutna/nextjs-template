# Next.js Enterprise Testability Playbook

This profile treats testability as a design constraint, not just a QA preference.

## Goal

Changed behavior should be easy to exercise through automated tests without requiring a full browser session or full Next.js route boot unless the behavior truly depends on that layer.

## Core principles

- keep route files and layout files thin
- isolate side effects behind modules or adapters
- extract pure decision logic whenever the framework is not the real subject under test
- keep client islands small so interaction logic can be tested in narrow units
- use browser verification to confirm rendered behavior, not to replace automation that should exist

## Preferred test surface by layer

### Route shells

- verify composition, params plumbing, and segment behavior
- move parsing and business decisions into feature modules

### Feature modules

- test loaders, presenters, mappers, and policy helpers directly
- keep DTO shaping and normalization out of JSX when possible

### Server Actions

- test validation, authorization, result shaping, and invalidation decisions through focused module seams
- keep entrypoints thin and delegate writes to server-owned modules

### Client leaves

- test only the client-specific interaction layer
- use Chakra UI, Ark UI, and Zag.js primitives instead of bespoke state when they already model the behavior

## Smells that should trigger refactoring

- a small branch can only be verified by booting the full app
- route files own mapping, authorization, or orchestration logic
- tests need unstable globals, timers, random values, or network calls because side effects were not isolated
- browser QA is the only way to verify repeatable behavior that could have a narrower seam

## Review and verification expectations

- reviewer should flag avoidable hard-to-test code shape as a real finding
- verifier should call out when weak automated coverage is caused by architecture rather than missing effort
- migration plans should inventory testability debt alongside route and client-boundary debt
