import type { CaptureRegion } from "../types";
import { T, FONT_FAMILY, applyOverlayTheme, alpha, SQUIRCLE_CSS } from "../ui/overlay-kit";
import { icon } from "../ui/ds/icons";

/** Same family as src/ui/overlay-kit.ts — this file styles a shadow root. */
const FONT_STACK = FONT_FAMILY;

/** GoFully DS v2 roles as CSS variables on the shadow host (Figma: Overlay / Region · *). */
function setVars(el: HTMLElement): void {
  const v: Record<string, string> = {
    "--gf-bg-surface": T.surface, "--gf-bg-sunken": T.surfaceSunken, "--gf-bg-hover": T.surfaceAlt,
    "--gf-border": T.border, "--gf-border-strong": T.borderStrong,
    "--gf-text": T.text, "--gf-text-2": T.textMuted, "--gf-text-3": T.textFaint,
    "--gf-brand": T.accent, "--gf-brand-hover": T.accentHover, "--gf-on-brand": T.onAccent,
    "--gf-focus": T.focus, "--gf-shade": T.shade, "--gf-shadow-lg": T.shadowLg,
    "--gf-ink-key": alpha(T.surface, 0.16), "--gf-ink-soft": alpha(T.surface, 0.72),
  };
  for (const [k, val] of Object.entries(v)) el.style.setProperty(k, val);
}

let activeTabId: number | null = null;

// Guard against duplicate injections
if (!(window as any).__snapforge_region_listener_registered) {
  (window as any).__snapforge_region_listener_registered = true;
  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message.type === "START_REGION_SELECT_MODE") {
      activeTabId = message.payload?.tabId || null;
      startRegionSelection((region) => {
        if (region) {
          chrome.runtime.sendMessage(
            {
              type: "START_CAPTURE",
              payload: { mode: "selected-area", region, tabId: activeTabId },
            },
            (response) => {
              // The service worker's handleCaptureCompletionUI() already
              // triggers the quick-copy toast for selected-area once the
              // capture finishes — nothing else needed here on success.
              if (response?.type === "CAPTURE_ERROR") {
                showInlineError(response.payload?.message || "Capture failed");
              }
            }
          );
        }
      });
      sendResponse({ started: true });
      return true;
    }
    if (message.type === "CAPTURE_ERROR_INLINE") {
      showInlineError(message.payload?.message || "Capture failed");
      return false;
    }
    return false;
  });
}

function showInlineError(msg: string): void {
  // Shared with result-bar.ts, which is always loaded: whichever script
  // reacts first creates the element, the other just reuses it.
  let el = document.getElementById("gofully-inline-notice");
  if (!el) {
    el = document.createElement("div");
    el.id = "gofully-inline-notice";
    el.style.cssText = `
      position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%);
      background: ${T.danger}; color: ${T.surface}; padding: 10px 16px; border-radius: ${T.radiusLg};
      font: 500 14px ${FONT_STACK}; z-index: 2147483647;
      box-shadow: ${T.shadowLg}; pointer-events: none;
    `;
    document.body.appendChild(el);
  }
  el.textContent = msg;
  clearTimeout((el as any)._hideTimer);
  (el as any)._hideTimer = setTimeout(() => el?.remove(), 4000);
}

let host: HTMLDivElement | null = null;
let shadow: ShadowRoot | null = null;
let overlay: HTMLDivElement | null = null;
let selection: HTMLDivElement | null = null;
let badge: HTMLDivElement | null = null;
let hint: HTMLDivElement | null = null;
let actionsBar: HTMLDivElement | null = null;

let startX = 0;
let startY = 0;
let isDragging = false;
let isResizing = false;
let isMoving = false;
let moveStartX = 0;
let moveStartY = 0;
let activeHandle = "";
let selectedRegion: CaptureRegion | null = null;
let onComplete: ((region: CaptureRegion | null) => void) | null = null;

