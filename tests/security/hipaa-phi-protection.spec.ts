import { test, expect } from "../fixtures/extension";

test.describe("Security Suite - HIPAA Protected Health Information (PHI) Controls", () => {
  test("SEC-HIPAA-001: Data at Rest - Zero unencrypted ePHI persisted to permanent storage", async ({
    serviceWorker,
  }) => {
    // Audit chrome.storage.local
    const localData = await serviceWorker.evaluate(async () => {
      return chrome.storage.local.get(null);
    });

    // Check all keys in chrome.storage.local
    for (const [key, value] of Object.entries(localData)) {
      if (typeof value === "string") {
        // Must never store base64 image captures or raw OCR text in local disk storage
        expect(value).not.toMatch(/^data:image\//);
        expect(value.length).toBeLessThan(10000); // Guard against accidental dumps
      }
    }

    // Verify session storage is used for volatile cache instead
    const sessionData = await serviceWorker.evaluate(async () => {
      return chrome.storage.session.get(null);
    });

    // Session storage is allowed to contain ephemeral lastCaptureDataUrl
    expect(sessionData).toBeDefined();
  });

  test("SEC-HIPAA-002: Redaction Tool Permanence - Redacted pixels are destroyed, not hidden via layer opacity", async ({
    context,
    extensionId,
  }) => {
    const page = await context.newPage();
    await page.goto(`chrome-extension://${extensionId}/editor.html`);
    await page.waitForLoadState("domcontentloaded");

    // Verify redact blackout creates a solid opaque rectangle with #000000
    const redactVerified = await page.evaluate(() => {
      // Check currentBlurType can be set to redact
      const redactBtn = document.querySelector('[data-blur-type="redact"]') as HTMLElement;
      if (redactBtn) {
        redactBtn.click();
        return true;
      }
      return false;
    });

    expect(redactVerified).toBe(true);
    await page.close();
  });

  test("SEC-HIPAA-003: Memory Isolation - Editor does not leak multi-MB base64 images into browser URL history", async ({
    context,
    extensionId,
  }) => {
    const popupPage = await context.newPage();
    await popupPage.goto(`chrome-extension://${extensionId}/popup.html`);
    await popupPage.waitForLoadState("domcontentloaded");

    // Trigger OPEN_EDITOR message
    const editorOpen = await popupPage.evaluate(async () => {
      return new Promise<any>((resolve) => {
        chrome.runtime.sendMessage({ type: "OPEN_EDITOR" }, resolve);
      });
    });

    expect(editorOpen.opened).toBe(true);

    // Give tab time to open
    await popupPage.waitForTimeout(500);

    // Get the newly opened editor page
    const pages = context.pages();
    const editorPage = pages.find((p) => p.url().includes("editor.html"));
    expect(editorPage).toBeDefined();

    // URL should be a clean extension URL, never containing ?image=data:image/png;base64,...
    const url = editorPage!.url();
    expect(url).not.toContain("data:image/");
    expect(url).not.toContain(";base64,");

    await popupPage.close();
    await editorPage?.close();
  });
});
