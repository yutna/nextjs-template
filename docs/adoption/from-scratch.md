# From Scratch Adoption

Use this path when you are starting a brand-new repository and want the workflow to govern the project from day one.

## Goal

Install the workflow first, then let Discovery and Planning shape the application instead of scaffolding an app and retrofitting process later.

## Recommended sequence

1. Copy the workflow files into the empty repository.
2. Run the adoption report to inspect the current repository shape.

```bash
node .github/hooks/scripts/workflow_adopt_report.cjs
```

3. If the repository does not have a concrete workflow profile yet, write one from detected defaults.

```bash
node .github/hooks/scripts/workflow_adopt_report.cjs --write-profile
```

4. Reset workflow state for the new repository and seed the first Discovery task.

```bash
node .github/hooks/scripts/workflow_bootstrap.cjs --force --sync-generated-ignores taskId=bootstrap-new-project taskSummary="Bootstrap workflow adoption and project discovery."
```

5. Run workflow doctor before the first real task.

```bash
node .github/hooks/scripts/workflow_doctor.cjs
```

6. Start with the `discover-requirements` prompt and keep the project in Discovery until scope, constraints, and acceptance criteria are explicit.

## What should be customized immediately

- [`.github/workflow-profile.json`](../../.github/workflow-profile.json)
- [`.vscode/mcp.json`](../../.vscode/mcp.json)
- `quality gate commands` in the workflow profile once the repo has real scripts
- `roots.appRoots`, `roots.featureRoots`, and `roots.localeRoots` after the app layout is chosen

## Recommended first pilot

- one small page or feature
- one simple server-side flow
- one verification pass with quality gates and runtime review

Once that passes cleanly, expand the workflow to the rest of the project.
