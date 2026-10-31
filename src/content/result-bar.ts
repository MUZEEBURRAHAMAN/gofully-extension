import { T, FONT_FAMILY, applyOverlayTheme, alpha } from "../ui/overlay-kit";
import { icon } from "../ui/ds/icons";
import { isSafeImageDataUrl } from "../utils/safe-image";
import { codeKind, safeLink, CODE_LABEL, type DecodedCode } from "../utils/code-links";
import { claimPendingRateNudge, markRatedYes, markDismissed } from "../utils/rate-nudge";

/** Kept in step with src/ui/overlay-kit.ts — this file styles a shadow root. */
const FONT_STACK = FONT_FAMILY;

/** GoFully DS v2 roles as CSS variables on a shadow host (see src/ui/overlay-kit.ts). */
function setOverlayVars(el: HTMLElement): void {
  const v: Record<string, string> = {
    "--gf-bg-surface": T.surface, "--gf-bg-sunken": T.surfaceSunken, "--gf-bg-hover": T.surfaceAlt,
    "--gf-border": T.border, "--gf-border-strong": T.borderStrong,
    "--gf-text": T.text, "--gf-text-2": T.textMuted, "--gf-text-3": T.textFaint,
    "--gf-brand": T.accent, "--gf-brand-hover": T.accentHover, "--gf-on-brand": T.onAccent,
    "--gf-success": T.success, "--gf-warning": T.warn, "--gf-warning-bg": T.warnBg, "--gf-error": T.danger,
    "--gf-focus": T.focus, "--gf-shadow-lg": T.shadowLg,
  };
  for (const [k, val] of Object.entries(v)) el.style.setProperty(k, val);
}

function overlayFontFace(): string {
  const src = chrome.runtime.getURL("assets/inter-latin-wght-normal.woff2");
  return `@font-face { font-family: 'GoFully Inter'; src: url('${src}') format('woff2'); font-weight: 100 900; font-display: swap; }`;
}

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

// ─── Capture stack ───────────────────────────────────────────────────────────
// Quick captures (visible area, selected area, element, delayed) land here, top right, newest on top.
// The newest is open with every action; earlier ones fold into rows you can reopen, copy or drag out.
// After a few idle seconds the stack tucks into a small tab at the edge so it stops covering the page.
// Each capture keeps its own id, so a button on an older card acts on that capture, not the newest.
// GoFully hides this whole stack before every photo (see utils/progress-overlay.ts).

interface ResultCardPayload {
  captureId?: string;
  width: number;
  height: number;
  mode: string;
  method: string;
  url: string;
  title: string;
  timestamp: number;
  dataUrl: string;
}

interface StackItem {
  key: string;
  payload: ResultCardPayload;
  blobUrl: string | null;
  codes: DecodedCode[];
}

const STACK_LIMIT = 5;
const STACK_IDLE_MS = 12000;
const MODE_NAME: Record<string, string> = {
  "visible-area": "Visible area",
  "selected-area": "Selected area",
  "full-page": "Full page",
  "scrolling-area": "Scrolling area",
};

let stackHost: HTMLDivElement | null = null;
let stackRoot: HTMLDivElement | null = null;
let stackItems: StackItem[] = [];
let openKey: string | null = null;
let stackTucked = false;
let stackIdleTimer: ReturnType<typeof setTimeout> | undefined;
let stackPointerInside = false;

