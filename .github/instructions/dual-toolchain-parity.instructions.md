---
applyTo: ".claude/commands/**,  .github/prompts/**"
---

# Dual-Toolchain Parity Check

When modifying Claude commands or GitHub Copilot prompts, especially the parity-paired files below, **ensure both files are updated together**.

## Parity Pairs

| Claude | Copilot |
|--------|---------|
| `.claude/commands/create-module.md` | `.github/prompts/create-module.prompt.md` |

## Workflow

When you modify a file in a parity pair:

1. **Update both files** to maintain sync
   - Same rules
   - Same examples (with tool-specific syntax adjustments if needed)
   - Same prohibitions (barrel exports, etc.)

2. **Verify parity before delivery**
   ```bash
   npm run check:parity
   ```
   This checks for:
   - Asymmetric modifications (one file updated, the other not)
   - Content rule mismatch (rules mentioned in one but not the other)

3. **If parity check fails**
   - Read the detailed error message
   - Identify which file(s) are out of sync
   - Update the lagging file to match the leading file's rules

## Convention Tiers

The following are **HARD conventions** (non-negotiable):
- ✋ **Barrel re-export prohibition**: Both commands AND prompts must disallow grouping-folder barrel re-exports
- ✋ **Scoped helpers rule**: Both must allow `helpers.ts` ONLY inside concrete folders
- ✋ **Concrete-slice-first**: Both must prefer concrete examples over grouping-folder templates

## Zero-Parity Tolerance

If you find drift:
1. Don't hide it — report it in commit message with `fix:` prefix
2. Fix it immediately in the same commit
3. Update both files in the same PR

See [.claude/commands/create-module.md](/.claude/commands/create-module.md) and [.github/prompts/create-module.prompt.md](/.github/prompts/create-module.prompt.md) for current canonical versions.
