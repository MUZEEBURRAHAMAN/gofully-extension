export type CaptureMode =
  | "full-page"
  | "visible-area"
  | "selected-area"
  | "scrolling-area"
  | "capture-text"
  | "annotate-page"
  | "capture-element"
  | "measure-page"
  | "redact-page";

export type CaptureMethod = "scroll-stitch" | "visible-tab";

export type ExportFormat = "clipboard" | "png" | "jpg" | "webp" | "pdf";

export interface PageDimensions {
  scrollWidth: number;
  scrollHeight: number;
  viewportWidth: number;
  viewportHeight: number;
  devicePixelRatio: number;
}

export interface StickyElement {
  selector: string;
  originalPosition: string;
  originalDisplay: string;
}

export interface StepItem {
  id: string;
  number: number;
  x: number;
  y: number;
  color: string;
}

export interface CaptureFrame {
  dataUrl: string;
  x: number;
  y: number;
  width: number;
  height: number;
  scrollX: number;
  scrollY: number;
  cropY?: number;
  cropHeight?: number;
  dstY?: number;
}

export interface CaptureRegion {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ScrollableElementInfo {
  selector: string;
  rect: DOMRect;
  scrollWidth: number;
  scrollHeight: number;
  clientWidth: number;
  clientHeight: number;
}

export interface CaptureResult {
  blob: Blob;
  width: number;
  height: number;
  mode: CaptureMode;
  method: CaptureMethod;
  timestamp: number;
  url: string;
  title: string;
  /** How a full-page capture was stitched, and why (absent for other capture modes). */
  stitch?: { mode: "standard" | "landing"; reasons: string[] };
}

export interface CaptureProgress {
  current: number;
  total: number;
  phase: "preparing" | "capturing" | "stitching" | "done";
}

export type MessageType =
  | "START_CAPTURE"
  | "CAPTURE_PROGRESS"
  | "CAPTURE_COMPLETE"
  | "CAPTURE_ERROR"
  | "GET_PAGE_INFO"
  | "PAGE_INFO"
  | "HIDE_STICKY"
  | "RESTORE_STICKY"
  | "PRE_SCROLL_LAZY"
  | "SELECT_REGION"
  | "REGION_SELECTED"
  | "SELECT_ELEMENT"
  | "ELEMENT_SELECTED"
  | "SCROLL_ELEMENT"
  | "ELEMENT_SCROLL_FRAME";

export interface Message {
  type: MessageType;
  payload?: unknown;
}

export interface Settings {
  /** What happens after a quick capture that has no popup to show it. */
  defaultAction: "result-bar" | "auto-copy" | "auto-save-png" | "auto-pdf" | "open-editor" | "pin";
  pngSaveAs: boolean;
  pdfPageSize: "a4" | "letter";
  pdfWatermark: boolean;
  captureDelay: number;
  scrollPadding: number;
  lazyLoadWait: number;
  captureSound: boolean;
  /** Seconds the popup's "Capture in" timer waits. 0 is off. */
  captureCountdown: 0 | 3 | 5 | 10;
  skipStickyHeaders: boolean;
  /** Full-page method: "auto" uses landing-page mode for pages animated by scripts. */
  fullPageMode: "auto" | "standard" | "landing";
  defaultExportFormat: "png" | "webp" | "jpg";
  jpgQuality: number;
  editorShortcuts: Record<string, string>;
  captureStamp: boolean;
  theme: "light" | "dark" | "system";
  ocrLanguage: string;
  language: string;
  indexCaptureText: boolean;
  keepFullImages: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
  defaultAction: "result-bar",
  pngSaveAs: false,
  pdfPageSize: "a4",
  pdfWatermark: false,
  captureDelay: 150,
  scrollPadding: 0,
  lazyLoadWait: 2000,
  captureSound: true,
  captureCountdown: 0,
  skipStickyHeaders: true,
  fullPageMode: "auto",
  defaultExportFormat: "png",
  jpgQuality: 0.92,
  editorShortcuts: {},
  captureStamp: false,
  theme: "system",
  ocrLanguage: "eng",
  language: "system",
  indexCaptureText: true,
  keepFullImages: false,
};
