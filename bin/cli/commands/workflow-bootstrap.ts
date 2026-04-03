import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

const STATE_FILE = ".claude/workflow-state.json";
const SCHEMA_VERSION = "1.0";

// ─── Types ───────────────────────────────────────────────────────────────────

interface BootstrapRequirements {
  acceptanceCriteria: string[];
  constraints: string[];
  openQuestions: string[];
  status: string;
}

interface BootstrapPlan {
  filesInScope: string[];
  status: string;
  summary: string;
}

interface BootstrapImplementation {
  blockedItems: string[];
  filesTouched: string[];
  retryCount: number;
  status: string;
}

interface BootstrapQualityGates {
  lastRunSummary: string;
  lint: string;
  tests: string;
  typecheck: string;
  verification: string;
}

interface BootstrapDelivery {
  notes: string;
  status: string;
  userApproved: boolean;
}

interface BootstrapState {
  delivery: BootstrapDelivery;
  implementation: BootstrapImplementation;
  lastUpdated: string;
  phase: string;
  plan: BootstrapPlan;
  qualityGates: BootstrapQualityGates;
  requirements: BootstrapRequirements;
  taskId: string;
  taskSummary: string;
  version: string;
}

interface ParsedArgs {
  force: boolean;
  summary: string;
  taskId: string;
}

interface ExistingStateResult {
  corrupted?: boolean;
  exists: boolean;
  inProgress: boolean;
  state?: BootstrapState;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const DEFAULT_STATE: BootstrapState = {
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
  taskId: "",
  taskSummary: "",
  version: SCHEMA_VERSION,
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function utcTimestamp(): string {
  return new Date().toISOString().replace(/\.\d{3}Z$/, "+00:00");
}

function parseArgs(args: string[]): ParsedArgs {
  const result: ParsedArgs = { force: false, summary: "", taskId: "" };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--task-id" && args[i + 1]) {
      result.taskId = args[++i] ?? "";
    } else if (arg === "--summary" && args[i + 1]) {
      result.summary = args[++i] ?? "";
    } else if (arg === "--force" || arg === "-f") {
      result.force = true;
    }
  }

  return result;
}

function checkExistingState(): ExistingStateResult {
  if (!existsSync(STATE_FILE)) {
    return { exists: false, inProgress: false };
  }

  try {
    const state = JSON.parse(
      readFileSync(STATE_FILE, "utf8"),
    ) as BootstrapState;
    const inProgress =
      state.phase !== "discovery" ||
      state.requirements?.status !== "needs-clarification" ||
      state.implementation?.status === "in-progress";
    return { exists: true, inProgress, state };
  } catch {
    return { corrupted: true, exists: true, inProgress: false };
  }
}

function createNewState(taskId: string, summary: string): BootstrapState {
  return {
    ...DEFAULT_STATE,
    delivery: { ...DEFAULT_STATE.delivery },
    implementation: { ...DEFAULT_STATE.implementation },
    lastUpdated: utcTimestamp(),
    plan: { ...DEFAULT_STATE.plan },
    qualityGates: { ...DEFAULT_STATE.qualityGates },
    requirements: { ...DEFAULT_STATE.requirements },
    taskId,
    taskSummary: summary,
  };
}

function saveState(state: BootstrapState): void {
  const dir = dirname(STATE_FILE);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  writeFileSync(STATE_FILE, JSON.stringify(state, null, 2) + "\n", "utf8");
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export function runWorkflowBootstrap(args: string[]): void {
  const parsed = parseArgs(args);

  console.log("🔄 Workflow Bootstrap\n");

  const existing = checkExistingState();

  if (existing.exists && existing.inProgress && !parsed.force) {
    console.log("⚠️  Warning: Current task appears to be in progress.");
    console.log(`   Phase: ${existing.state?.phase ?? "unknown"}`);
    console.log(`   Task: ${existing.state?.taskSummary ?? "unnamed"}`);
    console.log("\nUse --force to reset anyway.");
    process.exit(1);
  }

  if (existing.corrupted === true) {
    console.log("⚠️  Warning: Existing state file is corrupted. Resetting...");
  }

  const newState = createNewState(parsed.taskId, parsed.summary);
  saveState(newState);

  console.log("✅ Workflow state reset successfully");
  console.log("\nNew state:");
  console.log(`   Phase: ${newState.phase}`);
  console.log(`   Task ID: ${newState.taskId || "(not set)"}`);
  console.log(`   Summary: ${newState.taskSummary || "(not set)"}`);
  console.log(`   Requirements: ${newState.requirements.status}`);
  console.log(`   Plan: ${newState.plan.status}`);
  console.log(
    "\nNext step: Run /discover to begin requirements clarification.",
  );
}

async function run(args?: string[]): Promise<void> {
  runWorkflowBootstrap(args ?? []);
}

export const command = {
  description: "Reset workflow state for a new task",
  name: "workflow-bootstrap",
  run,
};

export function help(): void {
  console.log(`  Reset workflow state for a new task.

  Usage:
    ./bin/vibe workflow-bootstrap [options]

  Options:
    --task-id <id>     Set initial task ID
    --summary <text>   Set initial task summary
    --force, -f        Force reset even if current task is in progress
`);
}
