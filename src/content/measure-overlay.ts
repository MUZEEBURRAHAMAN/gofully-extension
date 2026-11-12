/**
 * Measure: Gridray live design specification tool integrated into GoFully.
 * Drag a frame over any UI (buttons, cards, navigation, sections) to turn it into
 * an interactive design spec with skeleton wireframe, live dimensions,
 * padding zones, flow gaps, and corner radii.
 *
 * Implements the Gridray engine (https://gridray.dev/) fully styled with
 * GoFully's Design System v2 tokens and typography.
 */

import { T, FONT_FAMILY, applyOverlayTheme, alpha, SQUIRCLE_CSS, injectOverlayFont } from "../ui/overlay-kit";
import { icon } from "../ui/ds/icons";

const FONT_STACK = FONT_FAMILY;

declare global {
  interface Window {
    __gofully_measure_registered?: boolean;
    EyeDropper?: any;
  }
}

// ─── Constants & Types ───────────────────────────────────────────────────────
const NS = "http://www.w3.org/2000/svg";
const CORNERS = [[-1, -1], [1, -1], [1, 1], [-1, 1]] as const;
const TICK = 6;
const TEXT_BAR = 0.6;
const BLOCK_MAX = 64;
const MAX_ELEMENTS = 2000;
const MARK = "data-spec-portal";
const INTERACTIVE = 'button, a[href], input, textarea, select, label, summary, [contenteditable], [role="button"]';
const REPLACED = new Set(["img", "svg", "video", "canvas", "iframe", "input", "textarea", "select", "picture", "object", "embed"]);
const SKIP = new Set(["script", "style", "noscript", "template", "head", "link", "meta", "title", "br", "wbr"]);

export interface PortalOptions {
  selector?: string | null;
  grid?: number;
  modifier?: "shift" | "alt" | "meta" | "ctrl" | null;
  within?: Element | string | null;
  accent?: string;
  labelBackground?: string | null;
  skeleton?: string | null;
  skeletonShine?: string | null;
  font?: string;
  fade?: number;
  draw?: number;
  shimmer?: number;
  injectStyles?: boolean;
  crosshair?: boolean;
  onOpen?: (() => void) | null;
  onClose?: (() => void) | null;
}

const DEFAULTS: Required<Omit<PortalOptions, "within" | "labelBackground" | "skeleton" | "skeletonShine" | "onOpen" | "onClose">> & {
  within: Element | string | null;
  labelBackground: string | null;
  skeleton: string | null;
  skeletonShine: string | null;
  onOpen: (() => void) | null;
  onClose: (() => void) | null;
} = {
  selector: null,
  grid: 4,
  modifier: "shift",
  within: null,
  accent: "#0d99ff", // Gridray signature vibrant design spec blue
  labelBackground: null,
  skeleton: null,
  skeletonShine: null,
  font: `${FONT_STACK}, ui-monospace, SFMono-Regular, Menlo, Monaco, monospace`,
  fade: 160,
  draw: 450,
  shimmer: 1600,
  injectStyles: true,
  crosshair: true,
  onOpen: null,
  onClose: null,
};

type Rect = { left: number; top: number; right: number; bottom: number };
type Box = Rect & { width: number; height: number };
type Strip = { L: number; T: number; R: number; B: number };
type Point = { x: number; y: number };

function getOverlayCss(): string {
  return `
svg.sp-overlay {
  position: fixed !important; top: 0 !important; left: 0 !important; right: auto !important; bottom: auto !important;
  width: 100% !important; height: 100% !important; max-width: none !important; max-height: none !important;
  margin: 0 !important; padding: 0 !important; border: 0 !important; background: none !important;
  transform: none !important; filter: none !important; display: block !important; overflow: visible !important;
  pointer-events: none !important; z-index: 2147483646 !important;
  opacity: 0 !important; transition: opacity var(--sp-fade, 160ms) ease !important;
}
svg.sp-overlay.sp-open { opacity: 1 !important; }
.sp-overlay * { transition: none !important; animation: none !important; }
.sp-overlay line, .sp-overlay path, .sp-frame, .sp-content { fill: none; stroke: var(--sp-accent, #0d99ff); stroke-width: 1px; }
.sp-frame { fill: var(--sp-accent, #0d99ff); fill-opacity: 0.12; }
.sp-grid-minor { stroke-opacity: 0.1; }
.sp-grid-major { stroke-opacity: 0.24; }
.sp-ext, .sp-content { stroke-dasharray: 2 2; stroke-opacity: 0.6; }
.sp-hatch-bg { fill: var(--sp-accent, #0d99ff); fill-opacity: 0.06; stroke: none; }
.sp-hatch-line { stroke-opacity: 0.45; }
.sp-dot { fill: var(--sp-accent, #0d99ff); }
.sp-base { stop-color: var(--sp-skeleton, #1c1c1f); }
.sp-shine { stop-color: var(--sp-skeleton-shine, #2e2e33); }
.sp-pill rect { fill: var(--sp-accent, #0d99ff); stroke: none; rx: 3px; }
.sp-overlay text {
  font: 600 11px ${FONT_STACK}, ui-monospace, SFMono-Regular, Menlo, Monaco, monospace !important;
  font-variant-numeric: tabular-nums !important;
  letter-spacing: normal !important; text-transform: none !important; stroke: none;
}
.sp-pill text { fill: #ffffff; text-anchor: middle; dominant-baseline: central; }
.sp-pill.sp-soft rect { fill: var(--sp-label-bg, #121214); }
.sp-pill.sp-soft text { fill: var(--sp-accent, #0d99ff); }
.sp-probe { visibility: hidden; }
html.sp-armed, html.sp-armed * { cursor: crosshair !important; }
`;
}

// ─── Geometry & DOM Helpers ──────────────────────────────────────────────────
const setAttrs = <T extends SVGElement>(n: T, attrs: Record<string, string | number>): T => {
  for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, String(v));
  return n;
};

const addSVG = <K extends keyof SVGElementTagNameMap>(parent: SVGElement, name: K, attrs: Record<string, string | number> = {}): SVGElementTagNameMap[K] => {
  const el = document.createElementNS(NS, name);
  return parent.appendChild(setAttrs(el, attrs)) as SVGElementTagNameMap[K];
};

const rectFrom = (a: Point, b: Point): Rect => ({
  left: Math.min(a.x, b.x), top: Math.min(a.y, b.y),
  right: Math.max(a.x, b.x), bottom: Math.max(a.y, b.y),
});

const overlaps = (a: Rect, b: Rect): boolean => a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
const touches = (a: Rect, b: Rect): boolean => a.left <= b.right && a.right >= b.left && a.top <= b.bottom && a.bottom >= b.top;
const contains = (a: Rect, b: Rect): boolean => a.left <= b.left + 0.5 && a.top <= b.top + 0.5 && a.right >= b.right - 0.5 && a.bottom >= b.bottom - 0.5;
const intersect = (a: Rect | null, b: Rect): Rect => (!a ? b : {
  left: Math.max(a.left, b.left), top: Math.max(a.top, b.top),
  right: Math.min(a.right, b.right), bottom: Math.min(a.bottom, b.bottom),
});
const holds = (r: Rect, x: number, y: number): boolean => x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
const asRect = (s: Strip): Rect => ({ left: s.L, top: s.T, right: s.R, bottom: s.B });
const pixels = (r: Rect): Strip => ({ L: Math.round(r.left), T: Math.round(r.top), R: Math.round(r.right), B: Math.round(r.bottom) });
const filled = (s: CSSStyleDeclaration): boolean => !/^(transparent|rgba\(0,\s*0,\s*0,\s*0\))$/.test(s.backgroundColor);
const bordered = (s: CSSStyleDeclaration): boolean =>
  (["Top", "Right", "Bottom", "Left"] as const).some(k => parseFloat((s as any)[`border${k}Width`]) > 0 && (s as any)[`border${k}Style`] !== "none");

