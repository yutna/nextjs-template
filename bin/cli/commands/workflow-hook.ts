import { createHash } from "node:crypto";
import {
  appendFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, posix, relative, resolve } from "node:path";

import type {
  DeliveryStatus,
  GateStatus,
  HookDecision,
  HookEventName,
  HookResponse,
  ImplementationStatus,
  NormalizedEvent,
  Phase,
  PlanStatus,
  RawEvent,
  RequirementsStatus,
  SaveStateOptions,
  SyncEditResult,
  ToolInput,
  WorkflowState,
} from "./types/workflow-hook";

// ─── Constants ───────────────────────────────────────────────────────────────

export const SCHEMA_VERSION = "1.0";
const MAX_RETRY_COUNT = 3;
const MAX_APPROVED_BATCH_SIZE = 12;

export const PHASE_ORDER: Phase[] = [
  "discovery",
  "planning",
  "implementation",
  "quality-gates",
  "verification",
  "delivery",
];

const REQUIREMENTS_STATUSES = new Set<RequirementsStatus>([
  "needs-clarification",
  "clarified",
  "approved",
]);
const PLAN_STATUSES = new Set<PlanStatus>([
  "not-started",
  "proposed",
  "approved",
  "blocked",
]);
const IMPLEMENTATION_STATUSES = new Set<ImplementationStatus>([
  "not-started",
  "in-progress",
  "completed",
  "blocked",
]);
const GATE_STATUSES = new Set<GateStatus>([
  "pending",
  "passed",
  "failed",
  "not-applicable",
]);
const DELIVERY_STATUSES = new Set<DeliveryStatus>([
  "blocked",
  "ready-for-review",
  "approved",
]);
const GREEN_GATE_VALUES = new Set<GateStatus>(["passed", "not-applicable"]);

const STATE_FILE = ".claude/workflow-state.json";
const STATE_BACKUP_FILE = ".claude/workflow-state.last-good.json";
const STATE_JOURNAL_FILE = ".claude/workflow-state.journal.jsonl";

const DELIVERY_ACTION_PATTERNS = [
  /\bgit\s+commit\b/,
  /\bgit\s+push\b/,
  /\bgh\s+pr\b/,
  /\brelease\b/,
];

const STATE_API_COMMAND_PATTERNS = [
  /workflow[-_]hook\.(?:js|cjs|ts)\s+update-state\b/,
  /workflow[-_]hook\.(?:js|cjs|ts)\s+validate-state\b/,
  /workflow[-_]bootstrap\.(?:js|cjs|ts)\b/,
  /vibe(?:\.ts)?\b.*\bbootstrap\b/,
  /vibe\s+task\s+workflow:hook\b/,
  /vibe\s+task\s+workflow-bootstrap\b/,
  /vibe\s+workflow-hook\b/,
  /vibe\s+workflow-bootstrap\b/,
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
  /validate_repo\.(?:js|cjs|ts)\b/,
  /workflow_hook_proof\.(?:js|cjs|ts)\b/,
  /workflow[-_]doctor\.(?:js|cjs|ts)\b/,
  /workflow[-_]audit\.(?:js|cjs|ts)\b/,
  /vibe(?:\.ts)?\b.*\b(validate|validate-state|validate-repo|doctor|proof|audit)\b/,
  /vibe\s+task\s+workflow:state:validate\b/,
  /vibe\s+workflow-doctor\b/,
  /vibe\s+workflow-audit\b/,
];

export const DEFAULT_STATE: WorkflowState = {
  delivery: { notes: "", status: "blocked", userApproved: false },
  implementation: {
    blockedItems: [],
    filesTouched: [],
    retryCount: 0,
    status: "not-started",
  },
  lastUpdated: "",
  phase: "discovery",
  plan: { filesInScope: [], status: "not-started", summary: "" },
  qualityGates: {
    lastRunSummary: "",
    lint: "pending",
    tests: "pending",
    typecheck: "pending",
    verification: "pending",
  },
  requirements: {
    acceptanceCriteria: [],
    constraints: [],
    openQuestions: [],
    status: "needs-clarification",
  },
  revision: 0,
  taskId: "",
  taskSummary: "",
  version: SCHEMA_VERSION,
};

// ─── Utilities ────────────────────────────────────────────────────────────────

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

export function deepCopyDefaultState(): WorkflowState {
  return structuredClone(DEFAULT_STATE);
}

function utcTimestamp(): string {
  return new Date().toISOString().replace(/\.\d{3}Z$/, "+00:00");
}

function lower(value: unknown): string {
  return String(value ?? "").toLowerCase();
}

function phaseIndex(phase: string): number {
  return PHASE_ORDER.indexOf(phase as Phase);
}

function sortKeys(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortKeys);
  if (isPlainObject(value)) {
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((key) => [key, sortKeys(value[key])]),
    );
  }
  return value;
}

function uniqueStrings(values: Array<null | string | undefined>): string[] {
  return Array.from(
    new Set(values.filter((v): v is string => Boolean(v))),
  ).sort();
}

function statesEqual(left: WorkflowState, right: WorkflowState): boolean {
  return JSON.stringify(sortKeys(left)) === JSON.stringify(sortKeys(right));
}

// ─── State File Paths ─────────────────────────────────────────────────────────

function workflowStatePath(cwd: string): string {
  return join(cwd, ".claude", "workflow-state.json");
}

function stateBackupPath(cwd: string): string {
  return join(cwd, STATE_BACKUP_FILE);
}

function stateJournalPath(cwd: string): string {
  return join(cwd, STATE_JOURNAL_FILE);
}

function logPath(cwd: string): string {
  return join(cwd, ".claude", "hooks", "workflow-hook.log");
}

function runtimeDir(cwd: string): string {
  const workspaceHash = createHash("sha1")
    .update(resolve(cwd))
    .digest("hex")
    .slice(0, 12);
  const dirPath = join(tmpdir(), "claude-workflow-hooks", workspaceHash);
  mkdirSync(dirPath, { recursive: true });
  return dirPath;
}

function baselinePath(cwd: string, toolUseId: string): string {
  const key = toolUseId || "anonymous";
  return join(runtimeDir(cwd), `${key}.baseline.json`);
}

// ─── Logging ──────────────────────────────────────────────────────────────────

function logEvent(
  cwd: string,
  level: string,
  message: string,
  extra: Record<string, unknown> = {},
): void {
  try {
    const filePath = logPath(cwd);
    mkdirSync(dirname(filePath), { recursive: true });
    const record = sortKeys({
      level,
      message,
      timestamp: utcTimestamp(),
      ...extra,
    });
    appendFileSync(filePath, `${JSON.stringify(record)}\n`, "utf8");
  } catch {
    // ignore log-write failures
  }
}

function appendStateJournal(cwd: string, entry: Record<string, unknown>): void {
  try {
    const filePath = stateJournalPath(cwd);
    mkdirSync(dirname(filePath), { recursive: true });
    appendFileSync(filePath, `${JSON.stringify(sortKeys(entry))}\n`, "utf8");
  } catch {
    // ignore journal failures
  }
}

