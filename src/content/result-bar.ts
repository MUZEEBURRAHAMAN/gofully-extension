import { claimPendingRateNudge, markRatedYes, markDismissed } from "../utils/rate-nudge";

/** Kept in step with src/ui/overlay-kit.ts — this file styles a shadow root. */
const FONT_STACK =
  `'GoFully Archivo', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif`;

function playShutterSound(): void {
  try {
    const url = chrome.runtime.getURL("assets/shutter.mp3");
    if (url) {
      const audio = new Audio(url);
      audio.volume = 0.4;
      audio.play().catch(() => {});
    }
  } catch {
    // Ignore audio playback failure in restrictive pages
  }
}

async function copyImageFromDataUrl(dataUrl: string): Promise<void> {
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  const pngBlob = blob.type === "image/png" ? blob : await convertToPng(blob);
  await navigator.clipboard.write([new ClipboardItem({ "image/png": pngBlob })]);
}

async function convertToPng(blob: Blob): Promise<Blob> {
  const bitmap = await createImageBitmap(blob);
  const canvas = document.createElement("canvas");
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(bitmap, 0, 0);
  return new Promise((res) => canvas.toBlob((b) => res(b!), "image/png"));
}

// Match the editor/popup's default export quality: upscale only when the
// capture is smaller than 4K UHD, so an already-large capture is untouched.
const UHD_W = 3840, UHD_H = 2160;
async function upscaleToUHD(blob: Blob): Promise<Blob> {
  try {
    const bitmap = await createImageBitmap(blob);
    const { width: w, height: h } = bitmap;
    if (w >= UHD_W || h >= UHD_H) return blob;
    const scale = Math.max(UHD_W / w, UHD_H / h);
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(w * scale);
    canvas.height = Math.round(h * scale);
    const ctx = canvas.getContext("2d")!;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    return await new Promise((res) => canvas.toBlob((b) => res(b!), "image/png"));
  } catch {
    return blob;
  }
}

// ─── Result card (Selected Area) ─────────────────────────────────────────────
// Selected-area's popup closes itself before the user draws the region, so it
// can't show its own confirmation UI. This mirrors that same #resultBar card
// (popup.html) in-page via a shadow-DOM overlay, with export buttons
// delegating to the background service worker (chrome.downloads isn't
// available from a content script).

interface ResultCardPayload {
  width: number;
  height: number;
  mode: string;
  method: string;
  url: string;
  title: string;
  timestamp: number;
  dataUrl: string;
}

let resultCardHost: HTMLDivElement | null = null;

function dismissResultCard(): void {
  if (!resultCardHost) return;
  const host = resultCardHost;
  resultCardHost = null;
  const shadow = host.shadowRoot;
  const card = shadow?.querySelector(".res-card") as HTMLElement | null;
  if (card) {
    card.classList.remove("show");
    setTimeout(() => host.remove(), 180);
  } else {
    host.remove();
  }
}

