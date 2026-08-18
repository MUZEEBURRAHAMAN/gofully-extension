import {
  Canvas, FabricImage, Rect, Ellipse, Line, IText, Path, Group,
  Circle, FabricText, PencilBrush,
} from "fabric";

type ToolType =
  | "select" | "arrow" | "rectangle" | "ellipse" | "line"
  | "freedraw" | "text" | "highlight" | "blur" | "step" | "crop";

// ─── State ───────────────────────────────────────────────────────────────────

let canvas: Canvas;
let currentTool: ToolType = "select";
let currentColor = "#ef4444";
let strokeWidth = 3;
let stepCounter = 1;
let drawStartX = 0, drawStartY = 0;
let isDrawing = false;
let tempShape: any = null;
let cropShape: Rect | null = null;
let undoStack: string[] = [];
let redoStack: string[] = [];
let backgroundImage: FabricImage | null = null;
let fitScale = 1;
let imgNativeW = 0, imgNativeH = 0;
let dispW = 0, dispH = 0;
let cssZoom = 1;

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

  setupTools();
  setupColorPicker();
  setupStrokeControl();
  setupExportButtons();
  setupKeyboardShortcuts();
  setupCanvasEvents();

  // Fetch the screenshot from service worker (avoids putting multi-MB data URL
  // in the browser URL bar / history).
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

// ─── Screenshot loading ───────────────────────────────────────────────────────

async function loadScreenshot(url: string): Promise<void> {
  // Security: only accept data:image/ URIs, never external URLs.
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
    const avH = window.innerHeight - 44 - 28 - 80;
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
    });
    canvas.add(img);
    canvas.sendObjectToBack(img);
    canvas.renderAll();

    backgroundImage = img;
    dimensionsEl.textContent = `${nw} × ${nh}`;
    zoomEl.textContent = "100%";

    applyContainerZoom(1);
  } catch (e) {
    console.error("Failed to load screenshot:", e);
    showToast("Failed to load image");
  }
}

function applyContainerZoom(z: number): void {
  cssZoom = z;
  const canvasEl  = canvas.getElement();
  const container = canvasEl.parentElement as HTMLElement | null;
  if (!container) return;
  canvasEl.style.transform = "";
  container.style.zoom = String(z);
}

// ─── Tool setup ──────────────────────────────────────────────────────────────

function setupTools(): void {
  document.querySelectorAll(".tool-btn[data-tool]").forEach((btn) => {
    btn.addEventListener("click", () => setTool((btn as HTMLElement).dataset.tool as ToolType));
  });
}

