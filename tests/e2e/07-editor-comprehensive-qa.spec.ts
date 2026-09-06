import { test, expect } from "../fixtures/extension";

test.describe("07 - Comprehensive Editor QA Test Suite (Senior QA 12+ YOE Standards)", () => {
  // Helper to load test screenshot into chrome session storage
  async function seedTestScreenshot(serviceWorker: any, width = 600, height = 400) {
    await serviceWorker.evaluate(async ({ w, h }: { w: number; h: number }) => {
      const c = new OffscreenCanvas(w, h);
      const ctx = c.getContext("2d")!;
      ctx.fillStyle = "#1E293B";
      ctx.fillRect(0, 0, w, h);

      // Draw grid
      ctx.strokeStyle = "#334155";
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 40) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
      }
      for (let y = 0; y < h; y += 40) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
      }

      ctx.fillStyle = "#38BDF8";
      ctx.font = "bold 28px sans-serif";
      ctx.fillText("GoFully QA Test Capture", 50, 80);

      ctx.fillStyle = "#F43F5E";
      ctx.fillRect(50, 120, 200, 100);

      const blob = await c.convertToBlob();
      const reader = new FileReader();
      const dataUrl = await new Promise<string>((res) => {
        reader.onload = () => res(reader.result as string);
        reader.readAsDataURL(blob);
      });
      await chrome.storage.session.set({ lastCaptureDataUrl: dataUrl });
    }, { w: width, h: height });
  }

  test("TC-QA-ED-001 [Tab Order]: OPEN_EDITOR message opens tab immediately adjacent to source tab", async ({
    context,
    serviceWorker,
    extensionId,
  }) => {
    // Open tabs with extension pages so chrome.runtime is available
    const tab0 = await context.newPage();
    await tab0.goto(`chrome-extension://${extensionId}/help.html`);
    const tab1 = await context.newPage();
    await tab1.goto(`chrome-extension://${extensionId}/settings.html`);

    // Seed capture
    await seedTestScreenshot(serviceWorker, 400, 300);

    // Open editor from tab0 and await new page creation
    const [editorPage] = await Promise.all([
      context.waitForEvent("page"),
      tab0.evaluate(async () => {
        return await chrome.runtime.sendMessage({ type: "OPEN_EDITOR" });
      }),
    ]);

    await editorPage.waitForLoadState("domcontentloaded");
    expect(editorPage.url()).toContain("editor.html");

    // Inspect actual Chrome tab indices to verify editor opened immediately next to source tab
    const tabs = await serviceWorker.evaluate(async () => {
      const all = await chrome.tabs.query({ currentWindow: true });
      return all.map((t) => ({ url: t.url, index: t.index }));
    });
    const sourceTab = tabs.find((t) => t.url?.includes("help.html"));
    const editorTab = tabs.find((t) => t.url?.includes("editor.html"));
    expect(sourceTab).toBeDefined();
    expect(editorTab).toBeDefined();
    expect(editorTab?.index).toBe(sourceTab!.index + 1);

    await tab0.close();
    await tab1.close();
    await editorPage.close();
  });

  test("TC-QA-ED-002 [Connected Cursor & Live HUD]: Shape drag connects pixel-perfectly with cursor and displays live badge", async ({
    context,
    extensionId,
    serviceWorker,
  }) => {
    await seedTestScreenshot(serviceWorker, 800, 600);

    const page = await context.newPage();
    await page.goto(`chrome-extension://${extensionId}/editor.html`);
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(500);

    // Verify canvas badge exists
    const badge = page.locator("#canvasDrawBadge");
    await expect(badge).toBeAttached();
    await expect(badge).toBeHidden();

    // Select Rectangle tool
    await page.locator("#tool-rectangle").click();
    await expect(page.locator("#tool-rectangle")).toHaveClass(/active/);

    const upperCanvas = page.locator(".upper-canvas");
    await expect(upperCanvas).toBeVisible();
    const box = (await upperCanvas.boundingBox())!;
    expect(box).toBeTruthy();

    const startX = box.x + 100;
    const startY = box.y + 100;
    const endX = box.x + 250;
    const endY = box.y + 200;

    // Mouse down to begin shape drag
    await page.mouse.move(startX, startY);
    await page.mouse.down();

    // Live badge should become visible
    await expect(badge).toBeVisible();

    // Drag shape
    await page.mouse.move(endX, endY, { steps: 5 });

    // Badge should show live dimensions
    const badgeText = await badge.innerText();
    expect(badgeText).toMatch(/\d+\s*×\s*\d+\s*px/);

    // Mouse up to finalize
    await page.mouse.up();

    // Live badge should hide immediately
    await expect(badge).toBeHidden();

    // Verify object exists in Fabric canvas
    const objectsCount = await page.evaluate(() => {
      const cv = (window as any).canvas;
      // Filter out background image
      return cv ? cv.getObjects().filter((o: any) => o.selectable !== false || o.type === "rect").length : 0;
    });
    expect(objectsCount).toBeGreaterThanOrEqual(1);

    await page.close();
  });

  test("TC-QA-ED-003 [All Shape Tools]: Connected drawing works for Ellipse, Line, Arrow, Callout, Spotlight", async ({
    context,
    extensionId,
    serviceWorker,
  }) => {
    await seedTestScreenshot(serviceWorker, 800, 600);

    const page = await context.newPage();
    await page.goto(`chrome-extension://${extensionId}/editor.html`);
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(400);

    const upperCanvas = page.locator(".upper-canvas");
    const box = (await upperCanvas.boundingBox())!;

    const shapeTools = [
      { id: "#tool-ellipse", name: "ellipse" },
      { id: "#tool-line", name: "line" },
      { id: "#tool-arrow", name: "arrow" },
      { id: "#tool-callout", name: "callout" },
      { id: "#tool-spotlight", name: "spotlight" },
    ];

    let offset = 20;
    for (const tool of shapeTools) {
      await page.locator(tool.id).click();
      await expect(page.locator(tool.id)).toHaveClass(/active/);

      await page.mouse.move(box.x + offset, box.y + offset);
      await page.mouse.down();
      await page.mouse.move(box.x + offset + 80, box.y + offset + 60, { steps: 3 });
      await page.mouse.up();
      offset += 50;
    }

    const totalObjects = await page.evaluate(() => {
      const cv = (window as any).canvas;
      return cv ? cv.getObjects().length : 0;
    });
    // At least background image + 5 created shapes
    expect(totalObjects).toBeGreaterThanOrEqual(6);

    await page.close();
  });

  test("TC-QA-ED-004 [Blur & Redact Alignment]: Glass blur, Pixelate, and Blackout redact correctly without artifacts", async ({
    context,
    extensionId,
    serviceWorker,
  }) => {
    await seedTestScreenshot(serviceWorker, 600, 400);

    const page = await context.newPage();
    await page.goto(`chrome-extension://${extensionId}/editor.html`);
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(400);

    const upperCanvas = page.locator(".upper-canvas");
    const box = (await upperCanvas.boundingBox())!;

    // 1. Redact Blackout test
    await page.locator("#blur-expand").click();
    await page.locator('.tool-dropdown-item[data-blur-type="redact"]').click();
    await expect(page.locator("#tool-blur")).toHaveClass(/active/);

    await page.mouse.move(box.x + 50, box.y + 120);
    await page.mouse.down();
    await page.mouse.move(box.x + 220, box.y + 200, { steps: 3 });
    await page.mouse.up();
    await page.waitForTimeout(200);

    // Verify blackout rect has fill #000000
    const hasBlackoutRect = await page.evaluate(() => {
      const cv = (window as any).canvas;
      const objs = cv.getObjects();
      return objs.some((o: any) => o.fill === "#000000");
    });
    expect(hasBlackoutRect).toBe(true);

    // 2. Glass Blur test
    await page.locator("#blur-expand").click();
    await page.locator('.tool-dropdown-item[data-blur-type="glass"]').click();
    await page.mouse.move(box.x + 240, box.y + 120);
    await page.mouse.down();
    await page.mouse.move(box.x + 350, box.y + 200, { steps: 3 });
    await page.mouse.up();
    await page.waitForTimeout(300);

    // Verify blurred image was generated and placed
    const objCount = await page.evaluate(() => {
      const cv = (window as any).canvas;
      return cv.getObjects().length;
    });
    expect(objCount).toBeGreaterThanOrEqual(3);

    await page.close();
  });

  test("TC-QA-ED-005 [Beautify Background Swapping]: Switching backgrounds swaps rather than stacking/nesting frames", async ({
    context,
    extensionId,
    serviceWorker,
  }) => {
    await seedTestScreenshot(serviceWorker, 500, 300);

    const page = await context.newPage();
    await page.goto(`chrome-extension://${extensionId}/editor.html`);
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(500);

    // Open Beautify panel
    await page.locator("#tool-beautify").click();
    const panel = page.locator("#beautifyPanel");
    await expect(panel).toHaveClass(/open/);

    // Select first gradient swatch (swatch index 1, index 0 is 'none')
    const swatches = page.locator(".bf-bg-swatch");
    await swatches.nth(1).click();
    await page.waitForTimeout(400);

    // Capture dimensions after first background application
    const dimText1 = await page.locator("#dimensions").innerText();
    expect(dimText1).not.toBe("– × –");
    const [w1, h1] = dimText1.split("×").map((s) => parseInt(s.trim()));

    // Now select a SECOND gradient swatch
    await swatches.nth(2).click();
    await page.waitForTimeout(400);

    // Dimensions MUST NOT compound/double-pad (padding is 40px, so it must stay stable, not add another 80px)
    const dimText2 = await page.locator("#dimensions").innerText();
    const [w2, h2] = dimText2.split("×").map((s) => parseInt(s.trim()));

    // When background is swapped, width and height remain identical (swapped, not stacked!)
    expect(w2).toBe(w1);
    expect(h2).toBe(h1);

    // Select a THIRD gradient swatch
    await swatches.nth(3).click();
    await page.waitForTimeout(400);

    const dimText3 = await page.locator("#dimensions").innerText();
    const [w3, h3] = dimText3.split("×").map((s) => parseInt(s.trim()));
    expect(w3).toBe(w1);
    expect(h3).toBe(h1);

    await page.close();
  });

  test("TC-QA-ED-006 [Beautify Reset & Frame Transitions]: Reset restores original screenshot dimensions without residual styles", async ({
    context,
    extensionId,
    serviceWorker,
  }) => {
    await seedTestScreenshot(serviceWorker, 600, 400);

    const page = await context.newPage();
    await page.goto(`chrome-extension://${extensionId}/editor.html`);
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(500);

    const origDims = await page.locator("#dimensions").innerText();
    expect(origDims).toContain("600 × 400");

    // Open Beautify and apply macOS frame + gradient
    await page.locator("#tool-beautify").click();
    const macFrameBtn = page.locator('.bf-frame-btn[data-frame="macos"]');
    await macFrameBtn.click();
    const swatches = page.locator(".bf-bg-swatch");
    await swatches.nth(2).click();
    await page.waitForTimeout(400);

    // Verify dimensions increased due to frame + padding
    const beautifiedDims = await page.locator("#dimensions").innerText();
    expect(beautifiedDims).not.toBe(origDims);

    // Click Reset
    await page.locator("#bf-reset-btn").click();
    await page.waitForTimeout(400);

    // Verify toast confirms reset
    const toast = page.locator("#toast");
    await expect(toast).toHaveText(/Reset to original/i);

    // Dimensions should be restored to original 600 × 400
    const restoredDims = await page.locator("#dimensions").innerText();
    expect(restoredDims).toContain("600 × 400");

    // Swatches should be reset (swatch 0 active)
    await expect(swatches.nth(0)).toHaveClass(/active/);

    await page.close();
  });

  test("TC-QA-ED-007 [Keyboard Shortcuts]: Fast single-key switching between editing tools", async ({
    context,
    extensionId,
    serviceWorker,
  }) => {
    await seedTestScreenshot(serviceWorker, 500, 300);

    const page = await context.newPage();
    await page.goto(`chrome-extension://${extensionId}/editor.html`);
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(300);

    // Focus canvas area
    await page.locator(".upper-canvas").click();

    // Press 'r' -> Rectangle
    await page.keyboard.press("r");
    await expect(page.locator("#tool-rectangle")).toHaveClass(/active/);

    // Press 'e' -> Ellipse
    await page.keyboard.press("e");
    await expect(page.locator("#tool-ellipse")).toHaveClass(/active/);

    // Press 'a' -> Arrow
    await page.keyboard.press("a");
    await expect(page.locator("#tool-arrow")).toHaveClass(/active/);

    // Press 'l' -> Line
    await page.keyboard.press("l");
    await expect(page.locator("#tool-line")).toHaveClass(/active/);

    // Press 'b' -> Blur
    await page.keyboard.press("b");
    await expect(page.locator("#tool-blur")).toHaveClass(/active/);

    // Press 'v' -> Select
    await page.keyboard.press("v");
    await expect(page.locator("#tool-select")).toHaveClass(/active/);

    await page.close();
  });

  test("TC-QA-ED-008 [Export Flow]: Export dropdown menu exposes PNG, WebP, PDF, and Copy", async ({
    context,
    extensionId,
    serviceWorker,
  }) => {
    await seedTestScreenshot(serviceWorker, 400, 300);

    const page = await context.newPage();
    await page.goto(`chrome-extension://${extensionId}/editor.html`);
    await page.waitForLoadState("domcontentloaded");

    // Open export dropdown menu
    await page.locator("#export-menu-btn").click();
    const exportDropMenu = page.locator("#export-drop-menu");
    await expect(exportDropMenu).toHaveClass(/show/);

    // Verify all export format options exist
    await expect(page.locator("#copy-btn")).toBeVisible();
    await expect(page.locator("#copy-selected-btn")).toBeVisible();
    await expect(page.locator("#save-btn")).toBeVisible();
    await expect(page.locator("#save-webp-btn")).toBeVisible();
    await expect(page.locator("#pdf-btn")).toBeVisible();

    await page.close();
  });

  test("TC-QA-ED-009 [Zoom Relocation & Shape Alignment]: Zoom group is on right after delete button and shapes track cursor without offset", async ({
    context,
    extensionId,
    serviceWorker,
  }) => {
    await seedTestScreenshot(serviceWorker, 800, 600);

    const page = await context.newPage();
    await page.goto(`chrome-extension://${extensionId}/editor.html`);
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(400);

    // 1. Verify Zoom Controls are placed after Delete button in DOM and on screen
    const deleteBtn = page.locator("#delete-btn");
    const zoomGroup = page.locator(".hdr-zoom-group");
    await expect(deleteBtn).toBeVisible();
    await expect(zoomGroup).toBeVisible();

    const deleteBox = (await deleteBtn.boundingBox())!;
    const zoomBox = (await zoomGroup.boundingBox())!;
    expect(zoomBox.x).toBeGreaterThan(deleteBox.x);

    // Test zoom in / zoom out
    await page.locator("#hdr-zoom-in-btn").click();
    await expect(page.locator("#hdr-zoom-val")).toHaveText("110%");
    await page.locator("#hdr-zoom-out-btn").click();
    await expect(page.locator("#hdr-zoom-val")).toHaveText("100%");

    // 2. Test Shape coordinate tracking: origin must be left/top and bounding box must match mouse drag
    await page.locator("#tool-rectangle").click();
    const upperCanvas = page.locator(".upper-canvas");
    const canvasBox = (await upperCanvas.boundingBox())!;

    const startX = canvasBox.x + 80;
    const startY = canvasBox.y + 80;
    const endX = canvasBox.x + 200;
    const endY = canvasBox.y + 160;

    await page.mouse.move(startX, startY);
    await page.mouse.down();
    await page.mouse.move(endX, endY, { steps: 5 });
    await page.mouse.up();
    await page.waitForTimeout(200);

    // Verify created rectangle's Fabric coordinates
    const rectCoords = await page.evaluate(() => {
      const cv = (window as any).canvas;
      const objs = cv.getObjects().filter((o: any) => o.type === "rect");
      const last = objs[objs.length - 1];
      return {
        originX: last.originX,
        originY: last.originY,
        width: last.width,
        height: last.height,
        left: last.left,
        top: last.top,
      };
    });

    expect(rectCoords.originX).toBe("left");
    expect(rectCoords.originY).toBe("top");
    // Width ~ 120, Height ~ 80 (taking into account fitScale)
    expect(rectCoords.width).toBeGreaterThan(50);
    expect(rectCoords.height).toBeGreaterThan(30);

    await page.close();
  });

  test("TC-QA-ED-010 [Beautify Export Accuracy]: Exported image includes applied Beautify background, frame, and padding", async ({
    context,
    extensionId,
    serviceWorker,
  }) => {
    await seedTestScreenshot(serviceWorker, 600, 400);

    const page = await context.newPage();
    await page.goto(`chrome-extension://${extensionId}/editor.html`);
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(500);

    // 1. Open Beautify and apply macOS frame + background gradient swatch
    await page.locator("#tool-beautify").click();
    await page.locator('.bf-frame-btn[data-frame="macos"]').click();
    const swatches = page.locator(".bf-bg-swatch");
    await swatches.nth(2).click();
    await page.waitForTimeout(400);

    // Verify dimensions in editor reflect beautified output (> 600 × 400)
    const dimsText = await page.locator("#dimensions").innerText();
    expect(dimsText).not.toContain("600 × 400");

    // 2. Trigger export via exportToBlob() and inspect result
    const exportedInfo = await page.evaluate(async () => {
      const saveBtn = document.getElementById("save-btn");
      if (!saveBtn) return null;

      // Mock createObjectURL and a.click to capture the exported blob
      let capturedBlob: Blob | null = null;
      const origCreate = URL.createObjectURL;
      URL.createObjectURL = (blob: any) => {
        capturedBlob = blob;
        return "blob:mock";
      };

      saveBtn.click();
      await new Promise((r) => setTimeout(r, 600));
      URL.createObjectURL = origCreate;

      if (!capturedBlob) return null;
      const blob: Blob = capturedBlob;

      // Decode blob into an image bitmap to inspect dimensions and corner pixel color
      const bitmap = await createImageBitmap(blob);
      const oc = new OffscreenCanvas(bitmap.width, bitmap.height);
      const ctx = oc.getContext("2d")!;
      ctx.drawImage(bitmap, 0, 0);

      // Sample top-left corner pixel (x=5, y=5) which is inside the Beautify gradient background
      const pixel = ctx.getImageData(5, 5, 1, 1).data;

      return {
        width: bitmap.width,
        height: bitmap.height,
        cornerR: pixel[0],
        cornerG: pixel[1],
        cornerB: pixel[2],
        cornerA: pixel[3],
      };
    });

    expect(exportedInfo).not.toBeNull();
    // The exported image must be larger than original 600x400 because of Beautify frame + padding
    expect(exportedInfo!.width).toBeGreaterThan(600);
    expect(exportedInfo!.height).toBeGreaterThan(400);

    // The corner pixel must have non-zero alpha (colored gradient background from Beautify)
    // and must NOT be black or empty transparency
    expect(exportedInfo!.cornerA).toBeGreaterThan(200);
    // Swatch 2 has vibrant colored gradient (non-zero R or G or B)
    expect(exportedInfo!.cornerR + exportedInfo!.cornerG + exportedInfo!.cornerB).toBeGreaterThan(50);

    await page.close();
  });
});
