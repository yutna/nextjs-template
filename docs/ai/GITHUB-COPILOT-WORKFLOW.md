# Vibe Coding with GitHub Copilot

Welcome to the team! This guide covers both supported GitHub Copilot surfaces on this
project:

1. **GitHub Copilot CLI** in terminal sessions
2. **GitHub Copilot Chat** in VS Code or github.com

## What You Need Before Starting

1. **GitHub Copilot** subscription (Individual or Business)
2. One supported Copilot surface:
   - `copilot` CLI installed and authenticated
   - VS Code with Copilot Chat extension
3. **Node.js 24.14+** (managed by [mise](https://mise.jdx.dev))
4. Run `npm install` in the project root

## Shared Repo Guardrails

Both Copilot CLI and Copilot Chat use the same repo workflow contract and instruction
surfaces:

- `AGENTS.md` — universal six-phase workflow contract
- `CLAUDE.md` — shared repo instruction surface that Copilot CLI also reads
- `.github/instructions/**/*.md` — path-specific guidance
- `.github/copilot-instructions.md` — Copilot-specific repo guidance

Use those files as the baseline. Then add the surface-specific tools below.

## Choose Your Copilot Surface

| Surface | Best For | Surface-Specific Extras |
|---------|----------|-------------------------|
| **Copilot CLI** | Terminal-first work, scripting, local agent workflows | Built-in commands such as `/plan`, `/research`, `/review`, `/agent`, `/skills`, `/instructions`, and `/mcp` |
| **Copilot Chat** | Editor-first work with prompt files and `@workspace` context | Repo prompts in `.github/prompts/`, orchestration agent mode, `.vscode/mcp.json` |

### Copilot CLI

Use Copilot CLI when you want terminal-native AI assistance:

```bash
copilot
```

Copilot CLI does **not** expose this repo's `/discover`, `/plan-work`, `/implement`,
`/gates`, `/deliver`, and `/recover` files as native CLI slash commands. Instead:

- use plain-language requests to drive Discovery, Implementation, Recovery, and
  Delivery
- use `/plan` for implementation planning
- use `/research` for deeper investigation
- use `/review` for Copilot's built-in review flow
- use `/agent`, `/skills`, `/instructions`, and `/mcp` to inspect the current session

### Copilot Chat

Use Copilot Chat when you want repo-defined prompt files and editor context:

- repo prompts from `.github/prompts/`
- `@workspace` context in VS Code Chat
- orchestration agent mode for routing across specialist agents

## How the Workflow Works

Every non-trivial feature follows the same six phases on this repo:

```txt
Discovery -> Planning -> Implementation -> Quality Gates -> Verification -> Delivery
```

Copilot does not auto-chain the entire workflow for you on this repo. Treat phase
transitions as explicit, even when agent routing helps.

### Phase Entry Points By Surface

| Phase | Copilot CLI | Copilot Chat |
|-------|-------------|--------------|
| Discovery | Describe the task and ask for scope, constraints, and acceptance criteria | Start with `/discover` or let orchestration route there |
| Planning | Use `/plan` or ask for an implementation plan explicitly | Use `/plan-work` |
| Implementation | Ask Copilot to implement the approved plan without expanding scope | Use `/implement` |
| Review | Use `/review` or ask for a review pass | Use `/review` |
| Quality Gates | Ask Copilot to run the repo commands explicitly | Use `/gates` |
| Verification | Ask Copilot to confirm acceptance criteria after gates are green | Ask for verification or continue the review/gates flow |
| Delivery | Ask for a delivery handoff after verification passes | Use `/deliver` |
| Recovery | Ask for root-cause analysis and the right rollback phase; use `/research` when the issue is broad | Use `/recover` |

## Agent Support

Custom agents live in `.github/agents/` and map to the workflow phases:

- **Workflow Orchestrator**
- **Requirements Analyst**
- **Implementation Planner**
- **Implementer**
- **Code Reviewer**
- **Quality Verifier**

### In Copilot CLI

Use `/agent` to inspect or select available agents in the current session.

### In Copilot Chat

Use orchestration agent mode when you want Copilot to route phases across those
specialists for you.

## Copilot Chat Prompt Reference

These repo-defined prompts are for Copilot Chat surfaces:

### Workflow Prompts

| Prompt | When To Use | What It Does |
|--------|-------------|--------------|
| `/discover` | Starting a new feature | Clarifies requirements, defines scope |
| `/plan-work` | After requirements are clear | Creates implementation plan |
| `/implement` | After plan is approved | Builds the feature |
| `/review` | After implementation | Reviews for correctness |
| `/gates` | When you need explicit gate execution | Runs type-check, lint, tests |
| `/deliver` | After verification passes | Prepares handoff summary |
| `/recover` | When something breaks | Diagnoses and fixes failures |

### Scaffolding Prompts

| Prompt | What It Creates |
|--------|----------------|
| `/create-module` | Full feature module |
| `/add-server-action` | Server action with Zod validation |
| `/add-translation` | i18n messages for en/th |
| `/implement-e2e` | Playwright E2E tests from scenario specs |
| `/audit-structure` | Checks module structure against conventions |

### Requirements Prompt

| Prompt | What It Does |
|--------|--------------|
| `/decompose-requirements` | Breaks large features into phased tasks with Gherkin scenarios, state machines, and E2E test specs |

## Copilot CLI Commands Worth Knowing

These are built-in Copilot CLI commands that pair well with this repo workflow:

| Command | Use It For |
|---------|------------|
| `/plan` | Create an implementation plan before coding |
| `/research` | Run a deeper investigation |
| `/review` | Review current changes |
| `/agent` | Inspect or select available agents |
| `/skills` | Inspect or manage available skills |
| `/instructions` | Inspect active instruction files |
| `/mcp` | Inspect or manage MCP server configuration |

## MCP Servers

This repo uses the same MCP server set across toolchains:

| Tool | What It Does |
|------|--------------|
| **Playwright** | Browser automation and E2E verification |
| **Ark UI** | Component documentation lookup |
| **Chakra UI** | Design system documentation |
| **Next.js DevTools** | Framework-specific tooling |

Configuration depends on the Copilot surface:

| Surface | MCP Configuration |
|---------|-------------------|
| **Copilot CLI** | `/mcp`, `~/.copilot/mcp-config.json`, or `copilot --additional-mcp-config` |
| **Copilot Chat (VS Code)** | `.vscode/mcp.json` |
| **Claude Code** | `.mcp.json` |

## Working Effectively

### In Copilot CLI

- Use `/instructions` if you want to confirm which repo instruction files are active.
- Use `/skills` when you want to inspect skill availability before invoking one.
- Use `/mcp` to confirm server availability before relying on MCP-backed guidance.
- Use `/plan` before coding when the task is non-trivial.

### In Copilot Chat

- Use `@workspace` when you want broader repository context.
- Use the repo prompt files when you want an explicit phase transition.
- Use orchestration agent mode when you want Copilot to route between the phase
  specialists.

### For Both Surfaces

- Be specific about the outcome you want.
- Review the plan carefully before implementation starts.
- Ask Copilot to run the real repo commands instead of accepting a vague "looks good."

## Quality Gates And Done

This project has a zero-tolerance policy. Code is not done if any of these exist:

- type errors
- lint warnings or errors
- failing tests
- missing required tests
- incomplete implementation versus the approved plan

Use the repo commands explicitly:

```bash
npm run check-types
npm run lint
npm run test
```

## Quick Reference

### Copilot CLI

```txt
Start session:        copilot
Discovery:            Describe the task and ask for scope + acceptance criteria
Planning:             /plan
Implementation:       Ask Copilot to implement the approved plan
Review:               /review
MCP/config check:     /mcp or /instructions
```

### Copilot Chat

```txt
Open chat:            Open Copilot Chat in VS Code
Discovery:            /discover
Planning:             /plan-work
Implementation:       /implement
Big feature:          @workspace /decompose-requirements [description]
Agent routing:        Switch to orchestration agent mode
```

## Need Help?

- **Workflow contract**: Read `AGENTS.md`
- **Copilot repo guidance**: Read `.github/copilot-instructions.md`
- **Commands reference**: Read `docs/general/COMMANDS.md`
- **Official Copilot docs**: https://docs.github.com/en/copilot
