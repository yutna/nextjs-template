---
name: autonomous-workflow
description: >
  Autonomous multi-agent execution protocol for building complete features with
  zero human interaction after plan approval. Use when entering autopilot mode,
  building a feature end-to-end, or orchestrating sub-agents for research,
  implementation, quality gates, and code review. Defines the 2-touchpoint model,
  role-to-tool mapping, self-healing loops, retry budgets, parallel execution
  patterns, and the Definition of Done.
---

# Autonomous Workflow Protocol

This skill defines how the Copilot CLI orchestrator executes a complete feature
autonomously after the user approves the plan. Follow this protocol exactly when
operating in autopilot mode.

## The 2-Touchpoint Model

The entire process has only two moments where a human is involved.

- **Touchpoint 1 (Start):** User describes what they want. AI asks clarifying
  questions until requirements are unambiguous. AI creates a plan. User approves.
- **Touchpoint 2 (End):** AI presents the completed feature. User verifies and
  accepts, requests tweaks, or rejects.

Everything between Touchpoint 1 and 2 is fully autonomous. The orchestrator
makes all decisions, delegates to sub-agents, self-heals on failures, and
delivers a production-ready feature.

## Role-to-Tool Mapping

Each software engineering role maps to a concrete Copilot CLI tool.

| Role | Tool | What it does |
|------|------|-------------|
| PM / Tech Lead | Main orchestrator | Decisions, planning, delegation, state management |
| SA / Researcher | `explore` agent | Read-only codebase analysis, pattern discovery |
| Senior Developer | `general-purpose` agent | Implementation, file creation, code changes |
| Code Reviewer | `code-review` agent | Architecture validation, bug detection |
| QA Engineer | `qa` agent + `agent-browser` | E2E browser verification, visual/responsive/locale checks |
| DevOps / CI | `task` agent + `bash` | Build, test, lint, type-check |
| State Tracker | SQL database | Todo progress, dependencies, retry counts |

### Communication rule

Sub-agents are stateless. They do not talk to each other. All communication
flows through the orchestrator. The orchestrator reads output from one role,
decides what to do, and passes relevant context to the next role.

## Execution Protocol

Follow these steps in order after plan approval.

### Step 1 — Initialize state

Create SQL todos with dependencies from the approved plan.

```sql
INSERT INTO todos (id, title, description, status) VALUES
  ('todo-id', 'Title', 'Full description with enough context to execute', 'pending');

INSERT INTO todo_deps (todo_id, depends_on) VALUES
  ('dependent-todo', 'prerequisite-todo');
```

Use descriptive kebab-case IDs. Include enough detail in the description that a
sub-agent can execute the todo without referring back to the plan.

### Step 2 — Query ready todos

Find todos with no unfinished dependencies.

```sql
SELECT t.* FROM todos t
WHERE t.status = 'pending'
AND NOT EXISTS (
  SELECT 1 FROM todo_deps td
  JOIN todos dep ON td.depends_on = dep.id
  WHERE td.todo_id = t.id AND dep.status != 'done'
);
```

If no todos are ready and none are in progress, all work is complete. Proceed to
Step 7 (runtime verification).

### Step 3 — Research (when needed)

For each ready todo, decide if research is needed. Research is needed when:

- The todo involves a pattern the orchestrator has not seen in this session
- The todo requires knowledge of existing module structure
- The todo interacts with shared code that must be reused

Spawn one or more `explore` agents in parallel.

```
task(agent_type="explore", prompt="
  Research [specific question].
  Search src/modules/ for [pattern].
  Check src/shared/ for [reusable code].
  Return: findings summary with file paths and patterns to follow.
")
```

Multiple `explore` agents are parallel-safe. Launch them simultaneously when
researching independent topics.

### Step 4 — Implement

Set the todo status to `in_progress`. Spawn a `general-purpose` agent with full
context.

```
task(agent_type="general-purpose", prompt="
  Implement [todo description].

  CONTEXT FROM RESEARCH:
  [paste research findings]

  RULES:
  - Follow AGENTS.md conventions
  - Server-first: no 'use client' unless hooks or browser APIs require it
  - Named exports only (except Next.js framework files)
  - kebab-case files, PascalCase components
  - 5-group import sorting
  - Sorted object keys, JSX props, destructuring
  - Effect in lib/ and utils/, Zod for validation
  - Colocate tests adjacent to implementation

  FILES TO CREATE/MODIFY:
  [specific file paths and what each should contain]
")
```

