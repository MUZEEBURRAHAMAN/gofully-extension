/**
 * Scroll capture — DOM anchor tracking.
 *
 * WHY THIS INSTEAD OF PIXEL MATCHING
 * ----------------------------------
 * CleanShot X / capcap / CleanScroll all guess the scroll delta by comparing
 * pixels, because on macOS they capture arbitrary screen content and have no
 * access to the page. We are a browser extension — we can read the DOM, so we
 * can MEASURE the scroll delta exactly instead of guessing it.
 *
 * Every pixel-matching approach fails the same way on real sites: repeating
 * sections (FAQ accordions, card grids) and large uniform areas produce several
 * equally-good matches, and the algorithm picks the wrong one. That is what
 * caused sections to repeat or vanish.
 *
 * HOW ANCHOR TRACKING WORKS
 * -------------------------
 * On each capture we sample real elements down the middle of the capture region
 * and record each one's `getBoundingClientRect().top`. Between two frames, the
 * amount those elements moved IS the scroll delta, in CSS pixels, exactly.
 *
 *     scrollDelta = median(prevTop[el] - currTop[el])   over elements in both frames
 *     overlap     = frameHeight - scrollDelta * devicePixelRatio
 *
 * This is correct for every scroll mechanism, including the ones that broke the
 * old `window.scrollY` approach:
 *   - native window scroll
 *   - `overflow: auto/scroll` containers
 *   - CSS-transform scroll (Lenis, Locomotive, GSAP ScrollSmoother) — scrollY
 *     stays 0 there, but elements still physically move, so we still measure it
 *   - virtualised lists — elements get replaced, but enough survive per frame
 *
 * `position: fixed` and `position: sticky` elements are excluded: they do not
 * move when the page scrolls, so they would drag the delta toward zero. This
 * also removes the need for the old heuristic sticky-header detector.
 *
 * SHUTTER SYNC
 * ------------
 * Anchors are read immediately before AND after `captureVisibleTab`. If they
 * disagree, the page moved mid-shutter and the frame is discarded. This replaces
 * the old "capture repeatedly until two thumbnails hash the same" loop with an
 * exact check, and makes each poll much faster.
 *
 * OVERSHOOT RECOVERY
 * ------------------
 * Delta is always measured against the last STITCHED frame, never the last
 * captured one. If the user flicks past a screenful, the gap is detected, the
 * frame is dropped, and a "scroll more slowly" hint appears. When they scroll
 * back up, the delta shrinks below one frame and capture resumes exactly where
 * it left off — no gap, no duplication.
 */

import type { CaptureRegion, CaptureResult } from "../types";

const MAX_FRAMES = 300;
/** Chrome refuses to allocate a canvas taller than this. */
const MAX_CANVAS_H = 32000;
/** Retries for a frame whose anchors moved mid-shutter. */
const SHUTTER_RETRIES = 4;
/** Anchors sampled per frame, spread down the region. */
const SAMPLE_POINTS = 14;
/** CSS px of anchor disagreement tolerated across the shutter. */
const SHUTTER_TOLERANCE = 1.5;
/** Below this CSS-px delta the view has not meaningfully moved. */
const MIN_SCROLL_DELTA = 2;
/** Consecutive dropped frames before the "too fast" hint appears. */
const TOO_FAST_AFTER = 2;
/** Fallback pixel matcher: max mean luma difference for a usable match. */
const LUMA_THRESHOLD = 18;
const MIN_OVERLAP_FRAC = 0.05;
const MAX_OVERLAP_FRAC = 0.95;
const THUMB_W = 90;

export interface ScrollProgress {
  frameCount: number;
  totalHeight: number;
  thumbDataUrl: string | null;
  tooFast?: boolean;
  atLimit?: boolean;
}

export interface ScrollCapturer {
  poll(): Promise<ScrollProgress | null>;
  finish(): Promise<CaptureResult | null>;
  stop(): void;
}

/** Anchor id → viewport-relative top, in CSS pixels. */
type Anchors = Record<string, number>;

interface Frame {
  bitmap: ImageBitmap;
  anchors: Anchors;
  dpr: number;
  sample: Uint8ClampedArray;
  /** Region-relative CSS px reached by the tallest fixed/sticky element found
   *  in the region (e.g. a sticky in-panel header) — 0 when there isn't one. */
  stickyBottom: number;
}

