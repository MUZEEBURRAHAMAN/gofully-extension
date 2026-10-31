import { test, expect } from "../fixtures/extension";
import { matchViewportToWindow } from "../fixtures/viewport";
import { measureProbes, wrongProbes } from "../fixtures/probes";

// Landing-page mode: for pages animated by scripts (scroll-scrubbed reveals, pinned sections), which cannot be
// frozen from outside. The capture takes a photo every half screen and keeps only the middle of each, so every
// row of the image was photographed while it sat well inside the screen.
const PLAIN = "http://localhost:8085/test-page-scripted-scroll.html";
const MARKED = `${PLAIN}?marker=1`; // adds the .pin-spacer element ScrollTrigger creates

async function setup(context: any, extensionId: string, url: string, fullPageMode: string) {
  const page = await context.newPage();
  await page.goto(url);
  await page.waitForLoadState("networkidle");
  await page.bringToFront();
  const popup = await context.newPage();
  await popup.goto(`chrome-extension://${extensionId}/popup.html`);
  await popup.waitForLoadState("domcontentloaded");
  await popup.evaluate((mode: string) => chrome.storage.sync.set({ settings: { fullPageMode: mode } }), fullPageMode);
  await matchViewportToWindow(page, popup, url);
  const { probes, viewportWidth } = await measureProbes(page);
  return { page, popup, probes, viewportWidth };
}

async function capture(popup: any, url: string) {
  return popup.evaluate(async (u: string) => {
    const [tab] = await chrome.tabs.query({ url: u });
    return new Promise<any>((resolve) => chrome.runtime.sendMessage({ type: "START_CAPTURE", payload: { mode: "full-page", tabId: tab?.id } }, resolve));
  }, url);
}

test.describe("25 - Landing-page capture mode", () => {
  test("TC-LM-001: standard mode catches script-animated cards half-finished (why the mode exists)", async ({ context, extensionId }) => {
    const { popup, probes, viewportWidth } = await setup(context, extensionId, PLAIN, "standard");
    const result = await capture(popup, PLAIN);
    expect(result?.type).toBe("CAPTURE_COMPLETE");
    expect(result.payload.stitch.mode).toBe("standard");
    // If this ever passes, the fixture no longer reproduces the problem and the other tests prove nothing.
    const wrong = await wrongProbes(popup, result.payload.dataUrl, probes, viewportWidth);
    expect(wrong.length, "the fixture should break standard mode").toBeGreaterThan(3);
  });

  test("TC-LM-002: landing mode shows every card in full colour, in the right place", async ({ context, extensionId }) => {
    const { popup, probes, viewportWidth } = await setup(context, extensionId, PLAIN, "landing");
    const result = await capture(popup, PLAIN);
    expect(result?.type).toBe("CAPTURE_COMPLETE");
    expect(result.payload.stitch.mode).toBe("landing");
    const wrong = await wrongProbes(popup, result.payload.dataUrl, probes, viewportWidth);
    expect(wrong, wrong.join("\n")).toEqual([]);
  });

  test("TC-LM-003: auto picks landing mode for a page with ScrollTrigger markers, standard for a plain page", async ({ context, extensionId }) => {
    const marked = await setup(context, extensionId, MARKED, "auto");
    const a = await capture(marked.popup, MARKED);
    expect(a.payload.stitch.mode).toBe("landing");
    expect(a.payload.stitch.reasons.join(" ")).toMatch(/ScrollTrigger/i);
    const wrong = await wrongProbes(marked.popup, a.payload.dataUrl, marked.probes, marked.viewportWidth);
    expect(wrong, wrong.join("\n")).toEqual([]);

    const plain = await setup(context, extensionId, "http://localhost:8085/test-page-long.html", "auto");
    const b = await capture(plain.popup, "http://localhost:8085/test-page-long.html");
    expect(b.payload.stitch.mode).toBe("standard");
  });

  test("TC-LM-004: the page is left as it was: same scroll position, animation still running", async ({ context, extensionId }) => {
    const { page, popup } = await setup(context, extensionId, PLAIN, "landing");
    await page.evaluate(() => window.scrollTo(0, 400));
    await page.waitForTimeout(200);
    await capture(popup, PLAIN);
    expect(await page.evaluate(() => Math.round(window.scrollY))).toBe(400);
    // Scroll to the 8th card; the script should ease it in again.
    await page.evaluate(() => (document.querySelectorAll(".card")[7] as HTMLElement).scrollIntoView({ block: "center" }));
    await page.waitForFunction(() => parseFloat((document.querySelectorAll(".card")[7] as HTMLElement).style.opacity) > 0.98, null, { timeout: 5000 });
    // And fade the first one out again once it is far above the screen.
    await page.waitForFunction(() => parseFloat((document.querySelectorAll(".card")[0] as HTMLElement).style.opacity) < 0.05, null, { timeout: 5000 });
  });

  test("TC-LM-005: capturing the same page twice does not stack up helpers or lose the scroll position", async ({ context, extensionId }) => {
    const LONG = "http://localhost:8085/test-page-long.html";
    const { page, popup } = await setup(context, extensionId, LONG, "standard");
    await page.evaluate(() => window.scrollTo(0, 300));
    await page.waitForTimeout(200);
    await capture(popup, LONG);
    expect(await page.evaluate(() => Math.round(window.scrollY)), "after the first capture").toBe(300);
    await capture(popup, LONG);
    expect(await page.evaluate(() => Math.round(window.scrollY)), "after the second capture").toBe(300);
  });

  test("TC-LM-006: the Full-page method setting defaults to Automatic and is remembered", async ({ context, extensionId, serviceWorker }) => {
    const settings = await context.newPage();
    await settings.goto(`chrome-extension://${extensionId}/settings.html`);
    await settings.waitForLoadState("domcontentloaded");
    const select = settings.locator("#fullPageMode");
    await expect(select).toBeVisible();
    await expect(select).toHaveValue("auto");
    await expect(select.locator("option")).toHaveText(["Automatic", "Standard", "Landing page"]);

    await select.selectOption("landing");
    await settings.waitForTimeout(500);
    const stored = await serviceWorker.evaluate(async () => (await chrome.storage.sync.get("settings")).settings?.fullPageMode);
    expect(stored).toBe("landing");

    await settings.reload();
    await expect(settings.locator("#fullPageMode")).toHaveValue("landing");
  });
});
