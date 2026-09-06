import type { CaptureRegion } from "../types";
import {
  FONT_FAMILY,
  Icon,
  T,
  injectOverlayFont,
  makeButton,
  makePanel,
  makeText,
  removeOverlayFont,
} from "../ui/overlay-kit";

// ─── Messages ─────────────────────────────────────────────────────────────────
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === "START_SCROLLING_AREA_MODE") {
    startScrollingAreaUI(message.payload.tabId);
    sendResponse({ started: true });
    return true;
  }
  if (message.type === "SCROLLING_PROGRESS") {
    updateAutoProgress(message.payload?.current, message.payload?.total);
    return false;
  }
  if (message.type === "SCROLLING_CAPTURE_DONE") {
    cleanup();
    return false;
  }
  if (message.type === "CAPTURE_ERROR_INLINE") {
    cleanup();
    showInlineError(message.payload?.message || "Capture failed");
    return false;
  }
  if (message.type === "SCROLL_PROGRESS") {
    updateManualProgress(message.payload);
    return false;
  }
  // Auto mode still scrolls the page itself, so its capture panel isn't
  // guaranteed to fall outside the cropped region the way manual mode's is —
  // it hides around each shutter via this one message.
  if (message.type === "SCROLL_UI_VISIBILITY") {
    setOwnUiVisible(!message.hide);
    sendResponse({ ok: true });
    return true;
  }
  return false;
});

// ─── State ────────────────────────────────────────────────────────────────────
let crosshair: HTMLDivElement | null = null;
let selBox: HTMLDivElement | null = null;
let shades: HTMLDivElement[] = [];
let sizeBadge: HTMLDivElement | null = null;
let optionsPanel: HTMLDivElement | null = null;
let capturePanel: HTMLDivElement | null = null;
let previewImg: HTMLImageElement | null = null;
let frameCountEl: HTMLSpanElement | null = null;
let heightEl: HTMLSpanElement | null = null;
let statusEl: HTMLSpanElement | null = null;
let speedWarnEl: HTMLDivElement | null = null;
let autoProgressEl: HTMLDivElement | null = null;
let pollTimer: number | null = null;

let phase: "selecting" | "ready" | "capturing" = "selecting";
let captureMode: "auto" | "manual" | null = null;
let currentRegion: CaptureRegion | null = null;
let tabId: number | null = null;
let startX = 0, startY = 0, isDragging = false;
let selectedSpeed: "slow" | "medium" | "fast" = "medium";
// Keeps the background service worker alive for the duration of the
// capture — a long capture (many frames) has stretches with no chrome.*
// activity from the background's own perspective, which is enough for
// Chrome to tear the worker down mid-stitch. An open port prevents that.
let keepAlivePort: chrome.runtime.Port | null = null;

function startKeepAlivePort(): void {
  stopKeepAlivePort();
  try {
    keepAlivePort = chrome.runtime.connect({ name: "gf-capture-keepalive" });
  } catch { keepAlivePort = null; }
}

function stopKeepAlivePort(): void {
  try { keepAlivePort?.disconnect(); } catch {}
  keepAlivePort = null;
}

function startScrollingAreaUI(tid: number): void {
  cleanup();
  tabId = tid;
  phase = "selecting";
  injectOverlayFont();
  buildCrosshair();
}

function setOwnUiVisible(visible: boolean): void {
  // Toggling visibility (not removing/re-appending the nodes) keeps this
  // cheap and flash-free: this runs on every single poll — often several
  // times a second for the whole length of a capture — and remove()+
  // appendChild() forced a real reflow each time, which is what made the
  // capture panel visibly strobe throughout manual and auto captures.
  // `visibility: hidden` still keeps the element out of captureVisibleTab's
  // output, same as removing it did.
  const style = visible ? "" : "hidden";
  for (const el of [capturePanel, selBox, optionsPanel, sizeBadge]) {
    if (el) el.style.visibility = style;
  }
  shades.forEach((s) => { s.style.visibility = style; });
}

// ─── Phase 1: selection ───────────────────────────────────────────────────────
//
// The page stays fully visible. A transparent layer only captures the drag and
// sets the cursor; dimming is done by four rects *around* the selection, so the
// content being chosen is never washed out by an overlay sitting on top of it.

