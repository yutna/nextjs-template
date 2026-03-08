"use client";

import { Box, HStack, Separator } from "@chakra-ui/react";
import { useEffect } from "react";
import { LuVolume2, LuVolumeX } from "react-icons/lu";
import { useImmer } from "use-immer";

import { useVibe } from "@/modules/static-pages/hooks/use-vibe";

import { BARS_COUNT, VOLUME_MAX, VOLUME_MIN, VOLUME_STEP } from "./constants";
import styles from "./vibe-controls.module.css";

interface VibeControlsState {
  isDesktop: boolean;
}

export function VibeControls() {
  const { isVibeOn, setVolume, toggleVibe, volume } = useVibe();
  const [state, updateState] = useImmer<VibeControlsState>({
    isDesktop: false,
  });

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

  const iconColor = { _dark: "gray.300", base: "gray.600" };

  if (!state.isDesktop) return null;

  return (
    <>
      <HStack gap={1.5} px={1}>
        {/* Animated volume bars visualizer */}
        <Box
          aria-hidden="true"
          color={
            isVibeOn
              ? { _dark: "blue.400", base: "blue.500" }
              : { _dark: "gray.600", base: "gray.300" }
          }
        >
          <div className={styles.bars}>
            {Array.from({ length: BARS_COUNT }, (_, i) => (
              <div
                className={`${styles.bar}${isVibeOn ? ` ${styles["bar-active"]}` : ""}`}
                key={i}
              />
            ))}
          </div>
        </Box>

        {/* Volume slider */}
        <input
          aria-label="Vibe volume"
          className={`${styles["volume-slider"]}${!isVibeOn ? ` ${styles["volume-slider-disabled"]}` : ""}`}
          disabled={!isVibeOn}
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
        orientation="vertical"
      />

      {/* Vibe toggle button */}
      <Box
        _hover={{ bg: { _dark: "gray.800", base: "gray.100" } }}
        aria-label={isVibeOn ? "Turn off vibe" : "Turn on vibe"}
        as="button"
        borderRadius="full"
        color={isVibeOn ? { _dark: "blue.400", base: "blue.500" } : iconColor}
        cursor="pointer"
        display="flex"
        onClick={toggleVibe}
        p={1.5}
        transition="all 0.15s ease"
      >
        {isVibeOn ? <LuVolume2 size={14} /> : <LuVolumeX size={14} />}
      </Box>

      <Separator
        borderColor={{ _dark: "gray.700", base: "gray.200" }}
        height="5"
        orientation="vertical"
      />
    </>
  );
}
