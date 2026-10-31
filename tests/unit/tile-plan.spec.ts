import { test, expect } from "@playwright/test";
import { bandMargin, firstTile, nextTile, placeTile } from "../../src/background/tile-plan";

// Walks a whole page the way the capture loop does, with a browser that scrolls exactly where it is told
// (but never past the bottom), and returns every placed slice.
function walk(scrollHeight: number, viewportHeight: number, mode: "standard" | "landing") {
  const g = { scrollHeight, viewportHeight, margin: bandMargin(mode, viewportHeight) };
  const first = firstTile(g);
  const slices = [{ photoY: 0, skipTop: 0, placedY: 0, placedH: first.placedH, last: first.isLast }];
  let covered = first.placedH;
  let guard = 0;
  while (covered < scrollHeight && guard++ < 1000) {
    const { targetY, isLast } = nextTile(covered, g);
    const photoY = Math.min(Math.max(0, targetY), Math.max(0, scrollHeight - viewportHeight));
    const slice = placeTile(photoY, covered, g, isLast);
    if (!slice) break;
    slices.push({ photoY, ...slice, last: isLast });
    covered = slice.placedY + slice.placedH;
  }
  return { g, slices, covered };
}

const SIZES: Array<[number, number]> = [
  [5855, 633], [11220, 633], [3051, 720], [1000, 900], [901, 900], [1800, 900], [2700, 900], [12345, 777], [100000 - 7, 1001], [1441, 1440],
];

test.describe("tile plan", () => {
  for (const mode of ["standard", "landing"] as const) {
    for (const [height, vh] of SIZES) {
      test(`${mode}: ${height}px page, ${vh}px screen is covered once, in order, to the bottom`, () => {
        const { slices, covered } = walk(height, vh, mode);
        expect(covered).toBe(height);
        let at = 0;
        for (const s of slices) {
          expect(s.placedY, "no gap and no overlap").toBe(at);
          expect(s.placedH).toBeGreaterThan(0);
          at += s.placedH;
        }
        expect(at).toBe(height);
      });
    }
  }

  test("standard mode uses whole screens, as before", () => {
    const { slices } = walk(5000, 800, "standard");
    // every photo but the last contributes a full screen
    for (const s of slices.slice(0, -1)) expect(s.placedH).toBe(800);
    expect(slices.length).toBe(Math.ceil(5000 / 800));
  });

  test("landing mode only uses the middle of each photo, away from the screen edges", () => {
    const vh = 800;
    const { g, slices } = walk(9000, vh, "landing");
    expect(g.margin).toBe(200);
    for (const [i, s] of slices.entries()) {
      const first = i === 0;
      const last = i === slices.length - 1;
      // rows used, measured from the top of the photo
      const from = s.skipTop;
      const to = s.skipTop + s.placedH;
      if (!first) expect(from, `photo ${i} starts below the top margin`).toBeGreaterThanOrEqual(g.margin);
      if (!last) expect(to, `photo ${i} ends above the bottom margin`).toBeLessThanOrEqual(vh - g.margin);
    }
  });

  test("landing mode takes about twice as many photos", () => {
    const std = walk(9000, 800, "standard").slices.length;
    const land = walk(9000, 800, "landing").slices.length;
    expect(land).toBeGreaterThan(std * 1.6);
    expect(land).toBeLessThan(std * 2.4);
  });

  test("a short page that fits one screen is a single photo in both modes", () => {
    for (const mode of ["standard", "landing"] as const) {
      const { slices } = walk(600, 800, mode);
      expect(slices.length).toBe(1);
      expect(slices[0].placedH).toBe(600);
    }
  });

  test("when the page scrolled less than asked, rows already covered are skipped, not repeated", () => {
    const g = { scrollHeight: 5000, viewportHeight: 800, margin: 0 };
    // asked for 1600, got 1550: the first 50 rows of the photo are already in the image
    expect(placeTile(1550, 1600, g, false)).toEqual({ skipTop: 50, placedY: 1600, placedH: 750 });
  });

  test("when the page scrolled further than asked, the photo sits at its true position", () => {
    const g = { scrollHeight: 5000, viewportHeight: 800, margin: 0 };
    expect(placeTile(1650, 1600, g, false)).toEqual({ skipTop: 0, placedY: 1650, placedH: 800 });
  });

  test("margin is a quarter of the screen in landing mode, nothing otherwise", () => {
    expect(bandMargin("standard", 800)).toBe(0);
    expect(bandMargin("landing", 800)).toBe(200);
    expect(bandMargin("landing", 633)).toBe(158);
  });
});
