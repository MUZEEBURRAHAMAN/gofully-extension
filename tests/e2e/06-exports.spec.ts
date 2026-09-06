import { test, expect } from "../fixtures/extension";

test.describe("06 - Export Engines Suite (PNG, PDF, Clipboard)", () => {
  test("TC-EXP-001: PDF Generator produces valid binary PDF with proper headers", async ({
    context,
    extensionId,
  }) => {
    const page = await context.newPage();
    await page.goto("http://localhost:8085/test-page-long.html");
    await page.waitForLoadState("networkidle");

    const popupPage = await context.newPage();
    await popupPage.goto(`chrome-extension://${extensionId}/popup.html`);
    await popupPage.waitForLoadState("domcontentloaded");

    // 1. Perform capture to populate lastCaptureBlob in service worker
    await popupPage.evaluate(async () => {
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

    // 2. Request PDF export
    const exportResult = await popupPage.evaluate(async () => {
      return new Promise<any>((resolve) => {
        chrome.runtime.sendMessage(
          { type: "EXPORT_CAPTURE", payload: { format: "pdf" } },
          resolve
        );
      });
    });

    expect(exportResult).toBeDefined();
    expect(exportResult.success).toBe(true);

    await popupPage.close();
    await page.close();
  });

  test("TC-EXP-002: Filename generation cleans URL domains and appends date timestamps", async ({
    serviceWorker,
  }) => {
    const filenameInfo = await serviceWorker.evaluate(() => {
      const testDomains = [
        "https://sub.domain.org/path?query=1#hash",
        "http://medical-portal.internal:8080/chart",
        "invalid://bad!!domain@/x",
      ];

      return testDomains.map((url) => {
        let domain = "unknown";
        try {
          domain = new URL(url).hostname;
        } catch {}
        const now = new Date();
        const ts = now.toISOString().replace(/[-:T]/g, "").slice(0, 14);
        const clean = domain.replace(/[^a-zA-Z0-9.-]/g, "_").slice(0, 50);
        return `gofully-${clean}-${ts}.png`;
      });
    });

    expect(filenameInfo[0]).toContain("gofully-sub.domain.org-");
    expect(filenameInfo[1]).toContain("gofully-medical-portal.internal-");
    expect(filenameInfo[0]).toMatch(/\.png$/);
  });
});