function buildCrosshair(): void {
  crosshair = document.createElement("div");
  Object.assign(crosshair.style, {
    position: "fixed", inset: "0", width: "100vw", height: "100vh",
    zIndex: "2147483640", cursor: "crosshair", userSelect: "none",
    background: "transparent",
  });

  const hint = makePanel({
    position: "absolute", top: "50%", left: "50%",
    transform: "translate(-50%,-50%)",
    padding: "14px 20px", textAlign: "center", pointerEvents: "none",
  });
  hint.id = "gf-hint";
  const title = makeText("Drag to select the scroll region", { size: "13px", weight: "600", color: T.text });
  const sub = makeText("Esc to cancel", { size: "11px", color: T.textFaint });
  Object.assign(hint.style, { display: "flex", flexDirection: "column", gap: "3px", alignItems: "center" });
  hint.append(title, sub);
  crosshair.appendChild(hint);

  crosshair.addEventListener("mousedown", onDown);
  crosshair.addEventListener("mousemove", onMove);
  crosshair.addEventListener("mouseup", onUp);
  document.addEventListener("keydown", onKey, true);
  document.body.appendChild(crosshair);
}

function drawSelection(x: number, y: number, w: number, h: number): void {
  const vw = window.innerWidth, vh = window.innerHeight;

  if (!selBox) {
    selBox = document.createElement("div");
    Object.assign(selBox.style, {
      position: "fixed", zIndex: "2147483641", boxSizing: "border-box",
      border: `1.5px solid ${T.accent}`,
      boxShadow: "0 0 0 1px rgba(255,255,255,0.85)",
      pointerEvents: "none",
    });
    document.body.appendChild(selBox);
  }
  Object.assign(selBox.style, { left: px(x), top: px(y), width: px(w), height: px(h) });

  const rects = [
    { left: 0, top: 0, width: vw, height: y },
    { left: 0, top: y, width: x, height: h },
    { left: x + w, top: y, width: Math.max(0, vw - x - w), height: h },
    { left: 0, top: y + h, width: vw, height: Math.max(0, vh - y - h) },
  ];
  while (shades.length < 4) {
    const s = document.createElement("div");
    Object.assign(s.style, {
      position: "fixed", zIndex: "2147483639", background: T.shade, pointerEvents: "none",
    });
    shades.push(s);
    document.body.appendChild(s);
  }
  rects.forEach((r, i) =>
    Object.assign(shades[i].style, {
      left: px(r.left), top: px(r.top), width: px(r.width), height: px(r.height),
    })
  );
}

function clearShades(): void {
  shades.forEach((s) => s.remove());
  shades = [];
}

function showSizeBadge(x: number, y: number, w: number, h: number): void {
  if (!sizeBadge) {
    sizeBadge = document.createElement("div");
    Object.assign(sizeBadge.style, {
      position: "fixed", zIndex: "2147483642", pointerEvents: "none",
      background: T.accent, color: "#FFFFFF",
      font: `600 11px/1 ${FONT_FAMILY}`,
      fontVariantNumeric: "tabular-nums",
      padding: "4px 7px", borderRadius: "8px", whiteSpace: "nowrap",
      boxShadow: T.shadow,
    });
    document.body.appendChild(sizeBadge);
  }
  sizeBadge.textContent = `${Math.round(w)} × ${Math.round(h)}`;
  sizeBadge.style.left = px(Math.max(2, x));
  // Sit above the selection, or tuck inside when it is flush with the top.
  sizeBadge.style.top = y > 26 ? px(y - 24) : px(y + 5);
}

