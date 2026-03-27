---
applyTo: "**"
---
# GitHub Copilot workflow summary

Treat [AGENTS.md](../AGENTS.md) as the canonical operating contract.

Follow the same phase order every time:

1. Discovery
2. Planning
3. Implementation
4. Quality Gates
5. Verification
6. Delivery

Hard rules:

- do not implement before requirements are clear
- do not make non-trivial changes before a plan exists
- do not deliver before applicable gates and verification pass
- ask clarifying questions when ambiguity changes behavior or scope
- preserve existing architecture, conventions, and naming unless the user explicitly wants change
- update [`.github/workflow-state.json`](./workflow-state.json) as the task moves between phases
- treat the workflow as a contract-driven grammar; example repositories and prior outputs are proof targets, not the source of truth
- classify convention decisions as `hard conventions`, `strong defaults`, or `local freedom`
- block hard-convention drift, justify strong-default deviations in the plan, and allow local-freedom variation only inside stable boundaries

Use the customization layers for their intended purpose:

- always-on policy: `AGENTS.md` and this file
- targeted rules: `.github/instructions/*.instructions.md`
- deep procedures: `.github/skills/`
- repeatable entrypoints: `.github/prompts/`
- specialist roles: `.github/agents/`
- deterministic enforcement: `.github/hooks/`

When the Next.js enterprise profile is active, also use the matching Next.js
instructions, MCP playbook, i18n playbook, and approved upstream skill packs
when they are available.

In the interactive UI stack, prefer Chakra UI, then Ark UI, then Zag.js before
inventing custom client-state primitives.

When a Next.js task touches env, logging, client cache, URL state, state
machines, theming, animation, or icon libraries, follow the dedicated library
decision skills instead of improvising usage patterns.

Prefer code shapes with narrow seams and isolated side effects so changed
behavior remains practical to cover with automated tests.

When the Next.js enterprise profile is active, keep product folders and file
names deterministic: canonical feature slugs, fixed feature top-level folders,
kebab-case file names, and no generic `utils` or `helpers` buckets.

When in doubt, move one phase earlier, make state explicit, and choose the smaller safe step.
