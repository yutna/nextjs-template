"use client";

import { useVibeBackground } from "@/features/landing/components/hooks/use-vibe-background";
import { VibeBackground } from "@/features/landing/components/vibe-background";

export function VibeBackgroundPanel() {
  const { handleLoadIframe, iframeRef, isDesktop, isVibeOn } =
    useVibeBackground();

  return (
    <VibeBackground
      iframeRef={iframeRef}
      isDesktop={isDesktop}
      isVibeOn={isVibeOn}
      onLoadIframe={handleLoadIframe}
    />
  );
}