// ─── Phase 2: mode options ────────────────────────────────────────────────────
function buildReadyUI(): void {
  crosshair?.remove(); crosshair = null;
  document.getElementById("gf-hint")?.remove();

  const r = currentRegion!;
  showSizeBadge(r.x, r.y, r.width, r.height);

  // A sibling of the selection box, never a child: selBox is pointer-events:none,
  // which would make every control inside it unclickable.
  const panel = makePanel({
    padding: "14px", display: "flex", flexDirection: "column",
    gap: "12px", minWidth: "268px", zIndex: "2147483643",
    pointerEvents: "auto", visibility: "hidden",
  });

  const head = document.createElement("div");
  Object.assign(head.style, { display: "flex", alignItems: "center", gap: "8px" });
  const mark = document.createElement("span");
  Object.assign(mark.style, {
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    width: "26px", height: "26px", borderRadius: "8px",
    background: T.accentBg, color: T.accent, flexShrink: "0",
  });
  mark.innerHTML = Icon.scroll(15);
  const heading = makeText("Scroll Capture", { size: "13px", weight: "700", color: T.text });
  head.append(mark, heading);

  const desc = makeText("Auto scrolls for you. Manual follows your own scrolling.", {
    size: "11px", color: T.textFaint,
  });

  // Speed only affects Auto, so it is grouped and labelled as such.
  const speedRow = document.createElement("div");
  Object.assign(speedRow.style, {
    display: "flex", alignItems: "center", gap: "6px",
    padding: "8px", borderRadius: T.radius,
    background: T.surfaceAlt, border: `1px solid ${T.border}`,
  });
  const speedLbl = makeText("Auto speed", { size: "11px", weight: "600", color: T.textMuted });
  speedLbl.style.marginRight = "auto";
  speedRow.appendChild(speedLbl);

  const segment = document.createElement("div");
  Object.assign(segment.style, {
    display: "flex", gap: "2px", padding: "2px",
    background: T.surfaceSunken, borderRadius: "10px",
  });
  const speeds: Array<{ label: string; value: "slow" | "medium" | "fast" }> = [
    { label: "Slow", value: "slow" },
    { label: "Med", value: "medium" },
    { label: "Fast", value: "fast" },
  ];
  const segButtons: HTMLButtonElement[] = [];
  for (const { label, value } of speeds) {
    const b = document.createElement("button");
    b.type = "button";
    b.textContent = label;
    Object.assign(b.style, {
      border: "none", cursor: "pointer", borderRadius: "7px",
      padding: "4px 10px", font: `600 11px/1 ${FONT_FAMILY}`,
      background: "transparent", color: T.textMuted, transition: "background .14s, color .14s",
    });
    b.addEventListener("click", (e) => {
      e.stopPropagation();
      selectedSpeed = value;
      paintSegment();
    });
    segButtons.push(b);
    segment.appendChild(b);
  }
  const paintSegment = () => {
    segButtons.forEach((b, i) => {
      const on = speeds[i].value === selectedSpeed;
      b.style.background = on ? T.surface : "transparent";
      b.style.color = on ? T.text : T.textMuted;
      b.style.boxShadow = on ? "0 1px 2px rgba(16,24,40,0.06)" : "none";
    });
  };
  paintSegment();
  speedRow.appendChild(segment);

  const actions = document.createElement("div");
  Object.assign(actions.style, { display: "flex", gap: "8px" });
  const autoB = makeButton({ label: "Auto", icon: Icon.play(13), tone: "primary", onClick: startAuto });
  const manB = makeButton({ label: "Manual", icon: Icon.mouse(13), tone: "neutral", onClick: startManual });
  autoB.style.flex = "1";
  manB.style.flex = "1";
  const cancelB = makeButton({ icon: Icon.x(14), tone: "ghost", onClick: cleanup, title: "Cancel" });
  actions.append(autoB, manB, cancelB);

  panel.append(head, desc, speedRow, actions, shortcutHints([["Esc", "Cancel"]]));
  document.body.appendChild(panel);
  optionsPanel = panel;

  // Anchor near the bottom of the selection, then pull inside the viewport so a
  // selection at the screen edge still shows the whole panel.
  const box = panel.getBoundingClientRect();
  const m = 12;
  panel.style.left = px(clamp(r.x + r.width / 2 - box.width / 2, m, window.innerWidth - box.width - m));
  panel.style.top = px(clamp(r.y + r.height - box.height - 16, m, window.innerHeight - box.height - m));
  panel.style.visibility = "visible";

  phase = "ready";
}

