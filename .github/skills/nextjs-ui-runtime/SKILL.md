---
name: nextjs-ui-runtime
description: Use motion, next-themes, react-icons, and related UI runtime libraries without breaking server-first boundaries. Use this when rendered UI work needs animation, theming, icons, or media processing decisions.
---

# Next.js UI Runtime

Use this skill when a task touches UI runtime libraries beyond Chakra, Ark, or Zag.

Reference:

- [AGENTS.md](../../../AGENTS.md)
- [Next.js UI runtime instruction](../../instructions/nextjs-ui-runtime.instructions.md)
- [Next.js enterprise library decisions](../../../docs/nextjs-enterprise-library-decisions.md)

## Decision guide

- use `motion` only when the interaction needs animation beyond CSS or Chakra transitions
- use `next-themes` only at the theme-provider boundary
- use `react-icons` from explicit subpackages and keep accessibility labels clear
- use `sharp` only in server or build-time image flows
- use `clsx` when class composition is clearer than manual concatenation

## Review checklist

- did the change keep client boundaries narrow?
- is animation justified by UX, not decoration alone?
- are icon imports scoped and accessible?
- did theme behavior stay centralized?
- did any image processing stay off the client?

## Do not

- turn route shells into animation hosts
- sprinkle theme providers through feature code
- import `react-icons` from the root package
