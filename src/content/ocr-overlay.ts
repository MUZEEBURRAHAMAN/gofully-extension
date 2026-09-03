import type { CaptureRegion } from "../types";

/** Kept in step with src/ui/overlay-kit.ts — this file styles a shadow root. */
const FONT_STACK =
  `'GoFully Archivo', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif`;


// Guard against duplicate injections
if (!(window as any).__snapforge_ocr_listener_registered) {
  (window as any).__snapforge_ocr_listener_registered = true;
  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message.type === "START_OCR_MODE") {
      startOCRSelection();
      sendResponse({ started: true });
      return true;
    }
    return false;
  });
}

let host: HTMLDivElement | null = null;
let shadow: ShadowRoot | null = null;
let overlay: HTMLDivElement | null = null;
let selection: HTMLDivElement | null = null;
let badge: HTMLDivElement | null = null;
let hint: HTMLDivElement | null = null;
let resultModal: HTMLDivElement | null = null;

let startX = 0;
let startY = 0;
let isDragging = false;
let selectedRegion: CaptureRegion | null = null;

export function startOCRSelection(): void {
  cleanup();
  createUI();
  document.addEventListener("mousedown", handleMouseDown, true);
  document.addEventListener("mousemove", handleMouseMove, true);
  document.addEventListener("mouseup", handleMouseUp, true);
  document.addEventListener("keydown", handleKeydown, true);
}

export function stopOCRSelection(): void {
  cleanup();
  document.removeEventListener("mousedown", handleMouseDown, true);
  document.removeEventListener("mousemove", handleMouseMove, true);
  document.removeEventListener("mouseup", handleMouseUp, true);
  document.removeEventListener("keydown", handleKeydown, true);
}

