import type { CaptureMode, CaptureProgress, ExportFormat, Settings } from "../types";
import { copyToClipboard } from "../export/clipboard";
import { generatePDF } from "../export/pdf-generator";
import { generateFilename } from "../utils/image";
import { isSupportedCapturePage, type PageSupportResult } from "../utils/url-validator";
import { applyTheme, watchTheme } from "../utils/theme";
import { initI18n, t, watchLanguage } from "../utils/i18n";
import { markRatedYes } from "../utils/rate-nudge";
import { icon } from "../ui/ds/icons";
import { illustration } from "../ui/ds/illustrations";

applyTheme();
watchTheme();
initI18n();
watchLanguage(() => applyPageSupportState(currentSupportState));

// Read straight from the manifest so this can't drift out of sync with the
// actual shipped version again (it previously sat hardcoded as "v1.1" while
// the manifest had already moved to 1.1.2).
const ftrVersion = document.getElementById("ftrVersion");
if (ftrVersion) ftrVersion.textContent = `v${chrome.runtime.getManifest().version}`;

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
const UNSUPPORTED_I18N_KEYS: Partial<Record<PageSupportResult["type"], string>> = {
  unknown: "unsupported.page_cant_be_captured",
  restricted: "unsupported.page_cant_be_captured",
  web_store: "unsupported.webstore",
  devtools: "unsupported.devtools",
  browser_internal: "unsupported.browser_internal",
  extension_page: "unsupported.extension_page",
  view_source: "unsupported.source_view",
};

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
    const v = Number((await readSettings()).captureCountdown ?? 0);
    // Older versions offered 1 to 3 seconds; those now mean the shortest choice.
    return !v || v <= 0 ? 0 : v <= 3 ? 3 : v <= 5 ? 5 : 10;
  } catch { return 0; }
}

// Delay before full page and visible area captures. Same value as "Delay before capture" in Settings.
const delaySelect = document.getElementById("delaySelect") as HTMLSelectElement | null;
if (delaySelect) {
  void getCountdown().then((v) => { delaySelect.value = String(v); if (delaySelect.selectedIndex < 0) delaySelect.value = "0"; });
  delaySelect.addEventListener("change", async () => {
    const stored = (await chrome.storage.sync.get("settings")) as { settings?: Partial<Settings> };
    const seconds = Number(delaySelect.value) as Settings["captureCountdown"];
    await chrome.storage.sync.set({ settings: { ...(stored.settings ?? {}), captureCountdown: seconds } });
  });
}

// Settings & Help buttons
document.getElementById("settingsBtn")?.addEventListener("click", () => {
  chrome.runtime.openOptionsPage();
});

document.getElementById("helpBtn")?.addEventListener("click", () => {
  chrome.tabs.create({ url: chrome.runtime.getURL("help.html") });
});

document.getElementById("rateUsBtn")?.addEventListener("click", () => {
  markRatedYes().catch(() => {});
});

// History panel
const historySection = document.getElementById("historySection")!;
const historyGrid = document.getElementById("historyGrid")!;

document.getElementById("historyBtn")?.addEventListener("click", () => {
  const isOpen = historySection.classList.contains("active");
  if (isOpen) {
    closeHistory();
  } else {
    openHistory();
  }
});

document.getElementById("guideBtn")?.addEventListener("click", () => {
  chrome.tabs.create({ url: chrome.runtime.getURL("guide.html") });
  window.close();
});

document.getElementById("historyBackBtn")?.addEventListener("click", closeHistory);

document.getElementById("historyClearBtn")?.addEventListener("click", async () => {
  await chrome.runtime.sendMessage({ type: "CLEAR_HISTORY" });
  allHistory = [];
  renderHistoryGrid([]);
});

function openHistory(): void {
  modesSection.style.display = "none";
  statusLine.classList.remove("active");
  resultBar.classList.remove("active");
  historySection.classList.add("active");
  if (historySearch) historySearch.value = "";
  chrome.runtime.sendMessage({ type: "GET_HISTORY" }, async (resp) => {
    allHistory = resp?.history || [];
    const full = await chrome.runtime.sendMessage({ type: "LIST_FULL_IMAGES" }).catch(() => null);
    fullIds = new Set<string>(full?.ids || []);
    filterHistory();
  });
}

function closeHistory(): void {
  historySection.classList.remove("active");
  modesSection.style.display = "grid";
  loadLastCaptureStatus();
}

