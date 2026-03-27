import { describe, expect, it } from "vitest";

import { VibeContext } from "./vibe-context.client";

describe("VibeContext", () => {
  it("is defined with a null default value", () => {
    expect(VibeContext).toBeDefined();
  });
});
