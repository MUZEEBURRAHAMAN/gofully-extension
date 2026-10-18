import {
  Canvas, FabricImage, Rect, Ellipse, Line, IText, Path, Group,
  Circle, FabricText, PencilBrush, FabricObject, ActiveSelection,
  Polygon, Triangle,
} from "fabric";
import Cropper from "cropperjs";
import { canvasRGBA } from "stackblur-canvas";
import { generatePDF } from "../export/pdf-generator";
import { applyTheme, watchTheme } from "../utils/theme";
import { addStepFromDataUrl } from "../utils/guide";
import { findSensitive, hitBoxes, type OcrWord } from "../utils/sensitive";
import { claimPendingRateNudge, markRatedYes, markDismissed } from "../utils/rate-nudge";

applyTheme();
watchTheme();

type ToolType =
  | "select" | "arrow" | "rectangle" | "ellipse" | "callout" | "line"
  | "freedraw" | "text" | "spotlight" | "blur" | "step" | "crop" | "highlight"
  | "triangle" | "circle" | "square" | "polygon";

type ArrowType = "straight" | "curved";
type BlurType = "glass" | "pixel" | "redact";
type ShapeType = "rectangle" | "square" | "circle" | "ellipse" | "triangle" | "polygon";

const shapeSvgs: Record<ShapeType, string> = {
  rectangle: '<rect x="3" y="5" width="18" height="14" rx="0"/>',
  square: '<rect x="4" y="4" width="16" height="16" rx="0"/>',
  circle: '<circle cx="12" cy="12" r="8"/>',
  ellipse: '<ellipse cx="12" cy="12" rx="9" ry="6"/>',
  triangle: '<polygon points="12,3 21,21 3,21"/>',
  polygon: '<polygon points="12,3 20.66,8 20.66,18 12,23 3.34,18 3.34,8"/>',
};

const shapeLabels: Record<ShapeType, string> = {
  rectangle: "Rectangle (R)",
  square: "Square",
  circle: "Circle",
  ellipse: "Ellipse (E)",
  triangle: "Triangle",
  polygon: "Polygon (Hexagon)",
};

// ─── State ───────────────────────────────────────────────────────────────────

let canvas: Canvas;
let currentTool: ToolType = "select";
let currentShapeType: ShapeType = "rectangle";
let currentArrowType: ArrowType = "straight";
let currentBlurType: BlurType = "glass";
let currentColor = "#EF4444";
let strokeWidth = 4;
let stepCounter = 1;
let drawStartX = 0, drawStartY = 0;
let isDrawing = false;
let tempShape: any = null;
// A history step is the canvas JSON plus the view geometry it was made at.
// Without the geometry, undoing a crop or a Beautify (both change the image's
// size) restored the objects but left the canvas at the new size.
interface ViewMeta { dispW: number; dispH: number; fitScale: number; imgNativeW: number; imgNativeH: number }
interface HistoryStep { json: string; meta: ViewMeta }
let undoStack: HistoryStep[] = [];
let redoStack: HistoryStep[] = [];
let backgroundImage: FabricImage | null = null;
let fitScale = 1;
let imgNativeW = 0, imgNativeH = 0;
let dispW = 0, dispH = 0;
let cssZoom = 1;
let cropperInstance: Cropper | null = null;
let isBeautified = false;
let isCropped = false;
let capturedPageUrl = "";

// ─── Keyboard shortcut map ──────────────────────────────────────────────────

const DEFAULT_SHORTCUTS: Record<ToolType, string> = {
  select: "v", arrow: "a", rectangle: "r", ellipse: "e",
  callout: "c", line: "l", freedraw: "p", text: "t",
  spotlight: "s", blur: "b", step: "n", crop: "x", highlight: "h",
  triangle: "", circle: "", square: "", polygon: "",
};

let activeShortcuts: Record<ToolType, string> = { ...DEFAULT_SHORTCUTS };
let keyToTool: Record<string, ToolType> = {};

function rebuildKeyToTool(): void {
  keyToTool = {};
  (Object.keys(activeShortcuts) as ToolType[]).forEach((tool) => {
    keyToTool[activeShortcuts[tool]] = tool;
  });
}
rebuildKeyToTool();

async function loadShortcuts(): Promise<void> {
  try {
    const stored = await chrome.storage.sync.get("settings");
    const custom = (stored.settings as any)?.editorShortcuts as Record<string, string> | undefined;
    if (custom) {
      activeShortcuts = { ...DEFAULT_SHORTCUTS, ...custom } as Record<ToolType, string>;
      rebuildKeyToTool();
    }
  } catch {
    // Storage unavailable — fall back to defaults
  }
}

function applyShortcutLabels(): void {
  (Object.keys(activeShortcuts) as ToolType[]).forEach((tool) => {
    const btn = document.querySelector(`[data-tool="${tool}"]`);
    const tip = btn?.querySelector(".tip");
    if (!tip) return;
    const key = activeShortcuts[tool].toUpperCase();
    const withKey = tip.textContent?.replace(/\s*\([A-Z0-9]\)$/, "").trim() ?? "";
    tip.textContent = `${withKey} (${key})`;
  });
}

const dimensionsEl = document.getElementById("dimensions")!;
const zoomEl        = document.getElementById("zoom")!;
const toolNameEl    = document.getElementById("toolName")!;
const toast         = document.getElementById("toast")!;

// ─── Init ────────────────────────────────────────────────────────────────────

async function init(): Promise<void> {
  const canvasEl = document.getElementById("editorCanvas") as HTMLCanvasElement;

  canvas = new Canvas(canvasEl, {
    selection: true,
    preserveObjectStacking: true,
    enableRetinaScaling: true,
  });
  (window as any).canvas = canvas;
  (window as any).__fabricCanvas = canvas;

  // Rotate cursor: circular arrows SVG as data URI
  const rotateCursorSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><path fill="%23333" d="M16 4.5a11.5 11.5 0 0 1 8.35 3.65L21.5 11h9V2l-3.22 3.22A15 15 0 0 0 1.07 17h4.02A11.5 11.5 0 0 1 16 4.5zm0 23A11.5 11.5 0 0 1 7.65 23.85L10.5 21h-9v9l3.22-3.22A15 15 0 0 0 30.93 15h-4.02A11.5 11.5 0 0 1 16 27.5z"/></svg>`;
  const rotateCursor = `url("data:image/svg+xml,${rotateCursorSvg}") 16 16, crosshair`;
  // Fabric v7: controls may live on prototype or per-object; guard both paths
  try {
    const proto = FabricObject.prototype as any;
    if (proto.controls?.mtr) proto.controls.mtr.cursorStyle = rotateCursor;
  } catch {}
  canvas.on("object:added", (e: any) => {
    try { if (e.target?.controls?.mtr) e.target.controls.mtr.cursorStyle = rotateCursor; } catch {}
  });

  setupTools();
  setupDropdownMenus();
  setupTooltipPositioning();
  setupColorPicker();
  setupStrokeControl();
  setupExportButtons();
  await loadShortcuts();
  applyShortcutLabels();
  setupKeyboardShortcuts();
  setupCanvasEvents();

  // Fetch the screenshot from service worker
  try {
    const resp = await chrome.runtime.sendMessage({ type: "GET_CAPTURE_BLOB_URL" });
    const url: string | null = resp?.url ?? null;
    if (url && url.startsWith("data:image/")) {
      await loadScreenshot(url);
    } else {
      showToast("No image yet. Capture one first.");
    }
  } catch {
    showToast("Could not load image from service worker");
  }

  // Fetch captured page metadata (URL) for browser frame rendering
  try {
    const metaResp = await chrome.runtime.sendMessage({ type: "GET_LAST_CAPTURE" });
    if (metaResp?.result?.url) capturedPageUrl = metaResp.result.url;
  } catch {}

  saveState();
  maybeShowRateNudge();
}

async function maybeShowRateNudge(): Promise<void> {
  const due = await claimPendingRateNudge();
  if (!due || document.getElementById("gf-rate-nudge")) return;

  const nudge = document.createElement("div");
  nudge.id = "gf-rate-nudge";
  nudge.innerHTML = `
    <div class="gf-rn-row">
      <div class="gf-rn-star">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
      </div>
      <div style="flex:1">
        <div class="gf-rn-title">Enjoying GoFully?</div>
        <div class="gf-rn-sub">A quick rating helps others discover the extension.</div>
      </div>
      <button class="gf-rn-close" id="gf-rn-close-btn">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>
    <div class="gf-rn-actions">
      <button class="gf-rn-btn gf-rn-btn-primary" id="gf-rn-yes-btn">Yes, rate it</button>
      <button class="gf-rn-btn gf-rn-btn-secondary" id="gf-rn-no-btn">Not now</button>
    </div>
  `;
  document.body.appendChild(nudge);
  requestAnimationFrame(() => nudge.classList.add("show"));

  const dismiss = () => {
    nudge.classList.remove("show");
    setTimeout(() => nudge.remove(), 200);
  };

  document.getElementById("gf-rn-yes-btn")!.addEventListener("click", () => {
    markRatedYes().catch(() => {});
    dismiss();
  });
  document.getElementById("gf-rn-no-btn")!.addEventListener("click", () => {
    markDismissed().catch(() => {});
    dismiss();
  });
  document.getElementById("gf-rn-close-btn")!.addEventListener("click", () => {
    markDismissed().catch(() => {});
    dismiss();
  });
}

// Shared by the export-menu-button click and the Done button, so "Done"
// opens the same export options instead of silently closing the window
// (see the done-btn handler below).
function openExportMenu(): void {
  const exportMenuBtn = document.getElementById("export-menu-btn");
  const exportDropMenu = document.getElementById("export-drop-menu");
  if (!exportDropMenu || !exportMenuBtn) return;
  const r = exportMenuBtn.getBoundingClientRect();
  exportDropMenu.style.right = `${window.innerWidth - r.right}px`;
  exportDropMenu.style.top = `${r.bottom + 6}px`;
  exportDropMenu.classList.add("show");
}

// The toolbar's horizontal-scroll wrapper (.tbar-scroll) sets overflow-y:
// hidden, which silently clips any position:absolute dropdown that renders
// below the toolbar row — .show still toggles and getBoundingClientRect()
// still reports real coordinates, but every click on it falls through to
// the canvas underneath. Fixed positioning computed from the anchor's own
// rect (same fix already used for the export menu) sidesteps the clip.
function positionToolDropdown(anchorEl: HTMLElement, menu: HTMLElement): void {
  const r = anchorEl.getBoundingClientRect();
  menu.style.left = `${r.left}px`;
  menu.style.top = `${r.bottom + 6}px`;
}

// Every icon-only control's .tip span is inert (display:none, see CSS) and
// only supplies text; this drives one shared, body-level tooltip instead.
// Two clipping problems make a per-element tooltip unworkable here: the
// toolbar's horizontal-scroll wrapper (.tbar-scroll, overflow-y: hidden)
// clips position:absolute tips below the toolbar row, and switching those
// to position:fixed still breaks for any anchor whose hover/active state
// applies a transform (color-swatch and bf-bg-swatch both scale() on
// hover) — a transformed ancestor becomes the containing block for a fixed
// descendant, so left/top resolve against that ancestor instead of the
// viewport. A tooltip parented directly to <body> has no such ancestor.
function setupTooltipPositioning(): void {
  const shared = document.createElement("div");
  shared.id = "sharedTooltip";
  document.body.appendChild(shared);

  document.querySelectorAll<HTMLElement>(".tip").forEach((tip) => {
    const anchor = tip.parentElement;
    if (!anchor) return;
    anchor.addEventListener("mouseenter", () => {
      const r = anchor.getBoundingClientRect();
      shared.textContent = tip.textContent;
      shared.style.left = `${r.left + r.width / 2}px`;
      shared.style.top = `${r.bottom + 6}px`;
      shared.classList.add("show");
    });
    anchor.addEventListener("mouseleave", () => {
      shared.classList.remove("show");
    });
  });
}

function setupDropdownMenus(): void {
  // Arrow dropdown toggle
  const arrowExpand = document.getElementById("arrow-expand");
  const arrowWrapper = arrowExpand?.closest(".tool-dropdown-wrapper") as HTMLElement | null;
  const arrowMenu = document.getElementById("arrow-menu");
  // Color popover toggle (compact toolbar only — see the color-trigger /
  // color-group rules in editor.html). On a normal-width toolbar
  // #color-trigger is display:none so this button is never reachable and
  // .color-group already renders inline, unaffected by the "show" class.
  const colorTrigger = document.getElementById("color-trigger");
  const colorGroup = document.getElementById("color-group");
  arrowExpand?.addEventListener("click", (e) => {
    e.stopPropagation();
    blurMenu?.classList.remove("show");
    shapeMenu?.classList.remove("show");
    exportDropMenu?.classList.remove("show");
    colorGroup?.classList.remove("show");
    if (arrowMenu && !arrowMenu.classList.contains("show") && arrowWrapper) {
      positionToolDropdown(arrowWrapper, arrowMenu);
    }
    arrowMenu?.classList.toggle("show");
  });

  // Blur dropdown toggle
  const blurExpand = document.getElementById("blur-expand");
  const blurWrapper = blurExpand?.closest(".tool-dropdown-wrapper") as HTMLElement | null;
  const blurMenu = document.getElementById("blur-menu");
  blurExpand?.addEventListener("click", (e) => {
    e.stopPropagation();
    arrowMenu?.classList.remove("show");
    shapeMenu?.classList.remove("show");
    exportDropMenu?.classList.remove("show");
    colorGroup?.classList.remove("show");
    if (blurMenu && !blurMenu.classList.contains("show") && blurWrapper) {
      positionToolDropdown(blurWrapper, blurMenu);
    }
    blurMenu?.classList.toggle("show");
  });

  // Shape dropdown toggle (Rectangle / Ellipse consolidated into one button)
  const shapeExpand = document.getElementById("shape-expand");
  const shapeWrapper = shapeExpand?.closest(".tool-dropdown-wrapper") as HTMLElement | null;
  const shapeMenu = document.getElementById("shape-menu");
  shapeExpand?.addEventListener("click", (e) => {
    e.stopPropagation();
    arrowMenu?.classList.remove("show");
    blurMenu?.classList.remove("show");
    exportDropMenu?.classList.remove("show");
    colorGroup?.classList.remove("show");
    if (shapeMenu && !shapeMenu.classList.contains("show") && shapeWrapper) {
      positionToolDropdown(shapeWrapper, shapeMenu);
    }
    shapeMenu?.classList.toggle("show");
  });

  // Export dropdown toggle — use fixed positioning so toolbar z-index doesn't clip it
  const exportMenuBtn = document.getElementById("export-menu-btn");
  const exportDropMenu = document.getElementById("export-drop-menu");
  exportMenuBtn?.addEventListener("click", (e) => {
    e.stopPropagation();
    arrowMenu?.classList.remove("show");
    blurMenu?.classList.remove("show");
    shapeMenu?.classList.remove("show");
    colorGroup?.classList.remove("show");
    const isOpen = exportDropMenu?.classList.contains("show");
    if (!isOpen) openExportMenu();
    else exportDropMenu?.classList.remove("show");
  });
  // Close export menu after any item click (but not settings panel)
  exportDropMenu?.addEventListener("click", (e) => {
    const target = e.target as HTMLElement;
    if (!target.closest("#export-settings-panel")) {
      exportDropMenu.classList.remove("show");
    }
  });

  colorTrigger?.addEventListener("click", (e) => {
    e.stopPropagation();
    arrowMenu?.classList.remove("show");
    blurMenu?.classList.remove("show");
    shapeMenu?.classList.remove("show");
    exportDropMenu?.classList.remove("show");
    if (colorGroup && !colorGroup.classList.contains("show")) {
      positionToolDropdown(colorTrigger, colorGroup);
    }
    colorGroup?.classList.toggle("show");
  });
  // No separate "close after picking a swatch" handler needed: swatch
  // clicks (in setupColorPicker) don't stopPropagation, so they already
  // bubble into the "close menus on click outside" handler below.

  // Close menus on click outside
  document.addEventListener("click", () => {
    arrowMenu?.classList.remove("show");
    blurMenu?.classList.remove("show");
    shapeMenu?.classList.remove("show");
    colorGroup?.classList.remove("show");
    document.getElementById("export-drop-menu")?.classList.remove("show");
  });

  // Shape type selection (Rectangle, Square, Circle, Ellipse, Triangle, Polygon)
  document.querySelectorAll("[data-shape-type]").forEach((item) => {
    item.addEventListener("click", (e) => {
      e.stopPropagation();
      document.querySelectorAll("[data-shape-type]").forEach((i) => i.classList.remove("active"));
      item.classList.add("active");
      const shapeType = (item as HTMLElement).dataset.shapeType as ShapeType;
      currentShapeType = shapeType;
      const mainBtn = document.getElementById("tool-shape");
      if (mainBtn) mainBtn.dataset.tool = shapeType;
      const iconEl = document.getElementById("shape-active-icon");
      if (iconEl && shapeSvgs[shapeType]) iconEl.innerHTML = shapeSvgs[shapeType];
      const tipEl = document.getElementById("shape-active-tip");
      if (tipEl && shapeLabels[shapeType]) tipEl.textContent = `Shape: ${shapeLabels[shapeType]}`;
      shapeMenu?.classList.remove("show");
      setTool(shapeType);
      showToast(`${shapeLabels[shapeType]} selected`);
    });
  });

  // Arrow type selection
  document.querySelectorAll("[data-arrow-type]").forEach((item) => {
    item.addEventListener("click", (e) => {
      e.stopPropagation();
      document.querySelectorAll("[data-arrow-type]").forEach((i) => i.classList.remove("active"));
      item.classList.add("active");
      currentArrowType = (item as HTMLElement).dataset.arrowType as ArrowType;
      arrowMenu?.classList.remove("show");
      setTool("arrow");
      showToast(currentArrowType === "curved" ? "Curved Arrow selected" : "Straight Arrow selected");
    });
  });

  // Blur type selection
  document.querySelectorAll("[data-blur-type]").forEach((item) => {
    item.addEventListener("click", (e) => {
      e.stopPropagation();
      document.querySelectorAll("[data-blur-type]").forEach((i) => i.classList.remove("active"));
      item.classList.add("active");
      currentBlurType = (item as HTMLElement).dataset.blurType as BlurType;
      blurMenu?.classList.remove("show");
      setTool("blur");
      showToast(
        currentBlurType === "pixel"
          ? "Pixelate mode selected"
          : currentBlurType === "redact"
          ? "Redact Blackout selected"
          : "Glass Blur selected"
      );
    });
  });

  document.getElementById("smart-redact-btn")?.addEventListener("click", (e) => {
    e.stopPropagation();
    blurMenu?.classList.remove("show");
    void smartRedact();
  });
}

// ─── Auto-redact: OCR the screenshot, box everything that looks sensitive ─────
let smartRedactBusy = false;

async function smartRedact(): Promise<void> {
  if (!backgroundImage) { showToast("No image to scan"); return; }
  if (smartRedactBusy) return;
  smartRedactBusy = true;
  showToast("Scanning this screenshot on your device…");
  try {
    // Work from the screenshot itself, scaled so text stays readable but the OCR
    // engine isn't fed a huge bitmap; tall captures are read in overlapping slices.
    const el = backgroundImage.getElement() as CanvasImageSource;
    const scale = Math.min(1, 1800 / imgNativeW);
    const W = Math.max(1, Math.round(imgNativeW * scale));
    const H = Math.max(1, Math.round(imgNativeH * scale));
    const SLICE = 2200, OVERLAP = 80, MAX_SLICES = 12;
    const full = document.createElement("canvas");
    full.width = W; full.height = H;
    full.getContext("2d")!.drawImage(el, 0, 0, W, H);

    const words: OcrWord[] = [];
    let slices = 0;
    for (let y = 0; y < H && slices < MAX_SLICES; y += SLICE - OVERLAP, slices++) {
      const h = Math.min(SLICE, H - y);
      const part = document.createElement("canvas");
      part.width = W; part.height = h;
      part.getContext("2d")!.drawImage(full, 0, y, W, h, 0, 0, W, h);
      const resp: any = await chrome.runtime.sendMessage({ type: "OCR_IMAGE_WORDS", payload: { dataUrl: part.toDataURL("image/png") } });
      if (resp?.error) { showToast(`Couldn't scan: ${resp.error}`); return; }
      for (const w of (resp?.words || []) as OcrWord[]) {
        words.push({ ...w, y0: w.y0 + y, y1: w.y1 + y, line: w.line + slices * 10000 });
      }
      if (y + h >= H) break;
    }

    const hits = findSensitive(words);
    if (!hits.length) { showToast("No sensitive info found"); return; }

    // Slices overlap, so the same match can be found twice — keep one box per place.
    const boxes: ReturnType<typeof hitBoxes> = [];
    for (const b of hitBoxes(words, hits, 4)) {
      const dup = boxes.some((o) => {
        const ix = Math.max(0, Math.min(o.x + o.w, b.x + b.w) - Math.max(o.x, b.x));
        const iy = Math.max(0, Math.min(o.y + o.h, b.y + b.h) - Math.max(o.y, b.y));
        return ix * iy > 0.5 * Math.min(o.w * o.h, b.w * b.h);
      });
      if (!dup) boxes.push(b);
    }

    const k = fitScale / scale; // OCR pixels → canvas units
    for (const b of boxes) {
      const box = new Rect({
        left: b.x * k, top: b.y * k, width: b.w * k, height: b.h * k,
        fill: "#000000", selectable: false, evented: false, originX: "left", originY: "top",
      });
      applyCleanShotStyle(box);
      canvas.add(box);
      box.setCoords();
    }
    canvas.renderAll();
    saveState();
    showToast(`Redacted ${boxes.length} item${boxes.length === 1 ? "" : "s"}. Check each box. Undo with ${/Mac/i.test(navigator.platform) ? "⌘" : "Ctrl+"}Z.`);
  } catch (e: any) {
    showToast(e?.message ? `Auto-redact failed: ${e.message}` : "Auto-redact failed");
  } finally {
    smartRedactBusy = false;
  }
}

