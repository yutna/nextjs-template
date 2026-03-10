import type { Locale } from "next-intl";
import type {
  ThemePresetId,
  ThemePreviewGroupId,
} from "@/modules/theme-settings/types";
import type { ColorMode } from "@/shared/vendor/chakra-ui/color-mode";

export interface PreviewThemeProps {
  activePreviewGroup: ThemePreviewGroupId;
  colorMode: ColorMode;
  hasPendingChanges: boolean;
  locale: Locale;
  onChangePreviewGroup: (group: ThemePreviewGroupId) => void;
  onClickReset: () => void;
  onClickSave: () => void;
  onSwitchColorMode: (colorMode: ColorMode) => void;
  onSwitchLocale: (locale: Locale) => void;
  presetId: ThemePresetId;
}
