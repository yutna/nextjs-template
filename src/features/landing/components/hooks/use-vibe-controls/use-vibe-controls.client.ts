"use client";

import { useMediaQuery } from "usehooks-ts";

import { useVibe } from "@/features/landing/components/hooks/use-vibe";

import type { UseVibeControlsReturn } from "./types";

export function useVibeControls(): UseVibeControlsReturn {
  const { handleChangeVolume, handleToggleVibe, isVibeOn, volume } = useVibe();
  const isDesktop = useMediaQuery("(min-width: 768px)", {
    initializeWithValue: false,
  });

  return {
    handleChangeVolume,
    handleToggleVibe,
    isDesktop,
    isVibeOn,
    volume,
  };
}
