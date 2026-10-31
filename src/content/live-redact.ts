/**
 * Redact page: hide private details on the live page before capturing it.
 * Emails, card numbers, phone numbers, ID numbers, IP addresses, IBANs and API keys in the page's
 * text and form fields are covered as soon as the mode starts, and anything the page adds later
 * (lazy sections, infinite scroll) is covered as it appears. Click any text or element to hide or
 * show it; select text and press H to hide just that. Captures taken while this is on, from the
 * toolbar, the popup or a shortcut, show the page with the covers in place, at any length.
 * Nothing is read off the device: the matching runs here, on the page's own text.
 * Done puts the page back exactly as it was.
 */

import { T, FONT_FAMILY, applyOverlayTheme, alpha, SQUIRCLE_CSS } from "../ui/overlay-kit";
import { LIGHT } from "../ui/ds/tokens";
import { icon } from "../ui/ds/icons";
import { findSensitiveRanges, type SensitiveKind } from "../utils/sensitive";

const FONT_STACK = FONT_FAMILY;
const MARK = "data-gf-redact"; // wraps a matched run of text
const FIELD = "data-gf-redact-field"; // input or textarea whose value matched
const WHOLE = "data-gf-redact-el"; // an element the person clicked
const SKIP = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "TEMPLATE", "TEXTAREA", "INPUT", "SELECT", "OPTION", "CODE-MIRROR", "IFRAME", "SVG", "MATH"]);
const MAX_TEXT_NODES = 50000;

declare global {
  interface Window { __gofully_live_redact_registered?: boolean }
}

let active = false;
let style: "box" | "blur" = "box";
let sheet: HTMLStyleElement | null = null;
let barHost: HTMLDivElement | null = null;
let countEl: HTMLSpanElement | null = null;
let outline: HTMLDivElement | null = null;
let observer: MutationObserver | null = null;
let pending = new Set<Node>();
let pendingTimer: ReturnType<typeof setTimeout> | undefined;
let hovered: Element | null = null;
const counts = new Map<SensitiveKind | "manual", number>();

const KIND_WORD: Record<SensitiveKind | "manual", [string, string]> = {
  email: ["email", "emails"], card: ["card number", "card numbers"], phone: ["phone number", "phone numbers"],
  ssn: ["ID number", "ID numbers"], ip: ["IP address", "IP addresses"], key: ["API key", "API keys"], iban: ["IBAN", "IBANs"],
  manual: ["item you chose", "items you chose"],
};

function pageCss(): string {
  // Redaction is page content, not GoFully UI, so it is the same solid ink in both themes.
  const ink = LIGHT.ink;
  return style === "box"
    ? `
      [${MARK}] { background: ${ink} !important; color: transparent !important; -webkit-text-fill-color: transparent !important;
        text-shadow: none !important; border-radius: 3px !important; box-decoration-break: clone !important; -webkit-box-decoration-break: clone !important; }
      [${MARK}] * { color: transparent !important; -webkit-text-fill-color: transparent !important; }
      [${FIELD}] { color: transparent !important; -webkit-text-fill-color: transparent !important; background: ${ink} !important; caret-color: transparent !important; }
      [${WHOLE}] { background: ${ink} !important; border-radius: 3px !important; }
      [${WHOLE}], [${WHOLE}] * { color: transparent !important; -webkit-text-fill-color: transparent !important; text-shadow: none !important; border-color: transparent !important; box-shadow: none !important; }
      [${WHOLE}] img, [${WHOLE}] svg, [${WHOLE}] video, [${WHOLE}] canvas, [${WHOLE}] picture,
      img[${WHOLE}], svg[${WHOLE}], video[${WHOLE}], canvas[${WHOLE}] { opacity: 0 !important; }
    `
    : `
      [${MARK}], [${FIELD}], [${WHOLE}] { filter: blur(7px) !important; }
    `;
}

function bump(kind: SensitiveKind | "manual", by = 1): void {
  counts.set(kind, Math.max(0, (counts.get(kind) ?? 0) + by));
  renderCount();
}

