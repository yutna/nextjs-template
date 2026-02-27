import { act, fireEvent, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/render-with-providers";

import { HERO_INSTALL_COMMAND } from "./constants";
import { CopyCommand } from "./copy-command";

const mockWriteText = vi.fn();

beforeEach(() => {
  // Only fake setTimeout/clearTimeout so Promise microtasks still resolve normally.
  // This lets the async handleCopy complete and setCopied(true) fire before assertions.
  vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
  mockWriteText.mockResolvedValue(undefined);
  Object.defineProperty(navigator, "clipboard", {
    value: { writeText: mockWriteText },
    writable: true,
    configurable: true,
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
      // Flush all pending microtasks (resolves the writeText promise and state update)
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
