#!/usr/bin/env node
'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const SCHEMA_VERSION = '1.0';
const MAX_RETRY_COUNT = 3;
const PHASE_ORDER = ['discovery', 'planning', 'implementation', 'quality-gates', 'verification', 'delivery'];
const REQUIREMENTS_STATUSES = new Set(['needs-clarification', 'clarified', 'approved']);
const PLAN_STATUSES = new Set(['not-started', 'proposed', 'approved', 'blocked']);
const IMPLEMENTATION_STATUSES = new Set(['not-started', 'in-progress', 'completed', 'blocked']);
const GATE_STATUSES = new Set(['pending', 'passed', 'failed', 'not-applicable']);
const DELIVERY_STATUSES = new Set(['blocked', 'ready-for-review', 'approved']);
const GREEN_GATE_VALUES = new Set(['passed', 'not-applicable']);
const STATE_FILE = '.claude/workflow-state.json';
const DELIVERY_ACTION_PATTERNS = [/\bgit\s+commit\b/, /\bgit\s+push\b/, /\bgh\s+pr\b/, /\brelease\b/];
const STATE_API_COMMAND_PATTERNS = [
  /workflow_hook\.(?:js|cjs)\s+update-state\b/,
  /workflow_hook\.(?:js|cjs)\s+validate-state\b/,
  /workflow_bootstrap\.(?:js|cjs)\b/,
  /vibe-workflow(?:\.cjs)?\b.*\bbootstrap\b/,
];
const READ_ONLY_COMMAND_PATTERNS = [
  /\b(ls|pwd|find|which|cat|head|tail|sed|awk|rg|ripgrep|grep)\b/,
  /\bgit\s+(status|diff|log|show)\b/,
  /\b(node|npm|pnpm|yarn|bun)\b.*\b(test|lint|typecheck|check|validate|proof)\b/,
  /\b(tsc|eslint|biome|ruff|pytest|vitest|jest|mocha|ava|rspec)\b/,
  /\bgo\s+test\b/,
  /\bcargo\s+test\b/,
  /\bmvn\s+test\b/,
  /\bgradle\s+test\b/,
  /validate_repo\.(?:js|cjs)\b/,
  /workflow_hook_proof\.(?:js|cjs)\b/,
  /workflow_doctor\.(?:js|cjs)\b/,
  /workflow_audit_structure\.(?:js|cjs)\b/,
  /workflow_adopt_report\.(?:js|cjs)\b/,
  /workflow_sync_skills\.(?:js|cjs)\b.*--check\b/,
  /vibe-workflow(?:\.cjs)?\b.*\b(validate|validate-state|validate-repo|doctor|proof|audit-structure|adopt-report)\b/,
  /vibe-workflow(?:\.cjs)?\b.*\bsync-skills\b.*--check\b/,
];

const DEFAULT_STATE = {
  version: SCHEMA_VERSION,
  phase: 'discovery',
  taskId: '',
  taskSummary: '',
  requirements: {
    status: 'needs-clarification',
    acceptanceCriteria: [],
    constraints: [],
    openQuestions: [],
  },
  plan: {
    status: 'not-started',
    summary: '',
    filesInScope: [],
  },
  implementation: {
    status: 'not-started',
    filesTouched: [],
    retryCount: 0,
    blockedItems: [],
  },
  qualityGates: {
    typecheck: 'pending',
    lint: 'pending',
    tests: 'pending',
    verification: 'pending',
    lastRunSummary: '',
  },
  delivery: {
    status: 'blocked',
    userApproved: false,
    notes: '',
  },
  lastUpdated: '',
};

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function deepCopyDefaultState() {
  return structuredClone(DEFAULT_STATE);
}

function utcTimestamp() {
  return new Date().toISOString().replace(/\.\d{3}Z$/, '+00:00');
}

