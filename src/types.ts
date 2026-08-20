export type CaptureMode =
  | "full-page"
  | "visible-area"
  | "selected-area"
  | "scrolling-area"
  | "capture-text";

export type CaptureMethod = "cdp" | "scroll-stitch";

export type ExportFormat = "clipboard" | "png" | "pdf";

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
  defaultAction: "result-bar" | "auto-copy" | "auto-save-png" | "auto-pdf";
  pngSaveAs: boolean;
  pdfPageSize: "a4" | "letter";
  pdfWatermark: boolean;
  captureDelay: number;
  scrollPadding: number;
  lazyLoadWait: number;
}

export const DEFAULT_SETTINGS: Settings = {
  defaultAction: "result-bar",
  pngSaveAs: false,
  pdfPageSize: "a4",
  pdfWatermark: false,
  captureDelay: 150,
  scrollPadding: 0,
  lazyLoadWait: 2000,
};
