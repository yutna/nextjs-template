/**
 * bin/cli/commands/check-parity.ts
 *
 * Check for drift between Claude commands and Copilot prompts
 * Usage: ./bin/vibe check-parity
 * Usage: ./bin/vibe check-parity --all
 */

import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const COMMAND_DIR = ".claude/commands";
const PROMPT_DIR = ".github/prompts";

const PARITY_PAIRS = [["create-module.md", "create-module.prompt.md"]];

const SYNC_RULES = [
  {
    description: "Both must prohibit grouping-folder barrel re-exports",
    name: "barrel-export-prohibition",
    patterns: [
      /grouping.folder.*barrel/i,
      /no.*barrel.*re.export/i,
      /prohibited.*barrel/i,
    ],
  },
  {
    description: "Both must allow scoped helpers inside concrete folders",
    name: "scoped-helpers-allowed",
    patterns: [/helpers\.ts.*inside.*domain/i, /scoped.*helpers/i],
  },
  {
    description: "Both must emphasize concrete examples over grouping folders",
    name: "concrete-slice-first",
    patterns: [/concrete.slice/i, /specific.*example/i],
  },
];

function getStagedFiles(): string[] {
  try {
    const output = execSync("git diff --cached --name-only", {
      encoding: "utf-8",
    });
    return output.split("\n").filter(Boolean);
  } catch {
    return [];
  }
}

function readFile(filePath: string): null | string {
  if (!fs.existsSync(filePath)) return null;
  return fs.readFileSync(filePath, "utf-8");
}

function extractRuleText(content: string): string {
  const withoutFrontmatter = content.replace(/^---[\s\S]*?---\n/, "");
  return withoutFrontmatter.toLowerCase();
}

function hasPattern(content: string, patterns: RegExp[]): boolean {
  const text = extractRuleText(content);
  return patterns.some((pattern) => pattern.test(text));
}

interface ParityResult {
  commandHas: boolean;
  description: string;
  promptHas: boolean;
  rule: string;
}

function comparePairParity(
  commandPath: string,
  promptPath: string,
): {
  issues: ParityResult[];
  message: string;
  ok: boolean;
} {
  const commandContent = readFile(commandPath);
  const promptContent = readFile(promptPath);

  if (!commandContent || !promptContent) {
    return {
      issues: [],
      message: `Missing file: ${!commandContent ? commandPath : promptPath}`,
      ok: false,
    };
  }

  const issues: ParityResult[] = [];

  for (const rule of SYNC_RULES) {
    const commandHasRule = hasPattern(commandContent, rule.patterns);
    const promptHasRule = hasPattern(promptContent, rule.patterns);

    if (commandHasRule !== promptHasRule) {
      issues.push({
        commandHas: commandHasRule,
        description: rule.description,
        promptHas: promptHasRule,
        rule: rule.name,
      });
    }
  }

  return {
    issues,
    message:
      issues.length === 0
        ? "✅ Parity OK"
        : `❌ Parity issues found: ${issues.length}`,
    ok: issues.length === 0,
  };
}

interface ModDrift {
  commandModified: boolean;
  pair: [string, string];
  promptModified: boolean;
}

function checkModificationParity(stagedFiles: string[]): ModDrift[] {
  const issues: ModDrift[] = [];

  for (const [cmdFile, promptFile] of PARITY_PAIRS) {
    const cmdPath = path.join(COMMAND_DIR, cmdFile);
    const promptPath = path.join(PROMPT_DIR, promptFile);

    const cmdModified = stagedFiles.includes(cmdPath);
    const promptModified = stagedFiles.includes(promptPath);

    if (cmdModified !== promptModified) {
      issues.push({
        commandModified: cmdModified,
        pair: [cmdFile, promptFile],
        promptModified: promptModified,
      });
    }
  }

  return issues;
}

const DETECT_PATTERNS = [
  /barrel.*export/i,
  /scoped.*helpers/i,
  /concrete.*slice/i,
];

