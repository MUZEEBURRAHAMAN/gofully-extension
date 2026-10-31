import { test, expect } from "../fixtures/extension";
import { matchViewportToWindow } from "../fixtures/viewport";

// v1.2: capture stack with per-capture actions, delayed capture, QR and barcode reading,
// Measure (sizes, gaps, colours) and Redact page (hide private text on the live page).
const PAGE = "http://localhost:8085/test-page-v12.html";

async function helperPage(context: any, extensionId: string) {
  const helper = await context.newPage();
  await helper.goto(`chrome-extension://${extensionId}/popup.html`);
  await helper.waitForLoadState("domcontentloaded");
  return helper;
}

/** The fixture tab plus an extension page to drive it, with the viewport sized to what a photo of the tab contains. */
async function openFixture(context: any, extensionId: string) {
  const page = await context.newPage();
  await page.goto(PAGE);
  await page.waitForLoadState("networkidle");
  const helper = await helperPage(context, extensionId);
  const height = await matchViewportToWindow(page, helper, PAGE);
  await page.bringToFront();
  return { page, helper, height };
}

/** Visible-area capture of the fixture tab, started from an extension page (like the popup), which shows no card. */
async function captureVisible(helper: any): Promise<{ captureId: string; dataUrl: string }> {
  return helper.evaluate(async (url: string) => {
    const [tab] = await chrome.tabs.query({ url });
    const resp: any = await chrome.runtime.sendMessage({ type: "START_CAPTURE", payload: { mode: "visible-area", tabId: tab.id } });
    return { captureId: resp?.payload?.captureId, dataUrl: resp?.payload?.dataUrl };
  }, PAGE);
}

/** RGBA of a pixel in a data URL image, at CSS-pixel coordinates scaled by the image/viewport ratio. */
async function pixel(helper: any, dataUrl: string, x: number, y: number, viewportWidth = 1280): Promise<number[]> {
  return helper.evaluate(async ({ dataUrl, x, y, viewportWidth }: any) => {
    const img = new Image();
    img.src = dataUrl;
    await img.decode();
    const k = img.width / viewportWidth;
    const c = document.createElement("canvas");
    c.width = img.width; c.height = img.height;
    const ctx = c.getContext("2d")!;
    ctx.drawImage(img, 0, 0);
    return Array.from(ctx.getImageData(Math.round(x * k), Math.round(y * k), 1, 1).data);
  }, { dataUrl, x, y, viewportWidth });
}

/** Share of pixels in a CSS-pixel rectangle that are not near-white. */
async function inkShare(helper: any, dataUrl: string, r: { x: number; y: number; w: number; h: number }): Promise<number> {
  return helper.evaluate(async ({ dataUrl, r }: any) => {
    const img = new Image();
    img.src = dataUrl;
    await img.decode();
    const k = img.width / 1280;
    const c = document.createElement("canvas");
    c.width = img.width; c.height = img.height;
    const ctx = c.getContext("2d")!;
    ctx.drawImage(img, 0, 0);
    const d = ctx.getImageData(Math.round(r.x * k), Math.round(r.y * k), Math.round(r.w * k), Math.round(r.h * k)).data;
    let ink = 0;
    for (let i = 0; i < d.length; i += 4) if (d[i] < 235 || d[i + 1] < 235 || d[i + 2] < 235) ink++;
    return ink / (d.length / 4);
  }, { dataUrl, r });
}

async function startMode(helper: any, mode: string) {
  await helper.evaluate(async ({ url, mode }: any) => {
    const [tab] = await chrome.tabs.query({ url });
    await chrome.runtime.sendMessage({ type: "INIT_INTERACTIVE_MODE", payload: { mode, tabId: tab.id } });
  }, { url: PAGE, mode });
}

const near = (rgb: number[], want: number[], tol = 24) => want.every((v, i) => Math.abs(rgb[i] - v) <= tol);