For independent todos, implementation agents can run as background agents to
enable parallelism. However, agents that edit the same files must run
sequentially to avoid conflicts.

### Step 5 — Quality gates

After implementation, run all three gates sequentially.

```bash
npm run check-types && npm run lint && npm run test
```

Use a `task` agent or run directly via `bash`. All three must pass.

**If any gate fails**, enter the self-healing loop (Step 6).

**If all gates pass**, proceed to code review.

#### Code review

Spawn a `code-review` agent to review changes.

```
task(agent_type="code-review", prompt="
  Review all changes made in this session.
  Check against:
  - Server-first compliance
  - Folder ownership boundaries (modules vs shared)
  - No cross-module imports
  - Named exports (no default exports except framework files)
  - Import patterns (5-group sorting, no ../ imports)
  - Architecture layers (page → screen → container → component)
  - Security (no command injection, no secret exposure, input validation)
  - Error handling (no swallowed errors, typed errors)

  Report only genuine violations. Do not comment on style preferences.
")
```

**If review finds issues**, fix them and rerun all quality gates.

**If review is clean**, mark the todo as done and loop to Step 2.

### Step 6 — Self-healing loop

When a quality gate or code review fails, the orchestrator fixes it without
human intervention.

1. Read the error output carefully
2. Analyze the root cause
3. For simple fixes (import order, missing type): fix directly
4. For complex fixes (logic error, architecture issue): spawn a
   `general-purpose` agent with the error context
5. Rerun ALL quality gates from scratch (no skipping)
6. If review found issues, re-review after fixing

#### Retry budget

Track retry attempts per todo to prevent infinite loops.

```sql
-- Check retry count
SELECT value FROM session_state WHERE key = 'retry_count_' || todo_id;

-- Increment retry count
INSERT OR REPLACE INTO session_state (key, value)
VALUES ('retry_count_' || todo_id, CAST(current_count + 1 AS TEXT));
```

| Retries | Action |
|---------|--------|
| 1-2 | Fix and retry |
| 3+ | Mark todo as `blocked`, record error details, continue with other todos |

Blocked todos are reported to the user at Touchpoint 2.

### Step 7 — Runtime verification

After all todos are done (or remaining are blocked), verify the feature works
in a real browser before presenting to the user. Load the `qa-verification`
skill for the full protocol.

**This step is mandatory for any change that affects rendered output.** It is
the most common source of bugs that reach the user — do not skip it for UI
features.

#### Option A — Spawn a QA agent (recommended)

Spawn the `qa` agent with the feature context:

```
task(agent_type="qa", prompt="
  Verify the following feature in a real browser.

  FEATURE DESCRIPTION:
  [what was built]

  AFFECTED ROUTES:
  [list of URL paths to verify]

  REQUIREMENTS / ACCEPTANCE CRITERIA:
  [what the feature should look like and how it should behave]

  DEV SERVER:
  Running on http://localhost:3000 (or specify port)

  Follow the qa-verification skill protocol exactly.
  Report results in the QA Verification Report format.
")
```

The QA agent is read-only — it verifies and reports but does not modify code.

#### Option B — Verify directly

If a QA agent is not available, execute the verification sequence from the
`qa-verification` skill directly using `agent-browser`:

1. **Start dev server** if not already running (`npm run dev`)
2. **For each affected route**, execute in order:
   a. Open and wait for network idle
   b. Check for console errors and failed requests
   c. Take an annotated screenshot (visual layout check)
   d. Take a snapshot (content/accessibility check)
   e. Test responsive viewports:
      - Desktop: 1280×800 (default)
      - Tablet: 768×1024
      - Mobile: 375×667
   f. Test color schemes: dark mode and light mode
   g. Test locales: English (`/en/...`) and Thai (`/th/...`)
   h. Test interactions if applicable (forms, links, modals)
