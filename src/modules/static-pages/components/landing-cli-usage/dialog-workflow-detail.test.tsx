import { screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/render-with-providers";

import { WorkflowDetailDialog } from "./dialog-workflow-detail";

vi.mock("next-intl", () => ({
  useTranslations: vi.fn(() => (key: string) => key),
}));

describe("WorkflowDetailDialog", () => {
  it("renders the dialog trigger button", () => {
    renderWithProviders(<WorkflowDetailDialog />);

    expect(screen.getByText("openButton →")).toBeInTheDocument();
  });

  it("renders dialog title when opened", async () => {
    const user = userEvent.setup();
    renderWithProviders(<WorkflowDetailDialog />);

    await user.click(screen.getByText("openButton →"));

    expect(screen.getByText("dialogTitle")).toBeInTheDocument();
  });
});
