import { act, fireEvent, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/render-with-providers";

import { HERO_INSTALL_COMMAND } from "./constants";
import { CopyCommand } from "./copy-command";

vi.mock("@/modules/static-pages/hooks/use-vibe", () => ({
  useVibe: () => ({ isVibeOn: false, setVolume: vi.fn(), toggleVibe: vi.fn(), volume: 50 }),
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

describe("CopyCommand", () => {
  it("renders the install command text", () => {
    renderWithProviders(<CopyCommand />);
    expect(screen.getByText(HERO_INSTALL_COMMAND)).toBeInTheDocument();
  });

  it("shows 'Copy command' aria-label initially", () => {
    renderWithProviders(<CopyCommand />);
    expect(
      screen.getByRole("button", { name: "Copy command" }),
    ).toBeInTheDocument();
  });

  it("calls clipboard.writeText with the install command on click", async () => {
    renderWithProviders(<CopyCommand />);
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Copy command" }));
    });
    expect(mockWriteText).toHaveBeenCalledWith(HERO_INSTALL_COMMAND);
  });

  it("changes aria-label to 'Copied' after click", async () => {
    renderWithProviders(<CopyCommand />);
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Copy command" }));
      await Promise.resolve();
    });
    expect(screen.getByRole("button", { name: "Copied" })).toBeInTheDocument();
  });

  it("reverts aria-label to 'Copy command' after 2 seconds", async () => {
    renderWithProviders(<CopyCommand />);
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