function createUI(): void {
  // Remove any stale host elements from previous injections
  document.querySelectorAll("#snapforge-ocr-host").forEach((el) => el.remove());

  host = document.createElement("div");
  host.id = "snapforge-ocr-host";
  shadow = host.attachShadow({ mode: "closed" });

  const style = document.createElement("style");
  style.textContent = `
    @font-face {
      font-family: 'GoFully Archivo';
      src: url('${chrome.runtime.getURL("assets/Archivo.woff2")}') format('woff2-variations'),
           url('${chrome.runtime.getURL("assets/Archivo.woff2")}') format('woff2');
      font-weight: 100 900;
      font-display: swap;
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    .overlay {
      position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
      z-index: 2147483646; cursor: crosshair;
      background: rgba(16, 24, 40, 0.28);
      transition: background 0.15s ease;
      user-select: none;
    }
    .overlay.active { background: transparent; }

    .hint {
      position: fixed; top: 50%; left: 50%;
      transform: translate(-50%, -50%);
      display: flex; flex-direction: column; align-items: center; gap: 14px;
      pointer-events: none; z-index: 2147483647;
      animation: fadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      background: #ffffff;
      padding: 22px 30px;
      border-radius: 0;
      border: 1px solid #C8D0D9;
      box-shadow: 0 10px 30px rgba(15, 23, 42, 0.15);
    }
    .hint-icon {
      width: 44px; height: 44px; border-radius: 0;
      background: #EDF1FE; border: 1.5px solid #1667F2;
      display: flex; align-items: center; justify-content: center;
      color: #1667F2;
    }
    .hint-text {
      color: #101828; font: 600 15px/1.4 ${FONT_STACK};
      letter-spacing: -0.01em;
    }
    .hint-sub {
      color: #667085; font: 400 12px/1.4 ${FONT_STACK};
      display: flex; gap: 10px;
    }
    .hint-sub kbd {
      background: #F1F3F7;
      padding: 2px 6px;
      border-radius: 0;
      border: 1px solid #C8D0D9;
      color: #344054;
      font-weight: 600;
      font-size: 11px;
    }
    @keyframes fadeIn { from { opacity: 0; transform: translate(-50%, -46%); } to { opacity: 1; transform: translate(-50%, -50%); } }

    .selection {
      position: fixed; z-index: 2147483647;
      border: 2px solid #1667F2;
      background: rgba(22, 103, 242, 0.08);
      box-shadow: 0 0 0 99999px rgba(16, 24, 40, 0.28);
      display: none;
      box-sizing: border-box;
      cursor: crosshair;
      border-radius: 0;
    }

    .badge {
      position: absolute; top: -30px; left: 0;
      background: #1667F2; color: #FFFFFF;
      font: 700 11px/1.2 ${FONT_STACK};
      padding: 5px 9px; border-radius: 0;
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
      white-space: nowrap; pointer-events: none;
      display: flex; align-items: center; gap: 4px;
    }
    .badge.bottom { top: auto; bottom: -30px; }

    /* OCR Result Modal */
    .ocr-modal {
      position: fixed; top: 50%; left: 50%;
      transform: translate(-50%, -50%);
      width: 500px; max-width: 90vw;
      background: #ffffff; border: 1px solid #E3E8EF;
      border-radius: 0;
      box-shadow: 0 20px 45px rgba(15, 23, 42, 0.18);
      z-index: 2147483647;
      padding: 20px;
      display: flex; flex-direction: column; gap: 14px;
      font-family: ${FONT_STACK};
      color: #101828;
      animation: fadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .ocr-header {
      display: flex; align-items: center; justify-content: space-between;
    }
    .ocr-title {
      font-size: 14px; font-weight: 700; color: #101828;
      display: flex; align-items: center; gap: 8px;
    }
    .ocr-close {
      background: transparent; border: none; color: #98A2B3;
      cursor: pointer; padding: 4px; border-radius: 0;
    }
    .ocr-close:hover { color: #101828; background: #F1F3F7; }
    .ocr-textarea {
      width: 100%; height: 160px;
      background: #F7F8FA; border: 1px solid #C8D0D9;
      border-radius: 0; color: #101828;
      font-size: 13px; font-family: monospace; line-height: 1.5;
      padding: 12px; resize: none; outline: none;
    }
    .ocr-textarea:focus { border-color: #1667F2; background: #ffffff; }
    .ocr-footer {
      display: flex; align-items: center; justify-content: space-between;
    }
    .ocr-meta { font-size: 12px; color: #667085; }
    .ocr-actions { display: flex; gap: 8px; }
    .ocr-btn {
      padding: 8px 16px; border-radius: 0; font-size: 12px; font-weight: 700;
      cursor: pointer; border: 1px solid transparent; display: flex; align-items: center; gap: 6px;
    }
    .ocr-btn.secondary { background: #F1F3F7; color: #344054; border-color: #C8D0D9; }
    .ocr-btn.secondary:hover { background: #E3E8EF; color: #101828; }
    .ocr-btn.primary { background: #1667F2; color: #FFFFFF; }
    .ocr-btn.primary:hover { background: #1257D8; }
    .ocr-loading {
      display: flex; align-items: center; justify-content: center; gap: 10px;
      padding: 40px 0; color: #1667F2; font-size: 14px; font-weight: 600;
    }
    .spinner {
      width: 20px; height: 20px; border: 2px solid rgba(22,103,242,0.2);
      border-top-color: #1667F2; border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    .toast {
      position: fixed; bottom: 24px; left: 50%;
      transform: translateX(-50%) translateY(40px);
      background: #039855; color: #ffffff;
      padding: 8px 16px; border-radius: 0;
      font: 600 12px/1.2 ${FONT_STACK};
      box-shadow: 0 4px 16px rgba(0,0,0,0.15);
      opacity: 0; pointer-events: none;
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      z-index: 2147483647;
    }
    .toast.show { transform: translateX(-50%) translateY(0); opacity: 1; }
  `;

  overlay = document.createElement("div");
  overlay.className = "overlay";

  hint = document.createElement("div");
  hint.className = "hint";
  hint.innerHTML = `
    <div class="hint-icon">
      <!-- Hugeicons: text-font -->
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <path d="M4 7V4h16v3"/>
        <path d="M9 20h6"/>
        <path d="M12 4v16"/>
        <path d="M3 12h3"/>
        <path d="M18 12h3"/>
      </svg>
    </div>
    <div class="hint-text">Select area to capture text (OCR)</div>
    <div class="hint-sub">
      <span><kbd>Esc</kbd> Cancel</span>
    </div>
  `;

  selection = document.createElement("div");
  selection.className = "selection";

  badge = document.createElement("div");
  badge.className = "badge";
  badge.innerHTML = `
    <!-- Hugeicons: text-font -->
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <path d="M4 7V4h16v3"/>
      <path d="M9 20h6"/>
      <path d="M12 4v16"/>
    </svg>
    <span>OCR Scan Area</span>
  `;
  selection.appendChild(badge);

  const toastEl = document.createElement("div");
  toastEl.className = "toast";
  toastEl.id = "ocr-toast";

  shadow.appendChild(style);
  shadow.appendChild(overlay);
  shadow.appendChild(hint);
  shadow.appendChild(selection);
  shadow.appendChild(toastEl);
  document.body.appendChild(host);
}

