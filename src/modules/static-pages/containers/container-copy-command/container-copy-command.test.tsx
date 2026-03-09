import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/render-with-providers";

import { ContainerCopyCommand } from "./container-copy-command";

const mockHandleCopy = vi.fn();

vi.mock("@/modules/static-pages/hooks/use-copy-command", () => ({
  useCopyCommand: () => ({
    handleCopy: mockHandleCopy,
    isCopied: false,
  }),
}));

vi.mock("@/modules/static-pages/hooks/use-vibe", () => ({
  useVibe: () => ({
    handleChangeVolume: vi.fn(),
    handleToggleVibe: vi.fn(),
    isVibeOn: false,
    volume: 50,
  }),
}));

describe("ContainerCopyCommand", () => {
  it("renders the copy button", () => {
    renderWithProviders(<ContainerCopyCommand />);
    expect(
      screen.getByRole("button", { name: "Copy command" }),
    ).toBeInTheDocument();
  });
});
