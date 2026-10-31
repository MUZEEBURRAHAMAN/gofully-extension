/**
 * Live page annotation.
 *
 * Draws on top of the real, open webpage (pen, highlighter, text highlight,
 * arrow, shapes, text, sticky notes) and lets the user capture the page
 * exactly as marked up. Marks live in document coordinates inside a single
 * absolutely-positioned layer, so they scroll with the page and are picked up
 * by the normal visible-area / full-page capture pipeline without any extra
 * compositing. Everything runs on-device; marks are saved per page in
 * chrome.storage.local only.
 */

import { T, FONT_FAMILY, applyOverlayTheme, alpha, SQUIRCLE_CSS } from "../ui/overlay-kit";
import { LIGHT } from "../ui/ds/tokens";
import { icon as dsIcon, type IconName } from "../ui/ds/icons";

const FONT_STACK = FONT_FAMILY;
const Z = "2147483645"; // under the capture overlays (…46 / …47) so pickers still win
const HOST_ID = "gofully-annotate-host";
const STORAGE_PREFIX = "gf_annot:";

type Tool =
  | "browse" | "pen" | "marker" | "texthl" | "arrow" | "rect" | "ellipse" | "text" | "note" | "eraser";

type Item =
  | { id: string; k: "pen" | "marker"; c: string; w: number; pts: number[] }
  | { id: string; k: "arrow"; c: string; w: number; x1: number; y1: number; x2: number; y2: number }
  | { id: string; k: "rect" | "ellipse"; c: string; w: number; x: number; y: number; w2: number; h: number }
  | { id: string; k: "text" | "note"; c: string; x: number; y: number; t: string }
  | { id: string; k: "texthl"; c: string; rs: number[][] };


/** Annotation ink: fixed DS colours (they mark the page, so they don't flip with the theme). Figma: Overlay / Draw on page · colour and size. */
const COLORS = [LIGHT.error, LIGHT.warning, LIGHT.success, LIGHT.sky, LIGHT.navy, LIGHT.ink, LIGHT.white];
const INK = LIGHT.ink;
const PAPER = LIGHT.white;
const WIDTHS = [2, 4, 8];

declare global {
  interface Window { __gofully_annotate_registered?: boolean }
}

// ── State ────────────────────────────────────────────────────────────────────
let active = false;
let host: HTMLDivElement | null = null;
let root: ShadowRoot | null = null;
let svg: SVGSVGElement | null = null;
let htmlLayer: HTMLDivElement | null = null;
let barEl: HTMLDivElement | null = null;
let hint: HTMLDivElement | null = null;
let tool: Tool = "pen";
let color = COLORS[0];
let width = WIDTHS[1];
let items: Item[] = [];
let redoStack: Item[] = [];
let drawing: { item: Item; el: SVGElement; sx: number; sy: number } | null = null;
let saveTimer: number | undefined;
let resizeObs: ResizeObserver | null = null;

const uid = () => Math.random().toString(36).slice(2, 10);
const storageKey = () => STORAGE_PREFIX + location.origin + location.pathname + location.search;

function docPoint(e: PointerEvent | MouseEvent): [number, number] {
  return [e.clientX + window.scrollX, e.clientY + window.scrollY];
}

// ── Persistence ──────────────────────────────────────────────────────────────
function scheduleSave(): void {
  window.clearTimeout(saveTimer);
  saveTimer = window.setTimeout(() => {
    const data = items.filter((i) => !(i.k === "text" || i.k === "note") || i.t.trim());
    try {
      if (data.length) chrome.storage.local.set({ [storageKey()]: data });
      else chrome.storage.local.remove(storageKey());
    } catch {
      // extension context invalidated (extension reloaded) — nothing to save to
    }
  }, 250);
}

async function loadSaved(): Promise<Item[]> {
  try {
    const got = await chrome.storage.local.get(storageKey());
    const v = got[storageKey()];
    return Array.isArray(v) ? (v as Item[]) : [];
  } catch {
    return [];
  }
}

// ── Rendering ────────────────────────────────────────────────────────────────
const NS = "http://www.w3.org/2000/svg";
function svgEl<K extends keyof SVGElementTagNameMap>(tag: K, attrs: Record<string, string | number>): SVGElementTagNameMap[K] {
  const el = document.createElementNS(NS, tag);
  for (const k in attrs) el.setAttribute(k, String(attrs[k]));
  return el;
}

