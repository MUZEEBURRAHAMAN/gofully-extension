import { test, expect } from "../fixtures/extension";

const PAGE = "http://localhost:8085/test-page-plain-tall.html";

async function startAnnotate(context: any, extensionId: string) {
  const helper = await context.newPage();
  await helper.goto(`chrome-extension://${extensionId}/popup.html`);
  await helper.evaluate(async (url: string) => {
    const [tab] = await chrome.tabs.query({ url });
    await chrome.runtime.sendMessage({
      type: "INIT_INTERACTIVE_MODE",
      payload: { mode: "annotate-page", tabId: tab.id },
    });
  }, PAGE);
  await helper.close();
}

async function drawLine(page: any, y: number) {
  await page.mouse.move(300, y);
  await page.mouse.down();
  await page.mouse.move(420, y + 12, { steps: 6 });
  await page.mouse.move(540, y, { steps: 6 });
  await page.mouse.up();
}

test.describe("12 - Draw on live pages", () => {
  test("TC-ANNOT-001: Draw-on-page mode opens a toolbar and a pen stroke is drawn", async ({
    context,
    extensionId,
  }) => {
    const page = await context.newPage();
    await page.goto(PAGE);
    await page.waitForLoadState("domcontentloaded");
    await startAnnotate(context, extensionId);

    await expect(page.locator("#gofully-annotate-host")).toBeAttached({ timeout: 8000 });
    await expect(page.locator("#bar")).toBeVisible();

    await drawLine(page, 300);
    await expect(page.locator("#svg-layer path")).toHaveCount(1);

    await page.close();
  });

  test("TC-ANNOT-002: Undo removes the last mark; Escape leaves the mode and removes the UI", async ({
    context,
    extensionId,
  }) => {
    const page = await context.newPage();
    await page.goto(PAGE);
    await page.waitForLoadState("domcontentloaded");
    await startAnnotate(context, extensionId);
    await expect(page.locator("#bar")).toBeVisible({ timeout: 8000 });

    await drawLine(page, 260);
    await drawLine(page, 340);
    await expect(page.locator("#svg-layer path")).toHaveCount(2);

    await page.keyboard.press("Control+z");
    await expect(page.locator("#svg-layer path")).toHaveCount(1);

    await page.keyboard.press("Escape");
    await expect(page.locator("#gofully-annotate-host")).not.toBeAttached();

    await page.close();
  });

  test("TC-ANNOT-003: Marks are saved per page and come back after a reload", async ({
    context,
    extensionId,
  }) => {
    const page = await context.newPage();
    await page.goto(PAGE);
    await page.waitForLoadState("domcontentloaded");
    await startAnnotate(context, extensionId);
    await expect(page.locator("#bar")).toBeVisible({ timeout: 8000 });

    await page.locator('[data-tool="rect"]').click();
    await page.mouse.move(200, 220);
    await page.mouse.down();
    await page.mouse.move(360, 300, { steps: 5 });
    await page.mouse.up();
    await expect(page.locator("#svg-layer rect")).toHaveCount(1);
    await page.waitForTimeout(500); // debounce before the save lands

    await page.reload();
    await page.waitForLoadState("domcontentloaded");
    await startAnnotate(context, extensionId);
    await expect(page.locator("#svg-layer rect")).toHaveCount(1, { timeout: 8000 });

    await page.locator('[data-act="clear"]').click();
    await expect(page.locator("#svg-layer rect")).toHaveCount(0);
    await page.close();
  });

  test("TC-ANNOT-004: Capturing from the toolbar includes the marks and leaves the toolbar out", async ({
    context,
    extensionId,
  }) => {
    const page = await context.newPage();
    await page.goto(PAGE);
    await page.waitForLoadState("domcontentloaded");
    await startAnnotate(context, extensionId);
    await expect(page.locator("#bar")).toBeVisible({ timeout: 8000 });

    // pick a colour that does not occur on the page or in the toolbar, then draw
    await page.locator('[data-color="#E5484D"]').click();
    await page.locator('[data-width="8"]').click();
    await drawLine(page, 300);
    await page.locator('[data-act="cap-visible"]').click();

    await expect(page.locator("#gofully-quick-toast")).toBeVisible({ timeout: 15000 });
    await expect(page.locator("#bar")).toBeVisible(); // comes back after capture

    const helper = await context.newPage();
    await helper.goto(`chrome-extension://${extensionId}/popup.html`);
    const stats = await helper.evaluate(async () => {
      const resp: any = await chrome.runtime.sendMessage({ type: "GET_CAPTURE_BLOB_URL" });
      const img = new Image();
      img.src = resp.url;
      await img.decode();
      const c = document.createElement("canvas");
      c.width = img.width; c.height = img.height;
      const ctx = c.getContext("2d")!;
      ctx.drawImage(img, 0, 0);
      const data = ctx.getImageData(0, 0, c.width, c.height).data;
      let red = 0, toolbarBlue = 0;
      const toolbarTop = c.height - Math.round(c.height * 0.12);
      for (let y = 0; y < c.height; y++) {
        for (let x = 0; x < c.width; x++) {
          const i = (y * c.width + x) * 4;
          const r = data[i], g = data[i + 1], b = data[i + 2];
          if (r > 200 && g < 110 && b < 120) red++;
          if (y > toolbarTop && b > 220 && r < 60 && g > 80 && g < 130) toolbarBlue++;
        }
      }
      return { red, toolbarBlue };
    });
    expect(stats.red).toBeGreaterThan(200); // the stroke is in the screenshot
    expect(stats.toolbarBlue).toBe(0); // the active-tool blue of our own toolbar is not

    await helper.close();
    await page.close();
  });
  test("TC-ANNOT-005: Cmd/Ctrl+Shift+H toggles draw-on-page mode from the page", async ({ context }) => {
    const page = await context.newPage();
    await page.goto(PAGE);
    await page.waitForLoadState("domcontentloaded");

    await page.keyboard.press("Control+Shift+H");
    await expect(page.locator("#gofully-annotate-host")).toBeAttached({ timeout: 8000 });

    await page.waitForTimeout(700); // past the shortcut debounce
    await page.keyboard.press("Control+Shift+H");
    await expect(page.locator("#gofully-annotate-host")).not.toBeAttached({ timeout: 8000 });
    await page.close();
  });
});
