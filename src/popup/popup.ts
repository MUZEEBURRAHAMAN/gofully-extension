import type { CaptureMode, CaptureProgress, ExportFormat } from "../types";
import { copyToClipboard } from "../export/clipboard";
import { generatePDF } from "../export/pdf-generator";
import { generateFilename } from "../utils/image";
import { isSupportedCapturePage, type PageSupportResult } from "../utils/url-validator";

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

// Unsupported panel elements
const unsupportedPanel = document.getElementById("unsupportedPanel")!;
const unsupportedTitle = document.getElementById("unsupportedTitle")!;
const unsupportedDesc = document.getElementById("unsupportedDesc")!;
const unsupportedDismissBtn = document.getElementById("unsupportedDismissBtn")!;

let currentBlobUrl: string | null = null;
let currentUrl = "";
let captureMetadata: any = null;
let currentSupportState: PageSupportResult = { supported: true, type: "supported" };

function playCaptureSound(): void {
  try {
    const url = chrome.runtime.getURL("assets/shutter.mp3");
    const audio = new Audio(url);
    audio.volume = 0.5;
    audio.play().catch(() => {});
  } catch { /* ignore */ }
}

// Settings & Help buttons
document.getElementById("settingsBtn")?.addEventListener("click", () => {
  chrome.runtime.openOptionsPage();
});

document.getElementById("helpBtn")?.addEventListener("click", () => {
  chrome.tabs.create({ url: chrome.runtime.getURL("help.html") });
});

// Unsupported panel dismiss button ("Got it")
unsupportedDismissBtn?.addEventListener("click", () => {
  unsupportedPanel.classList.remove("active");
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

/**
 * Initial page validation on popup open
 */
async function checkActiveTabSupport(): Promise<void> {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const url = tab?.url || "";
    currentUrl = url;

    currentSupportState = isSupportedCapturePage(url);
    applyPageSupportState(currentSupportState);
  } catch {
    // If tab lookup fails, default to allowing capture and letting SW validate
    currentSupportState = { supported: true, type: "supported" };
    applyPageSupportState(currentSupportState);
  }
}

function applyPageSupportState(support: PageSupportResult): void {
  const modeButtons = document.querySelectorAll(".mode-btn");

  if (!support.supported) {
    // Disable all mode buttons and add title tooltip
    modeButtons.forEach((btn) => {
      const button = btn as HTMLButtonElement;
      button.disabled = true;
      button.setAttribute("aria-disabled", "true");
      button.title = support.message || "Capture is unavailable on this page";
    });

    // Populate and show the unsupported notice panel
    if (unsupportedTitle && support.title) {
      unsupportedTitle.textContent = support.title;
    }
    if (unsupportedDesc && support.message) {
      unsupportedDesc.textContent = support.message;
    }
    unsupportedPanel.classList.add("active");
  } else {
    // Enable all mode buttons
    modeButtons.forEach((btn) => {
      const button = btn as HTMLButtonElement;
      button.disabled = false;
      button.removeAttribute("aria-disabled");
      button.removeAttribute("title");
    });
    unsupportedPanel.classList.remove("active");
  }
}

async function startCapture(mode: CaptureMode): Promise<void> {
  const [tab] = await chrome.tabs.query({
    active: true,
    currentWindow: true,
  });
  if (!tab?.id) return;

  // Double check central URL support before initiating any capture workflow
  const support = isSupportedCapturePage(tab.url);
  if (!support.supported) {
    applyPageSupportState(support);
    return;
  }

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

// Run active tab support check on popup open
checkActiveTabSupport();
