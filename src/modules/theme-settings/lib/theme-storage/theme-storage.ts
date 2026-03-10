import { THEME_PRESETS } from "@/modules/theme-settings/constants/theme-presets";

import type {
  ThemePresetCssVars,
  ThemePresetId,
} from "@/modules/theme-settings/types";

const CSS_VARS_KEY = "theme-css-vars";
const PRESET_ID_KEY = "theme-preset-id";
const PRESET_IDS = new Set(THEME_PRESETS.map(({ id }) => id));

function isCssVarsRecord(value: unknown): value is Record<string, string> {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  return Object.entries(value).every(
    ([key, entryValue]) => typeof entryValue === "string" && key.length > 0,
  );
}

function isThemePresetCssVars(value: unknown): value is ThemePresetCssVars {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Partial<ThemePresetCssVars>;

  return (
    isCssVarsRecord(candidate.dark) &&
    isCssVarsRecord(candidate.light)
  );
}

function isThemePresetId(value: string): value is ThemePresetId {
  return PRESET_IDS.has(value as ThemePresetId);
}

export function saveThemeCssVars(vars: ThemePresetCssVars): void {
  localStorage.setItem(CSS_VARS_KEY, JSON.stringify(vars));
}

export function loadThemeCssVars(): null | ThemePresetCssVars {
  try {
    const raw = localStorage.getItem(CSS_VARS_KEY);

    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as unknown;

    if (!isThemePresetCssVars(parsed)) {
      localStorage.removeItem(CSS_VARS_KEY);
      return null;
    }

    return parsed;
  } catch {
    localStorage.removeItem(CSS_VARS_KEY);
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
  const presetId = localStorage.getItem(PRESET_ID_KEY);

  if (!presetId) {
    return null;
  }

  if (!isThemePresetId(presetId)) {
    localStorage.removeItem(PRESET_ID_KEY);
    return null;
  }

  return presetId;
}
