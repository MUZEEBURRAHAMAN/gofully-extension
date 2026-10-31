// Where to take each photo of a full-page capture, and which rows of it to keep. Pure arithmetic, no browser
// calls, so it can be tested on its own (tests/unit/tile-plan.spec.ts).
//
// Standard mode keeps every row of every photo: one screen per photo, edge to edge.
//
// Landing-page mode keeps only the middle of each photo. Pages that animate with scripts (scroll-scrubbed
// reveals, pinned sections) show an element half-finished while it is near the top or bottom of the screen
// and finished once it is further in. Moving the photo by half a screen and keeping only the middle half
// means every row of the final image was photographed while it sat well inside the screen.
//
//        photo at scrollY = s                 rows kept
//        ┌────────────────────┐  0
//        │ margin (dropped)   │
//        ├────────────────────┤  margin        ← next photo starts so that its margin row meets this line
//        │ kept               │
//        ├────────────────────┤  viewport - margin
//        │ margin (dropped)   │
//        └────────────────────┘  viewport
//
// The first photo (top of the page) keeps its top margin and the last one keeps its bottom margin, because
// nothing else could cover those rows.

export type StitchMode = "standard" | "landing";

export interface PlanGeometry {
  /** Height of the photo in CSS pixels. */
  viewportHeight: number;
  /** Height of the whole page in CSS pixels. */
  scrollHeight: number;
  /** Rows dropped from the top and bottom of every middle photo. */
  margin: number;
}

export interface Placement {
  /** Rows to skip at the top of the photo (already in the image). */
  skipTop: number;
  /** Where the kept rows go in the final image. */
  placedY: number;
  /** How many rows are kept. */
  placedH: number;
}

export function bandMargin(mode: StitchMode, viewportHeight: number): number {
  return mode === "landing" ? Math.floor(viewportHeight / 4) : 0;
}

/** The photo taken at the top of the page. */
export function firstTile(g: PlanGeometry): { placedH: number; isLast: boolean } {
  const isLast = g.scrollHeight <= g.viewportHeight;
  return { isLast, placedH: Math.min(isLast ? g.viewportHeight : g.viewportHeight - g.margin, g.scrollHeight) };
}

/** Where to scroll for the next photo, given how much of the page is already in the image. */
export function nextTile(coveredY: number, g: PlanGeometry): { targetY: number; isLast: boolean } {
  const remaining = g.scrollHeight - coveredY;
  // A middle photo can add at most (viewport - margin) rows below the covered line.
  const isLast = remaining <= g.viewportHeight - g.margin;
  return {
    isLast,
    targetY: isLast ? Math.max(0, g.scrollHeight - g.viewportHeight) : coveredY - g.margin,
  };
}

/**
 * Which rows of a photo to keep, based on where the page actually scrolled to (it can differ from where we
 * asked: scroll snapping, late layout, a page that cannot scroll that far). Rows already in the image are
 * skipped; a photo that landed further down simply sits at its true position.
 */
export function placeTile(currentY: number, coveredY: number, g: PlanGeometry, isLast: boolean): Placement | null {
  const skipTop = Math.max(0, coveredY - currentY);
  const placedY = currentY + skipTop;
  const usableBottom = isLast ? g.viewportHeight : g.viewportHeight - g.margin;
  const placedH = Math.min(usableBottom - skipTop, g.scrollHeight - placedY);
  return placedH > 0 ? { skipTop, placedY, placedH } : null;
}
