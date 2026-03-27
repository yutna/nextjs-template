import { afterEach, describe, expect, it, vi } from "vitest";

import {
  registerVibePlayerCommand,
  sendVibePlayerCommand,
} from "./vibe-player-registry";

describe("vibe-player-registry", () => {
  afterEach(() => {
    registerVibePlayerCommand(null);
  });

  it("does nothing when no command function is registered", () => {
    expect(() => sendVibePlayerCommand("playVideo")).not.toThrow();
  });

  it("calls the registered function with func and args", () => {
    const fn = vi.fn();
    registerVibePlayerCommand(fn);

    sendVibePlayerCommand("setVolume", [80]);

    expect(fn).toHaveBeenCalledWith("setVolume", [80]);
  });

  it("calls the registered function with no args", () => {
    const fn = vi.fn();
    registerVibePlayerCommand(fn);

    sendVibePlayerCommand("playVideo");

    expect(fn).toHaveBeenCalledWith("playVideo", undefined);
  });

  it("stops calling after deregistration", () => {
    const fn = vi.fn();
    registerVibePlayerCommand(fn);
    registerVibePlayerCommand(null);

    sendVibePlayerCommand("pauseVideo");

    expect(fn).not.toHaveBeenCalled();
  });

  it("calls the latest registered function", () => {
    const first = vi.fn();
    const second = vi.fn();
    registerVibePlayerCommand(first);
    registerVibePlayerCommand(second);

    sendVibePlayerCommand("mute");

    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledWith("mute", undefined);
  });
});
