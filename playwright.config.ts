import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  timeout: 60000,
  expect: {
    timeout: 10000,
  },
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [["list"], ["json", { outputFile: "tests/results/test-results.json" }]],
  use: {
    baseURL: "http://localhost:8085",
    trace: "retain-on-failure",
    video: "off",
  },
  webServer: {
    command: "node tests/fixtures/server.mjs",
    port: 8085,
    reuseExistingServer: true,
    timeout: 15000,
  },
});