function stackStyles(): string {
  return `
    ${overlayFontFace()}
    :host { all: initial; }
    * { box-sizing: border-box; }
    .stack {
      position: fixed; top: 16px; right: 16px; width: 328px; max-height: calc(100vh - 32px);
      display: flex; flex-direction: column; gap: 8px; overflow-y: auto; overscroll-behavior: contain;
      pointer-events: auto; font: 400 14px/20px ${FONT_STACK}; color: var(--gf-text);
      -webkit-font-smoothing: antialiased; scrollbar-width: none; /* still scrolls on short screens, without a bar beside the cards */
    }
    .stack::-webkit-scrollbar { display: none; }
    .stack[hidden], .peek[hidden] { display: none; }
    /* Figma: Overlay / Result card (light), Result card · Dark UI */
    .res-card {
      display: flex; flex-direction: column; gap: 10px; padding: 12px; flex: none;
      background: var(--gf-bg-surface); border: 1px solid var(--gf-border); border-radius: 12px; box-shadow: var(--gf-shadow-lg);
      animation: gf-in .2s cubic-bezier(0.16,1,0.3,1);
    }
    @keyframes gf-in { from { opacity: 0; transform: translateY(-8px) scale(.98); } }
    @media (prefers-reduced-motion: reduce) { .res-card, .row { animation: none; } }
    .res-status { display: flex; align-items: center; gap: 8px; }
    .res-check { color: var(--gf-success); flex-shrink: 0; display: flex; }
    .res-title { font-weight: 500; flex: 1; min-width: 0; }
    .icon-btn {
      border: none; background: none; cursor: pointer; color: var(--gf-text-3);
      width: 28px; height: 28px; flex-shrink: 0; padding: 0; border-radius: 8px;
      display: flex; align-items: center; justify-content: center;
    }
    .icon-btn:hover { background: var(--gf-bg-hover); color: var(--gf-text); }
    .res-preview {
      position: relative; width: 100%; height: 160px; overflow: hidden;
      background: var(--gf-bg-sunken); border: 1px solid var(--gf-border); border-radius: 8px;
      display: flex; align-items: flex-start; justify-content: center; cursor: grab;
    }
    .res-preview:active { cursor: grabbing; }
    .res-preview img { width: 100%; height: 100%; display: block; object-fit: cover; object-position: top center; }
    .res-preview-fade {
      position: absolute; bottom: 0; left: 0; right: 0; height: 48px;
      background: linear-gradient(to bottom, transparent, var(--gf-bg-sunken));
      display: flex; align-items: flex-end; justify-content: center; padding-bottom: 8px; pointer-events: none;
    }
    .res-preview-pill {
      font: 500 11px/16px ${FONT_STACK}; color: var(--gf-text-2);
      background: var(--gf-bg-surface); border: 1px solid var(--gf-border); border-radius: 999px; padding: 2px 8px;
    }
    .res-dim { font-size: 12px; line-height: 16px; color: var(--gf-text-3); font-variant-numeric: tabular-nums; }
    .res-actions { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; }
    .res-btn {
      min-width: 0; height: 32px; display: flex; align-items: center; justify-content: center; gap: 4px;
      border: 1px solid var(--gf-border-strong); border-radius: 999px; background: var(--gf-bg-surface); cursor: pointer;
      font: 500 12px/1 ${FONT_STACK}; color: var(--gf-text); white-space: nowrap;
      transition: background .15s, border-color .15s, opacity .15s;
    }
    .res-btn:hover { background: var(--gf-bg-hover); }
    .res-btn:focus-visible, .icon-btn:focus-visible, .row:focus-visible, .peek:focus-visible, .code-btn:focus-visible { outline: none; box-shadow: 0 0 0 3px var(--gf-focus); }
    .res-btn.prim { grid-column: 1 / -1; height: 36px; font-size: 14px; background: var(--gf-brand); border-color: var(--gf-brand); color: var(--gf-on-brand); }
    .res-btn.prim:hover { background: var(--gf-brand-hover); }
    .codes { display: flex; flex-direction: column; gap: 6px; padding: 8px; border-radius: 8px; background: var(--gf-bg-sunken); border: 1px solid var(--gf-border); }
    .code { display: flex; align-items: center; gap: 8px; min-width: 0; }
    .code-text { flex: 1; min-width: 0; display: flex; flex-direction: column; }
    .code-kind { font: 500 11px/16px ${FONT_STACK}; color: var(--gf-text-3); }
    .code-value { font: 500 12px/16px ${FONT_STACK}; color: var(--gf-text); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .code-btn { height: 26px; padding: 0 10px; border: 1px solid var(--gf-border-strong); border-radius: 999px; background: var(--gf-bg-surface); color: var(--gf-text); font: 500 12px/1 ${FONT_STACK}; cursor: pointer; flex: none; }
    .code-btn:hover { background: var(--gf-bg-hover); }
    .res-footer { display: flex; align-items: center; justify-content: space-between; font-size: 11px; line-height: 16px; color: var(--gf-text-3); padding-top: 2px; }
    .res-ftr-left { display: flex; align-items: center; gap: 6px; }
    .res-ftr-dot { width: 6px; height: 6px; background: var(--gf-success); border-radius: 50%; }
    .row {
      display: flex; align-items: center; gap: 10px; padding: 8px; flex: none; cursor: pointer;
      background: var(--gf-bg-surface); border: 1px solid var(--gf-border); border-radius: 12px; box-shadow: var(--gf-shadow-lg);
      animation: gf-in .2s cubic-bezier(0.16,1,0.3,1); text-align: left; font: inherit; color: inherit; width: 100%;
    }
    .row:hover { border-color: var(--gf-border-strong); }
    .row img { width: 56px; height: 40px; flex: none; object-fit: cover; object-position: top; border-radius: 6px; border: 1px solid var(--gf-border); background: var(--gf-bg-sunken); }
    .row-text { flex: 1; min-width: 0; display: flex; flex-direction: column; }
    .row-name { font-weight: 500; font-size: 13px; line-height: 18px; display: flex; gap: 6px; align-items: center; }
    .row-meta { font-size: 12px; line-height: 16px; color: var(--gf-text-3); font-variant-numeric: tabular-nums; }
    .qr-tag { font: 600 10px/14px ${FONT_STACK}; padding: 0 6px; border-radius: 999px; background: var(--gf-bg-sunken); color: var(--gf-text-2); border: 1px solid var(--gf-border); }
    .bar { display: flex; justify-content: flex-end; gap: 6px; flex: none; }
    .bar .res-btn { height: 28px; padding: 0 12px; box-shadow: var(--gf-shadow-lg); }
    .peek {
      position: fixed; top: 16px; right: 0; display: flex; align-items: center; gap: 8px; padding: 6px 10px 6px 6px;
      pointer-events: auto; cursor: pointer; border: 1px solid var(--gf-border); border-right: none; border-radius: 12px 0 0 12px;
      background: var(--gf-bg-surface); color: var(--gf-text); box-shadow: var(--gf-shadow-lg); font: 500 12px/16px ${FONT_STACK};
    }
    .peek img { width: 36px; height: 26px; object-fit: cover; object-position: top; border-radius: 4px; border: 1px solid var(--gf-border); }
  `;
}

