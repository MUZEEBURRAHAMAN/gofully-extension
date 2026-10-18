/**
 * Pin a capture on top of the current page: a small floating reference image
 * you can drag, resize and fade while you work. Lives only in this tab, in
 * memory — nothing is stored or sent anywhere.
 */

const FONT_STACK = "'Archivo', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
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
    * { box-sizing:border-box; }
    .frame { position:relative; width:100%; background:#fff; border:1px solid #E3E8EF; cursor:grab; user-select:none; -webkit-user-select:none;
      box-shadow:0 12px 24px -6px rgba(22,103,242,.14), 0 32px 48px -8px rgba(22,103,242,.2); touch-action:none; }
    .frame.drag { cursor:grabbing; }
    img { display:block; width:100%; height:auto; pointer-events:none; }
    .bar { position:absolute; top:0; left:0; right:0; display:flex; justify-content:space-between; align-items:center; gap:6px; padding:5px 6px;
      background:linear-gradient(rgba(16,24,40,.72), rgba(16,24,40,0)); opacity:0; transition:opacity .12s; font:600 10.5px ${FONT_STACK}; color:#fff; }
    .frame:hover .bar, .frame:focus-within .bar { opacity:1; }
    .bar label { display:flex; align-items:center; gap:6px; }
    input[type=range] { width:70px; accent-color:#1667F2; height:14px; }
    button { all:unset; box-sizing:border-box; width:22px; height:22px; display:grid; place-items:center; cursor:pointer; background:rgba(16,24,40,.6); color:#fff; font:700 13px ${FONT_STACK}; }
    button:hover { background:#1667F2; }
    button:focus-visible { box-shadow:0 0 0 2px #fff, 0 0 0 4px #1667F2; }
    .grip { position:absolute; right:0; bottom:0; width:18px; height:18px; cursor:nwse-resize; opacity:0; transition:opacity .12s; touch-action:none;
      background:linear-gradient(135deg, transparent 50%, #1667F2 50%); }
    .frame:hover .grip { opacity:1; }
    @media (prefers-reduced-motion: reduce) { .bar, .grip { transition:none; } }
  `;
  root.appendChild(style);

  const frame = document.createElement("div");
  frame.className = "frame";
  frame.innerHTML = `
    <img alt="Pinned capture" src="${dataUrl}">
    <div class="bar">
      <label>Opacity <input type="range" min="25" max="100" value="100" aria-label="Pin opacity"></label>
      <button type="button" aria-label="Close pinned image" title="Close">×</button>
    </div>
    <div class="grip" aria-hidden="true"></div>
  `;
  root.appendChild(frame);

  const range = frame.querySelector<HTMLInputElement>("input[type=range]")!;
  range.addEventListener("input", () => { frame.style.opacity = String(Number(range.value) / 100); });
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
    if (message.type === "PIN_IMAGE" && typeof message.payload?.dataUrl === "string" && message.payload.dataUrl.startsWith("data:image/")) {
      createPin(message.payload.dataUrl, Number(message.payload.width) || 0, Number(message.payload.height) || 0);
      sendResponse({ shown: true });
      return true;
    }
    return false;
  });
}

export {};
