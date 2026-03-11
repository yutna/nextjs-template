"use client";

import { useCallback, useEffect, useRef } from "react";
import { useImmer } from "use-immer";

import type { GalacticArchiveSide } from "@/modules/reference-patterns/lib/galactic-archive-query-state";
import type { UseGalacticArchiveAudioReturn } from "./types";

const DARK_TONES = [220, 196, 146.83] as const;
const LIGHT_TONES = [392, 523.25, 659.25] as const;
const NOTE_DURATION_SECONDS = 0.09;

function getToneFrequencies(side: GalacticArchiveSide) {
  return side === "light" ? LIGHT_TONES : DARK_TONES;
}

export function useGalacticArchiveAudio(): UseGalacticArchiveAudioReturn {
  const audioContextRef = useRef<AudioContext | null>(null);
  const [isSoundEnabled, updateIsSoundEnabled] = useImmer(true);

  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        void audioContextRef.current.close();
      }
    };
  }, []);

  const getAudioContext = useCallback(() => {
    if (typeof window === "undefined" || !("AudioContext" in window)) {
      return null;
    }

    if (!audioContextRef.current || audioContextRef.current.state === "closed") {
      audioContextRef.current = new window.AudioContext();
    }

    return audioContextRef.current;
  }, []);

  const handleToggleSound = useCallback(() => {
    updateIsSoundEnabled((currentValue) => !currentValue);
  }, [updateIsSoundEnabled]);

  const playSideCue = useCallback(
    (side: GalacticArchiveSide) => {
      if (!isSoundEnabled) {
        return;
      }

      const audioContext = getAudioContext();

      if (!audioContext) {
        return;
      }

      void audioContext.resume();

      const startTime = audioContext.currentTime;

      getToneFrequencies(side).forEach((frequency, index) => {
        const oscillator = audioContext.createOscillator();
        const gain = audioContext.createGain();
        const noteStartTime = startTime + index * NOTE_DURATION_SECONDS;
        const noteEndTime = noteStartTime + NOTE_DURATION_SECONDS * 1.7;

        oscillator.type = side === "light" ? "sine" : "sawtooth";
        oscillator.frequency.setValueAtTime(frequency, noteStartTime);

        gain.gain.setValueAtTime(0.0001, noteStartTime);
        gain.gain.exponentialRampToValueAtTime(0.045, noteStartTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, noteEndTime);

        oscillator.connect(gain);
        gain.connect(audioContext.destination);
        oscillator.start(noteStartTime);
        oscillator.stop(noteEndTime);
      });
    },
    [getAudioContext, isSoundEnabled],
  );

  return {
    handleToggleSound,
    isSoundEnabled,
    playSideCue,
  };
}
