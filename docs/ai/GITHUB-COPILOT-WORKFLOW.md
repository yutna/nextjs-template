# Vibe Coding with GitHub Copilot

Welcome to the team! This guide covers the supported workflow for GitHub Copilot Chat in VS Code on this project.

## What You Need Before Starting

1. **GitHub Copilot** subscription (Individual or Business)
2. **VS Code** with Copilot Chat extension
3. **Node.js 24.14+** (managed by [mise](https://mise.jdx.dev))
4. Run `npm install` in the project root
5. Open the project in VS Code

This repository provides Copilot-specific prompts, instructions, and agent docs. Use them through Copilot Chat in VS Code.

The default model is orchestration-first automation: users should only manually do two things.

1. Run `/decompose-requirements` for large features.
2. Switch Copilot to orchestration agent mode.

Everything else should be automated by prompts, hooks, scripts, and CI.

## How the Workflow Works

Every non-trivial feature follows 6 phases. Copilot's workflow docs and prompts map to those phases.

```txt
  You describe           Analyst clarifies      Planner designs        Implementer builds
  what you want          requirements           the approach           the feature
       |                      |                      |                      |
       v                      v                      v                      v
  +---------+          +------------+          +-----------+         +----------------+
  |  START  |--------->| Discovery  |--------->|  Planning |-------->| Implementation |
  +---------+          +------------+          +-----------+         +----------------+
                                                                            |
                       +------------+          +------------+               |
                       |  Delivery  |<---------| Verification|<-------------+
                       +------------+          +------------+
                             |                       ^
                             v                       |
                       +-----------+          +-------------+
                       |   DONE    |          | Quality     |
                       +-----------+          | Gates       |
                                              +-------------+
                                               type-check
                                               lint
                                               test
```

### The Agent Team

Copilot uses specialized agents that work together:

```txt
                    +----------------+
                    |  Orchestrator  |  <-- Routes your request
                    +----------------+
                     /    |    |    \
                    v     v    v     v
             +------+ +------+ +------+ +------+
             |Analyst| |Planner| |Impl. | |Verifier|
             +------+ +------+ +------+ +------+
                |         |        |         |
             Discovery  Planning  Build   QA/Gates
```

- **Orchestrator** assesses your request and delegates to the right specialist
- **Requirements Analyst** clarifies scope and writes acceptance criteria
- **Planner** explores patterns and creates the implementation plan
- **Implementer** writes code following all conventions
- **Reviewer** checks correctness and convention compliance
- **Verifier** runs quality gates and confirms behavior

## Your First Feature: Step by Step

### Step 1: Tell Copilot What You Need

Open Copilot Chat in VS Code and describe your feature:

```txt
I need a user profile page where users can update their name and avatar
```

The Orchestrator routes this to the Requirements Analyst, who will:

- Ask clarifying questions if anything is vague
- Define acceptance criteria
- Identify scope and constraints

### Step 2: Plan the Work

In orchestration mode, planning is routed automatically.

The Planner will:

- Check existing patterns in the codebase
- Decide which module, components, services are needed
- List all files to create or modify
- Show the plan for your approval

**Review the plan carefully.** This is your cheapest moment to catch misunderstandings.

### Step 3: Approve and Build

After the plan is accepted, orchestration routes implementation automatically.

The Implementer writes code following all project conventions:

- Server-first components
- Proper folder structure and naming
- Effect for backend, Zod for validation
- Tests for changed code where required by the contract (entities are the main exception)
- `data-testid` on interactive elements

### Step 4: Quality Gates

In orchestration mode, quality gates should be invoked automatically before delivery.

This runs:

```txt
npm run check-types    →  TypeScript validation
npm run lint           →  ESLint + Stylelint + custom checks
npm run test           →  Vitest test suite
```

`npm run lint` is also the template's staged convention gate. On currently enforced surfaces it blocks root-level grab-bag files, inline parameter type literals, and local type declarations in implementation files. Broader rollout still happens slice by slice after debt cleanup.

If anything fails, ask Copilot to fix it:

```txt
Fix the failing type check errors
```

### Step 5: Review and Ship

When quality gates and verification are green, orchestration prepares the delivery handoff.

Copilot gives you a summary of everything that changed and why.

## Prompt Reference

These prompts are mirrored from Claude commands and available in VS Code Copilot Chat. In orchestration mode they run automatically — you can also invoke any prompt directly when you want to drive a specific phase. Add `@workspace` for broader file context. See [Commands Reference](../general/COMMANDS.md) for the complete list.

### Workflow Prompts

| Prompt | When to Use | What It Does |
|--------|-------------|--------------|
| `/discover` | Starting a new feature | Clarifies requirements, defines scope |
| `/plan-work` | After requirements are clear | Creates implementation plan |
| `/implement` | After plan is approved | Builds the feature |
| `/review` | After implementation | Reviews for correctness |
| `/gates` | Anytime | Runs type-check, lint, tests |
| `/deliver` | When everything passes | Prepares handoff summary |
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

## Instructions: Context-Aware Guidance

Copilot Chat can use these instruction files as contextual guidance based on what you're working on:

```txt
Editing...                  Copilot loads...
-----------------------------------------------------------
Any file                 → workflow-core.instructions.md
src/modules/             → nextjs-modules.instructions.md
src/shared/              → nextjs-shared.instructions.md
src/app/                 → nextjs-app-router.instructions.md
*.ts, *.tsx              → typescript.instructions.md
services/, repositories/ → effect-backend.instructions.md
*.test.ts, *.test.tsx    → tests.instructions.md
```

Plus the shared skill set (symlinked from `.claude/skills/`) provides deeper pattern knowledge for topics like Chakra UI, state machines, Drizzle, and i18n.

## The Self-Healing Principle

This project has a zero-tolerance policy. Code is not done if ANY of these exist:

```txt
  Type errors      →  Fix before delivery
  Lint warnings    →  Fix before delivery
  Test failures    →  Fix before delivery
  Missing tests    →  Add before delivery
  Incomplete work  →  Finish before delivery
```

### The Quality Loop

```txt
  +---> Implement
  |         |
  |         v
  |    Type check ----FAIL---+
  |         |                |
  |        PASS              |
  |         v                |
  |      Lint --------FAIL---+
  |         |                |
  |        PASS              |
  |         v                |
  |      Tests -------FAIL---+----> Fix and retry
  |         |
  |        PASS
  |         v
  |    All criteria met?
  |         |
  |    NO --+
  |
  YES
  |
  v
  Present to you (production-ready)
```

Orchestration mode should run this loop automatically.

**Tip:** If you ever suspect drift, run `npm run check-types && npm run lint && npm run test`.

## Tips for Working Effectively

### Use @workspace When You Need Broader Context

In VS Code Chat, `@workspace` is useful when you want Copilot to search or reason across the repository:

```txt
@workspace Create a new order module with CRUD operations
```

Without it, Copilot may rely more heavily on the current chat context and currently open files.

### Be Specific About What You Want

```txt
Bad:  "Make the user page better"
Good: "Add avatar upload to the user profile page with max 2MB file size,
       crop to 200x200, and persist to the user entity"
```

### Use Decompose for Big Features

If a feature feels large (more than ~10 files):

```txt
@workspace /decompose-requirements Build a complete order management system
with cart, checkout, payment, and order tracking
```

This produces phased task files with Gherkin scenarios and E2E test specs.

### Use The DB Scaffold As-Is

For database work, start from the committed template scaffold instead of inventing a new layout.
See `docs/db/database-workflow.md` for:

- local sqlite defaults
- migration and seed commands
- test DB preparation flow
- how to replace the starter `app-setting` entity

### Reference Files Explicitly

Copilot works best when you point it to relevant code:

```txt
@workspace Look at src/modules/static-pages/ for examples and create
a similar module for user profiles
```

### Let Copilot Handle Convention Details

You don't need to memorize:

- Folder naming (`form-create-user/`, `container-checkout/`)
- File structure (`index.ts`, `types.ts`, `helpers.ts`)
- Import rules (`@/` alias, no `../`)
- Backend patterns (Effect services, Drizzle repositories)

Use the repo instructions and prompts as your default guardrails. Focus on **what** you want, not on re-specifying the repo structure every time.

### Review the Plan, Not Just the Code

The plan is where you catch:

- Wrong architectural decisions
- Missing requirements
- Over-engineering
- Scope creep

Once implementation starts, changes are more expensive.

## MCP Servers (Enhanced Capabilities)

VS Code has these MCP tools pre-configured in `.vscode/mcp.json`:

| Tool | What It Does |
|------|--------------|
| **Playwright** | Browser automation for E2E verification |
| **Ark UI** | Component documentation lookup |
| **Chakra UI** | Design system documentation |
| **Next.js DevTools** | Framework-specific tooling |

## VS Code Setup Tips

### Recommended Settings

The project includes `.vscode/settings.json` with optimal Copilot settings. Make sure you have:

- Copilot Chat extension installed
- Language set to TypeScript/React
- Format on save enabled

### Keyboard Shortcuts

Shortcuts vary by platform and keymap. Check your local VS Code bindings if these differ.

| Shortcut | Action |
|----------|--------|
| `Ctrl+Shift+I` | Open Copilot Chat |
| `Ctrl+I` | Inline Copilot Chat |
| `Ctrl+Enter` | Accept suggestion |
| `Tab` | Accept inline completion |

## What "Done" Means on This Project

A feature is done when ALL of these are true:

- [ ] Behavior works end-to-end
- [ ] Acceptance criteria are met
- [ ] Type check passes (0 errors)
- [ ] Lint passes (0 warnings, 0 errors)
- [ ] All tests pass
- [ ] New code has tests where the contract requires them
- [ ] Components have `data-testid` attributes
- [ ] i18n messages exist for en and th
- [ ] No `any` types, no `eslint-disable`

Always verify by running:

```bash
npm run check-types && npm run lint && npm run test
```

## Quick Reference Card

```txt
Open chat:           Open Copilot Chat in VS Code
New feature:         Describe feature in plain English (orchestration routes phases)
Flow execution:      Discovery → Planning → Implementation → Gates → Delivery (automatic)
Big feature:         @workspace /decompose-requirements [description]
Agent mode:          Switch Copilot to orchestration agent mode
```

## Need Help?

- **Project conventions**: Ask Copilot "@workspace what are the conventions for [topic]?"
- **Existing patterns**: Ask "@workspace show me how [pattern] is used in this codebase"
- **Workflow issues**: Use `@workspace /recover` to diagnose and fix
- **Copilot docs**: [docs.github.com/copilot](https://docs.github.com/en/copilot)