function renderCount(): void {
  if (!countEl) return;
  const parts: string[] = [];
  for (const [kind, n] of counts) if (n > 0) parts.push(`${n} ${KIND_WORD[kind][n === 1 ? 0 : 1]}`);
  countEl.textContent = parts.length ? `Hidden: ${parts.join(", ")}` : "Nothing private found yet. Click text or an element to hide it.";
}

function ownNode(n: Node): boolean {
  const el = n.nodeType === Node.ELEMENT_NODE ? (n as Element) : n.parentElement;
  return !!el && (el === barHost || !!el.closest?.("#gofully-live-redact, [id^='gofully-'], [id^='snapforge-']"));
}

/** Wraps sensitive runs inside one text node. */
function redactTextNode(node: Text): void {
  const text = node.data;
  if (text.length < 6 || !/[\d@]/.test(text)) return;
  const ranges = findSensitiveRanges(text);
  if (!ranges.length) return;
  const parent = node.parentNode;
  if (!parent) return;
  const frag = document.createDocumentFragment();
  let at = 0;
  for (const r of ranges) {
    if (r.start > at) frag.append(text.slice(at, r.start));
    const span = document.createElement("span");
    span.setAttribute(MARK, r.kind);
    span.textContent = text.slice(r.start, r.end);
    frag.append(span);
    bump(r.kind);
    at = r.end;
  }
  if (at < text.length) frag.append(text.slice(at));
  parent.replaceChild(frag, node);
}

function redactField(el: HTMLInputElement | HTMLTextAreaElement): void {
  if (el.hasAttribute(FIELD) || (el instanceof HTMLInputElement && ["hidden", "checkbox", "radio", "button", "submit", "file", "range", "color"].includes(el.type))) return;
  const ranges = el.type === "password" ? [] : findSensitiveRanges(el.value || "");
  if (!ranges.length) return;
  el.setAttribute(FIELD, ranges[0].kind);
  bump(ranges[0].kind);
}

function scan(root: Node): void {
  if (ownNode(root)) return;
  if (root.nodeType === Node.TEXT_NODE) {
    const p = (root as Text).parentElement;
    if (p && !SKIP.has(p.tagName.toUpperCase()) && !p.closest(`[${MARK}]`)) redactTextNode(root as Text);
    return;
  }
  if (root.nodeType !== Node.ELEMENT_NODE && root.nodeType !== Node.DOCUMENT_NODE) return;
  const base = root as Element;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode: (n) => {
      const p = n.parentElement;
      if (!p || SKIP.has(p.tagName.toUpperCase()) || p.closest(`[${MARK}]`) || ownNode(n)) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  });
  const nodes: Text[] = [];
  let n: Node | null;
  while ((n = walker.nextNode()) && nodes.length < MAX_TEXT_NODES) nodes.push(n as Text);
  for (const t of nodes) redactTextNode(t);
  const fields = base.querySelectorAll?.("input, textarea") ?? [];
  for (const f of Array.from(fields)) redactField(f as HTMLInputElement);
  if (base instanceof HTMLInputElement || base instanceof HTMLTextAreaElement) redactField(base);
}

/** Runs a change of our own without the watcher seeing it, so unhidden text isn't hidden again at once. */
function quietly(fn: () => void): void {
  observer?.disconnect();
  try {
    fn();
  } finally {
    if (observer && active) observer.observe(document.body || document.documentElement, { childList: true, subtree: true, characterData: true });
  }
}

function flushPending(): void {
  const batch = Array.from(pending);
  pending = new Set();
  quietly(() => { for (const node of batch) if (node.isConnected) scan(node); });
}