function applyCleanShotStyle(obj: any): void {
  try {
    obj.set({
      cornerColor: "#FFFFFF",
      cornerStrokeColor: "#1667F2",
      borderColor: "#1667F2",
      cornerStyle: "circle",
      cornerSize: 8,
      transparentCorners: false,
      borderScaleFactor: 1.5,
      padding: 6,
    });
  } catch (e) {
    // ignore
  }
}

// ─── Screenshot loading ───────────────────────────────────────────────────────

async function loadScreenshot(url: string, resetAnnotations = false): Promise<void> {
  if (!url.startsWith("data:image/")) {
    console.error("loadScreenshot: rejected non-image URL");
    showToast("Invalid image source");
    return;
  }

  try {
    const img = await FabricImage.fromURL(url);
    const nw = img.width!, nh = img.height!;
    if (!nw || !nh) { console.error("Zero-size image"); return; }
    imgNativeW = nw; imgNativeH = nh;

    const avW = window.innerWidth  - 80;
    const avH = window.innerHeight - 48 - 28 - 80;
    fitScale = Math.max(0.05, Math.min(1, avW / nw, avH / nh));
    cssZoom  = 1;
    dispW    = Math.round(nw * fitScale);
    dispH    = Math.round(nh * fitScale);

    canvas.setDimensions({ width: dispW, height: dispH });

    img.set({
      left: 0, top: 0,
      scaleX: fitScale, scaleY: fitScale,
      selectable: false, evented: false, erasable: false,
      originX: "left", originY: "top",
      // Fabric caches each object's render as a bitmap at its CURRENT
      // displayed scale by default. The background image is normally shown
      // at fitScale (often a small fraction, to fit a tall full-page capture
      // in the editor viewport) — with caching on, an upscaled export
      // (toDataURL with a multiplier, or the annotated-export path in
      // exportToBlob) could render from that low-res cached bitmap instead
      // of the full native-resolution source, producing a correctly-sized
      // but visibly soft/blurry output. Disabling caching forces every
      // render — on-screen or export — to draw directly from the original
      // full-resolution image element.
      objectCaching: false,
    });

    if (resetAnnotations) {
      canvas.clear();
    } else if (backgroundImage) {
      canvas.remove(backgroundImage);
    }

    canvas.add(img);
    canvas.sendObjectToBack(img);
    canvas.renderAll();

    backgroundImage = img;
    dimensionsEl.textContent = `${nw} × ${nh} px`;
    zoomEl.textContent = "100%";
    const hdrZoomVal = document.getElementById("hdr-zoom-val");
    if (hdrZoomVal) hdrZoomVal.textContent = "100%";

    applyContainerZoom(1);
  } catch (e) {
    console.error("Failed to load screenshot:", e);
    showToast("Failed to load image");
  }
}

function applyContainerZoom(z: number): void {
  cssZoom = z;
  canvas.setDimensions({
    width: Math.round(dispW * z),
    height: Math.round(dispH * z),
  });
  canvas.setZoom(z);
  canvas.renderAll();
}

// ─── Tool setup ──────────────────────────────────────────────────────────────

function setupTools(): void {
  document.querySelectorAll(".tool-btn[data-tool]").forEach((btn) => {
    btn.addEventListener("click", () => setTool((btn as HTMLElement).dataset.tool as ToolType));
  });
}

function setTool(tool: ToolType): void {
  const textFmtGroup = document.getElementById("text-format-group");
  if (textFmtGroup) textFmtGroup.style.display = tool === "text" ? "" : "none";
  if (tool === "crop") {
    if (!backgroundImage) { showToast("No image to crop"); return; }
    openCropModal();
    return;
  }

  if (cropperInstance) closeCropModal(false);

  if (isDrawing) {
    if (tempShape) { canvas.remove(tempShape); tempShape = null; }
    isDrawing = false;
  }

  currentTool = tool;

  const isShapeTool = ["rectangle", "square", "circle", "ellipse", "triangle", "polygon"].includes(tool);
  document.querySelectorAll(".tool-btn[data-tool]").forEach((btn) => {
    if (btn.id === "tool-shape") {
      btn.classList.toggle("active", isShapeTool);
    } else {
      btn.classList.toggle("active", (btn as HTMLElement).dataset.tool === tool);
    }
  });

  if (isShapeTool) {
    currentShapeType = tool as ShapeType;
    const mainBtn = document.getElementById("tool-shape");
    if (mainBtn) mainBtn.dataset.tool = tool;
    const iconEl = document.getElementById("shape-active-icon");
    if (iconEl && shapeSvgs[currentShapeType]) iconEl.innerHTML = shapeSvgs[currentShapeType];
    const tipEl = document.getElementById("shape-active-tip");
    if (tipEl && shapeLabels[currentShapeType]) tipEl.textContent = `Shape: ${shapeLabels[currentShapeType]}`;
    document.querySelectorAll("[data-shape-type]").forEach((i) => {
      i.classList.toggle("active", (i as HTMLElement).dataset.shapeType === tool);
    });
  }

  const names: Record<ToolType, string> = {
    select: "Select & Transform",
    arrow: "CleanShot Arrow",
    rectangle: "Rectangle",
    square: "Square",
    circle: "Circle",
    ellipse: "Ellipse",
    triangle: "Triangle",
    polygon: "Polygon (Hexagon)",
    callout: "Callout Speech Bubble",
    line: "Straight Line",
    freedraw: "Pen / Marker",
    text: "Text Annotation",
    spotlight: "CleanShot Spotlight",
    blur: "Blur / Redaction",
    step: "Step Number Counter",
    crop: "Crop & Resize Image",
    highlight: "Highlighter",
  };
  toolNameEl.textContent = names[tool] || tool;

  const isSelect = tool === "select";
  canvas.getObjects().forEach((obj) => {
    if (obj === backgroundImage) return;
    obj.selectable = isSelect;
    obj.evented    = isSelect;
  });
  if (!isSelect) canvas.discardActiveObject();

  canvas.selection = isSelect;

  if (tool === "freedraw") {
    if (!canvas.freeDrawingBrush) {
      canvas.freeDrawingBrush = new PencilBrush(canvas);
    }
    canvas.freeDrawingBrush.color = currentColor;
    canvas.freeDrawingBrush.width = strokeWidth;
  }
  canvas.isDrawingMode = tool === "freedraw";

  canvas.defaultCursor =
    tool === "select" ? "default" :
    tool === "text"   ? "text"    : "crosshair";

  canvas.renderAll();
}

// Shape tools (rectangle, arrow, callout, spotlight, blur, step, etc.) finish
// a draw the way CleanShot X does: the tool reverts to the pointer and the
// just-drawn object is immediately selected, so the user can drag/resize/
// recolor it right away instead of having to click "Select" first.
function finishAndSelect(obj: FabricObject): void {
  setTool("select");
  canvas.setActiveObject(obj);
  canvas.renderAll();
}

// ─── Canvas events ────────────────────────────────────────────────────────────

function setupCanvasEvents(): void {
  canvas.on("mouse:wheel", (opt: any) => {
    const evt = opt.e as WheelEvent;
    if (evt.ctrlKey || evt.metaKey) {
      evt.preventDefault();
      evt.stopPropagation();
      const delta = evt.deltaY > 0 ? -0.08 : 0.08;
      adjustZoom(delta);
    }
  });

  canvas.on("mouse:down", (e: any) => {
    if (currentTool === "select" || currentTool === "freedraw") return;

    // Step badges stay individually draggable while the Step tool remains
    // active (for rapid sequential placement); a click that lands on one of
    // them is a drag, not a request to place a new badge underneath it.
    if (currentTool === "step" && e.target) return;

    const pt = getScenePoint(e);
    drawStartX = pt.x;
    drawStartY = pt.y;
    isDrawing  = true;

    if (currentTool === "text") {
      addText(pt.x, pt.y);
      isDrawing = false;
      return;
    }
    if (currentTool === "step") {
      addStepNumber(pt.x, pt.y);
      isDrawing = false;
      return;
    }

    // Show live dimension badge connected to cursor like selected area
    const rawEvt = e?.e as MouseEvent | undefined;
    const badge = document.getElementById("canvasDrawBadge");
    if (badge && rawEvt && typeof rawEvt.clientX === "number") {
      badge.style.display = "block";
      badge.style.left = `${rawEvt.clientX}px`;
      badge.style.top = `${rawEvt.clientY}px`;
      badge.textContent = "0 × 0 px";
    }

    tempShape = createShape(currentTool, pt.x, pt.y);
    if (tempShape) canvas.add(tempShape);
  });

  canvas.on("mouse:move", (e: any) => {
    if (!isDrawing || !tempShape) return;
    const pt = getScenePoint(e);
    updateShape(tempShape, currentTool, drawStartX, drawStartY, pt.x, pt.y);
    canvas.requestRenderAll();

    // Live update dimension badge connected to cursor
    const rawEvt = e?.e as MouseEvent | undefined;
    const badge = document.getElementById("canvasDrawBadge");
    if (badge && rawEvt && typeof rawEvt.clientX === "number") {
      badge.style.left = `${rawEvt.clientX}px`;
      badge.style.top = `${rawEvt.clientY}px`;
      const wPx = Math.round(Math.abs(pt.x - drawStartX) * (imgNativeW > 0 && dispW > 0 ? imgNativeW / dispW : 1));
      const hPx = Math.round(Math.abs(pt.y - drawStartY) * (imgNativeH > 0 && dispH > 0 ? imgNativeH / dispH : 1));
      badge.textContent = `${wPx} × ${hPx} px`;
    }
  });

  canvas.on("mouse:up", (e: any) => {
    // Hide live dimension badge
    const badge = document.getElementById("canvasDrawBadge");
    if (badge) badge.style.display = "none";

    if (!isDrawing) return;
    isDrawing = false;
    if (!tempShape) return;

    const pt = getScenePoint(e);
    updateShape(tempShape, currentTool, drawStartX, drawStartY, pt.x, pt.y);

    const w = Math.abs((tempShape.width  || 0) * (tempShape.scaleX || 1));
    const h = Math.abs((tempShape.height || 0) * (tempShape.scaleY || 1));

    if (currentTool === "arrow") {
      finaliseArrow(tempShape as Line);
      tempShape = null;
      return;
    }

    if (currentTool === "callout") {
      finaliseCallout(tempShape);
      tempShape = null;
      return;
    }

    if (currentTool === "spotlight") {
      finaliseSpotlight(tempShape);
      tempShape = null;
      return;
    }

    if (w < 4 && h < 4 && currentTool !== "line") {
      canvas.remove(tempShape);
      tempShape = null;
      return;
    }

    if (currentTool === "blur") {
      const shape = tempShape;
      tempShape = null;
      finaliseBlur(shape);
      return;
    }

    applyCleanShotStyle(tempShape);
    tempShape.setCoords();
    saveState();
    finishAndSelect(tempShape);
    tempShape = null;
  });

  canvas.on("path:created", (e: any) => {
    if (e.path) {
      applyCleanShotStyle(e.path);
    }
    saveState();
  });
  canvas.on("object:modified", saveState);
}

// ─── Shape factory ─────────────────────────────────────────────────────────────

function createShape(tool: ToolType, x: number, y: number): any {
  const sw = Math.max(2, strokeWidth);

  switch (tool) {
    case "rectangle":
      return new Rect({
        left: x, top: y, width: 0, height: 0,
        rx: 10, ry: 10,
        fill: "transparent",
        stroke: currentColor,
        strokeWidth: sw,
        strokeUniform: true,
        originX: "left", originY: "top",
        selectable: false, evented: false,
      });

    case "ellipse":
      return new Ellipse({
        left: x, top: y, rx: 0, ry: 0,
        fill: "transparent",
        stroke: currentColor,
        strokeWidth: sw,
        strokeUniform: true,
        originX: "left", originY: "top",
        selectable: false, evented: false,
      });

    case "line":
      return new Line([x, y, x, y], {
        stroke: currentColor,
        strokeWidth: sw,
        strokeUniform: true,
        strokeLineCap: "round",
        selectable: false, evented: false,
      });

    case "arrow":
      return new Line([x, y, x, y], {
        stroke: currentColor,
        strokeWidth: sw,
        strokeUniform: true,
        strokeLineCap: "round",
        selectable: false, evented: false,
      });

    case "callout":
      return new Rect({
        left: x, top: y, width: 0, height: 0,
        rx: 12, ry: 12,
        fill: currentColor,
        stroke: "#FFFFFF",
        strokeWidth: 2,
        strokeUniform: true,
        originX: "left", originY: "top",
        selectable: false, evented: false,
      });

    case "spotlight":
      return new Rect({
        left: x, top: y, width: 0, height: 0,
        rx: 8, ry: 8,
        fill: "transparent",
        stroke: "#1667F2",
        strokeWidth: 2,
        strokeDashArray: [6, 4],
        originX: "left", originY: "top",
        selectable: false, evented: false,
      });

    case "highlight":
      return new Rect({
        left: x, top: y, width: 0, height: 0,
        fill: currentColor,
        opacity: 0.35,
        stroke: "transparent",
        originX: "left", originY: "top",
        selectable: false, evented: false,
      });

    case "blur":
      return new Rect({
        left: x, top: y, width: 0, height: 0,
        rx: 4, ry: 4,
        fill: "rgba(100,100,100,0.35)",
        stroke: "rgba(255,255,255,0.7)",
        strokeWidth: 1.5,
        strokeUniform: true,
        strokeDashArray: [5, 4],
        originX: "left", originY: "top",
        selectable: false, evented: false,
      });

    case "square":
      return new Rect({
        left: x, top: y, width: 0, height: 0,
        fill: "transparent",
        stroke: currentColor,
        strokeWidth: sw,
        strokeUniform: true,
        originX: "left", originY: "top",
        selectable: false, evented: false,
      });

    case "circle":
      return new Circle({
        left: x, top: y, radius: 0,
        fill: "transparent",
        stroke: currentColor,
        strokeWidth: sw,
        strokeUniform: true,
        originX: "left", originY: "top",
        selectable: false, evented: false,
      });

    case "triangle":
      return new Triangle({
        left: x, top: y, width: 0, height: 0,
        fill: "transparent",
        stroke: currentColor,
        strokeWidth: sw,
        strokeUniform: true,
        originX: "left", originY: "top",
        selectable: false, evented: false,
      });

    case "polygon": {
      // Regular hexagon — starts degenerate, updateShape repositions vertices
      const pts = Array.from({ length: 6 }, () => ({ x: 0, y: 0 }));
      return new Polygon(pts, {
        left: x, top: y,
        fill: "transparent",
        stroke: currentColor,
        strokeWidth: sw,
        strokeUniform: true,
        originX: "left", originY: "top",
        selectable: false, evented: false,
      });
    }

    default:
      return null;
  }
}

