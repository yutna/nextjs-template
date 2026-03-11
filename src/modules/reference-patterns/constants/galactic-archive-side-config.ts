import type { GalacticArchiveSide } from "@/modules/reference-patterns/lib/galactic-archive-query-state";

export const GALACTIC_ARCHIVE_SIDE_CONFIG: Record<
  GalacticArchiveSide,
  {
    accentColor: string;
    accentSubtle: string;
    buttonPalette: "blue" | "red";
    cardBorderColor: string;
    cardSurface: string;
    glowColor: string;
    gradientFrom: string;
    gradientTo: string;
    mutedTextColor: string;
    panelSurface: string;
    sceneColorA: string;
    sceneColorB: string;
  }
> = {
  dark: {
    accentColor: "red.300",
    accentSubtle: "orange.200",
    buttonPalette: "red",
    cardBorderColor: "red.500",
    cardSurface: "blackAlpha.700",
    glowColor: "rgba(255, 68, 68, 0.32)",
    gradientFrom: "#140101",
    gradientTo: "#400505",
    mutedTextColor: "gray.300",
    panelSurface: "rgba(26, 4, 7, 0.72)",
    sceneColorA: "#ff5c5c",
    sceneColorB: "#2a0408",
  },
  light: {
    accentColor: "cyan.200",
    accentSubtle: "green.200",
    buttonPalette: "blue",
    cardBorderColor: "cyan.300",
    cardSurface: "whiteAlpha.120",
    glowColor: "rgba(108, 228, 255, 0.28)",
    gradientFrom: "#021326",
    gradientTo: "#0c2448",
    mutedTextColor: "blue.50",
    panelSurface: "rgba(7, 26, 46, 0.64)",
    sceneColorA: "#7ae0ff",
    sceneColorB: "#153f6d",
  },
};
