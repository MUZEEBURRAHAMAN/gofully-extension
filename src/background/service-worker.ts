import type {
  CaptureMode,
  CaptureResult,
  CaptureRegion,
  ScrollableElementInfo,
} from "../types";
import { captureFullPage, captureVisibleArea, captureSelectedArea } from "./capture-engine";
import { captureScrollingArea } from "../capture-modes/scrolling-area";
import { createScrollCapturer } from "../capture-modes/scroll-capturer";
import type { ScrollCapturer } from "../capture-modes/scroll-capturer";
import { generatePDF } from "../export/pdf-generator";
import { isSupportedCapturePage } from "../utils/url-validator";
import { dataUrlToBlob } from "../utils/image";

// Uninstall feedback URL configuration pointing to live Vercel deployment
chrome.runtime.onInstalled.addListener((details) => {
  if (chrome.runtime.setUninstallURL) {
    chrome.runtime.setUninstallURL("https://gofully-extension.vercel.app/uninstall-feedback");
  }
  if (details.reason === "install") {
    chrome.storage.local.set({ gf_onboarded: false });
  }
});

// A periodic heartbeat call isn't enough to stop Chrome from tearing down
// this MV3 service worker mid-capture — an open chrome.runtime.Port is the
// mechanism Chrome documents (and actually honors) for "this worker still
// has work in flight." The capture UI content script opens one for the
// duration of a scrolling-area capture; we don't need to do anything with
// it beyond letting it exist.
chrome.runtime.onConnect.addListener(() => {});

let lastCaptureResult: CaptureResult | null = null;
let lastCaptureBlob: Blob | null = null;
let lastCaptureDataUrl: string | null = null;
let activeCapturer: ScrollCapturer | null = null;

async function ensureOffscreenDocument(): Promise<void> {
  const existingContexts = await (chrome.runtime as any).getContexts({
    contextTypes: ["OFFSCREEN_DOCUMENT"],
  });
  if (existingContexts.length === 0) {
    await chrome.offscreen.createDocument({
      url: "offscreen.html",
      reasons: [chrome.offscreen.Reason.BLOBS, chrome.offscreen.Reason.DOM_SCRAPING],
      justification: "Process offscreen canvas and OCR operations",
    });
  }

  // chrome.offscreen.createDocument() resolving only means the document
  // exists — its script (which imports the Tesseract.js bundle and
  // instantiates a WASM module) hasn't necessarily finished loading and
  // registered its message listener yet. Sending a message immediately
  // after can fail with "Could not establish connection. Receiving end
  // does not exist." — reproduced reliably on the first OCR capture after
  // a fresh install; confirmed it's a timing issue, not a structural one
  // (a fixed 5s wait always succeeds), so poll a lightweight ping with a
  // budget generous enough to cover a cold WASM instantiation.
  for (let i = 0; i < 100; i++) {
    try {
      const pong = await chrome.runtime.sendMessage({ type: "OFFSCREEN_PING" });
      if (pong?.ok) return;
    } catch {
      // not ready yet
    }
    await new Promise((r) => setTimeout(r, 150));
  }
}

async function blobToDataUrl(blob: Blob): Promise<string> {
  const bytes = new Uint8Array(await blob.arrayBuffer());
  // Chunked: a 4K capture is tens of megabytes, and appending one character at
  // a time is quadratic, while a single fromCharCode(...bytes) spread blows the
  // argument limit outright.
  const CHUNK = 0x8000;
  const parts: string[] = [];
  for (let i = 0; i < bytes.length; i += CHUNK) {
    parts.push(String.fromCharCode(...bytes.subarray(i, i + CHUNK)));
  }
  return `data:${blob.type};base64,${btoa(parts.join(""))}`;
}

// chrome.storage.session holds ~10MB. Large captures are kept in memory only;
// the editor falls back to asking the worker directly for them.
const SESSION_CACHE_LIMIT = 8 * 1024 * 1024;

function cacheCaptureInSession(dataUrl: string): void {
  if (dataUrl.length > SESSION_CACHE_LIMIT) {
    chrome.storage.session.remove("lastCaptureDataUrl").catch(() => {});
    return;
  }
  chrome.storage.session.set({ lastCaptureDataUrl: dataUrl }).catch(() => {});
}