function ensureStackHost(): void {
  if (stackHost && stackHost.isConnected) return;
  stackHost = document.createElement("div");
  stackHost.id = "gofully-result-card-host";
  stackHost.style.cssText = "all:initial; position:fixed; inset:0; z-index:2147483647; pointer-events:none;";
  const shadow = stackHost.attachShadow({ mode: "closed" });
  setOverlayVars(stackHost);
  void applyOverlayTheme().then(() => { if (stackHost) setOverlayVars(stackHost); });
  const style = document.createElement("style");
  style.textContent = stackStyles();
  stackRoot = document.createElement("div");
  shadow.append(style, stackRoot);
  stackRoot.addEventListener("pointerenter", () => { stackPointerInside = true; clearTimeout(stackIdleTimer); }, true);
  stackRoot.addEventListener("pointerleave", () => { stackPointerInside = false; armStackIdle(); }, true);
  stackRoot.addEventListener("focusin", () => clearTimeout(stackIdleTimer));
  (document.body || document.documentElement).appendChild(stackHost);
}

function armStackIdle(): void {
  clearTimeout(stackIdleTimer);
  stackIdleTimer = setTimeout(() => {
    if (stackPointerInside || !stackItems.length) return;
    stackTucked = true;
    renderStack();
  }, STACK_IDLE_MS);
}

function removeStackItem(key: string): void {
  const i = stackItems.findIndex((it) => it.key === key);
  if (i < 0) return;
  const [gone] = stackItems.splice(i, 1);
  if (gone.blobUrl) URL.revokeObjectURL(gone.blobUrl);
  if (openKey === key) openKey = stackItems[0]?.key ?? null;
  renderStack();
}

function clearStack(): void {
  for (const it of stackItems) if (it.blobUrl) URL.revokeObjectURL(it.blobUrl);
  stackItems = [];
  openKey = null;
  clearTimeout(stackIdleTimer);
  stackHost?.remove();
  stackHost = stackRoot = null;
}

function timeAgo(ts: number): string {
  const s = Math.max(0, Math.round((Date.now() - ts) / 1000));
  if (s < 45) return "just now";
  const m = Math.round(s / 60);
  return m < 60 ? `${m} min ago` : `${Math.round(m / 60)} h ago`;
}

function fileName(p: ResultCardPayload): string {
  const host = (() => { try { return new URL(p.url).hostname.replace(/^www\./, ""); } catch { return "capture"; } })();
  return `gofully-${host.replace(/[^a-z0-9.-]/gi, "")}-${p.timestamp}.png`;
}

/** Dragging a preview out hands over the PNG as a file: drop it on the desktop, in a folder, or in an app that accepts files. */
function makeDraggable(img: HTMLImageElement, item: StackItem): void {
  img.draggable = true;
  img.addEventListener("dragstart", (e) => {
    if (!e.dataTransfer) return;
    if (item.blobUrl) e.dataTransfer.setData("DownloadURL", `image/png:${fileName(item.payload)}:${item.blobUrl}`);
    e.dataTransfer.effectAllowed = "copy";
  });
}

function flash(btn: HTMLElement, text: string): void {
  const label = btn.querySelector("span");
  if (!label) return;
  const orig = label.textContent ?? "";
  label.textContent = text;
  btn.style.opacity = "0.75";
  setTimeout(() => { label.textContent = orig; btn.style.opacity = ""; }, 1800);
}

function el<K extends keyof HTMLElementTagNameMap>(tag: K, cls?: string, text?: string): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (text !== undefined) node.textContent = text;
  return node;
}

function actionButton(id: string, label: string, iconName?: Parameters<typeof icon>[0], prim = false): HTMLButtonElement {
  const b = el("button", prim ? "res-btn prim" : "res-btn");
  b.type = "button";
  b.dataset.act = id;
  if (iconName) b.insertAdjacentHTML("beforeend", icon(iconName, prim ? 16 : 14));
  b.append(el("span", undefined, label));
  return b;
}

