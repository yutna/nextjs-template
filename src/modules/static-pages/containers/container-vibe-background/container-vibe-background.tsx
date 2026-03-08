"use client";

import { VibeBackground } from "@/modules/static-pages/components/vibe-background";
import { useVibeBackground } from "@/modules/static-pages/hooks/use-vibe-background";

export function ContainerVibeBackground() {
  const { iframeRef, isDesktop, isVibeOn, onIframeLoad } =
    useVibeBackground();

  return (
    <VibeBackground
      iframeRef={iframeRef}
      isDesktop={isDesktop}
      isVibeOn={isVibeOn}
      onIframeLoad={onIframeLoad}
    />
  );
}
