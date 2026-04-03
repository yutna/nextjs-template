---
applyTo: "**"
---
# Core Workflow Instructions

Follow the [AI Workflow Contract](../../AGENTS.md) for all development tasks.

## Workflow Phases

1. **Discovery** - Clarify requirements before planning
2. **Planning** - Design approach before implementing
3. **Implementation** - Code within approved scope
4. **Quality Gates** - Type check → Lint → Tests
5. **Verification** - Confirm acceptance criteria
6. **Delivery** - Summarize and hand off

## Non-Negotiable Rules

- No implementation before clarified requirements
- No non-trivial code changes before a plan exists
- No delivery before gates and verification pass
- No silent architecture or convention changes

## State Management

Track progress in `.claude/workflow-state.json`:
- Check state before taking action
- Update state after completing phases
- Never skip phases

## Convention Tiers

- **Hard conventions**: Must follow (blocking if violated)
- **Strong defaults**: Follow unless justified deviation
- **Local freedom**: Implementation details that can vary

## Zero Tolerance Policy

**Target: 0 warnings, 0 errors — always.** See [AGENTS.md](../../AGENTS.md) for full details.

HARD rules:
- No `any` type
- No eslint-disable as first resort (fix root cause or use config)
- No type assertions that break lint rules
- Fix lint rules if they don't support valid TypeScript
- Prefer named `function` declarations for named functions
- No inline param type literals; extract to `types.ts`
- Prefer direct React type imports (no `React.ChangeEvent` namespace style)
- Use one object-based `useImmer({ ... })` state store when local state is required
- No deprecated APIs (especially Zod deprecations)

## Workflow Best Practices

### Database Changes

For DB-related work, planning and verification must include:
- target environment (`dev`, `test`, `prod`)
- migration impact + rollback strategy
- seed impact + determinism expectations
- post-change gates including tests that depend on DB state

### Environment Variables

When adding or renaming any environment variable:
1. Add it to **every** `.env.*` file at repo root (currently: `.env.example`, `.env.local`)
2. `.env.example` must have a placeholder or safe default value — never real secrets
3. `.env.local` must have the actual working value for local development
4. Block delivery if any `.env.*` file is missing the new variable

### One Component Per File

Each component file exports ONE component. Multiple exports → separate folders.

### Testing

- Read source before writing tests (don't assume values)
- One test file per source file
- Mock motion/framer-motion warnings in test setup

### Signature Changes

When changing function signatures:
1. Find all usages first: `grep -rn "functionName(" src/`
2. Update all callers in same commit
3. Run full checks: `npm run lint && npm run check-types && npm test`
