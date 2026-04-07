import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, "../../..");

/**
 * Hook definition (single source of truth)
 * Generates both Claude Code (.claude/settings.json) and Copilot (.github/hooks/*.json) configs
 */
interface HookDefinition {
  claudePhases: string[]; // SessionStart, PreToolUse, PostToolUse, Stop
  command: string;
  copilotHooks: Array<{
    matcher?: string; // e.g., "Edit|Write" for PreToolUse
    phase: string; // sessionStart, preToolUse, postToolUse
  }>;
  description: string;
  id: string;
  name: string;
  timeout: number;
}

const HOOKS_DEFINITIONS: HookDefinition[] = [
  {
    claudePhases: ["SessionStart"],
    command:
      "node --experimental-strip-types --no-warnings bin/vibe task workflow:hook -- session-context",
    copilotHooks: [{ phase: "sessionStart" }],
    description: "Provides workflow context at session start",
    id: "session-context",
    name: "Session Context",
    timeout: 10,
  },
  {
    claudePhases: ["PreToolUse"],
    command:
      "node --experimental-strip-types --no-warnings bin/vibe task workflow:hook -- workflow-guard",
    copilotHooks: [{ matcher: "Edit|Write|Bash", phase: "preToolUse" }],
    description: "Enforces workflow discipline before tool execution",
    id: "workflow-guard",
    name: "Workflow Guard",
    timeout: 10,
  },
  {
    claudePhases: ["PostToolUse"],
    command:
      "node --experimental-strip-types --no-warnings bin/vibe task workflow:hook -- post-edit-checks",
    copilotHooks: [{ matcher: "Edit|Write", phase: "postToolUse" }],
    description: "Quality checks after edits and writes",
    id: "post-edit-checks",
    name: "Post-Edit Checks",
    timeout: 10,
  },
  {
    claudePhases: ["PostToolUse"],
    command:
      "node --experimental-strip-types --no-warnings bin/vibe task nextjs:policy",
    copilotHooks: [{ matcher: "Edit|Write", phase: "postToolUse" }],
    description: "Enforces Next.js conventions after edits",
    id: "nextjs-policy",
    name: "Next.js Policy",
    timeout: 10,
  },
  {
    claudePhases: ["Stop"],
    command:
      "node --experimental-strip-types --no-warnings bin/vibe task workflow:hook -- stop-gate",
    copilotHooks: [{ phase: "stop" }],
    description: "Validates workflow completeness before stop",
    id: "stop-gate",
    name: "Stop Gate",
    timeout: 10,
  },
];

/**
 * Validate hook definitions for consistency
 */
function validateHooks(): { errors: string[]; valid: boolean } {
  const errors: string[] = [];
  const seenIds = new Set<string>();

  for (const hook of HOOKS_DEFINITIONS) {
    if (!hook.id || !hook.name || !hook.command) {
      errors.push(`Hook missing required fields: ${hook.id || "unknown"}`);
    }

    if (seenIds.has(hook.id)) {
      errors.push(`Duplicate hook ID: ${hook.id}`);
    }
    seenIds.add(hook.id);

    if (!hook.claudePhases.length || !hook.copilotHooks.length) {
      errors.push(
        `Hook ${hook.id} must have both Claude and Copilot phase definitions`,
      );
    }
  }

  return { errors, valid: errors.length === 0 };
}

/**
 * Build Claude Code format (.claude/settings.json)
 */
function buildClaudeHooksConfig(): Record<string, unknown> {
  const hooks: Record<string, unknown[]> = {};

  // Map hooks to Claude phases
  const phaseMap = new Map<string, HookDefinition[]>();

  for (const hook of HOOKS_DEFINITIONS) {
    for (const phase of hook.claudePhases) {
      if (!phaseMap.has(phase)) {
        phaseMap.set(phase, []);
      }
      phaseMap.get(phase)!.push(hook);
    }
  }

  // Build hook entries grouped by phase
  for (const [phase, phaseHooks] of phaseMap) {
    hooks[phase] = phaseHooks.map((hook) => ({
      hooks: [
        {
          command: hook.command,
          timeout: hook.timeout,
          type: "command",
        },
      ],
      matcher:
        phase === "PreToolUse"
          ? phaseHooks.find((h) => h.id === "workflow-guard")
            ? "Edit|Write|Bash"
            : undefined
          : phase === "PostToolUse"
            ? "Edit|Write"
            : undefined,
    }));
  }

  return { hooks };
}