function loadEvent() {
  if (process.stdin.isTTY) {
    return {};
  }
  const raw = fs.readFileSync(0, 'utf8').trim();
  if (!raw) {
    return {};
  }
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function parseStructuredValue(value) {
  if (typeof value !== 'string') {
    return value;
  }
  const trimmed = value.trim();
  if (!trimmed) {
    return {};
  }
  try {
    return JSON.parse(trimmed);
  } catch {
    return value;
  }
}

function isHelpFlag(value) {
  return value === '--help' || value === '-h';
}

function assignNestedValue(target, dottedPath, value) {
  const parts = dottedPath.split('.').filter(Boolean);
  if (parts.length === 0) {
    return;
  }

  let cursor = target;
  for (const segment of parts.slice(0, -1)) {
    if (!isPlainObject(cursor[segment])) {
      cursor[segment] = {};
    }
    cursor = cursor[segment];
  }
  cursor[parts[parts.length - 1]] = value;
}

function parseCliPatchArgs(args) {
  const patch = {};
  const errors = [];

  for (const arg of args) {
    if (!arg) {
      continue;
    }
    const separatorIndex = arg.indexOf('=');
    if (separatorIndex <= 0) {
      errors.push(`Invalid update-state argument "${arg}". Expected key=value.`);
      continue;
    }

    const keyPath = arg.slice(0, separatorIndex).trim();
    const rawValue = arg.slice(separatorIndex + 1);
    if (!keyPath) {
      errors.push(`Invalid update-state argument "${arg}". Key path cannot be empty.`);
      continue;
    }

    assignNestedValue(patch, keyPath, parseStructuredValue(rawValue));
  }

  return [patch, errors];
}

function buildUpdateStatePatch(rawEvent, cliArgs) {
  if (isPlainObject(rawEvent) && Object.keys(rawEvent).length > 0) {
    return [rawEvent, []];
  }
  if (cliArgs.length === 0) {
    return [{}, []];
  }
  return parseCliPatchArgs(cliArgs);
}

function updateStateUsageText() {
  return [
    'Usage:',
    "  printf '%s' '{\"phase\":\"planning\",\"requirements\":{\"status\":\"approved\"}}' | node .claude/hooks/scripts/workflow_hook.cjs update-state",
    '  node .claude/hooks/scripts/workflow_hook.cjs update-state phase=implementation implementation.status=in-progress',
    '',
    'Notes:',
    '- Use dotted paths for nested fields such as requirements.status or qualityGates.tests.',
    '- Values are parsed as JSON when possible, so true, false, numbers, arrays, and objects are supported.',
  ].join('\n');
}

function detectHookHost(event) {
  if (!isPlainObject(event)) {
    return 'generic';
  }
  if ('tool_name' in event || 'tool_input' in event || 'tool_use_id' in event || 'stop_hook_active' in event) {
    return 'vscode';
  }
  if ('toolName' in event || 'toolArgs' in event || 'toolUseId' in event || 'stopHookActive' in event) {
    return 'cli';
  }
  return 'generic';
}

function normalizeEvent(mode, rawEvent) {
  const host = detectHookHost(rawEvent);
  const toolInput =
    rawEvent?.tool_input ??
    parseStructuredValue(rawEvent?.toolArgs ?? rawEvent?.tool_args) ??
    {};

  return {
    host,
    mode,
    rawEvent,
    cwd: rawEvent?.cwd ?? '.',
    toolName: lower(rawEvent?.tool_name ?? rawEvent?.toolName),
    toolInput,
    toolUseId: rawEvent?.tool_use_id ?? rawEvent?.toolUseId ?? '',
    stopHookActive: Boolean(rawEvent?.stop_hook_active ?? rawEvent?.stopHookActive),
  };
}

function workflowStatePath(cwd) {
  return path.join(cwd, '.claude', 'workflow-state.json');
}

function runtimeDir(cwd) {
  const workspaceHash = crypto.createHash('sha1').update(path.resolve(cwd)).digest('hex').slice(0, 12);
  const dirPath = path.join(os.tmpdir(), 'claude-workflow-hooks', workspaceHash);
  fs.mkdirSync(dirPath, { recursive: true });
  return dirPath;
}

function baselinePath(cwd, toolUseId) {
  return path.join(runtimeDir(cwd), `${baselineKey(toolUseId)}.baseline.json`);
}

function baselineKey(toolUseId) {
  return toolUseId || 'anonymous';
}

function logPath(cwd) {
  return path.join(cwd, '.claude', 'hooks', 'workflow-hook.log');
}

function sortKeys(value) {
  if (Array.isArray(value)) {
    return value.map(sortKeys);
  }
  if (isPlainObject(value)) {
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((key) => [key, sortKeys(value[key])]),
    );
  }
  return value;
}

function logEvent(cwd, level, message, extra = {}) {
  try {
    const filePath = logPath(cwd);
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    const record = sortKeys({ timestamp: utcTimestamp(), level, message, ...extra });
    fs.appendFileSync(filePath, `${JSON.stringify(record)}\n`, 'utf8');
  } catch {
    // Ignore log-write failures.
  }
}

function lower(value) {
  return String(value || '').toLowerCase();
}

function phaseIndex(phase) {
  return PHASE_ORDER.indexOf(phase);
}

/**
 * Merge workflow state objects with one level of depth for known sections.
 *
 * Top-level scalar fields use Object.assign (last-writer-wins). Known nested
 * sections (requirements, plan, implementation, qualityGates, delivery) are
 * shallow-merged: incoming keys overwrite base keys, but unmentioned keys
 * within a section fall back to defaults — they are NOT preserved from base.
 *
 * For deep merging that preserves unmentioned nested keys, use deepMerge()
 * before calling this function (as updateStateMode does for the CLI path).
 */
function mergeKnownSections(base, incoming) {
  const merged = deepCopyDefaultState();
  Object.assign(merged, base, incoming);
  const defaults = deepCopyDefaultState();
  for (const key of ['requirements', 'plan', 'implementation', 'qualityGates', 'delivery']) {
    merged[key] = {
      ...defaults[key],
      ...(base[key] || {}),
      ...(incoming[key] || {}),
    };
  }
  return merged;
}