function persistStateBackup(cwd: string, state: WorkflowState): void {
  try {
    const filePath = stateBackupPath(cwd);
    mkdirSync(dirname(filePath), { recursive: true });
    writeFileSync(filePath, `${JSON.stringify(state, null, 2)}\n`, "utf8");
  } catch {
    // ignore backup failures
  }
}

// ─── State Merging ───────────────────────────────────────────────────────────

/**
 * Merge known workflow state sections with shallow merge per section.
 * Top-level scalars use last-writer-wins. Known nested sections shallow-merge:
 * incoming keys overwrite base keys; unmentioned keys fall back to defaults.
 */
export function mergeKnownSections(
  base: Partial<WorkflowState>,
  incoming: Partial<WorkflowState>,
): WorkflowState {
  const merged = deepCopyDefaultState();
  const defaults = deepCopyDefaultState();

  Object.assign(merged, base, incoming);

  merged.requirements = {
    ...defaults.requirements,
    ...(base.requirements ?? {}),
    ...(incoming.requirements ?? {}),
  };
  merged.plan = {
    ...defaults.plan,
    ...(base.plan ?? {}),
    ...(incoming.plan ?? {}),
  };
  merged.implementation = {
    ...defaults.implementation,
    ...(base.implementation ?? {}),
    ...(incoming.implementation ?? {}),
  };
  merged.qualityGates = {
    ...defaults.qualityGates,
    ...(base.qualityGates ?? {}),
    ...(incoming.qualityGates ?? {}),
  };
  merged.delivery = {
    ...defaults.delivery,
    ...(base.delivery ?? {}),
    ...(incoming.delivery ?? {}),
  };

  const revision = Number(merged.revision ?? defaults.revision);
  merged.revision =
    Number.isInteger(revision) && revision >= 0 ? revision : defaults.revision;

  return merged;
}

export function deepMerge(base: unknown, patch: unknown): unknown {
  if (isPlainObject(base) && isPlainObject(patch)) {
    const merged = structuredClone(base);
    for (const [key, value] of Object.entries(patch)) {
      merged[key] = deepMerge(merged[key], value);
    }
    return merged;
  }
  return structuredClone(patch);
}

// ─── State Validation ─────────────────────────────────────────────────────────

function validateStringList(value: unknown, fieldName: string): string[] {
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string")) {
    return [`${fieldName} must be a list of strings`];
  }
  return [];
}

export function validateState(state: WorkflowState): string[] {
  const errors: string[] = [];

  if (state.version !== SCHEMA_VERSION)
    errors.push(`version must be ${SCHEMA_VERSION}`);

  const phase = lower(state.phase);
  if (!PHASE_ORDER.includes(phase as Phase)) {
    errors.push(`phase must be one of ${PHASE_ORDER.join(", ")}`);
  }

  if (typeof state.taskId !== "string") errors.push("taskId must be a string");
  if (typeof state.taskSummary !== "string")
    errors.push("taskSummary must be a string");

  const req = state.requirements;
  if (!isPlainObject(req)) {
    errors.push("requirements must be an object");
  } else {
    if (!REQUIREMENTS_STATUSES.has(lower(req.status) as RequirementsStatus))
      errors.push("requirements.status is invalid");
    errors.push(
      ...validateStringList(
        req.acceptanceCriteria,
        "requirements.acceptanceCriteria",
      ),
    );
    errors.push(
      ...validateStringList(req.constraints, "requirements.constraints"),
    );
    errors.push(
      ...validateStringList(req.openQuestions, "requirements.openQuestions"),
    );
  }

  const plan = state.plan;
  if (!isPlainObject(plan)) {
    errors.push("plan must be an object");
  } else {
    if (!PLAN_STATUSES.has(lower(plan.status) as PlanStatus))
      errors.push("plan.status is invalid");
    if (typeof plan.summary !== "string")
      errors.push("plan.summary must be a string");
    errors.push(...validateStringList(plan.filesInScope, "plan.filesInScope"));
  }

  const impl = state.implementation;
  if (!isPlainObject(impl)) {
    errors.push("implementation must be an object");
  } else {
    if (
      !IMPLEMENTATION_STATUSES.has(lower(impl.status) as ImplementationStatus)
    )
      errors.push("implementation.status is invalid");
    errors.push(
      ...validateStringList(impl.filesTouched, "implementation.filesTouched"),
    );
    errors.push(
      ...validateStringList(impl.blockedItems, "implementation.blockedItems"),
    );
    if (!Number.isInteger(impl.retryCount) || impl.retryCount < 0)
      errors.push("implementation.retryCount must be a non-negative integer");
  }

  const quality = state.qualityGates;
  if (!isPlainObject(quality)) {
    errors.push("qualityGates must be an object");
  } else {
    for (const gate of [
      "typecheck",
      "lint",
      "tests",
      "verification",
    ] as const) {
      if (!GATE_STATUSES.has(lower(quality[gate]) as GateStatus))
        errors.push(`qualityGates.${gate} is invalid`);
    }
    if (typeof quality.lastRunSummary !== "string")
      errors.push("qualityGates.lastRunSummary must be a string");
  }

  const delivery = state.delivery;
  if (!isPlainObject(delivery)) {
    errors.push("delivery must be an object");
  } else {
    if (!DELIVERY_STATUSES.has(lower(delivery.status) as DeliveryStatus))
      errors.push("delivery.status is invalid");
    if (typeof delivery.userApproved !== "boolean")
      errors.push("delivery.userApproved must be a boolean");
    if (typeof delivery.notes !== "string")
      errors.push("delivery.notes must be a string");
  }

  if (typeof state.lastUpdated !== "string")
    errors.push("lastUpdated must be a string");

  if (!Number.isInteger(state.revision) || state.revision < 0)
    errors.push("revision must be a non-negative integer");

  return errors;
}

function allGatesGreen(state: WorkflowState): boolean {
  const quality = state.qualityGates;
  return (["typecheck", "lint", "tests", "verification"] as const).every(
    (gate) => GREEN_GATE_VALUES.has(lower(quality[gate]) as GateStatus),
  );
}

export function formatGateSummary(state: WorkflowState): string {
  const quality = state.qualityGates;
  return (["typecheck", "lint", "tests", "verification"] as const)
    .map((gate) => `${gate}=${quality[gate] ?? "pending"}`)
    .join(", ");
}

