import { test, expect } from "@playwright/test";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { isSafeImageDataUrl } from "../../src/utils/safe-image";

const root = join(fileURLToPath(new URL(".", import.meta.url)), "../..");

// Anything put into innerHTML / insertAdjacentHTML may contain only our own icon and illustration builders,
// numbers, or constants. Page text, titles, URLs, OCR output and imported files go in with textContent.
const SAFE_INTERPOLATION = /^\$\{\s*(chrome\.runtime\.getManifest\(\)\.version|isLongCapture \? |methodLabel === "Scroll-Stitch" \? |icon\(|Icon\.\w+\(|illustration\(|shapeSvg\(|T\.\w+|alpha\(|FONT_\w+|\w+Px|[wh]\b|\d)/;

function walk(d: string): string[] {
  return readdirSync(d).flatMap((n) => {
    const p = join(d, n);
    return statSync(p).isDirectory() ? walk(p) : /\.ts$/.test(n) ? [p] : [];
  });
}

test.describe("extension HTML sinks", () => {
  test("SEC-SINK-001: no unreviewed value is interpolated into innerHTML", () => {
    const offenders: string[] = [];
    for (const file of walk(join(root, "src"))) {
      const lines = readFileSync(file, "utf8").split("\n");
      lines.forEach((line, i) => {
        if (!/(innerHTML\s*=|insertAdjacentHTML\()/.test(line)) return;
        // Read this statement: the line itself plus following lines until the template literal closes.
        let chunk = line;
        for (let j = i + 1; j < lines.length && (chunk.match(/`/g) ?? []).length % 2 === 1; j++) chunk += "\n" + lines[j];
        for (const m of chunk.matchAll(/\$\{[^}]*\}/g)) {
          if (!SAFE_INTERPOLATION.test(m[0])) offenders.push(`${relative(root, file)}:${i + 1} ${m[0]}`);
        }
      });
    }
    expect(offenders, "interpolated values inside innerHTML; use textContent or add a reviewed builder").toEqual([]);
  });

  test("SEC-SINK-002: image data URLs are strictly raster and cannot break out of an attribute", () => {
    const png = "data:image/png;base64,iVBORw0KGgo=";
    expect(isSafeImageDataUrl(png)).toBe(true);
    expect(isSafeImageDataUrl("data:image/jpeg;base64,/9j/4AAQ")).toBe(true);
    for (const bad of [
      "data:image/svg+xml;base64,PHN2Zz48c2NyaXB0Lz48L3N2Zz4=",
      'data:image/png;base64,AAAA" onerror="alert(1)',
      "data:text/html;base64,PHNjcmlwdD4=",
      "javascript:alert(1)",
      "https://evil.example/x.png",
      "data:image/png;base64,AA AA",
      undefined, null, 42, {},
    ]) expect(isSafeImageDataUrl(bad as unknown)).toBe(false);
  });
});
