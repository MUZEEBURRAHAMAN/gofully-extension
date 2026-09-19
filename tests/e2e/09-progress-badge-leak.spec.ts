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

  // Reproduces the sync.com finding: CAPTURE_PROGRESS is delivered to the
  // content script via a fire-and-forget chrome.tabs.sendMessage. On a busy
  // real page that delivery can be delayed past the moment hideProgressInTab
  // runs (there's nothing to hide yet), then land moments later and CREATE
  // the badge for the first time right before the next shutter opens.
  // __gofully_suppress_progress/__gofully_unsuppress_progress close that gap
  // by dropping progress updates outright while suppressed, instead of
  // hiding a badge that's already been rendered.
  test("TC-BADGE-003: suppressProgressOverlay drops a progress update instead of hiding an already-rendered badge", async ({
    context,
    extensionId,
  }) => {
    const page = await context.newPage();
    await page.goto("http://localhost:8085/test-page-long.html");
    await page.waitForLoadState("networkidle");

    const popupPage = await context.newPage();
    await popupPage.goto(`chrome-extension://${extensionId}/popup.html`);
    await popupPage.waitForLoadState("domcontentloaded");

    const result = await popupPage.evaluate(async () => {
      const [targetTab] = await chrome.tabs.query({ url: "http://localhost:8085/test-page-long.html" });
      if (!targetTab?.id) return { error: "tab not found" };

      await chrome.scripting.executeScript({
        target: { tabId: targetTab.id },
        files: ["result-bar.js"],
      }).catch(() => {});

      const readBadge = async () => {
        const [{ result }] = await chrome.scripting.executeScript({
          target: { tabId: targetTab.id! },
          func: () => !!document.getElementById("gofully-progress-badge"),
        });
        return result as boolean;
      };

      const callSuppress = () =>
        chrome.scripting.executeScript({
          target: { tabId: targetTab.id! },
          func: () => (window as any).__gofully_suppress_progress?.(),
        });
      const callUnsuppress = () =>
        chrome.scripting.executeScript({
          target: { tabId: targetTab.id! },
          func: () => (window as any).__gofully_unsuppress_progress?.(),
        });
      const callShow = () =>
        chrome.scripting.executeScript({
          target: { tabId: targetTab.id! },
          func: () => (window as any).__gofully_show_progress?.(1, 3, "preparing"),
        });

      // Simulates the exact race: suppress fires first (as capture-engine.ts
      // now does before its own "preparing" event), THEN the delayed
      // CAPTURE_PROGRESS-equivalent update arrives.
      await callSuppress();
      await callShow();
      const badgeWhileSuppressed = await readBadge();

      await callUnsuppress();
      await callShow();
      const badgeAfterUnsuppress = await readBadge();

      return { badgeWhileSuppressed, badgeAfterUnsuppress };
    });

    expect(result).not.toHaveProperty("error");
    const r = result as { badgeWhileSuppressed: boolean; badgeAfterUnsuppress: boolean };
    // While suppressed, a progress update must not create the badge at all.
    expect(r.badgeWhileSuppressed).toBe(false);
    // Once unsuppressed, normal progress updates must still work.
    expect(r.badgeAfterUnsuppress).toBe(true);

    await popupPage.close();
    await page.close();
  });

  // result-bar.js is injected twice on every real page: once automatically
  // via the manifest's content_scripts, and again by injectContentScripts()
  // in service-worker.ts right before every single capture. Each injection
  // re-runs the whole file and creates a brand-new closure, but
  // chrome.runtime.onMessage.addListener only ever registers once (guarded)
  // — so the ACTIVE listener that receives a real CAPTURE_PROGRESS message
  // stays bound to the FIRST closure, while window.__gofully_suppress_progress
  // (what suppressProgressInTab calls) always reaches the MOST RECENT one.
  // Before this fix, those were two different closures with two different
  // `progressSuppressed` variables, so suppressing the latest one did
  // nothing to the message the first one was about to receive and act on —
  // this is exactly the residual leak TC-BADGE-001/004/005 occasionally hit
  // under real end-to-end timing. This test skips timing entirely and
  // reproduces the structural gap directly: suppress via whichever closure
  // is currently exposed on window, then deliver a real CAPTURE_PROGRESS
  // message the way the background actually does (chrome.tabs.sendMessage,
  // landing on the first-registered listener) and confirm it's still
  // dropped.
  test("TC-BADGE-007: suppression applies even after result-bar.js is re-injected (real CAPTURE_PROGRESS message, not the window-exposed helper)", async ({
    context,
    extensionId,
  }) => {
    const page = await context.newPage();
    await page.goto("http://localhost:8085/test-page-plain-tall.html");
    // Let the manifest's own content_scripts injection register its
    // listener first, before this test re-injects result-bar.js — this is
    // the same ordering every real capture goes through.
    await page.waitForLoadState("networkidle");

    const popupPage = await context.newPage();
    await popupPage.goto(`chrome-extension://${extensionId}/popup.html`);
    await popupPage.waitForLoadState("domcontentloaded");

    const result = await popupPage.evaluate(async () => {
      const [targetTab] = await chrome.tabs.query({ url: "http://localhost:8085/test-page-plain-tall.html" });
      if (!targetTab?.id) return { error: "tab not found" };
      const tabId = targetTab.id;

      // Same call injectContentScripts() makes before every real capture.
      await chrome.scripting.executeScript({
        target: { tabId },
        files: ["result-bar.js"],
      }).catch(() => {});

      // Suppress via whichever closure is currently exposed on window (the
      // just-re-injected one) — exactly what suppressProgressInTab does.
      await chrome.scripting.executeScript({
        target: { tabId },
        func: () => (window as any).__gofully_suppress_progress?.(),
      });

      // Deliver a REAL CAPTURE_PROGRESS message the way service-worker.ts's
      // sendProgress actually does, so it's handled by whichever closure's
      // listener registered FIRST — not necessarily the one just suppressed.
      await chrome.tabs.sendMessage(tabId, {
        type: "CAPTURE_PROGRESS",
        payload: { current: 1, total: 3, phase: "preparing" },
      }).catch(() => {});

      const [{ result: badgeExists }] = await chrome.scripting.executeScript({
        target: { tabId },
        func: () => !!document.getElementById("gofully-progress-overlay"),
      });

      return { badgeExists };
    });

    expect(result).not.toHaveProperty("error");
    expect(
      (result as { badgeExists: boolean }).badgeExists,
      "Badge was created by a real CAPTURE_PROGRESS message despite suppression — the message listener and the suppress call are talking to different result-bar.js instances"
    ).toBe(false);

    await popupPage.close();
    await page.close();
  });

  // End-to-end version of TC-BADGE-003. A fixed setTimeout delay on
  // CAPTURE_PROGRESS delivery can't reliably land inside the real race
  // window (the gap between hideProgressInTab's check and the shutter
  // actually opening is a handful of milliseconds, plus real delivery is a
  // full round trip through the page's compositor, not just message-passing
  // latency) — that makes a delay-based repro flaky in both directions.
  //
  // Instead this hooks chrome.scripting.executeScript itself and, every time
  // it sees the exact call hideProgressInTab makes (identified by its
  // function body, which references "gofully-progress-overlay" + "display"),
  // immediately follows it with a second executeScript call that invokes
  // __gofully_show_progress directly — simulating a CAPTURE_PROGRESS message
  // that was delayed just long enough to land the instant after the hide
  // check found nothing, moments before that same shutter. This reproduces
  // the exact real-world failure (confirmed live on sync.com, and reproduced
  // deterministically here against the pre-fix code) on every run.
  test("TC-BADGE-004: Full Page capture does not bake in the badge when a progress update lands right after the hide-check, moments before the shutter", async ({
    context,
    extensionId,
    serviceWorker,
  }) => {
    const page = await context.newPage();
    // Plain, header-free, all-white fixture: TC-BADGE-002/003 reuse the
    // sticky-header long page, but this test scans pixel colors for the
    // badge's dark pill, and that page's own dark sticky header would
    // produce a false positive regardless of whether the badge itself
    // leaked.
    await page.goto("http://localhost:8085/test-page-plain-tall.html");
    await page.waitForLoadState("networkidle");
    await page.bringToFront();

    const targetTabId = await serviceWorker.evaluate(async () => {
      const [t] = await chrome.tabs.query({ url: "http://localhost:8085/test-page-plain-tall.html" });
      return t?.id ?? null;
    });
    expect(targetTabId).not.toBeNull();

    const injectedCount = await serviceWorker.evaluate((tabId: number) => {
      (globalThis as any).__gfBadgeInjectCount = 0;
      const original = chrome.scripting.executeScript.bind(chrome.scripting);
      (chrome.scripting as any).executeScript = async (injection: any) => {
        const result = await original(injection);
        const src = injection?.func?.toString?.() || "";
        if (
          injection?.target?.tabId === tabId &&
          src.includes("gofully-progress-overlay") &&
          src.includes("display")
        ) {
          (globalThis as any).__gfBadgeInjectCount++;
          await original({
            target: { tabId },
            func: () => {
              (window as any).__gofully_show_progress?.(1, 3, "preparing");
            },
          }).catch(() => {});
        }
        return result;
      };
      return true;
    }, targetTabId);
    expect(injectedCount).toBe(true);

    const popupPage = await context.newPage();
    await popupPage.goto(`chrome-extension://${extensionId}/popup.html`);
    await popupPage.waitForLoadState("domcontentloaded");

    const result = await popupPage.evaluate(async (tid: number) => {
      return new Promise<any>((resolve) => {
        chrome.runtime.sendMessage(
          { type: "START_CAPTURE", payload: { mode: "full-page", tabId: tid } },
          resolve
        );
      });
    }, targetTabId);

    expect(result.type).toBe("CAPTURE_COMPLETE");

    // The hide-check must actually have fired at least once for this test to
    // mean anything (otherwise it'd trivially pass with nothing injected).
    const hideCheckCount = await serviceWorker.evaluate(() => (globalThis as any).__gfBadgeInjectCount);
    expect(hideCheckCount).toBeGreaterThan(0);

    // Scan the WHOLE stitched image (the badge can land at any frame
    // boundary, not just the top) for a long horizontal run of the badge's
    // dark pill fill (rgba(16,24,40,0.92) over white ≈ rgb(30,37,52)).
    // Requiring a long contiguous run — much longer than any single glyph or
    // word in the fixture's body text could produce — is what makes this
    // robust against false positives from the page's own dark-navy text
    // color, without needing to predict exactly which y-bands are safe.
    const scan = await popupPage.evaluate(async (dataUrl: string) => {
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
      const { width, height, data } = ctx.getImageData(0, 0, img.width, img.height);

      const isDarkPill = (i: number) => data[i] < 45 && data[i + 1] < 50 && data[i + 2] < 65;
      let longestRun = 0;
      let longestRunY = -1;
      for (let y = 0; y < height; y++) {
        let run = 0;
        const rowStart = y * width * 4;
        for (let x = 0; x < width; x++) {
          const i = rowStart + x * 4;
          if (isDarkPill(i)) {
            run++;
            if (run > longestRun) {
              longestRun = run;
              longestRunY = y;
            }
          } else {
            run = 0;
          }
        }
      }
      return { longestRun, longestRunY, imageWidth: width, imageHeight: height };
    }, result.payload.dataUrl);

    // The real badge pill is ~270px wide; 150px of contiguous dark fill is a
    // safe margin above anything the fixture's body text could produce.
    expect(
      scan.longestRun,
      `Found a ${scan.longestRun}px contiguous dark-pill run at y=${scan.longestRunY} — progress badge likely leaked into the capture`
    ).toBeLessThan(150);

    await popupPage.close();
    await page.close();
  });

  // Same deterministic race-injection technique as TC-BADGE-004, applied to
  // Visible Area capture — it has its own onProgress("capturing") fire-and-
  // forget event ahead of its single shutter (captureVisibleArea in
  // capture-engine.ts), so it's exposed to the exact same race.
  test("TC-BADGE-005: Visible Area capture does not bake in the badge when a progress update lands right after the hide-check", async ({
    context,
    extensionId,
    serviceWorker,
  }) => {
    const page = await context.newPage();
    await page.goto("http://localhost:8085/test-page-plain-tall.html");
    await page.waitForLoadState("networkidle");
    await page.bringToFront();

    const targetTabId = await serviceWorker.evaluate(async () => {
      const [t] = await chrome.tabs.query({ url: "http://localhost:8085/test-page-plain-tall.html" });
      return t?.id ?? null;
    });
    expect(targetTabId).not.toBeNull();

    await serviceWorker.evaluate((tabId: number) => {
      (globalThis as any).__gfBadgeInjectCount = 0;
      const original = chrome.scripting.executeScript.bind(chrome.scripting);
      (chrome.scripting as any).executeScript = async (injection: any) => {
        const result = await original(injection);
        const src = injection?.func?.toString?.() || "";
        if (
          injection?.target?.tabId === tabId &&
          src.includes("gofully-progress-overlay") &&
          src.includes("display")
        ) {
          (globalThis as any).__gfBadgeInjectCount++;
          await original({
            target: { tabId },
            func: () => {
              (window as any).__gofully_show_progress?.(1, 1, "capturing");
            },
          }).catch(() => {});
        }
        return result;
      };
    }, targetTabId);

    const popupPage = await context.newPage();
    await popupPage.goto(`chrome-extension://${extensionId}/popup.html`);
    await popupPage.waitForLoadState("domcontentloaded");

    const result = await popupPage.evaluate(async (tid: number) => {
      return new Promise<any>((resolve) => {
        chrome.runtime.sendMessage(
          { type: "START_CAPTURE", payload: { mode: "visible-area", tabId: tid } },
          resolve
        );
      });
    }, targetTabId);

    expect(result.type).toBe("CAPTURE_COMPLETE");

    const hideCheckCount = await serviceWorker.evaluate(() => (globalThis as any).__gfBadgeInjectCount);
    expect(hideCheckCount).toBeGreaterThan(0);

    const scan = await popupPage.evaluate(async (dataUrl: string) => {
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
      const { width, height, data } = ctx.getImageData(0, 0, img.width, img.height);

      const isDarkPill = (i: number) => data[i] < 45 && data[i + 1] < 50 && data[i + 2] < 65;
      let longestRun = 0;
      let longestRunY = -1;
      for (let y = 0; y < height; y++) {
        let run = 0;
        const rowStart = y * width * 4;
        for (let x = 0; x < width; x++) {
          const i = rowStart + x * 4;
          if (isDarkPill(i)) {
            run++;
            if (run > longestRun) {
              longestRun = run;
              longestRunY = y;
            }
          } else {
            run = 0;
          }
        }
      }
      return { longestRun, longestRunY };
    }, result.payload.dataUrl);

    expect(
      scan.longestRun,
      `Found a ${scan.longestRun}px contiguous dark-pill run at y=${scan.longestRunY} — progress badge likely leaked into the capture`
    ).toBeLessThan(150);

    await popupPage.close();
    await page.close();
  });

  // Same technique again, applied to Selected Area capture
  // (captureSelectedArea in capture-engine.ts). It doesn't fire its own
  // onProgress event, but it shares the same hideProgressInTab-guarded
  // shutter, so a progress update from any concurrent source landing at the
  // wrong instant is the same class of risk — this proves the suppression
  // wrap closes it there too.
  test("TC-BADGE-006: Selected Area capture does not bake in the badge when a progress update lands right after the hide-check", async ({
    context,
    extensionId,
    serviceWorker,
  }) => {
    const page = await context.newPage();
    await page.goto("http://localhost:8085/test-page-plain-tall.html");
    await page.waitForLoadState("networkidle");
    await page.bringToFront();

    const targetTabId = await serviceWorker.evaluate(async () => {
      const [t] = await chrome.tabs.query({ url: "http://localhost:8085/test-page-plain-tall.html" });
      return t?.id ?? null;
    });
    expect(targetTabId).not.toBeNull();

    await serviceWorker.evaluate((tabId: number) => {
      (globalThis as any).__gfBadgeInjectCount = 0;
      const original = chrome.scripting.executeScript.bind(chrome.scripting);
      (chrome.scripting as any).executeScript = async (injection: any) => {
        const result = await original(injection);
        const src = injection?.func?.toString?.() || "";
        if (
          injection?.target?.tabId === tabId &&
          src.includes("gofully-progress-overlay") &&
          src.includes("display")
        ) {
          (globalThis as any).__gfBadgeInjectCount++;
          await original({
            target: { tabId },
            func: () => {
              (window as any).__gofully_show_progress?.(1, 1, "capturing");
            },
          }).catch(() => {});
        }
        return result;
      };
    }, targetTabId);

    const popupPage = await context.newPage();
    await popupPage.goto(`chrome-extension://${extensionId}/popup.html`);
    await popupPage.waitForLoadState("domcontentloaded");

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
    }, targetTabId);

    expect(result.type).toBe("CAPTURE_COMPLETE");

    const hideCheckCount = await serviceWorker.evaluate(() => (globalThis as any).__gfBadgeInjectCount);
    expect(hideCheckCount).toBeGreaterThan(0);

    const scan = await popupPage.evaluate(async (dataUrl: string) => {
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
      const { width, height, data } = ctx.getImageData(0, 0, img.width, img.height);

      const isDarkPill = (i: number) => data[i] < 45 && data[i + 1] < 50 && data[i + 2] < 65;
      let longestRun = 0;
      let longestRunY = -1;
      for (let y = 0; y < height; y++) {
        let run = 0;
        const rowStart = y * width * 4;
        for (let x = 0; x < width; x++) {
          const i = rowStart + x * 4;
          if (isDarkPill(i)) {
            run++;
            if (run > longestRun) {
              longestRun = run;
              longestRunY = y;
            }
          } else {
            run = 0;
          }
        }
      }
      return { longestRun, longestRunY };
    }, result.payload.dataUrl);

    expect(
      scan.longestRun,
      `Found a ${scan.longestRun}px contiguous dark-pill run at y=${scan.longestRunY} — progress badge likely leaked into the capture`
    ).toBeLessThan(150);

    await popupPage.close();
    await page.close();
  });
});
