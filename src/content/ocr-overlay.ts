import type { CaptureRegion } from "../types";

import { T, FONT_FAMILY, applyOverlayTheme, alpha, SQUIRCLE_CSS } from "../ui/overlay-kit";
import { icon } from "../ui/ds/icons";

/** Same family as src/ui/overlay-kit.ts — this file styles a shadow root. */
const FONT_STACK = FONT_FAMILY;

/** GoFully DS v2 roles as CSS variables on the shadow host (Figma: Overlay / Capture text · *). */
function setVars(el: HTMLElement): void {
  const v: Record<string, string> = {
    "--gf-bg-surface": T.surface, "--gf-bg-sunken": T.surfaceSunken, "--gf-bg-hover": T.surfaceAlt,
    "--gf-border": T.border, "--gf-border-strong": T.borderStrong,
    "--gf-text": T.text, "--gf-text-2": T.textMuted, "--gf-text-3": T.textFaint,
    "--gf-brand": T.accent, "--gf-brand-hover": T.accentHover, "--gf-on-brand": T.onAccent,
    "--gf-focus": T.focus, "--gf-focus-tint": alpha(T.focus, 0.08), "--gf-shade": T.shade, "--gf-shadow-lg": T.shadowLg,
    "--gf-error": T.danger, "--gf-success": T.success,
    "--gf-accent-tint": T.accentBg, "--gf-ink-key": alpha(T.surface, 0.16), "--gf-ink-soft": alpha(T.surface, 0.72),
  };
  for (const [k, val] of Object.entries(v)) el.style.setProperty(k, val);
}