const ownText = (el: Element): boolean => {
  for (const n of Array.from(el.childNodes)) {
    if (n.nodeType === Node.TEXT_NODE && n.nodeValue?.trim()) return true;
  }
  return false;
};

const parentOf = (el: Element): Element | null => el.parentElement || ((el.parentNode as ShadowRoot)?.host as Element) || null;

const distance = (r: DOMRect | Rect, p: Point): number => Math.hypot(
  Math.max(r.left - p.x, 0, p.x - r.right),
  Math.max(r.top - p.y, 0, p.y - r.bottom)
);

function backgroundOf(el: Element): [number, number, number] {
  for (let n: Element | null = el; n && n.nodeType === Node.ELEMENT_NODE; n = parentOf(n)) {
    const v = getComputedStyle(n).backgroundColor;
    const m = /^rgba?\(([^)]+)\)$/.exec(v);
    if (!m) continue;
    const parts = m[1].split(/[\s,/]+/).map(Number);
    const r = parts[0], g = parts[1], b = parts[2], a = parts[3] ?? 1;
    if (a > 0.5) return [r, g, b];
  }
  return [255, 255, 255];
}

const mix = (c: [number, number, number], to: number, k: number): string =>
  `rgb(${c.map(v => Math.round(v + (to - v) * k)).join(" ")})`;

function palette(el: Element, o: PortalOptions): { base: string; label: string; skeleton: string; shine: string } {
  const bg = backgroundOf(el) || [10, 10, 10];
  const dark = (0.299 * bg[0] + 0.587 * bg[1] + 0.114 * bg[2]) / 255 < 0.5;
  const to = dark ? 255 : 0;
  return {
    base: `rgb(${bg.join(" ")})`,
    label: o.labelBackground || `rgb(${bg.join(" ")})`,
    skeleton: o.skeleton || mix(bg, to, dark ? 0.14 : 0.09),
    shine: o.skeletonShine || mix(bg, to, dark ? 0.22 : 0.04),
  };
}

function injectStyles(): void {
  let style = document.getElementById("spec-portal-styles") as HTMLStyleElement | null;
  if (!style) {
    style = document.createElement("style");
    style.id = "spec-portal-styles";
    (document.head || document.documentElement).appendChild(style);
  }
  style.textContent = getOverlayCss();
}

// ─── SpecPortal Engine ───────────────────────────────────────────────────────
let seq = 0;

interface LiveMark {
  frame?: number;
  seen: number | null;
  slot: number;
  nodes: (SVGElement | Element)[];
  hatch?: SVGRectElement;
  g?: SVGGElement;
  lines?: SVGLineElement[];
  pill?: { g: SVGGElement; rect: SVGRectElement; text: SVGTextElement };
  rect?: SVGRectElement;
  arc?: SVGPathElement;
  ray?: SVGLineElement;
  dot?: SVGCircleElement;
}

