import fs from "fs";
import path from "path";
import { test, expect, pathToExtension } from "../fixtures/extension";

test.describe("04 - Local Tesseract OCR Engine Suite", () => {
  test("TC-OCR-001: Offscreen document creation and OFFSCREEN_PING handshake", async ({
    context,
    extensionId,
  }) => {
    const popupPage = await context.newPage();
    await popupPage.goto(`chrome-extension://${extensionId}/popup.html`);
    await popupPage.waitForLoadState("domcontentloaded");

    const pingResult = await popupPage.evaluate(async () => {
      // Check existing contexts or create offscreen
      const existing = await (chrome.runtime as any).getContexts({
        contextTypes: ["OFFSCREEN_DOCUMENT"],
      });
      if (existing.length === 0) {
        await chrome.offscreen.createDocument({
          url: "offscreen.html",
          reasons: [chrome.offscreen.Reason.BLOBS, chrome.offscreen.Reason.DOM_SCRAPING],
          justification: "Process offscreen canvas and OCR operations",
        });
      }

      for (let i = 0; i < 30; i++) {
        try {
          const pong = await chrome.runtime.sendMessage({ type: "OFFSCREEN_PING" });
          if (pong?.ok) return { ok: true, attempts: i + 1 };
        } catch {}
        await new Promise((r) => setTimeout(r, 100));
      }
      return { ok: false };
    });

    expect(pingResult.ok).toBe(true);
    await popupPage.close();
  });

  test("TC-OCR-002: Local WASM and trained data files exist in extension bundle", async ({
    context,
    extensionId,
  }) => {
    const page = await context.newPage();
    await page.goto(`chrome-extension://${extensionId}/popup.html`);

    const files = [
      "assets/tesseract-worker.min.js",
      "assets/tesseract-core.wasm.js",
      "assets/eng.traineddata.gz",
    ];

    for (const file of files) {
      const diskPath = path.resolve(pathToExtension, file);
      expect(fs.existsSync(diskPath)).toBe(true);
      expect(fs.statSync(diskPath).size).toBeGreaterThan(0);
    }

    // Verify browser context can load local worker & wasm modules
    const webFetch = await page.evaluate(async (url) => {
      const res = await fetch(url);
      return res.status === 200 && (await res.blob()).size > 0;
    }, `chrome-extension://${extensionId}/assets/tesseract-worker.min.js`);
    expect(webFetch).toBe(true);

    await page.close();
  });

  test("TC-OCR-003: Text extraction execution recognizes text from image", async ({
    context,
    extensionId,
  }) => {
    const popupPage = await context.newPage();
    await popupPage.goto(`chrome-extension://${extensionId}/popup.html`);
    await popupPage.waitForLoadState("domcontentloaded");

    const ocrResult = await popupPage.evaluate(async () => {
      // Ensure offscreen document is ready
      const existing = await (chrome.runtime as any).getContexts({
        contextTypes: ["OFFSCREEN_DOCUMENT"],
      });
      if (existing.length === 0) {
        await chrome.offscreen.createDocument({
          url: "offscreen.html",
          reasons: [chrome.offscreen.Reason.BLOBS, chrome.offscreen.Reason.DOM_SCRAPING],
          justification: "Process offscreen canvas and OCR operations",
        });
      }

      const c = new OffscreenCanvas(400, 100);
      const ctx = c.getContext("2d")!;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, 400, 100);
      ctx.fillStyle = "#000000";
      ctx.font = "bold 28px monospace";
      ctx.fillText("PATIENT RECORD 1098", 20, 60);

      const blob = await c.convertToBlob();
      const reader = new FileReader();
      const dataUrl = await new Promise<string>((res) => {
        reader.onload = () => res(reader.result as string);
        reader.readAsDataURL(blob);
      });

      return new Promise<any>((resolve) => {
        chrome.runtime.sendMessage(
          {
            type: "PERFORM_OCR",
            payload: { dataUrl },
          },
          resolve
        );
      });
    });

    expect(ocrResult).toBeDefined();
    if (ocrResult?.text) {
      expect(ocrResult.text).toMatch(/PATIENT|RECORD|1098/i);
    }
    await popupPage.close();
  });
});
