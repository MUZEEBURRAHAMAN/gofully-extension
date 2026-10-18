import { test, expect } from "../fixtures/extension";

async function seedTestScreenshot(serviceWorker: any, width = 500, height = 300) {
  await serviceWorker.evaluate(async ({ w, h }: { w: number; h: number }) => {
    const c = new OffscreenCanvas(w, h);
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = "#1E293B";
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "#38BDF8";
    ctx.font = "bold 28px sans-serif";
    ctx.fillText("GoFully QA", 40, 80);
    const blob = await c.convertToBlob();
    const reader = new FileReader();
    const dataUrl = await new Promise<string>((res) => {
      reader.onload = () => res(reader.result as string);
      reader.readAsDataURL(blob);
    });
    await chrome.storage.session.set({ lastCaptureDataUrl: dataUrl });
  }, { w: width, h: height });
}

async function openBeautify(context: any, serviceWorker: any, extensionId: string) {
  await seedTestScreenshot(serviceWorker);
  const page = await context.newPage();
  await page.goto(`chrome-extension://${extensionId}/editor.html`);
  await page.waitForLoadState("domcontentloaded");
  await page.waitForTimeout(500);
  await page.locator("#tool-beautify").click();
  await expect(page.locator("#beautifyPanel")).toHaveClass(/open/);
  return page;
}

async function dims(page: any): Promise<[number, number]> {
  const t = await page.locator("#dimensions").innerText();
  const [w, h] = t.split("×").map((s: string) => parseInt(s.trim()));
  return [w, h];
}

