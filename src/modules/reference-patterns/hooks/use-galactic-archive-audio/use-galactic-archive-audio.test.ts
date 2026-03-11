import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useGalacticArchiveAudio } from "./use-galactic-archive-audio";

function createMockAudioContext() {
  return {
    close: vi.fn().mockResolvedValue(undefined),
    createGain: vi.fn(() => ({
      connect: vi.fn(),
      gain: {
        exponentialRampToValueAtTime: vi.fn(),
        setValueAtTime: vi.fn(),
      },
    })),
    createOscillator: vi.fn(() => ({
      connect: vi.fn(),
      frequency: {
        setValueAtTime: vi.fn(),
      },
      start: vi.fn(),
      stop: vi.fn(),
      type: "sine",
    })),
    currentTime: 1,
    destination: {},
    resume: vi.fn().mockResolvedValue(undefined),
    state: "running",
  };
}

describe("useGalacticArchiveAudio", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("starts with sound enabled and toggles it off", () => {
    const { result } = renderHook(() => useGalacticArchiveAudio());

    expect(result.current.isSoundEnabled).toBe(true);

    act(() => {
      result.current.handleToggleSound();
    });

    expect(result.current.isSoundEnabled).toBe(false);
  });

  it("plays three tones when sound is enabled", () => {
    const mockAudioContext = createMockAudioContext();
    function MockAudioContext() {
      return mockAudioContext;
    }

    Object.defineProperty(window, "AudioContext", {
      configurable: true,
      value: MockAudioContext,
    });

    const { result } = renderHook(() => useGalacticArchiveAudio());

    act(() => {
      result.current.playSideCue("light");
    });

    expect(mockAudioContext.resume).toHaveBeenCalledOnce();
    expect(mockAudioContext.createOscillator).toHaveBeenCalledTimes(3);
    expect(mockAudioContext.createGain).toHaveBeenCalledTimes(3);
  });

  it("does not create audio nodes when sound is disabled", () => {
    const mockAudioContext = createMockAudioContext();
    function MockAudioContext() {
      return mockAudioContext;
    }

    Object.defineProperty(window, "AudioContext", {
      configurable: true,
      value: MockAudioContext,
    });

    const { result } = renderHook(() => useGalacticArchiveAudio());

    act(() => {
      result.current.handleToggleSound();
    });
    act(() => {
      result.current.playSideCue("dark");
    });

    expect(mockAudioContext.createOscillator).not.toHaveBeenCalled();
    expect(mockAudioContext.createGain).not.toHaveBeenCalled();
  });

  it("closes the audio context on unmount", () => {
    const mockAudioContext = createMockAudioContext();
    function MockAudioContext() {
      return mockAudioContext;
    }

    Object.defineProperty(window, "AudioContext", {
      configurable: true,
      value: MockAudioContext,
    });

    const { result, unmount } = renderHook(() => useGalacticArchiveAudio());

    act(() => {
      result.current.playSideCue("light");
    });
    unmount();

    expect(mockAudioContext.close).toHaveBeenCalledOnce();
  });
});