function showResultCard(payload: ResultCardPayload): void {
  dismissResultCard();
  playShutterSound();

  const w = Math.round(payload.width);
  const h = Math.round(payload.height);
  const methodLabel = payload.method === "scroll-stitch" ? "Scroll-Stitch" : "Snapshot";
  const isLongCapture = payload.mode === "full-page" || payload.mode === "scrolling-area" || h > 800;

  resultCardHost = document.createElement("div");
  resultCardHost.id = "gofully-result-card-host";
  resultCardHost.style.cssText =
    "position:fixed; inset:0; z-index:2147483647; pointer-events:none;";
  const shadow = resultCardHost.attachShadow({ mode: "closed" });

  const style = document.createElement("style");
  style.textContent = `
    .res-card {
      position: fixed; top: 16px; right: 16px;
      width: 320px;
      background: #ffffff;
      border: 1px solid #E3E8EF;
      box-shadow: 0 10px 30px rgba(16,24,40,0.08), 0 20px 24px -4px rgba(16,24,40,0.14);
      pointer-events: auto;
      opacity: 0; transform: translateY(-8px);
      transition: opacity 0.18s cubic-bezier(0.16,1,0.3,1), transform 0.18s cubic-bezier(0.16,1,0.3,1);
      font-family: ${FONT_STACK};
      -webkit-font-smoothing: antialiased;
    }
    .res-card.show { opacity: 1; transform: translateY(0); }
    .res-status {
      display: flex; align-items: center; gap: 8px;
      padding: 10px 12px 10px 16px;
      background: rgba(22,103,242,.08);
      border-bottom: 1px solid rgba(22,103,242,.12);
    }
    .res-check { color: #1667F2; flex-shrink: 0; display: flex; }
    .res-title { font-size: 12px; font-weight: 600; color: #1257D8; flex: 1; }
    .res-dim { font-size: 10.5px; font-weight: 500; color: rgba(22,103,242,.7); font-variant-numeric: tabular-nums; }
    .res-close {
      border: none; background: none; cursor: pointer; color: rgba(22,103,242,.6);
      width: 20px; height: 20px; flex-shrink: 0; padding: 0;
      display: flex; align-items: center; justify-content: center;
    }
    .res-close:hover { color: #1257D8; }
    .res-preview {
      position: relative; width: 100%; height: 150px;
      background: #F7F8FA;
      border-bottom: 1px solid #E3E8EF;
      overflow: hidden;
      display: flex; align-items: flex-start; justify-content: center;
    }
    .res-preview img { width: 100%; height: auto; display: block; object-fit: cover; object-position: top center; }
    .res-preview-fade {
      position: absolute; bottom: 0; left: 0; right: 0; height: 48px;
      background: linear-gradient(to bottom, rgba(241,243,247,0) 0%, rgba(241,243,247,0.92) 80%, rgba(241,243,247,1) 100%);
      backdrop-filter: blur(2px); -webkit-backdrop-filter: blur(2px);
      display: flex; align-items: flex-end; justify-content: center; padding-bottom: 6px;
    }
    .res-preview-pill {
      font-size: 9.5px; font-weight: 700; color: #667085;
      background: rgba(242,242,243,.9); border: 1px solid #E3E8EF;
      padding: 2px 10px; text-transform: uppercase; letter-spacing: 0.06em;
    }
    .res-actions { display: flex; border-bottom: 1px solid #E3E8EF; }
    .res-btn {
      flex: 1; height: 40px; display: flex; align-items: center; justify-content: center; gap: 5px;
      border: none; border-right: 1px solid #E3E8EF; background: transparent; cursor: pointer;
      font-size: 11px; font-weight: 500; letter-spacing: 0.02em; text-transform: uppercase;
      color: #344054; font-family: ${FONT_STACK};
      transition: background .08s, color .08s;
    }
    .res-btn:last-child { border-right: none; }
    .res-btn:hover { background: #F7F8FA; color: #101828; }
    .res-btn:active { background: #F1F3F7; }
    .res-btn.prim { flex: 1.6; background: #1667F2; border-right-color: #1257D8; color: #f2f2f3; font-weight: 600; }
    .res-btn.prim:hover { background: #1257D8; }
    .res-footer {
      display: flex; align-items: center; justify-content: space-between;
      padding: 8px 14px; font-size: 10px; color: #98A2B3;
    }
    .res-ftr-left { display: flex; align-items: center; gap: 6px; }
    .res-ftr-dot { width: 5px; height: 5px; background: #16B364; border-radius: 50%; }
  `;

  const card = document.createElement("div");
  card.className = "res-card";
  card.innerHTML = `
    <div class="res-status">
      <div class="res-check">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
      </div>
      <span class="res-title">Screenshot captured</span>
      <span class="res-dim">${w}×${h}px captured via ${methodLabel}</span>
      <button class="res-close" id="gf-res-close" aria-label="Dismiss">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>
    <div class="res-preview">
      <img src="${payload.dataUrl}" alt="Capture Preview" />
      <div class="res-preview-fade" style="display:${isLongCapture ? "flex" : "none"};">
        <span class="res-preview-pill">Selected Area</span>
      </div>
    </div>
    <div class="res-actions">
      <button class="res-btn prim" id="gf-res-copy">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="1"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
        <span>Copy</span>
      </button>
      <button class="res-btn" id="gf-res-png">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        <span>PNG</span>
      </button>
      <button class="res-btn" id="gf-res-webp">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        <span>WebP</span>
      </button>
      <button class="res-btn" id="gf-res-pdf">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="M9 13h6M9 17h3"/></svg>
        <span>PDF</span>
      </button>
      <button class="res-btn" id="gf-res-edit">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>
        <span>Edit</span>
      </button>
    </div>
    <div class="res-footer">
      <div class="res-ftr-left"><div class="res-ftr-dot"></div><span>GoFully v1.1</span></div>
      <span>100% Offline</span>
    </div>
  `;

  shadow.appendChild(style);
  shadow.appendChild(card);
  (document.body || document.documentElement).appendChild(resultCardHost);
  requestAnimationFrame(() => card.classList.add("show"));

  const setBtnBusy = (btn: HTMLElement, busyLabel: string, doneLabel: string, ok: boolean) => {
    const label = btn.querySelector("span");
    if (!label) return;
    const orig = label.textContent ?? "";
    label.textContent = ok ? doneLabel : "Failed";
    (btn as HTMLButtonElement).style.opacity = "0.75";
    setTimeout(() => {
      label.textContent = orig;
      (btn as HTMLButtonElement).style.opacity = "";
    }, 1800);
  };

  shadow.getElementById("gf-res-close")!.addEventListener("click", dismissResultCard);

  shadow.getElementById("gf-res-copy")!.addEventListener("click", async (e) => {
    const btn = e.currentTarget as HTMLElement;
    try {
      const res = await fetch(payload.dataUrl);
      const blob = await res.blob();
      const pngBlob = blob.type === "image/png" ? blob : await convertToPng(blob);
      const uhdBlob = await upscaleToUHD(pngBlob);
      await navigator.clipboard.write([new ClipboardItem({ "image/png": uhdBlob })]);
      setBtnBusy(btn, "", "Copied!", true);
    } catch {
      setBtnBusy(btn, "", "Failed", false);
    }
  });

  shadow.getElementById("gf-res-png")!.addEventListener("click", async (e) => {
    const btn = e.currentTarget as HTMLElement;
    const resp = await chrome.runtime.sendMessage({ type: "EXPORT_CAPTURE", payload: { format: "png" } }).catch(() => null);
    setBtnBusy(btn, "", resp?.success ? "Saved!" : "Failed", !!resp?.success);
  });

  shadow.getElementById("gf-res-webp")!.addEventListener("click", async (e) => {
    const btn = e.currentTarget as HTMLElement;
    const resp = await chrome.runtime.sendMessage({ type: "EXPORT_CAPTURE", payload: { format: "webp" } }).catch(() => null);
    setBtnBusy(btn, "", resp?.success ? "Saved!" : "Failed", !!resp?.success);
  });

  shadow.getElementById("gf-res-pdf")!.addEventListener("click", async (e) => {
    const btn = e.currentTarget as HTMLElement;
    const label = btn.querySelector("span");
    const orig = label?.textContent ?? "PDF";
    if (label) label.textContent = "Generating...";
    const resp = await chrome.runtime.sendMessage({ type: "EXPORT_CAPTURE", payload: { format: "pdf" } }).catch(() => null);
    if (label) label.textContent = orig;
    setBtnBusy(btn, "", resp?.success ? "Saved!" : "Failed", !!resp?.success);
  });

  shadow.getElementById("gf-res-edit")!.addEventListener("click", () => {
    chrome.runtime.sendMessage({ type: "OPEN_EDITOR" }).catch(() => {});
    dismissResultCard();
  });
}

