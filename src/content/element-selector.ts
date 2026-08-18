import type { ScrollableElementInfo } from "../types";

function findScrollableElements(): ScrollableElementInfo[] {
  const MIN_SIZE = 50;
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
      selector: getScrollableSelector(el),
      rect: el.getBoundingClientRect(),
      scrollWidth: el.scrollWidth,
      scrollHeight: el.scrollHeight,
      clientWidth: el.clientWidth,
      clientHeight: el.clientHeight,
    });
  }
  return results;
}

function getScrollableSelector(el: HTMLElement): string {
  if (el.id) return `#${el.id}`;
  const path: string[] = [];
  let current: HTMLElement | null = el;
  while (current && current !== document.body) {
    let tag = current.tagName.toLowerCase();
    if (current.id) { path.unshift(`#${current.id}`); break; }
    const parent = current.parentElement;
    if (parent) {
      const siblings = Array.from(parent.children).filter(c => c.tagName === current!.tagName);
      if (siblings.length > 1) tag += `:nth-of-type(${siblings.indexOf(current) + 1})`;
    }
    path.unshift(tag);
    current = current.parentElement;
  }
  return path.join(" > ");
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === "START_ELEMENT_SELECT_MODE") {
    const tabId = message.payload.tabId;
    startElementSelection((info) => {
      chrome.runtime.sendMessage(
        { type: "ELEMENT_CAPTURE_START", payload: { elementInfo: info, tabId } },
        () => { if (chrome.runtime.lastError) { /* expected */ } }
      );
    });
    sendResponse({ started: true });
    return true;
  }
  return false;
});

let host: HTMLDivElement | null = null;
let shadow: ShadowRoot | null = null;
let highlightBox: HTMLDivElement | null = null;
let badgeEl: HTMLDivElement | null = null;
let panel: HTMLDivElement | null = null;
let highlightedEl: HTMLElement | null = null;
let onSelect: ((info: ScrollableElementInfo) => void) | null = null;
let cachedScrollables: ScrollableElementInfo[] = [];

export function startElementSelection(
  callback: (info: ScrollableElementInfo) => void
): void {
  onSelect = callback;
  cachedScrollables = findScrollableElements();
  createUI();
  document.addEventListener("mousemove", handleMouseMove, true);
  document.addEventListener("click", handleClick, true);
  document.addEventListener("keydown", handleKeydown, true);
}

export function stopElementSelection(): void {
  cleanup();
  document.removeEventListener("mousemove", handleMouseMove, true);
  document.removeEventListener("click", handleClick, true);
  document.removeEventListener("keydown", handleKeydown, true);
  highlightedEl = null;
  onSelect = null;
  cachedScrollables = [];
}

