import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react";

const customConfig = defineConfig({
  globalCss: {
    "html, body": {
      fontFamily: "var(--font-noto-sans-thai), sans-serif",
    },
  },
  theme: {
    tokens: {
      fonts: {
        body: { value: "var(--font-noto-sans-thai), sans-serif" },
        heading: { value: "var(--font-noto-sans-thai), sans-serif" },
        mono: { value: "var(--font-jetbrains-mono), monospace" },
      },
    },
  },
});

export const system = createSystem(defaultConfig, customConfig);
