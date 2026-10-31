import type { Page } from "@playwright/test";

/**
 * The test browser reports a taller viewport than the tab really shows (for example 720px while a photo of the
 * tab is 633px tall). A real browser window never does. Tests that read pixels at positions based on the viewport
 * height, or that depend on scroll-driven animations, need the two to agree: size the viewport to what a photo of
 * the tab actually contains.
 */
export async function matchViewportToWindow(page: Page, popup: Page, url: string): Promise<number> {
  const visibleHeight: number = await popup.evaluate(async (u: string) => {
    const [tab] = await chrome.tabs.query({ url: u });
    await chrome.tabs.update(tab.id!, { active: true });
    await new Promise((r) => setTimeout(r, 300));
    const shot = await chrome.tabs.captureVisibleTab(tab.windowId, { format: "png" });
    const img = new Image();
    await new Promise<void>((ok, bad) => { img.onload = () => ok(); img.onerror = bad; img.src = shot; });
    return img.height;
  }, url);
  await page.setViewportSize({ width: 1280, height: visibleHeight });
  await page.waitForTimeout(250);
  return visibleHeight;
}
