import type { CaptureResult, PageDimensions } from "../types";
import { dataUrlToBlob } from "../utils/image";

export async function captureWithCDP(
  tabId: number,
  dimensions: PageDimensions
): Promise<CaptureResult> {
  const debuggee = { tabId };

  await chrome.debugger.attach(debuggee, "1.3");

  try {
    // Get original viewport metrics
    const layoutMetrics = (await chrome.debugger.sendCommand(
      debuggee,
      "Page.getLayoutMetrics",
      {}
    )) as {
      contentSize: { width: number; height: number };
      cssContentSize: { width: number; height: number };
    };

    const contentWidth =
      layoutMetrics.cssContentSize?.width ||
      layoutMetrics.contentSize?.width ||
      dimensions.scrollWidth;
    const contentHeight =
      layoutMetrics.cssContentSize?.height ||
      layoutMetrics.contentSize?.height ||
      dimensions.scrollHeight;

    // Force at least 2× scale for crisp retina-quality output
    const captureScale = Math.max(2, dimensions.devicePixelRatio);

    // Override device metrics to full page size
    await chrome.debugger.sendCommand(
      debuggee,
      "Emulation.setDeviceMetricsOverride",
      {
        width: Math.ceil(contentWidth),
        height: Math.ceil(contentHeight),
        deviceScaleFactor: captureScale,
        mobile: false,
      }
    );

    // Capture the screenshot. clip.scale is a multiplier ON TOP OF the
    // deviceScaleFactor set above — passing captureScale to both compounds
    // them (2x deviceScaleFactor x 2x clip.scale = 4x actual output pixels
    // vs. the 2x the width/height below assumes), producing an image twice
    // as large in each dimension as intended. deviceScaleFactor already
    // establishes the desired scale; clip.scale stays at 1.
    const result = (await chrome.debugger.sendCommand(
      debuggee,
      "Page.captureScreenshot",
      {
        format: "png",
        captureBeyondViewport: true,
        clip: {
          x: 0,
          y: 0,
          width: contentWidth,
          height: contentHeight,
          scale: 1,
        },
      }
    )) as { data: string };

    // Reset device metrics
    await chrome.debugger.sendCommand(
      debuggee,
      "Emulation.clearDeviceMetricsOverride",
      {}
    );

    const dataUrl = `data:image/png;base64,${result.data}`;
    const blob = dataUrlToBlob(dataUrl);

    const tab = await chrome.tabs.get(tabId);

    return {
      blob,
      width: Math.ceil(contentWidth * captureScale),
      height: Math.ceil(contentHeight * captureScale),
      mode: "full-page",
      method: "cdp",
      timestamp: Date.now(),
      url: tab.url || "",
      title: tab.title || "",
    };
  } finally {
    try {
      await chrome.debugger.detach(debuggee);
    } catch {
      // already detached
    }
  }
}
