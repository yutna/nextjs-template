"use client";

import { useEffect, useRef } from "react";
import { useImmer } from "use-immer";

import { useVibe } from "@/modules/static-pages/hooks/use-vibe";

import { VIBE_VIDEO_ID } from "./constants";
import styles from "./vibe-background.module.css";

import type { YouTubePlayerInstance } from "./types";

interface VibeBackgroundState {
  isDesktop: boolean;
  isPlayerReady: boolean;
}

export function VibeBackground() {
  const { isVibeOn, volume } = useVibe();
  const [state, updateState] = useImmer<VibeBackgroundState>({
    isDesktop: false,
    isPlayerReady: false,
  });
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<null | YouTubePlayerInstance>(null);

  // Detect desktop breakpoint (768px = md)
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

  // Initialize YouTube player only on desktop
  useEffect(() => {
    if (!state.isDesktop || !containerRef.current) return;

    const containerEl = containerRef.current;

    function initPlayer() {
      if (!containerEl || !window.YT?.Player) return;

      playerRef.current = new window.YT.Player(containerEl, {
        events: {
          onReady: (event) => {
            // Start playing immediately (autoplay:1 playerVar may be blocked
            // by the browser before onReady; calling playVideo() here is the
            // reliable fallback.)
            event.target.playVideo();
            event.target.setVolume(volume);
            if (isVibeOn) {
              event.target.unMute();
            } else {
              event.target.mute();
            }
            updateState((draft) => {
              draft.isPlayerReady = true;
            });
          },
        },
        height: "100%",
        playerVars: {
          autoplay: 1,
          controls: 0,
          disablekb: 1,
          fs: 0,
          iv_load_policy: 3,
          loop: 1,
          modestbranding: 1,
          mute: 1,
          playlist: VIBE_VIDEO_ID,
          rel: 0,
        },
        videoId: VIBE_VIDEO_ID,
        width: "100%",
      });
    }

    if (window.YT?.Player) {
      initPlayer();
    } else {
      const previousCallback = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        previousCallback?.();
        initPlayer();
      };

      if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
        const script = document.createElement("script");
        script.async = true;
        script.src = "https://www.youtube.com/iframe_api";
        document.head.appendChild(script);
      }
    }

    return () => {
      playerRef.current?.destroy();
      playerRef.current = null;
      updateState((draft) => {
        draft.isPlayerReady = false;
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.isDesktop]);

  // Sync vibe on/off + volume to YouTube player
  useEffect(() => {
    if (!state.isPlayerReady || !playerRef.current) return;

    if (isVibeOn) {
      playerRef.current.unMute();
      playerRef.current.setVolume(volume);
      playerRef.current.playVideo();
    } else {
      playerRef.current.mute();
      playerRef.current.pauseVideo();
    }
  }, [isVibeOn, volume, state.isPlayerReady]);

  // Signal active state to DOM so hero text can adapt its color
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

  const isHidden = !isVibeOn;

  if (!state.isDesktop) return null;

  return (
    <div
      aria-hidden="true"
      className={`${styles.container}${isHidden ? ` ${styles["container-hidden"]}` : ""}`}
    >
      <div className={styles.overlay} />
      <div className={styles["iframe-wrapper"]}>
        <div className={styles.iframe} ref={containerRef} />
      </div>
    </div>
  );
}
