import type { CaptureRegion } from "../types";

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
              const payload = response?.payload;
              if (payload && typeof (window as any).__snapforge_show_result_bar === "function") {
                (window as any).__snapforge_show_result_bar(payload);
              }
            }
          );
        }
      });
      sendResponse({ started: true });
      return true;
    }
    return false;
  });
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

  const style = document.createElement("style");
  style.textContent = `
    * { margin: 0; padding: 0; box-sizing: border-box; }
    .overlay {
      position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
      z-index: 2147483646; cursor: crosshair;
      background: rgba(0, 0, 0, 0.45);
      transition: background 0.15s ease;
      user-select: none;
    }
    .overlay.active { background: transparent; }

    .hint {
      position: fixed; top: 50%; left: 50%;
      transform: translate(-50%, -50%);
      display: flex; flex-direction: column; align-items: center; gap: 14px;
      pointer-events: none; z-index: 2147483647;
      animation: fadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      background: #ffffff;
      padding: 22px 30px;
      border-radius: 0px;
      border: 1px solid #cbd5e1;
      box-shadow: 0 10px 30px rgba(15, 23, 42, 0.15);
    }
    .hint-icon {
      width: 44px; height: 44px; border-radius: 0px;
      background: #eff6ff; border: 1.5px solid #2563eb;
      display: flex; align-items: center; justify-content: center;
      color: #2563eb;
    }
    .hint-text {
      color: #0f172a; font: 600 14px/1.4 -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      letter-spacing: -0.01em;
    }
    .hint-sub {
      color: #64748b; font: 400 12px/1.4 -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      display: flex; gap: 10px;
    }
    .hint-sub kbd {
      background: #f1f5f9;
      padding: 2px 6px;
      border-radius: 0px;
      border: 1px solid #cbd5e1;
      color: #334155;
      font-weight: 600;
      font-size: 11px;
    }
    @keyframes fadeIn { from { opacity: 0; transform: translate(-50%, -46%); } to { opacity: 1; transform: translate(-50%, -50%); } }

    .selection {
      position: fixed; z-index: 2147483647;
      border: 1.5px solid #1667F2;
      box-shadow: 0 0 0 99999px rgba(0, 0, 0, 0.52);
      display: none;
      box-sizing: border-box;
      cursor: move;
      border-radius: 0px;
    }

    /* Handles */
    .handle {
      position: absolute; width: 8px; height: 8px;
      background: #FFFFFF;
      border: 1.5px solid #1667F2;
      border-radius: 0px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.2);
      z-index: 2;
    }
    .handle-nw { top: -5px; left: -5px; cursor: nwse-resize; }
    .handle-ne { top: -5px; right: -5px; cursor: nesw-resize; }
    .handle-sw { bottom: -5px; left: -5px; cursor: nesw-resize; }
    .handle-se { bottom: -5px; right: -5px; cursor: nwse-resize; }
    .handle-n  { top: -5px; left: 50%; transform: translateX(-50%); cursor: ns-resize; }
    .handle-s  { bottom: -5px; left: 50%; transform: translateX(-50%); cursor: ns-resize; }
    .handle-w  { top: 50%; left: -5px; transform: translateY(-50%); cursor: ew-resize; }
    .handle-e  { top: 50%; right: -5px; transform: translateY(-50%); cursor: ew-resize; }

    /* Dimensions badge */
    .badge {
      position: absolute; top: -30px; left: 50%; transform: translateX(-50%);
      background: #ffffff; color: #0f172a;
      font: 600 11px/1 -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      padding: 5px 10px; border-radius: 0px;
      border: 1px solid #cbd5e1;
      white-space: nowrap; pointer-events: none;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      display: none;
      font-variant-numeric: tabular-nums;
      letter-spacing: 0.02em;
    }
    .badge.bottom {
      top: auto;
      bottom: -30px;
    }

    /* Actions Bar */
    .actions-bar {
      position: absolute; bottom: -38px; right: 0;
      display: none; align-items: center; gap: 4px;
      background: #ffffff; padding: 4px 6px;
      border-radius: 0px;
      border: 1px solid #cbd5e1;
      box-shadow: 0 4px 14px rgba(0,0,0,0.15);
      z-index: 3;
    }
    .action-btn {
      height: 26px; padding: 0 10px; border-radius: 0px;
      font: 600 11px -apple-system, BlinkMacSystemFont, sans-serif;
      border: 1px solid transparent; cursor: pointer;
      display: flex; align-items: center; gap: 4px;
    }
    .action-btn.primary { background: #1667F2; color: #fff; }
    .action-btn.primary:hover { background: #1257D8; }
    .action-btn.cancel { background: #f1f5f9; color: #475569; border-color: #cbd5e1; }
    .action-btn.cancel:hover { background: #e2e8f0; color: #0f172a; }
  `;

  overlay = document.createElement("div");
  overlay.className = "overlay";

  hint = document.createElement("div");
  hint.className = "hint";
  hint.innerHTML = `
    <div class="hint-icon">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M6 2v14a2 2 0 0 0 2 2h14"></path>
        <path d="M18 22V8a2 2 0 0 0-2-2H2"></path>
      </svg>
    </div>
    <div class="hint-text">Click and drag to select capture area</div>
    <div class="hint-sub">
      <span><kbd>Enter</kbd> Capture</span>
      <span><kbd>Esc</kbd> Cancel</span>
    </div>
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
    <button class="action-btn primary" id="sf-capture-btn">
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
      Capture
    </button>
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
