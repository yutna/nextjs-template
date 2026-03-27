---
name: Agent Skills Standard
description: Author local skills to match the open Agent Skills format and best practices.
applyTo: ".github/skills/**/SKILL.md,.agents/README.md,skills-lock.json"
---
# Agent Skills standard

Local skills in this repository should follow the open Agent Skills standard.

Rules:

- every skill lives in its own folder with a required `SKILL.md`
- required frontmatter stays minimal and portable: `name` and `description`
- `name` should match the directory slug and use lowercase kebab-case
- `description` should say both what the skill does and when to use it so agents can trigger it reliably
- keep `SKILL.md` focused on progressive disclosure: core instructions in the file, deeper material in `references/`, executable logic in `scripts/`, reusable resources in `assets/`
- reference bundled files with relative paths from the skill root
- state prerequisites explicitly in the skill body; if runtime compatibility metadata is needed, use the standard `compatibility` frontmatter field instead of hiding requirements in prose alone

Do not:

- invent repository-specific skill metadata when the open standard already has a portable field
- hardcode absolute local paths inside `SKILL.md`
- bury the usage trigger so deeply that discovery-time matching becomes unreliable