function pathFromPoints(pts: number[]): string {
  if (pts.length < 4) return `M${pts[0]},${pts[1]} L${pts[0] + 0.01},${pts[1]}`;
  let d = `M${pts[0]},${pts[1]}`;
  for (let i = 2; i < pts.length - 2; i += 2) {
    const mx = (pts[i] + pts[i + 2]) / 2;
    const my = (pts[i + 1] + pts[i + 3]) / 2;
    d += ` Q${pts[i]},${pts[i + 1]} ${mx},${my}`;
  }
  d += ` L${pts[pts.length - 2]},${pts[pts.length - 1]}`;
  return d;
}

function arrowPath(x1: number, y1: number, x2: number, y2: number, w: number): string {
  const ang = Math.atan2(y2 - y1, x2 - x1);
  const head = 10 + w * 2.5;
  const a1 = ang - Math.PI / 7;
  const a2 = ang + Math.PI / 7;
  return (
    `M${x1},${y1} L${x2},${y2} ` +
    `M${x2 - head * Math.cos(a1)},${y2 - head * Math.sin(a1)} L${x2},${y2} ` +
    `L${x2 - head * Math.cos(a2)},${y2 - head * Math.sin(a2)}`
  );
}

function renderItem(it: Item): SVGElement | HTMLElement {
  switch (it.k) {
    case "pen":
      return svgEl("path", { d: pathFromPoints(it.pts), fill: "none", stroke: it.c, "stroke-width": it.w, "stroke-linecap": "round", "stroke-linejoin": "round", "data-id": it.id });
    case "marker": {
      const p = svgEl("path", { d: pathFromPoints(it.pts), fill: "none", stroke: it.c, "stroke-width": it.w * 4, "stroke-linecap": "round", "stroke-linejoin": "round", opacity: 0.38, "data-id": it.id });
      p.style.mixBlendMode = "multiply";
      return p;
    }
    case "arrow":
      return svgEl("path", { d: arrowPath(it.x1, it.y1, it.x2, it.y2, it.w), fill: "none", stroke: it.c, "stroke-width": it.w, "stroke-linecap": "round", "stroke-linejoin": "round", "data-id": it.id });
    case "rect":
      return svgEl("rect", { x: it.x, y: it.y, width: it.w2, height: it.h, fill: "none", stroke: it.c, "stroke-width": it.w, "stroke-linejoin": "miter", "data-id": it.id });
    case "ellipse":
      return svgEl("ellipse", { cx: it.x + it.w2 / 2, cy: it.y + it.h / 2, rx: it.w2 / 2, ry: it.h / 2, fill: "none", stroke: it.c, "stroke-width": it.w, "data-id": it.id });
    case "texthl": {
      const g = svgEl("g", { "data-id": it.id });
      g.style.mixBlendMode = "multiply";
      for (const [x, y, w, h] of it.rs) g.appendChild(svgEl("rect", { x, y, width: w, height: h, fill: it.c, opacity: 0.4 }));
      return g;
    }
    case "text":
    case "note": {
      const d = document.createElement("div");
      d.dataset.id = it.id;
      d.textContent = it.t;
      styleTextBox(d, it);
      return d;
    }
  }
}

function styleTextBox(d: HTMLElement, it: Extract<Item, { k: "text" | "note" }>): void {
  const isNote = it.k === "note";
  d.style.cssText = `
    position:absolute; left:${it.x}px; top:${it.y}px; max-width:320px; min-width:24px;
    font:${isNote ? "500 14px" : "600 20px"} ${FONT_STACK}; line-height:1.35; white-space:pre-wrap; word-break:break-word;
    color:${isNote ? INK : it.c}; outline:none; pointer-events:auto;
    ${isNote ? `background:${LIGHT["tint-peach-bg"]}; border:1px solid ${alpha(INK, 0.08)}; border-top:4px solid ${it.c}; border-radius:6px; padding:10px 12px; box-shadow:${T.shadowLg}; min-width:140px; min-height:48px;` : `padding:2px 4px; text-shadow:0 0 3px ${alpha(PAPER, 0.7)};`}
  `;
}

function mount(it: Item): void {
  const el = renderItem(it);
  (it.k === "text" || it.k === "note" ? htmlLayer : svg)!.appendChild(el);
}

