"use client";

import { Box } from "@chakra-ui/react";

import { type MarqueeRowProps } from "./types";

export function MarqueeRow({
  children,
  duration = 30,
}: Readonly<MarqueeRowProps>) {
  return (
    <Box
      overflow="hidden"
      position="relative"
      css={{
        "maskImage":
          "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
        "WebkitMaskImage":
          "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
        "@media (prefers-reduced-motion: reduce)": {
          "& .marquee-track": {
            animationPlayState: "paused",
          },
        },
      }}
    >
      <Box
        className="marquee-track"
        display="flex"
        gap="4"
        w="max-content"
        css={{
          "animation": `marquee ${duration}s linear infinite`,
          "@keyframes marquee": {
            "0%": { transform: "translateX(0)" },
            "100%": { transform: "translateX(-50%)" },
          },
        }}
      >
        {children}
        {children}
      </Box>
    </Box>
  );
}