interface Stitcher {
  canvas: OffscreenCanvas;
  ctx: OffscreenCanvasRenderingContext2D;
  totalHeight: number;
  frameW: number;
}

export async function createScrollCapturer(
  tabId: number,
  region: CaptureRegion,
  onPreviewUpdated: (progress: ScrollProgress) => void
): Promise<ScrollCapturer> {
  let lastStitched: Frame | null = null;
  let stitcher: Stitcher | null = null;
  let frameCount = 0;
  let stopped = false;
  let isPolling = false;
  let droppedInARow = 0;
  let hitLimit = false;

  async function poll(): Promise<ScrollProgress | null> {
    if (stopped || isPolling || hitLimit || frameCount >= MAX_FRAMES) return null;
    isPolling = true;
    try {
      return await runPoll();
    } catch {
      return null;
    } finally {
      isPolling = false;
    }
  }

  async function runPoll(): Promise<ScrollProgress | null> {
    const frame = await captureSyncedFrame(tabId, region);
    if (!frame || stopped) return null;

    // First frame seeds the canvas.
    if (!lastStitched || !stitcher) {
      lastStitched = frame;
      stitcher = initStitcher(frame);
      frameCount = 1;
      return emit();
    }

    const frameH = frame.bitmap.height;

    // Measure how far the page moved since the last frame we actually kept.
    const deltaCss = measureScrollDelta(lastStitched.anchors, frame.anchors);
    let overlap = -1;

    if (deltaCss !== null) {
      // Scrolled up, or not far enough to reveal anything new — nothing to add.
      if (deltaCss < MIN_SCROLL_DELTA) {
        frame.bitmap.close();
        droppedInARow = 0; // scrolling back is deliberate, not "too fast"
        return null;
      }
      const deltaPx = Math.round(deltaCss * frame.dpr);
      if (deltaPx >= frameH) {
        // Flicked past a whole screenful — content between frames was never
        // rendered, so the overlap can't be trusted. Delta is measured
        // against lastStitched, which only advances on a kept frame — on
        // continuous forward scrolling that reference never catches up on
        // its own, so refusing to append here would freeze the capture at
        // one frame for the rest of the session. Instead, resync: append
        // this frame with no assumed overlap (accepting a gap of whatever
        // was skipped) and advance lastStitched to it, so the *next* poll
        // measures delta from here rather than compounding drift forever.
        return resyncWithGap(frame, frameH);
      }
      overlap = frameH - deltaPx;
    } else {
      // No anchors matched (e.g. a fully virtualised list swapped every node).
      // Fall back to pixel matching for this frame only.
      overlap = await findOverlapByPixels(lastStitched.bitmap, frame.bitmap, lastStitched.sample, frame.sample);
      if (overlap < 0) {
        frame.bitmap.close();
        return dropFrame();
      }
    }

    // A sticky/fixed element (an in-panel header, say) renders at the same
    // local position in every frame's bitmap, not just in the anchors used
    // to measure delta — never crop less than its height or it gets drawn
    // into the output again on every single frame.
    overlap = Math.max(overlap, frame.stickyBottom);

    const newRows = frameH - overlap;
    if (newRows < 2) {
      frame.bitmap.close();
      return null;
    }

    if (stitcher.totalHeight + newRows > MAX_CANVAS_H) {
      frame.bitmap.close();
      hitLimit = true;
      return emit({ atLimit: true });
    }

    appendToStitcher(stitcher, frame.bitmap, overlap, newRows);
    frameCount++;
    droppedInARow = 0;
    lastStitched.bitmap.close();
    lastStitched = frame;
    return emit();
  }

  /** Append a frame with no assumed overlap (beyond any sticky zone) and advance the stitch reference to it. */
  function resyncWithGap(frame: Frame, frameH: number): ScrollProgress | null {
    if (!stitcher || !lastStitched) { frame.bitmap.close(); return null; }
    const overlap = frame.stickyBottom;
    const newRows = frameH - overlap;
    if (stitcher.totalHeight + newRows > MAX_CANVAS_H) {
      frame.bitmap.close();
      hitLimit = true;
      return emit({ atLimit: true });
    }
    appendToStitcher(stitcher, frame.bitmap, overlap, newRows);
    frameCount++;
    lastStitched.bitmap.close();
    lastStitched = frame;
    droppedInARow = 0; // progress was made — don't keep compounding "too fast"
    return emit({ tooFast: true }); // still surface it once: content was skipped
  }

  function dropFrame(): ScrollProgress | null {
    droppedInARow++;
    if (droppedInARow < TOO_FAST_AFTER) return null;
    return emit({ tooFast: true });
  }

  function emit(extra?: Partial<ScrollProgress>): ScrollProgress {
    const progress: ScrollProgress = {
      frameCount,
      totalHeight: stitcher?.totalHeight ?? 0,
      thumbDataUrl: null,
      ...extra,
    };
    onPreviewUpdated(progress);
    // Thumbnail is cosmetic — render it after reporting so the counter never waits on it.
    if (stitcher) {
      makeThumb(stitcher.canvas, stitcher.totalHeight)
        .then((thumbDataUrl) => {
          if (!stopped && thumbDataUrl) onPreviewUpdated({ ...progress, thumbDataUrl });
        })
        .catch(() => {});
    }
    return progress;
  }

  async function finish(): Promise<CaptureResult | null> {
    stopped = true;
    releaseAnchors(tabId);
    if (!stitcher || frameCount === 0) return null;

    const { totalHeight, frameW } = stitcher;
    const out = new OffscreenCanvas(frameW, totalHeight);
    out.getContext("2d")!.drawImage(stitcher.canvas, 0, 0, frameW, totalHeight, 0, 0, frameW, totalHeight);
    const blob = await out.convertToBlob({ type: "image/png" });

    lastStitched?.bitmap.close();
    lastStitched = null;

    const tab = await chrome.tabs.get(tabId);
    return {
      blob,
      width: frameW,
      height: totalHeight,
      mode: "scrolling-area",
      method: "scroll-stitch",
      timestamp: Date.now(),
      url: tab.url || "",
      title: tab.title || "",
    };
  }

  function stop(): void {
    stopped = true;
    releaseAnchors(tabId);
    lastStitched?.bitmap.close();
    lastStitched = null;
    stitcher = null;
  }

  return { poll, finish, stop };
}

