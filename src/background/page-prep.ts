// Page preparation for full-page capture. Both functions are passed to chrome.scripting.executeScript as
// `func`, so they run inside the page and must stay self-contained (no references to anything outside them).
//
// Why this exists. A full-page capture scrolls the page one screen at a time and photographs each screen.
// Modern landing pages animate while you scroll, which breaks that in two ways:
//   1. Scroll-driven animations (animation-timeline: view() / scroll()) show an element in a state that depends
//      on where it sits in the viewport, so the same card is half-faded at the bottom edge of one tile and
//      shifted at the top edge of the next.
//   2. Reveal-on-scroll effects (IntersectionObserver plus a CSS transition) take 0.5 to 1 second, longer than
//      the pause before each photo, so the tile shows them mid-fade.
// The fix is to put every animation in its finished, readable state before each photo, and to put the page
// back exactly as it was afterwards.

/**
 * Settles time-based animations and pins scroll-driven ones to their revealed state. Safe to call before every tile.
 * `quietMs` > 0 (landing-page mode) also waits until the page has stopped changing for that long: scripts that
 * ease elements toward a scroll-dependent target keep rewriting inline styles until they arrive.
 */
export async function prepareFrameForCapture(quietMs = 0): Promise<{ pinned: number; waitedMs: number; neverQuiet: boolean }> {
  const w = window as unknown as { __gf_fx?: { marked: Set<Element>; style: HTMLStyleElement | null; watchdog?: number } };
  const state = (w.__gf_fx ??= { marked: new Set<Element>(), style: null });
  // If the capture dies (tab navigated, service worker killed) nothing calls restorePageAfterCapture, and the
  // page would stay frozen. Undo it automatically a while after the last photo.
  clearTimeout(state.watchdog);
  state.watchdog = window.setTimeout(() => {
    // Inlined: this function is injected on its own, so it cannot call restorePageAfterCapture.
    state.style?.remove();
    for (const el of state.marked) el.removeAttribute("data-gf-fx");
    delete w.__gf_fx;
  }, 20000);
  const all = (): Animation[] => (typeof document.getAnimations === "function" ? document.getAnimations() : []);

  // 1. Scroll-driven animations. Their state depends on scroll position, so no single moment is "right".
  //    Reveal animations (they end more visible than they start) go to their end state; everything else
  //    (exit fades, parallax, progress bars) goes back to the page's resting style, which is how the
  //    designer laid the page out.
  const votes = new Map<Element, "end" | "rest">();
  for (const a of all()) {
    const timeline = a.timeline;
    if (!timeline || timeline === document.timeline) continue;
    const effect = a.effect as KeyframeEffect | null;
    const el = effect?.target ?? null;
    if (!el || state.marked.has(el)) continue;

    let mode: "end" | "rest" = "rest";
    try {
      const frames = effect!.getKeyframes();
      const opacityOf = (kf: ComputedKeyframe | undefined): number | null => {
        const v = kf?.opacity as unknown;
        if (v === undefined || v === null || v === "") return null;
        const n = parseFloat(String(v));
        return Number.isFinite(n) ? n : null;
      };
      if (frames.length >= 2) {
        const first = opacityOf(frames[0]);
        const last = opacityOf(frames[frames.length - 1]);
        if (last !== null && ((first === null && last >= 0.99) || (first !== null && last > first + 0.01))) mode = "end";
      }
    } catch {
      /* unreadable keyframes: keep the resting style */
    }
    if (votes.get(el) !== "end") votes.set(el, mode);
  }

  if (votes.size) {
    if (!state.style) {
      const style = document.createElement("style");
      style.id = "__gf_fx_freeze";
      // "end": run on the normal clock, instantly, and hold the last keyframe. "rest": no animation at all.
      style.textContent = `
        [data-gf-fx="end"], [data-gf-fx="end"]::before, [data-gf-fx="end"]::after {
          animation-timeline: auto !important; animation-delay: 0s !important; animation-duration: 1ms !important;
          animation-iteration-count: 1 !important; animation-direction: normal !important; animation-fill-mode: forwards !important;
        }
        [data-gf-fx="rest"], [data-gf-fx="rest"]::before, [data-gf-fx="rest"]::after { animation: none !important; }
      `;
      (document.head || document.documentElement).appendChild(style);
      state.style = style;
    }
    for (const [el, mode] of votes) {
      el.setAttribute("data-gf-fx", mode);
      state.marked.add(el);
    }
  }

  // 2. Time-based animations and transitions (reveal-on-scroll). Wait for the ones that will finish.
  const started = performance.now();
  const finishing = (): Animation[] =>
    all().filter((a) => {
      if (a.playState !== "running") return false;
      if (a.timeline && a.timeline !== document.timeline) return false;
      const end = a.effect?.getComputedTiming().endTime;
      return typeof end === "number" && Number.isFinite(end);
    });
  while (performance.now() - started < 1600) {
    const running = finishing();
    if (!running.length) break;
    await Promise.race([Promise.allSettled(running.map((a) => a.finished)), new Promise((r) => setTimeout(r, 120))]);
  }
  // 3. Script-driven animation (landing-page mode): wait until nothing has been rewritten for `quietMs`.
  //    Watching attribute changes is enough: eased values arrive as inline style updates.
  let neverQuiet = false;
  if (quietMs > 0) {
    await new Promise<void>((resolve) => {
      // Something that never stops moving (an auto-playing carousel, a ticker) must not hold up every photo.
      const ceiling = performance.now() + 2000;
      let timer = 0;
      const done = () => { if (performance.now() >= ceiling - 5) neverQuiet = true; observer.disconnect(); clearTimeout(timer); resolve(); };
      const arm = () => {
        clearTimeout(timer);
        const wait = Math.min(quietMs, Math.max(0, ceiling - performance.now()));
        timer = window.setTimeout(done, wait);
      };
      const observer = new MutationObserver(() => { if (performance.now() < ceiling) arm(); });
      observer.observe(document.documentElement, { attributes: true, attributeFilter: ["style", "class"], subtree: true });
      arm();
    });
  }

  // Let the browser paint the settled state before the photo.
  await new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())));

  return { pinned: votes.size, waitedMs: Math.round(performance.now() - started), neverQuiet };
}

