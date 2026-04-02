# Vibe Coding with GitHub Copilot

Welcome to the team! This guide will teach you how to use GitHub Copilot (in VS Code or CLI) effectively on this project to deliver production-ready features fast.

## What You Need Before Starting

1. **GitHub Copilot** subscription (Individual or Business)
2. **VS Code** with Copilot Chat extension, or **Copilot CLI** (`gh copilot`)
3. **Node.js 24.14+** (managed by [mise](https://mise.jdx.dev))
4. Run `npm install` in the project root
5. Open the project in VS Code

Copilot automatically reads `AGENTS.md`, `.github/instructions/`, and `.github/agents/` when you start a chat. All prompts, skills, and agents are pre-configured.

## How the Workflow Works

Every feature follows 6 phases. Copilot's agents specialize in each phase.

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

Open Copilot Chat (Ctrl+Shift+I) and describe your feature:

```txt
I need a user profile page where users can update their name and avatar
```

The Orchestrator routes this to the Requirements Analyst, who will:

- Ask clarifying questions if anything is vague
- Define acceptance criteria
- Identify scope and constraints

### Step 2: Plan the Work

Use the planning prompt:

```txt
@workspace /plan-work
```

The Planner will:

- Check existing patterns in the codebase
- Decide which module, components, services are needed
- List all files to create or modify
- Show the plan for your approval

**Review the plan carefully.** This is your cheapest moment to catch misunderstandings.

### Step 3: Approve and Build

```txt
Looks good, implement the plan
```

Or use the prompt directly:

```txt
@workspace /implement
```

The Implementer writes code following all project conventions:

- Server-first components
- Proper folder structure and naming
- Effect for backend, Zod for validation
- Tests for every file
- `data-testid` on interactive elements

### Step 4: Run Quality Gates

```txt
@workspace /gates
```

This runs:

```txt
npm run check-types    →  TypeScript validation
npm run lint           →  ESLint + Stylelint + custom checks
npm run test           →  Vitest test suite
```

If anything fails, ask Copilot to fix it:

```txt
Fix the failing type check errors
```

### Step 5: Review and Ship

```txt
@workspace /deliver
```

Copilot gives you a summary of everything that changed and why.

## Prompt Reference

These are your primary tools. Use them in Copilot Chat with `@workspace` prefix.

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

Copilot loads these instruction files automatically based on what you're working on:

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

Plus 35 skills (symlinked from `.claude/skills/`) that provide deep pattern knowledge for specific topics like Chakra UI, state machines, Drizzle, i18n, and more.

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

When using Copilot, you may need to drive this loop manually:

1. Ask Copilot to implement
2. Run `/gates`
3. If failures, paste the error and ask Copilot to fix
4. Repeat until all green

**Tip:** After Copilot makes changes, always run `npm run check-types && npm run lint && npm run test` before considering the work done.

## Tips for Working Effectively

### Use @workspace for Full Context

Always prefix with `@workspace` so Copilot sees the entire project:

```txt
@workspace Create a new order module with CRUD operations
```

Without `@workspace`, Copilot only sees the current file.

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

Copilot reads the instructions and skills automatically. Focus on **what** you want, not **how** it should be structured.

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

| Shortcut | Action |
|----------|--------|
| `Ctrl+Shift+I` | Open Copilot Chat |
| `Ctrl+I` | Inline Copilot Chat |
| `Ctrl+Enter` | Accept suggestion |
| `Tab` | Accept inline completion |

### Using the Terminal

You can also run Copilot prompts from the integrated terminal:

```bash
gh copilot suggest "create a user repository with Effect and Drizzle"
```

## What "Done" Means on This Project

A feature is done when ALL of these are true:

- [ ] Behavior works end-to-end
- [ ] Acceptance criteria are met
- [ ] Type check passes (0 errors)
- [ ] Lint passes (0 warnings, 0 errors)
- [ ] All tests pass
- [ ] New code has tests
- [ ] Components have `data-testid` attributes
- [ ] i18n messages exist for en and th
- [ ] No `any` types, no `eslint-disable`

Always verify by running:

```bash
npm run check-types && npm run lint && npm run test
```

## Quick Reference Card

```txt
Open chat:           Ctrl+Shift+I
New feature:         @workspace [describe in plain English]
Plan:                @workspace /plan-work
Build:               @workspace /implement
Check quality:       @workspace /gates
Ship it:             @workspace /deliver
Something broke:     @workspace /recover
Big feature:         @workspace /decompose-requirements [description]
E2E tests:           @workspace /implement-e2e
New module:          @workspace /create-module [name]
```

## Need Help?

- **Project conventions**: Ask Copilot "@workspace what are the conventions for [topic]?"
- **Existing patterns**: Ask "@workspace show me how [pattern] is used in this codebase"
- **Workflow issues**: Use `@workspace /recover` to diagnose and fix
- **Copilot docs**: [docs.github.com/copilot](https://docs.github.com/en/copilot)
