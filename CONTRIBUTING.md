# Contributing

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

## Dual-Toolchain Parity

This repository maintains Claude Code and GitHub Copilot as co-equal development toolchains. Both are configured with identical conventions, workflow phases, and code generation scaffolding.

### Parity file pairs

The following files **must be kept in sync**:

| File Pair | Purpose |
|-----------|---------|
| `.claude/commands/create-module.md` ↔ `.github/prompts/create-module.prompt.md` | Module scaffolding for both toolchains |

Whenever you modify one file in a pair, **you must also update the other** to ensure both toolchains generate equivalent code.

### Parity checks (automated by default)

Parity is enforced automatically in workflow hooks and CI. Use manual checks only as a local verification fallback:

```bash
# Check all files for parity drift
./bin/vibe parity-check

# Check with all files (not just staged)
./bin/vibe parity-check --all
```

The command checks for these parity rules:

- **barrel-export-prohibition**: Both must disallow grouping-folder barrel re-exports
- **scoped-helpers-allowed**: Both must allow `helpers.ts` only inside concrete folders
- **concrete-slice-first**: Both must prefer concrete examples over grouping-folder templates

**AI Assistance**: Claude Code and GitHub Copilot hooks will auto-detect when you modify parity-paired files and remind you to keep them in sync.

## Release flow

Releases are automated via milestones:

1. Issues and PRs are grouped under a milestone (e.g. `0.2.0`)
2. When all work is done, **close the milestone**
3. A `Release 0.2.0` PR is automatically opened on the `release/0.2.0` branch
4. Review and merge the PR
5. Tag `v0.2.0` and GitHub Release are created automatically
