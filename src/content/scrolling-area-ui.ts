import type { CaptureRegion } from "../types";

// Listen for message to start scrolling area mode
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === "START_SCROLLING_AREA_MODE") {
    const tabId = message.payload.tabId;

    startScrollingAreaUI({
      onRegionSelected: (region) => {
        // Region selected, wait for user to pick auto/manual
      },
      onCaptureFrame: () => {
        // Manual frame capture — handled by the service worker
      },
      onAutoScrollStart: (speed) => {
        // Get the region from the current selection
        if (currentRegion) {
          chrome.runtime.sendMessage({
            type: "SCROLLING_REGION_SELECTED",
            payload: { region: currentRegion, speed, tabId },
          });
        }
      },
      onDone: () => {
        stopScrollingAreaUI();
      },
      onCancel: () => {
        stopScrollingAreaUI();
      },
    });

    sendResponse({ started: true });
    return true;
  }
  return false;
});

interface ScrollingAreaCallbacks {
  onRegionSelected: (region: CaptureRegion) => void;
  onCaptureFrame: () => void;
  onAutoScrollStart: (speed: "slow" | "medium" | "fast") => void;
  onDone: () => void;
  onCancel: () => void;
}

let overlay: HTMLDivElement | null = null;
let toolbar: HTMLDivElement | null = null;
let selectionBox: HTMLDivElement | null = null;
let progressBar: HTMLDivElement | null = null;
let frameCounter: HTMLSpanElement | null = null;
let startX = 0;
let startY = 0;
let isDragging = false;
let phase: "selecting" | "capturing" | "done" = "selecting";
let callbacks: ScrollingAreaCallbacks | null = null;
let currentRegion: CaptureRegion | null = null;

export function startScrollingAreaUI(cbs: ScrollingAreaCallbacks): void {
  callbacks = cbs;
  phase = "selecting";
  createOverlay();
}

export function updateFrameCount(count: number): void {
  if (frameCounter) frameCounter.textContent = `${count} frames`;
}

export function updateProgress(current: number, total: number): void {
  if (progressBar) {
    const pct = total > 0 ? (current / total) * 100 : 0;
    progressBar.style.width = `${pct}%`;
  }
}

export function stopScrollingAreaUI(): void {
  cleanup();
}

function createOverlay(): void {
  overlay = document.createElement("div");
  overlay.id = "snapforge-scrolling-overlay";
  Object.assign(overlay.style, {
    position: "fixed",
    top: "0",
    left: "0",
    width: "100vw",
    height: "100vh",
    backgroundColor: "rgba(0, 0, 0, 0.35)",
    zIndex: "2147483640",
    cursor: "crosshair",
  });

  const hint = document.createElement("div");
  Object.assign(hint.style, {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    color: "white",
    fontSize: "16px",
    fontFamily: "system-ui, sans-serif",
    fontWeight: "500",
    textAlign: "center",
    pointerEvents: "none",
    textShadow: "0 1px 3px rgba(0,0,0,0.5)",
  });
  hint.textContent = "Drag to select capture region";
  hint.id = "snapforge-hint";
  overlay.appendChild(hint);

  overlay.addEventListener("mousedown", onMouseDown);
  overlay.addEventListener("mousemove", onMouseMove);
  overlay.addEventListener("mouseup", onMouseUp);
  document.addEventListener("keydown", onKeyDown);

  document.body.appendChild(overlay);
}

