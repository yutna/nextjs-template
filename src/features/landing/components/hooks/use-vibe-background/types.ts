import type { RefObject } from "react";

export interface UseVibeBackgroundReturn {
  handleLoadIframe: () => void;
  iframeRef: RefObject<HTMLIFrameElement | null>;
  isDesktop: boolean;
  isVibeOn: boolean;
}
