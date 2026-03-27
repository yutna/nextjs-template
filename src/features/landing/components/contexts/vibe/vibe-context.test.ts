import { describe, expect, it } from "vitest";

import { VibeContext } from "./vibe-context";

describe("VibeContext", () => {
  it("is defined with a null default value", () => {
    expect(VibeContext).toBeDefined();
  });
});