/**
 * Build individual Copilot hook configs (.github/hooks/*.json)
 */
function buildCopilotHookConfigs(): Record<string, Record<string, unknown>> {
  const configs: Record<string, Record<string, unknown>> = {};

  for (const hook of HOOKS_DEFINITIONS) {
    for (const copilotHook of hook.copilotHooks) {
      const phase = copilotHook.phase;
      const configKey = `${hook.id}`;

      configs[configKey] = {
        description: hook.description,
        hooks: {
          [phase]: [
            {
              command: hook.command,
              cwd: ".",
              description: hook.description,
              timeout: hook.timeout * 1000, // Copilot uses milliseconds
              type: "command",
              ...(copilotHook.matcher && { matcher: copilotHook.matcher }),
            },
          ],
        },
        notes: `Generated by hooks-build.ts | ${new Date().toISOString()}`,
        version: 1,
      };
    }
  }

  return configs;
}

/**
 * Write Claude hooks to .claude/settings.json
 */
function writeClaudeHooks(config: Record<string, unknown>): void {
  const settingsPath = path.resolve(PROJECT_ROOT, ".claude/settings.json");
  const existing = JSON.parse(fs.readFileSync(settingsPath, "utf-8"));

  // Merge with existing settings (preserve other config)
  const updated = { ...existing, ...config };

  fs.writeFileSync(settingsPath, JSON.stringify(updated, null, 2));
  console.log(`✓ Updated: ${path.relative(PROJECT_ROOT, settingsPath)}`);
}

/**
 * Write Copilot hooks to .github/hooks/*.json
 */
function writeCopilotHooks(
  configs: Record<string, Record<string, unknown>>,
): void {
  const hooksDir = path.resolve(PROJECT_ROOT, ".github/hooks");

  // Create directory if it doesn't exist
  if (!fs.existsSync(hooksDir)) {
    fs.mkdirSync(hooksDir, { recursive: true });
  }

  // Write each hook as separate file
  for (const [hookId, config] of Object.entries(configs)) {
    const filePath = path.resolve(hooksDir, `${hookId}.json`);
    fs.writeFileSync(filePath, JSON.stringify(config, null, 2));
    console.log(`✓ Updated: ${path.relative(PROJECT_ROOT, filePath)}`);
  }
}

/**
 * Main builder function
 */
export async function runHooksBuilder(): Promise<void> {
  console.log(
    "🔨 Building hook configurations from single source of truth...\n",
  );

  // Validate
  const validation = validateHooks();
  if (!validation.valid) {
    console.error("❌ Validation failed:");
    validation.errors.forEach((err) => console.error(`  - ${err}`));
    process.exit(1);
  }

  // Build configs
  const claudeConfig = buildClaudeHooksConfig();
  const copilotConfigs = buildCopilotHookConfigs();

  // Write files
  console.log("📝 Writing hook configurations...\n");
  writeClaudeHooks(claudeConfig);
  writeCopilotHooks(copilotConfigs);

  console.log("\n✅ Hook configurations synchronized!\n");
  console.log("Hooks defined:");
  HOOKS_DEFINITIONS.forEach((hook) => {
    console.log(`  • ${hook.id}: ${hook.description}`);
  });
}

async function run(): Promise<void> {
  await runHooksBuilder();
}

function buildHelpText(): string {
  return `  Build hook configurations from a single TypeScript source of truth.

  Description:
    Generates both Claude Code (.claude/settings.json) and GitHub Copilot
    (.github/hooks/*.json) hook configurations from one source.

    This keeps Claude and Copilot hook definitions in sync and removes the
    maintenance burden of updating separate generated JSON files by hand.

  Usage:
    ./bin/vibe hooks:build

  Hooks defined:
${HOOKS_DEFINITIONS.map((hook) => `    • ${hook.id}: ${hook.description}`).join("\n")}

  Output:
    .claude/settings.json
    .github/hooks/session-context.json
    .github/hooks/workflow-guard.json
    .github/hooks/post-edit-checks.json
    .github/hooks/nextjs-policy.json
    .github/hooks/stop-gate.json
`;
}

export const command = {
  description: "Generate hook configurations from single source",
  name: "hooks:build",
  run,
};

export function help(): void {
  console.log(buildHelpText());
}
