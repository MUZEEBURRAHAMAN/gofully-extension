import type { Page } from "@playwright/test";

/** A point in the document that a correct full-page capture must show in an exact colour. */
export interface Probe { name: string; color: number[]; x: number; y: number }

/**
 * Pages in these tests draw solid blocks marked [data-probe] with a data-color of "r,g,b". This reads where each
 * block sits (layout position, so a transform in progress cannot move it) and returns three points per block:
 * near its top, its middle and near its bottom.
 */
export async function measureProbes(page: Page): Promise<{ probes: Probe[]; viewportWidth: number }> {
  return page.evaluate(() => {
    const probes = [...document.querySelectorAll<HTMLElement>("[data-probe]")].flatMap((el) => {
      let x = 0, y = 0;
      for (let n: HTMLElement | null = el; n; n = n.offsetParent as HTMLElement | null) { x += n.offsetLeft; y += n.offsetTop; }
      const color = el.dataset.color!.split(",").map(Number);
      const cx = x + el.offsetWidth / 2;
      return [["top", 14], ["middle", el.offsetHeight / 2], ["bottom", el.offsetHeight - 14]].map(([where, dy]) => ({
        name: `${el.dataset.probe} (${where})`, color, x: cx, y: y + (dy as number),
      }));
    });
    return { probes, viewportWidth: window.innerWidth };
  });
}

/** Returns a message for every probe whose pixel in the stitched image is not its expected colour. */
export async function wrongProbes(popup: Page, dataUrl: string, probes: Probe[], viewportWidth: number): Promise<string[]> {
  return popup.evaluate(
    async ({ dataUrl, probes, viewportWidth }) => {
      const img = new Image();
      await new Promise<void>((ok, bad) => { img.onload = () => ok(); img.onerror = bad; img.src = dataUrl; });
      const c = document.createElement("canvas");
      c.width = img.width; c.height = img.height;
      const ctx = c.getContext("2d")!;
      ctx.drawImage(img, 0, 0);
      const scale = img.width / viewportWidth;
      const bad: string[] = [];
      for (const p of probes) {
        const px = Math.min(img.width - 1, Math.round(p.x * scale));
        const py = Math.min(img.height - 1, Math.round(p.y * scale));
        const [r, g, b] = ctx.getImageData(px, py, 1, 1).data;
        const off = Math.max(Math.abs(r - p.color[0]), Math.abs(g - p.color[1]), Math.abs(b - p.color[2]));
        if (off > 10) bad.push(`${p.name} at y=${Math.round(p.y)} is rgb(${r},${g},${b}), expected rgb(${p.color.join(",")})`);
      }
      return bad;
    },
    { dataUrl, probes, viewportWidth }
  );
}
