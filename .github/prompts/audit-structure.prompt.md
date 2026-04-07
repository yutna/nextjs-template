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
- Reference `AGENTS.md` and `.github/instructions/nextjs-modules.instructions.md` for module structure rules

## Audit Scope

### If argument is a path

Audit only that path and its subdirectories.

### If argument is 'all' or empty

Audit entire codebase structure.

## Audit Checks

### 1. Module Structure

For each directory in `src/modules/`:

```markdown
## Module: <module-name>

### Present Directories Follow Conventions
- [ ] folder names follow approved patterns
- [ ] no grouping-folder barrels such as actions/index.ts or services/index.ts
- [ ] module index.ts is optional and narrow if present

### Optional Directories (if present, should follow conventions)
- [ ] contexts/ (React contexts)
- [ ] lib/ (module utilities)
- [ ] styles/ (module CSS)
- [ ] constants/ (module constants)

### File Conventions
- [ ] No generic root-level files (utils.ts, common.ts)
- [ ] scoped helpers.ts files are internal and not exported broadly
- [ ] concrete folders use approved prefixes like `screen-`, `container-`, `section-`, `form-`, and `use-`
- [ ] main implementation files match their folder name in kebab-case
- [ ] hooks live in `use-<name>/use-<name>.ts`

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
- [ ] locale root `index.ts` exists
- [ ] `common/index.ts`, `modules/index.ts`, and `shared/index.ts` exist
- [ ] module/shared folders compose with `index.ts` files plus leaf JSON files
- [ ] mirrored locale folders keep the same composition shape in `en/` and `th/`
```

## Forbidden Patterns

Check for and report:

| Pattern | Location | Issue |
|---------|----------|-------|
| `utils.ts` | Any | Use named specific files |
| root-level `helpers.ts` | Any module/shared root | Use a scoped helper file inside a concrete folder |
| `common.ts` | Any | Use named specific files |
| `"use client"` | screens/ | Screens should be Server Components |
| grouping-folder barrel | modules/*/actions, services, repositories | Import concrete folders directly |

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
- root-level utils.ts found
- "use client" in screens/DashboardScreen.tsx
- actions/index.ts grouping barrel present

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
