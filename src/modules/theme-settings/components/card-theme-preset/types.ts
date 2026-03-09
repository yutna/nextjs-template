import type { ThemePreset } from "@/modules/theme-settings/types";

export interface CardThemePresetProps {
  isActive: boolean;
  onClickSelect: (preset: ThemePreset) => void;
  preset: ThemePreset;
}
