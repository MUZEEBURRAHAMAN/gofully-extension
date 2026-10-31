import { test, expect } from "../fixtures/extension";
import { matchViewportToWindow } from "../fixtures/viewport";
import { measureProbes, wrongProbes } from "../fixtures/probes";

// Modern landing pages animate on scroll. A full-page capture scrolls tile by tile, so anything that
// depends on scroll position or on a slow transition used to be caught half-faded, and pinned
// (position: sticky) blocks were replaced by an empty hole. The fixture draws every block in a solid
// colour, so the stitched image can be checked pixel by pixel.
const URL = "http://localhost:8085/test-page-landing-effects.html";

test.describe("24 - Full-page capture of landing pages with scroll effects", () => {
  test("TC-FX-001: scroll-driven, fade-in, pinned and fade-out blocks all appear in full colour", async ({ context, extensionId }) => {
    const page = await context.newPage();
    await page.goto(URL);
    await page.waitForLoadState("networkidle");
    await page.bringToFront();

    const popup = await context.newPage();
    await popup.goto(`chrome-extension://${extensionId}/popup.html`);
    await popup.waitForLoadState("domcontentloaded");
    await matchViewportToWindow(page, popup, URL);

    const { probes, viewportWidth } = await measureProbes(page);
    expect(probes.length).toBe(29 * 3);

    const result = await popup.evaluate(async (url: string) => {
      const [tab] = await chrome.tabs.query({ url });
      return new Promise<any>((resolve) => {
        chrome.runtime.sendMessage({ type: "START_CAPTURE", payload: { mode: "full-page", tabId: tab?.id } }, resolve);
      });
    }, URL);
    expect(result?.type).toBe("CAPTURE_COMPLETE");

    const wrong = await wrongProbes(popup, result.payload.dataUrl as string, probes, viewportWidth);

    expect(wrong, wrong.join("\n")).toEqual([]);
  });

  test("TC-FX-002: the page's own animations come back after the capture", async ({ context, extensionId }) => {
    const page = await context.newPage();
    await page.goto(URL);
    await page.waitForLoadState("networkidle");
    await page.bringToFront();

    const popup = await context.newPage();
    await popup.goto(`chrome-extension://${extensionId}/popup.html`);
    await popup.evaluate(async (url: string) => {
      const [tab] = await chrome.tabs.query({ url });
      return new Promise<any>((resolve) => chrome.runtime.sendMessage({ type: "START_CAPTURE", payload: { mode: "full-page", tabId: tab?.id } }, resolve));
    }, URL);

    const after = await page.evaluate(() => {
      const scrollLinked = document.getAnimations().filter((a) => a.timeline && a.timeline !== document.timeline).length;
      const marked = document.querySelectorAll("[data-gf-fx]").length;
      const frozenStyle = !!document.getElementById("__gf_fx_freeze");
      const pinPos = getComputedStyle(document.querySelector(".pin")!).position;
      return { scrollLinked, marked, frozenStyle, pinPos };
    });
    expect(after.marked).toBe(0);
    expect(after.frozenStyle).toBe(false);
    expect(after.scrollLinked).toBeGreaterThan(10); // scroll-driven animations run again
    expect(after.pinPos).toBe("sticky");
  });
});
