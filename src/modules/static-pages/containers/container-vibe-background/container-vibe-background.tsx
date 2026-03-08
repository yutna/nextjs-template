"use client";

import { VibeBackground } from "@/modules/static-pages/components/vibe-background";
import { useVibeBackground } from "@/modules/static-pages/hooks/use-vibe-background";

export function ContainerVibeBackground() {
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