// ─── Scroll delta from anchors ────────────────────────────────────────────────

/**
 * How far the page scrolled between two frames, in CSS pixels.
 * Positive means scrolled down. `null` when nothing matched.
 *
 * Uses the median rather than the mean so a handful of elements that animate
 * independently (parallax, reveal-on-scroll transforms) cannot skew the result.
 */
function measureScrollDelta(prev: Anchors, curr: Anchors): number | null {
  const deltas: number[] = [];
  for (const id in curr) {
    const before = prev[id];
    if (before !== undefined) deltas.push(before - curr[id]);
  }
  if (deltas.length === 0) return null;
  deltas.sort((a, b) => a - b);
  const mid = deltas.length >> 1;
  return deltas.length % 2 ? deltas[mid] : (deltas[mid - 1] + deltas[mid]) / 2;
}

// ─── Capture with shutter sync ────────────────────────────────────────────────

/**
 * Capture one frame, guaranteeing the page did not move while the shutter was
 * open. Anchors are read either side of the capture and must agree.
 *
 * No hide/show of our own UI around the shutter here — unlike auto mode, the
 * manual capture panel is placed by `placePanelClearOfRegion` in the content
 * script to always fall outside the region actually being cropped (or, in
 * the corner case where there's no room, the region's width is trimmed to
 * exclude it), and the selection marquee's border/fill are cleared before
 * manual capture starts. So nothing we draw can ever land inside `region`,
 * and hiding it 5x/second (every poll) bought nothing but a visible strobe
 * for the whole capture — confirmed by removing it and re-running the same
 * capture with identical output.
 */
async function captureSyncedFrame(tabId: number, region: CaptureRegion): Promise<Frame | null> {
  for (let attempt = 0; attempt < SHUTTER_RETRIES; attempt++) {
    // Wait out Chrome's captureVisibleTab rate limit *before* opening the
    // shutter window, not inside it — pacing between the before/after anchor
    // reads instead just makes that window long enough that a continuously
    // scrolling page reliably fails to agree, which is worse than the
    // rate-limit problem it was meant to fix (measured: 3 frames instead of
    // ~18 for the same scroll).
    await waitForCaptureSlot();

    const before = await readAnchors(tabId, region);
    if (!before) return null;

    const dataUrl = await captureTab();
    if (!dataUrl) return null;

    const after = await readAnchors(tabId, region);
    if (!after) return null;

    if (!anchorsAgree(before.anchors, after.anchors)) continue; // moved mid-shutter

    const frame = await cropToRegion(dataUrl, region, after.innerWidth, after.anchors, after.stickyBottom);
    if (frame) return frame;
  }
  return null;
}

