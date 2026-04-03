import { spawnSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { runCodebaseIndex } from "./codebase-index.ts";
import { runHooksBuilder } from "./hooks-builder.ts";
import { runNextjsPolicy } from "./nextjs-policy.ts";
import { runSyncCopilot } from "./sync-copilot.ts";
import { runWorkflowAudit } from "./workflow-audit.ts";
import { runWorkflowBootstrap } from "./workflow-bootstrap.ts";
import { runWorkflowDoctor } from "./workflow-doctor.ts";
import { runWorkflowHook } from "./workflow-hook.ts";

interface TaskDefinition {
  command?: string;
  description: string;
  fn?: (args: string[]) => Promise<void>;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = resolve(__dirname, "../../..");

const TASKS: Record<string, TaskDefinition> = {
  "build": {
    command: "next build --webpack",
    description: "Production build",
  },
  "build:analyze": {
    command: "cross-env ANALYZE=true next build --webpack",
    description: "Build with bundle analyzer",
  },
  "build:storybook": {
    command: "storybook build",
    description: "Build Storybook",
  },
  "check-types": {
    command: "tsc --noEmit",
    description: "TypeScript type checking",
  },
  "codebase:index": {
    description: "Run codebase indexer",
    fn: async (args) => {
      runCodebaseIndex(args);
    },
  },
  "db:generate": {
    command: "drizzle-kit generate",
    description: "Generate Drizzle migration files",
  },
  "db:migrate": {
    command: "drizzle-kit migrate",
    description: "Apply database migrations",
  },
  "db:migrate:test": {
    command: "cross-env NODE_ENV=test drizzle-kit migrate",
    description: "Apply test database migrations",
  },
  "db:prepare:test": {
    command:
      'cross-env-shell "TEST_DB_URL=${DATABASE_URL_TEST:-file:src/shared/db/local/test.sqlite}; TEST_DB_PATH=${TEST_DB_URL#file:}; mkdir -p $(dirname \\"$TEST_DB_PATH\\"); rm -f \\"$TEST_DB_PATH\\" \\"$TEST_DB_PATH\\"-wal \\"$TEST_DB_PATH\\"-shm" && cross-env NODE_ENV=test drizzle-kit migrate',
    description: "Reset and migrate test database",
  },
  "db:reset:test": {
    command:
      'cross-env-shell "TEST_DB_URL=${DATABASE_URL_TEST:-file:src/shared/db/local/test.sqlite}; TEST_DB_PATH=${TEST_DB_URL#file:}; mkdir -p $(dirname \\"$TEST_DB_PATH\\"); rm -f \\"$TEST_DB_PATH\\" \\"$TEST_DB_PATH\\"-wal \\"$TEST_DB_PATH\\"-shm"',
    description: "Reset test database file",
  },
  "db:seed": {
    command: "npx tsx src/shared/db/seeds/index.ts",
    description: "Seed database",
  },
  "db:studio": {
    command: "drizzle-kit studio",
    description: "Open Drizzle Studio",
  },
  "dev": {
    command: "next dev --webpack",
    description: "Start development server",
  },
  "dev:storybook": {
    command: "storybook dev -p 6006 --no-open",
    description: "Start Storybook dev server",
  },
  "format": {
    command: "prettier --write .",
    description: "Format project files",
  },
  "hooks:build": {
    description: "Generate hook configurations from single source",
    fn: async () => {
      await runHooksBuilder();
    },
  },
  "lint": {
    command: "run-s lint:eslint lint:css lint:check",
    description: "Run all lint checks",
  },
  "lint:check": {
    command:
      "node --experimental-strip-types --no-warnings bin/vibe lint:check",
    description: "Run custom lint checks",
  },
  "lint:css": {
    command: 'stylelint "src/**/*.module.css"',
    description: "Run Stylelint",
  },
  "lint:eslint": {
    command: "eslint",
    description: "Run ESLint",
  },
  "nextjs:policy": {
    description: "Run Next.js policy checks",
    fn: async (args) => {
      runNextjsPolicy(args);
    },
  },
  "start": {
    command: "next start",
    description: "Start production server",
  },
  "sync:copilot": {
    description: "Sync Claude commands to Copilot prompts",
    fn: async (args) => {
      await runSyncCopilot(args);
    },
  },
  "sync:copilot:check": {
    description: "Check Claude and Copilot sync status",
    fn: async () => {
      await runSyncCopilot(["--check"]);
    },
  },
  "test": {
    command: "vitest run",
    description: "Run tests once",
  },
  "test:coverage": {
    command: "vitest run --coverage",
    description: "Run tests with coverage",
  },
  "test:e2e": {
    command: "playwright test",
    description: "Run end-to-end tests",
  },
  "test:e2e:headed": {
    command: "playwright test --headed",
    description: "Run end-to-end tests in headed mode",
  },
  "test:e2e:ui": {
    command: "playwright test --ui",
    description: "Run end-to-end tests in UI mode",
  },
  "test:watch": {
    command: "vitest",
    description: "Run tests in watch mode",
  },
  "workflow:audit": {
    description: "Audit module and shared structure against conventions",
    fn: async (args) => {
      runWorkflowAudit(args);
    },
  },
  "workflow:bootstrap": {
    description: "Bootstrap or reset workflow state for a new task",
    fn: async (args) => {
      runWorkflowBootstrap(args);
    },
  },
  "workflow:doctor": {
    description: "Diagnose workflow and project structure health",
    fn: async () => {
      runWorkflowDoctor();
    },
  },
  "workflow:hook": {
    description: "Run workflow hook script with subcommand",
    fn: async (args) => {
      runWorkflowHook(args);
    },
  },
  "workflow:state:validate": {
    description: "Validate workflow state file",
    fn: async () => {
      runWorkflowHook(["validate-state"]);
    },
  },
};

function shellQuote(value: string): string {
  if (value.length === 0) return "''";
  return `'${value.replace(/'/g, "'\\''")}'`;
}

function listTasks(): void {
  const entries = Object.entries(TASKS).sort(([a], [b]) => a.localeCompare(b));

  console.log("\n  Available tasks:\n");

  const maxLen = Math.max(...entries.map(([name]) => name.length));
  for (const [name, def] of entries) {
    console.log(`    ${name.padEnd(maxLen + 2)} ${def.description}`);
  }

  console.log("\n  Usage:\n");
  console.log("    ./bin/vibe task <name> [-- <args>]\n");
}

function splitForwardArgs(args: string[]): string[] {
  const separatorIndex = args.indexOf("--");

  if (separatorIndex === -1) {
    return args;
  }

  return args.slice(separatorIndex + 1);
}

async function runTask(
  taskName: string,
  forwardedArgs: string[],
): Promise<number> {
  const def = TASKS[taskName];

  if (!def) {
    console.error(`\n  Unknown task: ${taskName}\n`);
    listTasks();
    return 1;
  }

  if (def.fn) {
    await def.fn(forwardedArgs);
    return 0;
  }

  if (!def.command) {
    console.error(`\n  Task "${taskName}" has no command or fn defined.\n`);
    return 1;
  }

  const extra = forwardedArgs.map(shellQuote).join(" ");
  const command = extra.length > 0 ? `${def.command} ${extra}` : def.command;

  const result = spawnSync(command, {
    cwd: PROJECT_ROOT,
    shell: true,
    stdio: "inherit",
  });

  if (typeof result.status === "number") {
    return result.status;
  }

  return result.error ? 1 : 0;
}

async function run(args?: string[]): Promise<void> {
  const input = args ?? [];
  const taskName = input[0];

  if (!taskName || taskName === "--help" || taskName === "-h") {
    listTasks();
    return;
  }

  const forwardedArgs = splitForwardArgs(input.slice(1));
  const code = await runTask(taskName, forwardedArgs);

  if (code !== 0) {
    process.exit(code);
  }
}

export const command = {
  description: "Run standardized project tasks from a single command bus",
  name: "task",
  run,
};

export function help(): void {
  console.log(`  Run project tasks through the vibe command bus.

  Usage:
    ./bin/vibe task <name>
    ./bin/vibe task <name> -- <args>

  Examples:
    ./bin/vibe task dev
    ./bin/vibe task lint
    ./bin/vibe task test -- --run
`);
}