function watch(): void {
  observer = new MutationObserver((records) => {
    for (const r of records) {
      if (r.type === "characterData" && r.target.parentElement && !r.target.parentElement.closest(`[${MARK}]`)) pending.add(r.target);
      for (const added of Array.from(r.addedNodes)) if (!ownNode(added) && !(added as Element).hasAttribute?.(MARK)) pending.add(added);
    }
    if (pending.size) {
      clearTimeout(pendingTimer);
      pendingTimer = setTimeout(flushPending, 150);
    }
  });
  quietly(() => {});
}

/** Hides the text the person selected. */
function hideSelection(): boolean {
  const sel = window.getSelection();
  if (!sel || sel.isCollapsed || !sel.rangeCount) return false;
  const range = sel.getRangeAt(0);
  const walker = document.createTreeWalker(range.commonAncestorContainer, NodeFilter.SHOW_TEXT);
  const nodes: Text[] = [];
  if (range.commonAncestorContainer.nodeType === Node.TEXT_NODE) nodes.push(range.commonAncestorContainer as Text);
  let n: Node | null;
  while ((n = walker.nextNode())) if (range.intersectsNode(n)) nodes.push(n as Text);
  let hid = 0;
  for (const t of nodes) {
    if (ownNode(t) || t.parentElement?.closest(`[${MARK}]`)) continue;
    const start = t === range.startContainer ? range.startOffset : 0;
    const end = t === range.endContainer ? range.endOffset : t.data.length;
    if (end - start < 1 || !t.data.slice(start, end).trim()) continue;
    const mid = t.splitText(start);
    mid.splitText(end - start);
    const span = document.createElement("span");
    span.setAttribute(MARK, "manual");
    mid.parentNode!.replaceChild(span, mid);
    span.append(mid);
    hid++;
  }
  sel.removeAllRanges();
  if (hid) bump("manual", hid);
  return hid > 0;
}

/** Unwraps every cover and restores the page's text nodes. */
function restoreAll(): void {
  const parents = new Set<Node>();
  for (const span of Array.from(document.querySelectorAll(`[${MARK}]`))) {
    const parent = span.parentNode;
    if (!parent) continue;
    parent.replaceChild(document.createTextNode(span.textContent ?? ""), span);
    parents.add(parent);
  }
  for (const p of parents) (p as Element).normalize?.();
  for (const el of Array.from(document.querySelectorAll(`[${FIELD}]`))) el.removeAttribute(FIELD);
  for (const el of Array.from(document.querySelectorAll(`[${WHOLE}]`))) el.removeAttribute(WHOLE);
  counts.clear();
  renderCount();
}

function toggleAt(target: Element): void {
  const mark = target.closest(`[${MARK}]`);
  if (mark) {
    const kind = (mark.getAttribute(MARK) || "manual") as SensitiveKind | "manual";
    const parent = mark.parentNode!;
    parent.replaceChild(document.createTextNode(mark.textContent ?? ""), mark);
    (parent as Element).normalize?.();
    bump(kind, -1);
    return;
  }
  const field = target.closest(`[${FIELD}]`);
  if (field) {
    bump((field.getAttribute(FIELD) || "manual") as SensitiveKind, -1);
    field.removeAttribute(FIELD);
    return;
  }
  const whole = target.closest(`[${WHOLE}]`);
  if (whole) {
    whole.removeAttribute(WHOLE);
    bump("manual", -1);
    return;
  }
  if (target === document.body || target === document.documentElement) return;
  target.setAttribute(WHOLE, "");
  bump("manual");
}

// ─── Pointer and keys ────────────────────────────────────────────────────────
function ours(e: Event): boolean {
  return !!barHost && e.composedPath().includes(barHost);
}

function paintOutline(): void {
  if (!outline) return;
  if (!hovered || !hovered.isConnected) { outline.style.display = "none"; return; }
  const r = hovered.getBoundingClientRect();
  Object.assign(outline.style, { display: "block", left: `${r.left - 2}px`, top: `${r.top - 2}px`, width: `${r.width + 4}px`, height: `${r.height + 4}px` });
}

