import { act, fireEvent, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/render-with-providers";

import { ContainerCopyCommand } from "./container-copy-command";

vi.mock("@/modules/static-pages/hooks/use-vibe", () => ({
  useVibe: () => ({
    isVibeOn: false,
    setVolume: vi.fn(),
    toggleVibe: vi.fn(),
    volume: 50,
  }),
}));

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

describe("ContainerCopyCommand", () => {
  it("renders the copy button", () => {
    renderWithProviders(<ContainerCopyCommand />);
    expect(
      screen.getByRole("button", { name: "Copy command" }),
    ).toBeInTheDocument();
  });

  it("calls clipboard.writeText with the install command on click", async () => {
    renderWithProviders(<ContainerCopyCommand />);
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Copy command" }));
    });
    expect(mockWriteText).toHaveBeenCalledOnce();
  });

  it("shows 'Copied' label after clicking", async () => {
    renderWithProviders(<ContainerCopyCommand />);
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Copy command" }));
      await Promise.resolve();
    });
    expect(screen.getByRole("button", { name: "Copied" })).toBeInTheDocument();
  });

  it("reverts to 'Copy command' label after 2 seconds", async () => {
    renderWithProviders(<ContainerCopyCommand />);
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Copy command" }));
    });
    await act(async () => {
      vi.advanceTimersByTime(2000);
    });
    expect(
      screen.getByRole("button", { name: "Copy command" }),
    ).toBeInTheDocument();
  });
});
