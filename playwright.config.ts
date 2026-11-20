import { defineConfig, devices } from "@playwright/test";

const port = 4321;

export default defineConfig({
  testDir: "tests/e2e",
  forbidOnly: !!process.env.CI,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: `http://localhost:${port}`,
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    // --ignore-lock keeps the server in the foreground; without it, Astro
    // detaches into a background server when it runs under an AI agent.
    command: `npx astro preview --port ${port} --ignore-lock`,
    url: `http://localhost:${port}/`,
    reuseExistingServer: !process.env.CI,
  },
});
