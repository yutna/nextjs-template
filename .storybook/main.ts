import { dirname, join } from "path";
import { fileURLToPath } from "url";

import type { StorybookConfig } from "@storybook/nextjs-vite";
import type { PluginOption } from "vite";

process.env.NEXT_PUBLIC_API_URL ||= "https://api.example.com";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const TS_CONFIG_PATH_PLUGIN_NAMES = new Set([
  "vite-plugin-tsconfig-paths",
  "vite-tsconfig-paths",
]);

function isPromiseLikePluginOption(
  value: unknown,
): value is PromiseLike<PluginOption> {
  if (!value || (typeof value !== "object" && typeof value !== "function")) {
    return false;
  }

  return (
    "then" in value && typeof (value as { then?: unknown }).then === "function"
  );
}

function stripTsconfigPathPlugins(pluginOption: PluginOption): PluginOption {
  if (Array.isArray(pluginOption)) {
    return pluginOption
      .map((entry) => stripTsconfigPathPlugins(entry))
      .filter((entry) => entry !== false && entry != null);
  }

  if (isPromiseLikePluginOption(pluginOption)) {
    return Promise.resolve(pluginOption).then((resolvedPlugin) =>
      stripTsconfigPathPlugins(resolvedPlugin),
    );
  }

  if (
    pluginOption &&
    typeof pluginOption === "object" &&
    "name" in pluginOption &&
    typeof (pluginOption as { name?: unknown }).name === "string"
  ) {
    const pluginName = (pluginOption as { name: string }).name;
    if (TS_CONFIG_PATH_PLUGIN_NAMES.has(pluginName)) {
      return false;
    }
  }

  return pluginOption;
}

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
    config.resolve.tsconfigPaths = true;

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

    // Remove tsconfig-path plugins (including async plugin options from
    // Storybook internals) and rely on Vite's native `resolve.tsconfigPaths`.
    config.plugins = (config.plugins ?? [])
      .map((pluginOption) => stripTsconfigPathPlugins(pluginOption))
      .filter((pluginOption) => pluginOption !== false && pluginOption != null);

    config.build ??= {};
    // Storybook bundles docs/a11y/chromatic runtime together and can exceed
    // Vite's default 500 kB warning threshold.
    config.build.chunkSizeWarningLimit = 1500;

    return config;
  },
};

export default config;
