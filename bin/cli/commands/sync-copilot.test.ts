import { describe, expect, it } from "vitest";

import { comparePromptContent, transformCommand } from "./sync-copilot.ts";

describe("syncCommandsToPrompts", () => {
  const commandContent = `---
description: Review code changes
---
Use CLAUDE.md and .claude/skills/test/SKILL.md.
`;

  it("rewrites workflow and skill references to the committed prompt style", () => {
    const transformed = transformCommand(
      `---
description: Execute an approved plan
---
Invoke \`.claude/skills/convention-tiering/SKILL.md\` first.
Then invoke \`.claude/skills/code-conventions/SKILL.md\` before editing.
Use \`.claude/skills/state-sync/SKILL.md\` whenever workflow state changes.
Follow CLAUDE.md closely.
`,
      "implement",
    );

    expect(transformed).toContain("name: implement");
    expect(transformed).toContain("[AGENTS.md](../../AGENTS.md)");
    expect(transformed).toContain(
      "Invoke the [convention-tiering skill](../skills/convention-tiering/) first.",
    );
    expect(transformed).toContain(
      "Then invoke the [code-conventions skill](../skills/code-conventions/) before editing.",
    );
    expect(transformed).toContain(
      "Use the [state-sync skill](../skills/state-sync/) whenever workflow state changes.",
    );
  });

  it("flags stale prompt content even when the prompt mtime is newer", () => {
    const result = comparePromptContent({
      commandContent,
      commandMtime: new Date("2024-01-01T00:00:00.000Z"),
      commandName: "review",
      promptContent: "stale prompt content",
      promptMtime: new Date("2024-02-01T00:00:00.000Z"),
    });

    expect(result.inSync).toBe(false);
    expect(result.missing).toBe(false);
    expect(result.driftReason).toBe("content drift detected");
    expect(result.expectedPromptContent).toContain("name: review");
  });

  it("flags missing prompts", () => {
    const result = comparePromptContent({
      commandContent,
      commandName: "review",
    });

    expect(result.inSync).toBe(false);
    expect(result.missing).toBe(true);
    expect(result.expectedPromptContent).toContain(
      "[AGENTS.md](../../AGENTS.md)",
    );
    expect(result.expectedPromptContent).toContain(
      "the [test skill](../skills/test/)",
    );
  });
});
