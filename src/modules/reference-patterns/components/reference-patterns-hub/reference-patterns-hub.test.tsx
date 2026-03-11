import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/render-with-providers";

import { ReferencePatternsHub } from "./reference-patterns-hub";

import type { ReactNode } from "react";

vi.mock("@/shared/lib/navigation", () => ({
  Link: ({ children, href }: { children: ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

describe("ReferencePatternsHub", () => {
  it("renders both example cards", () => {
    renderWithProviders(
      <ReferencePatternsHub
        actionLabel="Open example"
        description="Choose a live workflow proof or the upcoming Star Wars direction page."
        eyebrow="Reference patterns"
        heading="Pattern examples"
        items={[
          {
            description: "Current architecture proof.",
            href: "/reference-patterns/workflow-foundations",
            statusLabel: "Live",
            title: "Workflow foundations",
          },
          {
            description: "Upcoming SWAPI direction.",
            href: "/reference-patterns/galactic-archive",
            statusLabel: "Direction preview",
            title: "Galactic Archive",
          },
        ]}
      />,
    );

    expect(screen.getByText("Workflow foundations")).toBeInTheDocument();
    expect(screen.getByText("Galactic Archive")).toBeInTheDocument();
    expect(screen.getAllByRole("link")).toHaveLength(2);
  });
});
