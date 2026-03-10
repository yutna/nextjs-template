import { act, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/render-with-providers";

import { PreviewTheme } from "./preview-theme";

const translations: Record<string, string> = {
  "modules.themeSettings.components.previewTheme.actions.reset":
    "Reset to default",
  "modules.themeSettings.components.previewTheme.actions.save":
    "Save & apply theme",
  "modules.themeSettings.components.previewTheme.controls.appearance":
    "Appearance",
  "modules.themeSettings.components.previewTheme.controls.dark": "Dark",
  "modules.themeSettings.components.previewTheme.controls.language": "Language",
  "modules.themeSettings.components.previewTheme.controls.light": "Light",
  "modules.themeSettings.components.previewTheme.controls.pending":
    "Preview only",
  "modules.themeSettings.components.previewTheme.controls.saved":
    "Saved preset",
  "modules.themeSettings.components.previewTheme.feedback.description":
    "Feedback description",
  "modules.themeSettings.components.previewTheme.feedback.emptyDescription":
    "Empty description",
  "modules.themeSettings.components.previewTheme.feedback.emptyPrimary":
    "Create token",
  "modules.themeSettings.components.previewTheme.feedback.emptySecondary":
    "Import preset",
  "modules.themeSettings.components.previewTheme.feedback.emptyTitle":
    "Nothing to review yet",
  "modules.themeSettings.components.previewTheme.feedback.infoDescription":
    "Info description",
  "modules.themeSettings.components.previewTheme.feedback.infoTitle":
    "Theme applied to preview",
  "modules.themeSettings.components.previewTheme.feedback.loadingLabel":
    "Loading placeholders",
  "modules.themeSettings.components.previewTheme.feedback.title":
    "Feedback states",
  "modules.themeSettings.components.previewTheme.feedback.warningDescription":
    "Warning description",
  "modules.themeSettings.components.previewTheme.feedback.warningTitle":
    "Contrast check recommended",
  "modules.themeSettings.components.previewTheme.forms.checkboxLabel":
    "Send weekly design updates",
  "modules.themeSettings.components.previewTheme.forms.description":
    "Forms description",
  "modules.themeSettings.components.previewTheme.forms.emailError":
    "Please enter a work email address.",
  "modules.themeSettings.components.previewTheme.forms.emailErrorLabel":
    "Contact email",
  "modules.themeSettings.components.previewTheme.forms.emailHelper":
    "We use this email for release notifications.",
  "modules.themeSettings.components.previewTheme.forms.emailLabel":
    "Contact email",
  "modules.themeSettings.components.previewTheme.forms.emailPlaceholder":
    "design@example.com",
  "modules.themeSettings.components.previewTheme.forms.notesLabel":
    "Release notes",
  "modules.themeSettings.components.previewTheme.forms.notesPlaceholder":
    "Share rollout notes",
  "modules.themeSettings.components.previewTheme.forms.roleDesigner":
    "Designer",
  "modules.themeSettings.components.previewTheme.forms.roleEngineer":
    "Engineer",
  "modules.themeSettings.components.previewTheme.forms.roleLabel":
    "Primary role",
  "modules.themeSettings.components.previewTheme.forms.roleProduct":
    "Product manager",
  "modules.themeSettings.components.previewTheme.forms.submit":
    "Submit sample form",
  "modules.themeSettings.components.previewTheme.forms.switchLabel":
    "Enable high visibility mode",
  "modules.themeSettings.components.previewTheme.forms.title": "Form states",
  "modules.themeSettings.components.previewTheme.overview.badgeNew": "New",
  "modules.themeSettings.components.previewTheme.overview.badgePopular":
    "Popular",
  "modules.themeSettings.components.previewTheme.overview.badgeStable":
    "Stable",
  "modules.themeSettings.components.previewTheme.overview.cardAction":
    "Open board",
  "modules.themeSettings.components.previewTheme.overview.cardDescription":
    "Track approvals",
  "modules.themeSettings.components.previewTheme.overview.cardTitle":
    "Release board",
  "modules.themeSettings.components.previewTheme.overview.description":
    "Overview description",
  "modules.themeSettings.components.previewTheme.overview.eyebrow":
    "Theme showcase",
  "modules.themeSettings.components.previewTheme.overview.ghostAction":
    "Learn more",
  "modules.themeSettings.components.previewTheme.overview.metricCaption":
    "Compared with last month",
  "modules.themeSettings.components.previewTheme.overview.metricLabel":
    "Adoption",
  "modules.themeSettings.components.previewTheme.overview.metricValue": "84%",
  "modules.themeSettings.components.previewTheme.overview.primaryAction":
    "Launch workspace",
  "modules.themeSettings.components.previewTheme.overview.secondaryAction":
    "Review docs",
  "modules.themeSettings.components.previewTheme.overview.title":
    "A quick read on hierarchy and brand feel",
  "modules.themeSettings.components.previewTheme.surfaces.description":
    "Surface description",
  "modules.themeSettings.components.previewTheme.surfaces.noteDescription":
    "Secondary description",
  "modules.themeSettings.components.previewTheme.surfaces.noteTitle":
    "Secondary content",
  "modules.themeSettings.components.previewTheme.surfaces.rowOneOwner": "Nadia",
  "modules.themeSettings.components.previewTheme.surfaces.rowOneProject":
    "Brand refresh",
  "modules.themeSettings.components.previewTheme.surfaces.rowOneRevenue":
    "$84K",
  "modules.themeSettings.components.previewTheme.surfaces.rowOneStatus":
    "On track",
  "modules.themeSettings.components.previewTheme.surfaces.rowThreeOwner":
    "Mina",
  "modules.themeSettings.components.previewTheme.surfaces.rowThreeProject":
    "Changelog sync",
  "modules.themeSettings.components.previewTheme.surfaces.rowThreeRevenue":
    "$23K",
  "modules.themeSettings.components.previewTheme.surfaces.rowThreeStatus":
    "In review",
  "modules.themeSettings.components.previewTheme.surfaces.rowTwoOwner": "Arin",
  "modules.themeSettings.components.previewTheme.surfaces.rowTwoProject":
    "Design system",
  "modules.themeSettings.components.previewTheme.surfaces.rowTwoRevenue":
    "$51K",
  "modules.themeSettings.components.previewTheme.surfaces.rowTwoStatus":
    "Needs review",
  "modules.themeSettings.components.previewTheme.surfaces.surfaceAction":
    "View details",
  "modules.themeSettings.components.previewTheme.surfaces.surfaceBadge":
    "Shared",
  "modules.themeSettings.components.previewTheme.surfaces.surfaceDescription":
    "A compact surface",
  "modules.themeSettings.components.previewTheme.surfaces.surfaceTitle":
    "Workspace card",
  "modules.themeSettings.components.previewTheme.surfaces.tableOwner": "Owner",
  "modules.themeSettings.components.previewTheme.surfaces.tableProject":
    "Project",
  "modules.themeSettings.components.previewTheme.surfaces.tableRevenue":
    "Revenue",
  "modules.themeSettings.components.previewTheme.surfaces.tableStatus":
    "Status",
  "modules.themeSettings.components.previewTheme.surfaces.title":
    "Surfaces and data",
  "modules.themeSettings.components.previewTheme.tabs.feedback": "Feedback",
  "modules.themeSettings.components.previewTheme.tabs.forms": "Forms",
  "modules.themeSettings.components.previewTheme.tabs.overview": "Overview",
  "modules.themeSettings.components.previewTheme.tabs.surfaces": "Surfaces",
  "modules.themeSettings.components.previewTheme.tabs.tokens": "Tokens",
  "modules.themeSettings.components.previewTheme.tokens.caption":
    "Semantic color tokens should stay balanced.",
  "modules.themeSettings.components.previewTheme.tokens.description":
    "Inspect palette roles.",
  "modules.themeSettings.components.previewTheme.tokens.muted": "Muted",
  "modules.themeSettings.components.previewTheme.tokens.palette.blue": "Blue",
  "modules.themeSettings.components.previewTheme.tokens.palette.green": "Green",
  "modules.themeSettings.components.previewTheme.tokens.palette.orange":
    "Orange",
  "modules.themeSettings.components.previewTheme.tokens.palette.pink": "Pink",
  "modules.themeSettings.components.previewTheme.tokens.palette.purple":
    "Purple",
  "modules.themeSettings.components.previewTheme.tokens.palette.teal": "Teal",
  "modules.themeSettings.components.previewTheme.tokens.radiusTitle":
    "Radius samples",
  "modules.themeSettings.components.previewTheme.tokens.solid": "Solid",
  "modules.themeSettings.components.previewTheme.tokens.subtle": "Subtle",
  "modules.themeSettings.components.previewTheme.tokens.surfaceDefault":
    "Default surface",
  "modules.themeSettings.components.previewTheme.tokens.surfaceMuted":
    "Muted surface",
  "modules.themeSettings.components.previewTheme.tokens.surfaceTitle":
    "Surface balance",
  "modules.themeSettings.components.previewTheme.tokens.title": "Theme tokens",
  "modules.themeSettings.presets.default.description":
    "Balanced colors and spacing",
  "modules.themeSettings.presets.default.name": "Default",
};

vi.mock("next-intl", () => ({
  useTranslations: vi.fn((namespace: string) => (key: string) => {
    const messageKey = `${namespace}.${key}`;
    return translations[messageKey] ?? messageKey;
  }),
}));

describe("PreviewTheme", () => {
  const defaultProps = {
    activePreviewGroup: "overview" as const,
    colorMode: "light" as const,
    hasPendingChanges: true,
    locale: "en" as const,
    onChangePreviewGroup: vi.fn(),
    onClickReset: vi.fn(),
    onClickSave: vi.fn(),
    onSwitchColorMode: vi.fn(),
    onSwitchLocale: vi.fn(),
    presetId: "default" as const,
  };

  it("renders the preview shell with grouped tabs and actions", async () => {
    await act(async () => {
      renderWithProviders(<PreviewTheme {...defaultProps} />);
    });

    expect(screen.getByText("Preview only")).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Overview" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Save & apply theme" }),
    ).toBeInTheDocument();
  });

  it("renders the selected preview group content", async () => {
    await act(async () => {
      renderWithProviders(
        <PreviewTheme {...defaultProps} activePreviewGroup="forms" />,
      );
    });

    expect(screen.getByText("Form states")).toBeInTheDocument();
    expect(screen.getAllByPlaceholderText("design@example.com")).toHaveLength(
      2,
    );
  });

  it("forwards interaction callbacks for tabs, locale, and color mode", async () => {
    const user = userEvent.setup();
    const handleChangePreviewGroup = vi.fn();
    const handleSwitchLocale = vi.fn();
    const handleSwitchColorMode = vi.fn();

    renderWithProviders(
      <PreviewTheme
        {...defaultProps}
        onChangePreviewGroup={handleChangePreviewGroup}
        onSwitchColorMode={handleSwitchColorMode}
        onSwitchLocale={handleSwitchLocale}
      />,
    );

    await user.click(screen.getByRole("tab", { name: "Forms" }));
    await user.click(screen.getByRole("button", { name: "TH" }));
    await user.click(screen.getByRole("button", { name: "Dark" }));

    expect(handleChangePreviewGroup).toHaveBeenCalledWith("forms");
    expect(handleSwitchLocale).toHaveBeenCalledWith("th");
    expect(handleSwitchColorMode).toHaveBeenCalledWith("dark");
  });
});
