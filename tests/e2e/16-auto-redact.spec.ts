import { test, expect } from "../fixtures/extension";

test.describe("16 - Auto-redact sensitive info", () => {
  test("TC-REDACT-001: finds an email and a card number, leaves ordinary text alone, and undo removes the boxes", async ({
    context, serviceWorker, extensionId,
  }) => {
    await serviceWorker.evaluate(async () => {
      const w = 1200, h = 520;
      const c = new OffscreenCanvas(w, h);
      const g = c.getContext("2d")!;
      g.fillStyle = "#ffffff"; g.fillRect(0, 0, w, h);
      g.fillStyle = "#000000"; g.font = "bold 44px Arial, sans-serif";
      g.fillText("Quarterly report for the product team", 40, 90);
      g.fillText("Email: jane.roe@example.com", 40, 230);
      g.fillText("Card: 4111 1111 1111 1111", 40, 370);
      const blob = await c.convertToBlob();
      const r = new FileReader();
      const url = await new Promise<string>((res) => { r.onload = () => res(String(r.result)); r.readAsDataURL(blob); });
      await chrome.storage.session.set({ lastCaptureDataUrl: url });
    });

    const page = await context.newPage();
    await page.setViewportSize({ width: 1500, height: 900 });
    await page.goto(`chrome-extension://${extensionId}/editor.html`);
    await page.waitForTimeout(800);

    const objCount = () => page.evaluate(() => (window as any).__fabricCanvas.getObjects().length);
    expect(await objCount()).toBe(1);

    await page.locator("#blur-expand").click();
    await page.locator("#smart-redact-btn").click();

    // OCR runs on-device in the offscreen document, so give it time
    await expect.poll(objCount, { timeout: 45000, intervals: [500] }).toBeGreaterThanOrEqual(3);

    const boxes = await page.evaluate(() => {
      const c = (window as any).__fabricCanvas;
      const objs = c.getObjects();
      const fit = objs[0].scaleX;
      return objs.slice(1).map((o: any) => {
        const r = o.getBoundingRect();
        return { y: r.top / fit, h: r.height / fit };
      });
    });
    // one box on the email line (~y 230) and one on the card line (~y 370), none on the title (~y 90)
    expect(boxes.some((b: any) => b.y < 250 && b.y + b.h > 190)).toBe(true);
    expect(boxes.some((b: any) => b.y < 390 && b.y + b.h > 330)).toBe(true);
    expect(boxes.every((b: any) => b.y > 130)).toBe(true);

    await page.locator(".tool-btn[data-tool='select']").first().click();
    await page.keyboard.press("Control+z");
    await expect.poll(objCount, { timeout: 5000 }).toBe(1);

    await page.close();
  });
});
