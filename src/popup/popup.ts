import type { CaptureMode, CaptureProgress, ExportFormat } from "../types";
import { copyToClipboard } from "../export/clipboard";
import { generatePDF } from "../export/pdf-generator";
import { generateFilename } from "../utils/image";

const modesSection = document.getElementById("modesSection")!;
const progressSection = document.getElementById("progressSection")!;
const progressLabel = document.getElementById("progressLabel")!;
const progressFill = document.getElementById("progressFill")!;
const resultBar = document.getElementById("resultBar")!;
const resultText = document.getElementById("resultText")!;
const errorBar = document.getElementById("errorBar")!;
const errorMsg = document.getElementById("errorMsg")!;
const copyBtn = document.getElementById("copyBtn")!;
const savePngBtn = document.getElementById("savePngBtn")!;
const savePdfBtn = document.getElementById("savePdfBtn")!;
const toast = document.getElementById("toast")!;

let currentBlobUrl: string | null = null;
let currentUrl = "";
let captureMetadata: any = null;

function playCaptureSound(): void {
  try {
    const url = chrome.runtime.getURL("assets/shutter.mp3");
    const audio = new Audio(url);
    audio.volume = 0.5;
    audio.play().catch(() => {});
  } catch { /* ignore */ }
}

// Settings button
document.getElementById("settingsBtn")?.addEventListener("click", () => {
  chrome.runtime.openOptionsPage();
});

// Mode buttons
document.querySelectorAll(".mode-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const mode = (btn as HTMLElement).dataset.mode as CaptureMode;
    if ((btn as HTMLButtonElement).disabled) return;
    startCapture(mode);
  });
});

// Export buttons
copyBtn.addEventListener("click", async () => {
  if (!currentBlobUrl) return;
  try {
    const res = await fetch(currentBlobUrl);
    const blob = await res.blob();
    const pngBlob = blob.type === "image/png" ? blob : await convertToPng(blob);
    await navigator.clipboard.write([new ClipboardItem({ "image/png": pngBlob })]);
    showToast("Copied!");
  } catch {
    showToast("Copy failed — try Save PNG");
  }
});

async function convertToPng(blob: Blob): Promise<Blob> {
  const bitmap = await createImageBitmap(blob);
  const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(bitmap, 0, 0);
  return canvas.convertToBlob({ type: "image/png" });
}

savePngBtn.addEventListener("click", async () => {
  if (!currentBlobUrl) return;
  try {
    const domain = getDomain(currentUrl);
    const filename = generateFilename(domain, "png");
    await chrome.downloads.download({
      url: currentBlobUrl,
      filename,
      saveAs: false,
    });
    showToast("Saved as PNG!");
  } catch {
    showToast("Save failed");
  }
});

document.getElementById("editBtn")?.addEventListener("click", async () => {
  if (!currentBlobUrl) return;
  // Open editor via service worker so no image data goes into the URL / history.
  chrome.runtime.sendMessage({ type: "OPEN_EDITOR" });
});

savePdfBtn.addEventListener("click", async () => {
  if (!currentBlobUrl) return;
  try {
    const response = await fetch(currentBlobUrl);
    const blob = await response.blob();
    const domain = getDomain(currentUrl);
    const pdfBlob = await generatePDF(blob, "a4");
    const pdfDataUrl = await blobToDataUrlLocal(pdfBlob);
    const filename = generateFilename(domain, "pdf");
    await chrome.downloads.download({ url: pdfDataUrl, filename, saveAs: false });
    showToast("Saved as PDF!");
  } catch {
    showToast("PDF generation failed");
  }
});

// Listen for progress updates from service worker
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === "CAPTURE_PROGRESS") {
    updateProgress(message.payload as CaptureProgress);
  }
  if (message.type === "CAPTURE_COMPLETE") {
    captureMetadata = message.payload;
    currentUrl = message.payload.url;
    // Get blob URL from service worker
    chrome.runtime.sendMessage({ type: "GET_CAPTURE_BLOB_URL" }, (resp) => {
      if (resp?.url) {
        currentBlobUrl = resp.url;
      }
      showResult(message.payload);
    });
  }
});

async function startCapture(mode: CaptureMode): Promise<void> {
  // For all capture modes, close the popup and let the sleek upper confirmation HUD appear on the page!
  const [tab] = await chrome.tabs.query({
    active: true,
    currentWindow: true,
  });
  if (!tab?.id) return;

  if (
    mode === "selected-area" ||
    mode === "scrolling-area" ||
    mode === "capture-text"
  ) {
    chrome.runtime.sendMessage({
      type: "INIT_INTERACTIVE_MODE",
      payload: { mode, tabId: tab.id },
    });
    window.close();
    return;
  }

  // Full page and visible area — trigger capture and close popup
  chrome.runtime.sendMessage({
    type: "START_CAPTURE",
    payload: { mode, tabId: tab.id },
  });
  window.close();
}

function showProgress(): void {
  modesSection.style.display = "none";
  progressSection.classList.add("active");
  resultBar.classList.remove("active");
  errorBar.classList.remove("active");
  progressLabel.textContent = "Preparing capture...";
  progressFill.style.width = "0%";
}

function updateProgress(progress: CaptureProgress): void {
  const { current, total, phase } = progress;
  switch (phase) {
    case "preparing":
      progressLabel.textContent = "Preparing page...";
      break;
    case "capturing":
      progressLabel.textContent = `Capturing ${current}/${total}...`;
      progressFill.style.width = `${(current / total) * 80}%`;
      break;
    case "stitching":
      progressLabel.textContent = "Stitching frames...";
      progressFill.style.width = "90%";
      break;
    case "done":
      progressFill.style.width = "100%";
      break;
  }
}

function showResult(result: any): void {
  progressSection.classList.remove("active");
  modesSection.style.display = "none";
  resultBar.classList.add("active");

  const w = Math.round(result.width);
  const h = Math.round(result.height);
  const method = result.method === "cdp" ? "CDP" : "Scroll-Stitch";
  resultText.textContent = `${w}×${h}px captured via ${method}`;

  const previewContainer = document.getElementById("popupPreviewContainer");
  const previewImg = document.getElementById("popupPreviewImg") as HTMLImageElement;
  const previewFade = document.getElementById("popupPreviewFade");

  if (currentBlobUrl && previewContainer && previewImg) {
    previewImg.src = currentBlobUrl;
    previewContainer.style.display = "flex";
    const isLongCapture = result.mode === "full-page" || result.mode === "scrolling-area" || h > 800;
    if (previewFade) {
      previewFade.style.display = isLongCapture ? "flex" : "none";
    }
  }

  playCaptureSound();
}

function showError(message: string): void {
  progressSection.classList.remove("active");
  modesSection.style.display = "block";
  errorBar.classList.add("active");
  errorMsg.textContent = message;
  setTimeout(() => errorBar.classList.remove("active"), 5000);
}

function showToast(message: string): void {
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2500);
}

function getDomain(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return "unknown";
  }
}

function blobToDataUrlLocal(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