export function createPortal(fixed: HTMLElement | null, userOptions: PortalOptions = {}) {
  const o = { ...DEFAULTS, ...userOptions };
  const p = `spec-portal-${++seq}`;
  const svg = document.createElementNS(NS, "svg");
  svg.id = "gofully-measure";
  setAttrs(svg, { class: "sp-overlay", "aria-hidden": "true", [MARK]: "" });
  svg.style.setProperty("--sp-accent", o.accent);
  svg.style.setProperty("--sp-font", o.font);
  svg.style.setProperty("--sp-fade", `${o.fade}ms`);

  const defs = addSVG(svg, "defs");
  const hatch = addSVG(defs, "pattern", { id: `${p}-hatch`, width: 6, height: 6, patternUnits: "userSpaceOnUse", patternTransform: "rotate(45)" });
  addSVG(hatch, "rect", { class: "sp-hatch-bg", width: 6, height: 6 });
  addSVG(hatch, "line", { class: "sp-hatch-line", x1: 3, y1: 0, x2: 3, y2: 6 });

  const gridPattern = addSVG(defs, "pattern", { id: `${p}-grid`, patternUnits: "userSpaceOnUse" });
  const gridMinor = addSVG(gridPattern, "path", { class: "sp-grid-minor" });
  const gridMajor = addSVG(gridPattern, "path", { class: "sp-grid-major" });

  const shimmer = addSVG(defs, "linearGradient", { id: `${p}-shimmer`, gradientUnits: "userSpaceOnUse" });
  addSVG(shimmer, "stop", { class: "sp-base", offset: 0 });
  addSVG(shimmer, "stop", { class: "sp-shine", offset: 0.5 });
  addSVG(shimmer, "stop", { class: "sp-base", offset: 1 });

  const lensGroup = addSVG(defs, "clipPath", { id: `${p}-lens` });
  const lens = addSVG(lensGroup, "rect", { width: 0, height: 0 });

  const shapeGroup = addSVG(defs, "clipPath", { id: `${p}-shape` });
  const shape = addSVG(shapeGroup, "rect");

  const under = addSVG(addSVG(svg, "g", { "clip-path": `url(#${p}-lens)` }), "g", { "clip-path": `url(#${p}-shape)` });
  const skeleton = addSVG(under, "g");
  const gridRect = addSVG(under, "rect", { fill: `url(#${p}-grid)` });
  const frame = addSVG(svg, "rect", { class: "sp-frame" });
  const over = addSVG(svg, "g", { "clip-path": `url(#${p}-lens)` });
  const spaces = addSVG(over, "g", { "clip-path": `url(#${p}-shape)` });
  const marks = addSVG(over, "g");
  const sizeLayer = addSVG(svg, "g");
  const probe = addSVG(svg, "text", { class: "sp-probe" });
  const HATCH = `url(#${p}-hatch)`;
  const SHIMMER = `url(#${p}-shimmer)`;

  if (o.injectStyles) injectStyles();
  document.documentElement.appendChild(svg);

  let root: HTMLElement = fixed || (document.body as HTMLElement) || document.documentElement;
  let shownRoot: HTMLElement | null = null;
  let baseFill = "transparent";
  let Z = 1;
  const cssPx = (screenPx: number) => Math.round(screenPx / Z);

  let cache = new Map<Element, { r: DOMRect; s: CSSStyleDeclaration; rad: Record<number, number> }>();
  function info(el: Element): { r: DOMRect; s: CSSStyleDeclaration; rad: Record<number, number> } {
    let i = cache.get(el);
    if (!i) {
      i = { r: el.getBoundingClientRect(), s: getComputedStyle(el), rad: {} };
      cache.set(el, i);
    }
    return i;
  }
  const rectOf = (el: Element): DOMRect => info(el).r;
  const area = (el: Element): number => { const r = rectOf(el); return r.width * r.height; };

  const ids = new WeakMap<Element, number>();
  let idSeq = 0;
  const idOf = (el: Element): number => ids.get(el) ?? (ids.set(el, ++idSeq), idSeq);

  function snapToGrid(r: Rect, c: DOMRect): Rect {
    const s = o.grid * Z;
    if (s <= 1) return r;
    const sx = (v: number) => c.left + Math.round((v - c.left) / s) * s;
    const sy = (v: number) => c.top + Math.round((v - c.top) / s) * s;
    return { left: sx(r.left), top: sy(r.top), right: sx(r.right), bottom: sy(r.bottom) };
  }

  function radiusOf(el: Element, sx: number, sy: number): number {
    const i = info(el), key = sx + 2 * sy;
    if (!(key in i.rad)) {
      const v = (i.s as any)[`border${sy < 0 ? "Top" : "Bottom"}${sx < 0 ? "Left" : "Right"}Radius`] || "0";
      const pxVal = v.endsWith("%") ? (parseFloat(v) / 100) * i.r.width : parseFloat(v) * Z;
      i.rad[key] = Math.min(pxVal || 0, i.r.width / 2, i.r.height / 2);
    }
    return i.rad[key];
  }

  function cornerCentre(el: Element, sx: number, sy: number): [number, number] {
    const r = rectOf(el), rad = radiusOf(el, sx, sy);
    return [(sx < 0 ? r.left : r.right) - sx * rad, (sy < 0 ? r.top : r.bottom) - sy * rad];
  }

  const widths = new Map<string, number>();
  function textWidth(str: string): number {
    if (!widths.has(str)) {
      probe.textContent = str;
      widths.set(str, Math.ceil(probe.getComputedTextLength()) || (str.length * 7 + 4));
    }
    return widths.get(str)!;
  }
  const clearWidths = () => widths.clear();
  if (document.fonts) document.fonts.addEventListener("loadingdone", clearWidths);

  function makePill(parent: SVGElement, soft = false): { g: SVGGElement; rect: SVGRectElement; text: SVGTextElement } {
    const g = addSVG(parent, "g", { class: soft ? "sp-pill sp-soft" : "sp-pill" });
    return { g, rect: addSVG(g, "rect", { rx: 3, height: 16 }), text: addSVG(g, "text") };
  }

  function setPill(pill: { rect: SVGRectElement; text: SVGTextElement }, [cx, cy]: [number, number], w: number, labelText: string): void {
    const x = Math.round(cx - w / 2), y = Math.round(cy - 8);
    setAttrs(pill.rect, { x, y, width: w });
    setAttrs(pill.text, { x: x + w / 2, y: y + 8 });
    if (pill.text.textContent !== labelText) pill.text.textContent = labelText;
  }

  function pickRoot(r: Rect): Element {
    if (fixed) return fixed;
    const x = Math.min(Math.max((r.left + r.right) / 2, 0), window.innerWidth - 1);
    const y = Math.min(Math.max((r.top + r.bottom) / 2, 0), window.innerHeight - 1);
    for (const el of document.elementsFromPoint(x, y)) {
      if (!(el instanceof HTMLElement) || el.closest(`[${MARK}]`)) continue;
      if (contains(el.getBoundingClientRect(), r)) return el;
    }
    return document.body || document.documentElement;
  }

  function collect(lensR: Rect): Element[] {
    const out: Element[] = [];
    const visit = (parent: Element, clip: Rect | null) => {
      for (const el of Array.from(parent.children)) {
        if (out.length >= MAX_ELEMENTS) return;
        const tag = el.localName;
        if (SKIP.has(tag) || el.hasAttribute(MARK)) continue;
        if (!(el instanceof HTMLElement || el instanceof SVGSVGElement)) continue;
        const { r, s } = info(el);
        if (s.display === "none" || +s.opacity < 0.01) continue;
        if (s.display === "contents") {
          visit(el, clip);
          if (el.shadowRoot) visit(el.shadowRoot as unknown as Element, clip);
          continue;
        }
        const zero = r.width < 0.5 || r.height < 0.5;
        if (!zero && (!touches(r, lensR) || (clip && !overlaps(r, clip)))) continue;
        if (!zero && s.visibility === "visible") out.push(el);
        if (REPLACED.has(tag)) continue;
        const inner = s.overflowX !== "visible" || s.overflowY !== "visible" ? intersect(clip, r) : clip;
        visit(el, inner);
        if (el.shadowRoot) visit(el.shadowRoot as unknown as Element, inner);
      }
    };
    const rs = info(root).s;
    const clip = rs.overflowX !== "visible" || rs.overflowY !== "visible" ? rectOf(root) : null;
    visit(root, clip);
    if (root.shadowRoot) visit(root.shadowRoot as unknown as Element, clip);
    return out;
  }

  let visible: Element[] = [];
  let blocks = new Set<Element>();
  let measured: Element[] = [];

  function scan(lensR: Rect): void {
    const auto = !o.selector;
    const els = collect(lensR);
    let isBlock: (el: Element) => boolean;

    if (auto) {
      const outer = new Set<Element>();
      for (const el of els) {
        const { s } = info(el);
        if (REPLACED.has(el.localName) || !(filled(s) || bordered(s))) continue;
        for (let q = parentOf(el); q && !outer.has(q); q = parentOf(q)) {
          outer.add(q);
          if (q === root) break;
        }
      }
      isBlock = el => {
        const { r, s } = info(el);
        if (REPLACED.has(el.localName) || s.backgroundImage.includes("url(")) return true;
        return filled(s) && !outer.has(el) && (r.height / Z <= BLOCK_MAX || !el.textContent?.trim());
      };
    } else {
      isBlock = el => REPLACED.has(el.localName) || (filled(info(el).s) && !el.querySelector(o.selector!));
    }

    blocks = new Set();
    visible = [];
    const hidden = (el: Element): boolean => {
      for (let q = parentOf(el); q && q !== root; q = parentOf(q)) if (blocks.has(q)) return true;
      return false;
    };
    for (const el of els) {
      if (hidden(el)) continue;
      visible.push(el);
      if (isBlock(el)) blocks.add(el);
    }

    measured = visible.filter(auto
      ? el => {
        const { s } = info(el);
        return blocks.has(el) || filled(s) || bordered(s) || s.boxShadow !== "none" || ownText(el);
      }
      : el => el.matches(o.selector!));
  }

  function buildGrid(): void {
    const s = o.grid * Z, tile = 4 * s;
    let minor = "";
    for (let i = 1; i < 4; i++) minor += `M${i * s + 0.5} 0V${tile}M0 ${i * s + 0.5}H${tile}`;
    setAttrs(gridPattern, { width: tile, height: tile });
    setAttrs(gridMinor, { d: minor });
    setAttrs(gridMajor, { d: `M0.5 0V${tile}M0 0.5H${tile}` });
  }

  const range = document.createRange();

  function renderSkeleton(now: number, c: DOMRect): void {
    setAttrs(shape, { x: c.left, y: c.top, width: c.width, height: c.height, rx: radiusOf(root, -1, -1) });
    setAttrs(gridPattern, { x: Math.round(c.left), y: Math.round(c.top) });
    setAttrs(gridRect, { x: c.left, y: c.top, width: c.width, height: c.height });

    const phase = o.shimmer > 0 ? (now % o.shimmer) / o.shimmer : 0.5;
    const band = 120 * Z, x = c.left - band + (c.width + 2 * band) * phase;
    setAttrs(shimmer, { x1: x - band, y1: 0, x2: x + band, y2: 0 });

    skeleton.replaceChildren();
    addSVG(skeleton, "rect", { x: c.left, y: c.top, width: c.width, height: c.height, fill: baseFill });

    const bars: Record<string, string | number>[] = [];
    const textNode = (el: Element, s: CSSStyleDeclaration) => {
      const opacity = +s.opacity;
      const h = Math.max(2, Math.round(parseFloat(s.fontSize) * TEXT_BAR * Z));
      for (const node of Array.from(el.childNodes)) {
        if (node.nodeType !== Node.TEXT_NODE || !node.nodeValue?.trim()) continue;
        range.selectNodeContents(node);
        for (const line of Array.from(range.getClientRects())) {
          if (line.width < 1) continue;
          bars.push({
            fill: SHIMMER, opacity, x: line.left, y: (line.top + line.bottom - h) / 2,
            width: line.width, height: h, rx: Math.min(h / 2, 4 * Z),
          });
        }
      }
    };

    textNode(root, info(root).s);
    for (const el of visible) {
      const { r, s } = info(el);
      const rx = radiusOf(el, -1, -1);
      if (blocks.has(el)) {
        addSVG(skeleton, "rect", { fill: SHIMMER, x: r.left, y: r.top, width: r.width, height: r.height, rx });
        continue;
      }
      if (filled(s)) addSVG(skeleton, "rect", { x: r.left, y: r.top, width: r.width, height: r.height, rx, fill: s.backgroundColor });
      for (const [side, dx, dy] of [["Top", 0, -1], ["Bottom", 0, 1], ["Left", -1, 0], ["Right", 1, 0]] as const) {
        const bw = parseFloat((s as any)[`border${side}Width`]) * Z;
        if (!bw || (s as any)[`border${side}Style`] === "none") continue;
        const L = dx > 0 ? r.right - bw : r.left, T = dy > 0 ? r.bottom - bw : r.top;
        addSVG(skeleton, "rect", { x: L, y: T, width: dx ? bw : r.width, height: dy ? bw : r.height, fill: (s as any)[`border${side}Color`] });
      }
      textNode(el, s);
    }
    for (const bar of bars) addSVG(skeleton, "rect", bar);
  }

  const live = new Map<string, LiveMark>();
  let frameNo = 0;
  let lensRect: Rect | null = null;
  let placed: Rect[] = [];
  let obstacles: { el: Element; rect: DOMRect }[] = [];

  function mark(key: string, build: (m: LiveMark) => void): LiveMark {
    let m = live.get(key);
    if (!m) {
      m = { seen: null, slot: 0, nodes: [] };
      build(m);
      live.set(key, m);
    }
    m.frame = frameNo;
    return m;
  }

  function progress(m: LiveMark, rect: Rect, now: number, delay: number): number {
    if (m.seen == null && lensRect && touches(rect, lensRect)) m.seen = now;
    if (m.seen == null) return 0;
    if (o.draw <= 0) return 1;
    const k = Math.min(1, Math.max(0, (now - m.seen - delay) / o.draw));
    return 1 - (1 - k) ** 3;
  }

  function place(m: LiveMark, w: number, h: number, spots: [number, number][], owner: Element): [number, number] {
    const box = ([x, y]: [number, number]): Rect => ({ left: x - w / 2 - 1, top: y - h / 2 - 1, right: x + w / 2 + 1, bottom: y + h / 2 + 1 });
    const blocked = [...placed, ...obstacles.filter(ob => !ob.el.contains(owner)).map(ob => ob.rect)];
    const free = (i: number) => !blocked.some(b => overlaps(box(spots[i]), b));
    let i = m.slot < spots.length && free(m.slot) ? m.slot : spots.findIndex((_, j) => free(j));
    if (i < 0) i = 0;
    m.slot = i;
    placed.push(box(spots[i]));
    return spots[i];
  }

  function flowGaps(el: Element, specs: any[]): void {
    const kids = Array.from(el.children).filter(k => {
      if (SKIP.has(k.localName) || k.hasAttribute(MARK)) return false;
      const s = info(k).s;
      return s.display !== "none" && s.position !== "absolute" && s.position !== "fixed";
    });
    if (kids.length < 2) return;
    const s = info(el).s;
    if (/space-|evenly/.test(s.justifyContent)) return;
    const row = s.display.includes("flex") && s.flexDirection.startsWith("row");
    const b0 = rectOf(el), pad = (k: string) => parseFloat((s as any)["padding" + k]) * Z;
    const items = kids.map(rectOf);
    for (let n = 1; n < items.length; n++) {
      const a = items[n - 1], b = items[n];
      const d = row ? b.left - a.right : b.top - a.bottom;
      if (d < 0.5) continue;
      const strip: Strip = row
        ? { L: a.right, T: b0.top + pad("Top"), R: b.left, B: b0.bottom - pad("Bottom") }
        : { L: b0.left + pad("Left"), T: a.bottom, R: b0.right - pad("Right"), B: b.top };
      specs.push({ type: "space", key: `gap:${idOf(el)}:${n}`, axis: row ? "x" : "y", out: [0, 0], owner: el, value: cssPx(d), ...strip });
    }
  }

  function paddings(el: Element, specs: any[]): void {
    const s = info(el).s;
    const [t, r, b, l] = ["Top", "Right", "Bottom", "Left"].map(k => parseFloat((s as any)["padding" + k]) * Z);
    if (!(t || r || b || l)) return;
    const b0 = rectOf(el), i = { L: b0.left + l, T: b0.top + t, R: b0.right - r, B: b0.bottom - b };
    const side = (name: string, v: number, axis: "x" | "y", out: [number, number], strip: Strip) => {
      if (v > 0) specs.push({ type: "space", key: `pad:${idOf(el)}:${name}`, axis, out, owner: el, value: cssPx(v), ...strip });
    };
    side("top", t, "y", [0, -1], { L: b0.left, T: b0.top, R: b0.right, B: i.T });
    side("bottom", b, "y", [0, 1], { L: b0.left, T: i.B, R: b0.right, B: b0.bottom });
    side("left", l, "x", [-1, 0], { L: b0.left, T: i.T, R: i.L, B: i.B });
    side("right", r, "x", [1, 0], { L: i.R, T: i.T, R: b0.right, B: i.B });
    specs.push({ type: "content", key: `content:${idOf(el)}`, ...i });
  }

  function radiusSpec(el: Element, rounded: Element[], specs: any[]): void {
    const r = rectOf(el);
    const corners = CORNERS.map(([sx, sy]) => {
      const rad = radiusOf(el, sx, sy);
      if (rad < 1 || rad >= Math.min(r.width, r.height) / 2 - 0.5) return null;
      const [cx, cy] = cornerCentre(el, sx, sy);
      const shares = (x: Element) => {
        if (x === el || radiusOf(x, sx, sy) < 1) return false;
        const [ox, oy] = cornerCentre(x, sx, sy);
        return Math.hypot(ox - cx, oy - cy) < 1;
      };
      if (obstacles.some(ob => ob.el !== el && holds(ob.rect, cx, cy) && !shares(ob.el))) return null;
      return { sx, sy, rad, cx, cy, paired: rounded.some(shares) };
    }).filter(Boolean) as any[];
    const k = corners.find(c => c.paired) || corners[0];
    if (!k) return;
    const pxVal = k.sx < 0 ? r.left : r.right, pyVal = k.sy < 0 ? r.top : r.bottom;
    specs.push({ type: "radius", key: `radius:${idOf(el)}`, el, px: pxVal, py: pyVal, ...k });
  }

  function spaceSpots({ L, T, R, B, out }: Strip & { out: [number, number] }, w: number, h: number): [number, number][] {
    const wide = R - L >= B - T, cx = (L + R) / 2, cy = (T + B) / 2;
    const across = wide ? B - T : R - L, need = wide ? h : w;
    const shift = need <= across ? 0 : need / 2 + across / 2 + 2;
    const spots: [number, number][] = [0.5, 0.25, 0.75].map(f => (wide
      ? [L + (R - L) * f + out[0] * shift, cy + out[1] * shift]
      : [cx + out[0] * shift, T + (B - T) * f + out[1] * shift]) as [number, number]);
    if (shift && !out[0] && !out[1]) {
      spots.push(...(wide ? [[R + w / 2 + 2, cy], [L - w / 2 - 2, cy]] as [number, number][] : [[cx, B + h / 2 + 2], [cx, T - h / 2 - 2]] as [number, number][]));
    }
    return spots;
  }

  function renderSpace(s: any, now: number): void {
    const m = mark(s.key, item => {
      item.hatch = addSVG(spaces, "rect", { fill: HATCH });
      item.g = addSVG(marks, "g");
      item.lines = [addSVG(item.g, "line"), addSVG(item.g, "line"), addSVG(item.g, "line")];
      item.pill = makePill(item.g, true);
      item.nodes = [item.hatch, item.g];
    });
    const pr = progress(m, asRect(s), now, 0);
    const x = s.axis === "x", cx = (s.L + s.R) / 2, cy = (s.T + s.B) / 2;

    const hw = ((s.R - s.L) / 2) * (x ? pr : 1), hh = ((s.B - s.T) / 2) * (x ? 1 : pr);
    setAttrs(m.hatch!, { x: cx - hw, y: cy - hh, width: 2 * hw, height: 2 * hh });

    const t = TICK / 2, c0 = Math.round(x ? cy : cx) + 0.5;
    const lo = (x ? s.L : s.T) + 0.5, hi = (x ? s.R : s.B) - 0.5, mid = (lo + hi) / 2;
    const a = mid - (mid - lo) * pr, b = mid + (hi - mid) * pr;
    const seg = (n: SVGLineElement, p1: number, q1: number, p2: number, q2: number) =>
      setAttrs(n, x ? { x1: p1, y1: q1, x2: p2, y2: q2 } : { x1: q1, y1: p1, x2: q2, y2: p2 });
    seg(m.lines![0], a, c0, b, c0);
    seg(m.lines![1], a, c0 - t, a, c0 + t);
    seg(m.lines![2], b, c0 - t, b, c0 + t);

    const w = textWidth(String(s.value)) + 8;
    setPill(m.pill!, place(m, w, 16, spaceSpots(s, w, 16), s.owner), w, String(Math.round(s.value * pr)));
    m.hatch!.style.visibility = m.g!.style.visibility = pr > 0 ? "" : "hidden";
  }

  function renderContent(s: any, now: number): void {
    const m = mark(s.key, item => {
      item.rect = addSVG(spaces, "rect", { class: "sp-content" });
      item.nodes = [item.rect];
    });
    const px = pixels(asRect(s));
    setAttrs(m.rect!, { x: px.L + 0.5, y: px.T + 0.5, width: Math.max(0, px.R - px.L - 1), height: Math.max(0, px.B - px.T - 1) });
    m.rect!.style.opacity = String(progress(m, asRect(s), now, 0));
  }

  function renderSize(s: any, now: number, c: DOMRect): void {
    const m = mark(s.key, item => {
      item.g = addSVG(marks, "g");
      item.pill = makePill(item.g);
      item.nodes = [item.g];
    });
    const r = rectOf(s.el);
    const pr = progress(m, r, now, 80);
    const W = cssPx(r.width), H = cssPx(r.height), w = textWidth(`${W} × ${H}`) + 8, h = 16;
    const cx = (r.left + r.right) / 2, cy = (r.top + r.bottom) / 2;
    const roomy = r.width >= w * 3 && r.height >= h * 3;
    const spots: [number, number][] = (s.el === root ? [[cx, r.bottom + 8 + h / 2]] : [
      roomy && [cx, cy],
      r.right + 6 + w <= c.right - 4 && [r.right + 6 + w / 2, cy],
      [cx, r.bottom + 4 + h / 2],
      [cx, r.top - 4 - h / 2],
      [cx, cy],
    ]).filter(Boolean) as [number, number][];
    setPill(m.pill!, place(m, w, h, spots, s.el), w, `${Math.round(W * pr)} × ${Math.round(H * pr)}`);
    m.g!.style.visibility = pr > 0 ? "" : "hidden";
    m.g!.style.opacity = String(Math.min(1, pr * 4));
  }

  function renderRadius(s: any, now: number): void {
    const m = mark(s.key, item => {
      item.g = addSVG(marks, "g");
      item.arc = addSVG(item.g, "path", { pathLength: 1, "stroke-dasharray": 1 });
      item.ray = addSVG(item.g, "line", { class: "sp-ext" });
      item.dot = addSVG(item.g, "circle", { class: "sp-dot" });
      item.pill = makePill(item.g);
      item.nodes = [item.g];
    });
    const { sx, sy, cx, cy, px, py, rad } = s, k = Math.SQRT1_2;
    const box = { left: Math.min(px, cx), top: Math.min(py, cy), right: Math.max(px, cx), bottom: Math.max(py, cy) };
    const pr = progress(m, box, now, 140);
    setAttrs(m.arc!, { d: `M${cx} ${py}A${rad} ${rad} 0 0 ${sx * sy < 0 ? 1 : 0} ${px} ${cy}`, "stroke-dashoffset": 1 - pr });
    setAttrs(m.ray!, { x1: cx, y1: cy, x2: cx + sx * rad * k * pr, y2: cy + sy * rad * k * pr });
    setAttrs(m.dot!, { cx, cy, r: 1.5 * Math.min(1, pr * 4) });
    const R = cssPx(rad), w = textWidth(`r ${R}`) + 8, h = 16;
    const spots: [number, number][] = [
      [cx - sx * (w / 2 + 4), cy - sy * (h / 2 + 4)],
      [px + sx * (w / 2 + 4), py + sy * (h / 2 + 4)],
      [px + sx * (w / 2 + 4), py + sy * (h * 1.5 + 8)],
      [px + sx * (w * 1.5 + 8), py + sy * (h / 2 + 4)],
    ];
    setPill(m.pill!, place(m, w, h, spots, s.el), w, `r ${Math.round(R * pr)}`);
    m.g!.style.visibility = pr > 0 ? "" : "hidden";
  }

  const RENDER: Record<string, (s: any, now: number, c: DOMRect) => void> = {
    space: renderSpace,
    content: renderContent,
    size: renderSize,
    radius: renderRadius,
  };

  function renderMeasures(now: number, c: DOMRect): void {
    frameNo++;
    placed = [];
    obstacles = measured.map(el => ({ el, rect: rectOf(el) }));
    const boxes = [root, ...visible];
    const page = !fixed && (root === document.body || root === document.documentElement);

    const specs: any[] = [];
    boxes.forEach(el => flowGaps(el, specs));
    boxes.forEach(el => paddings(el, specs));
    measured.filter(el => blocks.has(el)).forEach(el => specs.push({ type: "size", key: `size:${idOf(el)}`, el }));
    if (!page) specs.push({ type: "size", key: `size:${idOf(root)}`, el: root });
    const all = [root, ...measured];
    const rounded = all.filter(el => CORNERS.some(([sx, sy]) => radiusOf(el, sx, sy) >= 1));
    rounded.sort((a, b) => area(a) - area(b)).forEach(el => radiusSpec(el, rounded, specs));

    for (const s of specs) RENDER[s.type]?.(s, now, c);
    for (const [key, m] of Array.from(live.entries())) {
      if (m.frame === frameNo) continue;
      m.nodes.forEach(n => n.remove());
      live.delete(key);
    }
  }

  const sizePill = makePill(sizeLayer);
  sizePill.g.classList.add("sp-frame-size");

  function paint(r: Rect): void {
    const px = pixels(r);
    setAttrs(frame, { x: px.L + 0.5, y: px.T + 0.5, width: Math.max(0, px.R - px.L - 1), height: Math.max(0, px.B - px.T - 1) });
    setAttrs(lens, { x: px.L + 1, y: px.T + 1, width: Math.max(0, px.R - px.L - 2), height: Math.max(0, px.B - px.T - 2) });
    const labelText = `${cssPx(r.right - r.left)} × ${cssPx(r.bottom - r.top)}`;
    setPill(sizePill, [(px.L + px.R) / 2, px.B + 16], textWidth(labelText) + 8, labelText);
  }

  let startPoint: Point | null = null;
  let currentPoint: Point | null = null;
  let open = false;
  let closedAt = -Infinity;
  let raf = 0;
  let isFrozen = false;

  function loop(now: number): void {
    raf = 0;
    if (!open && now - closedAt > o.fade + 50) {
      for (const m of live.values()) m.seen = null;
      return;
    }
    raf = requestAnimationFrame(loop);
    cache = new Map();

    if (open && startPoint && currentPoint) root = pickRoot(rectFrom(startPoint, currentPoint)) as HTMLElement;
    if (!root || !root.isConnected) return;

    const c = rectOf(root);
    const z = root.offsetWidth ? c.width / root.offsetWidth : 1;
    if (Math.abs(z - Z) > 1e-3) { Z = z; buildGrid(); }
    if (root !== shownRoot) {
      shownRoot = root;
      const tones = palette(root, o);
      baseFill = tones.base;
      svg.style.setProperty("--sp-label-bg", tones.label);
      svg.style.setProperty("--sp-skeleton", tones.skeleton);
      svg.style.setProperty("--sp-skeleton-shine", tones.shine);
    }

    if (open && startPoint && currentPoint) lensRect = snapToGrid(rectFrom(startPoint, currentPoint), c);
    if (!lensRect) return;
    paint(lensRect);
    scan(lensRect);
    renderSkeleton(now, c);
    renderMeasures(now, c);
  }

  buildGrid();

  return {
    target: fixed,
    options: o,
    isOpen: () => open,
    isFrozen: () => isFrozen,
    setGrid: (val: number) => { o.grid = val; buildGrid(); },
    setModifier: (mod: PortalOptions["modifier"]) => { o.modifier = mod ?? null; },
    begin(point: Point) {
      isFrozen = false;
      startPoint = currentPoint = point;
    },
    move(point: Point) {
      isFrozen = false;
      currentPoint = point;
      if (!open) {
        open = true;
        svg.classList.add("sp-open");
        if (typeof o.onOpen === "function") o.onOpen();
      }
      if (!raf) raf = requestAnimationFrame(loop);
    },
    freeze() {
      // Keep measured specs on screen after drag ends
      if (open) {
        isFrozen = true;
      }
    },
    frameTo(box: Rect) {
      isFrozen = true;
      startPoint = { x: box.left, y: box.top };
      currentPoint = { x: box.right, y: box.bottom };
      if (!open) {
        open = true;
        svg.classList.add("sp-open");
        if (typeof o.onOpen === "function") o.onOpen();
      }
      if (!raf) raf = requestAnimationFrame(loop);
    },
    close(force = false) {
      if (isFrozen && !force) return;
      const was = open;
      if (open) closedAt = performance.now();
      startPoint = null;
      open = false;
      isFrozen = false;
      svg.classList.remove("sp-open");
      if (was && typeof o.onClose === "function") o.onClose();
    },
    destroy() {
      cancelAnimationFrame(raf);
      if (document.fonts) document.fonts.removeEventListener("loadingdone", clearWidths);
      svg.remove();
    },
  };
}

