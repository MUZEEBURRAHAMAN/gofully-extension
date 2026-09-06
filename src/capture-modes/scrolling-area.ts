import type { CaptureRegion, CaptureResult, CaptureFrame, CaptureProgress } from "../types";
import { detectDPRFromCapture } from "../utils/dpr-handler";
import { loadImage, canvasToBlob } from "../utils/image";

const SPEED_MAP = { slow: 1000, medium: 700, fast: 500 };
const MAX_FRAMES = 100;

export async function captureScrollingArea(
  tabId: number,
  region: CaptureRegion,
  speed: "slow" | "medium" | "fast",
  onProgress?: (progress: CaptureProgress) => void
): Promise<CaptureResult> {
  const frames: CaptureFrame[] = [];
  const frameScrollYs: number[] = [];
  const delay = SPEED_MAP[speed];

  onProgress?.({ current: 0, total: 0, phase: "preparing" });

  // Step 1: Find the scrollable element under the selection (if the region is
  // an inner overflow:auto/scroll container — a chat panel, code view, etc.)
  // so we scroll *that*, not the outer page. Falls back to window scrolling
  // when the selection isn't inside its own scroll container.
  await findAndTagScrollContainer(tabId, region);

  // Step 2: Record initial page state
  const pageState = await getPageState(tabId);
  const scrollStep = Math.max(50, Math.floor(region.height * 0.85));
  const estimatedSteps = Math.ceil(
    (pageState.scrollHeight - pageState.scrollY) / scrollStep
  );

  let dpr = 1;
  let lastFrameHash = "";
  let step = 0;

  try {
    // Step 3: Capture first frame at current scroll position
    const firstFrame = await captureFrame(tabId, region);
    if (!firstFrame) {
      throw new Error("Failed to capture first frame");
    }

    const firstImg = await loadImage(firstFrame.dataUrl);
    dpr = detectDPRFromCapture(firstImg.width, region.width);
    if (dpr === 0) dpr = 1;

    frames.push(firstFrame);
    frameScrollYs.push(pageState.scrollY);
    lastFrameHash = await hashFrame(firstFrame.dataUrl);
    step++;
    onProgress?.({ current: step, total: estimatedSteps, phase: "capturing" });

    // Step 4: Scroll-and-capture loop
    let lastScrollY = pageState.scrollY;
    let consecutiveFails = 0;

    while (frames.length < MAX_FRAMES) {
      // Scroll by scrollStep
      const scrollResult = await scrollPage(tabId, scrollStep);

      // Check if page actually scrolled
      if (Math.abs(scrollResult.current - lastScrollY) < 2) {
        // Page didn't move — we're at the bottom
        // Capture final frame to catch any remaining content
        const finalFrame = await captureFrame(tabId, region);
        if (finalFrame) {
          const hash = await hashFrame(finalFrame.dataUrl);
          if (hash !== lastFrameHash) {
            frames.push(finalFrame);
            frameScrollYs.push(scrollResult.current);
          }
        }
        break;
      }

      // Check if we hit the max scroll
      if (scrollResult.current >= scrollResult.maxScroll) {
        const finalFrame = await captureFrame(tabId, region);
        if (finalFrame) {
          const hash = await hashFrame(finalFrame.dataUrl);
          if (hash !== lastFrameHash) {
            frames.push(finalFrame);
            frameScrollYs.push(scrollResult.current);
          }
        }
        break;
      }

      lastScrollY = scrollResult.current;

      // Wait for scroll to settle and content to render
      await sleep(delay);
      await waitForPageStable(tabId);

      // Capture this frame
      const frame = await captureFrame(tabId, region);
      if (!frame) {
        consecutiveFails++;
        if (consecutiveFails >= 3) break;
        continue;
      }
      consecutiveFails = 0;

      const hash = await hashFrame(frame.dataUrl);

      // Duplicate detection — page hasn't changed
      if (hash === lastFrameHash) {
        break;
      }

      frames.push(frame);
      frameScrollYs.push(scrollResult.current);
      lastFrameHash = hash;
      step++;
      onProgress?.({ current: step, total: estimatedSteps, phase: "capturing" });
    }

    // Step 5: Restore scroll position
    await restoreScroll(tabId, pageState.scrollY);

  } finally {
    // Step 6: Always restore UI and remove our scroll-target marker
    await showAllExtensionUI(tabId);
    untagScrollContainer(tabId);
  }

  if (frames.length === 0) {
    throw new Error("No frames were captured");
  }

  // Step 7: Stitch frames
  onProgress?.({ current: 0, total: 0, phase: "stitching" });
  const blob = await stitchFrames(frames, dpr, frameScrollYs);
  const tab = await chrome.tabs.get(tabId);

  // Calculate actual stitched dimensions
  const stitchedImg = await loadImage(await blobToDataUrl(blob));
  const actualWidth = stitchedImg.width;
  const actualHeight = stitchedImg.height;

  onProgress?.({ current: 0, total: 0, phase: "done" });

  return {
    blob,
    width: actualWidth,
    height: actualHeight,
    mode: "scrolling-area",
    method: "scroll-stitch",
    timestamp: Date.now(),
    url: tab.url || "",
    title: tab.title || "",
  };
}