function removeFromDom(id: string): void {
  root?.querySelectorAll(`[data-id="${id}"]`).forEach((n) => n.remove());
}

function addItem(it: Item, fromUser = true): void {
  items.push(it);
  if (fromUser) redoStack = [];
  scheduleSave();
  updateButtons();
}

function undo(): void {
  const it = items.pop();
  if (!it) return;
  removeFromDom(it.id);
  redoStack.push(it);
  scheduleSave();
  updateButtons();
}

function redo(): void {
  const it = redoStack.pop();
  if (!it) return;
  items.push(it);
  mount(it);
  scheduleSave();
  updateButtons();
}

function clearAll(): void {
  if (!items.length) return;
  for (const it of items) removeFromDom(it.id);
  items = [];
  redoStack = [];
  scheduleSave();
  updateButtons();
  flashHint("All marks cleared on this page");
}

// ── Pointer handling ─────────────────────────────────────────────────────────
function setLayersInteractive(): void {
  const drawingTool = ["pen", "marker", "arrow", "rect", "ellipse", "text", "note", "eraser"].includes(tool);
  if (svg) {
    svg.style.pointerEvents = drawingTool ? "auto" : "none";
    svg.style.cursor = tool === "eraser" ? "pointer" : tool === "text" ? "text" : "crosshair";
  }
  root?.querySelectorAll<HTMLElement>("#html-layer > div").forEach((n) => {
    n.style.pointerEvents = tool === "eraser" || tool === "text" || tool === "note" || tool === "browse" ? "auto" : "none";
    n.contentEditable = tool === "text" || tool === "note" ? "true" : "false";
  });
}

function onPointerDown(e: PointerEvent): void {
  if (e.button !== 0 || !active) return;
  const [x, y] = docPoint(e);

  if (tool === "eraser") {
    const t = (e.target as Element | null)?.closest?.("[data-id]");
    const id = t?.getAttribute("data-id");
    if (id) eraseById(id);
    return;
  }
  if (tool === "text" || tool === "note") {
    // clicking an existing box edits it (it handles its own focus); empty canvas creates one
    if ((e.target as Element | null)?.closest?.("#html-layer > div")) return;
    e.preventDefault();
    createTextBox(tool, x, y);
    return;
  }

  e.preventDefault();
  (e.target as Element).setPointerCapture?.(e.pointerId);
  let item: Item;
  switch (tool) {
    case "pen":
    case "marker":
      item = { id: uid(), k: tool, c: color, w: width, pts: [x, y] };
      break;
    case "arrow":
      item = { id: uid(), k: "arrow", c: color, w: width, x1: x, y1: y, x2: x, y2: y };
      break;
    case "rect":
    case "ellipse":
      item = { id: uid(), k: tool, c: color, w: width, x, y, w2: 0, h: 0 };
      break;
    default:
      return;
  }
  const el = renderItem(item) as SVGElement;
  svg!.appendChild(el);
  drawing = { item, el, sx: x, sy: y };
}

function onPointerMove(e: PointerEvent): void {
  if (!drawing) return;
  const [x, y] = docPoint(e);
  const it = drawing.item;
  if (it.k === "pen" || it.k === "marker") {
    it.pts.push(x, y);
    drawing.el.setAttribute("d", pathFromPoints(it.pts));
  } else if (it.k === "arrow") {
    it.x2 = x; it.y2 = y;
    if (e.shiftKey) {
      const dx = x - it.x1, dy = y - it.y1;
      const snap = Math.round(Math.atan2(dy, dx) / (Math.PI / 4)) * (Math.PI / 4);
      const len = Math.hypot(dx, dy);
      it.x2 = it.x1 + len * Math.cos(snap);
      it.y2 = it.y1 + len * Math.sin(snap);
    }
    drawing.el.setAttribute("d", arrowPath(it.x1, it.y1, it.x2, it.y2, it.w));
  } else if (it.k === "rect" || it.k === "ellipse") {
    let w = x - drawing.sx, h = y - drawing.sy;
    if (e.shiftKey) { const m = Math.max(Math.abs(w), Math.abs(h)); w = Math.sign(w || 1) * m; h = Math.sign(h || 1) * m; }
    it.x = w < 0 ? drawing.sx + w : drawing.sx;
    it.y = h < 0 ? drawing.sy + h : drawing.sy;
    it.w2 = Math.abs(w);
    it.h = Math.abs(h);
    if (it.k === "rect") {
      drawing.el.setAttribute("x", String(it.x)); drawing.el.setAttribute("y", String(it.y));
      drawing.el.setAttribute("width", String(it.w2)); drawing.el.setAttribute("height", String(it.h));
    } else {
      drawing.el.setAttribute("cx", String(it.x + it.w2 / 2)); drawing.el.setAttribute("cy", String(it.y + it.h / 2));
      drawing.el.setAttribute("rx", String(it.w2 / 2)); drawing.el.setAttribute("ry", String(it.h / 2));
    }
  }
}

