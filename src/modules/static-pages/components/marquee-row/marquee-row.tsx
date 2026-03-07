"use client";

import { Box } from "@chakra-ui/react";

import type { MarqueeRowProps } from "./types";

export function MarqueeRow({
  children,
  duration = 30,
}: Readonly<MarqueeRowProps>) {
  return (
    <Box
      css={{
        "@media (prefers-reduced-motion: reduce)": {
          "& .marquee-track": {
            animationPlayState: "paused",
          },
        },
        "maskImage":
          "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
        "WebkitMaskImage":
          "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
      }}
      overflow="hidden"
      position="relative"
    >
      <Box
        className="marquee-track"
        css={{
          "@keyframes marquee": {
            "0%": { transform: "translateX(0)" },
            "100%": { transform: "translateX(-50%)" },
          },
          "animation": `marquee ${duration}s linear infinite`,
        }}
        display="flex"
        gap="4"
        w="max-content"
      >
        {children}
        {children}
      </Box>
    </Box>
  );
}
