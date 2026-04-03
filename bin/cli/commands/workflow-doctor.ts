import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

// ─── Types ───────────────────────────────────────────────────────────────────

type CheckStatus = "error" | "ok" | "warning";

interface CheckResult {
  message: string;
  status: CheckStatus;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const STATE_FILE = ".claude/workflow-state.json";
const PROFILE_FILE = ".claude/workflow-profile.json";
const SETTINGS_FILE = ".claude/settings.json";

const REQUIRED_DIRS = [
  ".claude/commands",
  ".claude/skills",
  "bin/cli/commands",
];

const VALID_PHASES = [
  "discovery",
  "planning",
  "implementation",
  "quality-gates",
  "verification",
  "delivery",
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function checkJsonValid(filePath: string): CheckResult {
  if (!existsSync(filePath)) {
    return { message: "File does not exist", status: "error" };
  }
  try {
    JSON.parse(readFileSync(filePath, "utf8"));
    return { message: "valid", status: "ok" };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { message, status: "error" };
  }
}

function checkWorkflowState(): CheckResult {
  const jsonCheck = checkJsonValid(STATE_FILE);
  if (jsonCheck.status === "error") {
    return {
      message: `Invalid workflow state: ${jsonCheck.message}`,
      status: "error",
    };
  }

  const state = JSON.parse(readFileSync(STATE_FILE, "utf8")) as Record<
    string,
    unknown
  >;
  const issues: string[] = [];

  if (!state["version"]) issues.push("Missing version field");
  if (!state["phase"]) issues.push("Missing phase field");
  if (!state["requirements"]) issues.push("Missing requirements section");
  if (!state["plan"]) issues.push("Missing plan section");
  if (!state["implementation"]) issues.push("Missing implementation section");
  if (!state["qualityGates"]) issues.push("Missing qualityGates section");
  if (!state["delivery"]) issues.push("Missing delivery section");

  const phase = String(state["phase"] ?? "").toLowerCase();
  if (phase && !VALID_PHASES.includes(phase)) {
    issues.push(`Invalid phase: ${phase}`);
  }

  if (issues.length > 0) {
    return { message: issues.join("; "), status: "warning" };
  }

  return { message: "Workflow state is valid", status: "ok" };
}

function checkProfile(): CheckResult {
  const jsonCheck = checkJsonValid(PROFILE_FILE);
  if (jsonCheck.status === "error") {
    return {
      message: `Invalid profile: ${jsonCheck.message}`,
      status: "error",
    };
  }

  const profile = JSON.parse(readFileSync(PROFILE_FILE, "utf8")) as Record<
    string,
    unknown
  >;
  const issues: string[] = [];

  if (!profile["version"]) issues.push("Missing version field");
  if (!profile["profileId"]) issues.push("Missing profileId field");
  if (!profile["commands"]) issues.push("Missing commands section");
  if (!profile["conventions"]) issues.push("Missing conventions section");

  if (issues.length > 0) {
    return { message: issues.join("; "), status: "warning" };
  }

  return { message: "Profile is valid", status: "ok" };
}

function checkSettings(): CheckResult {
  const jsonCheck = checkJsonValid(SETTINGS_FILE);
  if (jsonCheck.status === "error") {
    return {
      message: `Invalid settings: ${jsonCheck.message}`,
      status: "error",
    };
  }

  const settings = JSON.parse(readFileSync(SETTINGS_FILE, "utf8")) as Record<
    string,
    unknown
  >;
  const hooks = settings["hooks"] as Record<string, unknown> | undefined;
  const issues: string[] = [];

  if (!hooks) {
    issues.push("Missing hooks configuration");
  } else {
    if (!hooks["SessionStart"]) issues.push("Missing SessionStart hook");
    if (!hooks["PreToolUse"]) issues.push("Missing PreToolUse hook");
    if (!hooks["PostToolUse"]) issues.push("Missing PostToolUse hook");
    if (!hooks["Stop"]) issues.push("Missing Stop hook");
  }

  if (issues.length > 0) {
    return { message: issues.join("; "), status: "warning" };
  }

  return { message: "Settings are valid", status: "ok" };
}

function checkDirectoryStructure(): CheckResult {
  const issues = REQUIRED_DIRS.filter((dir) => !existsSync(dir));

  if (issues.length > 0) {
    return {
      message: `Missing directories: ${issues.join(", ")}`,
      status: "error",
    };
  }

  return { message: "Directory structure is correct", status: "ok" };
}

function checkSkills(): CheckResult {
  const skillsDir = ".claude/skills";
  if (!existsSync(skillsDir)) {
    return { message: "Skills directory does not exist", status: "error" };
  }

  const skills = readdirSync(skillsDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  const issues = skills.filter(
    (skill) => !existsSync(join(skillsDir, skill, "SKILL.md")),
  );

  if (issues.length > 0) {
    return {
      message: `Missing SKILL.md in: ${issues.join(", ")}`,
      status: "warning",
    };
  }

  return { message: `${skills.length} skills found and valid`, status: "ok" };
}

function checkCommands(): CheckResult {
  const commandsDir = ".claude/commands";
  if (!existsSync(commandsDir)) {
    return { message: "Commands directory does not exist", status: "error" };
  }

  const commands = readdirSync(commandsDir).filter((f) => f.endsWith(".md"));

  if (commands.length === 0) {
    return { message: "No commands found", status: "warning" };
  }

  return { message: `${commands.length} commands found`, status: "ok" };
}

function checkCliCommands(): CheckResult {
  const cliDir = "bin/cli/commands";
  if (!existsSync(cliDir)) {
    return {
      message: "CLI commands directory does not exist",
      status: "error",
    };
  }

  const scripts = readdirSync(cliDir).filter((f) => f.endsWith(".ts"));

  const requiredScripts = ["workflow-hook.ts", "task.ts"];
  const missing = requiredScripts.filter((s) => !scripts.includes(s));

  if (missing.length > 0) {
    return {
      message: `Missing required CLI commands: ${missing.join(", ")}`,
      status: "error",
    };
  }

  return {
    message: `${scripts.length} CLI command scripts found`,
    status: "ok",
  };
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export function runWorkflowDoctor(): void {
  console.log("🩺 Workflow Doctor - Health Check\n");
  console.log("=".repeat(50));

  const checks: Array<{ fn: () => CheckResult; name: string }> = [
    { fn: checkDirectoryStructure, name: "Directory Structure" },
    { fn: checkWorkflowState, name: "Workflow State" },
    { fn: checkProfile, name: "Workflow Profile" },
    { fn: checkSettings, name: "Settings" },
    { fn: checkSkills, name: "Skills" },
    { fn: checkCommands, name: "Commands" },
    { fn: checkCliCommands, name: "CLI Commands" },
  ];

  let hasErrors = false;
  let hasWarnings = false;

  for (const check of checks) {
    const result = check.fn();
    const icon =
      result.status === "ok" ? "✅" : result.status === "warning" ? "⚠️" : "❌";
    console.log(`\n${icon} ${check.name}`);
    console.log(`   ${result.message}`);

    if (result.status === "error") hasErrors = true;
    if (result.status === "warning") hasWarnings = true;
  }

  console.log("\n" + "=".repeat(50));

  if (hasErrors) {
    console.log("\n❌ Health check failed - errors found");
    process.exit(1);
  } else if (hasWarnings) {
    console.log("\n⚠️ Health check passed with warnings");
  } else {
    console.log("\n✅ All health checks passed");
  }
}

async function run(): Promise<void> {
  runWorkflowDoctor();
}

export const command = {
  description: "Health checks for workflow state and configuration",
  name: "workflow-doctor",
  run,
};

export function help(): void {
  console.log(`  Run workflow health diagnostics.

  Usage:
    ./bin/vibe workflow-doctor
`);
}
