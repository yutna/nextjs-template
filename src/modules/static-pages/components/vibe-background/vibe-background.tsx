"use client";

import { useEffect, useRef } from "react";
import { useImmer } from "use-immer";

import { useVibe } from "@/modules/static-pages/hooks/use-vibe";
import { registerVibePlayerCommand } from "@/modules/static-pages/lib/vibe-player-registry";

import { VIBE_EMBED_SRC } from "./constants";
import styles from "./vibe-background.module.css";

interface VibeBackgroundState {
  isDesktop: boolean;
}

function sendYouTubeCommand(
  iframe: HTMLIFrameElement,
  func: string,
  args: unknown[] = [],
) {
  iframe.contentWindow?.postMessage(
    JSON.stringify({ args, event: "command", func }),
    "https://www.youtube.com",
  );
}

export function VibeBackground() {
  const { isVibeOn, volume } = useVibe();
  const [state, updateState] = useImmer<VibeBackgroundState>({
    isDesktop: false,
  });
  // Ref tracks the latest volume so the onReady handler always reads the
  // current value without needing to re-register on every volume change.
  const volumeRef = useRef(volume);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    volumeRef.current = volume;
  }, [volume]);

  // Detect desktop breakpoint (768px = md).
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");

    updateState((draft) => {
      draft.isDesktop = mq.matches;
    });

    function handleChange(e: MediaQueryListEvent) {
      updateState((draft) => {
        draft.isDesktop = e.matches;
      });
    }

    mq.addEventListener("change", handleChange);
    return () => mq.removeEventListener("change", handleChange);
  }, [updateState]);

  // postMessage listener: handles onReady (register player command, set volume)
  // and onStateChange state=0 (restart before YouTube shows the end-screen).
  useEffect(() => {
    if (!state.isDesktop) return;

    function handleMessage(e: MessageEvent) {
      if (e.origin !== "https://www.youtube.com") return;

      const iframe = iframeRef.current;
      if (!iframe || e.source !== iframe.contentWindow) return;

      let data: unknown;
      try {
        data = typeof e.data === "string" ? JSON.parse(e.data) : e.data;
      } catch {
        return;
      }

      if (typeof data !== "object" || data === null || !("event" in data)) {
        return;
      }

      const payload = data as { event: string; info?: unknown };

      if (payload.event === "onReady") {
        // Expose a command function so VibeProvider can dispatch player
        // commands synchronously from user gestures, preserving the
        // browser's autoplay-with-sound policy.
        registerVibePlayerCommand((func, args) => {
          if (iframeRef.current) {
            sendYouTubeCommand(iframeRef.current, func, args);
          }
        });
        // Set initial volume; video stays muted via mute=1 URL param until
        // the user interacts (first gesture will call unMute via provider).
        sendYouTubeCommand(iframe, "setVolume", [volumeRef.current]);
      }

      // state 0 = ended — restart immediately so YouTube never shows the
      // end-screen / suggested-videos overlay between loops.
      if (payload.event === "onStateChange" && payload.info === 0) {
        sendYouTubeCommand(iframe, "seekTo", [0, true]);
        sendYouTubeCommand(iframe, "playVideo");
      }
    }

    window.addEventListener("message", handleMessage);
    return () => {
      window.removeEventListener("message", handleMessage);
      registerVibePlayerCommand(null);
    };
  }, [state.isDesktop]);

  // Tell YouTube to start sending API events. Without this listening handshake
  // YouTube does not deliver onReady / onStateChange postMessages, and player
  // commands (setVolume, unMute, seekTo, etc.) are silently ignored.
  function handleIframeLoad() {
    iframeRef.current?.contentWindow?.postMessage(
      JSON.stringify({ event: "listening", id: 1 }),
      "https://www.youtube.com",
    );
  }

  // Signal active state to DOM so hero text can adapt its colour variables.
  useEffect(() => {
    if (state.isDesktop && isVibeOn) {
      document.documentElement.setAttribute("data-vibe-active", "1");
    } else {
      document.documentElement.removeAttribute("data-vibe-active");
    }
    return () => {
      document.documentElement.removeAttribute("data-vibe-active");
    };
  }, [isVibeOn, state.isDesktop]);

  if (!state.isDesktop) return null;

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
          onLoad={handleIframeLoad}
          ref={iframeRef}
          src={VIBE_EMBED_SRC}
          title="vibe background"
        />
      </div>
    </div>
  );
}
