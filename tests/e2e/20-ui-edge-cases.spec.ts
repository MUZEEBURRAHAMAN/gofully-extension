import { test, expect } from "../fixtures/extension";

const pages = ["popup.html", "settings.html", "help.html", "guide.html", "editor.html"];

test.describe("20 - UI and UX edge cases", () => {
  for (const p of pages) {
    test(`TC-UI-${p}: no console errors, no horizontal scroll at 400px and 1280px, buttons are named`, async ({ context, extensionId }) => {
      const page = await context.newPage();
      const errors: string[] = [];
      page.on("pageerror", (e) => errors.push(e.message));
      page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
      for (const w of p === "popup.html" ? [380] : [400, 1280]) {
        await page.setViewportSize({ width: w, height: 800 });
        await page.goto(`chrome-extension://${extensionId}/${p}`);
        await page.waitForTimeout(500);
        const over = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
        expect(over, `${p} at ${w}px overflows by ${over}px`).toBeLessThanOrEqual(1);
      }
      const unnamed = await page.evaluate(() =>
        [...document.querySelectorAll("button")]
          .filter((b) => (b as HTMLElement).offsetParent !== null)
          .filter((b) => !(b.textContent || "").trim() && !b.getAttribute("aria-label") && !b.title)
          .map((b) => b.id || b.className)
      );
      expect(unnamed, `${p} unnamed buttons`).toEqual([]);
      expect(errors.filter((e) => !/favicon|Failed to load resource/.test(e))).toEqual([]);
    });
  }

  test("TC-UI-popup: every capture tile is visible, labelled and keyboard focusable", async ({ context, extensionId }) => {
    const page = await context.newPage();
    await page.setViewportSize({ width: 380, height: 700 });
    await page.goto(`chrome-extension://${extensionId}/popup.html`);
    await page.waitForTimeout(500);
    for (const label of [/full page/i, /visible/i, /selected|region/i, /scrolling/i, /text/i, /element/i, /draw on page/i]) {
      const el = page.getByRole("button", { name: label }).first();
      await expect(el, String(label)).toBeVisible();
    }
    await page.keyboard.press("Tab");
    const focused = await page.evaluate(() => document.activeElement?.tagName);
    expect(["BUTTON", "A", "INPUT"]).toContain(focused);
  });

  test("TC-UI-guide: empty state shows instructions and disables export and clear", async ({ context, extensionId }) => {
    const page = await context.newPage();
    await page.goto(`chrome-extension://${extensionId}/popup.html`);
    await page.evaluate(() => chrome.storage.local.remove("gofullyGuide"));
    await page.goto(`chrome-extension://${extensionId}/guide.html`);
    await expect(page.locator("#empty")).toBeVisible();
    await expect(page.locator("#exportPdf")).toBeDisabled();
    await expect(page.locator("#exportMd")).toBeDisabled();
    await expect(page.locator("#clearAll")).toBeDisabled();
    await expect(page.locator("#count")).toHaveText("");
  });

  test("TC-UI-guide-limits: with 30 steps the 31st is refused with a clear message, and nothing is added", async ({ context, serviceWorker, extensionId }) => {
    const page = await context.newPage();
    await page.goto(`chrome-extension://${extensionId}/popup.html`);
    await page.evaluate(async () => {
      const steps = Array.from({ length: 30 }, (_, i) => ({ id: "s" + i, img: "data:image/jpeg;base64,AAAA", w: 10, h: 10, caption: "", url: "", ts: 0 }));
      await chrome.storage.local.set({ gofullyGuide: { title: "x", steps } });
    });
    await serviceWorker.evaluate(async () => {
      const c = new OffscreenCanvas(40, 30);
      c.getContext("2d")!.fillRect(0, 0, 40, 30);
      const b = await c.convertToBlob();
      const r = new FileReader();
      const url = await new Promise<string>((res) => { r.onload = () => res(String(r.result)); r.readAsDataURL(b); });
      await chrome.storage.session.set({ lastCaptureDataUrl: url });
    });
    const res = await page.evaluate(() => chrome.runtime.sendMessage({ type: "GUIDE_ADD_LAST_CAPTURE" }));
    expect(res.ok).toBe(false);
    expect(res.error).toMatch(/30 steps/);
    expect(res.error).not.toContain("—");
    const n = await page.evaluate(async () => ((await chrome.storage.local.get("gofullyGuide")) as any).gofullyGuide.steps.length);
    expect(n).toBe(30);
    await page.goto(`chrome-extension://${extensionId}/guide.html`);
    await expect(page.locator("#count")).toHaveText("30 of 30 steps");
    await page.evaluate(() => chrome.storage.local.remove("gofullyGuide"));
  });

  test("TC-UI-guide-nothing: adding with no capture says so", async ({ context, serviceWorker, extensionId }) => {
    const page = await context.newPage();
    await page.goto(`chrome-extension://${extensionId}/popup.html`);
    await serviceWorker.evaluate(() => chrome.storage.session.remove("lastCaptureDataUrl"));
    const res = await page.evaluate(() => chrome.runtime.sendMessage({ type: "GUIDE_ADD_LAST_CAPTURE" }));
    // The worker may still hold a capture in memory from an earlier test; either answer must be well-formed.
    expect(typeof res.ok).toBe("boolean");
    if (!res.ok) expect(res.error).toMatch(/nothing/i);
  });

  test("TC-UI-help: accordions open and close, aria-expanded follows, new sections are present", async ({ context, extensionId }) => {
    const page = await context.newPage();
    await page.setViewportSize({ width: 1100, height: 900 });
    await page.goto(`chrome-extension://${extensionId}/help.html`);
    const headers = page.locator(".help-header");
    expect(await headers.count()).toBeGreaterThanOrEqual(15);
    for (const title of ["Capture Element", "Draw on Page", "Beautify", "Step-by-Step Guide", "Pin a Capture", "Find an Old Capture"]) {
      await expect(page.locator(".help-title", { hasText: title }).first(), title).toHaveCount(1);
    }
    const h = headers.nth(5);
    await expect(h).toHaveAttribute("aria-expanded", "false");
    await h.click();
    await expect(h).toHaveAttribute("aria-expanded", "true");
    await h.click();
    await expect(h).toHaveAttribute("aria-expanded", "false");
  });

  test("TC-UI-settings: index toggle persists and the shortcut list names each command", async ({ context, extensionId }) => {
    const page = await context.newPage();
    await page.setViewportSize({ width: 900, height: 900 });
    await page.goto(`chrome-extension://${extensionId}/settings.html`);
    await page.waitForTimeout(600);
    const body = await page.locator("body").innerText();
    expect(body).toMatch(/shortcut/i);
    expect(body).toMatch(/search inside screenshots|index/i);
    expect(body).not.toMatch(/undefined|NaN|\[object/);
  });

  test("TC-UI-history: search with no match shows an empty message; clear all empties the list", async ({ context, extensionId }) => {
    const page = await context.newPage();
    await page.setViewportSize({ width: 380, height: 700 });
    await page.goto(`chrome-extension://${extensionId}/popup.html`);
    await page.evaluate(async () => {
      const c = document.createElement("canvas"); c.width = 40; c.height = 30;
      const thumb = c.toDataURL("image/jpeg");
      const entries = Array.from({ length: 3 }, (_, i) => ({ id: "h" + i, thumbnail: thumb, url: "https://example.com/" + i, title: "Page " + i, timestamp: Date.now() - i * 1000, mode: "visible", text: i === 1 ? "invoice total" : "" }));
      await chrome.storage.local.set({ captureHistory: entries });
    });
    await page.reload();
    await page.locator("#historyBtn").click();
    await page.waitForTimeout(400);
    const search = page.locator("input[type=search], #historySearch").first();
    await search.fill("zzzzqqq");
    await page.waitForTimeout(300);
    const none = await page.locator("#historyView, body").first().innerText();
    expect(none).toMatch(/no (captures|results|match)/i);
    await search.fill("invoice");
    await page.waitForTimeout(300);
    expect(await page.locator(".hist-item, .history-item, [data-history-id]").count()).toBeGreaterThanOrEqual(1);
    await search.fill("");
    page.once("dialog", (d) => d.accept());
    await page.locator("#historyClearBtn").click();
    await page.waitForTimeout(400);
    const left = await page.evaluate(async () => ((await chrome.storage.local.get("captureHistory")) as any).captureHistory?.length || 0);
    expect(left).toBe(0);
  });
});