function codesBox(item: StackItem): HTMLElement | null {
  if (!item.codes.length) return null;
  const box = el("div", "codes");
  box.setAttribute("aria-label", "Codes found in this capture");
  for (const c of item.codes.slice(0, 3)) {
    const row = el("div", "code");
    const text = el("div", "code-text");
    const kind = codeKind(c.value);
    text.append(el("span", "code-kind", `${c.format === "qr_code" ? "QR code" : "Barcode"} · ${CODE_LABEL[kind]}`), el("span", "code-value", c.value));
    (text.lastChild as HTMLElement).title = c.value;
    row.append(text);
    const link = safeLink(c.value);
    if (link) {
      const open = el("button", "code-btn", "Open");
      open.type = "button";
      open.addEventListener("click", () => window.open(link, "_blank", "noopener,noreferrer"));
      row.append(open);
    }
    const copy = el("button", "code-btn", "Copy");
    copy.type = "button";
    copy.addEventListener("click", async () => {
      try { await navigator.clipboard.writeText(c.value); copy.textContent = "Copied"; } catch { copy.textContent = "Failed"; }
      setTimeout(() => { copy.textContent = "Copy"; }, 1600);
    });
    row.append(copy);
    box.append(row);
  }
  return box;
}

function openCard(item: StackItem): HTMLElement {
  const p = item.payload;
  const w = Math.round(p.width), h = Math.round(p.height);
  const card = el("div", "res-card");
  card.setAttribute("role", "group");
  card.setAttribute("aria-label", "Screenshot captured");

  const status = el("div", "res-status");
  const check = el("div", "res-check");
  check.innerHTML = icon("success", 18);
  const close = el("button", "icon-btn");
  close.type = "button";
  close.setAttribute("aria-label", "Dismiss this capture");
  close.innerHTML = icon("close", 16);
  close.addEventListener("click", () => removeStackItem(item.key));
  status.append(check, el("span", "res-title", "Screenshot captured"), close);

  const preview = el("div", "res-preview");
  preview.title = "Drag the image onto your desktop or into a folder";
  const img = el("img");
  img.alt = "Capture preview";
  img.src = p.dataUrl;
  makeDraggable(img, item);
  preview.append(img);
  if (p.mode === "full-page" || p.mode === "scrolling-area" || h > 800) {
    const fade = el("div", "res-preview-fade");
    fade.append(el("span", "res-preview-pill", "Scroll the full image in the editor"));
    preview.append(fade);
  }

  const dim = el("span", "res-dim", `${w} × ${h} px · ${MODE_NAME[p.mode] ?? "Capture"}`);
  const actions = el("div", "res-actions");
  actions.append(
    actionButton("copy", "Copy", "copy", true),
    actionButton("png", "PNG"), actionButton("jpg", "JPG"), actionButton("webp", "WebP"), actionButton("pdf", "PDF"),
    actionButton("edit", "Edit", "edit"), actionButton("pin", "Pin", "pin"), actionButton("guide", "Guide", "guide"),
  );
  actions.addEventListener("click", (e) => {
    const b = (e.target as HTMLElement).closest("button") as HTMLButtonElement | null;
    if (b?.dataset.act) void runCardAction(b.dataset.act, b, item);
  });

  const footer = el("div", "res-footer");
  const left = el("div", "res-ftr-left");
  left.append(el("div", "res-ftr-dot"), el("span", undefined, "Runs on your device"));
  footer.append(left, el("span", undefined, `v${chrome.runtime.getManifest().version}`));

  card.append(status, preview, dim);
  const codes = codesBox(item);
  if (codes) card.append(codes);
  card.append(actions, footer);
  return card;
}

function foldedRow(item: StackItem): HTMLElement {
  const p = item.payload;
  const row = el("button", "row");
  row.type = "button";
  row.setAttribute("aria-label", `Open the ${MODE_NAME[p.mode] ?? "capture"} capture from ${timeAgo(p.timestamp)}`);
  const img = el("img");
  img.alt = "";
  img.src = p.dataUrl;
  makeDraggable(img, item);
  const text = el("span", "row-text");
  const name = el("span", "row-name", MODE_NAME[p.mode] ?? "Capture");
  if (item.codes.length) name.append(el("span", "qr-tag", item.codes[0].format === "qr_code" ? "QR" : "Code"));
  text.append(name, el("span", "row-meta", `${Math.round(p.width)} × ${Math.round(p.height)} · ${timeAgo(p.timestamp)}`));
  const copy = el("span", "icon-btn");
  copy.setAttribute("role", "button");
  copy.setAttribute("aria-label", "Copy this capture");
  copy.tabIndex = 0;
  copy.innerHTML = icon("copy", 16);
  const close = el("span", "icon-btn");
  close.setAttribute("role", "button");
  close.setAttribute("aria-label", "Dismiss this capture");
  close.tabIndex = 0;
  close.innerHTML = icon("close", 16);
  row.append(img, text, copy, close);
  row.addEventListener("click", async (e) => {
    const t = e.target as HTMLElement;
    if (close.contains(t)) { e.stopPropagation(); removeStackItem(item.key); return; }
    if (copy.contains(t)) {
      e.stopPropagation();
      try { await copyImageFromDataUrl(p.dataUrl); copy.innerHTML = icon("check", 16); } catch { /* clipboard blocked */ }
      setTimeout(() => { copy.innerHTML = icon("copy", 16); }, 1500);
      return;
    }
    openKey = item.key;
    renderStack();
  });
  return row;
}

