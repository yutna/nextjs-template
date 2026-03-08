import { dirname, join } from "path";
import { fileURLToPath } from "url";

import type { StorybookConfig } from "@storybook/nextjs-vite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const config: StorybookConfig = {
  addons: [
    "@storybook/addon-docs",
    "@storybook/addon-a11y",
    "@chromatic-com/storybook",
  ],
  features: {
    // Enable async server component rendering in Storybook
    experimentalRSC: true,
  },
  framework: {
    name: "@storybook/nextjs-vite",
    options: {
      nextConfigPath: "../next.config.ts",
    },
  },
  staticDirs: ["../public"],
  stories: ["../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  viteFinal: async (config) => {
    config.resolve ??= {};

    const newAliases = {
      // Neutralise server-only guard so server components load in the browser
      "server-only": join(__dirname, "mocks/server-only.ts"),
      // Provide locale-aware mock for next-intl server APIs
      "next-intl/server": join(__dirname, "mocks/next-intl-server.ts"),
    };

    // Storybook may pass aliases as an array — handle both formats safely
    config.resolve.alias = Array.isArray(config.resolve.alias)
      ? [
          ...config.resolve.alias,
          ...Object.entries(newAliases).map(([find, replacement]) => ({
            find,
            replacement,
          })),
        ]
      : { ...(config.resolve.alias ?? {}), ...newAliases };

    return config;
  },
};

export default config;
