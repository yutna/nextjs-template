#!/usr/bin/env node
"use strict";

/**
 * AI Hook: Detect parity drift between Claude commands and Copilot prompts
 *
 * This hook runs when Claude Code detects file modifications in:
 *   - .claude/commands/
 *   - .github/prompts/
 *
 * It checks if both files in a parity pair have been updated together,
 * and reminds the user if one was missed.
 */

const fs = require("node:fs");
const path = require("node:path");

const PARITY_PAIRS = [
  {
    claude: ".claude/commands/create-module.md",
    copilot: ".github/prompts/create-module.prompt.md",
  },
];

/**
 * Check if a file exists
 */
function fileExists(filePath) {
  try {
    return fs.existsSync(filePath);
  } catch {
    return false;
  }
}

/**
 * Extract rule text from markdown
 */
function extractRuleText(content) {
  const withoutFrontmatter = content.replace(/^---[\s\S]*?---\n/, "");
  return withoutFrontmatter.toLowerCase();
}

/**
 * Main detection logic
 */
function detectParity() {
  console.log("\n🔍 Checking Claude/Copilot command-prompt parity...\n");

  let hasWarnings = false;

  for (const pair of PARITY_PAIRS) {
    const claudeExists = fileExists(pair.claude);
    const copilotExists = fileExists(pair.copilot);

    if (!claudeExists || !copilotExists) {
      continue; // Skip if either file missing (first-time setup)
    }

    // Try to read both files for content checks
    try {
      const claudeContent = fs.readFileSync(pair.claude, "utf-8");
      const copilotContent = fs.readFileSync(pair.copilot, "utf-8");

      // Simple parity check: look for key keywords in both files
      const keywordPatterns = [
        /barrel.*export/i,
        /scoped.*helpers/i,
        /concrete.*slice/i,
      ];

      let mismatchCount = 0;
      for (const pattern of keywordPatterns) {
        const claudeHas = pattern.test(extractRuleText(claudeContent));
        const copilotHas = pattern.test(extractRuleText(copilotContent));

        if (claudeHas !== copilotHas) {
          mismatchCount++;
        }
      }

      if (mismatchCount > 0) {
        console.log(
          `⚠️  Parity Drift Detected in: ${path.basename(pair.claude)} ↔ ${path.basename(pair.copilot)}`,
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

// Run on module load
if (require.main === module) {
  detectParity();
}

module.exports = { detectParity };
