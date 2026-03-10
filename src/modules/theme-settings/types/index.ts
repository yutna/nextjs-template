export type ThemePresetId =
  | "accessible"
  | "brutalism"
  | "cyberpunk"
  | "dark-oled"
  | "default"
  | "flat-design"
  | "memphis"
  | "minimalism"
  | "neubrutalism"
  | "pixel-art"
  | "retro-futurism"
  | "swiss-modernism"
  | "vaporwave"
  | "y2k";

export type ThemePreviewGroupId =
  | "feedback"
  | "forms"
  | "overview"
  | "surfaces"
  | "tokens";

export interface ThemePresetCssVars {
  dark: Record<string, string>;
  light: Record<string, string>;
}

export interface ThemePreset {
  cssVars: ThemePresetCssVars;
  id: ThemePresetId;
  /** 3–5 hex colors shown as swatches in the preset card thumbnail */
  swatches: string[];
}