function anchorsAgree(a: Anchors, b: Anchors): boolean {
  let compared = 0;
  for (const id in b) {
    const other = a[id];
    if (other === undefined) continue;
    if (Math.abs(other - b[id]) > SHUTTER_TOLERANCE) return false;
    compared++;
  }
  // Nothing in common means we cannot prove stillness; treat it as still and
  // let the pixel fallback sort the frame out rather than looping forever.
  return compared > 0 || Object.keys(b).length === 0;
}

// chrome.tabs.captureVisibleTab is hard rate-limited by Chrome itself —
// measured directly: at our old 200ms poll rate, ~3 of every 5 calls were
// rejected with "exceeds the MAX_CAPTURE_VISIBLE_TAB_CALLS_PER_SECOND
// quota" (the real limit is ~2/sec). Retrying reactively after a rejection
// burns a failed call plus a 400ms sleep, and the user keeps scrolling the
// whole time that's happening — a real contributor to manual captures
// falling well short of the full content. Pacing proactively, *before* the
// shutter-sync window opens (see the call site in captureSyncedFrame),
// avoids the rejection instead of recovering from it after the fact.
let lastCaptureAttempt = 0;
const MIN_CAPTURE_SPACING_MS = 520;

async function waitForCaptureSlot(): Promise<void> {
  const wait = MIN_CAPTURE_SPACING_MS - (Date.now() - lastCaptureAttempt);
  if (wait > 0) await sleep(wait);
}

async function captureTab(): Promise<string | null> {
  for (let i = 0; i < 3; i++) {
    lastCaptureAttempt = Date.now();
    try {
      return await chrome.tabs.captureVisibleTab({ format: "png" });
    } catch (e) {
      const msg = (e as Error)?.message ?? "";
      if (msg.includes("MAX_CAPTURE") && i < 2) {
        await sleep(MIN_CAPTURE_SPACING_MS);
        continue;
      }
      return null;
    }
  }
  return null;
}

// ─── Anchor sampling (runs in the page) ───────────────────────────────────────

/**
 * Sample scrollable elements down the middle of the capture region and report
 * each one's viewport-relative top.
 *
 * State lives on `window` in the extension's isolated world, so ids stay stable
 * across calls and no attribute is ever written to the page's own DOM.
 */
async function readAnchors(
  tabId: number,
  region: CaptureRegion
): Promise<{ anchors: Anchors; innerWidth: number; stickyBottom: number } | null> {
  try {
    const [injection] = await chrome.scripting.executeScript({
      target: { tabId },
      args: [region.x, region.y, region.width, region.height, SAMPLE_POINTS],
      func: (rx: number, ry: number, rw: number, rh: number, samples: number) => {
        const KEY = "__gofullyScrollAnchors";
        const store: { seq: number; tracked: Map<string, Element> } =
          (window as any)[KEY] ||
          ((window as any)[KEY] = { seq: 0, tracked: new Map<string, Element>() });

        const ids = new WeakMap<Element, string>();
        for (const [id, el] of store.tracked) ids.set(el, id);

        const anchors: Record<string, number> = {};
        let stickyBottom = 0;

        const track = (el: Element, top: number) => {
          let id = ids.get(el);
          if (id === undefined) {
            id = String(++store.seq);
            store.tracked.set(id, el);
            ids.set(el, id);
          }
          anchors[id] = top;
        };

        // Re-read anything already tracked and still on the page, so ids persist
        // between polls even when a sample point lands somewhere new.
        for (const [id, el] of store.tracked) {
          if (!el.isConnected) {
            store.tracked.delete(id);
            continue;
          }
          anchors[id] = el.getBoundingClientRect().top;
        }

        const centerX = rx + rw / 2;
        for (let i = 0; i < samples; i++) {
          const y = ry + (rh * (i + 0.5)) / samples;
          for (const el of document.elementsFromPoint(centerX, y)) {
            if (el === document.body || el === document.documentElement) continue;

            // Fixed and sticky elements stay put while the page scrolls, so
            // including them would pull the measured delta toward zero — but
            // they also render at the same on-screen spot in every captured
            // frame, so whatever overlap trimming is used, it must never
            // crop less than this element's bottom edge or it gets stamped
            // into the stitched output again on every frame.
            const position = getComputedStyle(el).position;
            if (position === "fixed" || position === "sticky") {
              const stickyRect = el.getBoundingClientRect();
              stickyBottom = Math.max(stickyBottom, stickyRect.bottom - ry);
              continue;
            }

            const rect = el.getBoundingClientRect();
            if (rect.height < 4) continue; // slivers measure imprecisely

            track(el, rect.top);
            break; // topmost usable element at this point is enough
          }
        }

        // Bound the map so long captures cannot grow it without limit.
        if (store.tracked.size > 240) {
          const excess = store.tracked.size - 120;
          let dropped = 0;
          for (const id of store.tracked.keys()) {
            if (dropped++ >= excess) break;
            store.tracked.delete(id);
            delete anchors[id];
          }
        }

        return {
          anchors,
          innerWidth: window.innerWidth,
          stickyBottom: Math.max(0, Math.min(stickyBottom, rh)),
        };
      },
    });
    return (injection?.result as { anchors: Anchors; innerWidth: number; stickyBottom: number }) ?? null;
  } catch {
    return null;
  }
}