function updateShape(
  shape: any, tool: ToolType,
  x1: number, y1: number, x2: number, y2: number,
): void {
  const left   = Math.min(x1, x2);
  const top    = Math.min(y1, y2);
  const width  = Math.max(1, Math.abs(x2 - x1));
  const height = Math.max(1, Math.abs(y2 - y1));

  switch (tool) {
    case "rectangle": case "blur": case "crop": case "callout": case "spotlight": case "highlight":
      shape.set({ originX: "left", originY: "top", left, top, width, height });
      break;
    case "square": {
      const side = Math.max(width, height);
      shape.set({ originX: "left", originY: "top", left, top, width: side, height: side });
      break;
    }
    case "ellipse":
      shape.set({ originX: "left", originY: "top", left, top, rx: width / 2, ry: height / 2 });
      break;
    case "circle": {
      const r = Math.max(width, height) / 2;
      shape.set({ originX: "left", originY: "top", left, top, radius: r });
      break;
    }
    case "triangle":
      shape.set({ originX: "left", originY: "top", left, top, width, height });
      break;
    case "polygon": {
      // Regular hexagon fitting the bounding box
      const cx = width / 2;
      const cy = height / 2;
      const rx = width / 2;
      const ry = height / 2;
      const pts = Array.from({ length: 6 }, (_, i) => {
        const angle = (Math.PI / 3) * i - Math.PI / 2;
        return { x: cx + rx * Math.cos(angle), y: cy + ry * Math.sin(angle) };
      });
      shape.points = pts;
      shape.set({ originX: "left", originY: "top", left, top });
      if (typeof shape.setDimensions === "function") {
        shape.setDimensions();
      }
      break;
    }
    case "line": case "arrow":
      shape.set({ x1, y1, x2, y2 });
      break;
  }
  shape.setCoords();
}

// ─── Arrow (Straight & Curved) ───────────────────────────────────────────────

function finaliseArrow(line: Line): void {
  const [x1, y1, x2, y2] = [
    line.get("x1") as number, line.get("y1") as number,
    line.get("x2") as number, line.get("y2") as number,
  ];
  const dx = x2 - x1, dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len < 6) { canvas.remove(line); return; }

  const sw     = Math.max(2, strokeWidth);
  const hs     = Math.max(sw * 3.5, 12);
  const angle  = Math.atan2(dy, dx);
  const spread = Math.PI / 7;

  if (currentArrowType === "curved") {
    // Elegant curved arrow with quadratic bezier curve
    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2;
    // Perpendicular offset for curvature
    const perpX = -dy * 0.25;
    const perpY = dx * 0.25;
    const cpX = midX + perpX;
    const cpY = midY + perpY;

    // Arrowhead angle computed from control point to endpoint
    const headAngle = Math.atan2(y2 - cpY, x2 - cpX);

    const curvePath = new Path(
      `M ${x1} ${y1} Q ${cpX} ${cpY} ${x2} ${y2}`,
      {
        fill: "transparent",
        stroke: currentColor,
        strokeWidth: sw,
        strokeUniform: true,
        strokeLineCap: "round",
        strokeLineJoin: "round",
        objectCaching: false,
      }
    );

    const head = new Path(
      `M ${x2} ${y2} ` +
      `L ${x2 - hs * Math.cos(headAngle - spread)} ${y2 - hs * Math.sin(headAngle - spread)} ` +
      `Q ${x2 - (hs * 0.7) * Math.cos(headAngle)} ${y2 - (hs * 0.7) * Math.sin(headAngle)} ` +
      `${x2 - hs * Math.cos(headAngle + spread)} ${y2 - hs * Math.sin(headAngle + spread)} Z`,
      {
        fill: currentColor,
        stroke: currentColor,
        strokeWidth: 1,
        strokeUniform: true,
        strokeLineJoin: "round",
        objectCaching: false,
      }
    );

    const group = new Group([curvePath, head], {
      selectable: false,
      evented: false,
      objectCaching: false,
    });

    applyCleanShotStyle(group);
    canvas.remove(line);
    canvas.add(group);
    group.setCoords();
    saveState();
    finishAndSelect(group);
    return;
  }

  // Straight arrow
  const head = new Path(
    `M ${x2} ${y2} ` +
    `L ${x2 - hs * Math.cos(angle - spread)} ${y2 - hs * Math.sin(angle - spread)} ` +
    `Q ${x2 - (hs * 0.7) * Math.cos(angle)} ${y2 - (hs * 0.7) * Math.sin(angle)} ` +
    `${x2 - hs * Math.cos(angle + spread)} ${y2 - hs * Math.sin(angle + spread)} Z`,
    {
      fill: currentColor,
      stroke: currentColor,
      strokeWidth: 1,
      strokeUniform: true,
      strokeLineJoin: "round",
      objectCaching: false,
    }
  );

  const straightLine = new Line([x1, y1, x2, y2], {
    stroke: currentColor,
    strokeWidth: sw,
    strokeUniform: true,
    strokeLineCap: "round",
    objectCaching: false,
  });

  const group = new Group([straightLine, head], {
    selectable: false,
    evented: false,
    objectCaching: false,
  });

  applyCleanShotStyle(group);
  canvas.remove(line);
  canvas.add(group);
  group.setCoords();
  saveState();
  finishAndSelect(group);
}

// ─── CleanShot X Callout Bubble ───────────────────────────────────────────────

function finaliseCallout(rect: Rect): void {
  const l = rect.left ?? 0;
  const t = rect.top ?? 0;
  const w = Math.max(60, (rect.width ?? 0) * (rect.scaleX ?? 1));
  const h = Math.max(36, (rect.height ?? 0) * (rect.scaleY ?? 1));
  canvas.remove(rect);

  const bubble = new Rect({
    left: 0, top: 0, width: w, height: h,
    rx: 10, ry: 10,
    fill: currentColor,
    originX: "left", originY: "top",
  });

  const text = new IText("Note", {
    left: w / 2, top: h / 2,
    fontSize: Math.max(13, Math.min(18, h * 0.45)),
    fontFamily: "-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif",
    fontWeight: "bold",
    fill: "#FFFFFF",
    originX: "center", originY: "center",
  });

  const group = new Group([bubble, text], {
    left: l, top: t,
    selectable: false,
    evented: false,
  });

  applyCleanShotStyle(group);
  canvas.add(group);
  group.setCoords();
  saveState();
  finishAndSelect(group);
}

// ─── CleanShot X Spotlight ────────────────────────────────────────────────────

function finaliseSpotlight(rect: Rect): void {
  const l = Math.max(0, rect.left ?? 0);
  const t = Math.max(0, rect.top ?? 0);
  const w = (rect.width ?? 0) * (rect.scaleX ?? 1);
  const h = (rect.height ?? 0) * (rect.scaleY ?? 1);
  canvas.remove(rect);

  if (w < 10 || h < 10) return;

  const cW = canvas.width || dispW;
  const cH = canvas.height || dispH;

  // Outer full canvas boundary path clockwise + Inner spotlight cutout counter-clockwise (evenodd fill)
  const pathStr = `M 0 0 L ${cW} 0 L ${cW} ${cH} L 0 ${cH} Z M ${l} ${t} L ${l} ${t + h} L ${l + w} ${t + h} L ${l + w} ${t} Z`;
  const spotlight = new Path(pathStr, {
    left: 0,
    top: 0,
    fill: "rgba(0, 0, 0, 0.60)",
    fillRule: "evenodd",
    selectable: false,
    evented: false,
    originX: "left",
    originY: "top",
  });

  const border = new Rect({
    left: l,
    top: t,
    width: w,
    height: h,
    rx: 8,
    ry: 8,
    fill: "transparent",
    stroke: "#FFFFFF",
    strokeWidth: 2,
    selectable: false,
    evented: false,
    originX: "left",
    originY: "top",
  });

  const group = new Group([spotlight, border], {
    left: 0,
    top: 0,
    selectable: false,
    evented: false,
    originX: "left",
    originY: "top",
  });

  applyCleanShotStyle(group);
  canvas.add(group);
  group.setCoords();
  saveState();
  finishAndSelect(group);
}

// ─── Blur / Redact (Glass, Pixelate, Redact Blackout) ──────────────────────────

async function finaliseBlur(placeholder: any): Promise<void> {
  const l = placeholder.left ?? 0;
  const t = placeholder.top  ?? 0;
  const w = (placeholder.width  ?? 0) * (placeholder.scaleX ?? 1);
  const h = (placeholder.height ?? 0) * (placeholder.scaleY ?? 1);

  if (!backgroundImage || w < 2 || h < 2) { canvas.remove(placeholder); return; }

  const rx = Math.max(0, Math.round(l));
  const ry = Math.max(0, Math.round(t));
  const rw = Math.max(1, Math.min(Math.round(w), Math.round(dispW) - rx));
  const rh = Math.max(1, Math.min(Math.round(h), Math.round(dispH) - ry));

  // Option 3: Redact Blackout
  if (currentBlurType === "redact") {
    canvas.remove(placeholder);
    const redactBox = new Rect({
      left: rx,
      top: ry,
      width: rw,
      height: rh,
      fill: "#000000",
      rx: 3,
      ry: 3,
      selectable: false,
      evented: false,
      originX: "left",
      originY: "top",
    });
    applyCleanShotStyle(redactBox);
    canvas.add(redactBox);
    redactBox.setCoords();
    saveState();
    finishAndSelect(redactBox);
    return;
  }

  try {
    // Hide placeholder box so it is not baked into the blurred bitmap
    placeholder.visible = false;
    canvas.renderAll();

    // Export scene at 1:1 dispW/dispH resolution without zoom skew
    const multiplier = 1 / (cssZoom || 1);
    const fullDataUrl = canvas.toDataURL({ format: "png", quality: 1, multiplier } as any);
    const src = new Image();
    src.src = fullDataUrl;
    await new Promise<void>((r) => { src.onload = () => r(); });

    const region = document.createElement("canvas");
    region.width = rw; region.height = rh;
    const ctx = region.getContext("2d")!;
    ctx.drawImage(src, rx, ry, rw, rh, 0, 0, rw, rh);

    // Option 2: Pixelate
    if (currentBlurType === "pixel") {
      const pixelSize = Math.max(8, Math.round(Math.min(rw, rh) / 10));
      const offCanvas = document.createElement("canvas");
      const offW = Math.max(1, Math.floor(rw / pixelSize));
      const offH = Math.max(1, Math.floor(rh / pixelSize));
      offCanvas.width = offW;
      offCanvas.height = offH;
      const offCtx = offCanvas.getContext("2d")!;
      offCtx.imageSmoothingEnabled = false;
      offCtx.drawImage(region, 0, 0, offW, offH);

      ctx.imageSmoothingEnabled = false;
      ctx.clearRect(0, 0, rw, rh);
      ctx.drawImage(offCanvas, 0, 0, offW, offH, 0, 0, rw, rh);
    } else {
      // Option 1: Glass Smooth Blur
      const radius = Math.max(16, Math.round(Math.min(rw, rh) / 4));
      canvasRGBA(region, 0, 0, rw, rh, radius);
    }

    const img = await FabricImage.fromURL(region.toDataURL("image/png"));
    img.set({
      left: rx, top: ry,
      originX: "left", originY: "top",
      selectable: false, evented: false,
    });
    applyCleanShotStyle(img);

    canvas.remove(placeholder);
    canvas.add(img);
    img.setCoords();
    saveState();
    finishAndSelect(img);
  } catch (err) {
    console.error("Blur failed:", err);
    canvas.remove(placeholder);
    canvas.renderAll();
    showToast("Blur failed. Try again.");
  }
}

// ─── Crop (Cropper.js modal — CleanShot X style) ─────────────────────────────

function openCropModal(): void {
  const modal    = document.getElementById("cropModal")!;
  const img      = document.getElementById("cropImg") as HTMLImageElement;
  const sizeEl   = document.getElementById("cropSizeDisplay")!;
  const posEl    = document.getElementById("cropPosDisplay")!;

  const multiplier = Math.max(1, 1 / fitScale);
  const savedCropZ = cssZoom;
  if (savedCropZ !== 1) applyContainerZoom(1);
  const dataUrl = canvas.toDataURL({ format: "png", quality: 1, multiplier });
  if (savedCropZ !== 1) applyContainerZoom(savedCropZ);

  document.querySelectorAll(".tool-btn[data-tool]").forEach((b) => b.classList.remove("active"));
  document.querySelector(".tool-btn[data-tool='crop']")?.classList.add("active");

  modal.style.display = "flex";
  sizeEl.textContent = `${imgNativeW} × ${imgNativeH} px`;
  posEl.textContent  = "";

  img.onload = () => {
    if (cropperInstance) { cropperInstance.destroy(); cropperInstance = null; }
    cropperInstance = new Cropper(img, {
      viewMode:         1,
      dragMode:         "crop",
      guides:           true,
      center:           true,
      highlight:        false,
      background:       true,
      autoCrop:         false,
      movable:          false,
      rotatable:        false,
      scalable:         false,
      zoomable:         false,
      zoomOnWheel:      false,
      toggleDragModeOnDblclick: false,
      crop(event: Cropper.CropEvent) {
        const { x, y, width, height } = event.detail;
        if (width > 1 && height > 1) {
          sizeEl.textContent = `${Math.round(width)} × ${Math.round(height)} px`;
          posEl.textContent  = `${Math.round(x)}, ${Math.round(y)}`;
        }
      },
    });

    document.querySelectorAll<HTMLButtonElement>(".ratio-btn").forEach((btn) => {
      btn.onclick = () => {
        document.querySelectorAll(".ratio-btn").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        const r = btn.dataset.ratio;
        cropperInstance?.setAspectRatio(r ? parseFloat(r) : NaN);
      };
    });
  };
  img.src = dataUrl;
}

function closeCropModal(andSelectTool = true): void {
  if (cropperInstance) { cropperInstance.destroy(); cropperInstance = null; }
  const modal = document.getElementById("cropModal")!;
  const img   = document.getElementById("cropImg") as HTMLImageElement;
  modal.style.display = "none";
  img.src = "";
  document.querySelectorAll(".ratio-btn").forEach((b) => b.classList.remove("active"));
  document.querySelector<HTMLButtonElement>('.ratio-btn[data-ratio=""]')?.classList.add("active");
  if (andSelectTool) setTool("select");
}

function applyCropModal(): void {
  if (!cropperInstance || !backgroundImage) return;
  const data = cropperInstance.getData(true);
  if (!data.width || !data.height || data.width < 4 || data.height < 4) {
    document.getElementById("cropSizeDisplay")!.textContent = "Draw a selection first";
    return;
  }

  // The preview is canvas.toDataURL at multiplier m, so its pixels map back to
  // the screenshot's native pixels by 1 / (fitScale * m). Cutting the crop from
  // the background image itself (not the flattened preview) keeps annotations
  // as live, editable objects instead of baking them into the pixels.
  const m = Math.max(1, 1 / fitScale);
  const f = 1 / (fitScale * m);
  const cropX = Math.min(imgNativeW - 1, Math.max(0, Math.round(data.x * f)));
  const cropY = Math.min(imgNativeH - 1, Math.max(0, Math.round(data.y * f)));
  const cropW = Math.max(1, Math.min(imgNativeW - cropX, Math.round(data.width * f)));
  const cropH = Math.max(1, Math.min(imgNativeH - cropY, Math.round(data.height * f)));

  const out = document.createElement("canvas");
  out.width = cropW;
  out.height = cropH;
  const octx = out.getContext("2d");
  if (!octx) { showToast("Crop failed. Try again."); return; }
  octx.imageSmoothingEnabled = true;
  octx.imageSmoothingQuality = "high";
  octx.drawImage(backgroundImage.getElement() as CanvasImageSource, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);
  const resultDataUrl = out.toDataURL("image/png");

  const annotations = canvas.getObjects().filter((o) => o !== backgroundImage);
  const oldFit = fitScale;
  canvas.discardActiveObject();

  if (cropperInstance) { cropperInstance.destroy(); cropperInstance = null; }
  const modal = document.getElementById("cropModal")!;
  const img   = document.getElementById("cropImg") as HTMLImageElement;
  modal.style.display = "none";
  img.src = "";

  loadScreenshot(resultDataUrl, false).then(() => {
    // Same screenshot-pixel position, new origin and (possibly) new display scale.
    const k = fitScale / oldFit;
    for (const o of annotations) {
      o.set({
        left: ((o.left ?? 0) / oldFit - cropX) * fitScale,
        top: ((o.top ?? 0) / oldFit - cropY) * fitScale,
        scaleX: (o.scaleX ?? 1) * k,
        scaleY: (o.scaleY ?? 1) * k,
      });
      o.setCoords();
      const r = o.getBoundingRect();
      if (r.left > dispW || r.top > dispH || r.left + r.width < 0 || r.top + r.height < 0) canvas.remove(o);
    }
    canvas.renderAll();
    isCropped = true;
    setTool("select");
    saveState();
    showToast(annotations.length ? "Cropped — annotations kept" : "Cropped");
  });
}

function nudgeCropBox(dx: number, dy: number): void {
  if (!cropperInstance) return;
  const d = cropperInstance.getData();
  cropperInstance.setData({ x: (d.x ?? 0) + dx, y: (d.y ?? 0) + dy });
}

// ─── Coordinate helper ────────────────────────────────────────────────────────

function getScenePoint(e: any): { x: number; y: number } {
  try {
    if (typeof canvas?.getScenePoint === "function" && (e?.e || e)) {
      const p = canvas.getScenePoint(e?.e || e);
      if (p && typeof p.x === "number" && !isNaN(p.x)) {
        return {
          x: Math.max(0, Math.min(dispW || p.x, p.x)),
          y: Math.max(0, Math.min(dispH || p.y, p.y)),
        };
      }
    }
  } catch {}

  if (e?.scenePoint && typeof e.scenePoint.x === "number" && !isNaN(e.scenePoint.x)) {
    return {
      x: Math.max(0, Math.min(dispW || e.scenePoint.x, e.scenePoint.x)),
      y: Math.max(0, Math.min(dispH || e.scenePoint.y, e.scenePoint.y)),
    };
  }

  const raw: MouseEvent = e?.e || e;
  const upperCanvas = canvas?.upperCanvasEl || canvas?.getElement?.();
  if (raw && typeof raw.clientX === "number" && upperCanvas) {
    const rect = upperCanvas.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      // Scene coordinates in Fabric correspond directly to logical dispW and dispH
      const targetW = dispW || 1;
      const targetH = dispH || 1;
      const normX = (raw.clientX - rect.left) / rect.width;
      const normY = (raw.clientY - rect.top) / rect.height;
      return {
        x: Math.max(0, Math.min(targetW, normX * targetW)),
        y: Math.max(0, Math.min(targetH, normY * targetH)),
      };
    }
  }

  return { x: 0, y: 0 };
}

// ─── Text & step ─────────────────────────────────────────────────────────────

