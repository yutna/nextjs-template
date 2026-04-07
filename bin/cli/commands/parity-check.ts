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

import type {
  ModDrift,
  PairComparisonResult,
  ParityPair,
  ParityResult,
  ParityRule,
} from "./types/parity-check";

const COMMAND_DIR = ".claude/commands";
const PROMPT_DIR = ".github/prompts";

const CREATE_MODULE_RULES: ParityRule[] = [
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

const DISCOVERY_RULES: ParityRule[] = [
  {
    description: "Both must require explicit and testable acceptance criteria",
    name: "explicit-testable-acceptance-criteria",
    patterns: [/acceptance criteria must be explicit and testable/i],
  },
  {
    description: "Both must recommend decomposition for large likely scope",
    name: "large-scope-decomposition",
    patterns: [/decompose-requirements[\s\S]*before planning/i],
  },
  {
    description:
      "Both must capture data or state expectations during Discovery",
    name: "data-state-expectations",
    patterns: [/data\/state expectations/i],
  },
];

const PLAN_RULES: ParityRule[] = [
  {
    description: "Both must require exact file count in scope",
    name: "exact-file-count",
    patterns: [/exact file count in scope/i],
  },
  {
    description: "Both must require predicted implementation complexity",
    name: "predicted-implementation-complexity",
    patterns: [/predicted implementation complexity/i],
  },
  {
    description:
      "Both must require a decomposition artifact path for large work",
    name: "decomposition-artifact-path",
    patterns: [/decomposition artifact path/i],
  },
  {
    description:
      "Both must require DB planning metadata when work touches the database",
    name: "db-planning-metadata",
    patterns: [
      /target env[\s\S]*migration impact[\s\S]*rollback[\s\S]*seed determinism[\s\S]*test isolation/i,
    ],
  },
];

const IMPLEMENT_RULES: ParityRule[] = [
  {
    description:
      "Both must require checkpoint-stop behavior for non-trivial implementation",
    name: "checkpoint-stop",
    patterns: [/checkpoint-stop behavior/i],
  },
  {
    description:
      "Both must stop when implementation exceeds the approved slice",
    name: "approved-slice-boundary",
    patterns: [/implementation exceeds the approved slice/i],
  },
  {
    description: "Both must require one primary responsibility per file",
    name: "one-primary-responsibility",
    patterns: [/one primary responsibility/i],
  },
  {
    description:
      "Both must forbid local type declarations in implementation files",
    name: "no-local-implementation-types",
    patterns: [/do not declare types inside implementation files/i],
  },
];

const PARITY_PAIRS: ParityPair[] = [
  {
    commandFile: "create-module.md",
    promptFile: "create-module.prompt.md",
    rules: CREATE_MODULE_RULES,
  },
  {
    commandFile: "discover.md",
    promptFile: "discover.prompt.md",
    rules: DISCOVERY_RULES,
  },
  {
    commandFile: "plan-work.md",
    promptFile: "plan-work.prompt.md",
    rules: PLAN_RULES,
  },
  {
    commandFile: "implement.md",
    promptFile: "implement.prompt.md",
    rules: IMPLEMENT_RULES,
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

function comparePairParity(pair: ParityPair): PairComparisonResult {
  const commandPath = path.join(COMMAND_DIR, pair.commandFile);
  const promptPath = path.join(PROMPT_DIR, pair.promptFile);
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

  for (const rule of pair.rules) {
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

function checkModificationParity(stagedFiles: string[]): ModDrift[] {
  const issues: ModDrift[] = [];

  for (const pair of PARITY_PAIRS) {
    const cmdPath = path.join(COMMAND_DIR, pair.commandFile);
    const promptPath = path.join(PROMPT_DIR, pair.promptFile);

    const cmdModified = stagedFiles.includes(cmdPath);
    const promptModified = stagedFiles.includes(promptPath);

    if (cmdModified !== promptModified) {
      issues.push({
        commandModified: cmdModified,
        pair: [pair.commandFile, pair.promptFile],
        promptModified: promptModified,
      });
    }
  }

  return issues;
}

function detectParity(): void {
  console.log("\n🔍 Checking Claude/Copilot command-prompt parity...\n");

  let hasWarnings = false;

  for (const pair of PARITY_PAIRS) {
    const cmdPath = path.join(COMMAND_DIR, pair.commandFile);
    const promptPath = path.join(PROMPT_DIR, pair.promptFile);

    if (!fs.existsSync(cmdPath) || !fs.existsSync(promptPath)) continue;

    try {
      const result = comparePairParity(pair);

      if (!result.ok) {
        console.log(
          `⚠️  Parity Drift Detected in: ${path.basename(cmdPath)} ↔ ${path.basename(promptPath)}`,
        );
        console.log(`   Found ${result.issues.length} content mismatch(es)\n`);
        hasWarnings = true;
      }
    } catch {
      // Silent fail if can't read files
    }
  }

  if (hasWarnings) {
    console.log(
      "💡 Reminder: Updated one toolchain file?\n   Run: npm run parity:all\n",
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
  for (const pair of PARITY_PAIRS) {
    const result = comparePairParity(pair);

    if (!result.ok) {
      console.log(`\n📋 Pair: ${pair.commandFile} ↔ ${pair.promptFile}`);
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
      console.log(
        `\n✅ ${pair.commandFile} ↔ ${pair.promptFile}: ${result.message}`,
      );
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
