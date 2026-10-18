import { test, expect } from "../fixtures/extension";

const PAGE = "http://localhost:8085/test-page-long.html";

async function sendInit(context: any, extensionId: string, mode: string) {
  const helper = await context.newPage();
  await helper.goto(`chrome-extension://${extensionId}/popup.html`);
  await helper.evaluate(async ({ url, mode }: { url: string; mode: string }) => {
    const [tab] = await chrome.tabs.query({ url });
    await chrome.runtime.sendMessage({ type: "INIT_INTERACTIVE_MODE", payload: { mode, tabId: tab.id } });
  }, { url: PAGE, mode });
  await helper.close();
}

test.describe("15 - Capture Element and Pin to page", () => {
  test("TC-ELEM-001: hovering shows the element's size; clicking captures just that element", async ({
    context, extensionId,
  }) => {
    const page = await context.newPage();
    await page.goto(PAGE);
    await page.waitForLoadState("domcontentloaded");

    const target = page.locator("h1").first();
    await expect(target).toBeVisible();
    const box = (await target.boundingBox())!;

    await sendInit(context, extensionId, "capture-element");
    await expect(page.locator("#gofully-element-picker")).toBeAttached({ timeout: 8000 });

    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    const label = page.locator("#gofully-element-picker .lab");
    await expect(label).toContainText("h1");
    await expect(label).toContainText(`${Math.round(box.width)} × ${Math.round(box.height)}`);

    await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
    await expect(page.locator("#gofully-element-picker")).not.toBeAttached();
    // selected-area style captures finish with the result card (closed shadow root, so only the host is visible to tests)
    await expect(page.locator("#gofully-result-card-host")).toBeAttached({ timeout: 15000 });

    const helper = await context.newPage();
    await helper.goto(`chrome-extension://${extensionId}/popup.html`);
    const dim = await helper.evaluate(async () => {
      const resp: any = await chrome.runtime.sendMessage({ type: "GET_CAPTURE_BLOB_URL" });
      const img = new Image();
      img.src = resp.url;
      await img.decode();
      return { w: img.width, h: img.height };
    });
    const dpr = await page.evaluate(() => window.devicePixelRatio);
    expect(Math.abs(dim.w - Math.round(box.width * dpr))).toBeLessThanOrEqual(4);
    expect(Math.abs(dim.h - Math.round(box.height * dpr))).toBeLessThanOrEqual(4);
    expect(dim.w).toBeLessThan((await page.evaluate(() => window.innerWidth)) * dpr * 0.95); // an element, not the whole viewport

    await helper.close();
    await page.close();
  });

  test("TC-ELEM-002: Escape cancels the element picker without capturing", async ({ context, extensionId }) => {
    const page = await context.newPage();
    await page.goto(PAGE);
    await page.waitForLoadState("domcontentloaded");
    await sendInit(context, extensionId, "capture-element");
    await expect(page.locator("#gofully-element-picker")).toBeAttached({ timeout: 8000 });
    await page.keyboard.press("Escape");
    await expect(page.locator("#gofully-element-picker")).not.toBeAttached();
    await expect(page.locator("#gofully-result-card-host")).toHaveCount(0);
    await page.close();
  });

  test("TC-PIN-001: a pinned capture floats on the page and can be closed", async ({ context, extensionId }) => {
    const page = await context.newPage();
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.goto(PAGE);
    await page.waitForLoadState("domcontentloaded");

    const helper = await context.newPage();
    await helper.goto(`chrome-extension://${extensionId}/popup.html`);
    const resp = await helper.evaluate(async (url: string) => {
      const c = new OffscreenCanvas(320, 200);
      const g = c.getContext("2d")!;
      g.fillStyle = "#1667F2"; g.fillRect(0, 0, 320, 200);
      const blob = await c.convertToBlob();
      const dataUrl = await new Promise<string>((res) => {
        const r = new FileReader(); r.onload = () => res(String(r.result)); r.readAsDataURL(blob);
      });
      const [tab] = await chrome.tabs.query({ url });
      return chrome.runtime.sendMessage({ type: "PIN_IMAGE", payload: { dataUrl, width: 320, height: 200, tabId: tab.id } });
    }, PAGE);
    expect(resp.ok).toBe(true);

    const pin = page.locator("[data-gofully-pin]");
    await expect(pin).toBeAttached();
    await expect(pin.locator("img")).toBeVisible();

    // drag it somewhere else
    const before = (await pin.boundingBox())!;
    await page.mouse.move(before.x + 60, before.y + 60);
    await page.mouse.down();
    await page.mouse.move(before.x - 200, before.y - 150, { steps: 6 });
    await page.mouse.up();
    const after = (await pin.boundingBox())!;
    expect(after.x).toBeLessThan(before.x - 100);

    await pin.locator("button").click();
    await expect(pin).not.toBeAttached();

    // a non-image payload is refused
    const bad = await helper.evaluate((url: string) =>
      chrome.tabs.query({ url }).then(([tab]) =>
        chrome.runtime.sendMessage({ type: "PIN_IMAGE", payload: { dataUrl: "javascript:alert(1)", tabId: tab.id } })), PAGE);
    expect(bad.ok).toBe(false);

    await helper.close();
    await page.close();
  });
});
