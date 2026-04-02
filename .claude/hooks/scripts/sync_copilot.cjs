#!/usr/bin/env node
/**
 * Sync Copilot Script
 *
 * Keeps .github/ in sync with .claude/ for dual-tool support.
 *
 * Operations:
 * 1. Verify/create skill symlinks
 * 2. Transform commands → prompts (if source newer)
 * 3. Validate hook configs reference correct scripts
 *
 * Usage:
 *   node .claude/hooks/scripts/sync_copilot.cjs
 *   node .claude/hooks/scripts/sync_copilot.cjs --check  # Check only, no changes
 *   node .claude/hooks/scripts/sync_copilot.cjs --verbose
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "../../..");
const CLAUDE_DIR = path.join(ROOT, ".claude");
const GITHUB_DIR = path.join(ROOT, ".github");

const args = process.argv.slice(2);
const CHECK_ONLY = args.includes("--check");
const VERBOSE = args.includes("--verbose");

function log(message) {
  console.log(message);
}

function verbose(message) {
  if (VERBOSE) {
    console.log(`  ${message}`);
  }
}

function error(message) {
  console.error(`ERROR: ${message}`);
}

// ============================================================================
// 1. Skill Symlinks
// ============================================================================

function syncSkillSymlinks() {
  log("\n[1/3] Checking skill symlinks...");

  const claudeSkillsDir = path.join(CLAUDE_DIR, "skills");
  const githubSkillsDir = path.join(GITHUB_DIR, "skills");

  if (!fs.existsSync(claudeSkillsDir)) {
    verbose("No .claude/skills/ directory found");
    return { ok: true, created: 0, missing: 0 };
  }

  // Ensure .github/skills exists
  if (!fs.existsSync(githubSkillsDir)) {
    if (CHECK_ONLY) {
      error(".github/skills/ directory missing");
      return { ok: false, created: 0, missing: 1 };
    }
    fs.mkdirSync(githubSkillsDir, { recursive: true });
    verbose("Created .github/skills/");
  }

  const skills = fs
    .readdirSync(claudeSkillsDir)
    .filter((f) =>
      fs.statSync(path.join(claudeSkillsDir, f)).isDirectory()
    );

  let created = 0;
  let missing = 0;

  for (const skill of skills) {
    const symlinkPath = path.join(githubSkillsDir, skill);
    const targetPath = `../../.claude/skills/${skill}`;

    if (fs.existsSync(symlinkPath)) {
      // Check if it's a valid symlink
      try {
        const linkTarget = fs.readlinkSync(symlinkPath);
        if (linkTarget === targetPath) {
          verbose(`✓ ${skill} (symlink valid)`);
          continue;
        }
        verbose(`✗ ${skill} (symlink points to wrong target: ${linkTarget})`);
      } catch {
        verbose(`✗ ${skill} (not a symlink)`);
      }

      if (CHECK_ONLY) {
        missing++;
        continue;
      }

      // Remove and recreate
      fs.rmSync(symlinkPath, { recursive: true });
    }

    if (CHECK_ONLY) {
      verbose(`✗ ${skill} (missing)`);
      missing++;
      continue;
    }

    fs.symlinkSync(targetPath, symlinkPath);
    verbose(`+ ${skill} (created symlink)`);
    created++;
  }

  if (CHECK_ONLY && missing > 0) {
    error(`${missing} skill symlinks missing or invalid`);
    return { ok: false, created, missing };
  }

  if (created > 0) {
    log(`  Created ${created} symlinks`);
  } else {
    log(`  All ${skills.length} symlinks valid`);
  }

  return { ok: true, created, missing };
}

// ============================================================================
// 2. Command → Prompt Transformation
// ============================================================================

function transformCommand(content, commandName) {
  // Parse frontmatter
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);

  if (!frontmatterMatch) {
    return content;
  }

  const [, frontmatter, body] = frontmatterMatch;

  // Parse existing frontmatter
  const lines = frontmatter.split("\n");
  const props = {};
  for (const line of lines) {
    const match = line.match(/^(\w+[-\w]*?):\s*(.*)$/);
    if (match) {
      props[match[1]] = match[2].replace(/^["']|["']$/g, "");
    }
  }

  // Create new frontmatter
  const newFrontmatter = [
    "---",
    `name: ${commandName}`,
    `description: ${props.description || ""}`,
    "---",
  ].join("\n");

  // Update body to reference relative paths
  let newBody = body
    .replace(/CLAUDE\.md/g, "[AGENTS.md](../../AGENTS.md)")
    .replace(
      /\.claude\/skills\/([^/]+)\/SKILL\.md/g,
      "[../skills/$1/](../skills/$1/)"
    )
    .replace(
      /\.claude\/skills\/([^/]+)\//g,
      "[../skills/$1/](../skills/$1/)"
    );

  return `${newFrontmatter}\n${newBody}`;
}

function syncCommandsToPrompts() {
  log("\n[2/3] Checking commands → prompts...");

  const claudeCommandsDir = path.join(CLAUDE_DIR, "commands");
  const githubPromptsDir = path.join(GITHUB_DIR, "prompts");

  if (!fs.existsSync(claudeCommandsDir)) {
    verbose("No .claude/commands/ directory found");
    return { ok: true, updated: 0, missing: 0 };
  }

  // Ensure .github/prompts exists
  if (!fs.existsSync(githubPromptsDir)) {
    if (CHECK_ONLY) {
      error(".github/prompts/ directory missing");
      return { ok: false, updated: 0, missing: 1 };
    }
    fs.mkdirSync(githubPromptsDir, { recursive: true });
    verbose("Created .github/prompts/");
  }

  const commands = fs
    .readdirSync(claudeCommandsDir)
    .filter((f) => f.endsWith(".md"));

  let updated = 0;
  let missing = 0;

  for (const command of commands) {
    const commandPath = path.join(claudeCommandsDir, command);
    const commandName = command.replace(".md", "");
    const promptName = `${commandName}.prompt.md`;
    const promptPath = path.join(githubPromptsDir, promptName);

    const commandStat = fs.statSync(commandPath);

    // Check if prompt exists and is up to date
    if (fs.existsSync(promptPath)) {
      const promptStat = fs.statSync(promptPath);
      if (promptStat.mtime >= commandStat.mtime) {
        verbose(`✓ ${promptName} (up to date)`);
        continue;
      }
      verbose(`~ ${promptName} (command modified)`);
    } else {
      verbose(`✗ ${promptName} (missing)`);
    }

    if (CHECK_ONLY) {
      missing++;
      continue;
    }

    // Transform and write
    const content = fs.readFileSync(commandPath, "utf-8");
    const transformed = transformCommand(content, commandName);
    fs.writeFileSync(promptPath, transformed);
    verbose(`+ ${promptName} (updated)`);
    updated++;
  }

  if (CHECK_ONLY && missing > 0) {
    error(`${missing} prompts missing or outdated`);
    return { ok: false, updated, missing };
  }

  if (updated > 0) {
    log(`  Updated ${updated} prompts`);
  } else {
    log(`  All ${commands.length} prompts up to date`);
  }

  return { ok: true, updated, missing };
}

// ============================================================================
// 3. Hook Configs Validation
// ============================================================================

function validateHookConfigs() {
  log("\n[3/3] Validating hook configs...");

  const githubHooksDir = path.join(GITHUB_DIR, "hooks");

  if (!fs.existsSync(githubHooksDir)) {
    verbose("No .github/hooks/ directory found");
    return { ok: true, issues: [] };
  }

  const configs = fs
    .readdirSync(githubHooksDir)
    .filter((f) => f.endsWith(".json"));

  const issues = [];

  for (const configFile of configs) {
    const configPath = path.join(githubHooksDir, configFile);

    try {
      const content = fs.readFileSync(configPath, "utf-8");
      const config = JSON.parse(content);

      // Check all commands reference existing scripts
      const allHooks = [
        ...(config.hooks?.preToolUse || []),
        ...(config.hooks?.postToolUse || []),
        ...(config.hooks?.sessionStart || []),
      ];

      for (const hook of allHooks) {
        if (hook.type === "command" && hook.command) {
          // Extract script path from command
          const scriptMatch = hook.command.match(
            /node\s+([^\s]+)/
          );
          if (scriptMatch) {
            const scriptPath = path.join(ROOT, scriptMatch[1]);
            if (!fs.existsSync(scriptPath)) {
              issues.push({
                file: configFile,
                message: `Script not found: ${scriptMatch[1]}`,
              });
            }
          }
        }
      }

      verbose(`✓ ${configFile} (valid)`);
    } catch (e) {
      issues.push({
        file: configFile,
        message: `Invalid JSON: ${e.message}`,
      });
      verbose(`✗ ${configFile} (invalid JSON)`);
    }
  }

  if (issues.length > 0) {
    for (const issue of issues) {
      error(`${issue.file}: ${issue.message}`);
    }
    return { ok: false, issues };
  }

  log(`  All ${configs.length} hook configs valid`);
  return { ok: true, issues };
}

// ============================================================================
// Main
// ============================================================================

function main() {
  log("=== Copilot Sync ===");

  if (CHECK_ONLY) {
    log("Running in check mode (no changes will be made)");
  }

  const results = {
    skills: syncSkillSymlinks(),
    prompts: syncCommandsToPrompts(),
    hooks: validateHookConfigs(),
  };

  log("\n=== Summary ===");

  const allOk =
    results.skills.ok && results.prompts.ok && results.hooks.ok;

  if (allOk) {
    if (CHECK_ONLY) {
      log("All checks passed!");
    } else {
      log("Sync complete!");
    }
    process.exit(0);
  } else {
    if (CHECK_ONLY) {
      log("Some checks failed. Run without --check to fix.");
    } else {
      log("Sync completed with errors.");
    }
    process.exit(1);
  }
}

main();
