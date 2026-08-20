import type {
  CaptureMode,
  CaptureResult,
  CaptureRegion,
  ScrollableElementInfo,
} from "../types";
import { captureFullPage, captureVisibleArea, captureSelectedArea } from "./capture-engine";
import {
  captureScrollingArea,
  captureManualFrame,
  stitchManualFrames,
} from "../capture-modes/scrolling-area";
import { generatePDF } from "../export/pdf-generator";
import type { CaptureFrame } from "../types";

let lastCaptureResult: CaptureResult | null = null;
let lastCaptureBlob: Blob | null = null;
let lastCaptureDataUrl: string | null = null;
let manualFrames: CaptureFrame[] = [];

async function ensureOffscreenDocument(): Promise<void> {
  const existingContexts = await (chrome.runtime as any).getContexts({
    contextTypes: ["OFFSCREEN_DOCUMENT"],
  });
  if (existingContexts.length > 0) return;

  await chrome.offscreen.createDocument({
    url: "offscreen.html",
    reasons: [chrome.offscreen.Reason.BLOBS, chrome.offscreen.Reason.DOM_SCRAPING],
    justification: "Process offscreen canvas and OCR operations",
  });
}

async function blobToDataUrl(blob: Blob): Promise<string> {
  const buffer = await blob.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return `data:${blob.type};base64,${btoa(binary)}`;
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "START_CAPTURE") {
    const { mode, region, speed, elementInfo, tabId } = message.payload as {
      mode: CaptureMode;
      region?: CaptureRegion;
      speed?: "slow" | "medium" | "fast";
      elementInfo?: ScrollableElementInfo;
      tabId?: number;
    };

    const senderTabId = sender.tab?.id || tabId;

    handleCapture(mode, region, speed, elementInfo, senderTabId)
      .then(async (result) => {
        lastCaptureBlob = result.blob;
        lastCaptureDataUrl = await blobToDataUrl(result.blob);
        lastCaptureResult = { ...result, blob: null as any };

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

        sendResponse({ type: "CAPTURE_COMPLETE", payload });

        // Show result HUD immediately on the tab
        let targetTab = senderTabId;
        if (!targetTab) {
          const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
          targetTab = activeTab?.id;
        }
        if (targetTab && (mode === "selected-area" || mode === "scrolling-area" || mode === "full-page" || mode === "visible-area")) {
          await showResultBarOnTab(targetTab, payload);
        }

        // Broadcast to popup (if open)
        chrome.runtime.sendMessage({
          type: "CAPTURE_COMPLETE",
          payload,
        }).catch(() => {});
      })
      .catch((error) => {
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
      sendResponse({ url: null });
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
    const { region, speed } = message.payload;
    const tabId = sender.tab?.id;
    if (!tabId) { sendResponse({ started: false }); return false; }
    captureScrollingArea(tabId, region, speed || "medium", (progress) => {
      chrome.tabs.sendMessage(tabId, {
        type: "SCROLLING_PROGRESS",
        payload: progress,
      }).catch(() => {});
    })
      .then(async (result) => {
        lastCaptureBlob = result.blob;
        lastCaptureDataUrl = await blobToDataUrl(result.blob);
        lastCaptureResult = { ...result, blob: null as any };
        await showResultBarOnTab(tabId, {
          width: result.width,
          height: result.height,
          mode: result.mode,
          method: result.method,
        });
      })
      .catch((err) => {
        chrome.tabs.sendMessage(tabId, {
          type: "CAPTURE_ERROR_INLINE",
          payload: { message: err.message },
        }).catch(() => {});
      });
    sendResponse({ started: true });
    return true;
  }

  if (message.type === "MANUAL_CAPTURE_FRAME") {
    const { region } = message.payload;
    const tabId = sender.tab?.id;
    if (!tabId) { sendResponse({ success: false }); return false; }
    captureManualFrame(tabId, region).then((frame) => {
      if (frame) manualFrames.push(frame);
      sendResponse({ success: !!frame, count: manualFrames.length });
    });
    return true;
  }

  if (message.type === "FINISH_MANUAL_CAPTURE") {
    const { region } = message.payload;
    const tabId = sender.tab?.id;
    if (!tabId || manualFrames.length === 0) {
      sendResponse({ success: false });
      return false;
    }
    const framesToStitch = [...manualFrames];
    manualFrames = [];
    stitchManualFrames(framesToStitch, region, tabId)
      .then(async (result) => {
        lastCaptureBlob = result.blob;
        lastCaptureDataUrl = await blobToDataUrl(result.blob);
        lastCaptureResult = { ...result, blob: null as any };
        await showResultBarOnTab(tabId, {
          width: result.width,
          height: result.height,
          mode: result.mode,
          method: result.method,
        });
        sendResponse({ success: true });
      })
      .catch((err) => {
        sendResponse({ success: false, error: err.message });
      });
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
});

async function handleCapture(
  mode: CaptureMode,
  region?: CaptureRegion,
  speed?: "slow" | "medium" | "fast",
  elementInfo?: ScrollableElementInfo,
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
  const isRestrictedPage = isRestrictedUrl(tabUrl);

  if (isRestrictedPage && mode !== "visible-area") {
    throw new Error(
      "Cannot capture this type of page. Navigate to a regular website and try again, or use 'Visible Area' mode."
    );
  }

  if (!isRestrictedPage && (mode === "full-page" || mode === "scrolling-area")) {
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

function isRestrictedUrl(url: string): boolean {
  return (
    !url ||
    url.startsWith("chrome://") ||
    url.startsWith("chrome-extension://") ||
    url.startsWith("about:") ||
    url.startsWith("chrome-search://") ||
    url.startsWith("devtools://") ||
    url.startsWith("edge://")
  );
}

async function initInteractiveMode(
  mode: CaptureMode,
  tabId: number
): Promise<void> {
  try {
    const tab = await chrome.tabs.get(tabId);
    if (isRestrictedUrl(tab.url || "")) {
      // Can't inject scripts on restricted pages — notify the user via the popup error
      chrome.runtime.sendMessage({
        type: "CAPTURE_ERROR",
        payload: { message: "Cannot use this mode on a browser page. Navigate to a regular website first." },
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
    // 1. Ensure result-bar.js is loaded
    await chrome.scripting.executeScript({
      target: { tabId },
      files: ["result-bar.js"],
    }).catch(() => {});

    // 2. Directly invoke the global render function inside the page
    await chrome.scripting.executeScript({
      target: { tabId },
      func: (info: any) => {
        if (typeof (window as any).__snapforge_show_result_bar === "function") {
          (window as any).__snapforge_show_result_bar(info);
        }
      },
      args: [payload],
    }).catch(() => {});

    // 3. Also dispatch message as fallback
    await chrome.tabs.sendMessage(tabId, {
      type: "SHOW_RESULT_BAR",
      payload,
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
