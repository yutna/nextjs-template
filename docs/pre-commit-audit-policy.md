# Pre-Commit Audit Policy

This repository treats the final audit before commit as a production-readiness
gate, not a casual review pass.

## Goal

The expected outcome of the final audit is:

- no unresolved correctness findings
- no known convention or workflow drift
- applicable validators and proof suites passing
- delivery confidence high enough to describe the working tree as ready for
  production use

## Authority order

Use these audit authorities in order:

1. `GitHub Copilot CLI` with `Claude Sonnet 4.6`
2. `Codex` with `gpt-5.4` when Copilot is unavailable or blocked by rate limits
3. lighter or `0x` models only for preliminary scans, never for final sign-off

## Why this order exists

- the workflow is designed first for GitHub Copilot surfaces, so the strongest
  Copilot review remains the preferred final authority
- `Codex` is a strong fallback for repo-aware review, validators, and fix loops,
  but it does not prove GitHub Copilot host behavior one-to-one
- low-cost models can miss subtle enforcement, architecture, or consistency
  problems and should not be the last gate before commit

## Final audit policy

### Preferred final authority

Pin GitHub Copilot CLI to `Claude Sonnet 4.6` for the final audit when possible.

Example:

```bash
copilot --agent Reviewer \
  --model claude-sonnet-4.6 \
  --allow-all-tools \
  -p "Audit the current working tree using the repository-local AGENTS.md, workflow state, and Next.js enterprise profile. Findings first. Focus on correctness, regression risk, policy drift, i18n, routing, testability, security, and production readiness. Do not stop at summaries; call out anything that is not ready for production use."
```

### Fallback authority

If Copilot is blocked by rate limits or unavailable, use `Codex` with
`gpt-5.4`.

Examples:

```bash
codex review --uncommitted
```

```bash
codex exec -m gpt-5.4 -s read-only \
  "Audit the current working tree using the repository-local AGENTS.md, workflow state, and Next.js enterprise profile. Findings first. Focus on correctness, regression risk, policy drift, i18n, routing, testability, security, and production readiness. Do not modify files."
```

## Model policy

### Allowed for final sign-off

- `Claude Sonnet 4.6` in GitHub Copilot CLI
- `gpt-5.4` in Codex

### Allowed only for preliminary scans

- `GPT-5 mini`
- `GPT-4.1`
- `GPT-4o`
- `Raptor mini`
- any other `0x` or lightweight/free-tier model

These models may be useful for quick triage, but they are not the final
authority for "ready to commit" in this workflow.

## Status language

Use these labels consistently when reporting audit results:

- `READY FOR PRODUCTION USE`
  Meaning: no actionable findings remain from the final authority audit, and
  repository proof or validation is green where applicable.
- `AUDIT CLEAN, COPILOT PROOF PENDING`
  Meaning: Codex fallback audit is clean, but GitHub Copilot host-specific proof
  should still be rerun later if the task depends on Copilot-specific behavior.
- `NOT READY`
  Meaning: any unresolved finding, weak validation, or unverified high-risk path
  remains.

## Repository-local validation

Before final sign-off, run the repository's workflow integrity checks:

```bash
node .github/hooks/scripts/workflow_hook.cjs validate-state
node .github/hooks/scripts/validate_repo.cjs
node .github/hooks/scripts/workflow_hook_proof.cjs
```

If any of these fail, the working tree is not ready for commit regardless of
model output.
