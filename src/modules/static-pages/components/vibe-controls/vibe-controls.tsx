"use client";

import { HStack, Separator } from "@chakra-ui/react";
import { useMediaQuery } from "usehooks-ts";

import { useVibe } from "@/modules/static-pages/hooks/use-vibe";

import { BARS_COUNT, VOLUME_MAX, VOLUME_MIN, VOLUME_STEP } from "./constants";
import styles from "./vibe-controls.module.css";

export function VibeControls() {
  const { isVibeOn, setVolume, toggleVibe, volume } = useVibe();
  const isDesktop = useMediaQuery("(min-width: 768px)");

  if (!isDesktop) return null;

  return (
    <>
      {/* Volume panel — grid 0fr→1fr gives silky slide vs max-width jitter */}
      <div
        className={`${styles["volume-panel"]}${isVibeOn ? ` ${styles["volume-panel-active"]}` : ""}`}
      >
        <div className={styles["volume-inner"]}>
          <HStack gap={1.5} px={1}>
            <div aria-hidden="true" className={styles.bars}>
              {Array.from({ length: BARS_COUNT }, (_, i) => (
                <div
                  className={`${styles.bar} ${styles["bar-active"]}`}
                  key={i}
                />
              ))}
            </div>
            <input
              aria-label="Vibe volume"
              className={styles["volume-slider"]}
              max={VOLUME_MAX}
              min={VOLUME_MIN}
              onChange={(e) => setVolume(Number(e.target.value))}
              step={VOLUME_STEP}
              type="range"
              value={volume}
            />
          </HStack>
          <Separator
            borderColor={{ _dark: "gray.700", base: "gray.200" }}
            height="5"
            mx={1}
            orientation="vertical"
          />
        </div>
      </div>

      {/* Vibe toggle — gradient background when on, muted text when off */}
      <button
        aria-label={isVibeOn ? "Turn off vibe" : "Turn on vibe"}
        className={`${styles["vibe-button"]}${isVibeOn ? ` ${styles["vibe-button-on"]}` : ""}`}
        onClick={toggleVibe}
      >
        Vibe{" "}
        <span
          className={`${styles["vibe-label"]}${isVibeOn ? "" : ` ${styles["vibe-label-italic"]}`}`}
        >
          {isVibeOn ? "On" : "off"}
        </span>
      </button>

      <Separator
        borderColor={{ _dark: "gray.700", base: "gray.200" }}
        height="5"
        orientation="vertical"
      />
    </>
  );
}
