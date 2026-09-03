/**
 * GoFully Design System
 *
 * Inspired by the Watch Later Extension's warm, rounded, premium aesthetic —
 * translated to GoFully's blue/white colour scheme.
 *
 * Every visual surface in the product (popup, editor, settings, injected
 * overlays) should reference these tokens instead of hard-coding hex values,
 * font sizes, or shadow strings.
 */

// ─── Colour Palette ──────────────────────────────────────────────────────────

export const Color = {
  /** Core brand blue — all CTAs, links, accents. */
  blue:       "#1667F2",
  blueHover:  "#1257D8",
  blueActive: "#0E4AB8",
  blueBg:     "#EDF1FE",
  blueBorder: "#BDD0FB",
  blueLight:  "#D4E2FD",

  /** Surfaces */
  white:      "#FFFFFF",
  surface:    "#F7F8FA",
  sunken:     "#F1F3F7",

  /** Text hierarchy */
  text:       "#101828",
  textSub:    "#344054",
  textMuted:  "#667085",
  textFaint:  "#98A2B3",

  /** Borders */
  border:     "#E3E8EF",
  borderHov:  "#C8D0D9",
  borderDark: "#B0BAC5",

  /** Semantic */
  green:      "#027A48",
  greenBg:    "#ECFDF3",
  greenBd:    "#A6F4C5",
  greenDot:   "#16B364",

  red:        "#B42318",
  redBg:      "#FEF3F2",
  redBd:      "#FECDCA",

  warn:       "#B54708",
  warnBg:     "#FFFAEB",
  warnBd:     "#FEDF89",
} as const;

// ─── Typography ──────────────────────────────────────────────────────────────

export const Font = {
  family: "'Archivo', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",

  /** Size scale (px) */
  size: {
    xs:   "10px",
    sm:   "11px",
    base: "12.5px",
    md:   "13.5px",
    lg:   "15px",
    xl:   "18px",
    xxl:  "22px",
  },

  /** Weight scale */
  weight: {
    normal:   "400",
    medium:   "500",
    semibold: "600",
    bold:     "700",
  },

  lineHeight: {
    tight:  "1.15",
    normal: "1.4",
    relaxed:"1.55",
  },
} as const;

// ─── Spacing (4px base grid) ─────────────────────────────────────────────────

export const Space = {
  "1": "4px",
  "2": "8px",
  "3": "12px",
  "4": "16px",
  "5": "20px",
  "6": "24px",
  "8": "32px",
  "10":"40px",
} as const;

// ─── Radii ───────────────────────────────────────────────────────────────────

export const Radius = {
  sm:   "0",
  md:   "0",
  lg:   "0",
  xl:   "0",
  xxl:  "0",
  pill: "0",
} as const;

// ─── Shadows ─────────────────────────────────────────────────────────────────

export const Shadow = {
  sm:  "0 1px 3px rgba(22,103,242,0.04), 0 4px 8px rgba(22,103,242,0.06)",
  md:  "0 4px 6px -2px rgba(22,103,242,0.04), 0 12px 16px -4px rgba(22,103,242,0.10)",
  lg:  "0 8px 10px -4px rgba(22,103,242,0.05), 0 24px 32px -6px rgba(22,103,242,0.14)",
  xl:  "0 12px 24px -6px rgba(22,103,242,0.08), 0 32px 48px -8px rgba(22,103,242,0.16)",
} as const;

// ─── Button Presets ──────────────────────────────────────────────────────────

export const Button = {
  cta: {
    height: "44px",
    padding: "0 24px",
    fontSize: Font.size.md,
    fontWeight: Font.weight.bold,
    borderRadius: Radius.pill,
    background: Color.blue,
    color: Color.white,
    border: "none",
    hoverBg: Color.blueHover,
    activeBg: Color.blueActive,
    shadow: Shadow.sm,
  },

  secondary: {
    height: "36px",
    padding: "0 16px",
    fontSize: Font.size.base,
    fontWeight: Font.weight.semibold,
    borderRadius: Radius.md,
    background: Color.white,
    color: Color.text,
    border: `1px solid ${Color.border}`,
    hoverBg: Color.surface,
    activeBg: Color.sunken,
    shadow: "none",
  },

  ghost: {
    height: "32px",
    padding: "0 12px",
    fontSize: Font.size.sm,
    fontWeight: Font.weight.medium,
    borderRadius: Radius.sm,
    background: "transparent",
    color: Color.textMuted,
    border: "none",
    hoverBg: Color.surface,
    activeBg: Color.sunken,
    shadow: "none",
  },

  icon: {
    size: "32px",
    borderRadius: Radius.sm,
    background: "transparent",
    color: Color.textFaint,
    hoverBg: Color.surface,
    hoverColor: Color.textSub,
  },
} as const;

// ─── Component Tokens ────────────────────────────────────────────────────────

export const Card = {
  borderRadius: Radius.xl,
  padding: Space["6"],
  background: Color.white,
  border: `1px solid ${Color.border}`,
  shadow: Shadow.md,
} as const;

export const Badge = {
  height: "20px",
  padding: "0 8px",
  fontSize: Font.size.xs,
  fontWeight: Font.weight.semibold,
  borderRadius: Radius.pill,
  background: Color.blueBg,
  color: Color.blue,
} as const;

export const Kbd = {
  height: "18px",
  padding: "0 5px",
  fontSize: "9px",
  fontWeight: Font.weight.bold,
  borderRadius: "0",
  background: Color.surface,
  border: `1px solid ${Color.border}`,
  color: Color.textFaint,
} as const;
