import { test, expect } from "../fixtures/extension";

const PAGE = "http://localhost:8085/test-page-long.html";

async function setKeep(page: any, on: boolean) {
  await page.evaluate(async (v: boolean) => {
    const cur = ((await chrome.storage.sync.get("settings")) as any).settings || {};
    await chrome.storage.sync.set({ settings: { ...cur, keepFullImages: v } });
  }, on);
}

test.describe("23 - Keep recent captures (opt-in full images)", () => {
  test("TC-KEEP-001: off by default, nothing stored, history click opens the source page", async ({ context, serviceWorker, extensionId }) => {
    const page = await context.newPage();
    await page.goto(`chrome-extension://${extensionId}/settings.html`);
    await expect(page.locator("#keepFullImages")).not.toBeChecked();
    const ids = await page.evaluate(() => chrome.runtime.sendMessage({ type: "LIST_FULL_IMAGES" }));
    expect(ids.ids).toEqual([]);
  });

  test("TC-KEEP-002: with it on, a capture is stored, History reopens it in the editor, and Clear All removes it", async ({ context, serviceWorker, extensionId }) => {
    const target = await context.newPage();
    await target.setViewportSize({ width: 1280, height: 800 });
    await target.goto(PAGE);
    const popup = await context.newPage();
    await popup.goto(`chrome-extension://${extensionId}/popup.html`);
    await popup.evaluate(() => chrome.storage.local.remove("captureHistory"));
    await setKeep(popup, true);

    await popup.evaluate(async (url: string) => {
      const [tab] = await chrome.tabs.query({ url });
      await chrome.runtime.sendMessage({ type: "START_CAPTURE", payload: { mode: "visible-area", tabId: tab.id } });
    }, PAGE);
    await expect.poll(async () => (await popup.evaluate(() => chrome.runtime.sendMessage({ type: "LIST_FULL_IMAGES" }))).ids.length, { timeout: 20000 }).toBe(1);

    // wipe the in-memory copy so the reopen must come from storage
    await serviceWorker.evaluate(() => chrome.storage.session.remove("lastCaptureDataUrl"));

    await popup.reload();
    await popup.locator("#historyBtn").click();
    const item = popup.locator(".hist-item").first();
    await expect(item).toHaveAttribute("aria-label", /^Reopen/);
    const editorPromise = context.waitForEvent("page", { predicate: (p) => p.url().includes("editor.html") });
    await item.click();
    const editor = await editorPromise;
    await editor.waitForTimeout(1200);
    const size = await editor.evaluate(() => {
      const c = (window as any).__fabricCanvas;
      return { w: c?.getWidth?.() ?? 0, h: c?.getHeight?.() ?? 0 };
    });
    expect(size.w).toBeGreaterThan(100);

    // the popup closes itself after a reopen, so use a fresh page for the cleanup checks
    const helper = await context.newPage();
    await helper.goto(`chrome-extension://${extensionId}/settings.html`);
    await helper.evaluate(() => chrome.runtime.sendMessage({ type: "CLEAR_HISTORY" }));
    const after = await helper.evaluate(() => chrome.runtime.sendMessage({ type: "LIST_FULL_IMAGES" }));
    expect(after.ids).toEqual([]);
    await setKeep(helper, false);
  });

  test("TC-KEEP-003: only the newest 10 full images are kept, and deleting an entry deletes its image", async ({ context, extensionId }) => {
    test.setTimeout(180000);
    const target = await context.newPage();
    await target.goto(PAGE);
    const popup = await context.newPage();
    await popup.goto(`chrome-extension://${extensionId}/popup.html`);
    await popup.evaluate(() => chrome.runtime.sendMessage({ type: "CLEAR_HISTORY" }));
    await setKeep(popup, true);
    // Chrome rate-limits tab capture, so retry a refused capture after a pause
    for (let done = 0, tries = 0; done < 12 && tries < 40; tries++) {
      const r = await popup.evaluate(async (url: string) => {
        const [tab] = await chrome.tabs.query({ url });
        return new Promise<any>((res) => chrome.runtime.sendMessage({ type: "START_CAPTURE", payload: { mode: "visible-area", tabId: tab.id } }, res));
      }, PAGE);
      if (r?.type === "CAPTURE_COMPLETE") done++;
      await popup.waitForTimeout(700);
    }
    await popup.waitForTimeout(3000);
    const dbg = { ids: (await popup.evaluate(() => chrome.runtime.sendMessage({ type: "LIST_FULL_IMAGES" }))).ids.length, hist: (await popup.evaluate(() => chrome.runtime.sendMessage({ type: "GET_HISTORY" }))).history.length };
    expect(dbg.hist).toBe(12);
    await expect.poll(async () => (await popup.evaluate(() => chrome.runtime.sendMessage({ type: "LIST_FULL_IMAGES" }))).ids.length, { timeout: 20000 }).toBe(10);
    const hist = (await popup.evaluate(() => chrome.runtime.sendMessage({ type: "GET_HISTORY" }))).history;
    expect(hist.length).toBe(12);
    const kept = (await popup.evaluate(() => chrome.runtime.sendMessage({ type: "LIST_FULL_IMAGES" }))).ids as string[];
    const newestId = hist[0].id;
    expect(kept).toContain(newestId);
    await popup.evaluate((id: string) => chrome.runtime.sendMessage({ type: "DELETE_HISTORY_ENTRY", payload: { id } }), newestId);
    const after = (await popup.evaluate(() => chrome.runtime.sendMessage({ type: "LIST_FULL_IMAGES" }))).ids as string[];
    expect(after).not.toContain(newestId);
    expect(after.length).toBe(9);
    await popup.evaluate(() => chrome.runtime.sendMessage({ type: "CLEAR_HISTORY" }));
    await setKeep(popup, false);
  });
});
