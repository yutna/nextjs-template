# Vibe Coding with Claude Code

Welcome to the team! This guide will teach you how to use Claude Code effectively on this project to deliver production-ready features fast.

## What You Need Before Starting

1. **Claude Code CLI** installed ([docs](https://docs.anthropic.com/en/docs/claude-code))
2. **Node.js 24.14+** (managed by [mise](https://mise.jdx.dev))
3. Run `npm install` in the project root
4. Run `claude` in your terminal to start a session

That's it. Claude Code reads `CLAUDE.md` and `AGENTS.md` automatically when you start a session. The workflow contract, commands, skills, and hooks are already configured in the repo.

## How the Workflow Works

Every non-trivial feature follows 6 phases. Claude tracks where you are through the repo workflow state and hooks.

```txt
  You describe           Claude clarifies       Claude plans          Claude builds
  what you want          requirements           the approach          the feature
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

**The key insight:** You don't need to manage these phases manually. Claude's hooks enforce them automatically. If you try to skip ahead, the workflow guard will redirect you.

## Your First Feature: Step by Step

### Step 1: Tell Claude What You Need

Just describe what you want in plain language:

```txt
> I need a user profile page where users can update their name and avatar
```

Claude enters **Discovery** phase automatically. It will:

- Ask clarifying questions if anything is vague
- Define acceptance criteria
- Identify scope and constraints

### Step 2: Let Claude Plan

Once requirements are clear, Claude moves to **Planning** automatically.

Claude will:

- Check existing patterns in the codebase
- Decide which module, components, services are needed
- List all files it will create or modify
- Show you the plan for approval

**Review the plan carefully.** This is your cheapest moment to catch misunderstandings.

### Step 3: Approve and Let It Build

```txt
> Looks good, let's implement
```

Claude writes the code following all project conventions automatically:

- Server-first components
- Proper folder structure and naming
- Effect for backend, Zod for validation
- Tests for changed code where required by the contract (entities are the main exception)
- `data-testid` on interactive elements

### Step 4: Quality Gates Run Automatically

Claude runs these before showing you results:

```bash
npm run check-types    →  TypeScript validation
npm run lint           →  ESLint + Stylelint + custom checks
npm run test           →  Vitest test suite
```

**If anything fails, Claude fixes it automatically.** This is the Self-Healing Contract. You should never see broken code.

### Step 5: Review and Ship

When quality gates and verification are green, Claude prepares a delivery handoff automatically.

Claude gives you a summary of everything that changed and why.

## Slash Commands Reference

These commands are available for any phase you want to drive directly. The default workflow is orchestration-first and automatic. See [Commands Reference](../general/COMMANDS.md) for the complete list.

### Workflow Commands

| Command | When to Use | What It Does |
|---------|-------------|--------------|
| `/discover` | Starting a new feature | Clarifies requirements, defines scope |
| `/plan-work` | After requirements are clear | Creates implementation plan |
| `/implement` | After plan is approved | Builds the feature |
| `/review` | After implementation | Self-reviews for correctness |
| `/gates` | Anytime | Runs type-check, lint, tests |
| `/deliver` | When everything passes | Prepares handoff summary |
| `/recover` | When something breaks | Diagnoses and fixes failures |

### Scaffolding Commands

| Command | What It Creates |
|---------|----------------|
| `/create-module` | Full feature module (components, screens, actions, etc.) |
| `/add-server-action` | Server action with Zod validation |
| `/add-translation` | i18n messages for en/th |
| `/implement-e2e` | Playwright E2E tests from scenario specs |
| `/audit-structure` | Checks module structure against conventions |

### Requirements Command

| Command | What It Does |
|---------|--------------|
| `/decompose-requirements` | Breaks large features into phased tasks with Gherkin scenarios, state machines, and E2E test specs |

## Skills: Deep Knowledge On-Demand

Skills are automatically loaded when Claude detects you're working in a specific area. You don't need to invoke them manually.

```txt
Working with...        Claude automatically loads...
-----------------------------------------------------------
Chakra UI components → nextjs-chakra-ui skill
Server actions       → nextjs-server-actions skill
Database queries     → drizzle-patterns skill
State machines       → nextjs-state-machines skill
Form handling        → form-objects skill
Testing              → nextjs-testing skill
i18n                 → nextjs-i18n skill
Background jobs      → trigger-dev-patterns skill
```

35 skills total covering every pattern in the project.

## The Self-Healing Loop

This is the most important concept to understand. Claude will never show you code that:

- Has type errors
- Has lint warnings
- Fails tests
- Is incomplete vs. the plan

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
  |         |                       (up to 3 times)
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

**If Claude can't fix something after 3 attempts**, it will tell you what's wrong and why. This is rare.

## Tips for Working Effectively

### Be Specific About What You Want

```txt
Bad:  "Make the user page better"
Good: "Add avatar upload to the user profile page with max 2MB file size,
       crop to 200x200, and persist to the user entity"
```

### Trust the Workflow

Don't try to shortcut the phases. The workflow exists to catch problems early. A 2-minute planning phase can save hours of rework.

### Use Decompose for Big Features

If a feature feels large (more than ~10 files), use decomposition:

```txt
> /decompose-requirements Build a complete order management system
  with cart, checkout, payment, and order tracking
```

This produces phased task files with Gherkin scenarios and E2E test specs, making the feature manageable in smaller chunks.

### Use The DB Scaffold As-Is

For database work, start from the committed template scaffold instead of inventing a new layout.
See `docs/db/database-workflow.md` for:

- local sqlite defaults
- migration and seed commands
- test DB preparation flow
- how to replace the starter `app-setting` entity

### Let Claude Handle Convention Details

You don't need to memorize:

- Folder naming (`form-create-user/`, `container-checkout/`)
- File structure (`index.ts`, `types.ts`, `helpers.ts`)
- Import rules (`@/` alias, no `../`)
- Backend patterns (Effect services, Drizzle repositories)

Claude knows all of this. Focus on **what** you want, not **how** it should be structured.

### Review the Plan, Not Just the Code

The plan is where you catch:

- Wrong architectural decisions
- Missing requirements
- Over-engineering
- Scope creep

Once implementation starts, changes are more expensive.

## MCP Servers (Enhanced Capabilities)

Your Claude Code session has these MCP tools pre-configured:

| Tool | What It Does |
|------|--------------|
| **Playwright** | Browser automation for E2E verification |
| **Ark UI** | Component documentation lookup |
| **Chakra UI** | Design system documentation |
| **Next.js DevTools** | Framework-specific tooling |

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

Claude enforces all of this automatically. If you see a delivery summary, it means everything passed.

## Quick Reference Card

```txt
Start a session:     claude
New feature:         Just describe it in plain English
Flow execution:      Discovery → Planning → Implementation → Gates → Delivery (automatic)
Big feature:         /decompose-requirements [description]
```

## Need Help?

- **Project conventions**: Ask Claude "what are the conventions for [topic]?"
- **Existing patterns**: Ask Claude "show me how [pattern] is used in this codebase"
- **Workflow issues**: Run `/recover` to diagnose and fix
- **Claude Code docs**: [docs.anthropic.com/en/docs/claude-code](https://docs.anthropic.com/en/docs/claude-code)
