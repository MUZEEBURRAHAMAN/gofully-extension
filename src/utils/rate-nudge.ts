// Cross-context (background / content script / editor page) rating-nudge
// state. Uses chrome.storage.local everywhere — chrome.storage.session is
// restricted to trusted contexts by default (content scripts can't read it
// without an extra setAccessLevel call), and durability isn't a concern
// here, so local keeps this simple.

export const RATE_URL =
  "https://chromewebstore.google.com/detail/gofully/akfbmhmdlbmljklgajkgoekobofhhofc";

const STATE_KEY = "gf_rate";
const PENDING_KEY = "gf_rate_pending";

interface RateState {
  count: number;
  status: "none" | "rated" | "dismissed";
  dismissCount: number;
  lastShownAt: number;
}

const DEFAULT_STATE: RateState = { count: 0, status: "none", dismissCount: 0, lastShownAt: 0 };

async function getState(): Promise<RateState> {
  const stored = await chrome.storage.local.get(STATE_KEY);
  return { ...DEFAULT_STATE, ...((stored as Record<string, unknown>)[STATE_KEY] as Partial<RateState> | undefined) };
}

async function setState(state: RateState): Promise<void> {
  await chrome.storage.local.set({ [STATE_KEY]: state });
}

/**
 * Called once per completed capture, from the background service worker —
 * the single point every capture mode (full-page, visible, selected,
 * scrolling-area, scrollable-element, keyboard shortcuts) already funnels
 * through. Decides whether the rating nudge is due, and if so leaves a
 * one-shot flag for whichever UI surface renders first (result bar or the
 * editor) to claim.
 */
export async function recordCaptureCompleted(): Promise<void> {
  try {
    const state = await getState();
    if (state.status !== "none") return; // already rated, or permanently dismissed

    state.count += 1;
    const dueForFirst = state.count === 3;
    const dueForRepeat = state.count > 3 && state.count - state.lastShownAt >= 15;

    if (dueForFirst || dueForRepeat) {
      state.lastShownAt = state.count;
      await chrome.storage.local.set({ [PENDING_KEY]: true });
    }
    await setState(state);
  } catch {
    // Non-critical UI feature — never let this break a capture.
  }
}

/**
 * Claims the pending nudge flag, if any. Read-then-clear, so at most one UI
 * surface renders the nudge for a given eligible capture — whichever calls
 * this first (in practice, almost always the result bar, since it appears
 * immediately after every capture).
 */
export async function claimPendingRateNudge(): Promise<boolean> {
  try {
    const stored = await chrome.storage.local.get(PENDING_KEY);
    if (!(stored as Record<string, unknown>)[PENDING_KEY]) return false;
    await chrome.storage.local.remove(PENDING_KEY);
    return true;
  } catch {
    return false;
  }
}

/** User clicked "Yes, rate it" (or the persistent header button). */
export async function markRatedYes(): Promise<void> {
  try {
    const state = await getState();
    state.status = "rated";
    await setState(state);
  } catch {}
  try {
    window.open(RATE_URL, "_blank");
  } catch {}
}

/** User dismissed the nudge card ("Not now" or its close button). */
export async function markDismissed(): Promise<void> {
  try {
    const state = await getState();
    state.dismissCount += 1;
    if (state.dismissCount >= 2) state.status = "dismissed";
    await setState(state);
  } catch {}
}
