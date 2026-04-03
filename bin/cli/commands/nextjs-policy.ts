import { existsSync, readFileSync } from "node:fs";
import { basename } from "node:path";

// ─── Types ───────────────────────────────────────────────────────────────────

interface PolicyViolation {
  message: string;
  severity: "error" | "warning";
  suggestion: string;
}

interface PolicyProfile {
  structure?: {
    forbiddenGenericFiles?: string[];
    moduleSubdirs?: string[];
  };
}

interface HookToolInput {
  file_path?: string;
  filePath?: string;
  path?: string;
}

interface HookEvent {
  tool_input?: HookToolInput;
  toolInput?: HookToolInput;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const PROFILE_FILE = ".claude/workflow-profile.json";

const DEFAULT_FORBIDDEN_FILES = [
  "utils.ts",
  "utils.tsx",
  "helpers.ts",
  "helpers.tsx",
  "common.ts",
  "common.tsx",
];

const DEFAULT_MODULE_SUBDIRS = [
  "actions",
  "components",
  "containers",
  "screens",
  "hooks",
  "contexts",
  "lib",
  "styles",
  "constants",
];

// ─── Profile Loading ──────────────────────────────────────────────────────────

function loadProfile(): null | PolicyProfile {
  try {
    if (existsSync(PROFILE_FILE)) {
      return JSON.parse(readFileSync(PROFILE_FILE, "utf8")) as PolicyProfile;
    }
  } catch {
    // fall back to defaults
  }
  return null;
}

function getForbiddenFiles(profile: null | PolicyProfile): string[] {
  return profile?.structure?.forbiddenGenericFiles ?? DEFAULT_FORBIDDEN_FILES;
}

function getModuleSubdirs(profile: null | PolicyProfile): string[] {
  return profile?.structure?.moduleSubdirs ?? DEFAULT_MODULE_SUBDIRS;
}

// ─── Checks ───────────────────────────────────────────────────────────────────

function checkForbiddenFile(
  filePath: string,
  forbiddenFiles: string[],
): null | PolicyViolation {
  const fileName = basename(filePath);
  if (forbiddenFiles.includes(fileName)) {
    return {
      message: `Avoid generic file "${fileName}". Use specific named modules instead.`,
      severity: "warning",
      suggestion: "Rename to a more specific name that describes the content.",
    };
  }
  return null;
}

function checkModuleStructure(
  filePath: string,
  moduleSubdirs: string[],
): null | PolicyViolation {
  if (!filePath.includes("/modules/") && !filePath.includes("\\modules\\")) {
    return null;
  }

  const parts = filePath.split(/[/\\]/);
  const modulesIndex = parts.indexOf("modules");
  if (modulesIndex === -1 || modulesIndex >= parts.length - 2) {
    return null;
  }

  const subdir = parts[modulesIndex + 2];
  if (subdir && !moduleSubdirs.includes(subdir) && !subdir.includes(".")) {
    return {
      message: `Non-standard module subdirectory: "${subdir}".`,
      severity: "warning",
      suggestion: `Use one of: ${moduleSubdirs.join(", ")}`,
    };
  }

  return null;
}

function checkUseClientInScreens(
  filePath: string,
  content: string,
): null | PolicyViolation {
  if (!filePath.includes("/screens/") && !filePath.includes("\\screens\\")) {
    return null;
  }
  if (!filePath.endsWith(".tsx") && !filePath.endsWith(".ts")) {
    return null;
  }

  const lines = content.split("\n").slice(0, 5);
  const hasUseClient = lines.some(
    (line) =>
      line.trim().startsWith("'use client'") ||
      line.trim().startsWith('"use client"'),
  );

  if (hasUseClient) {
    return {
      message:
        'Screens should be Server Components. Found "use client" directive.',
      severity: "warning",
      suggestion: "Move client-side logic to containers/ or hooks/.",
    };
  }

  return null;
}

function checkFileContent(filePath: string): PolicyViolation[] {
  if (!existsSync(filePath)) return [];

  const profile = loadProfile();
  const forbiddenFiles = getForbiddenFiles(profile);
  const moduleSubdirs = getModuleSubdirs(profile);

  const violations: PolicyViolation[] = [];

  const forbiddenCheck = checkForbiddenFile(filePath, forbiddenFiles);
  if (forbiddenCheck) violations.push(forbiddenCheck);

  const structureCheck = checkModuleStructure(filePath, moduleSubdirs);
  if (structureCheck) violations.push(structureCheck);

  if (filePath.endsWith(".ts") || filePath.endsWith(".tsx")) {
    try {
      const content = readFileSync(filePath, "utf8");
      const useClientCheck = checkUseClientInScreens(filePath, content);
      if (useClientCheck) violations.push(useClientCheck);
    } catch {
      // skip content checks if file cannot be read
    }
  }

  return violations;
}

// ─── Output Formatters ────────────────────────────────────────────────────────

function formatViolations(
  violations: PolicyViolation[],
  filePath: string,
): null | string {
  if (violations.length === 0) return null;

  const messages = violations.map((v) => {
    const prefix = v.severity === "error" ? "❌" : "⚠️";
    return `${prefix} ${v.message}\n   💡 ${v.suggestion}`;
  });

  return `Next.js policy check for ${filePath}:\n${messages.join("\n")}`;
}

// ─── Hook mode (reads stdin, writes JSON to stdout) ────────────────────────────

function handleHookEvent(): void {
  let rawEvent = "";

  if (!process.stdin.isTTY) {
    try {
      rawEvent = readFileSync(0, "utf8").trim();
    } catch {
      rawEvent = "";
    }
  }

  if (!rawEvent) {
    process.stdout.write(JSON.stringify({ continue: true }) + "\n");
    return;
  }

  let event: HookEvent;
  try {
    event = JSON.parse(rawEvent) as HookEvent;
  } catch {
    process.stdout.write(JSON.stringify({ continue: true }) + "\n");
    return;
  }

  const toolInput: HookToolInput = event.tool_input ?? event.toolInput ?? {};
  const filePath =
    toolInput.file_path ?? toolInput.filePath ?? toolInput.path ?? "";

  if (!filePath) {
    process.stdout.write(JSON.stringify({ continue: true }) + "\n");
    return;
  }

  const violations = checkFileContent(filePath);
  const message = formatViolations(violations, filePath);

  if (message) {
    process.stdout.write(
      JSON.stringify({ additionalContext: message, continue: true }) + "\n",
    );
  } else {
    process.stdout.write(JSON.stringify({ continue: true }) + "\n");
  }
}

// ─── Standalone check mode ────────────────────────────────────────────────────

function handleStandaloneCheck(filePath: string): void {
  console.log(`\n🔍 Checking: ${filePath}\n`);

  const violations = checkFileContent(filePath);

  if (violations.length === 0) {
    console.log("✅ No policy violations found.");
    return;
  }

  console.log(`Found ${violations.length} violation(s):\n`);
  for (const v of violations) {
    const prefix = v.severity === "error" ? "❌" : "⚠️";
    console.log(`${prefix} ${v.message}`);
    console.log(`   💡 ${v.suggestion}\n`);
  }

  const hasErrors = violations.some((v) => v.severity === "error");
  if (hasErrors) process.exit(1);
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export function runNextjsPolicy(args: string[]): void {
  if (args[0] === "check" && args[1]) {
    handleStandaloneCheck(args[1]);
  } else {
    handleHookEvent();
  }
}

async function run(args?: string[]): Promise<void> {
  runNextjsPolicy(args ?? []);
}

export const command = {
  description: "Next.js convention enforcement hook",
  name: "nextjs-policy",
  run,
};

export function help(): void {
  console.log(`  Check files against Next.js conventions.

  Usage:
    ./bin/vibe nextjs-policy                   (hook mode, reads stdin)
    ./bin/vibe nextjs-policy check <file-path> (standalone check)
`);
}
