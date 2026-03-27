import { describe, expect, it, vi } from "vitest";

import { sendYouTubeCommand } from "./youtube-command";

describe("sendYouTubeCommand", () => {
  it("posts a JSON command message to the YouTube iframe", () => {
    const postMessage = vi.fn();
    const iframe = {
      contentWindow: { postMessage },
    } as unknown as HTMLIFrameElement;

    sendYouTubeCommand(iframe, "playVideo", []);

    expect(postMessage).toHaveBeenCalledWith(
      JSON.stringify({ args: [], event: "command", func: "playVideo" }),
      "https://www.youtube.com",
    );
  });

  it("defaults args to empty array when not provided", () => {
    const postMessage = vi.fn();
    const iframe = {
      contentWindow: { postMessage },
    } as unknown as HTMLIFrameElement;

    sendYouTubeCommand(iframe, "pauseVideo");

    expect(postMessage).toHaveBeenCalledWith(
      JSON.stringify({ args: [], event: "command", func: "pauseVideo" }),
      "https://www.youtube.com",
    );
  });

  it("does not throw when contentWindow is null", () => {
    const iframe = { contentWindow: null } as unknown as HTMLIFrameElement;

    expect(() => sendYouTubeCommand(iframe, "playVideo")).not.toThrow();
  });
});
