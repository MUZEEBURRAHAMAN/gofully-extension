#!/usr/bin/env node
// Records a real, unscripted-in-the-sense-of-fake usage walkthrough of the
// GoFully extension: it drives the *actual* built extension (dist/) inside a
// real Chromium instance via Playwright, clicking real buttons and letting
// real capture/editor/export logic run — this is not a mockup.
//
// Playwright records video per-Page (per-tab), not as one continuous desktop
// recording, so the walkthrough spans several tabs (source page -> popup ->
// review tab -> editor tab) and therefore produces several .webm clips. This
// script stitches them into one continuous .mp4 with ffmpeg afterward.
//
// Usage: node scripts/record-demo-video.mjs [url]
// Requires: npm run build:extension (dist/ must exist), ffmpeg on PATH.

import { chromium } from "@playwright/test";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { execFileSync } from "child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const pathToExtension = path.resolve(ROOT, "dist");
const OUT_DIR = path.resolve(ROOT, "demo-video");
const RAW_DIR = path.join(OUT_DIR, "raw");
const FINAL_MP4 = path.join(OUT_DIR, "gofully-demo.mp4");

const VIDEO_SIZE = { width: 1280, height: 800 };
const DEMO_URL = process.argv[2] || "https://en.wikipedia.org/wiki/Screenshot";

const CURSOR_INIT = () => {
  if (document.getElementById("__gf_demo_cursor__")) return;
  const dot = document.createElement("div");
  dot.id = "__gf_demo_cursor__";
  Object.assign(dot.style, {
    position: "fixed",
    top: "0",
    left: "0",
    width: "18px",
    height: "18px",
    borderRadius: "50%",
    background: "rgba(22,103,242,0.85)",
    border: "2px solid white",
    boxShadow: "0 2px 8px rgba(0,0,0,.35)",
    pointerEvents: "none",
    zIndex: "2147483647",
    transform: "translate(-50%, -50%)",
    transition: "left 40ms linear, top 40ms linear",
  });
  document.documentElement.appendChild(dot);
  window.addEventListener(
    "mousemove",
    (e) => {
      dot.style.left = e.clientX + "px";
      dot.style.top = e.clientY + "px";
    },
    { passive: true }
  );
  window.addEventListener("mousedown", () => {
    dot.style.transform = "translate(-50%, -50%) scale(0.6)";
    dot.style.background = "rgba(239,68,68,0.9)";
  });
  window.addEventListener("mouseup", () => {
    dot.style.transform = "translate(-50%, -50%) scale(1)";
    dot.style.background = "rgba(22,103,242,0.85)";
  });
};

async function injectCursor(page) {
  try {
    await page.addInitScript(CURSOR_INIT);
    await page.evaluate(CURSOR_INIT);
  } catch {
    // Cosmetic only — never fail the recording over this.
  }
}

async function waitForNewPage(context, urlIncludes, timeout = 45000) {
  const deadline = Date.now() + timeout;
  for (;;) {
    const remaining = deadline - Date.now();
    if (remaining <= 0) throw new Error(`Timed out waiting for a page containing "${urlIncludes}"`);
    const p = await context.waitForEvent("page", { timeout: remaining }).catch(() => null);
    if (!p) continue;
    try {
      await p.waitForLoadState("domcontentloaded", { timeout: 10000 });
    } catch {
      // fall through — still check the URL, some pages resolve slowly
    }
    if (p.url().includes(urlIncludes)) return p;
  }
}

async function smoothDrag(page, from, to, steps = 20) {
  await page.mouse.move(from.x, from.y);
  await page.waitForTimeout(150);
  await page.mouse.down();
  const dx = (to.x - from.x) / steps;
  const dy = (to.y - from.y) / steps;
  for (let i = 1; i <= steps; i++) {
    await page.mouse.move(from.x + dx * i, from.y + dy * i);
    await page.waitForTimeout(15);
  }
  await page.waitForTimeout(100);
  await page.mouse.up();
}

