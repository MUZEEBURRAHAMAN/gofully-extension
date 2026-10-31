/**
 * Measure: inspect sizes, spacing and colours on the live page.
 *   Hover            size of the element under the pointer, with its padding and margin.
 *   Click            keep that element; hover another to see the gaps between the two.
 *   Drag             a free ruler between any two points.
 *   C or the button  pick a colour from anywhere on screen (copied as hex).
 *   Esc              let go of the kept element, then leave.
 * Everything is read from the page's own layout in CSS pixels, so the numbers match the code.
 * The measurement boxes stay visible in a capture (a redline); the toolbar is left out.
 */

import { T, FONT_FAMILY, applyOverlayTheme, alpha } from "../ui/overlay-kit";
import { icon } from "../ui/ds/icons";

const FONT_STACK = FONT_FAMILY;

declare global {
  interface Window { __gofully_measure_registered?: boolean }
  // Chrome's screen colour picker; not in every TypeScript DOM library yet.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  interface Window { EyeDropper?: any }
}

type Box = { left: number; top: number; right: number; bottom: number; width: number; height: number };

let active = false;
let host: HTMLDivElement | null = null; // measurement layer (stays in captures)
let barHost: HTMLDivElement | null = null; // toolbar (hidden from captures)
let layer: HTMLDivElement | null = null;
let hintEl: HTMLSpanElement | null = null;
let swatchesEl: HTMLDivElement | null = null;
let hovered: Element | null = null;
let kept: Element | null = null;
let drag: { x: number; y: number; moved: boolean } | null = null;
let pointer = { x: 0, y: 0 };
let frame = 0;
const colours: string[] = [];

function rectOf(el: Element): Box {
  const r = el.getBoundingClientRect();
  return { left: r.left, top: r.top, right: r.right, bottom: r.bottom, width: r.width, height: r.height };
}

/** What the element is, in the words people use for it. */
function kindOf(el: Element, cs: CSSStyleDeclaration): string {
  const tag = el.tagName.toLowerCase();
  const role = el.getAttribute("role");
  if (tag === "button" || role === "button" || (tag === "input" && /^(button|submit|reset)$/.test((el as HTMLInputElement).type))) return "Button";
  if (tag === "a") return "Link";
  if (tag === "img" || tag === "picture" || tag === "svg" || role === "img") return "Image";
  if (tag === "video") return "Video";
  if (tag === "input" || tag === "textarea" || tag === "select") return "Form field";
  if (/^h[1-6]$/.test(tag)) return `Heading ${tag[1]}`;
  if (tag === "p") return "Paragraph";
  if (tag === "li") return "List item";
  if (tag === "ul" || tag === "ol") return "List";
  if (tag === "table") return "Table";
  if (tag === "nav") return "Navigation";
  if (tag === "header") return "Header";
  if (tag === "footer") return "Footer";
  if (tag === "section" || tag === "article" || tag === "main" || tag === "aside") return "Section";
  if (tag === "span" || tag === "label" || tag === "strong" || tag === "em" || tag === "small") return "Text";
  if (cs.display.includes("flex") || cs.display.includes("grid")) return "Layout box";
  return "Box";
}

/** The element's own name in the code, short: its id, else its first class. */
function codeName(el: Element): string {
  if (el.id) return `#${el.id}`.slice(0, 28);
  const cls = typeof (el as HTMLElement).className === "string" ? (el as HTMLElement).className.trim().split(/\s+/)[0] : "";
  return cls ? `.${cls}`.slice(0, 28) : `<${el.tagName.toLowerCase()}>`;
}

const px = (v: number): string => `${Math.round(v)}`;

const WEIGHT: Record<string, string> = { "100": "Thin", "200": "Extra light", "300": "Light", "400": "Regular", "500": "Medium", "600": "Semibold", "700": "Bold", "800": "Extra bold", "900": "Black" };

function sides(cs: CSSStyleDeclaration, prop: "padding" | "margin"): [number, number, number, number] {
  return [
    parseFloat(cs.getPropertyValue(`${prop}-top`)) || 0,
    parseFloat(cs.getPropertyValue(`${prop}-right`)) || 0,
    parseFloat(cs.getPropertyValue(`${prop}-bottom`)) || 0,
    parseFloat(cs.getPropertyValue(`${prop}-left`)) || 0,
  ];
}

