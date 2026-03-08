"use client";

import { Box } from "@chakra-ui/react";

import styles from "./marquee-row.module.css";

import type { CSSProperties } from "react";
import type { MarqueeRowProps } from "./types";

export function MarqueeRow({
  children,
  duration = 30,
  reverse = false,
}: Readonly<MarqueeRowProps>) {
  return (
    <Box
      css={{
        maskImage:
          "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
        WebkitMaskImage:
          "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
      }}
      overflow="hidden"
      position="relative"
      w="full"
    >
      <div
        className={`${styles.track} ${reverse ? styles.reverse : styles.forward}`}
        // eslint-disable-next-line project/no-inline-style -- CSS custom property injection
        style={
          { "--marquee-duration": `${duration}s` } as CSSProperties
        }
      >
        <Box display="flex" gap="4" w="max-content">
          {children}
          {children}
        </Box>
      </div>
    </Box>
  );
}
