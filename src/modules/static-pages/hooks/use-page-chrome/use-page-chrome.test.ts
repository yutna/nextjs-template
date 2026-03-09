import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockReplace = vi.fn();

vi.mock("@/shared/lib/navigation", () => ({
  usePathname: vi.fn(() => "/dashboard"),
  useRouter: vi.fn(() => ({ replace: mockReplace })),
}));

import { usePageChrome } from "./use-page-chrome";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("usePageChrome", () => {
  it("calls router.replace with the new locale on locale switch", () => {
    const { result } = renderHook(() => usePageChrome({ locale: "en" }));

    act(() => {
      result.current.handleSwitchLocale("th");
    });

    expect(mockReplace).toHaveBeenCalledWith("/dashboard", { locale: "th" });
  });

  it("does not call router.replace when switching to the same locale", () => {
    const { result } = renderHook(() => usePageChrome({ locale: "en" }));

    act(() => {
      result.current.handleSwitchLocale("en");
    });

    expect(mockReplace).not.toHaveBeenCalled();
  });
});