export function startRegionSelection(
  callback: (region: CaptureRegion | null) => void
): void {
  cleanup();
  onComplete = callback;
  createUI();
  document.addEventListener("mousedown", handleMouseDown, true);
  document.addEventListener("mousemove", handleMouseMove, true);
  document.addEventListener("mouseup", handleMouseUp, true);
  document.addEventListener("keydown", handleKeydown, true);
}

export function stopRegionSelection(): void {
  cleanup();
  document.removeEventListener("mousedown", handleMouseDown, true);
  document.removeEventListener("mousemove", handleMouseMove, true);
  document.removeEventListener("mouseup", handleMouseUp, true);
  document.removeEventListener("keydown", handleKeydown, true);
  onComplete = null;
}

function createUI(): void {
  document.querySelectorAll("#snapforge-region-host").forEach((el) => el.remove());

  host = document.createElement("div");
  host.id = "snapforge-region-host";
  shadow = host.attachShadow({ mode: "open" });

  setVars(host);
  // Re-read the user's theme; the palette swaps in place once storage answers.
  void applyOverlayTheme().then(() => { if (host) setVars(host); });

  const style = document.createElement("style");
  style.textContent = SQUIRCLE_CSS + `
    @font-face {
      font-family: 'GoFully Inter';
      src: url('${chrome.runtime.getURL("assets/inter-latin-wght-normal.woff2")}') format('woff2-variations'),
           url('${chrome.runtime.getURL("assets/inter-latin-wght-normal.woff2")}') format('woff2');
      font-weight: 100 900;
      font-display: swap;
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    .overlay {
      position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
      z-index: 2147483646; cursor: crosshair;
      background: var(--gf-shade);
      transition: background 0.15s ease;
      user-select: none;
    }
    .overlay.active { background: transparent; }

    /* Figma: Overlay / Region · hint — an ink pill at the top, clear of what you are selecting. */
    .hint {
      position: fixed; top: 16px; left: 50%; transform: translateX(-50%);
      display: flex; align-items: center; gap: 10px; white-space: nowrap;
      pointer-events: none; z-index: 2147483647;
      animation: fadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      background: var(--gf-text); color: var(--gf-bg-surface);
      padding: 8px 14px; border-radius: 999px; box-shadow: var(--gf-shadow-lg);
      font: 500 13px/20px ${FONT_STACK};
    }
    .hint-icon { display: inline-flex; color: var(--gf-focus); }
    .hint kbd {
      font: 500 11px/16px ${FONT_STACK}; padding: 1px 6px; border-radius: 4px;
      background: var(--gf-ink-key); color: var(--gf-bg-surface);
    }
    .hint .soft { color: var(--gf-ink-soft); }
    @keyframes fadeIn { from { opacity: 0; transform: translate(-50%, -6px); } to { opacity: 1; transform: translate(-50%, 0); } }
    @media (prefers-reduced-motion: reduce) { .hint { animation: none; } }

    .selection {
      position: fixed; z-index: 2147483647;
      border: 2px solid var(--gf-focus);
      box-shadow: 0 0 0 99999px var(--gf-shade);
      display: none;
      box-sizing: border-box;
      cursor: move;
      border-radius: 2px;
    }

    /* Handles */
    .handle {
      position: absolute; width: 10px; height: 10px;
      background: var(--gf-bg-surface);
      border: 2px solid var(--gf-focus);
      border-radius: 50%; corner-shape: round;
      box-shadow: var(--gf-shadow-lg);
      z-index: 2;
    }
    .handle-nw { top: -6px; left: -6px; cursor: nwse-resize; }
    .handle-ne { top: -6px; right: -6px; cursor: nesw-resize; }
    .handle-sw { bottom: -6px; left: -6px; cursor: nesw-resize; }
    .handle-se { bottom: -6px; right: -6px; cursor: nwse-resize; }
    .handle-n  { top: -6px; left: 50%; transform: translateX(-50%); cursor: ns-resize; }
    .handle-s  { bottom: -6px; left: 50%; transform: translateX(-50%); cursor: ns-resize; }
    .handle-w  { top: 50%; left: -6px; transform: translateY(-50%); cursor: ew-resize; }
    .handle-e  { top: 50%; right: -6px; transform: translateY(-50%); cursor: ew-resize; }

    /* Dimensions badge */
    .badge {
      position: absolute; top: -28px; left: 0;
      background: var(--gf-brand); color: var(--gf-on-brand);
      font: 500 11px/16px ${FONT_STACK};
      padding: 2px 8px; border-radius: 6px;
      white-space: nowrap; pointer-events: none;
      display: none;
      font-variant-numeric: tabular-nums;
    }
    .badge.bottom { top: auto; bottom: -28px; }

    /* Actions bar — inside the selection, bottom-centre */
    .actions-bar {
      position: absolute; bottom: 12px; left: 50%; transform: translateX(-50%);
      display: none; align-items: center; gap: 6px;
      background: var(--gf-bg-surface);
      padding: 6px;
      border-radius: 999px;
      border: 1px solid var(--gf-border);
      box-shadow: var(--gf-shadow-lg);
      z-index: 3; white-space: nowrap;
    }
    .action-btn {
      height: 32px; padding: 0 14px; border-radius: 999px;
      font: 500 13px/1 ${FONT_STACK};
      border: 1px solid transparent; cursor: pointer;
      display: flex; align-items: center; gap: 6px;
      transition: background .15s ease, border-color .15s ease;
    }
    .action-btn:focus-visible { outline: none; box-shadow: 0 0 0 3px var(--gf-focus); }
    .action-btn.primary { background: var(--gf-brand); color: var(--gf-on-brand); }
    .action-btn.primary:hover { background: var(--gf-brand-hover); }
    .action-btn.cancel { background: transparent; color: var(--gf-text-2); }
    .action-btn.cancel:hover { background: var(--gf-bg-hover); color: var(--gf-text); }
  `;

  overlay = document.createElement("div");
  overlay.className = "overlay";

  hint = document.createElement("div");
  hint.className = "hint";
  hint.innerHTML = `
    <span class="hint-icon">${icon("region", 16)}</span>
    <span>Drag to select an area</span>
    <kbd>Enter</kbd><span class="soft">capture</span>
    <kbd>Esc</kbd><span class="soft">cancel</span>
  `;

  selection = document.createElement("div");
  selection.className = "selection";

  // Handles
  const handles = ["nw", "ne", "sw", "se", "n", "s", "w", "e"];
  handles.forEach((pos) => {
    const h = document.createElement("div");
    h.className = `handle handle-${pos}`;
    h.dataset.handle = pos;
    selection!.appendChild(h);
  });

  badge = document.createElement("div");
  badge.className = "badge";
  selection.appendChild(badge);

  actionsBar = document.createElement("div");
  actionsBar.className = "actions-bar";
  actionsBar.innerHTML = `
    <button class="action-btn cancel" id="sf-cancel-btn">Cancel</button>
    <button class="action-btn primary" id="sf-capture-btn">${icon("check", 16)}Capture</button>
  `;
  selection.appendChild(actionsBar);

  actionsBar.querySelector("#sf-capture-btn")?.addEventListener("click", (e) => {
    e.stopPropagation();
    confirmCapture();
  });
  actionsBar.querySelector("#sf-cancel-btn")?.addEventListener("click", (e) => {
    e.stopPropagation();
    onComplete?.(null);
    stopRegionSelection();
  });

  shadow.appendChild(style);
  shadow.appendChild(overlay);
  shadow.appendChild(hint);
  shadow.appendChild(selection);
  document.body.appendChild(host);
}

