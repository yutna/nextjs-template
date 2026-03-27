#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const workflowHook = require('./workflow_hook.cjs');
const ROOT = path.resolve(__dirname, '..', '..', '..');
const HOOK_SCRIPT = path.join(ROOT, '.github', 'hooks', 'scripts', 'workflow_hook.cjs');
const NEXTJS_HOOK_SCRIPT = path.join(ROOT, '.github', 'hooks', 'scripts', 'nextjs_policy.cjs');

function runHook(mode, cwd, payload) {
  const result = spawnSync('node', [HOOK_SCRIPT, mode], {
    input: JSON.stringify(payload),
    encoding: 'utf8',
    cwd,
  });
  if (result.error) {
    throw result.error;
  }
  if (result.status !== 0) {
    throw new Error(result.stderr || result.stdout || `Hook exited with status ${result.status}`);
  }
  return JSON.parse(result.stdout);
}

function runNextjsHook(mode, cwd, payload) {
  const result = spawnSync('node', [NEXTJS_HOOK_SCRIPT, mode], {
    input: JSON.stringify(payload),
    encoding: 'utf8',
    cwd,
  });
  if (result.error) {
    throw result.error;
  }
  if (result.status !== 0) {
    throw new Error(result.stderr || result.stdout || `Next.js hook exited with status ${result.status}`);
  }
  return JSON.parse(result.stdout);
}

function writeState(repo, state) {
  const statePath = path.join(repo, '.github', 'workflow-state.json');
  fs.mkdirSync(path.dirname(statePath), { recursive: true });
  fs.writeFileSync(statePath, `${JSON.stringify(state, null, 2)}\n`, 'utf8');
}

function writeText(filePath, text) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, text, 'utf8');
}

function loadTemplateState() {
  return workflowHook.deepCopyDefaultState();
}

