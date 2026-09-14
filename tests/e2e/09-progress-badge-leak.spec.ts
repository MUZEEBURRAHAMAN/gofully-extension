import { test, expect } from "../fixtures/extension";

test.describe("09 - Progress Badge Not Baked Into Captures", () => {
  test("TC-BADGE-001: Visible Area capture does not bake in the in-page 'Capturing page...' badge", async ({
    context,
    extensionId,
  }) => {
    const page = await context.newPage();
    await page.goto("http://localhost:8085/test-page-long.html");
    await page.waitForLoadState("networkidle");

    const popupPage = await context.newPage();
    await popupPage.goto(`chrome-extension://${extensionId}/popup.html`);
    await popupPage.waitForLoadState("domcontentloaded");

    const setup = await popupPage.evaluate(async () => {
      const [targetTab] = await chrome.tabs.query({
        url: "http://localhost:8085/test-page-long.html",
      });
      if (!targetTab?.id) return { error: "tab not found" };

      // Inject content scripts and pre-show the badge, simulating a
      // stale/racing overlay that could otherwise be captured.
      await chrome.scripting.executeScript({
        target: { tabId: targetTab.id },
        files: ["result-bar.js"],
      }).catch(() => {});

      await chrome.scripting.executeScript({
        target: { tabId: targetTab.id },
        func: () => {
          if (typeof (window as any).__gofully_show_progress === "function") {
            (window as any).__gofully_show_progress(1, 3, "capturing");
          }
        },
      });

      const [{ result: dotRect }] = await chrome.scripting.executeScript({
        target: { tabId: targetTab.id },
        func: () => {
          const badge = document.getElementById("gofully-progress-badge");
          const dot = badge?.firstElementChild as HTMLElement | null;
          if (!dot) return null;
          const r = dot.getBoundingClientRect();
          return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
        },
      });

      return { tabId: targetTab.id, dotRect };
    });

    expect(setup).not.toHaveProperty("error");
    const { tabId, dotRect } = setup as { tabId: number; dotRect: { x: number; y: number } | null };
    expect(dotRect).not.toBeNull();

    const result = await popupPage.evaluate(async (tid: number) => {
      return new Promise<any>((resolve) => {
        chrome.runtime.sendMessage(
          { type: "START_CAPTURE", payload: { mode: "visible-area", tabId: tid } },
          resolve
        );
      });
    }, tabId);

    expect(result.type).toBe("CAPTURE_COMPLETE");
    expect(result.payload.dataUrl).toContain("data:image/png;base64,");

    const pixel = await popupPage.evaluate(
      async ({ dataUrl, dotRect, cssWidth }: { dataUrl: string; dotRect: { x: number; y: number }; cssWidth: number }) => {
        const img = new Image();
        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = reject;
          img.src = dataUrl;
        });
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0);

        // Captured image may be at a higher device pixel ratio than the
        // CSS coordinates the badge rect was measured in.
        const scale = img.width / cssWidth;
        const x = Math.round(dotRect.x * scale);
        const y = Math.round(dotRect.y * scale);
        const p = ctx.getImageData(x, y, 1, 1).data;
        return { r: p[0], g: p[1], b: p[2] };
      },
      { dataUrl: result.payload.dataUrl, dotRect, cssWidth: result.payload.width / (await page.evaluate(() => window.devicePixelRatio || 1)) }
    );

    // The badge's status dot is a distinctive bright green (#16B364 ~ rgb(22,179,100)).
    // If the badge leaked into the capture, this pixel would match it closely.
    const isGreenDot = Math.abs(pixel.r - 22) < 30 && Math.abs(pixel.g - 179) < 30 && Math.abs(pixel.b - 100) < 30;
    expect(isGreenDot, `Badge dot leaked into capture at sampled pixel rgb(${pixel.r},${pixel.g},${pixel.b})`).toBe(false);

    await popupPage.close();
    await page.close();
  });

  test("TC-BADGE-002: Selected Area capture does not bake in a stale progress badge", async ({
    context,
    extensionId,
  }) => {
    const page = await context.newPage();
    await page.goto("http://localhost:8085/test-page-long.html");
    await page.waitForLoadState("networkidle");

    const popupPage = await context.newPage();
    await popupPage.goto(`chrome-extension://${extensionId}/popup.html`);
    await popupPage.waitForLoadState("domcontentloaded");

    const setup = await popupPage.evaluate(async () => {
      const [targetTab] = await chrome.tabs.query({
        url: "http://localhost:8085/test-page-long.html",
      });
      if (!targetTab?.id) return { error: "tab not found" };

      await chrome.scripting.executeScript({
        target: { tabId: targetTab.id },
        files: ["result-bar.js"],
      }).catch(() => {});

      // Simulate a stale badge left over from a prior full-page capture
      // that never received its "done" event.
      await chrome.scripting.executeScript({
        target: { tabId: targetTab.id },
        func: () => {
          if (typeof (window as any).__gofully_show_progress === "function") {
            (window as any).__gofully_show_progress(1, 3, "capturing");
          }
        },
      });

      const [{ result: dotRect }] = await chrome.scripting.executeScript({
        target: { tabId: targetTab.id },
        func: () => {
          const badge = document.getElementById("gofully-progress-badge");
          const dot = badge?.firstElementChild as HTMLElement | null;
          if (!dot) return null;
          const r = dot.getBoundingClientRect();
          return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
        },
      });

      return { tabId: targetTab.id, dotRect };
    });

    expect(setup).not.toHaveProperty("error");
    const { tabId, dotRect } = setup as { tabId: number; dotRect: { x: number; y: number } | null };
    expect(dotRect).not.toBeNull();

    const result = await popupPage.evaluate(async (tid: number) => {
      return new Promise<any>((resolve) => {
        chrome.runtime.sendMessage(
          {
            type: "START_CAPTURE",
            payload: { mode: "selected-area", tabId: tid, region: { x: 0, y: 0, width: 400, height: 300 } },
          },
          resolve
        );
      });
    }, tabId);

    expect(result.type).toBe("CAPTURE_COMPLETE");

    const dpr = await page.evaluate(() => window.devicePixelRatio || 1);
    if (dotRect!.x < 400 && dotRect!.y < 300) {
      const pixel = await popupPage.evaluate(
        async ({ dataUrl, dotRect, dpr }: { dataUrl: string; dotRect: { x: number; y: number }; dpr: number }) => {
          const img = new Image();
          await new Promise<void>((resolve, reject) => {
            img.onload = () => resolve();
            img.onerror = reject;
            img.src = dataUrl;
          });
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d")!;
          ctx.drawImage(img, 0, 0);
          const x = Math.round(dotRect.x * dpr);
          const y = Math.round(dotRect.y * dpr);
          const p = ctx.getImageData(
            Math.min(x, img.width - 1),
            Math.min(y, img.height - 1),
            1,
            1
          ).data;
          return { r: p[0], g: p[1], b: p[2] };
        },
        { dataUrl: result.payload.dataUrl, dotRect, dpr }
      );

      const isGreenDot = Math.abs(pixel.r - 22) < 30 && Math.abs(pixel.g - 179) < 30 && Math.abs(pixel.b - 100) < 30;
      expect(isGreenDot, `Badge dot leaked into selected-area capture at rgb(${pixel.r},${pixel.g},${pixel.b})`).toBe(false);
    }

    await popupPage.close();
    await page.close();
  });
});