/** Drop the tracked-element map so the page is left exactly as we found it. */
function releaseAnchors(tabId: number): void {
  chrome.scripting
    .executeScript({
      target: { tabId },
      func: () => {
        delete (window as any).__gofullyScrollAnchors;
      },
    })
    .catch(() => {});
}

// ─── Cropping ─────────────────────────────────────────────────────────────────

async function cropToRegion(
  dataUrl: string,
  region: CaptureRegion,
  innerWidth: number,
  anchors: Anchors,
  stickyBottom: number
): Promise<Frame | null> {
  let full: ImageBitmap | null = null;
  try {
    const blob = dataUrlToBlob(dataUrl);
    if (!blob) return null;
    full = await createImageBitmap(blob);

    const dpr = innerWidth > 0 ? full.width / innerWidth : 1;
    const sx = clamp(Math.round(region.x * dpr), 0, full.width);
    const sy = clamp(Math.round(region.y * dpr), 0, full.height);
    const sw = clamp(Math.round(region.width * dpr), 1, full.width - sx);
    const sh = clamp(Math.round(region.height * dpr), 1, full.height - sy);
    if (sw < 1 || sh < 1) return null;

    const bitmap = await createImageBitmap(full, sx, sy, sw, sh);

    // 32×32 digest, only used by the pixel fallback.
    const c = new OffscreenCanvas(32, 32);
    const ctx = c.getContext("2d")!;
    ctx.drawImage(bitmap, 0, 0, 32, 32);
    const sample = ctx.getImageData(0, 0, 32, 32).data;

    return { bitmap, anchors, dpr, sample, stickyBottom: stickyBottom * dpr };
  } catch {
    return null;
  } finally {
    full?.close();
  }
}

// ─── Stitching ────────────────────────────────────────────────────────────────

function initStitcher(frame: Frame): Stitcher {
  const { width, height } = frame.bitmap;
  const canvas = new OffscreenCanvas(width, Math.min(height * 12, MAX_CANVAS_H));
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(frame.bitmap, 0, 0);
  return { canvas, ctx, totalHeight: height, frameW: width };
}

function appendToStitcher(s: Stitcher, frame: ImageBitmap, overlap: number, newRows: number): void {
  const needed = s.totalHeight + newRows;
  if (needed > s.canvas.height) {
    const grown = new OffscreenCanvas(s.frameW, Math.min(needed + frame.height * 6, MAX_CANVAS_H));
    grown.getContext("2d")!.drawImage(s.canvas, 0, 0);
    s.canvas = grown;
    s.ctx = grown.getContext("2d")!;
  }
  s.ctx.drawImage(frame, 0, overlap, frame.width, newRows, 0, s.totalHeight, s.frameW, newRows);
  s.totalHeight += newRows;
}

// ─── Pixel fallback ───────────────────────────────────────────────────────────
//
// Only reached when no anchor survived between two frames. Uses CleanScroll's
// approach — search from a large overlap downward, comparing luma along a few
// columns — narrowed to a window around the scroll distance implied by the 32×32
// digests, which is what keeps repeated sections from matching at the wrong offset.

