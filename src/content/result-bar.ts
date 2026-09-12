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

let progressOverlay: HTMLDivElement | null = null;
let progressBadgeText: HTMLSpanElement | null = null;

export function showProgressOverlay(current: number, total: number, phase: string): void {
  if (phase === "done") {
    removeProgressOverlay();
    return;
  }

  if (!progressOverlay) {
    progressOverlay = document.createElement("div");
    progressOverlay.id = "gofully-progress-overlay";
    progressOverlay.style.cssText = `
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

    progressBadgeText = document.createElement("span");
    progressBadgeText.textContent = "Capturing page...";
    badge.appendChild(progressBadgeText);

    const escHint = document.createElement("span");
    escHint.style.cssText = "color: #94A3B8 !important; font-size: 11px !important; margin-left: 2px !important;";
    escHint.textContent = "(Esc to cancel)";
    badge.appendChild(escHint);

    progressOverlay.appendChild(badge);
    (document.body || document.documentElement).appendChild(progressOverlay);
  }

  const pct = total > 0 ? Math.min(100, Math.round((current / total) * 100)) : 0;
  if (progressBadgeText) {
    progressBadgeText.textContent = phase === "stitching" ? "Stitching capture..." : `Capturing page... ${pct}%`;
  }
}

export function removeProgressOverlay(): void {
  const existing = document.getElementById("gofully-progress-overlay");
  if (existing) existing.remove();
  progressOverlay = null;
  progressBadgeText = null;
}

// Make globally accessible on window for direct script invocation
(window as any).__gofully_show_progress = showProgressOverlay;
(window as any).__gofully_remove_progress = removeProgressOverlay;

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
