---
applyTo: ".claude/commands/**,  .github/prompts/**"
---

# Dual-Toolchain Parity Check

When modifying Claude commands or GitHub Copilot prompts, especially the currently enforced parity-paired files below, **ensure both files are updated together**.

## Parity Pairs

| Claude | Copilot |
|--------|---------|
| `.claude/commands/create-module.md` | `.github/prompts/create-module.prompt.md` |
| `.claude/commands/discover.md` | `.github/prompts/discover.prompt.md` |
| `.claude/commands/plan-work.md` | `.github/prompts/plan-work.prompt.md` |
| `.claude/commands/implement.md` | `.github/prompts/implement.prompt.md` |

These are the hard-enforced parity pairs today. Other mirrored command/prompt surfaces should stay semantically aligned, but this file only treats the pairs above as blocking parity contracts until enforcement expands.

## Workflow

When you modify a file in a parity pair:

1. **Update both files** to maintain sync
   - Same rules
   - Same examples (with tool-specific syntax adjustments if needed)
   - Same prohibitions (barrel exports, etc.)
   - Tool-specific front matter and link syntax may differ, but behavioral rules must not drift

2. **Verify parity before delivery**
   ```bash
   npm run parity:all
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
- ✋ **Discovery parity**: `discover` pairs must require explicit/testable acceptance criteria and recommend decomposition for large scope
- ✋ **Planning parity**: `plan-work` pairs must require file-count, decomposition-artifact, and DB-planning metadata
- ✋ **Implementation parity**: `implement` pairs must require checkpoint-stop behavior, one-primary-responsibility per file, and no local implementation types

## Zero-Parity Tolerance

If you find drift:
1. Don't hide it — report it in commit message with `fix:` prefix
2. Fix it immediately in the same commit
3. Update both files in the same PR

See the paired files above for the current canonical command/prompt surfaces.
