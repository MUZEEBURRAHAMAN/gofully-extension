#!/usr/bin/env node
// Landing-page frames for the v1.2 features, taken from the real extension (dist/) on a made-up
// billing dashboard (ledgerly.html), then placed in the same browser window as the older frames.
// Output: public/landing/<demo>-<n>.webp at 2560 x 1680 (1280 x 840 at 2x), the size of every other frame.
//
// Usage: node build.mjs && node scripts/landing-shots/shoot.mjs [only-this-prefix]

import { chromium } from "@playwright/test";
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "../..");
const EXT = path.join(ROOT, "dist");
const OUT = path.join(ROOT, "public/landing");
const PORT = 8099;
const PAGE = `http://localhost:${PORT}/ledgerly.html`;
const ONLY = process.argv[2] || "";

// Browser-window geometry, in CSS pixels of the 1280 x 840 frame (matches the Figma frames).
const CONTENT = { x: 41, y: 219, w: 1198, h: 580 };

// ─── Static server for the demo page ─────────────────────────────────────────
const server = http.createServer((req, res) => {
  const file = path.join(HERE, decodeURIComponent(new URL(req.url, "http://x").pathname));
  if (!file.startsWith(HERE) || !fs.existsSync(file)) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { "Content-Type": file.endsWith(".png") ? "image/png" : "text/html; charset=utf-8" });
  fs.createReadStream(file).pipe(res);
});
await new Promise((r) => server.listen(PORT, r));

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const dataUrl = (buf, type = "image/png") => `data:${type};base64,${buf.toString("base64")}`;
const LOGO = dataUrl(fs.readFileSync(path.join(ROOT, "public/brand/gofully-symbol.png")));

// ─── Composer: the browser window around a page screenshot ───────────────────
const composer = await chromium.launch();
const canvas = await composer.newPage({ viewport: { width: 1280, height: 840 }, deviceScaleFactor: 2 });

const CURSOR = `<svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24"><path d="M5 3l14 8.2-6.3 1.4 3.7 6.9-2.6 1.4-3.7-6.9L5 18.6z" fill="#1c1b1a" stroke="#fff" stroke-width="1.6" stroke-linejoin="round"/></svg>`;

async function compose(name, { shot, popup, cursor, url = "app.ledgerly.example/customers" }) {
  const popupHtml = popup ? `<img class="popup" src="${dataUrl(popup.buf)}">` : "";
  // cursor: page coordinates; with a popup, the cursor sits on the popup's hovered tile instead.
  const at = popup ? popup.at : cursor ? { x: CONTENT.x + cursor.x, y: CONTENT.y + cursor.y } : null;
  const cursorHtml = at ? `<div class="cursor" style="left:${at.x - 4}px;top:${at.y - 3}px">${CURSOR}</div>` : "";
  await canvas.setContent(`<!doctype html><html><head><style>
    * { box-sizing: border-box; }
    html, body { margin: 0; width: 1280px; height: 840px; background: #faf8f6; font-family: system-ui, -apple-system, "Segoe UI", sans-serif; overflow: hidden; }
    .win { position: absolute; left: 40px; top: 40px; width: 1200px; height: 760px; border: 1px solid #d9d5d0; border-radius: 24px; overflow: hidden; background: #fff;
      box-shadow: 0 30px 60px -20px rgba(28,27,26,.16), 0 2px 6px rgba(28,27,26,.05); }
    .tabs { position: absolute; inset: 0 0 auto 0; height: 82px; background: #f1efed; }
    .dot { position: absolute; top: 39px; width: 19px; height: 19px; border-radius: 50%; }
    .tab { position: absolute; left: 146px; top: 18px; width: 440px; height: 64px; background: #fff; border-radius: 16px 16px 0 0; display: flex; align-items: center; gap: 16px; padding: 0 24px; font-size: 22px; color: #1c1b1a; }
    .fav { width: 26px; height: 26px; border-radius: 50%; background: #1d6a95; flex: none; }
    .tab .x { margin-left: auto; color: #6f6a64; font-size: 26px; font-weight: 300; }
    .bar { position: absolute; left: 0; right: 0; top: 82px; height: 97px; background: #fff; border-bottom: 1px solid #e5e2de; display: flex; align-items: center; gap: 22px; padding: 0 30px; }
    .nav { width: 28px; height: 28px; color: #6f6a64; font-size: 30px; line-height: 28px; text-align: center; }
    .url { flex: 1; height: 64px; border-radius: 32px; background: #f1efed; display: flex; align-items: center; gap: 16px; padding: 0 26px; font-size: 26px; color: #5f5a54; }
    .lock { width: 18px; height: 22px; border: 2px solid #6f6a64; border-radius: 4px; position: relative; top: 3px; }
    .lock::before { content: ""; position: absolute; left: 2px; top: -10px; width: 10px; height: 10px; border: 2px solid #6f6a64; border-bottom: 0; border-radius: 6px 6px 0 0; }
    .ext { width: 36px; height: 36px; }
    .layers { width: 30px; height: 30px; border: 2px solid #6f6a64; border-radius: 6px; transform: rotate(45deg) scale(.8); }
    .shot { position: absolute; left: ${CONTENT.x - 40}px; top: ${CONTENT.y - 40}px; width: ${CONTENT.w}px; height: ${CONTENT.h}px; display: block; }
    .popup { position: absolute; right: 52px; top: 192px; width: 304px; border-radius: 14px; border: 1px solid #ddd9d4;
      box-shadow: 0 24px 48px -12px rgba(28,27,26,.28), 0 2px 8px rgba(28,27,26,.08); }
    .cursor { position: absolute; width: 26px; height: 26px; filter: drop-shadow(0 1px 1px rgba(0,0,0,.25)); }
  </style></head><body>
    <div class="win">
      <div class="tabs">
        <span class="dot" style="left:30px;background:#d1453b"></span><span class="dot" style="left:62px;background:#c58a2a"></span><span class="dot" style="left:94px;background:#3b9a5b"></span>
        <div class="tab"><span class="fav"></span>${url.split("/")[0]}<span class="x">×</span></div>
      </div>
      <div class="bar">
        <span class="nav">‹</span><span class="nav">›</span><span class="nav" style="font-size:26px">↻</span>
        <div class="url"><span class="lock"></span>${url}</div>
        <span class="layers"></span>
        <img class="ext" src="${LOGO}">
      </div>
      <img class="shot" src="${dataUrl(shot)}">
    </div>
    ${popupHtml}
    ${cursorHtml}
  </body></html>`);
  await canvas.evaluate(() => Promise.all(Array.from(document.images).map((i) => i.decode().catch(() => {}))));
  const png = await canvas.screenshot({ type: "png" });
  const file = path.join(OUT, `${name}.webp`);
  await sharp(png).webp({ quality: 90, effort: 6 }).toFile(file);
  console.log("wrote", path.relative(ROOT, file));
}

