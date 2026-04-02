import { defineConfig, devices } from "@playwright/test";

const isCI = !!process.env.CI;

export default defineConfig({
  forbidOnly: isCI,
  fullyParallel: true,
  reporter: isCI ? [["github"], ["html"]] : [["html"]],
  retries: isCI ? 2 : 0,
  testDir: "./e2e",
  workers: isCI ? 1 : undefined,

  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  webServer: {
    command: isCI ? "npm run build && npm start" : "npm run dev",
    reuseExistingServer: !isCI,
    url: "http://localhost:3000",
  },
});
