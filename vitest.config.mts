import { join } from "path";

import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    coverage: {
      exclude: [
        "src/test/**",
        "src/**/*.d.ts",
        "src/**/*.stories.{ts,tsx}",
        "src/**/{index,types}.ts",
        "src/**/types/**",
        "src/app/**",
        "src/proxy.ts",
        "src/shared/vendor/**",
        "src/shared/config/env.ts",
        "src/shared/config/fonts.ts",
        "src/shared/config/i18n/request.tsx",
      ],
      include: ["src/**/*.{ts,tsx}"],
      provider: "v8",
      thresholds: {
        branches: 75,
        functions: 80,
        lines: 80,
        statements: 80,
      },
    },
    environment: "jsdom",
    globals: true,
    projects: [
      {
        plugins: [tsconfigPaths(), react()],
        test: {
          environment: "jsdom",
          globals: true,
          include: ["src/**/*.test.{ts,tsx}", "eslint/**/*.test.ts"],
          exclude: ["src/test/stories-smoke.test.tsx"],
          name: "unit",
          setupFiles: ["./src/test/setup.ts"],
        },
      },
      {
        plugins: [tsconfigPaths(), react()],
        resolve: {
          alias: {
            "@storybook-preview": join(
              import.meta.dirname,
              ".storybook/preview.tsx",
            ),
            "next-intl/navigation": join(
              import.meta.dirname,
              ".storybook/mocks/next-intl-navigation.ts",
            ),
            "next-intl/server": join(
              import.meta.dirname,
              ".storybook/mocks/next-intl-server.ts",
            ),
            "next/navigation": join(
              import.meta.dirname,
              ".storybook/mocks/next-navigation.ts",
            ),
            "server-only": join(
              import.meta.dirname,
              ".storybook/mocks/server-only.ts",
            ),
          },
        },
        test: {
          deps: {
            optimizer: {
              web: {
                enabled: true,
                include: ["next-intl"],
              },
            },
          },
          environment: "jsdom",
          globals: true,
          include: ["src/test/stories-smoke.test.tsx"],
          name: "storybook",
          setupFiles: [
            "./src/test/storybook-setup.ts",
          ],
        },
      },
    ],
    setupFiles: ["./src/test/setup.ts"],
  },
});
