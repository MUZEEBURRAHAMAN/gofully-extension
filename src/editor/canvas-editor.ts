import {
  Canvas, FabricImage, Rect, Ellipse, Line, IText, Path, Group,
  Circle, FabricText, PencilBrush, FabricObject,
} from "fabric";
import Cropper from "cropperjs";
import { canvasRGBA } from "stackblur-canvas";
import { generatePDF } from "../export/pdf-generator";

type ToolType =
  | "select" | "arrow" | "rectangle" | "ellipse" | "callout" | "line"
  | "freedraw" | "text" | "spotlight" | "blur" | "step" | "crop";

type ArrowType = "straight" | "curved";
type BlurType = "glass" | "pixel" | "redact";

// ─── State ───────────────────────────────────────────────────────────────────

let canvas: Canvas;
let currentTool: ToolType = "select";
let currentArrowType: ArrowType = "straight";
let currentBlurType: BlurType = "glass";
let currentColor = "#EF4444";
let strokeWidth = 4;
let stepCounter = 1;
let drawStartX = 0, drawStartY = 0;
let isDrawing = false;
let tempShape: any = null;
let undoStack: string[] = [];
let redoStack: string[] = [];
let backgroundImage: FabricImage | null = null;
let fitScale = 1;
let imgNativeW = 0, imgNativeH = 0;
let dispW = 0, dispH = 0;
let cssZoom = 1;
let cropperInstance: Cropper | null = null;
let isBeautified = false;
let isCropped = false;

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
  setupColorPicker();
  setupStrokeControl();
  setupExportButtons();
  setupKeyboardShortcuts();
  setupCanvasEvents();

  // Fetch the screenshot from service worker
  try {
    const resp = await chrome.runtime.sendMessage({ type: "GET_CAPTURE_BLOB_URL" });
    const url: string | null = resp?.url ?? null;
    if (url && url.startsWith("data:image/")) {
      await loadScreenshot(url);
    } else {
      showToast("No image available — please capture first");
    }
  } catch {
    showToast("Could not load image from service worker");
  }

  saveState();
}

