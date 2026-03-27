"use client";

import { useImmer } from "use-immer";

import { VibeContext } from "@/features/landing/components/contexts/vibe";
import { sendVibePlayerCommand } from "@/features/landing/components/lib/vibe-player-registry";

import { INITIAL_VIBE_STATE } from "./constants";

import type { VibeProviderProps, VibeState } from "./types";

export function VibeProvider({ children }: Readonly<VibeProviderProps>) {
  const [state, updateState] = useImmer<VibeState>(INITIAL_VIBE_STATE);

  function handleToggleVibe() {
    const newVibeOn = !state.isVibeOn;
    updateState((draft) => {
      draft.isVibeOn = newVibeOn;
    });
    // Dispatching synchronously keeps the call within the user gesture context
    // so the browser's autoplay-with-sound policy is satisfied.
    if (newVibeOn) {
      sendVibePlayerCommand("seekTo", [0, true]);
      sendVibePlayerCommand("setVolume", [state.volume]);
      sendVibePlayerCommand("unMute");
      sendVibePlayerCommand("playVideo");
    } else {
      sendVibePlayerCommand("mute");
      sendVibePlayerCommand("pauseVideo");
    }
  }

  function handleChangeVolume(newVolume: number) {
    const clamped = Math.max(0, Math.min(100, newVolume));
    updateState((draft) => {
      draft.volume = clamped;
    });
    // Dispatching synchronously preserves user gesture context.
    if (state.isVibeOn) {
      sendVibePlayerCommand("setVolume", [clamped]);
      sendVibePlayerCommand("unMute");
    }
  }

  return (
    <VibeContext
      value={{
        handleChangeVolume,
        handleToggleVibe,
        isVibeOn: state.isVibeOn,
        volume: state.volume,
      }}
    >
      {children}
    </VibeContext>
  );
}
