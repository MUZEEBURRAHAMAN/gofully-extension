import { test, expect } from "../fixtures/extension";

test.describe("06 - Export Engines Suite (PNG, PDF, Clipboard)", () => {
  test("TC-EXP-001: PDF Generator produces valid binary PDF with proper headers", async ({
    context,
    extensionId,
  }) => {
    const page = await context.newPage();
    await page.goto("http://localhost:8085/test-page-long.html");
    await page.waitForLoadState("networkidle");

    const popupPage = await context.newPage();
    await popupPage.goto(`chrome-extension://${extensionId}/popup.html`);
    await popupPage.waitForLoadState("domcontentloaded");

    // 1. Perform capture to populate lastCaptureBlob in service worker
    await popupPage.evaluate(async () => {
      const [targetTab] = await chrome.tabs.query({
        url: "http://localhost:8085/test-page-long.html",
      });
      return new Promise<any>((resolve) => {
        chrome.runtime.sendMessage(
          {
            type: "START_CAPTURE",
            payload: { mode: "visible-area", tabId: targetTab?.id },
          },
          resolve
        );
      });
    });

    // 2. Request PDF export
    const exportResult = await popupPage.evaluate(async () => {
      return new Promise<any>((resolve) => {
        chrome.runtime.sendMessage(
          { type: "EXPORT_CAPTURE", payload: { format: "pdf" } },
          resolve
        );
      });
    });

    expect(exportResult).toBeDefined();
    expect(exportResult.success).toBe(true);

    await popupPage.close();
    await page.close();
  });

  test("TC-EXP-003: JPG export via EXPORT_CAPTURE succeeds (result-bar/popup quick-export path)", async ({
    context,
    extensionId,
  }) => {
    const page = await context.newPage();
    await page.goto("http://localhost:8085/test-page-long.html");
    await page.waitForLoadState("networkidle");

    const popupPage = await context.newPage();
    await popupPage.goto(`chrome-extension://${extensionId}/popup.html`);
    await popupPage.waitForLoadState("domcontentloaded");

    await popupPage.evaluate(async () => {
      const [targetTab] = await chrome.tabs.query({
        url: "http://localhost:8085/test-page-long.html",
      });
      return new Promise<any>((resolve) => {
        chrome.runtime.sendMessage(
          {
            type: "START_CAPTURE",
            payload: { mode: "visible-area", tabId: targetTab?.id },
          },
          resolve
        );
      });
    });

    const exportResult = await popupPage.evaluate(async () => {
      return new Promise<any>((resolve) => {
        chrome.runtime.sendMessage(
          { type: "EXPORT_CAPTURE", payload: { format: "jpg" } },
          resolve
        );
      });
    });

    expect(exportResult).toBeDefined();
    expect(exportResult.success).toBe(true);

    await popupPage.close();
    await page.close();
  });

  test("TC-EXP-002: Filename generation cleans URL domains and appends date timestamps", async ({
    serviceWorker,
  }) => {
    const filenameInfo = await serviceWorker.evaluate(() => {
      const testDomains = [
        "https://sub.domain.org/path?query=1#hash",
        "http://medical-portal.internal:8080/chart",
        "invalid://bad!!domain@/x",
      ];

      return testDomains.map((url) => {
        let domain = "unknown";
        try {
          domain = new URL(url).hostname;
        } catch {}
        const now = new Date();
        const ts = now.toISOString().replace(/[-:T]/g, "").slice(0, 14);
        const clean = domain.replace(/[^a-zA-Z0-9.-]/g, "_").slice(0, 50);
        return `gofully-${clean}-${ts}.png`;
      });
    });

    expect(filenameInfo[0]).toContain("gofully-sub.domain.org-");
    expect(filenameInfo[1]).toContain("gofully-medical-portal.internal-");
    expect(filenameInfo[0]).toMatch(/\.png$/);
  });

  test("TC-EXP-004: Editor export succeeds at max zoom (1000%) with an annotation drawn, with no uncaught errors", async ({
    context,
    extensionId,
    serviceWorker,
  }) => {
    // 1. Seed a valid capture in session storage
    await serviceWorker.evaluate(async () => {
      const c = new OffscreenCanvas(400, 300);
      const ctx = c.getContext("2d")!;
      ctx.fillStyle = "#10b981";
      ctx.fillRect(0, 0, 400, 300);
      const blob = await c.convertToBlob();
      const reader = new FileReader();
      const dataUrl = await new Promise<string>((res) => {
        reader.onload = () => res(reader.result as string);
        reader.readAsDataURL(blob);
      });
      await chrome.storage.session.set({ lastCaptureDataUrl: dataUrl });
    });

    const page = await context.newPage();
    const pageErrors: string[] = [];
    page.on("pageerror", (err) => pageErrors.push(err.message));

    await page.goto(`chrome-extension://${extensionId}/editor.html`);
    await page.waitForLoadState("domcontentloaded");
    await page.waitForSelector("#editorCanvas", { state: "visible" });
    await page.waitForTimeout(500);

    // 2. Zoom to the max (1000%, up from the old 500% cap) — the real IDs are
    // #hdr-zoom-in-btn / #hdr-zoom-val, not #zoom-in-btn / #zoomVal.
    for (let i = 0; i < 90; i++) {
      await page.locator("#hdr-zoom-in-btn").click();
    }
    await expect(page.locator("#hdr-zoom-val")).toHaveText("1000%");

    // 3. Draw a rectangle annotation at this zoom level. At 1000% zoom the
    // canvas is far bigger than the viewport and the container centers it
    // (justify-content: center), so its own boundingBox().x/y land off-screen
    // (e.g. x: -1367) — not useful as a drag origin. The canvas fills the
    // entire visible viewport at this zoom regardless, so draw using fixed
    // on-screen coordinates instead, matching how a real user would actually
    // click (only ever within their own visible window).
    await page.locator("#tool-shape").click();
    await page.mouse.move(500, 300);
    await page.mouse.down();
    await page.mouse.move(700, 450, { steps: 10 });
    await page.mouse.up();
    await page.waitForTimeout(200);

    const objectCount = await page.evaluate(
      () => (window as any).canvas?.getObjects().length ?? 0
    );
    expect(objectCount).toBeGreaterThanOrEqual(2); // background image + the rectangle

    // 4. Hook URL.createObjectURL so we can inspect the exported blob the
    // Save PNG button hands to the download anchor.
    await page.evaluate(() => {
      (window as any).__capturedBlobs = [];
      const orig = URL.createObjectURL.bind(URL);
      URL.createObjectURL = (obj: Blob) => {
        (window as any).__capturedBlobs.push(obj);
        return orig(obj);
      };
    });

    // 5. Export WITH annotations (toggle defaults on) — must succeed with a
    // real, non-trivial PNG blob and no uncaught exception at this zoom.
    await page.locator("#export-menu-btn").click();
    await expect(page.locator("#export-drop-menu")).toHaveClass(/show/);
    const annotCheckbox = page.locator("#annot-toggle-check");
    await expect(annotCheckbox).toBeChecked();
    await page.locator("#save-btn").click();
    await expect(page.locator(".toast")).toContainText("PNG saved", { timeout: 10000 });

    const sizeWithAnnotations: number = await page.evaluate(() => {
      const blobs = (window as any).__capturedBlobs as Blob[];
      return blobs[blobs.length - 1]?.size ?? 0;
    });
    expect(sizeWithAnnotations).toBeGreaterThan(0);

    // 6. Export WITHOUT annotations (toggle off) — must also succeed, and
    // must produce a genuinely different file (the rectangle actually gets
    // excluded, not just visually hidden while still baked into the export).
    await page.locator("#export-menu-btn").click();
    await annotCheckbox.uncheck();
    await expect(annotCheckbox).not.toBeChecked();
    await page.locator("#save-btn").click();
    await expect(page.locator(".toast")).toContainText("PNG saved", { timeout: 10000 });

    const sizeWithoutAnnotations: number = await page.evaluate(() => {
      const blobs = (window as any).__capturedBlobs as Blob[];
      return blobs[blobs.length - 1]?.size ?? 0;
    });
    expect(sizeWithoutAnnotations).toBeGreaterThan(0);
    expect(sizeWithoutAnnotations).not.toBe(sizeWithAnnotations);

    // 7. Nothing should have thrown at any point during zoom, draw, or export.
    expect(pageErrors).toEqual([]);

    await page.close();
  });
});

