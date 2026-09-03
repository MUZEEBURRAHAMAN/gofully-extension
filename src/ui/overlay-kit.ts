/**
 * Shared visual language for everything the extension injects into a page.
 *
 * Injected UI cannot use a stylesheet the way popup.html can — it lands in a
 * hostile document whose own CSS may cascade over ours — so components are
 * built from inline styles and these tokens are the single place the values
 * live. Tokens mirror the popup's `:root` set so overlay, popup, editor, and
 * settings all read as one product.
 *
 * Icons are stroke-only SVG on `currentColor` (Feather geometry, 24×24 box), so
 * a button's colour flows into its glyph and nothing depends on emoji, whose
 * shape and colour vary per platform and cannot inherit weight or hue.
 */

/** Distinct family name — a page may ship its own "Archivo" at another weight. */
export const FONT_FAMILY =
  `'GoFully Archivo', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif`;

export const T = {
  surface: "#FFFFFF",
  surfaceAlt: "#F7F8FA",
  surfaceSunken: "#F1F3F7",

  border: "#E3E8EF",
  borderStrong: "#C8D0D9",

  text: "#101828",
  textMuted: "#475467",
  textFaint: "#667085",

  accent: "#1667F2",
  accentHover: "#1257D8",
  accentBg: "#EDF1FE",
  accentBorder: "#BDD0FB",

  success: "#027A48",
  successBg: "#ECFDF3",
  successBorder: "#A6F4C5",

  danger: "#B42318",
  dangerBg: "#FEF3F2",
  dangerBorder: "#FECDCA",

  warn: "#B54708",
  warnBg: "#FFFAEB",
  warnBorder: "#FEDF89",

  /** Dim applied outside a selection. Kept light so the page stays readable. */
  shade: "rgba(16, 24, 40, 0.28)",

  shadow: "0 4px 6px -2px rgba(22,103,242,0.04), 0 12px 16px -4px rgba(22,103,242,0.10)",
  shadowLg: "0 8px 10px -4px rgba(22,103,242,0.05), 0 24px 32px -6px rgba(22,103,242,0.14)",

  /** Soft, rounded, blue/white — the same language as the popup and settings
   *  pages, not a separate "technical tool" style. Panels round generously;
   *  buttons round enough to read as pill-ish without becoming full pills
   *  (a true pill reads oddly on a multi-line/icon+label button). */
  radius: "0",
  radiusLg: "0",
} as const;

const FONT_STYLE_ID = "gofully-font";

/**
 * Register Archivo for injected UI. The face ships with the extension, so it
 * resolves with no network request and survives pages whose CSP forbids remote
 * fonts. Safe to call repeatedly.
 */
export function injectOverlayFont(): void {
  if (document.getElementById(FONT_STYLE_ID)) return;
  let src: string;
  try {
    src = chrome.runtime.getURL("assets/Archivo.woff2");
  } catch {
    return; // No extension context (e.g. unit test) — fall back to the stack.
  }
  const style = document.createElement("style");
  style.id = FONT_STYLE_ID;
  style.textContent = `
    @font-face {
      font-family: 'GoFully Archivo';
      src: url('${src}') format('woff2-variations'),
           url('${src}') format('woff2');
      font-weight: 100 900;
      font-style: normal;
      font-display: swap;
    }
    @keyframes gf-pulse { 0%,100% { opacity: 1 } 50% { opacity: .3 } }
    @keyframes gf-in { from { opacity: 0; transform: translateY(4px) } to { opacity: 1; transform: none } }
  `;
  (document.head || document.documentElement).appendChild(style);
}

