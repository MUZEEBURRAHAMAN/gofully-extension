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
  "element-selector",
  "scrollable-detector",
  "scrolling-area-ui",
];

for (const name of contentScripts) {
  await build({
    configFile: false,
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

// Step 3: Copy manifest.json
console.log("Step 3: Copying manifest.json...");
cpSync(resolve(__dirname, "manifest.json"), resolve(dist, "manifest.json"));

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

// Offscreen HTML
cpSync(
  resolve(__dirname, "src/offscreen/offscreen.html"),
  resolve(dist, "offscreen.html")
);

console.log("\nBuild complete! Load dist/ as unpacked extension in Chrome.");