// ─── Input Management & Overlay Lifecycle ────────────────────────────────────
let activePortal: ReturnType<typeof createPortal> | null = null;
let activeDragging: ReturnType<typeof createPortal> | null = null;
let pendingPoint: { portal: ReturnType<typeof createPortal>; point: Point } | null = null;
let savedSelect: [string, string, string][] | null = null;
let armed = false;

// Toolbar and UI references
let barHost: HTMLDivElement | null = null;
let hintEl: HTMLDivElement | null = null;
let hintPos: Point | null = null;
let hintRaf = 0;
let isDragging = false;
let isInsideWindow = true;
let isOverlayActive = false;

const colours: string[] = [];
let swatchesContainer: HTMLDivElement | null = null;
let hintTextEl: HTMLSpanElement | null = null;

function setArmed(on: boolean): void {
  if (on === armed) return;
  armed = on;
  document.documentElement.classList.toggle("sp-armed", on);
}

const isTyping = (): boolean => {
  const a = document.activeElement;
  return !!a && (a instanceof HTMLElement && (a.isContentEditable || /^(input|textarea|select)$/i.test(a.localName)));
};

function syncArmed(e: KeyboardEvent | PointerEvent | MouseEvent): void {
  if (!activePortal) return;
  const dragging = activePortal.isOpen();
  const mod = activePortal.options.modifier;
  const held = !isTyping() && (!mod || !!(e as any)[`${mod}Key`]);
  setArmed(dragging || held);
}

