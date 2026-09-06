import { execSync } from "child_process";
import { cpSync, mkdirSync, readFileSync, writeFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { build } from "vite";

const __dirname = dirname(fileURLToPath(import.meta.url));
const dist = resolve(__dirname, "dist");

// Step 1: Run main Vite build (ES modules: service-worker, popup, settings, editor)
console.log("Step 1: Building ES module entries...");
execSync("npx vite build", { stdio: "inherit", cwd: __dirname });

// Step 2: Build content scripts as IIFE (no imports, self-contained)
console.log("Step 2: Building content scripts as IIFE...");
const contentScripts = [
  "page-analyzer",
  "sticky-manager",
  "lazy-loader",
  "result-bar",
  "region-selector",
  "scrolling-area-ui",
  "ocr-overlay",
];

for (const name of contentScripts) {
  await build({
    configFile: false,
    // configFile: false means vite.config.ts's publicDir: false doesn't
    // apply here — without repeating it, each of these 7 separate builds
    // would independently re-copy the whole (shared, Next.js) public/
    // folder into dist/ on its own.
    publicDir: false,
    build: {
      outDir: dist,
      emptyOutDir: false,
      write: true,
      rollupOptions: {
        input: resolve(__dirname, `src/content/${name}.ts`),
        output: {
          entryFileNames: `${name}.js`,
          format: "iife",
          name: `SnapForge_${name.replace(/-/g, "_")}`,
        },
      },
      target: "esnext",
      minify: false,
      sourcemap: false,
    },
  });
}

// Step 3: Copy manifest.json & SEO files
console.log("Step 3: Copying manifest.json, robots.txt, sitemap.xml...");
cpSync(resolve(__dirname, "manifest.json"), resolve(dist, "manifest.json"));

if (existsSync(resolve(__dirname, "public/robots.txt"))) {
  cpSync(resolve(__dirname, "public/robots.txt"), resolve(dist, "robots.txt"));
}
if (existsSync(resolve(__dirname, "public/sitemap.xml"))) {
  cpSync(resolve(__dirname, "public/sitemap.xml"), resolve(dist, "sitemap.xml"));
}
// gofully-wordmark(-dark).png were previously copied here too, but nothing
// in popup/editor/settings/help.html references them — they're the
// website's Open Graph images, not used by the extension. Dropped to keep
// the Chrome Web Store upload from carrying 1.15MB of dead weight.

// Step 4: Copy assets (icons)
console.log("Step 4: Copying assets...");
mkdirSync(resolve(dist, "assets"), { recursive: true });
for (const size of ["16", "32", "48", "128"]) {
  cpSync(
    resolve(__dirname, `assets/icon-${size}.png`),
    resolve(dist, `assets/icon-${size}.png`)
  );
}
if (existsSync(resolve(__dirname, "assets/shutter.mp3"))) {
  cpSync(
    resolve(__dirname, "assets/shutter.mp3"),
    resolve(dist, "assets/shutter.mp3")
  );
}
if (existsSync(resolve(__dirname, "assets/Archivo.woff2"))) {
  cpSync(
    resolve(__dirname, "assets/Archivo.woff2"),
    resolve(dist, "assets/Archivo.woff2")
  );
}
for (const name of ["onboarding-ocr.jpg", "onboarding-editor.jpg", "onboarding-export.jpg"]) {
  if (existsSync(resolve(__dirname, `assets/${name}`))) {
    cpSync(resolve(__dirname, `assets/${name}`), resolve(dist, `assets/${name}`));
  }
}

// Copy local Tesseract OCR assets
if (existsSync(resolve(__dirname, "node_modules/tesseract.js/dist/worker.min.js"))) {
  cpSync(
    resolve(__dirname, "node_modules/tesseract.js/dist/worker.min.js"),
    resolve(dist, "assets/tesseract-worker.min.js")
  );
}
if (existsSync(resolve(__dirname, "node_modules/tesseract.js-core/tesseract-core.wasm.js"))) {
  cpSync(
    resolve(__dirname, "node_modules/tesseract.js-core/tesseract-core.wasm.js"),
    resolve(dist, "assets/tesseract-core.wasm.js")
  );
}
if (existsSync(resolve(__dirname, "assets/eng.traineddata.gz"))) {
  cpSync(
    resolve(__dirname, "assets/eng.traineddata.gz"),
    resolve(dist, "assets/eng.traineddata.gz")
  );
}

// Step 5: Copy HTML files (popup, editor, settings, offscreen)
console.log("Step 5: Copying HTML files...");

// Popup HTML — replace .ts script reference with .js
const popupHtml = readFileSync(resolve(__dirname, "src/popup/popup.html"), "utf8");
const popupFixed = popupHtml.replace(
  /<script\s+src="popup\.ts"\s+type="module"><\/script>/,
  '<script type="module" src="popup.js"></script>'
);
writeFileSync(resolve(dist, "popup.html"), popupFixed);

// Editor HTML — replace .ts script reference with .js
const editorHtml = readFileSync(resolve(__dirname, "src/editor/editor.html"), "utf8");
const editorFixed = editorHtml.replace(
  /src="canvas-editor\.ts"/,
  'src="canvas-editor.js"'
);
writeFileSync(resolve(dist, "editor.html"), editorFixed);

// Settings HTML — replace .ts script reference with .js
const settingsHtml = readFileSync(resolve(__dirname, "src/settings/settings.html"), "utf8");
const settingsFixed = settingsHtml.replace(
  /<script\s+src="settings\.ts"\s+type="module"><\/script>/,
  '<script type="module" src="settings.js"></script>'
);
writeFileSync(resolve(dist, "settings.html"), settingsFixed);

// Help HTML — replace .ts script reference with .js
const helpHtml = readFileSync(resolve(__dirname, "src/help/help.html"), "utf8");
const helpFixed = helpHtml.replace(
  /<script\s+src="help\.ts"\s+type="module"><\/script>/,
  '<script type="module" src="help.js"></script>'
);
writeFileSync(resolve(dist, "help.html"), helpFixed);

// Offscreen HTML — replace .ts script reference with .js
const offscreenHtml = readFileSync(resolve(__dirname, "src/offscreen/offscreen.html"), "utf8");
const offscreenFixed = offscreenHtml.replace(
  /<script\s+src="canvas-stitcher\.ts"\s+type="module"><\/script>/,
  '<script type="module" src="offscreen.js"></script>'
);
writeFileSync(resolve(dist, "offscreen.html"), offscreenFixed);

console.log("\nBuild complete! Load dist/ as unpacked extension in Chrome.");
