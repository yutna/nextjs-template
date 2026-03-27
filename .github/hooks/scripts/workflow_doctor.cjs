#!/usr/bin/env node
'use strict';

const { spawnSync } = require('node:child_process');

const { loadProfile, validateProfile, generatedIgnoreIssues, templateBootstrapStateIssues } = require('./workflow_profile.cjs');
const workflowHook = require('./workflow_hook.cjs');

function runNodeScript(args) {
  const result = spawnSync('node', args, {
    cwd: process.cwd(),
    encoding: 'utf8',
  });
  return {
    status: result.status,
    stdout: result.stdout,
    stderr: result.stderr,
  };
}

function main() {
  const json = process.argv.includes('--json');
  const cwd = process.cwd();
  const [profile, loadErrors] = loadProfile(cwd, { allowMissing: true });
  const profileValidation = profile ? validateProfile(cwd, profile) : { errors: [], warnings: [] };
  const [state] = workflowHook.readStateStrict(cwd);

  const results = {
    profile: {
      loadErrors,
      errors: profileValidation.errors,
      warnings: profileValidation.warnings,
      generatedIgnoreIssues: profile ? generatedIgnoreIssues(cwd, profile) : [],
      bootstrapStateIssues: profile ? templateBootstrapStateIssues(state, profile) : [],
    },
    validateState: runNodeScript(['.github/hooks/scripts/workflow_hook.cjs', 'validate-state']),
    validateRepo: runNodeScript(['.github/hooks/scripts/validate_repo.cjs']),
    auditStructure: runNodeScript(['.github/hooks/scripts/workflow_audit_structure.cjs', '--json']),
  };

  const hasProfileFailure =
    results.profile.loadErrors.length > 0 ||
    results.profile.errors.length > 0 ||
    results.profile.generatedIgnoreIssues.length > 0 ||
    results.profile.bootstrapStateIssues.length > 0;
  const failed =
    hasProfileFailure || results.validateState.status !== 0 || results.validateRepo.status !== 0 || results.auditStructure.status !== 0;

  if (json) {
    process.stdout.write(`${JSON.stringify({ ok: !failed, results }, null, 2)}\n`);
    return failed ? 1 : 0;
  }

  process.stdout.write('Workflow doctor\n');
  process.stdout.write(`- profile: ${hasProfileFailure ? 'issues found' : 'ok'}\n`);
  process.stdout.write(`- validate-state: ${results.validateState.status === 0 ? 'ok' : 'failed'}\n`);
  process.stdout.write(`- validate-repo: ${results.validateRepo.status === 0 ? 'ok' : 'failed'}\n`);
  process.stdout.write(`- audit-structure: ${results.auditStructure.status === 0 ? 'ok' : 'failed'}\n`);

  for (const error of results.profile.loadErrors) {
    process.stdout.write(`  - ${error}\n`);
  }
  for (const error of results.profile.errors) {
    process.stdout.write(`  - ${error}\n`);
  }
  for (const warning of results.profile.warnings) {
    process.stdout.write(`  - ${warning}\n`);
  }
  for (const issue of results.profile.generatedIgnoreIssues) {
    process.stdout.write(`  - ${issue}\n`);
  }
  for (const issue of results.profile.bootstrapStateIssues) {
    process.stdout.write(`  - ${issue}\n`);
  }

  return failed ? 1 : 0;
}

if (require.main === module) {
  process.exit(main());
}
