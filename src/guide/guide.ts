import { applyTheme, watchTheme } from "../utils/theme";
import { clearGuide, getGuide, saveGuide, MAX_STEPS, type Guide } from "../utils/guide";
import { buildGuideMarkdown, buildGuidePdf, guideSlug, guideTitle } from "../export/guide-export";
import { buildZip, dataUrlToBytes } from "../export/zip";

applyTheme();
watchTheme();

const stepsEl = document.getElementById("steps")!;
const emptyEl = document.getElementById("empty")!;
const countEl = document.getElementById("count")!;
const titleEl = document.getElementById("title") as HTMLInputElement;
const toastEl = document.getElementById("toast")!;
const exportPdf = document.getElementById("exportPdf") as HTMLButtonElement;
const exportMd = document.getElementById("exportMd") as HTMLButtonElement;
const clearBtn = document.getElementById("clearAll") as HTMLButtonElement;

let guide: Guide = { title: "", steps: [] };
let toastTimer: number | undefined;

function toast(msg: string): void {
  toastEl.textContent = msg;
  toastEl.classList.add("show");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toastEl.classList.remove("show"), 2200);
}

async function persist(): Promise<void> {
  try {
    await saveGuide(guide);
  } catch {
    toast("Couldn't save. Browser storage is full");
  }
}

function render(): void {
  const n = guide.steps.length;
  emptyEl.hidden = n > 0;
  countEl.textContent = n ? `${n} of ${MAX_STEPS} steps` : "";
  exportPdf.disabled = exportMd.disabled = clearBtn.disabled = n === 0;
  stepsEl.innerHTML = "";

  guide.steps.forEach((s, i) => {
    const el = document.createElement("section");
    el.className = "step";
    el.setAttribute("aria-label", `Step ${i + 1}`);

    const num = document.createElement("div");
    num.className = "num";
    num.textContent = String(i + 1);

    const body = document.createElement("div");
    body.className = "body";
    const ta = document.createElement("textarea");
    ta.placeholder = "What should the reader do or notice here?";
    ta.value = s.caption;
    ta.maxLength = 600;
    ta.setAttribute("aria-label", `Caption for step ${i + 1}`);
    let t: number | undefined;
    ta.addEventListener("input", () => {
      s.caption = ta.value;
      window.clearTimeout(t);
      t = window.setTimeout(() => void persist(), 300);
    });
    const img = document.createElement("img");
    img.className = "shot";
    img.src = s.img;
    img.alt = s.caption || `Screenshot for step ${i + 1}`;
    body.append(ta, img);
    if (s.url) {
      const src = document.createElement("div");
      src.className = "src";
      src.textContent = s.url;
      body.appendChild(src);
    }

    const ctl = document.createElement("div");
    ctl.className = "ctl";
    const mk = (label: string, text: string, disabled: boolean, cls: string, fn: () => void) => {
      const b = document.createElement("button");
      b.type = "button";
      b.textContent = text;
      b.className = cls;
      b.disabled = disabled;
      b.setAttribute("aria-label", label);
      b.title = label;
      b.addEventListener("click", fn);
      return b;
    };
    ctl.append(
      mk("Move up", "↑", i === 0, "", () => move(i, -1)),
      mk("Move down", "↓", i === guide.steps.length - 1, "", () => move(i, 1)),
      mk("Delete step", "×", false, "del", () => remove(i))
    );

    el.append(num, body, ctl);
    stepsEl.appendChild(el);
  });
}

async function move(i: number, d: number): Promise<void> {
  const j = i + d;
  if (j < 0 || j >= guide.steps.length) return;
  [guide.steps[i], guide.steps[j]] = [guide.steps[j], guide.steps[i]];
  await persist();
  render();
}

async function remove(i: number): Promise<void> {
  guide.steps.splice(i, 1);
  await persist();
  render();
  toast("Step removed");
}

function download(blob: Blob, name: string): void {
  const url = URL.createObjectURL(blob);
  const a = Object.assign(document.createElement("a"), { href: url, download: name });
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

titleEl.addEventListener("input", () => {
  guide.title = titleEl.value;
  window.clearTimeout((titleEl as any)._t);
  (titleEl as any)._t = window.setTimeout(() => void persist(), 300);
});

exportPdf.addEventListener("click", () => {
  if (!guide.steps.length) return;
  try {
    download(buildGuidePdf(guide), `${guideSlug(guideTitle(guide))}.pdf`);
    toast("PDF saved");
  } catch {
    toast("PDF export failed");
  }
});

exportMd.addEventListener("click", () => {
  if (!guide.steps.length) return;
  const files = [
    { name: "guide.md", data: new TextEncoder().encode(buildGuideMarkdown(guide)) },
    ...guide.steps.map((s, i) => ({
      name: `images/step-${String(i + 1).padStart(2, "0")}.jpg`,
      data: dataUrlToBytes(s.img),
    })),
  ];
  download(buildZip(files), `${guideSlug(guideTitle(guide))}.zip`);
  toast("Markdown bundle saved");
});

clearBtn.addEventListener("click", async () => {
  if (!guide.steps.length) return;
  if (!confirm(`Remove all ${guide.steps.length} steps from this guide? This can't be undone.`)) return;
  await clearGuide();
  guide = { title: "", steps: [] };
  titleEl.value = "";
  render();
  toast("Guide cleared");
});

// Another tab (the editor, the capture card) may add a step while this page is open.
chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== "local" || !changes.gofullyGuide) return;
  const next = changes.gofullyGuide.newValue as Guide | undefined;
  guide = next && Array.isArray(next.steps) ? { title: next.title || "", steps: next.steps } : { title: "", steps: [] };
  if (document.activeElement !== titleEl) titleEl.value = guide.title;
  render();
});

void getGuide().then((g) => {
  guide = g;
  titleEl.value = g.title;
  render();
});
