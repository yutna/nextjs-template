import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/features/landing/components/hooks/use-vibe", () => ({
  useVibe: vi.fn(() => ({
    handleChangeVolume: vi.fn(),
    handleToggleVibe: vi.fn(),
    isVibeOn: false,
    volume: 50,
  })),
}));

beforeEach(() => {
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: vi.fn().mockReturnValue({
      addEventListener: vi.fn(),
      matches: false,
      removeEventListener: vi.fn(),
    }),
  });
});

describe("useVibeControls", () => {
  it("returns isDesktop false when matchMedia does not match", async () => {
    const { useVibeControls } = await import("./use-vibe-controls");
    const { renderHook } = await import("@testing-library/react");

    const { result } = renderHook(() => useVibeControls());

    expect(result.current.isDesktop).toBe(false);
    expect(result.current.isVibeOn).toBe(false);
    expect(result.current.volume).toBe(50);
    expect(typeof result.current.handleChangeVolume).toBe("function");
    expect(typeof result.current.handleToggleVibe).toBe("function");
  });
});