function createSelectionBox(x: number, y: number, w: number, h: number): void {
  if (!selectionBox) {
    selectionBox = document.createElement("div");
    selectionBox.id = "snapforge-selection-box";
    Object.assign(selectionBox.style, {
      position: "fixed",
      border: "2px solid #3b82f6",
      backgroundColor: "transparent",
      zIndex: "2147483641",
      pointerEvents: "none",
      boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.35)",
    });

    const badge = document.createElement("div");
    badge.id = "snapforge-selection-badge";
    Object.assign(badge.style, {
      position: "absolute",
      top: "-26px",
      left: "0",
      backgroundColor: "#3b82f6",
      color: "white",
      fontSize: "11px",
      fontFamily: "system-ui, sans-serif",
      padding: "2px 8px",
      borderRadius: "3px",
      whiteSpace: "nowrap",
      pointerEvents: "none",
    });
    selectionBox.appendChild(badge);

    document.body.appendChild(selectionBox);
  }

  Object.assign(selectionBox.style, {
    left: `${x}px`,
    top: `${y}px`,
    width: `${w}px`,
    height: `${h}px`,
  });

  const badgeEl = selectionBox.querySelector("#snapforge-selection-badge") as HTMLDivElement;
  if (badgeEl) badgeEl.textContent = `${Math.round(w)} × ${Math.round(h)}`;
}

function createToolbar(): void {
  toolbar = document.createElement("div");
  toolbar.id = "snapforge-toolbar";
  Object.assign(toolbar.style, {
    position: "fixed",
    zIndex: "2147483642",
    backgroundColor: "#1e293b",
    borderRadius: "10px",
    padding: "8px 12px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontFamily: "system-ui, sans-serif",
    fontSize: "12px",
    color: "white",
    boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
  });

  if (currentRegion) {
    const top = currentRegion.y - 48;
    toolbar.style.top = `${top > 10 ? top : currentRegion.y + currentRegion.height + 10}px`;
    toolbar.style.left = `${currentRegion.x}px`;
  }

  // Auto-scroll button
  const autoBtn = makeButton("Auto-Scroll", "#22c55e", () => {
    callbacks?.onAutoScrollStart("medium");
    showCapturingUI();
  });

  // Manual button
  const manualBtn = makeButton("Manual", "#f59e0b", () => {
    showManualUI();
  });

  // Done button
  const doneBtn = makeButton("Done", "#3b82f6", () => {
    callbacks?.onDone();
  });
  doneBtn.id = "snapforge-done-btn";

  // Cancel button
  const cancelBtn = makeButton("Cancel", "#64748b", () => {
    callbacks?.onCancel();
    cleanup();
  });

  // Speed selector
  const speedGroup = document.createElement("div");
  Object.assign(speedGroup.style, {
    display: "flex",
    gap: "4px",
    marginLeft: "4px",
    borderLeft: "1px solid #475569",
    paddingLeft: "8px",
  });

  const speeds: Array<{ label: string; value: "slow" | "medium" | "fast" }> = [
    { label: "Slow", value: "slow" },
    { label: "Med", value: "medium" },
    { label: "Fast", value: "fast" },
  ];

  speeds.forEach((s) => {
    const btn = document.createElement("button");
    btn.textContent = s.label;
    Object.assign(btn.style, {
      background: s.value === "medium" ? "#475569" : "transparent",
      border: "1px solid #475569",
      color: "white",
      borderRadius: "4px",
      padding: "2px 6px",
      cursor: "pointer",
      fontSize: "10px",
    });
    btn.addEventListener("click", () => {
      speedGroup.querySelectorAll("button").forEach((b) => {
        (b as HTMLElement).style.background = "transparent";
      });
      btn.style.background = "#475569";
      callbacks?.onAutoScrollStart(s.value);
      showCapturingUI();
    });
    speedGroup.appendChild(btn);
  });

  toolbar.appendChild(autoBtn);
  toolbar.appendChild(manualBtn);
  toolbar.appendChild(speedGroup);

  const spacer = document.createElement("div");
  spacer.style.flex = "1";
  toolbar.appendChild(spacer);

  toolbar.appendChild(doneBtn);
  toolbar.appendChild(cancelBtn);

  document.body.appendChild(toolbar);
}

