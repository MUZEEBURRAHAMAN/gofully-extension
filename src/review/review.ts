import { generatePDF } from "../export/pdf-generator";
import { applyTheme, watchTheme } from "../utils/theme";
import { claimPendingRateNudge, markRatedYes, markDismissed } from "../utils/rate-nudge";

applyTheme();
watchTheme();

const previewImg = document.getElementById("previewImg") as HTMLImageElement;
const emptyState = document.getElementById("emptyState")!;
const dimPill = document.getElementById("dimPill")!;
const methodLabel = document.getElementById("methodLabel")!;
const toastEl = document.getElementById("toast")!;

let currentDataUrl: string | null = null;
let zoomPct = 100;
let naturalWidth = 0;

function showToast(msg: string): void {
  toastEl.textContent = msg;
  toastEl.classList.add("show");
  setTimeout(() => toastEl.classList.remove("show"), 2000);
}

function applyZoom(): void {
  document.getElementById("zoomPct")!.textContent = `${zoomPct}%`;
  if (naturalWidth > 0) {
    previewImg.style.width = `${Math.round((naturalWidth * zoomPct) / 100)}px`;
  }
}

document.getElementById("zoom-in-btn")!.addEventListener("click", () => {
  zoomPct = Math.min(400, zoomPct + 10);
  applyZoom();
});
document.getElementById("zoom-out-btn")!.addEventListener("click", () => {
  zoomPct = Math.max(10, zoomPct - 10);
  applyZoom();
});

async function loadCapture(): Promise<void> {
  try {
    const [blobResp, lastResp] = await Promise.all([
      chrome.runtime.sendMessage({ type: "GET_CAPTURE_BLOB_URL" }),
      chrome.runtime.sendMessage({ type: "GET_LAST_CAPTURE" }),
    ]);

    const dataUrl: string | null = blobResp?.url ?? null;
    if (!dataUrl || !dataUrl.startsWith("data:image/")) {
      emptyState.style.display = "block";
      return;
    }

    currentDataUrl = dataUrl;
    const result = lastResp?.result;
    if (result) {
      const w = Math.round(result.width);
      const h = Math.round(result.height);
      dimPill.textContent = `${w} × ${h}`;
      methodLabel.textContent = result.method === "scroll-stitch" ? "via Scroll" : "via Snapshot";
    }

    previewImg.src = dataUrl;
    previewImg.onload = () => {
      naturalWidth = previewImg.naturalWidth;
      previewImg.style.display = "block";
      emptyState.style.display = "none";
      applyZoom();
    };
  } catch {
    emptyState.style.display = "block";
  }
}

async function toPngBlob(dataUrl: string): Promise<Blob> {
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  if (blob.type === "image/png") return blob;
  const bitmap = await createImageBitmap(blob);
  const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0);
  return canvas.convertToBlob({ type: "image/png" });
}