export function validateStateTransition(
  oldState: WorkflowState,
  newState: WorkflowState,
): string[] {
  const errors: string[] = [];

  const oldPhase = lower(oldState.phase);
  const newPhase = lower(newState.phase);
  const oldIndex = phaseIndex(oldPhase);
  const newIndex = phaseIndex(newPhase);

  if (oldIndex >= 0 && newIndex >= 0 && newIndex - oldIndex > 1) {
    errors.push(
      `phase transition cannot skip forward from ${oldPhase} to ${newPhase}`,
    );
  }

  if (newIndex >= phaseIndex("planning")) {
    const reqStatus = lower(newState.requirements?.status);
    if (!["clarified", "approved"].includes(reqStatus)) {
      errors.push("planning or later requires clarified requirements");
    }
    if (!newState.taskId.trim() || !newState.taskSummary.trim()) {
      errors.push("planning or later requires taskId and taskSummary");
    }
    if ((newState.requirements?.acceptanceCriteria ?? []).length === 0) {
      errors.push(
        "planning or later requires at least one acceptance criterion",
      );
    }
  }

  if (newIndex >= phaseIndex("implementation")) {
    if (lower(newState.plan?.status) !== "approved") {
      errors.push("implementation or later requires plan.status = approved");
    }
    if ((newState.plan?.filesInScope ?? []).length === 0) {
      errors.push(
        "implementation or later requires plan.filesInScope to record the approved slice",
      );
    }
  }

  if (newIndex >= phaseIndex("delivery") && !allGatesGreen(newState)) {
    errors.push(
      "delivery requires all quality gates and verification to be green",
    );
  }

  if (
    lower(newState.delivery?.status) === "approved" &&
    !newState.delivery?.userApproved
  ) {
    errors.push(
      "delivery.status = approved requires delivery.userApproved = true",
    );
  }

  const retryCount = newState.implementation?.retryCount ?? 0;
  const blockedItems = newState.implementation?.blockedItems ?? [];
  const implStatus = lower(newState.implementation?.status);
  if (retryCount >= MAX_RETRY_COUNT && !allGatesGreen(newState)) {
    if (implStatus !== "blocked") {
      errors.push(
        "retry budget exhaustion requires implementation.status = blocked until the item is resolved",
      );
    }
    if (!blockedItems.length) {
      errors.push(
        "retry budget exhaustion requires implementation.blockedItems to record the blocker",
      );
    }
  }

  return errors;
}

// ─── State I/O ────────────────────────────────────────────────────────────────

function readBackupState(cwd: string): [null | WorkflowState, string[]] {
  const filePath = stateBackupPath(cwd);
  if (!existsSync(filePath))
    return [null, ["backup state file does not exist"]];

  let rawState: unknown;
  try {
    rawState = JSON.parse(readFileSync(filePath, "utf8"));
  } catch (err) {
    const message =
      err instanceof SyntaxError
        ? `not valid JSON: ${err.message}`
        : `could not be read: ${String(err)}`;
    return [null, [`backup state ${message}`]];
  }

  if (!isPlainObject(rawState))
    return [null, ["backup state must be a JSON object"]];

  const merged = mergeKnownSections({}, rawState as Partial<WorkflowState>);
  const errors = validateState(merged);
  if (errors.length > 0) {
    return [null, errors.map((e) => `backup state invalid: ${e}`)];
  }

  return [merged, []];
}

export function readStateStrict(cwd: string): [null | WorkflowState, string[]] {
  const filePath = workflowStatePath(cwd);
  if (!existsSync(filePath)) return [deepCopyDefaultState(), []];

  let rawState: unknown;
  try {
    rawState = JSON.parse(readFileSync(filePath, "utf8"));
  } catch (err) {
    const message =
      err instanceof SyntaxError
        ? `workflow state is not valid JSON: ${err.message}`
        : `workflow state could not be read: ${String(err)}`;
    return [null, [message]];
  }

  if (!isPlainObject(rawState))
    return [null, ["workflow state must be a JSON object"]];

  return [mergeKnownSections({}, rawState as Partial<WorkflowState>), []];
}

export function loadState(cwd: string): WorkflowState {
  const [state, errors] = readStateStrict(cwd);
  if (errors.length > 0) {
    const [backupState, backupErrors] = readBackupState(cwd);
    if (backupErrors.length === 0 && backupState) {
      const [repairedState, saveErrors] = saveState(cwd, backupState, {
        forceWrite: true,
      });
      if (saveErrors.length === 0 && repairedState) {
        logEvent(
          cwd,
          "warning",
          "Recovered workflow state from last-known-good backup",
          { errors },
        );
        appendStateJournal(cwd, {
          action: "state-recovered-from-backup",
          errors,
          phase: repairedState.phase,
          revision: repairedState.revision,
          timestamp: utcTimestamp(),
        });
        return repairedState;
      }
      logEvent(
        cwd,
        "warning",
        "State recovery attempted but failed to persist",
        { backupErrors: saveErrors, errors },
      );
    }

    logEvent(cwd, "warning", "Loaded fallback default state after read error", {
      errors,
    });
    appendStateJournal(cwd, {
      action: "state-fallback-default",
      errors,
      timestamp: utcTimestamp(),
    });
    return deepCopyDefaultState();
  }
  return state ?? deepCopyDefaultState();
}

export function saveState(
  cwd: string,
  state: WorkflowState,
  options: SaveStateOptions = {},
): [null | WorkflowState, string[]] {
  const { expectedRevision = null, forceWrite = false } = options;
  const mergedState = mergeKnownSections(deepCopyDefaultState(), state);
  mergedState.lastUpdated = utcTimestamp();

  const validationErrors = validateState(mergedState);
  if (validationErrors.length > 0) return [null, validationErrors];

  const filePath = workflowStatePath(cwd);
  mkdirSync(dirname(filePath), { recursive: true });
  const tempPath = filePath.replace(/\.json$/, ".json.tmp");

  let currentRevision = -1;
  if (existsSync(filePath)) {
    try {
      const parsed = JSON.parse(
        readFileSync(filePath, "utf8"),
      ) as Partial<WorkflowState>;
      const normalized = mergeKnownSections({}, parsed);
      const rev = Number(normalized.revision ?? 0);
      currentRevision = Number.isInteger(rev) && rev >= 0 ? rev : 0;
    } catch (err) {
      if (!forceWrite) {
        return [
          null,
          [
            `failed to read current workflow state before write: ${String(err)}`,
          ],
        ];
      }
      currentRevision = Number.isInteger(mergedState.revision)
        ? mergedState.revision - 1
        : 0;
    }
  } else {
    currentRevision = 0;
  }

  if (expectedRevision !== null && currentRevision !== expectedRevision) {
    return [
      null,
      [
        `stale workflow state write: expected revision ${expectedRevision}, found ${currentRevision}`,
      ],
    ];
  }

  mergedState.revision = currentRevision + 1;

  try {
    writeFileSync(
      tempPath,
      `${JSON.stringify(mergedState, null, 2)}\n`,
      "utf8",
    );
    renameSync(tempPath, filePath);
  } catch (err) {
    return [null, [`failed to write workflow state: ${String(err)}`]];
  }

  persistStateBackup(cwd, mergedState);
  appendStateJournal(cwd, {
    action: "state-saved",
    phase: mergedState.phase,
    revision: mergedState.revision,
    timestamp: utcTimestamp(),
  });
  logEvent(cwd, "info", "Workflow state saved", { phase: mergedState.phase });

  return [mergedState, []];
}

// ─── Baseline (pre-tool state snapshot) ──────────────────────────────────────

function persistStateBaseline(
  cwd: string,
  toolUseId: string,
  state: WorkflowState,
): void {
  const filePath = baselinePath(cwd, toolUseId);
  try {
    writeFileSync(filePath, `${JSON.stringify(state, null, 2)}\n`, "utf8");
  } catch (err) {
    logEvent(cwd, "warning", "Failed to persist workflow baseline", {
      error: String(err),
      tool_use_id: toolUseId,
    });
  }
}

function loadStateBaseline(
  cwd: string,
  toolUseId: string,
): null | WorkflowState {
  const filePath = baselinePath(cwd, toolUseId);
  if (!existsSync(filePath)) return null;
  try {
    const data = JSON.parse(readFileSync(filePath, "utf8")) as unknown;
    if (isPlainObject(data)) {
      return mergeKnownSections({}, data as Partial<WorkflowState>);
    }
  } catch {
    return null;
  }
  return null;
}

