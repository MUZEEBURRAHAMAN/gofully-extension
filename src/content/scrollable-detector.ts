import type { ScrollableElementInfo } from "../types";

const MIN_SIZE = 50;

export function findScrollableElements(): ScrollableElementInfo[] {
  const all = document.querySelectorAll("*");
  const results: ScrollableElementInfo[] = [];

  for (const el of all) {
    if (!(el instanceof HTMLElement)) continue;

    const style = getComputedStyle(el);
    const isScrollableY =
      (style.overflowY === "scroll" || style.overflowY === "auto") &&
      el.scrollHeight > el.clientHeight;
    const isScrollableX =
      (style.overflowX === "scroll" || style.overflowX === "auto") &&
      el.scrollWidth > el.clientWidth;

    if (!isScrollableY && !isScrollableX) continue;
    if (el.clientHeight < MIN_SIZE || el.clientWidth < MIN_SIZE) continue;
    if (el === document.body || el === document.documentElement) continue;

    results.push({
      selector: getSelector(el),
      rect: el.getBoundingClientRect(),
      scrollWidth: el.scrollWidth,
      scrollHeight: el.scrollHeight,
      clientWidth: el.clientWidth,
      clientHeight: el.clientHeight,
    });
  }

  return results;
}

function getSelector(el: HTMLElement): string {
  if (el.id) return `#${el.id}`;

  const path: string[] = [];
  let current: HTMLElement | null = el;
  while (current && current !== document.body) {
    let tag = current.tagName.toLowerCase();
    if (current.id) {
      path.unshift(`#${current.id}`);
      break;
    }
    const parent = current.parentElement;
    if (parent) {
      const siblings = Array.from(parent.children).filter(
        (c) => c.tagName === current!.tagName
      );
      if (siblings.length > 1) {
        tag += `:nth-of-type(${siblings.indexOf(current) + 1})`;
      }
    }
    path.unshift(tag);
    current = current.parentElement;
  }
  return path.join(" > ");
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === "SELECT_ELEMENT") {
    const elements = findScrollableElements();
    sendResponse({ elements });
    return true;
  }
  return false;
});
