/**
 * Force-hides the in-page "Capturing page..." badge immediately before a
 * chrome.tabs.captureVisibleTab() snapshot. The badge is shown via
 * CAPTURE_PROGRESS messages (see result-bar.ts), which are sent async and can
 * race with an instant capture — without this, the badge can get baked into
 * the captured pixels.
 */
export async function hideProgressInTab(tabId: number): Promise<void> {
  await chrome.scripting.executeScript({
    target: { tabId },
    func: () => {
      const el = document.getElementById("gofully-progress-overlay");
      if (el) el.style.setProperty("display", "none", "important");
    },
  }).catch(() => {});
}