export async function captureManualFrame(
  tabId: number,
  region: CaptureRegion
): Promise<CaptureFrame | null> {
  await hideAllExtensionUI(tabId);
  const frame = await captureFrame(tabId, region);
  await showAllExtensionUI(tabId);
  return frame;
}

export async function stitchManualFrames(
  frames: CaptureFrame[],
  region: CaptureRegion,
  tabId: number
): Promise<CaptureResult> {
  const firstImg = frames.length > 0 ? await loadImage(frames[0].dataUrl) : null;
  const dpr = firstImg ? firstImg.width / region.width : 1;
  const blob = await stitchFrames(frames, dpr);
  const tab = await chrome.tabs.get(tabId);

  const stitchedImg = await loadImage(await blobToDataUrl(blob));

  return {
    blob,
    width: stitchedImg.width,
    height: stitchedImg.height,
    mode: "scrolling-area",
    method: "scroll-stitch",
    timestamp: Date.now(),
    url: tab.url || "",
    title: tab.title || "",
  };
}

// ─── Page interaction ────────────────────────────────────────────────────────
//
// A selection can be either a crop of the whole page (scroll the window) or an
// inner overflow:auto/scroll element — a chat panel, code view, embedded feed —
// with its own independent scroll (scroll that element's scrollTop instead).
// Auto-scrolling the window when the user picked an inner container never
// moves that container's content at all, so every "frame" looks identical and
// the capture silently stops after one or two frames.
//
// The found element is tagged with a data attribute so later calls (which are
// each a fresh injected script, with no persistent DOM reference) can re-find
// the exact same element deterministically instead of re-running point lookup.

const TARGET_ATTR = "data-gf-scroll-target";

async function findAndTagScrollContainer(tabId: number, region: CaptureRegion): Promise<void> {
  try {
    await chrome.scripting.executeScript({
      target: { tabId },
      func: (attr: string, rx: number, ry: number, rw: number, rh: number) => {
        const cx = rx + rw / 2;
        const cy = ry + rh / 2;
        let el = document.elementFromPoint(cx, cy) as Element | null;
        while (el && el !== document.body && el !== document.documentElement) {
          const style = getComputedStyle(el);
          const scrollableY =
            (style.overflowY === "auto" || style.overflowY === "scroll") &&
            el.scrollHeight > el.clientHeight + 2;
          if (scrollableY) {
            el.setAttribute(attr, "1");
            return;
          }
          el = el.parentElement;
        }
      },
      args: [TARGET_ATTR, region.x, region.y, region.width, region.height],
    });
  } catch {}
}

function untagScrollContainer(tabId: number): void {
  chrome.scripting
    .executeScript({
      target: { tabId },
      func: (attr: string) => document.querySelector(`[${attr}]`)?.removeAttribute(attr),
      args: [TARGET_ATTR],
    })
    .catch(() => {});
}

async function getPageState(tabId: number): Promise<{
  scrollHeight: number;
  scrollY: number;
  viewportHeight: number;
}> {
  const [{ result }] = await chrome.scripting.executeScript({
    target: { tabId },
    func: (attr: string) => {
      const el = document.querySelector(`[${attr}]`) as HTMLElement | null;
      if (el) {
        return { scrollHeight: el.scrollHeight, scrollY: el.scrollTop, viewportHeight: el.clientHeight };
      }
      return {
        scrollHeight: Math.max(document.body.scrollHeight, document.documentElement.scrollHeight),
        scrollY: window.scrollY,
        viewportHeight: window.innerHeight,
      };
    },
    args: [TARGET_ATTR],
  });
  return result as { scrollHeight: number; scrollY: number; viewportHeight: number };
}