export function removeOverlayFont(): void {
  document.getElementById(FONT_STYLE_ID)?.remove();
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function svg(body: string, size = 14, width = 1.75): string {
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="${size}" height="${size}" ` +
    `fill="none" stroke="currentColor" stroke-width="${width}" stroke-linecap="round" ` +
    `stroke-linejoin="round" style="display:block;flex-shrink:0" aria-hidden="true">${body}</svg>`
  );
}

export const Icon = {
  play: (s = 14) => svg(`<polygon points="6 3 20 12 6 21 6 3" fill="currentColor" stroke="none"/>`, s),
  /** Manual mode. A mouse reads unambiguously at 13px, where a hand silhouette
   *  collapses into a blob and gets mistaken for the lock glyph. */
  mouse: (s = 14) => svg(`<rect x="6" y="3" width="12" height="18" rx="6"/><path d="M12 7v3"/>`, s),
  check: (s = 14) => svg(`<polyline points="20 6 9 17 4 12"/>`, s, 2.25),
  x: (s = 14) => svg(`<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>`, s, 2),
  stop: (s = 14) => svg(`<rect x="6" y="6" width="12" height="12" rx="2" fill="currentColor" stroke="none"/>`, s),
  warning: (s = 14) =>
    svg(`<path d="M12 9v4"/><path d="M12 17h.01"/><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"/>`, s),
  crop: (s = 14) => svg(`<path d="M6 2v14a2 2 0 0 0 2 2h14"/><path d="M18 22V8a2 2 0 0 0-2-2H2"/>`, s),
  scroll: (s = 14) =>
    svg(`<path d="M12 5v14"/><polyline points="7 14 12 19 17 14"/><polyline points="17 10 12 5 7 10"/>`, s),
  lock: (s = 14) =>
    svg(`<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>`, s),
  unlock: (s = 14) =>
    svg(`<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 7.5-2"/>`, s),
} as const;

// ─── Primitives ───────────────────────────────────────────────────────────────

export type ButtonTone = "primary" | "neutral" | "success" | "danger" | "ghost";

const TONES: Record<ButtonTone, { bg: string; fg: string; border: string; hover: string }> = {
  primary: { bg: T.accent, fg: "#FFFFFF", border: T.accent, hover: T.accentHover },
  success: { bg: T.success, fg: "#FFFFFF", border: T.success, hover: "#026A3E" },
  danger: { bg: T.danger, fg: "#FFFFFF", border: T.danger, hover: "#9A1D14" },
  neutral: { bg: T.surface, fg: T.text, border: T.border, hover: T.surfaceAlt },
  ghost: { bg: "transparent", fg: T.textFaint, border: "transparent", hover: T.surfaceAlt },
};

/** A button whose icon inherits the label colour, so tone changes stay in sync. */
export function makeButton(opts: {
  label?: string;
  icon?: string;
  tone?: ButtonTone;
  onClick: () => void;
  title?: string;
  block?: boolean;
  small?: boolean;
}): HTMLButtonElement {
  const tone = TONES[opts.tone ?? "neutral"];
  const b = document.createElement("button");
  b.type = "button";
  if (opts.title) b.title = opts.title;
  if (!opts.label && opts.title) b.setAttribute("aria-label", opts.title);

  Object.assign(b.style, {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: opts.label && opts.icon ? "6px" : "0",
    background: tone.bg,
    color: tone.fg,
    border: `1px solid ${tone.border}`,
    borderRadius: "0",
    padding: opts.small ? "6px 10px" : "8px 14px",
    font: `700 ${opts.small ? "11px" : "12px"}/1 ${FONT_FAMILY}`,
    letterSpacing: "-0.005em",
    cursor: "pointer",
    width: opts.block ? "100%" : "auto",
    flexShrink: "0",
    transition: "background .14s ease, border-color .14s ease",
    boxSizing: "border-box",
    textAlign: "center",
  } as CSSStyleDeclaration);

  if (opts.icon) b.insertAdjacentHTML("beforeend", opts.icon);
  if (opts.label) {
    const span = document.createElement("span");
    span.textContent = opts.label;
    b.appendChild(span);
  }

  b.addEventListener("mouseenter", () => (b.style.background = tone.hover));
  b.addEventListener("mouseleave", () => (b.style.background = tone.bg));
  b.addEventListener("click", (e) => {
    e.stopPropagation();
    e.preventDefault();
    opts.onClick();
  });
  return b;
}

/** A floating light panel — the base surface for every injected control group. */
export function makePanel(extra: Partial<CSSStyleDeclaration> = {}): HTMLDivElement {
  const d = document.createElement("div");
  Object.assign(
    d.style,
    {
      position: "fixed",
      background: T.surface,
      border: `1px solid ${T.border}`,
      borderRadius: T.radiusLg,
      boxShadow: T.shadowLg,
      color: T.text,
      fontFamily: FONT_FAMILY,
      boxSizing: "border-box",
      animation: "gf-in .18s ease",
    } as Partial<CSSStyleDeclaration>,
    extra
  );
  return d;
}

export function makeText(
  text: string,
  opts: { size?: string; weight?: string; color?: string; align?: string } = {}
): HTMLSpanElement {
  const s = document.createElement("span");
  s.textContent = text;
  Object.assign(s.style, {
    font: `${opts.weight ?? "500"} ${opts.size ?? "12px"}/1.45 ${FONT_FAMILY}`,
    color: opts.color ?? T.textMuted,
    textAlign: opts.align ?? "left",
    letterSpacing: "-0.005em",
  } as Partial<CSSStyleDeclaration>);
  return s;
}
