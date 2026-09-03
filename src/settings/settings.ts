import type { Settings } from "../types";
import { DEFAULT_SETTINGS } from "../types";

const elements = {
  defaultAction: document.getElementById("defaultAction") as HTMLSelectElement,
  captureDelay: document.getElementById("captureDelay") as HTMLInputElement,
  lazyLoadWait: document.getElementById("lazyLoadWait") as HTMLInputElement,
  pngSaveAs: document.getElementById("pngSaveAs") as HTMLSelectElement,
  pdfPageSize: document.getElementById("pdfPageSize") as HTMLSelectElement,
  pdfWatermark: document.getElementById("pdfWatermark") as HTMLInputElement,
  captureSound: document.getElementById("captureSound") as HTMLInputElement,
  captureCountdown: document.getElementById("captureCountdown") as HTMLSelectElement,
  skipStickyHeaders: document.getElementById("skipStickyHeaders") as HTMLInputElement,
  defaultExportFormat: document.getElementById("defaultExportFormat") as HTMLSelectElement,
  savedToast: document.getElementById("savedToast")!,
};

async function loadSettings(): Promise<void> {
  const stored = await chrome.storage.sync.get("settings");
  const settings: Settings = {
    ...DEFAULT_SETTINGS,
    ...(stored.settings as Partial<Settings> || {}),
  };

  elements.defaultAction.value = settings.defaultAction;
  elements.captureDelay.value = String(settings.captureDelay);
  elements.lazyLoadWait.value = String(settings.lazyLoadWait);
  elements.pngSaveAs.value = String(settings.pngSaveAs);
  elements.pdfPageSize.value = settings.pdfPageSize;
  elements.pdfWatermark.checked = settings.pdfWatermark;
  elements.captureSound.checked = settings.captureSound;
  elements.captureCountdown.value = String(settings.captureCountdown);
  elements.skipStickyHeaders.checked = settings.skipStickyHeaders;
  elements.defaultExportFormat.value = settings.defaultExportFormat;
}

async function saveSettings(): Promise<void> {
  const settings: Settings = {
    defaultAction: elements.defaultAction.value as Settings["defaultAction"],
    captureDelay: parseInt(elements.captureDelay.value),
    lazyLoadWait: parseInt(elements.lazyLoadWait.value),
    pngSaveAs: elements.pngSaveAs.value === "true",
    pdfPageSize: elements.pdfPageSize.value as "a4" | "letter",
    pdfWatermark: elements.pdfWatermark.checked,
    scrollPadding: 0,
    captureSound: elements.captureSound.checked,
    captureCountdown: parseInt(elements.captureCountdown.value) as 0 | 1 | 2 | 3,
    skipStickyHeaders: elements.skipStickyHeaders.checked,
    defaultExportFormat: elements.defaultExportFormat.value as "png" | "webp",
  };

  await chrome.storage.sync.set({ settings });
  showSavedToast();
}

function showSavedToast(): void {
  elements.savedToast.classList.add("show");
  setTimeout(() => elements.savedToast.classList.remove("show"), 2000);
}

const inputs = [
  elements.defaultAction,
  elements.captureDelay,
  elements.lazyLoadWait,
  elements.pngSaveAs,
  elements.pdfPageSize,
  elements.pdfWatermark,
  elements.captureSound,
  elements.captureCountdown,
  elements.skipStickyHeaders,
  elements.defaultExportFormat,
];

inputs.forEach((el) => el.addEventListener("change", saveSettings));

loadSettings();