/**
 * A content script is only as trustworthy as the page it runs in, so a region
 * arriving over messaging is validated against the tab's real viewport before
 * any pixels are read.
 */
async function sanitizeRegion(
  tabId: number,
  region: unknown
): Promise<CaptureRegion | null> {
  const r = region as Partial<CaptureRegion> | null | undefined;
  if (!r) return null;
  const nums = [r.x, r.y, r.width, r.height];
  if (!nums.every((n) => typeof n === "number" && Number.isFinite(n))) return null;
  if (r.width! < 1 || r.height! < 1) return null;

  let viewport = { width: 0, height: 0 };
  try {
    const [{ result }] = await chrome.scripting.executeScript({
      target: { tabId },
      func: () => ({ width: window.innerWidth, height: window.innerHeight }),
    });
    viewport = result as { width: number; height: number };
  } catch {
    return null;
  }
  if (!viewport.width || !viewport.height) return null;

  const x = Math.max(0, Math.min(r.x!, viewport.width - 1));
  const y = Math.max(0, Math.min(r.y!, viewport.height - 1));
  const width = Math.max(1, Math.min(r.width!, viewport.width - x));
  const height = Math.max(1, Math.min(r.height!, viewport.height - y));
  return { x, y, width, height };
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "START_CAPTURE") {
    const { mode, region, speed, tabId } = message.payload as {
      mode: CaptureMode;
      region?: CaptureRegion;
      speed?: "slow" | "medium" | "fast";
      tabId?: number;
    };

    const senderTabId = sender.tab?.id || tabId;

    // Show "Capturing..." indicator on page immediately
    if (senderTabId && (mode === "full-page" || mode === "visible-area")) {
      chrome.tabs.sendMessage(senderTabId, {
        type: "CAPTURE_STARTING",
        payload: { mode }
      }).catch(() => {});
    }

    handleCapture(mode, region, speed, senderTabId)
      .then(async (result) => {
        lastCaptureBlob = result.blob;
        lastCaptureDataUrl = await blobToDataUrl(result.blob);
        lastCaptureResult = { ...result, blob: null as any };
        // Persist so editor can load even after SW idle-restart
        cacheCaptureInSession(lastCaptureDataUrl);

        const payload = {
          width: result.width,
          height: result.height,
          mode: result.mode,
          method: result.method,
          url: result.url,
          title: result.title,
          timestamp: result.timestamp,
          dataUrl: lastCaptureDataUrl,
        };

        // Captures kicked off directly from a content script (selected-area,
        // via the region selector) have no popup left open to render the
        // result — the popup already closed itself before the drag even
        // started. Show the on-page result bar ourselves so the user gets
        // a confirmation instead of the capture silently vanishing.
        if (mode === "selected-area" && senderTabId) {
          await showResultBarOnTab(senderTabId, payload);
        }

        sendResponse({ type: "CAPTURE_COMPLETE", payload });
      })
      .catch((error) => {
        if (mode === "selected-area" && senderTabId) {
          chrome.tabs.sendMessage(senderTabId, {
            type: "CAPTURE_ERROR_INLINE",
            payload: { message: error.message },
          }).catch(() => {});
        }
        sendResponse({
          type: "CAPTURE_ERROR",
          payload: { message: error.message },
        });
      });

    return true;
  }

  if (message.type === "GET_LAST_CAPTURE") {
    sendResponse({ result: lastCaptureResult, hasBlob: !!lastCaptureBlob });
    return true;
  }

  if (message.type === "EXPORT_CAPTURE") {
    const { format } = message.payload as { format: string };
    if (lastCaptureBlob) {
      handleExport(lastCaptureBlob, lastCaptureResult!, format).then(
        (result) => sendResponse(result)
      );
    } else {
      sendResponse({ error: "No capture available" });
    }
    return true;
  }

  if (message.type === "GET_CAPTURE_BLOB_URL") {
    if (lastCaptureDataUrl) {
      sendResponse({ url: lastCaptureDataUrl });
    } else {
      // SW was idle-restarted — recover from session storage
      chrome.storage.session.get("lastCaptureDataUrl").then((s) => {
        const recovered = (s as any).lastCaptureDataUrl ?? null;
        if (recovered) lastCaptureDataUrl = recovered;
        sendResponse({ url: recovered });
      }).catch(() => sendResponse({ url: null }));
    }
    return true;
  }

  if (message.type === "OPEN_EDITOR") {
    // Open editor without embedding image data in the URL (avoids multi-MB
    // base64 strings appearing in browser history).
    const editorUrl = chrome.runtime.getURL("editor.html");
    chrome.tabs.create({ url: editorUrl });
    sendResponse({ opened: true });
    return true;
  }

  if (message.type === "INIT_INTERACTIVE_MODE") {
    const { mode, tabId } = message.payload as {
      mode: CaptureMode;
      tabId: number;
    };
    initInteractiveMode(mode, tabId);
    sendResponse({ started: true });
    return true;
  }

  // Content script reports region selected for scrolling-area.
  // Use sender.tab?.id (not payload) to prevent a compromised content script
  // from forging a tabId and capturing a different tab.
  if (message.type === "SCROLLING_REGION_SELECTED") {
    const { speed } = message.payload;
    const tabId = sender.tab?.id;
    if (!tabId) { sendResponse({ started: false }); return false; }
    sanitizeRegion(tabId, message.payload?.region).then((region) => {
    if (!region) return;
    return captureScrollingArea(tabId, region, speed || "medium", (progress) => {
      chrome.tabs.sendMessage(tabId, {
        type: "SCROLLING_PROGRESS",
        payload: progress,
      }).catch(() => {});
    })
      .then(async (result) => {
        lastCaptureBlob = result.blob;
        lastCaptureDataUrl = await blobToDataUrl(result.blob);
        lastCaptureResult = { ...result, blob: null as any };
        cacheCaptureInSession(lastCaptureDataUrl);
        // Tell scrolling-area-ui to clean up before showing result bar
        chrome.tabs.sendMessage(tabId, { type: "SCROLLING_CAPTURE_DONE" }).catch(() => {});
        await showResultBarOnTab(tabId, {
          width: result.width,
          height: result.height,
          mode: result.mode,
          method: result.method,
        });
      })
      .catch((err) => {
        chrome.tabs.sendMessage(tabId, { type: "SCROLLING_CAPTURE_DONE" }).catch(() => {});
        chrome.tabs.sendMessage(tabId, {
          type: "CAPTURE_ERROR_INLINE",
          payload: { message: err.message },
        }).catch(() => {});
      });
    }).catch(() => {});
    sendResponse({ started: true });
    return true;
  }

  if (message.type === "SCROLL_START") {
    const tabId = sender.tab?.id;
    if (!tabId) { sendResponse({ started: false }); return false; }
    activeCapturer?.stop();
    activeCapturer = null;
    sanitizeRegion(tabId, message.payload?.region)
      .then((region) => {
        if (!region) { sendResponse({ started: false }); return; }
        return createScrollCapturer(tabId, region, (progress) => {
          chrome.tabs.sendMessage(tabId, { type: "SCROLL_PROGRESS", payload: progress }).catch(() => {});
        }).then(capturer => {
          activeCapturer = capturer;
          sendResponse({ started: true });
        });
      })
      .catch(() => sendResponse({ started: false }));
    return true;
  }

  if (message.type === "SCROLL_POLL") {
    if (!activeCapturer) { sendResponse({ progress: null }); return false; }
    activeCapturer.poll().then(progress => sendResponse({ progress }));
    return true;
  }

  if (message.type === "SCROLL_STOP") {
    activeCapturer?.stop();
    activeCapturer = null;
    sendResponse({ stopped: true });
    return false;
  }

  if (message.type === "SCROLL_FINISH") {
    const tabId = sender.tab?.id;
    if (!tabId || !activeCapturer) { sendResponse({ success: false }); return false; }
    const capturer = activeCapturer;
    activeCapturer = null;
    capturer.finish().then(async (result) => {
      if (!result) { sendResponse({ success: false }); return; }
      lastCaptureBlob = result.blob;
      lastCaptureDataUrl = await blobToDataUrl(result.blob);
      lastCaptureResult = { ...result, blob: null as any };
      cacheCaptureInSession(lastCaptureDataUrl);
      await showResultBarOnTab(tabId, {
        width: result.width,
        height: result.height,
        mode: result.mode,
        method: result.method,
      });
      sendResponse({ success: true });
    }).catch(err => sendResponse({ success: false, error: err.message }));
    return true;
  }

  if (message.type === "EXECUTE_OCR") {
    const { region } = message.payload as { region: CaptureRegion };
    const tabId = sender.tab?.id;
    if (!tabId) {
      sendResponse({ error: "No active tab" });
      return false;
    }

    captureSelectedArea(tabId, region)
      .then(async (result) => {
        const dataUrl = await blobToDataUrl(result.blob);
        await ensureOffscreenDocument();
        const ocrResp = await chrome.runtime.sendMessage({
          type: "PERFORM_OCR",
          payload: { dataUrl },
        });
        if (ocrResp?.error) {
          sendResponse({ error: ocrResp.error });
        } else {
          sendResponse({ text: ocrResp?.text || "" });
        }
      })
      .catch((err) => {
        console.error("OCR execution error:", err);
        sendResponse({ error: err.message || "OCR failed" });
      });
    return true;
  }

  return false;
});