function onMove(e: MouseEvent): void {
  if (ours(e)) { hovered = null; paintOutline(); return; }
  const el = document.elementFromPoint(e.clientX, e.clientY);
  hovered = el && !ownNode(el) && el !== document.documentElement && el !== document.body ? el : null;
  paintOutline();
}

let downAt: { x: number; y: number } | null = null;

function onDown(e: MouseEvent): void {
  if (ours(e)) return;
  downAt = { x: e.clientX, y: e.clientY };
  // let text selection happen; block the page's own handlers
  e.stopPropagation();
}

function onClick(e: MouseEvent): void {
  if (ours(e)) return;
  e.preventDefault();
  e.stopPropagation();
  e.stopImmediatePropagation();
  const moved = downAt && Math.hypot(e.clientX - downAt.x, e.clientY - downAt.y) > 4;
  downAt = null;
  const sel = window.getSelection();
  if (moved || (sel && !sel.isCollapsed)) return; // a text selection, not a click
  const el = document.elementFromPoint(e.clientX, e.clientY);
  if (el && !ownNode(el)) quietly(() => toggleAt(el));
}

function onKey(e: KeyboardEvent): void {
  if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); stop(); return; }
  if (e.metaKey || e.ctrlKey || e.altKey) return;
  if (e.key.toLowerCase() !== "h") return;
  let hid = false;
  quietly(() => { hid = hideSelection(); });
  if (hid) { e.preventDefault(); e.stopPropagation(); }
}

// ─── Toolbar ─────────────────────────────────────────────────────────────────
function nextFrame(): Promise<void> {
  return new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())));
}

async function capture(mode: "visible-area" | "full-page"): Promise<void> {
  if (!barHost || !outline) return;
  barHost.style.setProperty("visibility", "hidden", "important");
  outline.style.display = "none";
  await nextFrame();
  try {
    await chrome.runtime.sendMessage({ type: "START_CAPTURE", payload: { mode } });
  } catch {
    // worker restarting
  } finally {
    barHost?.style.removeProperty("visibility");
  }
}