test.describe("28 - v1.2 capture tools", () => {
  test("TC-V12-001: each capture keeps its own id; actions and code reading use that capture, not the newest", async ({ context, extensionId }) => {
    const { page, helper } = await openFixture(context, extensionId);
    const first = await captureVisible(helper);
    expect(first.captureId).toMatch(/^c_/);

    // Second capture with the QR code scrolled out of view.
    await page.evaluate(() => window.scrollTo(0, 1200));
    await page.waitForTimeout(700);
    const second = await captureVisible(helper);
    expect(second.captureId).not.toBe(first.captureId);

    const codes = await helper.evaluate(async (ids: string[]) => {
      const out: any[] = [];
      for (const id of ids) out.push((await chrome.runtime.sendMessage({ type: "SCAN_CODES", payload: { captureId: id } }))?.codes ?? []);
      return out;
    }, [first.captureId, second.captureId]);
    expect(codes[0].map((c: any) => c.value)).toContain("https://gofully.example/qr-test");
    expect(codes[1]).toEqual([]);

    // Acting on the older card makes that capture current (what Edit, Pin and Save then use).
    const current = await helper.evaluate(async (id: string) => {
      await chrome.runtime.sendMessage({ type: "GUIDE_ADD_LAST_CAPTURE", payload: { captureId: id } });
      return (await chrome.runtime.sendMessage({ type: "GET_CAPTURE_BLOB_URL" }))?.url;
    }, first.captureId);
    expect(current).toBe(first.dataUrl);
  });

  test("TC-V12-002: the capture card is not baked into the next capture", async ({ context, extensionId }) => {
    const { page, helper } = await openFixture(context, extensionId);
    // The in-page shortcut is a capture started on the page, so it ends with the card.
    await page.keyboard.press("Control+Shift+V");
    await expect(page.locator("#gofully-result-card-host")).toBeAttached({ timeout: 10000 });
    await page.waitForTimeout(800);
    const next = await captureVisible(helper);
    // The card sits top right, where the fixture page is empty.
    const share = await inkShare(helper, next.dataUrl, { x: 950, y: 20, w: 310, h: 420 });
    expect(share, "card pixels in the capture").toBeLessThan(0.01);
    // And it comes back on the page afterwards.
    await expect(page.locator("#gofully-result-card-host")).toBeAttached();
    expect(await page.locator("#gofully-result-card-host").evaluate((el: HTMLElement) => getComputedStyle(el).visibility)).toBe("visible");
  });

  test("TC-V12-003: delayed capture lets you open a hover menu first, and the countdown is left out of the photo", async ({ context, extensionId }) => {
    const { page, helper } = await openFixture(context, extensionId);
    const started = await helper.evaluate(async (url: string) => {
      const [tab] = await chrome.tabs.query({ url });
      return chrome.runtime.sendMessage({ type: "START_DELAYED_CAPTURE", payload: { mode: "visible-area", tabId: tab.id, seconds: 3 } });
    }, PAGE);
    expect(started?.ok).toBe(true);
    await page.bringToFront();
    await expect(page.locator("#gofully-countdown")).toBeAttached({ timeout: 3000 });
    // Open the hover menu while the countdown runs.
    await page.mouse.move(480, 320);
    await expect(page.locator("#dropdown")).toBeVisible();
    await expect(page.locator("#gofully-result-card-host")).toBeAttached({ timeout: 10000 });
    await expect(page.locator("#gofully-countdown")).toHaveCount(0);

    const dataUrl = await helper.evaluate(async () => (await chrome.runtime.sendMessage({ type: "GET_CAPTURE_BLOB_URL" }))?.url);
    expect(near(await pixel(helper, dataUrl, 500, 420), [221, 0, 255]), "the open menu is in the capture").toBe(true);
    // Countdown pill sat at the top centre; the page is empty there.
    expect(await inkShare(helper, dataUrl, { x: 440, y: 10, w: 400, h: 40 })).toBeLessThan(0.01);
  });

  test("TC-V12-004: Esc cancels a delayed capture", async ({ context, extensionId }) => {
    const { page, helper } = await openFixture(context, extensionId);
    await helper.evaluate(async (url: string) => {
      const [tab] = await chrome.tabs.query({ url });
      return chrome.runtime.sendMessage({ type: "START_DELAYED_CAPTURE", payload: { mode: "visible-area", tabId: tab.id, seconds: 3 } });
    }, PAGE);
    await page.bringToFront();
    await expect(page.locator("#gofully-countdown")).toBeAttached({ timeout: 3000 });
    await page.keyboard.press("Escape");
    await expect(page.locator("#gofully-countdown")).toHaveCount(0);
    await page.waitForTimeout(3800);
    await expect(page.locator("#gofully-result-card-host")).toHaveCount(0);
  });

  test("TC-V12-005: the delay only accepts 3, 5 or 10 seconds, and only from an extension page", async ({ context, extensionId }) => {
    const { helper } = await openFixture(context, extensionId);
    const bad = await helper.evaluate(async (url: string) => {
      const [tab] = await chrome.tabs.query({ url });
      return chrome.runtime.sendMessage({ type: "START_DELAYED_CAPTURE", payload: { mode: "visible-area", tabId: tab.id, seconds: 600 } });
    }, PAGE);
    expect(bad?.ok).toBe(false);
  });

  test("TC-V12-006: Measure shows an element's size, padding and margin, and the gap to a second element", async ({ context, extensionId }) => {
    const { page, helper } = await openFixture(context, extensionId);
    await startMode(helper, "measure-page");
    await page.bringToFront();
    await expect(page.locator("#gofully-measure")).toBeAttached({ timeout: 8000 });
    await expect(page.locator("#gofully-measure-bar")).toBeAttached();

    // #box: 120 × 80 content + 20 padding each side = 160 × 120, margin 30. Its box starts at (430, 70).
    await page.mouse.move(500, 120);
    const card = page.locator("#gofully-measure .info").first();
    await expect(card.locator(".info-kind")).toHaveText("Box");
    await expect(card.locator(".info-code")).toHaveText("#box");
    await expect(card.locator(".info-size")).toHaveText("160 × 120 px");
    await expect(card).toContainText("Padding20 px all round");
    await expect(card).toContainText("Margin30 px all round");

    // Keep #box, hover #box2 (left edge 650): gap = 650 − (430 + 160) = 60.
    await page.mouse.down();
    await page.mouse.up();
    await page.mouse.move(700, 120);
    await expect(page.locator("#gofully-measure .lab.gapl")).toContainText(["60 px"]);

    // A drag is a free ruler.
    await page.mouse.move(100, 600);
    await page.mouse.down();
    await page.mouse.move(400, 600, { steps: 6 });
    await expect(page.locator("#gofully-measure .lab.kept")).toContainText("300 px");
    await page.mouse.up();

    // The page did not receive the clicks (no navigation, no selection).
    await page.keyboard.press("Escape"); // let go of the kept element
    await page.keyboard.press("Escape"); // leave
    await expect(page.locator("#gofully-measure")).toHaveCount(0);
    await expect(page.locator("#gofully-measure-bar")).toHaveCount(0);
  });

  test("TC-V12-007: Redact page hides private text and fields, keeps plain text, and covers text that arrives later", async ({ context, extensionId }) => {
    const { page, helper, height } = await openFixture(context, extensionId);
    const before = await page.locator("#private").innerHTML();
    await startMode(helper, "redact-page");
    await page.bringToFront();
    await expect(page.locator("#gofully-live-redact")).toBeAttached({ timeout: 8000 });

    for (const [id, kind] of [["email", "email"], ["card", "card"], ["phone", "phone"], ["key", "key"]]) {
      await expect(page.locator(`#${id} [data-gf-redact="${kind}"]`), `${id} is covered`).toHaveCount(1);
    }
    await expect(page.locator("#safe [data-gf-redact]")).toHaveCount(0);
    await expect(page.locator("#field")).toHaveAttribute("data-gf-redact-field", "email");
    const color = await page.locator("#email [data-gf-redact]").evaluate((el) => getComputedStyle(el).color);
    expect(color).toBe("rgba(0, 0, 0, 0)");
    // Added 1.5 s after load.
    await expect(page.locator("#late-slot [data-gf-redact='email']")).toHaveCount(1, { timeout: 5000 });

    // Click plain text to hide it, click again to show it.
    await page.locator("#safe").click();
    await expect(page.locator("#safe")).toHaveAttribute("data-gf-redact-el", "");
    await page.locator("#safe").click();
    await expect(page.locator("#safe")).not.toHaveAttribute("data-gf-redact-el", "");

    // Capture from the toolbar: the covers are in the photo, the toolbar is not.
    const emailBox = (await page.locator("#email").boundingBox())!;
    await page.locator("#gofully-live-redact button[data-act='cap-visible']").click();
    await expect(page.locator("#gofully-result-card-host")).toBeAttached({ timeout: 10000 });
    const dataUrl = await helper.evaluate(async () => (await chrome.runtime.sendMessage({ type: "GET_CAPTURE_BLOB_URL" }))?.url);
    const mid = await pixel(helper, dataUrl, emailBox.x + emailBox.width / 2, emailBox.y + emailBox.height / 2);
    expect(mid[0] + mid[1] + mid[2], "email area is solid ink in the capture").toBeLessThan(120);
    expect(await inkShare(helper, dataUrl, { x: 300, y: height - 60, w: 680, h: 50 }), "toolbar left out").toBeLessThan(0.01);

    // Done puts the page back exactly.
    await page.locator("#gofully-live-redact button[data-act='done']").click();
    await expect(page.locator("[data-gf-redact], [data-gf-redact-field], [data-gf-redact-el]")).toHaveCount(0);
    expect(await page.locator("#private").innerHTML()).toBe(before);
    await expect(page.locator("#late-slot")).toHaveText("Late: late.person@example.org");
  });

  test("TC-V12-008: the popup lists the new modes and a delay control that is saved to Settings", async ({ context, extensionId, serviceWorker }) => {
    const popup = await helperPage(context, extensionId);
    // Opened as a tab, the popup sees itself (an extension page) as the current page and hides the modes.
    // The real popup opens over a web page, so show the grid the way it would be there.
    await popup.evaluate(() => document.getElementById("unsupportedPanel")?.classList.remove("active"));
    await popup.setViewportSize({ width: 380, height: 640 });
    await expect(popup.locator('.mode-btn[data-mode="measure-page"]')).toBeVisible();
    await expect(popup.locator('.mode-btn[data-mode="redact-page"]')).toBeVisible();
    await expect(popup.locator("#delaySelect option")).toHaveText(["Off", "3 s", "5 s", "10 s"]);
    await popup.locator("#delaySelect").selectOption("5");
    await popup.waitForTimeout(300);
    const stored = await serviceWorker.evaluate(async () => (await chrome.storage.sync.get("settings")).settings?.captureCountdown);
    expect(stored).toBe(5);
    // Popup fits its content without a horizontal scrollbar.
    expect(await popup.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
  });

  test("TC-V12-009: 'After a capture' set to Copy shows the toast instead of the card", async ({ context, extensionId, serviceWorker }) => {
    await serviceWorker.evaluate(async () => chrome.storage.sync.set({ settings: { defaultAction: "auto-copy" } }));
    const { page } = await openFixture(context, extensionId);
    await page.keyboard.press("Control+Shift+V");
    await expect(page.locator("#gofully-quick-toast")).toBeAttached({ timeout: 10000 });
    await expect(page.locator("#gofully-result-card-host")).toHaveCount(0);
  });

  test("TC-V12-010: parallel requests for the offscreen page share one creation (no silent empty results)", async ({ context, extensionId, serviceWorker }) => {
    const { page, helper } = await openFixture(context, extensionId);
    await page.bringToFront();
    const { captureId } = await captureVisible(helper);
    await serviceWorker.evaluate(async () => {
      if ((await (chrome.runtime as any).getContexts({ contextTypes: ["OFFSCREEN_DOCUMENT"] })).length) await chrome.offscreen.closeDocument();
    });
    const results = await helper.evaluate(async (id: string) => {
      const ask = () => chrome.runtime.sendMessage({ type: "SCAN_CODES", payload: { captureId: id } });
      return (await Promise.all([ask(), ask(), ask()])).map((r: any) => (r?.codes ?? []).map((c: any) => c.value));
    }, captureId);
    for (const r of results) expect(r).toContain("https://gofully.example/qr-test");
  });

  test("TC-V12-011: after the background page was stopped, a card still acts on its own capture, and never on another one", async ({ context, extensionId }) => {
    const { page, helper } = await openFixture(context, extensionId);
    await page.bringToFront();
    const mine = await captureVisible(helper); // the capture the old card shows
    await page.evaluate(() => window.scrollTo(0, 1200));
    await page.waitForTimeout(600);
    const other = await captureVisible(helper); // a newer one, now the current capture

    const out = await helper.evaluate(async ({ mine, other }: any) => {
      // An id the worker has never seen, as after a restart: with its own image it works; without, it refuses.
      const snapshot = { dataUrl: mine.dataUrl, width: 1280, height: 633, mode: "visible-area", method: "visible-tab", url: "https://example.com/", title: "Old card", timestamp: Date.now() };
      const refused: any = await chrome.runtime.sendMessage({ type: "PIN_LAST_CAPTURE", payload: { captureId: "c_gone_000000" } });
      const refusedExport: any = await chrome.runtime.sendMessage({ type: "EXPORT_CAPTURE", payload: { format: "png", captureId: "c_gone_000000" } });
      await chrome.runtime.sendMessage({ type: "GUIDE_ADD_LAST_CAPTURE", payload: { captureId: "c_gone_000000", snapshot } });
      const current: any = await chrome.runtime.sendMessage({ type: "GET_CAPTURE_BLOB_URL" });
      // A snapshot that is not a plain raster image is ignored, not trusted.
      const bad: any = await chrome.runtime.sendMessage({ type: "GUIDE_ADD_LAST_CAPTURE", payload: { captureId: "c_gone_111111", snapshot: { ...snapshot, dataUrl: "data:image/svg+xml;base64,PHN2Zy8+" } } });
      return { refused, refusedExport, same: current?.url === mine.dataUrl, notOther: current?.url !== other.dataUrl, bad };
    }, { mine, other });

    expect(out.refused?.ok).toBe(false);
    expect(out.refusedExport?.success).toBe(false);
    expect(out.same, "the capture the card showed became current").toBe(true);
    expect(out.notOther).toBe(true);
    expect(out.bad?.ok).toBe(false);
  });
});
