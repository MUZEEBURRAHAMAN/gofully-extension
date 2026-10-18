import { test, expect } from "@playwright/test";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const read = (p: string) => fs.readFileSync(path.join(root, p), "utf8");
const json = (p: string) => JSON.parse(read(p));

test.describe("Content and manifest lint", () => {
  test("manifest: v1.1.3, at most 4 suggested keys, every command described", () => {
    const m = json("manifest.json");
    const pkg = json("package.json");
    expect(m.version).toBe("1.1.3");
    expect(pkg.version).toBe(m.version);
    const cmds = Object.entries<any>(m.commands || {});
    const keyed = cmds.filter(([, c]) => c.suggested_key);
    expect(keyed.length).toBeLessThanOrEqual(4);
    expect(cmds.map(([k]) => k)).toContain("annotate-page");
    for (const [, c] of cmds) expect(String(c.description || "").length).toBeGreaterThan(3);
    expect(m.permissions).not.toContain("debugger");
  });

  test("locales: es and fr carry every en key, none empty", () => {
    const en = json("src/locales/en.json");
    for (const l of ["es", "fr"]) {
      const o = json(`src/locales/${l}.json`);
      const missing = Object.keys(en).filter((k) => !(k in o));
      expect(missing, `${l} missing`).toEqual([]);
      for (const [k, v] of Object.entries<any>(o)) expect(String(v).trim().length, `${l}.${k}`).toBeGreaterThan(0);
    }
  });

  test("copy: no em dashes in user-visible strings", () => {
    const files = ["src/locales/en.json", "src/locales/es.json", "src/locales/fr.json", "store-listing/short-description.txt"];
    for (const f of files) {
      const hits = read(f).split("\n").filter((l) => l.includes("—"));
      expect(hits, f).toEqual([]);
    }
    for (const f of ["src/guide/guide.ts", "src/utils/guide.ts", "src/content/live-annotate.ts", "src/content/pin-overlay.ts", "src/content/element-picker.ts"]) {
      const strings = read(f).match(/(["'`])(?:(?!\1)[^\\\n]|\\.)*—(?:(?!\1)[^\\\n]|\\.)*\1/g) || [];
      expect(strings, f).toEqual([]);
    }
  });

  test("copy: no false claims about DevTools Protocol or debugger in public text", () => {
    for (const f of ["README.md", "store-listing/description.txt", "src/help/help.html", "app/privacy/page.tsx"]) {
      const t = read(f);
      expect(/DevTools Protocol|\bCDP\b|debugger/i.test(t), f).toBe(false);
    }
  });

  test("short description fits the 132 character Web Store limit", () => {
    expect(read("store-listing/short-description.txt").trim().length).toBeLessThanOrEqual(132);
  });

  test("help page: badges count 1..N with no gaps and every accordion has a panel", () => {
    const h = read("src/help/help.html");
    const nums = [...h.matchAll(/<div class="help-num-badge">(\d+)<\/div>/g)].map((m) => +m[1]);
    expect(nums.length).toBeGreaterThanOrEqual(15);
    expect(nums).toEqual(nums.map((_, i) => i + 1));
    expect((h.match(/class="help-header"/g) || []).length).toBe(nums.length);
    expect((h.match(/class="help-content"/g) || []).length).toBe(nums.length);
  });

  test("build config: every content script and page is wired", () => {
    const b = read("build.mjs");
    for (const s of ["live-annotate", "pin-overlay", "element-picker"]) expect(b).toContain(s);
    expect(read("vite.config.ts")).toContain("guide");
  });
});
