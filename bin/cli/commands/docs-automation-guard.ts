import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

interface Violation {
  filePath: string;
  message: string;
}

interface GuardRule {
  message: string;
  pattern: RegExp;
}

const DOCS_ROOT = "docs";
const EXTRA_FILES = ["CONTRIBUTING.md", "README.md"];

const PROHIBITED_RULES: GuardRule[] = [
  {
    message: "Found manual-driven workflow wording (user-driven phases)",
    pattern: /phase progression and gate discipline are still user-driven/i,
  },
  {
    message: "Found manual-driven quality loop wording",
    pattern: /you may need to drive this loop manually/i,
  },
  {
    message: "Found manual override guidance for core workflow phases",
    pattern: /manual override:\s*@workspace\s*\/plan-work/i,
  },
  {
    message: "Found optional manual override guidance",
    pattern: /optional manual override/i,
  },
  {
    message: "Found manual fallback guidance for gates",
    pattern: /manual fallback only when troubleshooting/i,
  },
];

const REQUIRED_PATTERNS: GuardRule[] = [
  {
    message: "Missing required manual action #1 (/decompose-requirements)",
    pattern: /Run\s*`?\/?decompose-requirements`?\s*for large features/i,
  },
  {
    message: "Missing required manual action #2 (switch orchestration mode)",
    pattern: /Switch\s+Copilot\s+to\s+orchestration\s+agent\s+mode/i,
  },
  {
    message: "Missing automation contract wording",
    pattern:
      /Everything else should be automated by prompts, hooks, scripts, and CI\./i,
  },
];

const CLAUDE_PROHIBITED_RULES: GuardRule[] = [
  {
    message: "Found manual Plan command in Claude quick reference",
    pattern: /^Plan:\s*\/plan-work\s*$/im,
  },
  {
    message: "Found manual Build command in Claude quick reference",
    pattern: /^Build:\s*\/implement\s*$/im,
  },
  {
    message: "Found manual quality gate command in Claude quick reference",
    pattern: /^Check quality:\s*\/gates\s*$/im,
  },
  {
    message: "Found manual Ship command in Claude quick reference",
    pattern: /^Ship it:\s*\/deliver\s*$/im,
  },
];

function collectMarkdownFiles(dirPath: string): string[] {
  if (!existsSync(dirPath)) return [];

  const files: string[] = [];

  for (const entry of readdirSync(dirPath, { withFileTypes: true })) {
    if (entry.name.startsWith(".")) continue;

    const fullPath = join(dirPath, entry.name);

    if (entry.isDirectory()) {
      files.push(...collectMarkdownFiles(fullPath));
      continue;
    }

    if (entry.isFile() && entry.name.endsWith(".md")) {
      files.push(fullPath);
    }
  }

  return files;
}

function checkProhibitedPatterns(
  filePath: string,
  content: string,
): Violation[] {
  const violations: Violation[] = [];

  for (const rule of PROHIBITED_RULES) {
    if (rule.pattern.test(content)) {
      violations.push({ filePath, message: rule.message });
    }
  }

  return violations;
}

function checkRequiredPatterns(filePath: string, content: string): Violation[] {
  const violations: Violation[] = [];

  for (const rule of REQUIRED_PATTERNS) {
    if (!rule.pattern.test(content)) {
      violations.push({ filePath, message: rule.message });
    }
  }

  return violations;
}

export function runDocsAutomationGuard(): void {
  const docsFiles = collectMarkdownFiles(DOCS_ROOT);
  const extraFiles = EXTRA_FILES.filter((filePath) => existsSync(filePath));
  const filesToCheck = [...docsFiles, ...extraFiles];

  const violations: Violation[] = [];

  for (const filePath of filesToCheck) {
    const content = readFileSync(filePath, "utf8");
    violations.push(...checkProhibitedPatterns(filePath, content));
  }

  const copilotWorkflowPath = "docs/ai/GITHUB_COPILOT_WORKFLOW.md";
  if (existsSync(copilotWorkflowPath)) {
    const copilotWorkflowContent = readFileSync(copilotWorkflowPath, "utf8");
    violations.push(
      ...checkRequiredPatterns(copilotWorkflowPath, copilotWorkflowContent),
    );
  }

  const claudeWorkflowPath = "docs/ai/CLAUDE_WORKFLOW.md";
  if (existsSync(claudeWorkflowPath)) {
    const claudeWorkflowContent = readFileSync(claudeWorkflowPath, "utf8");
    for (const rule of CLAUDE_PROHIBITED_RULES) {
      if (rule.pattern.test(claudeWorkflowContent)) {
        violations.push({
          filePath: claudeWorkflowPath,
          message: rule.message,
        });
      }
    }
  }

  if (violations.length === 0) {
    console.log("✅ Docs automation guard passed");
    return;
  }

  console.error("❌ Docs automation guard failed\n");

  for (const violation of violations) {
    console.error(`- ${violation.filePath}: ${violation.message}`);
  }

  process.exit(1);
}

async function run(): Promise<void> {
  runDocsAutomationGuard();
}

export const command = {
  description: "Guard docs against manual-driven workflow regressions",
  name: "docs-automation-guard",
  run,
};

export function help(): void {
  console.log(`  Guard docs against manual-driven workflow regressions.

  Usage:
    ./bin/vibe docs-automation-guard
`);
}
