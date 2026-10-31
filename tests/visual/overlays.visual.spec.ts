import { test, expect } from "../fixtures/extension";
import type { Page, BrowserContext } from "@playwright/test";

// Design QA: drives each injected overlay in the real extension and saves a
// screenshot per state to test-results/visual/, to compare with the Figma frames
// listed in .claude/skills/gofully-ui/references/screens.md.
const shot = (page: Page, name: string) =>
  page.screenshot({ path: `test-results/visual/${name}.png` });

/** Start an interactive mode the way the popup does: the service worker injects the overlay script. */
async function startMode(context: BrowserContext, extensionId: string, url: string, mode: string) {
  const popup = await context.newPage();
  await popup.goto(`chrome-extension://${extensionId}/popup.html`);
  await popup.evaluate(async ({ url, mode }) => {
    const [tab] = await chrome.tabs.query({ url });
    await chrome.runtime.sendMessage({ type: "INIT_INTERACTIVE_MODE", payload: { mode, tabId: tab.id } });
  }, { url, mode });
  await popup.close();
}

test("scroll capture: hint, options panel, manual recording", async ({ context, extensionId }) => {
  const url = "http://localhost:8085/test-page-long.html";
  const page = await context.newPage();
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto(url);
  await page.waitForLoadState("networkidle");

  await page.bringToFront();
  await startMode(context, extensionId, url, "scrolling-area");
  await page.bringToFront();
  await page.waitForTimeout(600);
  await shot(page, "scroll-1-hint");

  await page.mouse.move(200, 180);
  await page.mouse.down();
  await page.mouse.move(820, 740, { steps: 8 });
  await page.mouse.up();
  await page.waitForTimeout(300);
  await shot(page, "scroll-2-options");
  await expect(page.getByText("Scroll capture")).toBeVisible();

  await page.getByRole("button", { name: "Manual" }).click();
  await page.waitForTimeout(1200);
  await shot(page, "scroll-4-recording");
  await page.keyboard.press("Escape");
});

test("selected area: hint and adjust", async ({ context, extensionId }) => {
  const url = "http://localhost:8085/test-page-long.html";
  const page = await context.newPage();
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto(url);
  await page.waitForLoadState("networkidle");
  await startMode(context, extensionId, url, "selected-area");
  await page.bringToFront();
  await page.waitForTimeout(600);
  await shot(page, "region-1-hint");
  await page.mouse.move(240, 120);
  await page.mouse.down();
  await page.mouse.move(860, 420, { steps: 8 });
  await page.mouse.up();
  await page.waitForTimeout(300);
  await shot(page, "region-3-adjust");
  await page.keyboard.press("Escape");
});

async function sendTab(context: BrowserContext, extensionId: string, url: string, message: object) {
  const popup = await context.newPage();
  await popup.goto(`chrome-extension://${extensionId}/popup.html`);
  await popup.evaluate(async ({ url, message }) => {
    const [tab] = await chrome.tabs.query({ url });
    await chrome.tabs.sendMessage(tab.id!, message).catch(() => {});
  }, { url, message });
  await popup.close();
}

test("in-page: progress badge, result card, quick toast", async ({ context, extensionId }) => {
  const url = "http://localhost:8085/test-page-long.html";
  const page = await context.newPage();
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto(url);
  await page.waitForLoadState("networkidle");
  const dataUrl = await page.evaluate(() => {
    const c = document.createElement("canvas"); c.width = 1280; c.height = 720;
    const g = c.getContext("2d")!; g.fillStyle = "#f3f2ef"; g.fillRect(0, 0, 1280, 720);
    g.fillStyle = "#1a1a19"; g.font = "bold 64px sans-serif"; g.fillText("Section 1: Hero", 60, 140);
    return c.toDataURL("image/png");
  });
  await sendTab(context, extensionId, url, { type: "CAPTURE_PROGRESS", payload: { current: 4, total: 9, phase: "capturing" } });
  await page.bringToFront(); await page.waitForTimeout(400);
  await shot(page, "inpage-1-progress");
  await sendTab(context, extensionId, url, { type: "CAPTURE_PROGRESS", payload: { phase: "done" } });
  await sendTab(context, extensionId, url, { type: "SHOW_RESULT_CARD", payload: { dataUrl, width: 1280, height: 720, mode: "selected-area", method: "snapshot" } });
  await page.bringToFront(); await page.waitForTimeout(500);
  await shot(page, "inpage-2-result-card");
  await sendTab(context, extensionId, url, { type: "CAPTURE_NOTICE", payload: { message: "Copied to clipboard" } });
  await page.bringToFront(); await page.waitForTimeout(300);
  await shot(page, "inpage-3-notice");
});

test("capture text: hint and result", async ({ context, extensionId }) => {
  const url = "http://localhost:8085/test-page-long.html";
  const page = await context.newPage();
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto(url);
  await page.waitForLoadState("networkidle");
  await startMode(context, extensionId, url, "capture-text");
  await page.bringToFront();
  await page.waitForTimeout(600);
  await shot(page, "ocr-1-hint");
  await page.mouse.move(30, 110);
  await page.mouse.down();
  await page.mouse.move(860, 220, { steps: 8 });
  await page.mouse.up();
  await page.waitForTimeout(1500);
  await shot(page, "ocr-2-result");
});

test("draw on page: toolbar and marks", async ({ context, extensionId }) => {
  const url = "http://localhost:8085/test-page-long.html";
  const page = await context.newPage();
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto(url);
  await page.waitForLoadState("networkidle");
  await startMode(context, extensionId, url, "annotate-page");
  await page.bringToFront();
  await page.waitForTimeout(700);
  await page.mouse.move(300, 300); await page.mouse.down();
  for (let i = 0; i < 20; i++) await page.mouse.move(300 + i * 12, 300 + Math.sin(i / 3) * 30);
  await page.mouse.up();
  await page.waitForTimeout(300);
  await shot(page, "draw-1-drawing");
});
