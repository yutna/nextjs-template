---
name: nextjs-zag-js
description: Use Zag.js deliberately for complex interactive UI primitives in the Next.js enterprise stack. Use this during Planning, Implementation, or Review when Chakra UI and Ark UI are not enough out of the box.
---

# Next.js Zag.js

Use this skill when a task introduces or reviews non-trivial interactive UI
primitives.

Reference:

- [AGENTS.md](../../../AGENTS.md)
- [Next.js enterprise design](../../../docs/nextjs-enterprise-workflow-design.md)
- [Next.js client boundary skill](../nextjs-client-boundary/SKILL.md)

## Position in the stack

In this workflow:

- Chakra UI is the preferred high-level component surface
- Ark UI is the preferred headless composition surface
- Zag.js is the interaction-machine layer beneath those primitives

Think of Zag.js as the place for reusable component interaction models, not
for page-level business workflows.

## When to use Zag.js

- a complex interactive primitive is needed and Chakra/Ark wrappers are not sufficient
- focus management, keyboard behavior, typeahead, selection state, or overlay behavior must be explicit
- the team needs a reusable headless primitive with accessible interaction semantics

## When not to use Zag.js

- simple local toggles or tiny one-off UI state
- domain workflows that belong in server logic or broader application state
- cases where an existing Chakra or Ark primitive already solves the problem cleanly

## Planning checklist

1. Can Chakra UI solve this directly?
2. If not, can Ark UI composition solve it cleanly?
3. If not, does the interaction justify a dedicated Zag.js machine?
4. What is the smallest client boundary that can host the primitive?
5. Which accessibility and keyboard behaviors must be preserved?

## Review checklist

- Zag.js is used for primitive interaction, not business orchestration
- no ad hoc boolean-state sprawl replaced a standard primitive
- the client boundary is still narrow
- the primitive is accessible by design
- the implementation does not duplicate Chakra or Ark behavior without reason
