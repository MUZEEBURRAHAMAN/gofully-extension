/** Atmospheric backdrop for closing bands: brand gradient, a pixel grid that slowly shimmers, film grain.
 *  Decorative only. Styles: app/site.css (.gf-atmos*). */

const COLS = 32;
const ROWS = 10;

// Deterministic "random" tiles so server and client render the same grid.
function tiles() {
  const out: { x: number; y: number; o: number; d: number }[] = [];
  let seed = 7;
  const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
  for (let y = 0; y < ROWS; y++)
    for (let x = 0; x < COLS; x++) {
      const r = rnd();
      // denser toward the bottom, like light pooling
      if (r < 0.1 + (y / ROWS) * 0.28) out.push({ x, y, o: 0.05 + rnd() * 0.16, d: Math.round(rnd() * 6000) });
    }
  return out;
}
const TILES = tiles();

export function Atmos() {
  return (
    <div className="gf-atmos" aria-hidden="true">
      <div className="gf-atmos-glow" />
      <svg className="gf-atmos-grid" viewBox={`0 0 ${COLS * 40} ${ROWS * 40}`} preserveAspectRatio="xMidYMid slice">
        <defs>
          <pattern id="gf-atmos-lines" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M40 0H0V40" fill="none" stroke="currentColor" strokeOpacity=".07" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#gf-atmos-lines)" />
        {TILES.map((t, i) => (
          <rect key={i} x={t.x * 40} y={t.y * 40} width="40" height="40" fill="currentColor" opacity={t.o} style={{ animationDelay: `${t.d}ms` }} />
        ))}
      </svg>
      <div className="gf-atmos-grain" />
    </div>
  );
}
