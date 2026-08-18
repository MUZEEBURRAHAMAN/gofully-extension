let bar: HTMLDivElement | null = null;

function playShutterSound(): void {
  try {
    const url = chrome.runtime.getURL("assets/shutter.mp3");
    const audio = new Audio(url);
    audio.volume = 0.5;
    audio.play().catch(() => {});
  } catch { /* ignore */ }
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

// Phosphor icon SVG strings (256×256 viewBox, fill="currentColor")
const PH = {
  check: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor" style="width:15px;height:15px;display:block;flex-shrink:0"><path d="M173.66,98.34a8,8,0,0,1,0,11.32l-56,56a8,8,0,0,1-11.32,0l-24-24a8,8,0,0,1,11.32-11.32L112,148.69l50.34-50.35A8,8,0,0,1,173.66,98.34Z"/></svg>`,
  x: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor" style="width:13px;height:13px;display:block;flex-shrink:0"><path d="M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z"/></svg>`,
  ruler: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor" style="width:11px;height:11px;display:block;flex-shrink:0"><path d="M235.32,73.37,182.63,20.69a16,16,0,0,0-22.63,0L20.68,160a16,16,0,0,0,0,22.63l52.69,52.68a16,16,0,0,0,22.63,0L235.32,96A16,16,0,0,0,235.32,73.37ZM84.68,224,32,171.31l32-32,26.34,26.35a8,8,0,0,0,11.32-11.32L75.31,128,96,107.31l26.34,26.35a8,8,0,0,0,11.32-11.32L107.31,96,128,75.31l26.34,26.35a8,8,0,0,0,11.32-11.32L139.31,64l32-32L224,84.69Z"/></svg>`,
  lightning: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor" style="width:11px;height:11px;display:block;flex-shrink:0"><path d="M215.79,118.17a8,8,0,0,0-5-5.66L153.18,90.9l14.66-73.33a8,8,0,0,0-13.69-7l-112,120a8,8,0,0,0,3,13l57.63,21.61L88.16,238.43a8,8,0,0,0,13.69,7l112-120A8,8,0,0,0,215.79,118.17ZM109.37,214l10.47-52.38a8,8,0,0,0-5-9.06L62,132.71l84.62-90.66L136.16,94.43a8,8,0,0,0,5,9.06l52.8,19.8Z"/></svg>`,
  copy: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor" style="width:13px;height:13px;display:block;flex-shrink:0"><path d="M216,32H88a8,8,0,0,0-8,8V80H40a8,8,0,0,0-8,8V216a8,8,0,0,0,8,8H168a8,8,0,0,0,8-8V176h40a8,8,0,0,0,8-8V40A8,8,0,0,0,216,32ZM160,208H48V96H160Zm48-48H176V88a8,8,0,0,0-8-8H96V48H208Z"/></svg>`,
  downloadSimple: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor" style="width:13px;height:13px;display:block;flex-shrink:0"><path d="M224,144v64a8,8,0,0,1-8,8H40a8,8,0,0,1-8-8V144a8,8,0,0,1,16,0v56H208V144a8,8,0,0,1,16,0Zm-101.66,5.66a8,8,0,0,0,11.32,0l40-40a8,8,0,0,0-11.32-11.32L136,124.69V32a8,8,0,0,0-16,0v92.69L93.66,98.34a8,8,0,0,0-11.32,11.32Z"/></svg>`,
  filePdf: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor" style="width:13px;height:13px;display:block;flex-shrink:0"><path d="M224,152a8,8,0,0,1-8,8H192v16h16a8,8,0,0,1,0,16H192v16a8,8,0,0,1-16,0V152a8,8,0,0,1,8-8h32A8,8,0,0,1,224,152ZM92,172a28,28,0,0,1-28,28H56v8a8,8,0,0,1-16,0V152a8,8,0,0,1,8-8H64A28,28,0,0,1,92,172Zm-16,0a12,12,0,0,0-12-12H56v24h8A12,12,0,0,0,76,172Zm88,8a36,36,0,0,1-36,36H112a8,8,0,0,1-8-8V152a8,8,0,0,1,8-8h16A36,36,0,0,1,164,180Zm-16,0a20,20,0,0,0-20-20h-8v40h8A20,20,0,0,0,148,180ZM40,112V40A16,16,0,0,1,56,24h96a8,8,0,0,1,5.66,2.34l56,56A8,8,0,0,1,216,88v24a8,8,0,0,1-16,0V96H152a8,8,0,0,1-8-8V40H56v72a8,8,0,0,1-16,0ZM160,80h28.69L160,51.31Z"/></svg>`,
  pencil: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor" style="width:13px;height:13px;display:block;flex-shrink:0"><path d="M227.31,73.37,182.63,28.68a16,16,0,0,0-22.63,0L36.69,152A15.86,15.86,0,0,0,32,163.31V208a16,16,0,0,0,16,16H92.69A15.86,15.86,0,0,0,104,219.31L227.31,96a16,16,0,0,0,0-22.63ZM92.69,208H48V163.31l88-88L180.69,120ZM192,108.68,147.31,64l24-24L216,84.68Z"/></svg>`,
};

export function showResultBar(info: {
  width: number;
  height: number;
  mode: string;
  method: string;
}): void {
  removeResultBar();
  playShutterSound();

  bar = document.createElement("div");
  bar.id = "snapforge-result-bar";
  const shadow = bar.attachShadow({ mode: "closed" });

  const style = document.createElement("style");
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700;800&display=swap');

    :host {
      all: initial;
      position: fixed; top: 0; left: 0; right: 0; bottom: 0;
      z-index: 2147483647;
      pointer-events: none;
      font-family: 'Geist', -apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", sans-serif;
      -webkit-font-smoothing: antialiased;
    }

    .backdrop {
      position: fixed; top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(15, 23, 42, 0.45);
      pointer-events: all;
      animation: fadeIn 0.15s ease;
      backdrop-filter: blur(2px);
    }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

    .popup {
      position: fixed; top: 50%; left: 50%;
      transform: translate(-50%, -50%);
      width: 360px;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      box-shadow: 0 20px 60px rgba(15,23,42,0.15), 0 4px 16px rgba(15,23,42,0.08);
      pointer-events: all;
      animation: popIn 0.22s cubic-bezier(0.16, 1, 0.3, 1);
      overflow: hidden;
    }
    @keyframes popIn {
      from { transform: translate(-50%, -53%) scale(0.96); opacity: 0; }
      to   { transform: translate(-50%, -50%) scale(1);    opacity: 1; }
    }

    /* Success strip */
    .success-strip {
      display: flex; align-items: center; gap: 12px;
      padding: 14px 16px;
      background: #f0fdf4;
      border-bottom: 1px solid #bbf7d0;
    }
    .check-circle {
      width: 32px; height: 32px;
      background: #22c55e; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0; color: #fff;
    }
    .success-text { flex: 1; }
    .success-title {
      font-size: 13.5px; font-weight: 700; color: #166534;
      letter-spacing: -0.2px; line-height: 1.2;
      font-family: 'Geist', -apple-system, sans-serif;
    }
    .success-sub {
      font-size: 11px; font-weight: 500; color: #16a34a;
      margin-top: 2px;
      font-family: 'Geist', -apple-system, sans-serif;
    }
    .dismiss-btn {
      width: 28px; height: 28px;
      border: none; background: none; cursor: pointer;
      color: #4ade80; border-radius: 6px;
      display: flex; align-items: center; justify-content: center;
      transition: background 0.1s, color 0.1s; flex-shrink: 0;
    }
    .dismiss-btn:hover { background: #dcfce7; color: #166534; }

    /* Meta row */
    .meta-row {
      display: flex; align-items: center; justify-content: space-between;
      padding: 9px 16px;
      border-bottom: 1px solid #f1f5f9;
    }
    .meta-item { display: flex; align-items: center; gap: 5px; color: #94a3b8; }
    .meta-label {
      font-size: 10.5px; font-weight: 500; color: #94a3b8;
      font-family: 'Geist', -apple-system, sans-serif;
    }
    .meta-value {
      font-size: 11.5px; font-weight: 600; color: #475569;
      font-family: 'Geist', -apple-system, sans-serif;
    }
    .meta-sep { width: 1px; height: 14px; background: #e2e8f0; }

    /* Actions */
    .actions { padding: 12px; display: flex; flex-direction: column; gap: 7px; }
    .btn-row { display: flex; gap: 7px; }

    .btn {
      flex: 1; height: 38px;
      border-radius: 8px;
      border: 1.5px solid #e2e8f0;
      background: #ffffff;
      cursor: pointer;
      font-size: 12px; font-weight: 600; color: #475569;
      font-family: 'Geist', -apple-system, sans-serif;
      transition: all 0.12s;
      display: flex; align-items: center; justify-content: center; gap: 5px;
      letter-spacing: -0.1px;
    }
    .btn:hover { background: #f8fafc; border-color: #cbd5e1; color: #1e293b; }
    .btn:active { transform: scale(0.98); }

    .btn-primary {
      background: #2563eb; border-color: #2563eb; color: #fff;
      box-shadow: 0 1px 6px rgba(37,99,235,0.35);
    }
    .btn-primary:hover { background: #1d4ed8; border-color: #1d4ed8; color: #fff; }

    /* Toast */
    .toast {
      position: fixed; bottom: 20px; left: 50%;
      transform: translateX(-50%) translateY(60px);
      background: #0f172a; color: #fff;
      padding: 8px 16px; border-radius: 8px;
      font-size: 12px; font-weight: 600;
      box-shadow: 0 4px 20px rgba(15,23,42,0.2);
      transition: transform 0.22s cubic-bezier(0.16,1,0.3,1), opacity 0.22s;
      pointer-events: none; white-space: nowrap; opacity: 0;
      font-family: 'Geist', -apple-system, sans-serif;
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
    "scrollable-element": "Scrollable Element",
  };

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

    <div class="actions">
      <div class="btn-row">
        <button class="btn btn-primary" id="sf-copy">
          ${PH.copy} Copy Image
        </button>
      </div>
      <div class="btn-row">
        <button class="btn" id="sf-png">
          ${PH.downloadSimple} Save PNG
        </button>
        <button class="btn" id="sf-pdf">
          ${PH.filePdf} Save PDF
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
  document.body.appendChild(bar);

  function showToast(msg: string) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    setTimeout(() => toastEl.classList.remove("show"), 2200);
  }

  shadow.getElementById("sf-copy")!.addEventListener("click", async () => {
    try {
      const resp = await chrome.runtime.sendMessage({ type: "GET_CAPTURE_BLOB_URL" });
      if (!resp?.url) { showToast("Nothing to copy"); return; }
      await copyImageFromDataUrl(resp.url);
      showToast("Copied to clipboard!");
    } catch { showToast("Copy failed — try Save PNG"); }
  });

  shadow.getElementById("sf-png")!.addEventListener("click", () => {
    chrome.runtime.sendMessage(
      { type: "EXPORT_CAPTURE", payload: { format: "png" } },
      () => { if (chrome.runtime.lastError) {} showToast("Saved as PNG!"); }
    );
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
  bar?.remove();
  bar = null;
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === "SHOW_RESULT_BAR") {
    showResultBar(message.payload);
    sendResponse({ shown: true });
    return true;
  }
  return false;
});
