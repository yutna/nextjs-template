export const VIBE_VIDEO_ID = "IVugCjwIqKw";

// loop=1 requires playlist=VIDEO_ID for YouTube's native loop to activate.
// Without playlist, loop is silently ignored and the end-screen appears.
// The manual onStateChange=0 handler in vibe-background is kept as a backup.
export const VIBE_EMBED_SRC =
  "https://www.youtube.com/embed/IVugCjwIqKw" +
  "?autoplay=1&mute=1&controls=0&disablekb=1&fs=0" +
  "&iv_load_policy=3&loop=1&playlist=IVugCjwIqKw&rel=0&modestbranding=1&enablejsapi=1&playsinline=1";
