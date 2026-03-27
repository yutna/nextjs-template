import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { HERO_INSTALL_COMMAND } from "@/features/landing/constants/install-command";
import { renderWithProviders } from "@/test/render-with-providers";

import { CopyCommand } from "./copy-command.client";

describe("CopyCommand", () => {
  it("renders the install command text", () => {
    renderWithProviders(
      <CopyCommand isCopied={false} isVibeOn={false} onCopy={vi.fn()} />,
    );
    expect(screen.getByText(HERO_INSTALL_COMMAND)).toBeInTheDocument();
  });

  it("shows 'Copy command' aria-label when not copied", () => {
    renderWithProviders(
      <CopyCommand isCopied={false} isVibeOn={false} onCopy={vi.fn()} />,
    );
    expect(
      screen.getByRole("button", { name: "Copy command" }),
    ).toBeInTheDocument();
  });

  it("shows 'Copied' aria-label when isCopied is true", () => {
    renderWithProviders(
      <CopyCommand isCopied={true} isVibeOn={false} onCopy={vi.fn()} />,
    );
    expect(screen.getByRole("button", { name: "Copied" })).toBeInTheDocument();
  });

  it("calls onCopy when the button is clicked", () => {
    const handleCopy = vi.fn();
    renderWithProviders(
      <CopyCommand isCopied={false} isVibeOn={false} onCopy={handleCopy} />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Copy command" }));
    expect(handleCopy).toHaveBeenCalledOnce();
  });
});