/** Puts the page's own animations back. */
export function restorePageAfterCapture(): void {
  const w = window as unknown as { __gf_fx?: { marked: Set<Element>; style: HTMLStyleElement | null; watchdog?: number } };
  const state = w.__gf_fx;
  if (!state) return;
  clearTimeout(state.watchdog);
  state.style?.remove();
  for (const el of state.marked) el.removeAttribute("data-gf-fx");
  delete w.__gf_fx;
}

/**
 * Does this page animate with scripts that follow the scroll (scrubbed reveals, pinned sections, smooth-scroll
 * libraries)? Those cannot be frozen from outside, so they need landing-page mode. Runs in the page's own
 * JavaScript world so it can see libraries such as ScrollTrigger on `window`.
 */
export function detectScriptedScroll(): { scripted: boolean; reasons: string[] } {
  const reasons: string[] = [];
  const w = window as unknown as Record<string, any>;
  const has = (sel: string): boolean => {
    try { return !!document.querySelector(sel); } catch { return false; }
  };
  const html = document.documentElement;

  // GSAP ScrollTrigger wraps pinned sections in .pin-spacer
  if (has(".pin-spacer")) reasons.push("ScrollTrigger pinned section");
  else if (typeof w.ScrollTrigger !== "undefined" || w.gsap?.core?.globals?.()?.ScrollTrigger) reasons.push("ScrollTrigger");

  // Smooth-scroll libraries move the page with transforms and ease toward the scroll position
  if (html.classList.contains("lenis") || html.classList.contains("lenis-smooth") || has("[data-lenis-prevent], .lenis") || typeof w.Lenis !== "undefined") reasons.push("Lenis smooth scroll");
  if (has(".locomotive-scroll, [data-scroll-container], .has-scroll-smooth") || typeof w.LocomotiveScroll !== "undefined") reasons.push("Locomotive smooth scroll");
  if (typeof w.ScrollSmoother !== "undefined" || has("#smooth-wrapper")) reasons.push("GSAP ScrollSmoother");

  // Framer sites animate elements into view with scripts
  if (has("[data-framer-appear-id]")) reasons.push("Framer scroll animation");

  return { scripted: reasons.length > 0, reasons };
}
