import { defineConfig } from "vite";
import { resolve } from "path";
import react from "@vitejs/plugin-react";

// Content scripts and service worker are built separately via build.mjs
// This config handles the ES module entries (popup, settings, editor, service-worker)
export default defineConfig({
  plugins: [react()],
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
        "mount-landing-hero": resolve(__dirname, "src/mount-landing-hero.tsx"),
        "hero-matrix": resolve(__dirname, "src/site/hero-matrix.ts"),
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