function addText(x: number, y: number): void {
  const text = new IText("Redact confidential info", {
    left: x, top: y, fontSize: 26,
    fontFamily: "'Caveat', cursive, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
    fill: currentColor, fontWeight: "700", editable: true,
  });
  applyCleanShotStyle(text);
  canvas.add(text);
  canvas.setActiveObject(text);
  text.enterEditing();
  text.selectAll();
  saveState();
}

function addStepNumber(x: number, y: number): void {
  const r      = 15;
  const circle = new Circle({
    radius: r,
    fill: currentColor,
    originX: "center", originY: "center",
  });
  const label  = new FabricText(String(stepCounter), {
    fontSize: 15,
    fontFamily: "-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif",
    fill: "#FFFFFF",
    fontWeight: "bold",
    originX: "center", originY: "center",
  });
  const group = new Group([circle, label], {
    left: x - r, top: y - r,
    // Step numbers are placed in rapid sequence (1, 2, 3...) so — unlike the
    // other shape tools — we stay in the Step tool rather than reverting to
    // Select. The badge is still individually draggable right away, since
    // per-object selectable/evented works independent of the active tool.
    selectable: true,
    evented: true,
  });
  applyCleanShotStyle(group);
  canvas.add(group);
  canvas.setActiveObject(group);
  stepCounter++;
  saveState();
}

// ─── Color picker ─────────────────────────────────────────────────────────────

function applyCurrentColor(): void {
  if (canvas.freeDrawingBrush) canvas.freeDrawingBrush.color = currentColor;

  const active = canvas.getActiveObject();
  if (active) {
    if (active.type === "i-text" || active.type === "text") {
      active.set("fill", currentColor);
    } else if (active.type === "group") {
      (active as Group).getObjects().forEach((o) => {
        if (o.type === "circle" || o.type === "rect" || o.type === "path") o.set("fill", currentColor);
        if (o.type === "line") o.set("stroke", currentColor);
      });
    } else {
      if ((active as any).fill && (active as any).fill !== "transparent") active.set("fill", currentColor);
      active.set("stroke", currentColor);
    }
    canvas.renderAll();
    saveState();
  }
}

function setupColorPicker(): void {
  // Compact-toolbar trigger (see color-trigger/color-group in editor.html)
  // always mirrors currentColor, whichever swatch — preset or custom — set it.
  const colorTrigger = document.getElementById("color-trigger");
  const syncColorTrigger = () => {
    if (colorTrigger) colorTrigger.style.background = currentColor;
  };
  syncColorTrigger();

  document.querySelectorAll(".color-swatch:not(.color-swatch-custom)").forEach((swatch) => {
    swatch.addEventListener("click", () => {
      document.querySelectorAll(".color-swatch").forEach((s) => s.classList.remove("active"));
      swatch.classList.add("active");
      currentColor = (swatch as HTMLElement).dataset.color!;
      applyCurrentColor();
      syncColorTrigger();
    });
  });

  const customSwatch = document.getElementById("customColorSwatch");
  const customInput = document.getElementById("customColorInput") as HTMLInputElement | null;
  if (!customSwatch || !customInput) return;

  // Deliberately session-only: a color picked here applies only to this
  // editor tab. It used to be persisted to chrome.storage.sync and silently
  // restored (both the swatch's rainbow-wheel background and the hex value)
  // on every future editor open, so a custom color picked while annotating
  // one capture would reappear — already "selected" looking — on a totally
  // unrelated capture opened later. Annotation color is a per-edit choice,
  // not a durable preference, so nothing here should outlive this tab.
  customInput.addEventListener("input", () => {
    currentColor = customInput.value;
    customSwatch.style.background = currentColor;
    document.querySelectorAll(".color-swatch").forEach((s) => s.classList.remove("active"));
    customSwatch.classList.add("active");
    applyCurrentColor();
    syncColorTrigger();
  });
}

// ─── Stroke control ───────────────────────────────────────────────────────────

function setupStrokeControl(): void {
  const slider = document.getElementById("strokeWidth") as HTMLInputElement;
  slider.addEventListener("input", () => {
    strokeWidth = parseInt(slider.value);
    if (canvas.freeDrawingBrush) canvas.freeDrawingBrush.width = strokeWidth;

    const active = canvas.getActiveObject();
    if (active && active.type !== "i-text") {
      if (active.type === "group") {
        (active as Group).getObjects().forEach((o) => { if (o.type !== "i-text") o.set("strokeWidth", strokeWidth); });
      } else {
        active.set("strokeWidth", strokeWidth);
      }
      canvas.renderAll();
      saveState();
    }
  });
}

// ─── Export buttons ───────────────────────────────────────────────────────────

function getAnnotToggle(): boolean {
  return (document.getElementById("annot-toggle-check") as HTMLInputElement)?.checked ?? true;
}

function getResizeDims(): { w: number; h: number } | null {
  const wEl = document.getElementById("export-w") as HTMLInputElement;
  const hEl = document.getElementById("export-h") as HTMLInputElement;
  const w = parseInt(wEl?.value ?? "");
  const h = parseInt(hEl?.value ?? "");
  if (w > 0 && h > 0) return { w, h };
  return null;
}

async function exportToBlob(): Promise<Blob> {
  const clean = !getAnnotToggle();
  const annotations = canvas.getObjects().filter((o) => o !== backgroundImage);
  const hasAnnotations = annotations.length > 0;
  // Explicit width/height inputs win when set; otherwise the Quality
  // dropdown (Native/1080p HD/4K UHD) decides the target size.
  const dims = getResizeDims() ?? getExportTargetSize();

  const isImageModified = isBeautified || isCropped;

  // Clean export (toggle unchecked) or no annotations on an UNMODIFIED screenshot:
  // bypass Fabric entirely — pristine original capture quality, zero memory/zoom issues
  if (!isImageModified && (clean || !hasAnnotations)) {
    try {
      const resp = await chrome.runtime.sendMessage({ type: "GET_CAPTURE_BLOB_URL" });
      const dataUrl: string | null = resp?.url ?? null;
      if (dataUrl) {
        let blob = await dataUrlToBlob(dataUrl);
        if (dims) {
          const bitmap = await createImageBitmap(blob);
          const oc = new OffscreenCanvas(dims.w, dims.h);
          const ctx = oc.getContext("2d")!;
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = "high";
          ctx.drawImage(bitmap, 0, 0, dims.w, dims.h);
          blob = await oc.convertToBlob({ type: "image/png" });
        }
        return blob;
      }
    } catch (e) {
      console.warn("Direct capture blob bypass failed, falling back to Fabric:", e);
    }
  }

  // Fabric export: temporarily reset zoom to 1.0 so toDataURL multiplies from base canvas dims (dispW x dispH),
  // rather than multiplying the already zoomed-in display dimensions (which crashed at 500%+ zoom).
  const savedZoom = cssZoom;
  const multiplier = getExportMultiplier();

  try {
    if (savedZoom !== 1) {
      applyContainerZoom(1);
    }

    if (clean && hasAnnotations) {
      annotations.forEach((o) => o.set("visible", false));
      canvas.renderAll();
    }

    const dataUrl = canvas.toDataURL({
      format: "png",
      quality: 1,
      multiplier,
      imageSmoothingEnabled: true,
      imageSmoothingQuality: "high",
    } as any);

    let blob = await dataUrlToBlob(dataUrl);

    if (dims) {
      const bitmap = await createImageBitmap(blob);
      const oc = new OffscreenCanvas(dims.w, dims.h);
      const ctx = oc.getContext("2d")!;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(bitmap, 0, 0, dims.w, dims.h);
      blob = await oc.convertToBlob({ type: "image/png" });
    }

    return blob;
  } finally {
    if (clean && hasAnnotations) {
      annotations.forEach((o) => o.set("visible", true));
    }
    if (savedZoom !== 1) {
      applyContainerZoom(savedZoom);
    } else {
      canvas.renderAll();
    }
  }
}

function setupExportButtons(): void {
  // Stop clicks inside settings panel from closing the dropdown
  document.getElementById("export-settings-panel")?.addEventListener("click", (e) => e.stopPropagation());

  // Aspect ratio lock for resize inputs
  let aspectLocked = true;
  const lockBtn = document.getElementById("resize-lock-btn")!;
  const wInput  = document.getElementById("export-w") as HTMLInputElement;
  const hInput  = document.getElementById("export-h") as HTMLInputElement;

  lockBtn?.addEventListener("click", (e) => {
    e.stopPropagation();
    aspectLocked = !aspectLocked;
    lockBtn.classList.toggle("locked", aspectLocked);
    lockBtn.setAttribute("aria-pressed", String(aspectLocked));
    // Closed vs open shackle — same body, so only the shackle path changes.
    // Rebuilds the whole button, so the hover tooltip span is regenerated
    // here too instead of relying on a native title attribute.
    lockBtn.innerHTML =
      `<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" ` +
      `stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">` +
      `<rect x="4" y="11" width="16" height="10" rx="2"/>` +
      (aspectLocked ? `<path d="M8 11V7a4 4 0 0 1 8 0v4"/>` : `<path d="M8 11V7a4 4 0 0 1 7.5-2"/>`) +
      `</svg>` +
      `<span class="tip">${aspectLocked ? "Aspect ratio locked" : "Aspect ratio unlocked"}</span>`;
  });

  wInput?.addEventListener("input", () => {
    if (!aspectLocked || !imgNativeW || !imgNativeH) return;
    const w = parseInt(wInput.value);
    if (w > 0) hInput.value = String(Math.round(w * imgNativeH / imgNativeW));
  });
  hInput?.addEventListener("input", () => {
    if (!aspectLocked || !imgNativeW || !imgNativeH) return;
    const h = parseInt(hInput.value);
    if (h > 0) wInput.value = String(Math.round(h * imgNativeW / imgNativeH));
  });

  function getExportFilename(ext: string): string {
    const input = document.getElementById("export-filename") as HTMLInputElement | null;
    const custom = input?.value.trim();
    if (custom) {
      const clean = custom.replace(/[^a-zA-Z0-9._ -]/g, "").trim().replace(/\.+$/, "");
      if (clean) return `${clean}.${ext}`;
    }
    return `gofully-${Date.now()}.${ext}`;
  }

  document.getElementById("copy-btn")!.addEventListener("click", async () => {
    try {
      const blob = await exportToBlob();
      await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
      showToast("Copied to clipboard");
    } catch { showToast("Copy failed. Try Save PNG."); }
  });

  document.getElementById("save-btn")!.addEventListener("click", async () => {
    const blob = await exportToBlob();
    const url  = URL.createObjectURL(blob);
    const a    = Object.assign(document.createElement("a"), { href: url, download: getExportFilename("png") });
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
    editorDirty = false;
    showToast("PNG saved");
  });

  document.getElementById("pdf-btn")!.addEventListener("click", async () => {
    try {
      const blob = await exportToBlob();
      const pdfBlob = await generatePDF(blob, "a4");
      const url = URL.createObjectURL(pdfBlob);
      const a = Object.assign(document.createElement("a"), { href: url, download: getExportFilename("pdf") });
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 5000);
      editorDirty = false;
      showToast("PDF saved");
    } catch { showToast("PDF failed"); }
  });

  document.getElementById("guide-btn")?.addEventListener("click", async () => {
    try {
      const blob = await exportToBlob();
      const dataUrl = await blobToDataUrl(blob);
      const res = await addStepFromDataUrl(dataUrl);
      if (res.ok) {
        showToast(`Added as step ${res.count}`);
        editorDirty = false;
      } else {
        showToast(res.error);
      }
    } catch { showToast("Couldn't add to the guide"); }
  });

  document.getElementById("pin-btn")?.addEventListener("click", async () => {
    try {
      const blob = await exportToBlob();
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const r = new FileReader();
        r.onload = () => resolve(String(r.result));
        r.onerror = () => reject(r.error);
        r.readAsDataURL(blob);
      });
      const resp: any = await chrome.runtime.sendMessage({
        type: "PIN_IMAGE",
        payload: { dataUrl, width: imgNativeW, height: imgNativeH },
      });
      showToast(resp?.ok ? "Pinned to the page" : resp?.error || "Couldn't pin");
    } catch { showToast("Couldn't pin"); }
  });

  document.getElementById("copy-selected-btn")?.addEventListener("click", async () => {
    const active = canvas.getActiveObject();
    if (!active) { showToast("Select an object first"); return; }
    try {
      const tmpCanvas = document.createElement("canvas");
      const bounds = active.getBoundingRect();
      tmpCanvas.width  = Math.ceil(bounds.width);
      tmpCanvas.height = Math.ceil(bounds.height);
      const ctx = tmpCanvas.getContext("2d")!;
      ctx.translate(-bounds.left, -bounds.top);
      active.render(ctx);
      tmpCanvas.toBlob(async (blob) => {
        if (!blob) return;
        await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
        showToast("Object copied");
      }, "image/png");
    } catch { showToast("Copy failed"); }
  });

  // Image Quality dropdown — shared compression quality for JPG and WebP.
  // Replaces the old per-JPG-only slider so quality applies consistently
  // across every lossy export format from the same setting.
  const imageQualitySelect = document.getElementById("export-image-quality") as HTMLSelectElement | null;
  const getExportQuality = () => (imageQualitySelect ? parseInt(imageQualitySelect.value) : 92) / 100;

  document.getElementById("save-webp-btn")?.addEventListener("click", async () => {
    const pngBlob = await exportToBlob();
    const bitmap = await createImageBitmap(pngBlob);
    const dims = getResizeDims();
    const ow = dims?.w ?? bitmap.width;
    const oh = dims?.h ?? bitmap.height;
    const oc = new OffscreenCanvas(ow, oh);
    oc.getContext("2d")!.drawImage(bitmap, 0, 0, ow, oh);
    const quality = getExportQuality();
    const webpBlob = await oc.convertToBlob({ type: "image/webp", quality });
    const url = URL.createObjectURL(webpBlob);
    const a = Object.assign(document.createElement("a"), { href: url, download: getExportFilename("webp") });
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
    editorDirty = false;
    showToast(`WebP saved (${Math.round(quality * 100)}%)`);
  });

  document.getElementById("save-jpg-btn")?.addEventListener("click", async () => {
    const pngBlob = await exportToBlob();
    const bitmap = await createImageBitmap(pngBlob);
    const dims = getResizeDims();
    const ow = dims?.w ?? bitmap.width;
    const oh = dims?.h ?? bitmap.height;
    const oc = new OffscreenCanvas(ow, oh);
    oc.getContext("2d")!.drawImage(bitmap, 0, 0, ow, oh);
    const quality = getExportQuality();
    const jpgBlob = await oc.convertToBlob({ type: "image/jpeg", quality });
    const url = URL.createObjectURL(jpgBlob);
    const a = Object.assign(document.createElement("a"), { href: url, download: getExportFilename("jpg") });
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
    editorDirty = false;
    showToast(`JPG saved (${Math.round(quality * 100)}%)`);
  });


  document.getElementById("undo-btn")!.addEventListener("click",   undo);
  document.getElementById("redo-btn")!.addEventListener("click",   redo);
  document.getElementById("delete-btn")!.addEventListener("click", deleteSelected);
  document.getElementById("duplicate-btn")?.addEventListener("click", duplicateSelected);
  document.getElementById("lock-btn")?.addEventListener("click", toggleLockSelected);
  document.getElementById("zoom-in-btn")?.addEventListener("click",  () => adjustZoom(0.1));
  document.getElementById("zoom-out-btn")?.addEventListener("click", () => adjustZoom(-0.1));
  document.getElementById("hdr-zoom-in-btn")?.addEventListener("click",  () => adjustZoom(0.1));
  document.getElementById("hdr-zoom-out-btn")?.addEventListener("click", () => adjustZoom(-0.1));
  document.getElementById("hdr-zoom-val")?.addEventListener("click", () => {
    if (!backgroundImage) return;
    cssZoom = 1;
    applyContainerZoom(1);
    const zStr = "100%";
    zoomEl.textContent = zStr;
    const hdrZoomVal = document.getElementById("hdr-zoom-val");
    if (hdrZoomVal) hdrZoomVal.textContent = zStr;
  });
  // "Done" used to call window.close() directly — if the user had Beautify
  // or Crop open and hadn't separately used the Export menu first, the
  // window just vanished with their edited screenshot never saved anywhere.
  // Done now closes whatever panel/tool is active and opens the export
  // menu instead, so finishing an edit always leads to a save/copy step.
  document.getElementById("done-btn")?.addEventListener("click", (e) => {
    // Without this, the click bubbles to the document-level "close all
    // dropdowns on outside click" listener and immediately hides the
    // export menu this same click just opened.
    e.stopPropagation();
    if (beautifyActive) {
      document.getElementById("beautifyPanel")?.classList.remove("open");
      document.getElementById("tool-beautify")?.classList.remove("active");
      beautifyActive = false;
    }
    if (cropperInstance) closeCropModal(false);
    setTool("select");
    openExportMenu();
  });

  // Crop modal buttons
  document.getElementById("cropApplyBtn")?.addEventListener("click",  applyCropModal);
  document.getElementById("cropCancelBtn")?.addEventListener("click", () => closeCropModal(true));

  setupTextFormatting();
  setupRotateControls();
}

// Target pixel size in NATIVE-image terms when the Quality dropdown asks for
// more than native resolution already provides; null means "native is enough,
// don't touch anything" — this is what keeps the zero-quality-loss bypass
// path in exportToBlob() actually zero-loss for the default "Native"/HD-not-
// needed cases instead of always re-resampling.
function getExportTargetSize(): { w: number; h: number } | null {
  const quality = (document.getElementById("exportQuality") as HTMLSelectElement)?.value ?? "native";
  if (!imgNativeW || !imgNativeH) return null;

  const targets: Record<string, [number, number]> = {
    hd: [1920, 1080],
    "4k": [3840, 2160],
  };
  const target = targets[quality];
  if (!target) return null;

  const [targetW, targetH] = target;
  if (imgNativeW >= targetW || imgNativeH >= targetH) return null;

  const scale = Math.max(targetW / imgNativeW, targetH / imgNativeH);
  return { w: Math.round(imgNativeW * scale), h: Math.round(imgNativeH * scale) };
}

function getExportMultiplier(): number {
  const nativeM = imgNativeW > 0 ? imgNativeW / dispW : Math.max(1, 1 / fitScale);
  const target = getExportTargetSize();
  if (!target) return nativeM;
  return Math.max(nativeM, target.w / dispW, target.h / dispH);
}

// ─── Text formatting ──────────────────────────────────────────────────────────

