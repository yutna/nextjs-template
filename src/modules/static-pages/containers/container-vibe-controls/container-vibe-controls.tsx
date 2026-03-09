"use client";

import { VibeControls } from "@/modules/static-pages/components/vibe-controls";
import { useVibeControls } from "@/modules/static-pages/hooks/use-vibe-controls";

export function ContainerVibeControls() {
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
