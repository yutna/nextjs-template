"use client";

import { use } from "react";
import { useImmer } from "use-immer";

import { THEME_PREVIEW_GROUPS } from "@/modules/theme-settings/constants/preview-groups";
import { THEME_PRESETS } from "@/modules/theme-settings/constants/theme-presets";
import { ThemeSettingsContext } from "@/modules/theme-settings/contexts/theme-settings";
import {
  saveThemeCssVars,
  saveThemePresetId,
} from "@/modules/theme-settings/lib/theme-storage";
import { usePathname, useRouter } from "@/shared/lib/navigation";
import { useColorMode } from "@/shared/vendor/chakra-ui/color-mode";

import type {
  ThemePreset,
  ThemePreviewGroupId,
} from "@/modules/theme-settings/types";
import type { UseThemeSettingsOptions, UseThemeSettingsReturn } from "./types";

interface PreviewState {
  activePreviewGroup: ThemePreviewGroupId;
  pendingPreset: null | ThemePreset;
}

export function useThemeSettings({
  locale,
}: UseThemeSettingsOptions): UseThemeSettingsReturn {
  const context = use(ThemeSettingsContext);
  const pathname = usePathname();
  const router = useRouter();
  const { colorMode, setColorMode } = useColorMode();

  if (!context) {
    throw new Error(
      "useThemeSettings must be used within ThemeSettingsProvider",
    );
  }

  const { activePresetId, resetToDefault, setPreset } = context;
  const resolvedColorMode = colorMode === "dark" ? "dark" : "light";

  const [preview, updatePreview] = useImmer<PreviewState>({
    activePreviewGroup: THEME_PREVIEW_GROUPS[0],
    pendingPreset: null,
  });

  const currentPreset =
    preview.pendingPreset ??
    THEME_PRESETS.find((preset) => preset.id === activePresetId) ??
    THEME_PRESETS[0];

  function handleChangePreviewGroup(group: ThemePreviewGroupId) {
    updatePreview((draft) => {
      draft.activePreviewGroup = group;
    });
  }

  function handleSelectPreset(preset: ThemePreset) {
    updatePreview((draft) => {
      draft.pendingPreset = preset;
    });
  }

  function handleSavePreset() {
    saveThemePresetId(currentPreset.id);
    saveThemeCssVars(currentPreset.cssVars);
    setPreset(currentPreset);

    updatePreview((draft) => {
      draft.pendingPreset = null;
    });
  }

  function handleResetToDefault() {
    updatePreview((draft) => {
      draft.pendingPreset = null;
    });

    resetToDefault();
  }

  function handleSwitchColorMode(next: "dark" | "light") {
    if (next === resolvedColorMode) {
      return;
    }

    setColorMode(next);
  }

  function handleSwitchLocale(next: UseThemeSettingsOptions["locale"]) {
    if (next === locale) {
      return;
    }

    router.replace(pathname, { locale: next });
  }

  return {
    activePresetId,
    activePreviewGroup: preview.activePreviewGroup,
    colorMode: resolvedColorMode,
    currentPreset,
    handleChangePreviewGroup,
    handleResetToDefault,
    handleSavePreset,
    handleSelectPreset,
    handleSwitchColorMode,
    handleSwitchLocale,
    hasPendingChanges: preview.pendingPreset !== null,
    pendingPresetId: preview.pendingPreset?.id ?? null,
    previewVars: preview.pendingPreset?.cssVars[resolvedColorMode] ?? {},
  };
}
