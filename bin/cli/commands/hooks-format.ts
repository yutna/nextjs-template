import { execSync } from "node:child_process";
import { existsSync } from "node:fs";

interface HookInput {
  tool_input?: Record<string, string>;
  tool_name?: string;
}

const EDITING_TOOLS = new Set([
  "editFiles",
  "create_file",
  "write_to_file",
  "edit",
  "create",
  "write",
  "insert",
  "replace",
  "update_file",
  "upsert_file",
]);

const FILE_PATH_KEYS = [
  "path",
  "file_path",
  "filePath",
  "file",
  "destination",
  "target",
  "filename",
];

function outputContinue(): void {
  console.log('{"continue": true}');
}

function readStdin(): Promise<string> {
  return new Promise((resolve) => {
    let data = "";

    process.stdin.setEncoding("utf8");
    process.stdin.on("data", (chunk: string) => {
      data += chunk;
    });
    process.stdin.on("end", () => resolve(data));
    process.stdin.on("error", () => resolve(""));

    // If stdin is not piped, resolve immediately
    if (process.stdin.isTTY) {
      resolve("");
    }
  });
}

function parseInput(raw: string): HookInput | undefined {
  try {
    return JSON.parse(raw) as HookInput;
  } catch {
    return undefined;
  }
}

function extractFilePath(input: HookInput): string | undefined {
  const toolInput = input.tool_input;

  if (!toolInput) {
    return undefined;
  }

  for (const key of FILE_PATH_KEYS) {
    const value = toolInput[key];

    if (value && typeof value === "string") {
      return value;
    }
  }

  return undefined;
}

function fileExists(filePath: string): boolean {
  try {
    return existsSync(filePath);
  } catch {
    return false;
  }
}

export const command = {
  description: "Auto-format files after Copilot edits (PostToolUse hook)",
  name: "hooks:format",
  run: async (): Promise<void> => {
    try {
      const raw = await readStdin();

      if (!raw.trim()) {
        outputContinue();
        return;
      }

      const input = parseInput(raw);

      if (!input?.tool_name || !EDITING_TOOLS.has(input.tool_name)) {
        outputContinue();
        return;
      }

      const filePath = extractFilePath(input);

      if (!filePath || !fileExists(filePath)) {
        outputContinue();
        return;
      }

      try {
        execSync(`npx prettier --write "${filePath}"`, {
          stdio: "ignore",
          timeout: 10_000,
        });
      } catch {
        // Format failure is non-blocking
      }

      outputContinue();
    } catch {
      outputContinue();
    }
  },
};

export function help(): void {
  console.log(`  Copilot PostToolUse hook that auto-formats edited files.

  This command reads JSON from stdin describing the tool that just ran.
  If the tool edited a file, it runs Prettier on that file.

  Always outputs {"continue": true} — never blocks the session.

  Stdin format:
    {"tool_name": "edit", "tool_input": {"path": "src/app/page.tsx"}}

  Recognized editing tools:
    editFiles, create_file, write_to_file, edit, create,
    write, insert, replace, update_file, upsert_file
`);
}
