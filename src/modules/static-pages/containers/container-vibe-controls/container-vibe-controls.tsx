"use client";

import { useMediaQuery } from "usehooks-ts";

import { VibeControls } from "@/modules/static-pages/components/vibe-controls";
import { useVibe } from "@/modules/static-pages/hooks/use-vibe";

export function ContainerVibeControls() {
  const { handleChangeVolume, handleToggleVibe, isVibeOn, volume } = useVibe();
  const isDesktop = useMediaQuery("(min-width: 768px)", {
    initializeWithValue: false,
  });

  return (
    <VibeControls
      isDesktop={isDesktop}
      isVibeOn={isVibeOn}
      onChangeVolume={handleChangeVolume}
      onToggleVibe={handleToggleVibe}
      volume={volume}
    />
  );
}
