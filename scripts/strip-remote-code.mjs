// Chrome Web Store policy (Manifest V3): the package must not contain remotely hosted code.
// Some bundled libraries keep CDN fallbacks we never use, and the review flags the URLs themselves
// (Chrome Web Store violation "Blue Argon", Nov 2026):
//   - tesseract.js: default workerPath, corePath and langPath on jsdelivr / projectnaptha.
//     GoFully always passes local paths (src/offscreen/canvas-stitcher.ts), so these are dead code.
//   - jsPDF: output("pdfobjectnewwindow") loads pdfobject from cdnjs. GoFully only calls output("blob").
// This step blanks those fallbacks in dist/ after the build, then fails the build if any
// code-loading CDN is still referenced anywhere in the package.
import { readFileSync, writeFileSync, readdirSync, statSync } from "fs";
import { join, relative } from "path";

const REPLACEMENTS = [
  // tesseract.js default worker URL (template literal in the bundled tesseract defaults)
  [/`https:\/\/cdn\.jsdelivr\.net\/npm\/tesseract\.js@v\$\{[^}]+\}\/dist\/worker\.min\.js`/g, '""'],
  // tesseract.js default traineddata location
  [/"https:\/\/tessdata\.projectnaptha\.com\/[0-9.]+"/g, '""'],
  // tesseract worker: default tesseract-core URL, only used when no corePath is given
  [/"https:\/\/cdn\.jsdelivr\.net\/npm\/tesseract\.js-core@v"\.concat\([^)]*\)\)/g, '""'],
  // jsPDF pdfobject viewer loader
  [/"https:\/\/cdnjs\.cloudflare\.com\/ajax\/libs\/pdfobject\/[0-9.]+\/pdfobject\.min\.js"/g, '""'],
];
// Code the review reads as obfuscation (violation "Red Titanium", Nov 2026): core-js's ActiveX/iframe
// Object.create polyfill, pulled in by canvg. vite.config.ts aliases canvg to a stub; this keeps it out.
const FORBIDDEN_CODE = ["activeXDocument", "NullProtoObjectViaIFrame", "node_modules/core-js/", "node_modules/html2canvas/", "node_modules/dompurify/"];
const FORBIDDEN = ["cdn.jsdelivr.net", "cdnjs.cloudflare.com", "unpkg.com", "tessdata.projectnaptha.com", "esm.sh", "cdn.skypack.dev", "ajax.googleapis.com"];

function files(dir) {
  return readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    return statSync(p).isDirectory() ? files(p) : /\.(m?js|html)$/.test(n) ? [p] : [];
  });
}

export function stripRemoteCode(dist) {
  let changed = 0;
  for (const f of files(dist)) {
    const before = readFileSync(f, "utf8");
    let after = before;
    for (const [re, to] of REPLACEMENTS) after = after.replace(re, to);
    if (after !== before) { writeFileSync(f, after); changed++; }
  }
  const left = [];
  for (const f of files(dist)) {
    const s = readFileSync(f, "utf8");
    for (const host of FORBIDDEN) if (s.includes(host)) left.push(`${relative(dist, f)}: ${host}`);
    for (const code of FORBIDDEN_CODE) if (s.includes(code)) left.push(`${relative(dist, f)}: ${code} (flagged as obfuscated code)`);
  }
  if (left.length) {
    console.error("Code the Chrome Web Store rejects remains in the package (remote code or obfuscation policy):\n  " + left.join("\n  "));
    process.exit(1);
  }
  console.log(`strip-remote-code: cleaned ${changed} file(s); no remote code references left.`);
}

if (process.argv[1] && process.argv[1].endsWith("strip-remote-code.mjs")) stripRemoteCode(process.argv[2] || "dist");
