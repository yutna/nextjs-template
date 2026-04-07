# Community Skills Reference

This directory contains skills contributed by the community
([skills.sh](https://skills.sh/)) that are available to both Copilot and Claude as
reference surfaces.

**How they work:** These skills are available when relevant, but reliable usage still
comes from explicitly invoking the skill you want to use. Canonical skills in
`.claude/skills/` and `.github/skills/` take organizational priority by ownership, not
by technical capability.

## Organization

```
.agents/skills/
├── agent-browser/                    ⚡ Safe - Browser automation
├── find-skills/                      ⚡ Safe - Skill discovery
├── next-best-practices/              ⚡ Reference - Use canonical for repo-specific
├── next-cache-components/            ⚠️  Lower priority - Our own Next.js patterns take precedence
├── next-upgrade/                     ⚠️  Lower priority - Our own workflow documented elsewhere
├── skill-creator/                    ⚡ Reference - For extending the skill system
├── vercel-composition-patterns/      ⚠️  May conflict - Use our patterns in canonical skills
├── vercel-react-best-practices/      ⚠️  May conflict - Use our patterns in canonical skills
└── vitest/                           ⚡ Safe - Testing framework patterns
```

## Usage Guidelines

### Community Skills (Available to both tools)
- **`agent-browser/`** - Browser automation for web testing and interaction
- **`vitest/`** - Vitest testing framework patterns and examples
- **`find-skills/`** - Meta-skill for discovering available skills
- **`skill-creator/`** - Patterns for creating new skills
- **`next-best-practices/`** - General Next.js best practices
- **`next-cache-components/`** - Next.js 16 Cache Components guidance
- **`next-upgrade/`** - Next.js upgrade procedures
- **`vercel-composition-patterns/`** - React composition patterns (Vercel)
- **`vercel-react-best-practices/`** - React performance patterns (Vercel)

**Note:** For repo-specific patterns, prefer canonical skills in `.claude/skills/` and `.github/skills/`. They represent your team's documented standards and take organizational precedence.

## Integration

Community skills are:
- ✅ Available for explicit invocation and reference by both Copilot and Claude
- ✅ Independent versioning from canonical skills
- ✅ Can be adopted into canonical skills for team consistency

**Usage strategy:** If a community skill pattern is valuable for your team, adopt specific patterns into canonical skills (`.claude/skills/` or `.github/skills/`) for repo consistency and team ownership.

## Adding New Community Skills

To add new community skills from skills.sh:

```bash
npm install --save-dev @skills/my-skill
# Then extract and place in .agents/skills/my-skill/
```

Document the skill's purpose and priority (safe vs lower-priority) above.

---

**See also:**
- Canonical skills: [`.claude/skills/`](../.claude/skills/)
- Copilot symlink: [`.github/skills/`](../.github/skills/)
