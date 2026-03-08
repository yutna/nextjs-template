export function sendYouTubeCommand(
  iframe: HTMLIFrameElement,
  func: string,
  args: unknown[] = [],
): void {
  iframe.contentWindow?.postMessage(
    JSON.stringify({ args, event: "command", func }),
    "https://www.youtube.com",
  );
}
