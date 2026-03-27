"use client";

import { useVibeControls } from "@/features/landing/components/hooks/use-vibe-controls";
import { VibeControls } from "@/features/landing/components/vibe-controls";

export function VibeControlsPanel() {
  const { handleChangeVolume, handleToggleVibe, isDesktop, isVibeOn, volume } =
    useVibeControls();

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
