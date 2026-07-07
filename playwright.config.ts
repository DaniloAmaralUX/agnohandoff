import { defineConfig, devices } from "@playwright/test";

/* E2E de fumaça — validam navegação/telas independente do modo (mock ou API).
   Local: reusa o dev server em :3000. CI (sem .env.local): sobe em modo demo (mock). */
export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 30_000,
  expect: { timeout: 10_000 },
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: { baseURL: "http://localhost:3000", trace: "on-first-retry" },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "pnpm exec next dev -p 3000",
    url: "http://localhost:3000",
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