// ─── Quick-capture toast (Visible Area / Selected Area) ──────────────────────
// These modes are "grab it and go": no card, no new tab — just an instant
// clipboard copy and a small confirmation pill, reusing the same visual slot
// (top-center) as the in-progress badge below.

let quickToastEl: HTMLDivElement | null = null;

async function showQuickCaptureToast(dataUrl: string): Promise<void> {
  removeProgressOverlay();
  playShutterSound();

  let copied = true;
  try {
    await copyImageFromDataUrl(dataUrl);
  } catch {
    copied = false;
  }

  if (!quickToastEl) {
    quickToastEl = document.createElement("div");
    quickToastEl.id = "gofully-quick-toast";
    quickToastEl.style.cssText = `
      position: fixed !important;
      top: 16px !important;
      left: 50% !important;
      transform: translateX(-50%) !important;
      z-index: 2147483647 !important;
      pointer-events: none !important;
      user-select: none !important;
      background: rgba(16, 24, 40, 0.92) !important;
      backdrop-filter: blur(8px) !important;
      -webkit-backdrop-filter: blur(8px) !important;
      color: #ffffff !important;
      padding: 8px 16px !important;
      border-radius: 9999px !important;
      font-family: ${FONT_STACK} !important;
      font-size: 12px !important;
      font-weight: 500 !important;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.18) !important;
      display: flex !important;
      align-items: center !important;
      gap: 8px !important;
      border: 1px solid rgba(255, 255, 255, 0.15) !important;
      opacity: 0 !important;
      transition: opacity .15s !important;
    `;
    (document.body || document.documentElement).appendChild(quickToastEl);
  }

  quickToastEl.innerHTML = copied
    ? `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16B364" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg><span>Copied to clipboard</span>`
    : `<span>Screenshot captured</span>`;
  quickToastEl.style.opacity = "1";

  clearTimeout((quickToastEl as any)._hideTimer);
  (quickToastEl as any)._hideTimer = setTimeout(() => {
    if (quickToastEl) quickToastEl.style.opacity = "0";
  }, 1800);

  claimPendingRateNudge().then((due) => {
    if (due) setTimeout(showQuickRateNudge, 1000);
  });
}