function cleanup(): void {
  host?.remove();
  host = null;
  shadow = null;
  overlay = null;
  selection = null;
  badge = null;
  hint = null;
  actionsBar = null;
  selectedRegion = null;
}

function updateSelectionUI(x: number, y: number, w: number, h: number): void {
  if (!selection || !badge) return;
  const rx = Math.max(0, x);
  const ry = Math.max(0, y);
  const rw = Math.max(1, w);
  const rh = Math.max(1, h);

  selection.style.left = `${rx}px`;
  selection.style.top = `${ry}px`;
  selection.style.width = `${rw}px`;
  selection.style.height = `${rh}px`;

  badge.textContent = `${Math.round(rw)} × ${Math.round(rh)} px`;
  if (ry < 40) {
    badge.classList.add("bottom");
  } else {
    badge.classList.remove("bottom");
  }

  selectedRegion = { x: rx, y: ry, width: rw, height: rh };
}

function handleMouseDown(e: MouseEvent): void {
  const path = e.composedPath ? e.composedPath() : [e.target];
  const target = (path[0] || e.target) as HTMLElement;
  const handleType = target?.dataset?.handle;

  if (handleType && selectedRegion) {
    isResizing = true;
    activeHandle = handleType;
    startX = e.clientX;
    startY = e.clientY;
    e.preventDefault();
    e.stopPropagation();
    return;
  }

  if (target === selection && selectedRegion) {
    isMoving = true;
    moveStartX = e.clientX - selectedRegion.x;
    moveStartY = e.clientY - selectedRegion.y;
    e.preventDefault();
    e.stopPropagation();
    return;
  }

  if (target?.closest?.(".actions-bar") || target?.id === "sf-capture-btn" || target?.id === "sf-cancel-btn") {
    return;
  }

  // Start new drag selection
  isDragging = true;
  startX = e.clientX;
  startY = e.clientY;
  if (hint) hint.style.display = "none";
  if (overlay) overlay.classList.add("active");
  if (selection) selection.style.display = "block";
  if (badge) badge.style.display = "block";
  if (actionsBar) actionsBar.style.display = "none";

  updateSelectionUI(startX, startY, 0, 0);
}

