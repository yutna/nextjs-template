import type { RefObject } from "react";

export interface VibeBackgroundProps {
  iframeRef: RefObject<HTMLIFrameElement | null>;
  isDesktop: boolean;
  isVibeOn: boolean;

  onIframeLoad: () => void;
}
