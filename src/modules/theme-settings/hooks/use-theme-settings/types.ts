import type {
  ThemePreset,
  ThemePresetId,
} from "@/modules/theme-settings/types";

export interface UseThemeSettingsReturn {
  activePresetId: ThemePresetId;
  handleResetToDefault: () => void;
  handleSavePreset: () => void;
  handleSelectPreset: (preset: ThemePreset) => void;
  pendingPresetId: null | ThemePresetId;
  previewVars: Record<string, string>;
}
