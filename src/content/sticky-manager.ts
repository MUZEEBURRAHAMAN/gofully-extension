import type { StickyElement } from "../types";

function findStickyElements(): HTMLElement[] {
  const all = document.querySelectorAll("*");
  const sticky: HTMLElement[] = [];

  for (const el of all) {
    const style = getComputedStyle(el);
    if (style.position === "fixed" || style.position === "sticky") {
      if (el instanceof HTMLElement && el.offsetHeight > 0) {
        sticky.push(el);
      }
    }

    // Pierce shadow DOM
    if (el.shadowRoot) {
      const shadowEls = el.shadowRoot.querySelectorAll("*");
      for (const shadowEl of shadowEls) {
        const sStyle = getComputedStyle(shadowEl);
        if (sStyle.position === "fixed" || sStyle.position === "sticky") {
          if (shadowEl instanceof HTMLElement && shadowEl.offsetHeight > 0) {
            sticky.push(shadowEl);
          }
        }
      }
    }
  }

  return sticky;
}

function getUniqueSelector(el: HTMLElement): string {
  if (el.id) return `#${el.id}`;
  const path: string[] = [];
  let current: HTMLElement | null = el;
  while (current && current !== document.body) {
    let selector = current.tagName.toLowerCase();
    if (current.id) {
      selector = `#${current.id}`;
      path.unshift(selector);
      break;
    }
    const parent = current.parentElement;
    if (parent) {
      const siblings = Array.from(parent.children).filter(
        (c) => c.tagName === current!.tagName
      );
      if (siblings.length > 1) {
        const index = siblings.indexOf(current) + 1;
        selector += `:nth-of-type(${index})`;
      }
    }
    path.unshift(selector);
    current = current.parentElement;
  }
  return path.join(" > ");
}

interface FrozenSticky {
  el: HTMLElement;
  originalPosition: string;
  originalTop: string;
  originalLeft: string;
  originalWidth: string;
  originalZIndex: string;
}

let frozenElements: FrozenSticky[] = [];

export function freezeStickyElements(): void {
  const elements = findStickyElements();
  frozenElements = [];

  for (const el of elements) {
    const rect = el.getBoundingClientRect();
    const style = window.getComputedStyle(el);
    frozenElements.push({
      el,
      originalPosition: el.style.position,
      originalTop: el.style.top,
      originalLeft: el.style.left,
      originalWidth: el.style.width,
      originalZIndex: el.style.zIndex,
    });

    const docTop = rect.top + window.scrollY;
    el.style.setProperty("position", "absolute", "important");
    el.style.setProperty("top", `${docTop}px`, "important");
    el.style.setProperty("left", `${rect.left + window.scrollX}px`, "important");
    el.style.setProperty("width", `${rect.width}px`, "important");
    el.style.setProperty("z-index", style.zIndex || "9999", "important");
  }
}

export function restoreFrozenElements(): void {
  for (const saved of frozenElements) {
    try {
      if (saved.originalPosition) saved.el.style.position = saved.originalPosition;
      else saved.el.style.removeProperty("position");

      if (saved.originalTop) saved.el.style.top = saved.originalTop;
      else saved.el.style.removeProperty("top");

      if (saved.originalLeft) saved.el.style.left = saved.originalLeft;
      else saved.el.style.removeProperty("left");

      if (saved.originalWidth) saved.el.style.width = saved.originalWidth;
      else saved.el.style.removeProperty("width");

      if (saved.originalZIndex) saved.el.style.zIndex = saved.originalZIndex;
      else saved.el.style.removeProperty("z-index");
    } catch {}
  }
  frozenElements = [];
}

interface HiddenSticky {
  el: HTMLElement;
  originalVisibility: string;
}

let hiddenStickyElements: HiddenSticky[] = [];

export function hideStickyElements(): StickyElement[] {
  const elements = findStickyElements();
  hiddenStickyElements = [];

  for (const el of elements) {
    if (el.id?.startsWith("gofully-") || el.id?.startsWith("snapforge-")) continue;

    hiddenStickyElements.push({
      el,
      originalVisibility: el.style.visibility,
    });
    // Use visibility: hidden !important so the element is invisible without causing layout shifts
    el.style.setProperty("visibility", "hidden", "important");
  }

  return hiddenStickyElements.map((h) => ({
    selector: getUniqueSelector(h.el),
    originalPosition: h.el.style.position,
    originalDisplay: h.el.style.display,
  }));
}

export function restoreStickyElements(): void {
  for (const saved of hiddenStickyElements) {
    try {
      if (saved.originalVisibility) {
        saved.el.style.setProperty("visibility", saved.originalVisibility);
      } else {
        saved.el.style.removeProperty("visibility");
        saved.el.style.visibility = "";
      }
    } catch {
      // ignore
    }
  }
  hiddenStickyElements = [];

  // Also sweep any elements that have inline visibility: hidden applied
  const all = document.querySelectorAll<HTMLElement>("*");
  for (const el of all) {
    if (
      el.style.visibility === "hidden" &&
      !el.id?.startsWith("gofully-") &&
      !el.id?.startsWith("snapforge-")
    ) {
      el.style.removeProperty("visibility");
      el.style.visibility = "";
    }
  }
}

// Full-page scroll-stitch captures can run long enough on tall pages that
// Chrome tears down the MV3 background service worker mid-capture unless
// something holds an open chrome.runtime.Port for the duration — the same
// mechanism scrolling-area-ui.ts uses for its own capture loop. This script
// is already auto-injected into every tab (manifest content_scripts), so it
// opens/closes that port on the background's behalf.
let captureKeepAlivePort: chrome.runtime.Port | null = null;

function startCaptureKeepAlive(): void {
  stopCaptureKeepAlive();
  try {
    captureKeepAlivePort = chrome.runtime.connect({ name: "gf-capture-keepalive" });
  } catch {
    captureKeepAlivePort = null;
  }
}

function stopCaptureKeepAlive(): void {
  try {
    captureKeepAlivePort?.disconnect();
  } catch {}
  captureKeepAlivePort = null;
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === "FREEZE_STICKY") {
    freezeStickyElements();
    sendResponse({ frozen: true });
    return true;
  }
  if (message.type === "HIDE_STICKY") {
    const hidden = hideStickyElements();
    sendResponse({ count: hidden.length });
    return true;
  }
  if (message.type === "RESTORE_STICKY") {
    restoreStickyElements();
    restoreFrozenElements();
    sendResponse({ restored: true });
    return true;
  }
  if (message.type === "CAPTURE_KEEPALIVE_START") {
    startCaptureKeepAlive();
    sendResponse({ started: true });
    return true;
  }
  if (message.type === "CAPTURE_KEEPALIVE_STOP") {
    stopCaptureKeepAlive();
    sendResponse({ stopped: true });
    return true;
  }
  return false;
});
