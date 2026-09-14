import { test, expect } from "../fixtures/extension";

test.describe("08 - Sticky/Fixed Header De-duplication", () => {
  test("TC-STICKY-001: hideStickyElements uses opacity so child visibility:visible overrides cannot break it", async ({
    context,
    extensionId,
  }) => {
    const page = await context.newPage();
    await page.goto("http://localhost:8085/test-page-sticky-header.html");
    await page.waitForLoadState("networkidle");

    const popupPage = await context.newPage();
    await popupPage.goto(`chrome-extension://${extensionId}/popup.html`);
    await popupPage.waitForLoadState("domcontentloaded");

    // Run hide/restore via executeScript (ISOLATED world, same as content scripts)
    const result = await popupPage.evaluate(async () => {
      const [targetTab] = await chrome.tabs.query({
        url: "http://localhost:8085/test-page-sticky-header.html",
      });
      if (!targetTab?.id) return { error: "tab not found" };

      // Hide sticky elements
      await chrome.scripting.executeScript({
        target: { tabId: targetTab.id },
        func: () => {
          if (typeof (window as any).__gofully_hide_sticky === "function") {
            (window as any).__gofully_hide_sticky();
          }
        },
      });

      // Read computed styles (must be in MAIN world to get accurate computed styles)
      const [{ result: styles }] = await chrome.scripting.executeScript({
        target: { tabId: targetTab.id },
        world: "MAIN" as any,
        func: () => {
          const header = document.querySelector('[data-testid="fixed-header"]') as HTMLElement;
          const chatbot = document.querySelector('[data-testid="chatbot-widget"]') as HTMLElement;
          const navLink = header?.querySelector("a") as HTMLElement;
          return {
            headerOpacity: header ? getComputedStyle(header).opacity : "missing",
            chatbotOpacity: chatbot ? getComputedStyle(chatbot).opacity : "missing",
            childLinkOpacity: navLink ? getComputedStyle(navLink).opacity : "missing",
          };
        },
      });

      // Restore sticky elements
      await chrome.scripting.executeScript({
        target: { tabId: targetTab.id },
        func: () => {
          if (typeof (window as any).__gofully_restore_sticky === "function") {
            (window as any).__gofully_restore_sticky();
          }
        },
      });

      // Read after restore
      const [{ result: afterStyles }] = await chrome.scripting.executeScript({
        target: { tabId: targetTab.id },
        world: "MAIN" as any,
        func: () => {
          const header = document.querySelector('[data-testid="fixed-header"]') as HTMLElement;
          const chatbot = document.querySelector('[data-testid="chatbot-widget"]') as HTMLElement;
          return {
            headerOpacity: header ? getComputedStyle(header).opacity : "missing",
            chatbotOpacity: chatbot ? getComputedStyle(chatbot).opacity : "missing",
          };
        },
      });

      return { during: styles, after: afterStyles };
    });

    expect(result).not.toHaveProperty("error");
    const r = result as any;
    // During hide: header and chatbot must have opacity 0
    expect(r.during.headerOpacity).toBe("0");
    expect(r.during.chatbotOpacity).toBe("0");
    // The child nav link's OWN computed opacity is still "1" — but it's
    // visually invisible because it's composited inside the parent's
    // opacity-0 layer. This is the key difference from visibility:hidden,
    // where a child with visibility:visible WOULD override the parent.
    // With opacity, there's no override possible.
    expect(r.during.childLinkOpacity).toBe("1");
    // After restore: opacity returns to normal
    expect(r.after.headerOpacity).toBe("1");
    expect(r.after.chatbotOpacity).toBe("1");

    await popupPage.close();
    await page.close();
  });

  test("TC-STICKY-002: Full-page capture does not duplicate the fixed header", async ({
    context,
    extensionId,
  }) => {
    const page = await context.newPage();
    await page.goto("http://localhost:8085/test-page-sticky-header.html");
    await page.waitForLoadState("networkidle");
    await page.bringToFront();

    const popupPage = await context.newPage();
    await popupPage.goto(`chrome-extension://${extensionId}/popup.html`);
    await popupPage.waitForLoadState("domcontentloaded");

    const result = await popupPage.evaluate(async () => {
      const [targetTab] = await chrome.tabs.query({
        url: "http://localhost:8085/test-page-sticky-header.html",
      });
      return new Promise<any>((resolve) => {
        chrome.runtime.sendMessage(
          {
            type: "START_CAPTURE",
            payload: { mode: "full-page", tabId: targetTab?.id },
          },
          resolve
        );
      });
    });

    expect(result).toBeDefined();
    expect(result.type).toBe("CAPTURE_COMPLETE");
    expect(result.payload.dataUrl).toContain("data:image/png;base64,");
    expect(result.payload.width).toBeGreaterThan(100);
    expect(result.payload.height).toBeGreaterThan(800);

    // Pixel-level header duplication check:
    // The fixed header is dark (#1e293b, RGB ~30,41,59) and ~52px tall.
    // Content sections are light (#f1f5f9 / #ffffff).
    // If the header repeats, dark pixels appear at viewport-height intervals.
    const pixelCheck = await popupPage.evaluate(async (dataUrl: string) => {
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

      const vpHeight = window.innerHeight || 600;
      const samples: { y: number; r: number; g: number; b: number; isDark: boolean }[] = [];

      for (let mult = 1; mult <= 3; mult++) {
        const sampleY = Math.min(
          Math.round(vpHeight * mult + 26),
          img.height - 1
        );
        const x = Math.round(img.width / 2);
        const pixel = ctx.getImageData(x, sampleY, 1, 1).data;
        samples.push({
          y: sampleY,
          r: pixel[0],
          g: pixel[1],
          b: pixel[2],
          isDark: pixel[0] < 80 && pixel[1] < 80 && pixel[2] < 80,
        });
      }

      return { imageHeight: img.height, imageWidth: img.width, samples };
    }, result.payload.dataUrl);

    for (const sample of pixelCheck.samples) {
      expect(
        sample.isDark,
        `Header repeats at y=${sample.y} (rgb(${sample.r},${sample.g},${sample.b}))`
      ).toBe(false);
    }

    // Verify sticky elements restored after capture
    const restored = await page.evaluate(() => {
      const header = document.querySelector('[data-testid="fixed-header"]') as HTMLElement;
      return header ? getComputedStyle(header).opacity : "missing";
    });
    expect(restored).toBe("1");

    await popupPage.close();
    await page.close();
  });

  test("TC-STICKY-003: Sticky sub-nav is also hidden during capture", async ({
    context,
    extensionId,
  }) => {
    const page = await context.newPage();
    await page.goto("http://localhost:8085/test-page-sticky-header.html");
    await page.waitForLoadState("networkidle");

    // Scroll down so sticky sub-nav is in "stuck" state
    await page.evaluate(() => window.scrollTo({ top: 200 }));
    await page.waitForTimeout(200);

    const popupPage = await context.newPage();
    await popupPage.goto(`chrome-extension://${extensionId}/popup.html`);
    await popupPage.waitForLoadState("domcontentloaded");

    const result = await popupPage.evaluate(async () => {
      const [targetTab] = await chrome.tabs.query({
        url: "http://localhost:8085/test-page-sticky-header.html",
      });
      if (!targetTab?.id) return { error: "tab not found" };

      // Hide
      await chrome.scripting.executeScript({
        target: { tabId: targetTab.id },
        func: () => {
          if (typeof (window as any).__gofully_hide_sticky === "function") {
            (window as any).__gofully_hide_sticky();
          }
        },
      });

      const [{ result: during }] = await chrome.scripting.executeScript({
        target: { tabId: targetTab.id },
        world: "MAIN" as any,
        func: () => {
          const subnav = document.querySelector('[data-testid="sticky-subnav"]') as HTMLElement;
          const childSpan = subnav?.querySelector("span") as HTMLElement;
          return {
            subnavOpacity: subnav ? getComputedStyle(subnav).opacity : "missing",
            childSpanOpacity: childSpan ? getComputedStyle(childSpan).opacity : "missing",
          };
        },
      });

      // Restore
      await chrome.scripting.executeScript({
        target: { tabId: targetTab.id },
        func: () => {
          if (typeof (window as any).__gofully_restore_sticky === "function") {
            (window as any).__gofully_restore_sticky();
          }
        },
      });

      const [{ result: after }] = await chrome.scripting.executeScript({
        target: { tabId: targetTab.id },
        world: "MAIN" as any,
        func: () => {
          const subnav = document.querySelector('[data-testid="sticky-subnav"]') as HTMLElement;
          return {
            subnavOpacity: subnav ? getComputedStyle(subnav).opacity : "missing",
          };
        },
      });

      return { during, after };
    });

    expect(result).not.toHaveProperty("error");
    const r = result as any;
    expect(r.during.subnavOpacity).toBe("0");
    // Child span's own opacity is "1" but visually invisible inside
    // the parent's opacity-0 compositing layer — same as TC-001
    expect(r.during.childSpanOpacity).toBe("1");
    expect(r.after.subnavOpacity).toBe("1");

    await popupPage.close();
    await page.close();
  });

  test("TC-STICKY-004: GoFully own UI elements (gofully- prefix) are excluded from hiding", async ({
    context,
    extensionId,
  }) => {
    const page = await context.newPage();
    await page.goto("http://localhost:8085/test-page-sticky-header.html");
    await page.waitForLoadState("networkidle");

    const popupPage = await context.newPage();
    await popupPage.goto(`chrome-extension://${extensionId}/popup.html`);
    await popupPage.waitForLoadState("domcontentloaded");

    const result = await popupPage.evaluate(async () => {
      const [targetTab] = await chrome.tabs.query({
        url: "http://localhost:8085/test-page-sticky-header.html",
      });
      if (!targetTab?.id) return { error: "tab not found" };

      // Inject a fake GoFully UI element
      await chrome.scripting.executeScript({
        target: { tabId: targetTab.id },
        world: "MAIN" as any,
        func: () => {
          const el = document.createElement("div");
          el.id = "gofully-test-element";
          el.style.position = "fixed";
          el.style.top = "0";
          el.style.left = "0";
          el.style.width = "100px";
          el.style.height = "10px";
          el.style.opacity = "1";
          document.body.appendChild(el);
        },
      });

      // Hide sticky elements
      await chrome.scripting.executeScript({
        target: { tabId: targetTab.id },
        func: () => {
          if (typeof (window as any).__gofully_hide_sticky === "function") {
            (window as any).__gofully_hide_sticky();
          }
        },
      });

      const [{ result: during }] = await chrome.scripting.executeScript({
        target: { tabId: targetTab.id },
        world: "MAIN" as any,
        func: () => {
          const el = document.getElementById("gofully-test-element");
          return { gofullyOpacity: el ? getComputedStyle(el).opacity : "missing" };
        },
      });

      // Restore
      await chrome.scripting.executeScript({
        target: { tabId: targetTab.id },
        func: () => {
          if (typeof (window as any).__gofully_restore_sticky === "function") {
            (window as any).__gofully_restore_sticky();
          }
        },
      });

      // Cleanup
      await chrome.scripting.executeScript({
        target: { tabId: targetTab.id },
        world: "MAIN" as any,
        func: () => document.getElementById("gofully-test-element")?.remove(),
      });

      return during;
    });

    expect(result).not.toHaveProperty("error");
    // GoFully's own elements must NOT be hidden
    expect((result as any).gofullyOpacity).toBe("1");

    await popupPage.close();
    await page.close();
  });
});
