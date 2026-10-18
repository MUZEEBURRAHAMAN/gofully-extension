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

const FONT_STACK =
  "'Archivo', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
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

const ICON: Record<string, string> = {
  "cursor": "M168,132.69,214.08,115l.33-.13A16,16,0,0,0,213,85.07L52.92,32.8A15.95,15.95,0,0,0,32.8,52.92L85.07,213a15.82,15.82,0,0,0,14.41,11l.78,0a15.84,15.84,0,0,0,14.61-9.59l.13-.33L132.69,168,184,219.31a16,16,0,0,0,22.63,0l12.68-12.68a16,16,0,0,0,0-22.63ZM195.31,208,144,156.69a16,16,0,0,0-26,4.93c0,.11-.09.22-.13.32l-17.65,46L48,48l159.85,52.2-45.95,17.64-.32.13a16,16,0,0,0-4.93,26h0L208,195.31Z",
  "pencil-simple": "M227.31,73.37,182.63,28.68a16,16,0,0,0-22.63,0L36.69,152A15.86,15.86,0,0,0,32,163.31V208a16,16,0,0,0,16,16H92.69A15.86,15.86,0,0,0,104,219.31L227.31,96a16,16,0,0,0,0-22.63ZM92.69,208H48V163.31l88-88L180.69,120ZM192,108.68,147.31,64l24-24L216,84.68Z",
  "highlighter": "M253.66,106.34a8,8,0,0,0-11.32,0L192,156.69,107.31,72l50.35-50.34a8,8,0,1,0-11.32-11.32L96,60.69A16,16,0,0,0,93.18,79.5L72,100.69a16,16,0,0,0,0,22.62L76.69,128,18.34,186.34a8,8,0,0,0,3.13,13.25l72,24A7.88,7.88,0,0,0,96,224a8,8,0,0,0,5.66-2.34L136,187.31l4.69,4.69a16,16,0,0,0,22.62,0l21.19-21.18A16,16,0,0,0,203.31,168l50.35-50.34A8,8,0,0,0,253.66,106.34ZM93.84,206.85l-55-18.35L88,139.31,124.69,176ZM152,180.69,83.31,112,104,91.31,172.69,160Z",
  "arrow-up-right": "M200,64V168a8,8,0,0,1-16,0V83.31L69.66,197.66a8,8,0,0,1-11.32-11.32L172.69,72H88a8,8,0,0,1,0-16H192A8,8,0,0,1,200,64Z",
  "rectangle": "M216,40H40A16,16,0,0,0,24,56V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40Zm0,160H40V56H216V200Z",
  "text-t": "M208,56V88a8,8,0,0,1-16,0V64H136V192h24a8,8,0,0,1,0,16H96a8,8,0,0,1,0-16h24V64H64V88a8,8,0,0,1-16,0V56a8,8,0,0,1,8-8H200A8,8,0,0,1,208,56Z",
  "trash": "M216,48H176V40a24,24,0,0,0-24-24H104A24,24,0,0,0,80,40v8H40a8,8,0,0,0,0,16h8V208a16,16,0,0,0,16,16H192a16,16,0,0,0,16-16V64h8a8,8,0,0,0,0-16ZM96,40a8,8,0,0,1,8-8h48a8,8,0,0,1,8,8v8H96Zm96,168H64V64H192ZM112,104v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Zm48,0v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Z",
  "undo": "M224,128a96,96,0,0,1-94.71,96H128A95.38,95.38,0,0,1,62.1,197.8a8,8,0,0,1,11-11.63A80,80,0,1,0,71.43,71.39a3.07,3.07,0,0,1-.26.25L44.59,96H72a8,8,0,0,1,0,16H24a8,8,0,0,1-8-8V56a8,8,0,0,1,16,0V85.8L60.25,60A96,96,0,0,1,224,128Z",
  "x": "M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z",
  "monitor": "M208,40H48A24,24,0,0,0,24,64V176a24,24,0,0,0,24,24H208a24,24,0,0,0,24-24V64A24,24,0,0,0,208,40Zm8,136a8,8,0,0,1-8,8H48a8,8,0,0,1-8-8V64a8,8,0,0,1,8-8H208a8,8,0,0,1,8,8Zm-48,48a8,8,0,0,1-8,8H96a8,8,0,0,1,0-16h64A8,8,0,0,1,168,224Z",
  "browser": "M216,40H40A16,16,0,0,0,24,56V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40Zm0,16V88H40V56Zm0,144H40V104H216v96Z",
  "text-aa": "M87,57.61a8,8,0,0,0-14,0l-56,120a8,8,0,0,0,14.5,6.78L52.37,152H107.63l9,19.38A8,8,0,0,0,131.1,164.6ZM60,136,80,93.12,100,136Zm172-40a40,40,0,0,0-59.5-35,8,8,0,0,0,7.9,13.9,24,24,0,1,1-4.4,3.8,8,8,0,1,0-12.5-9.9A40,40,0,1,0,232,96Z",
  "eraser": "M225,80.4,183.6,39a24,24,0,0,0-33.94,0L31,157.66a24,24,0,0,0,0,33.94l30.06,30.06A8,8,0,0,0,66.74,224H216a8,8,0,0,0,0-16h-84.7L225,114.34A24,24,0,0,0,225,80.4ZM108.68,208H70.05L42.33,180.28a8,8,0,0,1,0-11.31L96,115.31,148.69,168Zm105-105L160,156.69,107.31,104,161,50.34a8,8,0,0,1,11.32,0l41.38,41.38A8,8,0,0,1,213.65,103.4Z",
  "note": "M216,40H40A16,16,0,0,0,24,56V176a8,8,0,0,0,2.34,5.66l48,48A8,8,0,0,0,80,232H216a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40ZM40,56H216V168H176a8,8,0,0,0-8,8v40H88V176a8,8,0,0,0-8-8H40Z",
  "circle": "M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Z",
};