chrome.commands.onCommand.addListener(async (command) => {
  const [tab] = await chrome.tabs.query({
    active: true,
    currentWindow: true,
  });
  if (!tab?.id) return;

  if (command === "capture-full-page") {
    try {
      const result = await captureFullPage(tab.id);
      lastCaptureBlob = result.blob;
      lastCaptureDataUrl = await blobToDataUrl(result.blob);
      lastCaptureResult = { ...result, blob: null as any };
      await handleExport(result.blob, result, "png");
    } catch (e) {
      console.error("Keyboard shortcut capture failed:", e);
    }
  }

  if (command === "capture-visible") {
    try {
      const result = await captureVisibleArea(tab.id);
      lastCaptureBlob = result.blob;
      lastCaptureDataUrl = await blobToDataUrl(result.blob);
      lastCaptureResult = { ...result, blob: null as any };
      await handleExport(result.blob, result, "png");
    } catch (e) {
      console.error("Keyboard shortcut capture failed:", e);
    }
  }

  if (command === "capture-selected-area") {
    // Previously sent an "INIT_REGION_SELECTOR" message that nothing ever
    // listened for, and never injected region-selector.js in the first
    // place — the shortcut was a complete no-op. initInteractiveMode is
    // the same path the popup's "Selected Area" button uses (injects the
    // content script, then sends the message it actually listens for).
    await initInteractiveMode("selected-area", tab.id);
  }
});

