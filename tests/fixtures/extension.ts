import { test as base, chromium, type BrowserContext, type Worker } from "@playwright/test";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const pathToExtension = path.resolve(__dirname, "../../dist");

export const test = base.extend<{
  context: BrowserContext;
  extensionId: string;
  serviceWorker: Worker;
}>({
  context: async ({}, use) => {
    // Launch persistent context with the unpacked extension loaded
    const context = await chromium.launchPersistentContext("", {
      headless: false, // MV3 extensions require headed mode or new headless with extension support
      args: [
        `--disable-extensions-except=${pathToExtension}`,
        `--load-extension=${pathToExtension}`,
        "--no-sandbox",
        "--disable-gpu",
      ],
    });
    await use(context);
    await context.close();
  },

  serviceWorker: async ({ context }, use) => {
    // Wait for the extension background service worker to start
    let [serviceWorker] = context.serviceWorkers();
    if (!serviceWorker) {
      serviceWorker = await context.waitForEvent("serviceworker");
    }
    await use(serviceWorker);
  },

  extensionId: async ({ serviceWorker }, use) => {
    const extensionId = serviceWorker.url().split("/")[2];
    await use(extensionId);
  },
});

export { expect } from "@playwright/test";