// ─── Rate nudge (standalone, page-level — no longer tied to a result card) ──

let rateNudgeHost: HTMLDivElement | null = null;

function showQuickRateNudge(): void {
  if (rateNudgeHost) return;

  rateNudgeHost = document.createElement("div");
  rateNudgeHost.id = "gofully-rate-nudge-host";
  rateNudgeHost.style.cssText = "position:fixed; inset:0; z-index:2147483647; pointer-events:none;";
  const shadow = rateNudgeHost.attachShadow({ mode: "closed" });

  const style = document.createElement("style");
  style.textContent = `
    .rate-nudge {
      position: fixed; bottom: 16px; right: 16px;
      width: 280px;
      background: #ffffff;
      border: 1px solid #E3E8EF;
      box-shadow: 0 10px 30px rgba(16,24,40,0.06), 0 20px 24px -4px rgba(16,24,40,0.12);
      padding: 14px;
      pointer-events: auto;
      opacity: 0; transform: translateY(12px);
      transition: opacity 0.2s cubic-bezier(0.16,1,0.3,1), transform 0.2s cubic-bezier(0.16,1,0.3,1);
      font-family: ${FONT_STACK};
      -webkit-font-smoothing: antialiased;
    }
    .rate-nudge.show { opacity: 1; transform: translateY(0); }
    .rate-nudge-row { display: flex; align-items: flex-start; gap: 10px; }
    .rate-nudge-star {
      width: 28px; height: 28px; flex-shrink: 0;
      background: #FEF3C7; color: #B45309;
      display: flex; align-items: center; justify-content: center;
    }
    .rate-nudge-title { font-size: 12.5px; font-weight: 700; color: #1D2939; line-height: 1.3; }
    .rate-nudge-sub { font-size: 11px; font-weight: 500; color: #667085; margin-top: 3px; line-height: 1.4; }
    .rate-nudge-close {
      border: none; background: none; cursor: pointer; color: #98A2B3;
      width: 22px; height: 22px; flex-shrink: 0;
      display: flex; align-items: center; justify-content: center;
    }
    .rate-nudge-close:hover { color: #475467; }
    .rate-nudge-actions { display: flex; gap: 7px; margin-top: 12px; }
    .rate-nudge-btn {
      flex: 1; height: 32px; cursor: pointer;
      font-size: 11.5px; font-weight: 600; font-family: ${FONT_STACK};
      transition: all 0.12s;
    }
    .rate-nudge-btn-primary { border: 1.5px solid #1667F2; background: #1667F2; color: #fff; }
    .rate-nudge-btn-primary:hover { background: #1257D8; border-color: #1257D8; }
    .rate-nudge-btn-secondary { border: 1.5px solid #E3E8EF; background: #fff; color: #475467; }
    .rate-nudge-btn-secondary:hover { background: #F7F8FA; border-color: #C8D0D9; }
  `;

  const nudge = document.createElement("div");
  nudge.className = "rate-nudge";
  nudge.innerHTML = `
    <div class="rate-nudge-row">
      <div class="rate-nudge-star">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
      </div>
      <div style="flex:1">
        <div class="rate-nudge-title">Enjoying GoFully?</div>
        <div class="rate-nudge-sub">A quick rating helps others discover the extension.</div>
      </div>
      <button class="rate-nudge-close" id="sf-rate-close">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>
    <div class="rate-nudge-actions">
      <button class="rate-nudge-btn rate-nudge-btn-primary" id="sf-rate-yes">Yes, rate it</button>
      <button class="rate-nudge-btn rate-nudge-btn-secondary" id="sf-rate-no">Not now</button>
    </div>
  `;

  shadow.appendChild(style);
  shadow.appendChild(nudge);
  (document.body || document.documentElement).appendChild(rateNudgeHost);
  requestAnimationFrame(() => nudge.classList.add("show"));

  const dismiss = () => {
    nudge.classList.remove("show");
    setTimeout(() => {
      rateNudgeHost?.remove();
      rateNudgeHost = null;
    }, 200);
  };

  shadow.getElementById("sf-rate-yes")!.addEventListener("click", () => {
    markRatedYes().catch(() => {});
    dismiss();
  });
  shadow.getElementById("sf-rate-no")!.addEventListener("click", () => {
    markDismissed().catch(() => {});
    dismiss();
  });
  shadow.getElementById("sf-rate-close")!.addEventListener("click", () => {
    markDismissed().catch(() => {});
    dismiss();
  });
}

