import { screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/render-with-providers";

import { WorkflowDetailDialog } from "./dialog-workflow-detail";

vi.mock("next-intl", () => ({
  useTranslations: vi.fn(() => (key: string) => key),
}));

describe("WorkflowDetailDialog", () => {
  it("renders the dialog trigger button with correct data-testid", () => {
    renderWithProviders(<WorkflowDetailDialog />);

    expect(
      screen.getByTestId("static-pages-workflow-detail-dialog-trigger"),
    ).toBeInTheDocument();
    expect(screen.getByText("openButton →")).toBeInTheDocument();
  });

  it("renders dialog title when opened", async () => {
    const user = userEvent.setup();
    renderWithProviders(<WorkflowDetailDialog />);

    await user.click(
      screen.getByTestId("static-pages-workflow-detail-dialog-trigger"),
    );

    expect(screen.getByText("dialogTitle")).toBeInTheDocument();
  });
});