function removeStateBaseline(cwd: string, toolUseId: string): void {
  try {
    rmSync(baselinePath(cwd, toolUseId), { force: true });
  } catch {
    // ignore cleanup failures
  }
}

// ─── Hook Output ──────────────────────────────────────────────────────────────

function emit(payload: Record<string, unknown>): number {
  process.stdout.write(`${JSON.stringify(payload)}\n`);
  return 0;
}

function emitHookPayload(
  hookEventName: HookEventName | string,
  response: HookResponse = {},
): number {
  const payload: Record<string, unknown> = {};
  const isStopEvent = hookEventName === "Stop";

  if ("continue" in response) payload["continue"] = response.continue;

  if ("decision" in response) {
    payload["decision"] = isStopEvent
      ? response.decision === "allow"
        ? "approve"
        : "block"
      : response.decision;
  }

  if ("reason" in response) payload["reason"] = response.reason;
  if ("permissionDecision" in response)
    payload["permissionDecision"] = response.permissionDecision;
  if ("permissionDecisionReason" in response) {
    payload["permissionDecisionReason"] = response.permissionDecisionReason;
  }

  if (
    "additionalContext" in response &&
    response.additionalContext &&
    !isStopEvent
  ) {
    payload["additionalContext"] = response.additionalContext;
  }

  const supportsHookSpecificOutput = [
    "PreToolUse",
    "UserPromptSubmit",
    "PostToolUse",
  ].includes(hookEventName);
  if (hookEventName && supportsHookSpecificOutput) {
    const hookSpecificOutput: Record<string, unknown> = { hookEventName };
    if ("permissionDecision" in response)
      hookSpecificOutput["permissionDecision"] = response.permissionDecision;
    if (
      "permissionDecisionReason" in response &&
      response.permissionDecisionReason
    )
      hookSpecificOutput["permissionDecisionReason"] =
        response.permissionDecisionReason;
    if ("additionalContext" in response && response.additionalContext)
      hookSpecificOutput["additionalContext"] = response.additionalContext;
    payload["hookSpecificOutput"] = hookSpecificOutput;
  }

  return emit(payload);
}

function emitContinue(
  hookEventName: HookEventName | string,
  additionalContext = "",
): number {
  return emitHookPayload(hookEventName, { additionalContext, continue: true });
}

function emitPreToolDecision(
  decision: HookDecision,
  permissionDecisionReason = "",
  additionalContext = "",
): number {
  const response: HookResponse = {
    additionalContext,
    permissionDecision: decision,
  };
  if (permissionDecisionReason)
    response.permissionDecisionReason = permissionDecisionReason;
  if (decision === "allow") response.continue = true;
  return emitHookPayload("PreToolUse", response);
}

function emitPostToolBlock(reason: string, additionalContext = ""): number {
  return emitHookPayload("PostToolUse", {
    additionalContext,
    decision: "block",
    reason,
  });
}

function emitPostToolMessage(additionalContext = ""): number {
  return emitHookPayload("PostToolUse", { additionalContext });
}

function emitSessionContext(additionalContext = ""): number {
  return emitHookPayload("SessionStart", { additionalContext });
}

function emitStopDecision(decision: "allow" | "block", reason = ""): number {
  return emitHookPayload("Stop", {
    continue: decision === "allow",
    decision,
    reason,
  });
}

// ─── Tool Classification ──────────────────────────────────────────────────────

function isEditTool(toolName: string): boolean {
  return ["edit", "create", "write", "rename", "move", "delete"].some((token) =>
    toolName.includes(token),
  );
}

function isCommandTool(toolName: string): boolean {
  return [
    "terminal",
    "command",
    "bash",
    "powershell",
    "shell",
    "run",
    "task",
    "agent",
    "execute",
    "exec",
  ].some((token) => toolName.includes(token));
}

function isPassiveTerminalTool(toolName: string): boolean {
  return ["await", "output", "lastcommand", "selection"].some((token) =>
    toolName.includes(token),
  );
}

// ─── Command Text Extraction ──────────────────────────────────────────────────

function collectStrings(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (Array.isArray(value))
    return value.flatMap((entry) => collectStrings(entry));
  if (isPlainObject(value)) {
    return [
      "command",
      "commands",
      "args",
      "arguments",
      "path",
      "file",
      "filePath",
      "file_path",
      "source",
      "destination",
      "target",
      "files",
      "paths",
    ].flatMap((key) => (key in value ? collectStrings(value[key]) : []));
  }
  return [];
}

function collectPathStrings(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (Array.isArray(value))
    return value.flatMap((entry) => collectPathStrings(entry));
  if (isPlainObject(value)) {
    return [
      "path",
      "file",
      "filePath",
      "file_path",
      "source",
      "destination",
      "target",
      "files",
      "paths",
    ].flatMap((key) => (key in value ? collectPathStrings(value[key]) : []));
  }
  return [];
}

function extractCommandText(toolInput: ToolInput): string {
  if (typeof toolInput === "string") return (toolInput as string).toLowerCase();
  if (Array.isArray(toolInput)) {
    return (toolInput as unknown[])
      .flatMap((entry) => collectStrings(entry))
      .join(" ")
      .toLowerCase();
  }
  const items: string[] = [];
  for (const key of ["command", "commands", "args", "arguments"]) {
    if (key in toolInput) items.push(...collectStrings(toolInput[key]));
  }
  return items.join(" ").toLowerCase();
}

function normalizePath(value: string): string {
  const normalized = posix.normalize(value.replace(/\\/g, "/"));
  return normalized.startsWith("./") ? normalized.slice(2) : normalized;
}

function toRepoRelativePath(cwd: string, value: unknown): null | string {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed || /^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed)) return null;

  const repoRoot = resolve(cwd);
  const absolutePath = resolve(repoRoot, trimmed);
  const relativePath = relative(repoRoot, absolutePath).replace(/\\/g, "/");

  if (
    !relativePath ||
    relativePath === "." ||
    relativePath.startsWith("../") ||
    relativePath === ".."
  ) {
    return null;
  }

  return normalizePath(relativePath);
}

function extractPaths(cwd: string, toolInput: ToolInput): string[] {
  return uniqueStrings(
    collectPathStrings(toolInput)
      .map((entry) => toRepoRelativePath(cwd, entry))
      .filter((v): v is string => v !== null),
  );
}

function isGovernancePath(filePath: string): boolean {
  return (
    filePath === "AGENTS.md" ||
    filePath === "CLAUDE.md" ||
    filePath.startsWith(".claude/") ||
    filePath.startsWith(".github/")
  );
}

function isStatePath(filePath: string): boolean {
  return filePath === STATE_FILE;
}

function onlyGovernancePaths(paths: string[]): boolean {
  return paths.length > 0 && paths.every((p) => isGovernancePath(p));
}

function normalizeScopePath(value: string): string {
  return normalizePath(value).replace(/\/+$/, "");
}

function implementationPathsOnly(paths: string[]): string[] {
  return paths.filter((path) => !isGovernancePath(path) && !isStatePath(path));
}

