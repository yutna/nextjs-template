import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useCopyCommand } from "./use-copy-command";

const mockWriteText = vi.fn();

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
  mockWriteText.mockResolvedValue(undefined);
  Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    value: { writeText: mockWriteText },
    writable: true,
  });
});

afterEach(() => {
  vi.useRealTimers();
  vi.clearAllMocks();
});

describe("useCopyCommand", () => {
  it("starts with isCopied false", () => {
    const { result } = renderHook(() => useCopyCommand());
    expect(result.current.isCopied).toBe(false);
  });

  it("calls clipboard.writeText with the install command on handleCopy", async () => {
    const { result } = renderHook(() => useCopyCommand());
    await act(async () => {
      await result.current.handleCopy();
    });
    expect(mockWriteText).toHaveBeenCalledOnce();
  });

  it("sets isCopied to true after handleCopy", async () => {
    const { result } = renderHook(() => useCopyCommand());
    await act(async () => {
      await result.current.handleCopy();
    });
    expect(result.current.isCopied).toBe(true);
  });

  it("reverts isCopied to false after 2 seconds", async () => {
    const { result } = renderHook(() => useCopyCommand());
    await act(async () => {
      await result.current.handleCopy();
    });
    expect(result.current.isCopied).toBe(true);
    await act(async () => {
      vi.advanceTimersByTime(2000);
    });
    expect(result.current.isCopied).toBe(false);
  });
});
