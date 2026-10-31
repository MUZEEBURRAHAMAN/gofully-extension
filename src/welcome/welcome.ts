import { applyTheme, watchTheme } from "../utils/theme";

applyTheme();
watchTheme();

document.getElementById("getStartedBtn")?.addEventListener("click", () => {
  window.close();
});

// Show the full-page shortcut Chrome actually has bound (users can change it).
const keysEl = document.getElementById("shortcutKeys");
const isMac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
const toKeys = (shortcut: string): string[] => {
  const sym: Record<string, string> = { Command: "⌘", Ctrl: isMac ? "⌃" : "Ctrl", Alt: isMac ? "⌥" : "Alt", Option: "⌥", Shift: "⇧", MacCtrl: "⌃" };
  return shortcut.split("+").map((k) => sym[k] ?? k.toUpperCase());
};
const showKeys = (keys: string[]) => {
  if (!keysEl) return;
  keysEl.replaceChildren(...keys.map((k) => Object.assign(document.createElement("kbd"), { className: "gf-kbd", textContent: k })));
  keysEl.setAttribute("aria-label", `Full page shortcut: ${keys.join(" ")}`);
};
if (chrome.commands?.getAll) {
  chrome.commands.getAll((cmds) => {
    const full = cmds.find((c) => c.name === "capture-full-page");
    if (full?.shortcut) showKeys(toKeys(full.shortcut));
    else if (keysEl) keysEl.hidden = true;
  });
}
