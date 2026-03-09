import { dirname, join } from "path";
import { fileURLToPath } from "url";
import tsconfigPaths from "vite-tsconfig-paths";

import type { StorybookConfig } from "@storybook/nextjs-vite";
import type { Plugin } from "vite";

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
      nextConfigPath: join(__dirname, "..", "next.config.ts"),
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
      // Stub server action that imports node:path via error-reporter
      "@/shared/actions/report-error-action": join(
        __dirname,
        "mocks/report-error-action.ts",
      ),
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

    // Replace any existing vite-tsconfig-paths plugins with one that uses an
    // explicit `projects` list. This bypasses findAll() which can scan parent
    // directories and pick up tsconfig files from sibling projects when the
    // Vite workspace root resolves above the project boundary.
    config.plugins = (config.plugins ?? []).filter(
      (p) =>
        !(
          p &&
          typeof p === "object" &&
          "name" in p &&
          (p as Plugin).name === "vite-tsconfig-paths"
        ),
    );
    config.plugins.push(
      tsconfigPaths({
        ignoreConfigErrors: true,
        projects: [join(__dirname, "..", "tsconfig.json")],
      }),
    );

    return config;
  },
};

export default config;
