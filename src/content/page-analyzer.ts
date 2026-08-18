import type { PageDimensions, Message } from "../types";

function getPageDimensions(): PageDimensions {
  const body = document.body;
  const html = document.documentElement;

  const scrollWidth = Math.max(
    body.scrollWidth,
    body.offsetWidth,
    html.clientWidth,
    html.scrollWidth,
    html.offsetWidth
  );

  const scrollHeight = Math.max(
    body.scrollHeight,
    body.offsetHeight,
    html.clientHeight,
    html.scrollHeight,
    html.offsetHeight
  );

  return {
    scrollWidth,
    scrollHeight,
    viewportWidth: window.innerWidth,
    viewportHeight: window.innerHeight,
    devicePixelRatio: window.devicePixelRatio || 1,
  };
}

chrome.runtime.onMessage.addListener(
  (message: Message, _sender, sendResponse) => {
    if (message.type === "GET_PAGE_INFO") {
      sendResponse({ type: "PAGE_INFO", payload: getPageDimensions() });
      return true;
    }
    return false;
  }
);
