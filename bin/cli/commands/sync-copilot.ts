import {
  existsSync,
  lstatSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  readlinkSync,
  rmSync,
  statSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

// ─── Types ───────────────────────────────────────────────────────────────────

interface SyncOptions {
  checkOnly: boolean;
  verbose: boolean;
}

interface SyncResult {
  created: number;
  missing: number;
  ok: boolean;
}

interface PromptSyncResult {
  missing: number;
  ok: boolean;
  updated: number;
}

interface HookIssue {
  file: string;
  message: string;
}

interface HookValidateResult {
  issues: HookIssue[];
  ok: boolean;
}

interface HookConfig {
  hooks?: {
    postToolUse?: HookEntry[];
    preToolUse?: HookEntry[];
    sessionStart?: HookEntry[];
  };
}

interface HookEntry {
  command?: string;
  type: string;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const __filename = fileURLToPath(import.meta.url);
const ROOT = resolve(__filename, "../../../..");
const CLAUDE_DIR = join(ROOT, ".claude");
const GITHUB_DIR = join(ROOT, ".github");

// ─── Helpers ─────────────────────────────────────────────────────────────────

function log(message: string): void {
  console.log(message);
}

function verbose(message: string, opts: SyncOptions): void {
  if (opts.verbose) {
    console.log(`  ${message}`);
  }
}

function logError(message: string): void {
  console.error(`ERROR: ${message}`);
}

// ─── 1. Skill Symlinks ────────────────────────────────────────────────────────

function syncSkillSymlinks(opts: SyncOptions): SyncResult {
  log("\n[1/3] Checking skill symlinks...");

  const claudeSkillsDir = join(CLAUDE_DIR, "skills");
  const githubSkillsDir = join(GITHUB_DIR, "skills");

  if (!existsSync(claudeSkillsDir)) {
    verbose("No .claude/skills/ directory found", opts);
    return { created: 0, missing: 0, ok: true };
  }

  if (!existsSync(githubSkillsDir)) {
    if (opts.checkOnly) {
      logError(".github/skills/ directory missing");
      return { created: 0, missing: 1, ok: false };
    }
    mkdirSync(githubSkillsDir, { recursive: true });
    verbose("Created .github/skills/", opts);
  }

  const skills = readdirSync(claudeSkillsDir).filter((f) =>
    statSync(join(claudeSkillsDir, f)).isDirectory(),
  );

  let created = 0;
  let missing = 0;

  for (const skill of skills) {
    const symlinkPath = join(githubSkillsDir, skill);
    const targetPath = `../../.claude/skills/${skill}`;

    if (existsSync(symlinkPath)) {
      try {
        const lstat = lstatSync(symlinkPath);
        if (lstat.isSymbolicLink()) {
          const linkTarget = readlinkSync(symlinkPath);
          if (linkTarget === targetPath) {
            verbose(`✓ ${skill} (symlink valid)`, opts);
            continue;
          }
          verbose(`✗ ${skill} (wrong target: ${linkTarget})`, opts);
        } else {
          verbose(`✗ ${skill} (not a symlink)`, opts);
        }
      } catch {
        verbose(`✗ ${skill} (cannot read)`, opts);
      }

      if (opts.checkOnly) {
        missing++;
        continue;
      }

      rmSync(symlinkPath, { recursive: true });
    }

    if (opts.checkOnly) {
      verbose(`✗ ${skill} (missing)`, opts);
      missing++;
      continue;
    }

    symlinkSync(targetPath, symlinkPath);
    verbose(`+ ${skill} (created symlink)`, opts);
    created++;
  }

  if (opts.checkOnly && missing > 0) {
    logError(`${missing} skill symlinks missing or invalid`);
    return { created, missing, ok: false };
  }

  if (created > 0) {
    log(`  Created ${created} symlinks`);
  } else {
    log(`  All ${skills.length} symlinks valid`);
  }

  return { created, missing, ok: true };
}

// ─── 2. Commands → Prompts ────────────────────────────────────────────────────

function transformCommand(content: string, commandName: string): string {
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!frontmatterMatch) return content;

  const [, frontmatter = "", body = ""] = frontmatterMatch;

  const props: Record<string, string> = {};
  for (const line of frontmatter.split("\n")) {
    const match = line.match(/^(\w[-\w]*?):\s*(.*)$/);
    if (match && match[1] && match[2] !== undefined) {
      props[match[1]] = match[2].replace(/^["']|["']$/g, "");
    }
  }

  const newFrontmatter = [
    "---",
    `name: ${commandName}`,
    `description: ${props["description"] ?? ""}`,
    "---",
  ].join("\n");

  const newBody = body
    .replace(/CLAUDE\.md/g, "[AGENTS.md](../../AGENTS.md)")
    .replace(
      /\.claude\/skills\/([^/]+)\/SKILL\.md/g,
      "[../skills/$1/](../skills/$1/)",
    )
    .replace(/\.claude\/skills\/([^/]+)\//g, "[../skills/$1/](../skills/$1/)");

  return `${newFrontmatter}\n${newBody}`;
}

function syncCommandsToPrompts(opts: SyncOptions): PromptSyncResult {
  log("\n[2/3] Checking commands → prompts...");

  const claudeCommandsDir = join(CLAUDE_DIR, "commands");
  const githubPromptsDir = join(GITHUB_DIR, "prompts");

  if (!existsSync(claudeCommandsDir)) {
    verbose("No .claude/commands/ directory found", opts);
    return { missing: 0, ok: true, updated: 0 };
  }

  if (!existsSync(githubPromptsDir)) {
    if (opts.checkOnly) {
      logError(".github/prompts/ directory missing");
      return { missing: 1, ok: false, updated: 0 };
    }
    mkdirSync(githubPromptsDir, { recursive: true });
    verbose("Created .github/prompts/", opts);
  }

  const commands = readdirSync(claudeCommandsDir).filter((f) =>
    f.endsWith(".md"),
  );

  let updated = 0;
  let missing = 0;

  for (const commandFile of commands) {
    const commandPath = join(claudeCommandsDir, commandFile);
    const commandName = commandFile.replace(".md", "");
    const promptName = `${commandName}.prompt.md`;
    const promptPath = join(githubPromptsDir, promptName);

    const commandStat = statSync(commandPath);

    if (existsSync(promptPath)) {
      const promptStat = statSync(promptPath);
      if (promptStat.mtime >= commandStat.mtime) {
        verbose(`✓ ${promptName} (up to date)`, opts);
        continue;
      }
      verbose(`~ ${promptName} (command modified)`, opts);
    } else {
      verbose(`✗ ${promptName} (missing)`, opts);
    }

    if (opts.checkOnly) {
      missing++;
      continue;
    }

    const content = readFileSync(commandPath, "utf-8");
    const transformed = transformCommand(content, commandName);
    writeFileSync(promptPath, transformed);
    verbose(`+ ${promptName} (updated)`, opts);
    updated++;
  }

  if (opts.checkOnly && missing > 0) {
    logError(`${missing} prompts missing or outdated`);
    return { missing, ok: false, updated };
  }

  if (updated > 0) {
    log(`  Updated ${updated} prompts`);
  } else {
    log(`  All ${commands.length} prompts up to date`);
  }

  return { missing, ok: true, updated };
}

// ─── 3. Hook Config Validation ────────────────────────────────────────────────

function validateHookConfigs(opts: SyncOptions): HookValidateResult {
  log("\n[3/3] Validating hook configs...");

  const githubHooksDir = join(GITHUB_DIR, "hooks");

  if (!existsSync(githubHooksDir)) {
    verbose("No .github/hooks/ directory found", opts);
    return { issues: [], ok: true };
  }

  const configs = readdirSync(githubHooksDir).filter((f) =>
    f.endsWith(".json"),
  );

  const issues: HookIssue[] = [];

  for (const configFile of configs) {
    const configPath = join(githubHooksDir, configFile);

    try {
      const config = JSON.parse(
        readFileSync(configPath, "utf-8"),
      ) as HookConfig;

      const allHooks = [
        ...(config.hooks?.preToolUse ?? []),
        ...(config.hooks?.postToolUse ?? []),
        ...(config.hooks?.sessionStart ?? []),
      ];

      for (const hook of allHooks) {
        if (hook.type === "command" && hook.command) {
          // Extract the script path from: node [--flags...] <script> [args...]
          const nodeMatch = hook.command.match(/node\s+((?:--\S+\s+)*)([\S]+)/);
          if (nodeMatch && nodeMatch[2]) {
            const scriptPath = join(ROOT, nodeMatch[2]);
            if (!existsSync(scriptPath)) {
              issues.push({
                file: configFile,
                message: `Script not found: ${nodeMatch[2]}`,
              });
            }
          }
        }
      }

      verbose(`✓ ${configFile} (valid)`, opts);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      issues.push({ file: configFile, message: `Invalid JSON: ${message}` });
      verbose(`✗ ${configFile} (invalid JSON)`, opts);
    }
  }

  if (issues.length > 0) {
    for (const issue of issues) {
      logError(`${issue.file}: ${issue.message}`);
    }
    return { issues, ok: false };
  }

  log(`  All ${configs.length} hook configs valid`);
  return { issues, ok: true };
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export async function runSyncCopilot(args: string[]): Promise<void> {
  const opts: SyncOptions = {
    checkOnly: args.includes("--check"),
    verbose: args.includes("--verbose"),
  };

  log("=== Copilot Sync ===");

  if (opts.checkOnly) {
    log("Running in check mode (no changes will be made)");
  }

  const skillsResult = syncSkillSymlinks(opts);
  const promptsResult = syncCommandsToPrompts(opts);
  const hooksResult = validateHookConfigs(opts);

  log("\n=== Summary ===");

  const allOk = skillsResult.ok && promptsResult.ok && hooksResult.ok;

  if (allOk) {
    log(opts.checkOnly ? "All checks passed!" : "Sync complete!");
  } else {
    log(
      opts.checkOnly
        ? "Some checks failed. Run without --check to fix."
        : "Sync completed with errors.",
    );
    process.exit(1);
  }
}

async function run(args?: string[]): Promise<void> {
  await runSyncCopilot(args ?? []);
}

export const command = {
  description: "Sync .claude/ commands and skills to .github/ (Copilot)",
  name: "sync-copilot",
  run,
};

export function help(): void {
  console.log(`  Sync Claude commands to Copilot prompts and validate hook configs.

  Usage:
    ./bin/vibe sync-copilot [options]

  Options:
    --check    Check only, no changes
    --verbose  Show detailed output
`);
}
