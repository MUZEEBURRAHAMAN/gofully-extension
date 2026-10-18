import { test, expect } from "../fixtures/extension";

async function seed(serviceWorker: any, width: number, height: number) {
  await serviceWorker.evaluate(async ({ w, h }: { w: number; h: number }) => {
    const c = new OffscreenCanvas(w, h);
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "#1667F2";
    ctx.fillRect(0, 0, w, 60);
    const blob = await c.convertToBlob();
    const reader = new FileReader();
    const dataUrl = await new Promise<string>((res) => {
      reader.onload = () => res(reader.result as string);
      reader.readAsDataURL(blob);
    });
    await chrome.storage.session.set({ lastCaptureDataUrl: dataUrl });
  }, { w: width, h: height });
}

test.describe("14 - Crop keeps annotations", () => {
  test("TC-CROP-001: cropping moves existing annotations with the image, and undo/redo restore the size", async ({
    context, serviceWorker, extensionId,
  }) => {
    await seed(serviceWorker, 800, 500);
    const page = await context.newPage();
    await page.setViewportSize({ width: 1400, height: 900 });
    await page.goto(`chrome-extension://${extensionId}/editor.html`);
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(700);
    await expect(page.locator("#dimensions")).toHaveText("800 × 500 px");

    // draw a rectangle annotation
    await page.locator("#tool-shape").click();
    const box = (await page.locator(".upper-canvas").boundingBox())!;
    await page.mouse.move(box.x + 300, box.y + 200);
    await page.mouse.down();
    await page.mouse.move(box.x + 420, box.y + 270, { steps: 6 });
    await page.mouse.up();
    await page.waitForTimeout(300);

    const before = await page.evaluate(() => {
      const c = (window as any).__fabricCanvas;
      const objs = c.getObjects();
      const bg = objs[0];
      const o = objs[objs.length - 1];
      return { count: objs.length, x: o.left / bg.scaleX, y: o.top / bg.scaleY, w: o.getBoundingRect().width / bg.scaleX };
    });
    expect(before.count).toBe(2);

    // open crop, drag a region that still contains the rectangle
    await page.locator(".tool-btn[data-tool='crop']").click();
    await expect(page.locator(".cropper-container")).toBeVisible({ timeout: 5000 });
    const cbox = (await page.locator(".cropper-container").boundingBox())!;
    await page.mouse.move(cbox.x + 120, cbox.y + 80);
    await page.mouse.down();
    await page.mouse.move(cbox.x + cbox.width * 0.8, cbox.y + cbox.height * 0.85, { steps: 8 });
    await page.mouse.up();
    await page.waitForTimeout(300);
    const pos = (await page.locator("#cropPosDisplay").innerText()).split(",").map((n) => parseInt(n.trim()));
    const sizeText = await page.locator("#cropSizeDisplay").innerText();
    expect(pos.length).toBe(2);

    await page.locator("#cropApplyBtn").click();
    await page.waitForTimeout(800);

    const after = await page.evaluate(() => {
      const c = (window as any).__fabricCanvas;
      const objs = c.getObjects();
      const bg = objs[0];
      const o = objs[objs.length - 1];
      return {
        count: objs.length,
        x: o.left / bg.scaleX, y: o.top / bg.scaleY, w: o.getBoundingRect().width / bg.scaleX,
        inside: o.getBoundingRect().left >= 0 && o.getBoundingRect().top >= 0,
      };
    });
    expect(after.count).toBe(2); // the annotation survived the crop
    expect(after.inside).toBe(true);
    expect(Math.abs(before.x - after.x - pos[0])).toBeLessThan(2); // moved by exactly the crop offset
    expect(Math.abs(before.y - after.y - pos[1])).toBeLessThan(2);
    expect(Math.abs(before.w - after.w)).toBeLessThan(1); // same size on the screenshot

    const croppedDims = await page.locator("#dimensions").innerText();
    expect(croppedDims).not.toBe("800 × 500 px");
    // the readout and the saved crop round separately, so allow 1px
    const nums = (t: string) => (t.match(/\d+/g) || []).map(Number);
    const [sw, sh] = nums(sizeText);
    const [cw, ch] = nums(croppedDims);
    expect(Math.abs(sw - cw)).toBeLessThanOrEqual(1);
    expect(Math.abs(sh - ch)).toBeLessThanOrEqual(1);

    // undo brings the original size back, redo returns to the crop
    await page.locator("#tool-select, .tool-btn[data-tool='select']").first().click();
    await page.keyboard.press("Control+z");
    await page.waitForTimeout(600);
    await expect(page.locator("#dimensions")).toHaveText("800 × 500 px");
    await page.keyboard.press("Control+Shift+z");
    await page.waitForTimeout(600);
    await expect(page.locator("#dimensions")).toHaveText(croppedDims);

    await page.close();
  });
});