const COLORS = ["#1667F2", "#1d1f20", "#E5484D", "#16A34A", "#F59E0B", "#FFFFFF"];
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
    color:${isNote ? "#1d1f20" : it.c}; outline:none; pointer-events:auto;
    ${isNote ? `background:#fff; border:1px solid #E3E8EF; border-top:4px solid ${it.c}; padding:10px 12px; box-shadow:0 4px 6px -2px rgba(22,103,242,.08), 0 12px 16px -4px rgba(22,103,242,.14); min-width:140px; min-height:48px;` : "padding:2px 4px; text-shadow:0 0 3px rgba(255,255,255,.7);"}
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
  const it: Item = { id: uid(), k: "texthl", c: color === "#1d1f20" || color === "#FFFFFF" ? "#F59E0B" : color, rs: rects };
  mount(it);
  addItem(it);
  sel.removeAllRanges();
}

// ── UI ───────────────────────────────────────────────────────────────────────
const TOOLS: { id: Tool; icon: string; label: string; key: string }[] = [
  { id: "browse", icon: "cursor", label: "Browse page", key: "V" },
  { id: "pen", icon: "pencil-simple", label: "Pen", key: "P" },
  { id: "marker", icon: "highlighter", label: "Highlighter", key: "H" },
  { id: "texthl", icon: "text-aa", label: "Highlight text", key: "T" },
  { id: "arrow", icon: "arrow-up-right", label: "Arrow", key: "A" },
  { id: "rect", icon: "rectangle", label: "Rectangle", key: "R" },
  { id: "ellipse", icon: "circle", label: "Ellipse", key: "O" },
  { id: "text", icon: "text-t", label: "Text", key: "X" },
  { id: "note", icon: "note", label: "Sticky note", key: "N" },
  { id: "eraser", icon: "eraser", label: "Eraser", key: "E" },
];

const icon = (n: string, s = 18) =>
  `<svg width="${s}" height="${s}" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true"><path d="${ICON[n]}"/></svg>`;