function onPointerUp(): void {
  if (!drawing) return;
  const it = drawing.item;
  const tiny =
    ((it.k === "rect" || it.k === "ellipse") && it.w2 < 3 && it.h < 3) ||
    (it.k === "arrow" && Math.hypot(it.x2 - it.x1, it.y2 - it.y1) < 4);
  if (tiny) drawing.el.remove();
  else addItem(it);
  drawing = null;
}

function eraseById(id: string): void {
  const idx = items.findIndex((i) => i.id === id);
  if (idx < 0) return;
  items.splice(idx, 1);
  removeFromDom(id);
  redoStack = [];
  scheduleSave();
  updateButtons();
}

function createTextBox(kind: "text" | "note", x: number, y: number): void {
  const it: Extract<Item, { k: "text" | "note" }> = { id: uid(), k: kind, c: color, x, y, t: "" };
  const el = renderItem(it) as HTMLElement;
  el.contentEditable = "true";
  htmlLayer!.appendChild(el);
  items.push(it);
  el.focus();
  wireTextBox(el, it);
}

function wireTextBox(el: HTMLElement, it: Extract<Item, { k: "text" | "note" }>): void {
  el.addEventListener("input", () => { it.t = el.innerText; scheduleSave(); });
  el.addEventListener("blur", () => {
    it.t = el.innerText;
    if (!it.t.trim()) {
      const i = items.indexOf(it);
      if (i >= 0) items.splice(i, 1);
      el.remove();
    }
    scheduleSave();
    updateButtons();
  });
  el.addEventListener("keydown", (ev) => { if (ev.key === "Escape") { ev.stopPropagation(); el.blur(); } });
  el.addEventListener("pointerdown", (ev) => {
    if (tool === "eraser") { ev.preventDefault(); eraseById(it.id); }
  });
}

// Highlight real page text: capture the browser selection as marker rectangles.
function onSelectionEnd(): void {
  if (!active || tool !== "texthl") return;
  const sel = window.getSelection();
  if (!sel || sel.isCollapsed || sel.rangeCount === 0) return;
  const rects: number[][] = [];
  const range = sel.getRangeAt(0);
  for (const r of Array.from(range.getClientRects())) {
    if (r.width < 1 || r.height < 1) continue;
    rects.push([r.left + window.scrollX, r.top + window.scrollY, r.width, r.height]);
  }
  if (!rects.length) return;
  const it: Item = { id: uid(), k: "texthl", c: color === INK || color === PAPER ? LIGHT.warning : color, rs: rects };
  mount(it);
  addItem(it);
  sel.removeAllRanges();
}

// ── UI ───────────────────────────────────────────────────────────────────────
const TOOLS: { id: Tool; icon: IconName; label: string; key: string }[] = [
  { id: "browse", icon: "select", label: "Browse page", key: "V" },
  { id: "pen", icon: "draw", label: "Pen", key: "P" },
  { id: "marker", icon: "highlighter", label: "Highlighter", key: "H" },
  { id: "texthl", icon: "text-ocr", label: "Highlight text", key: "T" },
  { id: "arrow", icon: "arrow", label: "Arrow", key: "A" },
  { id: "rect", icon: "square", label: "Rectangle", key: "R" },
  { id: "ellipse", icon: "circle", label: "Ellipse", key: "O" },
  { id: "text", icon: "text", label: "Text", key: "X" },
  { id: "note", icon: "sticky", label: "Sticky note", key: "N" },
  { id: "eraser", icon: "eraser", label: "Eraser", key: "E" },
];

const icon = (n: IconName, s = 18) => dsIcon(n, s);

