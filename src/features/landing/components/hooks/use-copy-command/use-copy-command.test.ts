import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mockToasterCreate = vi.hoisted(() => vi.fn());

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));
vi.mock("@/shared/vendor/chakra-ui/toaster", () => ({
  toaster: {
    create: mockToasterCreate,
  },
}));

import { useCopyCommand } from "./use-copy-command.client";

const mockWriteText = vi.fn();

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
  mockWriteText.mockResolvedValue(undefined);
  mockToasterCreate.mockReset();
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

  it("shows an error toast when clipboard copying fails", async () => {
    mockWriteText.mockRejectedValueOnce(new Error("Permission denied"));

    const { result } = renderHook(() => useCopyCommand());

    await act(async () => {
      await result.current.handleCopy();
    });

    expect(result.current.isCopied).toBe(false);
    expect(mockToasterCreate).toHaveBeenCalledWith({
      closable: true,
      description: "copyFailedDescription",
      title: "copyFailedTitle",
      type: "error",
    });
  });
});