function buildBar(): void {
  barHost = document.createElement("div");
  barHost.id = "gofully-live-redact";
  barHost.style.cssText = "all:initial; position:fixed; inset:0; z-index:2147483647; pointer-events:none;";
  const root = barHost.attachShadow({ mode: "open" });
  const css = document.createElement("style");
  css.textContent = SQUIRCLE_CSS + `
    @font-face { font-family:'GoFully Inter'; src:url('${chrome.runtime.getURL("assets/inter-latin-wght-normal.woff2")}') format('woff2'); font-weight:100 900; font-display:swap; }
    * { box-sizing: border-box; }
    .outline { position: fixed; display: none; pointer-events: none; border: 2px dashed ${T.focus}; border-radius: 4px; background: ${alpha(T.focus, 0.06)}; }
    .bar { position: fixed; left: 50%; bottom: 16px; transform: translateX(-50%); display: flex; align-items: center; gap: 8px; max-width: calc(100vw - 32px);
      padding: 6px; border-radius: 999px; background: ${T.surface}; color: ${T.text}; border: 1px solid ${T.border}; box-shadow: ${T.shadowLg};
      font: 400 13px/20px ${FONT_STACK}; pointer-events: auto; -webkit-font-smoothing: antialiased; }
    .ico { display: inline-flex; color: ${T.success}; padding-left: 8px; }
    .count { color: ${T.textMuted}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; min-width: 0; max-width: 360px; }
    .seg { display: inline-flex; padding: 2px; border-radius: 999px; background: ${T.surfaceSunken}; }
    .seg button { border-color: transparent; background: transparent; height: 26px; }
    .seg button[aria-pressed="true"] { background: ${T.surface}; border-color: ${T.border}; }
    button { font: 500 12px/1 ${FONT_STACK}; height: 30px; padding: 0 12px; border-radius: 999px; cursor: pointer; display: inline-flex; align-items: center; gap: 6px;
      border: 1px solid ${T.borderStrong}; background: ${T.surface}; color: ${T.text}; white-space: nowrap; }
    button:hover { background: ${T.surfaceAlt}; }
    button:focus-visible { outline: none; box-shadow: 0 0 0 3px ${T.focus}; }
    button.prim { background: ${T.accent}; border-color: ${T.accent}; color: ${T.onAccent}; }
  `;
  outline = document.createElement("div");
  outline.className = "outline";
  const bar = document.createElement("div");
  bar.className = "bar";
  bar.setAttribute("role", "toolbar");
  bar.setAttribute("aria-label", "Redact page");
  const ico = document.createElement("span");
  ico.className = "ico";
  ico.innerHTML = icon("auto-redact", 16);
  countEl = document.createElement("span");
  countEl.className = "count";
  countEl.setAttribute("aria-live", "polite");
  countEl.title = "Click text or an element to hide or show it. Select text and press H to hide just that.";

  const mk = (text: string, act: string, cls = ""): HTMLButtonElement => {
    const b = document.createElement("button");
    b.type = "button";
    b.textContent = text;
    b.dataset.act = act;
    if (cls) b.className = cls;
    return b;
  };
  const seg = document.createElement("div");
  seg.className = "seg";
  const boxBtn = mk("Black", "style-box");
  const blurBtn = mk("Blur", "style-blur");
  boxBtn.setAttribute("aria-pressed", "true");
  blurBtn.setAttribute("aria-pressed", "false");
  seg.append(boxBtn, blurBtn);
  bar.append(ico, countEl, seg, mk("Capture visible", "cap-visible"), mk("Capture full page", "cap-full"), mk("Show all", "undo"), mk("Done", "done", "prim"));
  bar.addEventListener("click", (e) => {
    const b = (e.target as HTMLElement).closest("button") as HTMLButtonElement | null;
    switch (b?.dataset.act) {
      case "style-box":
      case "style-blur":
        style = b.dataset.act === "style-box" ? "box" : "blur";
        boxBtn.setAttribute("aria-pressed", String(style === "box"));
        blurBtn.setAttribute("aria-pressed", String(style === "blur"));
        if (sheet) sheet.textContent = pageCss();
        return;
      case "cap-visible": void capture("visible-area"); return;
      case "cap-full": void capture("full-page"); return;
      case "undo": quietly(restoreAll); return;
      case "done": stop(); return;
    }
  });
  root.append(css, outline, bar);
  document.documentElement.append(barHost);
}

// ─── Lifecycle ───────────────────────────────────────────────────────────────
async function start(): Promise<void> {
  if (active) return;
  active = true;
  await applyOverlayTheme();
  sheet = document.createElement("style");
  sheet.id = "gofully-redact-style";
  sheet.textContent = pageCss();
  (document.head || document.documentElement).append(sheet);
  buildBar();
  renderCount();
  watch();
  quietly(() => scan(document.body || document.documentElement));
  window.addEventListener("mousemove", onMove, true);
  window.addEventListener("mousedown", onDown, true);
  window.addEventListener("click", onClick, true);
  window.addEventListener("keydown", onKey, true);
  window.addEventListener("scroll", paintOutline, true);
}

function stop(): void {
  if (!active) return;
  active = false;
  observer?.disconnect();
  observer = null;
  clearTimeout(pendingTimer);
  pending.clear();
  window.removeEventListener("mousemove", onMove, true);
  window.removeEventListener("mousedown", onDown, true);
  window.removeEventListener("click", onClick, true);
  window.removeEventListener("keydown", onKey, true);
  window.removeEventListener("scroll", paintOutline, true);
  restoreAll();
  sheet?.remove();
  barHost?.remove();
  sheet = null;
  barHost = null;
  countEl = null;
  outline = null;
  hovered = null;
}

if (!window.__gofully_live_redact_registered) {
  window.__gofully_live_redact_registered = true;
  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message.type === "START_LIVE_REDACT") {
      void start();
      sendResponse({ started: true });
      return true;
    }
    return false;
  });
}