function setupDropdownMenus(): void {
  // Arrow dropdown toggle
  const arrowExpand = document.getElementById("arrow-expand");
  const arrowMenu = document.getElementById("arrow-menu");
  arrowExpand?.addEventListener("click", (e) => {
    e.stopPropagation();
    blurMenu?.classList.remove("show");
    exportDropMenu?.classList.remove("show");
    arrowMenu?.classList.toggle("show");
  });

  // Blur dropdown toggle
  const blurExpand = document.getElementById("blur-expand");
  const blurMenu = document.getElementById("blur-menu");
  blurExpand?.addEventListener("click", (e) => {
    e.stopPropagation();
    arrowMenu?.classList.remove("show");
    exportDropMenu?.classList.remove("show");
    blurMenu?.classList.toggle("show");
  });

  // Export dropdown toggle — use fixed positioning so toolbar z-index doesn't clip it
  const exportMenuBtn = document.getElementById("export-menu-btn");
  const exportDropMenu = document.getElementById("export-drop-menu");
  exportMenuBtn?.addEventListener("click", (e) => {
    e.stopPropagation();
    arrowMenu?.classList.remove("show");
    blurMenu?.classList.remove("show");
    const isOpen = exportDropMenu?.classList.contains("show");
    if (!isOpen && exportDropMenu && exportMenuBtn) {
      const r = exportMenuBtn.getBoundingClientRect();
      exportDropMenu.style.right = `${window.innerWidth - r.right}px`;
      exportDropMenu.style.top = `${r.bottom + 6}px`;
    }
    exportDropMenu?.classList.toggle("show");
  });
  // Close export menu after any item click (but not settings panel)
  exportDropMenu?.addEventListener("click", (e) => {
    const target = e.target as HTMLElement;
    if (!target.closest("#export-settings-panel")) {
      exportDropMenu.classList.remove("show");
    }
  });

  // Close menus on click outside
  document.addEventListener("click", () => {
    arrowMenu?.classList.remove("show");
    blurMenu?.classList.remove("show");
    document.getElementById("export-drop-menu")?.classList.remove("show");
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

  document.querySelectorAll(".tool-btn[data-tool]").forEach((btn) => {
    btn.classList.toggle("active", (btn as HTMLElement).dataset.tool === tool);
  });

  const names: Record<ToolType, string> = {
    select: "Select & Transform",
    arrow: "CleanShot Arrow",
    rectangle: "CleanShot Rounded Rectangle",
    ellipse: "Ellipse",
    callout: "Callout Speech Bubble",
    line: "Straight Line",
    freedraw: "Pen / Marker",
    text: "Text Annotation",
    spotlight: "CleanShot Spotlight",
    blur: "Blur / Redaction",
    step: "Step Number Counter",
    crop: "Crop & Resize Image",
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
    case "rectangle": case "blur": case "crop": case "callout": case "spotlight":
      shape.set({ originX: "left", originY: "top", left, top, width, height });
      break;
    case "ellipse":
      shape.set({ originX: "left", originY: "top", left, top, rx: width / 2, ry: height / 2 });
      break;
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
        strokeLineCap: "round",
        strokeLineJoin: "round",
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
        strokeLineJoin: "round",
      }
    );

    const group = new Group([curvePath, head], {
      selectable: false,
      evented: false,
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
      strokeLineJoin: "round",
    }
  );

  const group = new Group([line, head], {
    selectable: false,
    evented: false,
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
    showToast("Blur failed — try again");
  }
}

// ─── Crop (Cropper.js modal — CleanShot X style) ─────────────────────────────

function openCropModal(): void {
  const modal    = document.getElementById("cropModal")!;
  const img      = document.getElementById("cropImg") as HTMLImageElement;
  const sizeEl   = document.getElementById("cropSizeDisplay")!;
  const posEl    = document.getElementById("cropPosDisplay")!;

  const multiplier = Math.max(1, 1 / fitScale);
  const dataUrl = canvas.toDataURL({ format: "png", quality: 1, multiplier });

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
  if (!cropperInstance) return;
  const data = cropperInstance.getData(true);
  if (!data.width || !data.height || data.width < 4 || data.height < 4) {
    document.getElementById("cropSizeDisplay")!.textContent = "Draw a selection first";
    return;
  }
  const croppedCanvas = cropperInstance.getCroppedCanvas({
    imageSmoothingEnabled: true,
    imageSmoothingQuality: "high",
  });
  if (!croppedCanvas) { showToast("Crop failed — try again"); return; }
  const resultDataUrl = croppedCanvas.toDataURL("image/png");

  if (cropperInstance) { cropperInstance.destroy(); cropperInstance = null; }
  const modal = document.getElementById("cropModal")!;
  const img   = document.getElementById("cropImg") as HTMLImageElement;
  modal.style.display = "none";
  img.src = "";

  loadScreenshot(resultDataUrl, true).then(() => {
    isCropped = true;
    setTool("select");
    saveState();
    showToast("Cropped successfully");
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

function setupColorPicker(): void {
  document.querySelectorAll(".color-swatch").forEach((swatch) => {
    swatch.addEventListener("click", () => {
      document.querySelectorAll(".color-swatch").forEach((s) => s.classList.remove("active"));
      swatch.classList.add("active");
      currentColor = (swatch as HTMLElement).dataset.color!;

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
    });
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

  // Clean export (or no annotations) of an UNMODIFIED screenshot: bypass Fabric entirely — zero quality loss
  if (!isImageModified && !hasAnnotations) {
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
    // Fallback to Fabric if SW returns nothing
  }

  // Annotated or modified (Beautified / Cropped) export: render via Fabric at the resolved export multiplier —
  // native resolution, or upscaled further when Quality is set to 1080p HD
  // or 4K UHD and native resolution doesn't already meet that target.
  const multiplier = getExportMultiplier();

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

  if (clean && hasAnnotations) {
    annotations.forEach((o) => o.set("visible", true));
    canvas.renderAll();
  }

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

  document.getElementById("copy-btn")!.addEventListener("click", async () => {
    try {
      const blob = await exportToBlob();
      await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
      showToast("Copied to clipboard");
    } catch { showToast("Copy failed — try Save PNG instead"); }
  });

  document.getElementById("save-btn")!.addEventListener("click", async () => {
    const blob = await exportToBlob();
    const url  = URL.createObjectURL(blob);
    const a    = Object.assign(document.createElement("a"), { href: url, download: `gofully-${Date.now()}.png` });
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
    showToast("PNG saved");
  });

  document.getElementById("pdf-btn")!.addEventListener("click", async () => {
    try {
      const blob = await exportToBlob();
      const pdfBlob = await generatePDF(blob, "a4");
      const url = URL.createObjectURL(pdfBlob);
      const a = Object.assign(document.createElement("a"), { href: url, download: `gofully-${Date.now()}.pdf` });
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 5000);
      showToast("PDF saved");
    } catch { showToast("PDF failed"); }
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

  document.getElementById("save-webp-btn")?.addEventListener("click", async () => {
    const pngBlob = await exportToBlob();
    const bitmap = await createImageBitmap(pngBlob);
    const dims = getResizeDims();
    const ow = dims?.w ?? bitmap.width;
    const oh = dims?.h ?? bitmap.height;
    const oc = new OffscreenCanvas(ow, oh);
    oc.getContext("2d")!.drawImage(bitmap, 0, 0, ow, oh);
    const webpBlob = await oc.convertToBlob({ type: "image/webp", quality: 0.92 });
    const url = URL.createObjectURL(webpBlob);
    const a = Object.assign(document.createElement("a"), { href: url, download: `gofully-${Date.now()}.webp` });
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
    showToast("WebP saved");
  });


  document.getElementById("undo-btn")!.addEventListener("click",   undo);
  document.getElementById("redo-btn")!.addEventListener("click",   redo);
  document.getElementById("delete-btn")!.addEventListener("click", deleteSelected);
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
  document.getElementById("done-btn")?.addEventListener("click", () => window.close());

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
  cssZoom = Math.min(5.0, Math.max(0.1, Math.round((cssZoom + delta) * 100) / 100));
  applyContainerZoom(cssZoom);
  const zStr = `${Math.round(cssZoom * 100)}%`;
  zoomEl.textContent = zStr;
  const hdrZoomVal = document.getElementById("hdr-zoom-val");
  if (hdrZoomVal) hdrZoomVal.textContent = zStr;
}

// ─── Undo / redo / delete ─────────────────────────────────────────────────────

function saveState(): void {
  undoStack.push(JSON.stringify(canvas.toJSON()));
  redoStack = [];
  if (undoStack.length > 50) undoStack.shift();
}

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

function undo(): void {
  if (undoStack.length <= 1) return;
  redoStack.push(undoStack.pop()!);
  canvas.loadFromJSON(undoStack[undoStack.length - 1]).then(() => {
    backgroundImage = findBackgroundImage();
    if (backgroundImage) backgroundImage.set({ selectable: false, evented: false });
    restoreObjectInteractivity();
    canvas.renderAll();
  });
}

function redo(): void {
  if (!redoStack.length) return;
  const next = redoStack.pop()!;
  undoStack.push(next);
  canvas.loadFromJSON(next).then(() => {
    backgroundImage = findBackgroundImage();
    if (backgroundImage) backgroundImage.set({ selectable: false, evented: false });
    restoreObjectInteractivity();
    canvas.renderAll();
  });
}

function deleteSelected(): void {
  canvas.getActiveObjects().forEach((o) => { if (o !== backgroundImage) canvas.remove(o); });
  canvas.discardActiveObject();
  canvas.renderAll();
  saveState();
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

    if (!e.metaKey && !e.ctrlKey && !e.shiftKey) {
      const map: Record<string, ToolType> = {
        v: "select", a: "arrow", r: "rectangle", e: "ellipse",
        c: "callout", l: "line", p: "freedraw", t: "text",
        s: "spotlight", b: "blur", n: "step", x: "crop",
      };
      if (map[e.key]) setTool(map[e.key]);
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
        originalScreenshotUrl = canvas.toDataURL({ format: "png", quality: 1, multiplier } as any);
      }
    }
  });

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

  // Apply
  document.getElementById("bf-apply-btn")?.addEventListener("click", () => applyBeautify(true));
  // Reset
  document.getElementById("bf-reset-btn")?.addEventListener("click", resetBeautify);
}

async function applyBeautify(showToastMsg = true): Promise<void> {
  if (!backgroundImage) { showToast("No image to beautify"); return; }

  // Save original if not saved yet
  if (!originalScreenshotUrl) {
    const multiplier = imgNativeW > 0 ? imgNativeW / dispW : Math.max(1, 1 / fitScale);
    originalScreenshotUrl = canvas.toDataURL({ format: "png", quality: 1, multiplier } as any);
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

  // ALWAYS use the original screenshot image as source to prevent nesting/stacking
  const srcDataUrl = originalScreenshotUrl;

  const srcImg = new Image();
  srcImg.src = srcDataUrl;
  await new Promise<void>((r) => { srcImg.onload = () => r(); });

  const srcW = srcImg.naturalWidth;
  const srcH = srcImg.naturalHeight;

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
  const imgX = Math.round((outW - srcW) / 2);
  const imgY = Math.round((outH - srcH - frameBarH) / 2) + frameBarH;

  // Draw shadow
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

  // Draw screenshot with rounded corners
  ctx.save();
  if (radius > 0) {
    roundedRect(ctx, imgX, imgY, srcW, srcH, radius);
    ctx.clip();
  }
  ctx.drawImage(srcImg, imgX, imgY, srcW, srcH);
  ctx.restore();

  // Draw window frame
  if (frameType === "macos") {
    drawMacFrame(ctx, imgX, imgY - frameBarH, srcW, frameBarH, radius);
  } else if (frameType === "browser") {
    drawBrowserFrame(ctx, imgX, imgY - frameBarH, srcW, frameBarH, radius);
  }

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

    // Lock icon + placeholder URL text
    ctx.fillStyle = "#999";
    ctx.font = `${Math.round(barH * 0.6)}px -apple-system, sans-serif`;
    ctx.textBaseline = "middle";
    ctx.fillText("🔒 example.com", barX + 8, barY + barH / 2);
  }

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
    }
    saveState();
    showToast("Reset to original");
  } else {
    showToast("Nothing to reset");
  }
}

init();
setupBeautifier();
