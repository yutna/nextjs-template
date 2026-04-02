---
applyTo: "**"
---
# Core Workflow Instructions

Follow the [AI Workflow Contract](../../AGENTS.md) for all development tasks.

## Workflow Phases

1. **Discovery** - Clarify requirements before planning
2. **Planning** - Design approach before implementing
3. **Implementation** - Code within approved scope
4. **Quality Gates** - Type check → Lint → Tests
5. **Verification** - Confirm acceptance criteria
6. **Delivery** - Summarize and hand off

## Non-Negotiable Rules

- No implementation before clarified requirements
- No non-trivial code changes before a plan exists
- No delivery before gates and verification pass
- No silent architecture or convention changes

## State Management

Track progress in `.claude/workflow-state.json`:
- Check state before taking action
- Update state after completing phases
- Never skip phases

## Convention Tiers

- **Hard conventions**: Must follow (blocking if violated)
- **Strong defaults**: Follow unless justified deviation
- **Local freedom**: Implementation details that can vary