async function scrollPage(tabId: number, dy: number): Promise<{
  prev: number;
  current: number;
  maxScroll: number;
}> {
  const [{ result }] = await chrome.scripting.executeScript({
    target: { tabId },
    func: (attr: string, step: number) => {
      const el = document.querySelector(`[${attr}]`) as HTMLElement | null;
      if (el) {
        const prev = el.scrollTop;
        el.scrollBy({ top: step, behavior: "instant" });
        return { prev, current: el.scrollTop, maxScroll: el.scrollHeight - el.clientHeight };
      }
      const prev = window.scrollY;
      window.scrollBy({ top: step, behavior: "instant" });
      return {
        prev,
        current: window.scrollY,
        maxScroll: Math.max(
          document.body.scrollHeight,
          document.documentElement.scrollHeight
        ) - window.innerHeight,
      };
    },
    args: [TARGET_ATTR, dy],
  });
  return result as { prev: number; current: number; maxScroll: number };
}

async function restoreScroll(tabId: number, scrollY: number): Promise<void> {
  try {
    await chrome.scripting.executeScript({
      target: { tabId },
      func: (attr: string, y: number) => {
        const el = document.querySelector(`[${attr}]`) as HTMLElement | null;
        if (el) { el.scrollTop = y; return; }
        window.scrollTo({ top: y, behavior: "instant" });
      },
      args: [TARGET_ATTR, scrollY],
    });
  } catch {}
}

// ─── UI visibility ───────────────────────────────────────────────────────────

async function hideAllExtensionUI(tabId: number): Promise<void> {
  try {
    // Send hide message and wait for acknowledgment
    await chrome.tabs.sendMessage(tabId, { type: "SCROLL_UI_VISIBILITY", hide: true });
  } catch {}

  // Wait for TWO full paint cycles to guarantee the browser has
  // composited the visibility change before captureVisibleTab
  await forceRepaint(tabId);
  await forceRepaint(tabId);
}

async function showAllExtensionUI(tabId: number): Promise<void> {
  try {
    await chrome.tabs.sendMessage(tabId, { type: "SCROLL_UI_VISIBILITY", hide: false });
  } catch {}
  await forceRepaint(tabId);
}

async function forceRepaint(tabId: number): Promise<void> {
  try {
    await chrome.scripting.executeScript({
      target: { tabId },
      func: () => new Promise<void>((resolve) => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            resolve();
          });
        });
      }),
    });
  } catch {
    // Fallback: plain sleep if executeScript fails
    await sleep(120);
  }
}

// ─── Content readiness ───────────────────────────────────────────────────────

async function waitForPageStable(tabId: number): Promise<void> {
  try {
    await chrome.scripting.executeScript({
      target: { tabId },
      func: () => {
        return new Promise<void>((resolve) => {
          // Wait for lazy images in viewport to load
          const imgs = document.querySelectorAll("img");
          const pending: Promise<void>[] = [];
          const vp = window.innerHeight;

          imgs.forEach((img) => {
            const rect = img.getBoundingClientRect();
            // Only wait for images currently in viewport
            if (rect.top < vp && rect.bottom > 0 && !img.complete && img.src) {
              pending.push(new Promise<void>((r) => {
                img.addEventListener("load", () => r(), { once: true });
                img.addEventListener("error", () => r(), { once: true });
                setTimeout(r, 600);
              }));
            }
          });

          if (pending.length > 0) {
            Promise.all(pending).then(() => {
              requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
            });
          } else {
            requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
          }
        });
      },
    });
  } catch {
    await sleep(200);
  }
}

// ─── Frame capture ───────────────────────────────────────────────────────────