function expect(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function setupNextjsRepo(repo) {
  writeText(
    path.join(repo, 'package.json'),
    `${JSON.stringify(
      {
        name: 'proof-nextjs-app',
        private: true,
        dependencies: {
          next: '16.2.0',
          react: '19.0.0',
          'react-dom': '19.0.0',
        },
      },
      null,
      2,
    )}\n`,
  );
  fs.mkdirSync(path.join(repo, 'src', 'app'), { recursive: true });
}

function scenarioRequiresDiscovery(repo) {
  const state = loadTemplateState();
  writeState(repo, state);
  const payload = {
    cwd: repo,
    tool_name: 'editFiles',
    tool_use_id: 'discovery-guard',
    tool_input: { files: ['src/feature.py'] },
  };
  const result = runHook('workflow-guard', repo, payload);
  const decision = result.hookSpecificOutput.permissionDecision;
  expect(decision === 'ask', 'expected discovery guard to ask before implementation edits');
}

function scenarioCliRequiresDiscovery(repo) {
  const state = loadTemplateState();
  writeState(repo, state);
  const payload = {
    cwd: repo,
    toolName: 'edit',
    toolUseId: 'cli-discovery-guard',
    toolArgs: JSON.stringify({ filePath: 'src/feature.py' }),
  };
  const result = runHook('workflow-guard', repo, payload);
  expect(result.permissionDecision === 'ask', 'expected CLI discovery guard to ask before implementation edits');
}

function scenarioCliAbsoluteStateEditAllowed(repo) {
  writeState(repo, loadTemplateState());
  const payload = {
    cwd: repo,
    toolName: 'edit',
    toolUseId: 'cli-absolute-state-edit',
    toolArgs: JSON.stringify({ filePath: path.join(repo, '.github', 'workflow-state.json') }),
  };
  const result = runHook('workflow-guard', repo, payload);
  expect(result.permissionDecision === 'allow', 'expected CLI absolute-path state edit to be allowed');
}

function scenarioDirectStateEditAfterPlanningIsDenied(repo) {
  const state = loadTemplateState();
  state.requirements.status = 'approved';
  state.phase = 'implementation';
  state.plan.status = 'approved';
  writeState(repo, state);
  const payload = {
    cwd: repo,
    toolName: 'edit',
    toolUseId: 'cli-state-edit-after-planning',
    toolArgs: JSON.stringify({ filePath: path.join(repo, '.github', 'workflow-state.json') }),
  };
  const result = runHook('workflow-guard', repo, payload);
  expect(result.permissionDecision === 'deny', 'expected direct state edit after planning to be denied');
}

function scenarioSessionContext(repo) {
  const state = loadTemplateState();
  state.phase = 'planning';
  state.requirements.status = 'approved';
  state.plan.status = 'approved';
  state.qualityGates.typecheck = 'passed';
  writeState(repo, state);
  const payload = {
    cwd: repo,
    source: 'new',
  };
  const result = runHook('session-context', repo, payload);
  const context = result.hookSpecificOutput.additionalContext;
  expect(context.includes('phase=planning'), 'expected session context to include the current phase');
  expect(context.includes('requirements=approved'), 'expected session context to include requirements status');
  expect(context.includes('typecheck=passed'), 'expected session context to summarize gate state');
}

function scenarioBootstrapFreshState(repo) {
  fs.rmSync(path.join(repo, '.github', 'workflow-state.json'), { force: true });

  const sessionResult = runHook('session-context', repo, { cwd: repo, source: 'new' });
  const context = sessionResult.hookSpecificOutput.additionalContext;
  expect(context.includes('Fresh bootstrap state detected'), 'expected bootstrap guidance for a missing state file');

  const guardPayload = {
    cwd: repo,
    tool_name: 'editFiles',
    tool_use_id: 'bootstrap-discovery-guard',
    tool_input: { files: ['src/feature.py'] },
  };
  const guardResult = runHook('workflow-guard', repo, guardPayload);
  expect(
    guardResult.hookSpecificOutput.permissionDecision === 'ask',
    'expected missing state bootstrap flow to require discovery before implementation edits',
  );
}

function scenarioRequiresPlan(repo) {
  const state = loadTemplateState();
  state.requirements.status = 'clarified';
  state.phase = 'planning';
  writeState(repo, state);
  const payload = {
    cwd: repo,
    tool_name: 'editFiles',
    tool_use_id: 'plan-guard',
    tool_input: { files: ['src/feature.py'] },
  };
  const result = runHook('workflow-guard', repo, payload);
  const decision = result.hookSpecificOutput.permissionDecision;
  expect(decision === 'ask', 'expected planning guard to ask before implementation without approval');
}

function scenarioRetryBudgetBlocksEdits(repo) {
  const state = loadTemplateState();
  state.requirements.status = 'approved';
  state.phase = 'implementation';
  state.plan.status = 'approved';
  state.implementation.retryCount = 3;
  state.implementation.status = 'blocked';
  state.implementation.blockedItems = ['login flow still failing'];
  writeState(repo, state);
  const payload = {
    cwd: repo,
    tool_name: 'editFiles',
    tool_use_id: 'retry-budget',
    tool_input: { files: ['src/feature.py'] },
  };
  const result = runHook('workflow-guard', repo, payload);
  const decision = result.hookSpecificOutput.permissionDecision;
  expect(decision === 'deny', 'expected retry budget to deny further implementation edits');
}

function scenarioInvalidStateEditIsRestored(repo) {
  const state = loadTemplateState();
  writeState(repo, state);
  const prePayload = {
    cwd: repo,
    tool_name: 'editFiles',
    tool_use_id: 'state-edit',
    tool_input: { files: ['.github/workflow-state.json'] },
  };
  const preResult = runHook('workflow-guard', repo, prePayload);
  const decision = preResult.hookSpecificOutput.permissionDecision;
  expect(decision === 'allow', 'expected direct state-file edit to be allowed for validation');

  const brokenState = loadTemplateState();
  brokenState.phase = 'delivery';
  brokenState.requirements.status = 'needs-clarification';
  writeState(repo, brokenState);

  const postPayload = {
    cwd: repo,
    tool_name: 'editFiles',
    tool_use_id: 'state-edit',
    tool_input: { files: ['.github/workflow-state.json'] },
  };
  const postResult = runHook('post-edit-checks', repo, postPayload);
  expect(postResult.decision === 'block', 'expected invalid state transition to be blocked');
  const restored = JSON.parse(fs.readFileSync(path.join(repo, '.github', 'workflow-state.json'), 'utf8'));
  expect(restored.phase === 'discovery', 'expected invalid state edit to be restored to previous baseline');
}

function scenarioInvalidStateEditWithoutToolUseIdIsRestored(repo) {
  writeState(repo, loadTemplateState());

  const prePayload = {
    cwd: repo,
    tool_name: 'editFiles',
    tool_input: { files: ['.github/workflow-state.json'] },
  };
  const preResult = runHook('workflow-guard', repo, prePayload);
  expect(preResult.hookSpecificOutput.permissionDecision === 'allow', 'expected state-file edit without tool_use_id to be allowed for validation');

  const brokenState = loadTemplateState();
  brokenState.phase = 'discovery-complete';
  writeState(repo, brokenState);

  const postPayload = {
    cwd: repo,
    tool_name: 'editFiles',
    tool_input: { files: ['.github/workflow-state.json'] },
  };
  const postResult = runHook('post-edit-checks', repo, postPayload);
  expect(postResult.decision === 'block', 'expected invalid state edit without tool_use_id to be blocked');

  const restored = JSON.parse(fs.readFileSync(path.join(repo, '.github', 'workflow-state.json'), 'utf8'));
  expect(restored.phase === 'discovery', 'expected invalid state without tool_use_id to be restored to previous baseline');
}

function scenarioDeliveryActionDenied(repo) {
  const state = loadTemplateState();
  state.requirements.status = 'approved';
  state.phase = 'verification';
  state.plan.status = 'approved';
  state.implementation.status = 'completed';
  state.implementation.filesTouched = ['src/feature.py'];
  writeState(repo, state);
  const payload = {
    cwd: repo,
    tool_name: 'runTerminalCommand',
    tool_use_id: 'delivery-deny',
    tool_input: { command: "git commit -m 'ship it'" },
  };
  const result = runHook('workflow-guard', repo, payload);
  const decision = result.hookSpecificOutput.permissionDecision;
  expect(decision === 'deny', 'expected delivery action to be denied until gates are green');
}

function scenarioCliDeliveryActionDenied(repo) {
  const state = loadTemplateState();
  state.requirements.status = 'approved';
  state.phase = 'verification';
  state.plan.status = 'approved';
  state.implementation.status = 'completed';
  state.implementation.filesTouched = ['src/feature.py'];
  writeState(repo, state);
  const payload = {
    cwd: repo,
    toolName: 'bash',
    toolUseId: 'cli-delivery-deny',
    toolArgs: JSON.stringify({ command: "git commit -m 'ship it'" }),
  };
  const result = runHook('workflow-guard', repo, payload);
  expect(result.permissionDecision === 'deny', 'expected CLI delivery action to be denied until gates are green');
}

function scenarioDeliveryActionRequiresUserApproval(repo) {
  const state = loadTemplateState();
  state.requirements.status = 'approved';
  state.phase = 'delivery';
  state.plan.status = 'approved';
  state.implementation.status = 'completed';
  state.implementation.filesTouched = ['src/feature.py'];
  state.qualityGates.typecheck = 'not-applicable';
  state.qualityGates.lint = 'not-applicable';
  state.qualityGates.tests = 'passed';
  state.qualityGates.verification = 'passed';
  state.delivery.status = 'ready-for-review';
  state.delivery.userApproved = false;
  writeState(repo, state);
  const payload = {
    cwd: repo,
    tool_name: 'runTerminalCommand',
    tool_use_id: 'delivery-needs-approval',
    tool_input: { command: "git commit -m 'ship it'" },
  };
  const result = runHook('workflow-guard', repo, payload);
  expect(result.hookSpecificOutput.permissionDecision === 'deny', 'expected delivery action to require user approval');
}

function scenarioReadOnlyCommandAllowedDuringDiscovery(repo) {
  writeState(repo, loadTemplateState());
  const payload = {
    cwd: repo,
    tool_name: 'runTerminalCommand',
    tool_use_id: 'readonly-discovery',
    tool_input: { command: 'rg workflow' },
  };
  const result = runHook('workflow-guard', repo, payload);
  expect(result.continue === true, 'expected read-only repo inspection to remain allowed during discovery');
}

function scenarioReadOnlyCommandAllowedWithInvalidState(repo) {
  const statePath = path.join(repo, '.github', 'workflow-state.json');
  fs.writeFileSync(statePath, '{ invalid json\n', 'utf8');

  const payload = {
    cwd: repo,
    tool_name: 'runTerminalCommand',
    tool_use_id: 'readonly-invalid-state',
    tool_input: { command: 'node .github/hooks/scripts/workflow_hook.cjs validate-state' },
  };
  const result = runHook('workflow-guard', repo, payload);
  expect(result.continue === true, 'expected read-only state diagnostics to stay allowed when state is invalid');
}

function scenarioGateCommandAllowedBeforePlan(repo) {
  const state = loadTemplateState();
  state.requirements.status = 'clarified';
  state.phase = 'planning';
  writeState(repo, state);

  const payload = {
    cwd: repo,
    tool_name: 'runTerminalCommand',
    tool_use_id: 'gate-command-before-plan',
    tool_input: { command: 'node .github/hooks/scripts/workflow_hook_proof.cjs' },
  };
  const result = runHook('workflow-guard', repo, payload);
  expect(result.continue === true, 'expected proof and gate-style commands to bypass implementation edit guards');
}

function scenarioRepositoryValidatorCommandAllowedDuringDiscovery(repo) {
  writeState(repo, loadTemplateState());
  const payload = {
    cwd: repo,
    tool_name: 'runTerminalCommand',
    tool_use_id: 'repo-validator-readonly',
    tool_input: { command: 'node .github/hooks/scripts/validate_repo.cjs' },
  };
  const result = runHook('workflow-guard', repo, payload);
  expect(result.continue === true, 'expected repository validator command to remain allowed during discovery');
}

function scenarioPassiveTerminalToolAllowedDuringDiscovery(repo) {
  writeState(repo, loadTemplateState());
  const payload = {
    cwd: repo,
    tool_name: 'await_terminal',
    tool_use_id: 'await-terminal-readonly',
    tool_input: { id: 'terminal-1', timeout: 1000 },
  };
  const result = runHook('workflow-guard', repo, payload);
  expect(result.continue === true, 'expected passive terminal readers to remain allowed during discovery');
}

function scenarioStopGateBlocksIncompleteWork(repo) {
  const state = loadTemplateState();
  state.requirements.status = 'approved';
  state.phase = 'implementation';
  state.plan.status = 'approved';
  state.implementation.status = 'in-progress';
  state.implementation.filesTouched = ['src/feature.py'];
  writeState(repo, state);
  const payload = {
    cwd: repo,
    stop_hook_active: false,
  };
  const result = runHook('stop-gate', repo, payload);
  expect(result.decision === 'block', 'expected stop gate to block unfinished work');
}

function scenarioCliStopGateBlocksIncompleteWork(repo) {
  const state = loadTemplateState();
  state.requirements.status = 'approved';
  state.phase = 'implementation';
  state.plan.status = 'approved';
  state.implementation.status = 'in-progress';
  state.implementation.filesTouched = ['src/feature.py'];
  writeState(repo, state);
  const payload = {
    cwd: repo,
    stopHookActive: false,
  };
  const result = runHook('stop-gate', repo, payload);
  expect(result.decision === 'block', 'expected CLI stop gate to block unfinished work');
}

function scenarioStopGateAllowsCompletedImplementation(repo) {
  const state = loadTemplateState();
  state.requirements.status = 'approved';
  state.phase = 'implementation';
  state.plan.status = 'approved';
  state.implementation.status = 'completed';
  state.implementation.filesTouched = ['src/feature.py'];
  writeState(repo, state);
  const payload = {
    cwd: repo,
    stop_hook_active: false,
  };
  const result = runHook('stop-gate', repo, payload);
  expect(result.decision === 'allow', 'expected stop gate to allow a completed implementation handoff');
}

function scenarioCliStopGateAllowsCompletedImplementation(repo) {
  const state = loadTemplateState();
  state.requirements.status = 'approved';
  state.phase = 'implementation';
  state.plan.status = 'approved';
  state.implementation.status = 'completed';
  state.implementation.filesTouched = ['src/feature.py'];
  writeState(repo, state);
  const payload = {
    cwd: repo,
    stopHookActive: false,
  };
  const result = runHook('stop-gate', repo, payload);
  expect(result.decision === 'allow', 'expected CLI stop gate to allow a completed implementation handoff');
}

function scenarioShellStateWriteDenied(repo) {
  const state = loadTemplateState();
  state.requirements.status = 'approved';
  state.phase = 'implementation';
  state.plan.status = 'approved';
  writeState(repo, state);
  const payload = {
    cwd: repo,
    tool_name: 'runTerminalCommand',
    tool_use_id: 'shell-state-write',
    tool_input: { command: "cat > .github/workflow-state.json <<'EOF'\n{}\nEOF" },
  };
  const result = runHook('workflow-guard', repo, payload);
  const decision = result.hookSpecificOutput.permissionDecision;
  expect(decision === 'deny', 'expected shell-based workflow-state writes to be denied');
}

function scenarioCliShellStateWriteDenied(repo) {
  const state = loadTemplateState();
  state.requirements.status = 'approved';
  state.phase = 'implementation';
  state.plan.status = 'approved';
  writeState(repo, state);
  const payload = {
    cwd: repo,
    toolName: 'execute',
    toolUseId: 'cli-shell-state-write',
    toolArgs: JSON.stringify({ command: "printf '{}' > .github/workflow-state.json" }),
  };
  const result = runHook('workflow-guard', repo, payload);
  expect(result.permissionDecision === 'deny', 'expected CLI shell-based workflow-state writes to be denied');
}

function scenarioNodeScriptStateWriteDenied(repo) {
  const state = loadTemplateState();
  state.requirements.status = 'approved';
  state.phase = 'implementation';
  state.plan.status = 'approved';
  writeState(repo, state);
  const payload = {
    cwd: repo,
    tool_name: 'runTerminalCommand',
    tool_use_id: 'node-script-state-write',
    tool_input: {
      command:
        'node -e "const fs=require(\'fs\');fs.writeFileSync(\'.github/workflow-state.json\', \'{}\')"',
    },
  };
  const result = runHook('workflow-guard', repo, payload);
  const decision = result.hookSpecificOutput.permissionDecision;
  expect(decision === 'deny', 'expected node-script workflow-state writes to be denied');
}

function scenarioCliNodeScriptStateWriteDenied(repo) {
  const state = loadTemplateState();
  state.requirements.status = 'approved';
  state.phase = 'implementation';
  state.plan.status = 'approved';
  writeState(repo, state);
  const payload = {
    cwd: repo,
    toolName: 'execute',
    toolUseId: 'cli-node-script-state-write',
    toolArgs: JSON.stringify({
      command: 'node -e "const fs=require(\'fs\');fs.writeFileSync(\'.github/workflow-state.json\', \'{}\')"',
    }),
  };
  const result = runHook('workflow-guard', repo, payload);
  expect(result.permissionDecision === 'deny', 'expected CLI node-script workflow-state writes to be denied');
}

function scenarioUpdateStateApi(repo) {
  const state = loadTemplateState();
  writeState(repo, state);
  const patch = {
    requirements: { status: 'approved' },
    phase: 'planning',
  };
  const result = runHook('update-state', repo, patch);
  expect(result.saved === true, 'expected update-state API to persist a valid transition');
  const updated = JSON.parse(fs.readFileSync(path.join(repo, '.github', 'workflow-state.json'), 'utf8'));
  expect(updated.phase === 'planning', 'expected update-state API to write the new phase');
  expect(updated.version === '1.0', 'expected state version to be preserved');
}

function scenarioUpdateStateCliArgs(repo) {
  writeState(repo, loadTemplateState());
  const result = spawnSync(
    'node',
    [
      HOOK_SCRIPT,
      'update-state',
      'requirements.status=approved',
      'phase=planning',
      'plan.status=approved',
      'plan.summary=\"CLI arg planning summary\"',
    ],
    {
      cwd: repo,
      encoding: 'utf8',
    },
  );
  if (result.error) {
    throw result.error;
  }
  expect(result.status === 0, 'expected CLI arg update-state command to exit successfully');
  const payload = JSON.parse(result.stdout);
  expect(payload.saved === true, 'expected CLI arg update-state command to persist state');

  const updated = JSON.parse(fs.readFileSync(path.join(repo, '.github', 'workflow-state.json'), 'utf8'));
  expect(updated.requirements.status === 'approved', 'expected CLI arg update-state to update nested requirements fields');
  expect(updated.phase === 'planning', 'expected CLI arg update-state to update the phase');
  expect(updated.plan.status === 'approved', 'expected CLI arg update-state to update nested plan fields');
  expect(updated.plan.summary === 'CLI arg planning summary', 'expected CLI arg update-state to update nested string values');
}

function scenarioValidateStateCliWithoutInput(repo) {
  writeState(repo, loadTemplateState());
  const result = spawnSync('node', [HOOK_SCRIPT, 'validate-state'], {
    cwd: repo,
    encoding: 'utf8',
    timeout: 2000,
  });
  if (result.error) {
    throw result.error;
  }
  expect(result.status === 0, 'expected validate-state CLI invocation without stdin to exit successfully');
  const payload = JSON.parse(result.stdout);
  expect(payload.valid === true, 'expected validate-state CLI invocation without stdin to report a valid state');
}

function scenarioPlanningRollsBackToDiscovery(repo) {
  const state = loadTemplateState();
  state.requirements.status = 'approved';
  state.phase = 'planning';
  state.plan.status = 'proposed';
  writeState(repo, state);

  const rollbackPatch = {
    phase: 'discovery',
    requirements: {
      status: 'needs-clarification',
      openQuestions: ['Clarify the required error-handling behavior'],
    },
    plan: {
      status: 'not-started',
      summary: '',
      filesInScope: [],
    },
  };
  const result = runHook('update-state', repo, rollbackPatch);
  expect(result.saved === true, 'expected planning rollback to discovery to succeed');

  const rolledBack = JSON.parse(fs.readFileSync(path.join(repo, '.github', 'workflow-state.json'), 'utf8'));
  expect(rolledBack.phase === 'discovery', 'expected rollback to land in discovery');
  expect(
    rolledBack.requirements.status === 'needs-clarification',
    'expected rollback to mark requirements as needing clarification',
  );
}

function scenarioQualityGateFailureRollsBackToImplementation(repo) {
  const state = loadTemplateState();
  state.requirements.status = 'approved';
  state.phase = 'quality-gates';
  state.plan.status = 'approved';
  state.implementation.status = 'completed';
  state.implementation.filesTouched = ['src/feature.py'];
  state.qualityGates.typecheck = 'passed';
  state.qualityGates.lint = 'passed';
  state.qualityGates.tests = 'failed';
  state.qualityGates.verification = 'pending';
  state.qualityGates.lastRunSummary = 'Regression found in tests';
  writeState(repo, state);

  const rollbackPatch = {
    phase: 'implementation',
    implementation: {
      status: 'in-progress',
      filesTouched: ['src/feature.py'],
      retryCount: 1,
      blockedItems: [],
    },
  };
  const result = runHook('update-state', repo, rollbackPatch);
  expect(result.saved === true, 'expected quality-gate rollback to implementation to succeed');

  const rolledBack = JSON.parse(fs.readFileSync(path.join(repo, '.github', 'workflow-state.json'), 'utf8'));
  expect(rolledBack.phase === 'implementation', 'expected rollback to land in implementation');
  expect(rolledBack.implementation.retryCount === 1, 'expected rollback to increment retry evidence');
  expect(rolledBack.qualityGates.tests === 'failed', 'expected failed gate evidence to remain visible');
}

function scenarioVerificationBugRollsBackToImplementation(repo) {
  const state = loadTemplateState();
  state.requirements.status = 'approved';
  state.phase = 'verification';
  state.plan.status = 'approved';
  state.implementation.status = 'completed';
  state.implementation.filesTouched = ['src/feature.py'];
  state.qualityGates.typecheck = 'passed';
  state.qualityGates.lint = 'passed';
  state.qualityGates.tests = 'passed';
  state.qualityGates.verification = 'failed';
  state.qualityGates.lastRunSummary = 'Runtime verification found a bug';
  writeState(repo, state);

  const rollbackPatch = {
    phase: 'implementation',
    implementation: {
      status: 'in-progress',
      filesTouched: ['src/feature.py'],
      retryCount: 1,
      blockedItems: [],
    },
    delivery: {
      status: 'blocked',
      userApproved: false,
      notes: 'Verification found a runtime bug; returning to implementation.',
    },
  };
  const result = runHook('update-state', repo, rollbackPatch);
  expect(result.saved === true, 'expected verification rollback to implementation to succeed');

  const rolledBack = JSON.parse(fs.readFileSync(path.join(repo, '.github', 'workflow-state.json'), 'utf8'));
  expect(rolledBack.phase === 'implementation', 'expected verification rollback to land in implementation');
  expect(rolledBack.qualityGates.verification === 'failed', 'expected verification failure evidence to remain visible');
  expect(rolledBack.delivery.status === 'blocked', 'expected delivery to remain blocked after rollback');
}

function scenarioPostEditInvalidatesDownstreamGates(repo) {
  const state = loadTemplateState();
  state.requirements.status = 'approved';
  state.phase = 'delivery';
  state.plan.status = 'approved';
  state.implementation.status = 'completed';
  state.implementation.filesTouched = ['src/existing.py'];
  state.qualityGates.typecheck = 'not-applicable';
  state.qualityGates.lint = 'not-applicable';
  state.qualityGates.tests = 'passed';
  state.qualityGates.verification = 'passed';
  state.qualityGates.lastRunSummary = 'All gates and verification passed';
  state.delivery.status = 'ready-for-review';
  state.delivery.notes = 'Ready for review';
  writeState(repo, state);

  const payload = {
    cwd: repo,
    tool_name: 'editFiles',
    tool_use_id: 'invalidate-gates',
    tool_input: { files: ['src/feature.py'] },
  };
  const result = runHook('post-edit-checks', repo, payload);
  const context = result.hookSpecificOutput.additionalContext;
  expect(context.includes('downstream gate invalidation'), 'expected post-edit guidance to mention automatic gate invalidation');

  const updated = JSON.parse(fs.readFileSync(path.join(repo, '.github', 'workflow-state.json'), 'utf8'));
  expect(updated.phase === 'implementation', 'expected downstream edits to move the workflow back to implementation');
  expect(updated.implementation.status === 'in-progress', 'expected downstream edits to mark implementation in progress');
  expect(updated.implementation.filesTouched.includes('src/existing.py'), 'expected existing touched-file evidence to be preserved');
  expect(updated.implementation.filesTouched.includes('src/feature.py'), 'expected edited file to be recorded automatically');
  expect(updated.qualityGates.typecheck === 'not-applicable', 'expected not-applicable gates to remain not-applicable');
  expect(updated.qualityGates.lint === 'not-applicable', 'expected not-applicable lint gate to remain not-applicable');
  expect(updated.qualityGates.tests === 'pending', 'expected tests to be reset after downstream edits');
  expect(updated.qualityGates.verification === 'pending', 'expected verification to be reset after downstream edits');
  expect(updated.delivery.status === 'blocked', 'expected delivery to become blocked after downstream edits');
}

function scenarioExternalPathsIgnoredDuringPostEdit(repo) {
  const state = loadTemplateState();
  state.requirements.status = 'approved';
  state.phase = 'implementation';
  state.plan.status = 'approved';
  state.implementation.status = 'in-progress';
  writeState(repo, state);

  const payload = {
    cwd: repo,
    tool_name: 'editFiles',
    tool_use_id: 'ignore-external-paths',
    tool_input: {
      files: [path.join(os.tmpdir(), 'copilot-plan.md'), path.join(repo, 'src', 'feature.py')],
    },
  };
  runHook('post-edit-checks', repo, payload);

  const updated = JSON.parse(fs.readFileSync(path.join(repo, '.github', 'workflow-state.json'), 'utf8'));
  expect(
    updated.implementation.filesTouched.includes('src/feature.py'),
    'expected repo-local edited file to be recorded automatically',
  );
  expect(
    !updated.implementation.filesTouched.some((filePath) => filePath.includes('copilot-plan.md')),
    'expected external scratchpad paths to be ignored during touched-file tracking',
  );
}

function scenarioEndToEndWorkflow(repo) {
  writeState(repo, loadTemplateState());

  const discoveryPatch = {
    requirements: {
      status: 'approved',
      acceptanceCriteria: ['user can complete the target workflow'],
      constraints: ['stay inside approved scope'],
      openQuestions: [],
    },
  };
  const discoveryResult = runHook('update-state', repo, discoveryPatch);
  expect(discoveryResult.saved === true, 'expected discovery state update to succeed');

  const planningPatch = {
    phase: 'planning',
    plan: {
      status: 'approved',
      summary: 'Implement the planned workflow end to end',
      filesInScope: ['src/feature.py', 'tests/test_feature.py'],
    },
  };
  const planningResult = runHook('update-state', repo, planningPatch);
  expect(planningResult.saved === true, 'expected planning transition to succeed');

  const implementationPatch = {
    phase: 'implementation',
    implementation: {
      status: 'completed',
      filesTouched: ['src/feature.py', 'tests/test_feature.py'],
      retryCount: 0,
      blockedItems: [],
    },
  };
  const implementationResult = runHook('update-state', repo, implementationPatch);
  expect(implementationResult.saved === true, 'expected implementation transition to succeed');

  const qualityPatch = {
    phase: 'quality-gates',
    qualityGates: {
      typecheck: 'passed',
      lint: 'passed',
      tests: 'passed',
      verification: 'pending',
      lastRunSummary: 'All automated gates passed',
    },
  };
  const qualityResult = runHook('update-state', repo, qualityPatch);
  expect(qualityResult.saved === true, 'expected quality-gates transition to succeed');

  const verificationPatch = {
    phase: 'verification',
    qualityGates: {
      typecheck: 'passed',
      lint: 'passed',
      tests: 'passed',
      verification: 'passed',
      lastRunSummary: 'Automated gates and verification passed',
    },
  };
  const verificationResult = runHook('update-state', repo, verificationPatch);
  expect(verificationResult.saved === true, 'expected verification transition to succeed');

  const deliveryPatch = {
    phase: 'delivery',
    delivery: {
      status: 'ready-for-review',
      userApproved: false,
      notes: 'Ready for user review',
    },
  };
  const deliveryResult = runHook('update-state', repo, deliveryPatch);
  expect(deliveryResult.saved === true, 'expected delivery transition to succeed after all gates passed');

  const finalState = JSON.parse(fs.readFileSync(path.join(repo, '.github', 'workflow-state.json'), 'utf8'));
  expect(finalState.phase === 'delivery', 'expected end-to-end proof to end in delivery phase');
  expect(finalState.delivery.status === 'ready-for-review', 'expected delivery to be review-ready');
  expect(finalState.qualityGates.verification === 'passed', 'expected verification to remain passed at delivery');
}

function scenarioNextjsSessionContext(repo) {
  setupNextjsRepo(repo);
  const result = runNextjsHook('session-context', repo, {
    cwd: repo,
    source: 'new',
  });
  const context = result.hookSpecificOutput.additionalContext;
  expect(context.includes('Next.js profile active'), 'expected Next.js session context to mention the active profile');
  expect(context.includes('Greenfield App Router mode'), 'expected Next.js session context to mention greenfield App Router mode');
  expect(context.includes('next-intl'), 'expected Next.js session context to mention next-intl');
  expect(context.includes('/en/...') && context.includes('/th/...'), 'expected Next.js session context to mention locale-prefixed URLs');
  expect(context.includes('automated tests stay practical'), 'expected Next.js session context to mention testability guidance');
  expect(context.includes('canonical feature slugs'), 'expected Next.js session context to mention file-system governance');
  expect(context.includes('@t3-oss/env-nextjs'), 'expected Next.js session context to mention env governance');
  expect(context.includes('pino'), 'expected Next.js session context to mention logging governance');
}

function scenarioNextjsGreenfieldPagesDenied(repo) {
  setupNextjsRepo(repo);
  writeState(repo, loadTemplateState());
  const result = runNextjsHook('workflow-guard', repo, {
    cwd: repo,
    toolName: 'edit',
    toolArgs: JSON.stringify({ filePath: 'src/pages/index.tsx' }),
  });
  expect(result.permissionDecision === 'deny', 'expected greenfield pages router edits to be denied');
}

function scenarioNextjsTechnicalRouteGroupDenied(repo) {
  setupNextjsRepo(repo);
  writeState(repo, loadTemplateState());
  const result = runNextjsHook('workflow-guard', repo, {
    cwd: repo,
    toolName: 'edit',
    toolArgs: JSON.stringify({ filePath: 'src/app/(shared)/page.tsx' }),
  });
  expect(result.permissionDecision === 'deny', 'expected technical route groups to be denied');
}

function scenarioNextjsParallelRouteRequiresPlan(repo) {
  setupNextjsRepo(repo);
  writeState(repo, loadTemplateState());
  const result = runNextjsHook('workflow-guard', repo, {
    cwd: repo,
    toolName: 'edit',
    toolArgs: JSON.stringify({ filePath: 'src/app/[locale]/@analytics/default.tsx' }),
  });
  expect(result.permissionDecision === 'ask', 'expected parallel routes to require an explicit planning note');
}

function scenarioNextjsApprovedParallelRoutePasses(repo) {
  setupNextjsRepo(repo);
  const state = loadTemplateState();
  state.plan.summary = 'Approved parallel routes for a multi-pane dashboard experience';
  state.stackContext = {
    profile: 'nextjs-enterprise',
    routeDesign: {
      specialRoutingFeatures: ['parallel routes'],
    },
  };
  writeState(repo, state);
  const result = runNextjsHook('workflow-guard', repo, {
    cwd: repo,
    toolName: 'edit',
    toolArgs: JSON.stringify({ filePath: 'src/app/[locale]/@analytics/default.tsx' }),
  });
  expect(result.continue === true, 'expected approved parallel routes to pass the Next.js pre-tool guard');
}

function scenarioNextjsParallelSlotNeedsDefault(repo) {
  setupNextjsRepo(repo);
  const state = loadTemplateState();
  state.plan.summary = 'Approved parallel routes for a multi-pane dashboard experience';
  state.stackContext = {
    profile: 'nextjs-enterprise',
    routeDesign: {
      specialRoutingFeatures: ['parallel routes'],
    },
  };
  writeState(repo, state);
  writeText(
    path.join(repo, 'src', 'app', '[locale]', '@analytics', '(.)reports', 'page.tsx'),
    "export default function Page() {\n  return null;\n}\n",
  );
  const result = runNextjsHook('post-edit-checks', repo, {
    cwd: repo,
    toolName: 'edit',
    toolArgs: JSON.stringify({ filePath: 'src/app/[locale]/@analytics/(.)reports/page.tsx' }),
  });
  expect(result.decision === 'block', 'expected parallel route slots without default.tsx to be blocked');
}

function scenarioNextjsVisibleRouteNeedsLocaleBoundary(repo) {
  setupNextjsRepo(repo);
  writeState(repo, loadTemplateState());
  const result = runNextjsHook('workflow-guard', repo, {
    cwd: repo,
    toolName: 'edit',
    toolArgs: JSON.stringify({ filePath: 'src/app/customers/page.tsx' }),
  });
  expect(result.permissionDecision === 'deny', 'expected visible app routes outside [locale] to be denied');
}

function scenarioNextjsRouteShellLowLevelImportBlocked(repo) {
  setupNextjsRepo(repo);
  writeState(repo, loadTemplateState());
  writeText(
    path.join(repo, 'src', 'app', '[locale]', 'customers', 'page.tsx'),
    "import { listCustomers } from '@/features/customers/data/list-customers';\n\nexport default async function Page() {\n  const rows = await listCustomers();\n  return <pre>{JSON.stringify(rows)}</pre>;\n}\n",
  );
  const result = runNextjsHook('post-edit-checks', repo, {
    cwd: repo,
    toolName: 'edit',
    toolArgs: JSON.stringify({ filePath: 'src/app/[locale]/customers/page.tsx' }),
  });
  expect(result.decision === 'block', 'expected route shells importing low-level data modules to be blocked');
}

function scenarioNextjsPageClientBoundaryBlocked(repo) {
  setupNextjsRepo(repo);
  writeState(repo, loadTemplateState());
  writeText(
    path.join(repo, 'src', 'app', '[locale]', 'customers', 'page.tsx'),
    "'use client';\n\nexport default function Page() {\n  return <div>Customers</div>;\n}\n",
  );
  const result = runNextjsHook('post-edit-checks', repo, {
    cwd: repo,
    toolName: 'edit',
    toolArgs: JSON.stringify({ filePath: 'src/app/[locale]/customers/page.tsx' }),
  });
  expect(result.decision === 'block', 'expected page.tsx client boundaries to be blocked');
}

function scenarioNextjsClientBoundaryLeakBlocked(repo) {
  setupNextjsRepo(repo);
  writeState(repo, loadTemplateState());
  writeText(
    path.join(repo, 'src', 'features', 'customers', 'components', 'client', 'customers-table.tsx'),
    "'use client';\n\nimport 'server-only';\n\nexport function CustomersTable() {\n  return <div>{process.env.SECRET_TOKEN}</div>;\n}\n",
  );
  const result = runNextjsHook('post-edit-checks', repo, {
    cwd: repo,
    toolName: 'edit',
    toolArgs: JSON.stringify({ filePath: 'src/features/customers/components/client/customers-table.tsx' }),
  });
  expect(result.decision === 'block', 'expected client env leaks and server-only imports to be blocked');
}

function scenarioNextjsRouteRegistryLeaksInternalSyntax(repo) {
  setupNextjsRepo(repo);
  writeState(repo, loadTemplateState());
  writeText(
    path.join(repo, 'src', 'shared', 'routes', 'customers.ts'),
    "export const customers = {\n  path: () => '/(app)/customers',\n};\n",
  );
  const result = runNextjsHook('post-edit-checks', repo, {
    cwd: repo,
    toolName: 'edit',
    toolArgs: JSON.stringify({ filePath: 'src/shared/routes/customers.ts' }),
  });
  expect(result.decision === 'block', 'expected route helpers leaking route-group syntax to be blocked');
}

function scenarioNextjsFeatureUtilityBucketBlocked(repo) {
  setupNextjsRepo(repo);
  writeState(repo, loadTemplateState());
  writeText(
    path.join(repo, 'src', 'features', 'customers', 'helpers', 'format-currency.ts'),
    "export function formatCurrency(value) {\n  return `usd-${value}`;\n}\n",
  );
  const result = runNextjsHook('post-edit-checks', repo, {
    cwd: repo,
    toolName: 'edit',
    toolArgs: JSON.stringify({ filePath: 'src/features/customers/helpers/format-currency.ts' }),
  });
  expect(result.decision === 'block', 'expected one-off feature utility folders to be blocked');
}

function scenarioNextjsPascalCaseFeatureFileBlocked(repo) {
  setupNextjsRepo(repo);
  writeState(repo, loadTemplateState());
  const guardResult = runNextjsHook('workflow-guard', repo, {
    cwd: repo,
    toolName: 'edit',
    toolArgs: JSON.stringify({ filePath: 'src/features/customers/components/CustomerTable.tsx' }),
  });
  expect(guardResult.permissionDecision === 'deny', 'expected PascalCase feature file paths to be denied before editing');
}

function scenarioNextjsRouteSegmentCaseBlocked(repo) {
  setupNextjsRepo(repo);
  writeState(repo, loadTemplateState());
  writeText(
    path.join(repo, 'src', 'app', '[locale]', 'CustomerSettings', 'page.tsx'),
    'export default function Page() {\n  return null;\n}\n',
  );
  const result = runNextjsHook('post-edit-checks', repo, {
    cwd: repo,
    toolName: 'edit',
    toolArgs: JSON.stringify({ filePath: 'src/app/[locale]/CustomerSettings/page.tsx' }),
  });
  expect(result.decision === 'block', 'expected non-kebab-case route segment names to be blocked');
}

function scenarioNextjsNamedActionFilePasses(repo) {
  setupNextjsRepo(repo);
  writeState(repo, loadTemplateState());
  writeText(
    path.join(repo, 'src', 'features', 'customers', 'actions', 'create-customer.action.ts'),
    'export async function createCustomerAction() {\n  return { ok: true };\n}\n',
  );
  const result = runNextjsHook('post-edit-checks', repo, {
    cwd: repo,
    toolName: 'edit',
    toolArgs: JSON.stringify({ filePath: 'src/features/customers/actions/create-customer.action.ts' }),
  });
  expect(result.continue === true, 'expected canonical action file naming to pass Next.js post-edit checks');
}

function scenarioNextjsHardcodedUiTextBlocked(repo) {
  setupNextjsRepo(repo);
  writeState(repo, loadTemplateState());
  writeText(
    path.join(repo, 'src', 'features', 'customers', 'components', 'customer-empty-state.tsx'),
    "export function CustomerEmptyState() {\n  return <p>No customers found</p>;\n}\n",
  );
  const result = runNextjsHook('post-edit-checks', repo, {
    cwd: repo,
    toolName: 'edit',
    toolArgs: JSON.stringify({ filePath: 'src/features/customers/components/customer-empty-state.tsx' }),
  });
  expect(result.decision === 'block', 'expected hardcoded user-facing JSX text to be blocked');
}

function scenarioNextjsTranslatedUiTextPasses(repo) {
  setupNextjsRepo(repo);
  writeState(repo, loadTemplateState());
  writeText(
    path.join(repo, 'src', 'features', 'customers', 'components', 'customer-empty-state.tsx'),
    "export function CustomerEmptyState({ t }) {\n  return <p>{t('customers.empty.message')}</p>;\n}\n",
  );
  const result = runNextjsHook('post-edit-checks', repo, {
    cwd: repo,
    toolName: 'edit',
    toolArgs: JSON.stringify({ filePath: 'src/features/customers/components/customer-empty-state.tsx' }),
  });
  expect(result.continue === true, 'expected translated UI text to pass Next.js post-edit checks');
}

function scenarioNextjsApprovedClientBoundaryPasses(repo) {
  setupNextjsRepo(repo);
  writeState(repo, loadTemplateState());
  writeText(
    path.join(repo, 'src', 'features', 'customers', 'components', 'client', 'customers-table.tsx'),
    "'use client';\n\nexport function CustomersTable({ rows }) {\n  return <div>{rows.length}</div>;\n}\n",
  );
  const result = runNextjsHook('post-edit-checks', repo, {
    cwd: repo,
    toolName: 'edit',
    toolArgs: JSON.stringify({ filePath: 'src/features/customers/components/client/customers-table.tsx' }),
  });
  expect(result.continue === true, 'expected approved client leaf components to pass Next.js post-edit checks');
}

function scenarioNextjsEnvLibraryOutsideEnvModuleBlocked(repo) {
  setupNextjsRepo(repo);
  writeState(repo, loadTemplateState());
  writeText(
    path.join(repo, 'src', 'shared', 'config', 'runtime.ts'),
    "import { createEnv } from '@t3-oss/env-nextjs';\n\nexport const env = createEnv({ server: {}, client: {}, runtimeEnv: {} });\n",
  );
  const result = runNextjsHook('post-edit-checks', repo, {
    cwd: repo,
    toolName: 'edit',
    toolArgs: JSON.stringify({ filePath: 'src/shared/config/runtime.ts' }),
  });
  expect(result.decision === 'block', 'expected @t3-oss/env-nextjs usage outside env modules to be blocked');
}

function scenarioNextjsEnvModulePasses(repo) {
  setupNextjsRepo(repo);
  writeState(repo, loadTemplateState());
  writeText(
    path.join(repo, 'src', 'shared', 'env.ts'),
    "import { createEnv } from '@t3-oss/env-nextjs';\n\nexport const env = createEnv({ server: {}, client: {}, runtimeEnv: {} });\n",
  );
  const result = runNextjsHook('post-edit-checks', repo, {
    cwd: repo,
    toolName: 'edit',
    toolArgs: JSON.stringify({ filePath: 'src/shared/env.ts' }),
  });
  expect(result.continue === true, 'expected dedicated env modules to pass Next.js post-edit checks');
}

function scenarioNextjsPinoOutsideLoggerBlocked(repo) {
  setupNextjsRepo(repo);
  writeState(repo, loadTemplateState());
  writeText(
    path.join(repo, 'src', 'features', 'customers', 'actions', 'create-customer.action.ts'),
    "import pino from 'pino';\n\nconst logger = pino();\n\nexport async function createCustomerAction() {\n  logger.info({ feature: 'customers' }, 'created');\n  return { ok: true };\n}\n",
  );
  const result = runNextjsHook('post-edit-checks', repo, {
    cwd: repo,
    toolName: 'edit',
    toolArgs: JSON.stringify({ filePath: 'src/features/customers/actions/create-customer.action.ts' }),
  });
  expect(result.decision === 'block', 'expected direct pino usage outside logger modules to be blocked');
}

function scenarioNextjsSharedLoggerPasses(repo) {
  setupNextjsRepo(repo);
  writeState(repo, loadTemplateState());
  writeText(
    path.join(repo, 'src', 'shared', 'logger.ts'),
    "import pino from 'pino';\n\nexport const logger = pino({ name: 'proof-app' });\n",
  );
  const result = runNextjsHook('post-edit-checks', repo, {
    cwd: repo,
    toolName: 'edit',
    toolArgs: JSON.stringify({ filePath: 'src/shared/logger.ts' }),
  });
  expect(result.continue === true, 'expected dedicated logger modules to pass Next.js post-edit checks');
}

function scenarioNextjsSwrOutsideClientBlocked(repo) {
  setupNextjsRepo(repo);
  writeState(repo, loadTemplateState());
  writeText(
    path.join(repo, 'src', 'features', 'customers', 'data', 'customer-cache.ts'),
    "import useSWR from 'swr';\n\nexport function customerCache() {\n  return useSWR('customers');\n}\n",
  );
  const result = runNextjsHook('post-edit-checks', repo, {
    cwd: repo,
    toolName: 'edit',
    toolArgs: JSON.stringify({ filePath: 'src/features/customers/data/customer-cache.ts' }),
  });
  expect(result.decision === 'block', 'expected SWR usage outside client files to be blocked');
}

function scenarioNextjsSwrClientLeafPasses(repo) {
  setupNextjsRepo(repo);
  writeState(repo, loadTemplateState());
  writeText(
    path.join(repo, 'src', 'features', 'customers', 'components', 'client', 'customer-search.client.tsx'),
    "'use client';\n\nimport useSWR from 'swr';\n\nexport function CustomerSearchClient() {\n  const result = useSWR('customers');\n  return <div>{String(Boolean(result.data))}</div>;\n}\n",
  );
  const result = runNextjsHook('post-edit-checks', repo, {
    cwd: repo,
    toolName: 'edit',
    toolArgs: JSON.stringify({ filePath: 'src/features/customers/components/client/customer-search.client.tsx' }),
  });
  expect(result.continue === true, 'expected approved client-leaf SWR usage to pass Next.js post-edit checks');
}

function scenarioNextjsXStateOutsideMachineBlocked(repo) {
  setupNextjsRepo(repo);
  writeState(repo, loadTemplateState());
  writeText(
    path.join(repo, 'src', 'features', 'customers', 'components', 'customer-flow.ts'),
    "import { createMachine } from 'xstate';\n\nexport const customerFlow = createMachine({});\n",
  );
  const result = runNextjsHook('post-edit-checks', repo, {
    cwd: repo,
    toolName: 'edit',
    toolArgs: JSON.stringify({ filePath: 'src/features/customers/components/customer-flow.ts' }),
  });
  expect(result.decision === 'block', 'expected xstate usage outside approved machine locations to be blocked');
}

function scenarioNextjsMachinePolicyPasses(repo) {
  setupNextjsRepo(repo);
  writeState(repo, loadTemplateState());
  writeText(
    path.join(repo, 'src', 'features', 'customers', 'policies', 'customer-flow.machine.ts'),
    "import { createMachine } from 'xstate';\n\nexport const customerFlowMachine = createMachine({});\n",
  );
  const result = runNextjsHook('post-edit-checks', repo, {
    cwd: repo,
    toolName: 'edit',
    toolArgs: JSON.stringify({ filePath: 'src/features/customers/policies/customer-flow.machine.ts' }),
  });
  expect(result.continue === true, 'expected xstate machine files in approved locations to pass Next.js post-edit checks');
}

function scenarioNextjsReactIconsRootImportBlocked(repo) {
  setupNextjsRepo(repo);
  writeState(repo, loadTemplateState());
  writeText(
    path.join(repo, 'src', 'features', 'customers', 'components', 'customer-icon.tsx'),
    "import { HiUser } from 'react-icons';\n\nexport function CustomerIcon() {\n  return <HiUser />;\n}\n",
  );
  const result = runNextjsHook('post-edit-checks', repo, {
    cwd: repo,
    toolName: 'edit',
    toolArgs: JSON.stringify({ filePath: 'src/features/customers/components/customer-icon.tsx' }),
  });
  expect(result.decision === 'block', 'expected react-icons root imports to be blocked');
}

function scenarioNextjsSharpClientBlocked(repo) {
  setupNextjsRepo(repo);
  writeState(repo, loadTemplateState());
  writeText(
    path.join(repo, 'src', 'features', 'customers', 'components', 'client', 'avatar-editor.client.tsx'),
    "'use client';\n\nimport sharp from 'sharp';\n\nexport function AvatarEditor() {\n  return <div>{String(Boolean(sharp))}</div>;\n}\n",
  );
  const result = runNextjsHook('post-edit-checks', repo, {
    cwd: repo,
    toolName: 'edit',
    toolArgs: JSON.stringify({ filePath: 'src/features/customers/components/client/avatar-editor.client.tsx' }),
  });
  expect(result.decision === 'block', 'expected sharp usage in client files to be blocked');
}

function main() {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'workflow-hook-proof-'));
  const repo = path.join(tempRoot, 'repo');

  try {
    fs.mkdirSync(repo, { recursive: true });
    fs.cpSync(path.join(ROOT, '.github', 'hooks'), path.join(repo, '.github', 'hooks'), { recursive: true });
    writeState(repo, loadTemplateState());

    scenarioSessionContext(repo);
    scenarioBootstrapFreshState(repo);
    scenarioRequiresDiscovery(repo);
    scenarioCliRequiresDiscovery(repo);
    scenarioCliAbsoluteStateEditAllowed(repo);
    scenarioDirectStateEditAfterPlanningIsDenied(repo);
    scenarioRequiresPlan(repo);
    scenarioRetryBudgetBlocksEdits(repo);
    scenarioInvalidStateEditIsRestored(repo);
    scenarioInvalidStateEditWithoutToolUseIdIsRestored(repo);
    scenarioDeliveryActionDenied(repo);
    scenarioCliDeliveryActionDenied(repo);
    scenarioDeliveryActionRequiresUserApproval(repo);
    scenarioReadOnlyCommandAllowedDuringDiscovery(repo);
    scenarioReadOnlyCommandAllowedWithInvalidState(repo);
    scenarioGateCommandAllowedBeforePlan(repo);
    scenarioRepositoryValidatorCommandAllowedDuringDiscovery(repo);
    scenarioPassiveTerminalToolAllowedDuringDiscovery(repo);
    scenarioStopGateBlocksIncompleteWork(repo);
    scenarioCliStopGateBlocksIncompleteWork(repo);
    scenarioStopGateAllowsCompletedImplementation(repo);
    scenarioCliStopGateAllowsCompletedImplementation(repo);
    scenarioShellStateWriteDenied(repo);
    scenarioCliShellStateWriteDenied(repo);
    scenarioNodeScriptStateWriteDenied(repo);
    scenarioCliNodeScriptStateWriteDenied(repo);
    scenarioUpdateStateApi(repo);
    scenarioUpdateStateCliArgs(repo);
    scenarioValidateStateCliWithoutInput(repo);
    scenarioPlanningRollsBackToDiscovery(repo);
    scenarioQualityGateFailureRollsBackToImplementation(repo);
    scenarioVerificationBugRollsBackToImplementation(repo);
    scenarioPostEditInvalidatesDownstreamGates(repo);
    scenarioExternalPathsIgnoredDuringPostEdit(repo);
    scenarioEndToEndWorkflow(repo);
    scenarioNextjsSessionContext(repo);
    scenarioNextjsGreenfieldPagesDenied(repo);
    scenarioNextjsTechnicalRouteGroupDenied(repo);
    scenarioNextjsParallelRouteRequiresPlan(repo);
    scenarioNextjsApprovedParallelRoutePasses(repo);
    scenarioNextjsParallelSlotNeedsDefault(repo);
    scenarioNextjsVisibleRouteNeedsLocaleBoundary(repo);
    scenarioNextjsRouteShellLowLevelImportBlocked(repo);
    scenarioNextjsPageClientBoundaryBlocked(repo);
    scenarioNextjsClientBoundaryLeakBlocked(repo);
    scenarioNextjsRouteRegistryLeaksInternalSyntax(repo);
    scenarioNextjsFeatureUtilityBucketBlocked(repo);
    scenarioNextjsPascalCaseFeatureFileBlocked(repo);
    scenarioNextjsRouteSegmentCaseBlocked(repo);
    scenarioNextjsNamedActionFilePasses(repo);
    scenarioNextjsHardcodedUiTextBlocked(repo);
    scenarioNextjsTranslatedUiTextPasses(repo);
    scenarioNextjsApprovedClientBoundaryPasses(repo);
    scenarioNextjsEnvLibraryOutsideEnvModuleBlocked(repo);
    scenarioNextjsEnvModulePasses(repo);
    scenarioNextjsPinoOutsideLoggerBlocked(repo);
    scenarioNextjsSharedLoggerPasses(repo);
    scenarioNextjsSwrOutsideClientBlocked(repo);
    scenarioNextjsSwrClientLeafPasses(repo);
    scenarioNextjsXStateOutsideMachineBlocked(repo);
    scenarioNextjsMachinePolicyPasses(repo);
    scenarioNextjsReactIconsRootImportBlocked(repo);
    scenarioNextjsSharpClientBlocked(repo);

    process.stdout.write('WORKFLOW_HOOK_PROOF_OK\n');
    return 0;
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
}

if (require.main === module) {
  process.exit(main());
}
