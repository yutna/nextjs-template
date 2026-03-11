# ESCAPE_HATCHES

## Purpose

This guide explains when a team may intentionally deviate from the default
workflow or architectural patterns.

## Guardrails that do not move

- do not skip requirements clarification when ambiguity changes behavior
- do not skip planning for non-trivial work
- do not deliver before applicable gates and verification pass
- do not break module or layer boundaries for convenience
- do not duplicate architecture rules in multiple places just to make an
  exception feel permanent

## Allowed escape hatches

### Workflow compression

One person may play multiple roles.

- Lite adoption can skip optional prompts or specialist agents.
- Hotfixes can compress the documentation trail.
- You may compress who performs the work, but not what must be true before
  delivery.

### Framework-required exceptions

Some files must follow framework rules that are narrower than the general
architecture.

- App Router special files keep their framework-mandated names.
- framework-specific default exports stay allowed where Next.js requires
  them
- documented special cases such as `global-error.tsx` stay explicit and
  narrow

### Boundary exceptions

These need an explicit reason and the smallest possible blast radius.

- a browser-only library forces a small client boundary
- a framework integration or external tool needs a raw route string outside
  the usual helper path
- a trivial route file does not justify a heavier screen/container split
  than the framework boundary already provides

## What needs explicit approval

- cross-module imports
- new top-level architectural folders
- disabling a quality gate
- introducing a parallel data, action, or routing pattern when an existing
  one already fits

## How to record an exception

Every non-trivial deviation should record four things:

1. why the default pattern did not fit
2. which files or boundaries were affected
3. how the exception was isolated
4. what would let the team remove the exception later

## Recommendation

Reach for an escape hatch only after you have checked
[`ADOPTION_LEVELS.md`](./ADOPTION_LEVELS.md),
[`CODE_STYLE_GUIDES.md`](./CODE_STYLE_GUIDES.md), and the reference example
at `/en/reference-patterns`.