let allHistory: any[] = [];
const historySearch = document.getElementById("historySearch") as HTMLInputElement | null;
const historyCount = document.getElementById("historyCount");

function filterHistory(): void {
  const q = (historySearch?.value || "").trim().toLowerCase();
  const terms = q.split(/\s+/).filter(Boolean);
  const shown = !terms.length
    ? allHistory
    : allHistory.filter((e) => {
        const hay = `${e.title || ""} ${e.url || ""} ${e.text || ""}`.toLowerCase();
        return terms.every((t) => hay.includes(t));
      });
  renderHistoryGrid(shown, terms.length > 0);
  if (historyCount) {
    historyCount.textContent = terms.length ? `${shown.length} of ${allHistory.length}` : "";
  }
}
historySearch?.addEventListener("input", filterHistory);

let fullIds = new Set<string>();

function renderHistoryGrid(entries: any[], searching = false): void {
  historyGrid.innerHTML = "";
  if (entries.length === 0) {
    const query = historySearch?.value.trim() ?? "";
    const empty = document.createElement("div");
    empty.className = "hist-empty";
    empty.innerHTML = illustration(searching ? "no-search-results" : "history-empty", 140);
    const title = document.createElement("div");
    title.className = "gf-t-heading";
    title.textContent = searching ? `Nothing matches “${query}”` : "No captures yet";
    const desc = document.createElement("p");
    desc.className = "gf-t-small";
    desc.textContent = searching
      ? "Try a word from the page title, the address or the text in the image."
      : "Your last 50 captures land here, searchable by the words inside them. They never leave this device.";
    empty.append(title, desc);
    if (searching) {
      const clear = document.createElement("button");
      clear.type = "button";
      clear.className = "gf-btn gf-btn--secondary";
      clear.textContent = "Clear search";
      clear.addEventListener("click", () => { if (historySearch) historySearch.value = ""; filterHistory(); historySearch?.focus(); });
      empty.appendChild(clear);
    }
    historyGrid.appendChild(empty);
    return;
  }
  for (const entry of entries) {
    const item = document.createElement("div");
    item.className = "hist-item";
    const hasFull = fullIds.has(entry.id);
    const canOpen = hasFull || /^https?:\/\//i.test(entry.url || "");
    item.title = `${entry.title || getDomain(entry.url)}\n${entry.width}×${entry.height}${hasFull ? "\nClick to reopen in the editor" : canOpen ? "\nClick to open the source page" : ""}`;
    if (canOpen) {
      item.tabIndex = 0;
      item.setAttribute("role", "link");
      item.setAttribute("aria-label", `${hasFull ? "Reopen" : "Open"} ${entry.title || getDomain(entry.url)}`);
    }

    const img = document.createElement("img");
    img.className = "hist-thumb";
    img.src = entry.thumbnail;
    img.alt = "";
    item.appendChild(img);

    const meta = document.createElement("div");
    meta.className = "hist-meta";
    const domain = document.createElement("span");
    domain.className = "hist-domain";
    domain.textContent = getDomain(entry.url);
    meta.appendChild(domain);
    const time = document.createElement("span");
    time.className = "hist-time";
    time.textContent = timeAgo(entry.timestamp);
    meta.appendChild(time);
    item.appendChild(meta);

    const del = document.createElement("button");
    del.className = "hist-delete";
    del.type = "button";
    del.setAttribute("aria-label", "Delete capture");
    del.innerHTML = icon("close", 14);
    del.addEventListener("click", async (e) => {
      e.stopPropagation();
      await chrome.runtime.sendMessage({ type: "DELETE_HISTORY_ENTRY", payload: { id: entry.id } });
      allHistory = allHistory.filter((x) => x.id !== entry.id);
      item.remove();
      if (historyGrid.children.length === 0) filterHistory();
    });
    item.appendChild(del);

    if (canOpen) {
      const open = () => {
        if (hasFull) {
          chrome.runtime.sendMessage({ type: "REOPEN_HISTORY_CAPTURE", payload: { id: entry.id } }).then((r) => { if (r?.ok) window.close(); });
        } else {
          chrome.tabs.create({ url: entry.url });
        }
      };
      item.addEventListener("click", open);
      item.addEventListener("keydown", (e) => {
        if ((e.key === "Enter" || e.key === " ") && e.target === item) { e.preventDefault(); open(); }
      });
    }

    historyGrid.appendChild(item);
  }
}