// ─── Auto ─────────────────────────────────────────────────────────────────────
function startAuto(): void {
  if (!currentRegion) return;
  captureMode = "auto";
  phase = "capturing";
  startKeepAlivePort();
  clearShades();
  sizeBadge?.remove(); sizeBadge = null;
  optionsPanel?.remove(); optionsPanel = null;

  if (selBox) selBox.style.border = `1.5px solid ${T.accentBorder}`;

  const panel = makePanel({
    padding: "12px 14px", display: "flex", flexDirection: "column",
    gap: "10px", minWidth: "196px", zIndex: "2147483647", pointerEvents: "auto",
  });

  const row = document.createElement("div");
  Object.assign(row.style, { display: "flex", alignItems: "center", gap: "8px" });
  statusEl = makeText("Auto-scrolling…", { size: "12px", weight: "600", color: T.text });
  frameCountEl = makeText("0", { size: "12px", weight: "600", color: T.textFaint });
  frameCountEl.style.marginLeft = "auto";
  frameCountEl.style.fontVariantNumeric = "tabular-nums";
  row.append(statusEl, frameCountEl);

  const track = document.createElement("div");
  Object.assign(track.style, {
    height: "5px", borderRadius: "3px", background: T.surfaceSunken, overflow: "hidden",
  });
  autoProgressEl = document.createElement("div");
  Object.assign(autoProgressEl.style, {
    height: "100%", width: "100%", background: T.accent, borderRadius: "3px",
    transform: "scaleX(0)", transformOrigin: "left",
    transition: "transform .35s ease",
  });
  track.appendChild(autoProgressEl);

  const stopB = makeButton({ label: "Stop", icon: Icon.stop(12), tone: "danger", onClick: cleanup, block: true });

  panel.append(row, track, stopB);
  placePanelClearOfRegion(panel, 210);
  document.body.appendChild(panel);
  capturePanel = panel;

  chrome.runtime.sendMessage({
    type: "SCROLLING_REGION_SELECTED",
    payload: { region: currentRegion, speed: selectedSpeed, tabId },
  });
}

function updateAutoProgress(current: number, total: number): void {
  if (autoProgressEl && total > 0) autoProgressEl.style.transform = `scaleX(${current / total})`;
  if (frameCountEl) frameCountEl.textContent = total > 0 ? `${current} / ${total}` : String(current);
}

// ─── Manual ───────────────────────────────────────────────────────────────────
function startManual(): void {
  if (!currentRegion) return;
  captureMode = "manual";
  phase = "capturing";
  startKeepAlivePort();

  clearShades();
  sizeBadge?.remove(); sizeBadge = null;
  optionsPanel?.remove(); optionsPanel = null;

  // The marquee would otherwise be baked into every captured frame.
  if (selBox) {
    selBox.style.border = "none";
    selBox.style.boxShadow = "none";
  }

  buildCapturePanel();
  const excludeRight = placePanelClearOfRegion(capturePanel!, 300);
  const captureRegion =
    excludeRight > 0
      ? { ...currentRegion, width: Math.max(100, currentRegion.width - excludeRight) }
      : currentRegion;

  chrome.runtime.sendMessage({ type: "SCROLL_START", payload: { region: captureRegion } }, () => {
    pollTimer = window.setInterval(() => {
      chrome.runtime.sendMessage({ type: "SCROLL_POLL" });
    }, 200);
  });
}

const PANEL_W = 132;
const PANEL_MARGIN = 14;

/**
 * Keep the panel out of the capture region. When the selection leaves no room
 * on any side, the panel sits inside at the bottom-right and the returned width
 * is trimmed from the region so the panel is never photographed.
 */
function placePanelClearOfRegion(panel: HTMLElement, panelH: number): number {
  const r = currentRegion!;
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const need = PANEL_W + PANEL_MARGIN * 2;

  panel.style.top = "auto"; panel.style.bottom = "auto";
  panel.style.left = "auto"; panel.style.right = "auto";

  const topFor = (h: number) => px(clamp(r.y, PANEL_MARGIN, Math.max(PANEL_MARGIN, vh - h - PANEL_MARGIN)));

  if (vw - (r.x + r.width) >= need) {
    panel.style.left = px(r.x + r.width + PANEL_MARGIN);
    panel.style.top = topFor(panelH);
    return 0;
  }
  if (r.x >= need) {
    panel.style.right = px(vw - r.x + PANEL_MARGIN);
    panel.style.top = topFor(panelH);
    return 0;
  }
  if (vh - (r.y + r.height) >= panelH) {
    panel.style.right = px(PANEL_MARGIN);
    panel.style.top = px(r.y + r.height + PANEL_MARGIN);
    return 0;
  }
  if (r.y >= panelH) {
    panel.style.right = px(PANEL_MARGIN);
    panel.style.bottom = px(vh - r.y + PANEL_MARGIN);
    return 0;
  }

  panel.style.right = px(PANEL_MARGIN);
  panel.style.bottom = px(PANEL_MARGIN);
  return PANEL_W + PANEL_MARGIN * 2;
}