function setupTextFormatting(): void {
  const group   = document.getElementById("text-format-group");
  const boldBtn = document.getElementById("text-bold-btn");
  const italicBtn = document.getElementById("text-italic-btn");
  const sizeSlider = document.getElementById("fontSize") as HTMLInputElement;
  const sizeVal    = document.getElementById("fontSizeVal");
  const fontSelect = document.getElementById("fontFamily") as HTMLSelectElement;
  if (!group || !boldBtn || !italicBtn || !sizeSlider) return;

  canvas.on("selection:created", updateTextFormatUI);
  canvas.on("selection:updated", updateTextFormatUI);
  canvas.on("selection:cleared", () => { if (group) group.style.display = "none"; });

  function updateTextFormatUI() {
    const obj = canvas.getActiveObject() as any;
    if (!obj || (obj.type !== "i-text" && obj.type !== "text")) {
      group!.style.display = "none"; return;
    }
    group!.style.display = "";
    boldBtn!.classList.toggle("active", obj.fontWeight === "bold");
    italicBtn!.classList.toggle("active", obj.fontStyle === "italic");
    sizeSlider.value = String(Math.round(obj.fontSize ?? 24));
    if (sizeVal) sizeVal.textContent = sizeSlider.value;
    if (fontSelect && obj.fontFamily) fontSelect.value = obj.fontFamily;
  }

  boldBtn.addEventListener("click", () => {
    const obj = canvas.getActiveObject() as any;
    if (!obj) return;
    obj.set("fontWeight", obj.fontWeight === "bold" ? "normal" : "bold");
    boldBtn.classList.toggle("active", obj.fontWeight === "bold");
    canvas.renderAll(); saveState();
  });

  italicBtn.addEventListener("click", () => {
    const obj = canvas.getActiveObject() as any;
    if (!obj) return;
    obj.set("fontStyle", obj.fontStyle === "italic" ? "normal" : "italic");
    italicBtn.classList.toggle("active", obj.fontStyle === "italic");
    canvas.renderAll(); saveState();
  });

  sizeSlider.addEventListener("input", () => {
    const val = parseInt(sizeSlider.value);
    if (sizeVal) sizeVal.textContent = String(val);
    const obj = canvas.getActiveObject() as any;
    if (!obj) return;
    obj.set("fontSize", val);
    canvas.renderAll(); saveState();
  });

  fontSelect?.addEventListener("change", () => {
    const obj = canvas.getActiveObject() as any;
    if (!obj) return;
    obj.set("fontFamily", fontSelect.value);
    canvas.renderAll(); saveState();
  });
}

// ─── Rotate controls ──────────────────────────────────────────────────────────

function setupRotateControls(): void {
  const group = document.getElementById("rotate-group");
  const leftBtn = document.getElementById("rotate-left-btn");
  const rightBtn = document.getElementById("rotate-right-btn");
  if (!group || !leftBtn || !rightBtn) return;

  function showHide() {
    const obj = canvas.getActiveObject();
    if (group) group.style.display = obj ? "flex" : "none";
    updateLockButtonUI();
  }

  canvas.on("selection:created", showHide);
  canvas.on("selection:updated", showHide);
  canvas.on("selection:cleared", () => { if (group) group.style.display = "none"; });

  leftBtn.addEventListener("click", () => {
    const obj = canvas.getActiveObject();
    if (!obj) return;
    obj.rotate(((obj.angle ?? 0) - 90 + 360) % 360);
    canvas.requestRenderAll();
    saveState();
  });

  rightBtn.addEventListener("click", () => {
    const obj = canvas.getActiveObject();
    if (!obj) return;
    obj.rotate(((obj.angle ?? 0) + 90) % 360);
    canvas.requestRenderAll();
    saveState();
  });
}

// ─── Zoom ─────────────────────────────────────────────────────────────────────

function adjustZoom(delta: number): void {
  if (!backgroundImage) return;
  cssZoom = Math.min(10.0, Math.max(0.1, Math.round((cssZoom + delta) * 100) / 100));
  applyContainerZoom(cssZoom);
  const zStr = `${Math.round(cssZoom * 100)}%`;
  zoomEl.textContent = zStr;
  const hdrZoomVal = document.getElementById("hdr-zoom-val");
  if (hdrZoomVal) hdrZoomVal.textContent = zStr;
}

// ─── Undo / redo / delete ─────────────────────────────────────────────────────

let editorDirty = false;

function saveState(): void {
  undoStack.push({
    json: JSON.stringify(canvas.toJSON()),
    meta: { dispW, dispH, fitScale, imgNativeW, imgNativeH },
  });
  redoStack = [];
  if (undoStack.length > 50) undoStack.shift();
  editorDirty = true;
}

window.addEventListener("beforeunload", (e) => {
  if (!editorDirty) return;
  e.preventDefault();
});

function findBackgroundImage(): FabricImage | null {
  const objs = canvas.getObjects();
  if (objs.length > 0 && objs[0] instanceof FabricImage) return objs[0] as FabricImage;
  return null;
}

function restoreObjectInteractivity(): void {
  const isSelect = currentTool === "select";
  canvas.getObjects().forEach((obj) => {
    obj.selectable = obj === backgroundImage ? false : isSelect;
    obj.evented    = obj === backgroundImage ? false : isSelect;
    if (obj !== backgroundImage) {
      applyCleanShotStyle(obj);
    }
  });
}

function applyViewMeta(m: ViewMeta): void {
  imgNativeW = m.imgNativeW; imgNativeH = m.imgNativeH;
  fitScale = m.fitScale; dispW = m.dispW; dispH = m.dispH;
  canvas.setDimensions({ width: dispW, height: dispH });
  dimensionsEl.textContent = `${imgNativeW} × ${imgNativeH} px`;
  applyContainerZoom(1);
  zoomEl.textContent = "100%";
  const hdrZoomVal = document.getElementById("hdr-zoom-val");
  if (hdrZoomVal) hdrZoomVal.textContent = "100%";
}

function restoreStep(step: HistoryStep): void {
  canvas.loadFromJSON(step.json).then(() => {
    applyViewMeta(step.meta);
    backgroundImage = findBackgroundImage();
    if (backgroundImage) backgroundImage.set({ selectable: false, evented: false });
    restoreObjectInteractivity();
    canvas.renderAll();
  });
}

function undo(): void {
  if (undoStack.length <= 1) return;
  redoStack.push(undoStack.pop()!);
  restoreStep(undoStack[undoStack.length - 1]);
}

function redo(): void {
  if (!redoStack.length) return;
  const next = redoStack.pop()!;
  undoStack.push(next);
  restoreStep(next);
}

function deleteSelected(): void {
  canvas.getActiveObjects().forEach((o) => { if (o !== backgroundImage) canvas.remove(o); });
  canvas.discardActiveObject();
  canvas.renderAll();
  saveState();
}

async function duplicateSelected(): Promise<void> {
  const active = canvas.getActiveObjects().filter((o) => o !== backgroundImage);
  if (!active.length) return;

  const clones = await Promise.all(active.map((o) => o.clone()));
  clones.forEach((clone, i) => {
    clone.set({ left: (active[i].left ?? 0) + 16, top: (active[i].top ?? 0) + 16 });
    canvas.add(clone);
  });

  canvas.discardActiveObject();
  if (clones.length === 1) {
    canvas.setActiveObject(clones[0]);
  } else {
    const selection = new ActiveSelection(clones, { canvas });
    canvas.setActiveObject(selection);
  }
  canvas.renderAll();
  saveState();
}

function toggleLockSelected(): void {
  const active = canvas.getActiveObject();
  if (!active || active === backgroundImage) return;

  const nowLocked = !active.lockMovementX;
  active.set({
    lockMovementX: nowLocked,
    lockMovementY: nowLocked,
    lockScalingX: nowLocked,
    lockScalingY: nowLocked,
    lockRotation: nowLocked,
    hasControls: !nowLocked,
  });
  canvas.renderAll();
  saveState();
  updateLockButtonUI();
}

function updateLockButtonUI(): void {
  const btn = document.getElementById("lock-btn");
  if (!btn) return;
  const active = canvas.getActiveObject();
  const locked = !!active?.lockMovementX;
  btn.classList.toggle("active", locked);
  const tip = btn.querySelector(".tip");
  if (tip) tip.textContent = locked ? "Unlock" : "Lock in place";
}

// ─── Keyboard shortcuts ───────────────────────────────────────────────────────

function setupKeyboardShortcuts(): void {
  document.addEventListener("keydown", (e) => {
    if ((e.target as HTMLElement).tagName === "TEXTAREA") return;
    const activeObj = canvas.getActiveObject();
    if (activeObj?.type === "i-text" && (activeObj as IText).isEditing) return;

    if (e.key === "Enter" && cropperInstance) { e.preventDefault(); applyCropModal(); return; }
    if (e.key === "Escape") {
      e.preventDefault();
      if (cropperInstance) { closeCropModal(true); }
      return;
    }
    // Arrow nudge in cropper
    if (cropperInstance) {
      const step = e.shiftKey ? 10 : 1;
      if (e.key === "ArrowLeft")  { e.preventDefault(); nudgeCropBox(-step, 0); return; }
      if (e.key === "ArrowRight") { e.preventDefault(); nudgeCropBox( step, 0); return; }
      if (e.key === "ArrowUp")    { e.preventDefault(); nudgeCropBox(0, -step); return; }
      if (e.key === "ArrowDown")  { e.preventDefault(); nudgeCropBox(0,  step); return; }
    }

    if ((e.metaKey || e.ctrlKey) && e.key === "z") { e.preventDefault(); e.shiftKey ? redo() : undo(); return; }
    if ((e.metaKey || e.ctrlKey) && e.key === "y") { e.preventDefault(); redo(); return; }
    if ((e.key === "Delete" || e.key === "Backspace") && activeObj) { e.preventDefault(); deleteSelected(); return; }
    if ((e.metaKey || e.ctrlKey) && e.key === "=") { e.preventDefault(); adjustZoom(0.1);  return; }
    if ((e.metaKey || e.ctrlKey) && e.key === "-") { e.preventDefault(); adjustZoom(-0.1); return; }
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "d" && activeObj) { e.preventDefault(); duplicateSelected(); return; }

    if (!e.metaKey && !e.ctrlKey && !e.shiftKey) {
      const tool = keyToTool[e.key.toLowerCase()];
      if (tool) setTool(tool);
    }
  });
}

// ─── Toast / utils ────────────────────────────────────────────────────────────

function showToast(message: string): void {
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 3000);
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload  = () => res(r.result as string);
    r.onerror = rej;
    r.readAsDataURL(blob);
  });
}

function dataUrlToBlob(dataUrl: string): Blob {
  const [header, b64] = dataUrl.split(",");
  const mime = header.match(/:(.*?);/)?.[1] ?? "image/png";
  const bytes = atob(b64);
  const arr = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
  return new Blob([arr], { type: mime });
}

// ─── Beautifier ──────────────────────────────────────────────────────────────

let beautifyActive = false;
let originalScreenshotUrl: string | null = null;
let collageImages: string[] = [];
let collageLayout: "row" | "column" = "row";
let customBgImg: HTMLImageElement | null = null;
let bfAlign: [number, number] = [0.5, 0.5];

// Built-in wallpapers: layered radial blobs over a base colour. Drawn in code, so
// they cost no download, work offline and stay sharp at any export size.
interface MeshDef { name: string; base: string; blobs: [number, number, number, string][] }
const MESH_WALLPAPERS: Record<string, MeshDef> = {
  aurora:   { name: "Aurora",   base: "#0b1020", blobs: [[0.15, 0.2, 0.7, "#1667F2"], [0.85, 0.15, 0.6, "#7C3AED"], [0.5, 0.95, 0.7, "#06B6D4"]] },
  sunset:   { name: "Sunset",   base: "#2b1055", blobs: [[0.1, 0.9, 0.8, "#FF6B6B"], [0.9, 0.2, 0.7, "#FFB347"], [0.5, 0.5, 0.5, "#C026D3"]] },
  ocean:    { name: "Ocean",    base: "#03133a", blobs: [[0.2, 0.1, 0.8, "#0EA5E9"], [0.85, 0.85, 0.7, "#1667F2"], [0.1, 0.9, 0.5, "#14B8A6"]] },
  lavender: { name: "Lavender", base: "#ede9fe", blobs: [[0.1, 0.1, 0.7, "#C4B5FD"], [0.9, 0.3, 0.6, "#F0ABFC"], [0.4, 1, 0.7, "#A5B4FC"]] },
  mint:     { name: "Mint",     base: "#ecfdf5", blobs: [[0.1, 0.8, 0.7, "#6EE7B7"], [0.9, 0.1, 0.6, "#67E8F9"], [0.6, 0.6, 0.5, "#BEF264"]] },
  ember:    { name: "Ember",    base: "#1c0a0a", blobs: [[0.9, 0.9, 0.8, "#EF4444"], [0.1, 0.2, 0.6, "#F97316"], [0.5, 0.6, 0.45, "#7F1D1D"]] },
  midnight: { name: "Midnight", base: "#0f172a", blobs: [[0.2, 0.2, 0.6, "#334155"], [0.8, 0.8, 0.7, "#1E3A8A"], [0.9, 0.1, 0.4, "#475569"]] },
  rose:     { name: "Rose",     base: "#fff1f2", blobs: [[0.1, 0.2, 0.7, "#FDA4AF"], [0.9, 0.8, 0.7, "#FBCFE8"], [0.5, 0.5, 0.5, "#FECDD3"]] },
};

function hexToRgba(hex: string, a: number): string {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}

function meshCss(def: MeshDef): string {
  return def.blobs
    .map(([x, y, r, c]) => `radial-gradient(circle at ${x * 100}% ${y * 100}%, ${c} 0%, transparent ${Math.round(r * 100)}%)`)
    .concat(def.base)
    .join(", ");
}

function paintMesh(ctx: CanvasRenderingContext2D, def: MeshDef, w: number, h: number): void {
  ctx.fillStyle = def.base;
  ctx.fillRect(0, 0, w, h);
  const span = Math.max(w, h);
  for (const [x, y, r, c] of def.blobs) {
    const g = ctx.createRadialGradient(x * w, y * h, 0, x * w, y * h, r * span);
    g.addColorStop(0, hexToRgba(c, 1));
    g.addColorStop(1, hexToRgba(c, 0));
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  }
}

function paintCoverImage(ctx: CanvasRenderingContext2D, img: HTMLImageElement, w: number, h: number): void {
  const scale = Math.max(w / img.naturalWidth, h / img.naturalHeight);
  const dw = img.naturalWidth * scale;
  const dh = img.naturalHeight * scale;
  ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);
}

// ── 3D mockup: perspective by mapping the shot onto a projected mesh ──
interface PerspParams { rx: number; ry: number; rz: number; zoom: number; panX: number; panY: number }
interface Pt { x: number; y: number }

function perspActive(p: PerspParams): boolean {
  return p.rx !== 0 || p.ry !== 0 || p.rz !== 0 || p.zoom !== 100 || p.panX !== 0 || p.panY !== 0;
}

function projectPoint(x: number, y: number, p: PerspParams, camD: number): Pt {
  const ax = (p.rx * Math.PI) / 180, ay = (p.ry * Math.PI) / 180, az = (p.rz * Math.PI) / 180;
  const y1 = y * Math.cos(ax), z1 = y * Math.sin(ax);
  const x2 = x * Math.cos(ay) + z1 * Math.sin(ay);
  const z2 = -x * Math.sin(ay) + z1 * Math.cos(ay);
  const x3 = x2 * Math.cos(az) - y1 * Math.sin(az);
  const y3 = x2 * Math.sin(az) + y1 * Math.cos(az);
  const k = camD / (camD - z2);
  return { x: x3 * k, y: y3 * k };
}

// Canvas 2D only does affine transforms, so a perspective quad is drawn as a
// grid of small triangles, each one mapped affinely from the flat texture.
function drawTexTri(ctx: CanvasRenderingContext2D, tex: CanvasImageSource, s: Pt[], d: Pt[]): void {
  const [s0, s1, s2] = s, [d0, d1, d2] = d;
  const u1x = s1.x - s0.x, u1y = s1.y - s0.y, u2x = s2.x - s0.x, u2y = s2.y - s0.y;
  const det = u1x * u2y - u2x * u1y;
  if (Math.abs(det) < 1e-9) return;
  const v1x = d1.x - d0.x, v1y = d1.y - d0.y, v2x = d2.x - d0.x, v2y = d2.y - d0.y;
  const a = (v1x * u2y - v2x * u1y) / det;
  const c = (u1x * v2x - u2x * v1x) / det;
  const b = (v1y * u2y - v2y * u1y) / det;
  const dd = (u1x * v2y - u2x * v1y) / det;
  const e = d0.x - a * s0.x - c * s0.y;
  const f = d0.y - b * s0.x - dd * s0.y;
  const mx = (d0.x + d1.x + d2.x) / 3, my = (d0.y + d1.y + d2.y) / 3;
  ctx.save();
  ctx.beginPath();
  [d0, d1, d2].forEach((q, i) => {
    const dx = q.x - mx, dy = q.y - my, len = Math.hypot(dx, dy) || 1;
    const px = q.x + (dx / len) * 1.2, py = q.y + (dy / len) * 1.2; // grow so neighbouring cells overlap and leave no seams
    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
  });
  ctx.closePath();
  ctx.clip();
  ctx.transform(a, b, c, dd, e, f);
  ctx.drawImage(tex, 0, 0);
  ctx.restore();
}

