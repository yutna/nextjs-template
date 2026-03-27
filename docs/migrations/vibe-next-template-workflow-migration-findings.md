# Vibe Next Template Migration Findings

This document records the friction discovered while replacing the legacy workflow layer in `vibe-next-template` with the newer GitHub Copilot-first workflow contract.

## Resolved during migration

### 1. Legacy lint pipeline encoded the old architecture

The previous `lint` command depended on `bin/vibe lint:check`, which enforced the old `modules/containers/hooks/screens` contract. After the workflow replacement, those checks became a source of false failures instead of a quality signal.

Resolution:

- removed `lint:check` from the active lint pipeline
- removed the legacy `bin/` workflow helpers
- moved workflow validation into `workflow:validate-state`, `workflow:validate-repo`, and `workflow:proof`

### 2. ESLint depended on `import/no-default-export` without a direct plugin dependency

The repository linted successfully before migration because the old setup never fully surfaced the missing dependency. Once the workflow and scripts were refreshed, ESLint failed immediately.

Resolution:

- added `eslint-plugin-import`
- aligned ESLint ignores so governance folders such as `.github/**` and `.agents/**` do not pollute application lint

### 3. Replacing `.github/` blindly removed application CI

The workflow template ships integrity and proof jobs, but the application repository also needs typecheck, lint, test, and build gates in CI.

Resolution:

- rebuilt `.github/workflows/ci.yml` so it validates both the workflow layer and the application itself

### 4. Build verification needed deterministic env handling

The production build requires `NEXT_PUBLIC_API_URL`, which made CI and migration verification fail unless a local `.env.local` existed.

Resolution:

- added `build:example-env`
- documented the example-env build path in `README.md` and `CONTRIBUTING.md`

### 5. Workflow proof emitted a local hook log into the working tree

The proof and validation flow generates `.github/hooks/workflow-hook.log`. Without an ignore rule, the migrated repository picks up a noisy untracked file after routine workflow verification.

Resolution:

- added `.github/hooks/*.log` to `.gitignore`
- kept the generated log out of the committed branch

## Workflow gaps discovered

### 1. `workflow-state.json` can be semantically stale but still schema-valid

Copying the workflow into a real project brought over a valid state file that still described the template repository's previous task. `validate-state` passed because the schema was correct even though the task context was wrong.

Impact:

- adoption can start from a misleading state if teams copy artifacts without explicitly resetting task context

Recommended follow-up:

- add a bootstrap/adoption command that resets state automatically for the target repository
- optionally add a validator warning when `taskId`, `filesInScope`, or `delivery` notes clearly belong to another repository

### 2. Deterministic Next.js policy checks are event-driven, not repo-wide

The `nextjs_policy.cjs` layer is strongest when it reviews edits as they happen through Copilot hooks. A manual migration can still preserve some legacy naming patterns if those files are moved in bulk and never re-reviewed through the hook path.

Impact:

- repo-wide drift can survive unless a human review or extra audit pass catches it

Recommended follow-up:

- add a repo-wide structural audit command for `src/features`, `src/shared/routes`, locale messages, and route files
- use that command inside CI in addition to the current hook proof suite

### 3. Full architecture migration needs an adoption strategy, not only a template copy

Workflow artifact replacement was straightforward. Application architecture replacement was more nuanced because preserving behavior while changing taxonomy requires staged migration.

Impact:

- greenfield install is easy
- real-project adoption needs a stronger `adopt` or `migrate` workflow than simple file copy

Recommended follow-up:

- ship a dedicated CLI or codemod-driven adoption flow
- separate `new`, `adopt`, and `migrate` paths explicitly

## Final migration status

The repository now uses the new workflow contract and the landing feature lives under `src/features/landing` with the legacy `containers` and `screens` naming removed from the active code path. The client-shell entrypoints were rewritten to `*.client.tsx` files, the feature exports now align with the new vocabulary, and the updated structure passed the full gate stack:

- `npm run typecheck`
- `npm run lint`
- `npm test`
- `npm run workflow:validate-state`
- `npm run workflow:validate-repo`
- `npm run workflow:proof`
- `npm run build:example-env`
- `npm run build:storybook`
- `git diff --check`

The remaining gaps recorded above are workflow-product gaps rather than application breakages in this migrated repository.