function buildCapturePanel(): void {
  const panel = makePanel({
    width: `${PANEL_W}px`, padding: "12px", display: "flex",
    flexDirection: "column", gap: "10px",
    zIndex: "2147483647", pointerEvents: "auto",
    // Safety net for the rare case a small browser window still can't fit
    // everything below: the whole panel scrolls internally instead of
    // clipping Done/Cancel off-screen with no way to reach them.
    maxHeight: `calc(100vh - ${PANEL_MARGIN * 2}px)`,
    overflowY: "auto",
  });

  const head = document.createElement("div");
  Object.assign(head.style, { display: "flex", alignItems: "center", gap: "6px" });
  const dot = document.createElement("span");
  Object.assign(dot.style, {
    width: "7px", height: "7px", borderRadius: "50%",
    background: T.danger, flexShrink: "0", animation: "gf-pulse 1.2s infinite",
  });
  const recLbl = makeText("Recording", { size: "10px", weight: "700", color: T.danger });
  recLbl.style.letterSpacing = "0.02em";
  head.append(dot, recLbl);

  const stats = document.createElement("div");
  Object.assign(stats.style, { display: "flex", flexDirection: "column", gap: "1px" });
  frameCountEl = makeText("Starting…", { size: "13px", weight: "700", color: T.text });
  frameCountEl.style.fontVariantNumeric = "tabular-nums";
  heightEl = makeText("", { size: "10px", color: T.textFaint });
  heightEl.style.fontVariantNumeric = "tabular-nums";
  statusEl = makeText("Scroll to capture", { size: "10px", color: T.textFaint });
  stats.append(frameCountEl, heightEl, statusEl);

  speedWarnEl = document.createElement("div");
  Object.assign(speedWarnEl.style, {
    display: "none", alignItems: "flex-start", gap: "5px",
    padding: "6px 7px", borderRadius: "8px",
    background: T.warnBg, border: `1px solid ${T.warnBorder}`,
    color: T.warn, font: `600 10px/1.35 ${FONT_FAMILY}`,
  });
  speedWarnEl.innerHTML = `${Icon.warning(12)}<span>Scroll more slowly</span>`;

  // The thumbnail is a scaled preview of the *entire* capture so far, so its
  // height grows with every frame — on a long scroll it was pushing Done/
  // Cancel further down the panel until they fell off-screen entirely. Capped
  // here and top-aligned so it reads as "a peek at what's captured" rather
  // than a full preview, and Done/Cancel stay put right below it.
  const shot = document.createElement("div");
  Object.assign(shot.style, {
    borderRadius: "8px", overflow: "hidden", border: `1px solid ${T.border}`,
    background: T.surfaceSunken, display: "none",
    maxHeight: "150px", flexShrink: "0",
  });
  previewImg = document.createElement("img");
  Object.assign(previewImg.style, { width: "100%", display: "block" });
  shot.appendChild(previewImg);
  (previewImg as any).__wrap = shot;

  const footer = document.createElement("div");
  Object.assign(footer.style, { display: "flex", flexDirection: "column", gap: "5px", flexShrink: "0" });
  footer.append(
    makeButton({ label: "Done", icon: Icon.check(13), tone: "success", onClick: finishManual, block: true }),
    makeButton({ label: "Cancel", tone: "ghost", onClick: cancelManual, block: true, small: true })
  );

  panel.append(head, stats, shortcutHints([["↵", "Done"], ["Esc", "Cancel"]]), speedWarnEl, shot, footer);
  document.body.appendChild(panel);
  capturePanel = panel;
}

/** A row of small kbd-style chips, e.g. "↵ Done  Esc Cancel", shown inside the
 *  capture panel itself so the shortcut is visible right where it's used. */
function shortcutHints(pairs: Array<[string, string]>): HTMLDivElement {
  const row = document.createElement("div");
  Object.assign(row.style, { display: "flex", alignItems: "center", gap: "10px" });
  for (const [key, label] of pairs) {
    const item = document.createElement("span");
    Object.assign(item.style, { display: "inline-flex", alignItems: "center", gap: "4px" });
    const kbd = document.createElement("span");
    Object.assign(kbd.style, {
      font: `700 9px/1 ${FONT_FAMILY}`, color: T.textMuted,
      background: T.surfaceSunken, border: `1px solid ${T.border}`,
      padding: "2px 4px", borderRadius: "5px", minWidth: "13px", textAlign: "center",
    });
    kbd.textContent = key;
    item.append(kbd, makeText(label, { size: "9.5px", color: T.textFaint }));
    row.appendChild(item);
  }
  return row;
}

