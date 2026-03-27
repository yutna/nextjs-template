import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useVibe } from "./use-vibe.client";

describe("useVibe", () => {
  it("throws when used outside VibeProvider", () => {
    expect(() => {
      renderHook(() => useVibe());
    }).toThrow("useVibe must be used within VibeProvider");
  });
});
