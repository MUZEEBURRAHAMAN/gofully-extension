import type { CaptureMode, CaptureProgress, ExportFormat, Settings } from "../types";
import { copyToClipboard } from "../export/clipboard";
import { generatePDF } from "../export/pdf-generator";
import { generateFilename } from "../utils/image";
import { isSupportedCapturePage, type PageSupportResult } from "../utils/url-validator";

const onboarding = document.getElementById("onboarding")!;
const onboardingNext = document.getElementById("onboardingNext")!;
const onboardingSkip = document.getElementById("onboardingSkip")!;
const onboardingSlides = Array.from(onboarding.querySelectorAll<HTMLElement>(".ob-slide"));
const onboardingDots = Array.from(onboarding.querySelectorAll<HTMLElement>(".ob-dots span"));
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

// Status line (last capture, shown on a fresh popup open before any new action)
const statusLine = document.getElementById("statusLine")!;
const statusThumb = document.getElementById("statusThumb") as HTMLImageElement;
const statusText = document.getElementById("statusText")!;
const statusViewBtn = document.getElementById("statusViewBtn")!;

let currentBlobUrl: string | null = null;
let currentUrl = "";
let captureMetadata: any = null;
let currentSupportState: PageSupportResult = { supported: true, type: "supported" };

async function readSettings(): Promise<Partial<Settings>> {
  const stored = (await chrome.storage.sync.get("settings")) as { settings?: Partial<Settings> };
  return stored.settings ?? {};
}

async function playCaptureSound(): Promise<void> {
  try {
    const sound = (await readSettings()).captureSound !== false;
    if (!sound) return;
    const url = chrome.runtime.getURL("assets/shutter.mp3");
    const audio = new Audio(url);
    audio.volume = 0.5;
    audio.play().catch(() => {});
  } catch { /* ignore */ }
}

