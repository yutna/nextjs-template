import { execSync } from "node:child_process";
import { existsSync } from "node:fs";

function outputContinue(systemMessage?: string): void {
  if (systemMessage) {
    const escaped = systemMessage.replace(/"/g, '\\"').replace(/\n/g, " ");
    console.log(`{"continue": true, "systemMessage": "${escaped}"}`);
  } else {
    console.log('{"continue": true}');
  }
}

function hasLintScript(): boolean {
  try {
    if (!existsSync("package.json")) {
      return false;
    }

    const pkg = execSync("cat package.json", { encoding: "utf8" });
    return pkg.includes('"lint"');
  } catch {
    return false;
  }
}

export const command = {
  name: "hooks:lint",
  description: "Run lint check before session ends (Stop hook)",
  run: async (): Promise<void> => {
    try {
      if (!hasLintScript()) {
        outputContinue();
        return;
      }

      let lintOutput = "";
      let lintFailed = false;

      try {
        lintOutput = execSync("npm run lint -- --quiet 2>&1", {
          encoding: "utf8",
          timeout: 55_000,
        });
      } catch (error: unknown) {
        lintFailed = true;

        if (
          error &&
          typeof error === "object" &&
          "stdout" in error &&
          typeof (error as { stdout: unknown }).stdout === "string"
        ) {
          lintOutput = (error as { stdout: string }).stdout;
        }
      }

      if (!lintFailed || !lintOutput.trim()) {
        outputContinue();
        return;
      }

      const lines = lintOutput.trim().split("\n");
      const errorCount = lines.filter((l) =>
        /error|✖|✗/i.test(l),
      ).length;
      const firstErrors = lines.slice(0, 5).join(" ").slice(0, 200);
      const message = `Lint check found issues (approx ${errorCount} errors). First few: ${firstErrors}`;

      outputContinue(message);
    } catch {
      outputContinue();
    }
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
