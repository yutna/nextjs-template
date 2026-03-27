# Contributing

## Branch naming

Use:

```text
<type>/<kebab-description>
```

Examples:

- `feat/landing-hero-refresh`
- `fix/locale-redirect`
- `chore/workflow-proof`

## Workflow expectation

This repository follows the six-phase workflow in [AGENTS.md](./AGENTS.md).

For non-trivial work:

1. clarify the request
2. plan before changing behavior
3. implement only approved scope
4. run quality gates
5. verify behavior
6. deliver with an honest summary

Do not skip directly from vague requirements to code.

## Before opening a pull request

Run:

```bash
npm run typecheck
npm run lint
npm test
npm run workflow:doctor
npm run workflow:validate-state
npm run workflow:validate-repo
npm run workflow:audit-structure
npm run workflow:proof
npm run build:example-env
```

If any command fails, fix the root cause and rerun the full sequence.

## Pull request expectations

- keep scope narrow and intentional
- explain behavior changes clearly
- call out remaining risks or follow-up items explicitly
- keep routing, i18n, file-system, and testability decisions aligned with the workflow profile

## Commit messages

Write clear messages that say what changed and why.
