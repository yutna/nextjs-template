"use client";

import { useImmer } from "use-immer";

import { VibeContext } from "@/modules/static-pages/contexts/vibe";

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
    updateState((draft) => {
      draft.isVibeOn = !draft.isVibeOn;
    });
  }

  function setVolume(volume: number) {
    updateState((draft) => {
      draft.volume = Math.max(0, Math.min(100, volume));
    });
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