// ─── The extension ───────────────────────────────────────────────────────────
const ctx = await chromium.launchPersistentContext("", {
  headless: false,
  args: ["--headless=new", `--disable-extensions-except=${EXT}`, `--load-extension=${EXT}`, "--no-sandbox"],
  viewport: { width: CONTENT.w, height: CONTENT.h },
  deviceScaleFactor: 2,
});
let [sw] = ctx.serviceWorkers();
if (!sw) sw = await ctx.waitForEvent("serviceworker");
const extId = sw.url().split("/")[2];
await sleep(800);
for (const p of ctx.pages()) if (p.url().includes("welcome.html")) await p.close();

const helper = await ctx.newPage();
await helper.goto(`chrome-extension://${extId}/popup.html`);

async function freshPage() {
  for (const p of ctx.pages()) if (p !== helper) await p.close();
  const page = await ctx.newPage();
  await page.goto(PAGE);
  await page.waitForLoadState("networkidle");
  await page.bringToFront();
  await page.mouse.move(-10, -10);
  return page;
}

async function startMode(mode) {
  await helper.evaluate(async ({ url, mode }) => {
    const [tab] = await chrome.tabs.query({ url });
    await chrome.runtime.sendMessage({ type: "INIT_INTERACTIVE_MODE", payload: { mode, tabId: tab.id } });
  }, { url: PAGE, mode });
}

/** The real popup, as it looks over a web page, with one tile hovered. */
async function popupShot({ hover, delay = "0" }) {
  const pop = await ctx.newPage();
  await pop.setViewportSize({ width: 380, height: 620 });
  await pop.goto(`chrome-extension://${extId}/popup.html`);
  await pop.evaluate(async (delay) => {
    // Opened as a tab it sees itself as an extension page; show it the way it looks over a website.
    document.getElementById("unsupportedPanel")?.classList.remove("active");
    document.querySelectorAll(".mode-btn").forEach((b) => { b.disabled = false; b.removeAttribute("title"); });
    const sel = document.getElementById("delaySelect");
    if (sel) sel.value = delay;
  }, delay);
  await sleep(300);
  // The popup loads the saved delay on open; set the one this frame shows after that.
  await pop.evaluate((delay) => { const sel = document.getElementById("delaySelect"); if (sel) sel.value = delay; }, delay);
  const tile = pop.locator(hover);
  await tile.scrollIntoViewIfNeeded();
  await tile.hover();
  await sleep(250);
  const box = await tile.boundingBox();
  const buf = await pop.screenshot({ type: "png" });
  await pop.close();
  // Where the hovered tile lands in the frame: the popup is drawn 304 px wide, right-aligned under the toolbar icon.
  const k = 304 / 380;
  const at = { x: 1280 - 52 - 304 + (box.x + box.width * 0.62) * k, y: 192 + (box.y + box.height * 0.55) * k };
  return { buf, at };
}