function createUI(): void {
  host = document.createElement("div");
  host.id = "snapforge-element-host";
  shadow = host.attachShadow({ mode: "closed" });

  const style = document.createElement("style");
  style.textContent = `
    * { margin: 0; padding: 0; box-sizing: border-box; }
    .highlight {
      position: fixed; z-index: 2147483647;
      border: 2.5px solid #a855f7;
      background: rgba(168,85,247,0.08);
      border-radius: 4px;
      pointer-events: none; display: none;
      transition: all 0.12s ease;
      box-shadow: 0 0 0 2px rgba(168,85,247,0.2);
    }
    .badge {
      position: absolute; bottom: -28px; left: 50%;
      transform: translateX(-50%);
      background: #7c3aed; color: white;
      font: 600 11px/1 -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      padding: 5px 10px; border-radius: 6px;
      white-space: nowrap; pointer-events: none;
      box-shadow: 0 2px 8px rgba(124,58,237,0.4);
    }
    .badge::before {
      content: ''; position: absolute; top: -4px; left: 50%;
      transform: translateX(-50%);
      border-left: 5px solid transparent; border-right: 5px solid transparent;
      border-bottom: 5px solid #7c3aed;
    }
    .scroll-icon {
      display: inline-block; vertical-align: middle; margin-right: 3px;
    }
    .panel {
      position: fixed; bottom: 20px; left: 50%;
      transform: translateX(-50%);
      z-index: 2147483647;
      background: #1e1b2e; color: white;
      border-radius: 14px; padding: 14px 20px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      box-shadow: 0 8px 32px rgba(0,0,0,0.4);
      display: flex; align-items: center; gap: 14px;
      animation: slideUp 0.3s ease;
      border: 1px solid rgba(168,85,247,0.3);
    }
    @keyframes slideUp {
      from { transform: translateX(-50%) translateY(20px); opacity: 0; }
      to { transform: translateX(-50%) translateY(0); opacity: 1; }
    }
    .panel-icon {
      width: 36px; height: 36px; border-radius: 10px;
      background: rgba(168,85,247,0.15);
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }
    .panel-text { font-size: 13px; font-weight: 500; line-height: 1.4; }
    .panel-sub { font-size: 11px; color: #a78bfa; margin-top: 2px; }
    .panel-count {
      background: #7c3aed; color: white;
      font-size: 11px; font-weight: 700;
      padding: 3px 8px; border-radius: 20px;
      flex-shrink: 0;
    }
    .panel-esc {
      font-size: 10px; color: #6b7280;
      border: 1px solid #374151; padding: 2px 6px;
      border-radius: 4px; flex-shrink: 0;
    }
  `;

  highlightBox = document.createElement("div");
  highlightBox.className = "highlight";

  badgeEl = document.createElement("div");
  badgeEl.className = "badge";
  highlightBox.appendChild(badgeEl);

  panel = document.createElement("div");
  panel.className = "panel";
  const count = cachedScrollables.length;
  panel.innerHTML = `
    <div class="panel-icon">
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect x="2" y="2" width="16" height="16" rx="3" stroke="#a855f7" stroke-width="1.5"/>
        <rect x="5" y="5" width="10" height="10" rx="1.5" stroke="#a855f7" stroke-width="1.2" stroke-dasharray="2 1.5"/>
        <path d="M10 7V13M10 13L8 11M10 13L12 11" stroke="#a855f7" stroke-width="1.2" stroke-linecap="round"/>
      </svg>
    </div>
    <div>
      <div class="panel-text">${count > 0 ? "Hover over a scrollable element and click" : "No scrollable elements found on this page"}</div>
      <div class="panel-sub">${count > 0 ? "Scrollable containers are highlighted as you move" : "Try a page with overflow containers"}</div>
    </div>
    ${count > 0 ? `<span class="panel-count">${count} found</span>` : ""}
    <span class="panel-esc">Esc</span>
  `;

  shadow.appendChild(style);
  shadow.appendChild(highlightBox);
  shadow.appendChild(panel);
  document.body.appendChild(host);
}

function cleanup(): void {
  host?.remove();
  host = null;
  shadow = null;
  highlightBox = null;
  badgeEl = null;
  panel = null;
}

function handleMouseMove(e: MouseEvent): void {
  const target = document.elementFromPoint(e.clientX, e.clientY);
  if (!target || !(target instanceof HTMLElement)) return;

  let matched: ScrollableElementInfo | null = null;
  for (const info of cachedScrollables) {
    const el = document.querySelector(info.selector);
    if (el && (el === target || el.contains(target))) {
      matched = info;
      highlightedEl = el as HTMLElement;
      break;
    }
  }

  if (matched && highlightBox && badgeEl) {
    const rect = (highlightedEl as HTMLElement).getBoundingClientRect();
    highlightBox.style.display = "block";
    highlightBox.style.left = `${rect.left}px`;
    highlightBox.style.top = `${rect.top}px`;
    highlightBox.style.width = `${rect.width}px`;
    highlightBox.style.height = `${rect.height}px`;
    badgeEl.innerHTML = `<span class="scroll-icon">&#8597;</span> ${Math.round(rect.width)} x ${Math.round(matched.scrollHeight)}px`;
  } else if (highlightBox) {
    highlightBox.style.display = "none";
    highlightedEl = null;
  }
}

function handleClick(e: MouseEvent): void {
  e.preventDefault();
  e.stopPropagation();

  if (highlightedEl && onSelect) {
    const rect = highlightedEl.getBoundingClientRect();
    onSelect({
      selector: getSelector(highlightedEl),
      rect,
      scrollWidth: highlightedEl.scrollWidth,
      scrollHeight: highlightedEl.scrollHeight,
      clientWidth: highlightedEl.clientWidth,
      clientHeight: highlightedEl.clientHeight,
    });
  }
  stopElementSelection();
}

function handleKeydown(e: KeyboardEvent): void {
  if (e.key === "Escape") {
    stopElementSelection();
  }
}

function getSelector(el: HTMLElement): string {
  if (el.id) return `#${el.id}`;
  const path: string[] = [];
  let current: HTMLElement | null = el;
  while (current && current !== document.body) {
    let tag = current.tagName.toLowerCase();
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
