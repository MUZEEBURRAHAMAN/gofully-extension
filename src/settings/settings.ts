import type { Settings } from "../types";
import { DEFAULT_SETTINGS } from "../types";

const elements = {
  defaultAction: document.getElementById("defaultAction") as HTMLSelectElement,
  captureDelay: document.getElementById("captureDelay") as HTMLInputElement,
  lazyLoadWait: document.getElementById("lazyLoadWait") as HTMLInputElement,
  pngSaveAs: document.getElementById("pngSaveAs") as HTMLSelectElement,
  pdfPageSize: document.getElementById("pdfPageSize") as HTMLSelectElement,
  pdfWatermark: document.getElementById("pdfWatermark") as HTMLInputElement,
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
  };

  await chrome.storage.sync.set({ settings });
  showSavedToast();
}

function showSavedToast(): void {
  elements.savedToast.classList.add("show");
  setTimeout(() => elements.savedToast.classList.remove("show"), 2000);
}

// Auto-save on change
const inputs = [
  elements.defaultAction,
  elements.captureDelay,
  elements.lazyLoadWait,
  elements.pngSaveAs,
  elements.pdfPageSize,
  elements.pdfWatermark,
];

inputs.forEach((el) => {
  el.addEventListener("change", saveSettings);
});

loadSettings();
