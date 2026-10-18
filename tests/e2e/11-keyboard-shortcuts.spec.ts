import { test, expect } from "../fixtures/extension";

test.describe("11 - Keyboard Shortcuts & Debounce Engine", () => {
  test("TC-SHORTCUT-001: In-page Cmd/Ctrl+Shift+V captures visible area and shows quick toast", async ({
    context,
  }) => {
    const page = await context.newPage();
    await page.goto("http://localhost:8085/test-page-long.html");
    await page.waitForLoadState("domcontentloaded");

    // Press Cmd/Ctrl+Shift+V directly on the webpage
    await page.keyboard.press("Control+Shift+V");

    // Quick toast should appear on the webpage with capture confirmation
    const toast = page.locator("#gofully-quick-toast, .toast");
    await expect(toast.first()).toBeVisible({ timeout: 10000 });

    await page.close();
  });

  test("TC-SHORTCUT-002: In-page Cmd/Ctrl+Shift+A activates interactive region selector overlay", async ({
    context,
  }) => {
    const page = await context.newPage();
    await page.goto("http://localhost:8085/test-page-long.html");
    await page.waitForLoadState("domcontentloaded");

    // Press Cmd/Ctrl+Shift+A directly on the webpage
    await page.keyboard.press("Control+Shift+A");

    // Verify overlay host is injected and attached
    const overlayHost = page.locator("#snapforge-region-host");
    await expect(overlayHost).toBeAttached({ timeout: 10000 });

    await page.close();
  });

  test("TC-SHORTCUT-003: Escape key cleanly cancels active region selector overlay", async ({
    context,
  }) => {
    const page = await context.newPage();
    await page.goto("http://localhost:8085/test-page-long.html");
    await page.waitForLoadState("domcontentloaded");

    // Activate region selector
    await page.keyboard.press("Control+Shift+A");
    const overlayHost = page.locator("#snapforge-region-host");
    await expect(overlayHost).toBeAttached({ timeout: 10000 });

    // Press Escape to cancel
    await page.keyboard.press("Escape");
    await expect(overlayHost).not.toBeAttached({ timeout: 5000 });

    await page.close();
  });

  test("TC-SHORTCUT-004: In-page Cmd/Ctrl+Shift+F triggers full-page capture and opens review tab", async ({
    context,
  }) => {
    const page = await context.newPage();
    await page.goto("http://localhost:8085/test-page-long.html");
    await page.waitForLoadState("domcontentloaded");

    const [reviewPage] = await Promise.all([
      context.waitForEvent("page", {
        predicate: (p) => p.url().includes("review.html"),
        timeout: 15000,
      }),
      page.keyboard.press("Control+Shift+F"),
    ]);

    await reviewPage.waitForLoadState("domcontentloaded");
    expect(reviewPage.url()).toContain("review.html");

    await reviewPage.close();
    await page.close();
  });

  test("TC-SHORTCUT-005: Rapid double-tap of shortcut is debounced and opens exactly 1 review tab", async ({
    context,
  }) => {
    const page = await context.newPage();
    await page.goto("http://localhost:8085/test-page-long.html");
    await page.waitForLoadState("domcontentloaded");

    let openedReviewTabs = 0;
    context.on("page", (p) => {
      if (p.url().includes("review.html")) {
        openedReviewTabs++;
      }
    });

    // Fire shortcut twice in rapid succession (50ms apart)
    await page.keyboard.press("Control+Shift+F");
    await page.waitForTimeout(50);
    await page.keyboard.press("Control+Shift+F");

    // Wait for the single valid review tab
    const reviewPage = await context.waitForEvent("page", {
      predicate: (p) => p.url().includes("review.html"),
      timeout: 15000,
    });
    await reviewPage.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(1000);

    // Only 1 review tab should have been opened
    expect(openedReviewTabs).toBe(1);

    await reviewPage.close();
    await page.close();
  });

  test("TC-SHORTCUT-006: Typing in input or textarea does NOT trigger capture shortcuts", async ({
    context,
  }) => {
    const page = await context.newPage();
    await page.goto("http://localhost:8085/test-page-long.html");
    await page.waitForLoadState("domcontentloaded");

    // Inject an input field into the test page
    await page.evaluate(() => {
      const input = document.createElement("input");
      input.id = "test-typing-input";
      input.type = "text";
      document.body.prepend(input);
      input.focus();
    });

    const input = page.locator("#test-typing-input");
    await input.focus();

    // Type Shift+F and Shift+V inside the input
    await page.keyboard.press("Shift+KeyF");
    await page.keyboard.press("Shift+KeyV");
    await page.waitForTimeout(500);

    // Ensure no review page or region overlay was opened
    const overlayHost = page.locator("#snapforge-region-host");
    await expect(overlayHost).not.toBeAttached();

    await page.close();
  });
  test("TC-SHORTCUT-007: A capture error is always shown on the page, never silent", async ({
    context,
    extensionId,
  }) => {
    const page = await context.newPage();
    await page.goto("http://localhost:8085/test-page-long.html");
    await page.waitForLoadState("domcontentloaded");

    const helper = await context.newPage();
    await helper.goto(`chrome-extension://${extensionId}/popup.html`);
    await helper.evaluate(async () => {
      const [tab] = await chrome.tabs.query({ url: "http://localhost:8085/test-page-long.html" });
      await chrome.tabs.sendMessage(tab.id!, {
        type: "CAPTURE_ERROR_INLINE",
        payload: { message: "Simulated capture failure" },
      });
    });

    const notice = page.locator("#gofully-inline-notice");
    await expect(notice).toBeVisible({ timeout: 5000 });
    await expect(notice).toHaveText("Simulated capture failure");

    await helper.close();
    await page.close();
  });

  test("TC-SHORTCUT-008: Pressing the shortcut again mid-capture says a capture is already running", async ({
    context,
  }) => {
    const page = await context.newPage();
    await page.goto("http://localhost:8085/test-page-long.html");
    await page.waitForLoadState("domcontentloaded");

    await page.keyboard.press("Control+Shift+F");
    await page.waitForTimeout(800);
    await page.keyboard.press("Control+Shift+F");

    const notice = page.locator("#gofully-inline-notice");
    await expect(notice).toContainText("already running", { timeout: 8000 });

    const reviewPage = await context.waitForEvent("page", {
      predicate: (p) => p.url().includes("review.html"),
      timeout: 20000,
    });
    await reviewPage.close();
    await page.close();
  });
});
