# Agent Skills Standard Notes

This repository follows the open Agent Skills format for local skills and for
any vendored upstream skill packs.

Reference:

- [Agent Skills overview](https://agentskills.io/home)
- [What are skills?](https://agentskills.io/what-are-skills)
- [Using scripts in skills](https://agentskills.io/skill-creation/using-scripts)

## What we adopt

- each skill is a folder containing a required `SKILL.md`
- `SKILL.md` frontmatter keeps the portable minimum: `name` and `description`
- `name` matches the folder slug and uses lowercase kebab-case
- `description` explains both the capability and the trigger condition so agents can discover the skill reliably
- `SKILL.md` stays concise and points to deeper context progressively through `references/`, `scripts/`, and `assets/`
- bundled files are referenced with relative paths from the skill directory root
- prerequisites are stated explicitly, and runtime-level requirements can use the standard `compatibility` field when needed

## Repository conventions on top of the standard

- local workflow skills must still align with the six-phase workflow contract in [AGENTS.md](../AGENTS.md)
- repository validators enforce portable naming and trigger-friendly descriptions
- upstream skill packs remain additive and do not override local workflow rules
