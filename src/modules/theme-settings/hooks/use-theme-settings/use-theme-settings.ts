"use client";

import { use } from "react";
import { useImmer } from "use-immer";

import { THEME_PRESETS } from "@/modules/theme-settings/constants/theme-presets";
import { ThemeSettingsContext } from "@/modules/theme-settings/contexts/theme-settings";
import {
  saveThemeCssVars,
  saveThemePresetId,
} from "@/modules/theme-settings/lib/theme-storage";

import type { ThemePreset } from "@/modules/theme-settings/types";
import type { UseThemeSettingsReturn } from "./types";

interface PreviewState {
  pendingPreset: null | ThemePreset;
  previewVars: Record<string, string>;
}

export function useThemeSettings(): UseThemeSettingsReturn {
  const context = use(ThemeSettingsContext);

  if (!context) {
    throw new Error(
      "useThemeSettings must be used within ThemeSettingsProvider",
    );
  }

  const { activePresetId, resetToDefault, setPreset } = context;

  const [preview, updatePreview] = useImmer<PreviewState>({
    pendingPreset: null,
    previewVars: {},
  });

  function handleSelectPreset(preset: ThemePreset) {
    const isDark = document.documentElement.classList.contains("dark");
    const vars = isDark ? preset.cssVars.dark : preset.cssVars.light;

    updatePreview((draft) => {
      draft.pendingPreset = preset;
      draft.previewVars = vars;
    });
  }

  function handleSavePreset() {
    const pending = preview.pendingPreset;
    const presetToSave =
      pending ?? THEME_PRESETS.find((p) => p.id === activePresetId);

    if (!presetToSave) {
      return;
    }

    saveThemePresetId(presetToSave.id);
    saveThemeCssVars(presetToSave.cssVars);
    setPreset(presetToSave);

    updatePreview((draft) => {
      draft.pendingPreset = null;
      draft.previewVars = {};
    });
  }

  function handleResetToDefault() {
    updatePreview((draft) => {
      draft.pendingPreset = null;
      draft.previewVars = {};
    });
    resetToDefault();
  }

  return {
    activePresetId,
    handleResetToDefault,
    handleSavePreset,
    handleSelectPreset,
    pendingPresetId: preview.pendingPreset?.id ?? null,
    previewVars: preview.previewVars,
  };
}
