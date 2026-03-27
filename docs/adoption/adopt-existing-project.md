# Adopt Into An Existing Project

Use this path when the repository already has production code and you want to install the workflow without rewriting everything at once.

## Goal

Adopt the workflow first, inventory the codebase second, and migrate structure or conventions in controlled waves.

## Recommended sequence

1. Copy the workflow into the repository root.
2. Run the adoption report to detect the current stack, quality gates, and likely roots.

```bash
node .github/hooks/scripts/workflow_adopt_report.cjs
```

3. If the copied profile still describes the source template instead of the target repository, rewrite it from detected repository facts.

```bash
node .github/hooks/scripts/workflow_adopt_report.cjs --write-profile --force
```

4. Reset the workflow state so the adopted repository does not keep stale task context from the source template.

```bash
node .github/hooks/scripts/workflow_bootstrap.cjs --force --sync-generated-ignores taskId=bootstrap-existing-project taskSummary="Inventory the existing repository and plan workflow adoption."
```

5. Run doctor to catch missing config, stale state, or structural drift before implementation work starts.

```bash
node .github/hooks/scripts/workflow_doctor.cjs
```

6. Use Discovery to inventory:

- current routing model
- i18n/localization status
- quality gate commands
- client/server boundaries
- folder naming drift
- high-risk runtime areas

7. Use Planning to split the migration into explicit waves.

## Suggested migration waves

1. workflow and tooling installation
2. CI and quality gate alignment
3. structural audit and naming cleanup
4. routing and i18n normalization
5. feature-by-feature architecture migration

## Rules

- Do not perform a big-bang rewrite unless the user explicitly approves it.
- Keep behavior stable outside the approved migration slice.
- Run `workflow_audit_structure.cjs` before and after each major migration wave.

```bash
node .github/hooks/scripts/workflow_audit_structure.cjs
```
