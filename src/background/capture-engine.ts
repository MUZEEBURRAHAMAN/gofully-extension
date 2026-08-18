import type {
  CaptureMode,
  CaptureResult,
  PageDimensions,
  CaptureRegion,
  CaptureProgress,
} from "../types";
import { getCaptureMethod } from "../utils/permissions";
import { captureWithCDP } from "./cdp-capture";
import { captureWithScrollStitch } from "./stitch-capture";
import { dataUrlToBlob, loadImage } from "../utils/image";
import { detectDPRFromCapture } from "../utils/dpr-handler";

const MAX_CDP_HEIGHT = 16384;

export async function captureFullPage(
  tabId: number,
  onProgress?: (progress: CaptureProgress) => void
): Promise<CaptureResult> {
  const dimensions = await getPageDimensions(tabId);
  const method = await getCaptureMethod(dimensions.scrollHeight);

  if (method === "cdp") {
    try {
      return await captureWithCDP(tabId, dimensions);
    } catch (e) {
      // CDP failed — fall back to scroll-stitch
      console.warn("CDP capture failed, falling back to scroll-stitch:", e);
      return captureWithScrollStitch(tabId, dimensions, onProgress);
    }
  }
  return captureWithScrollStitch(tabId, dimensions, onProgress);
}

export async function captureVisibleArea(
  tabId: number
): Promise<CaptureResult> {
  const dataUrl = await chrome.tabs.captureVisibleTab({ format: "png" });
  const blob = dataUrlToBlob(dataUrl);
  const img = await loadImage(dataUrl);
  const tab = await chrome.tabs.get(tabId);

  return {
    blob,
    width: img.width,
    height: img.height,
    mode: "visible-area",
    method: "cdp",
    timestamp: Date.now(),
    url: tab.url || "",
    title: tab.title || "",
  };
}

export async function captureSelectedArea(
  tabId: number,
  region: CaptureRegion
): Promise<CaptureResult> {
  const dataUrl = await chrome.tabs.captureVisibleTab({ format: "png" });
  const img = await loadImage(dataUrl);
  const [{ result: vpWidth }] = await chrome.scripting.executeScript({
    target: { tabId },
    func: () => window.innerWidth,
  });
  const dpr = detectDPRFromCapture(img.width, vpWidth || img.width);

  // Crop to selection
  const sx = Math.round(region.x * dpr);
  const sy = Math.round(region.y * dpr);
  const sw = Math.round(region.width * dpr);
  const sh = Math.round(region.height * dpr);

  const canvas = new OffscreenCanvas(sw, sh);
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);

  const blob = await canvas.convertToBlob({ type: "image/png" });
  const tab = await chrome.tabs.get(tabId);

  return {
    blob,
    width: sw,
    height: sh,
    mode: "selected-area",
    method: "cdp",
    timestamp: Date.now(),
    url: tab.url || "",
    title: tab.title || "",
  };
}

async function getPageDimensions(tabId: number): Promise<PageDimensions> {
  // Use executeScript directly — more reliable than message passing
  const [{ result }] = await chrome.scripting.executeScript({
    target: { tabId },
    func: () => {
      const body = document.body;
      const html = document.documentElement;
      return {
        scrollWidth: Math.max(body.scrollWidth, body.offsetWidth, html.clientWidth, html.scrollWidth, html.offsetWidth),
        scrollHeight: Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight),
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
        devicePixelRatio: window.devicePixelRatio || 1,
      };
    },
  });
  return result as PageDimensions;
}
