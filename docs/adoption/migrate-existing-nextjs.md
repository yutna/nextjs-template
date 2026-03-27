# Migrate An Existing Next.js Repository

Use this path when the target repository already runs Next.js but does not yet follow the workflow or the enterprise profile conventions.

## Goal

Preserve working behavior while moving the repository toward:

- App Router governance
- locale-prefixed routing
- feature-first structure
- server-first boundaries
- deterministic workflow state and gates
- contract-driven conventions instead of example-driven structure copying

## Sequence

1. Run the adoption report.

```bash
node .github/hooks/scripts/workflow_adopt_report.cjs
```

2. Write the detected workflow profile if the copied profile is still stale.

```bash
node .github/hooks/scripts/workflow_adopt_report.cjs --write-profile --force
```

3. Reset workflow state for migration discovery.

```bash
node .github/hooks/scripts/workflow_bootstrap.cjs --force --sync-generated-ignores taskId=migrate-existing-nextjs taskSummary="Discover migration work needed to align this Next.js repository with the workflow profile."
```

4. Run doctor and structural audit.

```bash
node .github/hooks/scripts/workflow_doctor.cjs
node .github/hooks/scripts/workflow_audit_structure.cjs
```

5. Use Discovery and Planning to create a migration tracker. The tracker should list:

- route roots
- locale roots
- legacy feature roots such as `src/modules`
- client shells that should become `*.client.tsx`
- missing or incorrect quality gate commands
- CI steps that still reflect the previous workflow
- strong-default deviations the migration intentionally keeps

## Common fixes the workflow now expects

- reset stale `.github/workflow-state.json`
- replace template `.github/workflow-profile.json` with a repo-specific profile
- move from `modules/containers/screens` to feature-first folders
- make locale-prefixed routes explicit under `[locale]`
- align builds with deterministic env commands
- add `.gitignore` coverage for generated workflow logs and app build artifacts

## Exit criteria

The migration wave can move to Delivery only when:

- `workflow_doctor.cjs` passes
- `workflow_audit_structure.cjs` passes or remaining findings are intentionally scoped out
- repository quality gates pass
- runtime behavior still matches the existing user-facing contract
