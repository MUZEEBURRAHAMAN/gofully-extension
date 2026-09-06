import { test, expect } from "../fixtures/extension";

test.describe("Security Suite - SOC 2 Type II Confidentiality & Privacy", () => {
  test("SEC-SOC2-001: Zero remote network exfiltration during capture lifecycle", async ({
    context,
    extensionId,
  }) => {
    const page = await context.newPage();

    // Track all network requests made across the entire browser context
    const externalRequests: string[] = [];
    context.on("request", (req) => {
      const url = req.url();
      // Ignore local test fixture server requests and extension internal resource loads
      if (!url.startsWith("http://localhost:8085") && !url.startsWith("chrome-extension://")) {
        externalRequests.push(url);
      }
    });

    await page.goto("http://localhost:8085/test-page-ocr.html");
    await page.waitForLoadState("networkidle");

    const popupPage = await context.newPage();
    await popupPage.goto(`chrome-extension://${extensionId}/popup.html`);
    await popupPage.waitForLoadState("domcontentloaded");

    // Perform a full capture
    const captureResult = await popupPage.evaluate(async () => {
      const [targetTab] = await chrome.tabs.query({
        url: "http://localhost:8085/test-page-ocr.html",
      });
      return new Promise<any>((resolve) => {
        chrome.runtime.sendMessage(
          { type: "START_CAPTURE", payload: { mode: "visible-area", tabId: targetTab?.id } },
          resolve
        );
      });
    });

    expect(captureResult.type).toBe("CAPTURE_COMPLETE");

    // SOC 2 Confidentiality mandate: 0 external requests during capture processing
    const leakingRequests = externalRequests.filter(
      (url) => !url.includes("fonts.googleapis.com") && !url.includes("fonts.gstatic.com")
    );
    expect(leakingRequests).toHaveLength(0);

    await popupPage.close();
    await page.close();
  });

  test("SEC-SOC2-002: Local-only OCR engine execution with zero external CDN calls", async ({
    context,
    extensionId,
  }) => {
    const popupPage = await context.newPage();

    const cdnRequests: string[] = [];
    context.on("request", (req) => {
      const url = req.url();
      if (url.includes("unpkg.com") || url.includes("jsdelivr.net") || url.includes("tesseract")) {
        cdnRequests.push(url);
      }
    });

    await popupPage.goto(`chrome-extension://${extensionId}/popup.html`);
    await popupPage.waitForLoadState("domcontentloaded");

    // Execute OCR test via popupPage
    await popupPage.evaluate(async () => {
      const existing = await (chrome.runtime as any).getContexts({
        contextTypes: ["OFFSCREEN_DOCUMENT"],
      });
      if (existing.length === 0) {
        await chrome.offscreen.createDocument({
          url: "offscreen.html",
          reasons: [chrome.offscreen.Reason.BLOBS, chrome.offscreen.Reason.DOM_SCRAPING],
          justification: "Process offscreen canvas and OCR operations",
        });
      }

      const c = new OffscreenCanvas(200, 50);
      const ctx = c.getContext("2d")!;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, 200, 50);
      ctx.fillStyle = "#000000";
      ctx.font = "16px sans-serif";
      ctx.fillText("SOC2 AUDIT", 10, 30);
      const blob = await c.convertToBlob();
      const reader = new FileReader();
      const dataUrl = await new Promise<string>((res) => {
        reader.onload = () => res(reader.result as string);
        reader.readAsDataURL(blob);
      });

      return new Promise<any>((resolve) => {
        chrome.runtime.sendMessage(
          { type: "PERFORM_OCR", payload: { dataUrl } },
          resolve
        );
      });
    });

    // Verify 0 CDN requests were made to load OCR code or language dictionaries
    expect(cdnRequests).toHaveLength(0);

    await popupPage.close();
  });

  test("SEC-SOC2-003: No third-party tracking or analytics libraries embedded in extension HTML", async ({
    context,
    extensionId,
  }) => {
    const pages = ["popup.html", "editor.html", "settings.html", "help.html", "offscreen.html"];

    for (const pageName of pages) {
      const page = await context.newPage();
      await page.goto(`chrome-extension://${extensionId}/${pageName}`);
      await page.waitForLoadState("domcontentloaded");

      const scripts = await page.evaluate(() => {
        return Array.from(document.querySelectorAll("script")).map((s) => s.src);
      });

      for (const src of scripts) {
        expect(src).not.toMatch(/google-analytics|googletagmanager|segment|mixpanel|hotjar/i);
      }

      await page.close();
    }
  });
});
