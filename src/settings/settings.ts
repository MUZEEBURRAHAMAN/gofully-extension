import type { Settings } from "../types";
import { DEFAULT_SETTINGS } from "../types";
import { applyTheme, watchTheme } from "../utils/theme";
import { initI18n, watchLanguage } from "../utils/i18n";

applyTheme();
watchTheme();
initI18n();
watchLanguage(() => {});

let currentTheme: Settings["theme"] = DEFAULT_SETTINGS.theme;

const DEFAULT_EDITOR_SHORTCUTS: Record<string, string> = {
  select: "v", arrow: "a", rectangle: "r", ellipse: "e",
  callout: "c", line: "l", freedraw: "p", text: "t",
  spotlight: "s", blur: "b", step: "n", crop: "x", highlight: "h",
};

const SHORTCUT_LABELS: Record<string, string> = {
  select: "Select", arrow: "Arrow", rectangle: "Rectangle", ellipse: "Ellipse",
  callout: "Callout", line: "Line", freedraw: "Pen", text: "Text",
  spotlight: "Spotlight", blur: "Blur", step: "Step Number", crop: "Crop",
  highlight: "Highlighter",
};

let editorShortcuts: Record<string, string> = { ...DEFAULT_EDITOR_SHORTCUTS };

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
  captureStamp: document.getElementById("captureStamp") as HTMLInputElement,
  ocrLanguage: document.getElementById("ocrLanguage") as HTMLSelectElement,
  uiLanguage: document.getElementById("uiLanguage") as HTMLSelectElement,
  savedToast: document.getElementById("savedToast")!,
};

async function loadSettings(): Promise<void> {
  const syncStored = await chrome.storage.sync.get("settings");
  let storedSettings = syncStored.settings;
  if (!storedSettings && chrome.storage.local) {
    const localStored = await chrome.storage.local.get("settings");
    storedSettings = localStored.settings;
  }
  const settings: Settings = {
    ...DEFAULT_SETTINGS,
    ...((storedSettings as Partial<Settings>) || {}),
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
  elements.captureStamp.checked = settings.captureStamp;
  elements.ocrLanguage.value = settings.ocrLanguage;

  editorShortcuts = { ...DEFAULT_EDITOR_SHORTCUTS, ...(settings.editorShortcuts || {}) };
  renderShortcutRows();

  currentTheme = settings.theme;
  document.querySelectorAll<HTMLElement>("#themeSeg button").forEach((b) => {
    b.classList.toggle("active", b.dataset.themeChoice === currentTheme);
  });

  elements.uiLanguage.value = settings.language;
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
    editorShortcuts,
    captureStamp: elements.captureStamp.checked,
    theme: currentTheme,
    ocrLanguage: elements.ocrLanguage.value,
    language: elements.uiLanguage.value,
  };

  await chrome.storage.sync.set({ settings });
  try {
    if (chrome.storage.local) {
      await chrome.storage.local.set({ settings });
    }
  } catch {
    // ignore local storage fallback error
  }
  showSavedToast();
}

function showSavedToast(): void {
  elements.savedToast.classList.add("show");
  setTimeout(() => elements.savedToast.classList.remove("show"), 2000);
}

const RESERVED_KEYS = new Set(["escape", "enter", "delete", "backspace", "tab"]);

function renderShortcutRows(): void {
  const container = document.getElementById("editorShortcutRows");
  if (!container) return;
  container.innerHTML = "";

  Object.keys(DEFAULT_EDITOR_SHORTCUTS).forEach((tool) => {
    const row = document.createElement("div");
    row.className = "shortcut-edit-row";

    const label = document.createElement("span");
    label.textContent = SHORTCUT_LABELS[tool] || tool;

    const keyBtn = document.createElement("button");
    keyBtn.className = "shortcut-key-btn";
    keyBtn.dataset.tool = tool;
    keyBtn.textContent = editorShortcuts[tool].toUpperCase();
    keyBtn.addEventListener("click", () => startListening(keyBtn, tool));

    row.appendChild(label);
    row.appendChild(keyBtn);
    container.appendChild(row);
  });
}

let cancelCurrentListen: (() => void) | null = null;

function startListening(btn: HTMLButtonElement, tool: string): void {
  cancelCurrentListen?.();

  btn.classList.add("listening");
  btn.classList.remove("conflict");
  btn.textContent = "Press a key…";

  const handler = (e: KeyboardEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const key = e.key.toLowerCase();
    if (key === "escape") {
      cancelListening();
      return;
    }
    if (!/^[a-z0-9]$/.test(key) || RESERVED_KEYS.has(key)) {
      btn.classList.add("conflict");
      btn.textContent = "Use A-Z / 0-9";
      return;
    }

    const conflictTool = Object.keys(editorShortcuts).find(
      (t) => t !== tool && editorShortcuts[t] === key
    );
    if (conflictTool) {
      btn.classList.add("conflict");
      btn.textContent = `Used by ${SHORTCUT_LABELS[conflictTool]}`;
      return;
    }

    editorShortcuts[tool] = key;
    cancelListening();
    saveSettings();
  };

  const clickAwayHandler = (e: MouseEvent) => {
    if (e.target !== btn) cancelListening();
  };

  function cancelListening(): void {
    document.removeEventListener("keydown", handler, true);
    document.removeEventListener("click", clickAwayHandler, true);
    btn.classList.remove("listening", "conflict");
    btn.textContent = editorShortcuts[tool].toUpperCase();
    cancelCurrentListen = null;
  }

  cancelCurrentListen = cancelListening;
  document.addEventListener("keydown", handler, true);
  // Deferred so the click that opened this listener doesn't immediately close it.
  setTimeout(() => document.addEventListener("click", clickAwayHandler, true), 0);
}

document.querySelectorAll<HTMLElement>("#themeSeg button").forEach((b) => {
  b.addEventListener("click", () => {
    document.querySelectorAll("#themeSeg button").forEach((x) => x.classList.remove("active"));
    b.classList.add("active");
    currentTheme = b.dataset.themeChoice as Settings["theme"];
    saveSettings();
    applyTheme();
  });
});

document.getElementById("resetShortcutsBtn")?.addEventListener("click", () => {
  editorShortcuts = { ...DEFAULT_EDITOR_SHORTCUTS };
  renderShortcutRows();
  saveSettings();
});

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
  elements.captureStamp,
  elements.ocrLanguage,
  elements.uiLanguage,
];

inputs.forEach((el) => el.addEventListener("change", saveSettings));

loadSettings();