// Unsupported panel dismiss button ("Got it")
unsupportedDismissBtn?.addEventListener("click", () => {
  unsupportedPanel.classList.remove("active");
  // The button just hid itself; keep keyboard focus inside the popup.
  document.querySelector<HTMLElement>(".hdr .gf-icon-btn")?.focus();
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
    const uhdBlob = await upscaleToUHD(pngBlob);
    await navigator.clipboard.write([new ClipboardItem({ "image/png": uhdBlob })]);
    const label = copyBtn.querySelector("span") ?? copyBtn;
    const orig = label.textContent ?? t("action.copy");
    label.textContent = t("toast.copied");
    copyBtn.style.opacity = "0.75";
    setTimeout(() => { label.textContent = orig; copyBtn.style.opacity = ""; }, 2000);
    showToast(t("toast.copied"));
  } catch {
    showToast(t("toast.copy_failed"));
  }
});

async function convertToPng(blob: Blob): Promise<Blob> {
  const bitmap = await createImageBitmap(blob);
  const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(bitmap, 0, 0);
  return canvas.convertToBlob({ type: "image/png" });
}

// This quick popup Copy button has no Quality dropdown of its own (that only
// lives in the full editor) — it was copying the raw captured resolution
// as-is, which reads as "low quality" once pasted somewhere that displays it
// larger. Match the editor's default (4K UHD) here too: upscale only when
// the capture is smaller than 3840×2160, so an already-large capture is
// left untouched instead of being needlessly re-encoded.
const UHD_W = 3840, UHD_H = 2160;
async function upscaleToUHD(blob: Blob): Promise<Blob> {
  try {
    const bitmap = await createImageBitmap(blob);
    const { width: w, height: h } = bitmap;
    if (w >= UHD_W || h >= UHD_H) return blob;
    const scale = Math.max(UHD_W / w, UHD_H / h);
    const canvas = new OffscreenCanvas(Math.round(w * scale), Math.round(h * scale));
    const ctx = canvas.getContext("2d")!;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    return await canvas.convertToBlob({ type: "image/png" });
  } catch {
    return blob;
  }
}

savePngBtn.addEventListener("click", async () => {
  if (!currentBlobUrl) return;
  try {
    const domain = getDomain(currentUrl);
    const filename = generateFilename(domain, "png");
    await chrome.downloads.download({ url: currentBlobUrl, filename, saveAs: false });
    showToast(t("toast.saved_png"));
  } catch {
    showToast(t("toast.save_failed"));
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
    showToast(t("toast.saved_webp"));
  } catch {
    showToast(t("toast.save_failed"));
  }
});

