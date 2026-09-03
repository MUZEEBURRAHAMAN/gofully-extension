
/** Kept in step with src/ui/overlay-kit.ts — this file styles a shadow root. */
const FONT_STACK =
  `'GoFully Archivo', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif`;

let bar: HTMLDivElement | null = null;

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

// Hugeicons SVG strings (24×24 viewBox, stroke-width="1.5")
const PH = {
  check: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:block;flex-shrink:0"><polyline points="20 6 9 17 4 12"/></svg>`,
  x: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:block;flex-shrink:0"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
  ruler: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="display:block;flex-shrink:0"><path d="M21.3 8.7L15.3 2.7C14.9 2.3 14.3 2.3 13.9 2.7L2.7 13.9C2.3 14.3 2.3 14.9 2.7 15.3L8.7 21.3C9.1 21.7 9.7 21.7 10.1 21.3L21.3 10.1C21.7 9.7 21.7 9.1 21.3 8.7Z"/><path d="M6 10.5L9 13.5"/><path d="M9 7.5L12 10.5"/><path d="M12 4.5L15 7.5"/><path d="M15 1.5L18 4.5"/></svg>`,
  lightning: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="display:block;flex-shrink:0"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
  copy: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="display:block;flex-shrink:0"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`,
  downloadSimple: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="display:block;flex-shrink:0"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`,
  filePdf: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="display:block;flex-shrink:0"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="M9 13h6"/><path d="M9 17h3"/></svg>`,
  pencil: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="display:block;flex-shrink:0"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/><path d="M15 5l4 4"/></svg>`,
};

export function showResultBar(info: {
  width: number;
  height: number;
  mode: string;
  method: string;
  dataUrl?: string;
}): void {
  removeResultBar();
  playShutterSound();

  bar = document.createElement("div");
  bar.id = "snapforge-result-bar";
  bar.style.position = "fixed";
  bar.style.top = "0";
  bar.style.left = "0";
  bar.style.width = "100vw";
  bar.style.height = "100vh";
  bar.style.zIndex = "2147483647";
  bar.style.pointerEvents = "none";

  const shadow = bar.attachShadow({ mode: "closed" });

  const style = document.createElement("style");
  style.textContent = `
    @font-face {
      font-family: 'GoFully Archivo';
      src: url('${chrome.runtime.getURL("assets/Archivo.woff2")}') format('woff2-variations'),
           url('${chrome.runtime.getURL("assets/Archivo.woff2")}') format('woff2');
      font-weight: 100 900;
      font-display: swap;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }

    .popup {
      position: fixed; top: 16px; right: 16px;
      width: 320px;
      background: #ffffff;
      border: 1px solid #E3E8EF;
      border-radius: 0;
      box-shadow: 0 10px 30px rgba(16,24,40,0.04), 0 20px 24px -4px rgba(16,24,40,0.10);
      pointer-events: auto;
      animation: slideIn 0.22s cubic-bezier(0.16, 1, 0.3, 1);
      overflow: hidden;
      font-family: ${FONT_STACK};
      -webkit-font-smoothing: antialiased;
      z-index: 2147483647;
    }
    @keyframes slideIn {
      from { transform: translateY(-16px); opacity: 0; }
      to   { transform: translateY(0); opacity: 1; }
    }

    /* Success strip */
    .success-strip {
      display: flex; align-items: center; gap: 12px;
      padding: 14px 16px;
      background: #ECFDF3;
      border-bottom: 1px solid #A6F4C5;
    }
    .check-circle {
      width: 32px; height: 32px;
      background: #16B364; border-radius: 0;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0; color: #fff;
    }
    .success-text { flex: 1; }
    .success-title {
      font-size: 13.5px; font-weight: 700; color: #027A48;
      letter-spacing: -0.2px; line-height: 1.2;
      font-family: ${FONT_STACK};
    }
    .success-sub {
      font-size: 11px; font-weight: 500; color: #039855;
      margin-top: 2px;
      font-family: ${FONT_STACK};
    }
    .dismiss-btn {
      width: 28px; height: 28px;
      border: none; background: none; cursor: pointer;
      color: #6CE9A6; border-radius: 0;
      display: flex; align-items: center; justify-content: center;
      transition: background 0.1s, color 0.1s; flex-shrink: 0;
    }
    .dismiss-btn:hover { background: #D1FADF; color: #027A48; }

    /* Meta row */
    .meta-row {
      display: flex; align-items: center; justify-content: space-between;
      padding: 9px 16px;
      border-bottom: 1px solid #F1F3F7;
    }
    .meta-item { display: flex; align-items: center; gap: 5px; color: #98A2B3; }
    .meta-label {
      font-size: 10.5px; font-weight: 500; color: #98A2B3;
      font-family: ${FONT_STACK};
    }
    .meta-value {
      font-size: 11.5px; font-weight: 600; color: #344054;
      font-family: ${FONT_STACK};
    }
    .meta-sep { width: 1px; height: 14px; background: #E3E8EF; }
    /* Image Preview Container */
    .preview-container {
      position: relative;
      width: 100%;
      height: 140px;
      background: #F1F3F7;
      border-top: 1px solid #E3E8EF;
      border-bottom: 1px solid #E3E8EF;
      overflow: hidden;
      display: flex;
      align-items: flex-start;
      justify-content: center;
    }
    .preview-img {
      width: 100%;
      height: auto;
      display: block;
      object-fit: cover;
      object-position: top center;
    }
    /* Blur & Gradient Fade overlay for long / full-page screenshots */
    .preview-fade {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 48px;
      background: linear-gradient(to bottom, rgba(241, 243, 247, 0) 0%, rgba(241, 243, 247, 0.92) 80%, rgba(241, 243, 247, 1) 100%);
      backdrop-filter: blur(2px);
      -webkit-backdrop-filter: blur(2px);
      display: flex;
      align-items: flex-end;
      justify-content: center;
      padding-bottom: 6px;
      pointer-events: none;
    }
    .preview-pill {
      font-size: 9.5px;
      font-weight: 700;
      color: #344054;
      background: rgba(255, 255, 255, 0.9);
      border: 1px solid #C8D0D9;
      padding: 2px 8px;
      border-radius: 0;
      box-shadow: 0 1px 3px rgba(0,0,0,0.08);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    /* Actions */
    .actions { padding: 12px; display: flex; flex-direction: column; gap: 7px; }
    .btn-row { display: flex; gap: 7px; }

    .btn {
      flex: 1; height: 38px;
      border-radius: 0;
      border: 1.5px solid #E3E8EF;
      background: #ffffff;
      cursor: pointer;
      font-size: 12px; font-weight: 600; color: #344054;
      font-family: ${FONT_STACK};
      transition: all 0.12s;
      display: flex; align-items: center; justify-content: center; gap: 5px;
      letter-spacing: -0.1px;
    }
    .btn:hover { background: #F7F8FA; border-color: #C8D0D9; color: #1D2939; }
    .btn:active { transform: scale(0.98); }

    .btn-primary {
      background: #1667F2; border-color: #1667F2; color: #fff; font-weight: 700;
      box-shadow: 0 1px 6px rgba(22,103,242,0.35);
    }
    .btn-primary:hover { background: #1257D8; border-color: #1257D8; color: #fff; }

    /* Toast */
    .toast {
      position: fixed; bottom: 20px; left: 50%;
      transform: translateX(-50%) translateY(20px);
      background: #101828; color: #fff;
      padding: 8px 16px; border-radius: 0;
      font-size: 12px; font-weight: 600;
      box-shadow: 0 4px 20px rgba(15,23,42,0.2);
      transition: transform 0.22s cubic-bezier(0.16,1,0.3,1), opacity 0.22s;
      pointer-events: none; white-space: nowrap; opacity: 0;
      font-family: ${FONT_STACK};
    }
    .toast.show { transform: translateX(-50%) translateY(0); opacity: 1; }
  `;

  const w = Math.round(info.width);
  const h = Math.round(info.height);
  const method = info.method === "cdp" ? "CDP" : "Scroll";
  const modeName: Record<string, string> = {
    "full-page": "Full Page",
    "visible-area": "Visible Area",
    "selected-area": "Selected Area",
    "scrolling-area": "Scrolling Area",
    "capture-text": "Capture Text (OCR)",
  };

  const isLongCapture = info.mode === "full-page" || info.mode === "scrolling-area" || h > 800;

  const backdrop = document.createElement("div");
  backdrop.className = "backdrop";

  const popup = document.createElement("div");
  popup.className = "popup";
  popup.innerHTML = `
    <div class="success-strip">
      <div class="check-circle">${PH.check}</div>
      <div class="success-text">
        <div class="success-title">Screenshot captured</div>
        <div class="success-sub">${modeName[info.mode] || info.mode}</div>
      </div>
      <button class="dismiss-btn" id="sf-close">${PH.x}</button>
    </div>

    <div class="meta-row">
      <div class="meta-item">
        ${PH.ruler}
        <span class="meta-label">Size</span>
        <span class="meta-value">${w} × ${h}px</span>
      </div>
      <div class="meta-sep"></div>
      <div class="meta-item">
        ${PH.lightning}
        <span class="meta-label">Via</span>
        <span class="meta-value">${method}</span>
      </div>
    </div>

    ${
      info.dataUrl && info.dataUrl.startsWith("data:image/")
        ? `
      <div class="preview-container">
        <img class="preview-img" src="${info.dataUrl}" alt="Capture Preview" />
        ${
          isLongCapture
            ? `
          <div class="preview-fade">
            <span class="preview-pill">Full Page View</span>
          </div>
        `
            : ""
        }
      </div>
    `
        : ""
    }

    <div class="actions">
      <div class="btn-row">
        <button class="btn btn-primary" id="sf-copy">
          ${PH.copy} Copy Image
        </button>
      </div>
      <div class="btn-row">
        <button class="btn" id="sf-png">
          ${PH.downloadSimple} PNG
        </button>
        <button class="btn" id="sf-webp">
          ${PH.downloadSimple} WebP
        </button>
        <button class="btn" id="sf-pdf">
          ${PH.filePdf} PDF
        </button>
        <button class="btn" id="sf-edit">
          ${PH.pencil} Edit
        </button>
      </div>
    </div>
  `;

  const toastEl = document.createElement("div");
  toastEl.className = "toast";

  shadow.appendChild(style);
  shadow.appendChild(backdrop);
  shadow.appendChild(popup);
  shadow.appendChild(toastEl);
  document.querySelectorAll("#snapforge-result-bar").forEach((el) => el.remove());
  const targetRoot = document.body || document.documentElement || document.firstElementChild;
  if (targetRoot) {
    targetRoot.appendChild(bar);
  } else {
    document.addEventListener("DOMContentLoaded", () => {
      (document.body || document.documentElement)?.appendChild(bar!);
    }, { once: true });
  }

  function showToast(msg: string) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    setTimeout(() => toastEl.classList.remove("show"), 2200);
  }

  shadow.getElementById("sf-copy")!.addEventListener("click", async () => {
    const copyBtnEl = shadow.getElementById("sf-copy")!;
    try {
      // Use dataUrl already in closure; fall back to service worker if missing
      let dataUrl = info.dataUrl;
      if (!dataUrl) {
        const resp = await chrome.runtime.sendMessage({ type: "GET_CAPTURE_BLOB_URL" });
        dataUrl = resp?.url;
      }
      if (!dataUrl) { showToast("Nothing to copy"); return; }
      await copyImageFromDataUrl(dataUrl);
      copyBtnEl.innerHTML = `${PH.copy} <span>Image Copied!</span>`;
      copyBtnEl.style.opacity = "0.75";
      setTimeout(() => {
        copyBtnEl.innerHTML = `${PH.copy} Copy Image`;
        copyBtnEl.style.opacity = "";
      }, 2000);
      showToast("Copied to clipboard!");
    } catch { showToast("Copy failed — try Save PNG"); }
  });

  shadow.getElementById("sf-png")!.addEventListener("click", () => {
    chrome.runtime.sendMessage(
      { type: "EXPORT_CAPTURE", payload: { format: "png" } },
      () => { if (chrome.runtime.lastError) {} showToast("Saved as PNG!"); }
    );
  });

  shadow.getElementById("sf-webp")!.addEventListener("click", async () => {
    try {
      let dataUrl = info.dataUrl;
      if (!dataUrl) {
        const resp = await chrome.runtime.sendMessage({ type: "GET_CAPTURE_BLOB_URL" });
        dataUrl = resp?.url;
      }
      if (!dataUrl) { showToast("Nothing to save"); return; }
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const bitmap = await createImageBitmap(blob);
      const canvas = document.createElement("canvas");
      canvas.width = bitmap.width; canvas.height = bitmap.height;
      canvas.getContext("2d")!.drawImage(bitmap, 0, 0);
      const webpBlob = await new Promise<Blob>((resolve) =>
        canvas.toBlob((b) => resolve(b!), "image/webp", 0.92)
      );
      const url = URL.createObjectURL(webpBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `gofully-${Date.now()}.webp`;
      a.click();
      URL.revokeObjectURL(url);
      showToast("Saved as WebP!");
    } catch { showToast("WebP save failed"); }
  });

  shadow.getElementById("sf-pdf")!.addEventListener("click", () => {
    chrome.runtime.sendMessage(
      { type: "EXPORT_CAPTURE", payload: { format: "pdf" } },
      () => { if (chrome.runtime.lastError) {} showToast("Saved as PDF!"); }
    );
  });

  shadow.getElementById("sf-edit")!.addEventListener("click", () => {
    chrome.runtime.sendMessage({ type: "OPEN_EDITOR" });
    removeResultBar();
  });

  shadow.getElementById("sf-close")!.addEventListener("click", removeResultBar);
  backdrop.addEventListener("click", removeResultBar);
}

function removeResultBar(): void {
  document.querySelectorAll("#snapforge-result-bar").forEach((el) => el.remove());
  bar?.remove();
  bar = null;
}

// Make globally accessible on window for direct script invocation
(window as any).__snapforge_show_result_bar = showResultBar;

if (!(window as any).__snapforge_result_bar_listener_registered) {
  (window as any).__snapforge_result_bar_listener_registered = true;
  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message.type === "SHOW_RESULT_BAR") {
      showResultBar(message.payload);
      sendResponse({ shown: true });
      return true;
    }
    if (message.type === "CAPTURE_STARTING") {
      showCapturingToast(message.payload?.mode);
      sendResponse({ shown: true });
      return true;
    }
    return false;
  });
}

function showCapturingToast(mode?: string): void {
  const modeName: Record<string, string> = {
    "full-page": "Full Page",
    "visible-area": "Visible Area",
  };
  const modeText = modeName[mode || ""] || "Screenshot";

  const toast = document.createElement("div");
  toast.id = "snapforge-capturing-toast";
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #1667F2;
    color: white;
    padding: 12px 18px;
    border-radius: 0;
    box-shadow: 0 8px 16px rgba(22,103,242,0.25);
    font-family: ${FONT_STACK};
    font-size: 13px;
    font-weight: 600;
    z-index: 2147483647;
    pointer-events: none;
    animation: slideIn 0.2s ease;
  `;
  toast.textContent = `Capturing ${modeText}...`;

  const styleEl = document.createElement("style");
  styleEl.textContent = `@keyframes slideIn { from { transform: translateY(-10px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }`;
  document.head.appendChild(styleEl);

  document.body.appendChild(toast);

  // Remove after 3 seconds or when capture completes
  setTimeout(() => {
    toast.remove();
    styleEl.remove();
  }, 3000);
}