function cleanup(): void {
  document.querySelectorAll("#snapforge-ocr-host").forEach((el) => el.remove());
  host?.remove();
  host = null;
  shadow = null;
  overlay = null;
  selection = null;
  badge = null;
  hint = null;
  resultModal = null;
  selectedRegion = null;
}

function showToast(msg: string): void {
  if (!shadow) return;
  const t = shadow.getElementById("ocr-toast");
  if (t) {
    t.textContent = msg;
    t.classList.add("show");
    setTimeout(() => t.classList.remove("show"), 2200);
  }
}

function updateSelectionUI(x: number, y: number, w: number, h: number): void {
  if (!selection || !badge) return;
  const rx = Math.max(0, x);
  const ry = Math.max(0, y);
  const rw = Math.max(1, w);
  const rh = Math.max(1, h);

  selection.style.left = `${rx}px`;
  selection.style.top = `${ry}px`;
  selection.style.width = `${rw}px`;
  selection.style.height = `${rh}px`;

  if (ry < 40) {
    badge.classList.add("bottom");
  } else {
    badge.classList.remove("bottom");
  }

  selectedRegion = { x: rx, y: ry, width: rw, height: rh };
}

function handleMouseDown(e: MouseEvent): void {
  if (resultModal) return;
  isDragging = true;
  startX = e.clientX;
  startY = e.clientY;
  if (hint) hint.style.display = "none";
  if (overlay) overlay.classList.add("active");
  if (selection) selection.style.display = "block";
  if (badge) badge.style.display = "flex";

  updateSelectionUI(startX, startY, 0, 0);
}

function handleMouseMove(e: MouseEvent): void {
  if (!isDragging) return;
  const x = Math.min(startX, e.clientX);
  const y = Math.min(startY, e.clientY);
  const w = Math.abs(e.clientX - startX);
  const h = Math.abs(e.clientY - startY);
  updateSelectionUI(x, y, w, h);
}

async function handleMouseUp(_e: MouseEvent): Promise<void> {
  if (!isDragging) return;
  isDragging = false;

  if (selectedRegion && selectedRegion.width > 15 && selectedRegion.height > 15) {
    if (overlay) overlay.style.display = "none";
    if (selection) selection.style.display = "none";
    await processOCR(selectedRegion);
  } else {
    stopOCRSelection();
  }
}

function handleKeydown(e: KeyboardEvent): void {
  if (e.key === "Escape") {
    stopOCRSelection();
  }
}

function extractDOMTextInRegion(region: CaptureRegion): string {
  try {
    const rx = region.x;
    const ry = region.y;
    const rw = region.width;
    const rh = region.height;

    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode(node) {
          if (!node.textContent || !node.textContent.trim()) return NodeFilter.FILTER_REJECT;
          const parent = node.parentElement;
          if (!parent) return NodeFilter.FILTER_REJECT;
          if (parent.closest("#snapforge-ocr-host") || parent.closest("#snapforge-result-bar")) {
            return NodeFilter.FILTER_REJECT;
          }
          const rect = parent.getBoundingClientRect();
          if (
            rect.bottom >= ry &&
            rect.top <= ry + rh &&
            rect.right >= rx &&
            rect.left <= rx + rw
          ) {
            return NodeFilter.FILTER_ACCEPT;
          }
          return NodeFilter.FILTER_SKIP;
        },
      }
    );

    const extractedLines: string[] = [];
    let currentNode = walker.nextNode();
    while (currentNode) {
      const txt = (currentNode.textContent || "").trim();
      if (txt) extractedLines.push(txt);
      currentNode = walker.nextNode();
    }

    return extractedLines.join("\n").trim();
  } catch {
    return "";
  }
}

