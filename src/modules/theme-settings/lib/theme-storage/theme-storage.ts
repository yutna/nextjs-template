import type {
  ThemePresetCssVars,
  ThemePresetId,
} from "@/modules/theme-settings/types";

const CSS_VARS_KEY = "theme-css-vars";
const PRESET_ID_KEY = "theme-preset-id";

export function saveThemeCssVars(vars: ThemePresetCssVars): void {
  localStorage.setItem(CSS_VARS_KEY, JSON.stringify(vars));
}

export function loadThemeCssVars(): null | ThemePresetCssVars {
  try {
    const raw = localStorage.getItem(CSS_VARS_KEY);

    if (!raw) {
      return null;
    }

    return JSON.parse(raw) as ThemePresetCssVars;
  } catch {
    return null;
  }
}

export function clearThemeCssVars(): void {
  localStorage.removeItem(CSS_VARS_KEY);
}

export function saveThemePresetId(id: ThemePresetId): void {
  localStorage.setItem(PRESET_ID_KEY, id);
}

export function loadThemePresetId(): null | ThemePresetId {
  return localStorage.getItem(PRESET_ID_KEY) as null | ThemePresetId;
}
