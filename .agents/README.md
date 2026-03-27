# Upstream Skill Packs

This workflow keeps the six-phase core local to this repository and treats
community skill packs as an additive layer.

The repository currently vendors the approved upstream packs into
`.agents/skills/` so adopters get a ready-to-use baseline instead of a
manifest-only placeholder.

Both local skills and vendored upstream packs should remain compatible with the
open [Agent Skills standard](https://agentskills.io/home).

Use upstream packs to import evolving framework knowledge without rewriting
that guidance into the workflow core:

- `next-best-practices` for App Router, RSC, metadata, route handlers, and
  special-file guidance
- `next-cache-components` for caching and cache-component patterns
- `next-upgrade` for framework upgrade and migration support
- `vercel-composition-patterns` for reusable component API design
- `vercel-react-best-practices` for React and Next.js performance review
- `agent-browser` for browser-driven verification
- `vitest` for test authoring and debugging
- `find-skills` for discovering additional packs when the stack changes

The lock manifest lives in [skills-lock.json](../skills-lock.json). It records
the upstream repo, source path, commit ref, vendored directory name, and
content hash for every approved pack mirrored into `.agents/skills/`.

Teams can refresh those vendored copies from the recorded upstream refs or use
the same manifest to install packs through their skill manager of choice.

Rules:

- local workflow artifacts remain the source of truth for phase control,
  state, routing policy, and repository conventions
- upstream packs refine framework knowledge; they do not override the local
  workflow contract
- vendored upstream packs in `.agents/skills/` are mirrored dependencies and
  should be refreshed deliberately from `skills-lock.json`, not edited casually
- local skill folders should keep standard `SKILL.md` structure, portable
  frontmatter, and relative references so they can move across compatible
  tools
- when a pack is unavailable, agents fall back to local instructions and note
  the missing capability instead of blocking the task

Suggested mapping:

- Discovery / Planning: `next-best-practices`, `next-upgrade`,
  `find-skills`
- Implementation / Review: `vercel-composition-patterns`,
  `vercel-react-best-practices`, `next-cache-components`
- Verification: `agent-browser`, `vitest`