function getExportFilename(ext: string): string {
  const input = document.getElementById("review-filename") as HTMLInputElement | null;
  const custom = input?.value.trim();
  if (custom) {
    const clean = custom.replace(/[^a-zA-Z0-9._ -]/g, "").trim().replace(/\.+$/, "");
    if (clean) return `${clean}.${ext}`;
  }
  return `gofully-${Date.now()}.${ext}`;
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = Object.assign(document.createElement("a"), { href: url, download: filename });
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

document.getElementById("copy-btn")!.addEventListener("click", async () => {
  if (!currentDataUrl) return;
  try {
    const pngBlob = await toPngBlob(currentDataUrl);
    await navigator.clipboard.write([new ClipboardItem({ "image/png": pngBlob })]);
    showToast("Copied to clipboard");
  } catch {
    showToast("Copy failed");
  }
});

document.getElementById("save-png-btn")!.addEventListener("click", async () => {
  if (!currentDataUrl) return;
  const blob = await toPngBlob(currentDataUrl);
  downloadBlob(blob, getExportFilename("png"));
  showToast("Saved as PNG");
  exportDropMenu.classList.remove("show");
});

document.getElementById("save-webp-btn")!.addEventListener("click", async () => {
  if (!currentDataUrl) return;
  try {
    const pngBlob = await toPngBlob(currentDataUrl);
    const bitmap = await createImageBitmap(pngBlob);
    const oc = new OffscreenCanvas(bitmap.width, bitmap.height);
    oc.getContext("2d")!.drawImage(bitmap, 0, 0);
    const webpBlob = await oc.convertToBlob({ type: "image/webp", quality: 0.92 });
    downloadBlob(webpBlob, getExportFilename("webp"));
    showToast("Saved as WebP");
  } catch {
    showToast("WebP save failed");
  }
  exportDropMenu.classList.remove("show");
});

document.getElementById("save-pdf-btn")!.addEventListener("click", async () => {
  if (!currentDataUrl) return;
  try {
    const pngBlob = await toPngBlob(currentDataUrl);
    const pdfBlob = await generatePDF(pngBlob, "a4");
    downloadBlob(pdfBlob, getExportFilename("pdf"));
    showToast("Saved as PDF");
  } catch {
    showToast("PDF failed");
  }
  exportDropMenu.classList.remove("show");
});

// ─── Export dropdown ─────────────────────────────────────────────────────────
const exportMenuBtn = document.getElementById("export-menu-btn")!;
const exportDropMenu = document.getElementById("export-drop-menu")!;

function positionExportMenu(): void {
  const r = exportMenuBtn.getBoundingClientRect();
  exportDropMenu.style.right = `${window.innerWidth - r.right}px`;
  exportDropMenu.style.left = "auto";
  exportDropMenu.style.top = `${r.bottom + 6}px`;
}

exportMenuBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  const isOpen = exportDropMenu.classList.contains("show");
  if (isOpen) {
    exportDropMenu.classList.remove("show");
  } else {
    positionExportMenu();
    exportDropMenu.classList.add("show");
  }
});
exportDropMenu.addEventListener("click", (e) => e.stopPropagation());
document.addEventListener("click", () => exportDropMenu.classList.remove("show"));

// ─── Edit / Close ─────────────────────────────────────────────────────────────
document.getElementById("edit-btn")!.addEventListener("click", () => {
  chrome.runtime.sendMessage({ type: "OPEN_EDITOR" });
});
document.getElementById("close-btn")!.addEventListener("click", () => window.close());

// ─── Rate nudge (same shared cadence as the editor) ─────────────────────────
async function maybeShowRateNudge(): Promise<void> {
  const due = await claimPendingRateNudge();
  if (!due || document.getElementById("gf-rate-nudge")) return;

  const nudge = document.createElement("div");
  nudge.id = "gf-rate-nudge";
  nudge.innerHTML = `
    <div class="gf-rn-row">
      <div class="gf-rn-star">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
      </div>
      <div style="flex:1">
        <div class="gf-rn-title">Enjoying GoFully?</div>
        <div class="gf-rn-sub">A quick rating helps others discover the extension.</div>
      </div>
      <button class="gf-rn-close" id="gf-rn-close-btn">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>
    <div class="gf-rn-actions">
      <button class="gf-rn-btn gf-rn-btn-primary" id="gf-rn-yes-btn">Yes, rate it</button>
      <button class="gf-rn-btn gf-rn-btn-secondary" id="gf-rn-no-btn">Not now</button>
    </div>
  `;
  document.body.appendChild(nudge);
  requestAnimationFrame(() => nudge.classList.add("show"));

  const dismiss = () => {
    nudge.classList.remove("show");
    setTimeout(() => nudge.remove(), 200);
  };

  document.getElementById("gf-rn-yes-btn")!.addEventListener("click", () => {
    markRatedYes().catch(() => {});
    dismiss();
  });
  document.getElementById("gf-rn-no-btn")!.addEventListener("click", () => {
    markDismissed().catch(() => {});
    dismiss();
  });
  document.getElementById("gf-rn-close-btn")!.addEventListener("click", () => {
    markDismissed().catch(() => {});
    dismiss();
  });
}

loadCapture();
maybeShowRateNudge();
