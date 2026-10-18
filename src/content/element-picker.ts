/**
 * Capture Element: hover any part of the page, click, and GoFully captures just
 * that element. ↑ selects the parent, ↓ goes back down, Esc cancels.
 * The region is handed to the same selected-area pipeline the drag picker uses.
 */

import type { CaptureRegion } from "../types";

const FONT_STACK = "'Archivo', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";

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

function start(): void {
  stop();
  host = document.createElement("div");
  host.id = "gofully-element-picker";
  host.style.cssText = "all:initial; position:fixed; inset:0; z-index:2147483646; pointer-events:none;";
  const root = host.attachShadow({ mode: "open" });
  const style = document.createElement("style");
  style.textContent = `
    .box { position:fixed; display:none; border:2px solid #1667F2; background:rgba(22,103,242,.12); pointer-events:none; box-shadow:0 0 0 1px rgba(255,255,255,.7); }
    .lab { position:fixed; display:none; background:#1667F2; color:#fff; font:600 11px ${FONT_STACK}; padding:3px 8px; white-space:nowrap; pointer-events:none; }
    .tip { position:fixed; left:50%; bottom:20px; transform:translateX(-50%); background:rgba(16,24,40,.92); color:#fff; font:500 12px ${FONT_STACK}; padding:8px 14px; pointer-events:none; }
  `;
  root.appendChild(style);
  box = document.createElement("div"); box.className = "box";
  label = document.createElement("div"); label.className = "lab";
  const tip = document.createElement("div"); tip.className = "tip";
  tip.textContent = "Click an element to capture it · ↑ parent · ↓ child · Esc cancel";
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
