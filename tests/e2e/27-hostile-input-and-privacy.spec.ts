import { test, expect } from "../fixtures/extension";

// Security and privacy regression checks that need the real extension loaded.

async function seedCapture(serviceWorker: any) {
  await serviceWorker.evaluate(async () => {
    const c = new OffscreenCanvas(400, 300);
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = "#10b981"; ctx.fillRect(0, 0, 400, 300);
    const blob = await c.convertToBlob();
    const reader = new FileReader();
    const dataUrl = await new Promise<string>((res) => { reader.onload = () => res(reader.result as string); reader.readAsDataURL(blob); });
    await chrome.storage.session.set({ lastCaptureDataUrl: dataUrl });
  });
}

async function openEditor(context: any, extensionId: string, serviceWorker: any) {
  await seedCapture(serviceWorker);
  const page = await context.newPage();
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`chrome-extension://${extensionId}/editor.html`);
  await page.waitForSelector("#editorCanvas", { state: "visible" });
  await page.waitForTimeout(600);
  return page;
}

/** Drags inside the capture, wherever it sits in the window. Offsets are fractions of the canvas. */
async function drag(page: any, from: [number, number], to: [number, number]) {
  const box = await page.locator("#editorCanvas").locator("xpath=ancestor::*[contains(@class,'canvas-container')][1]").boundingBox()
    ?? await page.locator("#editorCanvas").boundingBox();
  const at = ([fx, fy]: [number, number]): [number, number] => [box!.x + box!.width * fx, box!.y + box!.height * fy];
  from = at(from); to = at(to);
  await page.mouse.move(...from);
  await page.mouse.down();
  await page.mouse.move(...to, { steps: 8 });
  await page.mouse.up();
  await page.waitForTimeout(200);
}

test.describe("27 - Hostile input and privacy", () => {
  test("TC-SEC-001: extension pages cannot fetch from, or load images from, the internet", async ({ context, extensionId, serviceWorker }) => {
    const page = await openEditor(context, extensionId, serviceWorker);
    const requests: string[] = [];
    page.on("requestfinished", (r: any) => { if (r.url().startsWith("http://localhost:8085")) requests.push(r.url()); });
    const result = await page.evaluate(async () => {
      const fetchBlocked = await fetch("http://localhost:8085/test-page-long.html").then(() => false, () => true);
      const imgBlocked = await new Promise<boolean>((resolve) => {
        const img = new Image();
        img.onload = () => resolve(false);
        img.onerror = () => resolve(true);
        img.src = "http://localhost:8085/favicon.ico?probe=" + Date.now();
        setTimeout(() => resolve(true), 3000);
      });
      const scriptBlocked = await new Promise<boolean>((resolve) => {
        const s = document.createElement("script");
        s.src = "http://localhost:8085/test-page-long.html";
        s.onload = () => resolve(false);
        s.onerror = () => resolve(true);
        document.head.appendChild(s);
        setTimeout(() => resolve(true), 3000);
      });
      return { fetchBlocked, imgBlocked, scriptBlocked };
    });
    expect(result).toEqual({ fetchBlocked: true, imgBlocked: true, scriptBlocked: true });
    expect(requests, "no request should leave the extension page").toEqual([]);
  });

  test("TC-SEC-002: a website cannot read extension files except the font and the shutter sound", async ({ context, extensionId }) => {
    const page = await context.newPage();
    await page.goto("http://localhost:8085/test-page-long.html");
    const reachable = await page.evaluate(async (id: string) => {
      const out: Record<string, boolean> = {};
      for (const f of ["manifest.json", "editor.html", "background.js", "assets/inter-latin-wght-normal.woff2"]) {
        out[f] = await fetch(`chrome-extension://${id}/${f}`).then((r) => r.ok, () => false);
      }
      return out;
    }, extensionId);
    expect(reachable["manifest.json"]).toBe(false);
    expect(reachable["editor.html"]).toBe(false);
    expect(reachable["background.js"]).toBe(false);
  });

  test("TC-SEC-003: the on-page result card ignores a payload that is not a raster image data URL", async ({ context, extensionId, serviceWorker }) => {
    const page = await context.newPage();
    await page.goto("http://localhost:8085/test-page-long.html");
    await page.waitForLoadState("networkidle");
    await page.bringToFront();
    const send = (dataUrl: string) => serviceWorker.evaluate(async ({ url, dataUrl }: any) => {
      const [tab] = await chrome.tabs.query({ url });
      return chrome.tabs.sendMessage(tab.id!, { type: "SHOW_RESULT_CARD", payload: { dataUrl, width: 10, height: 10, method: "Native" } }).then(() => "answered", () => "ignored");
    }, { url: "http://localhost:8085/test-page-long.html", dataUrl });

    for (const bad of ['data:image/svg+xml;base64,PHN2Zy8+', 'data:image/png;base64,AAAA" onerror="window.__pwned=1', "javascript:window.__pwned=1"]) {
      await send(bad);
    }
    await page.waitForTimeout(400);
    expect(await page.locator("#gofully-result-card-host").count()).toBe(0);
    expect(await page.evaluate(() => (window as any).__pwned)).toBeUndefined();
  });

  test("TC-SEC-004: a remembered 'save without annotations' never drops a blur", async ({ context, extensionId, serviceWorker }) => {
    const page = await openEditor(context, extensionId, serviceWorker);
    await page.evaluate(() => localStorage.setItem("gf-editor-annot-choice", "without"));
    await page.locator("#tool-blur").click();
    await drag(page, [0.2, 0.2], [0.6, 0.6]);
    await page.locator("#export-menu-btn").click();
    await page.locator("#save-btn").click();
    await expect(page.locator("#annotDialog"), "the dialog must still appear for a blur").toBeVisible();
    await expect(page.locator("#annotDialogWarn")).toBeVisible();
    await page.locator("#annotDialogInclude").click();
  });

  test("TC-SEC-005: a mark added after answering the dialog asks again", async ({ context, extensionId, serviceWorker }) => {
    const page = await openEditor(context, extensionId, serviceWorker);
    await page.locator("#tool-shape").click();
    await drag(page, [0.1, 0.1], [0.4, 0.4]);
    await page.locator("#export-menu-btn").click();
    await page.locator("#save-btn").click();
    await expect(page.locator("#annotDialog")).toBeVisible();
    await page.locator("#annotDialog button[value=without]").click();
    await page.waitForTimeout(500);

    await page.locator("#tool-blur").click();
    await drag(page, [0.5, 0.5], [0.9, 0.9]);
    await page.locator("#export-menu-btn").click();
    await page.locator("#save-btn").click();
    await expect(page.locator("#annotDialog"), "a new blur is a new question").toBeVisible();
    await expect(page.locator("#annotDialogWarn")).toBeVisible();
  });
});
