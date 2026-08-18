import type { StickyElement } from "../types";

let hiddenElements: StickyElement[] = [];

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

export function hideStickyElements(): StickyElement[] {
  const elements = findStickyElements();
  hiddenElements = [];

  for (const el of elements) {
    hiddenElements.push({
      selector: getUniqueSelector(el),
      originalPosition: el.style.position,
      originalDisplay: el.style.display,
    });
    el.style.setProperty("display", "none", "important");
  }

  return hiddenElements;
}

export function restoreStickyElements(): void {
  const elements = findStickyElements();
  for (const el of elements) {
    el.style.removeProperty("display");
  }

  for (const saved of hiddenElements) {
    try {
      const el = document.querySelector(saved.selector) as HTMLElement;
      if (el) {
        if (saved.originalDisplay) {
          el.style.display = saved.originalDisplay;
        }
        if (saved.originalPosition) {
          el.style.position = saved.originalPosition;
        }
      }
    } catch {
      // selector may be invalid for dynamic elements
    }
  }

  hiddenElements = [];
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === "HIDE_STICKY") {
    const hidden = hideStickyElements();
    sendResponse({ count: hidden.length });
    return true;
  }
  if (message.type === "RESTORE_STICKY") {
    restoreStickyElements();
    sendResponse({ restored: true });
    return true;
  }
  return false;
});