const shoot = (page) => page.screenshot({ type: "png" });
const want = (name) => !ONLY || name.startsWith(ONLY);

// ─── Redact page ─────────────────────────────────────────────────────────────
if (want("redact-page")) {
  let page = await freshPage();
  await compose("redact-page-1", { shot: await shoot(page), popup: await popupShot({ hover: '.mode-btn[data-mode="redact-page"]' }) });
  page = await freshPage();
  await startMode("redact-page");
  await page.bringToFront();
  await page.waitForSelector("#gofully-live-redact");
  await sleep(500);
  await compose("redact-page-2", { shot: await shoot(page) });
  // Hide the customer's name and company by clicking them; hover shows the next target.
  await page.click("#name");
  await page.click("#company");
  const box = await page.locator(".crumb").boundingBox();
  await page.mouse.move(box.x + 60, box.y + 8);
  await sleep(300);
  await compose("redact-page-3", { shot: await shoot(page), cursor: { x: box.x + 60, y: box.y + 8 } });
  await page.locator("#gofully-live-redact button[data-act='cap-visible']").click();
  await page.waitForSelector("#gofully-result-card-host");
  await page.mouse.move(-10, -10);
  await sleep(900);
  await compose("redact-page-4", { shot: await shoot(page) });
  await page.locator("#gofully-live-redact button[data-act='done']").click();
}

// ─── Measure ─────────────────────────────────────────────────────────────────
if (want("measure")) {
  let page = await freshPage();
  await compose("measure-1", { shot: await shoot(page), popup: await popupShot({ hover: '.mode-btn[data-mode="measure-page"]' }) });
  page = await freshPage();
  await startMode("measure-page");
  await page.bringToFront();
  await page.waitForSelector("#gofully-measure");
  const pay = await page.locator("#payment").boundingBox();
  const p2 = { x: pay.x + pay.width - 60, y: pay.y + 40 };
  await page.mouse.move(p2.x, p2.y);
  await sleep(300);
  await compose("measure-2", { shot: await shoot(page), cursor: p2 });
  const contact = await page.locator("#contact").boundingBox();
  await page.mouse.move(contact.x + contact.width - 40, contact.y + 40);
  await page.mouse.down(); await page.mouse.up();
  await page.mouse.move(p2.x, p2.y);
  await sleep(300);
  await compose("measure-3", { shot: await shoot(page), cursor: p2 });
  await page.keyboard.press("Escape");
  const chart = await page.locator("#chart").boundingBox();
  const a = { x: chart.x + 24, y: chart.y + chart.height - 30 }, b = { x: chart.x + chart.width - 90, y: chart.y + 70 };
  await page.mouse.move(a.x, a.y);
  await page.mouse.down();
  await page.mouse.move(b.x, b.y, { steps: 10 });
  await sleep(300);
  await compose("measure-4", { shot: await shoot(page), cursor: b });
  await page.mouse.up();
  await page.keyboard.press("Escape");
}

// ─── Delay ───────────────────────────────────────────────────────────────────
if (want("delay")) {
  let page = await freshPage();
  await compose("delay-1", { shot: await shoot(page), popup: await popupShot({ hover: '.mode-btn[data-mode="visible-area"]', delay: "5" }) });
  page = await freshPage();
  await helper.evaluate(async (url) => {
    const [tab] = await chrome.tabs.query({ url });
    await chrome.runtime.sendMessage({ type: "START_DELAYED_CAPTURE", payload: { mode: "visible-area", tabId: tab.id, seconds: 5 } });
  }, PAGE);
  await page.bringToFront();
  await page.waitForSelector("#gofully-countdown");
  const exp = await page.locator("#export button").boundingBox();
  const c = { x: exp.x + exp.width / 2, y: exp.y + exp.height / 2 };
  await sleep(250);
  await compose("delay-2", { shot: await shoot(page), cursor: { x: 640, y: 300 } });
  await page.mouse.move(c.x, c.y, { steps: 8 });
  await sleep(1600);
  await compose("delay-3", { shot: await shoot(page), cursor: c });
  await page.waitForSelector("#gofully-result-card-host", { timeout: 10000 });
  await sleep(900);
  await compose("delay-4", { shot: await shoot(page), cursor: c });
}

// ─── Capture stack with QR codes ─────────────────────────────────────────────
if (want("stack")) {
  const page = await freshPage();
  await page.keyboard.press("Control+Shift+V");
  await page.waitForSelector("#gofully-result-card-host");
  await sleep(1600);
  await page.keyboard.press("Control+Shift+V");
  await sleep(3000); // the QR code is read on the device and listed on the card
  await page.mouse.move(-10, -10);
  await compose("stack-1", { shot: await shoot(page) });
}

await ctx.close();
await composer.close();
server.close();
