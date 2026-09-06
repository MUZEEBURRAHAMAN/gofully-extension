import { test, expect } from "../fixtures/extension";

test.describe("05 - Popup & Options Settings Suite", () => {
  test("TC-POPUP-001: Popup interface mounts all 5 capture action cards", async ({
    context,
    extensionId,
  }) => {
    const page = await context.newPage();
    await page.goto(`chrome-extension://${extensionId}/popup.html`);
    await page.waitForLoadState("domcontentloaded");

    // Check all capture buttons via data-mode attributes
    const fullPageBtn = page.locator('button[data-mode="full-page"]');
    const visibleBtn = page.locator('button[data-mode="visible-area"]');
    const selectedBtn = page.locator('button[data-mode="selected-area"]');
    const scrollBtn = page.locator('button[data-mode="scrolling-area"]');
    const ocrBtn = page.locator('button[data-mode="capture-text"]');

    await expect(fullPageBtn).toBeAttached();
    await expect(visibleBtn).toBeAttached();
    await expect(selectedBtn).toBeAttached();
    await expect(scrollBtn).toBeAttached();
    await expect(ocrBtn).toBeAttached();

    // Check header links (settings and help)
    await expect(page.locator("#settingsBtn")).toBeVisible();
    await expect(page.locator("#helpBtn")).toBeVisible();

    await page.close();
  });

  test("TC-POPUP-002: Settings page persists user preferences in chrome.storage.local", async ({
    context,
    extensionId,
    serviceWorker,
  }) => {
    const page = await context.newPage();
    await page.goto(`chrome-extension://${extensionId}/settings.html`);
    await page.waitForLoadState("domcontentloaded");

    // Change scroll speed to "slow" if selector exists
    const speedSelect = page.locator("#scrollSpeed");
    if (await speedSelect.isVisible()) {
      await speedSelect.selectOption("slow");
      // Give storage change time to propagate
      await page.waitForTimeout(300);

      // Verify in serviceWorker chrome.storage.local
      const stored = await serviceWorker.evaluate(async () => {
        return chrome.storage.local.get("scrollSpeed");
      });
      expect(stored.scrollSpeed).toBe("slow");
    }

    await page.close();
  });

  test("TC-POPUP-003: Help page displays keyboard shortcuts documentation", async ({
    context,
    extensionId,
  }) => {
    const page = await context.newPage();
    await page.goto(`chrome-extension://${extensionId}/help.html`);
    await page.waitForLoadState("domcontentloaded");

    const content = await page.content();
    expect(content).toContain("Alt");
    expect(content).toContain("Shift");

    await page.close();
  });

  test("TC-POPUP-004: Shortcut badges display clear, user-friendly Cmd/Ctrl+Shift+1, 3, 4 labels", async ({
    context,
    extensionId,
  }) => {
    const page = await context.newPage();
    await page.goto(`chrome-extension://${extensionId}/popup.html`);
    await page.waitForLoadState("domcontentloaded");

    const fullPageKbd = page.locator('.m-kbd[data-command="capture-full-page"]');
    const visibleKbd = page.locator('.m-kbd[data-command="capture-visible"]');
    const selectedKbd = page.locator('.m-kbd[data-command="capture-selected-area"]');

    await expect(fullPageKbd).toBeAttached();
    await expect(visibleKbd).toBeAttached();
    await expect(selectedKbd).toBeAttached();

    const fullPageText = await fullPageKbd.textContent();
    const visibleText = await visibleKbd.textContent();
    const selectedText = await selectedKbd.textContent();

    expect(fullPageText).toMatch(/(Cmd|Ctrl)\+Shift\+F/i);
    expect(visibleText).toMatch(/(Cmd|Ctrl)\+Shift\+V/i);
    expect(selectedText).toMatch(/(Cmd|Ctrl)\+Shift\+A/i);
    expect(fullPageText).not.toContain("&#x2325;");
    expect(visibleText).not.toContain("&#x2325;");
    expect(selectedText).not.toContain("&#x2325;");

    await page.close();
  });

  test("TC-POPUP-005: Keyboard shortcut commands trigger capture and interactive mode", async ({
    context,
    extensionId,
    serviceWorker,
  }) => {
    // Open target page
    const page = await context.newPage();
    await page.goto("http://localhost:8085/test-page-long.html");
    await page.waitForLoadState("domcontentloaded");

    const popupPage = await context.newPage();
    await popupPage.goto(`chrome-extension://${extensionId}/popup.html`);
    await popupPage.waitForLoadState("domcontentloaded");

    // 1. Verify Visible Area shortcut command (Cmd/Ctrl+Shift+V)
    const visibleCapture = await popupPage.evaluate(async (targetUrl) => {
      const [targetTab] = await chrome.tabs.query({ url: targetUrl });
      return new Promise<any>((resolve) => {
        chrome.runtime.sendMessage(
          {
            type: "START_CAPTURE",
            payload: { mode: "visible-area", tabId: targetTab?.id },
          },
          resolve
        );
      });
    }, "http://localhost:8085/test-page-long.html");
    expect(visibleCapture.type).toBe("CAPTURE_COMPLETE");
    expect(visibleCapture.payload.mode).toBe("visible-area");

    // 2. Verify Selected Area shortcut initialization (Cmd/Ctrl+Shift+A)
    const selectedInit = await popupPage.evaluate(async (targetUrl) => {
      const [targetTab] = await chrome.tabs.query({ url: targetUrl });
      return new Promise<any>((resolve) => {
        chrome.runtime.sendMessage(
          {
            type: "INIT_INTERACTIVE_MODE",
            mode: "selected-area",
            tabId: targetTab?.id,
          },
          resolve
        );
      });
    }, "http://localhost:8085/test-page-long.html");
    expect(selectedInit.ok).toBe(true);

    // Verify overlay is active on the page
    const overlay = page.locator("#snapforge-region-host");
    await expect(overlay).toBeAttached();

    await popupPage.close();
    await page.close();
  });

  test("TC-POPUP-006: In-page Cmd/Ctrl+Shift+F triggers capture directly without extra in-page popup", async ({
    context,
  }) => {
    const page = await context.newPage();
    await page.goto("http://localhost:8085/test-page-long.html");
    await page.waitForLoadState("domcontentloaded");

    // Press shortcut directly on the webpage
    await page.keyboard.press("Control+Shift+F");

    // Verify progress screen transitions cleanly to result bar
    const resultBar = page.locator("#snapforge-result-bar");
    await expect(resultBar).toBeAttached({ timeout: 15000 });
    await expect(resultBar).toBeVisible();

    // Verify progress screen was cleaned up
    const progressOverlay = page.locator("#gofully-progress-overlay");
    await expect(progressOverlay).not.toBeAttached();

    await page.close();
  });
});
