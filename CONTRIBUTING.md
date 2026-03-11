# Contributing

New to the template? Start with
[`docs/developers/START_HERE.md`](./docs/developers/START_HERE.md), then choose
an operating mode in
[`docs/developers/ADOPTION_LEVELS.md`](./docs/developers/ADOPTION_LEVELS.md).

Follow [`docs/developers/CODE_STYLE_GUIDES.md`](./docs/developers/CODE_STYLE_GUIDES.md) for the project's permanent code style,
conventions, placement rules, and layer boundaries. Use
[`docs/developers/AI_SURFACE_MAP.md`](./docs/developers/AI_SURFACE_MAP.md) when
you need to decide which prompt, skill, or agent matters for a task. Workflow
and delivery rules still live in [`AGENTS.md`](./AGENTS.md).

## Branch naming

```text
<type>/<kebab-description>
```

| Type | When to use |
| ---- | ----------- |
| `feat` | New feature |
| `fix` | Bug fix |
| `hotfix` | Critical fix needed immediately |
| `chore` | Maintenance, setup, tooling, dependencies |

Examples: `feat/user-auth`, `fix/login-redirect`, `chore/setup-eslint`

## Opening a pull request

1. **Title** — Title Case, no prefix. e.g. `Setup ESLint`, `Implement Login Page`
2. **Labels** — Always assign at least two labels (one type, one priority):
   - **Type:** `type: feature`, `type: chore`, `type: bug`, `type: hotfix`
   - **Priority:** `priority: high`, `priority: medium`, `priority: low`
3. **Milestone** — Always assign the PR (and its related issues)
   to the current active milestone

## Labels

| Label | Description |
| ----- | ----------- |
| `type: feature` | New functionality or module |
| `type: chore` | Maintenance, refactoring, or tooling updates |
| `type: bug` | Something isn't working as expected |
| `type: hotfix` | Critical fix that needs to be deployed immediately |
| `type: release` | Automated release PR (set by CI) |
| `status: wip` | Work in progress; not ready for review or merge |
| `priority: high` | Critical. Should be prioritized for the next release |
| `priority: medium` | Important, but not a blocker for the release |
| `priority: low` | Nice to have; low impact on core functionality |

## Commit messages

No strict convention. Write clear, descriptive commit messages
that explain what changed and why.

## Release flow

Releases are automated via milestones:

1. Issues and PRs are grouped under a milestone (e.g. `0.2.0`)
2. When all work is done, **close the milestone**
3. A `Release 0.2.0` PR is automatically opened on the `release/0.2.0` branch
4. Review and merge the PR
5. Tag `v0.2.0` and GitHub Release are created automatically
