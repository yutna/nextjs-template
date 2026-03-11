import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { renderWithProviders } from "@/test/render-with-providers";

import { GridReferencePatterns } from "./grid-reference-patterns";

describe("GridReferencePatterns", () => {
  it("renders the heading and code paths", () => {
    renderWithProviders(
      <GridReferencePatterns
        description="Inspect the exact files behind this route."
        heading="Reference patterns you can inspect in code"
        items={[
          {
            codePath: "src/app/[locale]/(public)/reference-patterns/workflow-foundations/page.tsx",
            description: "Thin page file.",
            kind: "App Router",
            title: "Route entry",
          },
        ]}
      />,
    );

    expect(
      screen.getByText("Reference patterns you can inspect in code"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("src/app/[locale]/(public)/reference-patterns/workflow-foundations/page.tsx"),
    ).toBeInTheDocument();
  });
});