function freezeSelection(): void {
  const sel = typeof getSelection === "function" && getSelection();
  if (sel) sel.removeAllRanges();
  const st = document.documentElement.style;
  savedSelect = ["user-select", "-webkit-user-select"].map(p => [p, st.getPropertyValue(p), st.getPropertyPriority(p)]);
  st.setProperty("user-select", "none", "important");
  st.setProperty("-webkit-user-select", "none", "important");
}

function thawSelection(): void {
  if (!savedSelect) return;
  const st = document.documentElement.style;
  for (const [p, v, prio] of savedSelect) {
    if (v) st.setProperty(p, v, prio); else st.removeProperty(p);
  }
  savedSelect = null;
}

function swallowClick(): void {
  const stopHandler = (e: MouseEvent) => {
    e.preventDefault();
    e.stopImmediatePropagation();
  };
  window.addEventListener("click", stopHandler, true);
  setTimeout(() => window.removeEventListener("click", stopHandler, true), 60);
}

function accepts(portal: ReturnType<typeof createPortal>, e: PointerEvent | MouseEvent): boolean {
  const key = portal.options.modifier;
  if (key && (e as any)[`${key}Key`]) return true;
  // If modifier is not pressed, allow free dragging if not starting on an interactive element
  const t = e.target as Element;
  return !(t && t.closest && t.closest(INTERACTIVE));
}

