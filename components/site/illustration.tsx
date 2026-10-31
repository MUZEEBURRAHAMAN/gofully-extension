import { readFileSync } from "node:fs";
import { join } from "node:path";
import { IllMotion } from "./ill-motion";

export type IllName = "beautify" | "capture" | "help" | "history-empty" | "privacy" | "welcome";

const cache = new Map<string, string>();

/** Hairline illustration (public/illustrations), inlined so its strokes can animate:
 *  lines draw in when it scrolls into view, then everything above the ground layer floats. */
function prepare(name: IllName): string {
  const hit = cache.get(name);
  if (hit) return hit;
  const raw = readFileSync(join(process.cwd(), "public/illustrations", `${name}.svg`), "utf8");
  let i = 0;
  const paths: string[] = [];
  const body = raw.replace(/<svg[^>]*>/, "").replace(/<\/svg>\s*$/, "").trim();
  for (const [p] of body.matchAll(/<path\b[^>]*\/>/g)) paths.push(p.replace("<path ", `<path pathLength="1" style="--i:${i++}" `));
  const ground = paths.slice(0, 2).join("");
  const rest = paths.slice(2).join("");
  const open = raw.match(/<svg[^>]*>/)![0].replace(/\swidth="[^"]*"|\sheight="[^"]*"/g, "").replace("<svg", '<svg aria-hidden="true" focusable="false" preserveAspectRatio="xMidYMid meet"');
  const svg = `${open}<g class="ill-ground">${ground}</g><g class="ill-float">${rest}</g></svg>`;
  cache.set(name, svg);
  return svg;
}

export function Illustration({ name, className = "" }: { name: IllName; className?: string }) {
  return <IllMotion className={`gf-ill-anim ${className}`} svg={prepare(name)} />;
}