async function captureFrame(
  tabId: number,
  region: CaptureRegion
): Promise<CaptureFrame | null> {
  try {
    // Hide/show around just this one shutter (not the whole multi-second
    // capture) so the progress panel stays visible and updating between
    // frames — auto mode used to hide it for the entire capture, leaving
    // the user with no visible sign anything was happening for 10-20+
    // seconds even though it was working correctly.
    const tab = await chrome.tabs.get(tabId).catch(() => null);
    if (tab?.windowId) {
      await chrome.tabs.update(tabId, { active: true }).catch(() => {});
    }
    await hideAllExtensionUI(tabId);
    let dataUrl: string;
    try {
      dataUrl = await captureVisibleTabWithRetry(tab?.windowId);
    } finally {
      void showAllExtensionUI(tabId);
    }

    const img = await loadImage(dataUrl);
    const [{ result: vpWidth }] = await chrome.scripting.executeScript({
      target: { tabId },
      func: () => window.innerWidth,
    });
    const dpr = img.width / ((vpWidth as number) || img.width);

    const sx = Math.round(region.x * dpr);
    const sy = Math.round(region.y * dpr);
    const sw = Math.round(region.width * dpr);
    const sh = Math.round(region.height * dpr);

    // Clamp to actual image bounds
    const clampedSx = Math.min(sx, img.width - 1);
    const clampedSy = Math.min(sy, img.height - 1);
    const clampedSw = Math.min(sw, img.width - clampedSx);
    const clampedSh = Math.min(sh, img.height - clampedSy);

    if (clampedSw <= 0 || clampedSh <= 0) return null;

    const canvas = new OffscreenCanvas(clampedSw, clampedSh);
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(img, clampedSx, clampedSy, clampedSw, clampedSh, 0, 0, clampedSw, clampedSh);

    const croppedBlob = await canvas.convertToBlob({ type: "image/png" });
    const croppedUrl = await blobToDataUrl(croppedBlob);

    return {
      dataUrl: croppedUrl,
      x: region.x,
      y: region.y,
      width: region.width,
      height: region.height,
      scrollX: 0,
      scrollY: 0,
    };
  } catch {
    return null;
  }
}

async function captureVisibleTabWithRetry(windowId?: number, maxRetries = 3): Promise<string> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return windowId !== undefined
        ? await chrome.tabs.captureVisibleTab(windowId, { format: "png" })
        : await chrome.tabs.captureVisibleTab({ format: "png" });
    } catch (e: any) {
      if (e?.message?.includes("MAX_CAPTURE") && i < maxRetries - 1) {
        await sleep(1000);
        continue;
      }
      throw e;
    }
  }
  return windowId !== undefined
    ? await chrome.tabs.captureVisibleTab(windowId, { format: "png" })
    : await chrome.tabs.captureVisibleTab({ format: "png" });
}

// ─── Stitching ───────────────────────────────────────────────────────────────

async function stitchFrames(
  frames: CaptureFrame[],
  dpr: number,
  scrollYs?: number[]
): Promise<Blob> {
  if (frames.length === 0) throw new Error("No frames to stitch");

  // Load all frame images
  const images = await Promise.all(frames.map(f => loadImage(f.dataUrl)));

  if (images.length === 1) {
    const c = new OffscreenCanvas(images[0].width, images[0].height);
    c.getContext("2d")!.drawImage(images[0], 0, 0);
    return canvasToBlob(c);
  }

  const frameW = images[0].width;
  const frameH = images[0].height;

  // Detect overlap between consecutive frames. When the caller drove the
  // scroll itself (auto mode) it already knows the exact distance scrolled
  // between frames, so use that directly instead of guessing from pixels —
  // pixel correlation gets fooled by any element that looks identical in
  // every frame (a sticky/fixed header inside the scrolled region, a repeat-
  // pattern background), matching it at the wrong offset or not at all.
  const overlaps: number[] = [0];
  for (let i = 1; i < images.length; i++) {
    let ov: number;
    if (scrollYs && scrollYs.length === images.length) {
      const deltaPx = Math.round((scrollYs[i] - scrollYs[i - 1]) * dpr);
      ov = Math.max(0, Math.min(frameH, frameH - deltaPx));
    } else {
      ov = await findOverlap(images[i - 1], images[i], frameW, frameH);
    }
    overlaps.push(ov);
  }

  // Calculate total height accounting for overlaps
  let totalH = frameH;
  for (let i = 1; i < images.length; i++) {
    totalH += frameH - overlaps[i];
  }

  // Draw the first frame whole, then crop each subsequent frame down to only
  // its new (non-overlapping) bottom portion before appending. Drawing full,
  // overlapping frames one after another (each one just overwriting part of
  // the previous) looks right for ordinary scrolled content, where the
  // overlap region is pixel-identical between frames either way — but it
  // silently corrupts anything that stays fixed at the same local position
  // in every frame (a sticky/fixed header inside the scrolled region): each
  // frame's copy of it lands at a different, advancing canvas offset instead
  // of being recognized as the same unchanging content, so it ends up
  // stamped into the output once per frame.
  const canvas = new OffscreenCanvas(frameW, totalH);
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(images[0], 0, 0);
  let y = frameH;
  for (let i = 1; i < images.length; i++) {
    const newRows = frameH - overlaps[i];
    if (newRows <= 0) continue;
    ctx.drawImage(images[i], 0, overlaps[i], frameW, newRows, 0, y, frameW, newRows);
    y += newRows;
  }

  return canvasToBlob(canvas);
}