document.getElementById("saveJpgBtn")?.addEventListener("click", async () => {
  if (!currentBlobUrl) return;
  try {
    const res = await fetch(currentBlobUrl);
    const blob = await res.blob();
    const bitmap = await createImageBitmap(blob);
    const oc = new OffscreenCanvas(bitmap.width, bitmap.height);
    oc.getContext("2d")!.drawImage(bitmap, 0, 0);
    const jpgBlob = await oc.convertToBlob({ type: "image/jpeg", quality: 0.92 });
    const downloadUrl = URL.createObjectURL(jpgBlob);
    const domain = getDomain(currentUrl);
    const filename = generateFilename(domain, "jpg");
    await chrome.downloads.download({ url: downloadUrl, filename, saveAs: false });
    showToast(t("toast.saved_jpg"));
  } catch {
    showToast(t("toast.save_failed"));
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
    btnLabel.textContent = t("action.generating");
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
    showToast(t("toast.saved_pdf"));
  } catch (err) {
    console.error("PDF generation error:", err);
    showToast(t("toast.pdf_failed"));
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
    const i18nKeyForTitle = UNSUPPORTED_I18N_KEYS[support.type];
    const disabledTitle = i18nKeyForTitle ? t(`${i18nKeyForTitle}.message`) : support.message || "";

    // Disable all mode buttons and add title tooltip
    modeButtons.forEach((btn) => {
      const button = btn as HTMLButtonElement;
      button.disabled = true;
      button.setAttribute("aria-disabled", "true");
      button.title = disabledTitle;
    });

    const i18nKey = UNSUPPORTED_I18N_KEYS[support.type];
    if (unsupportedTitle) {
      unsupportedTitle.textContent = i18nKey ? t(`${i18nKey}.title`) : support.title || "";
    }
    if (unsupportedDesc) {
      unsupportedDesc.textContent = i18nKey ? t(`${i18nKey}.message`) : support.message || "";
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
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) return;

  const support = isSupportedCapturePage(tab.url);
  if (!support.supported) { applyPageSupportState(support); return; }

  if (mode === "annotate-page" || mode === "capture-element" || mode === "measure-page" || mode === "redact-page") {
    chrome.runtime.sendMessage({ type: "INIT_INTERACTIVE_MODE", payload: { mode, tabId: tab.id } });
    window.close();
    return;
  }

  if (mode === "selected-area" || mode === "scrolling-area" || mode === "capture-text") {
    chrome.runtime.sendMessage({ type: "INIT_INTERACTIVE_MODE", payload: { mode, tabId: tab.id } });
    window.close();
    return;
  }

  // Delay: the background page runs the timer and the page shows the countdown, so the popup can
  // close and the person can open the menu or hover the tooltip they want in the shot.
  const delay = await getCountdown();
  if (delay > 0 && (mode === "full-page" || mode === "visible-area")) {
    const resp = await chrome.runtime.sendMessage({ type: "START_DELAYED_CAPTURE", payload: { mode, tabId: tab.id, seconds: delay } }).catch(() => null);
    if (resp?.ok) { window.close(); return; }
    showError(resp?.error || "Couldn't start the delay on this page");
    return;
  }

  if (mode === "full-page") {
    showProgress();
    chrome.runtime.sendMessage(
      { type: "START_CAPTURE", payload: { mode, tabId: tab.id } },
      (response) => {
        if (response?.type === "CAPTURE_COMPLETE") {
          completeReviewTabCapture();
        } else if (response?.type === "CAPTURE_ERROR") {
          showError(response.payload?.message || "Capture failed");
        }
      }
    );
  } else {
    // Visible Area: instant capture, show result card with preview & actions
    chrome.runtime.sendMessage(
      { type: "START_CAPTURE", payload: { mode, tabId: tab.id } },
      (response) => {
        if (response?.type === "CAPTURE_COMPLETE") {
          // "After a capture" set to something other than the card: let the background page do it on the page.
          void readSettings().then((cfg) => {
            if (cfg.defaultAction && cfg.defaultAction !== "result-bar" && response.payload?.captureId) {
              chrome.runtime.sendMessage({ type: "AFTER_CAPTURE_ACTION", payload: { captureId: response.payload.captureId, tabId: tab.id } }).catch(() => {});
              window.close();
              return;
            }
            showPopupResult(response);
          });
        } else if (response?.type === "CAPTURE_ERROR") {
          showError(response.payload?.message || "Capture failed");
        }
      }
    );
  }
}

function showPopupResult(response: any): void {
  captureMetadata = response.payload;
  currentUrl = response.payload.url || "";
  chrome.runtime.sendMessage({ type: "GET_CAPTURE_BLOB_URL" }, (resp) => {
    if (resp?.url) currentBlobUrl = resp.url;
    showResult(response.payload);
  });
}

function completeReviewTabCapture(): void {
  progressLabel.textContent = "Opened in new tab";
  progressFill.style.transform = "scaleX(1)";
  setTimeout(() => window.close(), 700);
}

async function completeQuickCapture(payload: { dataUrl: string }): Promise<void> {
  let copied = true;
  try {
    const res = await fetch(payload.dataUrl);
    const blob = await res.blob();
    const pngBlob = blob.type === "image/png" ? blob : await convertToPng(blob);
    const uhdBlob = await upscaleToUHD(pngBlob);
    await navigator.clipboard.write([new ClipboardItem({ "image/png": uhdBlob })]);
  } catch {
    copied = false;
  }

  progressLabel.textContent = copied ? t("toast.copied") : "Screenshot captured";
  progressFill.style.transform = "scaleX(1)";

  setTimeout(() => window.close(), 900);
}


function showProgress(): void {
  modesSection.style.display = "none";
  statusLine.classList.remove("active");
  progressSection.classList.add("active");
  document.body.classList.add("is-capturing");
  resultBar.classList.remove("active");
  errorBar.classList.remove("active");
  progressLabel.textContent = t("progress.preparing");
  progressFill.style.transform = "scaleX(0)";
}

function updateProgress(progress: CaptureProgress): void {
  const { current, total, phase } = progress;
  switch (phase) {
    case "preparing":
      progressLabel.textContent = t("progress.preparing_page");
      break;
    case "capturing":
      progressLabel.textContent = t("progress.capturing", { current, total });
      progressFill.style.transform = `scaleX(${(current / total) * 0.8})`;
      break;
    case "stitching":
      progressLabel.textContent = t("progress.stitching");
      progressFill.style.transform = "scaleX(0.9)";
      break;
    case "done":
      progressFill.style.transform = "scaleX(1)";
      break;
  }
}

function showResult(result: any): void {
  progressSection.classList.remove("active");
  document.body.classList.remove("is-capturing");
  modesSection.style.display = "none";
  statusLine.classList.remove("active");
  resultBar.classList.add("active");

  const w = Math.round(result.width);
  const h = Math.round(result.height);
  const method = result.method === "scroll-stitch" ? "Scroll-Stitch" : "Snapshot";
  resultText.textContent = t("result.dimensions", { w, h, method });

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
  document.body.classList.remove("is-capturing");
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
    const strong = document.createElement("b");
    strong.textContent = String(label);
    statusText.replaceChildren(strong, ` · ${w}×${h} · ${timeAgo(result.timestamp)}`);

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

function formatShortcutForDisplay(raw: string, isMac: boolean): string {
  let s = raw;
  s = s.replace(/⌃/g, isMac ? "Ctrl+" : "Ctrl+");
  s = s.replace(/⌥/g, isMac ? "Option+" : "Alt+");
  s = s.replace(/⇧/g, "Shift+");
  s = s.replace(/⌘/g, isMac ? "Cmd+" : "Ctrl+");
  s = s.replace(/Command/gi, isMac ? "Cmd" : "Ctrl");

  const parts = s.split("+").map((p) => p.trim()).filter(Boolean);
  const key = parts[parts.length - 1];
  const mods = parts.slice(0, -1);

  const hasCmd = mods.some((m) => /^(cmd|command|ctrl)$/i.test(m));
  const hasAlt = mods.some((m) => /^(alt|option)$/i.test(m));
  const hasShift = mods.some((m) => /^shift$/i.test(m));

  const ordered: string[] = [];
  if (hasCmd) ordered.push(isMac ? "Cmd" : "Ctrl");
  if (hasAlt) ordered.push(isMac ? "Option" : "Alt");
  if (hasShift) ordered.push("Shift");
  if (key) ordered.push(key);

  return ordered.join("+");
}

function updateShortcutLabels(): void {
  const isMac = typeof navigator !== "undefined" && /Mac|iPhone|iPod|iPad/.test(navigator.platform || navigator.userAgent);
  const mod = isMac ? "Cmd" : "Ctrl";
  const defaultShortcuts: Record<string, string> = {
    "capture-full-page": `${mod}+Shift+F`,
    "capture-visible": `${mod}+Shift+V`,
    "capture-selected-area": `${mod}+Shift+A`,
  };

  document.querySelectorAll<HTMLElement>(".m-kbd[data-command]").forEach((el) => {
    const cmd = el.dataset.command;
    if (cmd && defaultShortcuts[cmd]) renderKeys(el, defaultShortcuts[cmd], isMac);
  });
  document.querySelectorAll<HTMLElement>(".m-kbd[data-keys]").forEach((el) => {
    renderKeys(el, el.dataset.keys!.replace(/^Cmd/, mod), isMac);
  });

  if (chrome.commands?.getAll) {
    chrome.commands.getAll((commands) => {
      commands.forEach((c) => {
        if (!c.name || !c.shortcut) return;
        const el = document.querySelector<HTMLElement>(`.m-kbd[data-command="${c.name}"]`);
        if (el) renderKeys(el, formatShortcutForDisplay(c.shortcut, isMac), isMac);
      });
    });
  }
}

/** "Cmd+Shift+F" → one <kbd class="gf-kbd"> per key, with Mac symbols on a Mac. */
function renderKeys(el: HTMLElement, combo: string, isMac: boolean): void {
  const SYMBOL: Record<string, string> = { Cmd: "⌘", Option: "⌥", Shift: "⇧", Ctrl: "⌃" };
  el.replaceChildren(...combo.split("+").filter(Boolean).map((part) => {
    const k = document.createElement("kbd");
    k.className = "gf-kbd";
    k.textContent = isMac && SYMBOL[part] ? SYMBOL[part] : part;
    return k;
  }));
  el.setAttribute("aria-label", combo.replace(/\+/g, " + "));
}

// Run active tab support check on popup open
checkActiveTabSupport();
loadLastCaptureStatus();
updateShortcutLabels();
