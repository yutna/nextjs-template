export interface YouTubePlayerVars {
  autoplay?: 0 | 1;
  controls?: 0 | 1;
  disablekb?: 0 | 1;
  enablejsapi?: 0 | 1;
  fs?: 0 | 1;
  iv_load_policy?: 1 | 3;
  loop?: 0 | 1;
  modestbranding?: 0 | 1;
  mute?: 0 | 1;
  playlist?: string;
  rel?: 0 | 1;
}

export interface YouTubePlayerReadyEvent {
  target: YouTubePlayerInstance;
}

export interface YouTubePlayerOptions {
  videoId: string;

  events?: {
    onReady?: (event: YouTubePlayerReadyEvent) => void;
  };
  height?: number | string;
  playerVars?: YouTubePlayerVars;
  width?: number | string;
}

export interface YouTubePlayerInstance {
  destroy: () => void;
  mute: () => void;
  pauseVideo: () => void;
  playVideo: () => void;
  setVolume: (volume: number) => void;
  unMute: () => void;
}

export interface YouTubeIframeAPI {
  Player: new (
    element: HTMLElement,
    options: YouTubePlayerOptions,
  ) => YouTubePlayerInstance;
}

declare global {
  interface Window {
    onYouTubeIframeAPIReady?: () => void;
    YT?: YouTubeIframeAPI;
  }
}

export {};
