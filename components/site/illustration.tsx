import { readFileSync } from "node:fs";
import { join } from "node:path";
import { IllMotion } from "./ill-motion";

export type IllName = "beautify" | "capture" | "feedback-sent" | "help" | "history-empty" | "privacy" | "welcome";

const cache = new Map<string, string>();

/** Hairline illustration (public/illustrations), inlined so its strokes can animate:
 *  lines draw in when it scrolls into view, then everything above the ground layer floats.
 *  The ground is the first two paths, or as many as the svg's data-ground says. */
function prepare(name: IllName): string {
  const hit = cache.get(name);
  if (hit) return hit;
  const raw = readFileSync(join(process.cwd(), "public/illustrations", `${name}.svg`), "utf8");
  let i = 0;
  const paths: string[] = [];
  const body = raw.replace(/<svg[^>]*>/, "").replace(/<\/svg>\s*$/, "").trim();
  for (const [p] of body.matchAll(/<path\b[^>]*\/>/g)) paths.push(p.replace("<path ", `<path pathLength="1" style="--i:${i++}" `));
  const n = Number(raw.match(/data-ground="(\d+)"/)?.[1] ?? 2);
  const ground = paths.slice(0, n).join("");
  const rest = paths.slice(n).join("");
  const open = raw.match(/<svg[^>]*>/)![0].replace(/\swidth="[^"]*"|\sheight="[^"]*"|\sdata-ground="[^"]*"/g, "").replace("<svg", '<svg aria-hidden="true" focusable="false" preserveAspectRatio="xMidYMid meet"');
  const svg = `${open}<g class="ill-ground">${ground}</g><g class="ill-float">${rest}</g></svg>`;
  cache.set(name, svg);
  return svg;
}

export function Illustration({ name, className = "" }: { name: IllName; className?: string }) {
  return <IllMotion className={`gf-ill-anim ${className}`} svg={prepare(name)} />;
}
