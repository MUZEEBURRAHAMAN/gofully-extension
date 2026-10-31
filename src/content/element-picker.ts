/**
 * Capture Element: hover any part of the page, click, and GoFully captures just
 * that element. ↑ selects the parent, ↓ goes back down, Esc cancels.
 * The region is handed to the same selected-area pipeline the drag picker uses.
 */

import type { CaptureRegion } from "../types";

import { T, FONT_FAMILY, applyOverlayTheme, alpha, SQUIRCLE_CSS } from "../ui/overlay-kit";
const FONT_STACK = FONT_FAMILY;

declare global {
  interface Window { __gofully_element_picker_registered?: boolean }
}

let host: HTMLDivElement | null = null;
let box: HTMLDivElement | null = null;
let label: HTMLDivElement | null = null;
let current: Element | null = null;
let chain: Element[] = []; // elements we've walked up from, so ↓ can return
let tabId: number | null = null;

function describe(el: Element): string {
  const tag = el.tagName.toLowerCase();
  const id = el.id ? `#${el.id}` : "";
  const cls = typeof (el as HTMLElement).className === "string" && (el as HTMLElement).className.trim()
    ? "." + (el as HTMLElement).className.trim().split(/\s+/).slice(0, 2).join(".")
    : "";
  return `${tag}${id}${cls}`.slice(0, 40);
}

function paint(el: Element | null): void {
  if (!box || !label) return;
  if (!el) { box.style.display = "none"; label.style.display = "none"; return; }
  const r = el.getBoundingClientRect();
  box.style.display = "block";
  box.style.left = r.left + "px";
  box.style.top = r.top + "px";
  box.style.width = r.width + "px";
  box.style.height = r.height + "px";
  label.style.display = "block";
  label.textContent = `${describe(el)}  ${Math.round(r.width)} × ${Math.round(r.height)}`;
  const ly = r.top > 28 ? r.top - 26 : r.top + 4;
  label.style.top = ly + "px";
  label.style.left = Math.max(4, Math.min(window.innerWidth - 220, r.left)) + "px";
}

function pick(x: number, y: number): Element | null {
  const el = document.elementFromPoint(x, y);
  if (!el || el === document.documentElement || el === document.body) return el;
  return el;
}

function onMove(e: MouseEvent): void {
  const el = pick(e.clientX, e.clientY);
  if (el !== current) { current = el; chain = []; paint(current); }
}

function stop(): void {
  window.removeEventListener("mousemove", onMove, true);
  window.removeEventListener("click", onClick, true);
  window.removeEventListener("mousedown", swallow, true);
  window.removeEventListener("mouseup", swallow, true);
  window.removeEventListener("keydown", onKey, true);
  window.removeEventListener("scroll", onScroll, true);
  host?.remove();
  host = box = label = null;
  current = null;
  chain = [];
}

function swallow(e: Event): void { e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation(); }

function onScroll(): void { paint(current); }

function onKey(e: KeyboardEvent): void {
  if (e.key === "Escape") { swallow(e); stop(); return; }
  if (e.key === "ArrowUp" && current?.parentElement) {
    swallow(e);
    chain.push(current);
    current = current.parentElement;
    paint(current);
  } else if (e.key === "ArrowDown" && chain.length) {
    swallow(e);
    current = chain.pop()!;
    paint(current);
  } else if (e.key === "Enter" && current) {
    swallow(e);
    void capture(current);
  }
}

function onClick(e: MouseEvent): void {
  swallow(e);
  const el = current || pick(e.clientX, e.clientY);
  if (el) void capture(el);
}

async function capture(el: Element): Promise<void> {
  // Bring it into view first, then measure and clamp to what is actually on screen.
  el.scrollIntoView({ block: "center", inline: "nearest", behavior: "instant" as ScrollBehavior });
  stop();
  await new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())));

  const r = el.getBoundingClientRect();
  const x = Math.max(0, Math.floor(r.left));
  const y = Math.max(0, Math.floor(r.top));
  const right = Math.min(window.innerWidth, Math.ceil(r.right));
  const bottom = Math.min(window.innerHeight, Math.ceil(r.bottom));
  const region: CaptureRegion = { x, y, width: right - x, height: bottom - y };
  if (region.width < 2 || region.height < 2) return;

  chrome.runtime.sendMessage({
    type: "START_CAPTURE",
    payload: { mode: "selected-area", region, tabId },
  }).catch(() => {});
}

async function start(): Promise<void> {
  stop();
  await applyOverlayTheme();
  host = document.createElement("div");
  host.id = "gofully-element-picker";
  host.style.cssText = "all:initial; position:fixed; inset:0; z-index:2147483646; pointer-events:none;";
  const root = host.attachShadow({ mode: "open" });
  const style = document.createElement("style");
  style.textContent = SQUIRCLE_CSS + `
    @font-face { font-family:'GoFully Inter'; src:url('${chrome.runtime.getURL("assets/inter-latin-wght-normal.woff2")}') format('woff2'); font-weight:100 900; font-display:swap; }
    /* Figma: Overlay / Element · hover */
    .box { position:fixed; display:none; border:2px solid ${T.focus}; border-radius:6px; background:${alpha(T.focus, 0.12)}; pointer-events:none; box-shadow:0 0 0 1px ${alpha(T.surface, 0.7)}; }
    .lab { position:fixed; display:none; background:${T.focus}; color:${T.accent === T.focus ? T.surface : T.accent}; font:500 11px/16px ${FONT_STACK}; padding:2px 8px; border-radius:6px; white-space:nowrap; pointer-events:none; font-variant-numeric:tabular-nums; }
    .tip { position:fixed; left:50%; top:16px; transform:translateX(-50%); display:flex; align-items:center; gap:8px; white-space:nowrap; background:${T.text}; color:${T.surface}; font:500 13px/20px ${FONT_STACK}; padding:8px 14px; border-radius:999px; box-shadow:${T.shadowLg}; pointer-events:none; }
    .tip kbd { font:500 11px/16px ${FONT_STACK}; padding:1px 6px; border-radius:4px; background:${alpha(T.surface, 0.16)}; }
    .tip .soft { color:${alpha(T.surface, 0.72)}; }
  `;
  root.appendChild(style);
  box = document.createElement("div"); box.className = "box";
  label = document.createElement("div"); label.className = "lab";
  const tip = document.createElement("div"); tip.className = "tip";
  tip.innerHTML = `<span>Click an element to capture it</span><kbd>↑</kbd><span class="soft">parent</span><kbd>↓</kbd><span class="soft">child</span><kbd>Esc</kbd><span class="soft">cancel</span>`;
  root.append(box, label, tip);
  document.documentElement.appendChild(host);

  window.addEventListener("mousemove", onMove, true);
  window.addEventListener("click", onClick, true);
  window.addEventListener("mousedown", swallow, true);
  window.addEventListener("mouseup", swallow, true);
  window.addEventListener("keydown", onKey, true);
  window.addEventListener("scroll", onScroll, true);
}

if (!window.__gofully_element_picker_registered) {
  window.__gofully_element_picker_registered = true;
  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message.type === "START_ELEMENT_PICKER_MODE") {
      tabId = message.payload?.tabId ?? null;
      start();
      sendResponse({ started: true });
      return true;
    }
    return false;
  });
}
