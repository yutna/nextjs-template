import type { Locale } from "next-intl";
import type {
  ThemePreset,
  ThemePresetId,
  ThemePreviewGroupId,
} from "@/modules/theme-settings/types";
import type { ColorMode } from "@/shared/vendor/chakra-ui/color-mode";

export interface UseThemeSettingsOptions {
  locale: Locale;
}

export interface UseThemeSettingsReturn {
  activePresetId: ThemePresetId;
  activePreviewGroup: ThemePreviewGroupId;
  colorMode: ColorMode;
  currentPreset: ThemePreset;
  handleChangePreviewGroup: (group: ThemePreviewGroupId) => void;
  handleResetToDefault: () => void;
  handleSavePreset: () => void;
  handleSelectPreset: (preset: ThemePreset) => void;
  handleSwitchColorMode: (colorMode: ColorMode) => void;
  handleSwitchLocale: (next: Locale) => void;
  hasPendingChanges: boolean;
  pendingPresetId: null | ThemePresetId;
  previewVars: Record<string, string>;
}