// ─── In-page capture progress badge (Full Page / Scrolling Area) ────────────
//
// result-bar.js is injected TWICE per page: once automatically via the
// manifest's content_scripts, and again by injectContentScripts() in
// service-worker.ts right before every capture starts (belt-and-suspenders,
// in case the manifest injection hadn't landed yet). Each injection re-runs
// this entire file, creating a brand-new closure with its own local
// variables — but chrome.runtime.onMessage.addListener below only ever
// registers ONCE (guarded further down), so the ACTIVE listener that
// receives real CAPTURE_PROGRESS messages stays bound to whichever closure
// was injected FIRST, while window.__gofully_* (used by
// suppressProgressInTab et al. in utils/progress-overlay.ts) always gets
// reassigned to point at whichever closure was injected MOST RECENTLY.
//
// If this badge's state lived in module-level `let` variables, those two
// closures would silently diverge: a suppress call reaching the most-recent
// closure would flip a flag the FIRST (listening) closure never reads, so a
// real, delayed CAPTURE_PROGRESS message would still create and show the
// badge completely unsuppressed — observed as an intermittent leak that
// tightened Playwright timing alone couldn't explain. Storing the state on
// `window` instead makes it one shared source of truth no matter which
// closure reads or writes it.
interface ProgressState {
  overlay: HTMLDivElement | null;
  badgeText: HTMLSpanElement | null;
  suppressed: boolean;
}

function progressState(): ProgressState {
  const w = window as any;
  if (!w.__gfProgressState) {
    w.__gfProgressState = { overlay: null, badgeText: null, suppressed: false } as ProgressState;
  }
  return w.__gfProgressState as ProgressState;
}

// CAPTURE_PROGRESS messages arrive via a fire-and-forget chrome.tabs.sendMessage
// (see service-worker.ts's sendProgress) and can be delayed on a busy page —
// including delayed past the moment the background asked to hide the badge
// right before a captureVisibleTab() shutter. When that happens the message
// lands moments later and CREATES the badge for the first time right before
// the shutter, baking it into the screenshot. Suppression (set/cleared via
// suppressProgressOverlay/unsuppressProgressOverlay, called from the
// background around every shutter — see utils/progress-overlay.ts) closes
// that gap by dropping any progress update, not just hiding a rendered one.

export function suppressProgressOverlay(): void {
  const s = progressState();
  s.suppressed = true;
  if (s.overlay) s.overlay.style.setProperty("display", "none", "important");
}

export function unsuppressProgressOverlay(): void {
  progressState().suppressed = false;
}

export function showProgressOverlay(current: number, total: number, phase: string): void {
  if (phase === "done") {
    removeProgressOverlay();
    return;
  }
  const s = progressState();
  if (s.suppressed) return;

  if (!s.overlay) {
    s.overlay = document.createElement("div");
    s.overlay.id = "gofully-progress-overlay";
    s.overlay.style.cssText = `
      position: fixed !important;
      top: 16px !important;
      left: 50% !important;
      transform: translateX(-50%) !important;
      z-index: 2147483647 !important;
      pointer-events: auto !important;
      user-select: none !important;
    `;

    const badge = document.createElement("div");
    badge.id = "gofully-progress-badge";
    badge.style.cssText = `
      background: rgba(16, 24, 40, 0.92) !important;
      backdrop-filter: blur(8px) !important;
      -webkit-backdrop-filter: blur(8px) !important;
      color: #ffffff !important;
      padding: 8px 16px !important;
      border-radius: 9999px !important;
      font-family: ${FONT_STACK} !important;
      font-size: 12px !important;
      font-weight: 500 !important;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.18) !important;
      display: flex !important;
      align-items: center !important;
      gap: 8px !important;
      border: 1px solid rgba(255, 255, 255, 0.15) !important;
    `;

    const dot = document.createElement("span");
    dot.style.cssText = `
      width: 8px !important;
      height: 8px !important;
      border-radius: 50% !important;
      background: #16B364 !important;
      display: inline-block !important;
    `;
    badge.appendChild(dot);

    s.badgeText = document.createElement("span");
    s.badgeText.textContent = "Capturing page...";
    badge.appendChild(s.badgeText);

    const escHint = document.createElement("span");
    escHint.style.cssText = "color: #94A3B8 !important; font-size: 11px !important; margin-left: 2px !important;";
    escHint.textContent = "(Esc to cancel)";
    badge.appendChild(escHint);

    s.overlay.appendChild(badge);
    (document.body || document.documentElement).appendChild(s.overlay);
  }

  const pct = total > 0 ? Math.min(100, Math.round((current / total) * 100)) : 0;
  if (s.badgeText) {
    s.badgeText.textContent = phase === "stitching" ? "Stitching capture..." : `Capturing page... ${pct}%`;
  }
}

