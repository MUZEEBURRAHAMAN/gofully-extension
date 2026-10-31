import { ICONS, type IconName } from "@/ui/ds/icons";

/** Hugeicons (Free) glyph from the GoFully icon set, same set as the extension and Figma. Inherits currentColor. */
export function Icon({ name, size = 20, className }: { name: IconName; size?: number; className?: string }) {
  const svg = ICONS[name].replace('width="24" height="24"', `width="${size}" height="${size}" aria-hidden="true" focusable="false"`);
  return <span className={`gf-ico ${className ?? ""}`} style={{ width: size, height: size }} dangerouslySetInnerHTML={{ __html: svg }} />;
}

/** Closed shapes of a glyph, filled: the second tone. Glyphs with only open strokes
 *  (brackets, crop marks) get a soft square inside the frame instead. */
function secondTone(svg: string): string {
  const fills: string[] = [];
  for (const [, d] of svg.matchAll(/<path d="([^"]+)"/g)) {
    // Split on absolute moveto only; relative "m" would break when separated.
    const parts = /m/.test(d) ? [d] : d.split(/(?=M)/);
    const closed = parts.filter((p) => /[Zz]\s*$/.test(p.trim()));
    if (closed.length) fills.push(`<path d="${closed.join(" ")}"/>`);
  }
  for (const [shape] of svg.matchAll(/<(rect|circle|ellipse)\b[^>]*?\/?>/g)) {
    fills.push(shape.replace(/\s(stroke|stroke-width|stroke-linecap|stroke-linejoin|fill)="[^"]*"/g, ""));
  }
  if (!fills.length) fills.push('<rect x="6.5" y="6.5" width="11" height="11" rx="3"/>');
  return `<g class="gf-duo-2" fill="currentColor" stroke="none">${fills.join("")}</g>`;
}

/** True duotone glyph: Navy line work over Sky fills inside the icon itself (Figma: Icons · Duotone). */
export function DuoGlyph({ name, size = 22 }: { name: IconName; size?: number }) {
  const src = ICONS[name];
  const inner = src.replace(/^<svg[^>]*>/, "").replace(/<\/svg>$/, "");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">${secondTone(src)}<g class="gf-duo-1">${inner}</g></svg>`;
  return <span className="gf-ico gf-duoglyph" style={{ width: size, height: size }} dangerouslySetInnerHTML={{ __html: svg }} />;
}

/** Duotone icon on a soft tile. */
export function DuoIcon({ name, size = 22, tone = "sky" }: { name: IconName; size?: number; tone?: "sky" | "blue" | "green" | "peach" | "lilac" }) {
  const box = Math.round(size * 1.8);
  return (
    <span className={`gf-duo gf-duo--${tone}`} style={{ width: box, height: box, borderRadius: Math.round(box * 0.3) }}>
      <DuoGlyph name={name} size={size} />
    </span>
  );
}