function handleMouseMove(e: MouseEvent): void {
  if (isDragging) {
    const x = Math.min(startX, e.clientX);
    const y = Math.min(startY, e.clientY);
    const w = Math.abs(e.clientX - startX);
    const h = Math.abs(e.clientY - startY);
    updateSelectionUI(x, y, w, h);
    return;
  }

  if (isResizing && selectedRegion) {
    let { x, y, width: w, height: h } = selectedRegion;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;

    if (activeHandle.includes("e")) w += dx;
    if (activeHandle.includes("s")) h += dy;
    if (activeHandle.includes("w")) { x += dx; w -= dx; }
    if (activeHandle.includes("n")) { y += dy; h -= dy; }

    if (w > 10 && h > 10) {
      startX = e.clientX;
      startY = e.clientY;
      updateSelectionUI(x, y, w, h);
    }
    return;
  }

  if (isMoving && selectedRegion) {
    const newX = Math.max(0, Math.min(window.innerWidth - selectedRegion.width, e.clientX - moveStartX));
    const newY = Math.max(0, Math.min(window.innerHeight - selectedRegion.height, e.clientY - moveStartY));
    updateSelectionUI(newX, newY, selectedRegion.width, selectedRegion.height);
    return;
  }
}

function handleMouseUp(_e: MouseEvent): void {
  if (isDragging) {
    isDragging = false;
    if (selectedRegion && selectedRegion.width > 15 && selectedRegion.height > 15) {
      if (actionsBar) actionsBar.style.display = "flex";
    } else {
      onComplete?.(null);
      stopRegionSelection();
    }
  }

  if (isResizing) {
    isResizing = false;
    activeHandle = "";
  }

  if (isMoving) {
    isMoving = false;
  }
}

function confirmCapture(): void {
  if (selectedRegion && selectedRegion.width >= 10 && selectedRegion.height >= 10) {
    onComplete?.(selectedRegion);
  } else {
    onComplete?.(null);
  }
  stopRegionSelection();
}

function handleKeydown(e: KeyboardEvent): void {
  if (e.key === "Escape") {
    onComplete?.(null);
    stopRegionSelection();
  } else if (e.key === "Enter" && selectedRegion) {
    confirmCapture();
  }
}