async function getCountdown(): Promise<number> {
  try {
    return (await readSettings()).captureCountdown ?? 0;
  } catch { return 0; }
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

// Mode buttons — use mousedown so first interaction works without needing focus first
document.querySelectorAll(".mode-btn").forEach((btn) => {
  btn.addEventListener("mousedown", (e) => {
    e.preventDefault();
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
    const label = copyBtn.querySelector("span") ?? copyBtn;
    const orig = label.textContent ?? "Copy";
    label.textContent = "Copied!";
    copyBtn.style.opacity = "0.75";
    setTimeout(() => { label.textContent = orig; copyBtn.style.opacity = ""; }, 2000);
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
    await chrome.downloads.download({ url: currentBlobUrl, filename, saveAs: false });
    showToast("Saved as PNG!");
  } catch {
    showToast("Save failed");
  }
});

document.getElementById("saveWebpBtn")?.addEventListener("click", async () => {
  if (!currentBlobUrl) return;
  try {
    const res = await fetch(currentBlobUrl);
    const blob = await res.blob();
    const bitmap = await createImageBitmap(blob);
    const oc = new OffscreenCanvas(bitmap.width, bitmap.height);
    oc.getContext("2d")!.drawImage(bitmap, 0, 0);
    const webpBlob = await oc.convertToBlob({ type: "image/webp", quality: 0.92 });
    const downloadUrl = URL.createObjectURL(webpBlob);
    const domain = getDomain(currentUrl);
    const filename = generateFilename(domain, "webp");
    await chrome.downloads.download({ url: downloadUrl, filename, saveAs: false });
    showToast("Saved as WebP!");
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
  const btnLabel = savePdfBtn.querySelector("span") ?? savePdfBtn;
  const origText = btnLabel.textContent ?? "Save PDF";
  try {
    btnLabel.textContent = "Generating...";
    savePdfBtn.style.opacity = "0.7";
    (savePdfBtn as HTMLButtonElement).disabled = true;

    const response = await fetch(currentBlobUrl);
    const blob = await response.blob();
    const domain = getDomain(currentUrl);
    const pdfBlob = await generatePDF(blob, "a4");
    const pdfObjUrl = URL.createObjectURL(pdfBlob);
    const filename = generateFilename(domain, "pdf");
    await chrome.downloads.download({ url: pdfObjUrl, filename, saveAs: false });
    URL.revokeObjectURL(pdfObjUrl);
    showToast("Saved as PDF!");
  } catch (err) {
    console.error("PDF generation error:", err);
    showToast("PDF generation failed");
  } finally {
    btnLabel.textContent = origText;
    savePdfBtn.style.opacity = "";
    (savePdfBtn as HTMLButtonElement).disabled = false;
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

    // Populate the unsupported notice panel, but don't show it stacked
    // underneath onboarding — the two together push each other around and
    // duplicate "here's what you can't do yet" messaging on a first run.
    // dismissOnboarding() re-applies the stored state so this reappears
    // right after onboarding closes, if the page is still unsupported.
    if (unsupportedTitle && support.title) {
      unsupportedTitle.textContent = support.title;
    }
    if (unsupportedDesc && support.message) {
      unsupportedDesc.textContent = support.message;
    }
    unsupportedPanel.classList.toggle("active", !onboarding.classList.contains("active"));
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
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) return;

  const support = isSupportedCapturePage(tab.url);
  if (!support.supported) { applyPageSupportState(support); return; }

  const countdown = await getCountdown();

  if (mode === "selected-area" || mode === "scrolling-area" || mode === "capture-text") {
    if (countdown > 0) {
      await runCountdown(countdown, tab.id);
    }
    chrome.runtime.sendMessage({ type: "INIT_INTERACTIVE_MODE", payload: { mode, tabId: tab.id } });
    window.close();
    return;
  }

  if (countdown > 0) {
    await runCountdown(countdown, tab.id);
  }

  showProgress();
  chrome.runtime.sendMessage(
    { type: "START_CAPTURE", payload: { mode, tabId: tab.id } },
    (response) => {
      if (response?.type === "CAPTURE_COMPLETE") {
        captureMetadata = response.payload;
        currentUrl = response.payload.url || "";
        chrome.runtime.sendMessage({ type: "GET_CAPTURE_BLOB_URL" }, (resp) => {
          if (resp?.url) {
            currentBlobUrl = resp.url;
          }
          showResult(response.payload);
        });
      } else if (response?.type === "CAPTURE_ERROR") {
        showError(response.payload?.message || "Capture failed");
      }
    }
  );
}

function runCountdown(seconds: number, tabId: number): Promise<void> {
  return new Promise((resolve) => {
    chrome.tabs.sendMessage(tabId, { type: "SHOW_COUNTDOWN", payload: { seconds } }).catch(() => {});
    setTimeout(resolve, seconds * 1000);
  });
}

function showProgress(): void {
  modesSection.style.display = "none";
  statusLine.classList.remove("active");
  progressSection.classList.add("active");
  resultBar.classList.remove("active");
  errorBar.classList.remove("active");
  progressLabel.textContent = "Preparing capture...";
  progressFill.style.transform = "scaleX(0)";
}

function updateProgress(progress: CaptureProgress): void {
  const { current, total, phase } = progress;
  switch (phase) {
    case "preparing":
      progressLabel.textContent = "Preparing page...";
      break;
    case "capturing":
      progressLabel.textContent = `Capturing ${current}/${total}...`;
      progressFill.style.transform = `scaleX(${(current / total) * 0.8})`;
      break;
    case "stitching":
      progressLabel.textContent = "Stitching frames...";
      progressFill.style.transform = "scaleX(0.9)";
      break;
    case "done":
      progressFill.style.transform = "scaleX(1)";
      break;
  }
}

function showResult(result: any): void {
  progressSection.classList.remove("active");
  modesSection.style.display = "none";
  statusLine.classList.remove("active");
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
  modesSection.style.display = "grid";
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

function timeAgo(ts: number): string {
  const s = Math.max(0, Math.round((Date.now() - ts) / 1000));
  if (s < 5) return "just now";
  if (s < 60) return `${s}s ago`;
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.round(h / 24)}d ago`;
}

const MODE_LABEL: Record<string, string> = {
  "full-page": "Full page",
  "visible-area": "Visible area",
  "selected-area": "Selected area",
  "scrolling-area": "Scrolling area",
};

/** Shows a one-line summary of the last capture on a fresh popup open, so the
 *  user doesn't have to re-capture just to grab or re-edit something they
 *  already took a moment ago. Only shown when nothing else (progress/result/
 *  error) is already occupying the popup body. */
async function loadLastCaptureStatus(): Promise<void> {
  try {
    const resp = await chrome.runtime.sendMessage({ type: "GET_LAST_CAPTURE" });
    const result = resp?.result;
    if (!result || !resp?.hasBlob) return;
    if (resultBar.classList.contains("active") || errorBar.classList.contains("active")) return;

    const label = MODE_LABEL[result.mode] || result.mode;
    const w = Math.round(result.width);
    const h = Math.round(result.height);
    statusText.innerHTML = `<b>${label}</b> · ${w}×${h} · ${timeAgo(result.timestamp)}`;

    const blobResp = await chrome.runtime.sendMessage({ type: "GET_CAPTURE_BLOB_URL" });
    if (blobResp?.url) {
      statusThumb.src = blobResp.url;
      currentBlobUrl = blobResp.url;
      currentUrl = result.url || "";
      statusLine.classList.add("active");
    }
  } catch {
    // no prior capture available — leave the status line hidden
  }
}

statusViewBtn.addEventListener("click", async () => {
  const resp = await chrome.runtime.sendMessage({ type: "GET_LAST_CAPTURE" });
  if (resp?.result) {
    captureMetadata = resp.result;
    showResult(resp.result);
  }
});

function dismissOnboarding(): void {
  chrome.storage.local.set({ gf_onboarded: true });
  onboarding.classList.remove("active");
  modesSection.style.display = "grid";
  // The unsupported-page notice was suppressed while onboarding covered it —
  // show it now if the active tab still isn't capturable.
  applyPageSupportState(currentSupportState);
}

let onboardingSlide = 1;

function goToOnboardingSlide(n: number): void {
  onboardingSlide = n;
  onboardingSlides.forEach((slide, i) => {
    slide.hidden = i !== n - 1;
  });
  onboardingDots.forEach((dot, i) => dot.classList.toggle("active", i === n - 1));

  const isLast = n === onboardingSlides.length;
  onboardingNext.classList.toggle("full", isLast);
  onboardingSkip.style.visibility = isLast ? "hidden" : "visible";
  const label = onboardingNext.querySelector(".ob-next-label");
  if (label) label.textContent = isLast ? "Get Started" : "Next";
}

onboardingNext.addEventListener("click", () => {
  if (onboardingSlide < onboardingSlides.length) {
    goToOnboardingSlide(onboardingSlide + 1);
  } else {
    dismissOnboarding();
  }
});
onboardingSkip.addEventListener("click", dismissOnboarding);

async function maybeShowOnboarding(): Promise<void> {
  const data = await chrome.storage.local.get("gf_onboarded");
  if (!data.gf_onboarded) {
    goToOnboardingSlide(1);
    onboarding.classList.add("active");
    modesSection.style.display = "none";
  }
}

// Run active tab support check and onboarding on popup open
checkActiveTabSupport();
loadLastCaptureStatus();
maybeShowOnboarding();