function detectParity(): void {
  console.log("\n🔍 Checking Claude/Copilot command-prompt parity...\n");

  let hasWarnings = false;

  for (const [cmdFile, promptFile] of PARITY_PAIRS) {
    const cmdPath = path.join(COMMAND_DIR, cmdFile);
    const promptPath = path.join(PROMPT_DIR, promptFile);

    if (!fs.existsSync(cmdPath) || !fs.existsSync(promptPath)) continue;

    try {
      const cmdContent = fs.readFileSync(cmdPath, "utf-8");
      const promptContent = fs.readFileSync(promptPath, "utf-8");

      let mismatchCount = 0;
      for (const pattern of DETECT_PATTERNS) {
        const cmdHas = pattern.test(extractRuleText(cmdContent));
        const promptHas = pattern.test(extractRuleText(promptContent));
        if (cmdHas !== promptHas) mismatchCount++;
      }

      if (mismatchCount > 0) {
        console.log(
          `⚠️  Parity Drift Detected in: ${path.basename(cmdPath)} ↔ ${path.basename(promptPath)}`,
        );
        console.log(`   Found ${mismatchCount} content mismatch(es)\n`);
        hasWarnings = true;
      }
    } catch {
      // Silent fail if can't read files
    }
  }

  if (hasWarnings) {
    console.log(
      "💡 Reminder: Updated one toolchain file?\n   Run: ./bin/vibe parity-check\n",
    );
    console.log("   📖 See: CONTRIBUTING.md § Dual-Toolchain Parity\n");
  } else {
    console.log("✅ Parity check: OK\n");
  }
}

async function run(args?: string[]): Promise<void> {
  if (args?.includes("detect")) {
    detectParity();
    return;
  }

  const checkAll = args?.includes("--all") ?? false;
  const stagedFiles = getStagedFiles();

  console.log(
    "🔍 Checking parity between Claude commands and Copilot prompts\n",
  );

  let hasErrors = false;

  // Check 1: Modification parity
  if (stagedFiles.length > 0 && !checkAll) {
    const modDrift = checkModificationParity(stagedFiles);

    if (modDrift.length > 0) {
      console.log("⚠️  Modification Parity Issues:");
      modDrift.forEach((drift) => {
        console.log(
          `  ❌ ${drift.pair[0]} (${drift.commandModified ? "✏️ modified" : "unchanged"}) vs \n     ${drift.pair[1]} (${drift.promptModified ? "✏️ modified" : "unchanged"})`,
        );
        console.log(`     👉 When changing one file, update the other too!\n`);
      });
      hasErrors = true;
    }
  }

  // Check 2: Content parity
  for (const [cmdFile, promptFile] of PARITY_PAIRS) {
    const cmdPath = path.join(COMMAND_DIR, cmdFile);
    const promptPath = path.join(PROMPT_DIR, promptFile);

    const result = comparePairParity(cmdPath, promptPath);

    if (!result.ok) {
      console.log(`\n📋 Pair: ${cmdFile} ↔ ${promptFile}`);
      console.log(`  ${result.message}`);
      result.issues.forEach((issue) => {
        console.log(`    • ${issue.rule}`);
        console.log(
          `      Command has: ${issue.commandHas ? "✅" : "❌"}, Prompt has: ${issue.promptHas ? "✅" : "❌"}`,
        );
        console.log(`      → ${issue.description}\n`);
      });
      hasErrors = true;
    } else {
      console.log(`\n✅ ${cmdFile} ↔ ${promptFile}: ${result.message}`);
    }
  }

  if (hasErrors) {
    console.log(
      "\n\n🛑 PARITY CHECK FAILED\n\nTo fix:\n  1. Review the parity issues above\n  2. Update both files to match\n  3. Try again\n",
    );
    process.exit(1);
  }

  console.log("\n✨ All parity checks passed!\n");
  process.exit(0);
}

export const command = {
  description: "Check parity between Claude and Copilot toolchains",
  name: "parity-check",
  run,
};