test.describe("13 - Beautify additions (wallpapers, border, watermark, alignment, preset files)", () => {
  test("TC-BF-001: eight built-in wallpapers are listed and apply without changing the output size", async ({
    context, serviceWorker, extensionId,
  }) => {
    const page = await openBeautify(context, serviceWorker, extensionId);
    await expect(page.locator('.bf-bg-swatch[data-bg^="mesh:"]')).toHaveCount(8);

    await page.locator(".bf-bg-swatch").nth(1).click();
    await page.waitForTimeout(400);
    const [w1, h1] = await dims(page);

    await page.locator('.bf-bg-swatch[data-bg="mesh:aurora"]').click();
    await page.waitForTimeout(500);
    await expect(page.locator('.bf-bg-swatch[data-bg="mesh:aurora"]')).toHaveClass(/active/);
    const [w2, h2] = await dims(page);
    expect([w2, h2]).toEqual([w1, h1]);
    await page.close();
  });

  test("TC-BF-002: border and watermark re-render in place and do not stack padding", async ({
    context, serviceWorker, extensionId,
  }) => {
    const page = await openBeautify(context, serviceWorker, extensionId);
    await page.locator(".bf-bg-swatch").nth(1).click();
    await page.waitForTimeout(400);
    const [w1, h1] = await dims(page);

    await page.locator("#bf-border").fill("8");
    await page.locator("#bf-wm-text").fill("@gofully");
    await page.waitForTimeout(700);
    await expect(page.locator("#bf-border-val")).toHaveText("8px");
    const [w2, h2] = await dims(page);
    expect([w2, h2]).toEqual([w1, h1]);

    await page.locator("#bf-wm-pos").selectOption("tl");
    await page.locator("#bf-wm-size").fill("40");
    await page.waitForTimeout(600);
    const [w3, h3] = await dims(page);
    expect([w3, h3]).toEqual([w1, h1]);
    await page.close();
  });

  test("TC-BF-003: alignment buttons switch and keep the canvas valid with an aspect ratio", async ({
    context, serviceWorker, extensionId,
  }) => {
    const page = await openBeautify(context, serviceWorker, extensionId);
    await page.locator(".bf-bg-swatch").nth(1).click();
    await page.locator('.bf-ratio-btn[data-ratio="1.778"]').click();
    await page.waitForTimeout(500);
    const [w, h] = await dims(page);
    expect(Math.abs(w / h - 1.778)).toBeLessThan(0.02);

    await page.locator('.bf-align-btn[data-ax="0"][data-ay="0"]').click();
    await page.waitForTimeout(500);
    await expect(page.locator('.bf-align-btn[data-ax="0"][data-ay="0"]')).toHaveClass(/active/);
    await expect(page.locator('.bf-align-btn[data-ax="0.5"][data-ay="0.5"]')).not.toHaveClass(/active/);
    const [w2, h2] = await dims(page);
    expect([w2, h2]).toEqual([w, h]);
    await page.close();
  });

  test("TC-BF-004: presets export to a versioned file and imports are validated and clamped", async ({
    context, serviceWorker, extensionId,
  }) => {
    const page = await openBeautify(context, serviceWorker, extensionId);
    await page.locator(".bf-bg-swatch").nth(1).click();
    await page.waitForTimeout(400);
    await page.locator("#bf-border").fill("6");
    await page.locator("#bf-wm-text").fill("mine");
    await page.locator("#bf-preset-name").fill("Round trip");
    await page.locator("#bf-preset-save-btn").click();
    await page.waitForTimeout(300);

    const [download] = await Promise.all([
      page.waitForEvent("download"),
      page.locator("#bf-preset-export-btn").click(),
    ]);
    expect(download.suggestedFilename()).toBe("gofully-presets.gofullypreset");
    const fs = await import("fs");
    const exported = JSON.parse(fs.readFileSync(await download.path(), "utf8"));
    expect(exported.format).toBe("gofully-beautify-presets");
    expect(exported.version).toBe(1);
    const mine = exported.presets.find((p: any) => p.name === "Round trip");
    expect(mine.border).toBe(6);
    expect(mine.wm.text).toBe("mine");

    // A hostile / out-of-range file: values are clamped, unknown fields dropped
    const evil = {
      format: "gofully-beautify-presets",
      version: 1,
      presets: [
        { name: "Evil", bg: "none", padding: 99999, radius: -50, shadow: 5, shadowOpacity: 500, noise: 3,
          frame: "<script>", border: 9999, borderColor: "red", align: [7, 7],
          wm: { text: "x".repeat(500), size: 9999, opacity: -4, pos: "zz", color: "javascript:1" },
          persp: { rx: 9999, ry: -9999, rz: 500, zoom: 1, panX: 700, panY: "x" },
          pb: { mode: "evil", dir: "up", strength: 99999, scope: "everywhere" },
          __proto__: { polluted: true }, extra: "ignored" },
        { name: "", padding: 1 },
        "not an object",
      ],
    };
    await page.locator("#bf-preset-import-input").setInputFiles({
      name: "evil.gofullypreset", mimeType: "application/json", buffer: Buffer.from(JSON.stringify(evil)),
    });
    await page.waitForTimeout(500);

    const stored = await page.evaluate(async () => {
      const r = await chrome.storage.sync.get("beautifyPresets");
      return (r.beautifyPresets as any[]).find((p) => p.name === "Evil");
    });
    expect(stored.padding).toBe(120);
    expect(stored.radius).toBe(0);
    expect(stored.shadowOpacity).toBe(100);
    expect(stored.frame).toBe("none");
    expect(stored.border).toBe(24);
    expect(stored.borderColor).toBe("#ffffff");
    expect(stored.align).toEqual([0.5, 0.5]);
    expect(stored.wm.text.length).toBe(60);
    expect(stored.wm.size).toBe(64);
    expect(stored.wm.opacity).toBe(10);
    expect(stored.wm.pos).toBe("br");
    expect(stored.wm.color).toBe("#ffffff");
    expect(stored.extra).toBeUndefined();
    expect(stored.persp).toEqual({ rx: 45, ry: -45, rz: 30, zoom: 50, panX: 50, panY: 0 });
    expect(stored.pb).toEqual({ mode: "off", dir: "bottom", strength: 60, scope: "inside" });

    // A file that isn't ours is rejected without touching stored presets
    await page.locator("#bf-preset-import-input").setInputFiles({
      name: "other.json", mimeType: "application/json", buffer: Buffer.from(JSON.stringify({ hello: "world" })),
    });
    await page.waitForTimeout(300);
    const count = await page.evaluate(async () => ((await chrome.storage.sync.get("beautifyPresets")).beautifyPresets as any[]).length);
    expect(count).toBe(2);

    await page.evaluate(() => chrome.storage.sync.remove("beautifyPresets"));
    await page.close();
  });
  test("TC-BF-005: 3D mockup and progressive blur keep the output size and Reset clears them", async ({
    context, serviceWorker, extensionId,
  }) => {
    const page = await openBeautify(context, serviceWorker, extensionId);
    await page.locator('.bf-bg-swatch[data-bg="mesh:ocean"]').click();
    await page.waitForTimeout(500);
    const [w1, h1] = await dims(page);

    await page.locator('#bf-persp-presets [data-p="28,-18,-6"]').click();
    await page.waitForTimeout(900);
    await expect(page.locator("#bf-rx-val")).toHaveText("28°");
    expect(await dims(page)).toEqual([w1, h1]);

    await page.locator("#bf-pb-mode").selectOption("radial");
    await page.locator("#bf-pb-scope").selectOption("scene");
    await page.waitForTimeout(1200);
    expect(await dims(page)).toEqual([w1, h1]);

    await page.locator("#bf-reset-btn").click();
    await page.waitForTimeout(600);
    await expect(page.locator("#bf-rx-val")).toHaveText("0°");
    await expect(page.locator("#bf-pb-mode")).toHaveValue("off");
    await page.close();
  });

  test("TC-BF-006: the beautified shot actually changes with a 3D tilt (pixels differ from flat)", async ({
    context, serviceWorker, extensionId,
  }) => {
    const page = await openBeautify(context, serviceWorker, extensionId);
    await page.locator('.bf-bg-swatch[data-bg="mesh:ocean"]').click();
    await page.waitForTimeout(600);
    const flat = await page.evaluate(() => (window as any).__fabricCanvas.toDataURL({ format: "png" }));
    await page.locator('#bf-persp-presets [data-p="12,24,0"]').click();
    await page.waitForTimeout(1000);
    const tilted = await page.evaluate(() => (window as any).__fabricCanvas.toDataURL({ format: "png" }));
    expect(tilted).not.toBe(flat);
    await page.close();
  });
});
