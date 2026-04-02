---
name: decompose-requirements
description: Decompose large requirements into phased task files that fit AI context windows.
---
Decompose requirements into phased task files using Gherkin scenarios and state machines.

**Output location:** `docs/tasks/`

**Approach:** Gherkin-first + State Machine validation

---

## Step 1: Pattern Matching (Quick Check)

Before writing scenarios, scan for vague terms:

| Pattern | Problem | Fix |
|---------|---------|-----|
| fast, quick, slow | Unmeasurable | Define in ms |
| secure, safe | Undefined | Specify standard |
| easy, simple | Subjective | Define criteria |
| some, many, few | Vague quantity | Exact number |
| etc, and more | Incomplete | List all |
| handle, process, manage | Vague verb | Specific action |

**If vague terms found:** Ask user to clarify before proceeding.

---

## Step 2: State Machine (REQUIRED)

For each feature, draw the state machine FIRST.

### Template

```
Feature: [Name]

States:
  - Initial: [starting state]
  - Normal: [state1], [state2], ...
  - Error: [error1], [error2], ...
  - Final: [end state(s)]

Transitions:
  [from] --[trigger]--> [to] : [action/side-effect]
```

### Completeness Check

- Every state reachable from initial?
- Every non-final state has exit?
- Error state exists for each operation?
- All transitions have triggers?

---

## Step 3: Gherkin Scenarios (REQUIRED)

Write scenarios for EVERY state and transition in the state machine.

### Format

```gherkin
Feature: [Feature Name]
  As a [actor]
  I want [goal]
  So that [benefit]

  @must
  Scenario: [Happy path - most common success]
    Given [precondition]
    When [action]
    Then [result]

  @must
  Scenario: [Error case - most common failure]
    Given [precondition]
    When [action]
    Then [error result]

  @should
  Scenario: [Important but not critical]
    ...

  @could
  Scenario: [Nice to have]
    ...
```

### Priority Tags

| Tag | Meaning | Delivery |
|-----|---------|----------|
| `@must` | Cannot launch without | This release |
| `@should` | Important, expected | This release if possible |
| `@could` | Nice to have | If time permits |
| `@wont` | Explicitly excluded | Document why |

---

## Step 4: Decomposition

Only after Steps 1-3 complete.

### Task Generation Rules

1. **One scenario = One or more tasks** (depending on complexity)
2. **@must scenarios first** (early phases)
3. **@should scenarios next** (middle phases)
4. **@could scenarios last** (final phases)
5. **Vertical slices** (end-to-end, not horizontal layers)

---

## Output Structure

```
docs/tasks/
├── 00-specifications.md       # State machines + Gherkin scenarios
├── 01-overview.md             # Summary, phases, priorities
├── e2e-scenarios.md           # E2E test specifications (from Gherkin)
│
├── phase-01-foundation.md     # Entities, base setup
├── phase-02-[feature].md      # @must scenarios
├── phase-03-[feature].md      # @should scenarios
└── ...
```

---

## Quick Reference

```
1. Pattern match -> catch vague terms
2. State machine -> draw ALL states and transitions
3. Gherkin -> write scenario for EACH transition
4. E2E mapping -> map scenarios to E2E test specs
5. Decompose -> tasks grouped by priority (@must first)
```

**Minimum to proceed:**
- No vague terms (or clarified)
- State machine complete (all states, all transitions)
- Every transition has at least one scenario
- Every scenario has priority tag
