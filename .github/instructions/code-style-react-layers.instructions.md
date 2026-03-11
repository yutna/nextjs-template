---
name: Code Style React Layers
description: React-layer boundaries and App Router ownership rules derived from the permanent code-style law.
applyTo: "src/app/**/*,src/modules/**/{screens,containers,components,layouts,hooks,contexts,providers}/**/*.{ts,tsx},src/shared/components/**/*,src/shared/layouts/**/*,src/shared/hooks/**/*,src/shared/contexts/**/*,src/shared/providers/**/*"
---
# Code style: React layers

Treat [the permanent code-style law](../../docs/developers/CODE_STYLE_GUIDES.md) as the full source of truth for React-layer boundaries.

Keep the server-first layer model intact:

- keep route-entry `page.tsx` files thin, server-first, and focused on route-boundary concerns
- keep route-boundary `layout.tsx` files thin adapters that own boundary responsibilities rather than reusable page composition
- keep special App Router files (`loading`, `error`, `not-found`, `template`, and related boundaries) as framework-boundary concerns instead of forcing the screen/container chain
- keep reusable layout components separate from App Router `layout.tsx` files
- keep screens server-first and composed from containers only
- keep containers as the bridge layer that binds logic to presenter components
- bind presenter props explicitly instead of spreading hook return objects into JSX
- keep presenter components logic-light and do not import containers, screens, actions, hooks, contexts, or providers into them
- keep hooks as the home for extracted client logic and browser interaction state
- keep contexts responsible for the context object and contracts only; keep providers separate
- keep App Router error boundaries as the narrow documented exception that may use hooks or actions directly
- add `"use client"` only at the smallest leaf that truly needs client behavior

Load narrower or deeper guidance when relevant:

- [nextjs-template-architecture](./nextjs-template-architecture.instructions.md)
- [code-style-routes-and-i18n](./code-style-routes-and-i18n.instructions.md)
- [code-style-ui-system](./code-style-ui-system.instructions.md)
- [code-style-reference skill](../skills/code-style-reference/SKILL.md)
