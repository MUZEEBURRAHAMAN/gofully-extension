export async function preScrollForLazyContent(
  maxWait = 2000
): Promise<void> {
  const totalHeight = Math.max(
    document.body.scrollHeight,
    document.documentElement.scrollHeight
  );
  const viewportHeight = window.innerHeight;
  const steps = Math.ceil(totalHeight / viewportHeight);

  const originalX = window.scrollX;
  const originalY = window.scrollY;

  for (let i = 0; i <= steps; i++) {
    window.scrollTo(0, i * viewportHeight);
    await sleep(50);
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