function drawPerspective(
  ctx: CanvasRenderingContext2D, tex: HTMLCanvasElement, cx: number, cy: number,
  p: PerspParams, availW: number, availH: number, shadow: { blur: number; opacity: number }
): void {
  const tw = tex.width, th = tex.height;
  const camD = Math.max(tw, th) * 2.4;
  const N = 24;
  const grid: Pt[][] = [];
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (let j = 0; j <= N; j++) {
    const row: Pt[] = [];
    for (let i = 0; i <= N; i++) {
      const q = projectPoint((i / N - 0.5) * tw, (j / N - 0.5) * th, p, camD);
      row.push(q);
      minX = Math.min(minX, q.x); maxX = Math.max(maxX, q.x);
      minY = Math.min(minY, q.y); maxY = Math.max(maxY, q.y);
    }
    grid.push(row);
  }
  // Never grow past the flat size on its own; the Zoom slider does the zooming.
  const fit = Math.min(1, availW / (maxX - minX), availH / (maxY - minY));
  const sc = fit * (p.zoom / 100);
  const ox = cx + (p.panX / 100) * availW - ((minX + maxX) / 2) * sc;
  const oy = cy + (p.panY / 100) * availH - ((minY + maxY) / 2) * sc;
  const D = grid.map((row) => row.map((q) => ({ x: ox + q.x * sc, y: oy + q.y * sc })));

  if (shadow.blur > 0 && shadow.opacity > 0) {
    // Draw the silhouette far off-canvas and shift only its shadow back, so the
    // black fill itself never shows through the screenshot's transparent rounded corners.
    const FAR = 20000;
    ctx.save();
    ctx.shadowColor = `rgba(0,0,0,${shadow.opacity / 100})`;
    ctx.shadowBlur = shadow.blur;
    ctx.shadowOffsetX = FAR;
    ctx.shadowOffsetY = Math.round(shadow.blur * 0.3);
    ctx.translate(-FAR, 0);
    ctx.fillStyle = "#000";
    ctx.beginPath();
    const edge: Pt[] = [];
    for (let i = 0; i <= N; i++) edge.push(D[0][i]);
    for (let j = 1; j <= N; j++) edge.push(D[j][N]);
    for (let i = N - 1; i >= 0; i--) edge.push(D[N][i]);
    for (let j = N - 1; j > 0; j--) edge.push(D[j][0]);
    edge.forEach((q, i) => (i === 0 ? ctx.moveTo(q.x, q.y) : ctx.lineTo(q.x, q.y)));
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  ctx.save();
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  for (let j = 0; j < N; j++) {
    for (let i = 0; i < N; i++) {
      const s00 = { x: (i / N) * tw, y: (j / N) * th }, s10 = { x: ((i + 1) / N) * tw, y: (j / N) * th };
      const s01 = { x: (i / N) * tw, y: ((j + 1) / N) * th }, s11 = { x: ((i + 1) / N) * tw, y: ((j + 1) / N) * th };
      drawTexTri(ctx, tex, [s00, s10, s01], [D[j][i], D[j][i + 1], D[j + 1][i]]);
      drawTexTri(ctx, tex, [s10, s11, s01], [D[j][i + 1], D[j + 1][i + 1], D[j + 1][i]]);
    }
  }
  ctx.restore();
}

// ── Progressive blur: stacked blur layers, each revealed through a gradient mask ──
interface ProgBlur { mode: "off" | "linear" | "radial"; dir: "top" | "bottom" | "left" | "right"; strength: number; scope: "inside" | "scene" }

function padReplicate(src: HTMLCanvasElement, m: number): HTMLCanvasElement {
  const w = src.width, h = src.height;
  const out = document.createElement("canvas");
  out.width = w + m * 2;
  out.height = h + m * 2;
  const c = out.getContext("2d")!;
  c.drawImage(src, m, m);
  c.drawImage(src, 0, 0, w, 1, m, 0, w, m);
  c.drawImage(src, 0, h - 1, w, 1, m, h + m, w, m);
  c.drawImage(src, 0, 0, 1, h, 0, m, m, h);
  c.drawImage(src, w - 1, 0, 1, h, w + m, m, m, h);
  c.drawImage(src, 0, 0, 1, 1, 0, 0, m, m);
  c.drawImage(src, w - 1, 0, 1, 1, w + m, 0, m, m);
  c.drawImage(src, 0, h - 1, 1, 1, 0, h + m, m, m);
  c.drawImage(src, w - 1, h - 1, 1, 1, w + m, h + m, m, m);
  return out;
}

function applyProgressiveBlur(
  oc: HTMLCanvasElement, pb: ProgBlur, bounds: { x: number; y: number; w: number; h: number; r: number }
): void {
  if (pb.mode === "off" || pb.strength <= 0) return;
  const W = oc.width, H = oc.height;
  const ctx = oc.getContext("2d")!;
  const base = document.createElement("canvas");
  base.width = W; base.height = H;
  base.getContext("2d")!.drawImage(oc, 0, 0);

  const B = pb.scope === "inside" ? bounds : { x: 0, y: 0, w: W, h: H, r: 0 };
  const steps = 4;
  const sizeScale = Math.max(1, Math.max(W, H) / 1000);

  for (let i = 1; i <= steps; i++) {
    const radius = pb.strength * (i / steps) * sizeScale;
    const pad = Math.ceil(radius * 3);
    const layer = document.createElement("canvas");
    layer.width = W; layer.height = H;
    const lc = layer.getContext("2d")!;
    lc.filter = `blur(${radius}px)`;
    if (pb.scope === "inside") {
      // sample only the screenshot itself, so the wallpaper can't bleed into its edges
      const bx = Math.max(0, Math.round(B.x)), by = Math.max(0, Math.round(B.y));
      const bw = Math.min(W - bx, Math.round(B.w)), bh = Math.min(H - by, Math.round(B.h));
      const crop = document.createElement("canvas");
      crop.width = bw; crop.height = bh;
      crop.getContext("2d")!.drawImage(base, bx, by, bw, bh, 0, 0, bw, bh);
      lc.drawImage(padReplicate(crop, pad), bx - pad, by - pad);
    } else {
      lc.drawImage(padReplicate(base, pad), -pad, -pad);
    }
    lc.filter = "none";

    // each deeper layer starts a little later and ramps over the same distance
    const start = 0.15 + ((i - 1) / steps) * 0.55;
    const end = Math.min(1, start + 0.3);
    let grad: CanvasGradient;
    if (pb.mode === "radial") {
      const mcx = B.x + B.w / 2, mcy = B.y + B.h / 2, R = Math.hypot(B.w, B.h) / 2;
      grad = lc.createRadialGradient(mcx, mcy, 0, mcx, mcy, R);
    } else if (pb.dir === "bottom") {
      grad = lc.createLinearGradient(0, B.y, 0, B.y + B.h);
    } else if (pb.dir === "top") {
      grad = lc.createLinearGradient(0, B.y + B.h, 0, B.y);
    } else if (pb.dir === "right") {
      grad = lc.createLinearGradient(B.x, 0, B.x + B.w, 0);
    } else {
      grad = lc.createLinearGradient(B.x + B.w, 0, B.x, 0);
    }
    grad.addColorStop(0, "rgba(0,0,0,0)");
    grad.addColorStop(start, "rgba(0,0,0,0)");
    grad.addColorStop(end, "rgba(0,0,0,1)");
    grad.addColorStop(1, "rgba(0,0,0,1)");
    lc.globalCompositeOperation = "destination-in";
    lc.fillStyle = grad;
    lc.fillRect(0, 0, W, H);

    ctx.save();
    if (pb.scope === "inside") {
      if (B.r > 0) roundedRect(ctx, B.x, B.y, B.w, B.h, B.r); else { ctx.beginPath(); ctx.rect(B.x, B.y, B.w, B.h); }
      ctx.clip();
    }
    ctx.drawImage(layer, 0, 0);
    ctx.restore();
  }
}

function paintWatermark(
  ctx: CanvasRenderingContext2D, outW: number, outH: number,
  wm: { text: string; size: number; opacity: number; pos: string; color: string }
): void {
  if (!wm.text) return;
  const px = Math.round(wm.size * Math.max(1, outW / 900));
  const margin = Math.round(px * 1.1);
  ctx.save();
  ctx.font = `600 ${px}px Archivo, -apple-system, 'Segoe UI', sans-serif`;
  ctx.globalAlpha = wm.opacity / 100;
  ctx.fillStyle = wm.color;
  ctx.shadowColor = "rgba(0,0,0,.35)";
  ctx.shadowBlur = Math.round(px * 0.25);
  const v = wm.pos[0], hz = wm.pos[1];
  ctx.textAlign = hz === "l" ? "left" : hz === "r" ? "right" : "center";
  ctx.textBaseline = v === "t" ? "top" : v === "b" ? "bottom" : "middle";
  const x = hz === "l" ? margin : hz === "r" ? outW - margin : outW / 2;
  const y = v === "t" ? margin : v === "b" ? outH - margin : outH / 2;
  ctx.fillText(wm.text, x, y);
  ctx.restore();
}

function setupBeautifier(): void {
  const panel = document.getElementById("beautifyPanel");
  const btn = document.getElementById("tool-beautify") as HTMLElement | null;
  if (!panel || !btn) return;

  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    beautifyActive = !beautifyActive;
    panel.classList.toggle("open", beautifyActive);
    btn.classList.toggle("active", beautifyActive);
    if (beautifyActive) {
      toolNameEl.textContent = "Screenshot Beautifier";
      if (!originalScreenshotUrl && backgroundImage) {
        const multiplier = imgNativeW > 0 ? imgNativeW / dispW : Math.max(1, 1 / fitScale);
        const savedZ = cssZoom;
        if (savedZ !== 1) applyContainerZoom(1);
        originalScreenshotUrl = canvas.toDataURL({ format: "png", quality: 1, multiplier } as any);
        if (savedZ !== 1) applyContainerZoom(savedZ);
      }
    }
  });

  // Built-in wallpapers (generated in code) join the same swatch system
  const meshGrid = document.getElementById("bf-mesh-grid");
  if (meshGrid) {
    for (const [id, def] of Object.entries(MESH_WALLPAPERS)) {
      const sw = document.createElement("div");
      sw.className = "bf-bg-swatch";
      sw.dataset.bg = `mesh:${id}`;
      sw.style.background = meshCss(def);
      sw.innerHTML = `<span class="tip">${def.name}</span>`;
      meshGrid.appendChild(sw);
    }
  }

  // Background swatches — click to immediately swap background on the original screenshot
  panel.querySelectorAll<HTMLElement>(".bf-bg-swatch").forEach((sw) => {
    sw.addEventListener("click", () => {
      panel.querySelectorAll(".bf-bg-swatch").forEach((s) => s.classList.remove("active"));
      sw.classList.add("active");
      applyBeautify(false);
    });
  });

  // Frame buttons — click to immediately swap/apply frame
  panel.querySelectorAll<HTMLElement>(".bf-frame-btn").forEach((b) => {
    b.addEventListener("click", () => {
      panel.querySelectorAll(".bf-frame-btn").forEach((x) => x.classList.remove("active"));
      b.classList.add("active");
      applyBeautify(false);
    });
  });

  // Ratio buttons — click to immediately apply ratio
  panel.querySelectorAll<HTMLElement>(".bf-ratio-btn").forEach((b) => {
    b.addEventListener("click", () => {
      panel.querySelectorAll(".bf-ratio-btn").forEach((x) => x.classList.remove("active"));
      b.classList.add("active");
      applyBeautify(false);
    });
  });

  // Slider value displays and auto-apply
  let beautifySliderDebounce: any = null;
  const sliders: [string, string, string][] = [
    ["bf-padding", "bf-padding-val", "px"],
    ["bf-radius", "bf-radius-val", "px"],
    ["bf-shadow", "bf-shadow-val", "px"],
    ["bf-shadow-opacity", "bf-shadow-opacity-val", "%"],
    ["bf-noise", "bf-noise-val", "%"],
    ["bf-border", "bf-border-val", "px"],
    ["bf-wm-size", "bf-wm-size-val", "px"],
    ["bf-wm-opacity", "bf-wm-opacity-val", "%"],
    ["bf-rx", "bf-rx-val", "°"],
    ["bf-ry", "bf-ry-val", "°"],
    ["bf-rz", "bf-rz-val", "°"],
    ["bf-zoom", "bf-zoom-val", "%"],
    ["bf-panx", "bf-panx-val", "%"],
    ["bf-pany", "bf-pany-val", "%"],
    ["bf-pb-strength", "bf-pb-strength-val", "px"],
  ];
  for (const [id, valId, suffix] of sliders) {
    const sl = document.getElementById(id) as HTMLInputElement;
    const vl = document.getElementById(valId);
    if (sl && vl) {
      sl.addEventListener("input", () => {
        vl.textContent = sl.value + suffix;
        if (originalScreenshotUrl) {
          clearTimeout(beautifySliderDebounce);
          beautifySliderDebounce = setTimeout(() => {
            applyBeautify(false);
          }, 150);
        }
      });
    }
  }

  // Text, colour and select inputs re-render the same way the sliders do
  for (const id of ["bf-border-color", "bf-wm-text", "bf-wm-color", "bf-wm-pos", "bf-pb-mode", "bf-pb-dir", "bf-pb-scope"]) {
    const el = document.getElementById(id);
    el?.addEventListener("input", () => {
      if (!originalScreenshotUrl) return;
      clearTimeout(beautifySliderDebounce);
      beautifySliderDebounce = setTimeout(() => applyBeautify(false), 200);
    });
  }

  // 3D mockup quick presets
  panel.querySelectorAll<HTMLElement>("#bf-persp-presets [data-p]").forEach((b) => {
    b.addEventListener("click", () => {
      const [rx, ry, rz] = (b.dataset.p || "0,0,0").split(",").map(Number);
      const set = (id: string, valId: string, v: number, suffix: string) => {
        const el = document.getElementById(id) as HTMLInputElement | null;
        if (el) el.value = String(v);
        const out = document.getElementById(valId);
        if (out) out.textContent = v + suffix;
      };
      set("bf-rx", "bf-rx-val", rx, "°");
      set("bf-ry", "bf-ry-val", ry, "°");
      set("bf-rz", "bf-rz-val", rz, "°");
      set("bf-zoom", "bf-zoom-val", 100, "%");
      set("bf-panx", "bf-panx-val", 0, "%");
      set("bf-pany", "bf-pany-val", 0, "%");
      if (originalScreenshotUrl) applyBeautify(false);
    });
  });

  // Nine-point alignment
  panel.querySelectorAll<HTMLElement>(".bf-align-btn").forEach((b) => {
    b.addEventListener("click", () => {
      panel.querySelectorAll(".bf-align-btn").forEach((x) => x.classList.remove("active"));
      b.classList.add("active");
      bfAlign = [parseFloat(b.dataset.ax || "0.5"), parseFloat(b.dataset.ay || "0.5")];
      if (originalScreenshotUrl) applyBeautify(false);
    });
  });

  // Your own background image
  const bgImgBtn = document.getElementById("bf-bg-image-btn");
  const bgImgInput = document.getElementById("bf-bg-image-input") as HTMLInputElement | null;
  bgImgBtn?.addEventListener("click", () => bgImgInput?.click());
  bgImgInput?.addEventListener("change", async () => {
    const file = bgImgInput.files?.[0];
    bgImgInput.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) { showToast("Choose an image file"); return; }
    if (file.size > 20 * 1024 * 1024) { showToast("That image is over 20 MB. Pick a smaller one."); return; }
    const url = await new Promise<string>((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(String(r.result));
      r.onerror = () => reject(r.error);
      r.readAsDataURL(file);
    }).catch(() => "");
    if (!url) { showToast("Couldn't read that image"); return; }
    customBgImg = await loadImageElement(url);
    let sw = panel.querySelector<HTMLElement>('.bf-bg-swatch[data-bg="custom-image"]');
    if (!sw) {
      sw = document.createElement("div");
      sw.className = "bf-bg-swatch";
      sw.dataset.bg = "custom-image";
      sw.innerHTML = '<span class="tip">Your image</span>';
      sw.addEventListener("click", () => {
        panel.querySelectorAll(".bf-bg-swatch").forEach((x) => x.classList.remove("active"));
        sw!.classList.add("active");
        applyBeautify(false);
      });
      document.getElementById("bf-mesh-grid")?.appendChild(sw);
    }
    sw.style.background = `center / cover url("${url}")`;
    panel.querySelectorAll(".bf-bg-swatch").forEach((x) => x.classList.remove("active"));
    sw.classList.add("active");
    if (originalScreenshotUrl || backgroundImage) applyBeautify(false);
  });

  // Apply
  document.getElementById("bf-apply-btn")?.addEventListener("click", () => applyBeautify(true));
  // Reset
  document.getElementById("bf-reset-btn")?.addEventListener("click", resetBeautify);
}

function loadImageElement(src: string): Promise<HTMLImageElement> {
  const img = new Image();
  img.src = src;
  return new Promise((resolve) => { img.onload = () => resolve(img); });
}

// Lays additional images out alongside the main screenshot (same height for
// a row, same width for a column) and flattens them into one canvas, which
// applyBeautify() then treats exactly like a single screenshot — background,
// padding, shadow, and frame all apply to the whole collage as one shape.
async function buildCollageComposite(
  mainImg: HTMLImageElement,
  extraDataUrls: string[],
  layout: "row" | "column",
  radius: number
): Promise<{ canvas: HTMLCanvasElement; w: number; h: number }> {
  const extraImgs = await Promise.all(extraDataUrls.map(loadImageElement));
  const allImgs = [mainImg, ...extraImgs];
  const gap = Math.round(Math.max(mainImg.naturalWidth, mainImg.naturalHeight) * 0.025) || 16;

  let tileSizes: { w: number; h: number }[];
  let totalW: number, totalH: number;

  if (layout === "row") {
    const targetH = mainImg.naturalHeight;
    tileSizes = allImgs.map((img) => {
      const scale = targetH / img.naturalHeight;
      return { w: Math.round(img.naturalWidth * scale), h: targetH };
    });
    totalW = tileSizes.reduce((sum, t) => sum + t.w, 0) + gap * (allImgs.length - 1);
    totalH = targetH;
  } else {
    const targetW = mainImg.naturalWidth;
    tileSizes = allImgs.map((img) => {
      const scale = targetW / img.naturalWidth;
      return { w: targetW, h: Math.round(img.naturalHeight * scale) };
    });
    totalW = targetW;
    totalH = tileSizes.reduce((sum, t) => sum + t.h, 0) + gap * (allImgs.length - 1);
  }

  const canvas = document.createElement("canvas");
  canvas.width = totalW;
  canvas.height = totalH;
  const ctx = canvas.getContext("2d")!;

  let cursor = 0;
  allImgs.forEach((img, i) => {
    const { w, h } = tileSizes[i];
    const x = layout === "row" ? cursor : 0;
    const y = layout === "row" ? 0 : cursor;
    ctx.save();
    if (radius > 0) {
      roundedRect(ctx, x, y, w, h, Math.min(radius, Math.min(w, h) / 2));
      ctx.clip();
    }
    ctx.drawImage(img, x, y, w, h);
    ctx.restore();
    cursor += (layout === "row" ? w : h) + gap;
  });

  return { canvas, w: totalW, h: totalH };
}

function renderCollageThumbs(): void {
  const container = document.getElementById("bf-collage-thumbs");
  const layoutRow = document.getElementById("bf-collage-layout-row");
  if (!container) return;
  container.innerHTML = "";

  collageImages.forEach((dataUrl, i) => {
    const thumb = document.createElement("div");
    thumb.className = "bf-collage-thumb";

    const img = document.createElement("img");
    img.src = dataUrl;

    const removeBtn = document.createElement("button");
    removeBtn.className = "bf-collage-thumb-remove";
    removeBtn.textContent = "×";
    removeBtn.addEventListener("click", () => {
      collageImages.splice(i, 1);
      renderCollageThumbs();
      if (originalScreenshotUrl) applyBeautify(false);
    });

    thumb.appendChild(img);
    thumb.appendChild(removeBtn);
    container.appendChild(thumb);
  });

  if (layoutRow) layoutRow.style.display = collageImages.length > 0 ? "flex" : "none";
}