function buildUi(): void {
  host = document.createElement("div");
  host.id = HOST_ID;
  host.style.cssText = "all:initial; position:absolute; left:0; top:0; width:0; height:0; z-index:" + Z + ";";
  root = host.attachShadow({ mode: "open" });

  const style = document.createElement("style");
  style.textContent = SQUIRCLE_CSS + `
    :host { all: initial; }
    * { box-sizing: border-box; }
    #svg-layer, #html-layer { position:absolute; left:0; top:0; }
    #html-layer { overflow:visible; pointer-events:none; }
    /* Figma: Overlay / Draw on page · drawing (light), · Dark UI */
    #bar { position:fixed; left:50%; bottom:20px; transform:translateX(-50%); z-index:${Z};
      display:flex; flex-wrap:wrap; justify-content:center; align-items:center; gap:2px; padding:6px; width:max-content; max-width:calc(100vw - 24px);
      background:${T.surface}; border:1px solid ${T.border}; border-radius:999px; color:${T.textMuted}; font:500 13px ${FONT_STACK};
      box-shadow:${T.shadowLg}; }
    #bar button { all:unset; box-sizing:border-box; width:34px; height:34px; border-radius:999px; display:grid; place-items:center; cursor:pointer; color:inherit; position:relative; flex:none; transition:background .15s, color .15s; }
    #bar button:hover:not(:disabled) { background:${T.surfaceAlt}; color:${T.text}; }
    #bar button:disabled { opacity:.35; cursor:default; }
    #bar button.on { background:${T.accentBg}; color:${T.accent}; }
    #bar button:focus-visible { box-shadow:0 0 0 3px ${T.focus}; }
    #bar .sep { width:1px; align-self:stretch; background:${T.border}; margin:6px 4px; flex:none; }
    #bar .sw { width:20px; height:20px; margin:0 3px; border-radius:50%; corner-shape: round; border:1px solid ${alpha(INK, 0.16)}; cursor:pointer; flex:none; }
    #bar .sw.on { box-shadow:0 0 0 2px ${T.surface}, 0 0 0 4px ${T.focus}; }
    #bar .wd { width:30px; }
    #bar .wd i { display:block; width:16px; border-radius:4px; background:currentColor; }
    #bar button.cap { width:auto; padding:0 14px; gap:6px; display:flex; align-items:center; background:${T.accent}; color:${T.onAccent}; font:500 13px ${FONT_STACK}; }
    #bar button.cap:hover:not(:disabled) { background:${T.accentHover}; color:${T.onAccent}; }
    #bar button.cap.sec { background:${T.surface}; color:${T.text}; box-shadow:inset 0 0 0 1px ${T.borderStrong}; }
    #bar button.cap.sec:hover:not(:disabled) { background:${T.surfaceAlt}; color:${T.text}; }
    #bar button[data-tip]:hover::after { content:attr(data-tip); position:absolute; bottom:calc(100% + 10px); left:50%; transform:translateX(-50%);
      background:${T.text}; color:${T.surface}; font:400 11px/16px ${FONT_STACK}; padding:4px 8px; border-radius:6px; white-space:nowrap; pointer-events:none; }
    #hint { position:fixed; top:16px; left:50%; transform:translateX(-50%); z-index:${Z}; background:${T.text}; color:${T.surface};
      font:500 13px/20px ${FONT_STACK}; padding:8px 14px; border-radius:999px; box-shadow:${T.shadowLg}; opacity:0; transition:opacity .15s; pointer-events:none; white-space:nowrap; }
    @media (prefers-reduced-motion: reduce) { #hint { transition:none; } }
  `;
  root.appendChild(style);

  svg = svgEl("svg", { id: "svg-layer" });
  svg.style.cssText = "position:absolute; left:0; top:0; overflow:visible; pointer-events:none;";
  htmlLayer = document.createElement("div");
  htmlLayer.id = "html-layer";
  root.append(svg, htmlLayer);

  barEl = document.createElement("div");
  barEl.id = "bar";
  barEl.setAttribute("role", "toolbar");
  barEl.setAttribute("aria-label", "GoFully page annotation");
  barEl.innerHTML =
    TOOLS.map((t) => `<button data-tool="${t.id}" data-tip="${t.label} (${t.key})" aria-label="${t.label}">${icon(t.icon)}</button>`).join("") +
    `<span class="sep"></span>` +
    COLORS.map((c) => `<button class="sw" data-color="${c}" aria-label="Color ${c}" style="background:${c}"></button>`).join("") +
    `<span class="sep"></span>` +
    WIDTHS.map((w) => `<button class="wd" data-width="${w}" aria-label="Stroke ${w}px"><i style="height:${w}px"></i></button>`).join("") +
    `<span class="sep"></span>` +
    `<button data-act="undo" data-tip="Undo (Ctrl/Cmd+Z)" aria-label="Undo">${icon("undo")}</button>` +
    `<button data-act="clear" data-tip="Clear all marks" aria-label="Clear all marks">${icon("delete")}</button>` +
    `<span class="sep"></span>` +
    `<button class="cap sec" data-act="cap-visible" aria-label="Capture visible area">${icon("visible", 16)}Visible</button>` +
    `<button class="cap" data-act="cap-full" aria-label="Capture full page">${icon("full-page", 16)}Full page</button>` +
    `<button data-act="close" data-tip="Done (Esc)" aria-label="Exit annotation mode">${icon("close")}</button>`;
  root.appendChild(barEl);

  hint = document.createElement("div");
  hint.id = "hint";
  hint.setAttribute("role", "status");
  root.appendChild(hint);

  barEl.addEventListener("click", onToolbarClick);
  // keep drawing events off the page underneath
  for (const t of ["pointerdown", "mousedown", "click"]) barEl.addEventListener(t, (e) => e.stopPropagation());

  (document.documentElement).appendChild(host);
  sizeLayer();
  svg.addEventListener("pointerdown", onPointerDown);
  svg.addEventListener("pointermove", onPointerMove);
  svg.addEventListener("pointerup", onPointerUp);
  svg.addEventListener("pointercancel", onPointerUp);
}

