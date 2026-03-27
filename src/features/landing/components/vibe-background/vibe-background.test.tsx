import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/render-with-providers";

import { VibeBackground } from "./vibe-background.client";

describe("VibeBackground", () => {
  it("renders nothing when not on desktop", () => {
    const { container } = renderWithProviders(
      <VibeBackground
        iframeRef={{ current: null }}
        isDesktop={false}
        isVibeOn={false}
        onLoadIframe={vi.fn()}
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
        onLoadIframe={vi.fn()}
      />,
    );

    expect(screen.getByTitle("vibe background")).toBeInTheDocument();
  });
});