let lastDownTime = 0;

function onDown(e: PointerEvent | MouseEvent): void {
  if (e.button !== 0) return;
  if ("isPrimary" in e && (e as PointerEvent).isPrimary === false) return;
  if (Date.now() - lastDownTime < 30 && e.type === "mousedown") return;
  lastDownTime = Date.now();

  const path = e.composedPath ? e.composedPath() : [];
  if (barHost && path.includes(barHost)) return;

  const point = { x: e.clientX, y: e.clientY };
  if (!activePortal) return;

  if (accepts(activePortal, e)) {
    pendingPoint = { portal: activePortal, point };
  }
}

function onMove(e: PointerEvent | MouseEvent): void {
  if ("isPrimary" in e && (e as PointerEvent).isPrimary === false) return;
  syncArmed(e);

  hintPos = { x: e.clientX, y: e.clientY };
  isInsideWindow = true;
  if (!hintRaf) hintRaf = requestAnimationFrame(placeHint);

  if (pendingPoint) {
    if (Math.hypot(e.clientX - pendingPoint.point.x, e.clientY - pendingPoint.point.y) < 4) return;
    const { portal, point } = pendingPoint;
    pendingPoint = null;
    freezeSelection();
    activeDragging = portal;
    activeDragging.begin(point);
    isDragging = true;
    updateToolbarHint("Measuring live specs: dimensions, gaps, radii and grid");
    hintDragging(true);
  }

  if (!activeDragging) return;
  if (e.buttons === 0) { endDrag(e); return; }

  e.preventDefault();
  e.stopPropagation();
  activeDragging.move({ x: e.clientX, y: e.clientY });
}

