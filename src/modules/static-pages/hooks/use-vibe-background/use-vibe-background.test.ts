import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/modules/static-pages/hooks/use-vibe", () => ({
  useVibe: vi.fn(() => ({
    handleChangeVolume: vi.fn(),
    handleToggleVibe: vi.fn(),
    isVibeOn: true,
    volume: 15,
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

describe("useVibeBackground", () => {
  it("returns isDesktop false when matchMedia does not match", async () => {
    // Dynamic import after mocks are set up
    const { useVibeBackground } = await import("./use-vibe-background");
    const { renderHook } = await import("@testing-library/react");

    const { result } = renderHook(() => useVibeBackground());

    expect(result.current.isDesktop).toBe(false);
    expect(result.current.isVibeOn).toBe(true);
    expect(result.current.iframeRef.current).toBeNull();
  });
});
