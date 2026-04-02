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

- Required directories: actions/, components/, containers/, screens/, hooks/
- Barrel exports (index.ts) present
- No generic files (utils.ts, helpers.ts, common.ts)
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
| `helpers.ts` | Use named specific files |
| `"use client"` in screens/ | Screens should be Server Components |
| Missing barrel exports | Every module needs index.ts |

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
