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

import { LIGHT, DARK, SHADOW, RADIUS, FONT_SANS, type Role } from "./ds/tokens";
import { icon } from "./ds/icons";

/** Inter ships with the extension under a distinct family name, so a page's own "Inter" can't override weights. */
export const FONT_FAMILY = FONT_SANS;

/** "#RRGGBB" → "rgba(r, g, b, a)" for translucent tints built from a token. */
export function alpha(hex: string, a: number): string {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`; // ds-lint-allow: alpha of a token
}

/**
 * Overlay colours, mapped from the GoFully DS v2 roles (src/ui/ds/tokens.ts).
 * Mutable on purpose: applyOverlayTheme() swaps in the dark palette when the
 * user picked dark (or the system is dark), before any panel is built.
 */
export const T = {
  surface: "", surfaceAlt: "", surfaceSunken: "",
  border: "", borderStrong: "",
  text: "", textMuted: "", textFaint: "",
  accent: "", accentHover: "", accentBg: "", accentBorder: "", onAccent: "", focus: "",
  success: "", successBg: "", successBorder: "",
  danger: "", dangerHover: "", dangerBg: "", dangerBorder: "",
  warn: "", warnBg: "", warnBorder: "",
  /** Dim outside a selection, from the ink token. Fixed in both themes: it sits over the page, not our UI. */
  shade: alpha(LIGHT.ink, 0.4),
  shadow: SHADOW.sm,
  shadowLg: SHADOW.lg,
  radius: `${RADIUS.md}px`,
  radiusLg: `${RADIUS.lg}px`,
  radiusPill: `${RADIUS.pill}px`,
};

function fill(p: Record<Role, string>): void {
  Object.assign(T, {
    surface: p["bg-surface"], surfaceAlt: p["bg-hover"], surfaceSunken: p["bg-sunken"],
    border: p["border"], borderStrong: p["border-strong"],
    text: p["text"], textMuted: p["text-2"], textFaint: p["text-3"],
    accent: p["brand"], accentHover: p["brand-hover"], accentBg: p["accent-tint"], accentBorder: p["accent"], onAccent: p["on-brand"], focus: p["focus"],
    success: p["success"], successBg: p["success-bg"], successBorder: p["success"],
    danger: p["error"], dangerHover: p["error-hover"], dangerBg: p["error-bg"], dangerBorder: p["error"],
    warn: p["warning"], warnBg: p["warning-bg"], warnBorder: p["warning"],
  });
}
fill(LIGHT);

/** Read the user's theme (Settings › Appearance) and switch the overlay palette. */
export async function applyOverlayTheme(): Promise<boolean> {
  let theme = "system";
  try {
    const { settings } = await chrome.storage.sync.get("settings");
    theme = (settings as { theme?: string } | undefined)?.theme ?? "system";
  } catch { /* no extension context */ }
  const dark = theme === "dark" || (theme === "system" && matchMedia("(prefers-color-scheme: dark)").matches);
  fill(dark ? DARK : LIGHT);
  return dark;
}

const FONT_STYLE_ID = "gofully-font";

/**
 * Register Inter for injected UI. The face ships with the extension, so it
 * resolves with no network request and survives pages whose CSP forbids remote
 * fonts. Safe to call repeatedly.
 */
export function injectOverlayFont(): void {
  if (document.getElementById(FONT_STYLE_ID)) return;
  let src: string;
  try {
    src = chrome.runtime.getURL("assets/inter-latin-wght-normal.woff2");
  } catch {
    return; // No extension context (e.g. unit test) — fall back to the stack.
  }
  const style = document.createElement("style");
  style.id = FONT_STYLE_ID;
  style.textContent = `
    @font-face {
      font-family: 'GoFully Inter';
      src: url('${src}') format('woff2-variations'),
           url('${src}') format('woff2');
      font-weight: 100 900;
      font-style: normal;
      font-display: swap;
    }
    @keyframes gf-pulse { 0%,100% { opacity: 1 } 50% { opacity: .3 } }
    @keyframes gf-in { from { opacity: 0; transform: translateY(6px) scale(.98) } to { opacity: 1; transform: none } }
    @keyframes gf-spin { to { transform: rotate(360deg) } }
    @media (prefers-reduced-motion: reduce) { @keyframes gf-in { from { opacity: 0 } to { opacity: 1 } } }
  `;
  (document.head || document.documentElement).appendChild(style);
}

export function removeOverlayFont(): void {
  document.getElementById(FONT_STYLE_ID)?.remove();
}

// ─── Icons (Hugeicons, same set as Figma Icon/*) ─────────────────────────────

const glyph = (name: Parameters<typeof icon>[0]) => (s = 14) =>
  icon(name, s).replace("<svg ", '<svg style="display:block;flex-shrink:0" ');

export const Icon = {
  play: glyph("play"),
  mouse: glyph("mouse"),
  check: glyph("check"),
  x: glyph("close"),
  stop: glyph("stop"),
  warning: glyph("alert"),
  crop: glyph("region"),
  scroll: glyph("scrolling"),
  lock: glyph("lock"),
  unlock: glyph("lock"),
  loader: glyph("loader"),
} as const;

// ─── Primitives ───────────────────────────────────────────────────────────────

export type ButtonTone = "primary" | "neutral" | "success" | "danger" | "ghost";

// Read at call time so the theme chosen by applyOverlayTheme() applies.
// "success" renders as the primary action: the Figma panels use one brand action per panel.
const tones = (): Record<ButtonTone, { bg: string; fg: string; border: string; hover: string }> => ({
  primary: { bg: T.accent, fg: T.onAccent, border: T.accent, hover: T.accentHover },
  success: { bg: T.accent, fg: T.onAccent, border: T.accent, hover: T.accentHover },
  danger: { bg: T.danger, fg: T.surface, border: T.danger, hover: T.dangerHover },
  neutral: { bg: T.surface, fg: T.text, border: T.borderStrong, hover: T.surfaceAlt },
  ghost: { bg: "transparent", fg: T.textMuted, border: "transparent", hover: T.surfaceAlt },
});

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
  const tone = tones()[opts.tone ?? "neutral"];
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
    borderRadius: T.radiusPill,
    height: opts.small ? "28px" : "36px",
    padding: opts.small ? "0 10px" : "0 14px",
    font: `500 ${opts.small ? "12px" : "14px"}/1 ${FONT_FAMILY}`,
    letterSpacing: "0",
    cursor: "pointer",
    width: opts.block ? "100%" : "auto",
    flexShrink: "0",
    transition: "background .15s ease, border-color .15s ease, box-shadow .15s ease",
    outline: "none",
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
  b.addEventListener("focus", () => { if (b.matches(":focus-visible")) b.style.boxShadow = `0 0 0 3px ${T.focus}`; });
  b.addEventListener("blur", () => (b.style.boxShadow = "none"));
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
