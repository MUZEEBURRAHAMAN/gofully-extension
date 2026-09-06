import { defineConfig } from "vite";
import { resolve } from "path";
import react from "@vitejs/plugin-react";

// Content scripts and service worker are built separately via build.mjs
// This config handles the ES module entries (popup, settings, editor, service-worker)
export default defineConfig({
  plugins: [react()],
  // This repo's `public/` is the Next.js website's public folder, not the
  // extension's — Vite's default publicDir would otherwise silently copy
  // all of it (favicons, wordmark PNGs, the site logo, features/, etc.)
  // into dist/ on every build. build.mjs already copies every asset the
  // extension actually needs via its own explicit cpSync calls below.
  publicDir: false,
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        "service-worker": resolve(__dirname, "src/background/service-worker.ts"),
        popup: resolve(__dirname, "src/popup/popup.ts"),
        settings: resolve(__dirname, "src/settings/settings.ts"),
        help: resolve(__dirname, "src/help/help.ts"),
        "canvas-editor": resolve(__dirname, "src/editor/canvas-editor.ts"),
        offscreen: resolve(__dirname, "src/offscreen/canvas-stitcher.ts"),
      },
      output: {
        entryFileNames: "[name].js",
        chunkFileNames: "chunks/[name]-[hash].js",
        assetFileNames: "assets/[name][extname]",
        format: "es",
        inlineDynamicImports: false,
      },
    },
    target: "esnext",
    minify: false,
    sourcemap: false,
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
});