// Matches result-bar.ts's shutter sound — every capture mode confirms with
// the same click, and Capture Text (OCR) was the one mode that never played
// it at all.
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

  setVars(host);
  void applyOverlayTheme().then(() => { if (host) setVars(host); });

  const style = document.createElement("style");
  style.textContent = SQUIRCLE_CSS + `
    @font-face {
      font-family: 'GoFully Inter';
      src: url('${chrome.runtime.getURL("assets/inter-latin-wght-normal.woff2")}') format('woff2');
      font-weight: 100 900;
      font-display: swap;
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    .overlay {
      position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
      z-index: 2147483646; cursor: crosshair;
      background: var(--gf-shade);
      transition: background 0.15s ease;
      user-select: none;
    }
    .overlay.active { background: transparent; }

    .hint {
      position: fixed; top: 16px; left: 50%; transform: translateX(-50%);
      display: flex; align-items: center; gap: 10px; white-space: nowrap;
      pointer-events: none; z-index: 2147483647;
      animation: fadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      background: var(--gf-text); color: var(--gf-bg-surface);
      padding: 8px 14px; border-radius: 999px; box-shadow: var(--gf-shadow-lg);
      font: 500 13px/20px ${FONT_STACK};
    }
    .hint-icon { display: inline-flex; color: var(--gf-focus); }
    .hint kbd { font: 500 11px/16px ${FONT_STACK}; padding: 1px 6px; border-radius: 4px; background: var(--gf-ink-key); }
    .hint .soft { color: var(--gf-ink-soft); }
    @keyframes fadeIn { from { opacity: 0; transform: translate(-50%, -6px); } to { opacity: 1; transform: translate(-50%, 0); } }
    @keyframes cardIn { from { opacity: 0; transform: translateY(-8px) scale(.98); } to { opacity: 1; transform: none; } }

    .selection {
      position: fixed; z-index: 2147483647;
      border: 2px solid var(--gf-focus);
      background: var(--gf-focus-tint);
      box-shadow: 0 0 0 99999px var(--gf-shade);
      display: none;
      box-sizing: border-box;
      cursor: crosshair;
      border-radius: 2px;
    }

    .badge {
      position: absolute; top: -28px; left: 0;
      background: var(--gf-brand); color: var(--gf-on-brand);
      font: 500 11px/16px ${FONT_STACK};
      padding: 2px 8px; border-radius: 6px;
      white-space: nowrap; pointer-events: none;
      display: flex; align-items: center; gap: 4px;
    }
    .badge.bottom { top: auto; bottom: -28px; }

    /* Result card — Figma: Overlay / Capture text · result */
    .ocr-modal {
      position: fixed; top: 16px; right: 16px;
      width: 440px; max-width: calc(100vw - 32px);
      background: var(--gf-bg-surface); border: 1px solid var(--gf-border);
      border-radius: 12px;
      box-shadow: var(--gf-shadow-lg);
      z-index: 2147483647;
      padding: 16px;
      display: flex; flex-direction: column; gap: 12px;
      font: 400 14px/20px ${FONT_STACK};
      color: var(--gf-text);
      animation: cardIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    }
    @media (prefers-reduced-motion: reduce) { .hint, .ocr-modal { animation: none; } }
    .ocr-header { display: flex; align-items: flex-start; gap: 10px; }
    .ocr-tile { width: 32px; height: 32px; border-radius: 8px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; background: var(--gf-accent-tint); color: var(--gf-brand); }
    .ocr-heading { flex: 1; min-width: 0; display: flex; flex-direction: column; }
    .ocr-title { font-size: 14px; font-weight: 500; line-height: 20px; }
    .ocr-meta { font-size: 12px; line-height: 16px; color: var(--gf-text-3); font-variant-numeric: tabular-nums; }
    .ocr-close {
      background: transparent; border: none; color: var(--gf-text-3);
      cursor: pointer; width: 24px; height: 24px; border-radius: 6px; display: flex; align-items: center; justify-content: center;
    }
    .ocr-close:hover { color: var(--gf-text); background: var(--gf-bg-hover); }
    .ocr-textarea {
      width: 100%; height: 150px;
      background: var(--gf-bg-sunken); border: 1px solid transparent;
      border-radius: 8px; color: var(--gf-text);
      font: 400 13px/19.5px ${FONT_STACK};
      padding: 10px 12px; resize: vertical; outline: none;
    }
    .ocr-textarea:focus { border-color: var(--gf-focus); background: var(--gf-bg-surface); box-shadow: 0 0 0 3px var(--gf-focus-tint); }
    .ocr-footer { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; }
    .ocr-btn {
      height: 32px; padding: 0 12px; border-radius: 999px; font: 500 12px/1 ${FONT_STACK};
      cursor: pointer; border: 1px solid transparent; display: inline-flex; align-items: center; gap: 6px;
      white-space: nowrap; flex: none; transition: background .15s;
    }
    .ocr-btn:focus-visible, .ocr-close:focus-visible { outline: none; box-shadow: 0 0 0 3px var(--gf-focus); }
    .ocr-btn.secondary { background: var(--gf-bg-surface); color: var(--gf-text); border-color: var(--gf-border-strong); }
    .ocr-btn.secondary:hover { background: var(--gf-bg-hover); }
    .ocr-btn.primary { background: var(--gf-brand); color: var(--gf-on-brand); }
    .ocr-btn.primary:hover { background: var(--gf-brand-hover); }
    .ocr-btn.ghost { background: transparent; color: var(--gf-text-2); margin-left: auto; padding: 0 8px; }
    .ocr-footer .ocr-btn.primary { padding: 0 14px; }
    .ocr-btn.ghost:hover { background: var(--gf-bg-hover); color: var(--gf-text); }
    .ocr-loading {
      display: flex; align-items: center; gap: 10px;
      padding: 8px 0 4px; color: var(--gf-text-2); font-size: 13px;
    }
    .spinner { display: inline-flex; color: var(--gf-brand); animation: spin 0.9s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .ocr-empty { padding: 4px 0; color: var(--gf-text-2); font-size: 13px; line-height: 19.5px; }
    .ocr-error-msg { color: var(--gf-error); font-size: 13px; line-height: 19.5px; }

    .toast {
      position: fixed; bottom: 24px; left: 50%;
      transform: translateX(-50%) translateY(16px);
      display: flex; align-items: center; gap: 8px;
      background: var(--gf-text); color: var(--gf-bg-surface);
      padding: 8px 14px; border-radius: 999px;
      font: 500 13px/20px ${FONT_STACK};
      box-shadow: var(--gf-shadow-lg);
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
    <span class="hint-icon">${icon("text-ocr", 16)}</span>
    <span>Drag over the text you want</span>
    <kbd>Esc</kbd><span class="soft">cancel</span>
  `;

  selection = document.createElement("div");
  selection.className = "selection";

  badge = document.createElement("div");
  badge.className = "badge";
  badge.innerHTML = `${icon("text-ocr", 12)}<span>Capture text</span>`;
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
    const label = document.createElement("span");
    label.textContent = msg;
    t.innerHTML = `<span style="display:inline-flex;color:var(--gf-focus)">${icon("success", 16)}</span>`;
    t.appendChild(label);
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
  resultModal.setAttribute("role", "dialog");
  resultModal.setAttribute("aria-label", "Capture text");
  resultModal.innerHTML = `
    <div class="ocr-header">
        <div class="ocr-tile">${icon("text-ocr", 18)}</div>
        <div class="ocr-heading"><div class="ocr-title">Reading text</div><div class="ocr-meta" id="ocr-meta-text">On your device</div></div>
        <button class="ocr-close" id="ocr-close-btn" aria-label="Close">${icon("close", 16)}</button>
      </div>
    <div class="ocr-loading" id="ocr-loading">
      <span class="spinner">${icon("loader", 18)}</span>
      <span>Reading the text in your selection…</span>
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
        <div class="ocr-tile">${icon("text-ocr", 18)}</div>
        <div class="ocr-heading"><div class="ocr-title">No text found</div><div class="ocr-meta" id="ocr-meta-text">Nothing readable in that area</div></div>
        <button class="ocr-close" id="ocr-close-btn" aria-label="Close">${icon("close", 16)}</button>
      </div>
        <div class="ocr-empty">Try a larger area, or zoom the page so the text is bigger, then capture again.</div>
        <div class="ocr-footer"><button class="ocr-btn secondary" id="ocr-done-btn">Close</button></div>
      `;
      resultModal.querySelector("#ocr-close-btn")?.addEventListener("click", () => stopOCRSelection());
      resultModal.querySelector("#ocr-done-btn")?.addEventListener("click", () => stopOCRSelection());
      return;
    }

    // Auto-copy to clipboard like CleanShot X
    playShutterSound();
    try {
      await navigator.clipboard.writeText(text);
      showToast("Copied to clipboard");
    } catch {
      // ignore
    }

    resultModal.innerHTML = `
    <div class="ocr-header">
        <div class="ocr-tile">${icon("text-ocr", 18)}</div>
        <div class="ocr-heading"><div class="ocr-title">Text captured</div><div class="ocr-meta" id="ocr-meta-text"></div></div>
        <button class="ocr-close" id="ocr-close-btn" aria-label="Close">${icon("close", 16)}</button>
      </div>
      <textarea class="ocr-textarea" id="ocr-text-content" placeholder="Extracted text" aria-label="Captured text"></textarea>
      <div class="ocr-footer">
        <button class="ocr-btn primary" id="ocr-copy-btn">${icon("copy", 14)}Copy text</button>
        <button class="ocr-btn secondary" id="ocr-copy-json-btn" title="Copy as JSON (one line per array item)">Copy as JSON</button>
        <button class="ocr-btn secondary" id="ocr-md-btn" title="Export as Markdown">${icon("download", 14)}Markdown</button>
        <button class="ocr-btn ghost" id="ocr-done-btn">Done</button>
      </div>
    `;

    const textarea = resultModal.querySelector("#ocr-text-content") as HTMLTextAreaElement;
    if (textarea) textarea.value = text;
    const metaEl = resultModal.querySelector("#ocr-meta-text") as HTMLDivElement;
    const describe = (t: string) => {
      const words = t.trim() ? t.trim().split(/\s+/).length : 0;
      return `${words} word${words === 1 ? "" : "s"} · ${t.length} characters · copied`;
    };
    if (metaEl) metaEl.textContent = describe(text);

    textarea?.addEventListener("input", () => {
      if (metaEl) metaEl.textContent = describe(textarea.value).replace(" · copied", "");
    });

    resultModal.querySelector("#ocr-close-btn")?.addEventListener("click", () => stopOCRSelection());
    resultModal.querySelector("#ocr-done-btn")?.addEventListener("click", () => stopOCRSelection());
    resultModal.querySelector("#ocr-copy-btn")?.addEventListener("click", async () => {
      if (textarea) {
        await navigator.clipboard.writeText(textarea.value);
        showToast("Copied to clipboard");
      }
    });
    resultModal.querySelector("#ocr-copy-json-btn")?.addEventListener("click", async () => {
      if (!textarea) return;
      const lines = textarea.value.split("\n").filter((l) => l.trim().length > 0);
      await navigator.clipboard.writeText(JSON.stringify(lines, null, 2));
      showToast("Copied as JSON");
    });
    resultModal.querySelector("#ocr-md-btn")?.addEventListener("click", () => {
      if (!textarea) return;
      const md = `# Extracted text\n\nSource: [${document.title}](${location.href})\n\n\`\`\`\n${textarea.value}\n\`\`\`\n`;
      const blob = new Blob([md], { type: "text/markdown" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "gofully-ocr-text.md";
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      showToast("Exported as Markdown");
    });
  } catch (err: any) {
    resultModal.innerHTML = `
    <div class="ocr-header">
        <div class="ocr-tile">${icon("alert", 18)}</div>
        <div class="ocr-heading"><div class="ocr-title">Couldn’t read the text</div><div class="ocr-meta" id="ocr-meta-text">Text capture failed</div></div>
        <button class="ocr-close" id="ocr-close-btn" aria-label="Close">${icon("close", 16)}</button>
      </div>
      <div class="ocr-error-msg" id="ocr-error-text"></div>
      <div class="ocr-footer"><button class="ocr-btn secondary" id="ocr-done-btn">Close</button></div>
    `;
    const errEl = resultModal.querySelector("#ocr-error-text") as HTMLDivElement;
    if (errEl) errEl.textContent = err?.message || "Failed to process text";

    resultModal.querySelector("#ocr-close-btn")?.addEventListener("click", () => stopOCRSelection());
    resultModal.querySelector("#ocr-done-btn")?.addEventListener("click", () => stopOCRSelection());
  }
}
