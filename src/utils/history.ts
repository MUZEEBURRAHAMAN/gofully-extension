export interface HistoryEntry {
  id: string;
  thumbnail: string;
  url: string;
  title: string;
  mode: string;
  method: string;
  width: number;
  height: number;
  timestamp: number;
}

const HISTORY_KEY = "captureHistory";
const MAX_ENTRIES = 50;
const THUMB_MAX_W = 240;
const THUMB_MAX_H = 160;

export async function generateThumbnail(dataUrl: string): Promise<string> {
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  const bitmap = await createImageBitmap(blob);
  const { width: w, height: h } = bitmap;

  const scale = Math.min(THUMB_MAX_W / w, THUMB_MAX_H / h, 1);
  const tw = Math.round(w * scale);
  const th = Math.round(h * scale);

  const canvas = new OffscreenCanvas(tw, th);
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(bitmap, 0, 0, tw, th);
  bitmap.close();

  const thumbBlob = await canvas.convertToBlob({ type: "image/jpeg", quality: 0.7 });
  const bytes = new Uint8Array(await thumbBlob.arrayBuffer());
  const CHUNK = 0x8000;
  const parts: string[] = [];
  for (let i = 0; i < bytes.length; i += CHUNK) {
    parts.push(String.fromCharCode(...bytes.subarray(i, i + CHUNK)));
  }
  return `data:image/jpeg;base64,${btoa(parts.join(""))}`;
}

export async function addHistoryEntry(entry: HistoryEntry): Promise<void> {
  const stored = await chrome.storage.local.get(HISTORY_KEY) as Record<string, HistoryEntry[]>;
  const history: HistoryEntry[] = stored[HISTORY_KEY] || [];
  history.unshift(entry);
  if (history.length > MAX_ENTRIES) {
    history.length = MAX_ENTRIES;
  }
  await chrome.storage.local.set({ [HISTORY_KEY]: history });
}

export async function getHistory(): Promise<HistoryEntry[]> {
  const stored = await chrome.storage.local.get(HISTORY_KEY) as Record<string, HistoryEntry[]>;
  return stored[HISTORY_KEY] || [];
}

export async function deleteHistoryEntry(id: string): Promise<void> {
  const stored = await chrome.storage.local.get(HISTORY_KEY) as Record<string, HistoryEntry[]>;
  const history: HistoryEntry[] = stored[HISTORY_KEY] || [];
  const filtered = history.filter((e) => e.id !== id);
  await chrome.storage.local.set({ [HISTORY_KEY]: filtered });
}

export async function clearHistory(): Promise<void> {
  await chrome.storage.local.remove(HISTORY_KEY);
}
