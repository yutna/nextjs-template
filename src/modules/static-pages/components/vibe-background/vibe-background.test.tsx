import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/render-with-providers";

import { VibeBackground } from "./vibe-background";

describe("VibeBackground", () => {
  it("renders nothing when not on desktop", () => {
    const { container } = renderWithProviders(
      <VibeBackground
        iframeRef={{ current: null }}
        isDesktop={false}
        isVibeOn={false}
        onIframeLoad={vi.fn()}
      />,
    );

    expect(container.firstChild).toBeNull();
  });

  it("renders the iframe on desktop", () => {
    renderWithProviders(
      <VibeBackground
        iframeRef={{ current: null }}
        isDesktop={true}
        isVibeOn={true}
        onIframeLoad={vi.fn()}
      />,
    );

    expect(screen.getByTitle("vibe background")).toBeInTheDocument();
  });
});