async function processOCR(region: CaptureRegion): Promise<void> {
  if (!shadow) return;

  // 1. Try instant high-fidelity DOM text extraction first
  const domText = extractDOMTextInRegion(region);

  // Render OCR modal
  resultModal = document.createElement("div");
  resultModal.className = "ocr-modal";
  resultModal.innerHTML = `
    <div class="ocr-header">
      <div class="ocr-title">
        <!-- Hugeicons: text-font -->
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1667F2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M4 7V4h16v3M9 20h6M12 4v16M3 12h3M18 12h3"/>
        </svg>
        Recognizing Text...
      </div>
      <button class="ocr-close" id="ocr-close-btn">
        <!-- Hugeicons: cancel-01 -->
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>
    <div class="ocr-loading" id="ocr-loading">
      <div class="spinner"></div>
      <span>Extracting text...</span>
    </div>
  `;
  shadow.appendChild(resultModal);

  resultModal.querySelector("#ocr-close-btn")?.addEventListener("click", () => stopOCRSelection());

  try {
    let text = domText;

    // If DOM text is empty (e.g. image text, canvas, video), invoke OCR engine
    if (!text || text.length < 3) {
      const resp = await chrome.runtime.sendMessage({
        type: "EXECUTE_OCR",
        payload: { region },
      });
      if (resp?.text) {
        text = resp.text.trim();
      } else if (resp?.error && !text) {
        throw new Error(resp.error);
      }
    }

    if (!text) {
      resultModal.innerHTML = `
        <div class="ocr-header">
          <div class="ocr-title">Capture Text (OCR)</div>
          <button class="ocr-close" id="ocr-close-btn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div style="padding: 24px 0; text-align: center; color: #98A2B3; font-size: 13px;">
          No readable text found in the selected area.
        </div>
        <div class="ocr-footer" style="justify-content: flex-end;">
          <button class="ocr-btn secondary" id="ocr-done-btn">Close</button>
        </div>
      `;
      resultModal.querySelector("#ocr-close-btn")?.addEventListener("click", () => stopOCRSelection());
      resultModal.querySelector("#ocr-done-btn")?.addEventListener("click", () => stopOCRSelection());
      return;
    }

    // Auto-copy to clipboard like CleanShot X
    try {
      await navigator.clipboard.writeText(text);
      showToast("Copied to clipboard!");
    } catch {
      // ignore
    }

    resultModal.innerHTML = `
      <div class="ocr-header">
        <div class="ocr-title">
          <!-- Hugeicons: checkmark-circle-02 -->
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#039855" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 6L9 17l-5-5"/>
          </svg>
          Extracted Text
        </div>
        <button class="ocr-close" id="ocr-close-btn" aria-label="Close">
          <!-- Hugeicons: cancel-01 -->
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
      <textarea class="ocr-textarea" id="ocr-text-content" readonly></textarea>
      <div class="ocr-footer">
        <div class="ocr-meta" id="ocr-meta-text"></div>
        <div class="ocr-actions">
          <button class="ocr-btn secondary" id="ocr-done-btn">Done</button>
          <button class="ocr-btn primary" id="ocr-copy-btn">
            <!-- Hugeicons: copy-01 -->
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="1"/>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
            </svg>
            Copy Text
          </button>
        </div>
      </div>
    `;

    const textarea = resultModal.querySelector("#ocr-text-content") as HTMLTextAreaElement;
    if (textarea) textarea.value = text;
    const metaEl = resultModal.querySelector("#ocr-meta-text") as HTMLDivElement;
    if (metaEl) metaEl.textContent = `${text.length} characters`;

    resultModal.querySelector("#ocr-close-btn")?.addEventListener("click", () => stopOCRSelection());
    resultModal.querySelector("#ocr-done-btn")?.addEventListener("click", () => stopOCRSelection());
    resultModal.querySelector("#ocr-copy-btn")?.addEventListener("click", async () => {
      if (textarea) {
        await navigator.clipboard.writeText(textarea.value);
        showToast("Copied to clipboard!");
      }
    });
  } catch (err: any) {
    resultModal.innerHTML = `
      <div class="ocr-header">
        <div class="ocr-title">OCR Recognition Failed</div>
        <button class="ocr-close" id="ocr-close-btn" aria-label="Close">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>
      <div class="ocr-error-msg" id="ocr-error-text" style="padding: 20px 0; color: #ef4444; font-size: 13px;"></div>
      <div class="ocr-footer" style="justify-content: flex-end;">
        <button class="ocr-btn secondary" id="ocr-done-btn">Close</button>
      </div>
    `;
    const errEl = resultModal.querySelector("#ocr-error-text") as HTMLDivElement;
    if (errEl) errEl.textContent = err?.message || "Failed to process text";

    resultModal.querySelector("#ocr-close-btn")?.addEventListener("click", () => stopOCRSelection());
    resultModal.querySelector("#ocr-done-btn")?.addEventListener("click", () => stopOCRSelection());
  }
}
