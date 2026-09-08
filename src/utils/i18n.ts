import type { Settings } from "../types";
import { DEFAULT_SETTINGS } from "../types";
import en from "../locales/en.json";
import es from "../locales/es.json";
import fr from "../locales/fr.json";

const CATALOGS: Record<string, Record<string, string>> = { en, es, fr };

let activeCatalog: Record<string, string> = en;

function resolveLanguage(setting: string): string {
  if (setting === "system") {
    const browserLang = (navigator.language || "en").slice(0, 2).toLowerCase();
    return CATALOGS[browserLang] ? browserLang : "en";
  }
  return CATALOGS[setting] ? setting : "en";
}

export async function loadLanguage(): Promise<void> {
  try {
    const stored = await chrome.storage.sync.get("settings");
    const lang = (stored.settings as Partial<Settings> | undefined)?.language ?? DEFAULT_SETTINGS.language;
    activeCatalog = CATALOGS[resolveLanguage(lang)] || en;
  } catch {
    activeCatalog = en;
  }
}

export function t(key: string, vars?: Record<string, string | number>): string {
  let str = activeCatalog[key] ?? en[key as keyof typeof en] ?? key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      str = str.split(`{${k}}`).join(String(v));
    }
  }
  return str;
}

export function applyI18nToDom(root: ParentNode = document): void {
  root.querySelectorAll<HTMLElement>("[data-i18n]").forEach((el) => {
    el.textContent = t(el.dataset.i18n!);
  });
}

export async function initI18n(): Promise<void> {
  await loadLanguage();
  applyI18nToDom();
}

export function watchLanguage(onChange: () => void): void {
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === "sync" && changes.settings) {
      loadLanguage().then(() => {
        applyI18nToDom();
        onChange();
      });
    }
  });
}
