"use client";

import { useEffect } from "react";
import { useImmer } from "use-immer";

import {
  DEFAULT_PRESET_ID,
  THEME_PRESETS,
} from "@/modules/theme-settings/constants/theme-presets";
import { ThemeSettingsContext } from "@/modules/theme-settings/contexts/theme-settings";
import {
  clearThemeCssVars as clearThemeCssVarsDom,
  injectThemeCssVars,
} from "@/modules/theme-settings/lib/theme-injector";
import {
  clearThemeCssVars as clearThemeCssVarsStorage,
  loadThemeCssVars,
  loadThemePresetId,
  saveThemePresetId,
} from "@/modules/theme-settings/lib/theme-storage";
import { useColorMode } from "@/shared/vendor/chakra-ui/color-mode";

import type {
  ThemePreset,
  ThemePresetId,
} from "@/modules/theme-settings/types";
import type { ThemeSettingsProviderProps } from "./types";

interface ThemeSettingsState {
  activePresetId: ThemePresetId;
}

const ALL_KNOWN_CSS_VAR_KEYS = [
  ...new Set(
    THEME_PRESETS.flatMap((preset) => [
      ...Object.keys(preset.cssVars.dark),
      ...Object.keys(preset.cssVars.light),
    ]),
  ),
];

export function ThemeSettingsProvider({
  children,
}: Readonly<ThemeSettingsProviderProps>) {
  const { colorMode } = useColorMode();
  const [state, updateState] = useImmer<ThemeSettingsState>({
    activePresetId: DEFAULT_PRESET_ID,
  });
  const resolvedColorMode = colorMode === "dark" ? "dark" : "light";

  useEffect(() => {
    const storedPresetId = loadThemePresetId();

    if (!storedPresetId) {
      return;
    }

    updateState((draft) => {
      draft.activePresetId = storedPresetId;
    });
  }, [updateState]);

  useEffect(() => {
    clearThemeCssVarsDom(ALL_KNOWN_CSS_VAR_KEYS);

    const storedCssVars = loadThemeCssVars();

    if (!storedCssVars) {
      return;
    }

    injectThemeCssVars(storedCssVars[resolvedColorMode]);
  }, [resolvedColorMode, state.activePresetId]);

  function setPreset(preset: ThemePreset) {
    updateState((draft) => {
      draft.activePresetId = preset.id;
    });

    clearThemeCssVarsDom(ALL_KNOWN_CSS_VAR_KEYS);
    injectThemeCssVars(preset.cssVars[resolvedColorMode]);
  }

  function resetToDefault() {
    clearThemeCssVarsDom(ALL_KNOWN_CSS_VAR_KEYS);
    clearThemeCssVarsStorage();
    saveThemePresetId(DEFAULT_PRESET_ID);

    updateState((draft) => {
      draft.activePresetId = DEFAULT_PRESET_ID;
    });
  }

  return (
    <ThemeSettingsContext
      value={{
        activePresetId: state.activePresetId,
        resetToDefault,
        setPreset,
      }}
    >
      {children}
    </ThemeSettingsContext>
  );
}
