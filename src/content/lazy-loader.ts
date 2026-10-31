// A second request while one is running joins it. Running two at once makes the later one record the position the
// first one scrolled to as "original", and put the page back there instead of where the person was reading.
// The flag lives on window, not in this file's scope: a page that already holds an older injected copy of this
// script has a second, separate copy of every variable here.
type PreScrollWindow = Window & { __gofully_prescroll?: Promise<void> | null };

export function preScrollForLazyContent(maxWait = 2000): Promise<void> {
  const w = window as PreScrollWindow;
  w.__gofully_prescroll ??= scrollThroughPage(maxWait).finally(() => { w.__gofully_prescroll = null; });
  return w.__gofully_prescroll;
}

async function scrollThroughPage(maxWait: number): Promise<void> {
  const totalHeight = Math.max(
    document.body.scrollHeight,
    document.documentElement.scrollHeight
  );
  const viewportHeight = window.innerHeight;
  // Half-screen steps with a short pause: reveal-on-scroll code (IntersectionObserver with a threshold) only
  // fires for an element that is mostly on screen, and a full-screen step can jump straight past one that
  // straddles two screens.
  const step = Math.max(200, Math.floor(viewportHeight / 2));
  const steps = Math.ceil(totalHeight / step);

  const originalX = window.scrollX;
  const originalY = window.scrollY;

  for (let i = 0; i <= steps; i++) {
    window.scrollTo({ top: i * step, left: 0, behavior: "instant" });
    await sleep(70);
  }

  window.scrollTo(originalX, originalY);

  await waitForNetworkIdle(maxWait);
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

async function waitForNetworkIdle(timeout: number): Promise<void> {
  return new Promise((resolve) => {
    let timer: ReturnType<typeof setTimeout>;
    let pending = 0;

    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === "resource") {
          pending++;
          clearTimeout(timer);
          timer = setTimeout(() => {
            pending = 0;
            observer.disconnect();
            resolve();
          }, 500);
        }
      }
    });

    try {
      observer.observe({ entryTypes: ["resource"] });
    } catch {
      // PerformanceObserver not available
    }

    timer = setTimeout(() => {
      observer.disconnect();
      resolve();
    }, timeout);
  });
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === "PRE_SCROLL_LAZY") {
    const wait = (message.payload as { maxWait?: number })?.maxWait ?? 2000;
    preScrollForLazyContent(wait).then(() => sendResponse({ done: true }));
    return true;
  }
  return false;
});
