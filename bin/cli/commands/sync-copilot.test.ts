import { describe, expect, it } from "vitest";

import { comparePromptContent } from "./sync-copilot.ts";

describe("syncCommandsToPrompts", () => {
  const commandContent = `---
description: Review code changes
---
Use CLAUDE.md and .claude/skills/test/SKILL.md.
`;

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
  });
});
