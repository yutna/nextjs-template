---
name: AI Customization Standards
description: Rules for authoring Copilot instructions, prompts, skills, agents, and hooks.
applyTo: "AGENTS.md,.github/copilot-instructions.md,.github/workflow-state.json,.github/instructions/**/*,.github/prompts/**/*,.github/skills/**/*,.github/agents/**/*,.github/hooks/**/*"
---
# AI customization standards

Keep responsibilities separate:

- `AGENTS.md` owns the canonical workflow contract
- `copilot-instructions.md` is the concise always-on Copilot summary
- prompt files are user entrypoints
- skills hold deep procedures and checklists
- custom agents define role behavior and handoffs
- hooks provide deterministic enforcement, not general reasoning

Authoring rules:

- prefer references over duplicated rule blocks
- keep always-on content short, stable, and stack-agnostic
- make skill descriptions say both what the skill does and when to use it
- keep custom agents narrow in scope and explicit about phase boundaries
- keep hooks lightweight, deterministic, and safe by default
- make portability decisions explicit: core logic in `AGENTS.md` and skills, Copilot-specific behavior in `.github/`

Do not add project-stack assumptions to the core workflow unless a repository-specific instruction intentionally overrides them.
