import { test, expect } from "../fixtures/extension";

const PAGE = "http://localhost:8085/test-page-ocr.html";

test.describe("17 - Search past captures by their text", () => {
  test("TC-HIST-001: a capture's text is read on-device and the History search finds it", async ({
    context, extensionId,
  }) => {
    const page = await context.newPage();
    await page.goto(PAGE);
    await page.waitForLoadState("networkidle");

    const popup = await context.newPage();
    await popup.goto(`chrome-extension://${extensionId}/popup.html`);
    await popup.evaluate(() => chrome.storage.local.remove("captureHistory"));

    const result = await popup.evaluate(async (url: string) => {
      const [tab] = await chrome.tabs.query({ url });
      return chrome.runtime.sendMessage({ type: "START_CAPTURE", payload: { mode: "visible-area", tabId: tab.id } });
    }, PAGE);
    expect(result.type).toBe("CAPTURE_COMPLETE");

    // the text index is filled in shortly after the capture, in the background
    await expect.poll(async () => popup.evaluate(async () => {
      const r: any = await chrome.storage.local.get("captureHistory");
      return (r.captureHistory?.[0]?.text || "").toLowerCase();
    }), { timeout: 60000, intervals: [1000] }).toContain("patient");

    // open the real History panel in the popup and search
    await popup.reload();
    await popup.locator("#historyBtn").click();
    await expect(popup.locator("#historyGrid .hist-item")).toHaveCount(1);

    await popup.locator("#historySearch").fill("intake");
    await expect(popup.locator("#historyGrid .hist-item")).toHaveCount(1);
    await expect(popup.locator("#historyCount")).toHaveText("1 of 1");

    await popup.locator("#historySearch").fill("zebra giraffe");
    await expect(popup.locator("#historyGrid .hist-item")).toHaveCount(0);
    await expect(popup.locator("#historyGrid .hist-empty")).toHaveText("No captures match that search");

    // the URL is searchable too
    await popup.locator("#historySearch").fill("localhost");
    await expect(popup.locator("#historyGrid .hist-item")).toHaveCount(1);

    await popup.evaluate(() => chrome.storage.local.remove("captureHistory"));
    await popup.close();
    await page.close();
  });

  test("TC-HIST-002: turning the setting off stops indexing new captures", async ({ context, extensionId }) => {
    const page = await context.newPage();
    await page.goto(PAGE);
    await page.waitForLoadState("networkidle");
    const popup = await context.newPage();
    await popup.goto(`chrome-extension://${extensionId}/popup.html`);
    await popup.evaluate(async () => {
      await chrome.storage.local.remove("captureHistory");
      const cur: any = (await chrome.storage.sync.get("settings")).settings || {};
      await chrome.storage.sync.set({ settings: { ...cur, indexCaptureText: false } });
    });

    await popup.evaluate(async (url: string) => {
      const [tab] = await chrome.tabs.query({ url });
      return chrome.runtime.sendMessage({ type: "START_CAPTURE", payload: { mode: "visible-area", tabId: tab.id } });
    }, PAGE);
    await expect.poll(async () => popup.evaluate(async () => ((await chrome.storage.local.get("captureHistory")) as any).captureHistory?.length || 0)).toBe(1);
    await popup.waitForTimeout(8000);
    const text = await popup.evaluate(async () => ((await chrome.storage.local.get("captureHistory")) as any).captureHistory?.[0]?.text);
    expect(text).toBeUndefined();

    await popup.evaluate(async () => {
      const cur: any = (await chrome.storage.sync.get("settings")).settings || {};
      await chrome.storage.sync.set({ settings: { ...cur, indexCaptureText: true } });
      await chrome.storage.local.remove("captureHistory");
    });
    await popup.close();
    await page.close();
  });
});