async function runCardAction(act: string, btn: HTMLButtonElement, item: StackItem): Promise<void> {
  const captureId = item.payload.captureId;
  // The card sends its own image with each action: the background page may have been stopped since the capture.
  const snapshot = item.payload;
  if (act === "copy") {
    try {
      const blob = await (await fetch(item.payload.dataUrl)).blob();
      const png = blob.type === "image/png" ? blob : await convertToPng(blob);
      await navigator.clipboard.write([new ClipboardItem({ "image/png": await upscaleToUHD(png) })]);
      flash(btn, "Copied!");
    } catch {
      flash(btn, "Failed");
    }
    return;
  }
  if (act === "png" || act === "jpg" || act === "webp" || act === "pdf") {
    if (act === "pdf") btn.querySelector("span")!.textContent = "Making PDF…";
    const resp = await chrome.runtime.sendMessage({ type: "EXPORT_CAPTURE", payload: { format: act, captureId, snapshot } }).catch(() => null);
    if (act === "pdf") btn.querySelector("span")!.textContent = "PDF";
    flash(btn, resp?.success ? "Saved!" : "Failed");
    return;
  }
  if (act === "guide") {
    const resp = await chrome.runtime.sendMessage({ type: "GUIDE_ADD_LAST_CAPTURE", payload: { captureId, snapshot } }).catch(() => null);
    flash(btn, resp?.ok ? `Step ${resp.count}` : "Failed");
    return;
  }
  if (act === "pin") {
    const resp = await chrome.runtime.sendMessage({ type: "PIN_LAST_CAPTURE", payload: { captureId, snapshot } }).catch(() => null);
    flash(btn, resp?.ok ? "Pinned" : "Failed");
    return;
  }
  if (act === "edit") {
    chrome.runtime.sendMessage({ type: "OPEN_EDITOR", payload: { captureId, snapshot } }).then((resp) => {
      if (resp?.opened === false) flash(btn, "Take it again");
      else removeStackItem(item.key);
    }).catch(() => flash(btn, "Failed"));
  }
}

function renderStack(): void {
  if (!stackItems.length) { clearStack(); return; }
  ensureStackHost();
  const root = stackRoot!;
  root.replaceChildren();

  if (stackTucked) {
    const peek = el("button", "peek");
    peek.type = "button";
    peek.setAttribute("aria-label", `Show ${stackItems.length} recent ${stackItems.length === 1 ? "capture" : "captures"}`);
    const img = el("img");
    img.alt = "";
    img.src = stackItems[0].payload.dataUrl;
    peek.append(img, el("span", undefined, stackItems.length === 1 ? "1 capture" : `${stackItems.length} captures`));
    peek.addEventListener("click", () => { stackTucked = false; renderStack(); armStackIdle(); });
    root.append(peek);
    return;
  }

  const stack = el("div", "stack");
  stack.setAttribute("role", "region");
  stack.setAttribute("aria-label", "Recent captures");
  for (const item of stackItems) stack.append(item.key === openKey ? openCard(item) : foldedRow(item));
  const bar = el("div", "bar");
  const hide = el("button", "res-btn", "Hide");
  hide.type = "button";
  hide.addEventListener("click", () => { stackTucked = true; renderStack(); });
  bar.append(hide);
  if (stackItems.length > 1) {
    const clear = el("button", "res-btn", "Clear all");
    clear.type = "button";
    clear.addEventListener("click", clearStack);
    bar.append(clear);
  }
  stack.append(bar);
  root.append(stack);
}

function showResultCard(payload: ResultCardPayload): void {
  playShutterSound();
  const item: StackItem = { key: payload.captureId || `k${Date.now()}`, payload, blobUrl: null, codes: [] };
  stackItems = [item, ...stackItems.filter((it) => it.key !== item.key)];
  for (const old of stackItems.splice(STACK_LIMIT)) if (old.blobUrl) URL.revokeObjectURL(old.blobUrl);
  openKey = item.key;
  stackTucked = false;
  renderStack();
  armStackIdle();

  // A file to drag out, made once per capture.
  fetch(payload.dataUrl).then((r) => r.blob()).then((b) => {
    if (stackItems.includes(item)) item.blobUrl = URL.createObjectURL(b);
  }).catch(() => {});

  // QR codes and barcodes are read on the device by the background page, from our own copy of the capture.
  if (payload.captureId) {
    chrome.runtime.sendMessage({ type: "SCAN_CODES", payload: { captureId: payload.captureId } }).then((resp) => {
      const codes = (Array.isArray(resp?.codes) ? resp.codes : [])
        .filter((c: unknown): c is DecodedCode => !!c && typeof (c as DecodedCode).value === "string" && typeof (c as DecodedCode).format === "string")
        .map((c: DecodedCode) => ({ format: c.format.slice(0, 40), value: c.value.slice(0, 4000) }));
      if (codes.length && stackItems.includes(item)) {
        item.codes = codes;
        renderStack();
      }
    }).catch(() => {});
  }
}