function readStateStrict(cwd) {
  const filePath = workflowStatePath(cwd);
  if (!fs.existsSync(filePath)) {
    return [deepCopyDefaultState(), []];
  }

  let rawState;
  try {
    rawState = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (error) {
    if (error instanceof SyntaxError) {
      return [null, [`workflow state is not valid JSON: ${error.message}`]];
    }
    return [null, [`workflow state could not be read: ${error.message}`]];
  }

  if (!isPlainObject(rawState)) {
    return [null, ['workflow state must be a JSON object']];
  }

  return [mergeKnownSections({}, rawState), []];
}

function loadState(cwd) {
  const [state, errors] = readStateStrict(cwd);
  if (errors.length > 0) {
    logEvent(cwd, 'warning', 'Loaded fallback state after read error', { errors });
    return deepCopyDefaultState();
  }
  return state || deepCopyDefaultState();
}

function deepMerge(base, patch) {
  if (isPlainObject(base) && isPlainObject(patch)) {
    const merged = structuredClone(base);
    for (const [key, value] of Object.entries(patch)) {
      merged[key] = deepMerge(merged[key], value);
    }
    return merged;
  }
  return structuredClone(patch);
}

function validateStringList(value, fieldName) {
  if (!Array.isArray(value) || value.some((item) => typeof item !== 'string')) {
    return [`${fieldName} must be a list of strings`];
  }
  return [];
}

function validateState(state) {
  const errors = [];

  if (state.version !== SCHEMA_VERSION) {
    errors.push(`version must be ${SCHEMA_VERSION}`);
  }

  const phase = lower(state.phase);
  if (!PHASE_ORDER.includes(phase)) {
    errors.push(`phase must be one of ${PHASE_ORDER.join(', ')}`);
  }

  if (typeof state.taskId !== 'string') {
    errors.push('taskId must be a string');
  }
  if (typeof state.taskSummary !== 'string') {
    errors.push('taskSummary must be a string');
  }

  const requirements = state.requirements;
  if (!isPlainObject(requirements)) {
    errors.push('requirements must be an object');
  } else {
    if (!REQUIREMENTS_STATUSES.has(lower(requirements.status))) {
      errors.push('requirements.status is invalid');
    }
    errors.push(...validateStringList(requirements.acceptanceCriteria, 'requirements.acceptanceCriteria'));
    errors.push(...validateStringList(requirements.constraints, 'requirements.constraints'));
    errors.push(...validateStringList(requirements.openQuestions, 'requirements.openQuestions'));
  }

  const plan = state.plan;
  if (!isPlainObject(plan)) {
    errors.push('plan must be an object');
  } else {
    if (!PLAN_STATUSES.has(lower(plan.status))) {
      errors.push('plan.status is invalid');
    }
    if (typeof plan.summary !== 'string') {
      errors.push('plan.summary must be a string');
    }
    errors.push(...validateStringList(plan.filesInScope, 'plan.filesInScope'));
  }

  const implementation = state.implementation;
  if (!isPlainObject(implementation)) {
    errors.push('implementation must be an object');
  } else {
    if (!IMPLEMENTATION_STATUSES.has(lower(implementation.status))) {
      errors.push('implementation.status is invalid');
    }
    errors.push(...validateStringList(implementation.filesTouched, 'implementation.filesTouched'));
    errors.push(...validateStringList(implementation.blockedItems, 'implementation.blockedItems'));
    const retryCount = implementation.retryCount;
    if (!Number.isInteger(retryCount) || retryCount < 0) {
      errors.push('implementation.retryCount must be a non-negative integer');
    }
  }

  const quality = state.qualityGates;
  if (!isPlainObject(quality)) {
    errors.push('qualityGates must be an object');
  } else {
    for (const gate of ['typecheck', 'lint', 'tests', 'verification']) {
      if (!GATE_STATUSES.has(lower(quality[gate]))) {
        errors.push(`qualityGates.${gate} is invalid`);
      }
    }
    if (typeof quality.lastRunSummary !== 'string') {
      errors.push('qualityGates.lastRunSummary must be a string');
    }
  }

  const delivery = state.delivery;
  if (!isPlainObject(delivery)) {
    errors.push('delivery must be an object');
  } else {
    if (!DELIVERY_STATUSES.has(lower(delivery.status))) {
      errors.push('delivery.status is invalid');
    }
    if (typeof delivery.userApproved !== 'boolean') {
      errors.push('delivery.userApproved must be a boolean');
    }
    if (typeof delivery.notes !== 'string') {
      errors.push('delivery.notes must be a string');
    }
  }

  if (typeof state.lastUpdated !== 'string') {
    errors.push('lastUpdated must be a string');
  }

  return errors;
}

function allGatesGreen(state) {
  const quality = state.qualityGates || {};
  return ['typecheck', 'lint', 'tests', 'verification'].every((gate) => GREEN_GATE_VALUES.has(lower(quality[gate])));
}

function formatGateSummary(state) {
  const quality = state.qualityGates || {};
  return ['typecheck', 'lint', 'tests', 'verification']
    .map((gate) => `${gate}=${quality[gate] || 'pending'}`)
    .join(', ');
}

function validateStateTransition(oldState, newState) {
  const errors = [];

  const oldPhase = lower(oldState.phase);
  const newPhase = lower(newState.phase);
  const oldIndex = phaseIndex(oldPhase);
  const newIndex = phaseIndex(newPhase);

  // Forward skips (e.g. discovery → implementation) are blocked to enforce the
  // sequential phase contract. Backward jumps of any distance are intentionally
  // allowed — the CLAUDE.md recovery model requires "roll back to the earliest
  // required phase" (e.g. delivery → discovery) without intermediate stops.
  if (oldIndex >= 0 && newIndex >= 0 && newIndex - oldIndex > 1) {
    errors.push(`phase transition cannot skip forward from ${oldPhase} to ${newPhase}`);
  }

  if (newIndex >= phaseIndex('planning')) {
    const requirementsStatus = lower(newState.requirements?.status);
    if (!['clarified', 'approved'].includes(requirementsStatus)) {
      errors.push('planning or later requires clarified requirements');
    }
  }

  if (newIndex >= phaseIndex('implementation')) {
    const planStatus = lower(newState.plan?.status);
    if (planStatus !== 'approved') {
      errors.push('implementation or later requires plan.status = approved');
    }
  }

  if (newIndex >= phaseIndex('delivery') && !allGatesGreen(newState)) {
    errors.push('delivery requires all quality gates and verification to be green');
  }

  const deliveryStatus = lower(newState.delivery?.status);
  if (deliveryStatus === 'approved' && !newState.delivery?.userApproved) {
    errors.push('delivery.status = approved requires delivery.userApproved = true');
  }

  const retryCount = newState.implementation?.retryCount ?? 0;
  const blockedItems = newState.implementation?.blockedItems ?? [];
  const implementationStatus = lower(newState.implementation?.status);
  if (retryCount >= MAX_RETRY_COUNT && !allGatesGreen(newState)) {
    if (implementationStatus !== 'blocked') {
      errors.push('retry budget exhaustion requires implementation.status = blocked until the item is resolved');
    }
    if (!blockedItems.length) {
      errors.push('retry budget exhaustion requires implementation.blockedItems to record the blocker');
    }
  }

  return errors;
}

function saveState(cwd, state) {
  const mergedState = mergeKnownSections(deepCopyDefaultState(), state);
  mergedState.lastUpdated = utcTimestamp();

  const validationErrors = validateState(mergedState);
  if (validationErrors.length > 0) {
    return [null, validationErrors];
  }

  const filePath = workflowStatePath(cwd);
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  const tempPath = filePath.replace(/\.json$/, '.json.tmp');

  try {
    fs.writeFileSync(tempPath, `${JSON.stringify(mergedState, null, 2)}\n`, 'utf8');
    fs.renameSync(tempPath, filePath);
  } catch (error) {
    return [null, [`failed to write workflow state: ${error.message}`]];
  }

  logEvent(cwd, 'info', 'Workflow state saved', { phase: mergedState.phase });
  return [mergedState, []];
}

function persistStateBaseline(cwd, toolUseId, state) {
  const filePath = baselinePath(cwd, toolUseId);
  try {
    fs.writeFileSync(filePath, `${JSON.stringify(state, null, 2)}\n`, 'utf8');
  } catch (error) {
    logEvent(cwd, 'warning', 'Failed to persist workflow baseline', {
      tool_use_id: toolUseId,
      error: error.message,
    });
  }
}

function loadStateBaseline(cwd, toolUseId) {
  const filePath = baselinePath(cwd, toolUseId);
  if (!fs.existsSync(filePath)) {
    return null;
  }
  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    if (isPlainObject(data)) {
      return mergeKnownSections({}, data);
    }
  } catch {
    return null;
  }
  return null;
}