export function removeProgressOverlay(): void {
  const existing = document.getElementById("gofully-progress-overlay");
  if (existing) existing.remove();
  const s = progressState();
  s.overlay = null;
  s.badgeText = null;
}

// Make globally accessible on window for direct script invocation
(window as any).__gofully_show_progress = showProgressOverlay;
(window as any).__gofully_remove_progress = removeProgressOverlay;
(window as any).__gofully_suppress_progress = suppressProgressOverlay;
(window as any).__gofully_unsuppress_progress = unsuppressProgressOverlay;

if (!(window as any).__snapforge_result_bar_listener_registered) {
  (window as any).__snapforge_result_bar_listener_registered = true;
  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message.type === "CAPTURE_PROGRESS") {
      const { current, total, phase } = message.payload || {};
      showProgressOverlay(current, total, phase);
      sendResponse({ ok: true });
      return true;
    }
    if (message.type === "QUICK_CAPTURE_TOAST") {
      showQuickCaptureToast(message.payload?.dataUrl).catch(() => {});
      sendResponse({ shown: true });
      return true;
    }
    if (message.type === "SHOW_RESULT_CARD") {
      showResultCard(message.payload);
      sendResponse({ shown: true });
      return true;
    }
    return false;
  });

  window.addEventListener(
    "keydown",
    (e) => {
      if (e.key === "Escape" && document.getElementById("gofully-progress-overlay")) {
        e.preventDefault();
        removeProgressOverlay();
        chrome.runtime.sendMessage({ type: "CANCEL_CAPTURE" }).catch(() => {});
      }
    },
    true
  );
}

// Ensure any stale in-page progress overlay is immediately purged from DOM
removeProgressOverlay();

// In-page keyboard shortcut listener:
// Cmd/Ctrl/Alt + Shift + F (Full Page)
// Cmd/Ctrl/Alt + Shift + V (Visible Area)
// Cmd/Ctrl/Alt + Shift + A (Selected Area)
function handleCaptureShortcut(e: KeyboardEvent): void {
  const hasModifier = (e.metaKey || e.ctrlKey || e.altKey) && e.shiftKey;
  if (!hasModifier) return;

  const target = e.target as HTMLElement | null;
  if (
    target &&
    (target.tagName === "INPUT" ||
      target.tagName === "TEXTAREA" ||
      target.isContentEditable)
  ) {
    return;
  }

  const key = (e.key || "").toLowerCase();
  const code = e.code || "";

  const isF = code === "KeyF" || key === "f" || code === "Digit1" || key === "1";
  const isV = code === "KeyV" || key === "v" || code === "Digit3" || key === "3";
  const isA = code === "KeyA" || key === "a" || code === "Digit4" || key === "4";

  if (isF) {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    chrome.runtime.sendMessage({
      type: "START_CAPTURE",
      payload: { mode: "full-page" },
    }).catch(() => {});
  } else if (isV) {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    chrome.runtime.sendMessage({
      type: "START_CAPTURE",
      payload: { mode: "visible-area" },
    }).catch(() => {});
  } else if (isA) {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    chrome.runtime.sendMessage({
      type: "INIT_INTERACTIVE_MODE",
      payload: { mode: "selected-area" },
      mode: "selected-area",
    }).catch(() => {});
  }
}

if (!(window as any).__gofully_shortcut_listener_registered) {
  (window as any).__gofully_shortcut_listener_registered = true;
  window.addEventListener("keydown", handleCaptureShortcut, true);
  document.addEventListener("keydown", handleCaptureShortcut, true);
}