function sizeLayer(): void {
  if (!svg || !htmlLayer) return;
  const de = document.documentElement;
  // measure the page without our own layer, so a shrinking page can shrink it back
  svg.style.width = "0px"; svg.style.height = "0px";
  htmlLayer.style.width = "0px"; htmlLayer.style.height = "0px";
  const w = Math.max(de.scrollWidth, document.body?.scrollWidth || 0, de.clientWidth);
  const h = Math.max(de.scrollHeight, document.body?.scrollHeight || 0, de.clientHeight);
  svg.setAttribute("width", String(w));
  svg.setAttribute("height", String(h));
  svg.style.width = w + "px";
  svg.style.height = h + "px";
  htmlLayer.style.width = w + "px";
  htmlLayer.style.height = h + "px";
}

function updateButtons(): void {
  if (!barEl) return;
  barEl.querySelectorAll<HTMLElement>("[data-tool]").forEach((b) => b.classList.toggle("on", b.dataset.tool === tool));
  barEl.querySelectorAll<HTMLElement>("[data-color]").forEach((b) => b.classList.toggle("on", b.dataset.color === color));
  barEl.querySelectorAll<HTMLElement>("[data-width]").forEach((b) => b.classList.toggle("on", Number(b.dataset.width) === width));
  (barEl.querySelector('[data-act="undo"]') as HTMLButtonElement).disabled = items.length === 0;
  (barEl.querySelector('[data-act="clear"]') as HTMLButtonElement).disabled = items.length === 0;
}

function flashHint(msg: string): void {
  if (!hint) return;
  hint.textContent = msg;
  hint.style.opacity = "1";
  window.clearTimeout((hint as any)._t);
  (hint as any)._t = window.setTimeout(() => { if (hint) hint.style.opacity = "0"; }, 1800);
}

function setTool(t: Tool): void {
  tool = t;
  const sel = window.getSelection();
  if (t !== "texthl" && sel && !sel.isCollapsed) sel.removeAllRanges();
  setLayersInteractive();
  updateButtons();
  const meta = TOOLS.find((x) => x.id === t);
  if (meta) flashHint(t === "texthl" ? "Select text on the page to highlight it" : meta.label);
}

function onToolbarClick(e: Event): void {
  const b = (e.target as HTMLElement).closest("button") as HTMLButtonElement | null;
  if (!b || b.disabled) return;
  if (b.dataset.tool) return setTool(b.dataset.tool as Tool);
  if (b.dataset.color) { color = b.dataset.color; return updateButtons(); }
  if (b.dataset.width) { width = Number(b.dataset.width); return updateButtons(); }
  switch (b.dataset.act) {
    case "undo": return undo();
    case "clear": return clearAll();
    case "close": return stop();
    case "cap-visible": void capture("visible-area"); return;
    case "cap-full": void capture("full-page"); return;
  }
}