function endDrag(e?: PointerEvent | MouseEvent): void {
  thawSelection();

  if (pendingPoint) {
    // User clicked an element without moving: wrap and measure that element!
    const { portal, point } = pendingPoint;
    pendingPoint = null;
    const el = document.elementFromPoint(point.x, point.y);
    if (el && el !== document.documentElement && el !== document.body && !el.closest("#gofully-measure-bar") && !el.closest("svg.sp-overlay")) {
      const r = el.getBoundingClientRect();
      portal.frameTo({ left: r.left, top: r.top, right: r.right, bottom: r.bottom });
      swallowClick();
      updateToolbarHint("Element specs measured. Drag to measure any UI or Esc to finish");
      hintDragging(false);
      return;
    }
  }

  if (activeDragging) {
    if (activeDragging.isOpen()) {
      activeDragging.freeze();
      swallowClick();
      updateToolbarHint("Specs measured. Drag again over any UI or press Esc to finish");
    }
    activeDragging = null;
  }

  isDragging = false;
  hintDragging(false);
  if (e && "shiftKey" in e) syncArmed(e); else setArmed(false);
}

function onKeyDown(e: KeyboardEvent): void {
  syncArmed(e);
  if (e.key === "Escape") {
    e.preventDefault();
    e.stopPropagation();
    stop();
    return;
  }
  if (isTyping() || e.metaKey || e.ctrlKey || e.altKey) return;

  if (e.key.toLowerCase() === "c") {
    e.preventDefault();
    void pickColour();
  }
}

function onKeyUp(e: KeyboardEvent): void {
  syncArmed(e);
}

const blockEvent = (e: Event): void => {
  if (activePortal?.isOpen() || pendingPoint) e.preventDefault();
};

function placeHint(): void {
  hintRaf = 0;
  if (!hintEl || !hintPos) return;
  const w = hintEl.offsetWidth || 110;
  const h = hintEl.offsetHeight || 30;
  let x = hintPos.x + 16;
  let y = hintPos.y + 16;
  if (x + w > window.innerWidth - 6) x = hintPos.x - 16 - w;
  if (y + h > window.innerHeight - 6) y = hintPos.y - 16 - h;
  hintEl.style.transform = `translate3d(${Math.round(x)}px, ${Math.round(y)}px, 0)`;
  hintEl.style.opacity = isDragging || !isInsideWindow ? "0" : "1";
}

function hintDragging(on: boolean): void {
  isDragging = on;
  if (hintEl) hintEl.style.opacity = on || !isInsideWindow || !hintPos ? "0" : "1";
}

function updateToolbarHint(text: string): void {
  if (hintTextEl) hintTextEl.textContent = text;
}

// ─── Color Picker ────────────────────────────────────────────────────────────
function toHex(c: string): string | null {
  const m = c.match(/\d+(\.\d+)?/g);
  if (!m || m.length < 3) return /^#[0-9a-f]{6}$/i.test(c) ? c.toLowerCase() : null;
  return "#" + m.slice(0, 3).map((v) => Math.round(Number(v)).toString(16).padStart(2, "0")).join("");
}

function formats(hex: string): { hex: string; rgb: string } {
  const n = parseInt(hex.slice(1), 16);
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  return { hex, rgb: `rgb(${r}, ${g}, ${b})` };
}

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

async function pickColour(): Promise<void> {
  let hex: string | null = null;
  if (typeof window.EyeDropper === "function") {
    try {
      const res = await new window.EyeDropper().open();
      hex = toHex(String(res?.sRGBHex || ""));
    } catch {
      return;
    }
  } else if (hintPos) {
    const el = document.elementFromPoint(hintPos.x, hintPos.y);
    if (el) {
      const cs = getComputedStyle(el);
      const bg = cs.backgroundColor;
      hex = toHex(bg && !/rgba?\(\s*0\s*,\s*0\s*,\s*0\s*,\s*0\s*\)|transparent/.test(bg) ? bg : cs.color);
    }
  }
  if (!hex) return;
  const i = colours.indexOf(hex);
  if (i >= 0) colours.splice(i, 1);
  colours.unshift(hex);
  if (colours.length > 5) colours.length = 5;
  await copyText(hex);
  renderSwatches(hex);
}

function renderSwatches(justPicked?: string): void {
  if (!swatchesContainer) return;
  swatchesContainer.replaceChildren();
  for (const hex of colours) {
    const f = formats(hex);
    const b = document.createElement("button");
    b.type = "button";
    b.className = "sw";
    b.title = `${f.hex} · ${f.rgb} (click to copy hex, Shift-click for rgb)`;
    const chip = document.createElement("span");
    chip.className = "chip";
    chip.style.background = hex;
    const txt = document.createElement("span");
    txt.textContent = hex === justPicked ? "Copied" : hex;
    b.append(chip, txt);
    b.addEventListener("click", async (e) => {
      e.stopPropagation();
      const val = e.shiftKey ? f.rgb : f.hex;
      await copyText(val);
      txt.textContent = "Copied";
      setTimeout(() => { txt.textContent = hex; }, 1400);
    });
    swatchesContainer.append(b);
  }
}

