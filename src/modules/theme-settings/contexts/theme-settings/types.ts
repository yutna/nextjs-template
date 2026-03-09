import type {
  ThemePreset,
  ThemePresetId,
} from "@/modules/theme-settings/types";

export interface ThemeSettingsContextValue {
  activePresetId: ThemePresetId;
  resetToDefault: () => void;
  setPreset: (preset: ThemePreset) => void;
}
