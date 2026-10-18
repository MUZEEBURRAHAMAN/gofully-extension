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
  /** on-device OCR text, so past captures can be searched by what they say */
  text?: string;
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
  await deleteFullImage(id);
}

export async function clearHistory(): Promise<void> {
  await chrome.storage.local.remove(HISTORY_KEY);
  await clearFullImages();
}

export async function setHistoryText(id: string, text: string): Promise<void> {
  const stored = await chrome.storage.local.get(HISTORY_KEY) as Record<string, HistoryEntry[]>;
  const history: HistoryEntry[] = stored[HISTORY_KEY] || [];
  const entry = history.find((e) => e.id === id);
  if (!entry) return; // deleted or rotated out while it was being read
  entry.text = text;
  await chrome.storage.local.set({ [HISTORY_KEY]: history });
}

// ---- Full-size copies of recent captures (opt-in) -------------------------
// Thumbnails alone can't reopen a capture, so with "Keep recent captures"
// switched on the last few full images live in IndexedDB on this device.
export const MAX_FULL_IMAGES = 10;
const DB_NAME = "gofully-captures";
const STORE = "full";

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function withStore<T>(mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await openDb();
  try {
    return await new Promise<T>((resolve, reject) => {
      const req = fn(db.transaction(STORE, mode).objectStore(STORE));
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  } finally {
    db.close();
  }
}

export async function saveFullImage(id: string, dataUrl: string): Promise<void> {
  await withStore("readwrite", (s) => s.put(dataUrl, id));
  // keep only the newest MAX_FULL_IMAGES that history still lists
  const keys = (await withStore("readonly", (s) => s.getAllKeys())) as string[];
  const order = (await getHistory()).map((e) => e.id);
  const keep = new Set(order.filter((k) => keys.includes(k)).slice(0, MAX_FULL_IMAGES));
  keep.add(id);
  for (const k of keys) if (!keep.has(k)) await withStore("readwrite", (s) => s.delete(k));
}

export async function getFullImage(id: string): Promise<string | null> {
  try {
    return ((await withStore("readonly", (s) => s.get(id))) as string | undefined) ?? null;
  } catch {
    return null;
  }
}

export async function listFullImageIds(): Promise<string[]> {
  try {
    return (await withStore("readonly", (s) => s.getAllKeys())) as string[];
  } catch {
    return [];
  }
}

export async function deleteFullImage(id: string): Promise<void> {
  try { await withStore("readwrite", (s) => s.delete(id)); } catch { /* nothing stored */ }
}

export async function clearFullImages(): Promise<void> {
  try { await withStore("readwrite", (s) => s.clear()); } catch { /* nothing stored */ }
}