function removeStateBaseline(cwd, toolUseId) {
  try {
    fs.rmSync(baselinePath(cwd, toolUseId), { force: true });
  } catch {
    // Ignore cleanup failures.
  }
}

function emit(payload) {
  process.stdout.write(`${JSON.stringify(payload)}\n`);
  return 0;
}

function emitHookPayload(hookEventName, response = {}) {
  const payload = {};

  if ('continue' in response) {
    payload.continue = response.continue;
  }
  if ('decision' in response) {
    payload.decision = response.decision;
  }
  if ('reason' in response) {
    payload.reason = response.reason;
  }
  if ('permissionDecision' in response) {
    payload.permissionDecision = response.permissionDecision;
  }
  if ('permissionDecisionReason' in response) {
    payload.permissionDecisionReason = response.permissionDecisionReason;
  }
  if ('additionalContext' in response && response.additionalContext) {
    payload.additionalContext = response.additionalContext;
  }

  if (hookEventName) {
    payload.hookSpecificOutput = { hookEventName };
    if ('permissionDecision' in response) {
      payload.hookSpecificOutput.permissionDecision = response.permissionDecision;
    }
    if ('permissionDecisionReason' in response && response.permissionDecisionReason) {
      payload.hookSpecificOutput.permissionDecisionReason = response.permissionDecisionReason;
    }
    if ('additionalContext' in response && response.additionalContext) {
      payload.hookSpecificOutput.additionalContext = response.additionalContext;
    }
  }

  return emit(payload);
}

function emitContinue(hookEventName, additionalContext = '') {
  return emitHookPayload(hookEventName, {
    continue: true,
    additionalContext,
  });
}

function emitPreToolDecision(decision, permissionDecisionReason = '', additionalContext = '') {
  const response = {
    permissionDecision: decision,
    additionalContext,
  };
  if (permissionDecisionReason) {
    response.permissionDecisionReason = permissionDecisionReason;
  }
  if (decision === 'allow') {
    response.continue = true;
  }
  return emitHookPayload('PreToolUse', response);
}

function emitPostToolBlock(reason, additionalContext = '') {
  return emitHookPayload('PostToolUse', {
    decision: 'block',
    reason,
    additionalContext,
  });
}

function emitPostToolMessage(additionalContext = '') {
  return emitHookPayload('PostToolUse', { additionalContext });
}

function emitSessionContext(additionalContext = '') {
  return emitHookPayload('SessionStart', { additionalContext });
}

function emitStopDecision(decision, reason = '') {
  return emitHookPayload('Stop', {
    continue: decision === 'allow',
    decision,
    reason,
  });
}

function implementationStopSatisfied(state) {
  const phase = lower(state.phase || 'discovery');
  const implementationStatus = lower(state.implementation?.status || '');
  if (phase !== 'implementation') {
    return false;
  }
  return implementationStatus === 'completed' || implementationStatus === 'blocked';
}

function isEditTool(toolName) {
  return ['edit', 'create', 'write', 'rename', 'move', 'delete'].some((token) => toolName.includes(token));
}

// NOTE: 'agent' is included so the Agent/subagent tool is subject to the
// workflow guard (e.g. blocking implementation edits before plan approval).
// However, subagents run in their own context and may not load the same hooks,
// so edits made *inside* a subagent may bypass PostToolUse file tracking and
// gate invalidation. This is a Claude Code platform limitation — not fixable
// at the hook level. Mitigation: re-run quality gates after any agent-assisted
// implementation phase to catch untracked changes.
function isCommandTool(toolName) {
  return ['terminal', 'command', 'bash', 'powershell', 'shell', 'run', 'task', 'agent', 'execute', 'exec'].some((token) =>
    toolName.includes(token),
  );
}

