import type { CaptureRegion } from "../types";

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === "START_REGION_SELECT_MODE") {
    const tabId = message.payload.tabId;
    startRegionSelection((region) => {
      if (region) {
        chrome.runtime.sendMessage(
          { type: "START_CAPTURE", payload: { mode: "selected-area", region } },
          () => { if (chrome.runtime.lastError) { /* popup closed, expected */ } }
        );
      }
    });
    sendResponse({ started: true });
    return true;
  }
  return false;
});

let host: HTMLDivElement | null = null;
let shadow: ShadowRoot | null = null;
let overlay: HTMLDivElement | null = null;
let selection: HTMLDivElement | null = null;
let badge: HTMLDivElement | null = null;
let hint: HTMLDivElement | null = null;
let startX = 0;
let startY = 0;
let isDragging = false;
let onComplete: ((region: CaptureRegion | null) => void) | null = null;

export function startRegionSelection(
  callback: (region: CaptureRegion | null) => void
): void {
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
  host = document.createElement("div");
  host.id = "snapforge-region-host";
  shadow = host.attachShadow({ mode: "closed" });

  const style = document.createElement("style");
  style.textContent = `
    * { margin: 0; padding: 0; box-sizing: border-box; }
    .overlay {
      position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
      z-index: 2147483646; cursor: crosshair;
      background: rgba(0,0,0,0.45);
      transition: background 0.2s;
    }
    .overlay.active { background: transparent; }
    .hint {
      position: fixed; top: 50%; left: 50%;
      transform: translate(-50%, -50%);
      display: flex; flex-direction: column; align-items: center; gap: 12px;
      pointer-events: none; z-index: 2147483647;
      animation: fadeIn 0.3s ease;
    }
    .hint-icon {
      width: 56px; height: 56px; border-radius: 14px;
      background: rgba(59,130,246,0.15); border: 2px dashed rgba(59,130,246,0.5);
      display: flex; align-items: center; justify-content: center;
      animation: pulse 2s ease-in-out infinite;
    }
    .hint-text {
      color: white; font: 600 15px/1.4 -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      text-shadow: 0 2px 8px rgba(0,0,0,0.5);
    }
    .hint-sub {
      color: rgba(255,255,255,0.6); font: 400 12px/1.4 -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      text-shadow: 0 1px 4px rgba(0,0,0,0.5);
    }
    @keyframes pulse {
      0%, 100% { transform: scale(1); opacity: 1; }
      50% { transform: scale(1.08); opacity: 0.7; }
    }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    .selection {
      position: fixed; z-index: 2147483647;
      border: 2px solid #3b82f6;
      box-shadow: 0 0 0 9999px rgba(0,0,0,0.45);
      pointer-events: none; display: none;
    }
    .selection::before, .selection::after,
    .corner-bl, .corner-br {
      content: ''; position: absolute; width: 10px; height: 10px;
      border-color: #3b82f6; border-style: solid;
    }
    .selection::before { top: -2px; left: -2px; border-width: 3px 0 0 3px; }
    .selection::after { top: -2px; right: -2px; border-width: 3px 3px 0 0; }
    .corner-bl { bottom: -2px; left: -2px; border-width: 0 0 3px 3px; position: absolute; }
    .corner-br { bottom: -2px; right: -2px; border-width: 0 3px 3px 0; position: absolute; }
    .badge {
      position: absolute; top: -32px; left: 50%; transform: translateX(-50%);
      background: #3b82f6; color: white;
      font: 600 11px/1 -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      padding: 5px 10px; border-radius: 6px;
      white-space: nowrap; pointer-events: none;
      box-shadow: 0 2px 8px rgba(59,130,246,0.4);
      display: none;
    }
    .badge::after {
      content: ''; position: absolute; bottom: -4px; left: 50%;
      transform: translateX(-50%);
      border-left: 5px solid transparent; border-right: 5px solid transparent;
      border-top: 5px solid #3b82f6;
    }
  `;

  overlay = document.createElement("div");
  overlay.className = "overlay";

  hint = document.createElement("div");
  hint.className = "hint";
  hint.innerHTML = `
    <div class="hint-icon">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <rect x="4" y="4" width="16" height="16" rx="2" stroke="#3b82f6" stroke-width="2" stroke-dasharray="4 3"/>
        <path d="M4 9L4 4L9 4" stroke="#3b82f6" stroke-width="2.5" stroke-linecap="round"/>
        <path d="M20 15L20 20L15 20" stroke="#3b82f6" stroke-width="2.5" stroke-linecap="round"/>
      </svg>
    </div>
    <div class="hint-text">Drag to select area</div>
    <div class="hint-sub">Press Esc to cancel</div>
  `;

  selection = document.createElement("div");
  selection.className = "selection";
  const cbl = document.createElement("div");
  cbl.className = "corner-bl";
  const cbr = document.createElement("div");
  cbr.className = "corner-br";
  selection.appendChild(cbl);
  selection.appendChild(cbr);

  badge = document.createElement("div");
  badge.className = "badge";
  selection.appendChild(badge);

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
}

function handleMouseDown(e: MouseEvent): void {
  isDragging = true;
  startX = e.clientX;
  startY = e.clientY;
  if (hint) hint.style.display = "none";
  if (overlay) overlay.classList.add("active");
  if (selection) selection.style.display = "block";
  if (badge) badge.style.display = "block";
}

function handleMouseMove(e: MouseEvent): void {
  if (!isDragging || !selection || !badge) return;
  const x = Math.min(startX, e.clientX);
  const y = Math.min(startY, e.clientY);
  const w = Math.abs(e.clientX - startX);
  const h = Math.abs(e.clientY - startY);
  selection.style.left = `${x}px`;
  selection.style.top = `${y}px`;
  selection.style.width = `${w}px`;
  selection.style.height = `${h}px`;
  badge.textContent = `${Math.round(w)} x ${Math.round(h)}`;
}

function handleMouseUp(e: MouseEvent): void {
  isDragging = false;
  const x = Math.min(startX, e.clientX);
  const y = Math.min(startY, e.clientY);
  const w = Math.abs(e.clientX - startX);
  const h = Math.abs(e.clientY - startY);

  if (w < 10 || h < 10) {
    onComplete?.(null);
  } else {
    onComplete?.({ x, y, width: w, height: h });
  }
  stopRegionSelection();
}

function handleKeydown(e: KeyboardEvent): void {
  if (e.key === "Escape") {
    onComplete?.(null);
    stopRegionSelection();
  }
}
