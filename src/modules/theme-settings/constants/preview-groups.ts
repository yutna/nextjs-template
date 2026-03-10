import type { ThemePreviewGroupId } from "@/modules/theme-settings/types";

export const THEME_PREVIEW_GROUPS = [
  "overview",
  "forms",
  "feedback",
  "surfaces",
  "tokens",
] as const satisfies ReadonlyArray<ThemePreviewGroupId>;
