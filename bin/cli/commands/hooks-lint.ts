import { Effect } from "effect";
import { execSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";

function outputContinue(systemMessage?: string): void {
  const payload: Record<string, unknown> = { continue: true };

  if (systemMessage) {
    payload.systemMessage = systemMessage;
  }

  console.log(JSON.stringify(payload));
}

const hasStdout = (error: unknown): error is { stdout: string } =>
  typeof error === "object" &&
  error !== null &&
  "stdout" in error &&
  typeof (error as Record<string, unknown>).stdout === "string";

class LintFailedError {
  readonly _tag = "LintFailedError";
  readonly cause: unknown;
  constructor(cause: unknown) {
    this.cause = cause;
  }
}

const hasLintScript = Effect.try(() => {
  if (!existsSync("package.json")) return false;
  const content = readFileSync("package.json", "utf8");
  return content.includes('"lint"');
}).pipe(Effect.catchAll(() => Effect.succeed(false)));

const runLint = Effect.try({
  catch: (error) => new LintFailedError(error),
  try: () =>
    execSync("npm run lint -- --quiet 2>&1", {
      encoding: "utf8",
      timeout: 55_000,
    }),
}).pipe(
  Effect.map((output) => ({ failed: false, output })),
  Effect.catchTag("LintFailedError", (err) =>
    Effect.succeed({
      failed: true,
      output: hasStdout(err.cause) ? err.cause.stdout : "",
    }),
  ),
);

const formatMessage = (output: string): string => {
  const lines = output.trim().split("\n");
  const errorCount = lines.filter((l) => /error|✖|✗/i.test(l)).length;
  const firstErrors = lines.slice(0, 5).join(" ").slice(0, 200);
  return `Lint check found issues (approx ${errorCount} errors). First few: ${firstErrors}`;
};

const program = Effect.gen(function* () {
  const lintAvailable = yield* hasLintScript;

  if (!lintAvailable) return undefined;

  const result = yield* runLint;

  if (!result.failed || !result.output.trim()) return undefined;

  return formatMessage(result.output);
});

export const command = {
  description: "Run lint check before session ends (Stop hook)",
  name: "hooks:lint",
  run: async (): Promise<void> => {
    const message = await Effect.runPromise(
      program.pipe(Effect.catchAll(() => Effect.succeed(undefined))),
    );
    outputContinue(message);
  },
};

export function help(): void {
  console.log(`  Copilot Stop hook that runs lint before the session ends.

  Executes \`npm run lint -- --quiet\` and reports issues as a
  systemMessage warning. Never blocks the session.

  Output format:
    Success:  {"continue": true}
    Issues:   {"continue": true, "systemMessage": "Lint found..."}

  The hook is non-blocking — it warns but never prevents the
  session from ending.
`);
}
