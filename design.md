# SnapForge Design System — Light Blue/White Theme

---

## Palette

| Token         | Value       | Usage                            |
|--------------|-------------|----------------------------------|
| `--blue-600`  | `#2563eb`   | Primary CTA, active states       |
| `--blue-500`  | `#3b82f6`   | Hover accent                     |
| `--blue-100`  | `#dbeafe`   | Light blue fills                 |
| `--blue-50`   | `#eff6ff`   | Progress icon background         |
| `--slate-900` | `#0f172a`   | Primary text, toast bg           |
| `--slate-700` | `#334155`   | Secondary text, result labels    |
| `--slate-500` | `#64748b`   | Mode icons, muted labels         |
| `--slate-400` | `#94a3b8`   | Placeholder, meta text           |
| `--slate-200` | `#e2e8f0`   | Borders                          |
| `--slate-100` | `#f1f5f9`   | Hover backgrounds                |
| `--slate-50`  | `#f8fafc`   | Subtle backgrounds               |
| `--white`     | `#ffffff`   | Main background                  |
| `--green-500` | `#22c55e`   | Success check, status dot        |
| `--red-500`   | `#ef4444`   | Error text                       |
| `--red-50`    | `#fef2f2`   | Error background                 |

---

## Typography

**Font:** Geist (Google Fonts CDN, `wght@400;500;600;700;800`)

| Role              | Size   | Weight | Color          |
|------------------|--------|--------|----------------|
| Brand name        | 14px   | 700    | slate-900      |
| Section label     | 10px   | 600    | slate-400      |
| Mode name         | 12.5px | 600    | slate-900      |
| Mode description  | 11px   | 400    | slate-400      |
| Button text       | 12px   | 600    | contextual     |
| Meta / footer     | 10.5px | 500    | slate-400      |
| Toast             | 12px   | 600    | white on dark  |

---

## Border Radius

Subtle rounding throughout — 8px for buttons and cards, 6px for small elements, 50% for circles. This is NOT zero-radius; we use a modern, clean look.

---

## Components

### Popup (340px wide)

**Header** — 48px, white, 1px `--slate-200` bottom border
- Brand icon: 26×26 blue-600 rounded rect, white SVG camera icon
- Brand name: 14px, Geist 700, slate-900
- Settings icon: 30×30 ghost button, slate-400 → slate-700 on hover

**Mode buttons** — full width, 9px 10px padding, 8px radius hover
- Icon box: 34×34, white bg + 1.5px slate-200 border (default); OR blue-600 bg + shadow (primary — Full Page)
- Mode name: 12.5px, weight 600, slate-900
- Mode desc: 11px, weight 400, slate-400
- Keyboard shortcut: 10px, slate-400, slate-100 bg + slate-200 border, 4px radius

**Progress section** — icon in blue-50 box, blue-600 progress fill, 3px track

**Result section** — green success strip, dimensions meta row, action buttons below

**Buttons**
| Variant   | BG         | Text      | Border          |
|-----------|------------|-----------|-----------------|
| Primary   | `#2563eb`  | white     | none (shadow)   |
| Default   | white      | slate-700 | 1.5px slate-200 |
| Hover     | slate-50   | slate-900 | slate-300       |

**Error** — red-50 bg, #fecaca border, #b91c1c text, inline in mode section

---

## Confirmation Popup (on-page, Shadow DOM)

- Backdrop: `rgba(15, 23, 42, 0.45)` + `backdrop-filter: blur(2px)`
- Card: 360px, white, 12px radius, strong drop shadow
- Animation: `popIn` — slight y-offset + scale from 0.96 to 1
- **Success strip**: green-50 bg, green border, check circle, title + mode subtitle, X dismiss btn
- **Meta row**: dimensions + capture method, gray dividers
- **Actions**: Primary "Copy Image" (blue-600), secondary row with "Save PNG", "Save PDF", "Edit" (white/ghost)
- **Toast**: slate-900 bg, white text, 8px radius, slides up from bottom

---

## Key Principles

1. **Light, clean, trustworthy** — white/slate backgrounds, no dark surfaces
2. **Blue = action** — #2563eb for all primary CTAs
3. **Green = success** — capture confirmed, status indicator
4. **Consistent 8px grid** — padding multiples of 8, gaps of 7–12px
5. **Geist font** — modern, highly legible, tech-forward
6. **Subtle depth** — soft shadows (not flat), 1px borders define structure