/** Padding or margin in words: one value, a pair, or each side named. */
function sidesText(v: number[]): string {
  const r = v.map((n) => Math.round(n));
  if (r.every((n) => n === r[0])) return `${r[0]} px all round`;
  if (r[0] === r[2] && r[1] === r[3]) return `${r[0]} px top and bottom, ${r[1]} px sides`;
  const names = ["top", "right", "bottom", "left"];
  return r.map((n, i) => (n ? `${names[i]} ${n}` : "")).filter(Boolean).join(", ") + " px";
}

function div(cls: string, css: Partial<Record<string, string>>, text?: string): HTMLDivElement {
  const d = document.createElement("div");
  d.className = cls;
  for (const [k, v] of Object.entries(css)) if (v !== undefined) d.style.setProperty(k, v);
  if (text !== undefined) d.textContent = text;
  return d;
}

function boxDiv(cls: string, b: Box): HTMLDivElement {
  return div(cls, { left: `${b.left}px`, top: `${b.top}px`, width: `${Math.max(0, b.width)}px`, height: `${Math.max(0, b.height)}px` });
}

function label(text: string, x: number, y: number, cls = "lab"): HTMLDivElement {
  const l = div(cls, {}, text);
  // keep inside the window
  l.style.left = `${Math.max(4, Math.min(window.innerWidth - 240, x))}px`;
  l.style.top = `${Math.max(4, Math.min(window.innerHeight - 24, y))}px`;
  return l;
}

/** The ring between an outer and an inner box, as four bands. */
function bands(cls: string, o: Box, i: Box): void {
  const parts: Box[] = [
    { left: o.left, top: o.top, right: o.right, bottom: i.top, width: o.width, height: i.top - o.top },
    { left: o.left, top: i.bottom, right: o.right, bottom: o.bottom, width: o.width, height: o.bottom - i.bottom },
    { left: o.left, top: i.top, right: i.left, bottom: i.bottom, width: i.left - o.left, height: i.bottom - i.top },
    { left: i.right, top: i.top, right: o.right, bottom: i.bottom, width: o.right - i.right, height: i.bottom - i.top },
  ];
  for (const p of parts) if (p.width > 0.5 && p.height > 0.5) layer!.append(boxDiv(cls, p));
}

function inset(b: Box, t: number, r: number, bo: number, l: number): Box {
  const left = b.left + l, top = b.top + t, right = b.right - r, bottom = b.bottom - bo;
  return { left, top, right, bottom, width: right - left, height: bottom - top };
}