// ─── GoFully Design System Toolbar ───────────────────────────────────────────
function buildToolbar(): HTMLDivElement {
  const host = document.createElement("div");
  host.id = "gofully-measure-bar";
  host.style.cssText = "all:initial; position:fixed; inset:auto 0 0 0; height:0; z-index:2147483647; pointer-events:auto;";
  const root = host.attachShadow({ mode: "open" });

  const style = document.createElement("style");
  style.textContent = SQUIRCLE_CSS + `
    @font-face {
      font-family: 'GoFully Inter';
      src: url('${chrome.runtime.getURL("assets/inter-latin-wght-normal.woff2")}') format('woff2');
      font-weight: 100 900;
      font-display: swap;
    }
    * { box-sizing: border-box; }
    .bar {
      position: fixed; left: 50%; bottom: 16px; transform: translateX(-50%);
      display: flex; align-items: center; gap: 8px; max-width: calc(100vw - 32px);
      padding: 6px; border-radius: 999px;
      background: ${T.surface}; color: ${T.text};
      border: 1px solid ${T.border}; box-shadow: ${T.shadowLg};
      font: 400 13px/20px ${FONT_STACK}; pointer-events: auto;
      -webkit-font-smoothing: antialiased;
      user-select: none;
    }
    .ico { display: inline-flex; color: ${T.focus}; padding-left: 8px; }
    .hint { color: ${T.textMuted}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; min-width: 0; max-width: 380px; }
    button {
      font: 500 12px/1 ${FONT_STACK}; height: 30px; padding: 0 12px;
      border-radius: 999px; cursor: pointer; display: inline-flex; align-items: center; gap: 6px;
      border: 1px solid ${T.borderStrong}; background: ${T.surface}; color: ${T.text};
      white-space: nowrap; outline: none; transition: background 120ms ease;
    }
    button:hover { background: ${T.surfaceAlt}; }
    button:focus-visible { outline: none; box-shadow: 0 0 0 3px ${T.focus}; }
    button.prim { background: ${T.accent}; border-color: ${T.accent}; color: ${T.onAccent}; font-weight: 600; }
    kbd { font: 500 10px/14px ${FONT_STACK}; padding: 0 5px; border-radius: 4px; background: ${T.surfaceSunken}; color: ${T.textMuted}; }
    .sws { display: flex; gap: 4px; }
    .sw { padding: 0 10px 0 4px; gap: 6px; font-variant-numeric: tabular-nums; }
    .chip { width: 20px; height: 20px; border-radius: 50%; box-shadow: inset 0 0 0 1px ${alpha(T.text, 0.15)}; }
  `;

  const bar = document.createElement("div");
  bar.className = "bar";
  bar.setAttribute("role", "toolbar");
  bar.setAttribute("aria-label", "Measure");

  const ico = document.createElement("span");
  ico.className = "ico";
  ico.innerHTML = icon("ruler", 16);

  hintTextEl = document.createElement("span");
  hintTextEl.className = "hint";
  hintTextEl.textContent = "Hold ⇧ Shift and drag over any UI to measure";

  const colorBtn = document.createElement("button");
  colorBtn.type = "button";
  colorBtn.innerHTML = `${icon("color-picker", 14)} <span>Pick color</span> <kbd>C</kbd>`;
  colorBtn.title = "Pick color from screen (C)";
  colorBtn.addEventListener("click", () => void pickColour());

  swatchesContainer = document.createElement("div");
  swatchesContainer.className = "sws";

  const doneBtn = document.createElement("button");
  doneBtn.type = "button";
  doneBtn.className = "prim";
  doneBtn.textContent = "Done";
  doneBtn.title = "Finish measure mode (Esc)";
  doneBtn.addEventListener("click", stop);

  bar.append(ico, hintTextEl, colorBtn, swatchesContainer, doneBtn);
  root.append(style, bar);

  return host;
}

function buildCursorHint(): HTMLDivElement {
  const el = document.createElement("div");
  el.className = "gf-cursor-hint";
  el.style.cssText = `
    position: fixed; left: 0; top: 0; display: flex; align-items: center; gap: 6px;
    height: 30px; padding: 4px 10px 4px 6px; border-radius: 999px;
    background: ${T.text}; color: ${T.surface};
    font: 500 12px/1 ${FONT_STACK};
    box-shadow: ${T.shadowLg};
    pointer-events: none; z-index: 2147483647;
    opacity: 0; transition: opacity 140ms ease;
    transform: translate3d(-9999px, -9999px, 0);
    white-space: nowrap; user-select: none;
  `;
  el.setAttribute("aria-hidden", "true");
  el.innerHTML = `<span style="display:inline-flex;align-items:center;height:20px;padding:0 6px;border-radius:999px;background:${alpha(T.surface, 0.2)};color:${T.surface};font:600 10px ${FONT_STACK};">⇧ Shift</span><span>+ drag</span>`;
  return el;
}

// ─── Lifecycle ───────────────────────────────────────────────────────────────
export async function start(): Promise<void> {
  if (isOverlayActive) return;
  isOverlayActive = true;
  await applyOverlayTheme();
  injectOverlayFont();

  activePortal = createPortal(null, {
    selector: null,
    grid: 4,
    modifier: "shift",
    accent: "#0d99ff",
    font: `${FONT_STACK}, ui-monospace, SFMono-Regular, Menlo, Monaco, monospace`,
    fade: 160,
    draw: 450,
    shimmer: 1600,
    injectStyles: true,
    crosshair: true,
    onOpen: () => hintDragging(true),
    onClose: () => hintDragging(false),
  });

  barHost = buildToolbar();
  hintEl = buildCursorHint();
  document.documentElement.append(barHost, hintEl);

  window.addEventListener("pointerdown", onDown, true);
  window.addEventListener("pointermove", onMove, true);
  window.addEventListener("pointerup", endDrag, true);
  window.addEventListener("pointercancel", endDrag, true);
  window.addEventListener("mousedown", onDown, true);
  window.addEventListener("mousemove", onMove, true);
  window.addEventListener("mouseup", endDrag, true);
  window.addEventListener("keydown", onKeyDown, true);
  window.addEventListener("keyup", onKeyUp, true);
  window.addEventListener("blur", () => endDrag());
  window.addEventListener("selectstart", blockEvent, true);
  window.addEventListener("dragstart", blockEvent, true);

  document.documentElement.addEventListener("mouseleave", () => {
    isInsideWindow = false;
    if (hintEl) hintEl.style.opacity = "0";
  });
  document.documentElement.addEventListener("mouseenter", () => {
    isInsideWindow = true;
  });
}

export function stop(): void {
  if (!isOverlayActive) return;
  isOverlayActive = false;

  window.removeEventListener("pointerdown", onDown, true);
  window.removeEventListener("pointermove", onMove, true);
  window.removeEventListener("pointerup", endDrag, true);
  window.removeEventListener("pointercancel", endDrag, true);
  window.removeEventListener("mousedown", onDown, true);
  window.removeEventListener("mousemove", onMove, true);
  window.removeEventListener("mouseup", endDrag, true);
  window.removeEventListener("keydown", onKeyDown, true);
  window.removeEventListener("keyup", onKeyUp, true);
  window.removeEventListener("selectstart", blockEvent, true);
  window.removeEventListener("dragstart", blockEvent, true);

  setArmed(false);
  thawSelection();

  if (activePortal) {
    activePortal.destroy();
    activePortal = null;
  }
  barHost?.remove();
  hintEl?.remove();
  barHost = hintEl = hintTextEl = swatchesContainer = null;
  pendingPoint = null;
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
