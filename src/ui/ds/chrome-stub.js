// Preview aid for design review. Inert inside the extension: it only acts when
// the page is opened over http(s) with ?stub=1 and no real chrome.runtime exists.
// It fakes the chrome.* calls the pages make so they render with sample data.
(() => {
  const q = new URLSearchParams(location.search);
  if (!q.has("stub") || (globalThis.chrome && chrome.runtime && chrome.runtime.id)) return;
  if (q.get("theme")) document.documentElement.dataset.theme = q.get("theme");
  const local = {}, sync = { settings: q.get("theme") ? { theme: q.get("theme") } : {} }, session = {};
  const area = (store) => ({
    get: async (keys) => {
      if (keys == null) return { ...store };
      const list = typeof keys === "string" ? [keys] : Array.isArray(keys) ? keys : Object.keys(keys);
      return Object.fromEntries(list.map((k) => [k, store[k] ?? (typeof keys === "object" && !Array.isArray(keys) ? keys[k] : undefined)]));
    },
    set: async (obj) => { Object.assign(store, obj); },
    remove: async (keys) => { for (const k of [].concat(keys)) delete store[k]; },
  });
  const noop = () => {};
  // ?guide=3 seeds a guide with that many steps (30 shows the limit banner); ?guide=0 is empty.
  const gn = Number(q.get("guide") ?? 0);
  if (gn > 0) {
    const shots = ["assets/onboarding-editor.jpg", "assets/onboarding-ocr.jpg", "assets/onboarding-export.jpg"];
    local.gofullyGuide = {
      title: "Set up Acme Pay checkout",
      steps: Array.from({ length: gn }, (_, i) => ({ img: shots[i % 3], url: "https://acmepay.dev/payments/step-" + (i + 1), caption: i < 3 ? ["Open the dashboard and pick Payments in the left menu.", "Choose Prebuilt checkout, then set your currency.", "Press Preview to see the page your customers get."][i] : "" })),
    };
  }
  // Sample data per message type. ?history=empty shows the empty state.
  const now = Date.now();
  const shots = ["assets/onboarding-editor.jpg", "assets/onboarding-ocr.jpg", "assets/onboarding-export.jpg"];
  const history = q.get("history") === "empty" ? [] : [
    ["https://stripe.com/docs", "Stripe Docs", 2 * 6e4], ["https://linear.app", "Linear", 36e5],
    ["https://figma.com/pricing", "Figma pricing", 864e5], ["https://vercel.com/billing", "Vercel billing", 9e7],
    ["https://notion.so", "Notion", 1728e5], ["https://github.com", "GitHub", 2592e5],
  ].map(([url, title, ago], i) => ({ id: "s" + i, url, title, timestamp: now - ago, width: 1440, height: 4200, thumbnail: shots[i % 3], mode: "full-page" }));
  const reply = (msg) => {
    switch (msg.type) {
      case "GET_HISTORY": return { history };
      case "LIST_FULL_IMAGES": return { ids: history.map((h) => h.id) };
      case "GET_CAPTURE_BLOB_URL":
        // The editor only accepts a data: URL, like the real service worker sends.
        return fetch(q.get("img") || "assets/onboarding-editor.jpg").then((r) => r.blob()).then((b) => new Promise((res) => {
          const fr = new FileReader(); fr.onload = () => res({ url: fr.result }); fr.readAsDataURL(b);
        }));
      case "GET_LAST_CAPTURE": return { hasBlob: true, result: { mode: "visible-area", width: 1280, height: 720, url: "https://acmepay.dev", timestamp: now - 6e4, method: "snapshot" } };
      default: return { ok: true };
    }
  };
  globalThis.chrome = {
    runtime: {
      id: undefined,
      sendMessage: (msg, cb) => {
        const p = Promise.resolve(reply(msg || {}));
        if (typeof cb === "function") p.then((r) => cb(r));
        return p;
      },
      getManifest: () => ({ version: "1.1.3", name: "GoFully" }),
      getURL: (p) => p,
      openOptionsPage: noop,
      onMessage: { addListener: noop },
    },
    storage: { local: area(local), sync: area(sync), session: area(session), onChanged: { addListener: noop } },
    tabs: { query: async () => [{ id: 1, url: "https://acmepay.dev/payments", title: "Payments API · Acme Docs" }], create: noop, sendMessage: async () => ({}) },
    commands: { getAll: (cb) => { const r = [
      { name: "_execute_action", shortcut: "⌥S" },
      { name: "capture-full-page", shortcut: "⌘⇧F" },
      { name: "capture-visible", shortcut: "⌘⇧V" },
      { name: "capture-selected-area", shortcut: "⌘⇧A" },
    ]; if (cb) cb(r); return Promise.resolve(r); } },
    downloads: { download: noop },
    i18n: { getMessage: () => "", getUILanguage: () => "en" },
  };
})();
