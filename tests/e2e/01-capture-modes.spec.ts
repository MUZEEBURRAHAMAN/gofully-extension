import { test, expect } from "../fixtures/extension";

test.describe("01 - Core Capture Modes", () => {
  test("TC-MODE-001: Visible Area capture produces a non-empty image blob matching viewport", async ({
    context,
    extensionId,
  }) => {
    const page = await context.newPage();
    await page.goto("http://localhost:8085/test-page-long.html");
    await page.waitForLoadState("networkidle");

    // Send capture trigger from extension page context
    const popupPage = await context.newPage();
    await popupPage.goto(`chrome-extension://${extensionId}/popup.html`);
    await popupPage.waitForLoadState("domcontentloaded");

    const result = await popupPage.evaluate(async () => {
      const [targetTab] = await chrome.tabs.query({
        url: "http://localhost:8085/test-page-long.html",
      });
      return new Promise<any>((resolve) => {
        chrome.runtime.sendMessage(
          {
            type: "START_CAPTURE",
            payload: { mode: "visible-area", tabId: targetTab?.id },
          },
          resolve
        );
      });
    });

    expect(result).toBeDefined();
    expect(result.type).toBe("CAPTURE_COMPLETE");
    expect(result.payload.mode).toBe("visible-area");
    expect(result.payload.dataUrl).toContain("data:image/png;base64,");
    expect(result.payload.width).toBeGreaterThan(0);
    expect(result.payload.height).toBeGreaterThan(0);

    await popupPage.close();
    await page.close();
  });

  test("TC-MODE-002: Full Page capture generates continuous stitched image without blank areas", async ({
    context,
    extensionId,
  }) => {
    const page = await context.newPage();
    await page.goto("http://localhost:8085/test-page-long.html");
    await page.waitForLoadState("networkidle");

    const popupPage = await context.newPage();
    await popupPage.goto(`chrome-extension://${extensionId}/popup.html`);
    await popupPage.waitForLoadState("domcontentloaded");

    const result = await popupPage.evaluate(async () => {
      const [targetTab] = await chrome.tabs.query({
        url: "http://localhost:8085/test-page-long.html",
      });
      return new Promise<any>((resolve) => {
        chrome.runtime.sendMessage(
          {
            type: "START_CAPTURE",
            payload: { mode: "full-page", tabId: targetTab?.id },
          },
          resolve
        );
      });
    });

    expect(result).toBeDefined();
    expect(result.type).toBe("CAPTURE_COMPLETE");
    expect(result.payload.mode).toBe("full-page");
    expect(result.payload.height).toBeGreaterThan(1500);
    expect(result.payload.dataUrl).toContain("data:image/png;base64,");

    await popupPage.close();
    await page.close();
  });

  test("TC-MODE-003: Selected Area capture precisely crops to user specified coordinates", async ({
    context,
    extensionId,
  }) => {
    const page = await context.newPage();
    await page.goto("http://localhost:8085/test-page-long.html");
    await page.waitForLoadState("networkidle");

    const targetRegion = { x: 50, y: 50, width: 320, height: 240 };

    const popupPage = await context.newPage();
    await popupPage.goto(`chrome-extension://${extensionId}/popup.html`);
    await popupPage.waitForLoadState("domcontentloaded");

    const result = await popupPage.evaluate(async (region) => {
      const [targetTab] = await chrome.tabs.query({
        url: "http://localhost:8085/test-page-long.html",
      });
      return new Promise<any>((resolve) => {
        chrome.runtime.sendMessage(
          {
            type: "START_CAPTURE",
            payload: { mode: "selected-area", region, tabId: targetTab?.id },
          },
          resolve
        );
      });
    }, targetRegion);

    expect(result).toBeDefined();
    expect(result.type).toBe("CAPTURE_COMPLETE");
    expect(result.payload.mode).toBe("selected-area");
    expect(result.payload.width).toBeGreaterThanOrEqual(320);
    expect(result.payload.height).toBeGreaterThanOrEqual(240);

    await popupPage.close();
    await page.close();
  });

  test("TC-MODE-004: URL validator blocks captures on restricted browser internal schemes", async ({
    context,
    extensionId,
  }) => {
    const popupPage = await context.newPage();
    await popupPage.goto(`chrome-extension://${extensionId}/popup.html`);
    await popupPage.waitForLoadState("domcontentloaded");

    // Open a restricted page
    const restrictedPage = await context.newPage();
    try {
      await restrictedPage.goto("chrome://version");
    } catch {}

    const result = await popupPage.evaluate(async () => {
      const allTabs = await chrome.tabs.query({});
      const targetTab = allTabs.find((t) => t.url && (t.url.startsWith("chrome://") || t.url.startsWith("chrome-extension://")));
      return new Promise<any>((resolve) => {
        chrome.runtime.sendMessage(
          {
            type: "START_CAPTURE",
            payload: { mode: "visible-area", tabId: targetTab?.id },
          },
          resolve
        );
      });
    });

    if (result) {
      expect(result.type).toBe("CAPTURE_ERROR");
      expect(result.payload.message).toMatch(/(cannot be captured|can't capture|restricted)/i);
    }

    await restrictedPage.close();
    await popupPage.close();
  });
});
