/**
 * Step-by-step guide: a short list of captured screenshots with captions, kept
 * in chrome.storage.local on this device and exported as a PDF or a Markdown
 * bundle. Images are stored as downscaled JPEGs so a guide of a few dozen steps
 * stays well inside the extension's storage quota.
 */

export interface GuideStep {
  id: string;
  /** JPEG data URL */
  img: string;
  w: number;
  h: number;
  caption: string;
  url: string;
  ts: number;
}

export interface Guide {
  title: string;
  steps: GuideStep[];
}

const KEY = "gofullyGuide";
export const MAX_STEPS = 30;
const MAX_BYTES = 8 * 1024 * 1024; // leave room for history thumbnails inside the 10 MB local quota
const MAX_W = 1400;
const MAX_H = 4200;

export async function getGuide(): Promise<Guide> {
  const r = (await chrome.storage.local.get(KEY)) as Record<string, Guide | undefined>;
  const g = r[KEY];
  return g && Array.isArray(g.steps) ? { title: g.title || "", steps: g.steps } : { title: "", steps: [] };
}

export async function saveGuide(g: Guide): Promise<void> {
  await chrome.storage.local.set({ [KEY]: g });
}

export async function clearGuide(): Promise<void> {
  await chrome.storage.local.remove(KEY);
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(r.error);
    r.readAsDataURL(blob);
  });
}

/** Shrinks a capture to a guide-sized JPEG. */
export async function toGuideImage(dataUrl: string): Promise<{ img: string; w: number; h: number }> {
  const blob = await (await fetch(dataUrl)).blob();
  const bmp = await createImageBitmap(blob);
  const scale = Math.min(1, MAX_W / bmp.width, MAX_H / bmp.height);
  const w = Math.max(1, Math.round(bmp.width * scale));
  const h = Math.max(1, Math.round(bmp.height * scale));
  const c = new OffscreenCanvas(w, h);
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#ffffff"; // JPEG has no alpha
  ctx.fillRect(0, 0, w, h);
  ctx.drawImage(bmp, 0, 0, w, h);
  bmp.close();
  const jpg = await c.convertToBlob({ type: "image/jpeg", quality: 0.82 });
  return { img: await blobToDataUrl(jpg), w, h };
}

export type AddResult = { ok: true; count: number } | { ok: false; error: string };

export async function addStepFromDataUrl(dataUrl: string, meta: { url?: string } = {}): Promise<AddResult> {
  if (!dataUrl.startsWith("data:image/")) return { ok: false, error: "Not an image" };
  const guide = await getGuide();
  if (guide.steps.length >= MAX_STEPS) {
    return { ok: false, error: `A guide holds up to ${MAX_STEPS} steps. Export it or start a new one` };
  }
  const { img, w, h } = await toGuideImage(dataUrl);
  const used = guide.steps.reduce((n, s) => n + s.img.length, 0);
  if (used + img.length > MAX_BYTES) {
    return { ok: false, error: "This guide is full. Export it, then clear it to add more steps" };
  }
  guide.steps.push({
    id: `s_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    img, w, h, caption: "", url: meta.url || "", ts: Date.now(),
  });
  try {
    await saveGuide(guide);
  } catch {
    return { ok: false, error: "Couldn't save. Browser storage is full" };
  }
  return { ok: true, count: guide.steps.length };
}
