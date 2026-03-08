"use client";

import { useImmer } from "use-immer";

import { VibeContext } from "@/modules/static-pages/contexts/vibe";
import { sendVibePlayerCommand } from "@/modules/static-pages/lib/vibe-player-registry";

import type { VibeProviderProps } from "./types";

interface VibeState {
  isVibeOn: boolean;
  volume: number;
}

const INITIAL_STATE: VibeState = {
  isVibeOn: true,
  volume: 15,
};

export function VibeProvider({ children }: Readonly<VibeProviderProps>) {
  const [state, updateState] = useImmer<VibeState>(INITIAL_STATE);

  function toggleVibe() {
    const newVibeOn = !state.isVibeOn;
    updateState((draft) => {
      draft.isVibeOn = newVibeOn;
    });
    // Dispatching synchronously keeps the call within the user gesture context
    // so the browser's autoplay-with-sound policy is satisfied.
    if (newVibeOn) {
      sendVibePlayerCommand("setVolume", [state.volume]);
      sendVibePlayerCommand("unMute");
      sendVibePlayerCommand("playVideo");
    } else {
      sendVibePlayerCommand("mute");
      sendVibePlayerCommand("pauseVideo");
    }
  }

  function setVolume(newVolume: number) {
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
        isVibeOn: state.isVibeOn,
        setVolume,
        toggleVibe,
        volume: state.volume,
      }}
    >
      {children}
    </VibeContext>
  );
}
