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
  {
    lightBg: "blue.100",
    darkBg: "blue.500/20",
    lightIcon: "blue.600",
    darkIcon: "blue.300",
  },
  {
    lightBg: "purple.100",
    darkBg: "purple.500/20",
    lightIcon: "purple.600",
    darkIcon: "purple.300",
  },
  {
    lightBg: "green.100",
    darkBg: "green.500/20",
    lightIcon: "green.600",
    darkIcon: "green.300",
  },
  {
    lightBg: "orange.100",
    darkBg: "orange.500/20",
    lightIcon: "orange.600",
    darkIcon: "orange.300",
  },
  {
    lightBg: "cyan.100",
    darkBg: "cyan.500/20",
    lightIcon: "cyan.600",
    darkIcon: "cyan.300",
  },
  {
    lightBg: "red.100",
    darkBg: "red.500/20",
    lightIcon: "red.600",
    darkIcon: "red.300",
  },
] as const;
