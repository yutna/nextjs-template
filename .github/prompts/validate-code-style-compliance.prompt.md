---
name: validate-code-style-compliance
description: Review changes against the permanent code-style law and the scoped code-style overlays.
agent: "Reviewer"
argument-hint: "[changed files or diff scope]"
---
Review the current changes for code-style, convention, and placement compliance.

Follow:

- [AGENTS.md](../../AGENTS.md)
- [permanent code-style law](../../docs/developers/CODE_STYLE_GUIDES.md)
- [code-style-reference skill](../skills/code-style-reference/SKILL.md)

Required output:

1. Files or surfaces reviewed
2. Canonical rules checked
3. Findings in `file / rule / issue / fix` form
4. Clear statement when no meaningful issues are found
5. Whether the work can stay in Verification or must return to Implementation

Rules:

- report only meaningful convention, correctness, boundary, or placement issues
- cite the permanent law or a scoped overlay when raising a finding
- do not nitpick formatting trivia that the existing toolchain already owns
- do not weaken the permanent code-style law with ad hoc exceptions
