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

Use the customization layers for their intended purpose:

- always-on policy: `AGENTS.md` and this file
- targeted rules: `.github/instructions/*.instructions.md`
- deep procedures: `.github/skills/`
- repeatable entrypoints: `.github/prompts/`
- specialist roles: `.github/agents/`
- deterministic enforcement: `.github/hooks/`

When in doubt, move one phase earlier, make state explicit, and choose the smaller safe step.
