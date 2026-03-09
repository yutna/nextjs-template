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

import type {
  ThemePreset,
  ThemePresetId,
} from "@/modules/theme-settings/types";
import type { ThemeSettingsProviderProps } from "./types";

interface ThemeSettingsState {
  activePresetId: ThemePresetId;
}

function getAllKnownCssVarKeys(isDark: boolean): string[] {
  return [
    ...new Set(
      THEME_PRESETS.flatMap((p) =>
        isDark ? Object.keys(p.cssVars.dark) : Object.keys(p.cssVars.light),
      ),
    ),
  ];
}

export function ThemeSettingsProvider({
  children,
}: Readonly<ThemeSettingsProviderProps>) {
  const [state, updateState] = useImmer<ThemeSettingsState>({
    activePresetId: DEFAULT_PRESET_ID,
  });

  useEffect(() => {
    const storedPresetId = loadThemePresetId();
    const storedCssVars = loadThemeCssVars();

    if (storedPresetId) {
      updateState((draft) => {
        draft.activePresetId = storedPresetId;
      });
    }

    if (storedCssVars) {
      const isDark = document.documentElement.classList.contains("dark");
      const vars = isDark ? storedCssVars.dark : storedCssVars.light;
      injectThemeCssVars(vars);
    }
  }, [updateState]);

  function setPreset(preset: ThemePreset) {
    updateState((draft) => {
      draft.activePresetId = preset.id;
    });

    const isDark = document.documentElement.classList.contains("dark");
    const vars = isDark ? preset.cssVars.dark : preset.cssVars.light;

    // Clear all previously overridden vars before applying new ones
    clearThemeCssVarsDom(getAllKnownCssVarKeys(isDark));
    injectThemeCssVars(vars);
  }

  function resetToDefault() {
    const isDark = document.documentElement.classList.contains("dark");

    clearThemeCssVarsDom(getAllKnownCssVarKeys(isDark));
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
