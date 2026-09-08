import type { Settings } from "../types";
import { DEFAULT_SETTINGS } from "../types";

async function resolveTheme(): Promise<"light" | "dark"> {
  try {
    const stored = await chrome.storage.sync.get("settings");
    const theme = (stored.settings as Partial<Settings> | undefined)?.theme ?? DEFAULT_SETTINGS.theme;
    if (theme === "dark") return "dark";
    if (theme === "light") return "light";
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  } catch {
    return "light";
  }
}

export async function applyTheme(): Promise<void> {
  document.documentElement.dataset.theme = await resolveTheme();
}

export function watchTheme(): void {
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === "sync" && changes.settings) applyTheme();
  });
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => applyTheme());
}
