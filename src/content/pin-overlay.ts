/**
 * Pin a capture on top of the current page: a small floating reference image
 * you can drag, resize and fade while you work. Lives only in this tab, in
 * memory — nothing is stored or sent anywhere.
 */

import { T, FONT_FAMILY } from "../ui/overlay-kit";
import { icon } from "../ui/ds/icons";
import { isSafeImageDataUrl } from "../utils/safe-image";
const FONT_STACK = FONT_FAMILY;
const MAX_PINS = 5;
const MIN_W = 120;

declare global {
  interface Window { __gofully_pin_registered?: boolean }
}

let pinCount = 0;

function createPin(dataUrl: string, natW: number, natH: number): void {
  const existing = document.querySelectorAll("[data-gofully-pin]");
  if (existing.length >= MAX_PINS) existing[0].remove();

  const ratio = natW > 0 && natH > 0 ? natW / natH : 1.6;
  const startW = Math.round(Math.max(MIN_W, Math.min(420, window.innerWidth * 0.4, natW || 420)));
  const offset = (pinCount++ % 4) * 24;

  const host = document.createElement("div");
  host.setAttribute("data-gofully-pin", "");
  host.style.cssText = `all:initial; position:fixed; z-index:2147483646; left:${Math.max(8, window.innerWidth - startW - 24 - offset)}px; top:${Math.max(8, window.innerHeight - Math.round(startW / ratio) - 24 - offset)}px; width:${startW}px;`;
  const root = host.attachShadow({ mode: "open" });

  const style = document.createElement("style");
  style.textContent = `
    @font-face { font-family:'GoFully Inter'; src:url('${chrome.runtime.getURL("assets/inter-latin-wght-normal.woff2")}') format('woff2'); font-weight:100 900; font-display:swap; }
    * { box-sizing:border-box; }
    /* Figma: Overlay / Pin · resting, · hover controls */
    .frame { position:relative; width:100%; background:${T.surface}; border:1px solid ${T.borderStrong}; border-radius:12px; overflow:hidden; cursor:grab; user-select:none; -webkit-user-select:none;
      box-shadow:${T.shadowLg}; touch-action:none; transition:border-color .15s; }
    .frame:hover, .frame:focus-within { border-color:${T.focus}; }
    .frame.drag { cursor:grabbing; }
    img { display:block; width:100%; height:auto; pointer-events:none; }
    .bar { position:absolute; top:0; left:0; right:0; display:flex; align-items:center; gap:8px; padding:6px 8px;
      background:${T.surface}; border-bottom:1px solid ${T.border}; opacity:0; transform:translateY(-4px); transition:opacity .15s, transform .15s;
      font:400 11px/16px ${FONT_STACK}; color:${T.textFaint}; }
    .frame:hover .bar, .frame:focus-within .bar { opacity:1; transform:none; }
    .bar .drag-ic { display:inline-flex; color:${T.textFaint}; }
    .bar label { display:flex; align-items:center; gap:8px; flex:1; }
    input[type=range] { flex:1; min-width:60px; accent-color:${T.accent}; height:14px; }
    .val { font-variant-numeric:tabular-nums; color:${T.textMuted}; min-width:32px; text-align:right; }
    button { all:unset; box-sizing:border-box; width:24px; height:24px; display:grid; place-items:center; cursor:pointer; border-radius:6px; color:${T.textMuted}; }
    button:hover { background:${T.surfaceAlt}; color:${T.text}; }
    button:focus-visible { box-shadow:0 0 0 3px ${T.focus}; }
    .grip { position:absolute; right:-1px; bottom:-1px; width:12px; height:12px; cursor:nwse-resize; opacity:0; transition:opacity .15s; touch-action:none;
      background:${T.surface}; border:2px solid ${T.focus}; border-radius:3px; }
    .frame:hover .grip { opacity:1; }
    @media (prefers-reduced-motion: reduce) { .bar, .grip { transition:none; } }
  `;
  root.appendChild(style);

  const frame = document.createElement("div");
  frame.className = "frame";
  frame.innerHTML = `
    <img alt="Pinned capture">
    <div class="bar">
      <span class="drag-ic">${icon("drag", 16)}</span>
      <label>Opacity <input type="range" min="25" max="100" value="100" aria-label="Pin opacity"></label>
      <span class="val">100%</span>
      <button type="button" aria-label="Close pinned image" title="Close">${icon("close", 14)}</button>
    </div>
    <div class="grip" aria-hidden="true"></div>
  `;
  frame.querySelector("img")!.src = dataUrl;
  root.appendChild(frame);

  const range = frame.querySelector<HTMLInputElement>("input[type=range]")!;
  const val = frame.querySelector<HTMLSpanElement>(".val")!;
  range.addEventListener("input", () => {
    frame.style.opacity = String(Number(range.value) / 100);
    val.textContent = `${range.value}%`;
  });
  range.addEventListener("pointerdown", (e) => e.stopPropagation());
  frame.querySelector("button")!.addEventListener("click", () => host.remove());

  // Drag the whole pin
  let drag: { dx: number; dy: number } | null = null;
  frame.addEventListener("pointerdown", (e) => {
    if ((e.target as HTMLElement).closest(".grip, button, input")) return;
    const r = host.getBoundingClientRect();
    drag = { dx: e.clientX - r.left, dy: e.clientY - r.top };
    frame.classList.add("drag");
    frame.setPointerCapture(e.pointerId);
  });
  frame.addEventListener("pointermove", (e) => {
    if (!drag) return;
    const maxX = window.innerWidth - 40, maxY = window.innerHeight - 40;
    host.style.left = Math.min(maxX, Math.max(-host.offsetWidth + 40, e.clientX - drag.dx)) + "px";
    host.style.top = Math.min(maxY, Math.max(0, e.clientY - drag.dy)) + "px";
  });
  const endDrag = () => { drag = null; frame.classList.remove("drag"); };
  frame.addEventListener("pointerup", endDrag);
  frame.addEventListener("pointercancel", endDrag);

  // Resize from the corner, keeping the aspect ratio
  const grip = frame.querySelector<HTMLElement>(".grip")!;
  let resize: { startX: number; startW: number } | null = null;
  grip.addEventListener("pointerdown", (e) => {
    e.stopPropagation();
    resize = { startX: e.clientX, startW: host.offsetWidth };
    grip.setPointerCapture(e.pointerId);
  });
  grip.addEventListener("pointermove", (e) => {
    if (!resize) return;
    const room = window.innerWidth - host.getBoundingClientRect().left - 8;
    const w = Math.max(MIN_W, Math.min(room, resize.startW + (e.clientX - resize.startX)));
    host.style.width = w + "px";
  });
  const endResize = () => { resize = null; };
  grip.addEventListener("pointerup", endResize);
  grip.addEventListener("pointercancel", endResize);

  (document.documentElement).appendChild(host);
}

if (!window.__gofully_pin_registered) {
  window.__gofully_pin_registered = true;
  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message.type === "PIN_IMAGE" && isSafeImageDataUrl(message.payload?.dataUrl)) {
      createPin(message.payload.dataUrl, Number(message.payload.width) || 0, Number(message.payload.height) || 0);
      sendResponse({ shown: true });
      return true;
    }
    return false;
  });
}

export {};
