import {
  LuGlobe,
  LuLock,
  LuMoon,
  LuPalette,
  LuRoute,
  LuShield,
} from "react-icons/lu";

export const FEATURE_ICONS = [
  LuRoute,
  LuPalette,
  LuShield,
  LuGlobe,
  LuMoon,
  LuLock,
] as const;

export const FEATURE_COLORS = [
  { from: "blue.400", to: "cyan.400" },
  { from: "purple.400", to: "pink.400" },
  { from: "green.400", to: "teal.400" },
  { from: "orange.400", to: "yellow.400" },
  { from: "indigo.400", to: "purple.400" },
  { from: "red.400", to: "orange.400" },
] as const;