// ── Capture ──────────────────────────────────────────────────────────────────
function nextFrame(): Promise<void> {
  return new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())));
}

async function capture(mode: "visible-area" | "full-page"): Promise<void> {
  if (!barEl || !hint) return;
  // finish any text being typed so it is saved and rendered, then hide our own UI
  (root?.activeElement as HTMLElement | null)?.blur?.();
  const sel = window.getSelection();
  sel?.removeAllRanges();
  barEl.style.display = "none";
  hint.style.display = "none";
  svg!.style.pointerEvents = "none";
  await nextFrame();
  try {
    const resp: any = await chrome.runtime.sendMessage({ type: "START_CAPTURE", payload: { mode } });
    if (resp?.type === "CAPTURE_ERROR") flashHint(resp.payload?.message || "Capture failed");
  } catch {
    // service worker restarting or extension reloaded
  } finally {
    if (barEl && hint) {
      barEl.style.display = "";
      hint.style.display = "";
      setLayersInteractive();
    }
  }
}

// ── Keyboard ─────────────────────────────────────────────────────────────────
function typingInPage(e: KeyboardEvent): boolean {
  const t = e.target as HTMLElement | null;
  return !!t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT" || t.isContentEditable) && t !== host;
}

function onKeyDown(e: KeyboardEvent): void {
  if (!active) return;
  const inText = (root?.activeElement as HTMLElement | null)?.isContentEditable;
  if (e.key === "Escape" && !inText) {
    e.preventDefault();
    e.stopPropagation();
    stop();
    return;
  }
  if (inText) return;
  if ((e.metaKey || e.ctrlKey) && !e.shiftKey && e.key.toLowerCase() === "z") {
    e.preventDefault(); e.stopPropagation(); undo(); return;
  }
  if ((e.metaKey || e.ctrlKey) && (e.key.toLowerCase() === "y" || (e.shiftKey && e.key.toLowerCase() === "z"))) {
    e.preventDefault(); e.stopPropagation(); redo(); return;
  }
  if (e.metaKey || e.ctrlKey || e.altKey || typingInPage(e)) return;
  const t = TOOLS.find((x) => x.key.toLowerCase() === e.key.toLowerCase());
  if (t) { e.preventDefault(); e.stopPropagation(); setTool(t.id); }
}

// ── Lifecycle ────────────────────────────────────────────────────────────────
async function start(): Promise<void> {
  if (active) return;
  active = true;
  await applyOverlayTheme();
  buildUi();
  items = await loadSaved();
  for (const it of items) {
    mount(it);
    if (it.k === "text" || it.k === "note") {
      const el = htmlLayer!.querySelector<HTMLElement>(`[data-id="${it.id}"]`);
      if (el) wireTextBox(el, it);
    }
  }
  setTool("pen");
  updateButtons();
  flashHint(items.length ? `Restored ${items.length} mark${items.length === 1 ? "" : "s"} on this page` : "Draw on the page. Press Esc to finish.");
  window.addEventListener("keydown", onKeyDown, true);
  document.addEventListener("mouseup", onSelectionEnd, true);
  window.addEventListener("resize", sizeLayer);
  resizeObs = new ResizeObserver(sizeLayer);
  resizeObs.observe(document.documentElement);
}

function stop(): void {
  if (!active) return;
  active = false;
  window.removeEventListener("keydown", onKeyDown, true);
  document.removeEventListener("mouseup", onSelectionEnd, true);
  window.removeEventListener("resize", sizeLayer);
  resizeObs?.disconnect();
  resizeObs = null;
  host?.remove();
  host = root = svg = htmlLayer = barEl = hint = null;
  drawing = null;
}

if (!window.__gofully_annotate_registered) {
  window.__gofully_annotate_registered = true;
  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message.type === "START_ANNOTATE_MODE") {
      if (active) stop();
      else void start();
      sendResponse({ started: active });
      return true;
    }
    if (message.type === "STOP_ANNOTATE_MODE") {
      stop();
      sendResponse({ stopped: true });
      return true;
    }
    return false;
  });
}

export {};