3. **If issues are found**, treat as a self-healing case:
   - Analyze the issue from screenshots and snapshots
   - Spawn a `general-purpose` agent with the error context and evidence
   - Rerun ALL quality gates after fixing
   - Re-verify the affected route
   - Apply the retry budget (max 3 attempts per issue)
4. **If all checks pass**, proceed to delivery

#### When to skip

Skip runtime verification only when:

- The change is purely backend (schemas, lib, actions with no UI)
- The change is configuration or tooling only (no rendered output)
- The change is test-only or type-definition-only

### Step 8 — Deliver

When all todos are done (or remaining todos are blocked), present the result to
the user.

The presentation must include:

1. Summary of what was built (files created, modules added)
2. Production-ready status (all quality gate results)
3. Any blocked items with error details (if applicable)
4. How to test or use the new feature

## Definition of Done

A feature is complete only when ALL of these are true. If any criterion is not
met, keep working. Never present incomplete work to the user.

| # | Criterion |
|---|-----------|
| 1 | Feature works end-to-end exactly as described in requirements |
| 2 | Zero bugs — every code path tested and verified |
| 3 | Zero type errors on all touched files (`npm run check-types`) |
| 4 | Zero lint errors on all touched files (`npm run lint`) |
| 5 | Zero warnings on all touched files |
| 6 | All existing tests still pass — no regressions |
| 7 | New tests cover the new feature |
| 8 | Code review passed — no security issues, no convention violations |
| 9 | Ready for production use — not a prototype, not a draft |
| 10 | Human has nothing to fix, debug, or clean up |

## Parallel Execution Rules

| Parallel-safe | Must be sequential |
|---------------|-------------------|
| Multiple `explore` agents | `general-purpose` agents editing the same files |
| Multiple `code-review` agents | Implementation → quality gates |
| Independent component implementations | Schema → action (action depends on schema) |
| i18n message creation | Container → screen (screen depends on container) |
| Type-check and lint (different tools) | Code review → fix → re-review |

When multiple ready todos are independent, launch them in parallel using
background agents. Track completion via SQL state and `read_agent` notifications.

## Requirements Gathering Protocol

Use this protocol at Touchpoint 1 to extract clear requirements from a vague
user idea.

### Question categories

Ask questions in this order until all are answered:

1. **Core intent** — What is the user actually trying to accomplish?
2. **Scope boundaries** — What is explicitly included? What is out of scope?
3. **User-facing behavior** — What does the user see and interact with?
4. **Data and state** — What data is involved? Where does it come from?
5. **Auth and access** — Is this public or private? Who can access it?
6. **Edge cases** — What happens on error, empty state, loading?
7. **Integration** — Does this connect to existing features or external services?

### Rules for questions

- Ask one question at a time using `ask_user` tool
- Provide choices when possible for faster answers
- Do not ask questions the codebase already answers (check AGENTS.md and
  existing patterns first)
- Stop asking when requirements are unambiguous enough to write user stories
- Never proceed to planning with ambiguous scope

### Output

After questions are complete, produce:

1. **Requirements summary** — One paragraph describing the feature
2. **User stories** — As a [user], I want [X] so that [Y]
3. **Acceptance criteria** — Given/When/Then for each story
4. **Technical decisions** — Module placement, server vs client, key patterns

## Quick Reference

```
EXECUTION ORDER
═══════════════
1. Initialize SQL todos + deps
2. Query ready todos (no unfinished deps)
3. Research (explore agents, parallel-safe)
4. Implement (general-purpose agent, with context)
5. Quality gates (check-types → lint → test)
6. Self-heal on failure (max 3 attempts per todo)
7. Code review (code-review agent)
8. Fix review issues → rerun gates
9. Mark done → loop to step 2
10. All done → QA verification (qa agent + agent-browser)
    - Visual layout, responsive, dark/light mode, locales, interactions
11. Self-heal QA issues → rerun gates → re-verify
12. Present to user

DEFINITION OF DONE
══════════════════
✅ Feature works end-to-end
✅ Zero bugs, zero type errors, zero lint errors, zero warnings
✅ All existing tests pass (no regressions)
✅ New tests cover the new feature
✅ Code review passed
✅ QA verified in real browser (visual, responsive, themes, locales)
✅ Production-ready — human has nothing to fix
```