function setupCollage(): void {
  const addBtn = document.getElementById("bf-collage-add-btn");
  const fileInput = document.getElementById("bf-collage-file-input") as HTMLInputElement | null;
  if (!addBtn || !fileInput) return;

  addBtn.addEventListener("click", () => fileInput.click());

  fileInput.addEventListener("change", async () => {
    const files = Array.from(fileInput.files || []);
    fileInput.value = "";
    if (!files.length || collageImages.length >= 2) return;

    const room = 2 - collageImages.length;
    const toRead = files.slice(0, room);
    const dataUrls = await Promise.all(
      toRead.map(
        (file) =>
          new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.readAsDataURL(file);
          })
      )
    );
    collageImages.push(...dataUrls);
    renderCollageThumbs();
    if (originalScreenshotUrl) applyBeautify(false);
  });

  document.querySelectorAll<HTMLElement>(".bf-collage-layout-btn").forEach((b) => {
    b.addEventListener("click", () => {
      document.querySelectorAll(".bf-collage-layout-btn").forEach((x) => x.classList.remove("active"));
      b.classList.add("active");
      collageLayout = b.dataset.collageLayout as "row" | "column";
      if (originalScreenshotUrl) applyBeautify(false);
    });
  });
}

interface BeautifyPreset {
  name: string;
  bg: string;
  padding: number;
  radius: number;
  shadow: number;
  shadowOpacity: number;
  noise: number;
  frame: string;
  // added in v1.1.3 — optional so presets saved by older versions still load
  border?: number;
  borderColor?: string;
  align?: [number, number];
  wm?: { text: string; size: number; opacity: number; pos: string; color: string };
  persp?: PerspParams;
  pb?: ProgBlur;
}

function readCurrentBeautifySettings(): Omit<BeautifyPreset, "name"> {
  const bgSwatch = document.querySelector<HTMLElement>(".bf-bg-swatch.active");
  return {
    bg: bgSwatch?.dataset.bg || "none",
    padding: parseInt((document.getElementById("bf-padding") as HTMLInputElement).value) || 0,
    radius: parseInt((document.getElementById("bf-radius") as HTMLInputElement).value) || 0,
    shadow: parseInt((document.getElementById("bf-shadow") as HTMLInputElement).value) || 0,
    shadowOpacity: parseInt((document.getElementById("bf-shadow-opacity") as HTMLInputElement).value) || 0,
    noise: parseInt((document.getElementById("bf-noise") as HTMLInputElement).value) || 0,
    frame: document.querySelector<HTMLElement>(".bf-frame-btn.active")?.dataset.frame || "none",
    border: parseInt((document.getElementById("bf-border") as HTMLInputElement).value) || 0,
    borderColor: (document.getElementById("bf-border-color") as HTMLInputElement).value,
    align: [...bfAlign] as [number, number],
    wm: {
      text: (document.getElementById("bf-wm-text") as HTMLInputElement).value.trim(),
      size: parseInt((document.getElementById("bf-wm-size") as HTMLInputElement).value) || 20,
      opacity: parseInt((document.getElementById("bf-wm-opacity") as HTMLInputElement).value) || 60,
      pos: (document.getElementById("bf-wm-pos") as HTMLSelectElement).value,
      color: (document.getElementById("bf-wm-color") as HTMLInputElement).value,
    },
    persp: {
      rx: parseInt((document.getElementById("bf-rx") as HTMLInputElement).value) || 0,
      ry: parseInt((document.getElementById("bf-ry") as HTMLInputElement).value) || 0,
      rz: parseInt((document.getElementById("bf-rz") as HTMLInputElement).value) || 0,
      zoom: parseInt((document.getElementById("bf-zoom") as HTMLInputElement).value) || 100,
      panX: parseInt((document.getElementById("bf-panx") as HTMLInputElement).value) || 0,
      panY: parseInt((document.getElementById("bf-pany") as HTMLInputElement).value) || 0,
    },
    pb: {
      mode: (document.getElementById("bf-pb-mode") as HTMLSelectElement).value as ProgBlur["mode"],
      dir: (document.getElementById("bf-pb-dir") as HTMLSelectElement).value as ProgBlur["dir"],
      strength: parseInt((document.getElementById("bf-pb-strength") as HTMLInputElement).value) || 20,
      scope: (document.getElementById("bf-pb-scope") as HTMLSelectElement).value as ProgBlur["scope"],
    },
  };
}

function applyBeautifyPreset(p: BeautifyPreset): void {
  const panel = document.getElementById("beautifyPanel");
  if (!panel) return;

  const swatch = panel.querySelector<HTMLElement>(`.bf-bg-swatch[data-bg="${CSS.escape(p.bg)}"]`);
  if (swatch) {
    panel.querySelectorAll(".bf-bg-swatch").forEach((s) => s.classList.remove("active"));
    swatch.classList.add("active");
  }
  const frameBtn = panel.querySelector<HTMLElement>(`.bf-frame-btn[data-frame="${CSS.escape(p.frame)}"]`);
  if (frameBtn) {
    panel.querySelectorAll(".bf-frame-btn").forEach((b) => b.classList.remove("active"));
    frameBtn.classList.add("active");
  }
  const setSlider = (id: string, valId: string, value: number, suffix: string) => {
    const sl = document.getElementById(id) as HTMLInputElement | null;
    const vl = document.getElementById(valId);
    if (sl) sl.value = String(value);
    if (vl) vl.textContent = value + suffix;
  };
  setSlider("bf-padding", "bf-padding-val", p.padding, "px");
  setSlider("bf-radius", "bf-radius-val", p.radius, "px");
  setSlider("bf-shadow", "bf-shadow-val", p.shadow, "px");
  setSlider("bf-shadow-opacity", "bf-shadow-opacity-val", p.shadowOpacity, "%");
  setSlider("bf-noise", "bf-noise-val", p.noise, "%");
  setSlider("bf-border", "bf-border-val", p.border ?? 0, "px");
  (document.getElementById("bf-border-color") as HTMLInputElement).value = p.borderColor || "#ffffff";

  const [ax, ay] = p.align || [0.5, 0.5];
  bfAlign = [ax, ay];
  panel.querySelectorAll<HTMLElement>(".bf-align-btn").forEach((b) =>
    b.classList.toggle("active", parseFloat(b.dataset.ax || "0.5") === ax && parseFloat(b.dataset.ay || "0.5") === ay));

  const wm = p.wm || { text: "", size: 20, opacity: 60, pos: "br", color: "#ffffff" };
  (document.getElementById("bf-wm-text") as HTMLInputElement).value = wm.text;
  (document.getElementById("bf-wm-color") as HTMLInputElement).value = wm.color;
  (document.getElementById("bf-wm-pos") as HTMLSelectElement).value = wm.pos;
  setSlider("bf-wm-size", "bf-wm-size-val", wm.size, "px");
  setSlider("bf-wm-opacity", "bf-wm-opacity-val", wm.opacity, "%");

  const pp = p.persp || { rx: 0, ry: 0, rz: 0, zoom: 100, panX: 0, panY: 0 };
  setSlider("bf-rx", "bf-rx-val", pp.rx, "°");
  setSlider("bf-ry", "bf-ry-val", pp.ry, "°");
  setSlider("bf-rz", "bf-rz-val", pp.rz, "°");
  setSlider("bf-zoom", "bf-zoom-val", pp.zoom, "%");
  setSlider("bf-panx", "bf-panx-val", pp.panX, "%");
  setSlider("bf-pany", "bf-pany-val", pp.panY, "%");
  const pbp = p.pb || { mode: "off", dir: "bottom", strength: 20, scope: "inside" };
  (document.getElementById("bf-pb-mode") as HTMLSelectElement).value = pbp.mode;
  (document.getElementById("bf-pb-dir") as HTMLSelectElement).value = pbp.dir;
  (document.getElementById("bf-pb-scope") as HTMLSelectElement).value = pbp.scope;
  setSlider("bf-pb-strength", "bf-pb-strength-val", pbp.strength, "px");

  if (p.bg === "custom-image" && !customBgImg) showToast("This preset used a custom image. Choose one with “+ Your image”.");

  applyBeautify(false);
}

