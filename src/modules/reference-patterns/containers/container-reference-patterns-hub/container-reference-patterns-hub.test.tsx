import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/render-with-providers";

import { ContainerReferencePatternsHub } from "./container-reference-patterns-hub";

import type { ReactNode } from "react";

vi.mock("server-only", () => ({}));
vi.mock("next-intl/server", () => ({
  getTranslations: vi.fn().mockResolvedValue((key: string) => key),
}));
vi.mock("@/shared/lib/navigation", () => ({
  Link: ({ children, href }: { children: ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));
vi.mock("@/shared/routes", () => ({
  routes: {
    public: {
      referencePatterns: {
        galacticArchive: { path: () => "/reference-patterns/galactic-archive" },
        workflowFoundations: {
          path: () => "/reference-patterns/workflow-foundations",
        },
      },
    },
  },
}));

describe("ContainerReferencePatternsHub", () => {
  it("renders without errors", async () => {
    const { container } = renderWithProviders(
      await ContainerReferencePatternsHub({ locale: "en" }),
    );

    expect(container).toBeDefined();
  });
});