function isPassiveTerminalTool(toolName) {
  return ['await', 'output', 'lastcommand', 'selection'].some((token) => toolName.includes(token));
}

function extractCommandText(toolInput) {
  if (typeof toolInput === 'string') {
    return toolInput.toLowerCase();
  }
  if (Array.isArray(toolInput)) {
    return toolInput.flatMap((entry) => collectStrings(entry)).join(' ').toLowerCase();
  }
  if (isPlainObject(toolInput)) {
    const items = [];
    for (const key of ['command', 'commands', 'args', 'arguments']) {
      if (key in toolInput) {
        items.push(...collectStrings(toolInput[key]));
      }
    }
    return items.join(' ').toLowerCase();
  }
  return '';
}

function commandReferencesStateFile(commandText) {
  if (typeof commandText !== 'string') {
    return false;
  }
  return /(^|[\s"'`])(?:\.\/)?\.claude\/workflow-state\.json\b/.test(commandText);
}

function matchesAnyPattern(value, patterns) {
  return patterns.some((pattern) => pattern.test(value));
}

function isDeliveryActionCommand(commandText) {
  return matchesAnyPattern(commandText, DELIVERY_ACTION_PATTERNS);
}

function isStateApiCommand(commandText) {
  return matchesAnyPattern(commandText, STATE_API_COMMAND_PATTERNS);
}

function hasShellWriteOperator(commandText) {
  if (typeof commandText !== 'string') {
    return false;
  }
  return /\s>>?\s|\btee\b|\bsed\s+-i\b|\bperl\s+-i\b|<<\s*['"]?[a-z0-9_-]+/i.test(commandText);
}

function isReadOnlyCommand(commandText) {
  if (hasShellWriteOperator(commandText)) {
    return false;
  }
  return matchesAnyPattern(commandText, READ_ONLY_COMMAND_PATTERNS) || isStateApiCommand(commandText);
}

function collectStrings(value) {
  if (typeof value === 'string') {
    return [value];
  }
  if (Array.isArray(value)) {
    return value.flatMap((entry) => collectStrings(entry));
  }
  if (isPlainObject(value)) {
    const items = [];
    for (const key of ['path', 'file', 'filePath', 'file_path', 'source', 'destination', 'target', 'files', 'paths', 'command', 'commands']) {
      if (key in value) {
        items.push(...collectStrings(value[key]));
      }
    }
    return items;
  }
  return [];
}

function collectPathStrings(value) {
  if (typeof value === 'string') {
    return [value];
  }
  if (Array.isArray(value)) {
    return value.flatMap((entry) => collectPathStrings(entry));
  }
  if (isPlainObject(value)) {
    const items = [];
    for (const key of ['path', 'file', 'filePath', 'file_path', 'source', 'destination', 'target', 'files', 'paths']) {
      if (key in value) {
        items.push(...collectPathStrings(value[key]));
      }
    }
    return items;
  }
  return [];
}

function normalizePath(value) {
  const normalized = path.posix.normalize(value.replace(/\\/g, '/'));
  if (normalized.startsWith('./')) {
    return normalized.slice(2);
  }
  return normalized;
}

function toRepoRelativePath(cwd, value) {
  if (typeof value !== 'string') {
    return null;
  }
  const trimmed = value.trim();
  if (!trimmed || /^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed)) {
    return null;
  }

  const repoRoot = path.resolve(cwd);
  const absolutePath = path.resolve(repoRoot, trimmed);
  const relativePath = path.relative(repoRoot, absolutePath).replace(/\\/g, '/');

  if (!relativePath || relativePath === '.' || relativePath.startsWith('../') || relativePath === '..') {
    return null;
  }

  return normalizePath(relativePath);
}

function extractPaths(cwd, toolInput) {
  return uniqueStrings(
    collectPathStrings(toolInput)
      .map((entry) => toRepoRelativePath(cwd, entry))
      .filter(Boolean),
  );
}

function isGovernancePath(filePath) {
  return filePath === 'CLAUDE.md' || filePath.startsWith('.claude/');
}

function isStatePath(filePath) {
  return filePath === STATE_FILE;
}

function onlyGovernancePaths(paths) {
  return paths.length > 0 && paths.every((filePath) => isGovernancePath(filePath));
}

function uniqueStrings(values) {
  return Array.from(new Set(values.filter(Boolean))).sort();
}

function statesEqual(left, right) {
  return JSON.stringify(sortKeys(left)) === JSON.stringify(sortKeys(right));
}

function invalidateGateStatus(status) {
  return lower(status) === 'not-applicable' ? 'not-applicable' : 'pending';
}

function deriveStateAfterImplementationEdit(state, filePaths) {
  const nextState = mergeKnownSections({}, state);
  nextState.implementation.filesTouched = uniqueStrings([...(state.implementation?.filesTouched || []), ...filePaths]);

  const currentPhase = lower(state.phase);
  const planApproved = lower(state.plan?.status) === 'approved';
  const shouldInvalidateDownstream = planApproved && phaseIndex(currentPhase) >= phaseIndex('planning');

  if (!shouldInvalidateDownstream) {
    return nextState;
  }

  nextState.phase = 'implementation';
  nextState.implementation.status = 'in-progress';
  nextState.qualityGates = {
    ...nextState.qualityGates,
    typecheck: invalidateGateStatus(nextState.qualityGates.typecheck),
    lint: invalidateGateStatus(nextState.qualityGates.lint),
    tests: invalidateGateStatus(nextState.qualityGates.tests),
    verification: invalidateGateStatus(nextState.qualityGates.verification),
    lastRunSummary: 'Implementation changed after prior validation. Rerun quality gates and verification.',
  };
  nextState.delivery = {
    ...nextState.delivery,
    status: 'blocked',
    userApproved: false,
    notes: 'Implementation changed after prior validation. Rerun quality gates and verification before delivery.',
  };

  return nextState;
}

function syncStateAfterImplementationEdit(cwd, state, filePaths) {
  const proposedState = deriveStateAfterImplementationEdit(state, filePaths);

  if (statesEqual(state, proposedState)) {
    return { state, changed: false, message: '', errors: [] };
  }

  const transitionErrors = validateStateTransition(state, proposedState);
  if (transitionErrors.length > 0) {
    return { state, changed: false, message: '', errors: transitionErrors };
  }

  const [savedState, saveErrors] = saveState(cwd, proposedState);
  if (saveErrors.length > 0) {
    return { state, changed: false, message: '', errors: saveErrors };
  }

  const downstreamChanged =
    formatGateSummary(savedState) !== formatGateSummary(state) ||
    lower(savedState.phase) !== lower(state.phase) ||
    lower(savedState.delivery?.status) !== lower(state.delivery?.status);
  const message = downstreamChanged
    ? 'Workflow state was updated automatically with touched implementation files and downstream gate invalidation.'
    : 'Workflow state was updated automatically with touched implementation files.';

  return { state: savedState, changed: true, message, errors: [] };
}

function stateEditContext(cwd, toolUseId, state) {
  persistStateBaseline(cwd, toolUseId, state);
}

function sessionContext(event) {
  const cwd = event.cwd;
  const stateFileExists = fs.existsSync(workflowStatePath(cwd));
  const [state, errors] = readStateStrict(cwd);
  const activeState = state || deepCopyDefaultState();
  const phase = activeState.phase || 'discovery';
  const requirementsStatus = activeState.requirements?.status || 'needs-clarification';
  const planStatus = activeState.plan?.status || 'not-started';
  let message =
    'Workflow state loaded: ' +
    `phase=${phase}, requirements=${requirementsStatus}, plan=${planStatus}, ` +
    `gates=(${formatGateSummary(activeState)}). ` +
    'Follow Discovery -> Planning -> Implementation -> Quality Gates -> Verification -> Delivery. ' +
    'Use exact enums: requirements.status=needs-clarification|clarified|approved; ' +
    'plan.status=not-started|proposed|approved|blocked.';

  if (!stateFileExists || (phase === 'discovery' && !activeState.taskId && !activeState.taskSummary)) {
    message +=
      ' Fresh bootstrap state detected. Start with the /discover command, then persist task details through the workflow state API.';
  }

  if (errors.length > 0) {
    message += ` State file needs repair before risky actions: ${errors.join('; ')}.`;
    logEvent(cwd, 'warning', 'Session started with invalid workflow state', { errors });
  }

  return emitSessionContext(message);
}

function workflowGuard(event) {
  const cwd = event.cwd;
  const toolName = event.toolName;
  if (!(isEditTool(toolName) || isCommandTool(toolName))) {
    return emitContinue('PreToolUse');
  }

  const toolInput = event.toolInput ?? {};
  const paths = extractPaths(cwd, toolInput);
  const governanceOnly = onlyGovernancePaths(paths);
  const stateTargeted = paths.some((filePath) => isStatePath(filePath));
  const commandText = extractCommandText(toolInput);
  const passiveCommandTool = isCommandTool(toolName) && isPassiveTerminalTool(toolName);
  const readOnlyCommand = passiveCommandTool || (isCommandTool(toolName) && isReadOnlyCommand(commandText));
  const stateApiCommand = isCommandTool(toolName) && isStateApiCommand(commandText);
  const shellStateWriteAttempt = isCommandTool(toolName) && commandReferencesStateFile(commandText) && !readOnlyCommand && !stateApiCommand;
  const riskyCommand = isCommandTool(toolName) && !readOnlyCommand && !stateApiCommand;
  const deliveryActionCommand = isCommandTool(toolName) && isDeliveryActionCommand(commandText);
  const [state, stateErrors] = readStateStrict(cwd);
  const activeState = state || deepCopyDefaultState();
  const currentPhase = lower(activeState.phase);

  if (stateErrors.length > 0 && !stateTargeted && !readOnlyCommand && !stateApiCommand) {
    logEvent(cwd, 'warning', 'Blocked risky tool use because workflow state is invalid', {
      tool: toolName,
      errors: stateErrors,
    });
    return emitPreToolDecision(
      'ask',
      'Workflow state is invalid. Repair .claude/workflow-state.json before risky actions.',
      stateErrors.join('; '),
    );
  }

  if (stateTargeted && isEditTool(toolName)) {
    if (phaseIndex(currentPhase) >= phaseIndex('implementation')) {
      logEvent(cwd, 'info', 'Denied direct state edit after planning', {
        tool: toolName,
        phase: currentPhase,
      });
      return emitPreToolDecision(
        'deny',
        'After Planning, update workflow-state.json through the workflow state API instead of direct file edits.',
        "Use `printf '%s' '{...}' | node .claude/hooks/scripts/workflow_hook.cjs update-state` or `node .claude/hooks/scripts/workflow_hook.cjs update-state phase=implementation implementation.status=in-progress` so validation and transition rules stay consistent.",
      );
    }

    stateEditContext(cwd, event.toolUseId || '', activeState);
    logEvent(cwd, 'info', 'State file edit allowed with baseline capture', {
      tool: toolName,
      tool_use_id: event.toolUseId,
    });
    return emitPreToolDecision(
      'allow',
      '',
      'State file edits are allowed, but the result will be validated against the schema and transition rules after the write completes.',
    );
  }

  if (shellStateWriteAttempt) {
    logEvent(cwd, 'info', 'Denied shell-based workflow state write', {
      tool: toolName,
      phase: currentPhase,
      command: commandText,
    });
    return emitPreToolDecision(
      'deny',
      'Direct shell writes to .claude/workflow-state.json are blocked. Use the workflow state API instead.',
      "Use `printf '%s' '{...}' | node .claude/hooks/scripts/workflow_hook.cjs update-state` or `node .claude/hooks/scripts/workflow_hook.cjs update-state phase=implementation implementation.status=in-progress`.",
    );
  }

  const requirementsStatus = lower(activeState.requirements?.status);
  const planStatus = lower(activeState.plan?.status);
  const retryCount = activeState.implementation?.retryCount ?? 0;

  if (retryCount >= MAX_RETRY_COUNT && (isEditTool(toolName) || riskyCommand) && !governanceOnly) {
    logEvent(cwd, 'warning', 'Denied edit because retry budget is exhausted', {
      tool: toolName,
      retryCount,
    });
    return emitPreToolDecision(
      'deny',
      `Retry budget exhausted (${retryCount}/${MAX_RETRY_COUNT}). Mark the work item as blocked instead of continuing to edit.`,
      'Record the blocker in implementation.blockedItems and route the task back through recovery or user escalation.',
    );
  }

  if (deliveryActionCommand && (!allGatesGreen(activeState) || activeState.delivery?.userApproved !== true)) {
    logEvent(cwd, 'warning', 'Denied delivery action because delivery is not user-approved', {
      tool: toolName,
      gates: formatGateSummary(activeState),
      deliveryStatus: activeState.delivery?.status,
      userApproved: activeState.delivery?.userApproved,
    });
    return emitPreToolDecision(
      'deny',
      'Delivery actions are blocked until quality gates are green and the user has approved delivery.',
      `Current gate state: ${formatGateSummary(activeState)}; delivery.status=${activeState.delivery?.status || 'blocked'}; userApproved=${activeState.delivery?.userApproved === true}`,
    );
  }

  if (!governanceOnly && !['clarified', 'approved'].includes(requirementsStatus) && (isEditTool(toolName) || riskyCommand)) {
    logEvent(cwd, 'info', 'Asked for Discovery completion before risky edit', {
      tool: toolName,
      requirements: requirementsStatus,
    });
    return emitPreToolDecision(
      'ask',
      'Requirements are not clarified yet. Finish Discovery before editing implementation surfaces.',
      'Use the discovery workflow and update .claude/workflow-state.json before implementation work.',
    );
  }

  if ((isEditTool(toolName) || riskyCommand) && !governanceOnly && planStatus !== 'approved') {
    logEvent(cwd, 'info', 'Asked for Planning completion before implementation edit', {
      tool: toolName,
      plan: planStatus,
    });
    return emitPreToolDecision(
      'ask',
      'Plan approval is required before non-trivial implementation changes.',
      'Move through Planning first or limit edits to workflow/governance files only.',
    );
  }

  return emitContinue('PreToolUse');
}

function postEditChecks(event) {
  const cwd = event.cwd;
  const toolName = event.toolName;
  if (!isEditTool(toolName)) {
    return emitContinue('PostToolUse');
  }

  const paths = extractPaths(cwd, event.toolInput ?? {});
  const stateTargeted = paths.some((filePath) => isStatePath(filePath));
  const toolUseId = event.toolUseId || '';

  if (stateTargeted) {
    const previousState = loadStateBaseline(cwd, toolUseId);
    const [currentState, errors] = readStateStrict(cwd);
    if (errors.length > 0) {
      if (previousState !== null) {
        saveState(cwd, previousState);
      }
      removeStateBaseline(cwd, toolUseId);
      logEvent(cwd, 'error', 'Blocked invalid workflow state edit', {
        tool: toolName,
        errors,
      });
      return emitPostToolBlock(
        'workflow-state.json became invalid and was restored to the last valid baseline.',
        errors.join('; '),
      );
    }

    const transitionErrors = currentState ? validateState(currentState) : ['workflow state is missing'];
    if (previousState !== null && currentState !== null) {
      transitionErrors.push(...validateStateTransition(previousState, currentState));
    }

    if (transitionErrors.length > 0) {
      if (previousState !== null) {
        saveState(cwd, previousState);
      }
      removeStateBaseline(cwd, toolUseId);
      logEvent(cwd, 'error', 'Blocked invalid workflow state transition', {
        tool: toolName,
        errors: transitionErrors,
      });
      return emitPostToolBlock(
        'workflow-state.json violated the workflow schema or transition rules and was restored.',
        transitionErrors.join('; '),
      );
    }

    removeStateBaseline(cwd, toolUseId);
    logEvent(cwd, 'info', 'Validated workflow state edit', {
      tool: toolName,
      phase: currentState.phase,
    });
    return emitPostToolMessage('workflow-state.json passed schema and transition validation.');
  }

  let state = loadState(cwd);
  const implementationPaths = uniqueStrings(paths.filter((filePath) => !isGovernancePath(filePath)));
  let automaticStateMessage = '';

  if (implementationPaths.length > 0) {
    const syncResult = syncStateAfterImplementationEdit(cwd, state, implementationPaths);
    if (syncResult.errors.length > 0) {
      automaticStateMessage = `Automatic workflow state sync needs manual repair: ${syncResult.errors.join('; ')}.`;
      logEvent(cwd, 'warning', 'Automatic workflow state sync after edit failed', {
        tool: toolName,
        errors: syncResult.errors,
      });
    } else if (syncResult.changed) {
      state = syncResult.state;
      automaticStateMessage = syncResult.message;
      logEvent(cwd, 'info', 'Automatic workflow state sync after edit succeeded', {
        tool: toolName,
        phase: state.phase,
        files: implementationPaths,
      });
    }
  }

  const phase = state.phase || 'discovery';
  const message = [
    automaticStateMessage,
    'Files changed. Update .claude/workflow-state.json with any remaining phase or blocker changes.',
    `Current phase is ${phase}. Before delivery, run the applicable gates and complete verification.`,
  ]
    .filter(Boolean)
    .join(' ');
  logEvent(cwd, 'info', 'Post-edit reminder issued', { tool: toolName, phase });
  return emitPostToolMessage(message);
}

function stopGate(event) {
  const cwd = event.cwd;
  if (event.stopHookActive) {
    return emitStopDecision('allow');
  }

  const state = loadState(cwd);
  const phase = lower(state.phase || 'discovery');
  const implementation = state.implementation || {};
  const touched = implementation.filesTouched || [];
  const retryCount = implementation.retryCount ?? 0;
  const blockedItems = implementation.blockedItems || [];

  // Advisory mode: warn about incomplete work but never block the user from stopping.
  // Claude Code is user-controlled — the user decides when to stop.

  if (retryCount >= MAX_RETRY_COUNT && blockedItems.length === 0) {
    const reason = 'Warning: Retry budget is exhausted, but no blocked item was recorded in workflow state. Consider recording the blocker before ending.';
    logEvent(cwd, 'warning', 'Stop advisory: retry exhaustion not recorded', { retryCount });
    return emitHookPayload('Stop', { continue: true, decision: 'allow', reason, additionalContext: reason });
  }

  if (['implementation', 'quality-gates', 'verification'].includes(phase) || touched.length > 0) {
    if (!allGatesGreen(state)) {
      const reason =
        'Warning: Quality gates or verification are incomplete. ' +
        `Current state: ${formatGateSummary(state)}. ` +
        'The workflow state will persist for the next session.';
      logEvent(cwd, 'info', 'Stop advisory: gates incomplete', {
        gates: formatGateSummary(state),
      });
      return emitHookPayload('Stop', { continue: true, decision: 'allow', reason, additionalContext: reason });
    }
  }

  return emitStopDecision('allow');
}

function updateStateMode(cwd, patch) {
  const currentState = loadState(cwd);
  const proposedState = mergeKnownSections({}, deepMerge(currentState, patch));

  // Clear stale delivery.notes when gates are green and delivery transitions to
  // ready-for-review or approved, unless the caller explicitly set new notes.
  const deliveryStatus = lower(proposedState.delivery?.status);
  const oldDeliveryStatus = lower(currentState.delivery?.status);
  if (
    deliveryStatus !== oldDeliveryStatus &&
    (deliveryStatus === 'ready-for-review' || deliveryStatus === 'approved') &&
    allGatesGreen(proposedState) &&
    !('notes' in (patch.delivery || {}))
  ) {
    proposedState.delivery.notes = '';
  }

  const transitionErrors = validateStateTransition(currentState, proposedState);
  if (transitionErrors.length > 0) {
    logEvent(cwd, 'error', 'Rejected workflow state update', { errors: transitionErrors });
    return emit({ saved: false, errors: transitionErrors });
  }

  const [savedState, saveErrors] = saveState(cwd, proposedState);
  if (saveErrors.length > 0) {
    logEvent(cwd, 'error', 'Failed to save workflow state update', { errors: saveErrors });
    return emit({ saved: false, errors: saveErrors });
  }

  return emit({ saved: true, state: savedState });
}

function validateStateMode(cwd) {
  const [state, readErrors] = readStateStrict(cwd);
  const validationErrors = state !== null ? validateState(state) : [];
  const errors = [...readErrors, ...validationErrors];
  logEvent(cwd, 'info', 'Validated workflow state', { valid: errors.length === 0 });
  return emit({ valid: errors.length === 0, errors, state });
}

function main() {
  const mode = process.argv[2] || '';
  const cliArgs = process.argv.slice(3);
  if (mode === 'update-state' && cliArgs.some(isHelpFlag)) {
    process.stdout.write(`${updateStateUsageText()}\n`);
    return 0;
  }
  const rawEvent = loadEvent();
  const event = normalizeEvent(mode, rawEvent);
  const cwd = event.cwd;

  if (mode === 'session-context') {
    return sessionContext(event);
  }
  if (mode === 'workflow-guard') {
    return workflowGuard(event);
  }
  if (mode === 'post-edit-checks') {
    return postEditChecks(event);
  }
  if (mode === 'stop-gate') {
    return stopGate(event);
  }
  if (mode === 'update-state') {
    const [patch, parseErrors] = buildUpdateStatePatch(rawEvent, cliArgs);
    if (parseErrors.length > 0) {
      return emit({ saved: false, errors: parseErrors });
    }
    return updateStateMode(cwd, patch);
  }
  if (mode === 'validate-state') {
    return validateStateMode(cwd);
  }

  return emitContinue('');
}

module.exports = {
  DEFAULT_STATE,
  SCHEMA_VERSION,
  deepCopyDefaultState,
  deepMerge,
  formatGateSummary,
  loadState,
  main,
  mergeKnownSections,
  readStateStrict,
  saveState,
  updateStateMode,
  validateState,
  validateStateMode,
  validateStateTransition,
};

if (require.main === module) {
  process.exit(main());
}
