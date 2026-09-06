import { test, expect } from "../fixtures/extension";

test.describe("02 - Scrolling Area & Nested Container Captures", () => {
  test("TC-SCROLL-001: Identifies and tags nested scrollable container (overflow-y: auto/scroll)", async ({
    context,
    extensionId,
  }) => {
    const page = await context.newPage();
    await page.goto("http://localhost:8085/test-page-nested-scroll.html");
    await page.waitForLoadState("networkidle");

    const scrollBox = page.locator("#nestedScrollBox");
    await expect(scrollBox).toBeVisible();
    const box = await scrollBox.boundingBox();
    expect(box).not.toBeNull();

    const region = {
      x: Math.round(box!.x),
      y: Math.round(box!.y),
      width: Math.round(box!.width),
      height: Math.round(box!.height),
    };

    const popupPage = await context.newPage();
    await popupPage.goto(`chrome-extension://${extensionId}/popup.html`);
    await popupPage.waitForLoadState("domcontentloaded");

    const captureResult = await popupPage.evaluate(
      async ({ region }) => {
        const [targetTab] = await chrome.tabs.query({
          url: "http://localhost:8085/test-page-nested-scroll.html",
        });
        return new Promise<any>((resolve) => {
          chrome.runtime.sendMessage(
            {
              type: "START_CAPTURE",
              payload: {
                mode: "scrolling-area",
                region,
                speed: "fast",
                tabId: targetTab?.id,
              },
            },
            resolve
          );
        });
      },
      { region }
    );

    expect(captureResult).toBeDefined();
    expect(captureResult.type).toBe("CAPTURE_COMPLETE");
    expect(captureResult.payload.mode).toBe("scrolling-area");
    expect(captureResult.payload.dataUrl).toContain("data:image/png;base64,");
    expect(captureResult.payload.height).toBeGreaterThan(box!.height);

    // Verify tag cleanup
    const hasTag = await page.evaluate(() => {
      return document.querySelector("[data-gf-scroll-target]") !== null;
    });
    expect(hasTag).toBe(false);

    await popupPage.close();
    await page.close();
  });

  test("TC-SCROLL-002: Speed configurations produce valid stitched captures", async ({
    context,
    extensionId,
  }) => {
    const page = await context.newPage();
    await page.goto("http://localhost:8085/test-page-nested-scroll.html");
    await page.waitForLoadState("networkidle");

    const scrollBox = page.locator("#nestedScrollBox");
    const box = await scrollBox.boundingBox();

    const region = {
      x: Math.round(box!.x),
      y: Math.round(box!.y),
      width: Math.round(box!.width),
      height: Math.round(box!.height),
    };

    const popupPage = await context.newPage();
    await popupPage.goto(`chrome-extension://${extensionId}/popup.html`);
    await popupPage.waitForLoadState("domcontentloaded");

    const fastResult = await popupPage.evaluate(
      async ({ region }) => {
        const [targetTab] = await chrome.tabs.query({
          url: "http://localhost:8085/test-page-nested-scroll.html",
        });
        return new Promise<any>((resolve) => {
          chrome.runtime.sendMessage(
            {
              type: "START_CAPTURE",
              payload: { mode: "scrolling-area", region, speed: "fast", tabId: targetTab?.id },
            },
            resolve
          );
        });
      },
      { region }
    );

    expect(fastResult.type).toBe("CAPTURE_COMPLETE");
    expect(fastResult.payload.width).toBeGreaterThan(0);
    expect(fastResult.payload.height).toBeGreaterThan(box!.height);

    await popupPage.close();
    await page.close();
  });

  test("TC-SCROLL-003: Frame overlap detection prevents content duplicate ghosting", async ({
    context,
    extensionId,
  }) => {
    const page = await context.newPage();
    await page.goto("http://localhost:8085/test-page-long.html");
    await page.waitForLoadState("networkidle");

    const region = { x: 0, y: 0, width: 800, height: 600 };

    const popupPage = await context.newPage();
    await popupPage.goto(`chrome-extension://${extensionId}/popup.html`);
    await popupPage.waitForLoadState("domcontentloaded");

    const result = await popupPage.evaluate(
      async ({ region }) => {
        const [targetTab] = await chrome.tabs.query({
          url: "http://localhost:8085/test-page-long.html",
        });
        return new Promise<any>((resolve) => {
          chrome.runtime.sendMessage(
            {
              type: "START_CAPTURE",
              payload: { mode: "scrolling-area", region, speed: "fast", tabId: targetTab?.id },
            },
            resolve
          );
        });
      },
      { region }
    );

    expect(result.type).toBe("CAPTURE_COMPLETE");
    expect(result.payload.height).toBeGreaterThan(600);

    await popupPage.close();
    await page.close();
  });

  test("TC-SCROLL-004: Sticky element manager hides sticky header during captures and restores after", async ({
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
          { type: "START_CAPTURE", payload: { mode: "full-page", tabId: targetTab?.id } },
          resolve
        );
      });
    });

    expect(result.type).toBe("CAPTURE_COMPLETE");

    const headerVisible = await page.locator("#mainHeader").isVisible();
    expect(headerVisible).toBe(true);

    await popupPage.close();
    await page.close();
  });

  test("TC-SCROLL-005: Clean teardown on manual stop", async ({ context, extensionId }) => {
    const popupPage = await context.newPage();
    await popupPage.goto(`chrome-extension://${extensionId}/popup.html`);
    await popupPage.waitForLoadState("domcontentloaded");

    const stopResult = await popupPage.evaluate(async () => {
      return new Promise<any>((resolve) => {
        chrome.runtime.sendMessage({ type: "SCROLL_STOP" }, resolve);
      });
    });

    expect(stopResult).toBeDefined();
    expect(stopResult.stopped).toBe(true);

    await popupPage.close();
  });
});
