// Beautify panel: collapsible groups (details.bf-group) that remember which ones you opened
// and show a dot when anything inside differs from its default.

const STORE_KEY = "gf-bf-open-groups";

function isModified(group: HTMLElement): boolean {
  for (const el of group.querySelectorAll<HTMLInputElement | HTMLSelectElement>("input, select")) {
    if (el instanceof HTMLSelectElement) {
      const def = Array.from(el.options).find((o) => o.defaultSelected) ?? el.options[0];
      if (def && el.value !== def.value) return true;
    } else if (el.type === "range" || el.type === "text" || el.type === "color") {
      if (el.value !== el.defaultValue) return true;
    }
  }
  // Segmented and grid buttons: compare the active one with the one active at load.
  for (const btn of group.querySelectorAll<HTMLElement>("[data-default-active]")) {
    if (!btn.classList.contains("active")) return true;
  }
  return group.querySelector(".bf-collage-thumb") !== null;
}

export function initBeautifyGroups(): void {
  const panel = document.getElementById("beautifyPanel");
  if (!panel) return;
  const groups = Array.from(panel.querySelectorAll<HTMLDetailsElement>("details.bf-group"));

  let open: string[] = [];
  try { open = JSON.parse(localStorage.getItem(STORE_KEY) || "[]"); } catch { open = []; }

  for (const g of groups) {
    g.querySelectorAll(".active").forEach((b) => b.setAttribute("data-default-active", ""));
    if (open.includes(g.dataset.group || "")) g.open = true;
    g.addEventListener("toggle", () => {
      const now = groups.filter((x) => x.open).map((x) => x.dataset.group || "");
      try { localStorage.setItem(STORE_KEY, JSON.stringify(now)); } catch { /* private mode */ }
    });
  }

  // Progressive blur: direction, amount and scope only matter once a blur type is picked.
  const pbMode = document.getElementById("bf-pb-mode") as HTMLSelectElement | null;
  const pbRows = ["bf-pb-dir", "bf-pb-strength", "bf-pb-scope"].map((id) => document.getElementById(id)?.closest(".bf-row") as HTMLElement | null);
  const syncBlur = () => pbRows.forEach((r) => { if (r) r.hidden = !pbMode || pbMode.value === "off"; });

  let queued = false;
  const refresh = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      syncBlur();
      for (const g of groups) g.toggleAttribute("data-modified", isModified(g));
    });
  };

  // Presets and Reset set values from code, which fires no input events: also watch class and DOM changes.
  panel.addEventListener("input", refresh);
  panel.addEventListener("change", refresh);
  panel.addEventListener("click", () => setTimeout(refresh, 60));
  new MutationObserver(refresh).observe(panel, { subtree: true, childList: true, attributes: true, attributeFilter: ["class"] });
  refresh();
}