function isPathInPlannedScope(filePath: string, plannedScope: string): boolean {
  const normalizedFilePath = normalizeScopePath(filePath);
  const normalizedScope = normalizeScopePath(plannedScope);

  if (!normalizedScope) return false;

  return (
    normalizedFilePath === normalizedScope ||
    normalizedFilePath.startsWith(`${normalizedScope}/`)
  );
}

function findOutOfScopePaths(
  paths: string[],
  plannedPaths: string[],
): string[] {
  if (plannedPaths.length === 0) return uniqueStrings(paths);

  return uniqueStrings(
    paths.filter(
      (path) =>
        !plannedPaths.some((plannedPath) =>
          isPathInPlannedScope(path, plannedPath),
        ),
    ),
  );
}

function commandReferencesStateFile(commandText: string): boolean {
  return /(^|[\s"'`])(?:\.\/)?\.claude\/workflow-state\.json\b/.test(
    commandText,
  );
}

function matchesAnyPattern(value: string, patterns: RegExp[]): boolean {
  return patterns.some((pattern) => pattern.test(value));
}

function isDeliveryActionCommand(commandText: string): boolean {
  return matchesAnyPattern(commandText, DELIVERY_ACTION_PATTERNS);
}

function isStateApiCommand(commandText: string): boolean {
  return matchesAnyPattern(commandText, STATE_API_COMMAND_PATTERNS);
}

function hasShellWriteOperator(commandText: string): boolean {
  return /\s>>?\s|\btee\b|\bsed\s+-i\b|\bperl\s+-i\b|<<\s*['"]?[a-z0-9_-]+/i.test(
    commandText,
  );
}

function isReadOnlyCommand(commandText: string): boolean {
  if (hasShellWriteOperator(commandText)) return false;
  return (
    matchesAnyPattern(commandText, READ_ONLY_COMMAND_PATTERNS) ||
    isStateApiCommand(commandText)
  );
}

// ─── State Derivation ─────────────────────────────────────────────────────────

function invalidateGateStatus(status: GateStatus): GateStatus {
  return lower(status) === "not-applicable" ? "not-applicable" : "pending";
}

function deriveStateAfterImplementationEdit(
  state: WorkflowState,
  filePaths: string[],
): WorkflowState {
  const nextState = mergeKnownSections({}, state);
  nextState.implementation.filesTouched = uniqueStrings([
    ...(state.implementation?.filesTouched ?? []),
    ...filePaths,
  ]);

  const currentPhase = lower(state.phase);
  const planApproved = lower(state.plan?.status) === "approved";
  const shouldInvalidate =
    planApproved && phaseIndex(currentPhase) >= phaseIndex("planning");

  if (!shouldInvalidate) return nextState;

  nextState.phase = "implementation";
  nextState.implementation.status = "in-progress";
  nextState.qualityGates = {
    ...nextState.qualityGates,
    lastRunSummary:
      "Implementation changed after prior validation. Rerun quality gates and verification.",
    lint: invalidateGateStatus(nextState.qualityGates.lint),
    tests: invalidateGateStatus(nextState.qualityGates.tests),
    typecheck: invalidateGateStatus(nextState.qualityGates.typecheck),
    verification: invalidateGateStatus(nextState.qualityGates.verification),
  };
  nextState.delivery = {
    ...nextState.delivery,
    notes:
      "Implementation changed after prior validation. Rerun quality gates and verification before delivery.",
    status: "blocked",
    userApproved: false,
  };

  return nextState;
}

function syncStateAfterImplementationEdit(
  cwd: string,
  state: WorkflowState,
  filePaths: string[],
): SyncEditResult {
  const proposedState = deriveStateAfterImplementationEdit(state, filePaths);

  if (statesEqual(state, proposedState)) {
    return { changed: false, errors: [], message: "", state };
  }

  const transitionErrors = validateStateTransition(state, proposedState);
  if (transitionErrors.length > 0) {
    return { changed: false, errors: transitionErrors, message: "", state };
  }

  const [savedState, saveErrors] = saveState(cwd, proposedState);
  if (saveErrors.length > 0 || !savedState) {
    return { changed: false, errors: saveErrors, message: "", state };
  }

  const downstreamChanged =
    formatGateSummary(savedState) !== formatGateSummary(state) ||
    lower(savedState.phase) !== lower(state.phase) ||
    lower(savedState.delivery?.status) !== lower(state.delivery?.status);

  const message = downstreamChanged
    ? "Workflow state was updated automatically with touched implementation files and downstream gate invalidation."
    : "Workflow state was updated automatically with touched implementation files.";

  return { changed: true, errors: [], message, state: savedState };
}

// ─── Event Loading & Normalization ────────────────────────────────────────────

function loadEvent(): RawEvent {
  if (process.stdin.isTTY) return {};
  const raw = readFileSync(0, "utf8").trim();
  if (!raw) return {};
  try {
    return JSON.parse(raw) as RawEvent;
  } catch {
    return {};
  }
}

function parseStructuredValue(value: unknown): unknown {
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  if (!trimmed) return {};
  try {
    return JSON.parse(trimmed);
  } catch {
    return value;
  }
}

function detectHookHost(event: RawEvent): string {
  if (!isPlainObject(event)) return "generic";
  if (
    "tool_name" in event ||
    "tool_input" in event ||
    "tool_use_id" in event ||
    "stop_hook_active" in event
  ) {
    return "vscode";
  }
  if (
    "toolName" in event ||
    "toolArgs" in event ||
    "toolUseId" in event ||
    "stopHookActive" in event
  ) {
    return "cli";
  }
  return "generic";
}

function normalizeEvent(mode: string, rawEvent: RawEvent): NormalizedEvent {
  const host = detectHookHost(rawEvent);
  const toolInput =
    (rawEvent.tool_input as ToolInput | undefined) ??
    (parseStructuredValue(rawEvent.toolArgs ?? rawEvent.tool_args) as
      | ToolInput
      | undefined) ??
    {};

  return {
    cwd: (rawEvent.cwd as string | undefined) ?? ".",
    host,
    mode,
    rawEvent,
    stopHookActive: Boolean(
      rawEvent.stop_hook_active ?? rawEvent.stopHookActive,
    ),
    toolInput,
    toolName: lower(rawEvent.tool_name ?? rawEvent.toolName),
    toolUseId: (rawEvent.tool_use_id ?? rawEvent.toolUseId ?? "") as string,
  };
}

// ─── CLI Arg Parsing (update-state) ──────────────────────────────────────────

function isHelpFlag(value: string): boolean {
  return value === "--help" || value === "-h";
}

function assignNestedValue(
  target: Record<string, unknown>,
  dottedPath: string,
  value: unknown,
): void {
  const parts = dottedPath.split(".").filter(Boolean);
  if (parts.length === 0) return;

  let cursor = target;
  for (const segment of parts.slice(0, -1)) {
    if (!isPlainObject(cursor[segment])) {
      cursor[segment] = {};
    }
    cursor = cursor[segment] as Record<string, unknown>;
  }
  const last = parts[parts.length - 1];
  if (last) cursor[last] = value;
}

function parseCliPatchArgs(
  args: string[],
): [Record<string, unknown>, string[]] {
  const patch: Record<string, unknown> = {};
  const errors: string[] = [];

  for (const arg of args) {
    if (!arg) continue;
    const sepIdx = arg.indexOf("=");
    if (sepIdx <= 0) {
      errors.push(
        `Invalid update-state argument "${arg}". Expected key=value.`,
      );
      continue;
    }
    const keyPath = arg.slice(0, sepIdx).trim();
    const rawValue = arg.slice(sepIdx + 1);
    if (!keyPath) {
      errors.push(
        `Invalid update-state argument "${arg}". Key path cannot be empty.`,
      );
      continue;
    }
    assignNestedValue(patch, keyPath, parseStructuredValue(rawValue));
  }

  return [patch, errors];
}

function buildUpdateStatePatch(
  rawEvent: RawEvent,
  cliArgs: string[],
): [Record<string, unknown>, string[]] {
  if (isPlainObject(rawEvent) && Object.keys(rawEvent).length > 0) {
    return [rawEvent as Record<string, unknown>, []];
  }
  if (cliArgs.length === 0) return [{}, []];
  return parseCliPatchArgs(cliArgs);
}

function extractTaskIdFromPatch(patch: Record<string, unknown>): string {
  const taskId = patch["taskId"];
  return typeof taskId === "string" ? taskId.trim() : "";
}

function patchStartsNewTask(
  currentState: WorkflowState,
  patch: Record<string, unknown>,
): boolean {
  const nextTaskId = extractTaskIdFromPatch(patch);
  return nextTaskId.length > 0 && nextTaskId !== currentState.taskId;
}

// ─── Hook Modes ───────────────────────────────────────────────────────────────

function sessionContext(event: NormalizedEvent): number {
  const cwd = event.cwd;
  const stateFileExists = existsSync(workflowStatePath(cwd));
  const [state, errors] = readStateStrict(cwd);
  const activeState = state ?? deepCopyDefaultState();
  const phase = activeState.phase ?? "discovery";
  const reqStatus = activeState.requirements?.status ?? "needs-clarification";
  const planStatus = activeState.plan?.status ?? "not-started";

  let message =
    `Workflow state loaded: phase=${phase}, requirements=${reqStatus}, plan=${planStatus}, ` +
    `gates=(${formatGateSummary(activeState)}). ` +
    "Follow Discovery -> Planning -> Implementation -> Quality Gates -> Verification -> Delivery. " +
    "Approved plans should stay within a small batch of files or folders; decompose large work before editing. " +
    "Use exact enums: requirements.status=needs-clarification|clarified|approved; " +
    "plan.status=not-started|proposed|approved|blocked.";

  if (
    !stateFileExists ||
    (phase === "discovery" && !activeState.taskId && !activeState.taskSummary)
  ) {
    message +=
      " Fresh bootstrap state detected. Start with the /discover command to clarify the task. Use './bin/vibe task workflow:bootstrap' when you need to reset stale task context before doing that.";
  }

  if (errors.length > 0) {
    message += ` State file needs repair before risky actions: ${errors.join("; ")}.`;
    logEvent(cwd, "warning", "Session started with invalid workflow state", {
      errors,
    });
  }

  return emitSessionContext(message);
}

function workflowGuard(event: NormalizedEvent): number {
  const { cwd, toolInput, toolName, toolUseId } = event;

  if (!(isEditTool(toolName) || isCommandTool(toolName))) {
    return emitContinue("PreToolUse");
  }

  const paths = extractPaths(cwd, toolInput);
  const governanceOnly = onlyGovernancePaths(paths);
  const stateTargeted = paths.some((p) => isStatePath(p));
  const commandText = extractCommandText(toolInput);
  const passiveCommandTool =
    isCommandTool(toolName) && isPassiveTerminalTool(toolName);
  const readOnlyCommand =
    passiveCommandTool ||
    (isCommandTool(toolName) && isReadOnlyCommand(commandText));
  const stateApiCommand =
    isCommandTool(toolName) && isStateApiCommand(commandText);
  const shellStateWriteAttempt =
    isCommandTool(toolName) &&
    commandReferencesStateFile(commandText) &&
    !readOnlyCommand &&
    !stateApiCommand;
  const riskyCommand =
    isCommandTool(toolName) && !readOnlyCommand && !stateApiCommand;
  const deliveryActionCommand =
    isCommandTool(toolName) && isDeliveryActionCommand(commandText);

  const [state, stateErrors] = readStateStrict(cwd);
  const recoveredState = stateErrors.length > 0 ? loadState(cwd) : state;
  const activeState = recoveredState ?? deepCopyDefaultState();
  const currentPhase = lower(activeState.phase);

  if (
    stateErrors.length > 0 &&
    !stateTargeted &&
    !readOnlyCommand &&
    !stateApiCommand
  ) {
    logEvent(
      cwd,
      "warning",
      "Workflow state was invalid; attempted graceful recovery",
      {
        errors: stateErrors,
        recovered: Boolean(recoveredState),
        tool: toolName,
      },
    );

    if (!recoveredState) {
      return emitPreToolDecision(
        "ask",
        "Workflow state is invalid and could not be recovered automatically. Repair .claude/workflow-state.json before risky actions.",
        stateErrors.join("; "),
      );
    }
  }

  if (stateTargeted && isEditTool(toolName)) {
    if (phaseIndex(currentPhase) >= phaseIndex("implementation")) {
      logEvent(cwd, "info", "Denied direct state edit after planning", {
        phase: currentPhase,
        tool: toolName,
      });
      return emitPreToolDecision(
        "deny",
        "After Planning, update workflow-state.json through the workflow state API instead of direct file edits.",
        "Use `node bin/cli/commands/workflow-hook.ts update-state` or `./bin/vibe task workflow:hook -- update-state phase=implementation implementation.status=in-progress`.",
      );
    }

    persistStateBaseline(cwd, toolUseId || "", activeState);
    logEvent(cwd, "info", "State file edit allowed with baseline capture", {
      tool: toolName,
      tool_use_id: toolUseId,
    });
    return emitPreToolDecision(
      "allow",
      "",
      "State file edits are allowed, but the result will be validated against the schema and transition rules after the write completes.",
    );
  }

  if (shellStateWriteAttempt) {
    logEvent(cwd, "info", "Denied shell-based workflow state write", {
      command: commandText,
      phase: currentPhase,
      tool: toolName,
    });
    return emitPreToolDecision(
      "deny",
      "Direct shell writes to .claude/workflow-state.json are blocked. Use the workflow state API instead.",
      "Use `./bin/vibe task workflow:hook -- update-state phase=implementation implementation.status=in-progress`.",
    );
  }

  const requirementsStatus = lower(activeState.requirements?.status);
  const planStatus = lower(activeState.plan?.status);
  const retryCount = activeState.implementation?.retryCount ?? 0;
  const plannedImplementationPaths = implementationPathsOnly(
    activeState.plan?.filesInScope ?? [],
  );
  const editedImplementationPaths = implementationPathsOnly(paths);
  const touchedImplementationPaths = implementationPathsOnly(
    activeState.implementation?.filesTouched ?? [],
  );

  if (
    retryCount >= MAX_RETRY_COUNT &&
    (isEditTool(toolName) || riskyCommand) &&
    !governanceOnly
  ) {
    logEvent(cwd, "warning", "Denied edit because retry budget is exhausted", {
      retryCount,
      tool: toolName,
    });
    return emitPreToolDecision(
      "deny",
      `Retry budget exhausted (${retryCount}/${MAX_RETRY_COUNT}). Mark the work item as blocked instead of continuing to edit.`,
      "Record the blocker in implementation.blockedItems and route the task back through recovery or user escalation.",
    );
  }

  if (
    deliveryActionCommand &&
    (!allGatesGreen(activeState) || activeState.delivery?.userApproved !== true)
  ) {
    logEvent(
      cwd,
      "warning",
      "Denied delivery action because delivery is not user-approved",
      {
        deliveryStatus: activeState.delivery?.status,
        gates: formatGateSummary(activeState),
        tool: toolName,
        userApproved: activeState.delivery?.userApproved,
      },
    );
    return emitPreToolDecision(
      "deny",
      "Delivery actions are blocked until quality gates are green and the user has approved delivery.",
      `Current gate state: ${formatGateSummary(activeState)}; delivery.status=${activeState.delivery?.status ?? "blocked"}; userApproved=${activeState.delivery?.userApproved === true}`,
    );
  }

  if (
    !governanceOnly &&
    !["clarified", "approved"].includes(requirementsStatus) &&
    (isEditTool(toolName) || riskyCommand)
  ) {
    logEvent(cwd, "info", "Asked for Discovery completion before risky edit", {
      requirements: requirementsStatus,
      tool: toolName,
    });
    return emitPreToolDecision(
      "ask",
      "Requirements are not clarified yet. Finish Discovery before editing implementation surfaces.",
      "Use the discovery workflow and update .claude/workflow-state.json before implementation work.",
    );
  }

  if (
    (isEditTool(toolName) || riskyCommand) &&
    !governanceOnly &&
    planStatus !== "approved"
  ) {
    logEvent(
      cwd,
      "info",
      "Asked for Planning completion before implementation edit",
      { plan: planStatus, tool: toolName },
    );
    return emitPreToolDecision(
      "ask",
      "Plan approval is required before non-trivial implementation changes.",
      "Move through Planning first or limit edits to workflow/governance files only.",
    );
  }

  if (
    (isEditTool(toolName) || riskyCommand) &&
    editedImplementationPaths.length > 0 &&
    planStatus === "approved" &&
    plannedImplementationPaths.length > MAX_APPROVED_BATCH_SIZE
  ) {
    logEvent(
      cwd,
      "info",
      "Asked for decomposition before large approved batch",
      {
        approvedScopeSize: plannedImplementationPaths.length,
        tool: toolName,
      },
    );
    return emitPreToolDecision(
      "ask",
      `Approved plan scope is too large for one implementation batch (${plannedImplementationPaths.length} paths). Narrow the slice or decompose before editing.`,
      "Create a smaller approved plan.filesInScope batch or add a docs/tasks decomposition artifact before continuing.",
    );
  }

  if (
    (isEditTool(toolName) || riskyCommand) &&
    editedImplementationPaths.length > 0 &&
    planStatus === "approved"
  ) {
    const outOfScopePaths = findOutOfScopePaths(
      editedImplementationPaths,
      plannedImplementationPaths,
    );

    if (outOfScopePaths.length > 0) {
      logEvent(cwd, "info", "Asked for replan due to out-of-scope edit", {
        outOfScopePaths,
        tool: toolName,
      });
      return emitPreToolDecision(
        "ask",
        "This edit reaches files outside the approved implementation slice.",
        `Unplanned paths: ${outOfScopePaths.slice(0, 5).join(", ")}. Update plan.filesInScope or return to Planning before continuing.`,
      );
    }

    const newlyTouchedPaths = findOutOfScopePaths(
      editedImplementationPaths,
      touchedImplementationPaths,
    );

    if (
      touchedImplementationPaths.length >= MAX_APPROVED_BATCH_SIZE &&
      newlyTouchedPaths.length > 0
    ) {
      logEvent(
        cwd,
        "info",
        "Asked for implementation checkpoint after large touched batch",
        {
          newlyTouchedPaths,
          tool: toolName,
          touchedScopeSize: touchedImplementationPaths.length,
        },
      );
      return emitPreToolDecision(
        "ask",
        `This implementation batch already touched ${touchedImplementationPaths.length} non-governance paths. Checkpoint before expanding scope.`,
        "Stop for review, quality gates, or a new approved slice instead of silently growing the batch.",
      );
    }
  }

  return emitContinue("PreToolUse");
}

function postEditChecks(event: NormalizedEvent): number {
  const { cwd, toolInput, toolName, toolUseId } = event;

  if (!isEditTool(toolName)) return emitContinue("PostToolUse");

  const paths = extractPaths(cwd, toolInput);
  const stateTargeted = paths.some((p) => isStatePath(p));

  if (stateTargeted) {
    const previousState = loadStateBaseline(cwd, toolUseId || "");
    const [currentState, errors] = readStateStrict(cwd);

    if (errors.length > 0) {
      if (previousState !== null) saveState(cwd, previousState);
      removeStateBaseline(cwd, toolUseId || "");
      logEvent(cwd, "error", "Blocked invalid workflow state edit", {
        errors,
        tool: toolName,
      });
      return emitPostToolBlock(
        "workflow-state.json became invalid and was restored to the last valid baseline.",
        errors.join("; "),
      );
    }

    const transitionErrors = currentState
      ? validateState(currentState)
      : ["workflow state is missing"];
    if (previousState !== null && currentState !== null) {
      transitionErrors.push(
        ...validateStateTransition(previousState, currentState),
      );
    }

    if (transitionErrors.length > 0) {
      if (previousState !== null) saveState(cwd, previousState);
      removeStateBaseline(cwd, toolUseId || "");
      logEvent(cwd, "error", "Blocked invalid workflow state transition", {
        errors: transitionErrors,
        tool: toolName,
      });
      return emitPostToolBlock(
        "workflow-state.json violated the workflow schema or transition rules and was restored.",
        transitionErrors.join("; "),
      );
    }

    removeStateBaseline(cwd, toolUseId || "");
    logEvent(cwd, "info", "Validated workflow state edit", {
      phase: currentState?.phase,
      tool: toolName,
    });
    return emitPostToolMessage(
      "workflow-state.json passed schema and transition validation.",
    );
  }

  let state = loadState(cwd);
  const implementationPaths = uniqueStrings(
    paths.filter((p) => !isGovernancePath(p)),
  );
  let automaticStateMessage = "";

  if (implementationPaths.length > 0) {
    const syncResult = syncStateAfterImplementationEdit(
      cwd,
      state,
      implementationPaths,
    );
    if (syncResult.errors.length > 0) {
      automaticStateMessage = `Automatic workflow state sync needs manual repair: ${syncResult.errors.join("; ")}.`;
      logEvent(
        cwd,
        "warning",
        "Automatic workflow state sync after edit failed",
        { errors: syncResult.errors, tool: toolName },
      );
    } else if (syncResult.changed) {
      state = syncResult.state;
      automaticStateMessage = syncResult.message;
      logEvent(
        cwd,
        "info",
        "Automatic workflow state sync after edit succeeded",
        { files: implementationPaths, phase: state.phase, tool: toolName },
      );
    }
  }

  const phase = state.phase ?? "discovery";
  const message = [
    automaticStateMessage,
    "Files changed. Update .claude/workflow-state.json with any remaining phase or blocker changes.",
    `Current phase is ${phase}. Before delivery, run the applicable gates and complete verification.`,
  ]
    .filter(Boolean)
    .join(" ");

  logEvent(cwd, "info", "Post-edit reminder issued", { phase, tool: toolName });
  return emitPostToolMessage(message);
}

function stopGate(event: NormalizedEvent): number {
  const { cwd, stopHookActive } = event;
  if (stopHookActive) return emitStopDecision("allow");

  const state = loadState(cwd);
  const phase = lower(state.phase ?? "discovery");
  const touched = state.implementation?.filesTouched ?? [];
  const retryCount = state.implementation?.retryCount ?? 0;
  const blockedItems = state.implementation?.blockedItems ?? [];

  if (retryCount >= MAX_RETRY_COUNT && blockedItems.length === 0) {
    const reason =
      "Warning: Retry budget is exhausted, but no blocked item was recorded in workflow state. Consider recording the blocker before ending.";
    logEvent(cwd, "warning", "Stop advisory: retry exhaustion not recorded", {
      retryCount,
    });
    return emitHookPayload("Stop", {
      additionalContext: reason,
      continue: true,
      decision: "allow",
      reason,
    });
  }

  if (
    ["implementation", "quality-gates", "verification"].includes(phase) ||
    touched.length > 0
  ) {
    if (!allGatesGreen(state)) {
      const reason =
        `Warning: Quality gates or verification are incomplete. Current state: ${formatGateSummary(state)}. ` +
        "The workflow state will persist for the next session.";
      logEvent(cwd, "info", "Stop advisory: gates incomplete", {
        gates: formatGateSummary(state),
      });
      return emitHookPayload("Stop", {
        additionalContext: reason,
        continue: true,
        decision: "allow",
        reason,
      });
    }
  }

  return emitStopDecision("allow");
}

export function updateStateMode(
  cwd: string,
  patch: Record<string, unknown>,
): number {
  const retryLimit = 3;

  for (let attempt = 1; attempt <= retryLimit; attempt++) {
    const currentState = loadState(cwd);
    const expectedRevision = Number(currentState.revision ?? 0);
    const baseState = patchStartsNewTask(currentState, patch)
      ? deepCopyDefaultState()
      : currentState;
    const proposedState = mergeKnownSections(
      {},
      deepMerge(baseState, patch) as Partial<WorkflowState>,
    );

    const deliveryStatus = lower(proposedState.delivery?.status);
    const oldDeliveryStatus = lower(currentState.delivery?.status);
    if (
      deliveryStatus !== oldDeliveryStatus &&
      (deliveryStatus === "ready-for-review" ||
        deliveryStatus === "approved") &&
      allGatesGreen(proposedState) &&
      !(
        "notes" in
        ((patch["delivery"] as Record<string, unknown> | undefined) ?? {})
      )
    ) {
      proposedState.delivery.notes = "";
    }

    const transitionErrors = validateStateTransition(
      currentState,
      proposedState,
    );
    if (transitionErrors.length > 0) {
      logEvent(cwd, "error", "Rejected workflow state update", {
        errors: transitionErrors,
      });
      return emit({ errors: transitionErrors, saved: false });
    }

    const [savedState, saveErrors] = saveState(cwd, proposedState, {
      expectedRevision,
    });
    if (saveErrors.length === 0 && savedState) {
      return emit({ saved: true, state: savedState });
    }

    const staleWrite = saveErrors.some((e) =>
      e.startsWith("stale workflow state write:"),
    );
    if (staleWrite && attempt < retryLimit) {
      logEvent(
        cwd,
        "warning",
        "Detected concurrent workflow state update, retrying",
        {
          attempt,
          errors: saveErrors,
        },
      );
      continue;
    }

    logEvent(cwd, "error", "Failed to save workflow state update", {
      attempt,
      errors: saveErrors,
    });
    return emit({ errors: saveErrors, saved: false });
  }

  return emit({
    errors: ["failed to update workflow state after retries"],
    saved: false,
  });
}

export function validateStateMode(cwd: string): number {
  const [state, readErrors] = readStateStrict(cwd);
  const validationErrors = state !== null ? validateState(state) : [];
  const errors = [...readErrors, ...validationErrors];
  logEvent(cwd, "info", "Validated workflow state", {
    valid: errors.length === 0,
  });
  return emit({ errors, state, valid: errors.length === 0 });
}

// ─── Main Entry ───────────────────────────────────────────────────────────────

export function runWorkflowHook(args: string[]): number {
  const mode = args[0] ?? "";
  const cliArgs = args.slice(1);

  if (mode === "update-state" && cliArgs.some(isHelpFlag)) {
    process.stdout.write(
      [
        "Usage:",
        "  printf '%s' '{\"phase\":\"planning\"}' | ./bin/vibe task workflow:hook -- update-state",
        "  ./bin/vibe task workflow:hook -- update-state phase=implementation implementation.status=in-progress",
        "",
        "Notes:",
        "- Use dotted paths for nested fields such as requirements.status or qualityGates.tests.",
        "- Values are parsed as JSON when possible.",
        "- Changing taskId starts a new task and resets derived workflow sections before applying the patch.",
      ].join("\n") + "\n",
    );
    return 0;
  }

  const rawEvent = loadEvent();
  const event = normalizeEvent(mode, rawEvent);
  const cwd = event.cwd;

  if (mode === "session-context") return sessionContext(event);
  if (mode === "workflow-guard") return workflowGuard(event);
  if (mode === "post-edit-checks") return postEditChecks(event);
  if (mode === "stop-gate") return stopGate(event);

  if (mode === "update-state") {
    const [patch, parseErrors] = buildUpdateStatePatch(rawEvent, cliArgs);
    if (parseErrors.length > 0)
      return emit({ errors: parseErrors, saved: false });
    return updateStateMode(cwd, patch);
  }

  if (mode === "validate-state") return validateStateMode(cwd);

  return emitContinue("");
}

async function run(args?: string[]): Promise<void> {
  const code = runWorkflowHook(args ?? []);
  if (code !== 0) process.exit(code);
}

export const command = {
  description:
    "Workflow state machine hook (session-context, workflow-guard, post-edit-checks, stop-gate, update-state, validate-state)",
  name: "workflow-hook",
  run,
};

export function help(): void {
  console.log(`  Workflow state machine hook.

  Usage:
    ./bin/vibe workflow-hook -- <mode> [args]

  Modes:
    session-context     Emit workflow context at session start (reads stdin)
    workflow-guard      Pre-tool-use guard (reads stdin)
    post-edit-checks    Post-edit state sync (reads stdin)
    stop-gate           Stop/advisory check (reads stdin)
    update-state        Update state fields (pipe JSON or pass key=value args)
    validate-state      Validate state file

  Examples:
    ./bin/vibe task workflow:hook -- session-context
    ./bin/vibe task workflow:hook -- update-state phase=planning
    ./bin/vibe task workflow:hook -- validate-state
`);
}