/** Element box with its padding (green) and margin (amber) bands, and a label with the numbers. */
function drawElement(el: Element, keptStyle: boolean, labelBelow = false): void {
  const b = rectOf(el);
  const cs = getComputedStyle(el);
  const pad = sides(cs, "padding");
  const mar = sides(cs, "margin");
  const border = [cs.borderTopWidth, cs.borderRightWidth, cs.borderBottomWidth, cs.borderLeftWidth].map((v) => parseFloat(v) || 0);
  if (mar.some((v) => v > 0)) {
    const outer = inset(b, -Math.max(0, mar[0]), -Math.max(0, mar[1]), -Math.max(0, mar[2]), -Math.max(0, mar[3]));
    bands("margin", outer, b);
  }
  if (pad.some((v) => v > 0)) {
    const inner = inset(b, border[0], border[1], border[2], border[3]);
    bands("pad", inner, inset(inner, pad[0], pad[1], pad[2], pad[3]));
  }
  layer!.append(boxDiv(keptStyle ? "el kept" : "el", b));

  // Info card: what it is, its size, then one labelled row per measurement. The swatches match the bands drawn on the page.
  const card = div(keptStyle ? "info kept" : "info", {});
  const head = div("info-head", {});
  head.append(div("info-kind", {}, keptStyle ? `${kindOf(el, cs)} (selected)` : kindOf(el, cs)), div("info-code", {}, codeName(el)));
  card.append(head, div("info-size", {}, `${px(b.width)} × ${px(b.height)} px`));
  const row = (sw: string, name: string, value: string) => {
    const r = div("info-row", {});
    r.append(div(`sw ${sw}`, {}), div("info-name", {}, name), div("info-val", {}, value));
    card.append(r);
  };
  if (pad.some((v) => v > 0)) row("sw-pad", "Padding", sidesText(pad));
  if (mar.some((v) => v !== 0)) row("sw-mar", "Margin", sidesText(mar));
  if ((el as HTMLElement).innerText?.trim()) {
    const family = cs.fontFamily.split(",")[0].replace(/["']/g, "").trim();
    row("sw-text", "Text", `${px(parseFloat(cs.fontSize))} px, ${WEIGHT[cs.fontWeight] ?? cs.fontWeight}${family ? `, ${family}` : ""}`);
  }
  layer!.append(card);
  // Above the element when it fits (and nothing asked for below), otherwise below, always inside the window.
  const h = card.offsetHeight, w = card.offsetWidth;
  const top = !labelBelow && b.top - h - 8 >= 4 ? b.top - h - 8 : Math.min(b.bottom + 8, window.innerHeight - h - 4);
  card.style.left = `${Math.max(4, Math.min(window.innerWidth - w - 4, b.left))}px`;
  card.style.top = `${Math.max(4, top)}px`;
}

/** A measured line with its length in the middle. */
function line(x1: number, y1: number, x2: number, y2: number, text: string): void {
  const horizontal = Math.abs(y2 - y1) < 0.5;
  const len = horizontal ? Math.abs(x2 - x1) : Math.abs(y2 - y1);
  if (len < 1) return;
  const l = div(horizontal ? "gap h" : "gap v", horizontal
    ? { left: `${Math.min(x1, x2)}px`, top: `${y1}px`, width: `${len}px` }
    : { left: `${x1}px`, top: `${Math.min(y1, y2)}px`, height: `${len}px` });
  layer!.append(l);
  const mx = horizontal ? Math.min(x1, x2) + len / 2 : x1;
  const my = horizontal ? y1 : Math.min(y1, y2) + len / 2;
  layer!.append(label(`${text} px`, mx + (horizontal ? -18 : 6), my + (horizontal ? 4 : -10), "lab gapl"));
}

/** Distances between the kept element and the hovered one, the way design tools show them. */
function drawGaps(a: Box, b: Box): void {
  const midY = (Math.max(a.top, b.top) + Math.min(a.bottom, b.bottom)) / 2;
  const midX = (Math.max(a.left, b.left) + Math.min(a.right, b.right)) / 2;
  const overlapY = Math.min(a.bottom, b.bottom) > Math.max(a.top, b.top);
  const overlapX = Math.min(a.right, b.right) > Math.max(a.left, b.left);
  const yFor = overlapY ? midY : (a.top + a.bottom) / 2;
  const xFor = overlapX ? midX : (a.left + a.right) / 2;
  // horizontal gap
  if (b.left >= a.right) line(a.right, yFor, b.left, yFor, px(b.left - a.right));
  else if (a.left >= b.right) line(b.right, yFor, a.left, yFor, px(a.left - b.right));
  // vertical gap
  if (b.top >= a.bottom) line(xFor, a.bottom, xFor, b.top, px(b.top - a.bottom));
  else if (a.top >= b.bottom) line(xFor, b.bottom, xFor, a.top, px(a.top - b.bottom));
  // one inside the other: the four insets
  if (b.left >= a.left && b.right <= a.right && b.top >= a.top && b.bottom <= a.bottom) {
    const cy = (b.top + b.bottom) / 2, cx = (b.left + b.right) / 2;
    line(a.left, cy, b.left, cy, px(b.left - a.left));
    line(b.right, cy, a.right, cy, px(a.right - b.right));
    line(cx, a.top, cx, b.top, px(b.top - a.top));
    line(cx, b.bottom, cx, a.bottom, px(a.bottom - b.bottom));
  }
}

function paint(): void {
  frame = 0;
  if (!layer) return;
  layer.replaceChildren();
  if (drag?.moved) {
    const dx = pointer.x - drag.x, dy = pointer.y - drag.y;
    const len = Math.hypot(dx, dy);
    const l = div("ruler", { left: `${drag.x}px`, top: `${drag.y}px`, width: `${len}px`, transform: `rotate(${Math.atan2(dy, dx)}rad)` });
    layer.append(l, div("dot", { left: `${drag.x - 3}px`, top: `${drag.y - 3}px` }), div("dot", { left: `${pointer.x - 3}px`, top: `${pointer.y - 3}px` }));
    layer.append(label(`${px(len)} px  (${px(Math.abs(dx))} across, ${px(Math.abs(dy))} down)`, pointer.x + 12, pointer.y + 12, "lab kept"));
    return;
  }
  if (kept && kept.isConnected) drawElement(kept, true);
  if (hovered && hovered !== kept) {
    // With an element kept, its label sits above; the hovered one goes below so the two never overlap.
    drawElement(hovered, false, !!kept && kept.isConnected);
    if (kept && kept.isConnected) drawGaps(rectOf(kept), rectOf(hovered));
  }
}

function schedule(): void {
  if (!frame) frame = requestAnimationFrame(paint);
}

function ours(e: Event): boolean {
  const path = e.composedPath();
  return (!!barHost && path.includes(barHost));
}

function elementAt(x: number, y: number): Element | null {
  const el = document.elementFromPoint(x, y);
  if (!el || el === host || el === barHost || el === document.documentElement) return null;
  return el;
}

function swallow(e: Event): void { e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation(); }

function onMove(e: MouseEvent): void {
  pointer = { x: e.clientX, y: e.clientY };
  if (drag && !drag.moved && Math.hypot(e.clientX - drag.x, e.clientY - drag.y) > 4) drag.moved = true;
  if (!ours(e)) hovered = elementAt(e.clientX, e.clientY);
  schedule();
}

function onDown(e: MouseEvent): void {
  if (ours(e) || e.button !== 0) return;
  swallow(e);
  drag = { x: e.clientX, y: e.clientY, moved: false };
}

function onUp(e: MouseEvent): void {
  if (ours(e)) return;
  swallow(e);
  if (drag && !drag.moved) {
    const el = elementAt(e.clientX, e.clientY);
    kept = el && el !== kept ? el : null;
    setHint();
  }
  drag = null;
  schedule();
}

function onClick(e: MouseEvent): void {
  if (!ours(e)) swallow(e);
}

function onKey(e: KeyboardEvent): void {
  if (e.key === "Escape") {
    swallow(e);
    if (kept) { kept = null; setHint(); schedule(); } else stop();
    return;
  }
  if (e.metaKey || e.ctrlKey || e.altKey) return;
  if (e.key.toLowerCase() === "c") { swallow(e); void pickColour(); }
}

function setHint(): void {
  if (!hintEl) return;
  hintEl.textContent = kept
    ? "Hover another element to see the gaps. Esc lets go."
    : "Hover for size and spacing. Click one to compare. Drag to measure.";
}

// ─── Colour ──────────────────────────────────────────────────────────────────
function toHex(c: string): string | null {
  const m = c.match(/\d+(\.\d+)?/g);
  if (!m || m.length < 3) return /^#[0-9a-f]{6}$/i.test(c) ? c.toLowerCase() : null;
  return "#" + m.slice(0, 3).map((v) => Math.round(Number(v)).toString(16).padStart(2, "0")).join("");
}

function formats(hex: string): { hex: string; rgb: string; hsl: string } {
  const n = parseInt(hex.slice(1), 16);
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  const max = Math.max(r, g, b) / 255, min = Math.min(r, g, b) / 255;
  const l = (max + min) / 2;
  let h = 0, s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    const rr = r / 255, gg = g / 255, bb = b / 255;
    h = max === rr ? (gg - bb) / d + (gg < bb ? 6 : 0) : max === gg ? (bb - rr) / d + 2 : (rr - gg) / d + 4;
    h *= 60;
  }
  return {
    hex,
    rgb: ["rgb", `(${r}, ${g}, ${b})`].join(""),
    hsl: ["hsl", `(${Math.round(h)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`].join(""),
  };
}

async function copyText(text: string): Promise<boolean> {
  try { await navigator.clipboard.writeText(text); return true; } catch { return false; }
}

async function pickColour(): Promise<void> {
  let hex: string | null = null;
  if (typeof window.EyeDropper === "function") {
    try {
      const res = await new window.EyeDropper().open();
      hex = toHex(String(res?.sRGBHex || ""));
    } catch {
      return; // cancelled with Esc
    }
  } else if (hovered) {
    // No screen picker in this browser: use the colour the page itself paints under the pointer.
    const cs = getComputedStyle(hovered);
    const bg = cs.backgroundColor;
    hex = toHex(bg && !/rgba?\(\s*0\s*,\s*0\s*,\s*0\s*,\s*0\s*\)|transparent/.test(bg) ? bg : cs.color);
  }
  if (!hex) return;
  const i = colours.indexOf(hex);
  if (i >= 0) colours.splice(i, 1);
  colours.unshift(hex);
  colours.splice(6);
  await copyText(hex);
  renderSwatches(hex);
}

function renderSwatches(justPicked?: string): void {
  if (!swatchesEl) return;
  swatchesEl.replaceChildren();
  for (const hex of colours) {
    const f = formats(hex);
    const b = document.createElement("button");
    b.type = "button";
    b.className = "sw";
    b.title = `${f.hex}  ${f.rgb}  ${f.hsl}  (click to copy, Shift-click for RGB)`;
    b.setAttribute("aria-label", `Copy color ${f.hex}`);
    const chip = document.createElement("span");
    chip.className = "chip";
    chip.style.background = hex;
    const text = document.createElement("span");
    text.textContent = hex === justPicked ? `${hex} copied` : hex;
    b.append(chip, text);
    b.addEventListener("click", async (e) => {
      const ok = await copyText(e.shiftKey ? f.rgb : f.hex);
      text.textContent = ok ? `${e.shiftKey ? "RGB" : hex} copied` : "Copy failed";
      setTimeout(() => { text.textContent = hex; }, 1500);
    });
    swatchesEl.append(b);
  }
}

// ─── Lifecycle ───────────────────────────────────────────────────────────────
function styles(): string {
  return `
    @font-face { font-family:'GoFully Inter'; src:url('${chrome.runtime.getURL("assets/inter-latin-wght-normal.woff2")}') format('woff2'); font-weight:100 900; font-display:swap; }
    * { box-sizing: border-box; }
    .el, .margin, .pad, .gap, .ruler, .dot, .lab, .info { position: fixed; pointer-events: none; }
    .info { min-width: 180px; max-width: 320px; padding: 8px 10px; border-radius: 8px; background: ${T.text}; color: ${T.surface};
      box-shadow: ${T.shadowLg}; font: 400 12px/16px ${FONT_STACK}; display: flex; flex-direction: column; gap: 4px; -webkit-font-smoothing: antialiased; }
    .info.kept { outline: 2px solid ${T.danger}; outline-offset: -1px; }
    .info-head { display: flex; align-items: baseline; gap: 8px; min-width: 0; }
    .info-kind { font-weight: 600; white-space: nowrap; }
    .info-code { color: ${alpha(T.surface, 0.6)}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; min-width: 0; }
    .info-size { font: 600 15px/20px ${FONT_STACK}; font-variant-numeric: tabular-nums; }
    .info-row { display: grid; grid-template-columns: 10px 56px minmax(0, 1fr); align-items: center; gap: 6px; }
    .info-name { color: ${alpha(T.surface, 0.6)}; }
    .info-val { font-variant-numeric: tabular-nums; }
    .sw { width: 10px; height: 10px; border-radius: 2px; }
    .sw-pad { background: ${alpha(T.success, 0.85)}; }
    .sw-mar { background: ${alpha(T.warn, 0.85)}; }
    .sw-text { background: ${alpha(T.surface, 0.5)}; }
    .el { border: 1px solid ${T.focus}; background: ${alpha(T.focus, 0.08)}; }
    .el.kept { border: 2px solid ${T.danger}; background: ${alpha(T.danger, 0.06)}; }
    .margin { background: ${alpha(T.warn, 0.22)}; }
    .pad { background: ${alpha(T.success, 0.24)}; }
    .gap.h { height: 0; border-top: 1px solid ${T.danger}; }
    .gap.v { width: 0; border-left: 1px solid ${T.danger}; }
    .ruler { height: 0; border-top: 2px solid ${T.danger}; transform-origin: 0 0; }
    .dot { width: 7px; height: 7px; border-radius: 50%; background: ${T.danger}; box-shadow: 0 0 0 2px ${T.surface}; }
    .lab { font: 500 11px/16px ${FONT_STACK}; padding: 2px 6px; border-radius: 4px; white-space: nowrap; font-variant-numeric: tabular-nums;
      background: ${T.focus}; color: ${T.accent === T.focus ? T.surface : T.accent}; max-width: 360px; overflow: hidden; text-overflow: ellipsis; }
    .lab.kept, .lab.gapl { background: ${T.danger}; color: ${T.surface}; }
  `;
}

function barStyles(): string {
  return `
    @font-face { font-family:'GoFully Inter'; src:url('${chrome.runtime.getURL("assets/inter-latin-wght-normal.woff2")}') format('woff2'); font-weight:100 900; font-display:swap; }
    * { box-sizing: border-box; }
    .bar { position: fixed; left: 50%; bottom: 16px; transform: translateX(-50%); display: flex; align-items: center; gap: 8px; max-width: calc(100vw - 32px);
      padding: 6px; border-radius: 999px; background: ${T.surface}; color: ${T.text}; border: 1px solid ${T.border}; box-shadow: ${T.shadowLg};
      font: 400 13px/20px ${FONT_STACK}; pointer-events: auto; -webkit-font-smoothing: antialiased; }
    .ico { display: inline-flex; color: ${T.textMuted}; padding-left: 8px; }
    .hint { color: ${T.textMuted}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; min-width: 0; }
    button { font: 500 12px/1 ${FONT_STACK}; height: 30px; padding: 0 12px; border-radius: 999px; cursor: pointer; display: inline-flex; align-items: center; gap: 6px;
      border: 1px solid ${T.borderStrong}; background: ${T.surface}; color: ${T.text}; white-space: nowrap; }
    button:hover { background: ${T.surfaceAlt}; }
    button:focus-visible { outline: none; box-shadow: 0 0 0 3px ${T.focus}; }
    button.prim { background: ${T.accent}; border-color: ${T.accent}; color: ${T.onAccent}; }
    kbd { font: 500 10px/14px ${FONT_STACK}; padding: 0 5px; border-radius: 4px; background: ${T.surfaceSunken}; color: ${T.textMuted}; }
    .sws { display: flex; gap: 4px; }
    .sw { padding: 0 10px 0 4px; gap: 6px; font-variant-numeric: tabular-nums; }
    .chip { width: 20px; height: 20px; border-radius: 50%; box-shadow: inset 0 0 0 1px ${alpha(T.text, 0.15)}; }
  `;
}

async function start(): Promise<void> {
  if (active) return;
  active = true;
  await applyOverlayTheme();

  host = document.createElement("div");
  host.id = "gofully-measure";
  host.style.cssText = "all:initial; position:fixed; inset:0; z-index:2147483646; pointer-events:none;";
  const root = host.attachShadow({ mode: "open" });
  const style = document.createElement("style");
  style.textContent = styles();
  layer = document.createElement("div");
  root.append(style, layer);

  barHost = document.createElement("div");
  barHost.id = "gofully-measure-bar";
  barHost.style.cssText = "all:initial; position:fixed; inset:auto 0 0 0; height:0; z-index:2147483647;";
  const barRoot = barHost.attachShadow({ mode: "open" });
  const barStyle = document.createElement("style");
  barStyle.textContent = barStyles();
  const bar = document.createElement("div");
  bar.className = "bar";
  bar.setAttribute("role", "toolbar");
  bar.setAttribute("aria-label", "Measure");
  const ico = document.createElement("span");
  ico.className = "ico";
  ico.innerHTML = icon("ruler", 16);
  hintEl = document.createElement("span");
  hintEl.className = "hint";
  const pick = document.createElement("button");
  pick.type = "button";
  pick.innerHTML = icon("color-picker", 14);
  pick.append("Pick color ");
  const k = document.createElement("kbd");
  k.textContent = "C";
  pick.append(k);
  pick.addEventListener("click", () => void pickColour());
  swatchesEl = document.createElement("div");
  swatchesEl.className = "sws";
  const done = document.createElement("button");
  done.type = "button";
  done.className = "prim";
  done.textContent = "Done";
  done.addEventListener("click", stop);
  bar.append(ico, hintEl, pick, swatchesEl, done);
  barRoot.append(barStyle, bar);
  setHint();
  renderSwatches();

  document.documentElement.append(host, barHost);
  window.addEventListener("mousemove", onMove, true);
  window.addEventListener("mousedown", onDown, true);
  window.addEventListener("mouseup", onUp, true);
  window.addEventListener("click", onClick, true);
  window.addEventListener("keydown", onKey, true);
  window.addEventListener("scroll", schedule, true);
  window.addEventListener("resize", schedule);
}

function stop(): void {
  if (!active) return;
  active = false;
  window.removeEventListener("mousemove", onMove, true);
  window.removeEventListener("mousedown", onDown, true);
  window.removeEventListener("mouseup", onUp, true);
  window.removeEventListener("click", onClick, true);
  window.removeEventListener("keydown", onKey, true);
  window.removeEventListener("scroll", schedule, true);
  window.removeEventListener("resize", schedule);
  if (frame) cancelAnimationFrame(frame);
  frame = 0;
  host?.remove();
  barHost?.remove();
  host = barHost = layer = hintEl = swatchesEl = null;
  hovered = kept = null;
  drag = null;
}

if (!window.__gofully_measure_registered) {
  window.__gofully_measure_registered = true;
  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message.type === "START_MEASURE_MODE") {
      void start();
      sendResponse({ started: true });
      return true;
    }
    return false;
  });
}