// ─── Delay countdown ─────────────────────────────────────────────────────────
// The popup has closed, so this pill is the only sign a capture is on its way. It ignores the
// pointer so the person can open the menu or hover the tooltip they want in the shot. Esc cancels.
let countdownEl: HTMLDivElement | null = null;
let countdownTick: ReturnType<typeof setInterval> | undefined;

function hideCountdown(): void {
  clearInterval(countdownTick);
  window.removeEventListener("keydown", onCountdownKey, true);
  countdownEl?.remove();
  countdownEl = null;
}

function onCountdownKey(e: KeyboardEvent): void {
  if (e.key !== "Escape") return;
  e.preventDefault();
  e.stopPropagation();
  hideCountdown();
  chrome.runtime.sendMessage({ type: "CANCEL_DELAYED_CAPTURE" }).catch(() => {});
}

function showCountdown(seconds: number): void {
  hideCountdown();
  let left = Math.max(1, Math.min(10, Math.round(seconds)));
  const host = document.createElement("div");
  host.id = "gofully-countdown";
  host.style.cssText = "all:initial; position:fixed; top:16px; left:50%; transform:translateX(-50%); z-index:2147483647; pointer-events:none;";
  host.setAttribute("role", "status");
  host.setAttribute("aria-live", "polite");
  const shadow = host.attachShadow({ mode: "closed" });
  setOverlayVars(host);
  const style = document.createElement("style");
  style.textContent = `
    ${overlayFontFace()}
    .pill { display:flex; align-items:center; gap:10px; padding:6px 14px 6px 6px; border-radius:999px; background:${T.text}; color:${T.surface};
      font:500 13px/20px ${FONT_STACK}; box-shadow:${T.shadowLg}; white-space:nowrap; -webkit-font-smoothing:antialiased; }
    .num { width:28px; height:28px; border-radius:50%; display:grid; place-items:center; background:${T.focus}; color:${T.accent === T.focus ? T.surface : T.accent};
      font:600 14px/1 ${FONT_STACK}; font-variant-numeric:tabular-nums; }
    .soft { color:${alpha(T.surface, 0.72)}; }
    kbd { font:500 11px/16px ${FONT_STACK}; padding:1px 6px; border-radius:4px; background:${alpha(T.surface, 0.16)}; }
  `;
  const pill = document.createElement("div");
  pill.className = "pill";
  const num = document.createElement("span");
  num.className = "num";
  const label = document.createElement("span");
  label.textContent = "Capturing soon. Open the menu or hover what you need.";
  const esc = document.createElement("span");
  esc.className = "soft";
  esc.append(document.createElement("kbd"), " cancel");
  (esc.firstChild as HTMLElement).textContent = "Esc";
  pill.append(num, label, esc);
  shadow.append(style, pill);
  const paint = () => { num.textContent = String(left); };
  paint();
  (document.body || document.documentElement).appendChild(host);
  countdownEl = host;
  countdownTick = setInterval(() => { left -= 1; if (left <= 0) hideCountdown(); else paint(); }, 1000);
  window.addEventListener("keydown", onCountdownKey, true);
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
      background: ${T.text} !important;
      color: ${T.surface} !important;
      padding: 8px 14px !important;
      border-radius: 9999px !important;
      font-family: ${FONT_STACK} !important;
      font-size: 13px !important;
      font-weight: 500 !important;
      box-shadow: ${T.shadowLg} !important;
      display: flex !important;
      align-items: center !important;
      gap: 8px !important;
      border: none !important;
      opacity: 0 !important;
      transition: opacity .15s !important;
    `;
    (document.body || document.documentElement).appendChild(quickToastEl);
  }

  quickToastEl.innerHTML = copied
    ? `<span style="display:inline-flex;color:${T.focus}">${icon("success", 16)}</span><span>Copied to clipboard</span>`
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

// Shared with region-selector.ts / scrolling-area-ui.ts (same element id), so
// whichever script reacts first creates it and the others only update it.
function showInlineNotice(msg: string, kind: "error" | "info"): void {
  let el = document.getElementById("gofully-inline-notice");
  if (!el) {
    el = document.createElement("div");
    el.id = "gofully-inline-notice";
    el.setAttribute("role", "status");
    el.setAttribute("aria-live", "polite");
    (document.body || document.documentElement).appendChild(el);
  }
  el.style.cssText = `
    position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%);
    background: ${kind === "error" ? T.danger : T.text}; color: ${T.surface};
    padding: 10px 16px; border-radius: ${kind === "error" ? T.radiusLg : T.radiusPill};
    font: 500 14px ${FONT_STACK}; z-index: 2147483647;
    box-shadow: ${T.shadowLg}; pointer-events: none;
  `;
  el.textContent = msg;
  clearTimeout((el as any)._hideTimer);
  (el as any)._hideTimer = setTimeout(() => el?.remove(), kind === "error" ? 4000 : 2200);
}

// ─── Rate nudge (standalone, page-level — no longer tied to a result card) ──

let rateNudgeHost: HTMLDivElement | null = null;

function showQuickRateNudge(): void {
  if (rateNudgeHost) return;

  rateNudgeHost = document.createElement("div");
  rateNudgeHost.id = "gofully-rate-nudge-host";
  rateNudgeHost.style.cssText = "position:fixed; inset:0; z-index:2147483647; pointer-events:none;";
  const shadow = rateNudgeHost.attachShadow({ mode: "closed" });

  setOverlayVars(rateNudgeHost);
  const style = document.createElement("style");
  style.textContent = `
    ${overlayFontFace()}
    .rate-nudge {
      position: fixed; bottom: 16px; right: 16px;
      width: 296px;
      background: var(--gf-bg-surface); color: var(--gf-text);
      border: 1px solid var(--gf-border); border-radius: 12px;
      box-shadow: var(--gf-shadow-lg);
      padding: 16px;
      pointer-events: auto;
      opacity: 0; transform: translateY(12px);
      transition: opacity 0.2s cubic-bezier(0.16,1,0.3,1), transform 0.2s cubic-bezier(0.16,1,0.3,1);
      font-family: ${FONT_STACK};
      -webkit-font-smoothing: antialiased;
    }
    .rate-nudge.show { opacity: 1; transform: translateY(0); }
    .rate-nudge-row { display: flex; align-items: flex-start; gap: 10px; }
    .rate-nudge-star {
      width: 32px; height: 32px; flex-shrink: 0; border-radius: 8px;
      background: var(--gf-warning-bg); color: var(--gf-warning);
      display: flex; align-items: center; justify-content: center;
    }
    .rate-nudge-title { font-size: 14px; font-weight: 500; line-height: 20px; }
    .rate-nudge-sub { font-size: 13px; color: var(--gf-text-2); margin-top: 2px; line-height: 19px; }
    .rate-nudge-close {
      border: none; background: none; cursor: pointer; color: var(--gf-text-3); border-radius: 6px;
      width: 24px; height: 24px; flex-shrink: 0;
      display: flex; align-items: center; justify-content: center;
    }
    .rate-nudge-close:hover { background: var(--gf-bg-hover); color: var(--gf-text); }
    .rate-nudge-actions { display: flex; gap: 8px; margin-top: 12px; }
    .rate-nudge-btn {
      flex: 1; height: 32px; cursor: pointer; border-radius: 999px;
      font: 500 13px/1 ${FONT_STACK};
      transition: background .15s;
    }
    .rate-nudge-btn:focus-visible, .rate-nudge-close:focus-visible { outline: none; box-shadow: 0 0 0 3px var(--gf-focus); }
    .rate-nudge-btn-primary { border: 1px solid var(--gf-brand); background: var(--gf-brand); color: var(--gf-on-brand); }
    .rate-nudge-btn-primary:hover { background: var(--gf-brand-hover); }
    .rate-nudge-btn-secondary { border: 1px solid var(--gf-border-strong); background: var(--gf-bg-surface); color: var(--gf-text); }
    .rate-nudge-btn-secondary:hover { background: var(--gf-bg-hover); }
  `;

  const nudge = document.createElement("div");
  nudge.className = "rate-nudge";
  nudge.innerHTML = `
    <div class="rate-nudge-row">
      <div class="rate-nudge-star">
        ${icon("star", 18)}
      </div>
      <div style="flex:1">
        <div class="rate-nudge-title">Enjoying GoFully?</div>
        <div class="rate-nudge-sub">A quick rating helps others discover the extension.</div>
      </div>
      <button class="rate-nudge-close" id="sf-rate-close" aria-label="Close">${icon("close", 16)}</button>
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
    // Figma: Overlay / Capturing · badge — a light card with title, step and progress.
    badge.style.cssText = `
      background: ${T.surface} !important;
      color: ${T.text} !important;
      width: 300px !important;
      padding: 12px 14px !important;
      border-radius: 12px !important;
      border: 1px solid ${T.border} !important;
      font-family: ${FONT_STACK} !important;
      box-shadow: ${T.shadowLg} !important;
      display: grid !important;
      grid-template-columns: 32px 1fr auto !important;
      column-gap: 10px !important;
      row-gap: 10px !important;
      align-items: center !important;
    `;

    const tile = document.createElement("span");
    tile.style.cssText = `width:32px !important; height:32px !important; border-radius:8px !important; display:inline-flex !important; align-items:center !important; justify-content:center !important; background:${T.accentBg} !important; color:${T.accent} !important;`;
    tile.innerHTML = icon("full-page", 18);
    badge.appendChild(tile);

    const textCol = document.createElement("span");
    textCol.style.cssText = "display:flex !important; flex-direction:column !important; min-width:0 !important;";
    const title = document.createElement("span");
    title.style.cssText = `font:500 14px/20px ${FONT_STACK} !important; color:${T.text} !important;`;
    title.textContent = "Capturing full page";
    s.badgeText = document.createElement("span");
    s.badgeText.style.cssText = `font:400 12px/16px ${FONT_STACK} !important; color:${T.textFaint} !important; font-variant-numeric:tabular-nums !important;`;
    s.badgeText.textContent = "Getting the page ready";
    textCol.append(title, s.badgeText);
    badge.appendChild(textCol);

    const escHint = document.createElement("span");
    escHint.style.cssText = `font:500 11px/16px ${FONT_STACK} !important; color:${T.textMuted} !important; border:1px solid ${T.borderStrong} !important; border-radius:4px !important; padding:1px 6px !important;`;
    escHint.textContent = "Esc";
    escHint.title = "Press Esc to cancel";
    badge.appendChild(escHint);

    const track = document.createElement("span");
    track.style.cssText = `grid-column:1 / -1 !important; height:6px !important; border-radius:3px !important; background:${T.surfaceSunken} !important; overflow:hidden !important; display:block !important;`;
    const fillBar = document.createElement("span");
    fillBar.id = "gofully-progress-fill";
    fillBar.style.cssText = `display:block !important; height:100% !important; width:100% !important; background:${T.accent} !important; transform-origin:left !important; transform:scaleX(0) !important; transition:transform .25s ease !important;`;
    track.appendChild(fillBar);
    badge.appendChild(track);

    s.overlay.appendChild(badge);
    (document.body || document.documentElement).appendChild(s.overlay);
  }

  const pct = total > 0 ? Math.min(100, Math.round((current / total) * 100)) : 0;
  if (s.badgeText) {
    s.badgeText.textContent = phase === "stitching" ? "Joining the screens" : `${pct}% · keep this tab open`;
  }
  const fillBar = s.overlay?.querySelector<HTMLElement>("#gofully-progress-fill");
  if (fillBar) fillBar.style.setProperty("transform", `scaleX(${phase === "stitching" ? 0.95 : pct / 100})`, "important");
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