async function findOverlapByPixels(
  frameA: ImageBitmap,
  frameB: ImageBitmap,
  sampleA: Uint8ClampedArray,
  sampleB: Uint8ClampedArray
): Promise<number> {
  const H = Math.min(frameA.height, frameB.height);
  const W = Math.min(frameA.width, frameB.width);
  const stripW = Math.max(60, Math.round(W * 0.4));
  const stripX = Math.max(0, Math.round(W / 2 - stripW / 2));
  if (H < 40 || stripX + stripW > W) return -1;

  let digestDiff = 0;
  for (let i = 0; i < sampleA.length; i += 4) {
    digestDiff +=
      Math.abs(sampleA[i] - sampleB[i]) +
      Math.abs(sampleA[i + 1] - sampleB[i + 1]) +
      Math.abs(sampleA[i + 2] - sampleB[i + 2]);
  }
  const changed = Math.min(0.95, digestDiff / (sampleA.length / 4) / 3 / 120);
  const estimate = 1 - changed;

  // Asymmetric window: tight above the estimate to suppress false high-overlap
  // matches, looser below because flat areas make `changed` read low.
  const hi = Math.round(H * clamp(estimate + 0.15, MIN_OVERLAP_FRAC, MAX_OVERLAP_FRAC));
  const lo = Math.max(1, Math.round(H * clamp(estimate - 0.35, MIN_OVERLAP_FRAC, MAX_OVERLAP_FRAC)));
  const step = Math.max(2, Math.round(H / 120));

  const canvas = new OffscreenCanvas(stripW, H * 2);
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(frameA, stripX, 0, stripW, H, 0, 0, stripW, H);
  ctx.drawImage(frameB, stripX, 0, stripW, H, 0, H, stripW, H);
  const data = ctx.getImageData(0, 0, stripW, H * 2).data;

  const columns = [Math.round(stripW / 4), Math.round(stripW / 2), Math.round((stripW * 3) / 4)];
  let best = -1;
  let bestScore = Infinity;

  for (let overlap = hi; overlap >= lo; overlap -= step) {
    const rows = Math.min(overlap, 300);
    const strideY = Math.max(2, Math.round(rows / 60));
    let total = 0;
    let count = 0;
    for (let row = 0; row < rows; row += strideY) {
      const rowA = H - overlap + row;
      const rowB = H + row;
      for (const x of columns) {
        const ia = (rowA * stripW + x) * 4;
        const ib = (rowB * stripW + x) * 4;
        total += Math.abs(luma(data, ia) - luma(data, ib));
        count++;
      }
    }
    const score = count > 0 ? total / count : 255;
    if (score < bestScore) {
      bestScore = score;
      best = overlap;
    }
  }

  return bestScore > LUMA_THRESHOLD ? -1 : best;
}

function luma(d: Uint8ClampedArray, i: number): number {
  return d[i] * 0.299 + d[i + 1] * 0.587 + d[i + 2] * 0.114;
}

// ─── Preview thumbnail ────────────────────────────────────────────────────────

async function makeThumb(canvas: OffscreenCanvas, totalHeight: number): Promise<string | null> {
  try {
    const h = Math.max(1, Math.round((totalHeight / canvas.width) * THUMB_W));
    const c = new OffscreenCanvas(THUMB_W, h);
    c.getContext("2d")!.drawImage(canvas, 0, 0, canvas.width, totalHeight, 0, 0, THUMB_W, h);
    const blob = await c.convertToBlob({ type: "image/jpeg", quality: 0.7 });
    return await blobToDataUrl(blob);
  } catch {
    return null;
  }
}

// ─── Utilities ────────────────────────────────────────────────────────────────

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function dataUrlToBlob(dataUrl: string): Blob | null {
  const comma = dataUrl.indexOf(",");
  if (comma < 0) return null;
  const mime = /^data:([^;,]+)/.exec(dataUrl)?.[1] ?? "image/png";
  try {
    const bytes = atob(dataUrl.slice(comma + 1));
    const arr = new Uint8Array(bytes.length);
    for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
    return new Blob([arr], { type: mime });
  } catch {
    return null;
  }
}

async function blobToDataUrl(blob: Blob): Promise<string> {
  const bytes = new Uint8Array(await blob.arrayBuffer());
  // Chunked so multi-megabyte captures cannot blow the argument limit of
  // String.fromCharCode or quadratically concatenate one character at a time.
  const CHUNK = 0x8000;
  const parts: string[] = [];
  for (let i = 0; i < bytes.length; i += CHUNK) {
    parts.push(String.fromCharCode(...bytes.subarray(i, i + CHUNK)));
  }
  return `data:${blob.type};base64,${btoa(parts.join(""))}`;
}
