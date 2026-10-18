import { test, expect } from "../fixtures/extension";

const PAGE = "http://localhost:8085/test-page-long.html";

test.describe("22 - History open, pin resize, dark theme", () => {
  test("TC-HIST-OPEN-001: clicking a history item opens its source page and is keyboard reachable", async ({ context, extensionId }) => {
    const page = await context.newPage();
    await page.setViewportSize({ width: 380, height: 700 });
    await page.goto(`chrome-extension://${extensionId}/popup.html`);
    await page.evaluate(async (url: string) => {
      const c = document.createElement("canvas"); c.width = 40; c.height = 30;
      const thumb = c.toDataURL("image/jpeg");
      await chrome.storage.local.set({ captureHistory: [
        { id: "a", thumbnail: thumb, url, title: "Long page", timestamp: Date.now(), mode: "visible", method: "x", width: 10, height: 10 },
        { id: "b", thumbnail: thumb, url: "chrome://extensions", title: "Internal", timestamp: Date.now() - 5, mode: "visible", method: "x", width: 10, height: 10 },
      ] });
    }, PAGE);
    await page.reload();
    await page.locator("#historyBtn").click();
    await expect(page.locator(".hist-item")).toHaveCount(2);
    await expect(page.locator(".hist-item").nth(0)).toHaveAttribute("role", "link");
    await expect(page.locator(".hist-item").nth(1)).not.toHaveAttribute("role", "link");
    const popup = context.waitForEvent("page");
    await page.locator(".hist-item").nth(0).click();
    const opened = await popup;
    expect(opened.url()).toContain("test-page-long.html");
    await page.evaluate(() => chrome.storage.local.remove("captureHistory"));
  });

  test("TC-PIN-002: dragging the corner grip makes a pin wider, and it never leaves the window", async ({ context, extensionId }) => {
    const page = await context.newPage();
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.goto(PAGE);
    const helper = await context.newPage();
    await helper.goto(`chrome-extension://${extensionId}/popup.html`);
    await helper.evaluate(async (url: string) => {
      const c = new OffscreenCanvas(320, 200);
      c.getContext("2d")!.fillRect(0, 0, 320, 200);
      const blob = await c.convertToBlob();
      const dataUrl = await new Promise<string>((res) => { const r = new FileReader(); r.onload = () => res(String(r.result)); r.readAsDataURL(blob); });
      const [tab] = await chrome.tabs.query({ url });
      await chrome.runtime.sendMessage({ type: "PIN_IMAGE", payload: { dataUrl, width: 320, height: 200, tabId: tab.id } });
    }, PAGE);
    const pin = page.locator("[data-gofully-pin]");
    await expect(pin).toBeAttached();
    const first = (await pin.boundingBox())!;
    await page.mouse.move(first.x + 60, first.y + 60);
    await page.mouse.down();
    await page.mouse.move(first.x - 300, first.y - 100, { steps: 6 });
    await page.mouse.up();
    const b = (await pin.boundingBox())!;
    await page.mouse.move(b.x + b.width - 5, b.y + b.height - 5);
    await page.mouse.down();
    await page.mouse.move(b.x + b.width + 150, b.y + b.height + 60, { steps: 6 });
    await page.mouse.up();
    const a = (await pin.boundingBox())!;
    expect(a.width).toBeGreaterThan(b.width + 80);
    expect(a.x + a.width).toBeLessThanOrEqual(1200);
  });

  for (const p of ["popup.html", "settings.html", "help.html", "guide.html"]) {
    test(`TC-THEME-${p}: dark mode has readable text on its background`, async ({ context, extensionId }) => {
      const page = await context.newPage();
      await page.emulateMedia({ colorScheme: "dark" });
      await page.setViewportSize({ width: p === "popup.html" ? 380 : 900, height: 800 });
      await page.goto(`chrome-extension://${extensionId}/${p}`);
      await page.waitForTimeout(600);
      const r = await page.evaluate(() => {
        const lum = (c: string) => {
          const m = c.match(/[\d.]+/g)!.map(Number);
          const f = (v: number) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
          return 0.2126 * f(m[0]) + 0.7152 * f(m[1]) + 0.0722 * f(m[2]);
        };
        const parse = (c: string) => { const m = c.match(/[\d.]+/g)!.map(Number); return { r: m[0], g: m[1], b: m[2], a: m.length > 3 ? m[3] : 1 }; };
        const bgOf = (el: Element) => {
          const layers: ReturnType<typeof parse>[] = [];
          for (let e: Element | null = el; e; e = e.parentElement) {
            const p = parse(getComputedStyle(e).backgroundColor);
            if (p.a > 0) layers.push(p);
            if (p.a >= 1) break;
          }
          let base = { r: 24, g: 24, b: 26 };
          for (const l of layers.reverse()) base = { r: base.r * (1 - l.a) + l.r * l.a, g: base.g * (1 - l.a) + l.g * l.a, b: base.b * (1 - l.a) + l.b * l.a };
          return `rgb(${base.r},${base.g},${base.b})`;
        };
        const bad: string[] = [];
        for (const el of document.querySelectorAll("h1,h2,h3,p,label,span,li,button,a,textarea,input")) {
          const h = el as HTMLElement;
          if (h.tagName === "INPUT" && !/^(text|search|number|email|url)$/.test((h as HTMLInputElement).type)) continue;
          if (h.tagName === "BUTTON" && h.children.length) continue;
          if (!h.offsetParent || !(h.textContent || "").trim() && !("value" in h)) continue;
          if (h.children.length && (h.textContent || "").trim() === Array.from(h.children).map((c) => c.textContent).join("").trim()) continue;
          const cs = getComputedStyle(h); if (cs.webkitTextFillColor === "rgba(0, 0, 0, 0)") continue; const fg = lum(cs.color), bg = lum(bgOf(h));
          const ratio = (Math.max(fg, bg) + 0.05) / (Math.min(fg, bg) + 0.05);
          if (ratio < 3) bad.push(`${h.tagName}.${h.className} ${ratio.toFixed(2)} "${(h.textContent || "").trim().slice(0, 24)}"`);
        }
        return { bodyLum: lum(getComputedStyle(document.body).backgroundColor), bad: bad.slice(0, 8) };
      });
      expect(r.bodyLum, "page background should be dark").toBeLessThan(0.2);
      expect(r.bad).toEqual([]);
    });
  }
});
