// Checks that migrated extension surfaces use only the GoFully design system.
// Run: node scripts/ds-lint.mjs   (exit code 1 on violations)
// Add a file to MIGRATED once its page has moved to src/ui/ds; the list only grows.
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

export const MIGRATED = [
  "src/ui/ds/components.css",
  "src/popup/popup.html",
  "src/editor/editor.html",
  "src/settings/settings.html",
  "src/guide/guide.html",
  "src/review/review.html",
  "src/welcome/welcome.html",
  "src/help/help.html",
  "src/ui/overlay-kit.ts",
  "src/content/scrolling-area-ui.ts",
  "src/content/region-selector.ts",
  "src/content/element-picker.ts",
  "src/content/pin-overlay.ts",
  "src/content/result-bar.ts",
  "src/content/ocr-overlay.ts",
  "src/content/live-annotate.ts",
  "src/content/measure-overlay.ts",
  "src/content/live-redact.ts",
];

const RULES = [
  { id: "raw-hex", re: /#[0-9a-fA-F]{3,8}\b(?![^<]*<\/(?:path|svg))/g, msg: "raw hex colour; use a var(--gf-*) role" },
  { id: "raw-rgb", re: /\b(?:rgba?|hsla?)\(/g, msg: "raw rgb/hsl colour; use a var(--gf-*) role" },
  { id: "font-family", re: /font-family:(?!\s*(?:var\(--gf-font-(?:sans|serif)\)|inherit|'GoFully |\$\{FONT_(?:STACK|FAMILY)\}))[^;"]+/g, msg: "font-family must be var(--gf-font-sans|serif)" },
  { id: "inline-svg", re: /<svg[\s>]/g, msg: "inline <svg>; use <i class=\"gf-icon\" data-icon=\"…\"></i> or icon() from src/ui/ds/icons.ts", htmlOnly: true },
  { id: "old-tokens", re: /var\(--(?:blue|blue-h|blue-bg|text-muted|surface|sunken|border-h|r-sm|r-md|r-lg)\)/g, msg: "legacy token; map it to a --gf-* role" },
];

let failures = 0;
for (const rel of MIGRATED) {
  const src = readFileSync(resolve(root, rel), "utf8");
  // Strip comments and the data-URI/SVG path payloads, which legitimately contain hex-like text.
  // Blank out comments but keep their newlines so line numbers stay true.
  const blank = (m) => m.replace(/[^\n]/g, " ");
  const body = src.replace(/\/\*[\s\S]*?\*\//g, blank).replace(/<!--[\s\S]*?-->/g, blank);
  const srcLines = src.split("\n");
  for (const rule of RULES) {
    if (rule.htmlOnly && !rel.endsWith(".html")) continue;
    for (const m of body.matchAll(rule.re)) {
      const line = body.slice(0, m.index).split("\n").length;
      if (srcLines[line - 1].includes("ds-lint-allow")) continue;
      console.log(`${rel}:${line}  [${rule.id}] ${rule.msg}  → ${m[0].slice(0, 40)}`);
      failures++;
    }
  }
}
if (failures) { console.log(`\nds-lint: ${failures} violation(s)`); process.exit(1); }
console.log(`ds-lint: ${MIGRATED.length} file(s) clean`);
