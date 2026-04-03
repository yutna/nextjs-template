---
name: audit-structure
description: Audit module and shared directory structure against conventions
---

# /audit-structure

Audit the codebase structure against the repository conventions.

## Behavioral Mode

You are in **Review** phase. Analyze and report findings without making changes.

## Prerequisites

- Check `.claude/workflow-profile.json` for structure conventions
- Reference [AGENTS.md](../../AGENTS.md) for module structure rules

## Audit Scope

### If argument is a path:
Audit only that path and its subdirectories.

### If argument is 'all' or empty:
Audit entire codebase structure.

## Audit Checks

### 1. Module Structure

For each directory in `src/modules/`:

- Present directories follow approved naming patterns
- No grouping-folder barrels such as actions/index.ts or services/index.ts
- Module index.ts is optional and narrow if present
- No generic root-level files (utils.ts, common.ts)
- Scoped helpers.ts files are allowed when kept internal to a concrete folder
- Server/client boundaries respected

### 2. Shared Structure

For `src/shared/`:

- Required directories: lib/, config/, components/, providers/
- Entities only in shared/entities/
- No cross-module imports

### 3. App Router Structure

For `src/app/`:

- [locale]/ directory structure
- Thin page.tsx files
- Error and loading boundaries

### 4. Translation Structure

For `src/messages/`:

- en/ and th/ directories exist
- Each module has translations in both locales

## Forbidden Patterns

| Pattern | Issue |
|---------|-------|
| `utils.ts` | Use named specific files |
| root-level `helpers.ts` | Use a scoped helper file inside a concrete folder |
| `"use client"` in screens/ | Screens should be Server Components |
| grouping-folder barrels | Import concrete folders directly |

## Output Format

```markdown
# Structure Audit Report

**Scope:** [Path or 'all']

## Summary
- Modules audited: X
- Conventions followed: Y
- Violations found: Z

## Findings

### Critical (must fix)
- [Issue and location]

### Warnings (should fix)
- [Issue and location]

### Suggestions
- [Improvement]
```

## Do Not

- Make changes during audit (report only)
- Skip any modules or directories
- Ignore partial violations
