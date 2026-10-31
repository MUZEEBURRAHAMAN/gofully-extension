import { test, expect } from "../fixtures/extension";

// A full-page capture of a landing page is tall and narrow. Zoomed in, the canvas is far larger than the window,
// and the editor used to centre it with flexbox: the overflow went off the top and left edges, where nothing can
// scroll to it, so at 800% only a slice from the middle of the page could ever be seen.
// The seeded page is 1920 x 11380: red at the very top, blue at the very bottom, a pale grey grid in between.
async function seedTallPage(serviceWorker: any) {
  await serviceWorker.evaluate(async () => {
    const W = 1920, H = 11380;
    const c = new OffscreenCanvas(W, H);
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = "#e5e7eb"; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "#ff0000"; ctx.fillRect(0, 0, W, 400);
    ctx.fillStyle = "#0000ff"; ctx.fillRect(0, H - 400, W, 400);
    ctx.fillStyle = "#16a34a"; ctx.fillRect(0, H / 2 - 200, W, 400); // green band in the middle
    const blob = await c.convertToBlob();
    const reader = new FileReader();
    const dataUrl = await new Promise<string>((res) => { reader.onload = () => res(reader.result as string); reader.readAsDataURL(blob); });
    await chrome.storage.session.set({ lastCaptureDataUrl: dataUrl });
  });
}

async function openEditor(context: any, extensionId: string, serviceWorker: any) {
  await seedTallPage(serviceWorker);
  const page = await context.newPage();
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`chrome-extension://${extensionId}/editor.html`);
  await page.waitForSelector("#editorCanvas", { state: "visible" });
  await page.waitForTimeout(700);
  return page;
}

/** Click zoom-in until the label reads `label`; returns how many clicks it took. */
async function zoomTo(page: any, label: string, maxClicks = 60): Promise<number> {
  let clicks = 0;
  while ((await page.locator("#hdr-zoom-val").innerText()) !== label && clicks < maxClicks) {
    await page.locator("#hdr-zoom-in-btn").click();
    clicks++;
  }
  return clicks;
}

async function scrollBox(page: any) {
  return page.evaluate(() => {
    const wrap = document.getElementById("canvasContainer")!;
    const holder = document.querySelector("#canvasContainer .canvas-container") as HTMLElement;
    const w = wrap.getBoundingClientRect(), h = holder.getBoundingClientRect();
    return {
      wrap: { top: w.top, left: w.left, bottom: w.bottom, right: w.right, w: wrap.clientWidth, h: wrap.clientHeight },
      canvas: { top: h.top, left: h.left, bottom: h.bottom, right: h.right, w: h.width, h: h.height },
      scrollHeight: wrap.scrollHeight, scrollWidth: wrap.scrollWidth, clientHeight: wrap.clientHeight, clientWidth: wrap.clientWidth,
    };
  });
}

/** Colour of the pixel at (x, y) on screen. */
async function pixelAt(page: any, x: number, y: number): Promise<number[]> {
  const png = await page.screenshot({ clip: { x, y, width: 1, height: 1 } });
  return page.evaluate(async (b64: string) => {
    const img = await createImageBitmap(await (await fetch("data:image/png;base64," + b64)).blob());
    const c = document.createElement("canvas"); c.width = 1; c.height = 1;
    const ctx = c.getContext("2d")!; ctx.drawImage(img, 0, 0);
    return Array.from(ctx.getImageData(0, 0, 1, 1).data).slice(0, 3);
  }, png.toString("base64"));
}

const near = (rgb: number[], want: number[], tol = 14) => rgb.every((v, i) => Math.abs(v - want[i]) <= tol);

