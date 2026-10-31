/**
 * Force-hides the in-page "Capturing page..." badge immediately before a
 * chrome.tabs.captureVisibleTab() snapshot. The badge is shown via
 * CAPTURE_PROGRESS messages (see result-bar.ts), which are sent async and can
 * race with an instant capture — without this, the badge can get baked into
 * the captured pixels.
 *
 * When the badge WAS genuinely visible a moment ago (it legitimately shows
 * between frames of a multi-frame capture, for user feedback — suppression
 * only needs to block it during the shutter itself), setting display:none
 * here only guarantees the *script* ran; it does not guarantee the browser
 * has *painted* that change before captureVisibleTab() reads the next
 * frame. Observed directly: a full-page capture where the badge was shown
 * between frame 0 and frame 1, correctly hidden (display:none confirmed via
 * getComputedStyle) before frame 1's shutter, and still baked into frame 1's
 * pixels. Waiting on two animation frames — the same fix already used for
 * sticky-header hiding in stitch-capture.ts, for the identical reason —
 * guarantees at least one full paint has happened before the shutter opens.
 * Only pay for that wait when there was actually something to hide.
 */
export async function hideProgressInTab(tabId: number): Promise<void> {
  await chrome.scripting.executeScript({
    target: { tabId },
    func: () => {
      return new Promise<void>((resolve) => {
        // GoFully's own on-page UI never belongs in a photo: the progress badge, the capture
        // stack, toasts, notices and the delay countdown. Marked so unsuppress can bring them back.
        // (Draw on Page marks, measurements, redaction covers and pinned images are content, so they stay.)
        const ids = ["gofully-progress-overlay", "gofully-result-card-host", "gofully-quick-toast", "gofully-inline-notice", "gofully-countdown", "gofully-rate-nudge-host", "gofully-measure-bar", "gofully-live-redact"];
        let hid = false;
        for (const id of ids) {
          const el = document.getElementById(id);
          if (!el) continue;
          if (id !== "gofully-progress-overlay") el.setAttribute("data-gf-shutter-hidden", el.style.getPropertyValue("visibility"));
          el.style.setProperty(id === "gofully-progress-overlay" ? "display" : "visibility", id === "gofully-progress-overlay" ? "none" : "hidden", "important");
          hid = true;
        }
        if (!hid) {
          resolve();
          return;
        }
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
      });
    },
  }).catch(() => {});
}

/**
 * Prevents the in-page badge from being CREATED at all, not just hides one
 * that already exists. hideProgressInTab() alone isn't enough on real pages:
 * CAPTURE_PROGRESS is delivered via a fire-and-forget chrome.tabs.sendMessage
 * (see service-worker.ts's sendProgress), and on a busy page that delivery
 * can be delayed past the moment hideProgressInTab() runs — there's nothing
 * to hide yet — and then land moments later, creating the badge for the
 * first time right before the shutter opens. Observed live on real full-page
 * captures (e.g. sync.com), where the very first "preparing" progress event
 * baked "Capturing page... 33%" into the top of the stitched image.
 *
 * Call this (then hideProgressInTab as a belt-and-suspenders instant hide)
 * before every captureVisibleTab() shutter in full-page capture, and
 * unsuppressProgressInTab right after, so a progress message that arrives
 * mid-shutter is dropped instead of rendered.
 */
export async function suppressProgressInTab(tabId: number): Promise<void> {
  await chrome.scripting.executeScript({
    target: { tabId },
    func: () => {
      if (typeof (window as any).__gofully_suppress_progress === "function") {
        (window as any).__gofully_suppress_progress();
      }
    },
  }).catch(() => {});
}

/** Lifts the suppression from suppressProgressInTab so the badge resumes updating between frames. */
export async function unsuppressProgressInTab(tabId: number): Promise<void> {
  await chrome.scripting.executeScript({
    target: { tabId },
    func: () => {
      if (typeof (window as any).__gofully_unsuppress_progress === "function") {
        (window as any).__gofully_unsuppress_progress();
      }
      for (const el of Array.from(document.querySelectorAll<HTMLElement>("[data-gf-shutter-hidden]"))) {
        const prev = el.getAttribute("data-gf-shutter-hidden") || "";
        el.removeAttribute("data-gf-shutter-hidden");
        if (prev) el.style.setProperty("visibility", prev);
        else el.style.removeProperty("visibility");
      }
    },
  }).catch(() => {});
}
