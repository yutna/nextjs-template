import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import { Effect } from "effect";

interface HookInput {
  tool_input?: Record<string, string>;
  tool_name?: string;
}

const EDITING_TOOLS = new Set([
  "create",
  "create_file",
  "edit",
  "editFiles",
  "insert",
  "replace",
  "update_file",
  "upsert_file",
  "write",
  "write_to_file",
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

const readStdin = Effect.tryPromise(
  () =>
    new Promise<string>((resolve) => {
      let data = "";

      process.stdin.setEncoding("utf8");
      process.stdin.on("data", (chunk: string) => {
        data += chunk;
      });
      process.stdin.on("end", () => resolve(data));
      process.stdin.on("error", () => resolve(""));

      if (process.stdin.isTTY) {
        resolve("");
      }
    }),
);

const parseInput = (raw: string) =>
  Effect.try(() => JSON.parse(raw) as HookInput);

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

const fileExists = (filePath: string) =>
  Effect.try(() => existsSync(filePath)).pipe(
    Effect.catchAll(() => Effect.succeed(false)),
  );

const formatFile = (filePath: string) =>
  Effect.try(() => {
    execSync(`npx prettier --write "${filePath}"`, {
      stdio: "ignore",
      timeout: 10_000,
    });
  });

const program = Effect.gen(function* () {
  const raw = yield* readStdin;

  if (!raw.trim()) return;

  const input = yield* parseInput(raw);

  if (!input.tool_name || !EDITING_TOOLS.has(input.tool_name)) return;

  const filePath = extractFilePath(input);

  if (!filePath) return;

  const exists = yield* fileExists(filePath);

  if (!exists) return;

  yield* formatFile(filePath).pipe(Effect.catchAll(() => Effect.void));
});

export const command = {
  description: "Auto-format files after Copilot edits (PostToolUse hook)",
  name: "hooks:format",
  run: async (): Promise<void> => {
    await Effect.runPromise(
      program.pipe(Effect.catchAll(() => Effect.void)),
    );
    outputContinue();
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