async function findOverlap(
  imgA: ImageBitmap,
  imgB: ImageBitmap,
  w: number,
  h: number
): Promise<number> {
  // Use a downsampled version for speed
  const sampleW = Math.min(w, 200);
  const sampleH = Math.min(h, 800);

  const cA = new OffscreenCanvas(sampleW, sampleH);
  const ctxA = cA.getContext("2d")!;
  ctxA.drawImage(imgA, 0, 0, sampleW, sampleH);
  const dA = ctxA.getImageData(0, 0, sampleW, sampleH).data;

  const cB = new OffscreenCanvas(sampleW, sampleH);
  const ctxB = cB.getContext("2d")!;
  ctxB.drawImage(imgB, 0, 0, sampleW, sampleH);
  const dB = ctxB.getImageData(0, 0, sampleW, sampleH).data;

  // Ignore edges to avoid scrollbar artifacts
  const marginX = Math.round(sampleW * 0.15);
  const endX = sampleW - marginX;

  const minOv = Math.max(4, Math.round(sampleH * 0.02));
  const maxOv = Math.round(sampleH * 0.95);

  let bestOv = 0;
  let bestErr = Infinity;

  // Coarse search (step 4 pixels)
  for (let ov = minOv; ov <= maxOv; ov += 4) {
    const err = computeOverlapError(dA, dB, sampleW, sampleH, ov, marginX, endX);
    if (err < bestErr) {
      bestErr = err;
      bestOv = ov;
    }
  }

  // Refine search ±4 pixels at single-pixel resolution
  const lo = Math.max(minOv, bestOv - 4);
  const hi = Math.min(maxOv, bestOv + 4);
  for (let ov = lo; ov <= hi; ov++) {
    const err = computeOverlapError(dA, dB, sampleW, sampleH, ov, marginX, endX);
    if (err < bestErr) {
      bestErr = err;
      bestOv = ov;
    }
  }

  // If error is too high, overlap detection failed
  if (bestErr > 30) return 0;

  // Scale overlap back to actual pixel dimensions
  return Math.round(bestOv * (h / sampleH));
}

function computeOverlapError(
  dA: Uint8ClampedArray,
  dB: Uint8ClampedArray,
  w: number,
  h: number,
  overlap: number,
  marginX: number,
  endX: number
): number {
  let diff = 0;
  let count = 0;
  const rowStep = 2;
  const xStep = 2;

  for (let r = 0; r < overlap; r += rowStep) {
    const rowA = h - overlap + r;
    const rowB = r;
    for (let x = marginX; x < endX; x += xStep) {
      const iA = (rowA * w + x) * 4;
      const iB = (rowB * w + x) * 4;
      diff += Math.abs(dA[iA] - dB[iB])
            + Math.abs(dA[iA + 1] - dB[iB + 1])
            + Math.abs(dA[iA + 2] - dB[iB + 2]);
      count++;
    }
  }

  return count > 0 ? diff / (count * 3) : 255;
}

// ─── Utilities ───────────────────────────────────────────────────────────────

async function hashFrame(dataUrl: string): Promise<string> {
  const img = await loadImage(dataUrl);
  const canvas = new OffscreenCanvas(16, 16);
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0, 16, 16);
  const data = ctx.getImageData(0, 0, 16, 16).data;

  let hash = 0;
  for (let i = 0; i < data.length; i += 4) {
    hash = ((hash << 5) - hash + data[i]) | 0;
    hash = ((hash << 5) - hash + data[i + 1]) | 0;
    hash = ((hash << 5) - hash + data[i + 2]) | 0;
  }
  return hash.toString(36);
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

async function blobToDataUrl(blob: Blob): Promise<string> {
  const bytes = new Uint8Array(await blob.arrayBuffer());
  const CHUNK = 0x8000;
  const parts: string[] = [];
  for (let i = 0; i < bytes.length; i += CHUNK) {
    parts.push(String.fromCharCode(...bytes.subarray(i, i + CHUNK)));
  }
  return `data:${blob.type};base64,${btoa(parts.join(""))}`;
}