function updateManualProgress(payload: {
  frameCount: number;
  totalHeight: number;
  thumbDataUrl: string | null;
  tooFast?: boolean;
  atLimit?: boolean;
}): void {
  if (!payload) return;
  const { frameCount, totalHeight, thumbDataUrl, tooFast, atLimit } = payload;

  if (frameCountEl) frameCountEl.textContent = `${frameCount} frame${frameCount === 1 ? "" : "s"}`;
  if (heightEl) heightEl.textContent = `${Math.round(totalHeight / window.devicePixelRatio)}px tall`;
  if (statusEl) {
    statusEl.textContent = atLimit ? "Maximum height reached" : tooFast ? "" : "Scroll to capture";
    statusEl.style.color = atLimit ? T.warn : T.textFaint;
  }
  if (speedWarnEl) speedWarnEl.style.display = tooFast && !atLimit ? "flex" : "none";
  if (atLimit) stopPoll();

  if (thumbDataUrl && previewImg) {
    previewImg.src = thumbDataUrl;
    const wrap = (previewImg as any).__wrap as HTMLElement | undefined;
    if (wrap) wrap.style.display = "block";
  }
}

function finishManual(): void {
  stopPoll();
  if (statusEl) statusEl.textContent = "Stitching…";
  chrome.runtime.sendMessage({ type: "SCROLL_FINISH" });
  setTimeout(cleanup, 600);
}

function cancelManual(): void {
  stopPoll();
  chrome.runtime.sendMessage({ type: "SCROLL_STOP" });
  cleanup();
}

function stopPoll(): void {
  if (pollTimer !== null) { clearInterval(pollTimer); pollTimer = null; }
}

// ─── Drag ─────────────────────────────────────────────────────────────────────
function onDown(e: MouseEvent): void {
  if (phase !== "selecting") return;
  isDragging = true;
  startX = e.clientX;
  startY = e.clientY;
  document.getElementById("gf-hint")?.remove();
}

function onMove(e: MouseEvent): void {
  if (!isDragging) return;
  const x = Math.min(startX, e.clientX);
  const y = Math.min(startY, e.clientY);
  const w = Math.abs(e.clientX - startX);
  const h = Math.abs(e.clientY - startY);
  if (w > 4 || h > 4) {
    drawSelection(x, y, w, h);
    showSizeBadge(x, y, w, h);
  }
}

function onUp(e: MouseEvent): void {
  if (!isDragging) return;
  isDragging = false;
  const x = Math.min(startX, e.clientX);
  const y = Math.min(startY, e.clientY);
  const w = Math.abs(e.clientX - startX);
  const h = Math.abs(e.clientY - startY);
  if (w < 30 || h < 30) { cleanup(); return; }
  currentRegion = { x, y, width: w, height: h };
  buildReadyUI();
}

function onKey(e: KeyboardEvent): void {
  if (e.key === "Enter" && captureMode === "manual" && phase === "capturing") {
    e.stopPropagation();
    finishManual();
    return;
  }
  if (e.key !== "Escape") return;
  e.stopPropagation();
  captureMode === "manual" ? cancelManual() : cleanup();
}

// ─── Cleanup ──────────────────────────────────────────────────────────────────
function cleanup(): void {
  stopPoll();
  stopKeepAlivePort();
  crosshair?.remove();
  selBox?.remove();
  clearShades();
  sizeBadge?.remove();
  optionsPanel?.remove();
  capturePanel?.remove();
  document.getElementById("gf-hint")?.remove();
  removeOverlayFont();
  document.removeEventListener("keydown", onKey, true);

  crosshair = null; selBox = null; sizeBadge = null;
  optionsPanel = null; capturePanel = null; previewImg = null;
  frameCountEl = null; heightEl = null; statusEl = null;
  autoProgressEl = null; speedWarnEl = null;
  currentRegion = null; tabId = null;
  phase = "selecting"; captureMode = null; isDragging = false;
}

export function stopScrollingAreaUI(): void { cleanup(); }

// A capture that fails after the selection UI has already torn itself down
// (network/permissions/canvas errors mid-capture) previously vanished with
// no feedback at all — this gives the user something to see.
function showInlineError(msg: string): void {
  const el = document.createElement("div");
  el.textContent = msg;
  el.style.cssText = `
    position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%);
    background: #B42318; color: #fff; padding: 10px 18px;
    font: 600 12.5px ${FONT_FAMILY}; z-index: 2147483647;
    box-shadow: 0 8px 24px rgba(0,0,0,0.25); pointer-events: none;
  `;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 4000);
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function px(n: number): string { return `${n}px`; }
function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}
