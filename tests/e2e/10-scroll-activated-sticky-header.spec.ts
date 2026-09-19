import { test, expect } from "../fixtures/extension";

// Reproduces the bug report: on some real sites the header only becomes
// position:fixed after the page has scrolled past a threshold (the common
// "sticky navbar on scroll" pattern from WordPress/Shopify/Squarespace/
// Bootstrap themes). It is position:static at scrollY=0. If the sticky-hide
// mechanism only inspects computed styles once, before any scrolling has
// happened, it never observes the header as fixed and so never hides it —
// the header then gets baked into every subsequent scroll-stitch frame.
test.describe("09 - Scroll-Activated Sticky Header De-duplication", () => {
  test("TC-SCROLLSTICKY-001: Full-page capture does not duplicate a header that only becomes fixed after scrolling", async ({
    context,
    extensionId,
  }) => {
    const page = await context.newPage();
    await page.goto("http://localhost:8085/test-page-scroll-activated-header.html");
    await page.waitForLoadState("networkidle");
    await page.bringToFront();

    const popupPage = await context.newPage();
    await popupPage.goto(`chrome-extension://${extensionId}/popup.html`);
    await popupPage.waitForLoadState("domcontentloaded");

    const result = await popupPage.evaluate(async () => {
      const [targetTab] = await chrome.tabs.query({
        url: "http://localhost:8085/test-page-scroll-activated-header.html",
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
    expect(result.payload.dataUrl).toContain("data:image/png;base64,");
    expect(result.payload.height).toBeGreaterThan(800);

    // Pixel-level header duplication check, same technique as
    // 08-sticky-header-fix.spec.ts: the header is dark (#1e293b) and content
    // sections are light. If the header repeats, dark pixels appear at
    // viewport-height intervals down the stitched image.
    const pixelCheck = await popupPage.evaluate(async (dataUrl: string) => {
      const img = new Image();
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = reject;
        img.src = dataUrl;
      });

      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0);

      const vpHeight = window.innerHeight || 600;
      const samples: { y: number; r: number; g: number; b: number; isDark: boolean }[] = [];

      for (let mult = 1; mult <= 3; mult++) {
        const sampleY = Math.min(Math.round(vpHeight * mult + 26), img.height - 1);
        const x = Math.round(img.width / 2);
        const pixel = ctx.getImageData(x, sampleY, 1, 1).data;
        samples.push({
          y: sampleY,
          r: pixel[0],
          g: pixel[1],
          b: pixel[2],
          isDark: pixel[0] < 80 && pixel[1] < 80 && pixel[2] < 80,
        });
      }

      return { imageHeight: img.height, imageWidth: img.width, samples };
    }, result.payload.dataUrl);

    for (const sample of pixelCheck.samples) {
      expect(
        sample.isDark,
        `Scroll-activated header repeats at y=${sample.y} (rgb(${sample.r},${sample.g},${sample.b}))`
      ).toBe(false);
    }

    // Page's own scroll-driven "is-stuck" class must be back to its
    // natural scrollY=0 state after capture (scroll position restored).
    const restored = await page.evaluate(() => {
      const header = document.querySelector('[data-testid="scroll-header"]') as HTMLElement;
      return {
        isStuck: header?.classList.contains("is-stuck") ?? null,
        opacity: header ? getComputedStyle(header).opacity : "missing",
      };
    });
    expect(restored.isStuck).toBe(false);
    expect(restored.opacity).toBe("1");

    await popupPage.close();
    await page.close();
  });
});
