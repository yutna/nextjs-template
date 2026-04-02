---
description: Audit module and shared directory structure against conventions
argument-hint: "[path to audit or 'all']"
---

# /audit-structure

Audit the codebase structure against the repository conventions.

## Behavioral Mode

You are in **Review** phase. Analyze and report findings without making changes.

## Prerequisites

- Check `.claude/workflow-profile.json` for structure conventions
- Reference `CLAUDE.md` for module structure rules

## Audit Scope

### If argument is a path:
Audit only that path and its subdirectories.

### If argument is 'all' or empty:
Audit entire codebase structure.

## Audit Checks

### 1. Module Structure

For each directory in `src/modules/`:

```markdown
## Module: <module-name>

### Required Directories
- [ ] actions/ exists
- [ ] components/ exists
- [ ] containers/ exists
- [ ] screens/ exists
- [ ] hooks/ exists
- [ ] index.ts barrel export exists

### Optional Directories (if present, should follow conventions)
- [ ] contexts/ (React contexts)
- [ ] lib/ (module utilities)
- [ ] styles/ (module CSS)
- [ ] constants/ (module constants)

### File Conventions
- [ ] No generic files (utils.ts, helpers.ts, common.ts)
- [ ] Components use PascalCase
- [ ] Actions use camelCase
- [ ] Hooks use useX naming

### Server/Client Boundaries
- [ ] screens/ files are Server Components (no "use client")
- [ ] components/ are mostly Server Components
- [ ] containers/ use "use client" when needed
- [ ] hooks/ use "use client"
```

### 2. Shared Structure

For `src/shared/`:

```markdown
## Shared Structure

### Required Directories
- [ ] lib/ exists
- [ ] config/ exists
- [ ] components/ exists
- [ ] providers/ exists

### Optional Directories
- [ ] hooks/
- [ ] routes/
- [ ] schemas/
- [ ] types/
- [ ] utils/ (named utilities, not generic)
- [ ] vendor/

### File Conventions
- [ ] No generic catch-all files
- [ ] Clear naming that indicates purpose
```

### 3. App Router Structure

For `src/app/`:

```markdown
## App Router Structure

### Locale Structure
- [ ] [locale]/ directory exists
- [ ] All routes under [locale]/

### Route Conventions
- [ ] page.tsx files are thin (delegate to modules)
- [ ] layout.tsx files handle providers
- [ ] error.tsx files exist for error boundaries
- [ ] loading.tsx files exist for loading states
```

### 4. Translation Structure

For `src/messages/`:

```markdown
## Translation Structure

### Locale Directories
- [ ] en/ exists
- [ ] th/ exists

### Module Translations
- [ ] Each module has translations in both locales
- [ ] Barrel exports include all modules

### File Structure
- [ ] common.json exists
- [ ] errors.json exists
- [ ] modules/<name>/index.json for each module
```

## Forbidden Patterns

Check for and report:

| Pattern | Location | Issue |
|---------|----------|-------|
| `utils.ts` | Any | Use named specific files |
| `helpers.ts` | Any | Use named specific files |
| `common.ts` | Any | Use named specific files |
| `"use client"` | screens/ | Screens should be Server Components |
| Missing barrel | modules/*/ | Every module needs index.ts |

## Output Format

```markdown
# Structure Audit Report

**Date:** [Date]
**Scope:** [Path or 'all']

## Summary
- Modules audited: X
- Conventions followed: Y
- Violations found: Z

## Modules

### ✅ users (compliant)
All conventions followed.

### ⚠️ orders (violations)
- Missing hooks/ directory
- utils.ts found (forbidden pattern)

### ❌ dashboard (non-compliant)
- Missing required directories: actions/, containers/
- "use client" in screens/DashboardScreen.tsx
- No index.ts barrel export

## Shared
[Findings for src/shared/]

## App Router
[Findings for src/app/]

## Translations
[Findings for src/messages/]

## Recommendations

### Critical (must fix)
1. [Issue and fix]

### Warnings (should fix)
1. [Issue and fix]

### Suggestions (nice to have)
1. [Suggestion]
```

## Severity Levels

| Level | Definition |
|-------|------------|
| Critical | Breaks conventions, causes issues |
| Warning | Deviates from strong defaults |
| Suggestion | Could improve consistency |

## Do Not

- Make changes during audit (report only)
- Skip any modules or directories
- Ignore partial violations
- Miss forbidden file patterns
