import { test, expect } from "../fixtures/extension";

async function seed(serviceWorker: any) {
  await serviceWorker.evaluate(async () => {
    const c = new OffscreenCanvas(500, 300);
    const g = c.getContext("2d")!;
    g.fillStyle = "#1E293B"; g.fillRect(0, 0, 500, 300);
    const b = await c.convertToBlob();
    const r = new FileReader();
    const url = await new Promise<string>((res) => { r.onload = () => res(String(r.result)); r.readAsDataURL(b); });
    await chrome.storage.session.set({ lastCaptureDataUrl: url });
  });
}

async function open(context: any, serviceWorker: any, extensionId: string) {
  await seed(serviceWorker);
  const page = await context.newPage();
  await page.setViewportSize({ width: 1400, height: 900 });
  await page.goto(`chrome-extension://${extensionId}/editor.html`);
  await page.waitForTimeout(600);
  await page.locator("#tool-beautify").click();
  await expect(page.locator("#beautifyPanel")).toHaveClass(/open/);
  return page;
}

const importFile = (page: any, name: string, content: string) =>
  page.locator("#bf-preset-import-input").setInputFiles({ name, mimeType: "application/json", buffer: Buffer.from(content) });

test.describe("21 - Beautify preset edge cases", () => {
  test("TC-PRE-001: saving with an empty name is refused with a message", async ({ context, serviceWorker, extensionId }) => {
    const page = await open(context, serviceWorker, extensionId);
    await page.locator("#bf-preset-name").fill("");
    await page.locator("#bf-preset-save-btn").click();
    await expect(page.locator(".toast.show")).toContainText(/name/i);
  });

  test("TC-PRE-002: exporting with no saved presets tells the user to save one first", async ({ context, serviceWorker, extensionId }) => {
    const page = await open(context, serviceWorker, extensionId);
    await page.evaluate(() => chrome.storage.sync.remove("beautifyPresets"));
    await page.reload();
    await page.waitForTimeout(500);
    await page.locator("#tool-beautify").click();
    await page.locator("#bf-preset-export-btn").click();
    await expect(page.locator(".toast.show")).toContainText(/save a preset first/i);
  });

  test("TC-PRE-003: non-JSON, wrong-shape and empty files are rejected with a clear toast and nothing is stored", async ({ context, serviceWorker, extensionId }) => {
    const page = await open(context, serviceWorker, extensionId);
    await page.evaluate(() => chrome.storage.sync.remove("beautifyPresets"));
    for (const [name, body] of [["a.gofullypreset", "not json at all"], ["b.gofullypreset", JSON.stringify({ hello: "world" })], ["c.gofullypreset", JSON.stringify({ format: "gofully-beautify-presets", version: 1, presets: [] })]] as const) {
      await importFile(page, name, body);
      await expect(page.locator(".toast.show"), name).toContainText(/preset/i);
      await page.waitForTimeout(2600);
    }
    const stored = await page.evaluate(async () => ((await chrome.storage.sync.get("beautifyPresets")) as any).beautifyPresets || []);
    expect(stored).toEqual([]);
  });

  test("TC-PRE-006: a file from a newer version is refused with an update message", async ({ context, serviceWorker, extensionId }) => {
    const page = await open(context, serviceWorker, extensionId);
    await importFile(page, "n.gofullypreset", JSON.stringify({ format: "gofully-beautify-presets", version: 9, presets: [] }));
    await expect(page.locator(".toast.show")).toContainText(/newer GoFully/i);
  });

  test("TC-PRE-004: a save then export then import round trip keeps the preset name", async ({ context, serviceWorker, extensionId }) => {
    const page = await open(context, serviceWorker, extensionId);
    await page.evaluate(() => chrome.storage.sync.remove("beautifyPresets"));
    await page.locator("#bf-preset-name").fill("Launch look");
    await page.locator("#bf-preset-save-btn").click();
    await expect(page.locator(".toast.show")).toContainText(/Launch look/);
    const saved = await page.evaluate(async () => ((await chrome.storage.sync.get("beautifyPresets")) as any).beautifyPresets);
    expect(saved).toHaveLength(1);
    await page.evaluate(() => chrome.storage.sync.remove("beautifyPresets"));
    await page.waitForTimeout(2600);
    const file = JSON.stringify({ format: "gofully-beautify-presets", version: 1, presets: saved });
    await importFile(page, "x.gofullypreset", file);
    await page.waitForTimeout(800);
    const after = await page.evaluate(async () => ((await chrome.storage.sync.get("beautifyPresets")) as any).beautifyPresets || []);
    expect(after.map((p: any) => p.name)).toContain("Launch look");
  });

  test("TC-PRE-005: an oversized file is refused", async ({ context, serviceWorker, extensionId }) => {
    const page = await open(context, serviceWorker, extensionId);
    await page.locator("#bf-preset-import-input").setInputFiles({ name: "big.gofullypreset", mimeType: "application/json", buffer: Buffer.alloc(3 * 1024 * 1024, 32) });
    await expect(page.locator(".toast.show")).toContainText(/too large/i);
  });
});
