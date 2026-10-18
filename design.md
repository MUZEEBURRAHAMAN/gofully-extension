# GoFully Design System — v1.0 Industry System

> **Reference Specification**: An interactive, visual preview of this design system is available at [`design-system.html`](./design-system.html).

---

## 1. Core Principles

1. **The capture is the hero:** Chrome stays flat and quiet so the user's screenshot carries every screen.
2. **Square, not soft (`border-radius: 0`):** A strict zero-radius architecture. Circles are reserved exclusively for elements that are intrinsically circular (status dots, step numbers, badges).
3. **Frames, not shadows:** On the website, visual depth is achieved via 1px hairlines and blueprint corner registration marks (`<BlueprintFrame>`). Elevation shadows are used only for extension UI floating above third-party web content.
4. **One blue, on purpose (`#1667F2`):** Brand blue marks the primary action, the active tool, focus states, and the selected mode. 90% of the UI remains ink, grey, and white.

---

## 2. Color Palette & Tokens

### 2.1 Brand Blue Interaction Ramp

| Token | Hex | Usage |
|---|---|---|
| Light / Primary | `#1667F2` | Primary CTA, active tool, selected mode, focus ring |
| Hover (600) | `#1257D8` | Hover state on light surfaces |
| Active (700) | `#0E4AB8` | Pressed / active state on light surfaces |
| Dark Primary | `#4C8DFF` | Primary CTA and active tool in dark mode |
| Dark Hover | `#6BA0FF` | Hover state in dark mode |
| Dark Active | `#82B2FF` | Pressed state in dark mode (lighter on press) |
| Tint Background | `#EDF1FE` | Soft blue badge and active row backgrounds (`rgba(76,141,255,.14)` in dark) |
| Tint Border | `#BDD0FB` | Subtle blue perimeter rules (`rgba(76,141,255,.4)` in dark) |

### 2.2 Website Surfaces (`.gf-industry` in `app/globals.css`)

```css
--gf-color-bg:          #f2f2f3;
--gf-color-surface:     #e9e9ea;
--gf-color-text:        #1d1f20;
--gf-color-accent:      #1667F2;
--gf-color-accent-600:  #1257D8;
--gf-color-accent-700:  #0E4AB8;
--gf-color-accent-900:  #1d2d3d;
--gf-color-divider:     color-mix(in srgb, #1d1f20 16%, transparent);
```

### 2.3 Extension UI Surfaces (`src/ui/design-system.ts`)

| Role | Light Hex | Dark Hex | Variable |
|---|---|---|---|
| Card / Popover | `#FFFFFF` | `#232529` | `--card` |
| Surface | `#F7F8FA` | `#1B1D21` | `--surface` |
| Sunken / Wells | `#F1F3F7` | `#222428` | `--sunken` |
| Primary Text | `#101828` | `#F0F2F5` | `--text` |
| Secondary Text | `#344054` | `#C5CAD3` | `--text-2` |
| Muted Text | `#667085` | `#9AA1AF` | `--text-3` |
| Border | `#E3E8EF` | `#33383F` | `--border` |
| Border Hover | `#C8D0D9` | `#454B54` | `--border-h` |

### 2.4 Status Colors

- **Success:** `#027A48` (Light) / `#2FBE79` (Dark). Status dots use `#16B364` / `#2FBE79`.
- **Error:** `#B42318` (Light) / `#F97066` (Dark).
- **Warning:** `#B54708` (Light) / `#FDB022` (Dark).

---

## 3. Typography

| Family | Role | Weights | Loading Method |
|---|---|---|---|
| **Bricolage Grotesque** | Website display & headings | `400`, `500`, `600` (default), `700` | `next/font/google` (`--font-heading`) |
| **Inter** | Website body & prose | `400` (body), `500` (labels), `600` (eyebrows) | `next/font/google` (`--font-sans`) |
| **Archivo** | Extension popup, result bar & editor | `400`, `500`, `600`, `700` (CTA) | Self-hosted `.woff2` (100% offline) |
| **Geist Mono** | Tokens, metrics, shortcuts, code | `400`, `500`, `600` | `next/font/google` / CSS monospace |

---

## 4. Spacing & Rhythm

Base unit: **4px grid** (`Space.*` in `src/ui/design-system.ts`).

- `Space 1`: 4px
- `Space 2`: 8px
- `Space 3`: 12px
- `Space 4`: 16px
- `Space 5`: 20px
- `Space 6`: 24px (Standard card & popup padding)
- `Space 8`: 32px
- `Space 10`: 40px
- `Space 16`: 64px (Website section vertical padding)
- `Space 22`: 88px (Hero vertical rhythm)

---

## 5. Elevation & Depth

### 5.1 Floating Extension UI (Shadows)
Injected overlays and extension windows float above unpredictable third-party web content, using blue-tinted shadows:
- **`Shadow.sm`**: `0 1px 3px rgba(22,103,242,.04), 0 4px 8px rgba(22,103,242,.06)`
- **`Shadow.md`**: `0 4px 6px -2px rgba(22,103,242,.04), 0 12px 16px -4px rgba(22,103,242,.10)`
- **`Shadow.lg`**: `0 8px 10px -4px rgba(22,103,242,.05), 0 24px 32px -6px rgba(22,103,242,.14)`
- **`Shadow.xl`**: `0 12px 24px -6px rgba(22,103,242,.08), 0 32px 48px -8px rgba(22,103,242,.16)`

### 5.2 Marketing Website (Blueprint Frame)
Cards on the marketing site use flat white backgrounds, 1px border (`rgba(29,31,32,.12)`), and registration corner crosshair marks (`.cn.tl`, `.cn.tr`, `.cn.bl`, `.cn.br`) instead of drop shadows.

---

## 6. Motion Tokens

- **Instant (`80ms ease`):** Button click scale down to `0.98`, toolbar hover backgrounds.
- **Fast (`120ms ease`):** Hover colors, borders, and backgrounds across all interactive elements.
- **Base (`180ms cubic-bezier(.16, 1, .3, 1)`):** Tooltips, toasts, overlay hints.
- **Enter (`200–250ms cubic-bezier(.16, 1, .3, 1)`):** Result bar slide-in, popup panel transitions.
- **Looping (`1.3s linear infinite`):** Capture progress shine (`gfProgShine`) — only active while capture is in progress.

---

## 7. Z-Index Layering

| Name | Z-Index | Purpose |
|---|---|---|
| `injected-top` | `2147483647` | Result bar, scrolling area picker, capture hints in host page |
| `injected-overlay` | `2147483646` | Interactive region selector and OCR selection overlay |
| `nudge` | `10000` | Rate nudge card on review tab |
| `menu` | `9999` | Editor export dropdown and color picker |
| `modal` | `2000` | Editor crop modal |
| `tooltip` | `1000` | Toolbar tooltips |
| `toast` | `999` | Ephemeral notifications |
| `dropdown` | `100` | Popup sub-menus |
| `panel` | `20` | Beautify side-inspector panel |

---

## 8. Do / Don't

### Do
- Keep every corner square; use circles only for badges, step numbers, and status dots.
- Use exactly one primary blue button per screen/view.
- Frame website cards with `<BlueprintFrame>` instead of adding drop shadows.
- Ensure all feature claims are literally true in the shipped build ("100% offline", "on-device OCR").

### Don't
- Do not use Tailwind `rounded-*` classes.
- Do not use blue for decorative section backgrounds or large blocks of body copy.
- Do not add drop shadows to marketing website cards.
- Do not loop animations at idle — looping is reserved for active spinners/progress while capture or OCR work is running.