async function main() {
  if (!fs.existsSync(path.join(pathToExtension, "manifest.json"))) {
    throw new Error(`No build found at ${pathToExtension} — run "npm run build:extension" first.`);
  }

  fs.rmSync(RAW_DIR, { recursive: true, force: true });
  fs.mkdirSync(RAW_DIR, { recursive: true });

  console.log(`Launching Chrome with the extension loaded, target page: ${DEMO_URL}`);
  const context = await chromium.launchPersistentContext("", {
    headless: false, // MV3 extensions require headed mode
    viewport: VIDEO_SIZE,
    recordVideo: { dir: RAW_DIR, size: VIDEO_SIZE },
    args: [
      `--disable-extensions-except=${pathToExtension}`,
      `--load-extension=${pathToExtension}`,
      "--no-sandbox",
      "--disable-gpu",
      "--no-first-run",
      "--no-default-browser-check",
      "--window-size=1280,900",
      "--disable-features=Translate",
    ],
  });

  const clips = [];

  try {
    let sw = context.serviceWorkers()[0];
    if (!sw) sw = await context.waitForEvent("serviceworker", { timeout: 20000 });

    console.log("Step 1/5: browsing the demo page...");
    const demoPage = await context.newPage();
    clips.push({ label: "01-browse", video: demoPage.video() });
    await injectCursor(demoPage);
    await demoPage.goto(DEMO_URL, { waitUntil: "load", timeout: 45000 });
    await demoPage.waitForTimeout(800);
    await demoPage.mouse.move(640, 300);
    for (const y of [400, 900, 1500, 2200, 0]) {
      await demoPage.evaluate((yy) => window.scrollTo({ top: yy, behavior: "smooth" }), y);
      await demoPage.waitForTimeout(650);
    }
    await demoPage.waitForTimeout(400);

    // Resolve the demo tab's real chrome tabId once, by exact URL match
    // against whatever the page actually settled on (Wikipedia can redirect
    // to a normalized/canonical URL) — this is more reliable than re-running
    // a chrome.tabs.query({url}) match-pattern lookup later, and lets the
    // fallback capture trigger below target the right tab deterministically.
    const actualDemoUrl = demoPage.url();
    let demoTabId = null;
    for (let attempt = 0; attempt < 5 && demoTabId === null; attempt++) {
      demoTabId = await sw.evaluate(async (url) => {
        const tabs = await chrome.tabs.query({});
        const t = tabs.find((t) => t.url === url);
        return t ? t.id : null;
      }, actualDemoUrl);
      if (demoTabId === null) await demoPage.waitForTimeout(300);
    }
    if (demoTabId === null) {
      const allTabs = await sw.evaluate(async () => (await chrome.tabs.query({})).map((t) => t.url));
      throw new Error(
        `Could not resolve demo tab id for "${actualDemoUrl}". Open tabs were: ${JSON.stringify(allTabs)}`
      );
    }
    console.log(`  Demo tab resolved: id=${demoTabId} url=${actualDemoUrl}`);

    // Explicitly make the demo tab chrome's active tab before opening the
    // popup tab in the background — Playwright's context.newPage() doesn't
    // reliably register as "the active tab" in chrome.tabs' own bookkeeping
    // (an extension install's welcome.html tab can still hold that spot),
    // and popup.ts's isSupportedCapturePage() check reads exactly that.
    await sw.evaluate((tabId) => chrome.tabs.update(tabId, { active: true }), demoTabId);
    await demoPage.waitForTimeout(200);

    console.log("Step 2/5: opening the popup and starting a full-page capture...");
    // chrome.action.openPopup() (the "real" floating action popup) proved
    // unreliable in this automated headed-CDP environment across repeated
    // runs (0/3: "Could not find an active browser window" / silent
    // timeout) — Chrome's "focused window" requirement for that API doesn't
    // reliably hold here. Opening popup.html as an ordinary active tab
    // instead breaks a different way: it becomes chrome.tabs's own "active
    // tab", and popup.ts's real isSupportedCapturePage() check (correctly)
    // flags that chrome-extension:// tab itself as uncapturable, showing the
    // "Capture isn't available here" banner instead of the mode picker.
    //
    // Fix: create the popup tab via chrome.tabs.create({active:false}) so
    // the demo tab stays the browser's active tab throughout — matching
    // what a real floating popup does — while Playwright still records and
    // clicks this page normally regardless of its background/foreground
    // state.
    const extensionId = sw.url().split("/")[2];
    const popupUrl = `chrome-extension://${extensionId}/popup.html`;
    const [popupPage] = await Promise.all([
      waitForNewPage(context, "popup.html", 10000),
      sw.evaluate((url) => chrome.tabs.create({ url, active: false }), popupUrl),
    ]);
    clips.push({ label: "02-popup", video: popupPage.video() });
    await injectCursor(popupPage);
    await popupPage.waitForTimeout(1000);
    const fullPageBtn = popupPage.locator('.mode-btn[data-mode="full-page"]');
    // Fail fast with a clear signal instead of retry-hovering for a minute
    // if the active-tab fix above didn't take and the button is still
    // disabled ("GoFully can't capture extension pages").
    await popupPage
      .locator('.mode-btn[data-mode="full-page"]:not([disabled])')
      .waitFor({ state: "visible", timeout: 8000 });
    await fullPageBtn.hover();
    await popupPage.waitForTimeout(500);
    await fullPageBtn.click();
    // Real click -> real startCapture() -> popup.ts closes itself
    // (window.close()) ~700ms after the review tab opens; give that a beat.
    await popupPage.waitForTimeout(900);

    console.log("Step 3/5: waiting for the review tab, then opening the editor...");
    const reviewPage = await waitForNewPage(context, "review.html", 60000);
    clips.push({ label: "03-review", video: reviewPage.video() });
    // demoPage's job (being the tab the extension actually captures) is done
    // now that a review tab exists — close it so its clip stops here instead
    // of recording idle dead air all the way to the end of the script.
    await demoPage.close().catch(() => {});
    await injectCursor(reviewPage);
    await reviewPage.waitForSelector("#previewImg", { state: "visible", timeout: 30000 });
    await reviewPage.waitForTimeout(1200);
    const editBtn = reviewPage.locator("#edit-btn");
    await editBtn.hover();
    await reviewPage.waitForTimeout(500);
    await editBtn.click();

    const editorPage = await waitForNewPage(context, "editor.html", 30000);
    clips.push({ label: "04-editor", video: editorPage.video() });
    // Same reasoning — stop the review clip here, it's not needed once the
    // editor tab is up.
    await reviewPage.close().catch(() => {});
    await injectCursor(editorPage);
    await editorPage.waitForSelector("#editorCanvas", { state: "visible", timeout: 30000 });
    await editorPage.waitForTimeout(1500);

    console.log("Step 4/5: zooming in, annotating (arrow + blur), and exporting...");
    // huddlekit.com's full-page capture is very tall (10000+px) — the
    // editor's initial "100%" is itself an auto-fit-to-container scale, not
    // native pixel size, so at that zoom the capture renders as a thin
    // unreadable sliver. Zoom in and scroll to a content-rich section before
    // drawing, or the arrow/blur would be invisible in the final video.
    //
    // Each click resizes the canvas element to dispW/dispH * zoom, so at
    // high zoom on a 10000px-tall image the element becomes tens of
    // thousands of pixels tall. 18 clicks back-to-back crashed the renderer
    // once (page/context closed mid-run) — 12 clicks (~220%) is still
    // comfortably readable, and a short settle pause every few clicks gives
    // the renderer room to actually finish each resize instead of queuing
    // them up.
    //
    // Wrapped in try/catch: if the renderer does crash here, we still want
    // whatever clips completed before it (browse/popup/review) to make it
    // into the final video instead of losing the whole recording.
    try {
      for (let i = 0; i < 12; i++) {
        await editorPage
          .locator("#hdr-zoom-in-btn")
          .click()
          .catch(() => {});
        if (i % 3 === 2) await editorPage.waitForTimeout(250);
      }
      await editorPage.waitForTimeout(400);
      await editorPage.evaluate(() => {
        const el = document.getElementById("canvasContainer");
        if (el) el.scrollTop = Math.max(0, (el.scrollHeight - el.clientHeight) * 0.15);
      });
      await editorPage.waitForTimeout(400);

      const canvasBox = await editorPage.locator("#editorCanvas").boundingBox();
      if (canvasBox) {
        await editorPage
          .locator('.color-swatch[data-color="#1667F2"]')
          .first()
          .click()
          .catch(() => {});
        await editorPage.waitForTimeout(300);
        await editorPage.locator("#tool-arrow").click();
        await editorPage.waitForTimeout(300);
        // X uses the canvas's own box (it's fully visible horizontally after
        // zoom — the container centers it). Y is fixed to the middle of the
        // viewport instead of a fraction of canvasBox's height, since after
        // scrolling, canvasBox.height is the full (mostly off-screen) canvas
        // height, not the visible slice.
        await smoothDrag(
          editorPage,
          { x: canvasBox.x + canvasBox.width * 0.3, y: 280 },
          { x: canvasBox.x + canvasBox.width * 0.7, y: 420 }
        );
        await editorPage.waitForTimeout(700);

        await editorPage
          .locator('.color-swatch[data-color="#EF4444"]')
          .first()
          .click()
          .catch(() => {});
        await editorPage.waitForTimeout(200);
        await editorPage.locator("#tool-blur").click();
        await editorPage.waitForTimeout(300);
        await smoothDrag(
          editorPage,
          { x: canvasBox.x + canvasBox.width * 0.3, y: 480 },
          { x: canvasBox.x + canvasBox.width * 0.7, y: 580 }
        );
        await editorPage.waitForTimeout(900);
      }

      await editorPage.locator("#export-menu-btn").click();
      await editorPage.waitForTimeout(700);
      await editorPage.selectOption("#export-image-quality", "100").catch(() => {});
      await editorPage.waitForTimeout(500);
      await editorPage
        .locator("#save-jpg-btn")
        .click()
        .catch(() => {});
      await editorPage.waitForTimeout(1800);
    } catch (err) {
      console.warn("  Editor annotation/export step failed partway through:", err.message);
    }

    console.log("Step 5/5: closing browser and flushing video files...");
  } finally {
    await context.close().catch(() => {});
  }

  const files = [];
  for (const c of clips) {
    if (!c.video) continue;
    try {
      const p = await c.video.path();
      if (p && fs.existsSync(p)) files.push({ label: c.label, path: p });
    } catch (e) {
      console.warn(`Could not resolve video for ${c.label}:`, e.message);
    }
  }

  if (files.length === 0) {
    throw new Error("No video clips were recorded — nothing to stitch.");
  }

  console.log("\nClips recorded:");
  files.forEach((f) => console.log(`  ${f.label}: ${f.path}`));

  try {
    execFileSync("ffmpeg", ["-version"], { stdio: "ignore" });
  } catch {
    console.warn(`\nffmpeg not found on PATH — leaving individual .webm clips in ${RAW_DIR}`);
    return;
  }

  const listFile = path.join(RAW_DIR, "concat-list.txt");
  fs.writeFileSync(listFile, files.map((f) => `file '${f.path.replace(/'/g, "'\\''")}'`).join("\n"));
  execFileSync("ffmpeg", [
    "-y",
    "-f",
    "concat",
    "-safe",
    "0",
    "-i",
    listFile,
    "-c:v",
    "libx264",
    "-pix_fmt",
    "yuv420p",
    "-r",
    "30",
    "-movflags",
    "+faststart",
    FINAL_MP4,
  ], { stdio: "inherit" });

  console.log(`\nFinal demo video: ${FINAL_MP4}`);
}

main().catch((err) => {
  console.error("\nDemo recording failed:", err);
  process.exit(1);
});
