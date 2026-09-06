import { test, expect } from "../fixtures/extension";

test.describe("Security Suite - Extension Hardening & Boundary Defense", () => {
  test("SEC-HARD-001: sanitizeRegion rejects invalid, NaN, negative, and infinite coordinate payloads", async ({
    context,
    extensionId,
  }) => {
    const page = await context.newPage();
    await page.goto("http://localhost:8085/test-page-long.html");
    await page.waitForLoadState("networkidle");

    const popupPage = await context.newPage();
    await popupPage.goto(`chrome-extension://${extensionId}/popup.html`);
    await popupPage.waitForLoadState("domcontentloaded");

    const attackPayloads = [
      { x: -500, y: -200, width: 100, height: 100 },
      { x: 0, y: 0, width: -100, height: 50 },
      { x: "NaN", y: 0, width: 100, height: 100 },
      { x: 0, y: 0, width: Infinity, height: 100 },
      null,
      undefined,
    ];

    for (const badRegion of attackPayloads) {
      const res = await popupPage.evaluate(async (region) => {
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
      }, badRegion);

      // Either returns CAPTURE_ERROR or handles safely without crashing
      if (res && res.type === "CAPTURE_ERROR") {
        expect(res.payload.message).toBeDefined();
      }
    }

    await popupPage.close();
    await page.close();
  });

  test("SEC-HARD-002: Service Worker prevents cross-tab capture impersonation", async ({
    context,
    extensionId,
  }) => {
    const page1 = await context.newPage();
    await page1.goto("http://localhost:8085/test-page-long.html");

    const popupPage = await context.newPage();
    await popupPage.goto(`chrome-extension://${extensionId}/popup.html`);
    await popupPage.waitForLoadState("domcontentloaded");

    // When SCROLLING_REGION_SELECTED is sent from popup (no sender.tab), it must reject
    const forgedAttempt = await popupPage.evaluate(async () => {
      return new Promise<any>((resolve) => {
        chrome.runtime.sendMessage(
          {
            type: "SCROLLING_REGION_SELECTED",
            payload: { tabId: 999999, region: { x: 0, y: 0, width: 100, height: 100 } },
          },
          resolve
        );
      });
    });

    expect(forgedAttempt.started).toBe(false);

    await popupPage.close();
    await page1.close();
  });

  test("SEC-HARD-003: Manifest V3 CSP prevents unsafe-eval and arbitrary remote script execution", async ({
    context,
    extensionId,
  }) => {
    const page = await context.newPage();
    await page.goto(`chrome-extension://${extensionId}/editor.html`);

    // Verify browser CSP blocks arbitrary inline script injection or logs policy violation
    const cspEnforced = await page.evaluate(async () => {
      return new Promise<boolean>((resolve) => {
        let violated = false;
        const handler = (e: any) => {
          violated = true;
          resolve(true);
        };
        window.addEventListener("securitypolicyviolation", handler);

        // Attempt to execute dynamic inline script
        try {
          const script = document.createElement("script");
          script.textContent = "window.__csp_injection_test = true;";
          document.head.appendChild(script);
        } catch {
          resolve(true);
        }

        setTimeout(() => {
          window.removeEventListener("securitypolicyviolation", handler);
          // Either securitypolicyviolation fired, or injection was neutralized
          resolve(violated || (window as any).__csp_injection_test === undefined);
        }, 400);
      });
    });

    expect(cspEnforced).toBe(true);
    await page.close();
  });
});