function setTool(tool: ToolType): void {
  // Re-clicking crop while a selection exists → apply
  if (tool === "crop" && currentTool === "crop" && cropShape) {
    applyCrop();
    return;
  }

  // Cancel any in-progress draw when switching tools
  if (isDrawing) {
    if (tempShape) { canvas.remove(tempShape); tempShape = null; }
    isDrawing = false;
  }
  if (currentTool === "crop" && tool !== "crop") cancelCrop();

  currentTool = tool;

  document.querySelectorAll(".tool-btn[data-tool]").forEach((btn) => {
    btn.classList.toggle("active", (btn as HTMLElement).dataset.tool === tool);
  });

  const names: Record<ToolType, string> = {
    select: "Select", arrow: "Arrow", rectangle: "Rectangle", ellipse: "Ellipse",
    line: "Line", freedraw: "Pen", text: "Text", highlight: "Highlight",
    blur: "Blur / Redact", step: "Step Number",
    crop: "Crop — drag area, press Enter or click Crop again to apply",
  };
  toolNameEl.textContent = names[tool] || tool;

  // Non-select modes: disable interaction on all annotation objects so
  // Fabric.js cannot accidentally move them while drawing.
  const isSelect = tool === "select";
  canvas.getObjects().forEach((obj) => {
    if (obj === backgroundImage) return;
    obj.selectable = isSelect;
    obj.evented    = isSelect;
  });
  if (!isSelect) canvas.discardActiveObject();

  canvas.selection     = isSelect;

  // Pencil brush must exist before setting isDrawingMode = true
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

// ─── Canvas events ────────────────────────────────────────────────────────────

function setupCanvasEvents(): void {

  canvas.on("mouse:down", (e: any) => {
    if (currentTool === "select" || currentTool === "freedraw") return;

    const pt = getScenePoint(e);
    drawStartX = pt.x;
    drawStartY = pt.y;
    isDrawing  = true;

    if (currentTool === "text")  { addText(pt.x, pt.y);       isDrawing = false; return; }
    if (currentTool === "step")  { addStepNumber(pt.x, pt.y); isDrawing = false; return; }
    if (currentTool === "crop")  {
      if (cropShape) { canvas.remove(cropShape); cropShape = null; }
    }

    tempShape = createShape(currentTool, pt.x, pt.y);
    if (tempShape) canvas.add(tempShape);
  });

  canvas.on("mouse:move", (e: any) => {
    if (!isDrawing || !tempShape) return;
    const pt = getScenePoint(e);
    updateShape(tempShape, currentTool, drawStartX, drawStartY, pt.x, pt.y);
    canvas.requestRenderAll();
  });

  canvas.on("mouse:up", (e: any) => {
    if (!isDrawing) return;
    isDrawing = false;
    if (!tempShape) return;

    const pt = getScenePoint(e);
    updateShape(tempShape, currentTool, drawStartX, drawStartY, pt.x, pt.y);

    const w = Math.abs((tempShape.width  || 0) * (tempShape.scaleX || 1));
    const h = Math.abs((tempShape.height || 0) * (tempShape.scaleY || 1));

    if (currentTool === "crop") {
      if (w < 4 || h < 4) { canvas.remove(tempShape); tempShape = null; return; }
      cropShape = tempShape as Rect;
      tempShape = null;
      showToast("Crop: press Enter or click Crop again to apply, Esc to cancel");
      canvas.renderAll();
      return;
    }

    if (currentTool === "arrow") {
      finaliseArrow(tempShape as Line);
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

    tempShape.setCoords();
    canvas.renderAll();
    saveState();
    tempShape = null;
  });

  canvas.on("path:created",    saveState);
  canvas.on("object:modified", saveState);

  // ── Crop overlay: darken the area outside the crop selection ──────────────
  // Drawn directly onto the lower canvas after each render pass so it never
  // appears in exported images (crop shape is removed before toDataURL).
  canvas.on("after:render", () => {
    const shape = cropShape ?? (currentTool === "crop" && isDrawing ? tempShape : null);
    if (!shape) return;

    const dpr = canvas.getRetinaScaling();
    const el  = canvas.getElement() as HTMLCanvasElement;
    const ctx = el.getContext("2d");
    if (!ctx) return;

    // After Fabric.js calls ctx.restore(), the context is back to identity
    // transform (device pixel coordinates = logical * dpr).
    const cw = el.width;
    const ch = el.height;

    const l = (shape.left ?? 0) * dpr;
    const t = (shape.top  ?? 0) * dpr;
    const w = (shape.width  ?? 0) * (shape.scaleX ?? 1) * dpr;
    const h = (shape.height ?? 0) * (shape.scaleY ?? 1) * dpr;

    // Clamp to canvas bounds
    const x0 = Math.max(0, l);
    const y0 = Math.max(0, t);
    const x1 = Math.min(l + w, cw);
    const y1 = Math.min(t + h, ch);

    ctx.save();
    ctx.fillStyle = "rgba(0,0,0,0.52)";
    ctx.fillRect(0,  0,  cw, y0);            // top strip
    ctx.fillRect(0,  y1, cw, ch - y1);       // bottom strip
    ctx.fillRect(0,  y0, x0, y1 - y0);       // left strip
    ctx.fillRect(x1, y0, cw - x1, y1 - y0); // right strip

    // Rule-of-thirds guide lines inside the crop
    ctx.strokeStyle = "rgba(255,255,255,0.28)";
    ctx.lineWidth   = 1;
    ctx.setLineDash([]);
    const sw = x1 - x0, sh = y1 - y0;
    for (let i = 1; i < 3; i++) {
      // vertical
      ctx.beginPath();
      ctx.moveTo(x0 + sw * i / 3, y0);
      ctx.lineTo(x0 + sw * i / 3, y1);
      ctx.stroke();
      // horizontal
      ctx.beginPath();
      ctx.moveTo(x0, y0 + sh * i / 3);
      ctx.lineTo(x1, y0 + sh * i / 3);
      ctx.stroke();
    }
    ctx.restore();
  });
}

// ─── Shape factory ────────────────────────────────────────────────────────────

function createShape(tool: ToolType, x: number, y: number): any {
  const sw = Math.max(1, strokeWidth);
  switch (tool) {
    case "rectangle":
      return new Rect({
        left: x, top: y, width: 0, height: 0,
        fill: "transparent", stroke: currentColor,
        strokeWidth: sw, strokeUniform: true,
        selectable: false, evented: false,
      });
    case "ellipse":
      return new Ellipse({
        left: x, top: y, rx: 0, ry: 0,
        fill: "transparent", stroke: currentColor,
        strokeWidth: sw, strokeUniform: true,
        selectable: false, evented: false,
      });
    case "line":
      return new Line([x, y, x, y], {
        stroke: currentColor, strokeWidth: sw, strokeUniform: true,
        selectable: false, evented: false,
      });
    case "arrow":
      return new Line([x, y, x, y], {
        stroke: currentColor, strokeWidth: sw, strokeUniform: true,
        selectable: false, evented: false,
      });
    case "highlight":
      return new Rect({
        left: x, top: y, width: 0, height: 0,
        fill: currentColor, opacity: 0.3, stroke: "", strokeWidth: 0,
        selectable: false, evented: false,
      });
    case "blur":
      return new Rect({
        left: x, top: y, width: 0, height: 0,
        fill: "rgba(100,100,100,0.4)", stroke: "rgba(255,255,255,0.6)",
        strokeWidth: 1.5, strokeUniform: true, strokeDashArray: [6, 4],
        selectable: false, evented: false,
      });
    case "crop":
      return new Rect({
        left: x, top: y, width: 0, height: 0,
        fill: "transparent", stroke: "#FFFFFF",
        strokeWidth: 1.5, strokeUniform: true,
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
  const width  = Math.abs(x2 - x1);
  const height = Math.abs(y2 - y1);

  switch (tool) {
    case "rectangle": case "highlight": case "blur": case "crop":
      shape.set({ left, top, width, height });
      break;
    case "ellipse":
      shape.set({ left, top, rx: width / 2, ry: height / 2 });
      break;
    case "line": case "arrow":
      shape.set({ x1, y1, x2, y2 });
      break;
  }
  shape.setCoords();
}

// ─── Arrow ────────────────────────────────────────────────────────────────────

function finaliseArrow(line: Line): void {
  const [x1, y1, x2, y2] = [
    line.get("x1") as number, line.get("y1") as number,
    line.get("x2") as number, line.get("y2") as number,
  ];
  const dx = x2 - x1, dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len < 5) { canvas.remove(line); return; }

  const sw     = Math.max(1, strokeWidth);
  const hs     = Math.max(sw * 4, 10);
  const angle  = Math.atan2(dy, dx);
  const spread = Math.PI / 6;

  const head = new Path(
    `M ${x2} ${y2} ` +
    `L ${x2 - hs * Math.cos(angle - spread)} ${y2 - hs * Math.sin(angle - spread)} ` +
    `L ${x2 - hs * Math.cos(angle + spread)} ${y2 - hs * Math.sin(angle + spread)} Z`,
    { fill: currentColor, stroke: "" }
  );

  const group = new Group([line, head], { selectable: false, evented: false });
  canvas.remove(line);
  canvas.add(group);
  group.setCoords();
  canvas.renderAll();
  saveState();
}

// ─── Blur ─────────────────────────────────────────────────────────────────────

async function finaliseBlur(placeholder: any): Promise<void> {
  const l = placeholder.left ?? 0;
  const t = placeholder.top  ?? 0;
  const w = (placeholder.width  ?? 0) * (placeholder.scaleX ?? 1);
  const h = (placeholder.height ?? 0) * (placeholder.scaleY ?? 1);

  if (!backgroundImage || w < 2 || h < 2) { canvas.remove(placeholder); return; }

  try {
    const bgEl = backgroundImage.getElement() as HTMLImageElement;

    const nx = Math.round(l / fitScale), ny = Math.round(t / fitScale);
    const nw = Math.max(1, Math.round(w / fitScale)), nh = Math.max(1, Math.round(h / fitScale));
    const cx = Math.max(0, Math.min(nx, bgEl.naturalWidth  - 1));
    const cy = Math.max(0, Math.min(ny, bgEl.naturalHeight - 1));
    const cw = Math.max(1, Math.min(nw, bgEl.naturalWidth  - cx));
    const ch = Math.max(1, Math.min(nh, bgEl.naturalHeight - cy));

    const blockSize = 12;
    const bw = Math.max(1, Math.round(cw / blockSize));
    const bh = Math.max(1, Math.round(ch / blockSize));

    const small = document.createElement("canvas");
    small.width = bw; small.height = bh;
    const sc = small.getContext("2d")!;
    sc.imageSmoothingEnabled = false;
    sc.drawImage(bgEl, cx, cy, cw, ch, 0, 0, bw, bh);

    const big = document.createElement("canvas");
    big.width = Math.round(w); big.height = Math.round(h);
    const bc = big.getContext("2d")!;
    bc.imageSmoothingEnabled = false;
    bc.drawImage(small, 0, 0, bw, bh, 0, 0, big.width, big.height);

    const img = await FabricImage.fromURL(big.toDataURL("image/png"));
    img.set({ left: l, top: t, originX: "left", originY: "top", selectable: false, evented: false });
    canvas.remove(placeholder);
    canvas.add(img);
    img.setCoords();
    canvas.renderAll();
    saveState();
  } catch (err) {
    console.error("Blur failed:", err);
    canvas.remove(placeholder);
    canvas.renderAll();
    showToast("Blur failed — try again");
  }
}

// ─── Crop ─────────────────────────────────────────────────────────────────────

function cancelCrop(): void {
  if (cropShape) { canvas.remove(cropShape); cropShape = null; }
  if (tempShape) { canvas.remove(tempShape); tempShape = null; }
  isDrawing = false;
  canvas.renderAll();
}

async function applyCrop(): Promise<void> {
  if (!cropShape || !backgroundImage) { showToast("Draw a crop area first"); return; }

  const rawL = cropShape.left ?? 0, rawT = cropShape.top ?? 0;
  const rawW = (cropShape.width  ?? 0) * (cropShape.scaleX ?? 1);
  const rawH = (cropShape.height ?? 0) * (cropShape.scaleY ?? 1);
  const l = Math.max(0, Math.min(rawL, dispW - 1));
  const t = Math.max(0, Math.min(rawT, dispH - 1));
  const w = Math.max(1, Math.min(rawW, dispW - l));
  const h = Math.max(1, Math.min(rawH, dispH - t));
  if (w < 5 || h < 5) { showToast("Crop area too small"); return; }

  showToast("Cropping…");

  // Remove crop shape BEFORE toDataURL so the overlay doesn't appear in export.
  canvas.remove(cropShape); cropShape = null;
  tempShape = null;
  canvas.renderAll();

  const multiplier = Math.max(1, 1 / fitScale);
  const fullDataUrl = canvas.toDataURL({ format: "png", quality: 1, multiplier });

  const src = new Image();
  src.src = fullDataUrl;
  await new Promise<void>((r) => { src.onload = () => r(); });

  const ratio = src.width / dispW;
  const out   = document.createElement("canvas");
  out.width   = Math.round(w * ratio);
  out.height  = Math.round(h * ratio);
  out.getContext("2d")!.drawImage(src, l * ratio, t * ratio, w * ratio, h * ratio, 0, 0, out.width, out.height);

  canvas.clear();
  backgroundImage = null;
  undoStack = []; redoStack = [];
  stepCounter = 1;

  await loadScreenshot(out.toDataURL("image/png"));
  setTool("select");
  saveState();
}

// ─── Coordinate helper ────────────────────────────────────────────────────────

function getScenePoint(e: any): { x: number; y: number } {
  if (e.scenePoint)      return e.scenePoint;
  if (e.absolutePointer) return e.absolutePointer;
  const raw: MouseEvent = e.e;
  const el   = canvas.getElement();
  const rect = el.getBoundingClientRect();
  return {
    x: ((raw.clientX - rect.left) / rect.width)  * (canvas.width  || dispW),
    y: ((raw.clientY - rect.top)  / rect.height) * (canvas.height || dispH),
  };
}

// ─── Text & step ─────────────────────────────────────────────────────────────

function addText(x: number, y: number): void {
  const text = new IText("Type here", {
    left: x, top: y, fontSize: 20,
    fontFamily: "system-ui, sans-serif",
    fill: currentColor, fontWeight: "bold", editable: true,
  });
  canvas.add(text);
  canvas.setActiveObject(text);
  text.enterEditing();
  text.selectAll();
  saveState();
}

function addStepNumber(x: number, y: number): void {
  const r      = 14;
  const circle = new Circle({ radius: r, fill: currentColor, originX: "center", originY: "center" });
  const label  = new FabricText(String(stepCounter), {
    fontSize: 14, fontFamily: "system-ui, sans-serif",
    fill: "#fff", fontWeight: "bold", originX: "center", originY: "center",
  });
  const group = new Group([circle, label], { left: x - r, top: y - r });
  canvas.add(group);
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

function setupExportButtons(): void {
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
      const { jsPDF } = await import("jspdf");
      const blob    = await exportToBlob();
      const dataUrl = await blobToDataUrl(blob);
      const img     = new Image();
      img.src = dataUrl;
      await new Promise<void>((r) => { img.onload = () => r(); });
      const pdf = new jsPDF({ orientation: img.width > img.height ? "landscape" : "portrait", unit: "pt", format: "a4" });
      const pw  = pdf.internal.pageSize.getWidth(), ph = pdf.internal.pageSize.getHeight();
      const sc  = pw / img.width, sh = img.height * sc;
      for (let i = 0; i < Math.ceil(sh / ph); i++) {
        if (i > 0) pdf.addPage();
        pdf.addImage(dataUrl, "PNG", 0, -(i * ph), pw, sh, undefined, "NONE");
      }
      pdf.save(`gofully-${Date.now()}.pdf`);
      showToast("PDF saved");
    } catch (err) { console.error(err); showToast("PDF failed"); }
  });

  document.getElementById("undo-btn")!.addEventListener("click",   undo);
  document.getElementById("redo-btn")!.addEventListener("click",   redo);
  document.getElementById("delete-btn")!.addEventListener("click", deleteSelected);
  document.getElementById("zoom-in-btn")?.addEventListener("click",  () => adjustZoom(0.1));
  document.getElementById("zoom-out-btn")?.addEventListener("click", () => adjustZoom(-0.1));
  document.getElementById("done-btn")?.addEventListener("click", () => window.close());
}

/** Return the canvas export multiplier based on the user-selected quality. */
function getExportMultiplier(): number {
  const quality = (document.getElementById("exportQuality") as HTMLSelectElement)?.value ?? "native";
  const nativeM = 1 / fitScale;

  if (quality === "hd") {
    const hdM = Math.max(1920 / dispW, 1080 / dispH);
    return Math.max(nativeM, hdM);
  }
  if (quality === "4k") {
    const fourKM = Math.max(3840 / dispW, 2160 / dispH);
    return Math.max(nativeM, fourKM);
  }
  return nativeM;
}

async function exportToBlob(): Promise<Blob> {
  // Temporarily hide crop shape so it doesn't appear in the export.
  const savedCrop = cropShape;
  if (savedCrop) { canvas.remove(savedCrop); canvas.renderAll(); }

  const multiplier = getExportMultiplier();
  const dataUrl    = canvas.toDataURL({ format: "png", quality: 1, multiplier });

  // Restore crop shape
  if (savedCrop) { canvas.add(savedCrop); cropShape = savedCrop; canvas.renderAll(); }

  return dataUrlToBlob(dataUrl);
}

// ─── Zoom ─────────────────────────────────────────────────────────────────────

function adjustZoom(delta: number): void {
  if (!backgroundImage) return;
  cssZoom = Math.min(Math.min(4, 8 / fitScale), Math.max(0.1, cssZoom + delta));
  applyContainerZoom(cssZoom);
  zoomEl.textContent = `${Math.round(cssZoom * 100)}%`;
}

// ─── Undo / redo / delete ─────────────────────────────────────────────────────

function saveState(): void {
  undoStack.push(JSON.stringify(canvas.toJSON()));
  redoStack = [];
  if (undoStack.length > 50) undoStack.shift();
}

/** Find the background image after canvas.loadFromJSON replaces all objects. */
function findBackgroundImage(): FabricImage | null {
  const objs = canvas.getObjects();
  if (objs.length > 0 && objs[0] instanceof FabricImage) return objs[0] as FabricImage;
  return null;
}

/** Re-apply current tool's selectability to all canvas objects after load. */
function restoreObjectInteractivity(): void {
  const isSelect = currentTool === "select";
  canvas.getObjects().forEach((obj) => {
    obj.selectable = obj === backgroundImage ? false : isSelect;
    obj.evented    = obj === backgroundImage ? false : isSelect;
  });
}

function undo(): void {
  if (undoStack.length <= 1) return;
  cancelCrop();
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
  cancelCrop();
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

    if (e.key === "Enter" && currentTool === "crop") { e.preventDefault(); applyCrop(); return; }
    if (e.key === "Escape") {
      e.preventDefault();
      if (currentTool === "crop") { cancelCrop(); setTool("select"); }
      return;
    }

    if ((e.metaKey || e.ctrlKey) && e.key === "z") { e.preventDefault(); e.shiftKey ? redo() : undo(); return; }
    if ((e.metaKey || e.ctrlKey) && e.key === "y") { e.preventDefault(); redo(); return; }
    if ((e.key === "Delete" || e.key === "Backspace") && activeObj) { e.preventDefault(); deleteSelected(); return; }
    if ((e.metaKey || e.ctrlKey) && e.key === "=") { e.preventDefault(); adjustZoom(0.1);  return; }
    if ((e.metaKey || e.ctrlKey) && e.key === "-") { e.preventDefault(); adjustZoom(-0.1); return; }

    if (!e.metaKey && !e.ctrlKey && !e.shiftKey) {
      const map: Record<string, ToolType> = {
        v: "select", a: "arrow", r: "rectangle", e: "ellipse",
        l: "line",   p: "freedraw", t: "text",   h: "highlight",
        b: "blur",   n: "step",     c: "crop",
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

/** Convert a data: URL to a Blob without using fetch (avoids connect-src CSP issues). */
function dataUrlToBlob(dataUrl: string): Blob {
  const [header, b64] = dataUrl.split(",");
  const mime = header.match(/:(.*?);/)?.[1] ?? "image/png";
  const bytes = atob(b64);
  const arr = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
  return new Blob([arr], { type: mime });
}

init();
