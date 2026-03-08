"use client";

import { VIBE_EMBED_SRC } from "./constants";
import styles from "./vibe-background.module.css";

import type { VibeBackgroundProps } from "./types";

export function VibeBackground({
  iframeRef,
  isDesktop,
  isVibeOn,
  onIframeLoad,
}: Readonly<VibeBackgroundProps>) {
  if (!isDesktop) return null;

  return (
    <div
      aria-hidden="true"
      className={`${styles.container}${!isVibeOn ? ` ${styles["container-hidden"]}` : ""}`}
    >
      <div className={styles.overlay} />
      <div className={styles["iframe-wrapper"]}>
        <iframe
          allow="autoplay; fullscreen"
          className={styles.iframe}
          onLoad={onIframeLoad}
          ref={iframeRef}
          src={VIBE_EMBED_SRC}
          title="vibe background"
        />
      </div>
    </div>
  );
}
