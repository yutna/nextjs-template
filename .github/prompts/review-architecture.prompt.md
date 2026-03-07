---
name: review-architecture
description: >-
  Review staged or recent changes against project
  architecture conventions
agent: ask
---

# Review architecture compliance

Review `git diff --staged` (or `git diff` if nothing staged) against the
conventions in AGENTS.md. Report only genuine violations — never flag
stylistic preferences.

## Output format

For each violation:

1. File path and line number
2. Rule violated (reference the AGENTS.md section)
3. Suggested fix

If no violations found, confirm compliance.
