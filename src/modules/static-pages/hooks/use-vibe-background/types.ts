import type { RefObject } from "react";

export interface UseVibeBackgroundReturn {
  iframeRef: RefObject<HTMLIFrameElement | null>;
  isDesktop: boolean;
  isVibeOn: boolean;
  onIframeLoad: () => void;
}