function setupBeautifyPresets(): void {
  const select = document.getElementById("bf-preset-select") as HTMLSelectElement | null;
  const nameInput = document.getElementById("bf-preset-name") as HTMLInputElement | null;
  const saveBtn = document.getElementById("bf-preset-save-btn");
  if (!select || !nameInput || !saveBtn) return;

  function populate(presets: BeautifyPreset[]): void {
    select!.innerHTML = '<option value="">Custom</option>';
    for (const p of presets) {
      const opt = document.createElement("option");
      opt.value = p.name;
      opt.textContent = p.name;
      select!.appendChild(opt);
    }
  }

  chrome.storage.sync.get("beautifyPresets").then((res) => {
    populate((res.beautifyPresets as BeautifyPreset[]) || []);
  });

  select.addEventListener("change", async () => {
    if (!select.value) return;
    const res = await chrome.storage.sync.get("beautifyPresets");
    const presets = (res.beautifyPresets as BeautifyPreset[]) || [];
    const match = presets.find((p) => p.name === select.value);
    if (match) applyBeautifyPreset(match);
  });

  saveBtn.addEventListener("click", async () => {
    const name = nameInput.value.trim();
    if (!name) { showToast("Enter a preset name first"); return; }
    if (!backgroundImage) { showToast("Open Beautify with an image loaded first"); return; }

    const res = await chrome.storage.sync.get("beautifyPresets");
    const presets = (res.beautifyPresets as BeautifyPreset[]) || [];
    const newPreset: BeautifyPreset = { name, ...readCurrentBeautifySettings() };
    const existingIndex = presets.findIndex((p) => p.name === name);
    if (existingIndex >= 0) presets[existingIndex] = newPreset;
    else presets.push(newPreset);

    await chrome.storage.sync.set({ beautifyPresets: presets });
    populate(presets);
    select.value = name;
    nameInput.value = "";
    showToast(`Saved preset "${name}"`);
  });

  // ── Share presets as files ──
  const PRESET_FORMAT = "gofully-beautify-presets";
  const clampNum = (v: unknown, min: number, max: number, dflt: number): number => {
    const n = typeof v === "number" && Number.isFinite(v) ? v : dflt;
    return Math.min(max, Math.max(min, Math.round(n)));
  };
  const hexOr = (v: unknown, dflt: string): string => (typeof v === "string" && /^#[0-9a-fA-F]{6}$/.test(v) ? v : dflt);

  // Imported files are untrusted: rebuild each preset from known fields only,
  // clamped to the ranges the sliders allow, so nothing else can ride along.
  function sanitizePreset(raw: any): BeautifyPreset | null {
    if (!raw || typeof raw !== "object" || typeof raw.name !== "string") return null;
    const name = raw.name.trim().slice(0, 30);
    if (!name) return null;
    const bg = typeof raw.bg === "string" && raw.bg.length <= 200 ? raw.bg : "none";
    const frames = ["none", "macos", "browser", "windows", "phone"];
    const wmIn = raw.wm && typeof raw.wm === "object" ? raw.wm : {};
    const pIn = raw.persp && typeof raw.persp === "object" ? raw.persp : {};
    const pbIn = raw.pb && typeof raw.pb === "object" ? raw.pb : {};
    const positions = ["tl", "tc", "tr", "ml", "mc", "mr", "bl", "bc", "br"];
    const alignOk = Array.isArray(raw.align) && raw.align.length === 2 && raw.align.every((n: unknown) => n === 0 || n === 0.5 || n === 1);
    return {
      name, bg,
      padding: clampNum(raw.padding, 0, 120, 40),
      radius: clampNum(raw.radius, 0, 32, 12),
      shadow: clampNum(raw.shadow, 0, 80, 30),
      shadowOpacity: clampNum(raw.shadowOpacity, 0, 100, 40),
      noise: clampNum(raw.noise, 0, 50, 0),
      frame: frames.includes(raw.frame) ? raw.frame : "none",
      border: clampNum(raw.border, 0, 24, 0),
      borderColor: hexOr(raw.borderColor, "#ffffff"),
      align: alignOk ? [raw.align[0], raw.align[1]] : [0.5, 0.5],
      wm: {
        text: typeof wmIn.text === "string" ? wmIn.text.slice(0, 60) : "",
        size: clampNum(wmIn.size, 10, 64, 20),
        opacity: clampNum(wmIn.opacity, 10, 100, 60),
        pos: positions.includes(wmIn.pos) ? wmIn.pos : "br",
        color: hexOr(wmIn.color, "#ffffff"),
      },
      persp: {
        rx: clampNum(pIn.rx, -45, 45, 0), ry: clampNum(pIn.ry, -45, 45, 0), rz: clampNum(pIn.rz, -30, 30, 0),
        zoom: clampNum(pIn.zoom, 50, 150, 100), panX: clampNum(pIn.panX, -50, 50, 0), panY: clampNum(pIn.panY, -50, 50, 0),
      },
      pb: {
        mode: ["off", "linear", "radial"].includes(pbIn.mode) ? pbIn.mode : "off",
        dir: ["top", "bottom", "left", "right"].includes(pbIn.dir) ? pbIn.dir : "bottom",
        strength: clampNum(pbIn.strength, 2, 60, 20),
        scope: ["inside", "scene"].includes(pbIn.scope) ? pbIn.scope : "inside",
      },
    };
  }

  document.getElementById("bf-preset-export-btn")?.addEventListener("click", async () => {
    const res = await chrome.storage.sync.get("beautifyPresets");
    const presets = (res.beautifyPresets as BeautifyPreset[]) || [];
    if (!presets.length) { showToast("Save a preset first, then export it"); return; }
    const file = { format: PRESET_FORMAT, version: 1, exportedAt: new Date().toISOString(), presets };
    const url = URL.createObjectURL(new Blob([JSON.stringify(file, null, 2)], { type: "application/json" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "gofully-presets.gofullypreset";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
    showToast(`Exported ${presets.length} preset${presets.length === 1 ? "" : "s"}`);
  });

  const importInput = document.getElementById("bf-preset-import-input") as HTMLInputElement | null;
  document.getElementById("bf-preset-import-btn")?.addEventListener("click", () => importInput?.click());
  importInput?.addEventListener("change", async () => {
    const file = importInput.files?.[0];
    importInput.value = "";
    if (!file) return;
    if (file.size > 512 * 1024) { showToast("That file is too large to be a GoFully preset file"); return; }
    let parsed: any;
    try { parsed = JSON.parse(await file.text()); } catch { showToast("That isn't a valid preset file"); return; }
    if (!parsed || parsed.format !== PRESET_FORMAT || typeof parsed.version !== "number" || !Array.isArray(parsed.presets)) {
      showToast("That isn't a GoFully preset file"); return;
    }
    if (parsed.version > 1) { showToast("This file needs a newer GoFully. Update the extension to import it."); return; }
    const incoming = parsed.presets.slice(0, 50).map(sanitizePreset).filter((p: BeautifyPreset | null): p is BeautifyPreset => !!p);
    if (!incoming.length) { showToast("No usable presets in that file"); return; }
    const res = await chrome.storage.sync.get("beautifyPresets");
    const presets = (res.beautifyPresets as BeautifyPreset[]) || [];
    for (const p of incoming) {
      const i = presets.findIndex((x) => x.name === p.name);
      if (i >= 0) presets[i] = p; else presets.push(p);
    }
    try {
      await chrome.storage.sync.set({ beautifyPresets: presets.slice(0, 50) });
    } catch {
      showToast("Couldn't store those presets. Delete old ones to free space."); return;
    }
    populate(presets);
    showToast(`Imported ${incoming.length} preset${incoming.length === 1 ? "" : "s"}`);
  });
}

async function applyBeautify(showToastMsg = true): Promise<void> {
  if (!backgroundImage) { showToast("No image to beautify"); return; }

  // Save original if not saved yet
  if (!originalScreenshotUrl) {
    const multiplier = imgNativeW > 0 ? imgNativeW / dispW : Math.max(1, 1 / fitScale);
    const savedZ = cssZoom;
    if (savedZ !== 1) applyContainerZoom(1);
    originalScreenshotUrl = canvas.toDataURL({ format: "png", quality: 1, multiplier } as any);
    if (savedZ !== 1) applyContainerZoom(savedZ);
  }

  // Read settings
  const bgSwatch = document.querySelector<HTMLElement>(".bf-bg-swatch.active");
  const bgValue = bgSwatch?.dataset.bg || "none";
  const padding = parseInt((document.getElementById("bf-padding") as HTMLInputElement).value) || 0;
  const radius = parseInt((document.getElementById("bf-radius") as HTMLInputElement).value) || 0;
  const shadowBlur = parseInt((document.getElementById("bf-shadow") as HTMLInputElement).value) || 0;
  const shadowOpacity = parseInt((document.getElementById("bf-shadow-opacity") as HTMLInputElement).value) || 0;
  const noiseAmount = parseInt((document.getElementById("bf-noise") as HTMLInputElement).value) || 0;
  const frameType = document.querySelector<HTMLElement>(".bf-frame-btn.active")?.dataset.frame || "none";
  const ratioStr = document.querySelector<HTMLElement>(".bf-ratio-btn.active")?.dataset.ratio || "";
  const borderW = parseInt((document.getElementById("bf-border") as HTMLInputElement)?.value) || 0;
  const borderColor = (document.getElementById("bf-border-color") as HTMLInputElement)?.value || "#ffffff";
  const wm = {
    text: ((document.getElementById("bf-wm-text") as HTMLInputElement)?.value || "").trim(),
    size: parseInt((document.getElementById("bf-wm-size") as HTMLInputElement)?.value) || 20,
    opacity: parseInt((document.getElementById("bf-wm-opacity") as HTMLInputElement)?.value) || 60,
    pos: (document.getElementById("bf-wm-pos") as HTMLSelectElement)?.value || "br",
    color: (document.getElementById("bf-wm-color") as HTMLInputElement)?.value || "#ffffff",
  };
  const [alignX, alignY] = bfAlign;
  const numVal = (id: string, dflt: number) => {
    const v = parseInt((document.getElementById(id) as HTMLInputElement | null)?.value ?? "");
    return Number.isFinite(v) ? v : dflt;
  };
  const persp: PerspParams = {
    rx: numVal("bf-rx", 0), ry: numVal("bf-ry", 0), rz: numVal("bf-rz", 0),
    zoom: numVal("bf-zoom", 100), panX: numVal("bf-panx", 0), panY: numVal("bf-pany", 0),
  };
  const pb: ProgBlur = {
    mode: ((document.getElementById("bf-pb-mode") as HTMLSelectElement | null)?.value as ProgBlur["mode"]) || "off",
    dir: ((document.getElementById("bf-pb-dir") as HTMLSelectElement | null)?.value as ProgBlur["dir"]) || "bottom",
    strength: numVal("bf-pb-strength", 20),
    scope: ((document.getElementById("bf-pb-scope") as HTMLSelectElement | null)?.value as ProgBlur["scope"]) || "inside",
  };

  // ALWAYS use the original screenshot image as source to prevent nesting/stacking
  const srcDataUrl = originalScreenshotUrl;

  const mainImg = new Image();
  mainImg.src = srcDataUrl;
  await new Promise<void>((r) => { mainImg.onload = () => r(); });

  let srcImg: CanvasImageSource = mainImg;
  let srcW = mainImg.naturalWidth;
  let srcH = mainImg.naturalHeight;

  if (collageImages.length > 0) {
    const composite = await buildCollageComposite(mainImg, collageImages, collageLayout, radius);
    srcImg = composite.canvas;
    srcW = composite.w;
    srcH = composite.h;
  }

  // Frame bar height (in native pixels, scaled proportionally)
  const frameBarH = frameType !== "none" ? Math.round(Math.max(28, srcH * 0.035)) : 0;

  // Calculate output dimensions
  let outW = srcW + padding * 2;
  let outH = srcH + padding * 2 + frameBarH;

  // Apply aspect ratio
  if (ratioStr) {
    const ratio = parseFloat(ratioStr);
    if (ratio > 0) {
      const currentRatio = outW / outH;
      if (currentRatio > ratio) {
        outH = Math.round(outW / ratio);
      } else {
        outW = Math.round(outH * ratio);
      }
    }
  }

  // Build result on offscreen canvas
  const oc = document.createElement("canvas");
  oc.width = outW;
  oc.height = outH;
  const ctx = oc.getContext("2d")!;

  // Draw background
  if (bgValue === "none") {
    ctx.fillStyle = "transparent";
    ctx.clearRect(0, 0, outW, outH);
  } else if (bgValue.startsWith("linear-gradient")) {
    const colors = bgValue.match(/#[0-9a-fA-F]{6}/g) || ["#667eea", "#764ba2"];
    const grad = ctx.createLinearGradient(0, 0, outW, outH);
    grad.addColorStop(0, colors[0]);
    grad.addColorStop(1, colors[1] || colors[0]);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, outW, outH);
  } else if (bgValue === "pattern:dots") {
    ctx.fillStyle = "#1a1a2e";
    ctx.fillRect(0, 0, outW, outH);
    ctx.fillStyle = "rgba(255,255,255,.35)";
    const spacing = 22;
    for (let py = spacing / 2; py < outH; py += spacing) {
      for (let px = spacing / 2; px < outW; px += spacing) {
        ctx.beginPath();
        ctx.arc(px, py, 2.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  } else if (bgValue === "pattern:diagonal") {
    ctx.fillStyle = "#0c3483";
    ctx.fillRect(0, 0, outW, outH);
    ctx.strokeStyle = "rgba(255,255,255,.18)";
    ctx.lineWidth = 10;
    const step = 28;
    for (let sx = -outH; sx < outW; sx += step) {
      ctx.beginPath();
      ctx.moveTo(sx, outH);
      ctx.lineTo(sx + outH, 0);
      ctx.stroke();
    }
  } else if (bgValue.startsWith("mesh:") && MESH_WALLPAPERS[bgValue.slice(5)]) {
    paintMesh(ctx, MESH_WALLPAPERS[bgValue.slice(5)], outW, outH);
  } else if (bgValue === "custom-image") {
    if (customBgImg) paintCoverImage(ctx, customBgImg, outW, outH);
    else paintMesh(ctx, MESH_WALLPAPERS.aurora, outW, outH);
  } else {
    ctx.fillStyle = bgValue;
    ctx.fillRect(0, 0, outW, outH);
  }

  // Add noise texture
  if (noiseAmount > 0) {
    const imageData = ctx.getImageData(0, 0, outW, outH);
    const data = imageData.data;
    const intensity = noiseAmount * 2.55;
    for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() - 0.5) * intensity;
      data[i] += noise;
      data[i + 1] += noise;
      data[i + 2] += noise;
    }
    ctx.putImageData(imageData, 0, 0);
  }

  // Position screenshot centered with padding
  // The ratio can add free space around the padded shot; the nine-point
  // alignment decides where in that space it sits (centre = the old behaviour).
  const spareW = Math.max(0, outW - srcW - padding * 2);
  const spareH = Math.max(0, outH - srcH - frameBarH - padding * 2);
  const imgX = Math.round(padding + spareW * alignX);
  const imgY = Math.round(padding + spareH * alignY) + frameBarH;

  // The screenshot, its window frame and its border, drawn at (ix, iy) = the
  // screenshot's top-left. Used directly for a flat result, or onto a texture
  // that the 3D mockup maps through perspective.
  const drawShot = (c: CanvasRenderingContext2D, ix: number, iy: number): void => {
    c.save();
    if (radius > 0) {
      roundedRect(c, ix, iy, srcW, srcH, radius);
      c.clip();
    }
    c.drawImage(srcImg, ix, iy, srcW, srcH);
    c.restore();

    if (frameType === "macos") {
      drawMacFrame(c, ix, iy - frameBarH, srcW, frameBarH, radius);
    } else if (frameType === "browser") {
      drawBrowserFrame(c, ix, iy - frameBarH, srcW, frameBarH, radius);
    } else if (frameType === "windows") {
      drawWindowsFrame(c, ix, iy - frameBarH, srcW, frameBarH, radius);
    } else if (frameType === "phone") {
      drawPhoneFrame(c, ix, iy - frameBarH, srcW, frameBarH, radius);
    }

    if (borderW > 0) {
      c.save();
      c.strokeStyle = borderColor;
      c.lineWidth = borderW;
      const bx = ix - borderW / 2;
      const by = iy - frameBarH - borderW / 2;
      const bw = srcW + borderW;
      const bh = srcH + frameBarH + borderW;
      if (radius > 0) {
        roundedRect(c, bx, by, bw, bh, radius + borderW / 2);
        c.stroke();
      } else {
        c.strokeRect(bx, by, bw, bh);
      }
      c.restore();
    }
  };

  let blurBounds = { x: imgX, y: imgY - frameBarH, w: srcW, h: srcH + frameBarH, r: radius };

  if (perspActive(persp)) {
    const m = Math.ceil(borderW);
    const tex = document.createElement("canvas");
    tex.width = srcW + m * 2;
    tex.height = srcH + frameBarH + m * 2;
    drawShot(tex.getContext("2d")!, m, frameBarH + m);
    drawPerspective(
      ctx, tex, imgX + srcW / 2, imgY - frameBarH + (srcH + frameBarH) / 2, persp,
      outW - padding * 2, outH - padding * 2, { blur: shadowBlur, opacity: shadowOpacity }
    );
    blurBounds = { x: padding, y: padding, w: outW - padding * 2, h: outH - padding * 2, r: 0 };
  } else {
    if (shadowBlur > 0 && shadowOpacity > 0) {
      ctx.save();
      ctx.shadowColor = `rgba(0,0,0,${shadowOpacity / 100})`;
      ctx.shadowBlur = shadowBlur;
      ctx.shadowOffsetY = Math.round(shadowBlur * 0.3);
      if (radius > 0) {
        roundedRect(ctx, imgX, imgY, srcW, srcH, radius);
        ctx.fillStyle = "rgba(0,0,0,1)";
        ctx.fill();
      } else {
        ctx.fillStyle = "rgba(0,0,0,1)";
        ctx.fillRect(imgX, imgY, srcW, srcH);
      }
      ctx.restore();
    }
    drawShot(ctx, imgX, imgY);
  }

  applyProgressiveBlur(oc, pb, blurBounds);

  paintWatermark(ctx, outW, outH, wm);

  // Load result into editor
  const resultUrl = oc.toDataURL("image/png");
  await loadScreenshot(resultUrl, true);
  isBeautified = true;
  saveState();
  if (showToastMsg) showToast("Beautify applied");
}

function roundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function drawMacFrame(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, radius: number): void {
  ctx.save();
  // Frame background with top rounded corners
  ctx.beginPath();
  const r = Math.min(radius, 16);
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h);
  ctx.lineTo(x, y + h);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
  ctx.fillStyle = "#E5E5E7";
  ctx.fill();

  // Traffic light dots
  const dotR = Math.max(5, Math.round(h * 0.18));
  const dotY = y + h / 2;
  const dotStartX = x + Math.round(h * 0.55);
  const gap = Math.round(dotR * 2.8);

  const dots = [
    { cx: dotStartX, color: "#FF5F57" },
    { cx: dotStartX + gap, color: "#FEBC2E" },
    { cx: dotStartX + gap * 2, color: "#28C840" },
  ];

  for (const d of dots) {
    ctx.beginPath();
    ctx.arc(d.cx, dotY, dotR, 0, Math.PI * 2);
    ctx.fillStyle = d.color;
    ctx.fill();
  }
  ctx.restore();
}

function drawBrowserFrame(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, radius: number): void {
  ctx.save();
  // Frame background with top rounded corners
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h);
  ctx.lineTo(x, y + h);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
  ctx.fillStyle = "#F0F0F0";
  ctx.fill();

  // Traffic light dots (smaller)
  const dotR = Math.max(4, Math.round(h * 0.14));
  const dotY = y + h / 2;
  const dotStartX = x + Math.round(h * 0.5);
  const gap = Math.round(dotR * 2.8);

  const dots = [
    { color: "#FF5F57" },
    { color: "#FEBC2E" },
    { color: "#28C840" },
  ];
  for (let i = 0; i < dots.length; i++) {
    ctx.beginPath();
    ctx.arc(dotStartX + gap * i, dotY, dotR, 0, Math.PI * 2);
    ctx.fillStyle = dots[i].color;
    ctx.fill();
  }

  // URL bar
  const barH = Math.round(h * 0.5);
  const barY = y + (h - barH) / 2;
  const barX = dotStartX + gap * 3 + dotR * 2;
  const barW = w - (barX - x) - Math.round(h * 0.5);
  if (barW > 40) {
    ctx.fillStyle = "#FFFFFF";
    ctx.beginPath();
    const barR = barH / 2;
    ctx.moveTo(barX + barR, barY);
    ctx.lineTo(barX + barW - barR, barY);
    ctx.quadraticCurveTo(barX + barW, barY, barX + barW, barY + barR);
    ctx.quadraticCurveTo(barX + barW, barY + barH, barX + barW - barR, barY + barH);
    ctx.lineTo(barX + barR, barY + barH);
    ctx.quadraticCurveTo(barX, barY + barH, barX, barY + barR);
    ctx.quadraticCurveTo(barX, barY, barX + barR, barY);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#999";
    const fontSize = Math.round(barH * 0.6);
    ctx.font = `${fontSize}px -apple-system, sans-serif`;
    ctx.textBaseline = "middle";
    let displayUrl = "example.com";
    if (capturedPageUrl) {
      try {
        const parsed = new URL(capturedPageUrl);
        displayUrl = parsed.hostname + (parsed.pathname !== "/" ? parsed.pathname : "");
      } catch {
        displayUrl = capturedPageUrl.slice(0, 60);
      }
    }
    const prefix = capturedPageUrl?.startsWith("https") ? "🔒 " : "";
    let urlText = prefix + displayUrl;
    const maxUrlW = barW - 16;
    while (ctx.measureText(urlText).width > maxUrlW && urlText.length > 10) {
      urlText = urlText.slice(0, -2) + "…";
    }
    ctx.fillText(urlText, barX + 8, barY + barH / 2);
  }

  ctx.restore();
}

function drawWindowsFrame(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, radius: number): void {
  ctx.save();
  const r = Math.min(radius, 10);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h);
  ctx.lineTo(x, y + h);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
  ctx.fillStyle = "#F3F3F3";
  ctx.fill();

  // Minimize / maximize / close, right-aligned, Windows 11 style
  const iconSize = Math.max(9, Math.round(h * 0.3));
  const btnW = Math.round(h * 1.4);
  const iconY = y + h / 2;
  ctx.strokeStyle = "#333";
  ctx.lineWidth = Math.max(1, iconSize * 0.09);
  ctx.lineCap = "round";

  const closeX = x + w - btnW / 2 - Math.round(h * 0.2);
  ctx.beginPath();
  ctx.moveTo(closeX - iconSize / 2, iconY - iconSize / 2);
  ctx.lineTo(closeX + iconSize / 2, iconY + iconSize / 2);
  ctx.moveTo(closeX + iconSize / 2, iconY - iconSize / 2);
  ctx.lineTo(closeX - iconSize / 2, iconY + iconSize / 2);
  ctx.stroke();

  const maxX = closeX - btnW;
  ctx.strokeRect(maxX - iconSize / 2, iconY - iconSize / 2, iconSize, iconSize);

  const minX = maxX - btnW;
  ctx.beginPath();
  ctx.moveTo(minX - iconSize / 2, iconY + iconSize / 2);
  ctx.lineTo(minX + iconSize / 2, iconY + iconSize / 2);
  ctx.stroke();
  ctx.restore();
}

function drawPhoneFrame(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, radius: number): void {
  ctx.save();
  const r = Math.min(radius, 22);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h);
  ctx.lineTo(x, y + h);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
  ctx.fillStyle = "#0B0B0F";
  ctx.fill();

  // Centered pill notch, like a Dynamic Island
  const pillW = Math.round(w * 0.28);
  const pillH = Math.round(h * 0.4);
  const pillX = x + (w - pillW) / 2;
  const pillY = y + (h - pillH) / 2;
  const pillR = pillH / 2;
  ctx.fillStyle = "#000";
  ctx.beginPath();
  ctx.moveTo(pillX + pillR, pillY);
  ctx.lineTo(pillX + pillW - pillR, pillY);
  ctx.quadraticCurveTo(pillX + pillW, pillY, pillX + pillW, pillY + pillR);
  ctx.quadraticCurveTo(pillX + pillW, pillY + pillH, pillX + pillW - pillR, pillY + pillH);
  ctx.lineTo(pillX + pillR, pillY + pillH);
  ctx.quadraticCurveTo(pillX, pillY + pillH, pillX, pillY + pillR);
  ctx.quadraticCurveTo(pillX, pillY, pillX + pillR, pillY);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

async function resetBeautify(): Promise<void> {
  const panel = document.getElementById("beautifyPanel");
  if (originalScreenshotUrl) {
    const orig = originalScreenshotUrl;
    originalScreenshotUrl = null;
    await loadScreenshot(orig, true);
    isBeautified = false;
    if (panel) {
      panel.querySelectorAll(".bf-bg-swatch").forEach((s, idx) => s.classList.toggle("active", idx === 0));
      panel.querySelectorAll(".bf-frame-btn").forEach((s, idx) => s.classList.toggle("active", idx === 0));
      panel.querySelectorAll(".bf-ratio-btn").forEach((s, idx) => s.classList.toggle("active", idx === 0));
      const pad = document.getElementById("bf-padding") as HTMLInputElement;
      if (pad) { pad.value = "40"; const v = document.getElementById("bf-padding-val"); if (v) v.textContent = "40px"; }
      const rad = document.getElementById("bf-radius") as HTMLInputElement;
      if (rad) { rad.value = "12"; const v = document.getElementById("bf-radius-val"); if (v) v.textContent = "12px"; }
      const shd = document.getElementById("bf-shadow") as HTMLInputElement;
      if (shd) { shd.value = "30"; const v = document.getElementById("bf-shadow-val"); if (v) v.textContent = "30px"; }
      const opc = document.getElementById("bf-shadow-opacity") as HTMLInputElement;
      if (opc) { opc.value = "40"; const v = document.getElementById("bf-shadow-opacity-val"); if (v) v.textContent = "40%"; }
      const nse = document.getElementById("bf-noise") as HTMLInputElement;
      if (nse) { nse.value = "0"; const v = document.getElementById("bf-noise-val"); if (v) v.textContent = "0%"; }
      const setDefault = (id: string, valId: string, v: string, suffix: string) => {
        const el = document.getElementById(id) as HTMLInputElement | null;
        if (el) el.value = v;
        const out = document.getElementById(valId);
        if (out) out.textContent = v + suffix;
      };
      setDefault("bf-rx", "bf-rx-val", "0", "°");
      setDefault("bf-ry", "bf-ry-val", "0", "°");
      setDefault("bf-rz", "bf-rz-val", "0", "°");
      setDefault("bf-zoom", "bf-zoom-val", "100", "%");
      setDefault("bf-panx", "bf-panx-val", "0", "%");
      setDefault("bf-pany", "bf-pany-val", "0", "%");
      setDefault("bf-pb-strength", "bf-pb-strength-val", "20", "px");
      (document.getElementById("bf-pb-mode") as HTMLSelectElement).value = "off";
      (document.getElementById("bf-pb-dir") as HTMLSelectElement).value = "bottom";
      (document.getElementById("bf-pb-scope") as HTMLSelectElement).value = "inside";
      setDefault("bf-border", "bf-border-val", "0", "px");
      setDefault("bf-wm-size", "bf-wm-size-val", "20", "px");
      setDefault("bf-wm-opacity", "bf-wm-opacity-val", "60", "%");
      (document.getElementById("bf-border-color") as HTMLInputElement).value = "#ffffff";
      (document.getElementById("bf-wm-text") as HTMLInputElement).value = "";
      (document.getElementById("bf-wm-color") as HTMLInputElement).value = "#ffffff";
      (document.getElementById("bf-wm-pos") as HTMLSelectElement).value = "br";
      bfAlign = [0.5, 0.5];
      panel.querySelectorAll<HTMLElement>(".bf-align-btn").forEach((b) =>
        b.classList.toggle("active", b.dataset.ax === "0.5" && b.dataset.ay === "0.5"));
      collageImages = [];
      collageLayout = "row";
      panel.querySelectorAll(".bf-collage-layout-btn").forEach((s, idx) => s.classList.toggle("active", idx === 0));
      renderCollageThumbs();
    }
    saveState();
    showToast("Reset to original");
  } else {
    showToast("Nothing to reset");
  }
}

init();
setupBeautifier();
setupBeautifyPresets();
setupCollage();