function showCapturingUI(): void {
  phase = "capturing";

  // Add progress bar and frame counter to toolbar
  if (!progressBar && toolbar) {
    const progressWrap = document.createElement("div");
    progressWrap.id = "snapforge-progress-wrap";
    Object.assign(progressWrap.style, {
      position: "absolute",
      bottom: "-8px",
      left: "0",
      right: "0",
      height: "3px",
      backgroundColor: "#334155",
      borderRadius: "0 0 10px 10px",
      overflow: "hidden",
    });

    progressBar = document.createElement("div");
    Object.assign(progressBar.style, {
      height: "100%",
      backgroundColor: "#22c55e",
      width: "0%",
      transition: "width 0.3s",
    });
    progressWrap.appendChild(progressBar);
    toolbar.appendChild(progressWrap);

    frameCounter = document.createElement("span");
    frameCounter.textContent = "0 frames";
    Object.assign(frameCounter.style, {
      fontSize: "10px",
      color: "#94a3b8",
    });
    toolbar.insertBefore(frameCounter, toolbar.querySelector("#snapforge-done-btn"));
  }
}

function showManualUI(): void {
  phase = "capturing";
  showCapturingUI();

  // Add a "Capture Frame" button
  if (toolbar) {
    const captureBtn = makeButton("Capture Frame", "#ec4899", () => {
      callbacks?.onCaptureFrame();
    });
    captureBtn.style.animation = "none";
    toolbar.insertBefore(captureBtn, toolbar.querySelector("#snapforge-done-btn"));
  }
}

function makeButton(text: string, color: string, onClick: () => void): HTMLButtonElement {
  const btn = document.createElement("button");
  btn.textContent = text;
  Object.assign(btn.style, {
    background: color,
    border: "none",
    color: "white",
    borderRadius: "6px",
    padding: "6px 12px",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "600",
    fontFamily: "system-ui, sans-serif",
    transition: "opacity 0.15s",
  });
  btn.addEventListener("mouseenter", () => (btn.style.opacity = "0.85"));
  btn.addEventListener("mouseleave", () => (btn.style.opacity = "1"));
  btn.addEventListener("click", onClick);
  return btn;
}

function onMouseDown(e: MouseEvent): void {
  if (phase !== "selecting") return;
  isDragging = true;
  startX = e.clientX;
  startY = e.clientY;

  const hint = document.getElementById("snapforge-hint");
  if (hint) hint.style.display = "none";

  // Make overlay transparent so selection box's box-shadow creates the dimming
  if (overlay) overlay.style.backgroundColor = "transparent";
}

function onMouseMove(e: MouseEvent): void {
  if (!isDragging || phase !== "selecting") return;
  const x = Math.min(startX, e.clientX);
  const y = Math.min(startY, e.clientY);
  const w = Math.abs(e.clientX - startX);
  const h = Math.abs(e.clientY - startY);
  createSelectionBox(x, y, w, h);
}

function onMouseUp(e: MouseEvent): void {
  if (!isDragging || phase !== "selecting") return;
  isDragging = false;

  const x = Math.min(startX, e.clientX);
  const y = Math.min(startY, e.clientY);
  const w = Math.abs(e.clientX - startX);
  const h = Math.abs(e.clientY - startY);

  if (w < 20 || h < 20) {
    cleanup();
    callbacks?.onCancel();
    return;
  }

  currentRegion = { x, y, width: w, height: h };

  // Remove overlay mouse events
  if (overlay) {
    overlay.removeEventListener("mousedown", onMouseDown);
    overlay.removeEventListener("mousemove", onMouseMove);
    overlay.removeEventListener("mouseup", onMouseUp);
    overlay.style.display = "none";
  }

  callbacks?.onRegionSelected(currentRegion);
  createToolbar();
}

function onKeyDown(e: KeyboardEvent): void {
  if (e.key === "Escape") {
    callbacks?.onCancel();
    cleanup();
  }
}

function cleanup(): void {
  overlay?.remove();
  selectionBox?.remove();
  toolbar?.remove();
  document.removeEventListener("keydown", onKeyDown);
  overlay = null;
  selectionBox = null;
  toolbar = null;
  progressBar = null;
  frameCounter = null;
  currentRegion = null;
  callbacks = null;
  phase = "selecting";
}