// Load the user's theme early so every badge, toast and card below uses it.
void applyOverlayTheme();

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
      if (isSafeImageDataUrl(message.payload?.dataUrl)) showQuickCaptureToast(message.payload.dataUrl).catch(() => {});
      sendResponse({ shown: true });
      return true;
    }
    if (message.type === "SHOW_COUNTDOWN") {
      showCountdown(Number(message.payload?.seconds) || 3);
      sendResponse({ shown: true });
      return true;
    }
    if (message.type === "HIDE_COUNTDOWN") {
      hideCountdown();
      sendResponse({ ok: true });
      return true;
    }
    if (message.type === "SHOW_RESULT_CARD" && isSafeImageDataUrl(message.payload?.dataUrl)) {
      showResultCard(message.payload);
      sendResponse({ shown: true });
      return true;
    }
    if (message.type === "CAPTURE_ERROR_INLINE" || message.type === "CAPTURE_NOTICE") {
      // This script is always present, so a failed or skipped shortcut
      // capture is never silent (region-selector / scrolling-area-ui only
      // exist while their own picker is open).
      removeProgressOverlay();
      showInlineNotice(
        message.payload?.message || "Capture failed",
        message.type === "CAPTURE_NOTICE" ? "info" : "error"
      );
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
// Cmd/Ctrl/Alt + Shift + H (Draw on page)
let lastShortcutDispatchTime = 0;

function handleCaptureShortcut(e: KeyboardEvent): void {
  const hasModifier = (e.metaKey || e.ctrlKey || e.altKey) && e.shiftKey;
  if (!hasModifier) return;

  const target = e.target as HTMLElement | null;
  if (
    target &&
    (target.tagName === "INPUT" ||
      target.tagName === "TEXTAREA" ||
      target.isContentEditable ||
      (typeof target.closest === "function" &&
        target.closest("input, textarea, [contenteditable='true'], [role='textbox']")))
  ) {
    return;
  }

  const now = Date.now();
  if (now - lastShortcutDispatchTime < 600) {
    return;
  }

  const key = (e.key || "").toLowerCase();
  const code = e.code || "";

  const isF = code === "KeyF" || key === "f" || code === "Digit1" || key === "1";
  const isV = code === "KeyV" || key === "v" || code === "Digit3" || key === "3";
  const isA = code === "KeyA" || key === "a" || code === "Digit4" || key === "4";
  const isH = code === "KeyH" || key === "h";

  if (isF || isV || isA || isH) {
    lastShortcutDispatchTime = now;
  }

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
  } else if (isH) {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    chrome.runtime.sendMessage({
      type: "INIT_INTERACTIVE_MODE",
      payload: { mode: "annotate-page" },
      mode: "annotate-page",
    }).catch(() => {});
  }
}

if (!(window as any).__gofully_shortcut_listener_registered) {
  (window as any).__gofully_shortcut_listener_registered = true;
  window.addEventListener("keydown", handleCaptureShortcut, true);
  document.addEventListener("keydown", handleCaptureShortcut, true);
}
