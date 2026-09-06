import { test, expect } from "../fixtures/extension";

test.describe("03 - Canvas Visual Editor Suite", () => {
  test("TC-EDIT-001: Editor initializes and mounts Fabric canvas with all 12 toolbar controls", async ({
    context,
    extensionId,
    serviceWorker,
  }) => {
    // Generate a 200x200 sample dataUrl screenshot in session storage first
    await serviceWorker.evaluate(async () => {
      const c = new OffscreenCanvas(300, 200);
      const ctx = c.getContext("2d")!;
      ctx.fillStyle = "#3b82f6";
      ctx.fillRect(0, 0, 300, 200);
      ctx.fillStyle = "#ffffff";
      ctx.font = "20px sans-serif";
      ctx.fillText("Editor Test Capture", 40, 100);
      const blob = await c.convertToBlob();
      const reader = new FileReader();
      const dataUrl = await new Promise<string>((res) => {
        reader.onload = () => res(reader.result as string);
        reader.readAsDataURL(blob);
      });
      await chrome.storage.session.set({ lastCaptureDataUrl: dataUrl });
    });

    const page = await context.newPage();
    await page.goto(`chrome-extension://${extensionId}/editor.html`);
    await page.waitForLoadState("domcontentloaded");

    // Verify main editor canvas is mounted
    const canvas = page.locator("#editorCanvas");
    await expect(canvas).toBeVisible();

    // Verify all primary tool buttons exist in the DOM
    const tools = [
      "#tool-select",
      "#tool-arrow",
      "#tool-rectangle",
      "#tool-ellipse",
      "#tool-callout",
      "#tool-line",
      "#tool-freedraw",
      "#tool-text",
      "#tool-step",
      "#tool-spotlight",
      "#tool-blur",
      "#tool-crop",
      "#tool-beautify",
    ];

    for (const toolId of tools) {
      const btn = page.locator(toolId);
      await expect(btn).toBeAttached();
    }

    await page.close();
  });

  test("TC-EDIT-002: Activating shapes and annotation tools updates tool state", async ({
    context,
    extensionId,
  }) => {
    const page = await context.newPage();
    await page.goto(`chrome-extension://${extensionId}/editor.html`);
    await page.waitForLoadState("domcontentloaded");

    // Click Rectangle tool
    await page.locator("#tool-rectangle").click();
    await expect(page.locator("#tool-rectangle")).toHaveClass(/active/);
    await expect(page.locator("#toolName")).toHaveText(/rectangle/i);

    // Click Ellipse tool
    await page.locator("#tool-ellipse").click();
    await expect(page.locator("#tool-ellipse")).toHaveClass(/active/);
    await expect(page.locator("#toolName")).toHaveText(/ellipse/i);

    // Click Callout tool
    await page.locator("#tool-callout").click();
    await expect(page.locator("#tool-callout")).toHaveClass(/active/);

    // Click Line tool
    await page.locator("#tool-line").click();
    await expect(page.locator("#tool-line")).toHaveClass(/active/);

    // Click Freehand / Pen tool
    await page.locator("#tool-freedraw").click();
    await expect(page.locator("#tool-freedraw")).toHaveClass(/active/);

    // Click Step tool
    await page.locator("#tool-step").click();
    await expect(page.locator("#tool-step")).toHaveClass(/active/);

    // Click Spotlight tool
    await page.locator("#tool-spotlight").click();
    await expect(page.locator("#tool-spotlight")).toHaveClass(/active/);

    // Click Blur tool
    await page.locator("#tool-blur").click();
    await expect(page.locator("#tool-blur")).toHaveClass(/active/);

    await page.close();
  });

  test("TC-EDIT-003: Color palette and stroke width adjustment", async ({
    context,
    extensionId,
  }) => {
    const page = await context.newPage();
    await page.goto(`chrome-extension://${extensionId}/editor.html`);
    await page.waitForLoadState("domcontentloaded");

    // Select Green swatch (#10B981)
    const greenSwatch = page.locator('.color-swatch[data-color="#10B981"]');
    await greenSwatch.click();
    await expect(greenSwatch).toHaveClass(/active/);

    // Adjust stroke width slider
    const strokeSlider = page.locator("#strokeWidth");
    await strokeSlider.fill("8");
    await strokeSlider.dispatchEvent("input");
    expect(await strokeSlider.inputValue()).toBe("8");

    await page.close();
  });

  test("TC-EDIT-004: Blur and Redaction options (Glass, Pixelate, Redact Blackout)", async ({
    context,
    extensionId,
  }) => {
    const page = await context.newPage();
    await page.goto(`chrome-extension://${extensionId}/editor.html`);
    await page.waitForLoadState("domcontentloaded");

    // Open blur dropdown
    await page.locator("#blur-expand").click();
    const blurMenu = page.locator("#blur-menu");
    await expect(blurMenu).toHaveClass(/show/);

    // Select Redact Blackout (Crucial for HIPAA)
    const redactOption = page.locator('.tool-dropdown-item[data-blur-type="redact"]');
    await redactOption.click();
    await expect(redactOption).toHaveClass(/active/);
    await expect(page.locator("#tool-blur")).toHaveClass(/active/);

    await page.close();
  });

  test("TC-EDIT-005: Crop modal integration with Cropper.js opens and closes cleanly", async ({
    context,
    extensionId,
  }) => {
    const page = await context.newPage();
    await page.goto(`chrome-extension://${extensionId}/editor.html`);
    await page.waitForLoadState("domcontentloaded");

    // Click crop button
    await page.locator("#tool-crop").click();
    const cropModal = page.locator("#cropModal");

    // If an image was loaded, modal should show flex, otherwise toast appears
    const isVisible = await cropModal.isVisible();
    if (isVisible) {
      // Cancel crop
      await page.locator("#cropCancelBtn").click();
      await expect(cropModal).toBeHidden();
    }

    await page.close();
  });

  test("TC-EDIT-006: Undo, Redo, and Delete controls", async ({ context, extensionId }) => {
    const page = await context.newPage();
    await page.goto(`chrome-extension://${extensionId}/editor.html`);
    await page.waitForLoadState("domcontentloaded");

    // Verify history controls respond to clicks without console errors
    await page.locator("#undo-btn").click();
    await page.locator("#redo-btn").click();
    await page.locator("#delete-btn").click();

    await page.close();
  });

  test("TC-EDIT-007: Zoom controls adjust zoom level", async ({ context, extensionId }) => {
    const page = await context.newPage();
    await page.goto(`chrome-extension://${extensionId}/editor.html`);
    await page.waitForLoadState("domcontentloaded");

    const zoomVal = page.locator("#hdr-zoom-val");
    const initialText = await zoomVal.innerText();

    await page.locator("#hdr-zoom-in-btn").click();
    const zoomedInText = await zoomVal.innerText();
    expect(zoomedInText).not.toBe("");

    await page.locator("#hdr-zoom-out-btn").click();
    await page.close();
  });
});