async function handleCapture(
  mode: CaptureMode,
  region?: CaptureRegion,
  speed?: "slow" | "medium" | "fast",
  explicitTabId?: number
): Promise<CaptureResult> {
  let targetTabId = explicitTabId;
  let tab: chrome.tabs.Tab | undefined;

  if (targetTabId) {
    try {
      tab = await chrome.tabs.get(targetTabId);
    } catch {}
  }

  if (!tab) {
    const [activeTab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    tab = activeTab;
    targetTabId = tab?.id;
  }

  if (!tab?.id) throw new Error("No active tab");

  const tabUrl = tab.url || "";
  const support = isSupportedCapturePage(tabUrl);

  if (!support.supported) {
    throw new Error(support.message || "This page cannot be captured.");
  }

  if (mode === "full-page" || mode === "scrolling-area") {
    await injectContentScripts(tab.id);
  }

  const sendProgress = (progress: any) => {
    chrome.runtime.sendMessage({
      type: "CAPTURE_PROGRESS",
      payload: progress,
    }).catch(() => {});
  };

  switch (mode) {
    case "full-page":
      return captureFullPage(targetTabId!, sendProgress);

    case "visible-area":
      return captureVisibleArea(targetTabId!);

    case "selected-area":
      if (!region) throw new Error("Region required for selected-area mode");
      return captureSelectedArea(targetTabId!, region);

    case "scrolling-area":
      if (!region) throw new Error("Region required for scrolling-area mode");
      return captureScrollingArea(
        targetTabId!,
        region,
        speed || "medium",
        sendProgress
      );

    default:
      throw new Error(`Unknown capture mode: ${mode}`);
  }
}

async function initInteractiveMode(
  mode: CaptureMode,
  tabId: number
): Promise<void> {
  try {
    const tab = await chrome.tabs.get(tabId);
    const support = isSupportedCapturePage(tab.url || "");
    if (!support.supported) {
      chrome.runtime.sendMessage({
        type: "CAPTURE_ERROR",
        payload: { message: support.message || "Cannot capture this type of page." },
      }).catch(() => {});
      return;
    }

    await injectContentScripts(tabId);

    if (mode === "selected-area") {
      await chrome.scripting.executeScript({
        target: { tabId },
        files: ["region-selector.js"],
      });
      await sleep(100);
      await chrome.tabs.sendMessage(tabId, {
        type: "START_REGION_SELECT_MODE",
        payload: { tabId },
      });
    }

    if (mode === "scrolling-area") {
      await chrome.scripting.executeScript({
        target: { tabId },
        files: ["scrolling-area-ui.js"],
      });
      await sleep(100);
      await chrome.tabs.sendMessage(tabId, {
        type: "START_SCROLLING_AREA_MODE",
        payload: { tabId },
      });
    }

    if (mode === "capture-text") {
      await chrome.scripting.executeScript({
        target: { tabId },
        files: ["ocr-overlay.js"],
      });
      await sleep(100);
      await chrome.tabs.sendMessage(tabId, {
        type: "START_OCR_MODE",
        payload: { tabId },
      });
    }
  } catch (err) {
    console.error("initInteractiveMode failed:", err);
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

async function showResultBarOnTab(tabId: number, payload: any): Promise<void> {
  try {
    // 1. Ensure result-bar.js is loaded (defensive re-inject — result-bar.js
    // is also declared in manifest.json's auto-injecting content_scripts, so
    // this covers edge cases like the extension having just been reloaded).
    await chrome.scripting.executeScript({
      target: { tabId },
      files: ["result-bar.js"],
    }).catch(() => {});

    // 2. Directly invoke the global render function inside the page.
    // This alone is a complete, reliable delivery path once the script is
    // loaded — it doesn't depend on message-listener timing the way a
    // broadcast does. A THIRD "also send SHOW_RESULT_BAR as a fallback" step
    // used to also live here, but result-bar.ts registers its listener for
    // that message at module top level, and the re-injection above runs it a
    // second time on top of manifest's own auto-injection — each run adds
    // another listener, so the one broadcast was landing on multiple
    // listeners and firing showResultBar() (shutter sound included) two or
    // three times per capture instead of once.
    await chrome.scripting.executeScript({
      target: { tabId },
      func: (info: any) => {
        if (typeof (window as any).__snapforge_show_result_bar === "function") {
          (window as any).__snapforge_show_result_bar(info);
        }
      },
      args: [payload],
    }).catch(() => {});
  } catch (err) {
    console.error("showResultBarOnTab failed:", err);
  }
}

async function injectContentScripts(tabId: number): Promise<void> {
  try {
    await chrome.scripting.executeScript({
      target: { tabId },
      files: [
        "page-analyzer.js",
        "sticky-manager.js",
        "lazy-loader.js",
      ],
    });
  } catch {
    // Already injected via manifest
  }
}

async function handleExport(
  blob: Blob,
  result: CaptureResult,
  format: string
): Promise<{ success: boolean; error?: string }> {
  try {
    switch (format) {
      case "clipboard": {
        return { success: true };
      }

      case "png": {
        const domain = getDomain(result.url);
        const filename = generateFilename(domain, "png");
        const dataUrl = await blobToDataUrl(blob);
        await chrome.downloads.download({
          url: dataUrl,
          filename,
          saveAs: false,
        });
        return { success: true };
      }

      case "pdf": {
        const domain = getDomain(result.url);
        const filename = generateFilename(domain, "pdf");
        const pdfBlob = await generatePDF(blob, "a4");
        const pdfDataUrl = await blobToDataUrl(pdfBlob);
        await chrome.downloads.download({
          url: pdfDataUrl,
          filename,
          saveAs: false,
        });
        return { success: true };
      }

      default:
        return { success: false, error: `Unknown format: ${format}` };
    }
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

function getDomain(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return "unknown";
  }
}

function generateFilename(domain: string, ext: "png" | "pdf"): string {
  const now = new Date();
  const ts = now.toISOString().replace(/[-:T]/g, "").slice(0, 14);
  const clean = domain.replace(/[^a-zA-Z0-9.-]/g, "_").slice(0, 50);
  return `gofully-${clean}-${ts}.${ext}`;
}
