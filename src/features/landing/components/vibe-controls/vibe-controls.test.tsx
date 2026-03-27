import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/render-with-providers";

import { VibeControls } from "./vibe-controls";

describe("VibeControls", () => {
  it("renders nothing on mobile", () => {
    const { container } = renderWithProviders(
      <VibeControls
        isDesktop={false}
        isVibeOn={false}
        onChangeVolume={vi.fn()}
        onToggleVibe={vi.fn()}
        volume={15}
      />,
    );

    expect(container.firstChild).toBeNull();
  });

  it("renders the vibe toggle on desktop", () => {
    renderWithProviders(
      <VibeControls
        isDesktop={true}
        isVibeOn={true}
        onChangeVolume={vi.fn()}
        onToggleVibe={vi.fn()}
        volume={15}
      />,
    );

    expect(
      screen.getByRole("button", { name: "Turn off vibe" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Vibe volume")).toBeInTheDocument();
  });

  it("shows the correct aria-label when vibe is off", () => {
    renderWithProviders(
      <VibeControls
        isDesktop={true}
        isVibeOn={false}
        onChangeVolume={vi.fn()}
        onToggleVibe={vi.fn()}
        volume={15}
      />,
    );

    expect(
      screen.getByRole("button", { name: "Turn on vibe" }),
    ).toBeInTheDocument();
  });
});