test.describe("26 - Editor zoom on a tall page", () => {
  for (const label of ["800%", "1000%"]) {
    test(`TC-ZOOM-001: at ${label} the whole page can be scrolled to, from the very top to the very bottom`, async ({ context, extensionId, serviceWorker }) => {
      const page = await openEditor(context, extensionId, serviceWorker);
      await zoomTo(page, label);
      await expect(page.locator("#hdr-zoom-val")).toHaveText(label);

      const wrap = page.locator("#canvasContainer");
      const box = await scrollBox(page);
      // The scrollable area covers the whole canvas, not just part of it.
      expect(box.scrollHeight, "scrollable height").toBeGreaterThanOrEqual(box.canvas.h - 1);
      expect(box.scrollWidth, "scrollable width").toBeGreaterThanOrEqual(box.canvas.w - 1);

      // Top of the page: scroll all the way up and left. The canvas starts inside the window, and red is on screen.
      await wrap.evaluate((el: HTMLElement) => { el.scrollTop = 0; el.scrollLeft = 0; });
      await page.waitForTimeout(150);
      const top = await scrollBox(page);
      expect(top.canvas.top, "canvas top edge is reachable").toBeGreaterThanOrEqual(top.wrap.top - 1);
      expect(top.canvas.left, "canvas left edge is reachable").toBeGreaterThanOrEqual(top.wrap.left - 1);
      const topPixel = await pixelAt(page, Math.round(top.canvas.left + 60), Math.round(top.canvas.top + 40));
      expect(near(topPixel, [255, 0, 0]), `top of the page is red, got rgb(${topPixel})`).toBe(true);

      // Bottom of the page: scroll all the way down and right. The canvas ends inside the window, and blue is on screen.
      await wrap.evaluate((el: HTMLElement) => { el.scrollTop = el.scrollHeight; el.scrollLeft = el.scrollWidth; });
      await page.waitForTimeout(150);
      const bottom = await scrollBox(page);
      expect(bottom.canvas.bottom, "canvas bottom edge is reachable").toBeLessThanOrEqual(bottom.wrap.bottom + 1);
      expect(bottom.canvas.right, "canvas right edge is reachable").toBeLessThanOrEqual(bottom.wrap.right + 1);
      const bottomPixel = await pixelAt(page, Math.round(bottom.canvas.right - 60), Math.round(bottom.canvas.bottom - 40));
      expect(near(bottomPixel, [0, 0, 255]), `bottom of the page is blue, got rgb(${bottomPixel})`).toBe(true);
    });
  }

  test("TC-ZOOM-002: a small canvas is still centred in the window", async ({ context, extensionId, serviceWorker }) => {
    const page = await openEditor(context, extensionId, serviceWorker);
    const box = await scrollBox(page);
    const left = box.canvas.left - box.wrap.left, right = box.wrap.right - box.canvas.right;
    const top = box.canvas.top - box.wrap.top, bottom = box.wrap.bottom - box.canvas.bottom;
    expect(Math.abs(left - right), "horizontally centred").toBeLessThanOrEqual(2);
    expect(Math.abs(top - bottom), "vertically centred").toBeLessThanOrEqual(2);
  });

  test("TC-ZOOM-003: zooming keeps the part of the page you are looking at in view", async ({ context, extensionId, serviceWorker }) => {
    const page = await openEditor(context, extensionId, serviceWorker);
    await zoomTo(page, "400%");
    // Put the green band in the middle of the window.
    await page.locator("#canvasContainer").evaluate((el: HTMLElement) => { el.scrollTop = (el.scrollHeight - el.clientHeight) / 2; });
    await page.waitForTimeout(200);
    const winMid = (b: any) => (b.wrap.top + b.wrap.bottom) / 2;
    const fractionAtMiddle = (b: any) => (winMid(b) - b.canvas.top) / b.canvas.h;
    const before = await scrollBox(page);
    const f0 = fractionAtMiddle(before);

    for (let i = 0; i < 4; i++) await page.locator("#hdr-zoom-in-btn").click();
    const after = await scrollBox(page);
    expect(after.canvas.h).toBeGreaterThan(before.canvas.h * 1.3);
    expect(Math.abs(fractionAtMiddle(after) - f0), "the same point stays in the middle of the window").toBeLessThan(0.01);
    const mid = await pixelAt(page, Math.round((after.wrap.left + after.wrap.right) / 2), Math.round(winMid(after)));
    expect(near(mid, [22, 163, 74]), `still looking at the green band, got rgb(${mid})`).toBe(true);
  });

  test("TC-ZOOM-004: the buttons step by 10% up to 200%, then through round levels, and 1000% is 17 clicks away", async ({ context, extensionId, serviceWorker }) => {
    const page = await openEditor(context, extensionId, serviceWorker);
    const levels: string[] = [];
    for (let i = 0; i < 30 && (await page.locator("#hdr-zoom-val").innerText()) !== "1000%"; i++) {
      await page.locator("#hdr-zoom-in-btn").click();
      levels.push(await page.locator("#hdr-zoom-val").innerText());
    }
    expect(levels).toEqual([
      "110%", "120%", "130%", "140%", "150%", "160%", "170%", "180%", "190%", "200%",
      "250%", "300%", "400%", "500%", "600%", "800%", "1000%",
    ]);
    // And back down: stepping out of a zoomed-in state lands on exactly 100% on the way to zooming out.
    const seen: string[] = [];
    for (let i = 0; i < 80 && !seen.includes("100%"); i++) {
      await page.locator("#hdr-zoom-out-btn").click();
      seen.push(await page.locator("#hdr-zoom-val").innerText());
    }
    expect(seen).toContain("100%");
  });
});
