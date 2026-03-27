import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/render-with-providers";

import { CopyCommandButton } from "./copy-command.client";

const mockHandleCopy = vi.fn();

vi.mock("@/features/landing/components/hooks/use-copy-command", () => ({
  useCopyCommand: () => ({
    handleCopy: mockHandleCopy,
    isCopied: false,
  }),
}));

vi.mock("@/features/landing/components/hooks/use-vibe", () => ({
  useVibe: () => ({
    handleChangeVolume: vi.fn(),
    handleToggleVibe: vi.fn(),
    isVibeOn: false,
    volume: 50,
  }),
}));

describe("CopyCommandButton", () => {
  it("renders the copy button", () => {
    renderWithProviders(<CopyCommandButton />);
    expect(
      screen.getByRole("button", { name: "Copy command" }),
    ).toBeInTheDocument();
  });
});