function buildUi(): void {
  host = document.createElement("div");
  host.id = HOST_ID;
  host.style.cssText = "all:initial; position:absolute; left:0; top:0; width:0; height:0; z-index:" + Z + ";";
  root = host.attachShadow({ mode: "open" });

  const style = document.createElement("style");
  style.textContent = `
    :host { all: initial; }
    * { box-sizing: border-box; }
    #svg-layer, #html-layer { position:absolute; left:0; top:0; }
    #html-layer { overflow:visible; pointer-events:none; }
    #bar { position:fixed; left:50%; bottom:20px; transform:translateX(-50%); z-index:${Z};
      display:flex; flex-wrap:wrap; justify-content:center; align-items:center; gap:2px; padding:5px; width:max-content; max-width:calc(100vw - 24px);
      background:#fff; border:1px solid #E3E8EF; color:#344054; font:600 12px ${FONT_STACK};
      box-shadow:0 8px 10px -4px rgba(22,103,242,.08), 0 24px 32px -6px rgba(22,103,242,.18); }
    #bar.dark { background:#232529; border-color:#33383F; color:#C5CAD3; }
    #bar button { all:unset; box-sizing:border-box; width:34px; height:34px; display:grid; place-items:center; cursor:pointer; color:inherit; position:relative; flex:none; }
    #bar button:hover:not(:disabled) { background:rgba(22,103,242,.1); color:#1667F2; }
    #bar button:disabled { opacity:.35; cursor:default; }
    #bar button.on { background:#1667F2; color:#fff; }
    #bar button:focus-visible { box-shadow:0 0 0 3px rgba(22,103,242,.35); }
    #bar .sep { width:1px; align-self:stretch; background:rgba(128,128,128,.28); margin:5px 4px; flex:none; }
    #bar .sw { width:22px; height:22px; margin:0 2px; border:1px solid rgba(128,128,128,.4); cursor:pointer; flex:none; }
    #bar .sw.on { box-shadow:0 0 0 2px #fff, 0 0 0 4px #1667F2; }
    #bar .wd { width:30px; }
    #bar .wd i { display:block; width:16px; background:currentColor; }
    #bar button.cap { width:auto; padding:0 12px; gap:7px; display:flex; align-items:center; background:#1667F2; color:#fff; font:700 12px ${FONT_STACK}; }
    #bar button.cap:hover:not(:disabled) { background:#1257D8; color:#fff; }
    #bar button.cap.sec { background:transparent; color:inherit; box-shadow:inset 0 0 0 1px rgba(128,128,128,.4); }
    #bar button.cap.sec:hover:not(:disabled) { background:rgba(22,103,242,.1); color:#1667F2; }
    #bar button[data-tip]:hover::after { content:attr(data-tip); position:absolute; bottom:calc(100% + 10px); left:50%; transform:translateX(-50%);
      background:#1d1f20; color:#fff; font:500 11px ${FONT_STACK}; padding:3px 8px; white-space:nowrap; pointer-events:none; }
    #hint { position:fixed; top:16px; left:50%; transform:translateX(-50%); z-index:${Z}; background:rgba(16,24,40,.92); color:#fff;
      font:500 12px ${FONT_STACK}; padding:8px 16px; opacity:0; transition:opacity .15s; pointer-events:none; white-space:nowrap; }
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
  if (window.matchMedia?.("(prefers-color-scheme: dark)").matches) barEl.classList.add("dark");
  barEl.innerHTML =
    TOOLS.map((t) => `<button data-tool="${t.id}" data-tip="${t.label} (${t.key})" aria-label="${t.label}">${icon(t.icon)}</button>`).join("") +
    `<span class="sep"></span>` +
    COLORS.map((c) => `<button class="sw" data-color="${c}" aria-label="Color ${c}" style="background:${c}"></button>`).join("") +
    `<span class="sep"></span>` +
    WIDTHS.map((w) => `<button class="wd" data-width="${w}" aria-label="Stroke ${w}px"><i style="height:${w}px"></i></button>`).join("") +
    `<span class="sep"></span>` +
    `<button data-act="undo" data-tip="Undo (Ctrl/Cmd+Z)" aria-label="Undo">${icon("undo")}</button>` +
    `<button data-act="clear" data-tip="Clear all marks" aria-label="Clear all marks">${icon("trash")}</button>` +
    `<span class="sep"></span>` +
    `<button class="cap sec" data-act="cap-visible" aria-label="Capture visible area">${icon("monitor", 16)}Visible</button>` +
    `<button class="cap" data-act="cap-full" aria-label="Capture full page">${icon("browser", 16)}Full page</button>` +
    `<button data-act="close" data-tip="Done (Esc)" aria-label="Exit annotation mode">${icon("x")}</button>`;
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
